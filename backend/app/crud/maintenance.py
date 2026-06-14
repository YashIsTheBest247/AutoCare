from datetime import datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import MaintenanceTask
from app.schemas import MaintenanceCreate, MaintenanceUpdate


def create(db: Session, data: MaintenanceCreate) -> MaintenanceTask:
    task = MaintenanceTask(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get(db: Session, task_id: int) -> Optional[MaintenanceTask]:
    return db.get(MaintenanceTask, task_id)


def list_all(db: Session, vehicle_id: Optional[int] = None, status: Optional[str] = None) -> List[MaintenanceTask]:
    stmt = select(MaintenanceTask)
    if vehicle_id is not None:
        stmt = stmt.where(MaintenanceTask.vehicle_id == vehicle_id)
    if status is not None:
        stmt = stmt.where(MaintenanceTask.status == status)
    stmt = stmt.order_by(MaintenanceTask.created_at.desc())
    return list(db.scalars(stmt).all())


def update(db: Session, task: MaintenanceTask, data: MaintenanceUpdate) -> MaintenanceTask:
    changes = data.model_dump(exclude_unset=True)
    for key, value in changes.items():
        setattr(task, key, value)
    if changes.get("status") == "done" and task.completed_at is None:
        task.completed_at = datetime.utcnow()
    if changes.get("status") and changes["status"] != "done":
        task.completed_at = None
    db.commit()
    db.refresh(task)
    return task


def delete(db: Session, task: MaintenanceTask) -> None:
    db.delete(task)
    db.commit()
