from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleDetail
from app.schemas.sensor_data import SensorDataCreate, SensorDataRead
from app.schemas.prediction import (
    PredictionRead,
    PredictionInput,
    PredictionResult,
)

__all__ = [
    "VehicleCreate",
    "VehicleRead",
    "VehicleDetail",
    "SensorDataCreate",
    "SensorDataRead",
    "PredictionRead",
    "PredictionInput",
    "PredictionResult",
]
