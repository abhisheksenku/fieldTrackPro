import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Auth from "./components/Auth";

import ProtectedRoute from "./components/ProtectedRoute";

import ConsentGate from "./components/ConsentGate";

import Navbar from "./components/Navbar";

import AdminDashboard from "./components/AdminDashboard";

import UserDashboard from "./components/UserDashboard";

import Attendance from "./components/Attendance";

import UserManagement from "./components/UserManagement";

import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* GLOBAL TOASTS */}
        <Toaster position="top-right" reverseOrder={false} />

        {/* NAVBAR */}
        <Navbar />

        <Routes>
          {/* PUBLIC ROUTE */}
          <Route path="/" element={<Auth />} />

          {/* ---------------- ADMIN ---------------- */}

          <Route
            path="/admin"
            element={
              <ConsentGate>
                <ProtectedRoute role="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              </ConsentGate>
            }
          />

          <Route
            path="/admin/logs"
            element={
              <ConsentGate>
                <ProtectedRoute role="Admin">
                  <Attendance />
                </ProtectedRoute>
              </ConsentGate>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ConsentGate>
                <ProtectedRoute role="Admin">
                  <AnalyticsDashboard />
                </ProtectedRoute>
              </ConsentGate>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ConsentGate>
                <ProtectedRoute role="Admin">
                  <UserManagement />
                </ProtectedRoute>
              </ConsentGate>
            }
          />

          {/* ---------------- EDITOR ---------------- */}

          <Route
            path="/editor"
            element={
              <ConsentGate>
                <ProtectedRoute role="Editor">
                  <AnalyticsDashboard />
                </ProtectedRoute>
              </ConsentGate>
            }
          />

          {/* ---------------- USER ---------------- */}

          <Route
            path="/user"
            element={
              <ConsentGate>
                <ProtectedRoute role="User">
                  <UserDashboard />
                </ProtectedRoute>
              </ConsentGate>
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
