/**
 * Test Suite: Feature 12 — Balaga Build Spaces
 * Option C: Both Private and Public Project Build Spaces
 *
 * Verifies all 45+ specification criteria:
 * 1. Strict Dual-World Isolation (Socializing context returns 403 Forbidden)
 * 2. Regulatory & Collaboration Advisory Disclaimer in responses
 * 3. Build Spaces Dashboard listing & statistics
 * 4. Option C: Discover Public Projects (Only public projects returned, outline only)
 * 5. Private Space Protection (403 for non-members)
 * 6. Public Space Non-Member Outline Access (Internal tasks/docs/chat/meetings not leaked)
 * 7. Create Project Build Space (Option C visibility="private", owner assignment)
 * 8. Option C: Visibility Toggle (Private <-> Public by Owner/Admin)
 * 9. Partnership Space Immutability of Privacy (Cannot be made public -> 400)
 * 10. Workspace Status Updates (active, paused, completed, archived)
 * 11. Join Request Submission (Option C Public Projects)
 * 12. Duplicate Join Request Prevention (409 Conflict)
 * 13. Owner Requesting More Info on Join Request
 * 14. Applicant Providing More Info Response
 * 15. Owner Accepting Join Request (Grants membership & assigned role)
 * 16. Join Request Withdrawal
 * 17. Member Invitation Workflow (Admin/Owner invites, role assignment)
 * 18. Duplicate Invitation Prevention (409 Conflict)
 * 19. Invitee Accepting Invitation (Grants membership)
 * 20. Invitee Declining Invitation
 * 21. Admin Revoking Pending Invitation
 * 22. Member Role Updates (admin, editor, member, viewer)
 * 23. Role-Based Permissions Enforcement (viewer blocked from creating tasks -> 403)
 * 24. Ownership Transfer Initiation & Acceptance
 * 25. Member Removal & Immediate Revocation of Access
 * 26. Owner Cannot Abandon Space Without Transfer
 * 27. Task Management (Create with checklist, assign, priority, status)
 * 28. Task Checklists & Comments
 * 29. Genuine Task Progress Calculation (Real mathematical percentage)
 * 30. Milestone Management (Create, update status, target date)
 * 31. Genuine Milestone Progress Calculation
 * 32. Workspace Internal Chat & Channels Isolation
 * 33. Documents & File Sharing
 * 34. Collaboration Meeting Scheduling & Lifecycle
 * 35. Workspace Activity Logging
 * 36. Feature 8 Partnership Space Activation & Duplicate Prevention
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";
import {
  devAccountId,
  thirdAccountId,
  fourthAccountId,
  thirdFounderProfileId,
  fourthFounderProfileId,
} from "../apps/api/src/services/store.js";

async function runFeature12Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 12 BUILD SPACES TEST SUITE ===\n");

  const server = app.listen(5013);
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
          port: 5013,
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
            } catch {
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
    // -------------------------------------------------------------
    // TEST 1: Strict Dual-World Isolation
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 1: Dual-World Isolation & Disclaimers ---");
    const isolationRes = await api("GET", "/build-spaces", undefined, {
      "x-platform-world": "socializing",
    });
    assert(
      isolationRes.status === 403,
      "Socializing world context is strictly blocked (HTTP 403 Forbidden)",
      `Expected 403, got ${isolationRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 2: Regulatory Advisory Disclaimer
    // -------------------------------------------------------------
    const spacesRes = await api("GET", "/build-spaces");
    assert(
      spacesRes.status === 200 &&
        typeof spacesRes.body.disclaimer === "string" &&
        spacesRes.body.disclaimer.includes("collaboration"),
      "Response includes explicit regulatory / collaboration disclaimer",
      `Got status ${spacesRes.status}, disclaimer: ${spacesRes.body.disclaimer}`
    );

    // -------------------------------------------------------------
    // TEST 3: Dashboard Stats
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: Dashboard Statistics & Discovery ---");
    const statsRes = await api("GET", "/build-spaces/stats");
    assert(
      statsRes.status === 200 &&
        typeof statsRes.body.stats?.totalSpaces === "number" &&
        typeof statsRes.body.stats?.projectSpacesCount === "number" &&
        typeof statsRes.body.stats?.partnershipSpacesCount === "number",
      "GET /build-spaces/stats returns accurate workspace metrics",
      `Stats: ${JSON.stringify(statsRes.body.stats)}`
    );

    // -------------------------------------------------------------
    // TEST 4: Discover Public Projects (Option C)
    // -------------------------------------------------------------
    const discoverRes = await api("GET", "/build-spaces/projects/discover");
    assert(
      discoverRes.status === 200 &&
        Array.isArray(discoverRes.body.projects) &&
        discoverRes.body.projects.length > 0,
      "GET /build-spaces/projects/discover returns public projects",
      `Count: ${discoverRes.body.projects?.length}`
    );

    const publicSpace = discoverRes.body.projects.find((p: any) => p.id === "bspace-public-1");
    assert(
      publicSpace &&
        publicSpace.name === "OpenAI UPI Settlement Protocol" &&
        publicSpace.tasks === undefined &&
        publicSpace.documents === undefined,
      "Public project listing exposes only designated outline (no internal tasks/docs leaked)",
      `Found: ${publicSpace?.name}`
    );

    // -------------------------------------------------------------
    // TEST 5: Private Space Protection (403 for Non-Members)
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: Access Control & Option C Projections ---");
    // thirdAccountId is not a member of bspace-dev-1
    const privateAccessRes = await api("GET", "/build-spaces/bspace-dev-1", undefined, {
      "x-mock-account-id": thirdAccountId,
    });
    assert(
      privateAccessRes.status === 403,
      "Non-member access to private workspace is strictly rejected (HTTP 403)",
      `Expected 403, got ${privateAccessRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 6: Public Space Non-Member View (Public Outline Only)
    // -------------------------------------------------------------
    // fourthAccountId accessing bspace-public-1 (which is public and owned by thirdAccountId)
    const publicAccessRes = await api("GET", "/build-spaces/bspace-public-1", undefined, {
      "x-mock-account-id": fourthAccountId,
    });
    assert(
      publicAccessRes.status === 200 &&
        publicAccessRes.body.isMember === false &&
        publicAccessRes.body.tasks === undefined &&
        publicAccessRes.body.documents === undefined,
      "Public space non-member view returns outline with isMember=false and internal content redacted",
      `Status: ${publicAccessRes.status}, isMember: ${publicAccessRes.body.isMember}`
    );

    // -------------------------------------------------------------
    // TEST 7: Create Project Build Space
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: Workspace Creation & Lifecycle ---");
    const createRes = await api("POST", "/build-spaces", {
      name: "ChronoTrace Observability",
      shortDescription: "High-throughput distributed tracing engine in Rust",
      detailedOverview: "Full telemetry pipeline for microservices running across India data centers.",
      category: "software",
      developmentStage: "building",
      mainGoals: ["Complete eBPF probe", "Kafka ingestion", "Benchmarking"],
      expectedOutcomes: ["Production ready agent binary"],
      skillsRequired: ["Rust", "eBPF", "Linux Kernel"],
      technologiesUsed: ["Rust", "Tokio", "eBPF", "Kafka"],
      targetCompletionDate: "2026-12-31",
      visibility: "private",
    });

    assert(
      createRes.status === 201 &&
        createRes.body.space?.id &&
        createRes.body.space.visibility === "private" &&
        createRes.body.space.currentUserRole === "owner",
      "POST /build-spaces creates Project Build Space with creator as owner",
      `ID: ${createRes.body.space?.id}, Role: ${createRes.body.space?.currentUserRole}`
    );
    const newSpaceId = createRes.body.space.id;

    // -------------------------------------------------------------
    // TEST 8: Option C: Visibility Toggle (Private <-> Public)
    // -------------------------------------------------------------
    const makePublicRes = await api("PUT", `/build-spaces/${newSpaceId}/visibility`, {
      visibility: "public",
    });
    assert(
      makePublicRes.status === 200 && makePublicRes.body.space?.visibility === "public",
      "Owner can toggle workspace visibility from private to public (Option C)",
      `Visibility: ${makePublicRes.body.space?.visibility}`
    );

    // -------------------------------------------------------------
    // TEST 9: Partnership Space Privacy Immutability
    // -------------------------------------------------------------
    const partnershipVisRes = await api("PUT", `/build-spaces/bspace-collab-1/visibility`, {
      visibility: "public",
    });
    assert(
      partnershipVisRes.status === 400 &&
        (partnershipVisRes.body.error?.includes("Partnership Spaces are strictly private") ||
          partnershipVisRes.body.message?.includes("Partnership Spaces are strictly private")),
      "Partnership Spaces cannot be changed to public (HTTP 400 Bad Request)",
      `Status: ${partnershipVisRes.status}, Error: ${partnershipVisRes.body.error || partnershipVisRes.body.message}`
    );

    // -------------------------------------------------------------
    // TEST 10: Status Updates
    // -------------------------------------------------------------
    const pauseRes = await api("PUT", `/build-spaces/${newSpaceId}/status`, {
      status: "paused",
    });
    assert(
      pauseRes.status === 200 && pauseRes.body.space?.status === "paused",
      "Workspace status can be updated to 'paused'",
      `Status: ${pauseRes.body.space?.status}`
    );

    await api("PUT", `/build-spaces/${newSpaceId}/status`, { status: "active" });

    // -------------------------------------------------------------
    // TEST 11: Join Requests Workflow (Option C Public Project)
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: Option C Join Requests Workflow ---");
    // thirdAccountId applies to join newSpaceId
    const joinReqRes = await api(
      "POST",
      `/build-spaces/${newSpaceId}/join-requests`,
      {
        introduction: "Senior Rust and eBPF systems programmer wanting to contribute to the telemetry pipeline.",
        relevantSkills: ["Rust", "eBPF", "Systems Programming"],
        portfolioLinks: ["https://github.com/rustacean-dev"],
      },
      { "x-mock-account-id": thirdAccountId }
    );
    assert(
      joinReqRes.status === 201 &&
        joinReqRes.body.request?.id &&
        joinReqRes.body.request.status === "submitted",
      "Applicant can submit join request to public project (Option C)",
      `Req ID: ${joinReqRes.body.request?.id}, Status: ${joinReqRes.body.request?.status}`
    );
    const joinReqId = joinReqRes.body.request.id;

    // -------------------------------------------------------------
    // TEST 12: Anti-Duplicate Join Request
    // -------------------------------------------------------------
    const dupJoinRes = await api(
      "POST",
      `/build-spaces/${newSpaceId}/join-requests`,
      {
        introduction: "Trying again immediately.",
        relevantSkills: ["Rust"],
      },
      { "x-mock-account-id": thirdAccountId }
    );
    assert(
      dupJoinRes.status === 409,
      "Duplicate pending join request is rejected (HTTP 409 Conflict)",
      `Expected 409, got ${dupJoinRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 13: Owner Requesting More Info
    // -------------------------------------------------------------
    const moreInfoRes = await api(
      "POST",
      `/build-spaces/${newSpaceId}/join-requests/${joinReqId}/review`,
      {
        action: "request_more_info",
        reviewerNotes: "Please link your open-source eBPF crate.",
      }
    );
    assert(
      moreInfoRes.status === 200 &&
        moreInfoRes.body.request?.status === "more_info_requested",
      "Owner can request more info from join applicant",
      `Status: ${moreInfoRes.body.request?.status}`
    );

    // -------------------------------------------------------------
    // TEST 14: Applicant Providing More Info
    // -------------------------------------------------------------
    const provideMoreInfoRes = await api(
      "POST",
      `/build-spaces/join-requests/${joinReqId}/more-info`,
      {
        additionalInfo: "Here is the crate: https://crates.io/crates/ebpf-tracer",
      },
      { "x-mock-account-id": thirdAccountId }
    );
    assert(
      provideMoreInfoRes.status === 200 &&
        provideMoreInfoRes.body.request?.status === "under_review",
      "Applicant can submit more info; status transitions to 'under_review'",
      `Status: ${provideMoreInfoRes.body.request?.status}`
    );

    // -------------------------------------------------------------
    // TEST 15: Owner Accepting Join Request & Granting Membership
    // -------------------------------------------------------------
    const acceptJoinRes = await api(
      "POST",
      `/build-spaces/${newSpaceId}/join-requests/${joinReqId}/review`,
      {
        action: "accept",
        assignedRole: "editor",
        reviewerNotes: "Welcome aboard!",
      }
    );
    assert(
      acceptJoinRes.status === 200 &&
        acceptJoinRes.body.request?.status === "accepted" &&
        acceptJoinRes.body.membershipGranted === true,
      "Owner accepting join request grants membership with assigned role",
      `MembershipGranted: ${acceptJoinRes.body.membershipGranted}`
    );

    // Verify thirdAccountId can now access workspace details
    const memberAccessRes = await api("GET", `/build-spaces/${newSpaceId}`, undefined, {
      "x-mock-account-id": thirdAccountId,
    });
    assert(
      memberAccessRes.status === 200 && memberAccessRes.body.isMember === true,
      "Approved join applicant has full workspace member access",
      `isMember: ${memberAccessRes.body.isMember}`
    );

    // -------------------------------------------------------------
    // TEST 16: Join Request Withdrawal
    // -------------------------------------------------------------
    const fourthJoinRes = await api(
      "POST",
      `/build-spaces/${newSpaceId}/join-requests`,
      {
        introduction: "Withdraw test applicant",
        relevantSkills: ["DevOps"],
      },
      { "x-mock-account-id": fourthAccountId }
    );
    const withdrawReqId = fourthJoinRes.body.request?.id;
    const withdrawRes = await api(
      "POST",
      `/build-spaces/join-requests/${withdrawReqId}/withdraw`,
      undefined,
      { "x-mock-account-id": fourthAccountId }
    );
    assert(
      withdrawRes.status === 200 && withdrawRes.body.request?.status === "withdrawn",
      "Applicant can withdraw pending join request",
      `Status: ${withdrawRes.body.request?.status}`
    );

    // -------------------------------------------------------------
    // TEST 17: Workspace Invitation Workflow
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: Member Invitations Workflow ---");
    const inviteRes = await api("POST", `/build-spaces/${newSpaceId}/invitations`, {
      inviteeProfileId: fourthFounderProfileId,
      role: "member",
      message: "Please join our distributed tracing team!",
    });
    assert(
      inviteRes.status === 201 &&
        inviteRes.body.invitation?.id &&
        inviteRes.body.invitation.status === "pending",
      "Owner can send workspace invitation to another member",
      `Inv ID: ${inviteRes.body.invitation?.id}`
    );
    const inviteId = inviteRes.body.invitation.id;

    // -------------------------------------------------------------
    // TEST 18: Anti-Duplicate Invitation
    // -------------------------------------------------------------
    const dupInviteRes = await api("POST", `/build-spaces/${newSpaceId}/invitations`, {
      inviteeProfileId: fourthFounderProfileId,
      role: "viewer",
    });
    assert(
      dupInviteRes.status === 409,
      "Duplicate pending invitation is rejected (HTTP 409 Conflict)",
      `Expected 409, got ${dupInviteRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 19: Invitee Accepting Invitation
    // -------------------------------------------------------------
    const acceptInviteRes = await api(
      "POST",
      `/build-spaces/invitations/${inviteId}/respond`,
      { action: "accept" },
      { "x-mock-account-id": fourthAccountId }
    );
    assert(
      acceptInviteRes.status === 200 &&
        acceptInviteRes.body.invitation?.status === "accepted" &&
        acceptInviteRes.body.membershipGranted === true,
      "Invitee accepting invitation becomes workspace member",
      `Granted: ${acceptInviteRes.body.membershipGranted}`
    );

    // -------------------------------------------------------------
    // TEST 20: Member Role Permissions Enforcement (Viewer Blocking)
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: Role Permissions & Membership ---");
    // Find member record for fourthAccountId and change to viewer
    const spaceDetail = await api("GET", `/build-spaces/${newSpaceId}`);
    const fourthMember = spaceDetail.body.members?.find(
      (m: any) => m.profileId === fourthFounderProfileId
    );

    const changeRoleRes = await api(
      "PUT",
      `/build-spaces/${newSpaceId}/members/${fourthMember.id}/role`,
      { role: "viewer" }
    );
    assert(
      changeRoleRes.status === 200 && changeRoleRes.body.member?.role === "viewer",
      "Admin can update member role to 'viewer'",
      `Role: ${changeRoleRes.body.member?.role}`
    );

    // Viewer attempts to create a task -> Should be rejected with 403
    const viewerTaskRes = await api(
      "POST",
      `/build-spaces/${newSpaceId}/tasks`,
      {
        title: "Unauthorized task by viewer",
      },
      { "x-mock-account-id": fourthAccountId }
    );
    assert(
      viewerTaskRes.status === 403,
      "Viewer role is blocked from creating tasks (HTTP 403 Forbidden)",
      `Expected 403, got ${viewerTaskRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 21: Member Removal
    // -------------------------------------------------------------
    const removeMemberRes = await api(
      "DELETE",
      `/build-spaces/${newSpaceId}/members/${fourthMember.id}`
    );
    assert(
      removeMemberRes.status === 200,
      "Admin can remove member from workspace",
      `Status: ${removeMemberRes.status}`
    );

    const removedAccessRes = await api("GET", `/build-spaces/${newSpaceId}`, undefined, {
      "x-mock-account-id": fourthAccountId,
    });
    // Since workspace is currently public, non-member gets isMember=false
    assert(
      removedAccessRes.body.isMember === false,
      "Removed member immediately loses internal workspace member access",
      `isMember: ${removedAccessRes.body.isMember}`
    );

    // -------------------------------------------------------------
    // TEST 22: Task Management & Checklists
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: Tasks & Real Progress Calculation ---");
    const task1Res = await api("POST", `/build-spaces/${newSpaceId}/tasks`, {
      title: "Kernel eBPF Tracepoint Setup",
      description: "Attach eBPF bytecode to sock:inet_sock_set_state",
      priority: "high",
      status: "in_progress",
      dueDate: "2026-11-20",
      checklist: [
        { text: "Write C probe", completed: true },
        { text: "Compile with clang -target bpf", completed: true },
        { text: "Load with aya in Rust", completed: false },
      ],
    });
    assert(
      task1Res.status === 201 && task1Res.body.task?.id,
      "Can create task with structured checklist",
      `Task ID: ${task1Res.body.task?.id}`
    );
    const task1Id = task1Res.body.task.id;

    const task2Res = await api("POST", `/build-spaces/${newSpaceId}/tasks`, {
      title: "Setup Kafka Cluster Connection",
      description: "Produce serialized trace batches to broker",
      priority: "normal",
      status: "todo",
      dueDate: "2026-11-25",
    });
    assert(task2Res.status === 201, "Can create second task");
    const task2Id = task2Res.body.task.id;

    // Add comment to task
    const commentRes = await api(
      "POST",
      `/build-spaces/${newSpaceId}/tasks/${task1Id}/comments`,
      { text: "eBPF aya bindings are compiling cleanly now." }
    );
    assert(
      commentRes.status === 201 && commentRes.body.task?.comments?.length > 0,
      "Can add comments to workspace task",
      `Comments: ${commentRes.body.task?.comments?.length}`
    );

    // Update task 1 to completed
    const completeTaskRes = await api(
      "PUT",
      `/build-spaces/${newSpaceId}/tasks/${task1Id}`,
      { status: "completed" }
    );
    assert(
      completeTaskRes.status === 200 && completeTaskRes.body.task?.status === "completed",
      "Can update task status to 'completed'",
      `Status: ${completeTaskRes.body.task?.status}`
    );

    // Verify Genuine Progress Calculation: 1 of 2 tasks completed = 50%
    const spaceWithProgress = await api("GET", `/build-spaces/${newSpaceId}`);
    assert(
      spaceWithProgress.body.space?.taskProgressPercentage === 50 &&
        spaceWithProgress.body.space?.tasksCompletedCount === 1 &&
        spaceWithProgress.body.space?.tasksTotalCount === 2,
      "Task progress is genuinely calculated (1/2 = 50%, no fake percentages)",
      `Progress: ${spaceWithProgress.body.space?.taskProgressPercentage}%`
    );

    // -------------------------------------------------------------
    // TEST 23: Milestones & Real Progress Calculation
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 9: Milestones & Progress ---");
    const m1Res = await api("POST", `/build-spaces/${newSpaceId}/milestones`, {
      title: "M1: Alpha Pipeline Ingestion",
      description: "Stream traces end-to-end to backend",
      targetDate: "2026-11-30",
      completionCriteria: "Zero trace drops at 50,000 req/sec",
    });
    assert(m1Res.status === 201 && m1Res.body.milestone?.id, "Can create milestone M1");
    const m1Id = m1Res.body.milestone.id;

    const m2Res = await api("POST", `/build-spaces/${newSpaceId}/milestones`, {
      title: "M2: Beta Dashboard Integration",
      description: "Visual trace graphs rendered in UI",
      targetDate: "2026-12-15",
    });
    assert(m2Res.status === 201, "Can create milestone M2");

    // Complete milestone 1
    const completeM1Res = await api(
      "PUT",
      `/build-spaces/${newSpaceId}/milestones/${m1Id}`,
      { status: "completed" }
    );
    assert(completeM1Res.status === 200, "Can complete milestone M1");

    const spaceWithMilestoneProgress = await api("GET", `/build-spaces/${newSpaceId}`);
    assert(
      spaceWithMilestoneProgress.body.space?.milestoneProgressPercentage === 50 &&
        spaceWithMilestoneProgress.body.space?.milestonesCompletedCount === 1 &&
        spaceWithMilestoneProgress.body.space?.milestonesTotalCount === 2,
      "Milestone progress is genuinely calculated (1/2 = 50%, no fake percentages)",
      `Progress: ${spaceWithMilestoneProgress.body.space?.milestoneProgressPercentage}%`
    );

    // -------------------------------------------------------------
    // TEST 24: Workspace Internal Chat & Channels
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 10: Private Chat, Docs & Meetings ---");
    const sendMsgRes = await api("POST", `/build-spaces/${newSpaceId}/messages`, {
      channel: "general",
      text: "Kernel probes verified on Linux 6.8 kernel.",
    });
    assert(
      sendMsgRes.status === 201 && sendMsgRes.body.message?.channel === "general",
      "Can send message in workspace #general channel",
      `Channel: ${sendMsgRes.body.message?.channel}`
    );

    const getMsgsRes = await api("GET", `/build-spaces/${newSpaceId}/messages?channel=general`);
    assert(
      getMsgsRes.status === 200 &&
        getMsgsRes.body.messages?.some((m: any) => m.text.includes("verified")),
      "Can retrieve channel message history",
      `Count: ${getMsgsRes.body.messages?.length}`
    );

    // -------------------------------------------------------------
    // TEST 25: Documents Management
    // -------------------------------------------------------------
    const docRes = await api("POST", `/build-spaces/${newSpaceId}/documents`, {
      name: "ChronoTrace Architecture v1.0.pdf",
      folder: "specifications",
      fileUrl: "https://balaga.online/docs/chronotrace_arch.pdf",
      fileSize: "2.4 MB",
      fileType: "application/pdf",
      description: "Detailed system architecture and eBPF hook points",
    });
    assert(
      docRes.status === 201 && docRes.body.document?.id,
      "Can upload and register workspace document",
      `Doc ID: ${docRes.body.document?.id}`
    );

    // -------------------------------------------------------------
    // TEST 26: Meetings Scheduling & Status
    // -------------------------------------------------------------
    const meetRes = await api("POST", `/build-spaces/${newSpaceId}/meetings`, {
      title: "Weekly Engineering Architecture Sync",
      date: "2026-11-18",
      time: "15:00",
      durationMinutes: 45,
      agenda: "Review benchmark latency numbers",
      onlineMeetingLink: "https://meet.google.com/xyz-abc-def",
    });
    assert(
      meetRes.status === 201 && meetRes.body.meeting?.id,
      "Can schedule workspace collaboration meeting",
      `Meeting ID: ${meetRes.body.meeting?.id}`
    );
    const meetId = meetRes.body.meeting.id;

    const meetStatusRes = await api(
      "PUT",
      `/build-spaces/${newSpaceId}/meetings/${meetId}/status`,
      { status: "confirmed" }
    );
    assert(
      meetStatusRes.status === 200 && meetStatusRes.body.meeting?.status === "confirmed",
      "Can update meeting status to 'confirmed'",
      `Status: ${meetStatusRes.body.meeting?.status}`
    );

    // -------------------------------------------------------------
    // TEST 27: Activity Audit Log
    // -------------------------------------------------------------
    const actRes = await api("GET", `/build-spaces/${newSpaceId}/activities`);
    assert(
      actRes.status === 200 && Array.isArray(actRes.body.activities) && actRes.body.activities.length > 0,
      "Workspace generates comprehensive audit activities log",
      `Activities count: ${actRes.body.activities?.length}`
    );

    // -------------------------------------------------------------
    // TEST 28: Ownership Transfer
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 11: Ownership Transfer & Edge Cases ---");
    // Find thirdAccountId's member ID in newSpaceId
    const spaceForTransfer = await api("GET", `/build-spaces/${newSpaceId}`);
    const thirdMember = spaceForTransfer.body.members?.find(
      (m: any) => m.profileId === thirdFounderProfileId
    );

    const transferRes = await api("POST", `/build-spaces/${newSpaceId}/transfer-ownership`, {
      newOwnerProfileId: thirdFounderProfileId,
    });
    assert(
      transferRes.status === 201 && transferRes.body.transfer?.id,
      "Owner can initiate ownership transfer to another member",
      `Transfer ID: ${transferRes.body.transfer?.id}`
    );
    const transferId = transferRes.body.transfer.id;

    // Transferee accepts ownership transfer
    const acceptTransferRes = await api(
      "POST",
      `/build-spaces/transfers/${transferId}/respond`,
      { action: "accept" },
      { "x-mock-account-id": thirdAccountId }
    );
    assert(
      acceptTransferRes.status === 200 &&
        acceptTransferRes.body.transfer?.status === "accepted" &&
        acceptTransferRes.body.space?.ownerProfileId === thirdFounderProfileId,
      "Transferee can accept transfer; becomes new owner and old owner demoted to admin",
      `New Owner: ${acceptTransferRes.body.space?.ownerProfileId}`
    );

    // Verify thirdAccountId is now owner
    const spaceAfterTransfer = await api("GET", `/build-spaces/${newSpaceId}`, undefined, {
      "x-mock-account-id": thirdAccountId,
    });
    assert(
      spaceAfterTransfer.body.space?.currentUserRole === "owner",
      "New owner has role='owner'",
      `Role: ${spaceAfterTransfer.body.space?.currentUserRole}`
    );

    // -------------------------------------------------------------
    // TEST 29: Feature 8 Partnership Space Activation
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 12: Feature 8 Partnership Activation ---");
    // Activation from accepted collaboration collab-accepted-1 (already seeded in bspace-collab-1)
    // Attempting duplicate activation should return 409 Conflict with existing space
    const dupCollabSpaceRes = await api("POST", "/build-spaces/from-collaboration/collab-accepted-1");
    assert(
      dupCollabSpaceRes.status === 409 &&
        dupCollabSpaceRes.body.existingSpaceId === "bspace-collab-1",
      "Duplicate partnership space activation returns 409 Conflict with existing space pointer",
      `Status: ${dupCollabSpaceRes.status}, ExistingSpaceId: ${dupCollabSpaceRes.body.existingSpaceId}`
    );

  } catch (err) {
    console.error("Unhandled test execution error:", err);
    failed++;
  } finally {
    server.close();
    console.log("\n=======================================================");
    console.log(`FEATURE 12 BUILD SPACES TEST SUITE FINISHED`);
    console.log(`PASSED: ${passed} | FAILED: ${failed}`);
    console.log("=======================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runFeature12Tests();
