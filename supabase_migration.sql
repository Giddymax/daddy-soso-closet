-- ============================================================
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- 1. Add customer info columns to sales (safe — does nothing if already present)
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS customer_name  text,
  ADD COLUMN IF NOT EXISTS customer_phone text;

-- 2. Salon service history table
CREATE TABLE IF NOT EXISTS public.salon_sale_items (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id      uuid          NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  service_name text          NOT NULL,
  quantity     integer       NOT NULL DEFAULT 1,
  unit_price   numeric(10,2) NOT NULL,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.salon_sale_items ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users (staff/admin) full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'salon_sale_items'
      AND policyname = 'staff_manage_salon_items'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY staff_manage_salon_items ON public.salon_sale_items
        FOR ALL TO authenticated USING (true) WITH CHECK (true)
    $policy$;
  END IF;
END $$;
