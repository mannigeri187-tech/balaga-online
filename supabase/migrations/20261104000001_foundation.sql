-- ==============================================================================
-- MIGRATION: 20261104000001_foundation.sql
-- PURPOSE: Platform master accounts, independent world profiles, and strict RLS
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. MASTER ACCOUNTS
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    is_18_plus_verified BOOLEAN NOT NULL DEFAULT FALSE,
    age_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    subscription_expires_at TIMESTAMPTZ,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_accounts_modtime
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. SOCIALIZING PROFILES (WORLD 1)
CREATE TABLE IF NOT EXISTS public.social_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    interests TEXT[] NOT NULL DEFAULT '{}',
    hobbies TEXT[] NOT NULL DEFAULT '{}',
    languages TEXT[] NOT NULL DEFAULT '{}',
    broad_location TEXT,
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_account_social UNIQUE (account_id)
);

CREATE INDEX IF NOT EXISTS idx_social_profiles_username ON public.social_profiles(username);
CREATE INDEX IF NOT EXISTS idx_social_profiles_account_id ON public.social_profiles(account_id);

CREATE TRIGGER update_social_profiles_modtime
    BEFORE UPDATE ON public.social_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. FOUNDERS PROFILES (WORLD 2)
CREATE TABLE IF NOT EXISTS public.founder_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    headline TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    skills TEXT[] NOT NULL DEFAULT '{}',
    interests TEXT[] NOT NULL DEFAULT '{}',
    experience_years NUMERIC(4,1),
    roles TEXT[] NOT NULL DEFAULT '{}',
    availability TEXT NOT NULL DEFAULT 'full_time' CHECK (availability IN ('full_time', 'part_time', 'weekends', 'advisory', 'not_available')),
    work_preference TEXT NOT NULL DEFAULT 'remote' CHECK (work_preference IN ('remote', 'hybrid', 'in_person')),
    broad_location TEXT NOT NULL,
    portfolio_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_account_founder UNIQUE (account_id)
);

CREATE INDEX IF NOT EXISTS idx_founder_profiles_username ON public.founder_profiles(username);
CREATE INDEX IF NOT EXISTS idx_founder_profiles_account_id ON public.founder_profiles(account_id);

CREATE TRIGGER update_founder_profiles_modtime
    BEFORE UPDATE ON public.founder_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS RLS: Users can only read and update their own master account
CREATE POLICY "Users can read their own account"
    ON public.accounts FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own account"
    ON public.accounts FOR UPDATE
    USING (auth.uid() = id);

-- SOCIAL PROFILES RLS:
-- Public can view non-private profiles
CREATE POLICY "Public can view social profiles"
    ON public.social_profiles FOR SELECT
    USING (is_private = FALSE OR account_id = auth.uid());

-- Only account owner can insert or update their social profile
CREATE POLICY "Users can insert their own social profile"
    ON public.social_profiles FOR INSERT
    WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can update their own social profile"
    ON public.social_profiles FOR UPDATE
    USING (auth.uid() = account_id);

-- FOUNDER PROFILES RLS:
-- Public can view founder profiles
CREATE POLICY "Public can view founder profiles"
    ON public.founder_profiles FOR SELECT
    TO authenticated
    USING (TRUE);

-- Only account owner can insert or update their founder profile
CREATE POLICY "Users can insert their own founder profile"
    ON public.founder_profiles FOR INSERT
    WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can update their own founder profile"
    ON public.founder_profiles FOR UPDATE
    USING (auth.uid() = account_id);
