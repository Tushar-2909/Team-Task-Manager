import { api } from "./api";

const unwrap = (data) => data.results || data;

export const fetchUsers = () => api.get("/auth/users/").then((res) => unwrap(res.data));
