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
