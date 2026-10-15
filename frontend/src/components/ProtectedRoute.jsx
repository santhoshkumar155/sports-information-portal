import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/api.js';

// Redirects to /login when logged out, and to / when a non-admin opens an admin page.
// The backend enforces the same rules; this only improves the experience.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
