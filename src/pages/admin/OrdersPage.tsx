// pages/admin/OrdersPage.tsx
import { useEffect, useState } from 'react';
import { ordersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Eye, Package, MapPin, CreditCard, Ruler, Palette } from 'lucide-react';
import DashboardLayout from '@/components/admin/DashboardLayout';

interface OrderProduct {
  productId: number | string;
  title: string;
  price: number;
  quantity: number;
  img?: string;
  selectedSize?: string;
  selectedColor?: string;
}

interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  products: OrderProduct[];
  amount: number;
  shipping: number;
  address: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city: string;
      line1: string;
      line2?: string;
      state?: string;
      country: string;
      postal_code: string;
    };
  };
  status: string;
  createdAt: string;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500/10 text-purple-600' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-500/10 text-indigo-600' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500/10 text-green-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10 text-red-600' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      // Transformer les données pour s'assurer que products est un tableau
      const transformedData = data.map((order: any) => ({
        ...order,
        products: Array.isArray(order.products) ? order.products : [],
        amount: typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount,
        shipping: typeof order.shipping === 'string' ? parseFloat(order.shipping) : order.shipping,
      }));
      setOrders(transformedData);
      setFilteredOrders(transformedData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm) ||
          order.userId.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersAPI.update(orderId, { status: newStatus });
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast({
        title: 'Status updated',
        description: `Order #${orderId} status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status) || {
      label: status,
      color: 'bg-gray-500/10 text-gray-600',
    };
    return (
      <Badge variant="outline" className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  const formatAddress = (address: Order['address']) => {
    if (!address) return 'No address provided';
    
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
    
    return 'No address provided';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardLayout>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, ID or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{filteredOrders.length} orders</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono font-bold">{order.orderNumber}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {order.products?.length || 0} items
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      €{(order.amount ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
              <DialogDescription>
                Order details and information
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Products */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Package className="w-4 h-4" />
                    Products
                  </div>
                  <div className="space-y-3 pl-6">
                    {selectedOrder.products?.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                      >
                        {product.img && (
                          <img
                            src={product.img}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{product.title}</span>
                            <span className="font-bold">
                              €{(product.price * product.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {product.selectedSize && (
                              <Badge variant="outline" className="text-xs">
                                <Ruler className="w-3 h-3 mr-1" />
                                {product.selectedSize}
                              </Badge>
                            )}
                            {product.selectedColor && (
                              <Badge variant="outline" className="text-xs">
                                <Palette className="w-3 h-3 mr-1" />
                                {product.selectedColor}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              Quantity: {product.quantity}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              €{product.price.toFixed(2)} each
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </div>
                  <div className="pl-6 text-sm text-muted-foreground">
                    {selectedOrder.address ? (
                      <>
                        {selectedOrder.address.name && (
                          <p className="font-medium">{selectedOrder.address.name}</p>
                        )}
                        <p>{formatAddress(selectedOrder.address)}</p>
                        {selectedOrder.address.email && (
                          <p className="flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {selectedOrder.address.email}
                          </p>
                        )}
                        {selectedOrder.address.phone && (
                          <p className="flex items-center gap-1 mt-1">
                            <Phone className="w-3 h-3" />
                            {selectedOrder.address.phone}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>No address provided</p>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="w-4 h-4" />
                    Payment Summary
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Products Subtotal</span>
                      <span>€{(selectedOrder.amount - selectedOrder.shipping).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Shipping</span>
                      <span>€{selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">Total</span>
                      <span className="text-lg font-bold text-accent">
                        €{selectedOrder.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Order Date</span>
                    <span>
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </div>
  );
}