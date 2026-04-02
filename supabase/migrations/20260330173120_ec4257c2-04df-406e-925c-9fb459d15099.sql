-- Enums
CREATE TYPE public.user_role AS ENUM ('buyer', 'seller', 'delivery', 'hub');
CREATE TYPE public.delivery_type AS ENUM ('scheduled', 'emergency', 'pickup');
CREATE TYPE public.payment_method AS ENUM ('upi', 'cod', 'udhaar');
CREATE TYPE public.order_status AS ENUM ('pending', 'accepted', 'packed', 'out', 'delivered', 'rejected');

-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  village TEXT DEFAULT '',
  preferred_role user_role NOT NULL DEFAULT 'buyer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_hi TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL CHECK (price >= 0),
  unit TEXT NOT NULL DEFAULT '1 unit',
  category TEXT NOT NULL DEFAULT 'other',
  image TEXT NOT NULL DEFAULT '📦',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE USING (auth.uid() = seller_id);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('ORD' || floor(random() * 900000 + 100000)::text),
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL DEFAULT '',
  village TEXT NOT NULL,
  delivery_type delivery_type NOT NULL DEFAULT 'scheduled',
  payment_method payment_method NOT NULL DEFAULT 'cod',
  status order_status NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL DEFAULT 0,
  otp TEXT NOT NULL DEFAULT floor(1000 + random() * 9000)::text,
  delivery_partner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Buyers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Authorized users can update orders" ON public.orders FOR UPDATE USING (true);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_name_hi TEXT NOT NULL DEFAULT '',
  product_image TEXT NOT NULL DEFAULT '📦',
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Auth users can insert order items" ON public.order_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_seller ON public.products(seller_id);
CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);