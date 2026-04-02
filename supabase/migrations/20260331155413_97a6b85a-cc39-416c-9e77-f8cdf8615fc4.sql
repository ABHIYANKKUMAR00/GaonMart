
CREATE TABLE public.udhaar_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  buyer_name text NOT NULL,
  buyer_phone text DEFAULT '',
  village text DEFAULT '',
  amount numeric NOT NULL,
  description text DEFAULT '',
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  is_paid boolean NOT NULL DEFAULT false,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.udhaar_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own udhaar records" ON public.udhaar_records
  FOR SELECT TO authenticated USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert own udhaar records" ON public.udhaar_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own udhaar records" ON public.udhaar_records
  FOR UPDATE TO authenticated USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own udhaar records" ON public.udhaar_records
  FOR DELETE TO authenticated USING (auth.uid() = seller_id);

CREATE TRIGGER update_udhaar_records_updated_at
  BEFORE UPDATE ON public.udhaar_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add stock_quantity to products for inventory tracking
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;
