import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Package, 
  LogOut, 
  Mail, 
  Loader2,
  ShoppingBag,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/userSlice';
import api from '@/lib/api';

interface Order {
  _id: string;
  userId: string;
  products: Array<{
    productId: string;
    quantity: number;
    title?: string;
    img?: string;
    price?: number;
  }>;
  amount: number;
  address: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  processing: 'bg-blue-500/10 text-blue-600',
  shipped: 'bg-purple-500/10 text-purple-600',
  delivered: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-red-500/10 text-red-600',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  processing: 'En cours',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await api.get(`/orders/user/${currentUser.userInfo._id}`);
        setOrders(response);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Mon <span className="text-gradient">Profil</span>
          </h1>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-shadow sticky top-24">
              <CardContent className="pt-6">
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">
                    {currentUser.userInfo.firstname} {currentUser.userInfo.lastname}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {currentUser.userInfo.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-accent">{orders.length}</p>
                    <p className="text-xs text-muted-foreground">Commandes</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-accent">
                      {orders.filter(o => o.status === 'delivered').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Livrées</p>
                  </div>
                </div>

                {/* Logout Button */}
                <Button 
                  variant="outline" 
                  className="w-full rounded-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="orders" className="gap-2">
                  <Package className="h-4 w-4" />
                  Mes commandes
                </TabsTrigger>
                <TabsTrigger value="info" className="gap-2">
                  <User className="h-4 w-4" />
                  Informations
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  </div>
                ) : orders.length === 0 ? (
                  <Card className="card-shadow">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <ShoppingBag className="h-16 w-16 text-accent mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Aucune commande</h3>
                      <p className="text-muted-foreground mb-6">
                        Vous n'avez pas encore passé de commande
                      </p>
                      <Button 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
                        onClick={() => navigate('/products')}
                      >
                        Découvrir nos produits
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order._id} className="card-shadow overflow-hidden">
                        <CardHeader className="bg-secondary/30 py-4">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                              <Badge className={statusColors[order.status]}>
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                            <p className="font-bold text-lg">
                              €{order.amount.toFixed(2)}
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="py-4">
                          <div className="space-y-3">
                            {order.products.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20"
                              >
                                {item.img && (
                                  <img 
                                    src={item.img} 
                                    alt={item.title || 'Product'}
                                    className="w-16 h-16 object-contain rounded-lg bg-background"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">
                                    {item.title || `Produit #${item.productId}`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Quantité: {item.quantity}
                                  </p>
                                </div>
                                {item.price && (
                                  <p className="font-medium">
                                    €{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {order.address && (
                            <div className="flex items-start gap-2 mt-4 pt-4 border-t border-border">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm text-muted-foreground">{order.address}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Info Tab */}
              <TabsContent value="info">
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                        <p className="p-3 rounded-lg bg-secondary/50 text-foreground">
                          {currentUser.userInfo.firstname}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nom</label>
                        <p className="p-3 rounded-lg bg-secondary/50 text-foreground">
                          {currentUser.userInfo.lastname}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="p-3 rounded-lg bg-secondary/50 text-foreground">
                        {currentUser.userInfo.email}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProfilePage;