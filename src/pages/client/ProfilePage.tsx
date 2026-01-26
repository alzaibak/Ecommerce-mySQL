import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ordersAPI, productsAPI } from '@/lib/api';
import { 
  User, Package, LogOut, Mail, Loader2, ShoppingBag, Calendar,
  MapPin, CheckCircle, Clock, Truck, AlertCircle, Euro, Tag, Phone,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/userSlice';

interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  products: string[];
  amount: number; // Total de la commande (produits + livraison) depuis la BD
  shipping: number; // Frais de livraison depuis la BD
  address: {
    name?: string;
    email?: string;
    phone?: string | null;
    address?: string | {
      city: string; line1: string; line2?: string; 
      state: string; country: string; postal_code: string;
    };
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'livred' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  title: string;
  img?: string;
  price: number;
  description?: string;
  category?: string;
}

interface OrderProduct {
  product: Product;
  quantity: number;
}

interface OrderWithDetails extends Order {
  productDetails: OrderProduct[];
}

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: 'Confirmé', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  processing: { label: 'En cours', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <Clock className="h-4 w-4" /> },
  shipped: { label: 'Expédié', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: <Truck className="h-4 w-4" /> },
  livred: { label: 'Livré', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  delivered: { label: 'Livré', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Annulé', color: 'bg-red-500/10 text-red-600 border-red-200', icon: <AlertCircle className="h-4 w-4" /> },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const ordersData = await ordersAPI.getMyOrders();
        console.log("Orders data from API:", ordersData);
        
        const productsData = await productsAPI.getAll();
        
        const ordersWithDetails: OrderWithDetails[] = await Promise.all(
          ordersData.map(async (order: Order) => {
            const productDetails = await Promise.all(
              order.products.map(async (productId) => {
                try {
                  const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
                  let product = productsData.find((p: Product) => 
                    p.id === id || p.id.toString() === productId.toString()
                  );
                  
                  if (!product) {
                    try {
                      product = await productsAPI.getById(id);
                    } catch (err) {
                      console.warn(`Product ${productId} not found`);
                    }
                  }
                  
                  return {
                    product: product || {
                      id: id,
                      title: `Produit #${productId}`,
                      price: 0,
                      description: 'Produit non disponible',
                      img: undefined
                    },
                    quantity: 1
                  };
                } catch (error) {
                  return {
                    product: {
                      id: typeof productId === 'string' ? parseInt(productId, 10) : productId,
                      title: `Produit #${productId}`,
                      price: 0,
                      description: 'Erreur de chargement'
                    },
                    quantity: 1
                  };
                }
              })
            );
            
            // Utiliser directement les valeurs de la base de données
            // Ne pas recalculer, juste s'assurer que ce sont des nombres
            return { 
              ...order, 
              productDetails,
              amount: typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount,
              shipping: typeof order.shipping === 'string' ? parseFloat(order.shipping) : order.shipping
            };
          })
        );

        ordersWithDetails.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(ordersWithDetails);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.status === 401 || err.status === 403) {
          dispatch(logout());
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAddress = (address: Order['address']) => {
    if (typeof address.address === 'string') return address.address;
    
    if (address.address && typeof address.address === 'object') {
      const addr = address.address;
      const lines = [];
      if (addr.line1) lines.push(addr.line1);
      if (addr.line2) lines.push(addr.line2);
      if (addr.city || addr.state || addr.postal_code) {
        const cityParts = [];
        if (addr.city) cityParts.push(addr.city);
        if (addr.state) cityParts.push(addr.state);
        if (addr.postal_code) cityParts.push(addr.postal_code);
        if (cityParts.length > 0) lines.push(cityParts.join(' '));
      }
      if (addr.country) lines.push(addr.country);
      return lines.join(', ');
    }
    
    return 'Adresse non disponible';
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  // Calculer le sous-total des produits en soustrayant les frais de livraison du total
  const calculateSubtotalFromStoredValues = (amount: number, shipping: number) => {
    return amount - shipping;
  };

  if (!currentUser) return null;

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <div className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
              Mon <span className="text-gradient">Espace</span>
            </h1>
            <p className="text-muted-foreground">Gérez vos commandes et informations personnelles</p>
            <div className="w-24 h-1 bg-gradient-to-r from-accent to-primary mx-auto rounded-full mt-4" />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <Card className="card-shadow border-border/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary p-1 mb-4">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <User className="h-10 w-10 text-accent" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {currentUser.userInfo.firstname} {currentUser.userInfo.lastname}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {currentUser.userInfo.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-3 rounded-lg bg-accent/5 border border-border/50">
                      <p className="text-xl font-bold text-foreground">{orders.length}</p>
                      <p className="text-xs text-muted-foreground">Commandes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-500/5 border border-border/50">
                      <p className="text-xl font-bold text-foreground">
                        {orders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}€
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full rounded-lg hover:border-accent hover:text-accent transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50 p-1 rounded-lg border border-border">
                  <TabsTrigger 
                    value="orders" 
                    className="gap-2 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Mes commandes</span>
                    <span className="sm:hidden">Commandes</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="info" 
                    className="gap-2 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Mes informations</span>
                    <span className="sm:hidden">Infos</span>
                  </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders">
                  {loading ? (
                    <Card className="card-shadow">
                      <CardContent className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-accent" />
                      </CardContent>
                    </Card>
                  ) : orders.length === 0 ? (
                    <Card className="card-shadow">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <ShoppingBag className="h-12 w-12 text-accent mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Aucune commande</h3>
                        <p className="text-muted-foreground mb-6 text-center">Vous n'avez pas encore passé de commande</p>
                        <Button 
                          className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white shadow-md transition-all"
                          onClick={() => navigate('/products')}
                        >
                          Découvrir nos produits
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const status = statusConfig[order.status] || statusConfig.pending;
                        const isExpanded = expandedOrders.includes(order.id);
                        
                        // Utiliser directement les valeurs stockées dans la base de données
                        const shipping = order.shipping || 0;
                        const total = order.amount;
                        const subtotal = calculateSubtotalFromStoredValues(total, shipping);
                        
                        return (
                          <Card key={order.id} className="card-shadow overflow-hidden hover:shadow-md transition-shadow border-border">
                            {/* Header de la commande (toujours visible) */}
                            <div 
                              className="p-4 cursor-pointer hover:bg-secondary/10 transition-colors border-b border-border/50"
                              onClick={() => toggleOrderExpand(order.id)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(order.createdAt)}
                                  </div>
                                  <Badge className={`${status.color} border flex items-center gap-1 px-3 py-1`}>
                                    {status.icon}
                                    {status.label}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">#{order.orderNumber}</span>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-bold text-lg text-accent">
                                      {total.toFixed(2)}€
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {order.productDetails.length} article{order.productDetails.length > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-accent/10 hover:text-accent transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Contenu détaillé (visible uniquement si expandé) */}
                            {isExpanded && (
                              <CardContent className="pt-0 pb-4">
                                <div className="space-y-4 mt-4">
                                  {/* Liste des produits */}
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">Articles commandés</h4>
                                    <div className="space-y-3">
                                      {order.productDetails.map((item, idx) => (
                                        <div
                                          key={`${item.product.id}-${idx}`}
                                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg bg-secondary/10 border border-border/50 hover:bg-secondary/20 transition-colors"
                                        >
                                          <div 
                                            className="relative cursor-pointer flex-shrink-0 group"
                                            onClick={() => handleProductClick(item.product.id)}
                                          >
                                            {item.product.img ? (
                                              <img
                                                src={item.product.img}
                                                alt={item.product.title}
                                                className="w-16 h-16 object-cover rounded-lg border border-border bg-background group-hover:opacity-90 group-hover:border-accent/50 transition-all"
                                              />
                                            ) : (
                                              <div className="w-16 h-16 rounded-lg bg-accent/10 border border-border flex items-center justify-center group-hover:bg-accent/20 group-hover:border-accent/50 transition-colors">
                                                <ShoppingBag className="h-8 w-8 text-accent/50 group-hover:text-accent/70" />
                                              </div>
                                            )}
                                            <div className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                                              {item.quantity}
                                            </div>
                                          </div>
                                          
                                          <div className="flex-1 min-w-0">
                                            <h4 
                                              className="font-medium text-foreground mb-1 cursor-pointer hover:text-accent transition-colors group"
                                              onClick={() => handleProductClick(item.product.id)}
                                            >
                                              {item.product.title}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                              {item.product.category && (
                                                <Badge variant="outline" className="text-xs border-border">
                                                  <Tag className="h-3 w-3 mr-1" />
                                                  {item.product.category}
                                                </Badge>
                                              )}
                                              <span className="text-sm text-muted-foreground">
                                                Quantité: {item.quantity}
                                              </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                              {item.product.description || 'Description non disponible'}
                                            </p>
                                          </div>
                                          
                                          <div className="text-right">
                                            <p className="font-semibold text-foreground">
                                              Prix actuel: {item.product.price.toFixed(2)}€
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              (Prix au moment de la commande peut différer)
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Adresse et résumé côte à côte */}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {/* Adresse */}
                                    {order.address && (
                                      <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-200/30">
                                        <div className="flex items-start gap-3">
                                          <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground mb-2">Adresse de livraison</p>
                                            <div className="text-sm text-muted-foreground space-y-1">
                                              {order.address.name && (
                                                <p className="font-medium text-foreground">{order.address.name}</p>
                                              )}
                                              <p>{formatAddress(order.address)}</p>
                                              {order.address.email && (
                                                <p className="flex items-center gap-1">
                                                  <Mail className="h-3 w-3" />
                                                  {order.address.email}
                                                </p>
                                              )}
                                              {order.address.phone && (
                                                <p className="flex items-center gap-1">
                                                  <Phone className="h-3 w-3" />
                                                  {order.address.phone}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Résumé de la commande (utilisant les valeurs stockées) */}
                                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                                      <p className="text-sm font-medium text-foreground mb-3">Résumé de la commande</p>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Sous-total produits</span>
                                          <span>{subtotal.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Frais de livraison</span>
                                          <span>{shipping.toFixed(2)}€</span>
                                        </div>
                                        <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                                          <span>Total payé</span>
                                          <span className="text-accent">{total.toFixed(2)}€</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* Info Tab */}
                <TabsContent value="info">
                  <Card className="card-shadow border-border">
                    <CardHeader className="bg-gradient-to-r from-accent/5 to-primary/5 border-b border-border">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <User className="h-5 w-5 text-accent" />
                        Informations personnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            {currentUser.userInfo.firstname}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Nom</label>
                          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                            {currentUser.userInfo.lastname}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                          {currentUser.userInfo.email}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-3">
                          Pour modifier vos informations, contactez notre service client.
                        </p>
                        <Button 
                          variant="outline" 
                          className="rounded-lg border-border hover:border-accent hover:text-accent transition-colors"
                          onClick={() => navigate('/contact')}
                        >
                          Contacter le support
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProfilePage;