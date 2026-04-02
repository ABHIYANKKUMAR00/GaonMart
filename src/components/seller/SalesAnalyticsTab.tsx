import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, IndianRupee } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths } from 'date-fns';

interface SalesAnalyticsTabProps {
  userId: string;
}

const SalesAnalyticsTab = ({ userId }: SalesAnalyticsTabProps) => {
  const { data: orders = [] } = useQuery({
    queryKey: ['seller-analytics-orders', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, product_id)')
        .in('status', ['accepted', 'packed', 'out', 'delivered'])
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: sellerProducts = [] } = useQuery({
    queryKey: ['seller-product-ids', userId],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id').eq('seller_id', userId);
      return data?.map(p => p.id) || [];
    },
  });

  // Filter orders that contain this seller's products
  const sellerOrders = useMemo(() => {
    if (!sellerProducts.length) return [];
    return orders.filter((o: any) =>
      o.order_items?.some((item: any) => sellerProducts.includes(item.product_id))
    );
  }, [orders, sellerProducts]);

  // Daily sales (last 7 days)
  const dailyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStr = format(date, 'yyyy-MM-dd');
      const dayOrders = sellerOrders.filter((o: any) => format(new Date(o.created_at), 'yyyy-MM-dd') === dayStr);
      const revenue = dayOrders.reduce((sum: number, o: any) => {
        const sellerTotal = o.order_items
          ?.filter((item: any) => sellerProducts.includes(item.product_id))
          .reduce((s: number, item: any) => s + item.price * item.quantity, 0) || 0;
        return sum + sellerTotal;
      }, 0);
      return { day: format(date, 'dd MMM'), revenue, orders: dayOrders.length };
    });
    return days;
  }, [sellerOrders, sellerProducts]);

  // Monthly sales (last 6 months)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const monthStart = startOfMonth(date);
      const monthStr = format(monthStart, 'yyyy-MM');
      const monthOrders = sellerOrders.filter((o: any) => format(new Date(o.created_at), 'yyyy-MM') === monthStr);
      const revenue = monthOrders.reduce((sum: number, o: any) => {
        const sellerTotal = o.order_items
          ?.filter((item: any) => sellerProducts.includes(item.product_id))
          .reduce((s: number, item: any) => s + item.price * item.quantity, 0) || 0;
        return sum + sellerTotal;
      }, 0);
      return { month: format(date, 'MMM'), revenue, orders: monthOrders.length };
    });
  }, [sellerOrders, sellerProducts]);

  const totalRevenue = sellerOrders.reduce((sum: number, o: any) => {
    const sellerTotal = o.order_items
      ?.filter((item: any) => sellerProducts.includes(item.product_id))
      .reduce((s: number, item: any) => s + item.price * item.quantity, 0) || 0;
    return sum + sellerTotal;
  }, 0);

  const todayRevenue = dailyData[dailyData.length - 1]?.revenue || 0;
  const todayOrders = dailyData[dailyData.length - 1]?.orders || 0;

  return (
    <div className="p-3 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Today / आज</p>
          <p className="text-lg font-bold text-primary">₹{todayRevenue}</p>
          <p className="text-xs text-muted-foreground">{todayOrders} orders</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">This Week</p>
          <p className="text-lg font-bold text-primary">₹{dailyData.reduce((s, d) => s + d.revenue, 0)}</p>
          <p className="text-xs text-muted-foreground">{dailyData.reduce((s, d) => s + d.orders, 0)} orders</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Total / कुल</p>
          <p className="text-lg font-bold text-primary">₹{totalRevenue}</p>
          <p className="text-xs text-muted-foreground">{sellerOrders.length} orders</p>
        </div>
      </div>

      {/* Daily chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1">
          <TrendingUp size={16} className="text-primary" /> Daily Sales / दैनिक बिक्री (7 days)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [`₹${value}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1">
          <IndianRupee size={16} className="text-primary" /> Monthly Sales / मासिक बिक्री (6 months)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [`₹${value}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsTab;
