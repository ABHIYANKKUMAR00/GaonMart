import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Zap, MapPin, Smartphone, Banknote, Phone } from 'lucide-react';

type DeliveryType = 'scheduled' | 'emergency' | 'pickup';
type PaymentMethod = 'upi' | 'cod' | 'udhaar';

const deliveryOptions: { type: DeliveryType; label: string; labelHi: string; desc: string; icon: React.ReactNode }[] = [
  { type: 'scheduled', label: 'Scheduled', labelHi: 'समय पर', desc: 'Low cost · 4-6 hrs', icon: <Clock size={24} /> },
  { type: 'emergency', label: 'Emergency', labelHi: 'तुरंत', desc: 'Fast · 30-90 min · ₹50 extra', icon: <Zap size={24} /> },
  { type: 'pickup', label: 'Self Pickup', labelHi: 'खुद लें', desc: 'Free · Pick from shop', icon: <MapPin size={24} /> },
];

const paymentOptions: { method: PaymentMethod; label: string; labelHi: string; icon: React.ReactNode }[] = [
  { method: 'upi', label: 'Pay Now (UPI)', labelHi: 'अभी भुगतान', icon: <Smartphone size={24} /> },
  { method: 'cod', label: 'Cash on Delivery', labelHi: 'डिलीवरी पर पैसे', icon: <Banknote size={24} /> },
  { method: 'udhaar', label: 'Udhaar (Credit)', labelHi: 'उधार', icon: <Phone size={24} /> },
];

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, user, profile } = useApp();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<DeliveryType>('scheduled');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [village, setVillage] = useState(profile?.village || '');
  const [loading, setLoading] = useState(false);

  const deliveryCharge = delivery === 'emergency' ? 50 : delivery === 'pickup' ? 0 : 20;
  const total = cartTotal + deliveryCharge;

  const placeOrder = async () => {
    if (!name || !phone || !village || !user) return;
    setLoading(true);

    const { data: order, error } = await supabase.from('orders').insert({
      buyer_id: user.id,
      buyer_name: name,
      buyer_phone: phone,
      village,
      delivery_type: delivery,
      payment_method: payment,
      total,
    }).select().single();

    if (error || !order) {
      setLoading(false);
      return;
    }

    // Insert order items
    const items = cart.map(i => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      product_name_hi: i.product.name_hi,
      product_image: i.product.image,
      price: i.product.price,
      quantity: i.quantity,
    }));

    await supabase.from('order_items').insert(items);

    // Update profile with latest info
    await supabase.from('profiles').update({ name, phone, village }).eq('user_id', user.id);

    clearCart();
    setLoading(false);
    navigate('/order-success/' + order.id);
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/cart')} className="touch-target"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold">Checkout / ऑर्डर करें</h1>
      </div>

      <div className="p-4 space-y-5">
        <div className="space-y-3">
          <h2 className="font-bold text-foreground">Your Details / आपकी जानकारी</h2>
          <input placeholder="Name / नाम" value={name} onChange={e => setName(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
          <input placeholder="Phone / फोन नंबर" value={phone} onChange={e => setPhone(e.target.value)} type="tel"
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
          <input placeholder="Village / गाँव" value={village} onChange={e => setVillage(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <h2 className="font-bold text-foreground mb-2">Delivery / डिलीवरी</h2>
          <div className="space-y-2">
            {deliveryOptions.map(d => (
              <button key={d.type} onClick={() => setDelivery(d.type)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors touch-target ${delivery === d.type ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className={delivery === d.type ? 'text-primary' : 'text-muted-foreground'}>{d.icon}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm">{d.label} · {d.labelHi}</p>
                  <p className="text-xs text-muted-foreground">{d.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-foreground mb-2">Payment / भुगतान</h2>
          <div className="space-y-2">
            {paymentOptions.map(p => (
              <button key={p.method} onClick={() => setPayment(p.method)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors touch-target ${payment === p.method ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
                <span className={payment === p.method ? 'text-primary' : 'text-muted-foreground'}>{p.icon}</span>
                <div className="text-left">
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.labelHi}</p>
                </div>
              </button>
            ))}
          </div>
          {payment === 'udhaar' && (
            <p className="text-xs text-destructive mt-2 bg-destructive/10 p-2 rounded-lg">
              ⚠️ Udhaar: Call seller for approval. Platform not responsible. / उधार: दुकानदार से बात करें।
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm"><span>Items ({cart.length})</span><span>₹{cartTotal}</span></div>
          <div className="flex justify-between text-sm"><span>Delivery</span><span>₹{deliveryCharge}</span></div>
          <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">₹{total}</span></div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-20">
        <button
          onClick={placeOrder}
          disabled={!name || !phone || !village || loading}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg touch-target active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? 'Placing...' : `Place Order / ऑर्डर करें · ₹${total}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
