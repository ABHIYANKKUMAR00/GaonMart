-- Fix overly permissive UPDATE policy on orders
DROP POLICY "Authorized users can update orders" ON public.orders;
CREATE POLICY "Authenticated users can update orders" ON public.orders FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Fix order_items INSERT to require auth
DROP POLICY "Auth users can insert order items" ON public.order_items;
CREATE POLICY "Auth users can insert order items" ON public.order_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);