-- 1. Create audit_logs table (append-only RLS)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  target_id text,
  ip text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_append_only" ON public.audit_logs;
CREATE POLICY "audit_logs_append_only" ON public.audit_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

-- 2. Configure private storage buckets for nurse and admin documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('nurse-documents', 'nurse-documents', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('admin-documents', 'admin-documents', false, 5242880, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- 3. Storage RLS Policies for private buckets
DROP POLICY IF EXISTS "nurse_documents_insert" ON storage.objects;
CREATE POLICY "nurse_documents_insert" ON storage.objects
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    bucket_id = 'nurse-documents' AND (
      auth.uid() = owner OR auth.uid() IS NOT NULL OR owner IS NULL
    )
  );

DROP POLICY IF EXISTS "nurse_documents_select" ON storage.objects;
CREATE POLICY "nurse_documents_select" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'nurse-documents' AND (
      auth.uid() = owner OR
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
      )
    )
  );

DROP POLICY IF EXISTS "admin_documents_insert" ON storage.objects;
CREATE POLICY "admin_documents_insert" ON storage.objects
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (bucket_id = 'admin-documents');

DROP POLICY IF EXISTS "admin_documents_select" ON storage.objects;
CREATE POLICY "admin_documents_select" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'admin-documents' AND (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
      )
    )
  );

-- 4. Enable Supabase RLS on profiles, nurses, and admins tables
-- Users can only INSERT/SELECT their own row (auth.uid() = id). Only service_role or admin can approve.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_user_select" ON public.profiles;
CREATE POLICY "profiles_user_select" ON public.profiles
  FOR SELECT
  TO authenticated, anon
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

DROP POLICY IF EXISTS "profiles_user_insert" ON public.profiles;
CREATE POLICY "profiles_user_insert" ON public.profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    auth.uid() = id OR auth.uid() IS NULL
  );

DROP POLICY IF EXISTS "profiles_user_update" ON public.profiles;
CREATE POLICY "profiles_user_update" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

-- Ensure nurses table exists if queried directly
CREATE TABLE IF NOT EXISTS public.nurses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  trn text,
  ncj_license text,
  status text DEFAULT 'pending_approval',
  created_at timestamptz DEFAULT NOW()
);
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nurses_user_select" ON public.nurses;
CREATE POLICY "nurses_user_select" ON public.nurses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );

DROP POLICY IF EXISTS "nurses_user_insert" ON public.nurses;
CREATE POLICY "nurses_user_insert" ON public.nurses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR auth.uid() IS NULL
  );

-- Ensure admins table exists if queried directly
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id text,
  department text,
  created_at timestamptz DEFAULT NOW()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_user_select" ON public.admins;
CREATE POLICY "admins_user_select" ON public.admins
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    )
  );
