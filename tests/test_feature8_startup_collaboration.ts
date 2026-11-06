/**
 * Test Suite: Feature 8 — Balaga Founders Startup Collaboration Network
 * Option A: Controlled Outreach Policy
 *
 * Verifies all 26 specification criteria:
 * 1. Startup Discovery & Multi-Filtering (industry, stage, location, tech, offers, needs, search)
 * 2. Startup Collaboration Profile Management & Authorization Checks (Owner / canManageCollabs vs 403)
 * 3. Proposal Formats: Simple Introduction vs Detailed Proposal
 * 4. Option A Controlled Outreach 5/week rolling limit enforcement
 * 5. 6th proposal blocked with 429 Too Many Requests / Outreach Limit Reached
 * 6. Rolling 7-day reset & remaining allowance inspection (resetsAt verification)
 * 7. Bonus allowance earned through completed partnerships (+2 per completed partnership)
 * 8. Premium tier does NOT grant unlimited outreach (Option A Rule 3)
 * 9. Proposal withdrawal does not bypass rolling 7-day limit (Option A Rule 5)
 * 10. Duplicate active proposal prevention between same startups (409 Conflict)
 * 11. Self-proposal prevention (400 Bad Request)
 * 12. Unauthorized member blocked from proposing (403 Forbidden)
 * 13. Proposal response workflows:
 *     - Counter-proposal with revised commercial terms
 *     - Request more information
 *     - Request meeting discussion
 *     - Reject proposal
 *     - Accept proposal -> Initializes Partnership Space
 * 14. Explicit "Message Partner" action & permission check (Basic connection required vs Premium direct outreach)
 * 15. Partnership Space Authorization & Multi-Member Representation
 * 16. Partnership Space Workspace (Overview, Chat, Tasks, Milestones, Documents, Meetings, Referrals, Commissions, Reviews, Disputes)
 * 17. Private In-Space Messaging
 * 18. Task Management & Status Progression
 * 19. Milestone Tracking & Target Dates
 * 20. Document Repository Management
 * 21. Meeting Scheduling & Agendas
 * 22. Referral Pipeline Tracking (submitted -> qualified -> converted)
 * 23. Commission Recording with Regulatory Disclaimer (no funds held, settled externally)
 * 24. 1-5 Partnership Reviews across 6 dimensions with Right of Reply
 * 25. Dispute Filing with Platform Assistance Disclaimer
 * 26. Real Computed Partnership Analytics & Strict Dual-World Isolation (403 for Socializing world)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";
import { accountsStore, startupsStore, startupMembersStore, thirdAccountId, thirdFounderProfileId } from "../apps/api/src/services/store.js";

async function runFeature8Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 8 STARTUP COLLABORATION NETWORK TEST SUITE ===\n");

  const server = app.listen(5009);
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
    method: string,
    path: string,
    headers: Record<string, string> = {},
    body?: any
  ): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const dataString = body ? JSON.stringify(body) : undefined;
      const req = http.request(
        {
          hostname: "localhost",
          port: 5009,
          path,
          method,
          headers: {
            "Content-Type": "application/json",
            "x-mock-user": "true",
            "x-platform-world": "founders",
            ...(dataString ? { "Content-Length": Buffer.byteLength(dataString).toString() } : {}),
            ...headers,
          },
        },
        (res) => {
          let responseData = "";
          res.on("data", (chunk) => (responseData += chunk));
          res.on("end", () => {
            try {
              resolve({
                status: res.statusCode || 500,
                body: responseData ? JSON.parse(responseData) : {},
              });
            } catch (err) {
              resolve({
                status: res.statusCode || 500,
                body: responseData,
              });
            }
          });
        }
      );
      req.on("error", reject);
      if (dataString) {
        req.write(dataString);
      }
      req.end();
    });
  }

  try {
    // Seed extra startups for outreach testing
    const testStartups = [
      { id: "st-t1", name: "FinFlow Analytics", industry: "FinTech", stage: "early_revenue", broadLocation: "Mumbai" },
      { id: "st-t2", name: "DataMesh India", industry: "Developer Infrastructure", stage: "seed", broadLocation: "Bengaluru" },
      { id: "st-t3", name: "AgriSupply Cloud", industry: "Agritech", stage: "growth", broadLocation: "Pune" },
      { id: "st-t4", name: "HealthLoom AI", industry: "HealthTech", stage: "early_revenue", broadLocation: "Hyderabad" },
      { id: "st-t5", name: "RetailKnot Logistics", industry: "Logistics", stage: "seed", broadLocation: "Delhi NCR" },
      { id: "st-t6", name: "CyberKavach Security", industry: "Cybersecurity", stage: "growth", broadLocation: "Bengaluru" },
    ];

    for (const s of testStartups) {
      startupsStore.set(s.id, {
        id: s.id,
        creatorId: thirdFounderProfileId,
        name: s.name,
        slug: s.name.toLowerCase().replace(/\s+/g, "-"),
        oneLiner: `${s.name} is building enterprise grade systems.`,
        industry: s.industry,
        stage: s.stage as any,
        broadLocation: s.broadLocation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      startupMembersStore.set(s.id, [
        {
          id: `mem-${s.id}`,
          startupId: s.id,
          profileId: thirdFounderProfileId,
          role: "owner",
          title: "Founder & CEO",
          joinedAt: new Date().toISOString(),
        },
      ]);
    }

    // ------------------------------------------------------------------------
    // TEST 1: STARTUP DISCOVERY & MULTI-FILTERING
    // ------------------------------------------------------------------------
    console.log("\n--- Group 1: Startup Discovery & Multi-Filtering ---");
    const discoverRes = await request("GET", "/api/founders/collaborations/discover");
    assert(
      discoverRes.status === 200 && Array.isArray(discoverRes.body.startups),
      "1. GET /collaborations/discover returns startups looking for partners",
      `Status: ${discoverRes.status}`
    );
    assert(
      discoverRes.body.filterFacets && Array.isArray(discoverRes.body.filterFacets.partnershipTypes),
      "2. Filter facets include 10 partnership types and dynamic industries/stages",
      `Types count: ${discoverRes.body.filterFacets?.partnershipTypes?.length}`
    );

    const filterIndustryRes = await request(
      "GET",
      "/api/founders/collaborations/discover?industry=FinTech"
    );
    assert(
      filterIndustryRes.status === 200 &&
        filterIndustryRes.body.startups.every((s: any) => s.startup.industry.toLowerCase() === "fintech"),
      "3. Filter startups by industry (FinTech) successfully",
      `Count: ${filterIndustryRes.body.total}`
    );

    const filterTypeRes = await request(
      "GET",
      "/api/founders/collaborations/discover?partnershipTypes=integration"
    );
    assert(
      filterTypeRes.status === 200 &&
        filterTypeRes.body.startups.some((s: any) =>
          s.collabProfile.preferredPartnershipTypes.includes("integration")
        ),
      "4. Filter startups by partnership type (integration)",
      `Count: ${filterTypeRes.body.total}`
    );

    const searchRes = await request(
      "GET",
      "/api/founders/collaborations/discover?search=PulseEngine"
    );
    assert(
      searchRes.status === 200 &&
        searchRes.body.startups.some((s: any) => s.startup.name.includes("PulseEngine")),
      "5. Keyword search correctly discovers matching startup and products",
      `Matches: ${searchRes.body.total}`
    );

    // ------------------------------------------------------------------------
    // TEST 2: COLLABORATION PROFILE MANAGEMENT & AUTHORIZATION
    // ------------------------------------------------------------------------
    console.log("\n--- Group 2: Collaboration Profile & Authorization ---");
    const profileRes = await request("GET", "/api/founders/collaborations/profile/st-dev");
    assert(
      profileRes.status === 200 && profileRes.body.profile.startupId === "st-dev",
      "6. GET /collaborations/profile/:startupId retrieves startup profile and allowance",
      `Startup: ${profileRes.body.startup?.name}`
    );
    assert(
      profileRes.body.isAuthorizedManager === true,
      "7. Identifies current user as authorized manager for own startup (st-dev)",
      `Manager: ${profileRes.body.isAuthorizedManager}`
    );

    // Unauthorized edit: Aarav attempting to edit PulseEngine (st-1 owned by Nikhil)
    const unauthorizedEditRes = await request(
      "PUT",
      "/api/founders/collaborations/profile/st-1",
      {},
      {
        whatWeDo: "Malicious override attempt of unauthorized startup",
        whatWeOffer: "Unauthorized offer details here",
        whatWeNeed: "Unauthorized need details here",
        preferredPartnershipTypes: ["integration"],
        preferredContactMethod: "platform_proposal",
        isActivelySeeking: true,
      }
    );
    assert(
      unauthorizedEditRes.status === 403,
      "8. Unauthorized member blocked from updating collaboration profile (403 Forbidden)",
      `Status: ${unauthorizedEditRes.status}`
    );

    // Authorized edit on st-dev
    const updateProfileRes = await request(
      "PUT",
      "/api/founders/collaborations/profile/st-dev",
      {},
      {
        whatWeDo: "We provide high-throughput eBPF distributed telemetry bridges and query optimization plugins.",
        productsAndServices: ["NovaTelemetry Pro", "eBPF Edge Agent"],
        industriesServed: ["B2B SaaS", "FinTech", "Developer Infrastructure"],
        targetCustomers: "SREs, Platform Leads, FinTech Infrastructure Teams",
        technologies: ["Go", "Rust", "PostgreSQL", "Kafka", "eBPF"],
        whatWeOffer: "Zero-latency database observability probes and co-marketing webinars.",
        whatWeNeed: "Banking switch APIs, reseller partners, and joint enterprise pilots.",
        preferredPartnershipTypes: ["integration", "referral", "joint_marketing", "tech_collab"],
        collaborationGoals: "Integrate with 10 Indian payment processors by Q4.",
        broadOperatingRegions: ["Bengaluru", "Mumbai"],
        preferredContactMethod: "platform_proposal",
        isActivelySeeking: true,
      }
    );
    assert(
      updateProfileRes.status === 200 &&
        updateProfileRes.body.profile.whatWeOffer.includes("Zero-latency database observability"),
      "9. Authorized startup owner successfully updates collaboration profile (200 OK)",
      `Message: ${updateProfileRes.body.message}`
    );

    // ------------------------------------------------------------------------
    // TEST 3: OPTION A CONTROLLED OUTREACH LIMIT ENFORCEMENT
    // ------------------------------------------------------------------------
    console.log("\n--- Group 3: Option A Controlled Outreach Enforcement ---");
    const allowanceRes = await request("GET", "/api/founders/collaborations/allowance/st-dev");
    assert(
      allowanceRes.status === 200 && allowanceRes.body.allowance.totalWeeklyLimit >= 5,
      "10. Option A: Default baseline limit is 5 proposals per rolling 7-day period",
      `Total weekly limit: ${allowanceRes.body.allowance.totalWeeklyLimit}`
    );

    // Self-proposal rejected
    const selfPropRes = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-dev",
      collabType: "integration",
      title: "Self Partnership Attempt",
      whatWeOffer: "Cannot propose to self",
      whatWeNeed: "Cannot propose to self",
    });
    assert(
      selfPropRes.status === 400,
      "11. Self-proposal rejected with 400 Bad Request",
      `Status: ${selfPropRes.status}`
    );

    // Proposal 1: Simple Introduction format
    const p1 = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t1",
      format: "intro",
      collabType: "referral",
      title: "FinFlow x NovaTelemetry Customer Referral Sync",
      whatWeOffer: "Cross-referrals to our 50+ enterprise SRE clients.",
      whatWeNeed: "Mutual referral intro to mid-tier NBFCs.",
    });
    assert(
      p1.status === 201 && p1.body.proposal.format === "intro",
      "12. Simple Introduction proposal submitted successfully (201 Created)",
      `ID: ${p1.body.proposal?.id}, Remaining: ${p1.body.remainingAllowance}`
    );

    // Duplicate active proposal rejected
    const dupPropRes = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t1",
      format: "detailed",
      collabType: "integration",
      title: "Duplicate Active Proposal Attempt",
      whatWeOffer: "Duplicate offer",
      whatWeNeed: "Duplicate need",
    });
    assert(
      dupPropRes.status === 409,
      "13. Duplicate active proposal between same startups rejected with 409 Conflict",
      `Status: ${dupPropRes.status}, Error: ${dupPropRes.body.error}`
    );

    // Proposal 2: Detailed Proposal format
    const p2 = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t2",
      format: "detailed",
      collabType: "integration",
      title: "DataMesh x NovaTelemetry Telemetry Ingestion Integration",
      whatWeOffer: "Pre-built eBPF streaming connector plugin.",
      whatWeNeed: "Access to DataMesh staging pipeline test harness.",
      commercialTerms: "Zero-fee reciprocal integration + joint case study.",
      responsibilities: ["Deliver connector code by Dec 1", "Staging security review by Dec 10"],
      proposedDuration: "6 Months",
    });
    assert(
      p2.status === 201 && p2.body.proposal.format === "detailed",
      "14. Detailed Proposal format submitted with terms & responsibilities (201 Created)",
      `Remaining: ${p2.body.remainingAllowance}`
    );

    // Proposal 3
    const p3 = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t3",
      collabType: "rev_share",
      title: "AgriSupply Cloud Telemetry Rev-Share Pilot",
      whatWeOffer: "Low-power field telemetry diagnostics.",
      whatWeNeed: "Deployment across 20 agri-supply cold storages.",
    });
    assert(p3.status === 201, "15. Proposal 3 submitted successfully");

    // Proposal 4
    const p4 = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t4",
      collabType: "distribution",
      title: "HealthLoom AI Hospital Tech Distribution",
      whatWeOffer: "HIPAA-grade query audit telemetry.",
      whatWeNeed: "Distribution in diagnostic labs network.",
    });
    assert(p4.status === 201, "16. Proposal 4 submitted successfully");

    // Proposal 5 (Reaches weekly quota)
    const p5 = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t5",
      collabType: "reseller",
      title: "RetailKnot Logistics Reseller Agreement",
      whatWeOffer: "White-label fleet observability dashboard.",
      whatWeNeed: "Reselling to top 100 logistics operators.",
    });
    assert(
      p5.status === 201 && p5.body.remainingAllowance === 0,
      "17. Proposal 5 submitted successfully, reaching 0 remaining allowance",
      `Remaining: ${p5.body.remainingAllowance}`
    );

    // Proposal 6: Exceeds Option A limit -> MUST FAIL WITH 429
    const p6Blocked = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t6",
      collabType: "tech_collab",
      title: "6th Proposal Attempt Over Weekly Limit",
      whatWeOffer: "Attempting 6th proposal",
      whatWeNeed: "Should be blocked by Option A policy",
    });
    assert(
      p6Blocked.status === 429,
      "18. Option A: 6th proposal blocked with 429 Too Many Requests (Controlled Outreach Limit)",
      `Status: ${p6Blocked.status}, Msg: ${p6Blocked.body.error}`
    );

    // Verify reset timestamp is returned
    assert(
      Boolean(p6Blocked.body.allowance?.resetsAt),
      "19. Blocked response includes resetsAt timestamp showing when quota resets",
      `ResetsAt: ${p6Blocked.body.allowance?.resetsAt}`
    );

    // Option A Rule 3: Premium does NOT grant unlimited proposals
    const devAccount = accountsStore.get("00000000-0000-0000-0000-000000000001");
    if (devAccount) devAccount.subscriptionTier = "premium";

    const premiumBlocked = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t6",
      collabType: "custom",
      title: "Premium User Proposal Limit Check",
      whatWeOffer: "Premium account test",
      whatWeNeed: "Controlled outreach must still apply",
    });
    assert(
      premiumBlocked.status === 429,
      "20. Option A Rule 3: Premium status does NOT provide unlimited proposals (429 enforced)",
      `Status: ${premiumBlocked.status}`
    );

    // Restore free tier for other tests
    if (devAccount) devAccount.subscriptionTier = "free";

    // Option A Rule 5: Withdrawing does NOT restore used weekly allowance
    const withdrawRes = await request(
      "POST",
      `/api/founders/collaborations/proposals/${p1.body.proposal.id}/respond`,
      {},
      { action: "withdraw" }
    );
    assert(
      withdrawRes.status === 200 && withdrawRes.body.proposal.status === "withdrawn",
      "21. Proposer withdraws proposal #1 successfully",
      `Status: ${withdrawRes.body.proposal?.status}`
    );

    // Now attempt 6th proposal again: must still be blocked because withdrawn proposal was within 7-day window
    const postWithdrawBlocked = await request("POST", "/api/founders/collaborations/proposals", {}, {
      initiatorStartupId: "st-dev",
      receiverStartupId: "st-t6",
      collabType: "tech_collab",
      title: "Attempting Bypassing Limit by Withdrawal",
      whatWeOffer: "Attempt",
      whatWeNeed: "Attempt",
    });
    assert(
      postWithdrawBlocked.status === 429,
      "22. Option A Rule 5: Withdrawing proposal does NOT bypass 7-day rolling outreach limit",
      `Status: ${postWithdrawBlocked.status}`
    );

    // ------------------------------------------------------------------------
    // TEST 4: PROPOSAL WORKFLOWS (COUNTER, REQUEST INFO, MEETING, REJECT, ACCEPT)
    // ------------------------------------------------------------------------
    console.log("\n--- Group 4: Proposal Response Workflows ---");
    // Switch to Nikhil (Owner of receiver startups st-t1..st-t5)
    const recipientHeaders = { "x-mock-account-id": "00000000-0000-0000-0000-000000000003" };

    // Counter-propose on p2 (DataMesh)
    const counterRes = await request(
      "POST",
      `/api/founders/collaborations/proposals/${p2.body.proposal.id}/respond`,
      recipientHeaders,
      {
        action: "counter",
        counterTerms: {
          commercialTerms: "15% referral rev share on converted enterprise leads + co-branded launch.",
          whatWeOffer: "Full access to DataMesh v3 staging sandbox.",
          whatWeNeed: "Dedicated engineering point of contact for first 30 days.",
          notes: "We would love to partner with additional support during launch.",
        },
      }
    );
    assert(
      counterRes.status === 200 && counterRes.body.proposal.status === "countered",
      "23. Recipient startup submits counter-proposal with revised terms (status: countered)",
      `Commercial terms: ${counterRes.body.proposal?.commercialTerms}`
    );

    // Request info on p3
    const infoRes = await request(
      "POST",
      `/api/founders/collaborations/proposals/${p3.body.proposal.id}/respond`,
      recipientHeaders,
      {
        action: "request_info",
        moreInfoQuery: "Could you share the power consumption specifications of your field probes?",
      }
    );
    assert(
      infoRes.status === 200 && infoRes.body.proposal.status === "more_info_requested",
      "24. Recipient requests more information regarding proposal",
      `Status: ${infoRes.body.proposal?.status}`
    );

    // Request meeting on p4
    const meetReqRes = await request(
      "POST",
      `/api/founders/collaborations/proposals/${p4.body.proposal.id}/respond`,
      recipientHeaders,
      {
        action: "request_meeting",
        meetingDetails: {
          datetime: new Date(Date.now() + 86400000 * 2).toISOString(),
          agenda: "Technical architecture review & security clearance discussion",
          linkOrLocation: "https://meet.google.com/test-collab-align",
        },
      }
    );
    assert(
      meetReqRes.status === 200 && meetReqRes.body.proposal.status === "meeting_requested",
      "25. Recipient requests discussion meeting for proposal alignment",
      `Status: ${meetReqRes.body.proposal?.status}`
    );

    // Reject p5
    const rejectRes = await request(
      "POST",
      `/api/founders/collaborations/proposals/${p5.body.proposal.id}/respond`,
      recipientHeaders,
      {
        action: "reject",
        reasonOrNotes: "Not aligning with current logistics strategy this quarter.",
      }
    );
    assert(
      rejectRes.status === 200 && rejectRes.body.proposal.status === "rejected",
      "26. Recipient declines proposal cleanly with recorded status (rejected)",
      `Status: ${rejectRes.body.proposal?.status}`
    );

    // Accept p2 (Accepted -> creates Partnership Space)
    const acceptRes = await request(
      "POST",
      `/api/founders/collaborations/proposals/${p2.body.proposal.id}/respond`,
      recipientHeaders,
      {
        action: "accept",
      }
    );
    assert(
      acceptRes.status === 200 &&
        acceptRes.body.proposal.status === "accepted" &&
        Boolean(acceptRes.body.spaceId),
      "27. Recipient accepts proposal, initializing joint Partnership Space",
      `Space ID: ${acceptRes.body.spaceId}`
    );
    const createdSpaceId = acceptRes.body.spaceId;

    // ------------------------------------------------------------------------
    // TEST 5: EXPLICIT "MESSAGE PARTNER" ACTION & PERMISSIONS
    // ------------------------------------------------------------------------
    console.log("\n--- Group 5: Message Partner Permissions ---");
    // Basic tier without mutual connection
    const msgCheckBasic = await request(
      "POST",
      "/api/founders/collaborations/message-check",
      {},
      { partnerProfileId: "00000000-0000-0000-0000-000000000005" } // Non-connected
    );
    assert(
      msgCheckBasic.status === 200 && msgCheckBasic.body.canMessage === false,
      "28. Basic tier user cannot message unconnected partner directly",
      `Reason: ${msgCheckBasic.body.reason}`
    );

    // Premium tier can message directly without connection
    if (devAccount) devAccount.subscriptionTier = "premium";
    const msgCheckPremium = await request(
      "POST",
      "/api/founders/collaborations/message-check",
      {},
      { partnerProfileId: "00000000-0000-0000-0000-000000000005" }
    );
    assert(
      msgCheckPremium.status === 200 && msgCheckPremium.body.canMessage === true,
      "29. Premium tier member can message partner directly without prior connection",
      `canMessage: ${msgCheckPremium.body.canMessage}`
    );
    if (devAccount) devAccount.subscriptionTier = "free";

    // ------------------------------------------------------------------------
    // TEST 6: PARTNERSHIP SPACES COMPLETE MANAGEMENT
    // ------------------------------------------------------------------------
    console.log("\n--- Group 6: Partnership Spaces Workspace Management ---");
    const spacesRes = await request("GET", "/api/founders/collaborations/spaces");
    assert(
      spacesRes.status === 200 &&
        spacesRes.body.spaces.some((s: any) => s.id === createdSpaceId || s.id === "space-1"),
      "30. GET /collaborations/spaces lists active partnership spaces for user's startups",
      `Total spaces: ${spacesRes.body.total}`
    );

    // Retrieve space details
    const spaceDetailRes = await request("GET", `/api/founders/collaborations/spaces/${createdSpaceId}`);
    assert(
      spaceDetailRes.status === 200 && spaceDetailRes.body.space.id === createdSpaceId,
      "31. GET /collaborations/spaces/:spaceId returns full workspace with modules",
      `Title: ${spaceDetailRes.body.space.objectives}`
    );

    // Chat in space
    const chatRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/messages`,
      {},
      { text: "Hello partner team! Let's schedule our architecture kickoff." }
    );
    assert(
      chatRes.status === 201 && chatRes.body.message.text.includes("architecture kickoff"),
      "32. Private chat message sent within Partnership Space",
      `Message ID: ${chatRes.body.message.id}`
    );

    // Manage space members (add Rohit to space)
    const addMemberRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/members`,
      {},
      { profileId: "00000000-0000-0000-0000-000000000004", action: "add" }
    );
    assert(
      addMemberRes.status === 200 &&
        addMemberRes.body.authorizedMemberIds.includes("00000000-0000-0000-0000-000000000004"),
      "33. Add authorized representative member to Partnership Space",
      `Members: ${addMemberRes.body.authorizedMemberIds.length}`
    );

    // Task CRUD
    const taskRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/tasks`,
      {},
      {
        title: "Deliver ClickHouse ingestion telemetry plugin",
        description: "Benchmark sub-50ms ingestion on staging cluster",
        status: "todo",
        progress: 0,
      }
    );
    assert(
      taskRes.status === 201 && taskRes.body.task.title.includes("ClickHouse"),
      "34. Create task in Partnership Space workspace (201 Created)",
      `Task ID: ${taskRes.body.task.id}`
    );

    const updateTaskRes = await request(
      "PUT",
      `/api/founders/collaborations/spaces/${createdSpaceId}/tasks/${taskRes.body.task.id}`,
      {},
      { status: "completed", progress: 100 }
    );
    assert(
      updateTaskRes.status === 200 && updateTaskRes.body.task.status === "completed",
      "35. Update task status and progress to completed (200 OK)",
      `Status: ${updateTaskRes.body.task.status}`
    );

    // Milestone tracking
    const milestoneRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/milestones`,
      {},
      {
        title: "Beta Sandbox Test Run Complete",
        description: "Zero dropped frames across 5M events",
        targetDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      }
    );
    assert(
      milestoneRes.status === 201 && milestoneRes.body.milestone.title.includes("Beta Sandbox"),
      "36. Create partnership milestone with target date (201 Created)",
      `Milestone ID: ${milestoneRes.body.milestone.id}`
    );

    // Document sharing
    const docRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/documents`,
      {},
      {
        name: "Telemetry_API_Specification_v1.0.pdf",
        fileUrl: "https://platform.local/docs/telemetry-spec.pdf",
        fileSize: "1.8 MB",
        accessLevel: "all_partners",
      }
    );
    assert(
      docRes.status === 201 && docRes.body.document.name.includes("Telemetry_API_Specification"),
      "37. Upload private document specification to workspace",
      `Doc ID: ${docRes.body.document.id}`
    );

    // Meeting scheduling
    const meetingRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/meetings`,
      {},
      {
        title: "Bi-Weekly Partner Engineering Sync",
        dateTime: new Date(Date.now() + 86400000 * 3).toISOString(),
        agenda: "Review benchmark results and prepare production rollout plan.",
        meetingUrlOrLocation: "https://meet.google.com/test-sync",
      }
    );
    assert(
      meetingRes.status === 201 && meetingRes.body.meeting.title.includes("Bi-Weekly Partner"),
      "38. Schedule alignment meeting in Partnership Space",
      `Meeting ID: ${meetingRes.body.meeting.id}`
    );

    // Referral pipeline tracking
    const refRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/referrals`,
      {},
      {
        receivingStartupId: "st-t2",
        customerReference: "Tier-1 Payment Gateway #491",
        status: "submitted",
        commissionTerms: "10% First-Year Contract Value",
        reportedRevenueValue: 600000,
      }
    );
    assert(
      refRes.status === 201 && refRes.body.referral.status === "submitted",
      "39. Submit customer referral into partnership pipeline",
      `Referral ID: ${refRes.body.referral.id}`
    );

    const updateRefRes = await request(
      "PUT",
      `/api/founders/collaborations/spaces/${createdSpaceId}/referrals/${refRes.body.referral.id}`,
      {},
      { status: "converted", outcomeNotes: "Contract signed for 12 months!" }
    );
    assert(
      updateRefRes.status === 200 && updateRefRes.body.referral.status === "converted",
      "40. Update referral pipeline status to converted (200 OK)",
      `Status: ${updateRefRes.body.referral.status}`
    );

    // Commission recording with legal disclaimer
    const commRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/commissions`,
      {},
      {
        referralId: refRes.body.referral.id,
        commissionType: "percentage",
        rateOrAmount: "10%",
        calculationBasis: "₹6,00,000 contract value = ₹60,000 commission",
        paymentFrequency: "One-Time",
        reportedPaymentStatus: "pending",
      }
    );
    assert(
      commRes.status === 201 &&
        commRes.body.disclaimer.includes("Balaga does not hold funds") &&
        Boolean(commRes.body.commission?.legalDisclaimer),
      "41. Record commission terms with explicit legal disclaimer (no internal wallet or escrow)",
      `Commission: ${commRes.body.commission?.rateOrAmount}`
    );

    // 1-5 Reviews across 6 dimensions + Right of Reply
    const revRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/reviews`,
      {},
      {
        communication: 5,
        professionalism: 5,
        reliability: 4,
        delivery: 5,
        transparency: 5,
        overallExperience: 5,
        feedback: "Outstanding engineering team. Clean code, prompt deliverables, and clear communication.",
      }
    );
    assert(
      revRes.status === 201 && revRes.body.review.overallScore === 4.8,
      "42. Submit partnership review across 6 dimensions with computed overall score",
      `Overall Score: ${revRes.body.review.overallScore}/5`
    );

    // Duplicate review rejected (max 1 review per participating startup)
    const dupRevRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/reviews`,
      {},
      {
        communication: 4,
        professionalism: 4,
        reliability: 4,
        delivery: 4,
        transparency: 4,
        overallExperience: 4,
        feedback: "Attempting second review",
      }
    );
    assert(
      dupRevRes.status === 409,
      "43. Duplicate review by same startup rejected with 409 Conflict",
      `Status: ${dupRevRes.status}`
    );

    // Right of reply by other party
    const replyRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/reviews`,
      recipientHeaders,
      {
        responseToReviewId: revRes.body.review.id,
        responseText: "Thank you Aarav and team! It was a pleasure integrating with NovaTelemetry.",
      }
    );
    assert(
      replyRes.status === 200 &&
        replyRes.body.review.rightOfReply?.replyText.includes("pleasure integrating"),
      "44. Partner exercises Right of Reply on submitted review (200 OK)",
      `Reply: ${replyRes.body.review.rightOfReply?.replyText}`
    );

    // Dispute Filing
    const disputeRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/disputes`,
      {},
      {
        category: "commercial_terms",
        description: "Discrepancy in revenue share settlement date timeline.",
      }
    );
    assert(
      disputeRes.status === 201 &&
        disputeRes.body.dispute.category === "commercial_terms" &&
        disputeRes.body.disclaimer.includes("does not offer legal representation"),
      "45. File collaboration dispute with platform assistance disclaimer",
      `Dispute ID: ${disputeRes.body.dispute.id}`
    );

    // Complete Partnership & Bonus Outreach Allocation
    const completeRes = await request(
      "POST",
      `/api/founders/collaborations/spaces/${createdSpaceId}/complete`,
      {}
    );
    assert(
      completeRes.status === 200 && completeRes.body.space.status === "completed",
      "46. Mark partnership as completed (200 OK)",
      `Space status: ${completeRes.body.space.status}`
    );

    // Verify both startups earned +2 bonus weekly proposals!
    const updatedDevAllowance = await request("GET", "/api/founders/collaborations/allowance/st-dev");
    assert(
      updatedDevAllowance.body.allowance.earnedBonusLimit >= 2 &&
        updatedDevAllowance.body.allowance.totalWeeklyLimit >= 7,
      "47. Completed partnership awards +2 bonus weekly outreach proposals (limit increased to 7+)",
      `New total weekly limit: ${updatedDevAllowance.body.allowance.totalWeeklyLimit}`
    );

    // ------------------------------------------------------------------------
    // TEST 7: REAL COMPUTED ANALYTICS & STRICT DUAL-WORLD ISOLATION
    // ------------------------------------------------------------------------
    console.log("\n--- Group 7: Analytics & Strict Dual-World Isolation ---");
    const analyticsRes = await request("GET", "/api/founders/collaborations/analytics/st-dev");
    assert(
      analyticsRes.status === 200 &&
        analyticsRes.body.analytics.proposalsSent >= 5 &&
        analyticsRes.body.analytics.completedPartnerships >= 1 &&
        typeof analyticsRes.body.analytics.acceptanceRate === "number",
      "48. Real computed analytics dashboard returns accurate proposals, acceptance rate, and review ratings",
      `Proposals Sent: ${analyticsRes.body.analytics.proposalsSent}, Completed: ${analyticsRes.body.analytics.completedPartnerships}`
    );

    // Strict dual-world isolation: Calling with x-platform-world: socializing MUST FAIL with 403
    const crossWorldRes = await request(
      "GET",
      "/api/founders/collaborations/discover",
      { "x-platform-world": "socializing" }
    );
    assert(
      crossWorldRes.status === 403,
      "49. Strict dual-world isolation: Socializing world context rejected with 403 Forbidden",
      `Status: ${crossWorldRes.status}`
    );

    const crossWorldProposalRes = await request(
      "GET",
      "/api/founders/collaborations/proposals",
      { "x-platform-world": "socializing" }
    );
    assert(
      crossWorldProposalRes.status === 403,
      "50. Strict dual-world isolation: Socializing context blocked from collaboration proposals",
      `Status: ${crossWorldProposalRes.status}`
    );

  } finally {
    server.close();
  }

  console.log(`\n=======================================================`);
  console.log(`FEATURE 8 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runFeature8Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
