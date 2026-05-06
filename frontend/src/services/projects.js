import { api } from "./api";

const unwrap = (data) => data.results || data;

export const fetchProjects = () => api.get("/projects/").then((res) => unwrap(res.data));
export const createProject = (payload) => api.post("/projects/", payload).then((res) => res.data);
export const updateProject = (id, payload) => api.patch(`/projects/${id}/`, payload).then((res) => res.data);
export const deleteProject = (id) => api.delete(`/projects/${id}/`);
export const addMember = (projectId, userId) => api.post(`/projects/${projectId}/members/`, { user_id: userId });
export const removeMember = (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}/`);
