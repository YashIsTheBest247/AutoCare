from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import SensorData
from app.schemas import SensorDataCreate


def create(db: Session, data: SensorDataCreate) -> SensorData:
    reading = SensorData(**data.model_dump())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


def get(db: Session, reading_id: int) -> Optional[SensorData]:
    return db.get(SensorData, reading_id)


def list_for_vehicle(db: Session, vehicle_id: int, limit: int = 100) -> List[SensorData]:
    stmt = (
        select(SensorData)
        .where(SensorData.vehicle_id == vehicle_id)
        .order_by(SensorData.timestamp.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def list_all(db: Session, limit: int = 200) -> List[SensorData]:
    stmt = select(SensorData).order_by(SensorData.timestamp.desc()).limit(limit)
    return list(db.scalars(stmt).all())


def latest_for_vehicle(db: Session, vehicle_id: int) -> Optional[SensorData]:
    stmt = (
        select(SensorData)
        .where(SensorData.vehicle_id == vehicle_id)
        .order_by(SensorData.timestamp.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()
