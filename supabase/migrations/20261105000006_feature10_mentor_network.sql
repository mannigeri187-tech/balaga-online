-- ============================================================================
-- FEATURE 10: MENTOR NETWORK MIGRATION
-- Balaga Founders Platform - Standalone Mentorship Marketplace (Option C)
-- Additive, Reversible, Non-Destructive Migration
-- ============================================================================

-- 1. Mentor Profiles
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id TEXT PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  introduction TEXT NOT NULL,
  professional_experience TEXT NOT NULL,
  expertise JSONB NOT NULL DEFAULT '[]'::jsonb,
  industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  company_experience TEXT NOT NULL,
  previous_mentoring_experience TEXT NOT NULL DEFAULT '',
  achievements TEXT,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  broad_location TEXT NOT NULL,
  preferred_mentee_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability_description TEXT NOT NULL,
  preferred_meeting_format TEXT NOT NULL DEFAULT 'online',
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  website_url TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'draft')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_badge_title TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  mentees_count INTEGER NOT NULL DEFAULT 0,
  sessions_completed_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentor_profiles_profile_id ON public.mentor_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_status ON public.mentor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_rating ON public.mentor_profiles(rating DESC);

-- 2. Mentorship Requests
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id TEXT PRIMARY KEY,
  mentor_id TEXT NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  project_or_startup_name TEXT NOT NULL,
  help_needed TEXT NOT NULL,
  specific_challenge TEXT NOT NULL,
  goals TEXT NOT NULL,
  reason_for_selection TEXT NOT NULL,
  preferred_format TEXT NOT NULL,
  preferred_availability TEXT NOT NULL,
  budget TEXT,
  expected_duration TEXT NOT NULL,
  additional_context TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'received', 'under_review', 'more_info_requested', 'accepted', 'rejected', 'withdrawn', 'active', 'completed', 'cancelled')
  ),
  status_notes TEXT,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  agreement_id TEXT,
  workspace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON public.mentorship_requests(mentor_profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee ON public.mentorship_requests(mentee_profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON public.mentorship_requests(status);

-- 3. Mentorship Option C Pricing Agreements
CREATE TABLE IF NOT EXISTS public.mentorship_agreements (
  id TEXT PRIMARY KEY,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  current_version INTEGER NOT NULL DEFAULT 1,
  versions JSONB NOT NULL DEFAULT '[]'::jsonb,
  confirmed_by_mentor BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_by_mentee BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at_mentor TIMESTAMPTZ,
  confirmed_at_mentee TIMESTAMPTZ,
  is_fully_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  active_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_agreements_req ON public.mentorship_agreements(mentorship_request_id);

-- 4. Mentorship Workspaces
CREATE TABLE IF NOT EXISTS public.mentorship_workspaces (
  id TEXT PRIMARY KEY,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentorship_format TEXT NOT NULL,
  agreed_objectives TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expected_duration TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  shared_notes TEXT NOT NULL DEFAULT '',
  mentor_private_notes TEXT DEFAULT '',
  mentee_private_notes TEXT DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'not_due' CHECK (
    payment_status IN ('not_due', 'pending', 'reported_paid', 'disputed', 'cancelled')
  ),
  payment_reported_date TIMESTAMPTZ,
  payment_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_workspaces_mentor ON public.mentorship_workspaces(mentor_profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_workspaces_mentee ON public.mentorship_workspaces(mentee_profile_id);

-- 5. Mentorship Sessions
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  format TEXT NOT NULL DEFAULT 'online' CHECK (format IN ('online', 'in_person', 'hybrid')),
  meeting_link_or_location TEXT NOT NULL,
  agenda TEXT,
  preparation_notes TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (
    status IN ('proposed', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')
  ),
  notes TEXT,
  action_items_created JSONB DEFAULT '[]'::jsonb,
  rescheduled_from_session_id TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_workspace ON public.mentorship_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_schedule ON public.mentorship_sessions(session_date, start_time);

-- 6. Mentorship Goals
CREATE TABLE IF NOT EXISTS public.mentorship_goals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_date TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_goals_workspace ON public.mentorship_goals(workspace_id);

-- 7. Mentorship Action Items
CREATE TABLE IF NOT EXISTS public.mentorship_action_items (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  assigned_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_action_items_workspace ON public.mentorship_action_items(workspace_id);

-- 8. Mentorship Resources
CREATE TABLE IF NOT EXISTS public.mentorship_resources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  uploaded_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'link' CHECK (resource_type IN ('document', 'link', 'template', 'guide')),
  url_or_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_resources_workspace ON public.mentorship_resources(workspace_id);

-- 9. Mentorship Reviews
CREATE TABLE IF NOT EXISTS public.mentorship_reviews (
  id TEXT PRIMARY KEY,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  knowledge_rating INTEGER NOT NULL CHECK (knowledge_rating BETWEEN 1 AND 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  helpfulness_rating INTEGER NOT NULL CHECK (helpfulness_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER NOT NULL CHECK (professionalism_rating BETWEEN 1 AND 5),
  reliability_rating INTEGER NOT NULL CHECK (reliability_rating BETWEEN 1 AND 5),
  overall_rating NUMERIC(3, 2) NOT NULL CHECK (overall_rating BETWEEN 1.0 AND 5.0),
  review_text TEXT NOT NULL,
  mentor_reply TEXT,
  mentor_replied_at TIMESTAMPTZ,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_mentorship_review UNIQUE(mentorship_request_id, mentee_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_mentorship_reviews_mentor ON public.mentorship_reviews(mentor_profile_id);

-- 10. Bookmarks & Reports
CREATE TABLE IF NOT EXISTS public.mentor_bookmarks (
  id TEXT PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentor_profile_id TEXT NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_mentor_bookmark UNIQUE(profile_id, mentor_profile_id)
);

CREATE TABLE IF NOT EXISTS public.mentor_reports (
  id TEXT PRIMARY KEY,
  mentor_profile_id TEXT NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  reporter_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reports ENABLE ROW LEVEL SECURITY;

-- Mentors are publicly readable if active
CREATE POLICY "Public active mentor profiles are viewable by all" ON public.mentor_profiles
  FOR SELECT USING (status = 'active');

CREATE POLICY "Mentors can manage own mentor profile" ON public.mentor_profiles
  FOR ALL USING (profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Requests viewable only by mentor and mentee
CREATE POLICY "Mentorship requests viewable only by participants" ON public.mentorship_requests
  FOR SELECT USING (
    mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  );

CREATE POLICY "Mentees can submit requests" ON public.mentorship_requests
  FOR INSERT WITH CHECK (mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Workspaces strictly private to participants
CREATE POLICY "Workspaces viewable only by authorized participants" ON public.mentorship_workspaces
  FOR ALL USING (
    mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  );

CREATE POLICY "Sessions viewable only by workspace participants" ON public.mentorship_sessions
  FOR ALL USING (
    mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  );

CREATE POLICY "Goals viewable only by workspace participants" ON public.mentorship_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_workspaces w
      WHERE w.id = workspace_id 
        AND (
          w.mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
          OR w.mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        )
    )
  );
