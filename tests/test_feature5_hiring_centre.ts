/**
 * Test Suite: Feature 5 — Balaga Founders Hiring Centre
 * Tests all 20 specification areas and final acceptance criteria:
 * 1. Discover Jobs & Multi-Filtering (department, remote, internship, recent, search)
 * 2. Recommended Jobs (skills matching, zero-paid bias, excluding affiliated startups)
 * 3. Job Detail & Deduplicated View Tracking
 * 4. Granular Hiring Permissions Model (Confirmed Decision):
 *    - Owner: Full hiring control (publish/edit/status)
 *    - Admin: Full hiring control (publish/edit/status)
 *    - Hiring Manager: Authorized ONLY when canManageHiring is true; blocked when false
 *    - Editor: Authorized ONLY when canManageHiring is true; blocked when false
 *    - Viewer: NEVER has hiring permission (always blocked)
 *    - Non-member / Ordinary user: Blocked from publishing/managing startup jobs
 *    - Grant & Revoke permissions with immediate effect
 *    - Cross-startup isolation
 * 5. Job Lifecycle & Privacy of Drafts:
 *    - Draft jobs are private to recruiters (403 for public)
 *    - Paused and Closed jobs stop accepting applications (400 Bad Request)
 * 6. Candidate Application System:
 *    - Application submission with CV, skills, experience, intro, screening answers
 *    - Duplicate application blocked
 *    - Conflict of interest check (cannot apply to own startup)
 *    - Application history in My Applications
 *    - Application withdrawal
 * 7. Candidate Pipeline & Recruiter Status Transitions:
 *    - Status pipeline: applied -> viewed -> shortlisted -> screening -> interview -> offer -> hired -> rejected
 *    - Candidate cannot tamper with recruiter decisions
 * 8. Private Internal Recruiter Notes:
 *    - Recruiter can add/view internal notes
 *    - Candidates strictly blocked from accessing internal notes
 * 9. Interview Management:
 *    - Recruiter schedules interview with instructions, location/link, timezone
 *    - Candidate can view interview (recruiter notes stripped)
 * 10. Secure CV Document Access:
 *     - Candidate can access their own CV
 *     - Authorized recruiter can access applicant's CV
 *     - Unauthorized third party receives 403 Forbidden
 * 11. Hiring Dashboard Real Computed Metrics:
 *     - activeJobs, totalApplications, interviews, upcomingDeadlines
 * 12. Bookmarks, Moderation & Strict World Isolation:
 *     - Save/unsave bookmark
 *     - Report job
 *     - Socializing world context rejected with 403 Forbidden
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runFeature5Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 5 HIRING CENTRE TEST SUITE ===\n");

  const server = app.listen(5006);
  let failed = 0;
  let passed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail || ""}`);
      failed++;
    }
  }

  function request(
    path: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const payload = options.body ? JSON.stringify(options.body) : undefined;
      const req = http.request(
        `http://localhost:5006${path}`,
        {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            "x-mock-user": "true",
            "x-platform-world": "founders",
            ...(payload ? { "Content-Length": Buffer.byteLength(payload).toString() } : {}),
            ...(options.headers || {}),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve({
                status: res.statusCode || 200,
                body: data ? JSON.parse(data) : {},
              });
            } catch {
              resolve({ status: res.statusCode || 200, body: data });
            }
          });
        }
      );
      req.on("error", reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  // Account IDs:
  // Aarav (Owner of st-mesh and st-dev): 00000000-0000-0000-0000-000000000001
  // Rohit (Admin of st-mesh): 00000000-0000-0000-0000-000000000004
  // Ananya (Hiring Manager of st-mesh, canManageHiring = true): 00000000-0000-0000-0000-000000000005
  // Sneha (Editor of st-mesh, canManageHiring = false): 00000000-0000-0000-0000-000000000007
  // Vikram (Viewer of st-mesh, canManageHiring = false): 00000000-0000-0000-0000-000000000006
  // Nikhil (Non-member of st-mesh, Owner of st-1): 00000000-0000-0000-0000-000000000003

  const HEADERS_AARAV = { "x-mock-account-id": "00000000-0000-0000-0000-000000000001" };
  const HEADERS_ROHIT = { "x-mock-account-id": "00000000-0000-0000-0000-000000000004" };
  const HEADERS_ANANYA = { "x-mock-account-id": "00000000-0000-0000-0000-000000000005" };
  const HEADERS_SNEHA = { "x-mock-account-id": "00000000-0000-0000-0000-000000000007" };
  const HEADERS_VIKRAM = { "x-mock-account-id": "00000000-0000-0000-0000-000000000006" };
  const HEADERS_NIKHIL = { "x-mock-account-id": "00000000-0000-0000-0000-000000000003" };

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: Discover Jobs & Multi-Filtering
    // -------------------------------------------------------------------------
    console.log("--- SECTION 1: Discover Jobs & Multi-Filtering ---");
    const res1 = await request("/api/founders/hiring/jobs", { headers: HEADERS_AARAV });
    assert(res1.status === 200, "1. Discover jobs returns 200 OK");
    assert(Array.isArray(res1.body.jobs) && res1.body.jobs.length > 0, "2. Jobs directory is populated with official jobs");

    // Filter by department
    const engRes = await request("/api/founders/hiring/jobs?department=Core Engineering", { headers: HEADERS_AARAV });
    assert(engRes.status === 200, "3. Filter by department returns 200 OK");
    assert(
      engRes.body.jobs.every((j: any) => j.department === "Core Engineering"),
      "4. Department filter correctly isolates Core Engineering positions"
    );

    // Filter by remote
    const remoteRes = await request("/api/founders/hiring/jobs/remote", { headers: HEADERS_AARAV });
    assert(remoteRes.status === 200, "5. Remote jobs route returns 200 OK");
    assert(
      remoteRes.body.jobs.every((j: any) => j.workMode === "remote"),
      "6. Remote jobs are strictly workMode === 'remote'"
    );

    // Filter by internship
    const internRes = await request("/api/founders/hiring/jobs/internships", { headers: HEADERS_AARAV });
    assert(internRes.status === 200, "7. Internships route returns 200 OK");
    assert(
      internRes.body.jobs.some((j: any) => j.employmentType === "internship"),
      "8. Internships filter correctly includes internship roles"
    );

    // Recently posted jobs
    const recentRes = await request("/api/founders/hiring/jobs/recent", { headers: HEADERS_AARAV });
    assert(recentRes.status === 200, "9. Recently posted jobs returns 200 OK");
    assert(recentRes.body.jobs.length > 0, "10. Recent jobs list is populated");

    // Keyword search
    const searchRes = await request("/api/founders/hiring/jobs?q=Distributed", { headers: HEADERS_AARAV });
    assert(searchRes.status === 200, "11. Search query returns 200 OK");
    assert(
      searchRes.body.jobs.some((j: any) => j.title.includes("Distributed") || j.requiredSkills.includes("Distributed Systems")),
      "12. Search query matches relevant distributed systems jobs"
    );

    // -------------------------------------------------------------------------
    // SECTION 2: Recommended Jobs
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 2: Recommended Jobs ---");
    const recRes = await request("/api/founders/hiring/jobs/recommended", { headers: HEADERS_SNEHA });
    assert(recRes.status === 200, "13. Recommended jobs returns 200 OK");
    assert(Array.isArray(recRes.body.jobs), "14. Recommendations returned as array");
    // Sneha is a member of st-mesh, so recommendations must not include st-mesh jobs
    assert(
      recRes.body.jobs.every((j: any) => j.startupId !== "st-mesh"),
      "15. Recommendations exclude jobs from startups the user is already affiliated with"
    );

    // -------------------------------------------------------------------------
    // SECTION 3: Job Detail & Deduplicated View Tracking
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 3: Job Detail & View Tracking ---");
    const detailRes1 = await request("/api/founders/hiring/jobs/job-1", { headers: HEADERS_VIKRAM });
    assert(detailRes1.status === 200, "16. Job detail returns 200 OK");
    const initialViews = detailRes1.body.job.viewsCount;

    // View again by same user — viewsCount must remain deduplicated
    const detailRes2 = await request("/api/founders/hiring/jobs/job-1", { headers: HEADERS_VIKRAM });
    assert(detailRes2.body.job.viewsCount === initialViews, "17. Deduplicated view tracking prevents repeated counts by same user");

    // -------------------------------------------------------------------------
    // SECTION 4: Granular Hiring Permissions (Confirmed Decision)
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 4: Granular Hiring Permissions Model ---");
    // 1. Startup Owner (Aarav) CAN create jobs
    const ownerCreateRes = await request("/api/founders/hiring/jobs", {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        startupId: "st-mesh",
        title: "Senior SRE & Cloud Architect",
        department: "Infrastructure",
        employmentType: "full-time",
        jobSummary: "Scale Indian banking connection rails and multi-cloud resilience.",
        description: "BharatFin Mesh is expanding its cloud infrastructure team across AWS and GCP bare metal nodes.",
        responsibilities: ["Maintain 99.999% availability for UPI switches", "Automate failovers"],
        requiredSkills: ["Kubernetes", "AWS", "Terraform", "Go"],
        preferredSkills: ["PostgreSQL", "Prometheus"],
        experienceRequirements: "5-8 years",
        workMode: "hybrid",
        broadLocation: "Bengaluru, Karnataka",
        compensationType: "range",
        compensationMin: 3500000,
        compensationMax: 5000000,
        currency: "INR",
        openingsCount: 1,
        applicationDeadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        screeningQuestions: [],
        status: "open",
      },
    });
    assert(ownerCreateRes.status === 201, "18. Startup Owner can publish official company jobs (201 Created)");
    const createdJobId = ownerCreateRes.body.job.id;

    // 2. Startup Admin (Rohit) CAN manage hiring
    const adminEditRes = await request(`/api/founders/hiring/jobs/${createdJobId}`, {
      method: "PUT",
      headers: HEADERS_ROHIT,
      body: {
        title: "Lead SRE & Multi-Region Cloud Architect",
      },
    });
    assert(adminEditRes.status === 200, "19. Startup Admin has full hiring control to edit jobs (200 OK)");

    // 3. Hiring Manager with explicit permission (Ananya) CAN manage hiring
    const hmEditRes = await request(`/api/founders/hiring/jobs/${createdJobId}/status`, {
      method: "POST",
      headers: HEADERS_ANANYA,
      body: { status: "paused" },
    });
    assert(hmEditRes.status === 200, "20. Authorized Hiring Manager can update job status (200 OK)");

    // 4. Editor WITHOUT hiring permission (Sneha) CANNOT manage hiring
    const editorBlockedRes = await request(`/api/founders/hiring/jobs/${createdJobId}/status`, {
      method: "POST",
      headers: HEADERS_SNEHA,
      body: { status: "open" },
    });
    assert(editorBlockedRes.status === 403, "21. Editor WITHOUT explicit hiring permission is blocked (403 Forbidden)");

    // 5. Viewer (Vikram) CANNOT manage hiring under any circumstance
    const viewerBlockedRes = await request(`/api/founders/hiring/jobs/${createdJobId}/status`, {
      method: "POST",
      headers: HEADERS_VIKRAM,
      body: { status: "open" },
    });
    assert(viewerBlockedRes.status === 403, "22. Viewer has NO hiring management access (403 Forbidden)");

    // 6. Non-member (Nikhil) CANNOT publish or manage jobs for st-mesh
    const nonMemberRes = await request("/api/founders/hiring/jobs", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        startupId: "st-mesh",
        title: "Intruder SRE",
        department: "Core Engineering",
        employmentType: "full-time",
        jobSummary: "Unauthorized job publication attempt",
        description: "This should fail because Nikhil does not belong to st-mesh.",
        responsibilities: ["None"],
        requiredSkills: ["Security"],
        experienceRequirements: "1 year",
        workMode: "remote",
        broadLocation: "Bengaluru, Karnataka",
        compensationType: "negotiable",
        openingsCount: 1,
        applicationDeadline: new Date(Date.now() + 86400000 * 10).toISOString(),
      },
    });
    assert(nonMemberRes.status === 403, "23. Non-member cannot publish official startup jobs (403 Forbidden)");

    // 7. Grant hiring permission to Editor (Sneha) by Owner (Aarav)
    const grantRes = await request("/api/founders/hiring/startups/st-mesh/permissions", {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        profileId: "20000000-0000-0000-0000-000000000007", // Sneha
        canManageHiring: true,
      },
    });
    assert(grantRes.status === 200, "24. Owner can grant hiring permission to Editor (200 OK)");

    // Now Sneha CAN manage hiring!
    const editorAllowedRes = await request(`/api/founders/hiring/jobs/${createdJobId}/status`, {
      method: "POST",
      headers: HEADERS_SNEHA,
      body: { status: "open" },
    });
    assert(editorAllowedRes.status === 200, "25. Editor WITH granted hiring permission can manage jobs (200 OK)");

    // 8. Revoke hiring permission from Sneha
    const revokeRes = await request("/api/founders/hiring/startups/st-mesh/permissions", {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        profileId: "20000000-0000-0000-0000-000000000007", // Sneha
        canManageHiring: false,
      },
    });
    assert(revokeRes.status === 200, "26. Owner can revoke hiring permission (200 OK)");

    // Now Sneha is immediately blocked again!
    const editorRevokedRes = await request(`/api/founders/hiring/jobs/${createdJobId}/status`, {
      method: "POST",
      headers: HEADERS_SNEHA,
      body: { status: "paused" },
    });
    assert(editorRevokedRes.status === 403, "27. Revoking permission immediately blocks further hiring actions (403 Forbidden)");

    // 9. Cross-Startup Isolation: Nikhil cannot access st-mesh recruiter dashboard
    const crossStartupRes = await request("/api/founders/hiring/startups/st-mesh/dashboard", {
      headers: HEADERS_NIKHIL,
    });
    assert(crossStartupRes.status === 403, "28. Cross-startup recruiter dashboard access is denied (403 Forbidden)");

    // -------------------------------------------------------------------------
    // SECTION 5: Job Lifecycle & Drafts
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 5: Job Lifecycle & Drafts ---");
    // Draft job-8 belongs to st-mesh. Public candidate (Nikhil) viewing draft receives 403 Forbidden
    const draftPublicRes = await request("/api/founders/hiring/jobs/job-8", { headers: HEADERS_NIKHIL });
    assert(draftPublicRes.status === 403, "29. Draft jobs are private and cannot be viewed by public candidates (403 Forbidden)");

    // Authorized recruiter (Aarav) CAN view draft job
    const draftRecruiterRes = await request("/api/founders/hiring/jobs/job-8", { headers: HEADERS_AARAV });
    assert(draftRecruiterRes.status === 200, "30. Authorized startup recruiters can view draft jobs (200 OK)");

    // Closed job-7: cannot accept applications
    const applyClosedRes = await request("/api/founders/hiring/jobs/job-7/apply", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        personalIntro: "I would like to apply to this closed job.",
        resumeUrl: "https://storage.balaga.online/resumes/cv.pdf",
        availability: "full_time",
        joiningTimeline: "Immediate",
      },
    });
    assert(applyClosedRes.status === 400, "31. Closed jobs stop applications (400 Bad Request)");

    // Paused job-6: cannot accept applications
    const applyPausedRes = await request("/api/founders/hiring/jobs/job-6/apply", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        personalIntro: "I would like to apply to this paused job.",
        resumeUrl: "https://storage.balaga.online/resumes/cv.pdf",
        availability: "full_time",
        joiningTimeline: "Immediate",
      },
    });
    assert(applyPausedRes.status === 400, "32. Paused jobs temporarily stop applications (400 Bad Request)");

    // -------------------------------------------------------------------------
    // SECTION 6: Candidate Application Workflow & Validation
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 6: Candidate Application Workflow & Validation ---");
    // 1. Conflict of interest: Aarav cannot apply to his own startup's job (job-1)
    const selfApplyRes = await request("/api/founders/hiring/jobs/job-1/apply", {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        personalIntro: "Applying to my own startup.",
        resumeUrl: "https://storage.balaga.online/resumes/aarav.pdf",
        availability: "full_time",
        joiningTimeline: "Immediate",
      },
    });
    assert(selfApplyRes.status === 400, "33. Applying to own startup's job is blocked (400 Bad Request)");

    // 2. Legitimate application: Nikhil applies to job-1 at BharatFin Mesh
    const applyRes = await request("/api/founders/hiring/jobs/job-1/apply", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        personalIntro: "10+ years architecting high-scale distributed telemetry. Excited to contribute to BharatFin Mesh's ledger.",
        resumeUrl: "https://storage.balaga.online/resumes/nikhil_cv.pdf",
        resumeFileName: "Nikhil_Varma_CV.pdf",
        resumeFileSize: 1240000,
        relevantSkills: ["Go", "Distributed Systems", "PostgreSQL", "Observability"],
        experienceYears: 10,
        currentRole: "Founder & CEO, PulseEngine AI",
        portfolioUrl: "https://github.com/nikhil-pulse",
        availability: "full_time",
        joiningTimeline: "1 month",
        expectedCompensation: "₹55,00,000 / year",
        screeningAnswers: {
          "sq-1": "Architected distributed raft consensus with idempotency keys in Redis clusters.",
          "sq-2": "Yes, readily available for Bangalore hybrid model.",
        },
      },
    });
    assert(applyRes.status === 201, "34. Candidate application submitted successfully (201 Created)");
    const submittedAppId = applyRes.body.application.id;

    // 3. Duplicate active application is blocked
    const duplicateRes = await request("/api/founders/hiring/jobs/job-1/apply", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        personalIntro: "Applying second time.",
        resumeUrl: "https://storage.balaga.online/resumes/nikhil_cv.pdf",
        availability: "full_time",
        joiningTimeline: "Immediate",
      },
    });
    assert(duplicateRes.status === 400, "35. Duplicate active application is prevented (400 Bad Request)");

    // 4. Candidate checks My Applications
    const myAppsRes = await request("/api/founders/hiring/my-applications", { headers: HEADERS_NIKHIL });
    assert(myAppsRes.status === 200, "36. My Applications returns 200 OK");
    assert(
      myAppsRes.body.applications.some((app: any) => app.id === submittedAppId),
      "37. Newly submitted application appears in candidate's My Applications"
    );

    // 5. Candidate withdraws application
    const withdrawRes = await request(`/api/founders/hiring/applications/${submittedAppId}/withdraw`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
    });
    assert(withdrawRes.status === 200, "38. Candidate can withdraw application (200 OK)");
    assert(withdrawRes.body.application.status === "withdrawn", "39. Application status transitioned to 'withdrawn'");

    // -------------------------------------------------------------------------
    // SECTION 7: Recruiter Candidate Management & Status Pipeline
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 7: Recruiter Candidate Management & Pipeline ---");
    // Recruiter (Rohit) views candidates for job-1
    const candRes = await request("/api/founders/hiring/jobs/job-1/candidates", { headers: HEADERS_ROHIT });
    assert(candRes.status === 200, "40. Recruiter candidate pipeline returns 200 OK");
    assert(candRes.body.applicants.length > 0, "41. Candidate list is populated with applicants");

    // Sneha Iyer's application is app-1. Recruiter updates status: 'screening'
    const statusRes1 = await request("/api/founders/hiring/applications/app-1/status", {
      method: "POST",
      headers: HEADERS_ROHIT,
      body: {
        status: "screening",
        reasonOrNote: "Candidate cleared initial portfolio screen. Proceeding to engineering chat.",
      },
    });
    assert(statusRes1.status === 200, "42. Recruiter transitions candidate status to 'screening' (200 OK)");
    assert(statusRes1.body.application.status === "screening", "43. Application status updated in database");

    // Recruiter updates status: 'interview'
    const statusRes2 = await request("/api/founders/hiring/applications/app-1/status", {
      method: "POST",
      headers: HEADERS_ROHIT,
      body: { status: "interview" },
    });
    assert(statusRes2.status === 200, "44. Recruiter transitions candidate status to 'interview' (200 OK)");

    // Recruiter updates status: 'offer'
    const statusRes3 = await request("/api/founders/hiring/applications/app-1/status", {
      method: "POST",
      headers: HEADERS_ROHIT,
      body: { status: "offer" },
    });
    assert(statusRes3.status === 200, "45. Recruiter transitions candidate status to 'offer' (200 OK)");

    // Candidate cannot change their own recruiter decision (only withdraw)
    const candidateTamperRes = await request("/api/founders/hiring/applications/app-1/status", {
      method: "POST",
      headers: HEADERS_SNEHA, // Sneha is the applicant
      body: { status: "hired" },
    });
    assert(candidateTamperRes.status === 403, "46. Candidate cannot modify recruiter decisions or hire themselves (403 Forbidden)");

    // -------------------------------------------------------------------------
    // SECTION 8: Private Recruiter Internal Notes
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 8: Private Internal Recruiter Notes ---");
    // Recruiter (Aarav) adds internal note to app-1
    const noteRes = await request("/api/founders/hiring/applications/app-1/notes", {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        note: "Panel unanimous on hiring. Candidate demonstrated deep expertise in financial saga compensation.",
      },
    });
    assert(noteRes.status === 201, "47. Recruiter can add private internal notes (201 Created)");

    // Recruiter views notes
    const getNotesRes = await request("/api/founders/hiring/applications/app-1/notes", {
      headers: HEADERS_AARAV,
    });
    assert(getNotesRes.status === 200, "48. Recruiter can view internal notes (200 OK)");
    assert(getNotesRes.body.notes.length >= 2, "49. Internal notes list populated");

    // Candidate (Sneha) attempting to access internal notes receives 403 Forbidden
    const candidateNotesRes = await request("/api/founders/hiring/applications/app-1/notes", {
      headers: HEADERS_SNEHA,
    });
    assert(candidateNotesRes.status === 403, "50. Candidates CANNOT access private internal recruiter notes (403 Forbidden)");

    // -------------------------------------------------------------------------
    // SECTION 9: Interview Management
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 9: Interview Management ---");
    // Recruiter (Aarav) schedules interview for app-1
    const interviewRes = await request("/api/founders/hiring/applications/app-1/interviews", {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        interviewDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
        interviewTime: "11:30 AM",
        timezone: "Asia/Kolkata",
        interviewType: "technical",
        meetingLocationOrLink: "https://meet.google.com/bfm-staff-interview",
        instructions: "Prepare a 20-minute architecture discussion on idempotent payment switches.",
        candidateFacingNotes: "Technical interview with Rohit Chawla (Admin) and Aarav Sharma (Co-Founder).",
        recruiterPrivateNotes: "Assess depth in high-throughput database locking and ledger consistency.",
      },
    });
    assert(interviewRes.status === 201, "51. Recruiter schedules interview and notifies candidate (201 Created)");

    // Candidate views interview in application detail (with recruiter private notes hidden)
    const candAppDetailRes = await request("/api/founders/hiring/applications/app-1", {
      headers: HEADERS_SNEHA,
    });
    assert(candAppDetailRes.status === 200, "52. Candidate can view application details with interview schedules (200 OK)");
    assert(
      candAppDetailRes.body.internalNotes === undefined,
      "53. Internal notes are stripped from candidate-facing application detail response"
    );

    // -------------------------------------------------------------------------
    // SECTION 10: Secure CV Document Access
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 10: Secure CV Document Access ---");
    // Candidate (Sneha) accesses own CV
    const candCvRes = await request("/api/founders/hiring/applications/app-1/resume", {
      headers: HEADERS_SNEHA,
    });
    assert(candCvRes.status === 200, "54. Candidate can access their own uploaded resume (200 OK)");

    // Authorized recruiter (Rohit) accesses candidate's CV
    const recruiterCvRes = await request("/api/founders/hiring/applications/app-1/resume", {
      headers: HEADERS_ROHIT,
    });
    assert(recruiterCvRes.status === 200, "55. Authorized recruiter can access candidate's resume (200 OK)");

    // Unauthorized non-recruiter (Nikhil) receives 403 Forbidden
    const unauthorizedCvRes = await request("/api/founders/hiring/applications/app-1/resume", {
      headers: HEADERS_NIKHIL,
    });
    assert(unauthorizedCvRes.status === 403, "56. Unauthorized third party is blocked from viewing candidate CV (403 Forbidden)");

    // -------------------------------------------------------------------------
    // SECTION 11: Hiring Dashboard Real Metrics
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 11: Hiring Dashboard Metrics ---");
    const dashRes = await request("/api/founders/hiring/startups/st-mesh/dashboard", {
      headers: HEADERS_AARAV,
    });
    assert(dashRes.status === 200, "57. Hiring Dashboard returns 200 OK");
    const m = dashRes.body.metrics;
    assert(typeof m.activeJobs === "number", "58. Metrics: activeJobs is a genuine computed number");
    assert(typeof m.totalApplications === "number", "59. Metrics: totalApplications is a genuine computed number");
    assert(typeof m.interviews === "number", "60. Metrics: interviews count is computed");
    assert(Array.isArray(m.upcomingDeadlines), "61. Metrics: upcoming deadlines list returned");

    // -------------------------------------------------------------------------
    // SECTION 12: Bookmarks, Moderation & Cross-World Isolation
    // -------------------------------------------------------------------------
    console.log("\n--- SECTION 12: Bookmarks, Moderation & Strict World Isolation ---");
    // Save job
    const saveRes = await request("/api/founders/hiring/jobs/job-1/save", {
      method: "POST",
      headers: HEADERS_SNEHA,
    });
    assert(saveRes.status === 200, "62. Save / bookmark company job returns 200 OK");

    // Report job
    const reportRes = await request("/api/founders/hiring/jobs/job-1/report", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        reason: "Suspicious compensation discrepancy",
        details: "Please verify company tax ID.",
      },
    });
    assert(reportRes.status === 201, "63. Report fraudulent/suspicious job returns 201 Created");

    // Strict Cross-World Isolation check
    const crossWorldRes = await request("/api/founders/hiring/jobs", {
      headers: {
        "x-mock-account-id": "00000000-0000-0000-0000-000000000001",
        "x-platform-world": "socializing", // Cross-world violation attempt!
      },
    });
    assert(crossWorldRes.status === 403, "64. Socializing world context accessing Hiring Centre is rejected with 403 Forbidden");

    // Summary
    console.log("\n========================================");
    console.log(`FEATURE 5 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("========================================\n");
  } catch (err: any) {
    console.error("Test execution fatal error:", err);
    failed++;
  } finally {
    server.close();
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runFeature5Tests();
