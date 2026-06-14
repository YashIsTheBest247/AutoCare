import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report

from generate_dataset import FEATURES, generate, DATA_DIR, OUTPUT

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODELS_DIR, "failure_model.joblib")
META_PATH = os.path.join(MODELS_DIR, "model_meta.json")


def load_data():
    if os.path.exists(OUTPUT):
        return pd.read_csv(OUTPUT)
    os.makedirs(DATA_DIR, exist_ok=True)
    df = generate()
    df.to_csv(OUTPUT, index=False)
    return df


def train():
    os.makedirs(MODELS_DIR, exist_ok=True)
    df = load_data()
    X = df[FEATURES].values
    y = df["failure"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_leaf=4,
            random_state=42,
            n_jobs=-1,
        )),
    ])

    pipeline.fit(X_train, y_train)

    preds = pipeline.predict(X_test)
    probs = pipeline.predict_proba(X_test)[:, 1]
    accuracy = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)

    importances = pipeline.named_steps["clf"].feature_importances_
    meta = {
        "features": FEATURES,
        "accuracy": round(float(accuracy), 4),
        "roc_auc": round(float(auc), 4),
        "n_samples": int(len(df)),
        "feature_importances": {
            f: round(float(w), 4) for f, w in zip(FEATURES, importances)
        },
        "thresholds": {"low": 0.33, "medium": 0.66},
    }

    joblib.dump(pipeline, MODEL_PATH)
    with open(META_PATH, "w") as fh:
        json.dump(meta, fh, indent=2)

    print(classification_report(y_test, preds))
    print(f"Accuracy: {accuracy:.4f}  ROC-AUC: {auc:.4f}")
    print(f"Saved model -> {MODEL_PATH}")
    print(f"Saved meta  -> {META_PATH}")


if __name__ == "__main__":
    train()
