import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { routeForRole } from "../utils/format";

export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && String(user?.role).toUpperCase() !== role) {
    return <Navigate to={routeForRole(user?.role)} replace />;
  }

  return <Outlet />;
}

