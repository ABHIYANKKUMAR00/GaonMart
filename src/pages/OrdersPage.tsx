import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, CheckCircle, Truck, Clock } from 'lucide-react';

type OrderStatus = 'pending' | 'accepted' | 'packed' | 'out' | 'delivered' | 'rejected';

const statusConfig: Record<OrderStatus, { labelHi: string; color: string; icon: React.ReactNode }> = {
  pending: { labelHi: 'बाकी', color: 'text-warning', icon: <Clock size={16} /> },
  accepted: { labelHi: 'स्वीकार', color: 'text-primary', icon: <CheckCircle size={16} /> },
  packed: { labelHi: 'पैक हुआ', color: 'text-secondary', icon: <Package size={16} /> },
  out: { labelHi: 'रास्ते में', color: 'text-primary', icon: <Truck size={16} /> },
  delivered: { labelHi: 'पहुँच गया', color: 'text-success', icon: <CheckCircle size={16} /> },
  rejected: { labelHi: 'रद्द', color: 'text-destructive', icon: <Clock size={16} /> },
};

const steps: OrderStatus[] = ['pending', 'accepted', 'packed', 'out', 'delivered'];

const OrdersPage = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').eq('buyer_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen pb-6">
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="touch-target"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold">My Orders / मेरे ऑर्डर</h1>
      </div>

      <div className="p-3 space-y-3">
        {orders.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No orders yet / कोई ऑर्डर नहीं</div>
        )}
        {orders.map(order => {
          const s = statusConfig[order.status as OrderStatus];
          const currentStep = steps.indexOf(order.status as OrderStatus);
          return (
            <div key={order.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono font-bold text-sm">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{order.village} · ₹{order.total}</p>
                </div>
                <div className={`flex items-center gap-1 ${s?.color} text-sm font-semibold`}>
                  {s?.icon} {s?.labelHi}
                </div>
              </div>
              {order.status !== 'rejected' && (
                <div className="flex items-center gap-1">
                  {steps.map((step, i) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`w-3 h-3 rounded-full ${i <= currentStep ? 'bg-primary' : 'bg-muted'}`} />
                      {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{order.delivery_type}</span> · <span className="uppercase">{order.payment_method}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
