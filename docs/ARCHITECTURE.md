# AutoCare AI — Architecture

AutoCare AI is an Edge-AI predictive maintenance platform. A trained ML model runs **locally** next to the API (the "edge"), scoring vehicle sensor telemetry in real time without any cloud dependency.

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Browser (React SPA)"]
        UI["Dashboard · Vehicles · Sensor Data · Predictions · Analytics"]
    end

    subgraph Edge["Edge Node (Laptop / Vehicle Gateway)"]
        subgraph API["FastAPI Application"]
            R["API Routes"]
            S["Service Layer<br/>prediction · anomaly · dashboard"]
            C["CRUD Layer"]
            M["ML Inference<br/>FailureModel (joblib)"]
        end
        DB[("SQLite Database")]
        MODEL["failure_model.joblib<br/>+ model_meta.json"]
    end

    subgraph Training["Offline ML Pipeline"]
        GEN["generate_dataset.py"]
        CSV[("sensor_dataset.csv")]
        TRAIN["train_model.py"]
    end

    UI -->|"REST / JSON"| R
    R --> S
    S --> C
    S --> M
    C --> DB
    M --> MODEL
    GEN --> CSV --> TRAIN --> MODEL
```

## Layered Backend Design

```mermaid
flowchart LR
    Routes["routes/<br/>(HTTP layer)"] --> Schemas["schemas/<br/>(Pydantic validation)"]
    Routes --> Services["services/<br/>(business logic)"]
    Services --> CRUD["crud/<br/>(DB operations)"]
    Services --> ML["ml/model.py<br/>(inference)"]
    CRUD --> Models["models/<br/>(SQLAlchemy ORM)"]
    Models --> Database[("SQLite")]
```

Each layer has a single responsibility:

| Layer | Responsibility |
|-------|----------------|
| `routes` | HTTP request/response, status codes, dependency injection |
| `schemas` | Request/response validation and serialization (Pydantic v2) |
| `services` | Business logic: scoring, anomaly rules, dashboard aggregation |
| `crud` | Reusable database queries |
| `models` | ORM table definitions |
| `ml` | Model loading and inference (with heuristic fallback) |

## API Flow — Submitting a Sensor Reading

```mermaid
sequenceDiagram
    participant U as React UI
    participant A as FastAPI Route
    participant V as Pydantic Schema
    participant P as Prediction Service
    participant ML as FailureModel
    participant AN as Anomaly Service
    participant DB as SQLite

    U->>A: POST /api/sensor-data
    A->>V: Validate payload
    V-->>A: SensorDataCreate
    A->>DB: Insert sensor reading
    A->>P: evaluate(features)
    P->>ML: predict_probability(features)
    ML-->>P: failure probability
    P->>AN: detect(features)
    AN-->>P: anomaly list
    P-->>A: risk_score, risk_level, recommendation
    A->>DB: Insert prediction
    A-->>U: Reading + anomalies (201)
```

## Prediction Flow

```mermaid
flowchart LR
    Input["Sensor Features<br/>temp, voltage, rpm,<br/>fuel, vibration"] --> Scale["StandardScaler"]
    Scale --> RF["RandomForest<br/>Classifier"]
    RF --> Prob["Failure Probability<br/>(0.0 - 1.0)"]
    Prob --> Score["Risk Score<br/>= prob × 100"]
    Prob --> Level{"Threshold"}
    Level -->|"< 0.33"| Low["Low Risk"]
    Level -->|"0.33 - 0.66"| Med["Medium Risk"]
    Level -->|"> 0.66"| High["High Risk"]
    Low --> Rec["Maintenance<br/>Recommendation"]
    Med --> Rec
    High --> Rec
```

## Why "Edge AI"

- The model is a compact serialized artifact (`joblib`) — no GPU, no network round-trips.
- Inference latency is sub-millisecond on CPU, suitable for an in-vehicle gateway.
- The system degrades gracefully: if the model file is missing, a deterministic **heuristic scorer** takes over so monitoring never stops.
- Everything runs on a single laptop with SQLite — zero external infrastructure.
