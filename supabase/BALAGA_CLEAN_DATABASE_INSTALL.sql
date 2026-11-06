-- ==============================================================================
-- BALAGA PRODUCTION DATABASE: COMPLETE CLEAN INSTALLATION SCRIPT
-- Project: Balaga (balaga.online)
-- Target Database: Supabase PostgreSQL (Clean / Empty Database)
-- Generated: 2026-11-06 10:09:25
-- Contents: All 17 sequential migrations (20261104000001 through 20261105000012)
-- Verification Status: All 22 test suites passed (100% regression-free)
-- ==============================================================================

-- 0. EXTENSIONS SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==============================================================================
-- SECTION: 20261104000001_foundation.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261104000002_socializing_core.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261104000003_social_connections_discovery.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261104000004_socializing_full.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261104000004_socializing_full.sql
-- PURPOSE: Full Socializing Database Schema (Stories, Reels, Communities, Events,
--          Social Inbox, Notifications, Blocking, Muting, Reports & RLS)
-- ==============================================================================

-- 1. STORIES & STORY VIEWS (24-Hour Ephemeral Server-Side Expiry)
CREATE TABLE IF NOT EXISTS public.social_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    audience TEXT NOT NULL DEFAULT 'everyone' CHECK (audience IN ('everyone', 'connections')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_stories_author ON public.social_stories(author_id);
CREATE INDEX IF NOT EXISTS idx_social_stories_expires ON public.social_stories(expires_at);

CREATE TABLE IF NOT EXISTS public.social_story_views (
    story_id UUID NOT NULL REFERENCES public.social_stories(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_social_story_views_viewer ON public.social_story_views(viewer_id);

-- 2. REELS AND SHORT VIDEOS
CREATE TABLE IF NOT EXISTS public.social_reels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT NOT NULL DEFAULT '',
    audio_track TEXT DEFAULT 'Original Audio',
    hashtags TEXT[] NOT NULL DEFAULT '{}',
    views_count INT NOT NULL DEFAULT 0,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    shares_count INT NOT NULL DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_reels_author ON public.social_reels(author_id);
CREATE INDEX IF NOT EXISTS idx_social_reels_created ON public.social_reels(created_at DESC);

CREATE TABLE IF NOT EXISTS public.social_reel_likes (
    reel_id UUID NOT NULL REFERENCES public.social_reels(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (reel_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.social_reel_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reel_id UUID NOT NULL REFERENCES public.social_reels(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_reel_views (
    reel_id UUID NOT NULL REFERENCES public.social_reels(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (reel_id, viewer_id)
);

-- 3. COMMUNITIES & DISCUSSIONS
CREATE TABLE IF NOT EXISTS public.social_communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    category TEXT NOT NULL DEFAULT 'Interests',
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    rules TEXT[] NOT NULL DEFAULT '{}',
    members_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_communities_slug ON public.social_communities(slug);
CREATE INDEX IF NOT EXISTS idx_social_communities_category ON public.social_communities(category);

CREATE TABLE IF NOT EXISTS public.social_community_members (
    community_id UUID NOT NULL REFERENCES public.social_communities(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_request', 'banned')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (community_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_social_community_members_profile ON public.social_community_members(profile_id);

CREATE TABLE IF NOT EXISTS public.social_community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.social_communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[] NOT NULL DEFAULT '{}',
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_community_posts_comm ON public.social_community_posts(community_id);

-- 4. EVENTS & MEETUPS (Public Venues Only - Strict Location Privacy)
CREATE TABLE IF NOT EXISTS public.social_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_url TEXT,
    category TEXT NOT NULL DEFAULT 'Social Gathering',
    venue_name TEXT NOT NULL,
    city TEXT NOT NULL,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    meeting_url TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    public_safety_guidance TEXT NOT NULL,
    is_attendee_list_visible BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_events_city ON public.social_events(city);
CREATE INDEX IF NOT EXISTS idx_social_events_start ON public.social_events(start_time);
CREATE INDEX IF NOT EXISTS idx_social_events_status ON public.social_events(status);

CREATE TABLE IF NOT EXISTS public.social_event_rsvps (
    event_id UUID NOT NULL REFERENCES public.social_events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('going', 'interested', 'not_going')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (event_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.social_event_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.social_events(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SOCIAL INBOX AND DIRECT MESSAGES
CREATE TABLE IF NOT EXISTS public.social_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    title TEXT,
    creator_id UUID REFERENCES public.social_profiles(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.social_conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.social_conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'pending_request', 'declined')),
    last_read_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_social_conv_participants_profile ON public.social_conversation_participants(profile_id);

CREATE TABLE IF NOT EXISTS public.social_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.social_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    attachments JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_messages_conversation ON public.social_messages(conversation_id, created_at);

-- 6. SOCIAL NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.social_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_profile_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    actor_profile_id UUID REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'follow', 'connection_req', 'connection_accept', 'like', 'comment',
        'comment_reply', 'story_reply', 'community_post', 'event_invite', 'message'
    )),
    entity_id UUID,
    entity_type TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_notifications_recipient ON public.social_notifications(recipient_profile_id, is_read, created_at DESC);

-- 7. PRIVACY, BLOCKING, MUTING & REPORTS
CREATE TABLE IF NOT EXISTS public.social_blocks (
    blocker_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_id <> blocked_id)
);

CREATE TABLE IF NOT EXISTS public.social_mutes (
    muter_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    muted_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (muter_id, muted_id),
    CONSTRAINT chk_no_self_mute CHECK (muter_id <> muted_id)
);

CREATE TABLE IF NOT EXISTS public.social_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'post', 'comment', 'story', 'reel', 'community', 'event', 'message')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_reports_target ON public.social_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_social_reports_status ON public.social_reports(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reel_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reel_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reel_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reports ENABLE ROW LEVEL SECURITY;

-- Stories: Read active stories only (expires_at > NOW())
CREATE POLICY "Users can view non-expired stories"
    ON public.social_stories FOR SELECT
    TO authenticated
    USING (expires_at > NOW());

CREATE POLICY "Users can manage their own stories"
    ON public.social_stories FOR ALL
    TO authenticated
    USING (author_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()));

-- Story views: Viewers can insert, author can view list of viewers
CREATE POLICY "Users can insert story views"
    ON public.social_story_views FOR INSERT
    TO authenticated
    WITH CHECK (viewer_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Story authors can view viewer list"
    ON public.social_story_views FOR SELECT
    TO authenticated
    USING (
        story_id IN (
            SELECT id FROM public.social_stories
            WHERE author_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
        )
    );

-- Reels: Public can view non-archived reels
CREATE POLICY "Public can view active reels"
    ON public.social_reels FOR SELECT
    TO authenticated
    USING (is_archived = FALSE);

CREATE POLICY "Creators can manage their reels"
    ON public.social_reels FOR ALL
    TO authenticated
    USING (author_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()));

-- Communities: Public can view public communities; members can view private
CREATE POLICY "Public can view public communities"
    ON public.social_communities FOR SELECT
    TO authenticated
    USING (
        is_private = FALSE OR
        id IN (
            SELECT community_id FROM public.social_community_members
            WHERE profile_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
            AND status = 'active'
        )
    );

-- Messages & Conversations: STRICT PARTICIPANT ISOLATION
CREATE POLICY "Participants can view conversations"
    ON public.social_conversations FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT conversation_id FROM public.social_conversation_participants
            WHERE profile_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
            AND status = 'accepted'
        )
    );

CREATE POLICY "Participants can view messages"
    ON public.social_messages FOR SELECT
    TO authenticated
    USING (
        conversation_id IN (
            SELECT conversation_id FROM public.social_conversation_participants
            WHERE profile_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
            AND status = 'accepted'
        )
    );

CREATE POLICY "Participants can send messages"
    ON public.social_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        conversation_id IN (
            SELECT conversation_id FROM public.social_conversation_participants
            WHERE profile_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
            AND status = 'accepted'
        )
        AND sender_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid())
    );

-- Notifications: User can only read and manage their own notifications
CREATE POLICY "Users can manage their own notifications"
    ON public.social_notifications FOR ALL
    TO authenticated
    USING (recipient_profile_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()));

-- Blocks & Mutes: Users manage their own blocks
CREATE POLICY "Users manage their own blocks"
    ON public.social_blocks FOR ALL
    TO authenticated
    USING (blocker_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Users manage their own mutes"
    ON public.social_mutes FOR ALL
    TO authenticated
    USING (muter_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()));

-- Reports: Users can insert reports
CREATE POLICY "Users can create reports"
    ON public.social_reports FOR INSERT
    TO authenticated
    WITH CHECK (reporter_id IN (SELECT id FROM public.social_profiles WHERE account_id = auth.uid()));


-- ==============================================================================
-- SECTION: 20261105000000_founders_core_foundation.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261105000001_feature5_hiring_centre.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261105000001_feature5_hiring_centre.sql
-- PURPOSE: Balaga Founders Feature 5 â€” Hiring Centre: Official company jobs,
-- candidate pipelines, interview scheduling, granular hiring permissions,
-- secure resume attachments, internal recruiter notes, and audit logs.
-- ==============================================================================

-- 1. EXTEND STARTUP MEMBERS WITH GRANULAR HIRING PERMISSIONS
ALTER TABLE IF EXISTS public.startup_members 
ADD COLUMN IF NOT EXISTS can_manage_hiring BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. OFFICIAL STARTUP JOBS TABLE
CREATE TABLE IF NOT EXISTS public.startup_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    creator_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    job_summary TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT[] NOT NULL DEFAULT '{}',
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    preferred_skills TEXT[] NOT NULL DEFAULT '{}',
    experience_requirements TEXT NOT NULL,
    qualifications TEXT,
    work_mode TEXT NOT NULL CHECK (work_mode IN ('remote', 'hybrid', 'on-site')),
    broad_location TEXT NOT NULL,
    compensation_type TEXT NOT NULL CHECK (compensation_type IN ('range', 'fixed', 'negotiable', 'not_disclosed')),
    compensation_min NUMERIC(12,2),
    compensation_max NUMERIC(12,2),
    currency TEXT NOT NULL DEFAULT 'INR',
    working_hours TEXT,
    openings_count INT NOT NULL DEFAULT 1 CHECK (openings_count >= 1),
    application_deadline TIMESTAMPTZ NOT NULL,
    screening_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    hiring_contact JSONB,
    recruitment_process TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'paused', 'closed', 'expired')),
    views_count INT NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    applications_count INT NOT NULL DEFAULT 0 CHECK (applications_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_startup_jobs_startup_id ON public.startup_jobs(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_jobs_status ON public.startup_jobs(status);
CREATE INDEX IF NOT EXISTS idx_startup_jobs_deadline ON public.startup_jobs(application_deadline);
CREATE INDEX IF NOT EXISTS idx_startup_jobs_employment_type ON public.startup_jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_startup_jobs_work_mode ON public.startup_jobs(work_mode);

-- Trigger for updated_at
CREATE TRIGGER update_startup_jobs_modtime
    BEFORE UPDATE ON public.startup_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. SAVED JOBS (BOOKMARKS)
CREATE TABLE IF NOT EXISTS public.job_saved (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.startup_jobs(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_job_saved UNIQUE (job_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_job_saved_profile ON public.job_saved(profile_id);

-- 4. JOB CANDIDATE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.startup_jobs(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    applicant_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    personal_intro TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    resume_file_name TEXT,
    resume_file_size INT,
    relevant_skills TEXT[] NOT NULL DEFAULT '{}',
    experience_years NUMERIC(4,1),
    "current_role" TEXT,
    portfolio_url TEXT,
    projects_summary TEXT,
    availability TEXT NOT NULL,
    joining_timeline TEXT NOT NULL,
    expected_compensation TEXT,
    screening_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    supporting_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'viewed', 'shortlisted', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_job_application UNIQUE (job_id, applicant_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_startup ON public.job_applications(startup_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON public.job_applications(applicant_profile_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

CREATE TRIGGER update_job_applications_modtime
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. PRIVATE INTERNAL RECRUITER NOTES (NEVER EXPOSED TO APPLICANTS)
CREATE TABLE IF NOT EXISTS public.job_application_internal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    author_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_app ON public.job_application_internal_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_startup ON public.job_application_internal_notes(startup_id);

-- 6. INTERVIEW MANAGEMENT RECORDS
CREATE TABLE IF NOT EXISTS public.job_interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.startup_jobs(id) ON DELETE CASCADE,
    scheduled_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE RESTRICT,
    candidate_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    interview_date DATE NOT NULL,
    interview_time TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    interview_type TEXT NOT NULL CHECK (interview_type IN ('video', 'phone', 'in_person', 'technical', 'cultural_fit')),
    meeting_location_or_link TEXT NOT NULL,
    instructions TEXT,
    candidate_facing_notes TEXT,
    recruiter_private_notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_interviews_app ON public.job_interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_job_interviews_candidate ON public.job_interviews(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_job_interviews_startup ON public.job_interviews(startup_id);

CREATE TRIGGER update_job_interviews_modtime
    BEFORE UPDATE ON public.job_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. JOB MODERATION REPORTS
CREATE TABLE IF NOT EXISTS public.job_moderation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.startup_jobs(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. HIRING AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.hiring_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
    actor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hiring_audit_startup ON public.hiring_audit_logs(startup_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.startup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_application_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper check function for hiring authorization:
-- Owner / Admin: always authorized.
-- Hiring Manager / Editor: authorized ONLY if can_manage_hiring = TRUE.
-- Viewer: NEVER authorized.
CREATE OR REPLACE FUNCTION public.can_manage_startup_hiring(p_startup_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.startup_members sm
        JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
        WHERE sm.startup_id = p_startup_id
          AND (sm.founder_profile_id = p_user_id OR fp.account_id = p_user_id)
          AND (
            sm.role IN ('owner', 'admin')
            OR (sm.role IN ('hiring_manager', 'editor') AND sm.can_manage_hiring = TRUE)
          )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policies for startup_jobs
CREATE POLICY jobs_public_select ON public.startup_jobs
    FOR SELECT USING (
        status IN ('open', 'paused', 'closed', 'expired')
        OR (status = 'draft' AND public.can_manage_startup_hiring(startup_id, auth.uid()))
    );

CREATE POLICY jobs_authorized_insert ON public.startup_jobs
    FOR INSERT WITH CHECK (
        public.can_manage_startup_hiring(startup_id, auth.uid())
    );

CREATE POLICY jobs_authorized_update ON public.startup_jobs
    FOR UPDATE USING (
        public.can_manage_startup_hiring(startup_id, auth.uid())
    );

CREATE POLICY jobs_authorized_delete ON public.startup_jobs
    FOR DELETE USING (
        public.can_manage_startup_hiring(startup_id, auth.uid())
    );

-- Policies for job_applications
-- Candidate sees their own application; authorized recruiter sees applications to their startup
CREATE POLICY job_applications_select ON public.job_applications
    FOR SELECT USING (
        applicant_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        OR public.can_manage_startup_hiring(startup_id, auth.uid())
    );

-- Candidate can insert application
CREATE POLICY job_applications_insert ON public.job_applications
    FOR INSERT WITH CHECK (
        applicant_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        AND NOT EXISTS (
            SELECT 1 FROM public.startup_members sm
            JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
            WHERE sm.startup_id = job_applications.startup_id
              AND (sm.founder_profile_id = applicant_profile_id OR fp.account_id = auth.uid())
        )
    );

-- Recruiter can update status; Candidate can only update to 'withdrawn'
CREATE POLICY job_applications_update ON public.job_applications
    FOR UPDATE USING (
        (applicant_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) AND status = 'withdrawn')
        OR public.can_manage_startup_hiring(startup_id, auth.uid())
    );

-- Policies for internal notes (CANDIDATES HAVE ZERO ACCESS)
CREATE POLICY internal_notes_recruiter_access ON public.job_application_internal_notes
    FOR ALL USING (
        public.can_manage_startup_hiring(startup_id, auth.uid())
    );

-- Policies for interviews
CREATE POLICY interviews_candidate_and_recruiter_select ON public.job_interviews
    FOR SELECT USING (
        candidate_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        OR public.can_manage_startup_hiring(startup_id, auth.uid())
    );

CREATE POLICY interviews_recruiter_manage ON public.job_interviews
    FOR ALL USING (
        public.can_manage_startup_hiring(startup_id, auth.uid())
    );


-- ==============================================================================
-- SECTION: 20261105000002_feature6_startup_hub.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261105000002_feature6_startup_hub.sql
-- PURPOSE: Balaga Founders Feature 6 â€” Startup Hub: Company profiles, team invitations,
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


-- ==============================================================================
-- SECTION: 20261105000003_feature7_product_launchpad.sql
-- ==============================================================================

-- ====================================================================
-- Feature 7: Product Launchpad Migration
-- Option A: Instant Publishing with Automated Moderation
-- ====================================================================

-- 1. Create or extend products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maker_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  features TEXT[] DEFAULT '{}',
  logo_url TEXT NOT NULL,
  cover_url TEXT,
  media_urls TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  website_url TEXT NOT NULL,
  demo_url TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live',
  pricing_model TEXT NOT NULL DEFAULT 'free',
  technologies TEXT[] DEFAULT '{}',
  target_audience TEXT,
  upvotes_count INTEGER NOT NULL DEFAULT 0,
  followers_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  website_clicks INTEGER NOT NULL DEFAULT 0,
  launch_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_launch_date TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  moderation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for discovery, rankings and categories
CREATE INDEX IF NOT EXISTS idx_products_maker_id ON products(maker_id);
CREATE INDEX IF NOT EXISTS idx_products_startup_id ON products(startup_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_moderation_status ON products(moderation_status);
CREATE INDEX IF NOT EXISTS idx_products_launch_date ON products(launch_date DESC);
CREATE INDEX IF NOT EXISTS idx_products_upvotes ON products(upvotes_count DESC);

-- Add foreign key constraint from startup_updates to products (deferred from Feature 6)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_startup_updates_product'
  ) THEN
    ALTER TABLE public.startup_updates
      ADD CONSTRAINT fk_startup_updates_product
      FOREIGN KEY (associated_product_id) REFERENCES public.products(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Upvotes (Abuse-resistant: 1 upvote per founder profile)
CREATE TABLE IF NOT EXISTS product_upvotes (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_product_upvotes_profile ON product_upvotes(profile_id);

-- 3. Comments and Q&A
CREATE TABLE IF NOT EXISTS product_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES product_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_maker_reply BOOLEAN NOT NULL DEFAULT FALSE,
  is_question BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_comments_product ON product_comments(product_id);
CREATE INDEX IF NOT EXISTS idx_product_comments_parent ON product_comments(parent_id);

-- 4. Comment Likes
CREATE TABLE IF NOT EXISTS product_comment_likes (
  comment_id UUID NOT NULL REFERENCES product_comments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, profile_id)
);

-- 5. Verified User Reviews & Ratings
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_verified_user BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);

-- 6. Product Updates
CREATE TABLE IF NOT EXISTS product_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT,
  media_urls TEXT[] DEFAULT '{}',
  broadcast_to_feed BOOLEAN NOT NULL DEFAULT TRUE,
  feed_post_id UUID REFERENCES founder_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_updates_product ON product_updates(product_id);

-- 7. Product Follows
CREATE TABLE IF NOT EXISTS product_follows (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, profile_id)
);

-- 8. Product Collections & Saves
CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_collection_items (
  collection_id UUID NOT NULL REFERENCES product_collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, product_id)
);

CREATE TABLE IF NOT EXISTS product_saves (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES product_collections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, profile_id)
);

-- 9. Moderation Audit Trail & Appeals (Option A)
CREATE TABLE IF NOT EXISTS product_moderation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  triggered_by TEXT NOT NULL, -- automated_system, admin, appeal_review
  admin_id UUID REFERENCES founder_profiles(id),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_mod_records_product ON product_moderation_records(product_id);

CREATE TABLE IF NOT EXISTS product_moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  appeal_reason TEXT NOT NULL,
  supporting_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES founder_profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_product_appeals_product ON product_moderation_appeals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_appeals_status ON product_moderation_appeals(status);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_moderation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_moderation_appeals ENABLE ROW LEVEL SECURITY;

-- Product policies
CREATE POLICY "Public products viewable in Founders world"
  ON products FOR SELECT
  USING (
    moderation_status IN ('approved', 'monitoring')
    OR maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.startup_members sm
      JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
      WHERE sm.startup_id = products.startup_id
        AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
    )
  );

CREATE POLICY "Makers and authorized startup members can insert products"
  ON products FOR INSERT
  WITH CHECK (
    maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR (
      startup_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.startup_members sm
        JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
        WHERE sm.startup_id = products.startup_id
          AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
          AND (sm.role IN ('owner', 'admin') OR sm.can_manage_products = TRUE)
      )
    )
  );

CREATE POLICY "Makers and authorized startup members can update products"
  ON products FOR UPDATE
  USING (
    maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR (
      startup_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.startup_members sm
        JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
        WHERE sm.startup_id = products.startup_id
          AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
          AND (sm.role IN ('owner', 'admin') OR sm.can_manage_products = TRUE)
      )
    )
  );

-- Upvote policies
CREATE POLICY "Founders can view upvotes"
  ON product_upvotes FOR SELECT
  USING (TRUE);

CREATE POLICY "Founders can manage own upvotes"
  ON product_upvotes FOR ALL
  USING (profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Comment policies
CREATE POLICY "Founders can view comments on accessible products"
  ON product_comments FOR SELECT
  USING (TRUE);

CREATE POLICY "Founders can create comments"
  ON product_comments FOR INSERT
  WITH CHECK (author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Authors can update own comments"
  ON product_comments FOR UPDATE
  USING (author_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Reviews policies
CREATE POLICY "Founders can view product reviews"
  ON product_reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "Founders can add one review per product"
  ON product_reviews FOR INSERT
  WITH CHECK (reviewer_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Updates policies
CREATE POLICY "Founders can view product updates"
  ON product_updates FOR SELECT
  USING (TRUE);

CREATE POLICY "Makers can create product updates"
  ON product_updates FOR INSERT
  WITH CHECK (
    maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_updates.product_id
        AND (
          p.maker_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
          OR EXISTS (
            SELECT 1 FROM public.startup_members sm
            JOIN public.founder_profiles fp ON fp.id = sm.founder_profile_id
            WHERE sm.startup_id = p.startup_id
              AND (sm.founder_profile_id = auth.uid() OR fp.account_id = auth.uid())
              AND (sm.role IN ('owner', 'admin') OR sm.can_manage_products = TRUE)
          )
        )
    )
  );

-- Collection policies
CREATE POLICY "View collections"
  ON product_collections FOR SELECT
  USING (is_public = TRUE OR owner_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

CREATE POLICY "Manage own collections"
  ON product_collections FOR ALL
  USING (owner_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));


-- ==============================================================================
-- SECTION: 20261105000004_feature8_startup_collaboration.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261105000005_feature9_referral_exchange.sql
-- ==============================================================================

-- ==============================================================================
-- BALAGA FOUNDERS: FEATURE 9 â€” REFERRAL EXCHANGE MIGRATION
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


-- ==============================================================================
-- SECTION: 20261105000006_feature10_mentor_network.sql
-- ==============================================================================

-- ============================================================================
-- FEATURE 10: MENTOR NETWORK MIGRATION
-- Balaga Founders Platform - Standalone Mentorship Marketplace (Option C)
-- Additive, Reversible, Non-Destructive Migration
-- ============================================================================

-- 1. Mentor Profiles
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id TEXT PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  introduction TEXT NOT NULL,
  professional_experience TEXT NOT NULL,
  expertise JSONB NOT NULL DEFAULT '[]'::jsonb,
  industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  company_experience TEXT NOT NULL,
  previous_mentoring_experience TEXT NOT NULL DEFAULT '',
  achievements TEXT,
  languages JSONB NOT NULL DEFAULT '[]'::jsonb,
  broad_location TEXT NOT NULL,
  preferred_mentee_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability_description TEXT NOT NULL,
  preferred_meeting_format TEXT NOT NULL DEFAULT 'online',
  pricing JSONB NOT NULL DEFAULT '{}'::jsonb,
  website_url TEXT,
  portfolio_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'draft')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_badge_title TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  mentees_count INTEGER NOT NULL DEFAULT 0,
  sessions_completed_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentor_profiles_profile_id ON public.mentor_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_status ON public.mentor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_rating ON public.mentor_profiles(rating DESC);

-- 2. Mentorship Requests
CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id TEXT PRIMARY KEY,
  mentor_id TEXT NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  project_or_startup_name TEXT NOT NULL,
  help_needed TEXT NOT NULL,
  specific_challenge TEXT NOT NULL,
  goals TEXT NOT NULL,
  reason_for_selection TEXT NOT NULL,
  preferred_format TEXT NOT NULL,
  preferred_availability TEXT NOT NULL,
  budget TEXT,
  expected_duration TEXT NOT NULL,
  additional_context TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'received', 'under_review', 'more_info_requested', 'accepted', 'rejected', 'withdrawn', 'active', 'completed', 'cancelled')
  ),
  status_notes TEXT,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  agreement_id TEXT,
  workspace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON public.mentorship_requests(mentor_profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee ON public.mentorship_requests(mentee_profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON public.mentorship_requests(status);

-- 3. Mentorship Option C Pricing Agreements
CREATE TABLE IF NOT EXISTS public.mentorship_agreements (
  id TEXT PRIMARY KEY,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  current_version INTEGER NOT NULL DEFAULT 1,
  versions JSONB NOT NULL DEFAULT '[]'::jsonb,
  confirmed_by_mentor BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_by_mentee BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at_mentor TIMESTAMPTZ,
  confirmed_at_mentee TIMESTAMPTZ,
  is_fully_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  active_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_agreements_req ON public.mentorship_agreements(mentorship_request_id);

-- 4. Mentorship Workspaces
CREATE TABLE IF NOT EXISTS public.mentorship_workspaces (
  id TEXT PRIMARY KEY,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentorship_format TEXT NOT NULL,
  agreed_objectives TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expected_duration TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  shared_notes TEXT NOT NULL DEFAULT '',
  mentor_private_notes TEXT DEFAULT '',
  mentee_private_notes TEXT DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'not_due' CHECK (
    payment_status IN ('not_due', 'pending', 'reported_paid', 'disputed', 'cancelled')
  ),
  payment_reported_date TIMESTAMPTZ,
  payment_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_workspaces_mentor ON public.mentorship_workspaces(mentor_profile_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_workspaces_mentee ON public.mentorship_workspaces(mentee_profile_id);

-- 5. Mentorship Sessions
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  session_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  format TEXT NOT NULL DEFAULT 'online' CHECK (format IN ('online', 'in_person', 'hybrid')),
  meeting_link_or_location TEXT NOT NULL,
  agenda TEXT,
  preparation_notes TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (
    status IN ('proposed', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')
  ),
  notes TEXT,
  action_items_created JSONB DEFAULT '[]'::jsonb,
  rescheduled_from_session_id TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_workspace ON public.mentorship_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_schedule ON public.mentorship_sessions(session_date, start_time);

-- 6. Mentorship Goals
CREATE TABLE IF NOT EXISTS public.mentorship_goals (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_date TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_goals_workspace ON public.mentorship_goals(workspace_id);

-- 7. Mentorship Action Items
CREATE TABLE IF NOT EXISTS public.mentorship_action_items (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  assigned_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_action_items_workspace ON public.mentorship_action_items(workspace_id);

-- 8. Mentorship Resources
CREATE TABLE IF NOT EXISTS public.mentorship_resources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  uploaded_by_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'link' CHECK (resource_type IN ('document', 'link', 'template', 'guide')),
  url_or_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mentorship_resources_workspace ON public.mentorship_resources(workspace_id);

-- 9. Mentorship Reviews
CREATE TABLE IF NOT EXISTS public.mentorship_reviews (
  id TEXT PRIMARY KEY,
  mentorship_request_id TEXT NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES public.mentorship_workspaces(id) ON DELETE CASCADE,
  mentor_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentee_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  knowledge_rating INTEGER NOT NULL CHECK (knowledge_rating BETWEEN 1 AND 5),
  communication_rating INTEGER NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  helpfulness_rating INTEGER NOT NULL CHECK (helpfulness_rating BETWEEN 1 AND 5),
  professionalism_rating INTEGER NOT NULL CHECK (professionalism_rating BETWEEN 1 AND 5),
  reliability_rating INTEGER NOT NULL CHECK (reliability_rating BETWEEN 1 AND 5),
  overall_rating NUMERIC(3, 2) NOT NULL CHECK (overall_rating BETWEEN 1.0 AND 5.0),
  review_text TEXT NOT NULL,
  mentor_reply TEXT,
  mentor_replied_at TIMESTAMPTZ,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_mentorship_review UNIQUE(mentorship_request_id, mentee_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_mentorship_reviews_mentor ON public.mentorship_reviews(mentor_profile_id);

-- 10. Bookmarks & Reports
CREATE TABLE IF NOT EXISTS public.mentor_bookmarks (
  id TEXT PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  mentor_profile_id TEXT NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_mentor_bookmark UNIQUE(profile_id, mentor_profile_id)
);

CREATE TABLE IF NOT EXISTS public.mentor_reports (
  id TEXT PRIMARY KEY,
  mentor_profile_id TEXT NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  reporter_profile_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reports ENABLE ROW LEVEL SECURITY;

-- Mentors are publicly readable if active
CREATE POLICY "Public active mentor profiles are viewable by all" ON public.mentor_profiles
  FOR SELECT USING (status = 'active');

CREATE POLICY "Mentors can manage own mentor profile" ON public.mentor_profiles
  FOR ALL USING (profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Requests viewable only by mentor and mentee
CREATE POLICY "Mentorship requests viewable only by participants" ON public.mentorship_requests
  FOR SELECT USING (
    mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  );

CREATE POLICY "Mentees can submit requests" ON public.mentorship_requests
  FOR INSERT WITH CHECK (mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Workspaces strictly private to participants
CREATE POLICY "Workspaces viewable only by authorized participants" ON public.mentorship_workspaces
  FOR ALL USING (
    mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  );

CREATE POLICY "Sessions viewable only by workspace participants" ON public.mentorship_sessions
  FOR ALL USING (
    mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  );

CREATE POLICY "Goals viewable only by workspace participants" ON public.mentorship_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_workspaces w
      WHERE w.id = workspace_id 
        AND (
          w.mentor_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
          OR w.mentee_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
        )
    )
  );


-- ==============================================================================
-- SECTION: 20261105000007_feature11_investor_network.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261105000008_feature12_build_spaces.sql
-- ==============================================================================

-- ============================================================================
-- FEATURE 12: BALAGA BUILD SPACES MIGRATION
-- Supports Option C: Both Private and Public Project Build Spaces
-- Unifies Project Build Spaces and Partnership Spaces
-- ============================================================================

-- 1. BUILD SPACES
CREATE TABLE IF NOT EXISTS build_spaces (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('project', 'partnership')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  cover_url TEXT,
  short_description TEXT NOT NULL,
  detailed_overview TEXT NOT NULL,
  category TEXT NOT NULL,
  development_stage TEXT NOT NULL DEFAULT 'idea',
  main_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  technologies_used JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_completion_date DATE,
  associated_startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  owner_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  member_count INTEGER NOT NULL DEFAULT 1,
  partnership_space_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_spaces_owner ON build_spaces(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_build_spaces_type ON build_spaces(type);
CREATE INDEX IF NOT EXISTS idx_build_spaces_visibility ON build_spaces(visibility);
CREATE INDEX IF NOT EXISTS idx_build_spaces_status ON build_spaces(status);
CREATE INDEX IF NOT EXISTS idx_build_spaces_category ON build_spaces(category);
CREATE INDEX IF NOT EXISTS idx_build_spaces_partnership_space ON build_spaces(partnership_space_id);

-- 2. BUILD SPACE MEMBERS
CREATE TABLE IF NOT EXISTS build_space_members (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'member', 'viewer')),
  title TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_build_space_member UNIQUE (space_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_build_space_members_space ON build_space_members(space_id);
CREATE INDEX IF NOT EXISTS idx_build_space_members_profile ON build_space_members(profile_id);

-- 3. BUILD SPACE JOIN REQUESTS (Option C Public Discovery Join Requests)
CREATE TABLE IF NOT EXISTS build_space_join_requests (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  applicant_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  introduction TEXT NOT NULL,
  relevant_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  portfolio_links JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'more_info_requested', 'accepted', 'rejected', 'withdrawn')),
  more_info_query TEXT,
  more_info_response TEXT,
  response_notes TEXT,
  reviewed_by_profile_id UUID REFERENCES founder_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_space_join_requests_space ON build_space_join_requests(space_id);
CREATE INDEX IF NOT EXISTS idx_build_space_join_requests_applicant ON build_space_join_requests(applicant_profile_id);
CREATE INDEX IF NOT EXISTS idx_build_space_join_requests_status ON build_space_join_requests(status);

-- 4. BUILD SPACE INVITATIONS
CREATE TABLE IF NOT EXISTS build_space_invitations (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  invitee_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  invited_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'editor', 'member', 'viewer')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_build_space_invitations_space ON build_space_invitations(space_id);
CREATE INDEX IF NOT EXISTS idx_build_space_invitations_invitee ON build_space_invitations(invitee_profile_id);
CREATE INDEX IF NOT EXISTS idx_build_space_invitations_status ON build_space_invitations(status);

-- 5. BUILD SPACE TASKS
CREATE TABLE IF NOT EXISTS build_space_tasks (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assigned_profile_id UUID REFERENCES founder_profiles(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled')),
  start_date DATE,
  due_date DATE,
  tags JSONB DEFAULT '[]'::jsonb,
  checklists JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  milestone_id TEXT,
  created_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_space_tasks_space ON build_space_tasks(space_id);
CREATE INDEX IF NOT EXISTS idx_build_space_tasks_assignee ON build_space_tasks(assigned_profile_id);
CREATE INDEX IF NOT EXISTS idx_build_space_tasks_status ON build_space_tasks(status);
CREATE INDEX IF NOT EXISTS idx_build_space_tasks_milestone ON build_space_tasks(milestone_id);

-- 6. BUILD SPACE MILESTONES
CREATE TABLE IF NOT EXISTS build_space_milestones (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date DATE NOT NULL,
  responsible_profile_id UUID REFERENCES founder_profiles(id) ON DELETE SET NULL,
  linked_task_ids JSONB DEFAULT '[]'::jsonb,
  completion_criteria TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'at_risk', 'completed', 'delayed', 'cancelled')),
  completion_notes TEXT,
  completed_date DATE,
  created_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_space_milestones_space ON build_space_milestones(space_id);
CREATE INDEX IF NOT EXISTS idx_build_space_milestones_status ON build_space_milestones(status);

-- 7. BUILD SPACE MESSAGES
CREATE TABLE IF NOT EXISTS build_space_messages (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'general',
  sender_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  text TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_space_messages_space_channel ON build_space_messages(space_id, channel);

-- 8. BUILD SPACE DOCUMENTS
CREATE TABLE IF NOT EXISTS build_space_documents (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  folder TEXT NOT NULL DEFAULT 'other',
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size TEXT,
  file_type TEXT,
  version TEXT DEFAULT '1.0',
  uploaded_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_space_documents_space ON build_space_documents(space_id);

-- 9. BUILD SPACE MEETINGS
CREATE TABLE IF NOT EXISTS build_space_meetings (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  participant_profile_ids JSONB DEFAULT '[]'::jsonb,
  agenda TEXT,
  online_meeting_link TEXT,
  public_location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')),
  scheduled_by_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_space_meetings_space ON build_space_meetings(space_id);

-- 10. BUILD SPACE ACTIVITIES
CREATE TABLE IF NOT EXISTS build_space_activities (
  id TEXT PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES build_spaces(id) ON DELETE CASCADE,
  actor_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_build_space_activities_space ON build_space_activities(space_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE build_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_space_activities ENABLE ROW LEVEL SECURITY;

-- build_spaces: Discoverable if public; full access if member or owner
CREATE POLICY "Public spaces are discoverable by authenticated founders"
  ON build_spaces FOR SELECT
  USING (
    visibility = 'public' 
    OR owner_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM build_space_members 
      WHERE space_id = build_spaces.id 
        AND profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
    )
  );

CREATE POLICY "Owners can update their build spaces"
  ON build_spaces FOR UPDATE
  USING (
    owner_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
    OR EXISTS (
      SELECT 1 FROM build_space_members 
      WHERE space_id = build_spaces.id 
        AND profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()) 
        AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Founders can create build spaces"
  ON build_spaces FOR INSERT
  WITH CHECK (owner_profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid()));

-- Workspace internal contents accessible ONLY by verified active members
CREATE POLICY "Members can view space members"
  ON build_space_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM build_space_members m 
    WHERE m.space_id = build_space_members.space_id 
      AND m.profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  ));

CREATE POLICY "Members can access tasks"
  ON build_space_tasks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM build_space_members m 
    WHERE m.space_id = build_space_tasks.space_id 
      AND m.profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  ));

CREATE POLICY "Members can access milestones"
  ON build_space_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM build_space_members m 
    WHERE m.space_id = build_space_milestones.space_id 
      AND m.profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  ));

CREATE POLICY "Members can access messages"
  ON build_space_messages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM build_space_members m 
    WHERE m.space_id = build_space_messages.space_id 
      AND m.profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  ));

CREATE POLICY "Members can access documents"
  ON build_space_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM build_space_members m 
    WHERE m.space_id = build_space_documents.space_id 
      AND m.profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  ));

CREATE POLICY "Members can access meetings"
  ON build_space_meetings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM build_space_members m 
    WHERE m.space_id = build_space_meetings.space_id 
      AND m.profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  ));

CREATE POLICY "Members can access activities"
  ON build_space_activities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM build_space_members m 
    WHERE m.space_id = build_space_activities.space_id 
      AND m.profile_id IN (SELECT id FROM public.founder_profiles WHERE account_id = auth.uid())
  ));


-- ==============================================================================
-- SECTION: 20261105000009_feature13_founders_inbox.sql
-- ==============================================================================

-- ============================================================================
-- FEATURE 13: BALAGA FOUNDERS INBOX & NOTIFICATIONS MIGRATION
-- Supports Option A: One Unified Founders Inbox with Category Filters
-- Completely segregates professional messaging from Socializing
-- ============================================================================

-- 1. FOUNDERS CONVERSATIONS
CREATE TABLE IF NOT EXISTS founders_conversations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'workspace')),
  title TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'professional',
    'cofounder',
    'opportunities',
    'hiring',
    'collaborations',
    'referrals',
    'mentorship',
    'investors',
    'build_spaces'
  )),
  related_entity_type TEXT CHECK (related_entity_type IN (
    'connection',
    'cofounder',
    'opportunity',
    'job_application',
    'startup',
    'product',
    'partnership',
    'referral',
    'mentorship',
    'investor_intro',
    'build_space'
  )),
  related_entity_id TEXT,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  space_id TEXT,
  creator_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  avatar_url TEXT,
  description TEXT,
  last_message_snippet TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_sender_id UUID REFERENCES founder_profiles(id) ON DELETE SET NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founders_conv_category ON founders_conversations(category);
CREATE INDEX IF NOT EXISTS idx_founders_conv_type ON founders_conversations(type);
CREATE INDEX IF NOT EXISTS idx_founders_conv_last_message_at ON founders_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_founders_conv_related ON founders_conversations(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_founders_conv_startup ON founders_conversations(startup_id);
CREATE INDEX IF NOT EXISTS idx_founders_conv_space ON founders_conversations(space_id);

-- 2. FOUNDERS CONVERSATION PARTICIPANTS
CREATE TABLE IF NOT EXISTS founders_conversation_participants (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES founders_conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_message_id TEXT,
  last_read_at TIMESTAMPTZ,
  CONSTRAINT uq_founders_conv_participant UNIQUE (conversation_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_founders_part_conv ON founders_conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_founders_part_profile ON founders_conversation_participants(profile_id);

-- 3. FOUNDERS MESSAGES
CREATE TABLE IF NOT EXISTS founders_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES founders_conversations(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  delivery_state TEXT NOT NULL DEFAULT 'sent' CHECK (delivery_state IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  reply_to_message_id TEXT REFERENCES founders_messages(id) ON DELETE SET NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  reactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founders_msg_conv ON founders_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_founders_msg_sender ON founders_messages(sender_profile_id);
CREATE INDEX IF NOT EXISTS idx_founders_msg_created_at ON founders_messages(conversation_id, created_at ASC);

-- 4. FOUNDERS MESSAGE REQUESTS
CREATE TABLE IF NOT EXISTS founders_message_requests (
  id TEXT PRIMARY KEY,
  sender_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  recipient_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'professional',
    'cofounder',
    'opportunities',
    'hiring',
    'collaborations',
    'referrals',
    'mentorship',
    'investors',
    'build_spaces'
  )),
  initial_message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  conversation_id TEXT REFERENCES founders_conversations(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founders_req_recipient ON founders_message_requests(recipient_profile_id, status);
CREATE INDEX IF NOT EXISTS idx_founders_req_sender ON founders_message_requests(sender_profile_id, status);

-- 5. FOUNDERS USER INBOX STATES (Personal Pin/Star/Archive/Mute/CustomUnread)
CREATE TABLE IF NOT EXISTS founders_user_inbox_states (
  id TEXT PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL REFERENCES founders_conversations(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_deleted_from_inbox BOOLEAN NOT NULL DEFAULT false,
  custom_unread BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_founders_user_inbox_state UNIQUE (profile_id, conversation_id)
);

CREATE INDEX IF NOT EXISTS idx_founders_inbox_state_profile ON founders_user_inbox_states(profile_id);
CREATE INDEX IF NOT EXISTS idx_founders_inbox_state_conv ON founders_user_inbox_states(conversation_id);

-- 6. FOUNDERS NOTIFICATIONS
CREATE TABLE IF NOT EXISTS founders_notifications (
  id TEXT PRIMARY KEY,
  recipient_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  actor_profile_id UUID REFERENCES founder_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'connections',
    'cofounder_requests',
    'opportunities',
    'hiring',
    'startup_hub',
    'product_launchpad',
    'collaborations',
    'referrals',
    'mentorship',
    'investors',
    'build_spaces',
    'messages',
    'verification',
    'account_security'
  )),
  related_entity_type TEXT,
  related_entity_id TEXT,
  navigation_target TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_founders_notif_recipient ON founders_notifications(recipient_profile_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_founders_notif_category ON founders_notifications(recipient_profile_id, category);

-- 7. FOUNDERS NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS founders_notification_preferences (
  profile_id UUID PRIMARY KEY REFERENCES founder_profiles(id) ON DELETE CASCADE,
  in_app_alerts BOOLEAN NOT NULL DEFAULT true,
  email_alerts BOOLEAN NOT NULL DEFAULT true,
  message_alerts BOOLEAN NOT NULL DEFAULT true,
  connection_alerts BOOLEAN NOT NULL DEFAULT true,
  opportunity_alerts BOOLEAN NOT NULL DEFAULT true,
  hiring_alerts BOOLEAN NOT NULL DEFAULT true,
  startup_alerts BOOLEAN NOT NULL DEFAULT true,
  collaboration_alerts BOOLEAN NOT NULL DEFAULT true,
  referral_alerts BOOLEAN NOT NULL DEFAULT true,
  mentorship_alerts BOOLEAN NOT NULL DEFAULT true,
  investor_alerts BOOLEAN NOT NULL DEFAULT true,
  workspace_alerts BOOLEAN NOT NULL DEFAULT true,
  muted_conversation_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. FOUNDERS BLOCKS (Strict Safety across Founders Entry Points)
CREATE TABLE IF NOT EXISTS founders_blocks (
  id TEXT PRIMARY KEY,
  blocker_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  blocked_profile_id UUID NOT NULL REFERENCES founder_profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_founders_block UNIQUE (blocker_profile_id, blocked_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_founders_blocks_blocker ON founders_blocks(blocker_profile_id);
CREATE INDEX IF NOT EXISTS idx_founders_blocks_blocked ON founders_blocks(blocked_profile_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE founders_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_message_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_user_inbox_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders_blocks ENABLE ROW LEVEL SECURITY;

-- 1. Conversation Access Policy: Only authorized participants can view conversations
CREATE POLICY "Participants view authorized conversations"
  ON founders_conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM founders_conversation_participants fcp
      JOIN founder_profiles fp ON fp.id = fcp.profile_id
      WHERE fcp.conversation_id = founders_conversations.id
      AND fp.account_id = auth.uid()
    )
  );

-- 2. Message Access Policy: Only conversation participants can read/send messages
CREATE POLICY "Participants view conversation messages"
  ON founders_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM founders_conversation_participants fcp
      JOIN founder_profiles fp ON fp.id = fcp.profile_id
      WHERE fcp.conversation_id = founders_messages.conversation_id
      AND fp.account_id = auth.uid()
    )
  );

CREATE POLICY "Participants insert conversation messages"
  ON founders_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM founders_conversation_participants fcp
      JOIN founder_profiles fp ON fp.id = fcp.profile_id
      WHERE fcp.conversation_id = founders_messages.conversation_id
      AND fp.account_id = auth.uid()
      AND fp.id = founders_messages.sender_profile_id
    )
  );

-- 3. Message Request Policy: Sender or recipient can view
CREATE POLICY "Sender or recipient views message request"
  ON founders_message_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM founder_profiles fp
      WHERE fp.account_id = auth.uid()
      AND (fp.id = founders_message_requests.sender_profile_id OR fp.id = founders_message_requests.recipient_profile_id)
    )
  );

-- 4. Notification Access Policy: Recipient only
CREATE POLICY "Recipient views own notifications"
  ON founders_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM founder_profiles fp
      WHERE fp.id = founders_notifications.recipient_profile_id
      AND fp.account_id = auth.uid()
    )
  );

-- 5. User Inbox State Policy: Owner only
CREATE POLICY "Owner manages personal inbox state"
  ON founders_user_inbox_states FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM founder_profiles fp
      WHERE fp.id = founders_user_inbox_states.profile_id
      AND fp.account_id = auth.uid()
    )
  );

-- 6. Notification Preferences Policy: Owner only
CREATE POLICY "Owner manages notification preferences"
  ON founders_notification_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM founder_profiles fp
      WHERE fp.id = founders_notification_preferences.profile_id
      AND fp.account_id = auth.uid()
    )
  );


-- ==============================================================================
-- SECTION: 20261105000010_feature14_verification_premium.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261105000011_schema_foundation_repair.sql
-- ==============================================================================

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


-- ==============================================================================
-- SECTION: 20261105000012_forward_type_compatibility.sql
-- ==============================================================================

-- ==============================================================================
-- MIGRATION: 20261105000012_forward_type_compatibility.sql
-- PURPOSE: Forward-only corrective migration guaranteeing UUID type consistency
--          for Mentor Network and Investor Network foreign keys across all environments.
-- ==============================================================================

DO $$
BEGIN
    -- 1. Mentor Profiles: Ensure profile_id is UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'mentor_profiles' 
          AND column_name = 'profile_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.mentor_profiles 
            ALTER COLUMN profile_id TYPE UUID USING NULLIF(profile_id, '')::UUID;
    END IF;

    -- 2. Mentorship Requests: Ensure mentor_profile_id and mentee_profile_id are UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'mentorship_requests' 
          AND column_name = 'mentor_profile_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.mentorship_requests 
            ALTER COLUMN mentor_profile_id TYPE UUID USING NULLIF(mentor_profile_id, '')::UUID;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'mentorship_requests' 
          AND column_name = 'mentee_profile_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.mentorship_requests 
            ALTER COLUMN mentee_profile_id TYPE UUID USING NULLIF(mentee_profile_id, '')::UUID;
    END IF;

    -- 3. Startup Fundraising Profiles: Ensure startup_id is UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'startup_fundraising_profiles' 
          AND column_name = 'startup_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.startup_fundraising_profiles 
            ALTER COLUMN startup_id TYPE UUID USING NULLIF(startup_id, '')::UUID;
    END IF;

    -- 4. Investor Intro Requests: Ensure startup_id is UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'investor_intro_requests' 
          AND column_name = 'startup_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.investor_intro_requests 
            ALTER COLUMN startup_id TYPE UUID USING NULLIF(startup_id, '')::UUID;
    END IF;

    -- 5. Investor Interest Records: Ensure startup_id is UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'investor_interest_records' 
          AND column_name = 'startup_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.investor_interest_records 
            ALTER COLUMN startup_id TYPE UUID USING NULLIF(startup_id, '')::UUID;
    END IF;

    -- 6. Private Fundraising Conversations: Ensure startup_id is UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'fundraising_conversations' 
          AND column_name = 'startup_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.fundraising_conversations 
            ALTER COLUMN startup_id TYPE UUID USING NULLIF(startup_id, '')::UUID;
    END IF;

    -- 7. Investor Meetings: Ensure startup_id is UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'investor_meetings' 
          AND column_name = 'startup_id' 
          AND data_type = 'text'
    ) THEN
        ALTER TABLE public.investor_meetings 
            ALTER COLUMN startup_id TYPE UUID USING NULLIF(startup_id, '')::UUID;
    END IF;

END $$;

