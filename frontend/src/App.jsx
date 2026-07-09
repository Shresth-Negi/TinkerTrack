import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./utils/AuthContext";
import Login from "./pages/Login";

// Placeholder pages (you'll replace these on Day 6)
function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: "48px", fontFamily: "Inter, sans-serif" }}>
      <h1>Welcome, {user?.name}!</h1>
      <p style={{ color: "#666" }}>Dashboard coming on Day 6.</p>
      <button
        onClick={logout}
        style={{
          marginTop: "16px",
          padding: "8px 16px",
          background: "#0f0f0f",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

// Protected route - redirects to login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: "48px" }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

// Public route - redirects to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: "48px" }}>Loading...</div>;
  return !user ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
