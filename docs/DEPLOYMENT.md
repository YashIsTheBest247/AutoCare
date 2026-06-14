# AutoCare AI — Deployment Guide

Three supported paths: **local development**, **Docker Compose**, and **edge/single-host production**.

---

## 1. Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+

### Step 1 — Train the model (one time)
```bash
cd ml
pip install -r requirements.txt
python generate_dataset.py
python train_model.py
```
This writes `ml/data/sensor_dataset.csv`, `ml/models/failure_model.joblib`, and `ml/models/model_meta.json`.

### Step 2 — Start the backend
```bash
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API → http://localhost:8000 · Docs → http://localhost:8000/docs
On first start the DB is created and seeded with 4 sample vehicles.

### Step 3 — Start the frontend
```bash
cd ../frontend
npm install
npm run dev
```
UI → http://localhost:5173 (Vite proxies `/api` to port 8000).

---

## 2. Docker Compose (recommended)

### Prerequisites
- Docker + Docker Compose
- Train the model first (Step 1 above) so `ml/models/` exists — it is mounted read-only into the backend.

### Run
```bash
docker compose up --build
```
- Frontend → http://localhost:3000
- Backend  → http://localhost:8000
- Nginx in the frontend container proxies `/api` to the backend service.

### Stop
```bash
docker compose down          # keep data
docker compose down -v       # also remove the SQLite volume
```

---

## 3. Edge / Single-Host Production

The whole stack is designed to run on one machine (a laptop or an in-vehicle gateway).

```bash
# Build static frontend
cd frontend && npm install && npm run build   # outputs dist/

# Serve API with multiple workers
cd ../backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```
Serve `frontend/dist` from any static server (nginx, Caddy) and proxy `/api` to the backend.

### Environment Variables (backend)
| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `sqlite:///./autocare.db` | DB connection string |
| `MODEL_PATH` | `../ml/models/failure_model.joblib` | Trained model artifact |
| `MODEL_META_PATH` | `../ml/models/model_meta.json` | Model metadata |
| `CORS_ORIGINS` | localhost origins | Comma-separated allowed origins |

Copy `backend/.env.example` → `backend/.env` to customize.

### Frontend env
| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | empty (same origin) | Override API base URL if backend is on another host |

---

## Health & Verification
```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/dashboard/overview
curl http://localhost:8000/api/predictions/model-info
```

## Notes
- If the model file is absent, the API automatically falls back to a deterministic heuristic scorer, so the app stays functional.
- SQLite is single-file and zero-config; for higher write concurrency, point `DATABASE_URL` at PostgreSQL — no code changes required (SQLAlchemy handles it).
