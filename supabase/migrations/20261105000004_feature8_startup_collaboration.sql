-- ====================================================================
-- Feature 8: Startup Collaboration Network Migration
-- Option A: Controlled Outreach Policy
-- ====================================================================

-- 1. Startup Collaboration Profiles
CREATE TABLE IF NOT EXISTS startup_collaboration_profiles (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  what_we_do TEXT NOT NULL,
  products_and_services TEXT[] DEFAULT '{}',
  industries_served TEXT[] DEFAULT '{}',
  target_customers TEXT DEFAULT '',
  technologies TEXT[] DEFAULT '{}',
  what_we_offer TEXT NOT NULL,
  what_we_need TEXT NOT NULL,
  preferred_partnership_types TEXT[] DEFAULT '{}',
  collaboration_goals TEXT DEFAULT '',
  broad_operating_regions TEXT[] DEFAULT '{}',
  preferred_contact_method TEXT NOT NULL DEFAULT 'platform_proposal',
  is_actively_seeking BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Collaboration Proposals (Requests)
CREATE TABLE IF NOT EXISTS collaboration_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  receiver_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  sent_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  collab_type TEXT NOT NULL,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'detailed',
  summary TEXT,
  message TEXT,
  compatibility_reason TEXT,
  expected_benefits TEXT,
  what_we_offer TEXT NOT NULL,
  what_we_need TEXT NOT NULL,
  commercial_terms TEXT,
  responsibilities TEXT[] DEFAULT '{}',
  proposed_duration TEXT,
  success_criteria TEXT,
  expected_outcomes TEXT,
  supporting_links TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'sent',
  status_handled_by_profile_id UUID REFERENCES founder_profiles(id) ON DELETE SET NULL,
  status_updated_at TIMESTAMPTZ,
  more_info_query TEXT,
  more_info_response TEXT,
  meeting_details JSONB,
  counter_proposals JSONB DEFAULT '[]'::jsonb,
  partnership_space_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_proposals_initiator ON collaboration_proposals(initiator_startup_id);
CREATE INDEX IF NOT EXISTS idx_collab_proposals_receiver ON collaboration_proposals(receiver_startup_id);
CREATE INDEX IF NOT EXISTS idx_collab_proposals_status ON collaboration_proposals(status);

-- 3. Controlled Outreach Allowances (Option A: 5 per rolling 7 days)
CREATE TABLE IF NOT EXISTS startup_outreach_allowances (
  startup_id UUID PRIMARY KEY REFERENCES startups(id) ON DELETE CASCADE,
  base_weekly_limit INTEGER NOT NULL DEFAULT 5,
  earned_bonus_limit INTEGER NOT NULL DEFAULT 0,
  proposals_sent_in_rolling_period INTEGER NOT NULL DEFAULT 0,
  resets_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Private Partnership Spaces (for Accepted Partnerships)
CREATE TABLE IF NOT EXISTS partnership_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_proposal_id UUID REFERENCES collaboration_proposals(id) ON DELETE SET NULL,
  startup_a_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  startup_b_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  partnership_type TEXT NOT NULL,
  objectives TEXT NOT NULL,
  agreed_duration TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_completion_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  authorized_member_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_spaces_startup_a ON partnership_spaces(startup_a_id);
CREATE INDEX IF NOT EXISTS idx_partnership_spaces_startup_b ON partnership_spaces(startup_b_id);

-- 5. Partnership Private Chat Messages
CREATE TABLE IF NOT EXISTS partnership_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  sender_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_messages_space ON partnership_messages(space_id);

-- 6. Partnership Tasks
CREATE TABLE IF NOT EXISTS partnership_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assigned_profile_id UUID REFERENCES founder_profiles(id) ON DELETE SET NULL,
  assigned_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'todo',
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_tasks_space ON partnership_tasks(space_id);

-- 7. Partnership Milestones
CREATE TABLE IF NOT EXISTS partnership_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_milestones_space ON partnership_milestones(space_id);

-- 8. Partnership Documents
CREATE TABLE IF NOT EXISTS partnership_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  uploaded_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  uploaded_by_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  file_type TEXT,
  access_level TEXT NOT NULL DEFAULT 'all_partners',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_documents_space ON partnership_documents(space_id);

-- 9. Partnership Meetings
CREATE TABLE IF NOT EXISTS partnership_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'IST (UTC+05:30)',
  agenda TEXT NOT NULL,
  meeting_url_or_location TEXT,
  notes TEXT,
  follow_up_actions TEXT[] DEFAULT '{}',
  scheduled_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_meetings_space ON partnership_meetings(space_id);

-- 10. Partnership Referrals
CREATE TABLE IF NOT EXISTS partnership_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  referring_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  receiving_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  customer_reference TEXT NOT NULL,
  referral_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'submitted',
  outcome_notes TEXT,
  commission_terms TEXT,
  reported_revenue_value NUMERIC(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_referrals_space ON partnership_referrals(space_id);

-- 11. Partnership Commissions
CREATE TABLE IF NOT EXISTS partnership_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES partnership_referrals(id) ON DELETE SET NULL,
  commission_type TEXT NOT NULL,
  rate_or_amount TEXT NOT NULL,
  calculation_basis TEXT,
  payment_frequency TEXT,
  reported_payment_status TEXT NOT NULL DEFAULT 'pending',
  legal_disclaimer TEXT NOT NULL DEFAULT 'Payments occur directly between startups. Balaga does not hold funds or escrow.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Partnership Reviews (1 review per participating startup per completed partnership)
CREATE TABLE IF NOT EXISTS partnership_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  reviewer_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  reviewed_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  reviewer_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  communication INTEGER NOT NULL CHECK (communication >= 1 AND communication <= 5),
  professionalism INTEGER NOT NULL CHECK (professionalism >= 1 AND professionalism <= 5),
  reliability INTEGER NOT NULL CHECK (reliability >= 1 AND reliability <= 5),
  delivery INTEGER NOT NULL CHECK (delivery >= 1 AND delivery <= 5),
  transparency INTEGER NOT NULL CHECK (transparency >= 1 AND transparency <= 5),
  overall_experience INTEGER NOT NULL CHECK (overall_experience >= 1 AND overall_experience <= 5),
  feedback TEXT NOT NULL,
  right_of_reply JSONB,
  is_moderated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (space_id, reviewer_startup_id)
);

CREATE INDEX IF NOT EXISTS idx_partnership_reviews_reviewed ON partnership_reviews(reviewed_startup_id);

-- 13. Partnership Disputes
CREATE TABLE IF NOT EXISTS partnership_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES partnership_spaces(id) ON DELETE CASCADE,
  opened_by_startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  opened_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  supporting_evidence TEXT[] DEFAULT '{}',
  other_party_response TEXT,
  status TEXT NOT NULL DEFAULT 'opened',
  platform_assistance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_partnership_disputes_space ON partnership_disputes(space_id);

-- 14. Enable Row Level Security (RLS)
ALTER TABLE startup_collaboration_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_outreach_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_disputes ENABLE ROW LEVEL SECURITY;

-- Collaboration Profiles Policy
CREATE POLICY "Public collaboration profiles viewable in Founders world"
  ON startup_collaboration_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Authorized startup managers can update collaboration profile"
  ON startup_collaboration_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.startup_members sm
      JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
      WHERE sm.startup_id = startup_collaboration_profiles.startup_id
        AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
        AND (sm.role IN ('owner', 'admin') OR sm.can_manage_collabs = TRUE)
    )
  );

-- Collaboration Proposals Policies
CREATE POLICY "Participating startup members can view proposals"
  ON collaboration_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.startup_members sm
      JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
      WHERE (sm.startup_id = collaboration_proposals.initiator_startup_id
             OR sm.startup_id = collaboration_proposals.receiver_startup_id)
        AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
    )
  );

-- Partnership Spaces Policies
CREATE POLICY "Authorized workspace members can view space"
  ON partnership_spaces FOR SELECT
  USING (
    auth.uid() = ANY(authorized_member_ids)
    OR EXISTS (
      SELECT 1 FROM public.founder_profiles fp
      WHERE fp.account_id = auth.uid() AND fp.id = ANY(authorized_member_ids)
    )
    OR EXISTS (
      SELECT 1 FROM public.startup_members sm
      JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
      WHERE (sm.startup_id = partnership_spaces.startup_a_id
             OR sm.startup_id = partnership_spaces.startup_b_id)
        AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
        AND (sm.role IN ('owner', 'admin') OR sm.can_manage_collabs = TRUE)
    )
  );

-- Reviews Policy
CREATE POLICY "Public can view completed partnership reviews"
  ON partnership_reviews FOR SELECT
  USING (is_moderated = FALSE);
