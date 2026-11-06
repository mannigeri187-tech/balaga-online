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
