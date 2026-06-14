from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.services import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _latest_features(db: Session, vehicle_id: int):
    latest = crud.sensor_data.latest_for_vehicle(db, vehicle_id)
    if not latest:
        return None
    return {
        "temperature": latest.temperature,
        "battery_voltage": latest.battery_voltage,
        "rpm": latest.rpm,
        "fuel_efficiency": latest.fuel_efficiency,
        "vibration": latest.vibration,
    }


@router.get("/vehicles/{vehicle_id}")
def vehicle_analytics(vehicle_id: int, db: Session = Depends(get_db)):
    if not crud.vehicle.get(db, vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    features = _latest_features(db, vehicle_id)
    readings = crud.sensor_data.list_for_vehicle(db, vehicle_id, limit=20)
    latest_pred = crud.prediction.latest_for_vehicle(db, vehicle_id)
    components = analytics_service.component_health(features) if features else {}
    contributions = analytics_service.feature_contributions(features) if features else []
    rul = analytics_service.remaining_useful_life(latest_pred.risk_score) if latest_pred else None
    return {
        "vehicle_id": vehicle_id,
        "component_health": components,
        "contributions": contributions,
        "rul_days": rul,
        "forecast": analytics_service.forecast(readings),
    }
