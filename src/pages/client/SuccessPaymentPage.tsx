import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface OrderDetails {
  customer_name?: string;
  amount_total?: number;
  shipping_details?: any;
  line_items?: any[];
}

const SuccessPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/stripe/checkout-session/${sessionId}`);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <ClientLayout>
        <section className="py-20 px-4 text-center">
          <p className="text-lg text-muted-foreground">Chargement de votre commande...</p>
        </section>
      </ClientLayout>
    );
  }

  if (!order) {
    return (
      <ClientLayout>
        <section className="py-20 px-4 text-center">
          <p className="text-lg text-destructive">Impossible de récupérer les détails de la commande.</p>
          <Link to="/products">
            <Button className="mt-6 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux produits
            </Button>
          </Link>
        </section>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-accent/10 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-16 w-16 text-accent" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Merci pour votre commande !</h1>
          <p className="text-muted-foreground mb-6">
            Votre paiement a été effectué avec succès.
          </p>

          {order.line_items && (
            <div className="bg-card border border-border rounded-xl p-6 text-left mb-6">
              <h2 className="text-lg font-semibold mb-4">Récapitulatif de votre commande</h2>
              <ul className="space-y-3">
                {order.line_items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>€{(item.amount_total / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <hr className="my-4 border-border" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>€{(order.amount_total / 100).toFixed(2)}</span>
              </div>
            </div>
          )}

          {order.shipping_details && (
            <div className="bg-card border border-border rounded-xl p-6 text-left mb-6">
              <h2 className="text-lg font-semibold mb-4">Adresse de livraison</h2>
              <p>{order.shipping_details.name}</p>
              <p>{order.shipping_details.address.line1}</p>
              <p>{order.shipping_details.address.postal_code} {order.shipping_details.address.city}</p>
              <p>{order.shipping_details.address.country}</p>
            </div>
          )}

          <Link to="/products">
            <Button className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuer vos achats
            </Button>
          </Link>
        </div>
      </section>
    </ClientLayout>
  );
};

export default SuccessPaymentPage;
