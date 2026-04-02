import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ClipboardList, Package, BarChart3, HandCoins, Check, X, UserCircle } from 'lucide-react';
import InventoryTab from '@/components/seller/InventoryTab';
import SalesAnalyticsTab from '@/components/seller/SalesAnalyticsTab';
import UdhaarTab from '@/components/seller/UdhaarTab';

const SellerDashboard = () => {
  const { setRole, user } = useApp();
  const [tab, setTab] = useState<'orders' | 'inventory' | 'analytics' | 'udhaar'>('orders');
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['seller-orders', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status: status as any }).eq('id', orderId);
    queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
  };

  const tabs = [
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList, count: orders.length },
    { id: 'inventory' as const, label: 'Stock', icon: Package },
    { id: 'analytics' as const, label: 'Sales', icon: BarChart3 },
    { id: 'udhaar' as const, label: 'Udhaar', icon: HandCoins },
  ];

  return (
    <div className="min-h-screen pb-6">
      <div className="bg-secondary text-secondary-foreground p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setRole(null)} className="touch-target"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-bold">🏪 My Shop / मेरी दुकान</h1>
        </div>
        <a href="/profile" className="touch-target p-2"><UserCircle size={22} /></a>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 min-w-0 py-3 text-xs font-semibold touch-target flex flex-col items-center gap-1 ${tab === t.id ? 'border-b-2 border-secondary text-secondary' : 'text-muted-foreground'}`}>
            <t.icon size={16} />
            <span>{t.label}{t.count !== undefined ? ` (${t.count})` : ''}</span>
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="p-3 space-y-3">
          {orders.length === 0 && <p className="text-center py-10 text-muted-foreground">No orders / कोई ऑर्डर नहीं</p>}
          {orders.map((order: any) => (
            <div key={order.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-sm">{order.buyer_name}</p>
                  <p className="text-xs text-muted-foreground">{order.village} · {order.order_number}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-warning/20 text-warning' : order.status === 'accepted' ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success'}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-1">
                {order.order_items?.map((i: any) => (
                  <div key={i.id} className="flex justify-between text-sm">
                    <span>{i.product_image} {i.product_name} x{i.quantity}</span>
                    <span className="font-semibold">₹{i.price * i.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-border pt-2">
                <span className="font-bold text-primary">₹{order.total}</span>
                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(order.id, 'accepted')} className="bg-success text-success-foreground px-4 py-2 rounded-lg text-sm font-semibold touch-target flex items-center gap-1">
                      <Check size={16} /> Accept
                    </button>
                    <button onClick={() => updateStatus(order.id, 'rejected')} className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-semibold touch-target flex items-center gap-1">
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
                {order.status === 'accepted' && (
                  <button onClick={() => updateStatus(order.id, 'packed')} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-semibold touch-target">
                    Mark Packed ✅
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'inventory' && user && <InventoryTab userId={user.id} />}
      {tab === 'analytics' && user && <SalesAnalyticsTab userId={user.id} />}
      {tab === 'udhaar' && user && <UdhaarTab userId={user.id} />}
    </div>
  );
};

export default SellerDashboard;
