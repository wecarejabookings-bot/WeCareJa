-- FIX PROFILES RECURSION & ALLOW ADMIN TO MANAGE ALL PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Drop existing policies to prevent infinite recursion
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users full access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow update nurses" ON public.profiles;

-- 2. Allow all select profiles (No recursion)
CREATE POLICY "Allow all select profiles" ON public.profiles
FOR SELECT
TO public
USING (true);

-- 3. Allow public/anon insert profiles on signup
CREATE POLICY "Allow public insert profiles" ON public.profiles
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Allow admin role and user to update/delete profiles
CREATE POLICY "Admin can manage all profiles" ON public.profiles
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'role' = 'admin') OR 
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR
  (auth.jwt() ->> 'email' = 'wecareja.bookings@gmail.com') OR
  (auth.uid() = id)
)
WITH CHECK (
  (auth.jwt() ->> 'role' = 'admin') OR 
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin') OR
  (auth.jwt() ->> 'email' = 'wecareja.bookings@gmail.com') OR
  (auth.uid() = id)
);
