from app.schemas.vehicle import VehicleCreate, VehicleRead, VehicleDetail
from app.schemas.sensor_data import SensorDataCreate, SensorDataRead
from app.schemas.prediction import (
    PredictionRead,
    PredictionInput,
    PredictionResult,
    FeatureContribution,
)
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
    MaintenanceRead,
)
from app.schemas.settings import ThresholdsUpdate, AlertConfig, EmailTest
from app.schemas.auth import UserCreate, LoginRequest, UserRead, Token

__all__ = [
    "VehicleCreate",
    "VehicleRead",
    "VehicleDetail",
    "SensorDataCreate",
    "SensorDataRead",
    "PredictionRead",
    "PredictionInput",
    "PredictionResult",
    "FeatureContribution",
    "MaintenanceCreate",
    "MaintenanceUpdate",
    "MaintenanceRead",
    "ThresholdsUpdate",
    "AlertConfig",
    "EmailTest",
    "UserCreate",
    "LoginRequest",
    "UserRead",
    "Token",
]
