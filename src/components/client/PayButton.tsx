import { useState } from 'react';
import { CreditCard, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface CartItem {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  img: string;
}

interface PayButtonProps {
  cartItems: CartItem[];
  disabled?: boolean;
}

const PayButton = ({ cartItems, disabled }: PayButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await api.post('/stripe/create-checkout-session', {
        cartItems,
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
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
