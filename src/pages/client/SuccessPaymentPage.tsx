import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowLeft } from "lucide-react";
import ClientLayout from "@/components/client/ClientLayout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/redux/cartSlice";
import { ordersAPI } from "@/lib/api";
import api from "@/lib/api";

interface OrderDetails {
  orderNumber?: string;
  customer_name?: string;
  amount_total?: number;
  shipping_details?: any;
  line_items?: any[];
  paymentIntentId?: string;
}

const SuccessPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [statusMessage, setStatusMessage] = useState("Vérification du paiement...");
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!sessionId) {
      setStatusMessage("Session Stripe introuvable.");
      setLoading(false);
      return;
    }

    const checkOrder = async () => {
      try {
        setLoading(true);
        const session: any = await api.get(`/stripe/checkout-session/${sessionId}`);
        if (!session || !session.payment_intent) {
          setStatusMessage("Impossible de vérifier votre paiement.");
          setLoading(false);
          return;
        }

        const paymentIntent = session.payment_intent;

        // Poll backend until order exists
        let orderFromDb = null;
        for (let i = 0; i < 15; i++) {
          try {
            orderFromDb = await ordersAPI.getByPaymentIntent(paymentIntent);
            if (orderFromDb) break;
          } catch {}
          setStatusMessage("Paiement reçu, création de la commande...");
          await new Promise(res => setTimeout(res, 2000));
        }

        if (!orderFromDb) {
          setStatusMessage("Impossible de confirmer votre commande. Contactez le support.");
          setLoading(false);
          return;
        }

        dispatch(clearCart());
        setOrder({
          ...orderFromDb,
          line_items: session.line_items?.data || [],
          amount_total: session.amount_total,
          shipping_details: session.shipping || null,
        });

      } catch (err: any) {
        console.error("Erreur vérification paiement:", err);
        setStatusMessage(err?.message || "Erreur lors de la vérification du paiement.");
      } finally {
        setLoading(false);
      }
    };

    checkOrder();
  }, [sessionId, dispatch]);

  if (loading) {
    return (
      <ClientLayout>
        <section className="py-20 px-4 text-center">
          <p className="text-lg text-muted-foreground">{statusMessage}</p>
        </section>
      </ClientLayout>
    );
  }

  if (!order) {
    return (
      <ClientLayout>
        <section className="py-20 px-4 text-center">
          <p className="text-lg text-red-500">{statusMessage}</p>
          <Link to="/products">
            <Button className="mt-6 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuer vos achats
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
            Votre paiement a été confirmé et votre commande est en cours de traitement.
          </p>

          <h2 className="text-lg font-semibold mb-4">Numéro de commande : <span className="text-accent">{order.orderNumber}</span></h2>

          {order.line_items && (
            <div className="bg-card border border-border rounded-xl p-6 text-left mb-6">
              <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>
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
