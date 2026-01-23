// Quick fix for ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { currentUser, isFetching } = useAppSelector((state) => state.user);
  const [shouldCheck, setShouldCheck] = useState(false);

  // Only start checking after a brief delay to avoid race conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldCheck(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Show loading while auth state is initializing
  if (isFetching || !shouldCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  // Check if we're already on the login page to prevent loops
  const isLoginPage = location.pathname === '/admin/login';

  // Check if user is authenticated and is admin
  const isAdmin = currentUser?.userInfo?.isAdmin;

  // If not authenticated or not admin
  if (!isAdmin) {
    // Clear any admin tokens
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } catch {}
    }
    
    // Only redirect if we're not already on the login page
    if (!isLoginPage) {
      return <Navigate to="/admin/login" replace />;
    }
    
    // If we're already on login page but not admin, just show null
    // The login page will handle the UI
    return null;
  }

  // If user is admin AND we're on login page, redirect to admin dashboard
  if (isAdmin && isLoginPage) {
    return <Navigate to="/admin" replace />;
  }

  // Admin confirmed - render children
  return children;
};

export default ProtectedRoute;