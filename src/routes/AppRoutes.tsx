import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Wrapper for protected routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin-only route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user || user.perfil !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export { ProtectedRoute, AdminRoute };