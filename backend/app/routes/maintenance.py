from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceRead

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])


@router.post("", response_model=MaintenanceRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: MaintenanceCreate, db: Session = Depends(get_db)):
    if not crud.vehicle.get(db, payload.vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return crud.maintenance.create(db, payload)


@router.get("", response_model=List[MaintenanceRead])
def list_tasks(vehicle_id: Optional[int] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.maintenance.list_all(db, vehicle_id=vehicle_id, status=status)


@router.patch("/{task_id}", response_model=MaintenanceRead)
def update_task(task_id: int, payload: MaintenanceUpdate, db: Session = Depends(get_db)):
    task = crud.maintenance.get(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return crud.maintenance.update(db, task, payload)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.maintenance.get(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    crud.maintenance.delete(db, task)
    return None
