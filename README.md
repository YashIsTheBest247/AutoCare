# AutoCare

**AI-Powered Vehicle Health and Predictive Maintenance System**
*Edge AI for Automotive — predict vehicle failures before they happen.*

AutoCare AI monitors vehicle sensor telemetry, detects anomalies, predicts failure risk with a machine-learning model running **locally at the edge**, and surfaces everything in a modern analytics dashboard. The entire system runs on a single laptop with generated sample data — no cloud required.

---

## Features

- **Vehicle Management** — add, list, delete, and drill into a per-vehicle detail page.
- **Sensor Monitoring** — record engine temperature, battery voltage, RPM, fuel efficiency, and vibration.
- **Predictive Maintenance** — ML-driven failure risk score, probability, risk level (Low/Medium/High), and recommendations.
- **Anomaly Detection** — rule-based detection of out-of-range readings with alerts.
- **Dashboard** — fleet health gauge, risk-level bar, AI recommendations, risk distribution, and trend charts.
- **Live Fleet Map** — interactive map (Leaflet + OpenStreetMap, no API key) with risk-colored vehicle pins and detail popups.
- **Global Search & Notifications** — top-bar search across vehicles/pages and a live notifications panel of active alerts.
- **Edge-first** — sub-millisecond CPU inference with a graceful heuristic fallback if the model is unavailable.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, JavaScript, Vite, Tailwind CSS, React Router, Recharts, Axios, Leaflet / React-Leaflet (OpenStreetMap) |
| Backend | FastAPI, Python, SQLAlchemy, SQLite, Pydantic |
| Machine Learning | Scikit-learn, Pandas, NumPy, Joblib |
| Deployment | Docker, Docker Compose, Nginx |

---

## Quick Start

### Option A — Local (3 terminals)

```bash
# 1. Train the model
cd ml
pip install -r requirements.txt
python generate_dataset.py
python train_model.py

# 2. Backend
cd ../backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd ../frontend
npm install
npm run dev
```
Open **http://localhost:5173**. API docs at **http://localhost:8000/docs**.

### Option B — Docker Compose

```bash
# Train the model first (creates ml/models/, mounted into the backend)
cd ml && pip install -r requirements.txt && python generate_dataset.py && python train_model.py && cd ..

docker compose up --build
```
Frontend → **http://localhost:3000** · Backend → **http://localhost:8000**

> Full instructions in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Model Performance
RandomForest pipeline trained on 6,000 generated samples:
- **Accuracy:** ~98%  ·  **ROC-AUC:** ~0.997
- Metrics & feature importances exposed at `GET /api/predictions/model-info` and the **Analytics** page.

---

## Documentation
| Document | Contents |
|----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System & layered architecture, API flow, prediction flow (Mermaid) |
| [docs/DATABASE.md](docs/DATABASE.md) | ER diagram and table reference (Mermaid) |
| [docs/API.md](docs/API.md) | Full REST API documentation |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Local, Docker, and edge deployment guide |

---

## Project Structure

```
autocare/
├── README.md                 # This file
├── docker-compose.yml        # Orchestrates backend + frontend containers
├── .gitignore
├── docs/                     # Architecture, DB, API, deployment, presentation
│
├── ml/                       # Machine learning pipeline
│   ├── requirements.txt
│   ├── generate_dataset.py   # Synthetic sensor dataset generator
│   ├── train_model.py        # Trains & serializes the failure model
│   ├── data/                 # Generated dataset (sensor_dataset.csv)
│   └── models/               # Saved model + metadata (joblib / json)
│
├── backend/                  # FastAPI application
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py           # App entrypoint, CORS, lifespan, error handler
│       ├── config.py         # Settings (env-driven)
│       ├── database.py       # Engine, session, Base, init_db + SQLite migration
│       ├── seed.py           # Seeds sample vehicles/readings + geo backfill
│       ├── models/           # SQLAlchemy ORM models (vehicle incl. lat/lng)
│       ├── schemas/          # Pydantic request/response schemas
│       ├── crud/             # Database operations
│       ├── services/         # Business logic (prediction, anomaly, dashboard)
│       ├── routes/           # API endpoints
│       └── ml/               # Model loader & inference wrapper
│
└── frontend/                 # React + Vite application
    ├── Dockerfile
    ├── nginx.conf            # Serves SPA + proxies /api in container
    ├── package.json
    ├── vite.config.js        # Dev server + /api proxy
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx          # React/Router bootstrap
        ├── App.jsx           # Routes + layout
        ├── index.css         # Tailwind + component classes
        ├── api/client.js     # Axios API client
        ├── components/       # Logo, Sidebar, Topbar, KpiCard, HealthGauge, RiskLevelBar,
        │                     #   RiskBadge, Recommendations, FleetMap, Select, AlertList, ...
        └── pages/            # Dashboard, Vehicles, VehicleDetail, SensorData, Predictions, Analytics
```

