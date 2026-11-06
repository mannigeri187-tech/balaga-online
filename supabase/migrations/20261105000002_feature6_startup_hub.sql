-- ==============================================================================
-- MIGRATION: 20261105000002_feature6_startup_hub.sql
-- PURPOSE: Balaga Founders Feature 6 — Startup Hub: Company profiles, team invitations,
-- Option A ownership transfer workflow, official startup updates, follows,
-- investor information inquiries, analytics events, and activity audit logs.
-- ==============================================================================

-- 1. EXTEND STARTUPS TABLE
ALTER TABLE IF EXISTS public.startups
ADD COLUMN IF NOT EXISTS full_about TEXT,
ADD COLUMN IF NOT EXISTS additional_categories TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS founded_date DATE,
ADD COLUMN IF NOT EXISTS business_model TEXT,
ADD COLUMN IF NOT EXISTS technologies TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_customers TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS visibility_settings JSONB DEFAULT '{"isPublic": true, "showTeam": true, "showContact": true, "allowCollabs": true, "allowConnects": true}'::jsonb,
ADD COLUMN IF NOT EXISTS followers_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS connections_count INT NOT NULL DEFAULT 0;

-- 2. EXTEND STARTUP MEMBERS WITH GRANULAR PERMISSIONS
ALTER TABLE IF EXISTS public.startup_members
ADD COLUMN IF NOT EXISTS can_publish_updates BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_products BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS can_manage_collabs BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. STARTUP INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.startup_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    invitee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    invited_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer', 'hiring_manager')),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_startup_invitations_startup ON public.startup_invitations(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_invitations_invitee ON public.startup_invitations(invitee_profile_id);
CREATE INDEX IF NOT EXISTS idx_startup_invitations_status ON public.startup_invitations(status);

-- 4. STARTUP OWNERSHIP TRANSFER REQUESTS TABLE (OPTION A CONFIRMED DECISION)
CREATE TABLE IF NOT EXISTS public.startup_ownership_transfer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    current_owner_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    target_owner_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    previous_owner_resulting_role TEXT NOT NULL CHECK (previous_owner_resulting_role IN ('admin', 'editor', 'viewer')),
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transfer_requests_startup ON public.startup_ownership_transfer_requests(startup_id);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_target ON public.startup_ownership_transfer_requests(target_owner_profile_id);

-- 5. OFFICIAL STARTUP UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.startup_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    author_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    update_type TEXT NOT NULL CHECK (update_type IN ('announcement', 'milestone', 'product_update', 'partnership', 'hiring', 'funding', 'event', 'achievement', 'general')),
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    associated_product_id UUID,
    associated_job_id UUID REFERENCES public.startup_jobs(id) ON DELETE SET NULL,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    shares_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_startup_updates_startup ON public.startup_updates(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_updates_type ON public.startup_updates(update_type);

CREATE TRIGGER update_startup_updates_modtime
    BEFORE UPDATE ON public.startup_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. STARTUP FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.startup_follows (
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (startup_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_startup_follows_profile ON public.startup_follows(profile_id);

-- 7. STARTUP CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.startup_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    requester_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_startup_connection UNIQUE (startup_id, requester_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_startup_connections_startup ON public.startup_connections(startup_id);

-- 8. STARTUP ACTIVITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.startup_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    actor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    details TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_startup_activity_logs_startup ON public.startup_activity_logs(startup_id);

-- 9. INVESTOR INQUIRIES TABLE (INFORMATION REQUEST ONLY)
CREATE TABLE IF NOT EXISTS public.startup_invest_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    investor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('syndicate', 'angel', 'institutional', 'strategic', 'info_request')),
    ticket_size_range TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invest_inquiries_startup ON public.startup_invest_inquiries(startup_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.startup_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_ownership_transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_invest_inquiries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has update publishing permission
CREATE OR REPLACE FUNCTION public.can_publish_startup_updates(p_startup_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.startup_members sm
        JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
        WHERE sm.startup_id = p_startup_id
          AND (sm.founder_profile_id = p_user_id OR fp.account_id = p_user_id)
          AND (sm.role IN ('owner', 'admin') OR sm.can_publish_updates = TRUE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Invitations: invitee or startup owner/admin can view
CREATE POLICY invitations_select ON public.startup_invitations
    FOR SELECT USING (
        invitee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.startup_members sm
            JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
            WHERE sm.startup_id = startup_invitations.startup_id
              AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
              AND sm.role IN ('owner', 'admin')
        )
    );

-- Ownership transfer: current owner or target owner can view
CREATE POLICY ownership_transfer_select ON public.startup_ownership_transfer_requests
    FOR SELECT USING (
        current_owner_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        OR target_owner_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    );

-- Startup updates: public select, restricted insert
CREATE POLICY updates_public_select ON public.startup_updates
    FOR SELECT USING (TRUE);

CREATE POLICY updates_authorized_insert ON public.startup_updates
    FOR INSERT WITH CHECK (
        public.can_publish_startup_updates(startup_id, auth.uid())
    );

-- Activity logs: members only
CREATE POLICY activity_logs_member_select ON public.startup_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.startup_members sm
            JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
            WHERE sm.startup_id = startup_activity_logs.startup_id
              AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
        )
    );
