-- ==============================================================================
-- MIGRATION: 20261104000003_social_connections_discovery.sql
-- PURPOSE: Social Connections, Follows, and Discovery Indexes with RLS
-- ==============================================================================

-- 1. SOCIAL FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.social_follows (
    follower_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_social_follows_following ON public.social_follows(following_id);

-- 2. SOCIAL CONNECTIONS (Friend Requests & Two-Way Friendships)
CREATE TABLE IF NOT EXISTS public.social_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_no_self_connection CHECK (requester_id <> recipient_id),
    CONSTRAINT uq_connection_pair UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_social_connections_requester ON public.social_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_recipient ON public.social_connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_status ON public.social_connections(status);

-- 3. GIN INDEXES FOR INTERESTS & HOBBIES DISCOVERY
CREATE INDEX IF NOT EXISTS idx_social_profiles_interests ON public.social_profiles USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_social_profiles_hobbies ON public.social_profiles USING GIN (hobbies);
CREATE INDEX IF NOT EXISTS idx_social_profiles_languages ON public.social_profiles USING GIN (languages);
CREATE INDEX IF NOT EXISTS idx_social_profiles_city ON public.social_profiles(city);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Follows RLS: Public can view who follows whom
CREATE POLICY "Public can view social follows"
    ON public.social_follows FOR SELECT
    TO authenticated
    USING (TRUE);

-- Follows RLS: Users can only create or delete their own follows
CREATE POLICY "Users can create their own follows"
    ON public.social_follows FOR INSERT
    TO authenticated
    WITH CHECK (
        follower_id IN (
            SELECT id FROM public.social_profiles WHERE account_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own follows"
    ON public.social_follows FOR DELETE
    TO authenticated
    USING (
        follower_id IN (
            SELECT id FROM public.social_profiles WHERE account_id = auth.uid()
        )
    );

-- Connections RLS: Users can view connection requests where they are requester or recipient
CREATE POLICY "Users can view their own connections"
    ON public.social_connections FOR SELECT
    TO authenticated
    USING (
        requester_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()) OR
        recipient_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
    );

-- Connections RLS: Requester can insert
CREATE POLICY "Users can send connection requests"
    ON public.social_connections FOR INSERT
    TO authenticated
    WITH CHECK (
        requester_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
    );

-- Connections RLS: Recipient can update status (accept/reject), Requester can withdraw
CREATE POLICY "Participants can update connection status"
    ON public.social_connections FOR UPDATE
    TO authenticated
    USING (
        requester_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()) OR
        recipient_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
    );
