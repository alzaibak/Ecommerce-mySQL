// pages/admin/OrdersPage.tsx
import { useEffect, useState } from 'react';
import { ordersAPI, orderItemsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, Trash2, Plus, Edit, X, Save } from 'lucide-react';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Eye, Package, MapPin, CreditCard, Ruler, Palette } from 'lucide-react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { format } from 'date-fns';

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  title: string;
  price: number | string; // Can be string from API
  quantity: number;
  img?: string;
  attributes: {
    selectedSize?: string;
    selectedColor?: string;
    [key: string]: any;
  };
  variantKey?: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
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
  adminNote?: string;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditItemState {
  id: number;
  quantity: number;
  price: number;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600' },
  { value: 'paid', label: 'Paid', color: 'bg-blue-500/10 text-blue-600' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500/10 text-purple-600' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-500/10 text-indigo-600' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500/10 text-green-600' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/10 text-red-600' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-500/10 text-gray-600' },
];

// Helper function to ensure price is a number
const ensureNumber = (value: number | string): number => {
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  return value;
};

// Helper function to format currency
const formatCurrency = (value: number | string): string => {
  const num = ensureNumber(value);
  return `€${num.toFixed(2)}`;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editAdminNote, setEditAdminNote] = useState('');
  const [editItems, setEditItems] = useState<EditItemState[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await ordersAPI.getAll();
      // Transform data to match our interface and ensure numeric values
      const transformedData = data.map((order: any) => {
        // Ensure items exist and transform them
        const items = (order.items || []).map((item: any) => ({
          ...item,
          price: ensureNumber(item.price),
          quantity: Number(item.quantity) || 1,
          attributes: item.attributes || {},
        }));

        // Calculate totals if not provided
        const subtotal = ensureNumber(order.subtotal || items.reduce((sum: number, item: any) => 
          sum + (ensureNumber(item.price) * item.quantity), 0));
        
        const shipping = ensureNumber(order.shipping || 0);
        const total = ensureNumber(order.total || subtotal + shipping);

        return {
          ...order,
          items,
          subtotal,
          shipping,
          total,
          address: order.address || {},
        };
      });
      
      setOrders(transformedData);
      setFilteredOrders(transformedData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load orders',
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
          order.userId.toString().includes(searchTerm) ||
          (order.address?.name && order.address.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.address?.email && order.address.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleOrderDelete = async () => {
    if (!orderToDelete) return;

    try {
      await ordersAPI.delete(orderToDelete);
      setOrders(orders.filter((o) => o.id !== orderToDelete));
      toast({
        title: 'Order deleted',
        description: `Order #${orderToDelete} has been deleted successfully`,
      });
      if (selectedOrder?.id === orderToDelete) {
        setSelectedOrder(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete order',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleItemDelete = async () => {
    if (!itemToDelete) return;

    try {
      await orderItemsAPI.delete(itemToDelete);
      if (selectedOrder) {
        const updatedItems = selectedOrder.items.filter((item) => item.id !== itemToDelete);
        const newSubtotal = updatedItems.reduce((sum, item) => 
          sum + (ensureNumber(item.price) * item.quantity), 0);
        const newTotal = newSubtotal + ensureNumber(selectedOrder.shipping);
        
        // Update order with new totals
        await ordersAPI.update(selectedOrder.id, {
          subtotal: newSubtotal,
          total: newTotal,
        });

        const updatedOrder = {
          ...selectedOrder,
          items: updatedItems,
          subtotal: newSubtotal,
          total: newTotal,
        };
        
        setSelectedOrder(updatedOrder);
        setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
        
        toast({
          title: 'Item removed',
          description: 'Item has been removed from the order',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteItemDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) return;

    try {
      // Update order admin note
      if (editAdminNote !== selectedOrder.adminNote) {
        await ordersAPI.update(selectedOrder.id, { adminNote: editAdminNote });
      }

      // Update changed items
      for (const editItem of editItems) {
        const originalItem = selectedOrder.items.find(item => item.id === editItem.id);
        if (originalItem && 
            (originalItem.quantity !== editItem.quantity || 
             ensureNumber(originalItem.price) !== editItem.price)) {
          await orderItemsAPI.update(editItem.id, {
            quantity: editItem.quantity,
            price: editItem.price,
          });
        }
      }

      // Recalculate totals
      const updatedItems = selectedOrder.items.map(item => {
        const editItem = editItems.find(ei => ei.id === item.id);
        return editItem ? { 
          ...item, 
          quantity: editItem.quantity, 
          price: editItem.price 
        } : item;
      });

      const newSubtotal = updatedItems.reduce((sum, item) => 
        sum + (ensureNumber(item.price) * item.quantity), 0);
      const newTotal = newSubtotal + ensureNumber(selectedOrder.shipping);

      // Update order totals
      const updatedOrder = {
        ...selectedOrder,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newTotal,
        adminNote: editAdminNote,
      };

      setSelectedOrder(updatedOrder);
      setOrders(orders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      setIsEditMode(false);
      setEditItems([]);

      toast({
        title: 'Changes saved',
        description: 'Order updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  const handleItemEdit = (itemId: number, field: 'quantity' | 'price', value: number) => {
    setEditItems(prev => {
      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item => 
          item.id === itemId ? { ...item, [field]: value } : item
        );
      } else {
        const originalItem = selectedOrder?.items.find(item => item.id === itemId);
        if (originalItem) {
          return [...prev, { 
            id: itemId, 
            quantity: field === 'quantity' ? value : originalItem.quantity,
            price: field === 'price' ? value : ensureNumber(originalItem.price)
          }];
        }
        return prev;
      }
    });
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
    if (!address || !address.address) return 'No address provided';
    
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

  const totalItemsCount = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const totalProductsCount = (order: Order) => {
    return order.items.length;
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setEditAdminNote(order.adminNote || '');
    setEditItems([]);
    setIsEditMode(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardLayout>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
          <p className="text-muted-foreground">Manage customer orders, update status, and edit items</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order number, name, email..."
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
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {filteredOrders.length} orders
                </Badge>
                <Button variant="outline" size="sm" onClick={fetchOrders}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-semibold">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{order.address?.name || 'N/A'}</div>
                            {order.address?.email && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {order.address.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="secondary" className="mr-2">
                              {totalProductsCount(order)} items
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {totalItemsCount(order)} units total
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
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
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOrderSelect(order)}
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setOrderToDelete(order.id);
                                setIsDeleteDialogOpen(true);
                              }}
                              title="Delete order"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
                  <DialogDescription>
                    {selectedOrder?.address?.name} • {selectedOrder?.address?.email}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  {isEditMode ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveChanges}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getStatusBadge(selectedOrder.status)}
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated: {format(new Date(selectedOrder.updatedAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Payment ID:</span>
                          <span className="text-sm font-mono">
                            {selectedOrder.paymentIntentId?.slice(-8) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">User ID:</span>
                          <span className="text-sm font-medium">{selectedOrder.userId}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Items:</span>
                          <span className="text-sm font-medium">
                            {totalProductsCount(selectedOrder)} products
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Units:</span>
                          <span className="text-sm font-medium">
                            {totalItemsCount(selectedOrder)} units
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Admin Notes</h3>
                  {isEditMode ? (
                    <Textarea
                      value={editAdminNote}
                      onChange={(e) => setEditAdminNote(e.target.value)}
                      placeholder="Add notes about this order..."
                      className="min-h-[100px]"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-lg">
                      {selectedOrder.adminNote || 'No notes added'}
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Order Items
                    </h3>
                    {isEditMode && (
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => {
                      const editItem = editItems.find(ei => ei.id === item.id);
                      const currentQuantity = editItem?.quantity ?? item.quantity;
                      const currentPrice = editItem?.price ?? ensureNumber(item.price);
                      const itemTotal = currentPrice * currentQuantity;
                      
                      return (
                        <div key={item.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                          {item.img && (
                            <img
                              src={item.img}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Product ID: {item.productId}
                                </p>
                              </div>
                              {isEditMode && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setItemToDelete(item.id);
                                    setIsDeleteItemDialogOpen(true);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Quantity:</span>
                                {isEditMode ? (
                                  <Input
                                    type="number"
                                    min="1"
                                    value={currentQuantity}
                                    onChange={(e) => handleItemEdit(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                    className="w-20 h-8"
                                  />
                                ) : (
                                  <Badge variant="secondary">{item.quantity}</Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Price:</span>
                                {isEditMode ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={currentPrice}
                                    onChange={(e) => handleItemEdit(item.id, 'price', parseFloat(e.target.value) || 0)}
                                    className="w-24 h-8"
                                  />
                                ) : (
                                  <span className="font-medium">{formatCurrency(item.price)}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Total:</span>
                                <span className="font-bold">
                                  {formatCurrency(itemTotal)}
                                </span>
                              </div>
                              
                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <div className="flex gap-2">
                                  {item.attributes.selectedSize && (
                                    <Badge variant="outline" className="text-xs">
                                      <Ruler className="w-3 h-3 mr-1" />
                                      {item.attributes.selectedSize}
                                    </Badge>
                                  )}
                                  {item.attributes.selectedColor && (
                                    <Badge variant="outline" className="text-xs">
                                      <Palette className="w-3 h-3 mr-1" />
                                      {item.attributes.selectedColor}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-muted rounded-lg">
                    {selectedOrder.address ? (
                      <>
                        {selectedOrder.address.name && (
                          <p className="font-medium">{selectedOrder.address.name}</p>
                        )}
                        <p className="text-sm mt-1">{formatAddress(selectedOrder.address)}</p>
                        <div className="flex flex-wrap gap-4 mt-3">
                          {selectedOrder.address.email && (
                            <p className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4" />
                              {selectedOrder.address.email}
                            </p>
                          )}
                          {selectedOrder.address.phone && (
                            <p className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4" />
                              {selectedOrder.address.phone}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No address provided</p>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Summary
                  </h3>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Products Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Shipping</span>
                      <span>{formatCurrency(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order Created</p>
                      <p>{format(new Date(selectedOrder.createdAt), 'PPPpp')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p>{format(new Date(selectedOrder.updatedAt), 'PPPpp')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Order Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the order
                and all associated order items.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOrderToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleOrderDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Item Confirmation Dialog */}
        <AlertDialog open={isDeleteItemDialogOpen} onOpenChange={setIsDeleteItemDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove item from order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the item from the order. The order total will be updated accordingly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleItemDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove Item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </div>
  );
}