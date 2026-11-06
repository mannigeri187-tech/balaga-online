-- ============================================================================
-- FEATURE 11: INVESTOR NETWORK MIGRATION
-- Option C: Open Investor Profiles with Separate Verification
-- ============================================================================

-- 1. Investor Profiles
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id TEXT PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  investor_type TEXT NOT NULL,
  is_organization BOOLEAN NOT NULL DEFAULT false,
  organization_name TEXT,
  organization_logo_url TEXT,
  headline TEXT NOT NULL,
  biography TEXT NOT NULL,
  investment_experience TEXT NOT NULL,
  thesis JSONB NOT NULL DEFAULT '{}'::jsonb,
  portfolio_companies JSONB NOT NULL DEFAULT '[]'::jsonb,
  website_url TEXT,
  professional_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_contact_method TEXT NOT NULL DEFAULT 'balaga_message',
  is_available_for_intros BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  verified_badge_title TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  intros_received_count INTEGER NOT NULL DEFAULT 0,
  intros_accepted_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Investor Representatives (For organizations/funds)
CREATE TABLE IF NOT EXISTS public.investor_representatives (
  id TEXT PRIMARY KEY,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'authorized_representative',
  title TEXT NOT NULL,
  can_manage_proposals BOOLEAN NOT NULL DEFAULT true,
  can_accept_introductions BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Investor Verification Submissions
CREATE TABLE IF NOT EXISTS public.investor_verification_submissions (
  id TEXT PRIMARY KEY,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  submitted_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  document_urls TEXT[] NOT NULL DEFAULT '{}',
  official_entity_name TEXT,
  registration_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  decision_notes TEXT,
  reviewed_by_profile_id UUID REFERENCES public.founder_profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Startup Fundraising Profiles (Linked to Startup Hub startups)
CREATE TABLE IF NOT EXISTS public.startup_fundraising_profiles (
  id TEXT PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE UNIQUE,
  fundraising_status TEXT NOT NULL DEFAULT 'not_fundraising',
  privacy_level TEXT NOT NULL DEFAULT 'investors_only',
  funding_stage TEXT NOT NULL DEFAULT 'seed',
  amount_sought NUMERIC,
  currency TEXT NOT NULL DEFAULT 'INR',
  use_of_funds TEXT,
  business_traction TEXT,
  revenue_range TEXT,
  customer_growth TEXT,
  product_maturity TEXT,
  pitch_deck_url TEXT,
  pitch_deck_filename TEXT,
  demo_url TEXT,
  contact_preferences TEXT,
  updated_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Investor Introduction Requests (Founder -> Investor)
CREATE TABLE IF NOT EXISTS public.investor_intro_requests (
  id TEXT PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  founder_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  why_relevant TEXT NOT NULL,
  business_overview TEXT NOT NULL,
  fundraising_stage TEXT NOT NULL,
  amount_sought NUMERIC,
  currency TEXT DEFAULT 'INR',
  pitch_deck_url TEXT,
  specific_request TEXT NOT NULL,
  additional_message TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  status_notes TEXT,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  fundraising_conversation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Investor-to-Startup Interest Records (Investor -> Startup)
CREATE TABLE IF NOT EXISTS public.investor_interest_records (
  id TEXT PRIMARY KEY,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  personalized_note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  status_notes TEXT,
  fundraising_conversation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Private Fundraising Conversations
CREATE TABLE IF NOT EXISTS public.fundraising_conversations (
  id TEXT PRIMARY KEY,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  founder_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  discussion_status TEXT NOT NULL DEFAULT 'initial_review',
  follow_up_notes TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Secure Pitch Materials Shared in Conversations
CREATE TABLE IF NOT EXISTS public.fundraising_shared_materials (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.fundraising_conversations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  uploaded_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Investor Meetings
CREATE TABLE IF NOT EXISTS public.investor_meetings (
  id TEXT PRIMARY KEY,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  founder_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  intro_request_id TEXT REFERENCES public.investor_intro_requests(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  format TEXT NOT NULL DEFAULT 'online',
  meeting_link_or_location TEXT NOT NULL,
  agenda TEXT,
  preparation_notes TEXT,
  status TEXT NOT NULL DEFAULT 'proposed',
  proposed_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Investor Bookmarks & Follows
CREATE TABLE IF NOT EXISTS public.investor_bookmarks (
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, investor_profile_id)
);

CREATE TABLE IF NOT EXISTS public.investor_follows (
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, investor_profile_id)
);

-- 11. Investor Moderation Reports
CREATE TABLE IF NOT EXISTS public.investor_reports (
  id TEXT PRIMARY KEY,
  investor_profile_id TEXT NOT NULL REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  reporter_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investor_profiles_profile ON public.investor_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_type ON public.investor_profiles(investor_type);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_verification ON public.investor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_investor_intro_requests_investor ON public.investor_intro_requests(investor_profile_id);
CREATE INDEX IF NOT EXISTS idx_investor_intro_requests_startup ON public.investor_intro_requests(startup_id);
CREATE INDEX IF NOT EXISTS idx_investor_interest_startup ON public.investor_interest_records(startup_id);
CREATE INDEX IF NOT EXISTS idx_fundraising_conversations_participants ON public.fundraising_conversations(startup_id, investor_profile_id);
CREATE INDEX IF NOT EXISTS idx_investor_meetings_investor ON public.investor_meetings(investor_profile_id);
CREATE INDEX IF NOT EXISTS idx_investor_meetings_startup ON public.investor_meetings(startup_id);

-- Enable RLS
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_fundraising_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_intro_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_interest_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraising_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraising_shared_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_reports ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policies
CREATE POLICY "Public read for active investor profiles"
  ON public.investor_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Investor owners can update own profiles"
  ON public.investor_profiles FOR ALL
  USING (profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Authorized verification staff can view verification evidence"
  ON public.investor_verification_submissions FOR SELECT
  USING (submitted_by_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));
