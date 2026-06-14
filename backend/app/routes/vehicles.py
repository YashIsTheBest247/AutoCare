from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import VehicleCreate, VehicleRead, VehicleDetail
from app.services import dashboard_service

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    return crud.vehicle.create(db, payload)


@router.get("", response_model=List[VehicleDetail])
def list_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    vehicles = crud.vehicle.list_all(db, skip=skip, limit=limit)
    return [dashboard_service.vehicle_summary(db, v) for v in vehicles]


@router.get("/{vehicle_id}", response_model=VehicleDetail)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = crud.vehicle.get(db, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return dashboard_service.vehicle_summary(db, vehicle)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    if not crud.vehicle.delete(db, vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return None
