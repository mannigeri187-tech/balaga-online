-- ==============================================================================
-- MIGRATION: 20261105000000_founders_core_foundation.sql
-- PURPOSE: Foundational tables for Founders realm (Startups, Posts, Opportunities, Connections)
--          Resolves missing table dependencies for feature migrations (5 through 14)
-- ==============================================================================

-- 1. STARTUPS
CREATE TABLE IF NOT EXISTS public.startups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    creator_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    one_liner TEXT,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    industry TEXT NOT NULL DEFAULT 'other',
    stage TEXT NOT NULL DEFAULT 'idea' CHECK (stage IN ('idea', 'prototype', 'early_traction', 'scaling', 'profitable')),
    team_size INTEGER NOT NULL DEFAULT 1,
    location TEXT NOT NULL DEFAULT 'Bengaluru, India',
    website_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    seeking_cofounder BOOLEAN NOT NULL DEFAULT FALSE,
    seeking_funding BOOLEAN NOT NULL DEFAULT FALSE,
    seeking_talent BOOLEAN NOT NULL DEFAULT FALSE,
    seeking_collabs BOOLEAN NOT NULL DEFAULT FALSE,
    verification_badge TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_badge IN ('unverified', 'blue_project', 'teal_business', 'suspended')),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    followers_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug);
CREATE INDEX IF NOT EXISTS idx_startups_creator ON public.startups(creator_id);
CREATE INDEX IF NOT EXISTS idx_startups_industry ON public.startups(industry);
CREATE INDEX IF NOT EXISTS idx_startups_stage ON public.startups(stage);

CREATE TRIGGER update_startups_modtime
    BEFORE UPDATE ON public.startups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. STARTUP MEMBERS & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.startup_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    founder_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    title TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive')),
    permissions TEXT[] NOT NULL DEFAULT '{}',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_startup_member UNIQUE(startup_id, founder_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_startup_members_startup ON public.startup_members(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_members_founder ON public.startup_members(founder_profile_id);

CREATE TRIGGER update_startup_members_modtime
    BEFORE UPDATE ON public.startup_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. FOUNDER POSTS
CREATE TABLE IF NOT EXISTS public.founder_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
    post_type TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('general', 'startup_announcement', 'product_launch', 'hiring', 'opportunity', 'question', 'milestone', 'collaboration')),
    content TEXT NOT NULL,
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    media_type TEXT NOT NULL DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video')),
    audience TEXT NOT NULL DEFAULT 'public' CHECK (audience IN ('public', 'founders', 'connections', 'only_me')),
    topics TEXT[] NOT NULL DEFAULT '{}',
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    reposts_count INTEGER NOT NULL DEFAULT 0,
    shares_count INTEGER NOT NULL DEFAULT 0,
    reposted_post_id UUID REFERENCES public.founder_posts(id) ON DELETE SET NULL,
    is_direct_repost BOOLEAN NOT NULL DEFAULT FALSE,
    commentary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_posts_author ON public.founder_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_founder_posts_startup ON public.founder_posts(startup_id);
CREATE INDEX IF NOT EXISTS idx_founder_posts_type ON public.founder_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_founder_posts_created ON public.founder_posts(created_at DESC);

CREATE TRIGGER update_founder_posts_modtime
    BEFORE UPDATE ON public.founder_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. FOUNDER POST LIKES & SAVES
CREATE TABLE IF NOT EXISTS public.founder_post_likes (
    post_id UUID NOT NULL REFERENCES public.founder_posts(id) ON DELETE CASCADE,
    founder_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, founder_profile_id)
);

CREATE TABLE IF NOT EXISTS public.founder_post_saves (
    post_id UUID NOT NULL REFERENCES public.founder_posts(id) ON DELETE CASCADE,
    founder_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, founder_profile_id)
);

-- 5. FOUNDER COMMENTS & REPLIES
CREATE TABLE IF NOT EXISTS public.founder_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.founder_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.founder_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_comments_post ON public.founder_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_founder_comments_parent ON public.founder_comments(parent_id);

