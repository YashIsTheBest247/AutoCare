from fastapi import APIRouter

from app.routes import vehicles, sensor_data, predictions, dashboard, maintenance, settings, analytics

api_router = APIRouter()
api_router.include_router(vehicles.router)
api_router.include_router(sensor_data.router)
api_router.include_router(predictions.router)
api_router.include_router(dashboard.router)
api_router.include_router(maintenance.router)
api_router.include_router(settings.router)
api_router.include_router(analytics.router)
