-- ============================================
-- SHELTER DASHBOARD MIGRATION
-- ============================================
-- Run in Supabase Dashboard → SQL Editor
-- Adds shelter user accounts, report assignment, and accept workflow.

-- 1. Allow 'shelter' role in profiles
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'nurse', 'admin', 'shelter'));

-- 2. Link shelters to user accounts
ALTER TABLE public.shelters
  ADD COLUMN IF NOT EXISTS shelter_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Add assignment fields to shelter_reports
ALTER TABLE public.shelter_reports
  ADD COLUMN IF NOT EXISTS assigned_shelter_id uuid REFERENCES public.shelters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

-- 4. Expand report status to include 'assigned'
ALTER TABLE public.shelter_reports
  DROP CONSTRAINT IF EXISTS shelter_reports_status_check;

ALTER TABLE public.shelter_reports
  ADD CONSTRAINT shelter_reports_status_check
  CHECK (status IN ('reported', 'notified', 'assigned', 'resolved'));

-- 5. RLS: Shelter users can view their assigned reports
CREATE POLICY "Shelter users can view assigned reports"
  ON public.shelter_reports FOR SELECT USING (
    auth.uid() = reported_by
    OR exists (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
    OR exists (
      SELECT 1 FROM public.shelters
      WHERE shelters.id = shelter_reports.assigned_shelter_id
        AND shelters.shelter_user_id = auth.uid()
    )
  );

-- 6. RLS: Shelter users can update status of assigned reports
CREATE POLICY "Shelter users can update assigned reports"
  ON public.shelter_reports FOR UPDATE USING (
    exists (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
    OR exists (
      SELECT 1 FROM public.shelters
      WHERE shelters.id = shelter_reports.assigned_shelter_id
        AND shelters.shelter_user_id = auth.uid()
    )
  );

-- 7. RLS: Anyone can view shelters
CREATE POLICY "Shelter users can view own shelter"
  ON public.shelters FOR SELECT USING (
    true
  );

-- 7b. RLS: Authenticated users can insert shelter (for registration)
CREATE POLICY "Users can create shelter on signup"
  ON public.shelters FOR INSERT WITH CHECK (
    auth.uid() = shelter_user_id
  );

-- 8. Drop the old restrictive SELECT policy on shelter_reports
-- (we replaced it with a broader one above)
DROP POLICY IF EXISTS "Reports viewable by reporter and admins" ON public.shelter_reports;

-- 9. Update the handle_new_user trigger to support 'shelter' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, location)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'location', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;