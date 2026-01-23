// components/admin/DashboardLayout.tsx
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Settings } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout as logoutRedux } from '@/redux/userSlice';
import { Button } from '@/components/ui/button';


interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.currentUser?.userInfo);

const handleLogout = () => {
    // Clear user state
    dispatch(logoutRedux());

    // Safely remove localStorage items
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } catch (err) {
        console.warn('Cannot access localStorage:', err);
      }
    }

    // Navigate to login page
    navigate('/admin/login');
  };


  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-50 bg-white border-r border-border flex flex-col">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          {user && <p className="text-sm text-muted-foreground">{user.firstname}</p>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10"
          >
            <Home className="w-4 h-4" /> Tableau de bord
          </Link>
           <Link
            to="/admin/orders"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10"
          >
            <Settings className="w-4 h-4" /> Orders
          </Link>
          <Link
            to="/admin/products"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10"
          >
            <Settings className="w-4 h-4" /> Produits
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10"
          >
            <Users className="w-4 h-4" /> Utilisateurs
          </Link>
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10"
          >
            <Settings className="w-4 h-4" /> Catergories
          </Link>
          
        </nav>

        <div className="px-4 py-6 border-t border-border">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
