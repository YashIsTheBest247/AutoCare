from sqlalchemy.orm import Session

from app import crud
from app.services import anomaly_service


def health_score_from_risk(risk_score: float) -> float:
    return round(max(0.0, 100.0 - risk_score), 1)


def vehicle_summary(db: Session, vehicle) -> dict:
    latest_pred = crud.prediction.latest_for_vehicle(db, vehicle.id)
    sensor_count = len(crud.sensor_data.list_for_vehicle(db, vehicle.id, limit=1000))
    prediction_count = len(crud.prediction.list_for_vehicle(db, vehicle.id, limit=1000))
    risk_score = latest_pred.risk_score if latest_pred else 0.0
    return {
        "id": vehicle.id,
        "name": vehicle.name,
        "model": vehicle.model,
        "type": vehicle.type,
        "latitude": vehicle.latitude,
        "longitude": vehicle.longitude,
        "created_at": vehicle.created_at,
        "health_score": health_score_from_risk(risk_score),
        "latest_risk_level": latest_pred.risk_level if latest_pred else None,
        "sensor_count": sensor_count,
        "prediction_count": prediction_count,
    }


def overview(db: Session) -> dict:
    vehicles = crud.vehicle.list_all(db, limit=1000)
    predictions = crud.prediction.list_all(db, limit=1000)

    risk_counts = {"Low": 0, "Medium": 0, "High": 0}
    health_scores = []
    latest_by_vehicle = {}
    for v in vehicles:
        pred = crud.prediction.latest_for_vehicle(db, v.id)
        if pred:
            latest_by_vehicle[v.id] = pred
            risk_counts[pred.risk_level] = risk_counts.get(pred.risk_level, 0) + 1
            health_scores.append(health_score_from_risk(pred.risk_score))
        else:
            health_scores.append(100.0)

    active_alerts = []
    for v in vehicles:
        latest = crud.sensor_data.latest_for_vehicle(db, v.id)
        if not latest:
            continue
        features = {
            "temperature": latest.temperature,
            "battery_voltage": latest.battery_voltage,
            "rpm": latest.rpm,
            "fuel_efficiency": latest.fuel_efficiency,
            "vibration": latest.vibration,
        }
        anomalies = anomaly_service.detect(features)
        pred = latest_by_vehicle.get(v.id)
        if anomalies or (pred and pred.risk_level == "High"):
            active_alerts.append({
                "vehicle_id": v.id,
                "vehicle_name": v.name,
                "risk_level": pred.risk_level if pred else "Medium",
                "anomalies": anomalies,
                "timestamp": latest.timestamp,
            })

    avg_health = round(sum(health_scores) / len(health_scores), 1) if health_scores else 100.0

    risk_trend = [
        {
            "id": p.id,
            "vehicle_id": p.vehicle_id,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "created_at": p.created_at,
        }
        for p in reversed(predictions[:30])
    ]

    return {
        "total_vehicles": len(vehicles),
        "average_health_score": avg_health,
        "active_alerts_count": len(active_alerts),
        "total_predictions": len(predictions),
        "risk_distribution": risk_counts,
        "active_alerts": active_alerts,
        "risk_trend": risk_trend,
    }
