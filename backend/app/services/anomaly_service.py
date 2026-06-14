NORMAL_RANGES = {
    "temperature": (70, 105, "Engine temperature"),
    "battery_voltage": (12.4, 14.7, "Battery voltage"),
    "rpm": (600, 4000, "Engine RPM"),
    "fuel_efficiency": (10, 30, "Fuel efficiency"),
    "vibration": (0.0, 1.8, "Vibration level"),
}


def detect(features: dict) -> list[str]:
    anomalies = []
    for key, (low, high, label) in NORMAL_RANGES.items():
        value = features.get(key)
        if value is None:
            continue
        if value < low:
            anomalies.append(f"{label} below normal ({value:.2f} < {low})")
        elif value > high:
            anomalies.append(f"{label} above normal ({value:.2f} > {high})")
    return anomalies
