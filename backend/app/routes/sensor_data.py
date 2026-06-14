import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import SensorDataCreate, SensorDataRead
from app.services import anomaly_service, prediction_service, settings_service, email_service

router = APIRouter(prefix="/api/sensor-data", tags=["sensor-data"])

LEVEL_RANK = {"Low": 0, "Medium": 1, "High": 2}


def _maybe_alert(vehicle, result):
    config = settings_service.get_alert_config()
    if not config.get("email_enabled") or not config.get("recipient"):
        return
    min_rank = LEVEL_RANK.get(config.get("min_level", "High"), 2)
    if LEVEL_RANK.get(result.risk_level, 0) >= min_rank:
        email_service.send_risk_alert(
            config["recipient"], vehicle.name, result.risk_level, result.risk_score, result.recommendation
        )

CSV_FIELDS = ["temperature", "battery_voltage", "rpm", "fuel_efficiency", "vibration"]


def _attach_anomalies(reading) -> dict:
    features = {
        "temperature": reading.temperature,
        "battery_voltage": reading.battery_voltage,
        "rpm": reading.rpm,
        "fuel_efficiency": reading.fuel_efficiency,
        "vibration": reading.vibration,
    }
    return {
        "id": reading.id,
        "vehicle_id": reading.vehicle_id,
        "timestamp": reading.timestamp,
        **features,
        "anomalies": anomaly_service.detect(features),
    }


@router.post("", response_model=SensorDataRead, status_code=status.HTTP_201_CREATED)
def create_reading(payload: SensorDataCreate, db: Session = Depends(get_db)):
    vehicle = crud.vehicle.get(db, payload.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    reading = crud.sensor_data.create(db, payload)

    features = payload.model_dump(exclude={"vehicle_id"})
    result = prediction_service.evaluate(features)
    crud.prediction.create(db, payload.vehicle_id, result)
    _maybe_alert(vehicle, result)

    return _attach_anomalies(reading)


@router.get("", response_model=List[SensorDataRead])
def list_readings(vehicle_id: Optional[int] = None, limit: int = 100, db: Session = Depends(get_db)):
    if vehicle_id is not None:
        readings = crud.sensor_data.list_for_vehicle(db, vehicle_id, limit=limit)
    else:
        readings = crud.sensor_data.list_all(db, limit=limit)
    return [_attach_anomalies(r) for r in readings]


@router.get("/export")
def export_readings(vehicle_id: Optional[int] = None, db: Session = Depends(get_db)):
    if vehicle_id is not None:
        readings = crud.sensor_data.list_for_vehicle(db, vehicle_id, limit=10000)
    else:
        readings = crud.sensor_data.list_all(db, limit=10000)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "vehicle_id", *CSV_FIELDS, "timestamp"])
    for r in readings:
        writer.writerow([r.id, r.vehicle_id, r.temperature, r.battery_voltage, r.rpm,
                         r.fuel_efficiency, r.vibration, r.timestamp.isoformat()])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sensor_data.csv"},
    )


@router.post("/import")
async def import_readings(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = (await file.read()).decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(content))
    imported = 0
    errors = []
    for i, row in enumerate(reader, start=2):
        try:
            vehicle_id = int(row["vehicle_id"])
            if not crud.vehicle.get(db, vehicle_id):
                errors.append(f"Row {i}: vehicle {vehicle_id} not found")
                continue
            payload = SensorDataCreate(
                vehicle_id=vehicle_id,
                **{f: float(row[f]) for f in CSV_FIELDS},
            )
            crud.sensor_data.create(db, payload)
            result = prediction_service.evaluate(payload.model_dump(exclude={"vehicle_id"}))
            crud.prediction.create(db, vehicle_id, result)
            imported += 1
        except (KeyError, ValueError) as exc:
            errors.append(f"Row {i}: {exc}")
    return {"imported": imported, "errors": errors[:20]}


@router.get("/{reading_id}", response_model=SensorDataRead)
def get_reading(reading_id: int, db: Session = Depends(get_db)):
    reading = crud.sensor_data.get(db, reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Sensor reading not found")
    return _attach_anomalies(reading)
