import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart, ArrowLeft, ClipboardList, MapPin, Star, ChevronRight, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BuyerHome = () => {
  const { setRole, cartCount } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('preferred_role', 'seller')
        .eq('registration_complete', true)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const shopCategories = [
    { value: '', label: 'All / सभी', icon: '🏪' },
    { value: 'kirana', label: 'किराना', icon: '🏪' },
    { value: 'dairy', label: 'डेयरी', icon: '🥛' },
    { value: 'vegetables', label: 'सब्जी', icon: '🥬' },
    { value: 'fruits', label: 'फल', icon: '🍎' },
    { value: 'medical', label: 'दवाई', icon: '💊' },
    { value: 'bakery', label: 'बेकरी', icon: '🍞' },
  ];

  const categoryEmoji: Record<string, string> = {
    kirana: '🏪', dairy: '🥛', vegetables: '🥬', fruits: '🍎', medical: '💊', bakery: '🍞', other: '🛒'
  };

  const filtered = shops.filter((s: any) => {
    const matchSearch = !search || 
      (s.shop_name || s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.village || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || s.shop_category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setRole(null)} className="touch-target flex items-center gap-1">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">🛒 GramCart</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/profile')} className="touch-target relative p-2">
              <UserCircle size={22} />
            </button>
            <button onClick={() => navigate('/orders')} className="touch-target relative p-2">
              <ClipboardList size={22} />
            </button>
            <button onClick={() => navigate('/cart')} className="touch-target relative p-2">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input
            type="text"
            placeholder="Search shops / दुकान खोजें..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
        {shopCategories.map(c => (
          <button
            key={c.value}
            onClick={() => setSelectedCategory(c.value || null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              (selectedCategory === c.value || (!selectedCategory && !c.value))
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Shop cards */}
      <div className="p-3 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No shops nearby / कोई दुकान नहीं मिली
          </div>
        )}
        {filtered.map((shop: any) => (
          <button
            key={shop.id}
            onClick={() => navigate(`/shop/${shop.user_id}`)}
            className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {categoryEmoji[shop.shop_category] || '🏪'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{shop.shop_name || shop.name}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <MapPin size={12} /> {shop.village || 'Unknown'}
                <span className="capitalize">· {shop.shop_category || 'kirana'}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-warning fill-warning" />
                <span className="text-xs text-muted-foreground">New Shop</span>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
          </button>
        ))}
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

export default BuyerHome;
