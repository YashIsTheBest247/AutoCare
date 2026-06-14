DEFAULT_RANGES = {
    "temperature": {"low": 70.0, "high": 105.0, "label": "Engine temperature"},
    "battery_voltage": {"low": 12.4, "high": 14.7, "label": "Battery voltage"},
    "rpm": {"low": 600.0, "high": 4000.0, "label": "Engine RPM"},
    "fuel_efficiency": {"low": 10.0, "high": 30.0, "label": "Fuel efficiency"},
    "vibration": {"low": 0.0, "high": 1.8, "label": "Vibration level"},
}

_ranges = {k: dict(v) for k, v in DEFAULT_RANGES.items()}


def get_thresholds() -> dict:
    return {k: dict(v) for k, v in _ranges.items()}


def set_thresholds(new_ranges: dict):
    for key, conf in new_ranges.items():
        if key in _ranges:
            if "low" in conf:
                _ranges[key]["low"] = float(conf["low"])
            if "high" in conf:
                _ranges[key]["high"] = float(conf["high"])


def reset_thresholds():
    global _ranges
    _ranges = {k: dict(v) for k, v in DEFAULT_RANGES.items()}


def detect(features: dict) -> list[str]:
    anomalies = []
    for key, conf in _ranges.items():
        value = features.get(key)
        if value is None:
            continue
        if value < conf["low"]:
            anomalies.append(f"{conf['label']} below normal ({value:.2f} < {conf['low']})")
        elif value > conf["high"]:
            anomalies.append(f"{conf['label']} above normal ({value:.2f} > {conf['high']})")
    return anomalies
