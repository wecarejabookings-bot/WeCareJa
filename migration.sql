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

-- 4. Create topics_directory table
CREATE TABLE IF NOT EXISTS public.topics_directory (
  id text PRIMARY KEY,
  card_number text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  description text DEFAULT '',
  image_url text NOT NULL,
  fallback_url text DEFAULT '',
  category text NOT NULL DEFAULT 'Special Deals',
  badge_text text DEFAULT '',
  badge_color text DEFAULT 'from-blue-600 to-indigo-600 text-white',
  tags text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE public.topics_directory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read topics" ON public.topics_directory;
CREATE POLICY "public read topics" ON public.topics_directory FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin all topics" ON public.topics_directory;
CREATE POLICY "admin all topics" ON public.topics_directory FOR ALL USING (true) WITH CHECK (true);

-- Seed initial 10 Topics
INSERT INTO public.topics_directory (id, card_number, title, subtitle, description, image_url, fallback_url, category, badge_text, badge_color, tags, is_active, sort_order)
VALUES
('exclusive_promos', '#01', 'Exclusive Health Care Promotions & Advertisements', 'Welcome voucher $500 off, 3x daily elder guardian packages & post-op savings', 'Discover exclusive discounts for Kingston, St. Andrew & Portmore families. Apply voucher WECARE2026 for JMD $500 off your first clinical visit or wound care session.', '/images/wound_dressing.webp', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400', 'Special Deals', 'Special Deals', 'from-amber-500 to-orange-500 text-slate-950', ARRAY['Voucher WECARE2026', '3x Daily Elder Care', 'Sterile Wound Care', 'Save JMD $500'], true, 1),
('hospital_vs_home', '#02', 'Skip Hospital Waiting — VIP Care Right on Your Sofa', 'Why wait 8 hours at KPH or Spanish Town? Verified nurse arrives in 15–30 mins', 'Zero minute hospital emergency room waiting, no taxi gridlock, zero contagion risk. 1-on-1 private licensed nurse delivered right to your bedside.', '/images/elderly_vitals.webp', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400', 'Home Advantage', 'Home Advantage', 'from-rose-500 to-pink-500 text-white', ARRAY['0 Min Wait Time', 'Zero Contagion Risk', 'No Taxi Gridlock', '1-on-1 Nurse Attention'], true, 2),
('clinical_services', '#03', 'In-Home Clinical Nursing Procedures & Rates', 'Wound care, IV therapy, catheterization, vitals check, medication & senior respite', 'Transparent JMD pricing for sterile wound dressings, IV cannulation, diabetic insulin administration, and comprehensive vital sign assessments.', '/images/iv_therapy.webp', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400', 'Procedures', 'Procedures', 'from-blue-600 to-indigo-600 text-white', ARRAY['Wound Dressings', 'IV Drip Therapy', 'Blood Pressure & Glucose', 'Transparent JMD Rates'], true, 3),
('medical_store', '#04', 'Medical Supplies & Home Healthcare Equipment Store (/store)', 'Order BP monitors, pulse oximeters, wheelchairs, commodes, wound kits & diapers', 'Premium medical supplies with same-day doorstep dispatch in Kingston, St. Andrew & St. Catherine. Pay via NCB, BNS, or credit card.', '/images/bp_monitor.webp', 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500', 'Supplies & Equipment', 'Supplies & Equipment', 'from-emerald-500 to-teal-500 text-slate-950', ARRAY['Digital BP Monitors', 'Pulse Oximeters', 'Foldable Wheelchairs', 'Adult Diapers & Kits'], true, 4),
('escrow_security', '#05', '100% Escrow Protection, NCJ Licensing & Safe Payouts', 'Funds securely held until service is completed. 100% Nursing Council verified', 'Peace of mind payments. Client funds are kept in secure escrow until nurse verifies doorstep completion with EHR notes.', '/images/senior_respite.webp', 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=400', 'Safety & Escrow', 'Safety & Escrow', 'from-purple-600 to-indigo-600 text-white', ARRAY['100% Escrow Fund Safety', 'NCJ Verified Staff', 'Live Proximity Engine', 'EHR Clinical Notes'], true, 5),
('jamaica_health_news', '#06', 'Official Jamaica Health News & Ministry Advisories (MOHW)', 'Live Ministry of Health bulletins, Dengue alerts, heatwave tips & community guidance', 'Stay informed with real-time updates directly from the Ministry of Health & Wellness (MOHW) Jamaica, health bulletins, and tropical wellness guidelines.', '/images/medication_management.webp', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400', 'Public Health', 'Public Health', 'from-sky-500 to-blue-600 text-white', ARRAY['MOHW Verified Alerts', 'Dengue Prevention', 'Clinic Bulletins', 'Community Wellness'], true, 6),
('emergency_119', '#07', '119 Emergency Speed Dial & Instant Medical SOS Beacon', 'One-tap direct speed dial to Jamaica 119, GPS location broadcast & ER hospital contacts', 'Critical emergency beacon. Directly speed-dials 119 (Police), 110 (Ambulance & Fire), and sends instant GPS coordinates to emergency dispatchers.', '/images/vitals_monitoring.webp', 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&q=80&w=400', 'Emergency SOS', 'Emergency SOS', 'from-red-600 to-rose-600 text-white', ARRAY['119 Police Speed Dial', '110 Fire & Ambulance', 'KPH & Spanish Town ER', 'GPS Beacon'], true, 7),
('family_reviews', '#08', 'Verified Jamaican Patient & Family Stories (4.9 ★)', 'Real reviews from Kingston 6, Portmore Pines, Spanish Town & St. Andrew families', 'Over 1,420+ completed visits and 4.9 star ratings. Read authentic testimonials from Jamaican families and diaspora relatives managing elder care.', '/images/mobility_hydration.webp', 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=400', 'Reviews & Trust', 'Reviews & Trust', 'from-amber-400 to-yellow-500 text-slate-950', ARRAY['1,420+ Visits Completed', '4.9 Star Rating', 'Verified Patient Feedback', 'Real Jamaican Stories'], true, 8),
('how_it_works', '#09', 'How WeCare Works (Simple 3-Step Visual Guide)', '1. Choose Care -> 2. Matched with Nearby Nurse -> 3. Safe Escrow Payment', 'Simple 3-step process designed for everyone. Pick clinical service, get matched with closest verified nurse in 15-30 mins, and approve completed care.', '/images/palliative_comfort.webp', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400', 'How It Works', 'How It Works', 'from-cyan-500 to-blue-600 text-white', ARRAY['Step 1: Pick Service', 'Step 2: Rapid Dispatch (15-30m)', 'Step 3: Escrow Approval'], true, 9),
('nurse_careers', '#10', 'Join As a Registered Nurse or Caregiver (Top Earnings)', 'Earn up to 85% per visit with guaranteed bank transfers (NCB, BNS, JN, Sagicor)', 'WeCare pays the highest nursing rates in Jamaica. Direct weekly deposits into your NCB, Scotiabank, JN Bank or Sagicor account with flexible scheduling.', '/images/gauze_dressing.webp', 'https://images.unsplash.com/photo-1594824813570-781e600570b5?auto=format&fit=crop&q=80&w=400', 'Careers & Earnings', 'Careers & Earnings', 'from-emerald-500 to-green-600 text-white', ARRAY['Highest Earnings in Jamaica', 'Weekly Bank Deposits', 'Flexible Hours', 'Full Independence'], true, 10)
ON CONFLICT (id) DO UPDATE SET
  card_number = EXCLUDED.card_number,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  badge_text = EXCLUDED.badge_text,
  badge_color = EXCLUDED.badge_color,
  tags = EXCLUDED.tags,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- 5. Create general app_cms_content table for ALL text and images across the app
CREATE TABLE IF NOT EXISTS public.app_cms_content (
  id text PRIMARY KEY,
  section text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  title text NOT NULL,
  description text DEFAULT '',
  value text NOT NULL,
  default_value text NOT NULL,
  updated_at timestamptz DEFAULT NOW(),
  updated_by text DEFAULT 'admin'
);

ALTER TABLE public.app_cms_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read cms" ON public.app_cms_content;
CREATE POLICY "public read cms" ON public.app_cms_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "admin all cms" ON public.app_cms_content;
CREATE POLICY "admin all cms" ON public.app_cms_content FOR ALL USING (true) WITH CHECK (true);

-- Seed general CMS items
INSERT INTO public.app_cms_content (id, section, content_type, title, description, value, default_value)
VALUES
('homepage_hero_badge', 'Homepage Hero', 'text', 'Hero Badge Text', 'Top announcement pill on homepage', 'Jamaica''s Premier On-Demand Nursing Network', 'Jamaica''s Premier On-Demand Nursing Network'),
('homepage_hero_title', 'Homepage Hero', 'text', 'Main Hero Title', 'Main large headline on homepage', 'Hospital-Grade Nursing Care Delivered to Your Bedside', 'Hospital-Grade Nursing Care Delivered to Your Bedside'),
('homepage_hero_subtitle', 'Homepage Hero', 'textarea', 'Main Hero Subtitle', 'Description paragraph under homepage title', 'Skip crowded hospital waiting rooms. Verified, NCJ-licensed Jamaican nurses arrive in 15–30 minutes across Kingston, St. Andrew & St. Catherine.', 'Skip crowded hospital waiting rooms. Verified, NCJ-licensed Jamaican nurses arrive in 15–30 minutes across Kingston, St. Andrew & St. Catherine.'),
('business_address', 'Contact & Business', 'text', 'Corporate Address', 'Physical office address for Jamaica operations', '4 Claudete Drive, St. Catherine, Jamaica', '4 Claudete Drive, St. Catherine, Jamaica'),
('contact_phone', 'Contact & Business', 'text', 'Support Phone', 'Primary WhatsApp and phone line', '(876) 582-7613', '(876) 582-7613'),
('contact_email', 'Contact & Business', 'text', 'Support Email', 'Official bookings and support email', 'wecareja.bookings@gmail.com', 'wecareja.bookings@gmail.com'),
('emergency_sos_title', 'Emergency SOS', 'text', '119 SOS Headline', 'Emergency 119 header text', '119 Emergency Speed Dial & Instant Medical SOS Beacon', '119 Emergency Speed Dial & Instant Medical SOS Beacon'),
('first_visit_voucher_code', 'Promotions & Vouchers', 'text', 'First Visit Voucher Code', 'Promo code used by clients for JMD $500 discount', 'WECARE2026', 'WECARE2026'),
('nurse_payout_rate', 'Nurse Careers', 'text', 'Nurse Caregiver Pool Share', 'Percentage of visit fee paid to nurses', '85%', '85%')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  value = EXCLUDED.value;

