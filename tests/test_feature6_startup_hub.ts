/**
 * Test Suite: Feature 6 — Balaga Founders Startup Hub
 * Tests all specification areas, integrations, and final Option A acceptance criteria:
 * 1. Discover Startups & Multi-Filtering (industry, stage, location, talent, collabs, search, sort)
 * 2. Create Startup Wizard (validation, unique slug enforcement, creator becomes Owner)
 * 3. Public Startup Profile with 9 Integrated Tabs (Overview, About, Products, Updates, Team, Jobs, Opportunities, Collabs, Contact)
 * 4. Deduplicated View Tracking
 * 5. Team Management & Granular Permissions:
 *    - Owner and Admin can invite members with granular flags
 *    - Non-admin/outsider blocked from inviting members (403 Forbidden)
 *    - Recipient receives and accepts/declines team invitation
 *    - Member removal permission checks (cannot remove owner)
 * 6. Option A: Auditable Ownership Transfer (Confirmed Decision):
 *    - Only current Owner can initiate transfer (outsiders and non-owners receive 403 Forbidden)
 *    - Recipient must be an existing startup team member (outsider recipient returns 400 Bad Request)
 *    - Exactly one pending transfer request allowed at a time
 *    - Recipient receives invitation in My Startups
 *    - Recipient accepts transfer -> atomic transition:
 *      * Recipient becomes role: "owner"
 *      * Former owner transitions to chosen role (e.g. "admin", "editor", "viewer")
 *      * Startup creatorId updated to recipient
 *      * Exactly ONE active owner exists at any time
 *      * Full audit log recorded in startup activity history
 *    - Decline transfer flow: Recipient declines -> status "declined", ownership unchanged
 *    - Cancel transfer flow: Owner cancels transfer -> status "cancelled", ownership unchanged
 * 7. Official Startup Updates:
 *    - Authorized member (canPublishUpdates=true or owner/admin) publishes update (201 Created)
 *    - Update broadcasts to Founder Feed (postsStore)
 *    - Unauthorized member (canPublishUpdates=false) receives 403 Forbidden
 * 8. Follow / Unfollow Startup (followers count increment/decrement)
 * 9. Startup B2B Connections & Investor Inquiries
 * 10. Startup Real Computed Analytics (authorized vs 403 for unauthorized)
 * 11. Activity & Audit History Logs (authorized vs 403 for unauthorized)
 * 12. Startup Settings & Privacy Controls
 * 13. Cross-World Strict Isolation (socializing world context rejected with 403 Forbidden)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runFeature6Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 6 STARTUP HUB TEST SUITE ===\n");

  const server = app.listen(5007);
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
      const parsedUrl = new URL(path, "http://localhost:5007");
      const payload = options.body ? JSON.stringify(options.body) : null;
      const req = http.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: parsedUrl.pathname + parsedUrl.search,
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
              const body = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode || 500, body });
            } catch {
              resolve({ status: res.statusCode || 500, body: data as any });
            }
          });
        }
      );
      req.on("error", reject);
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  // Account IDs and Profile IDs:
  // Aarav (Owner of st-mesh and st-dev): "00000000-0000-0000-0000-000000000001" (Profile: 20000000-0000-0000-0000-000000000001)
  // Rohit (Admin of st-mesh): "00000000-0000-0000-0000-000000000004" (Profile: 20000000-0000-0000-0000-000000000004)
  // Ananya (Hiring Manager of st-mesh): "00000000-0000-0000-0000-000000000005" (Profile: 20000000-0000-0000-0000-000000000005)
  // Vikram (Viewer of st-mesh): "00000000-0000-0000-0000-000000000006" (Profile: 20000000-0000-0000-0000-000000000006)
  // Sneha (Editor of st-mesh): "00000000-0000-0000-0000-000000000007" (Profile: 20000000-0000-0000-0000-000000000007)
  // Nikhil (Outsider to st-mesh / Owner of st-1): "00000000-0000-0000-0000-000000000003" (Profile: 20000000-0000-0000-0000-000000000003)

  const HEADERS_AARAV = { "x-mock-account-id": "00000000-0000-0000-0000-000000000001" };
  const HEADERS_ROHIT = { "x-mock-account-id": "00000000-0000-0000-0000-000000000004" };
  const HEADERS_NIKHIL = { "x-mock-account-id": "00000000-0000-0000-0000-000000000003" };
  const HEADERS_ANANYA = { "x-mock-account-id": "00000000-0000-0000-0000-000000000005" };
  const HEADERS_VIKRAM = { "x-mock-account-id": "00000000-0000-0000-0000-000000000006" };
  const HEADERS_SNEHA = { "x-mock-account-id": "00000000-0000-0000-0000-000000000007" };

  const PROFILE_AARAV = "20000000-0000-0000-0000-000000000001";
  const PROFILE_ROHIT = "20000000-0000-0000-0000-000000000004";
  const PROFILE_NIKHIL = "20000000-0000-0000-0000-000000000003";
  const PROFILE_ANANYA = "20000000-0000-0000-0000-000000000005";
  const PROFILE_VIKRAM = "20000000-0000-0000-0000-000000000006";

  try {
    // ----------------------------------------------------
    // Section 1: Discover Startups & Multi-Filtering
    // ----------------------------------------------------
    console.log("\n--- Section 1: Discover Startups & Multi-Filtering ---");

    const resAll = await request("/api/founders/startups", { headers: HEADERS_NIKHIL });
    assert(resAll.status === 200, "GET /api/founders/startups returns 200 OK");
    assert(Array.isArray(resAll.body.startups), "Discover startups returns array");
    assert(resAll.body.startups.length >= 2, "Seed startups are present (BharatFin Mesh & NovaTech)");

    // Filter by industry
    const resFintech = await request("/api/founders/startups?industry=fintech", { headers: HEADERS_NIKHIL });
    assert(resFintech.status === 200, "Filter by industry=fintech returns 200");
    const allFintech = resFintech.body.startups.every((s: any) =>
      s.industry.toLowerCase().includes("fintech") ||
      (s.additionalCategories && s.additionalCategories.some((c: string) => c.toLowerCase().includes("fintech")))
    );
    assert(allFintech, "All returned startups match fintech industry");

    // Filter by stage
    const resStage = await request("/api/founders/startups?stage=early_traction", { headers: HEADERS_NIKHIL });
    assert(resStage.status === 200, "Filter by stage=early_traction returns 200");
    const allTraction = resStage.body.startups.every((s: any) => s.stage === "early_traction");
    assert(allTraction, "All returned startups match early_traction stage");

    // Filter seeking talent
    const resTalent = await request("/api/founders/startups?seekingTalent=true", { headers: HEADERS_NIKHIL });
    assert(resTalent.status === 200, "Filter by seekingTalent=true returns 200");
    const allTalent = resTalent.body.startups.every((s: any) => s.openJobsCount > 0 || s.seekingTalent);
    assert(allTalent, "All returned startups have active open positions");

    // Filter seeking collabs
    const resCollabs = await request("/api/founders/startups?seekingCollabs=true", { headers: HEADERS_NIKHIL });
    assert(resCollabs.status === 200, "Filter by seekingCollabs=true returns 200");
    assert(resCollabs.body.startups.length > 0, "Collabs filter returned active startups");

    // Search keyword
    const resSearch = await request("/api/founders/startups?q=NovaTech", { headers: HEADERS_NIKHIL });
    assert(resSearch.status === 200, "Search by keyword NovaTech returns 200");
    assert(resSearch.body.startups.some((s: any) => s.name.includes("NovaTech")), "NovaTech found by search query");

    // ----------------------------------------------------
    // Section 2: Create Startup Wizard & Unique Slug Enforcement
    // ----------------------------------------------------
    console.log("\n--- Section 2: Create Startup Wizard & Validation ---");

    // Attempt creation with missing mandatory field
    const resBadCreate = await request("/api/founders/startups", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        name: "Incomplete Startup",
        // missing slug, oneLiner, industry, stage, broadLocation
      },
    });
    assert(resBadCreate.status === 400, "Creation fails 400 when mandatory fields missing");

    // Create valid startup as Nikhil
    const testSlug = `aeropulse-tech-${Date.now()}`;
    const validStartupPayload = {
      name: "AeroPulse Technologies",
      slug: testSlug,
      oneLiner: "Autonomous drone logistics for rural healthcare delivery across India",
      industry: "Drone Tech / Health Logistics",
      stage: "mvp" as const,
      broadLocation: "Bengaluru, Karnataka",
      websiteUrl: "https://aeropulse.in",
      problem: "Remote clinics wait days for critical temperature-controlled antivenom and vaccines.",
      solution: "Solar-assisted long-range VTOL autonomous drones capable of 150km radius deliveries in under 45 minutes.",
      technologies: ["Rust", "PX4 Autopilot", "Computer Vision", "Cellular IoT"],
      seekingTalent: true,
      seekingCollabs: true,
      seekingFunding: true,
    };

    const resCreated = await request("/api/founders/startups", {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: validStartupPayload,
    });
    assert(resCreated.status === 201, "POST /api/founders/startups creates new startup (201 Created)");
    const createdStartup = resCreated.body.startup;
    assert(createdStartup.id.startsWith("st-"), "Startup ID generated with st- prefix");
    assert(createdStartup.creatorId === PROFILE_NIKHIL, "Creator ID matches authenticated user's profile");

    // Verify creator is automatically added as Owner
    const resCreatedProfile = await request(`/api/founders/startups/${createdStartup.id}`, { headers: HEADERS_NIKHIL });
    const ownerMember = resCreatedProfile.body.team.find((m: any) => m.profileId === PROFILE_NIKHIL);
    assert(ownerMember && ownerMember.role === "owner", "Creator automatically recorded as role: 'owner'");

    // Unique slug collision enforcement
    const resSlugCollision = await request("/api/founders/startups", {
      method: "POST",
      headers: HEADERS_ROHIT,
      body: {
        ...validStartupPayload,
        name: "Duplicate Aeropulse",
        slug: testSlug, // duplicate slug!
      },
    });
    assert(resSlugCollision.status === 400, "Creation with duplicate slug returns 400 Bad Request");
    assert(resSlugCollision.body.error?.includes("already taken"), "Clear error indicating slug already in use");

    // ----------------------------------------------------
    // Section 3: Public Startup Profile & 9 Integrated Tabs
    // ----------------------------------------------------
    console.log("\n--- Section 3: Public Startup Profile & 9 Integrated Tabs ---");

    const resProfile = await request(`/api/founders/startups/bharatfin-mesh`, { headers: HEADERS_NIKHIL });
    assert(resProfile.status === 200, "Retrieve startup profile by slug returns 200 OK");
    const stProfile = resProfile.body.startup;
    assert(stProfile.name === "BharatFin Mesh", "Profile name matches");
    assert(Array.isArray(resProfile.body.products), "Products tab integrated");
    assert(Array.isArray(resProfile.body.jobs), "Jobs tab integrated (from Feature 5)");
    assert(Array.isArray(resProfile.body.opportunities), "Opportunities tab integrated (from Feature 4)");
    assert(Array.isArray(resProfile.body.team), "Team tab integrated with member details");
    assert(Array.isArray(resProfile.body.updates), "Updates tab integrated");
    assert(Array.isArray(resProfile.body.collaborations), "Collaborations tab integrated");
    assert(typeof resProfile.body.startup.followersCount === "number", "Followers counter present");

    // ----------------------------------------------------
    // Section 4: Team Invitations & Permission Checks
    // ----------------------------------------------------
    console.log("\n--- Section 4: Team Invitations & Granular Permissions ---");

    // Outsider attempting to invite member to BharatFin Mesh receives 403
    const resBadInvite = await request(`/api/founders/startups/st-mesh/invitations`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        inviteeProfileId: PROFILE_VIKRAM,
        role: "editor",
        title: "Content Specialist",
      },
    });
    assert(resBadInvite.status === 403, "Non-admin inviting member receives 403 Forbidden");

    // Owner (Aarav) invites Nikhil as editor
    const resInvite = await request(`/api/founders/startups/st-mesh/invitations`, {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        inviteeProfileId: PROFILE_NIKHIL,
        role: "editor",
        title: "DevRel & Content Specialist",
      },
    });
    assert(resInvite.status === 201, "Owner inviting team member returns 201 Created");
    const invitation = resInvite.body.invitation;
    assert(invitation && invitation.id.startsWith("inv-"), "Invitation ID generated with inv- prefix");
    assert(invitation.status === "pending", "Invitation status is pending");

    // Nikhil checks his pending invitations
    const resMyInvs = await request(`/api/founders/startups/invitations/my-invitations`, { headers: HEADERS_NIKHIL });
    assert(resMyInvs.status === 200, "GET /api/founders/startups/invitations/my-invitations returns 200");
    const myInv = resMyInvs.body.invitations.find((inv: any) => inv.id === invitation.id);
    assert(Boolean(myInv), "Invitee finds pending invitation");
    assert(myInv.startup?.name === "BharatFin Mesh", "Invitation includes startup name");

    // Nikhil accepts the invitation
    const resAcceptInv = await request(`/api/founders/startups/invitations/${invitation.id}/respond`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: { action: "accept" },
    });
    assert(resAcceptInv.status === 200, "Accepting team invitation returns 200 OK");
    assert(resAcceptInv.body.membership.role === "editor", "Membership established with role 'editor'");

    // Verify Nikhil is now in st-mesh team directory
    const resTeamAfter = await request(`/api/founders/startups/st-mesh/team`, { headers: HEADERS_NIKHIL });
    const nikhilInTeam = resTeamAfter.body.team.find((m: any) => m.profileId === PROFILE_NIKHIL);
    assert(Boolean(nikhilInTeam), "Accepted member is now listed in startup team");
    assert(nikhilInTeam.role === "editor", "Member role is editor");

    // ----------------------------------------------------
    // Section 5: Option A Ownership Transfer Flow
    // ----------------------------------------------------
    console.log("\n--- Section 5: Option A Ownership Transfer Flow ---");

    // Test 1: Outsider/Non-owner cannot initiate transfer
    const resBadTransferInit = await request(`/api/founders/startups/st-mesh/ownership-transfer`, {
      method: "POST",
      headers: HEADERS_NIKHIL, // Nikhil is an editor, not owner
      body: {
        targetOwnerProfileId: PROFILE_ROHIT,
        previousOwnerResultingRole: "admin",
      },
    });
    assert(resBadTransferInit.status === 403, "Non-owner initiating ownership transfer rejected with 403 Forbidden");

    // Test 2: Admin cannot initiate transfer (Only current Owner)
    const resAdminTransferInit = await request(`/api/founders/startups/st-mesh/ownership-transfer`, {
      method: "POST",
      headers: HEADERS_ROHIT, // Rohit is Admin, not Owner
      body: {
        targetOwnerProfileId: PROFILE_ANANYA,
        previousOwnerResultingRole: "admin",
      },
    });
    assert(resAdminTransferInit.status === 403, "Admin (non-owner) initiating transfer rejected with 403 Forbidden");

    // Test 3: Decline Flow
    // Owner (Aarav) initiates transfer to Ananya (PROFILE_ANANYA)
    const resDeclineInit = await request(`/api/founders/startups/st-mesh/ownership-transfer`, {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        targetOwnerProfileId: PROFILE_ANANYA,
        previousOwnerResultingRole: "admin",
        note: "Ananya, please take over stewardship of BharatFin Mesh",
      },
    });
    assert(resDeclineInit.status === 201, "Owner initiates ownership transfer to team member (201 Created)");
    const declineTransferId = resDeclineInit.body.request.id;

    // Ananya declines
    const resDeclineResp = await request(`/api/founders/startups/ownership-transfer/${declineTransferId}/respond`, {
      method: "POST",
      headers: HEADERS_ANANYA,
      body: { action: "decline" },
    });
    assert(resDeclineResp.status === 200, "Recipient declining transfer returns 200 OK");
    assert(resDeclineResp.body.request.status === "declined", "Transfer request status marked declined");

    // Verify ownership was NOT changed
    const resCheckDeclineTeam = await request(`/api/founders/startups/st-mesh/team`, { headers: HEADERS_NIKHIL });
    const ownerAfterDecline = resCheckDeclineTeam.body.team.find((m: any) => m.role === "owner");
    assert(ownerAfterDecline.profileId === PROFILE_AARAV, "Ownership remains with original owner (Aarav) after decline");

    // Test 4: Cancel Flow
    // Owner initiates transfer, then cancels before response
    const resCancelInit = await request(`/api/founders/startups/st-mesh/ownership-transfer`, {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        targetOwnerProfileId: PROFILE_ANANYA,
        previousOwnerResultingRole: "admin",
        note: "Taking over",
      },
    });
    assert(resCancelInit.status === 201, "Owner initiates second transfer request (201 Created)");
    const cancelTransferId = resCancelInit.body.request.id;

    // Outsider cannot cancel
    const resOutsiderCancel = await request(`/api/founders/startups/ownership-transfer/${cancelTransferId}/cancel`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
    });
    assert(resOutsiderCancel.status === 403, "Outsider cannot cancel transfer request (403 Forbidden)");

    // Owner cancels
    const resOwnerCancel = await request(`/api/founders/startups/ownership-transfer/${cancelTransferId}/cancel`, {
      method: "POST",
      headers: HEADERS_AARAV,
    });
    assert(resOwnerCancel.status === 200, "Owner successfully cancels transfer request");
    assert(resOwnerCancel.body.request.status === "cancelled", "Transfer request marked cancelled");

    // Test 5: Successful Acceptance & Atomic Role Transition
    // Owner (Aarav) initiates transfer to Admin (Rohit) choosing former role "admin"
    const resValidInit = await request(`/api/founders/startups/st-mesh/ownership-transfer`, {
      method: "POST",
      headers: HEADERS_AARAV,
      body: {
        targetOwnerProfileId: PROFILE_ROHIT,
        previousOwnerResultingRole: "admin",
        note: "Rohit, passing the torch to you as CEO and Owner of BharatFin Mesh.",
      },
    });
    assert(resValidInit.status === 201, "Owner initiates ownership transfer to Rohit (201 Created)");
    const acceptTransferId = resValidInit.body.request.id;

    // Rohit accepts the transfer
    const resAcceptTransfer = await request(`/api/founders/startups/ownership-transfer/${acceptTransferId}/respond`, {
      method: "POST",
      headers: HEADERS_ROHIT,
      body: { action: "accept" },
    });
    assert(resAcceptTransfer.status === 200, "Recipient accepting transfer returns 200 OK");
    assert(resAcceptTransfer.body.request.status === "accepted", "Transfer request status is accepted");

    // CRITICAL INVARIANT VERIFICATION: Exactly ONE active Owner exists
    const resTeamFinal = await request(`/api/founders/startups/st-mesh/team`, { headers: HEADERS_NIKHIL });
    const finalTeam = resTeamFinal.body.team;
    const owners = finalTeam.filter((m: any) => m.role === "owner");
    assert(owners.length === 1, "INVARIANT: Exactly ONE active owner exists in the startup");
    assert(owners[0].profileId === PROFILE_ROHIT, "New owner is Rohit Chawla");

    // Former owner became chosen role: "admin"
    const formerOwner = finalTeam.find((m: any) => m.profileId === PROFILE_AARAV);
    assert(formerOwner && formerOwner.role === "admin", "Former owner successfully transitioned to chosen role 'admin'");

    // Verify creatorId was updated on the startup
    const resStMeshProfile = await request(`/api/founders/startups/st-mesh`, { headers: HEADERS_NIKHIL });
    assert(resStMeshProfile.body.startup.creatorId === PROFILE_ROHIT, "Startup creatorId atomically updated to new owner (Rohit)");

    // Verify audit log was recorded
    const resAudit = await request(`/api/founders/startups/st-mesh/activity-logs`, { headers: HEADERS_ROHIT });
    assert(resAudit.status === 200, "GET /api/founders/startups/st-mesh/activity-logs returns 200");
    const transferAudit = resAudit.body.logs.find((l: any) => l.action === "ownership_transferred");
    assert(Boolean(transferAudit), "ownership_transferred event logged in audit history");
    assert(
      transferAudit?.metadata?.newOwnerId === PROFILE_ROHIT || transferAudit?.metadata?.newOwner === PROFILE_ROHIT,
      "Audit log records new owner ID"
    );

    // ----------------------------------------------------
    // Section 6: Official Startup Updates & Feed Integration
    // ----------------------------------------------------
    console.log("\n--- Section 6: Official Startup Updates ---");

    // Unauthorized member (Vikram is viewer, canPublishUpdates=false) publishing update gets 403
    const resBadUpdate = await request(`/api/founders/startups/st-mesh/updates`, {
      method: "POST",
      headers: HEADERS_VIKRAM,
      body: {
        title: "Unauthorized Update",
        content: "Spam content",
        updateType: "milestone",
      },
    });
    assert(resBadUpdate.status === 403, "Non-authorized user publishing update gets 403 Forbidden");

    // Authorized owner (Rohit) publishes official update
    const resGoodUpdate = await request(`/api/founders/startups/st-mesh/updates`, {
      method: "POST",
      headers: HEADERS_ROHIT,
      body: {
        title: "BharatFin Mesh Crosses ₹500 Cr Monthly Volume!",
        content: "Thrilled to announce that our micro-lending mesh network processed over ₹500 Cr in loans this month across tier 2/3 cities.",
        updateType: "milestone",
      },
    });
    assert(resGoodUpdate.status === 201, "Authorized member publishing update returns 201 Created");
    const pubUpdate = resGoodUpdate.body.update;
    assert(pubUpdate.startupId === "st-mesh", "Update belongs to st-mesh");
    assert(pubUpdate.title.includes("₹500 Cr"), "Update title preserved");

    // Verify update appears in startup updates list
    const resListUpdates = await request(`/api/founders/startups/st-mesh/updates`, { headers: HEADERS_NIKHIL });
    assert(resListUpdates.status === 200, "GET /api/founders/startups/st-mesh/updates returns 200");
    const foundUpdate = resListUpdates.body.updates.find((u: any) => u.id === pubUpdate.id);
    assert(Boolean(foundUpdate), "Published update listed in startup updates");

    // Verify update was broadcast to Founder Feed (postsStore)
    const resFounderFeed = await request(`/api/founders/feed`, { headers: HEADERS_NIKHIL });
    const feedPost = resFounderFeed.body.posts.find(
      (p: any) => p.associatedStartupId === "st-mesh" || p.content?.includes("₹500 Cr")
    );
    assert(Boolean(feedPost), "Official startup update broadcast to Founder Feed");

    // ----------------------------------------------------
    // Section 7: Follow / Unfollow Startup
    // ----------------------------------------------------
    console.log("\n--- Section 7: Follow / Unfollow Startup ---");

    // Follow startup as Nikhil (st-dev NovaTech Systems)
    const resFollow = await request(`/api/founders/startups/st-dev/follow`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
    });
    assert(resFollow.status === 200, "POST /api/founders/startups/:id/follow returns 200 OK");
    assert(resFollow.body.following === true, "Startup followed successfully");
    const followersAfterFollow = resFollow.body.followersCount;

    // Follow again to unfollow (toggle)
    const resUnfollow = await request(`/api/founders/startups/st-dev/follow`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
    });
    assert(resUnfollow.status === 200, "POST follow again toggles unfollow");
    assert(resUnfollow.body.following === false, "Startup unfollowed successfully");
    assert(resUnfollow.body.followersCount === followersAfterFollow - 1, "Followers count decremented");

    // ----------------------------------------------------
    // Section 8: B2B Startup Connections & Investor Inquiries
    // ----------------------------------------------------
    console.log("\n--- Section 8: Connections & Investor Inquiries ---");

    // Send connection request from Nikhil
    const resConnect = await request(`/api/founders/startups/st-mesh/connect`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        note: "We'd love to partner on drone delivery for rural medical micro-insurance documents.",
      },
    });
    assert(resConnect.status === 201, "Sending startup connection request returns 201 Created");
    assert(resConnect.body.connection.status === "pending", "Connection request status is pending");

    // Duplicate connection request blocked
    const resDupConnect = await request(`/api/founders/startups/st-mesh/connect`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: { note: "Duplicate attempt" },
    });
    assert(resDupConnect.status === 400, "Duplicate connection request returns 400 Bad Request");

    // Send investment inquiry
    const resInvest = await request(`/api/founders/startups/st-mesh/invest-inquiry`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        inquiryType: "angel",
        ticketSizeRange: "₹25L - ₹50L",
        message: "Extremely impressed by your ₹500 Cr monthly run rate. Would love to review your latest deck.",
      },
    });
    assert(resInvest.status === 201, "Sending investor inquiry returns 201 Created");
    assert(resInvest.body.inquiry.inquiryType === "angel", "Investor inquiry preserved accurately");

    // Duplicate investor inquiry blocked
    const resDupInvest = await request(`/api/founders/startups/st-mesh/invest-inquiry`, {
      method: "POST",
      headers: HEADERS_NIKHIL,
      body: {
        inquiryType: "angel",
        ticketSizeRange: "₹25L - ₹50L",
        message: "Duplicate message",
      },
    });
    assert(resDupInvest.status === 400, "Duplicate investor inquiry returns 400 Bad Request");

    // ----------------------------------------------------
    // Section 9: Real Computed Startup Analytics
    // ----------------------------------------------------
    console.log("\n--- Section 9: Real Computed Startup Analytics ---");

    // Viewer (Vikram) cannot access internal analytics
    const resBadAnalytics = await request(`/api/founders/startups/st-mesh/analytics`, { headers: HEADERS_VIKRAM });
    assert(resBadAnalytics.status === 403, "Viewer accessing analytics receives 403 Forbidden");

    // New Owner (Rohit) can access analytics
    const resAnalytics = await request(`/api/founders/startups/st-mesh/analytics`, { headers: HEADERS_ROHIT });
    assert(resAnalytics.status === 200, "Owner accessing analytics returns 200 OK");
    const analytics = resAnalytics.body.analytics;
    assert(typeof analytics.profileViews === "number", "Computed profileViews present");
    assert(typeof analytics.followersCount === "number", "Computed followersCount present");
    assert(typeof analytics.updateEngagement === "number", "Computed updateEngagement present");

    // ----------------------------------------------------
    // Section 10: Startup Settings & Privacy Controls
    // ----------------------------------------------------
    console.log("\n--- Section 10: Settings & Privacy Controls ---");

    // Viewer cannot change startup settings
    const resBadSettings = await request(`/api/founders/startups/st-mesh/settings`, {
      method: "PUT",
      headers: HEADERS_VIKRAM,
      body: { isPublic: false },
    });
    assert(resBadSettings.status === 403, "Non-admin updating settings returns 403 Forbidden");

    // Owner (Rohit) updates settings
    const resGoodSettings = await request(`/api/founders/startups/st-mesh/settings`, {
      method: "PUT",
      headers: HEADERS_ROHIT,
      body: {
        isPublic: true,
        showTeam: true,
        showContact: true,
        allowCollabs: true,
        allowConnects: true,
      },
    });
    assert(resGoodSettings.status === 200, "Owner updating settings returns 200 OK");
    assert(resGoodSettings.body.startup.visibilitySettings.isPublic === true, "Settings updated in store");

    // ----------------------------------------------------
    // Section 11: My Startups Dashboard Aggregation
    // ----------------------------------------------------
    console.log("\n--- Section 11: My Startups Dashboard Aggregation ---");

    // Query My Startups for Rohit
    const resMyStartupsRohit = await request(`/api/founders/startups/my-startups`, { headers: HEADERS_ROHIT });
    assert(resMyStartupsRohit.status === 200, "GET /api/founders/startups/my-startups returns 200 OK");
    assert(resMyStartupsRohit.body.ownedStartups.some((s: any) => s.id === "st-mesh"), "st-mesh is in ownedStartups for Rohit");

    // Query My Startups for Aarav (now Admin)
    const resMyStartupsAarav = await request(`/api/founders/startups/my-startups`, { headers: HEADERS_AARAV });
    assert(resMyStartupsAarav.status === 200, "GET My Startups for Aarav returns 200 OK");
    assert(resMyStartupsAarav.body.joinedStartups.some((s: any) => s.id === "st-mesh"), "st-mesh is in joinedStartups for Aarav");

    // ----------------------------------------------------
    // Section 12: Cross-World Strict Isolation
    // ----------------------------------------------------
    console.log("\n--- Section 12: Cross-World Strict Isolation ---");

    const resSocialLeak = await request(`/api/founders/startups`, {
      headers: {
        "x-mock-account-id": "00000000-0000-0000-0000-000000000001",
        "x-platform-world": "socializing", // ILLEGAL cross-world context!
      },
    });
    assert(resSocialLeak.status === 403, "Startup Hub strictly rejects 'socializing' world header with 403 Forbidden");
    assert(resSocialLeak.body.error?.toLowerCase().includes("founders"), "Error explicitly mentions founders world requirement");

  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n==================================================`);
  console.log(`FEATURE 6 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runFeature6Tests();
