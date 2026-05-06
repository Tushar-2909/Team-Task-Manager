import { create } from "zustand";

const storageKey = "team-task-manager-auth";

const readStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
};

export const useAuthStore = create((set, get) => ({
  ...readStoredAuth(),
  setAuth: (payload) => {
    localStorage.setItem(storageKey, JSON.stringify(payload));
    set(payload);
  },
  logout: () => {
    localStorage.removeItem(storageKey);
    set({ user: null, access: null, refresh: null });
  },
  isAuthenticated: () => Boolean(get().access),
}));
