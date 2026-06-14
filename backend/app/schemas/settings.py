from typing import Dict, Optional
from pydantic import BaseModel


class ThresholdsUpdate(BaseModel):
    thresholds: Dict[str, Dict[str, float]]


class AlertConfig(BaseModel):
    email_enabled: bool = False
    recipient: str = ""
    min_level: str = "High"


class EmailTest(BaseModel):
    recipient: str
