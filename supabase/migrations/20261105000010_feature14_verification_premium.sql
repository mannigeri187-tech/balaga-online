-- Migration: 20261105000010_feature14_verification_premium.sql
-- Feature 14: Verification & Premium System (Gold Premium)
-- Supports Blue Project Verification, Teal Registered Business Verification, Gold Premium Subscriptions, Profile Viewer Logging

CREATE TABLE IF NOT EXISTS verification_applications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('blue_project', 'teal_business')),
  applicant_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  applicant_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  startup_name TEXT NOT NULL,
  operating_stage TEXT,
  website TEXT,
  legal_business_name TEXT,
  registration_type TEXT,
  registration_number TEXT,
  jurisdiction TEXT,
  supporting_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('not_submitted', 'submitted', 'pending', 'verified', 'rejected', 'expired', 'suspended')),
  reviewer_notes TEXT,
  rejection_reason TEXT,
  appeal_notes TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_audit_logs (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES verification_applications(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by_account_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_subscriptions (
  account_id UUID PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('free', 'pending', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'suspended')),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
  payment_provider TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_views_log (
  id TEXT PRIMARY KEY,
  viewed_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  viewer_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_applications_status ON verification_applications(status);
CREATE INDEX IF NOT EXISTS idx_verification_applications_applicant ON verification_applications(applicant_account_id);
CREATE INDEX IF NOT EXISTS idx_verification_applications_startup ON verification_applications(startup_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_profile ON profile_views_log(viewed_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_profile ON profile_views_log(viewer_profile_id);

-- Row-Level Security
ALTER TABLE verification_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views_log ENABLE ROW LEVEL SECURITY;

-- Applicants can view their own verification applications
CREATE POLICY verification_apps_applicant_read ON verification_applications
  FOR SELECT USING (auth.uid() = applicant_account_id);

CREATE POLICY verification_apps_applicant_insert ON verification_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_account_id);

-- Subscriptions: users can read their own subscription
CREATE POLICY subscriptions_self_read ON account_subscriptions
  FOR SELECT USING (auth.uid() = account_id);

-- Profile views: Viewers can insert their own view log
CREATE POLICY profile_views_insert ON profile_views_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM founder_profiles fp 
      WHERE fp.id = viewer_profile_id AND fp.account_id = auth.uid()
    )
  );

-- Profile views: Premium profile owners can view who viewed them
CREATE POLICY profile_views_owner_read ON profile_views_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM founder_profiles fp
      JOIN accounts acc ON acc.id = fp.account_id
      WHERE fp.id = viewed_profile_id 
        AND fp.account_id = auth.uid() 
        AND acc.subscription_tier = 'premium'
    )
  );
