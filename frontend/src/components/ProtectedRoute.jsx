import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ==================================================
// 🔥 Standard User Guard
// ==================================================
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a sleek black/orange loading spinner

  if (!user) {
    // Redirect to login, but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// ==================================================
// 🔥 Root Admin Guard
// ==================================================
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  // If not logged in, or not an Admin, kick them back to the dashboard
  if (!user || user.role !== "Root Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
