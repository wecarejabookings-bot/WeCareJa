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
