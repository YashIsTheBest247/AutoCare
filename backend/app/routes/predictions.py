from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.ml.model import get_model
from app.schemas import PredictionInput, PredictionResult, PredictionRead
from app.services import prediction_service

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.post("/predict", response_model=PredictionResult)
def predict(payload: PredictionInput):
    return prediction_service.evaluate(payload.model_dump())


@router.post("/vehicles/{vehicle_id}", response_model=PredictionRead, status_code=status.HTTP_201_CREATED)
def predict_and_store(vehicle_id: int, payload: PredictionInput, db: Session = Depends(get_db)):
    if not crud.vehicle.get(db, vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    result = prediction_service.evaluate(payload.model_dump())
    return crud.prediction.create(db, vehicle_id, result)


@router.get("", response_model=List[PredictionRead])
def list_predictions(vehicle_id: Optional[int] = None, limit: int = 100, db: Session = Depends(get_db)):
    if vehicle_id is not None:
        return crud.prediction.list_for_vehicle(db, vehicle_id, limit=limit)
    return crud.prediction.list_all(db, limit=limit)


@router.get("/model-info")
def model_info():
    model = get_model()
    return {"loaded": model.is_loaded, "meta": model.meta}
