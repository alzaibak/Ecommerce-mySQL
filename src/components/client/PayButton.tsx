// components/client/PayButton.tsx
import { useState } from 'react';
import { CreditCard, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useAppSelector } from '@/redux/hooks';

interface CartItem {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  img: string;
}

interface PayButtonProps {
  cartItems: CartItem[];
  total: number;
  disabled?: boolean;
}

const PayButton = ({ cartItems, total, disabled }: PayButtonProps) => {
  const [loading, setLoading] = useState(false);
  const user = useAppSelector(state => state.user.currentUser);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Pass user email if logged in
      const data = await api.post('/stripe/create-checkout-session', { 
        cartItems, 
        total,
        email: user?.userInfo.email || null,
        userId: user?.userInfo._id,
      });

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('Stripe session URL missing', data);
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayment}
        disabled={loading || disabled || cartItems.length === 0}
        className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-semibold py-6 rounded-xl transition-all duration-300 text-base"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <CreditCard className="h-5 w-5 mr-2" />
        )}
        Passer à la caisse
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Paiement sécurisé par Stripe</span>
      </div>
    </div>
  );
};

export default PayButton;
