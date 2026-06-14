import random
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Vehicle
from app.schemas import VehicleCreate

BASE_LAT = 28.6139
BASE_LNG = 77.2090


def create(db: Session, data: VehicleCreate) -> Vehicle:
    payload = data.model_dump()
    if payload.get("latitude") is None or payload.get("longitude") is None:
        payload["latitude"] = round(BASE_LAT + random.uniform(-0.05, 0.05), 6)
        payload["longitude"] = round(BASE_LNG + random.uniform(-0.05, 0.05), 6)
    vehicle = Vehicle(**payload)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


def get(db: Session, vehicle_id: int) -> Optional[Vehicle]:
    return db.get(Vehicle, vehicle_id)


def list_all(db: Session, skip: int = 0, limit: int = 100) -> List[Vehicle]:
    stmt = select(Vehicle).order_by(Vehicle.created_at.desc()).offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def count(db: Session) -> int:
    return db.query(Vehicle).count()


def delete(db: Session, vehicle_id: int) -> bool:
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        return False
    db.delete(vehicle)
    db.commit()
    return True
