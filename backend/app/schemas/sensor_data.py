from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SensorDataBase(BaseModel):
    temperature: float = Field(..., ge=-40, le=200)
    battery_voltage: float = Field(..., ge=0, le=20)
    rpm: float = Field(..., ge=0, le=10000)
    fuel_efficiency: float = Field(..., ge=0, le=60)
    vibration: float = Field(..., ge=0, le=20)


class SensorDataCreate(SensorDataBase):
    vehicle_id: int


class SensorDataRead(SensorDataBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_id: int
    timestamp: datetime
    anomalies: Optional[List[str]] = None
