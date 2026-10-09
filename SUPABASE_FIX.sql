-- FIX NURSE SIGNUP RLS BLOCK
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert nurses" ON public.nurses;
CREATE POLICY "Allow public insert nurses" ON public.nurses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all select profiles" ON public.profiles;
CREATE POLICY "Allow all select profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all select nurses" ON public.nurses;
CREATE POLICY "Allow all select nurses" ON public.nurses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;
CREATE POLICY "Allow update own profile" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update nurses" ON public.nurses;
CREATE POLICY "Allow update nurses" ON public.nurses FOR UPDATE USING (true) WITH CHECK (true);
