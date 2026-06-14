from fastapi import APIRouter, Depends

from app.routes import vehicles, sensor_data, predictions, dashboard, maintenance, settings, analytics, auth
from app.services.auth_service import get_current_user

auth_router = APIRouter()
auth_router.include_router(auth.router)

api_router = APIRouter(dependencies=[Depends(get_current_user)])
api_router.include_router(vehicles.router)
api_router.include_router(sensor_data.router)
api_router.include_router(predictions.router)
api_router.include_router(dashboard.router)
api_router.include_router(maintenance.router)
api_router.include_router(settings.router)
api_router.include_router(analytics.router)
