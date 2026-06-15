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
- **Live Telemetry Simulation** — a dashboard "Live Feed" toggle that streams synthetic readings so the UI updates in real time.
- **Prediction Intelligence** — an AI decision-support panel: predicted component, failure type, model confidence, maintenance priority, estimated downtime & cost impact, and root-cause indicators.
- **Explainability** — per-prediction feature contributions ("why this score"), component-level health (engine/battery/cooling/drivetrain/economy), and Remaining Useful Life (RUL) estimate.
- **Forecasting** — projects upcoming sensor trends and warns before a value crosses a danger limit.
- **Reports** — fleet summary stats and one-click CSV exports for telemetry and predictions.
- **Maintenance Scheduler** — create/track/complete service tasks per vehicle with priorities.
- **Configurable Thresholds** — tune anomaly ranges per sensor from a Settings page (persisted).
- **Email Alerts** — optional SMTP email on new high-risk readings (configurable recipient & severity).
- **Vehicle Comparison** — compare health, RUL, and component breakdown across up to 3 vehicles.
- **CSV Import/Export** — bulk-import sensor readings and export readings/predictions.
- **Theming** — minimal black-on-white editorial light theme with a neutral-charcoal dark mode (persisted toggle); charts re-color to match the active theme.
- **JWT Authentication** — login/register, token-protected API, default seeded admin, per-user sessions with logout.
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

## Authentication
The API is protected with **JWT**. The frontend gates all pages behind a login screen.

- A default admin is seeded on first run: **`admin@autocare.ai` / `admin123`**
- Register additional users from the login page (role: operator).
- Tokens are stored client-side and sent as `Authorization: Bearer <token>`; expired/invalid tokens redirect to login.

Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.

> Change the admin credentials and `SECRET_KEY` for any non-local use — set `SECRET_KEY`, `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD` in `backend/.env`.

---

## Email Alerts (optional)
High-risk readings can trigger an email. It's **off until SMTP is configured** — the app works fully without it.

Add credentials to `backend/.env` locally, or as env vars on your host in production (both `MAIL_*` and `SMTP_*` names are accepted).

**Gmail (good for local):**
```env
MAIL_SERVER=smtp.gmail.com      # or SMTP_HOST
MAIL_PORT=587                   # or SMTP_PORT
MAIL_USERNAME=you@gmail.com     # or SMTP_USER
MAIL_PASSWORD=your_app_password # or SMTP_PASSWORD
MAIL_FROM=you@gmail.com         # or SMTP_FROM
MAIL_STARTTLS=True              # or SMTP_USE_TLS
```
Gmail needs an **App Password** (Google Account → Security → App passwords, with 2-Step Verification on) — not your normal password.

