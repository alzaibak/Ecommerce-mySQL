import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import ClientLayout from '@/components/client/ClientLayout';
import PayButton from '@/components/client/PayButton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { increaseQuantity, decreaseQuantity, removeProduct } from '@/redux/cartSlice';

const CartPage = () => {
  const dispatch = useAppDispatch();
  const { products: cartItems, quantity: cartQuantity, total } = useAppSelector((state) => state.cart);

  const handleIncrease = (item: { _id: string; color?: string; size?: string }) => {
    dispatch(increaseQuantity({ _id: item._id, color: item.color, size: item.size }));
  };

  const handleDecrease = (item: { _id: string; color?: string; size?: string }) => {
    dispatch(decreaseQuantity({ _id: item._id, color: item.color, size: item.size }));
  };

  const handleRemove = (item: { _id: string; color?: string; size?: string; title: string }) => {
    dispatch(removeProduct({ _id: item._id, color: item.color, size: item.size, title: item.title }));
  };

  const shipping = total > 100 ? 0 : 9.99;
  const grandTotal = total + shipping;

  if (cartItems.length === 0) {
    return (
      <ClientLayout>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-accent/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-accent" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Votre panier est vide
            </h1>
            <p className="text-muted-foreground mb-8">
              Découvrez nos produits et ajoutez-les à votre panier.
            </p>
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
  }

  return (
    <ClientLayout>
      {/* Header */}
      <section className="bg-gradient-primary py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">
            Votre Panier
          </h1>
          <p className="text-primary-foreground/80">
            {cartQuantity} article{cartQuantity > 1 ? 's' : ''} dans votre panier
          </p>
        </div>
      </section>

      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div
                  key={`${item._id}-${item.color}-${item.size}-${index}`}
                  className="bg-card border border-border rounded-xl p-4 flex gap-4 card-shadow"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.size && `Taille: ${item.size}`}
                        {item.size && item.color && ' | '}
                        {item.color && `Couleur: ${item.color}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleDecrease(item)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleIncrease(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(item)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link to="/products" className="inline-flex items-center gap-2 text-accent hover:underline mt-4 font-medium">
                <ArrowLeft className="h-4 w-4" />
                Continuer vos achats
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24 card-shadow">
                <h2 className="text-xl font-bold mb-6">Récapitulatif</h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? 'Gratuite' : `€${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Livraison gratuite à partir de €100
                    </p>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-accent">€{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <PayButton cartItems={cartItems} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ClientLayout>
  );
};

export default CartPage;
