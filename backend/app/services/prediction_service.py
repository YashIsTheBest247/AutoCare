from app.ml.model import get_model
from app.schemas import PredictionResult
from app.services import anomaly_service

RECOMMENDATIONS = {
    "Low": "Vehicle operating within healthy parameters. Continue routine maintenance schedule.",
    "Medium": "Early signs of wear detected. Schedule an inspection within the next 2 weeks.",
    "High": "Critical failure risk detected. Service the vehicle immediately to avoid breakdown.",
}


def _level(probability: float) -> str:
    model = get_model()
    thresholds = model.meta.get("thresholds", {"low": 0.33, "medium": 0.66})
    if probability < thresholds["low"]:
        return "Low"
    if probability < thresholds["medium"]:
        return "Medium"
    return "High"


def _recommendation(level: str, anomalies: list[str]) -> str:
    base = RECOMMENDATIONS[level]
    if anomalies:
        focus = "; ".join(anomalies[:3])
        return f"{base} Investigate: {focus}."
    return base


def evaluate(features: dict) -> PredictionResult:
    model = get_model()
    probability = model.predict_probability(features)
    anomalies = anomaly_service.detect(features)
    level = _level(probability)
    return PredictionResult(
        risk_score=round(probability * 100, 2),
        risk_level=level,
        failure_probability=round(probability, 4),
        recommendation=_recommendation(level, anomalies),
        anomalies=anomalies,
    )
