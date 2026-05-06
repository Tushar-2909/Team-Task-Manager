import axios from "axios";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refresh = useAuthStore.getState().refresh;
    if (error.response?.status === 401 && refresh && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, { refresh });
        useAuthStore.getState().setAuth({ ...useAuthStore.getState(), access: data.access });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        toast.error("Session expired. Please sign in again.");
      }
    }
    return Promise.reject(error);
  },
);
