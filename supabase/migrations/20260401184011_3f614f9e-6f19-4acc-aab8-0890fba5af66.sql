
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text DEFAULT '',
ADD COLUMN IF NOT EXISTS bank_details text DEFAULT '',
ADD COLUMN IF NOT EXISTS aadhaar_number text DEFAULT '',
ADD COLUMN IF NOT EXISTS photo_url text DEFAULT '',
ADD COLUMN IF NOT EXISTS hub_location text DEFAULT '',
ADD COLUMN IF NOT EXISTS role_type text DEFAULT '';
