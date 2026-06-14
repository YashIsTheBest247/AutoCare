from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import SensorDataCreate, SensorDataRead
from app.services import anomaly_service, prediction_service

router = APIRouter(prefix="/api/sensor-data", tags=["sensor-data"])


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
    if not crud.vehicle.get(db, payload.vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    reading = crud.sensor_data.create(db, payload)

    features = payload.model_dump(exclude={"vehicle_id"})
    result = prediction_service.evaluate(features)
    crud.prediction.create(db, payload.vehicle_id, result)

    return _attach_anomalies(reading)


@router.get("", response_model=List[SensorDataRead])
def list_readings(vehicle_id: Optional[int] = None, limit: int = 100, db: Session = Depends(get_db)):
    if vehicle_id is not None:
        readings = crud.sensor_data.list_for_vehicle(db, vehicle_id, limit=limit)
    else:
        readings = crud.sensor_data.list_all(db, limit=limit)
    return [_attach_anomalies(r) for r in readings]


@router.get("/{reading_id}", response_model=SensorDataRead)
def get_reading(reading_id: int, db: Session = Depends(get_db)):
    reading = crud.sensor_data.get(db, reading_id)
    if not reading:
        raise HTTPException(status_code=404, detail="Sensor reading not found")
    return _attach_anomalies(reading)
