from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Prediction


def create(db: Session, vehicle_id: int, result) -> Prediction:
    prediction = Prediction(
        vehicle_id=vehicle_id,
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        failure_probability=result.failure_probability,
        recommendation=result.recommendation,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


def list_for_vehicle(db: Session, vehicle_id: int, limit: int = 100) -> List[Prediction]:
    stmt = (
        select(Prediction)
        .where(Prediction.vehicle_id == vehicle_id)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def list_all(db: Session, limit: int = 200) -> List[Prediction]:
    stmt = select(Prediction).order_by(Prediction.created_at.desc()).limit(limit)
    return list(db.scalars(stmt).all())


def latest_for_vehicle(db: Session, vehicle_id: int) -> Optional[Prediction]:
    stmt = (
        select(Prediction)
        .where(Prediction.vehicle_id == vehicle_id)
        .order_by(Prediction.created_at.desc())
        .limit(1)
    )
    return db.scalars(stmt).first()
