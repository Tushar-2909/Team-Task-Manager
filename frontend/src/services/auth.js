import { api } from "./api";

export const login = (payload) => api.post("/auth/login/", payload).then((res) => res.data);
export const register = (payload) => api.post("/auth/register/", payload).then((res) => res.data);
