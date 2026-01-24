import { ReactNode, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login', { replace: true });
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-50 bg-white border-r border-border flex flex-col">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold">Admin Dashboard</h2>
          {user && <p className="text-sm text-muted-foreground">{user.firstname}</p>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10">
            <Home className="w-4 h-4" /> Tableau de bord
          </Link>
          <Link to="/admin/orders" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10">
            <Settings className="w-4 h-4" /> Orders
          </Link>
          <Link to="/admin/products" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10">
            <Settings className="w-4 h-4" /> Produits
          </Link>
          <Link to="/admin/users" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10">
            <Users className="w-4 h-4" /> Utilisateurs
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-accent/10">
            <Settings className="w-4 h-4" /> Categories
          </Link>
        </nav>

        <div className="px-4 py-6 border-t border-border">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={logout} // ✅ uses AuthContext logout
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
