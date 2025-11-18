import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth/useAuth.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
