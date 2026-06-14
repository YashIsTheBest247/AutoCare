from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class PredictionInput(BaseModel):
    temperature: float = Field(..., ge=-40, le=200)
    battery_voltage: float = Field(..., ge=0, le=20)
    rpm: float = Field(..., ge=0, le=10000)
    fuel_efficiency: float = Field(..., ge=0, le=60)
    vibration: float = Field(..., ge=0, le=20)


class PredictionResult(BaseModel):
    risk_score: float
    risk_level: str
    failure_probability: float
    recommendation: str
    anomalies: List[str] = []


class PredictionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_id: int
    risk_score: float
    risk_level: str
    failure_probability: float
    recommendation: str
    created_at: datetime