CREATE TRIGGER update_founder_comments_modtime
    BEFORE UPDATE ON public.founder_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. OPPORTUNITIES MARKETPLACE
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publisher_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cofounder', 'collaboration', 'freelance', 'mentor', 'contributor', 'beta_tester')),
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    compensation_type TEXT NOT NULL DEFAULT 'equity' CHECK (compensation_type IN ('equity', 'fixed', 'hourly', 'rev_share', 'unpaid', 'paid_and_equity')),
    compensation_details TEXT,
    work_mode TEXT NOT NULL DEFAULT 'remote' CHECK (work_mode IN ('remote', 'hybrid', 'in_person')),
    location TEXT NOT NULL DEFAULT 'Remote',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed')),
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_publisher ON public.opportunities(publisher_profile_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);

CREATE TRIGGER update_opportunities_modtime
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. OPPORTUNITY APPLICATIONS
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    pitch_note TEXT NOT NULL,
    portfolio_url TEXT,
    resume_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'meeting', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_opportunity_application UNIQUE(opportunity_id, applicant_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_opp_applications_opp ON public.opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_applications_applicant ON public.opportunity_applications(applicant_profile_id);

CREATE TRIGGER update_opp_applications_modtime
    BEFORE UPDATE ON public.opportunity_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. FOUNDER CONNECTIONS & REQUESTS
CREATE TABLE IF NOT EXISTS public.founder_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    receiver_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    connection_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_founder_connection UNIQUE(initiator_profile_id, receiver_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_founder_connections_init ON public.founder_connections(initiator_profile_id);
CREATE INDEX IF NOT EXISTS idx_founder_connections_recv ON public.founder_connections(receiver_profile_id);
CREATE INDEX IF NOT EXISTS idx_founder_connections_status ON public.founder_connections(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_connections ENABLE ROW LEVEL SECURITY;

-- Startups Policies
CREATE POLICY "Public startups viewable by authenticated users"
    ON public.startups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Founder can create startup"
    ON public.startups FOR INSERT
    TO authenticated
    WITH CHECK (creator_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Startup owner or admin can update startup"
    ON public.startups FOR UPDATE
    TO authenticated
    USING (
        creator_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) OR
        id IN (SELECT startup_id FROM public.startup_members WHERE founder_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) AND role IN ('owner', 'admin'))
    );

-- Startup Members Policies
CREATE POLICY "Members viewable by authenticated users"
    ON public.startup_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Owner or admin can manage members"
    ON public.startup_members FOR ALL
    TO authenticated
    USING (
        startup_id IN (
            SELECT startup_id FROM public.startup_members 
            WHERE founder_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
            AND role IN ('owner', 'admin')
        ) OR
        startup_id IN (
            SELECT id FROM public.startups 
            WHERE creator_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        )
    );

-- Founder Posts Policies
CREATE POLICY "Founder posts viewable according to audience"
    ON public.founder_posts FOR SELECT
    TO authenticated
    USING (
        audience = 'public' OR
        audience = 'founders' OR
        (audience = 'only_me' AND author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()))
    );

CREATE POLICY "Authors can create posts"
    ON public.founder_posts FOR INSERT
    TO authenticated
    WITH CHECK (author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Authors can update or delete their posts"
    ON public.founder_posts FOR UPDATE
    TO authenticated
    USING (author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Authors can delete their posts"
    ON public.founder_posts FOR DELETE
    TO authenticated
    USING (author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Opportunities Policies
CREATE POLICY "Opportunities viewable by authenticated users"
    ON public.opportunities FOR SELECT
    TO authenticated
    USING (status = 'open' OR publisher_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Publishers can manage their opportunities"
    ON public.opportunities FOR ALL
    TO authenticated
    USING (publisher_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Opportunity Applications Policies
CREATE POLICY "Applicants and publishers can view applications"
    ON public.opportunity_applications FOR SELECT
    TO authenticated
    USING (
        applicant_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) OR
        opportunity_id IN (SELECT id FROM public.opportunities WHERE publisher_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()))
    );

CREATE POLICY "Applicants can insert applications"
    ON public.opportunity_applications FOR INSERT
    TO authenticated
    WITH CHECK (applicant_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Founder Connections Policies
CREATE POLICY "Participants can view connections"
    ON public.founder_connections FOR SELECT
    TO authenticated
    USING (
        initiator_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) OR
        receiver_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    );

CREATE POLICY "Initiator can send connection request"
    ON public.founder_connections FOR INSERT
    TO authenticated
    WITH CHECK (initiator_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Participants can update connection status"
    ON public.founder_connections FOR UPDATE
    TO authenticated
    USING (
        initiator_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) OR
        receiver_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    );
