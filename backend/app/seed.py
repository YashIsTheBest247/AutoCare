import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app import crud
from app.database import SessionLocal
from app.models import SensorData, Prediction
from app.schemas import VehicleCreate
from app.services import prediction_service

SAMPLE_VEHICLES = [
    {"name": "Fleet Truck 01", "model": "Volvo FH16", "type": "truck", "latitude": 37.7849, "longitude": -122.4094},
    {"name": "Delivery Van A", "model": "Ford Transit", "type": "van", "latitude": 37.7649, "longitude": -122.4294},
    {"name": "Executive Sedan", "model": "Toyota Camry", "type": "car", "latitude": 37.7899, "longitude": -122.4014},
    {"name": "City Bus 12", "model": "Mercedes Citaro", "type": "bus", "latitude": 37.7599, "longitude": -122.4374},
]


def _reading(healthy: bool):
    if healthy:
        return {
            "temperature": round(random.uniform(80, 100), 2),
            "battery_voltage": round(random.uniform(13.2, 14.4), 2),
            "rpm": round(random.uniform(1500, 3000), 0),
            "fuel_efficiency": round(random.uniform(14, 20), 2),
            "vibration": round(random.uniform(0.4, 1.4), 2),
        }
    return {
        "temperature": round(random.uniform(105, 135), 2),
        "battery_voltage": round(random.uniform(11.0, 12.6), 2),
        "rpm": round(random.uniform(3200, 5500), 0),
        "fuel_efficiency": round(random.uniform(6, 11), 2),
        "vibration": round(random.uniform(1.8, 4.5), 2),
    }


def seed():
    db: Session = SessionLocal()
    try:
        if crud.vehicle.count(db) > 0:
            return
        random.seed(7)
        now = datetime.utcnow()
        for spec in SAMPLE_VEHICLES:
            vehicle = crud.vehicle.create(db, VehicleCreate(**spec))
            for i in range(12):
                healthy = random.random() > 0.35
                features = _reading(healthy)
                ts = now - timedelta(hours=(12 - i) * 3)
                db.add(SensorData(vehicle_id=vehicle.id, timestamp=ts, **features))
                result = prediction_service.evaluate(features)
                db.add(Prediction(
                    vehicle_id=vehicle.id,
                    risk_score=result.risk_score,
                    risk_level=result.risk_level,
                    failure_probability=result.failure_probability,
                    recommendation=result.recommendation,
                    created_at=ts,
                ))
            db.commit()
    finally:
        db.close()
