import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useApp();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <span className="text-6xl">🛒</span>
        <p className="text-lg text-muted-foreground">Cart is empty / कार्ट खाली है</p>
        <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold touch-target">
          Shop Now / खरीदें
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="touch-target"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold">Cart / कार्ट ({cartCount})</h1>
      </div>

      <div className="p-3 space-y-3">
        {cart.map(item => (
          <div key={item.product.id} className="bg-card rounded-xl p-4 flex items-center gap-3 border border-border">
            <span className="text-3xl">{item.product.image}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{item.product.name}</h3>
              <p className="text-xs text-muted-foreground">{item.product.name_hi} · {item.product.unit}</p>
              <p className="font-bold text-primary text-sm mt-1">₹{item.product.price * item.quantity}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1 bg-muted rounded-lg">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="touch-target p-2"><Minus size={14} /></button>
                <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="touch-target p-2"><Plus size={14} /></button>
              </div>
              <button onClick={() => removeFromCart(item.product.id)} className="text-destructive"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-20">
        <div className="flex justify-between mb-3">
          <span className="text-muted-foreground">Total / कुल</span>
          <span className="text-xl font-bold text-primary">₹{cartTotal}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg touch-target active:scale-[0.98] transition-transform"
        >
          Checkout / आगे बढ़ें →
        </button>
      </div>
    </div>
  );
};

export default CartPage;
