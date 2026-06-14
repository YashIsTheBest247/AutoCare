import json

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Setting
from app.services import anomaly_service

THRESHOLDS_KEY = "anomaly_thresholds"
ALERTS_KEY = "alert_config"

DEFAULT_ALERT_CONFIG = {"email_enabled": False, "recipient": "", "min_level": "High"}


def _get(db: Session, key: str):
    row = db.get(Setting, key)
    if not row:
        return None
    try:
        return json.loads(row.value)
    except Exception:
        return None


def _set(db: Session, key: str, value):
    row = db.get(Setting, key)
    if row:
        row.value = json.dumps(value)
    else:
        db.add(Setting(key=key, value=json.dumps(value)))
    db.commit()


def load_into_runtime():
    db = SessionLocal()
    try:
        stored = _get(db, THRESHOLDS_KEY)
        if stored:
            anomaly_service.set_thresholds(stored)
    finally:
        db.close()


def get_thresholds() -> dict:
    return anomaly_service.get_thresholds()


def update_thresholds(new_ranges: dict) -> dict:
    anomaly_service.set_thresholds(new_ranges)
    db = SessionLocal()
    try:
        _set(db, THRESHOLDS_KEY, anomaly_service.get_thresholds())
    finally:
        db.close()
    return anomaly_service.get_thresholds()


def reset_thresholds() -> dict:
    anomaly_service.reset_thresholds()
    db = SessionLocal()
    try:
        _set(db, THRESHOLDS_KEY, anomaly_service.get_thresholds())
    finally:
        db.close()
    return anomaly_service.get_thresholds()


def get_alert_config() -> dict:
    db = SessionLocal()
    try:
        stored = _get(db, ALERTS_KEY)
        return stored or dict(DEFAULT_ALERT_CONFIG)
    finally:
        db.close()


def update_alert_config(config: dict) -> dict:
    current = get_alert_config()
    current.update({k: v for k, v in config.items() if k in DEFAULT_ALERT_CONFIG})
    db = SessionLocal()
    try:
        _set(db, ALERTS_KEY, current)
    finally:
        db.close()
    return current
