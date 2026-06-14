# AutoCare AI — API Documentation

Base URL (dev): `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs` (Swagger UI) · `http://localhost:8000/redoc`

All request and response bodies are JSON. Timestamps are ISO-8601 UTC.

---

## Health

### `GET /api/health`
Returns service health.
```json
{ "status": "healthy" }
```

---

## Vehicles

### `POST /api/vehicles`
Create a vehicle.

Request:
```json
{ "name": "Fleet Truck 02", "model": "Volvo FH16", "type": "truck" }
```
Response `201`:
```json
{ "id": 5, "name": "Fleet Truck 02", "model": "Volvo FH16", "type": "truck", "created_at": "2026-06-14T10:00:00" }
```

### `GET /api/vehicles`
List vehicles with derived health summary.
```json
[
  {
    "id": 1, "name": "Fleet Truck 01", "model": "Volvo FH16", "type": "truck",
    "created_at": "2026-06-14T10:00:00",
    "health_score": 82.5, "latest_risk_level": "Low",
    "sensor_count": 12, "prediction_count": 12
  }
]
```

### `GET /api/vehicles/{vehicle_id}`
Get one vehicle (same shape as above). `404` if not found.

### `DELETE /api/vehicles/{vehicle_id}`
Delete a vehicle and its related data. Returns `204`. `404` if not found.

---

## Sensor Data

### `POST /api/sensor-data`
Store a reading. **A prediction is generated and stored automatically.**

Request:
```json
{ "vehicle_id": 1, "temperature": 95, "battery_voltage": 13.6, "rpm": 2400, "fuel_efficiency": 16, "vibration": 0.9 }
```
Response `201`:
```json
{
  "id": 42, "vehicle_id": 1, "temperature": 95.0, "battery_voltage": 13.6,
  "rpm": 2400.0, "fuel_efficiency": 16.0, "vibration": 0.9,
  "timestamp": "2026-06-14T10:05:00", "anomalies": []
}
```

### `GET /api/sensor-data?vehicle_id={id}&limit={n}`
List readings (most recent first). `vehicle_id` optional. Each reading includes a computed `anomalies` array.

### `GET /api/sensor-data/{reading_id}`
Get one reading. `404` if not found.

---

## Predictions

### `POST /api/predictions/predict`
Stateless scoring — does not touch the database.

Request:
```json
{ "temperature": 130, "battery_voltage": 11.5, "rpm": 5000, "fuel_efficiency": 7, "vibration": 3.5 }
```
Response:
```json
{
  "risk_score": 98.7, "risk_level": "High", "failure_probability": 0.987,
  "recommendation": "Critical failure risk detected. Service the vehicle immediately...",
  "anomalies": ["Engine temperature above normal (130.00 > 105)", "Battery voltage below normal (11.50 < 12.4)"]
}
```

### `POST /api/predictions/vehicles/{vehicle_id}`
Score **and persist** a prediction for a vehicle. Body = same as `/predict`. Returns the stored `PredictionRead`. `404` if vehicle not found.

### `GET /api/predictions?vehicle_id={id}&limit={n}`
List stored predictions (most recent first). `vehicle_id` optional.

### `GET /api/predictions/model-info`
Model metadata and metrics.
```json
{
  "loaded": true,
  "meta": {
    "features": ["temperature","battery_voltage","rpm","fuel_efficiency","vibration"],
    "accuracy": 0.9808, "roc_auc": 0.9974, "n_samples": 6000,
    "feature_importances": { "temperature": 0.31, "vibration": 0.22, "...": 0 },
    "thresholds": { "low": 0.33, "medium": 0.66 },
    "source": "model"
  }
}
```

---

## Dashboard

### `GET /api/dashboard/overview`
Aggregated KPIs for the dashboard.
```json
{
  "total_vehicles": 4,
  "average_health_score": 78.5,
  "active_alerts_count": 2,
  "total_predictions": 48,
  "risk_distribution": { "Low": 2, "Medium": 1, "High": 1 },
  "active_alerts": [ { "vehicle_id": 3, "vehicle_name": "City Bus 12", "risk_level": "High", "anomalies": ["..."], "timestamp": "..." } ],
  "risk_trend": [ { "id": 1, "vehicle_id": 1, "risk_score": 12.3, "risk_level": "Low", "created_at": "..." } ]
}
```

---

## Error Format
Errors follow FastAPI's convention:
```json
{ "detail": "Vehicle not found" }
```
| Code | Meaning |
|------|---------|
| 200 / 201 / 204 | Success |
| 404 | Resource not found |
| 422 | Validation error (out-of-range or missing fields) |
| 500 | Internal server error |

Input ranges enforced by validation: temperature −40…200, battery_voltage 0…20, rpm 0…10000, fuel_efficiency 0…60, vibration 0…20.
