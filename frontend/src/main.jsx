import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SignupPage } from "./pages/SignupPage";
import { TaskBoardPage } from "./pages/TaskBoardPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="tasks" element={<TaskBoardPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
);
