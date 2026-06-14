import os
import json
import joblib
import numpy as np

from app.config import settings

FEATURES = ["temperature", "battery_voltage", "rpm", "fuel_efficiency", "vibration"]


class FailureModel:
    def __init__(self):
        self._model = None
        self._meta = {"thresholds": {"low": 0.33, "medium": 0.66}, "source": "heuristic"}
        self._load()

    def _load(self):
        if os.path.exists(settings.model_path):
            try:
                self._model = joblib.load(settings.model_path)
                self._meta["source"] = "model"
            except Exception:
                self._model = None
        if os.path.exists(settings.model_meta_path):
            try:
                with open(settings.model_meta_path) as fh:
                    meta = json.load(fh)
                meta.setdefault("thresholds", {"low": 0.33, "medium": 0.66})
                meta["source"] = self._meta["source"]
                self._meta = meta
            except Exception:
                pass

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    @property
    def meta(self) -> dict:
        return self._meta

    def _heuristic_probability(self, f: dict) -> float:
        score = (
            max(0.0, f["temperature"] - 92) / 28 * 0.30
            + max(0.0, 13.4 - f["battery_voltage"]) / 1.8 * 0.20
            + max(0.0, f["rpm"] - 2800) / 2200 * 0.15
            + max(0.0, 15.5 - f["fuel_efficiency"]) / 8 * 0.15
            + max(0.0, f["vibration"] - 1.3) / 2.5 * 0.20
        )
        return float(min(1.0, max(0.0, score)))

    def predict_probability(self, f: dict) -> float:
        if self._model is not None:
            row = np.array([[f[name] for name in FEATURES]], dtype=float)
            return float(self._model.predict_proba(row)[0, 1])
        return self._heuristic_probability(f)


_failure_model: FailureModel | None = None


def get_model() -> FailureModel:
    global _failure_model
    if _failure_model is None:
        _failure_model = FailureModel()
    return _failure_model
