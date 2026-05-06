import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const access = useAuthStore((state) => state.access);
  return access ? <Outlet /> : <Navigate to="/login" replace />;
}
