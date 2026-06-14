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

export default api;
