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
