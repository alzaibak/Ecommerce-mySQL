import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { usersAPI, productsAPI, ordersAPI } from '@/lib/api';
import DashboardLayout from '@/components/admin/DashboardLayout';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyIncome: { month: string; total: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyIncome: [],
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
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0);

        // Group orders by month for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = new Map<number, number>();
        
        orders.forEach((order: any) => {
          const date = new Date(order.createdAt);
          const month = date.getMonth();
          monthlyData.set(month, (monthlyData.get(month) || 0) + Number(order.amount));
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
        });
      } catch (error) {
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
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

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
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
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
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
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

        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Revenue trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.monthlyIncome.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyIncome}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No sales data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
       </DashboardLayout>
    </div>
  );
}
