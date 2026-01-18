import { Phone, Truck, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/userSlice';

const TopBar = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="bg-accent text-accent-foreground py-2.5 px-4">
      <div className="container mx-auto flex flex-wrap items-center justify-center text-sm font-medium">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          <span>Livraison gratuite pour les commandes de plus de 50€</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
