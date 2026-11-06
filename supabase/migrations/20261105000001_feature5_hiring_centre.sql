-- ==============================================================================
-- MIGRATION: 20261105000001_feature5_hiring_centre.sql
-- PURPOSE: Balaga Founders Feature 5 — Hiring Centre: Official company jobs,
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
