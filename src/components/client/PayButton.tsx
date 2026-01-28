// components/client/PayButton.tsx
import { useState } from 'react';
import { CreditCard, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stripeAPI } from '@/lib/api';
import { useAppSelector } from '@/redux/hooks';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: number;
  variantKey?: string;
  title: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  img: string;
  attributes?: Record<string, string>;
}

interface PayButtonProps {
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  disabled?: boolean;
}

const PayButton = ({ cartItems, subtotal, shipping, total, disabled }: PayButtonProps) => {
  const [loading, setLoading] = useState(false);
  const user = useAppSelector(state => state.user.currentUser);
  const navigate = useNavigate();

  const handlePayment = async () => {
    // Check if user is logged in
    if (!user) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    setLoading(true);
    try {
      const data = await stripeAPI.create({ 
        cartItems, 
        total: subtotal, // Send subtotal (products only)
        email: user.userInfo.email,
        userId: user.userInfo._id || user.userInfo._id,
      });

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error('Stripe session URL missing', data);
        alert('Erreur: Impossible de créer la session de paiement');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const message = error?.message || 'Erreur lors de la création du paiement. Veuillez réessayer.';
      alert(message);
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