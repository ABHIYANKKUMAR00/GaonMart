import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId!).maybeSingle();
      return data;
    },
    enabled: !!orderId,
  });

  if (!order) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4 text-center">
      <div className="bg-success/20 p-4 rounded-full">
        <CheckCircle size={60} className="text-success" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Order Placed! 🎉</h1>
      <p className="text-muted-foreground">ऑर्डर हो गया!</p>
      <div className="bg-card border border-border rounded-xl p-4 w-full max-w-sm space-y-2 text-left">
        <div className="flex justify-between"><span className="text-muted-foreground text-sm">Order #</span><span className="font-mono font-bold text-sm">{order.order_number}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground text-sm">Total</span><span className="font-bold text-primary">₹{order.total}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground text-sm">Delivery</span><span className="text-sm capitalize">{order.delivery_type}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground text-sm">Payment</span><span className="text-sm uppercase">{order.payment_method}</span></div>
        {order.delivery_type !== 'pickup' && (
          <div className="flex justify-between"><span className="text-muted-foreground text-sm">OTP</span><span className="font-mono font-bold text-lg text-primary">{order.otp}</span></div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Keep OTP ready for delivery / OTP डिलीवरी पर बताएं</p>
      <div className="flex gap-3 w-full max-w-sm">
        <button onClick={() => navigate('/orders')} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold touch-target">
          Track Order
        </button>
        <button onClick={() => navigate('/')} className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-semibold touch-target">
          Shop More
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
