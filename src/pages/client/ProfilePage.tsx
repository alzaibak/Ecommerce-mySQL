// ProfilePage.tsx - Updated interfaces and data handling
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ordersAPI } from '@/lib/api';
import { 
  User, Package, LogOut, Mail, Loader2, ShoppingBag, Calendar,
  MapPin, CheckCircle, Clock, Truck, AlertCircle, Euro, Tag, Phone,
  ChevronDown, ChevronUp, Palette, Ruler
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/userSlice';

// Updated interfaces
interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantKey?: string;
  quantity: number;
  price: number;
  title: string;
  img?: string;
  attributes: Record<string, string>;
  Product?: {
    id: number;
    title: string;
    img?: string;
    price: number;
    discountPrice?: number;
  };
}

interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  paymentIntentId: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shipping: number;
  total: number;
  address: {
    name?: string;
    email?: string;
    phone?: string | null;
    address?: {
      city: string;
      line1: string;
      line2?: string;
      state: string;
      country: string;
      postal_code: string;
    };
  };
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[]; // Now using items instead of products
}

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: <Clock className="h-4 w-4" /> },
  paid: { label: 'Payé', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  processing: { label: 'En cours', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: <Clock className="h-4 w-4" /> },
  shipped: { label: 'Expédié', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Livré', color: 'bg-green-500/10 text-green-600 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Annulé', color: 'bg-red-500/10 text-red-600 border-red-200', icon: <AlertCircle className="h-4 w-4" /> },
  refunded: { label: 'Remboursé', color: 'bg-gray-500/10 text-gray-600 border-gray-200', icon: <Euro className="h-4 w-4" /> },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
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
        
        // Map the data to our interface
        const ordersWithDetails: Order[] = ordersData.map((order: any) => ({
          ...order,
          subtotal: typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : order.subtotal,
          shipping: typeof order.shipping === 'string' ? parseFloat(order.shipping) : order.shipping,
          total: typeof order.total === 'string' ? parseFloat(order.total) : order.total,
          // Ensure items array exists
          items: Array.isArray(order.items) 
            ? order.items.map((item: any) => ({
                ...item,
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                attributes: item.attributes || {},
                // Use Product data if available
                title: item.Product?.title || item.title,
                img: item.Product?.img || item.img,
                discountPrice: item.Product?.discountPrice
              }))
            : []
        }));

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
    if (!address || !address.address) return 'Adresse non disponible';
    
    if (typeof address.address === 'string') return address.address;
    
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
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const getDisplayPrice = (item: OrderItem) => {
    return item.Product?.discountPrice && item.Product.discountPrice < item.price
      ? item.Product.discountPrice
      : item.price;
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
                        {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}€
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
                        
                        return (
                          <Card key={order.id} className="card-shadow overflow-hidden hover:shadow-md transition-shadow border-border">
                            {/* Order Header */}
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
                                      {order.total.toFixed(2)}€
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
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

                            {/* Expanded Order Details */}
                            {isExpanded && (
                              <CardContent className="pt-0 pb-4">
                                <div className="space-y-4 mt-4">
                                  {/* Order Items */}
                                  <div>
                                    <h4 className="font-semibold text-foreground mb-3">Articles commandés</h4>
                                    <div className="space-y-3">
                                      {order.items.map((item, idx) => {
                                        const displayPrice = getDisplayPrice(item);
                                        
                                        return (
                                          <div
                                            key={`${item.id}-${idx}`}
                                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg bg-secondary/10 border border-border/50 hover:bg-secondary/20 transition-colors"
                                          >
                                            <div 
                                              className="relative cursor-pointer flex-shrink-0 group"
                                              onClick={() => handleProductClick(item.productId)}
                                            >
                                              {item.img ? (
                                                <img
                                                  src={item.img}
                                                  alt={item.title}
                                                  className="w-16 h-16 object-cover rounded-lg border border-border bg-background group-hover:opacity-90 group-hover:border-accent/50 transition-all"
                                                  onError={(e) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Produit';
                                                  }}
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
                                                onClick={() => handleProductClick(item.productId)}
                                              >
                                                {item.title}
                                              </h4>
                                              
                                              {/* Display attributes */}
                                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                  {Object.entries(item.attributes).map(([key, value]) => {
                                                    let icon = null;
                                                    let colorClass = 'border-border';
                                                    
                                                    if (key.toLowerCase() === 'size') {
                                                      icon = <Ruler className="h-3 w-3 mr-1" />;
                                                      colorClass = 'border-blue-200 text-blue-600';
                                                    } else if (key.toLowerCase() === 'color') {
                                                      icon = <Palette className="h-3 w-3 mr-1" />;
                                                      colorClass = 'border-purple-200 text-purple-600';
                                                    }
                                                    
                                                    return (
                                                      <Badge key={key} variant="outline" className={`text-xs ${colorClass}`}>
                                                        {icon}
                                                        {value}
                                                      </Badge>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div className="text-right">
                                              <div className="flex flex-col items-end">
                                                <p className="font-semibold text-foreground">
                                                  {(displayPrice * item.quantity).toFixed(2)}€
                                                </p>
                                                {item.Product?.discountPrice && item.Product.discountPrice < item.price && (
                                                  <>
                                                    <span className="text-xs text-muted-foreground line-through">
                                                      {(item.price * item.quantity).toFixed(2)}€
                                                    </span>
                                                    <Badge variant="outline" className="text-xs text-accent border-accent mt-1">
                                                      Économisé: {((item.price - item.Product.discountPrice) * item.quantity).toFixed(2)}€
                                                    </Badge>
                                                  </>
                                                )}
                                                <p className="text-sm text-muted-foreground mt-1">
                                                  {displayPrice.toFixed(2)}€ × {item.quantity}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Address and Summary */}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {/* Address */}
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

                                    {/* Order Summary */}
                                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                                      <p className="text-sm font-medium text-foreground mb-3">Résumé de la commande</p>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Sous-total produits</span>
                                          <span>{order.subtotal.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Frais de livraison</span>
                                          <span>{order.shipping.toFixed(2)}€</span>
                                        </div>
                                        <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
                                          <span>Total payé</span>
                                          <span className="text-accent">{order.total.toFixed(2)}€</span>
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

                {/* Info Tab (unchanged) */}
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