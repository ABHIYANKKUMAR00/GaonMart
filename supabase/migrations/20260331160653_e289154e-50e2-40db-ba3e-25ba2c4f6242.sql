ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shop_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS shop_address text DEFAULT '',
ADD COLUMN IF NOT EXISTS shop_category text DEFAULT '',
ADD COLUMN IF NOT EXISTS vehicle_type text DEFAULT '',
ADD COLUMN IF NOT EXISTS working_area text DEFAULT '',
ADD COLUMN IF NOT EXISTS address text DEFAULT '',
ADD COLUMN IF NOT EXISTS registration_complete boolean DEFAULT false;