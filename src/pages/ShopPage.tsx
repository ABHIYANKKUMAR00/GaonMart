import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

const categories = [
  { id: 'atta', nameHi: 'आटा', icon: '🌾' },
  { id: 'rice', nameHi: 'चावल-दाल', icon: '🍚' },
  { id: 'oil', nameHi: 'तेल-घी', icon: '🫗' },
  { id: 'spices', nameHi: 'मसाले', icon: '🌶️' },
  { id: 'snacks', nameHi: 'नमकीन', icon: '🍪' },
  { id: 'soap', nameHi: 'साबुन', icon: '🧼' },
  { id: 'drinks', nameHi: 'पेय', icon: '🥤' },
  { id: 'dairy', nameHi: 'दूध-दही', icon: '🥛' },
];

const ShopPage = () => {
  const { sellerId } = useParams();
  const { addToCart, cart, updateQuantity, cartCount } = useApp();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: shop } = useQuery({
    queryKey: ['shop-profile', sellerId],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', sellerId!).single();
      return data;
    },
    enabled: !!sellerId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['shop-products', sellerId],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('seller_id', sellerId!).eq('in_stock', true).order('name');
      return data || [];
    },
    enabled: !!sellerId,
  });

  const filtered = products.filter((p: Tables<'products'>) => {
    const matchCat = !selectedCat || p.category === selectedCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.name_hi.includes(search);
    return matchCat && matchSearch;
  });

  const getCartQty = (id: string) => cart.find(i => i.product.id === id)?.quantity || 0;

  const shopName = (shop as any)?.shop_name || shop?.name || 'Shop';
  const shopCategory = (shop as any)?.shop_category || '';

  const categoryEmoji: Record<string, string> = {
    kirana: '🏪', dairy: '🥛', vegetables: '🥬', fruits: '🍎', medical: '💊', bakery: '🍞', other: '🛒'
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/')} className="touch-target"><ArrowLeft size={22} /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{categoryEmoji[shopCategory] || '🏪'} {shopName}</h1>
            <p className="text-xs opacity-80">{shop?.village} · {shopCategory}</p>
          </div>
          <button onClick={() => navigate('/cart')} className="touch-target relative p-2">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        <input
          type="text"
          placeholder="Search / खोजें..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-4 pr-4 py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
        <button onClick={() => setSelectedCat(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          All / सभी
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setSelectedCat(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCat === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {c.icon} {c.nameHi}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 p-3">
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-10 text-muted-foreground">
            No products / कोई प्रोडक्ट नहीं
          </div>
        )}
        {filtered.map((p: Tables<'products'>) => {
          const qty = getCartQty(p.id);
          return (
            <div key={p.id} className="bg-card rounded-xl p-3 shadow-sm border border-border animate-slide-up">
              <div className="text-4xl text-center mb-2">{p.image}</div>
              <h3 className="font-semibold text-sm truncate">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.name_hi} · {p.unit}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-primary">₹{p.price}</span>
                {qty === 0 ? (
                  <button onClick={() => addToCart(p)}
                    className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold touch-target active:scale-95 transition-transform">
                    + Add
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-1">
                    <button onClick={() => updateQuantity(p.id, qty - 1)} className="touch-target p-1"><Minus size={16} className="text-primary" /></button>
                    <span className="font-bold text-sm w-4 text-center">{qty}</span>
                    <button onClick={() => updateQuantity(p.id, qty + 1)} className="touch-target p-1"><Plus size={16} className="text-primary" /></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 flex items-center justify-between z-20 shadow-lg">
          <span className="font-semibold">{cartCount} items in cart</span>
          <button onClick={() => navigate('/cart')} className="bg-primary-foreground text-primary font-bold px-5 py-2 rounded-xl active:scale-95 transition-transform">
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
