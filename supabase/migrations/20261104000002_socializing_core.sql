-- ==============================================================================
-- MIGRATION: 20261104000002_socializing_core.sql
-- PURPOSE: Socializing Profile Extensions, Posts, Media, Reactions, and Comments
-- ==============================================================================

-- 1. SOCIAL PROFILE EXTENSIONS (Pronouns, Location breakdown, Preferences)
ALTER TABLE public.social_profiles
ADD COLUMN IF NOT EXISTS pronouns TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS allow_dms_from TEXT DEFAULT 'everyone' CHECK (allow_dms_from IN ('everyone', 'connections', 'none')),
ADD COLUMN IF NOT EXISTS show_activity_status BOOLEAN DEFAULT TRUE;

-- 2. SOCIAL POSTS
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    content TEXT,
    post_type TEXT NOT NULL DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'multi_image', 'video', 'poll')),
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    poll_options JSONB, -- Array of { id: string, text: string, votes: number }
    reshares_post_id UUID REFERENCES public.social_posts(id) ON DELETE SET NULL,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    shares_count INT NOT NULL DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_author ON public.social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON public.social_posts(created_at DESC);

-- 3. SOCIAL REACTIONS
CREATE TABLE IF NOT EXISTS public.social_reactions (
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'celebrate', 'support', 'insightful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, profile_id)
);

-- 4. SOCIAL COMMENTS
CREATE TABLE IF NOT EXISTS public.social_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_comments_post ON public.social_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_comments_parent ON public.social_comments(parent_comment_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

-- Read policies: public for all active authenticated socializing members
CREATE POLICY "Authenticated users can read social posts"
    ON public.social_posts FOR SELECT
    TO authenticated
    USING (is_archived = FALSE);

CREATE POLICY "Authenticated users can insert their own social posts"
    ON public.social_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id IN (
            SELECT id FROM public.social_profiles WHERE account_id = auth.uid()
        )
    );

CREATE POLICY "Authors can update their own social posts"
    ON public.social_posts FOR UPDATE
    TO authenticated
    USING (
        author_id IN (
            SELECT id FROM public.social_profiles WHERE account_id = auth.uid()
        )
    );

CREATE POLICY "Authors can delete their own social posts"
    ON public.social_posts FOR DELETE
    TO authenticated
    USING (
        author_id IN (
            SELECT id FROM public.social_profiles WHERE account_id = auth.uid()
        )
    );

-- Reactions RLS
CREATE POLICY "Authenticated users can view reactions"
    ON public.social_reactions FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Users can manage their own reactions"
    ON public.social_reactions FOR ALL
    TO authenticated
    USING (
        profile_id IN (
            SELECT id FROM public.social_profiles WHERE account_id = auth.uid()
        )
    );

-- Comments RLS
CREATE POLICY "Authenticated users can view comments"
    ON public.social_comments FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Users can insert comments on posts"
    ON public.social_comments FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id IN (
            SELECT id FROM public.social_profiles WHERE account_id = auth.uid()
        )
    );
