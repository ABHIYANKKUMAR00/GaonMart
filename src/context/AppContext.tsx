import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

type UserRole = 'buyer' | 'seller' | 'delivery' | 'hub';

interface CartItem {
  product: Tables<'products'>;
  quantity: number;
}

interface AppContextType {
  user: User | null;
  profile: Tables<'profiles'> | null;
  loading: boolean;
  role: UserRole | null;
  setRole: (r: UserRole | null) => void;
  cart: CartItem[];
  addToCart: (product: Tables<'products'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    setProfile(data);
    if (data?.preferred_role) setRole(data.preferred_role as UserRole);
    return data;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use the role from signup metadata if profile doesn't have one yet
        const data = await fetchProfile(session.user.id);
        if (!data?.preferred_role && session.user.user_metadata?.role) {
          const signupRole = session.user.user_metadata.role as UserRole;
          setRole(signupRole);
          // Save role to profile
          await supabase.from('profiles').update({ preferred_role: signupRole }).eq('user_id', session.user.id);
          await fetchProfile(session.user.id);
        }
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = useCallback((product: Tables<'products'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCart([]);
    setRole(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user]);

  // Save role preference to profile
  useEffect(() => {
    if (user && role && profile) {
      supabase.from('profiles').update({ preferred_role: role }).eq('user_id', user.id).then(() => {});
    }
  }, [role, user, profile]);

  return (
    <AppContext.Provider value={{ user, profile, loading, role, setRole, cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, signOut, refreshProfile }}>
      {children}
    </AppContext.Provider>
  );
};
