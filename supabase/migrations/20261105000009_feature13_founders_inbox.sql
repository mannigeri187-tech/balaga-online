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
