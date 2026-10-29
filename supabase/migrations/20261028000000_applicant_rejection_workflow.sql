-- Migration: Add rejection and resubmission workflow columns to public.profiles

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_documents text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS rejection_date timestamptz;

-- Ensure comments for documentation
COMMENT ON COLUMN public.profiles.status IS 'Application status: pending, approved, rejected';
COMMENT ON COLUMN public.profiles.rejection_reason IS 'Admin explanation of why documents were rejected';
COMMENT ON COLUMN public.profiles.rejected_documents IS 'Array of document identifiers that must be re-uploaded: dl_front, dl_back, trn, ncj_or_passport, photo, police_record, bank_or_address';
COMMENT ON COLUMN public.profiles.rejection_date IS 'Timestamp when the applicant was rejected by admin';