---

## File-by-File Explanation

### Root
| Path | Purpose |
|------|---------|
| `README.md` | Project overview, setup, and this explanation. |
| `docker-compose.yml` | Builds and runs backend + frontend; mounts `ml/` into the backend; persists SQLite in a volume. |
| `.gitignore` | Excludes caches, virtualenvs, node_modules, build artifacts, and generated ML files. |

### `docs/`
| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | Mermaid system architecture, layered backend design, API & prediction sequence flows. |
| `DATABASE.md` | Mermaid ER diagram and full table/column reference. |
| `API.md` | Endpoint-by-endpoint REST API documentation with examples. |
| `DEPLOYMENT.md` | Local, Docker, and edge deployment instructions + env vars. |

### `ml/` — Machine Learning
| File | Purpose |
|------|---------|
| `requirements.txt` | ML dependencies (numpy, pandas, scikit-learn, joblib). |
| `generate_dataset.py` | Generates a physically-grounded synthetic dataset of healthy/degraded readings and a `failure` label; writes `data/sensor_dataset.csv`. |
| `train_model.py` | Trains a `StandardScaler + RandomForest` pipeline, evaluates it (accuracy, ROC-AUC), and saves `models/failure_model.joblib` + `models/model_meta.json`. |
| `data/` | Holds the generated CSV dataset. |
| `models/` | Holds the serialized model and its metadata (features, metrics, thresholds, feature importances). |

### `backend/`
| File | Purpose |
|------|---------|
| `Dockerfile` | Builds the FastAPI image (Python 3.11-slim, uvicorn). |
| `requirements.txt` | Backend dependencies. |
| `.env.example` | Template for environment configuration. |
| `.dockerignore` | Keeps caches/db out of the image. |

#### `backend/app/`
| File | Purpose |
|------|---------|
| `main.py` | Creates the FastAPI app, configures CORS, registers routers, global exception handler, and a `lifespan` that initializes + seeds the DB. |
| `config.py` | Pydantic `Settings` reading env vars (DB URL, model paths, CORS origins). |
| `database.py` | SQLAlchemy engine, `SessionLocal`, declarative `Base`, `get_db`, `init_db`, and a lightweight SQLite column migration (`_ensure_columns`). |
| `seed.py` | Seeds 4 sample vehicles (with New Delhi coordinates), readings, and predictions on first run; `backfill_locations()` assigns/relocates coordinates so every vehicle appears on the map. |

#### `backend/app/models/` — ORM
| File | Purpose |
|------|---------|
| `vehicle.py` | `Vehicle` table (incl. `latitude`/`longitude`) + relationships to readings and predictions. |
| `sensor_data.py` | `SensorData` table (the five sensor features + timestamp). |
| `prediction.py` | `Prediction` table (risk score/level, probability, recommendation). |
| `__init__.py` | Re-exports the models for easy importing. |

#### `backend/app/schemas/` — Pydantic
| File | Purpose |
|------|---------|
| `vehicle.py` | `VehicleCreate`, `VehicleRead`, `VehicleDetail` (health summary + lat/lng). |
| `sensor_data.py` | `SensorDataCreate`, `SensorDataRead` (with anomalies), validated ranges. |
| `prediction.py` | `PredictionInput`, `PredictionResult`, `PredictionRead`. |
| `__init__.py` | Aggregates schema exports. |

#### `backend/app/crud/` — Data access
| File | Purpose |
|------|---------|
| `vehicle.py` | Create/get/list/count/delete vehicles. |
| `sensor_data.py` | Create and query readings (per-vehicle, latest, all). |
| `prediction.py` | Create and query predictions (per-vehicle, latest, all). |
| `__init__.py` | Exposes the CRUD modules. |

