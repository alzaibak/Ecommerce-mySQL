import { useEffect, useState } from 'react';
import { ordersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Eye, Package, MapPin, CreditCard } from 'lucide-react';

interface OrderProduct {
  productId: number;
  quantity: number;
  title?: string;
  price?: number;
}

interface Order {
  id: number;
  userId: number;
  products: OrderProduct[];
  amount: number;
  address: {
    street?: string;
    city?: string;
    country?: string;
    zipCode?: string;
  };
  status: string;
  createdAt: string;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'prepared', label: 'Prepared', color: 'bg-purple-500/10 text-purple-600' },
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
      setOrders(data);
      setFilteredOrders(data);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                placeholder="Search by order ID or user ID..."
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
                <TableHead>Order ID</TableHead>
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
                  <TableCell className="font-mono">#{order.id}</TableCell>
                  <TableCell>{order.userId}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {order.products?.length || 0} items
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${order.amount.toFixed(2)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
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
                <div className="space-y-2 pl-6">
                  {selectedOrder.products?.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">Product #{product.productId}</span>
                      <span className="text-sm font-medium">
                        x{product.quantity}
                      </span>
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
                      <p>{selectedOrder.address.street}</p>
                      <p>
                        {selectedOrder.address.city}, {selectedOrder.address.zipCode}
                      </p>
                      <p>{selectedOrder.address.country}</p>
                    </>
                  ) : (
                    <p>No address provided</p>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="w-4 h-4" />
                  Payment
                </div>
                <div className="pl-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="text-lg font-bold">
                      ${selectedOrder.amount.toFixed(2)}
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
    </div>
  );
}
