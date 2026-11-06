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
