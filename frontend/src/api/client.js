import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL });

export const getOverview = () => api.get("/api/dashboard/overview").then((r) => r.data);

export const listVehicles = () => api.get("/api/vehicles").then((r) => r.data);
export const getVehicle = (id) => api.get(`/api/vehicles/${id}`).then((r) => r.data);
export const createVehicle = (payload) => api.post("/api/vehicles", payload).then((r) => r.data);
export const deleteVehicle = (id) => api.delete(`/api/vehicles/${id}`);

export const listSensorData = (vehicleId) =>
  api
    .get("/api/sensor-data", { params: vehicleId ? { vehicle_id: vehicleId } : {} })
    .then((r) => r.data);
export const createSensorData = (payload) =>
  api.post("/api/sensor-data", payload).then((r) => r.data);

export const listPredictions = (vehicleId) =>
  api
    .get("/api/predictions", { params: vehicleId ? { vehicle_id: vehicleId } : {} })
    .then((r) => r.data);
export const runPrediction = (payload) =>
  api.post("/api/predictions/predict", payload).then((r) => r.data);
export const predictForVehicle = (id, payload) =>
  api.post(`/api/predictions/vehicles/${id}`, payload).then((r) => r.data);
export const getModelInfo = () => api.get("/api/predictions/model-info").then((r) => r.data);

export const getVehicleAnalytics = (id) =>
  api.get(`/api/analytics/vehicles/${id}`).then((r) => r.data);

export const listMaintenance = (params = {}) =>
  api.get("/api/maintenance", { params }).then((r) => r.data);
export const createMaintenance = (payload) =>
  api.post("/api/maintenance", payload).then((r) => r.data);
export const updateMaintenance = (id, payload) =>
  api.patch(`/api/maintenance/${id}`, payload).then((r) => r.data);
export const deleteMaintenance = (id) => api.delete(`/api/maintenance/${id}`);

export const getThresholds = () => api.get("/api/settings/thresholds").then((r) => r.data);
export const updateThresholds = (thresholds) =>
  api.put("/api/settings/thresholds", { thresholds }).then((r) => r.data);
export const resetThresholds = () =>
  api.post("/api/settings/thresholds/reset").then((r) => r.data);

export const getAlertConfig = () => api.get("/api/settings/alerts").then((r) => r.data);
export const updateAlertConfig = (payload) =>
  api.put("/api/settings/alerts", payload).then((r) => r.data);
export const getEmailStatus = () => api.get("/api/settings/email/status").then((r) => r.data);
export const sendTestEmail = (recipient) =>
  api.post("/api/settings/email/test", { recipient }).then((r) => r.data);

export const importSensorCsv = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/sensor-data/import", form).then((r) => r.data);
};
export const sensorExportUrl = (vehicleId) =>
  `${baseURL}/api/sensor-data/export${vehicleId ? `?vehicle_id=${vehicleId}` : ""}`;
export const predictionExportUrl = (vehicleId) =>
  `${baseURL}/api/predictions/export${vehicleId ? `?vehicle_id=${vehicleId}` : ""}`;

export default api;
