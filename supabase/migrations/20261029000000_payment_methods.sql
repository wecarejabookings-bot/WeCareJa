-- Payment methods table for verified credit/debit cards
-- Amazon-style $1 authorization check: card only saved when funds verification succeeds
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id text PRIMARY KEY,
  user_id text,
  stripe_payment_method_id text,
  stripe_customer_id text,
  card_brand text,
  last4 text,
  exp_month int,
  exp_year int,
  cardholder_name text,
  is_default boolean DEFAULT true,
  verified_funds boolean DEFAULT true,
  auth_amount_cents int DEFAULT 100,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_methods read" ON public.payment_methods;
CREATE POLICY "payment_methods read" ON public.payment_methods FOR SELECT USING (true);
DROP POLICY IF EXISTS "payment_methods write" ON public.payment_methods;
CREATE POLICY "payment_methods write" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
