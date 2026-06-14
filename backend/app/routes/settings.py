from fastapi import APIRouter

from app.schemas import ThresholdsUpdate, AlertConfig, EmailTest
from app.services import settings_service, email_service

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/thresholds")
def get_thresholds():
    return settings_service.get_thresholds()


@router.put("/thresholds")
def update_thresholds(payload: ThresholdsUpdate):
    return settings_service.update_thresholds(payload.thresholds)


@router.post("/thresholds/reset")
def reset_thresholds():
    return settings_service.reset_thresholds()


@router.get("/alerts", response_model=AlertConfig)
def get_alerts():
    return settings_service.get_alert_config()


@router.put("/alerts", response_model=AlertConfig)
def update_alerts(payload: AlertConfig):
    return settings_service.update_alert_config(payload.model_dump())


@router.get("/email/status")
def email_status():
    return {"configured": email_service.is_configured()}


@router.post("/email/test")
def email_test(payload: EmailTest):
    return email_service.send_email(
        payload.recipient,
        "AutoCare AI test email",
        "This is a test alert from AutoCare AI. Email alerts are working.",
    )
