import { api } from "./api";

const unwrap = (data) => data.results || data;

export const fetchTasks = (params = {}) => api.get("/tasks/", { params }).then((res) => unwrap(res.data));
export const createTask = (payload) => api.post("/tasks/", payload).then((res) => res.data);
export const updateTask = (id, payload) => api.patch(`/tasks/${id}/`, payload).then((res) => res.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}/`);
export const fetchDashboard = () => api.get("/tasks/dashboard/").then((res) => res.data);
