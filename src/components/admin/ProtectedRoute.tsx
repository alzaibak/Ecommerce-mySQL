import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth(); // ✅ only use AuthContext
  const location = useLocation();

  const isLoginPage = location.pathname === '/admin/login';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const isAdmin = user?.isAdmin;

  // If not admin, redirect to admin login
  if (!isAdmin) {
    if (!isLoginPage) return <Navigate to="/admin/login" replace />;
    return null;
  }

  // If already admin and on login page, redirect to dashboard
  if (isAdmin && isLoginPage) {
    return <Navigate to="/admin" replace />;
  }

  // Admin granted access
  return children;
};

export default ProtectedRoute;