**Brevo / SendGrid / Mailgun (recommended on Render & most clouds):**
Many hosts (including Render's free tier) **block outbound port 587**, so Gmail SMTP times out there. Use a transactional provider on **port 2525**:
```env
MAIL_SERVER=smtp-relay.brevo.com
MAIL_PORT=2525
MAIL_USERNAME=xxxxxxxx@smtp-brevo.com   # the provider's SMTP login
MAIL_PASSWORD=xsmtpsib-...               # the provider's SMTP key
MAIL_FROM=you@example.com                # must be a VERIFIED sender in the provider
MAIL_STARTTLS=True
```

Then **restart the backend** (or redeploy — the env is read at startup). On the **Settings** page, the banner should read "SMTP is configured"; set a recipient + minimum risk level and use **Send Test** to verify.

> Keep real credentials out of git — `backend/.env` is already git-ignored; in production set them in your host's dashboard (e.g. Render → Environment).

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
├── docs/                     # Architecture, DB, API, deployment
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
        ├── main.jsx          # React/Router/Auth bootstrap + theme init
        ├── App.jsx           # Auth guard, routes + layout
        ├── index.css         # Theme tokens (light/dark) + component classes
        ├── api/client.js     # Axios client + JWT interceptors
        ├── context/auth.jsx  # Auth provider (token + user)
        ├── components/       # Logo, Sidebar, Topbar, KpiCard, HealthGauge, RiskLevelBar,
        │                     #   RiskBadge, Recommendations, FleetMap, Select, Meters, AlertList, ...
        └── pages/            # Dashboard, Vehicles, VehicleDetail, SensorData, Predictions,
                              #   Analytics, Maintenance, Compare, Reports, Settings, Login
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
| `vehicle.py` | `Vehicle` table (incl. `latitude`/`longitude`) + relationships to readings, predictions, maintenance. |
| `sensor_data.py` | `SensorData` table (the five sensor features + timestamp). |
| `prediction.py` | `Prediction` table (risk score/level, probability, recommendation). |
| `maintenance.py` | `MaintenanceTask` table (title, status, priority, due/completed dates). |
| `setting.py` | Key/value `Setting` table (anomaly thresholds, alert config). |
| `user.py` | `User` table (email, hashed password, role) for auth. |
| `__init__.py` | Re-exports the models for easy importing. |

#### `backend/app/schemas/` — Pydantic
| File | Purpose |
|------|---------|
| `vehicle.py` | `VehicleCreate`, `VehicleRead`, `VehicleDetail` (health summary + lat/lng). |
| `sensor_data.py` | `SensorDataCreate`, `SensorDataRead` (with anomalies), validated ranges. |
| `prediction.py` | `PredictionInput`, `PredictionResult` (risk + full diagnostic intelligence), `PredictionRead`. |
| `maintenance.py` | `MaintenanceCreate/Update/Read` schemas. |
| `settings.py` | `ThresholdsUpdate`, `AlertConfig`, `EmailTest`. |
| `auth.py` | `UserCreate`, `LoginRequest`, `UserRead`, `Token`. |
| `__init__.py` | Aggregates schema exports. |

#### `backend/app/crud/` — Data access
| File | Purpose |
|------|---------|
| `vehicle.py` | Create/get/list/count/delete vehicles (auto-assigns coordinates). |
| `sensor_data.py` | Create and query readings (per-vehicle, latest, all). |
| `prediction.py` | Create and query predictions (per-vehicle, latest, all). |
| `maintenance.py` | Create/get/list/update/delete maintenance tasks. |
| `user.py` | Get/create users; lookup by email. |
| `__init__.py` | Exposes the CRUD modules. |

#### `backend/app/services/` — Business logic
| File | Purpose |
|------|---------|
| `prediction_service.py` | Turns features into a risk score/level/recommendation + full diagnostic intelligence. |
| `analytics_service.py` | Component health, RUL, feature contributions, forecast, and failure diagnosis. |
| `anomaly_service.py` | Rule-based out-of-range detection per sensor (runtime-configurable thresholds). |
| `dashboard_service.py` | Aggregates fleet KPIs, health scores, alerts, and risk trends. |
| `settings_service.py` | Loads/persists thresholds and alert config; runtime threshold updates. |
| `email_service.py` | SMTP email sending for high-risk alerts (graceful no-op if unconfigured). |
| `auth_service.py` | Password hashing (PBKDF2), JWT issue/verify, `get_current_user` dependency. |
| `__init__.py` | Exposes the service modules. |

#### `backend/app/routes/` — API
| File | Purpose |
|------|---------|
| `auth.py` | `/api/auth` — register, login (JWT), current user (open router). |
| `vehicles.py` | `/api/vehicles` CRUD endpoints. |
| `sensor_data.py` | `/api/sensor-data` — store readings (auto-prediction + alert), query, CSV import/export. |
| `predictions.py` | `/api/predictions` — stateless predict, persist-per-vehicle, history, CSV export, model info. |
| `dashboard.py` | `/api/dashboard/overview` aggregated KPIs. |
| `analytics.py` | `/api/analytics/vehicles/{id}` — component health, contributions, RUL, forecast. |
| `maintenance.py` | `/api/maintenance` — task CRUD. |
| `settings.py` | `/api/settings` — thresholds, alert config, email test. |
| `__init__.py` | Combines routers; the data API is JWT-protected, auth router is open. |

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
| `tailwind.config.js` | Theme tokens (CSS-variable light/dark), brand/accent, risk colors, animations. |
| `postcss.config.js` | Tailwind/Autoprefixer pipeline. |
| `index.html` | App shell + font preload. |

#### `frontend/src/`
| File | Purpose |
|------|---------|
| `main.jsx` | Mounts React with Router + `AuthProvider`; applies initial theme. |
| `App.jsx` | Auth guard (login gate) + routes inside `Layout`. |
| `index.css` | Theme tokens (light/dark CSS variables) + component classes (`card`, `btn-primary`, `input`). |
| `api/client.js` | Axios instance, JWT interceptors, auth + CSV helpers. |
| `context/auth.jsx` | Auth context provider (token + user, sign in/out). |

#### `frontend/src/components/`
| File | Purpose |
|------|---------|
| `Layout.jsx` | Sidebar + Topbar + animated main content shell (mobile drawer). |
| `Logo.jsx` | Monochrome "AutoCare" mark + wordmark. |
| `Sidebar.jsx` | App nav with strong active state + top user/sign-out block. |
| `Topbar.jsx` | Page title, global search, notifications bell, theme toggle, mobile menu. |
| `KpiCard.jsx` | Executive KPI metric card (large metric, small label, staggered entrance). |
| `HealthGauge.jsx` | Circular SVG health-score gauge (color by score). |
| `RiskLevelBar.jsx` | Gradient Low→High risk bar with marker. |
| `RiskBadge.jsx` | Color-coded Low/Medium/High badge. |
| `Recommendations.jsx` | AI maintenance recommendation list. |
| `Meters.jsx` | Component-health and feature-contribution bar meters. |
| `FleetMap.jsx` | Leaflet/OpenStreetMap map with risk-colored vehicle pins. |
| `Select.jsx` | Custom themed dropdown (replaces native `<select>`). |
| `AlertList.jsx` | Renders active anomaly/risk alerts. |
| `common.jsx` | Shared `Spinner`, `EmptyState`, `SectionTitle`, `formatDate`, `useChartTheme`. |

#### `frontend/src/pages/`
| File | Purpose |
|------|---------|
| `Dashboard.jsx` | Health gauge, risk bar, AI recommendations, live fleet map, live-feed toggle, charts. |
| `Vehicles.jsx` | Add vehicle form + searchable/sortable fleet table (links to detail). |
| `VehicleDetail.jsx` | Health gauge, latest reading, telemetry chart, component health, risk factors, forecast, map, history. |
| `SensorData.jsx` | Record readings (auto-prediction) + table with anomaly filter and CSV import/export. |
| `Maintenance.jsx` | Schedule, track, complete, and delete maintenance tasks. |
| `Compare.jsx` | Side-by-side comparison of up to 3 vehicles (health, RUL, components). |
| `Settings.jsx` | Configure anomaly thresholds and email alert settings. |
| `Predictions.jsx` | Diagnostic workspace — grouped inputs + AI intelligence panel (risk, failure analysis, maintenance planning) + history. |
| `Analytics.jsx` | Risk distribution, model feature importance, telemetry trends, model info. |
| `Reports.jsx` | Fleet summary stats + CSV export hub. |
| `Login.jsx` | Split-screen login/register (looping video + features) with JWT auth. |

---

## API Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (open) |
| POST | `/api/auth/register` · `/api/auth/login` | Auth — returns JWT (open) |
| GET | `/api/auth/me` | Current user |
| POST/GET/DELETE | `/api/vehicles` | Vehicle CRUD |
| POST/GET | `/api/sensor-data` | Record/list readings (auto-prediction) |
| POST | `/api/predictions/predict` | Stateless risk scoring |
| POST | `/api/predictions/vehicles/{id}` | Score & persist for a vehicle |
| GET | `/api/predictions` | Prediction history |
| GET | `/api/predictions/model-info` | Model metrics & metadata |
| GET | `/api/dashboard/overview` | Aggregated dashboard KPIs |
| GET | `/api/analytics/vehicles/{id}` | Component health, contributions, RUL, forecast |
| GET/POST/PATCH/DELETE | `/api/maintenance` | Maintenance task CRUD |
| GET/PUT | `/api/settings/thresholds` | Get / update anomaly thresholds |
| GET/PUT | `/api/settings/alerts` | Get / update email alert config |
| POST | `/api/settings/email/test` | Send a test alert email |
| GET | `/api/sensor-data/export` · `/api/predictions/export` | CSV export |
| POST | `/api/sensor-data/import` | CSV import of readings |

Full details in [docs/API.md](docs/API.md).

---

