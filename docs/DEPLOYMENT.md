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
python -m uvicorn app.main:app --reload --port 8000
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

## 3. Public Website — Render (backend) + Vercel (frontend)

This is the recommended path to put AutoCare AI online. The backend runs as a Docker web service on **Render** with managed **Postgres**; the frontend is a static build on **Vercel**.

### Backend → Render
The repo includes [`render.yaml`](../render.yaml) (a Render Blueprint) and [`Dockerfile.render`](../Dockerfile.render), which builds the API **and trains/bakes the ML model into the image** (so no model file needs committing).

1. Push the repo to GitHub.
2. In Render → **New → Blueprint**, point it at the repo. It provisions:
   - `autocare-api` web service (Docker) — health-checked at `/api/health`
   - `autocare-db` Postgres (free) — wired to the API via `DATABASE_URL`
3. Set these env vars on the service (Blueprint marks them as required):
   - `DEFAULT_ADMIN_PASSWORD` — your admin password (replaces the demo `admin123`)
   - `CORS_ORIGINS` — your Vercel URL, e.g. `https://autocare.vercel.app`
   - `SECRET_KEY` is auto-generated; `DATABASE_URL` is injected from the DB.
   - (Optional) SMTP/MAIL vars for email alerts.
4. Deploy. Note the public URL, e.g. `https://autocare-api.onrender.com`.

> The code auto-normalizes Render's `postgres://` URL and enables `pool_pre_ping`. No SQLite migration runs on Postgres — tables are created fresh on first boot (admin + sample data seeded automatically).

### Frontend → Vercel
The repo includes [`frontend/vercel.json`](../frontend/vercel.json) (Vite framework + SPA rewrites).

1. In Vercel → **New Project**, import the repo and set **Root Directory = `frontend`**.
2. Add an env var: `VITE_API_URL = https://autocare-api.onrender.com` (your Render URL).
3. Deploy. Vercel runs `npm run build` and serves `dist/` with SPA routing.
4. Copy the Vercel domain back into the Render service's `CORS_ORIGINS` and redeploy the API.

### Checklist
- [ ] `DEFAULT_ADMIN_PASSWORD` changed from the demo value
- [ ] `CORS_ORIGINS` = exact Vercel origin (no trailing slash)
- [ ] `VITE_API_URL` = exact Render origin
- [ ] First load shows the login; `admin@autocare.ai` + your password works
- [ ] (Free Render tier sleeps when idle — first request after idle is slow; that's expected)

---

## 4. Edge / Single-Host Production

The whole stack is designed to run on one machine (a laptop or an in-vehicle gateway).

```bash
# Build static frontend
cd frontend && npm install && npm run build   # outputs dist/

# Serve API with multiple workers
cd ../backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```
Serve `frontend/dist` from any static server (nginx, Caddy) and proxy `/api` to the backend.

### Environment Variables (backend)
| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `sqlite:///./autocare.db` | DB connection string |
| `MODEL_PATH` | `../ml/models/failure_model.joblib` | Trained model artifact |
| `MODEL_META_PATH` | `../ml/models/model_meta.json` | Model metadata |
| `CORS_ORIGINS` | localhost origins | Comma-separated allowed origins |
| `SMTP_HOST` / `MAIL_SERVER` | empty | SMTP server for email alerts (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` / `MAIL_PORT` | `587` | SMTP port |
| `SMTP_USER` / `MAIL_USERNAME` | empty | SMTP username |
| `SMTP_PASSWORD` / `MAIL_PASSWORD` | empty | SMTP password / app password |
| `SMTP_FROM` / `MAIL_FROM` | `alerts@autocare.ai` | From address |
| `SMTP_USE_TLS` / `MAIL_STARTTLS` | `true` | Use STARTTLS |

Email alerts are optional; the app runs fully without SMTP. Both `SMTP_*` and `MAIL_*` variable names are accepted. Copy `backend/.env.example` → `backend/.env` to customize.

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
- Use `python -m uvicorn ...` (not bare `uvicorn`) so the server runs under the same interpreter where you installed the dependencies — this avoids `ModuleNotFoundError` when multiple Python versions are on PATH.
- If the model file is absent, the API automatically falls back to a deterministic heuristic scorer, so the app stays functional.
- SQLite is single-file and zero-config; for higher write concurrency, point `DATABASE_URL` at PostgreSQL — no code changes required (SQLAlchemy handles it).
