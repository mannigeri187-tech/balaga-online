-- ==============================================================================
-- MIGRATION: 20261105000011_schema_foundation_repair.sql
-- PURPOSE: Idempotent catch-up migration ensuring all missing tables, foreign keys,
--          indexes and RLS policies are guaranteed present across incremental deployments.
-- ==============================================================================

-- 1. Ensure public.startups exists
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
    stage TEXT NOT NULL DEFAULT 'idea',
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
    verification_badge TEXT NOT NULL DEFAULT 'unverified',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    followers_count INTEGER NOT NULL DEFAULT 0,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure public.startup_members exists
CREATE TABLE IF NOT EXISTS public.startup_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    founder_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer',
    title TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    permissions TEXT[] NOT NULL DEFAULT '{}',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_startup_member_repair UNIQUE(startup_id, founder_profile_id)
);

-- 3. Ensure public.founder_posts exists
CREATE TABLE IF NOT EXISTS public.founder_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
    post_type TEXT NOT NULL DEFAULT 'general',
    content TEXT NOT NULL,
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    media_type TEXT NOT NULL DEFAULT 'none',
    audience TEXT NOT NULL DEFAULT 'public',
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

-- 4. Ensure public.opportunities exists
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publisher_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    startup_id UUID REFERENCES public.startups(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    compensation_type TEXT NOT NULL DEFAULT 'equity',
    compensation_details TEXT,
    work_mode TEXT NOT NULL DEFAULT 'remote',
    location TEXT NOT NULL DEFAULT 'Remote',
    status TEXT NOT NULL DEFAULT 'open',
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Ensure public.opportunity_applications exists
CREATE TABLE IF NOT EXISTS public.opportunity_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    applicant_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    pitch_note TEXT NOT NULL,
    portfolio_url TEXT,
    resume_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_opportunity_application_repair UNIQUE(opportunity_id, applicant_profile_id)
);

-- 6. Ensure public.founder_connections exists
CREATE TABLE IF NOT EXISTS public.founder_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    receiver_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    connection_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_founder_connection_repair UNIQUE(initiator_profile_id, receiver_profile_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repair_startups_slug ON public.startups(slug);
CREATE INDEX IF NOT EXISTS idx_repair_founder_posts_created ON public.founder_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_repair_opportunities_category ON public.opportunities(category);
