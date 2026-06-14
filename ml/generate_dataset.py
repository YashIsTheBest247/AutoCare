import os
import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT = os.path.join(DATA_DIR, "sensor_dataset.csv")

FEATURES = ["temperature", "battery_voltage", "rpm", "fuel_efficiency", "vibration"]


def _sample_healthy(n):
    return pd.DataFrame({
        "temperature": RNG.normal(90, 6, n).clip(70, 115),
        "battery_voltage": RNG.normal(13.8, 0.3, n).clip(12.6, 14.7),
        "rpm": RNG.normal(2400, 450, n).clip(700, 4200),
        "fuel_efficiency": RNG.normal(16.5, 2.0, n).clip(9, 24),
        "vibration": RNG.normal(0.9, 0.25, n).clip(0.1, 2.0),
    })


def _sample_degraded(n):
    return pd.DataFrame({
        "temperature": RNG.normal(112, 9, n).clip(95, 145),
        "battery_voltage": RNG.normal(12.0, 0.6, n).clip(10.5, 13.2),
        "rpm": RNG.normal(3500, 900, n).clip(900, 6500),
        "fuel_efficiency": RNG.normal(10.5, 2.4, n).clip(4, 18),
        "vibration": RNG.normal(2.6, 0.7, n).clip(1.2, 5.5),
    })


def _risk_signal(df):
    score = (
        (df["temperature"] - 92).clip(lower=0) / 28 * 0.30
        + (13.4 - df["battery_voltage"]).clip(lower=0) / 1.8 * 0.20
        + (df["rpm"] - 2800).clip(lower=0) / 2200 * 0.15
        + (15.5 - df["fuel_efficiency"]).clip(lower=0) / 8 * 0.15
        + (df["vibration"] - 1.3).clip(lower=0) / 2.5 * 0.20
    )
    return score.clip(0, 1)


def generate(n=6000, healthy_ratio=0.62):
    n_healthy = int(n * healthy_ratio)
    n_degraded = n - n_healthy
    df = pd.concat([_sample_healthy(n_healthy), _sample_degraded(n_degraded)], ignore_index=True)
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    signal = _risk_signal(df)
    noise = RNG.normal(0, 0.06, len(df))
    prob = (signal + noise).clip(0, 1)
    df["failure"] = (prob > 0.38).astype(int)
    return df


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    df = generate()
    df.to_csv(OUTPUT, index=False)
    rate = df["failure"].mean()
    print(f"Wrote {len(df)} rows to {OUTPUT}")
    print(f"Failure rate: {rate:.1%}")
    print(df.head())


if __name__ == "__main__":
    main()
