import smtplib
from email.message import EmailMessage

from app.config import settings


def is_configured() -> bool:
    return settings.smtp_configured


def send_email(to: str, subject: str, body: str) -> dict:
    if not settings.smtp_configured:
        return {"sent": False, "reason": "SMTP not configured. Set SMTP_HOST and related env vars."}
    if not to:
        return {"sent": False, "reason": "No recipient address provided."}

    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        return {"sent": True, "to": to}
    except Exception as exc:
        return {"sent": False, "reason": str(exc)}


def send_risk_alert(to: str, vehicle_name: str, risk_level: str, risk_score: float, recommendation: str) -> dict:
    subject = f"[AutoCare AI] {risk_level} risk alert: {vehicle_name}"
    body = (
        f"Vehicle: {vehicle_name}\n"
        f"Risk level: {risk_level}\n"
        f"Risk score: {risk_score}/100\n\n"
        f"Recommendation:\n{recommendation}\n\n"
        f"-- AutoCare AI Edge Monitoring"
    )
    return send_email(to, subject, body)