#### `backend/app/services/` — Business logic
| File | Purpose |
|------|---------|
| `prediction_service.py` | Turns features into a risk score/level/recommendation using the model + thresholds. |
| `anomaly_service.py` | Rule-based out-of-range detection per sensor. |
| `dashboard_service.py` | Aggregates fleet KPIs, health scores, alerts, and risk trends. |
| `__init__.py` | Exposes the service modules. |

#### `backend/app/routes/` — API
| File | Purpose |
|------|---------|
| `vehicles.py` | `/api/vehicles` CRUD endpoints. |
| `sensor_data.py` | `/api/sensor-data` — store readings (auto-generates a prediction) and query them. |
| `predictions.py` | `/api/predictions` — stateless predict, persist-per-vehicle, history, model info. |
| `dashboard.py` | `/api/dashboard/overview` aggregated KPIs. |
| `__init__.py` | Combines all routers into `api_router`. |

#### `backend/app/ml/`
| File | Purpose |
|------|---------|
| `model.py` | `FailureModel` loads the joblib pipeline + metadata, exposes `predict_probability`, and falls back to a deterministic heuristic if no model is present. |

### `frontend/`
| File | Purpose |
|------|---------|
| `Dockerfile` | Two-stage build → static assets served by Nginx. |
| `nginx.conf` | Serves the SPA and proxies `/api` to the backend container. |
| `package.json` | Scripts and dependencies. |
| `vite.config.js` | Dev server config + `/api` proxy to port 8000. |
| `tailwind.config.js` | Blue automotive light theme (brand, risk colors, animations). |
| `postcss.config.js` | Tailwind/Autoprefixer pipeline. |
| `index.html` | App shell + font preload. |

#### `frontend/src/`
| File | Purpose |
|------|---------|
| `main.jsx` | Mounts React with the Router. |
| `App.jsx` | Wraps pages in `Layout` and defines routes. |
| `index.css` | Tailwind layers + reusable component classes (`card`, `btn-primary`, `input`). |
| `api/client.js` | Axios instance + typed API helper functions. |

#### `frontend/src/components/`
| File | Purpose |
|------|---------|
| `Layout.jsx` | Sidebar + Topbar + animated main content shell. |
| `Logo.jsx` | Gradient "AutoCare" mark + wordmark (animated heartbeat). |
| `Sidebar.jsx` | Blue gradient nav with active-route highlighting. |
| `Topbar.jsx` | Page title, global search dropdown, and notifications bell. |
| `KpiCard.jsx` | Reusable KPI metric card (staggered entrance). |
| `HealthGauge.jsx` | Circular SVG health-score gauge (color by score). |
| `RiskLevelBar.jsx` | Gradient Low→High risk bar with marker. |
| `RiskBadge.jsx` | Color-coded Low/Medium/High badge. |
| `Recommendations.jsx` | AI maintenance recommendation list. |
| `FleetMap.jsx` | Leaflet/OpenStreetMap map with risk-colored vehicle pins. |
| `Select.jsx` | Custom themed dropdown (replaces native `<select>`). |
| `AlertList.jsx` | Renders active anomaly/risk alerts. |
| `common.jsx` | Shared `Spinner`, `EmptyState`, `SectionTitle`, and `formatDate`. |

#### `frontend/src/pages/`
| File | Purpose |
|------|---------|
| `Dashboard.jsx` | Health gauge, risk bar, AI recommendations, live fleet map, distribution + trend charts. |
| `Vehicles.jsx` | Add vehicle form + fleet table (links to detail). |
| `VehicleDetail.jsx` | Per-vehicle health gauge, latest reading, telemetry chart, location map, prediction history. |
| `SensorData.jsx` | Record readings (auto-prediction) + recent readings table with anomaly status. |
| `Predictions.jsx` | Run/save predictions, result card, and prediction history. |
| `Analytics.jsx` | Risk distribution, model feature importance, telemetry trends, model info. |

---

## API Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST/GET/DELETE | `/api/vehicles` | Vehicle CRUD |
| POST/GET | `/api/sensor-data` | Record/list readings (auto-prediction) |
| POST | `/api/predictions/predict` | Stateless risk scoring |
| POST | `/api/predictions/vehicles/{id}` | Score & persist for a vehicle |
| GET | `/api/predictions` | Prediction history |
| GET | `/api/predictions/model-info` | Model metrics & metadata |
| GET | `/api/dashboard/overview` | Aggregated dashboard KPIs |

Full details in [docs/API.md](docs/API.md).

---

