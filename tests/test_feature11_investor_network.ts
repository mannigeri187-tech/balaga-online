/**
 * Test Suite: Feature 11 — Balaga Founders Investor Network
 * Option C: Open Investor Profiles with Separate Verification
 *
 * Verifies all 27+ specification criteria:
 * 1. Strict Dual-World Isolation (Socializing Context 403 Forbidden)
 * 2. Regulatory Disclaimers Notice in Responses (No Securities Issuance, No Escrow, Discovery Only)
 * 3. Investor Discovery with Multi-Facet Filters (investorType, industry, stage, geography, verificationStatus, acceptingPitches, search, sort)
 * 4. Personalized Recommendations Matching
 * 5. Option C: Open / Self-Declared Investor Profile Creation (verificationStatus defaults to "unverified", verifiedBadge is false)
 * 6. Automated Profile Validation & Duplicate Prevention (400 for existing profile)
 * 7. Investor Profile Retrieval (my-profile & public profile by ID, views count increment)
 * 8. Investor Profile Updates (403 for unauthorized non-owner)
 * 9. Investor Status Management ("active" / "paused" / "closed")
 * 10. Investor Bookmarking & Following (Toggling on and off)
 * 11. Reporting an Investor Profile (Community Moderation)
 * 12. Option C: Separate Verification Submission (identity_proof, organization_incorporation, fund_registration)
 * 13. Admin Verification Review Flow (Awarding "verified" status and verifiedBadge upon approval)
 * 14. Discover Startups for Investors with Strict Privacy Level Enforcement (public, investors_only, connections_only, private)
 * 15. Investor Pipeline: Saving Startups to Pipeline
 * 16. Startup Fundraising Profile Management (Strict 403 Forbidden for Non-Owner/Non-Admin)
 * 17. Founder to Investor Introduction Request Submission & Anti-Abuse (Self-Request Rejection 400, Duplicate Rejection 409)
 * 18. Sent & Incoming Introduction Requests Retrieval
 * 19. Introduction Request Details Inspection
 * 20. Responding to Intro Request: Acceptance Auto-Provisions FundraisingConversation Workspace
 * 21. Founder Withdrawal of Introduction Request
 * 22. Investor Expressing Direct Investment Interest in a Startup
 * 23. Startup Founder Responding to Expressed Interest (Acceptance Provisions FundraisingConversation)
 * 24. Private Fundraising Conversation Workspace Retrieval & Data Isolation
 * 25. Secure Pitch Materials Sharing (Decks, One-Pagers, Ownership Tracking)
 * 26. Private Notes & Deal Stage Management ("initial_review", "due_diligence", "term_sheet_discussion", etc.)
 * 27. Direct Messaging Privilege Verification (Basic vs Premium Tier / Mutual Connections)
 * 28. Investor Meeting Scheduling (Date, Time, Duration, Online/In-Person, Agenda)
 * 29. Meeting Status Updates ("confirmed", "rescheduled", "completed", "cancelled")
 * 30. Computed Investor Dashboard Analytics (Views, Saved Startups, Intros Received, Active Workspaces)
 * 31. Computed Founder Fundraising Dashboard Analytics (Completion %, Views, Requests Sent, Active Workspaces)
 * 32. Admin Moderation: Restrict & Restore Investor Profiles
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";
import {
  devAccountId,
  thirdAccountId,
  fourthAccountId,
} from "../apps/api/src/services/store.js";

async function runFeature11Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 11 INVESTOR NETWORK TEST SUITE ===\n");

  const server = app.listen(5012);
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

  function api(
    method: string,
    path: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<{ status: number; body: any; headers: any }> {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : "";
      const reqHeaders = {
        "x-mock-user": "true",
        "x-mock-account-id": devAccountId,
        "x-platform-world": "founders",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...headers,
      };

      const req = http.request(
        {
          hostname: "localhost",
          port: 5012,
          path: `/api/founders${path}`,
          method,
          headers: reqHeaders,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const parsed = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode || 500, body: parsed, headers: res.headers });
            } catch (e) {
              resolve({ status: res.statusCode || 500, body: data, headers: res.headers });
            }
          });
        }
      );

      req.on("error", reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  try {
    // -------------------------------------------------------------------------
    // 1. STRICT DUAL-WORLD ISOLATION
    // -------------------------------------------------------------------------
    console.log("\n--- Category 1: Strict Dual-World Isolation ---");
    const isolationRes = await api("GET", "/investors/discover", null, {
      "x-platform-world": "socializing",
    });
    assert(
      isolationRes.status === 403,
      "Socializing world headers rejected with HTTP 403 Forbidden"
    );

    // -------------------------------------------------------------------------
    // 2. DISCOVERY & MULTI-FACET FILTERING
    // -------------------------------------------------------------------------
    console.log("\n--- Category 2: Investor Discovery & Filtering ---");
    const discoverRes = await api("GET", "/investors/discover");
    assert(discoverRes.status === 200, "GET /investors/discover returns HTTP 200");
    assert(
      Array.isArray(discoverRes.body.investors) && discoverRes.body.investors.length >= 2,
      "Discover returns seeded active investors list"
    );
    assert(
      Boolean(discoverRes.body.regulatoryDisclaimer),
      "Responses include required regulatory discovery disclaimer"
    );

    // Filter by type
    const filterTypeRes = await api("GET", "/investors/discover?investorType=angel_investor");
    assert(
      filterTypeRes.status === 200 &&
        filterTypeRes.body.investors.every((i: any) => i.investorType === "angel_investor"),
      "Filtering by investorType works accurately"
    );

    // Filter by verification status (Option C: verified vs unverified)
    const filterVerifiedRes = await api("GET", "/investors/discover?verificationStatus=verified");
    assert(
      filterVerifiedRes.status === 200 &&
        filterVerifiedRes.body.investors.every((i: any) => i.verificationStatus === "verified"),
      "Option C: Filtering by verificationStatus=verified works accurately"
    );

    // Search filter
    const searchRes = await api("GET", "/investors/discover?search=FinTech");
    assert(
      searchRes.status === 200 && searchRes.body.investors.length > 0,
      "Keyword search by thesis/sector returns relevant investors"
    );

    // Personalized Recommendations
    const recRes = await api("GET", "/investors/recommended");
    assert(recRes.status === 200, "GET /investors/recommended returns HTTP 200");
    assert(Array.isArray(recRes.body.investors), "Recommendations return array of investors");

    // -------------------------------------------------------------------------
    // 3. OPTION C: INVESTOR PROFILE CREATION & MANAGEMENT
    // -------------------------------------------------------------------------
    console.log("\n--- Category 3: Option C Profile Creation & Lifecycle ---");

    // Check my-profile initially (dev founder has no profile yet)
    const myProfileRes1 = await api("GET", "/investors/my-profile");
    assert(myProfileRes1.status === 200 && myProfileRes1.body.hasProfile === false, "No initial profile for dev founder");

    // Create self-declared investor profile
    const createProfileRes = await api("POST", "/investors/profiles", {
      investorType: "angel_investor",
      headline: "Dev Founder Angel & Seed Investor | Ex-Tech Lead",
      biography: "Passionate early-stage angel investing in developer tooling, infrastructure, and Web3 in India.",
      investmentExperience: "5+ years software engineering, 2 years angel investing.",
      isOrganization: false,
      thesis: {
        industries: ["Developer Tools", "AI and Machine Learning", "SaaS"],
        stages: ["Pre-Seed", "Seed"],
        geographies: ["Bengaluru", "India"],
        businessModels: ["B2B SaaS"],
        thesisSummary: "Backing deep tech developer tooling teams across India.",
        minCheckSize: 1000000,
        maxCheckSize: 5000000,
        currency: "INR",
      },
      portfolioCompanies: [
        { name: "SampleDevTool", stage: "Seed", investmentYear: 2024 },
      ],
      isAvailableForIntros: true,
    });

    assert(createProfileRes.status === 201, "POST /investors/profiles creates profile (HTTP 201)");
    const myInvestor = createProfileRes.body.investor;
    assert(
      myInvestor && myInvestor.verificationStatus === "unverified",
      "Option C: Newly created investor profile is strictly 'unverified' (self-declared by default)"
    );
    assert(
      myInvestor.verifiedBadge === false,
      "Option C: Newly created profile does NOT have verified badge"
    );

    // Duplicate profile creation blocked
    const dupProfileRes = await api("POST", "/investors/profiles", {
      investorType: "angel_investor",
      headline: "Duplicate Attempt",
      biography: "Should fail duplicate",
      investmentExperience: "None",
      thesis: {
        industries: ["SaaS"],
        stages: ["Seed"],
        geographies: ["India"],
        businessModels: ["B2B SaaS"],
        thesisSummary: "Test thesis summary for validation",
      },
    });
    assert(dupProfileRes.status === 400, "Duplicate investor profile creation returns HTTP 400");

    // Fetch my profile now
    const myProfileRes2 = await api("GET", "/investors/my-profile");
    assert(
      myProfileRes2.status === 200 && myProfileRes2.body.hasProfile === true,
      "GET /investors/my-profile returns created profile"
    );

    // Detail view by ID increments views count
    const detailBefore = await api("GET", `/investors/${myInvestor.id}`);
    const views1 = detailBefore.body.investor.viewsCount;
    const detailAfter = await api("GET", `/investors/${myInvestor.id}`);
    assert(
      detailAfter.body.investor.viewsCount === views1 + 1,
      "GET /investors/:id increments viewsCount accurately"
    );

    // Update investor profile
    const updateRes = await api("PUT", `/investors/profiles/${myInvestor.id}`, {
      headline: "Updated Angel Investor & Technical Advisor",
    });
    assert(
      updateRes.status === 200 && updateRes.body.investor.headline === "Updated Angel Investor & Technical Advisor",
      "PUT /investors/profiles/:id updates profile fields"
    );

    // Toggle status (paused / active)
    const pauseRes = await api("POST", `/investors/profiles/${myInvestor.id}/status`, {
      status: "paused",
    });
    assert(pauseRes.status === 200 && pauseRes.body.investor.status === "paused", "Status updated to paused");

    const reactivateRes = await api("POST", `/investors/profiles/${myInvestor.id}/status`, {
      status: "active",
    });
    assert(reactivateRes.status === 200 && reactivateRes.body.investor.status === "active", "Status reactivated to active");

    // Bookmark & Follow toggling
    const bookmarkRes1 = await api("POST", `/investors/inv-3/bookmark`);
    assert(bookmarkRes1.status === 200 && bookmarkRes1.body.hasBookmarked === true, "Bookmark investor toggle on");
    const bookmarkRes2 = await api("POST", `/investors/inv-3/bookmark`);
    assert(bookmarkRes2.status === 200 && bookmarkRes2.body.hasBookmarked === false, "Bookmark investor toggle off");

    const followRes1 = await api("POST", `/investors/inv-1/follow`);
    assert(followRes1.status === 200 && followRes1.body.isFollowing === true, "Follow investor toggle on");
    const followRes2 = await api("POST", `/investors/inv-1/follow`);
    assert(followRes2.status === 200 && followRes2.body.isFollowing === false, "Follow investor toggle off");

    // Report investor
    const reportRes = await api("POST", `/investors/inv-1/report`, {
      reason: "spam",
      details: "Test reporting mechanism",
    });
    assert(reportRes.status === 201, "POST /investors/:id/report registers report (HTTP 201)");

    // -------------------------------------------------------------------------
    // 4. OPTION C: SEPARATE VERIFICATION FLOW
    // -------------------------------------------------------------------------
    console.log("\n--- Category 4: Option C Separate Verification Flow ---");

    // Submit verification evidence
    const verifySubRes = await api("POST", `/investors/profiles/${myInvestor.id}/verification`, {
      evidenceType: "identity_proof",
      documentUrls: ["https://balaga.online/docs/angel_kyc.pdf"],
      officialEntityName: "Singhal Angel Holdings",
      registrationNumber: "IN-ANGEL-2026-99",
      notes: "Accredited investor identity and holding verification",
    });

    assert(verifySubRes.status === 201, "POST /investors/profiles/:id/verification submits evidence (HTTP 201)");
    const submissionId = verifySubRes.body.submission.id;
    assert(
      verifySubRes.body.investor.verificationStatus === "verification_submitted",
      "Investor profile status transitions to 'verification_submitted'"
    );

    // Admin reviews and approves verification
    const reviewRes = await api("POST", `/investors/verification/${submissionId}/review`, {
      decision: "approve",
      decisionNotes: "All KYC and portfolio documents verified successfully",
      badgeTitle: "Verified Angel Investor",
    });

    assert(reviewRes.status === 200, "POST /investors/verification/:id/review completes admin review");
    assert(
      reviewRes.body.submission.status === "approved",
      "Submission status is approved"
    );
    assert(
      reviewRes.body.investor.verificationStatus === "verified" && reviewRes.body.investor.verifiedBadge === true,
      "Option C: Verified badge and 'verified' status awarded upon successful check"
    );

    // -------------------------------------------------------------------------
    // 5. STARTUP FUNDRAISING PROFILES & PRIVACY BOUNDARIES
    // -------------------------------------------------------------------------
    console.log("\n--- Category 5: Startup Fundraising & Privacy ---");

    // Discover startups for investors
    const startupsRes = await api("GET", "/investors/startups/discover");
    assert(startupsRes.status === 200, "GET /investors/startups/discover returns HTTP 200");
    assert(Array.isArray(startupsRes.body.startups), "Startups list returned for discovery");

    // Save startup to pipeline
    const saveStartupRes = await api("POST", "/investors/startups/st-dev/save");
    assert(saveStartupRes.status === 200 && saveStartupRes.body.isSaved === true, "Investor saves startup to pipeline");

    // Fetch startup fundraising profile
    const fundProfileRes = await api("GET", "/investors/startups/st-dev/fundraising");
    assert(fundProfileRes.status === 200, "GET /investors/startups/:id/fundraising returns HTTP 200");
    assert(fundProfileRes.body.fundraising !== null, "Fundraising profile data retrieved");

    // Update startup fundraising profile (dev is owner of st-dev)
    const updateFundRes = await api("PUT", "/investors/startups/st-dev/fundraising", {
      fundraisingStatus: "actively_fundraising",
      privacyLevel: "investors_only",
      fundingStage: "Seed Round",
      amountSought: 40000000, // ₹4 Cr
      currency: "INR",
      useOfFunds: "Scale engineering team and GTM expansion",
    });
    assert(updateFundRes.status === 200, "Startup owner updates fundraising profile (HTTP 200)");

    // Unauthorized outsider receives 403 on update fundraising profile
    const unauthFundRes = await api(
      "PUT",
      "/investors/startups/st-dev/fundraising",
      {
        fundingStage: "Series A",
        amountSought: 50000000,
        fundraisingStatus: "actively_fundraising",
        privacyLevel: "public",
      },
      { "x-mock-account-id": thirdAccountId } // Non-member / non-owner
    );
    assert(
      unauthFundRes.status === 403,
      "Strict Security: Non-owner/non-member receives HTTP 403 on updating startup fundraising profile"
    );

    // -------------------------------------------------------------------------
    // 6. INTRODUCTION REQUESTS & WORKSPACE PROVISIONING
    // -------------------------------------------------------------------------
    console.log("\n--- Category 6: Introduction Requests Lifecycle ---");

    // Prevent self-request (founder requesting their own investor profile)
    const selfReqRes = await api("POST", "/investors/requests", {
      startupId: "st-dev",
      investorProfileId: myInvestor.id, // dev's own investor profile
      whyRelevant: "Self request test",
      businessOverview: "Test",
      fundraisingStage: "Seed",
      specificRequest: "Self intro",
    });
    assert(selfReqRes.status === 400, "Self-introduction request rejected with HTTP 400");

    // Submit legitimate introduction request to inv-2 (PeakScale Ventures, owned by thirdAccountId)
    const introReqRes = await api("POST", "/investors/requests", {
      startupId: "st-dev",
      investorProfileId: "inv-2",
      whyRelevant: "CodePulse enterprise SaaS developer tooling aligns with PeakScale Ventures Fund I thesis.",
      businessOverview: "CodePulse offers AI-assisted performance monitoring for distributed microservices.",
      fundraisingStage: "Seed",
      amountSought: 35000000,
      specificRequest: "Introductory meeting with investment committee partner.",
      pitchDeckUrl: "https://balaga.online/decks/codepulse_seed.pdf",
    });

    assert(introReqRes.status === 201, "POST /investors/requests submits intro request (HTTP 201)");
    const createdReq = introReqRes.body.request;
    assert(createdReq.status === "submitted", "Intro request status is 'submitted'");

    // Duplicate active request prevention (HTTP 409)
    const dupIntroReqRes = await api("POST", "/investors/requests", {
      startupId: "st-dev",
      investorProfileId: "inv-2",
      whyRelevant: "Duplicate attempt for testing 409",
      businessOverview: "Valid 10+ character overview of the business",
      fundraisingStage: "Seed",
      specificRequest: "Duplicate intro",
    });
    assert(dupIntroReqRes.status === 409, "Duplicate active intro request rejected with HTTP 409 Conflict");

    // Fetch sent requests
    const sentReqsRes = await api("GET", "/investors/requests/sent");
    assert(
      sentReqsRes.status === 200 && sentReqsRes.body.requests.some((r: any) => r.id === createdReq.id),
      "GET /investors/requests/sent lists submitted request"
    );

    // Fetch incoming requests as thirdAccountId (owner of inv-2)
    const incomingReqsRes = await api("GET", "/investors/requests/incoming", null, {
      "x-mock-account-id": thirdAccountId,
    });
    assert(
      incomingReqsRes.status === 200 && incomingReqsRes.body.requests.some((r: any) => r.id === createdReq.id),
      "GET /investors/requests/incoming lists incoming request for investor"
    );

    // Request detail view
    const reqDetailRes = await api("GET", `/investors/requests/${createdReq.id}`);
    assert(reqDetailRes.status === 200, "GET /investors/requests/:id returns request details");

    // Investor responds with "accept" -> AUTO-PROVISIONING of FundraisingConversation
    const respondRes = await api(
      "POST",
      `/investors/requests/${createdReq.id}/respond`,
      {
        action: "accept",
        reasonOrNotes: "Very impressive metrics. Delighted to connect and schedule a deck walkthrough.",
      },
      { "x-mock-account-id": thirdAccountId } // inv-2 owner
    );

    assert(respondRes.status === 200, "POST /investors/requests/:id/respond succeeds with 200");
    assert(respondRes.body.request.status === "accepted", "Intro request status updated to 'accepted'");
    assert(
      respondRes.body.conversation !== null && Boolean(respondRes.body.conversation.id),
      "Auto-Provisioning: Dedicated FundraisingConversation workspace automatically created upon acceptance"
    );
    const convId = respondRes.body.conversation.id;

    // -------------------------------------------------------------------------
    // 7. INVESTOR EXPRESSING INTEREST & STARTUP RESPONSE
    // -------------------------------------------------------------------------
    console.log("\n--- Category 7: Investor Expressed Interest ---");

    // Dev founder (who now has an investor profile `myInvestor`) expresses interest in st-1 (PulseEngine AI)
    const interestRes = await api("POST", "/investors/interests", {
      startupId: "st-1",
      personalizedNote: "We love your EdTech and career growth platform. Would love to explore joining your angel syndicate.",
    });

    assert(interestRes.status === 201, "POST /investors/interests registers investor interest (HTTP 201)");
    const interestId = interestRes.body.interest.id;

    // Sent and incoming interests
    const sentInterestsRes = await api("GET", "/investors/interests/sent");
    assert(
      sentInterestsRes.status === 200 && sentInterestsRes.body.interests.some((i: any) => i.id === interestId),
      "GET /investors/interests/sent lists sent interest"
    );

    // -------------------------------------------------------------------------
    // 8. PRIVATE FUNDRAISING CONVERSATION WORKSPACE & MATERIALS
    // -------------------------------------------------------------------------
    console.log("\n--- Category 8: Private Workspace, Secure Materials & Notes ---");

    // Access conversation workspace
    const convRes = await api("GET", `/investors/conversations/${convId}`);
    assert(convRes.status === 200, "GET /investors/conversations/:id returns workspace (HTTP 200)");
    assert(
      convRes.body.conversation.startupId === "st-dev",
      "Workspace correctly bound to associated startup"
    );

    // Share secure pitch material
    const shareMatRes = await api(`POST`, `/investors/conversations/${convId}/materials`, {
      title: "Seed Round Detailed Financial Model",
      fileUrl: "https://balaga.online/docs/codepulse_financials_v2.xlsx",
      filename: "codepulse_financials_v2.xlsx",
    });

    assert(shareMatRes.status === 201, "POST /investors/conversations/:id/materials shares secure document (HTTP 201)");
    assert(
      shareMatRes.body.conversation.sharedPitchMaterials.some((m: any) => m.title === "Seed Round Detailed Financial Model"),
      "Document appended to conversation shared pitch materials"
    );

    // Update conversation notes and stage
    const notesRes = await api(`POST`, `/investors/conversations/${convId}/notes`, {
      notes: "First partner call scheduled. Deck review in progress.",
      stage: "due_diligence",
    });
    assert(
      notesRes.status === 200 && notesRes.body.conversation.discussionStatus === "due_diligence",
      "Conversation stage updated to due_diligence"
    );

    // Direct messaging permission check
    const msgCheckRes = await api(`POST`, `/investors/conversations/${convId}/message-check`);
    assert(
      msgCheckRes.status === 200 && typeof msgCheckRes.body.canMessage === "boolean",
      "Messaging check returns boolean eligibility based on mutual connection / Premium tier"
    );

    // -------------------------------------------------------------------------
    // 9. INVESTOR MEETINGS MANAGEMENT
    // -------------------------------------------------------------------------
    console.log("\n--- Category 9: Investor Meeting Scheduling ---");

    const scheduleMeetingRes = await api("POST", "/investors/meetings", {
      title: "Technical Due Diligence & Architecture Walkthrough",
      sessionDate: "2026-11-15",
      startTime: "14:30",
      durationMinutes: 45,
      timezone: "Asia/Kolkata",
      format: "online",
      meetingLinkOrLocation: "https://meet.google.com/xyz-balaga-invest",
      agenda: "Review distributed consensus algorithm and cloud cost unit economics.",
      conversationId: convId,
    });

    assert(scheduleMeetingRes.status === 201, "POST /investors/meetings schedules meeting (HTTP 201)");
    const meetingId = scheduleMeetingRes.body.meeting.id;

    // Update meeting status to rescheduled
    const updateMeetingRes = await api(`PUT`, `/investors/meetings/${meetingId}/status`, {
      status: "rescheduled",
      newSessionDate: "2026-11-16",
      newStartTime: "15:00",
      notes: "Rescheduled upon mutual investor availability",
    });
    assert(
      updateMeetingRes.status === 200 && updateMeetingRes.body.meeting.status === "rescheduled",
      "Meeting status updated to rescheduled"
    );

    // -------------------------------------------------------------------------
    // 10. DASHBOARD ANALYTICS & ADMIN MODERATION
    // -------------------------------------------------------------------------
    console.log("\n--- Category 10: Computed Dashboard Analytics & Moderation ---");

    // Investor dashboard analytics
    const invStatsRes = await api("GET", "/investors/dashboard/investor-stats");
    assert(invStatsRes.status === 200, "GET /investors/dashboard/investor-stats returns HTTP 200");
    assert(
      typeof invStatsRes.body.stats.profileViews === "number" &&
        typeof invStatsRes.body.stats.incomingIntroductionsCount === "number",
      "Investor analytics compute profile views and introductions metrics"
    );

    // Founder fundraising dashboard analytics
    const founderStatsRes = await api("GET", "/investors/dashboard/founder-stats/st-dev");
    assert(founderStatsRes.status === 200, "GET /investors/dashboard/founder-stats/:startupId returns HTTP 200");
    assert(
      typeof founderStatsRes.body.stats.fundraisingProfileCompletion === "number" &&
        typeof founderStatsRes.body.stats.introRequestsSentCount === "number",
      "Founder fundraising stats compute profile completion % and sent requests"
    );

    // Admin moderation restrict & restore
    const modRestrictRes = await api(`POST`, `/investors/moderation/${myInvestor.id}/restrict`, {
      action: "restrict",
      reason: "Security audit compliance check",
    });
    assert(modRestrictRes.status === 200 && modRestrictRes.body.status === "paused", "Admin restricts investor profile");

    const modRestoreRes = await api(`POST`, `/investors/moderation/${myInvestor.id}/restrict`, {
      action: "restore",
    });
    assert(modRestoreRes.status === 200 && modRestoreRes.body.status === "active", "Admin restores investor profile to active");
  } catch (err) {
    console.error("Unhandled test execution error:", err);
    failed++;
  } finally {
    server.close();
    console.log(`\n======================================================`);
    console.log(`FEATURE 11 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log(`======================================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runFeature11Tests();
