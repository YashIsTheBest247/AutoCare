from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class VehicleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    model: str = Field(..., min_length=1, max_length=120)
    type: str = Field(default="car", max_length=60)


class VehicleCreate(VehicleBase):
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)


class VehicleRead(VehicleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime


class VehicleDetail(VehicleRead):
    health_score: float = 100.0
    latest_risk_level: Optional[str] = None
    sensor_count: int = 0
    prediction_count: int = 0
