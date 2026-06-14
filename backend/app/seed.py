import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app import crud
from app.database import SessionLocal
from app.models import SensorData, Prediction
from app.schemas import VehicleCreate
from app.services import prediction_service

SAMPLE_VEHICLES = [
    {"name": "Fleet Truck 01", "model": "Tata Prima", "type": "truck", "latitude": 28.6315, "longitude": 77.2167},
    {"name": "Delivery Van A", "model": "Mahindra Bolero", "type": "van", "latitude": 28.6129, "longitude": 77.2295},
    {"name": "Executive Sedan", "model": "Honda City", "type": "car", "latitude": 28.6562, "longitude": 77.2410},
    {"name": "City Bus 12", "model": "Ashok Leyland", "type": "bus", "latitude": 28.5535, "longitude": 77.2588},
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


CITY_SPOTS = [
    (28.6315, 77.2167),
    (28.6129, 77.2295),
    (28.6562, 77.2410),
    (28.5535, 77.2588),
    (28.5672, 77.2100),
    (28.5245, 77.1855),
]

INDIA_BOUNDS = {"lat": (6.0, 37.5), "lng": (68.0, 97.5)}


def _outside_india(lat, lng):
    if lat is None or lng is None:
        return True
    return not (INDIA_BOUNDS["lat"][0] <= lat <= INDIA_BOUNDS["lat"][1]
                and INDIA_BOUNDS["lng"][0] <= lng <= INDIA_BOUNDS["lng"][1])


def backfill_locations():
    db: Session = SessionLocal()
    try:
        from app.models import Vehicle
        vehicles = db.query(Vehicle).all()
        targets = [v for v in vehicles if _outside_india(v.latitude, v.longitude)]
        if not targets:
            return
        random.seed(11)
        for i, v in enumerate(targets):
            base = CITY_SPOTS[i % len(CITY_SPOTS)]
            v.latitude = round(base[0] + random.uniform(-0.01, 0.01), 6)
            v.longitude = round(base[1] + random.uniform(-0.01, 0.01), 6)
        db.commit()
    finally:
        db.close()


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
