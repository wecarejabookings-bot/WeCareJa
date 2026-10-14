-- 1. Confirm all logins:
UPDATE auth.users SET email_confirmed_at=NOW(), confirmed_at=NOW() WHERE email_confirmed_at IS NULL;

-- 2. Fix profiles:
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  role text DEFAULT 'client',
  is_admin bool DEFAULT false,
  full_name text,
  created_at timestamptz DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles all" ON public.profiles;

CREATE POLICY "profiles all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.profiles (id,email,role,is_admin,full_name) 
SELECT id,email,'admin',true,'Sasha-Gaye Marrett-Mattis' 
FROM auth.users 
WHERE email='sashagayemarrett10@gmail.com' 
ON CONFLICT (id) DO UPDATE SET is_admin=true, role='admin';

INSERT INTO public.profiles (id,email,role,is_admin,full_name) 
SELECT id,email,'admin',true,'Sydney' 
FROM auth.users 
WHERE email='wecareja.bookings@gmail.com' 
ON CONFLICT (id) DO UPDATE SET is_admin=true, role='admin';

INSERT INTO public.profiles (id,email) 
SELECT id,email 
FROM auth.users 
ON CONFLICT (id) DO NOTHING;

-- 3. Fix store_products
DROP TABLE IF EXISTS public.store_products;
CREATE TABLE public.store_products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text, description text, category text, price_jmd numeric, stock_qty int DEFAULT 10, image_url text, is_active boolean DEFAULT true);
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read active" ON public.store_products;
CREATE POLICY "public read active" ON public.store_products FOR SELECT USING (is_active=true);
DROP POLICY IF EXISTS "admin all" ON public.store_products;
CREATE POLICY "admin all" ON public.store_products FOR ALL USING (true) WITH CHECK (true);
DELETE FROM public.store_products;
INSERT INTO public.store_products (name,description,category,price_jmd,stock_qty,image_url,is_active) VALUES
('Digital Blood Pressure Monitor','Automatic BP monitor','Equipment',8500,15,'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',true),
('Disposable Gloves Box','Box 100 latex gloves','Supplies',2500,30,'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500',true),
('First Aid Kit','Complete home kit','Kits',6500,20,'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500',true),
('Wheelchair','Foldable wheelchair','Equipment',45000,5,'https://images.unsplash.com/photo-1580281658626-ee37972c3d73?w=500',true),
('Walking Cane','Adjustable cane','Mobility',3500,25,'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500',true),
('Adult Diapers Pack','Pack of 20','Supplies',4000,40,'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',true),
('Hand Sanitizer 500ml','Antibacterial','Hygiene',1200,50,'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=500',true),
('Digital Thermometer','Infrared thermometer','Equipment',3000,20,'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500',true),
('Bedside Commode','Portable toilet chair','Equipment',18000,8,'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500',true),
('Compression Socks','Medical socks pair','Supplies',2000,35,'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500',true),
('Wound Dressing Pack','Sterile dressing kit','Supplies',1500,60,'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=500',true),
('Pill Organizer','Weekly pill box','Supplies',800,100,'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',true);

