-- ==============================================================================
-- BALAGA FOUNDERS: FEATURE 9 — REFERRAL EXCHANGE MIGRATION
-- Database schema for standalone B2B & professional referral marketplace,
-- Option C dual commission disclosure & negotiation, pipeline tracking,
-- customer data privacy, startup permissions, and moderation.
-- ==============================================================================

-- 1. REFERRAL LISTINGS
CREATE TABLE IF NOT EXISTS referral_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_type TEXT NOT NULL CHECK (publisher_type IN ('individual', 'startup')),
  publisher_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('offering', 'requesting')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  customer_category TEXT NOT NULL,
  product_or_service TEXT NOT NULL,
  ideal_referral_profile TEXT NOT NULL,
  required_qualifications TEXT,
  broad_region TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  referral_arrangement TEXT NOT NULL CHECK (referral_arrangement IN ('mutual_referral', 'one_way', 'commission_based', 'non_commercial', 'open_discussion')),
  commission_choice TEXT NOT NULL CHECK (commission_choice IN ('no_commission', 'fixed', 'percentage', 'recurring', 'negotiable', 'open_to_discussion')),
  disclosed_commission_details TEXT,
  expiry_date TIMESTAMPTZ NOT NULL,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'expired')),
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'monitoring', 'flagged', 'restricted', 'removed')),
  moderation_reason TEXT,
  views_count INT NOT NULL DEFAULT 0,
  requests_count INT NOT NULL DEFAULT 0,
  saved_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. REFERRAL REQUESTS
CREATE TABLE IF NOT EXISTS referral_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES referral_listings(id) ON DELETE CASCADE,
  requester_type TEXT NOT NULL CHECK (requester_type IN ('individual', 'startup')),
  requester_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  requester_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  relevance TEXT NOT NULL,
  potential_opportunity TEXT NOT NULL,
  relevant_product_or_startup TEXT,
  expected_outcome TEXT NOT NULL,
  supporting_links JSONB DEFAULT '[]'::jsonb,
  additional_context TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'received', 'under_review', 'more_info_requested', 'accepted', 'rejected', 'in_progress', 'qualified', 'converted', 'closed', 'withdrawn')),
  status_notes TEXT,
  more_info_query TEXT,
  more_info_response TEXT,
  partnership_space_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REFERRAL COMMISSION AGREEMENTS (Option C Versioned Agreements)
CREATE TABLE IF NOT EXISTS referral_commission_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES referral_requests(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES referral_listings(id) ON DELETE CASCADE,
  party_a_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  party_b_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  party_a_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  party_b_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  current_version INT NOT NULL DEFAULT 1,
  is_fully_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. REFERRAL COMMISSION VERSIONS
CREATE TABLE IF NOT EXISTS referral_commission_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES referral_commission_agreements(id) ON DELETE CASCADE,
  version INT NOT NULL,
  proposed_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  proposed_by_party TEXT NOT NULL CHECK (proposed_by_party IN ('publisher', 'requester')),
  commission_type TEXT NOT NULL CHECK (commission_type IN ('no_commission', 'fixed', 'percentage', 'recurring', 'custom')),
  rate_or_amount TEXT NOT NULL,
  calculation_basis TEXT NOT NULL,
  payment_frequency TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  confirmed_by_party_a BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_by_party_b BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('draft', 'proposed', 'confirmed', 'superseded', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- 5. REFERRAL PIPELINE & OUTCOME TRACKING (With Customer Privacy Protection)
CREATE TABLE IF NOT EXISTS referral_pipeline_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES referral_requests(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES referral_listings(id) ON DELETE CASCADE,
  partnership_space_id UUID,
  referrer_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  referrer_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  recipient_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  recipient_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  stage TEXT NOT NULL DEFAULT 'accepted' CHECK (stage IN ('accepted', 'introduced', 'contacted', 'qualified', 'converted', 'closed')),
  customer_reference TEXT NOT NULL,
  customer_private_data JSONB, -- Private contact details, strictly masked from public queries
  introduction_date TIMESTAMPTZ,
  contacted_date TIMESTAMPTZ,
  qualified_date TIMESTAMPTZ,
  conversion_date TIMESTAMPTZ,
  closed_date TIMESTAMPTZ,
  outcome_notes TEXT,
  reported_revenue_value NUMERIC(14,2),
  calculated_commission_amount NUMERIC(14,2),
  payment_status TEXT NOT NULL DEFAULT 'not_due' CHECK (payment_status IN ('not_due', 'pending', 'reported_paid', 'disputed', 'cancelled')),
  payment_reported_date TIMESTAMPTZ,
  payment_notes TEXT,
  stage_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SAVED LISTINGS
CREATE TABLE IF NOT EXISTS referral_saved_listings (
  listing_id UUID NOT NULL REFERENCES referral_listings(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (listing_id, profile_id)
);

-- 7. REFERRAL REPORTS & MODERATION
CREATE TABLE IF NOT EXISTS referral_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES referral_listings(id) ON DELETE CASCADE,
  reporter_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_referral_listings_type ON referral_listings(listing_type);
CREATE INDEX IF NOT EXISTS idx_referral_listings_status ON referral_listings(status);
CREATE INDEX IF NOT EXISTS idx_referral_listings_industry ON referral_listings(industry);
CREATE INDEX IF NOT EXISTS idx_referral_listings_publisher ON referral_listings(publisher_profile_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_listing ON referral_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_referral_requests_requester ON referral_requests(requester_profile_id);
CREATE INDEX IF NOT EXISTS idx_referral_pipeline_request ON referral_pipeline_records(request_id);
CREATE INDEX IF NOT EXISTS idx_referral_pipeline_stage ON referral_pipeline_records(stage);

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE referral_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commission_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commission_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_pipeline_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_reports ENABLE ROW LEVEL SECURITY;

-- Listings: Publicly readable if approved and active
CREATE POLICY "Public approved listings are viewable by authenticated users"
  ON referral_listings FOR SELECT
  USING (moderation_status = 'approved' AND status IN ('active', 'closed'));

-- Publishers can view and manage their own listings
CREATE POLICY "Publishers can manage their listings"
  ON referral_listings FOR ALL
  USING (publisher_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Requests: Visible only to listing publisher and requester
CREATE POLICY "Requests visible only to participants"
  ON referral_requests FOR SELECT
  USING (
    requester_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) OR
    listing_id IN (
      SELECT id FROM public.referral_listings 
      WHERE publisher_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    )
  );

-- Pipeline records: Customer private data strictly restricted to referral participants
CREATE POLICY "Pipeline records visible only to authorized referral participants"
  ON referral_pipeline_records FOR ALL
  USING (
    referrer_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) OR 
    recipient_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  );
