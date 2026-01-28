// src/pages/admin/DashboardPage.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { usersAPI, productsAPI, ordersAPI } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import DashboardLayout  from '@/components/admin/DashboardLayout';


interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyIncome: { month: string; total: number }[];
  recentOrders: any[];
  topProducts: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyIncome: [],
    recentOrders: [],
    topProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          usersAPI.getAll().catch(() => []),
          productsAPI.getAll().catch(() => []),
          ordersAPI.getAll().catch(() => []),
        ]);

        const users = Array.isArray(usersRes) ? usersRes : [];
        const products = Array.isArray(productsRes) ? productsRes : [];
        const orders = Array.isArray(ordersRes) ? ordersRes : [];

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum: number, order: any) => {
          const orderTotal = order.total || order.amount || 0;
          return sum + (typeof orderTotal === 'string' ? parseFloat(orderTotal) : orderTotal);
        }, 0);

        // Get recent orders (last 5)
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Get top products (by order items count)
        const productCounts: Record<number, number> = {};
        orders.forEach((order: any) => {
          if (order.items) {
            order.items.forEach((item: any) => {
              productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
            });
          }
        });

        const topProducts = Object.entries(productCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([productId, count]) => {
            const product = products.find((p: any) => p.id === parseInt(productId));
            return {
              id: productId,
              title: product?.title || 'Unknown Product',
              count,
            };
          });

        // Group orders by month for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = new Map<number, number>();
        
        orders.forEach((order: any) => {
          const date = new Date(order.createdAt);
          const month = date.getMonth();
          const orderTotal = order.total || order.amount || 0;
          const amount = typeof orderTotal === 'string' ? parseFloat(orderTotal) : orderTotal;
          monthlyData.set(month, (monthlyData.get(month) || 0) + amount);
        });

        const monthlyIncome = Array.from(monthlyData.entries())
          .map(([month, total]) => ({
            month: monthNames[month],
            total,
          }))
          .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month));

        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          monthlyIncome,
          recentOrders,
          topProducts,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        toast({
          title: 'Error loading stats',
          description: 'Could not load dashboard statistics',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+5%',
      trend: 'up' as const,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      change: '+23%',
      trend: 'up' as const,
    },
    {
      title: 'Total Revenue',
      value: `€${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      change: '+18%',
      trend: 'up' as const,
    },
  ];



  return (
     <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Recent Data */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Sales Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stats.monthlyIncome.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyIncome}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No sales data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          €{(order.total || order.amount || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent orders
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Most sold products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts.length > 0 ? (
                  stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-[150px]">{product.title}</p>
                          <p className="text-sm text-muted-foreground">Sold: {product.count}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <span className="font-bold">{product.count}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No product data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}