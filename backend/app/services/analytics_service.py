import numpy as np

from app.ml.model import get_model

BASELINE = {
    "temperature": 90.0,
    "battery_voltage": 13.8,
    "rpm": 2200.0,
    "fuel_efficiency": 17.0,
    "vibration": 0.8,
}

RANGES = {
    "temperature": 45.0,
    "battery_voltage": 3.0,
    "rpm": 3000.0,
    "fuel_efficiency": 11.0,
    "vibration": 4.0,
}

DEFAULT_WEIGHTS = {
    "temperature": 0.30,
    "battery_voltage": 0.20,
    "rpm": 0.15,
    "fuel_efficiency": 0.15,
    "vibration": 0.20,
}

DANGER = {
    "temperature": 105.0,
    "battery_voltage": 12.4,
    "vibration": 1.8,
}


def _clamp(x, lo=0.0, hi=100.0):
    return round(max(lo, min(hi, x)), 1)


def component_health(f: dict) -> dict:
    return {
        "engine": _clamp(100 - max(0, f["temperature"] - 95) * 2.0 - max(0, f["rpm"] - 3000) / 30),
        "battery": _clamp(100 - max(0, 13.6 - f["battery_voltage"]) * 45),
        "cooling": _clamp(100 - max(0, f["temperature"] - 98) * 3.5),
        "drivetrain": _clamp(100 - max(0, f["vibration"] - 1.0) * 32),
        "economy": _clamp(100 - max(0, 15 - f["fuel_efficiency"]) * 8),
    }


def remaining_useful_life(risk_score: float) -> int:
    health = max(0.0, 100.0 - risk_score) / 100.0
    return int(round(5 + (health ** 2) * 360))


def feature_contributions(f: dict) -> list:
    model = get_model()
    importances = model.meta.get("feature_importances") or DEFAULT_WEIGHTS
    raw = {}
    for key, base in BASELINE.items():
        if key in ("fuel_efficiency", "battery_voltage"):
            deviation = max(0.0, base - f[key])
        else:
            deviation = max(0.0, f[key] - base)
        norm = deviation / RANGES[key]
        raw[key] = norm * importances.get(key, DEFAULT_WEIGHTS[key])
    total = sum(raw.values()) or 1.0
    contributions = [
        {"feature": k, "contribution": round(v / total * 100, 1)}
        for k, v in sorted(raw.items(), key=lambda kv: kv[1], reverse=True)
    ]
    return contributions


COMPONENT_META = {
    "engine": {"failure": "Engine overheating / thermal stress", "cost": 1200, "downtime": 8.0},
    "battery": {"failure": "Battery / charging system degradation", "cost": 350, "downtime": 2.0},
    "cooling": {"failure": "Cooling system inefficiency", "cost": 600, "downtime": 4.0},
    "drivetrain": {"failure": "Drivetrain wear / abnormal vibration", "cost": 900, "downtime": 6.0},
    "economy": {"failure": "Fuel delivery inefficiency", "cost": 250, "downtime": 2.0},
}


def _priority(level: str, risk_score: float) -> str:
    if level == "High":
        return "Critical" if risk_score >= 85 else "High"
    if level == "Medium":
        return "Medium"
    return "Low"


def diagnose(components: dict, contributions: list, anomalies: list, risk_score: float, level: str, probability: float) -> dict:
    predicted = min(components, key=components.get) if components else "engine"
    meta = COMPONENT_META.get(predicted, COMPONENT_META["engine"])
    severity = 0.3 + (risk_score / 100.0)
    indicators = [f"{c['feature'].replace('_', ' ').title()} ({c['contribution']}% of risk)" for c in contributions[:2]]
    indicators += anomalies[:2]
    return {
        "predicted_component": predicted.title(),
        "failure_type": meta["failure"],
        "confidence": round(max(probability, 1 - probability) * 100, 1),
        "maintenance_priority": _priority(level, risk_score),
        "estimated_cost": round(meta["cost"] * severity / 10) * 10,
        "estimated_downtime_hours": round(meta["downtime"] * (0.4 + risk_score / 100.0), 1),
        "root_cause_indicators": indicators or ["No abnormal indicators detected"],
    }


def forecast(readings: list, steps: int = 6) -> dict:
    metrics = ["temperature", "battery_voltage", "vibration"]
    ordered = list(reversed(readings))[-12:]
    result = {"steps": steps, "series": {}, "warnings": []}
    if len(ordered) < 3:
        return result
    x = np.arange(len(ordered))
    future = np.arange(len(ordered), len(ordered) + steps)
    for m in metrics:
        y = np.array([getattr(r, m) for r in ordered], dtype=float)
        slope, intercept = np.polyfit(x, y, 1)
        projected = (slope * future + intercept).tolist()
        result["series"][m] = [round(v, 2) for v in projected]
        danger = DANGER.get(m)
        if danger is not None:
            rising = m in ("temperature", "vibration")
            crosses = any((v > danger) if rising else (v < danger) for v in projected)
            if crosses:
                result["warnings"].append(
                    f"{m.replace('_', ' ').title()} projected to cross safe limit ({danger}) within {steps} readings."
                )
    return result
