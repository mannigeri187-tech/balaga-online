-- ==============================================================================
-- MIGRATION: 20261108000001_remote_database_hotfix.sql
-- PURPOSE: 
--   1. Resolve infinite recursion in build_space_members RLS policy (Error 42P17).
--   2. Guarantee existence of public.founder_reports table.
-- ==============================================================================

-- 1. FIX BUILD_SPACE_MEMBERS RLS RECURSION
-- Helper function to break RLS circular dependency
CREATE OR REPLACE FUNCTION public.is_build_space_member(_space_id TEXT, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM build_space_members m
    JOIN founder_profiles fp ON fp.id = m.profile_id
    WHERE m.space_id = _space_id
      AND fp.account_id = _user_id
  );
$$;

-- Drop recursive policy
DROP POLICY IF EXISTS "Members can view space members" ON build_space_members;

-- Recreate policy using security definer bypass
CREATE POLICY "Members can view space members"
  ON build_space_members FOR SELECT
  USING (
    profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR is_build_space_member(space_id, auth.uid())
  );

-- 2. GUARANTEE FOUNDER_REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.founder_reports (
    id TEXT PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL DEFAULT 'post',
    target_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    details TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_reports_reporter ON public.founder_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_founder_reports_target ON public.founder_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_founder_reports_status ON public.founder_reports(status);

ALTER TABLE public.founder_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reporters can view their own reports" ON public.founder_reports;
CREATE POLICY "Reporters can view their own reports"
  ON public.founder_reports FOR SELECT
  USING (reporter_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

DROP POLICY IF EXISTS "Founders can submit reports" ON public.founder_reports;
CREATE POLICY "Founders can submit reports"
  ON public.founder_reports FOR INSERT
  WITH CHECK (reporter_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));
