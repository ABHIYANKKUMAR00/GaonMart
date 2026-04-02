import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, CheckCircle, Navigation, UserCircle } from 'lucide-react';

const DeliveryDashboard = () => {
  const { setRole } = useApp();
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*, order_items(*)').in('status', ['packed', 'out', 'delivered']).order('created_at', { ascending: false });
      return data || [];
    },
    refetchInterval: 10000,
  });

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status: status as any }).eq('id', orderId);
    queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
  };

  const handleVerifyOtp = (orderId: string, correctOtp: string) => {
    if (otpInput[orderId] === correctOtp) {
      updateStatus(orderId, 'delivered');
    }
  };

  const villages = [...new Set(orders.filter((o: any) => o.status !== 'delivered').map((o: any) => o.village))];

  return (
    <div className="min-h-screen pb-6">
      <div className="bg-accent text-accent-foreground p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setRole(null)} className="touch-target"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-bold">🚚 Delivery / डिलीवरी</h1>
        </div>
        <a href="/profile" className="touch-target p-2"><UserCircle size={22} /></a>
      </div>

      <div className="p-3 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{orders.filter((o: any) => o.status === 'packed').length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warning">{orders.filter((o: any) => o.status === 'out').length}</p>
            <p className="text-xs text-muted-foreground">On Route</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{orders.filter((o: any) => o.status === 'delivered').length}</p>
            <p className="text-xs text-muted-foreground">Done</p>
          </div>
        </div>

        {villages.map((village: string) => {
          const villageOrders = orders.filter((o: any) => o.village === village && o.status !== 'delivered');
          if (villageOrders.length === 0) return null;
          return (
            <div key={village} className="space-y-2">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <MapPin size={16} className="text-primary" /> {village} ({villageOrders.length} orders)
              </div>
              {villageOrders.map((order: any) => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-sm">{order.buyer_name}</p>
                      <p className="text-xs text-muted-foreground">{order.order_number} · {order.order_items?.length} items · ₹{order.total}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.payment_method === 'cod' ? '💰 Cash' : order.payment_method === 'upi' ? '📱 UPI Paid' : '📞 Udhaar'}</p>
                    </div>
                  </div>
                  {order.status === 'packed' && (
                    <button onClick={() => updateStatus(order.id, 'out')} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold touch-target flex items-center justify-center gap-2">
                      <Navigation size={16} /> Start Delivery / निकलें
                    </button>
                  )}
                  {order.status === 'out' && (
                    <div className="space-y-2">
                      <input
                        placeholder="Enter OTP / OTP डालें"
                        value={otpInput[order.id] || ''}
                        onChange={e => setOtpInput(prev => ({ ...prev, [order.id]: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-primary"
                        maxLength={4}
                        inputMode="numeric"
                      />
                      <button
                        onClick={() => handleVerifyOtp(order.id, order.otp)}
                        className="w-full bg-success text-success-foreground py-3 rounded-xl font-semibold touch-target flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Verify & Deliver
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {orders.filter((o: any) => o.status !== 'delivered').length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No pending deliveries / कोई डिलीवरी नहीं</div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
