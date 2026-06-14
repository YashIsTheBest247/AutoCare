from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    title: str = Field(..., min_length=1, max_length=200)
    priority: str = Field(default="medium", max_length=20)
    notes: Optional[str] = Field(default=None, max_length=500)
    due_date: Optional[datetime] = None


class MaintenanceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    status: Optional[str] = Field(default=None, max_length=20)
    priority: Optional[str] = Field(default=None, max_length=20)
    notes: Optional[str] = Field(default=None, max_length=500)
    due_date: Optional[datetime] = None


class MaintenanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    vehicle_id: int
    title: str
    status: str
    priority: str
    notes: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
