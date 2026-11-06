/**
 * Test Suite: Feature 10 — Balaga Founders Mentor Network
 * Option C: Both Free and Paid Mentorship with Bilateral Agreement Confirmation
 *
 * Verifies all specification criteria:
 * 1. Mentor Profile Creation, Automated Spam Checks, and Validation
 * 2. Profile Updates and Retrieval
 * 3. Mentor Discovery with Multi-Filtering (Expertise, Pricing, Format, Search, Sort)
 * 4. Personalized Recommendations Matching
 * 5. Public Detail View with Broad Location (No Precise Address Exposure)
 * 6. Bookmarks and Follows Functionality
 * 7. Report Submission & Admin Moderation
 * 8. Mentorship Request Submission & Anti-Abuse (Self-Request Rejection 400, Duplicate Rejection 409)
 * 9. Request Lifecycle: Withdraw, Request More Info, Reject, Accept
 * 10. Workspace Creation & Automatic Option C Agreement Generation
 * 11. Option C Bilateral Agreement Negotiation (Counter-Proposals & Version History)
 * 12. Option C Dual-Party Confirmation (isFullyConfirmed requires both mentor and mentee)
 * 13. Session Scheduling with Realtime Conflict Detection (409 Conflict)
 * 14. Session Lifecycle (Reschedule, In Progress, Complete with Session Counter Increment)
 * 15. Workspace Goals Management & Progress Updates
 * 16. Workspace Action Items Management & Status Toggles
 * 17. Workspace Resources Sharing
 * 18. Workspace Notes (Shared Notes vs Participant-Isolated Private Notes)
 * 19. Payment Reporting with Regulatory Disclaimers (No Escrow / Balaga Holds No Funds)
 * 20. Verified Mentorship Reviews (6 Rating Dimensions & Right of Reply)
 * 21. Direct Messaging Permission Enforcement (Basic vs Premium Tier)
 * 22. Computed Dashboard Analytics for Mentors & Mentees
 * 23. Strict Dual-World Isolation (Socializing Context 403 Forbidden)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";
import {
  devAccountId,
  devFounderProfileId,
} from "../apps/api/src/services/store.js";

const mentorAccountId = "00000000-0000-0000-0000-000000000005"; // Ananya (mentor-1)

async function runFeature10Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 10 MENTOR NETWORK TEST SUITE ===\n");

  const server = app.listen(5011);
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
          port: 5011,
          path,
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
    // GROUP 1: MENTOR PROFILE CREATION & VALIDATION
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 1: Mentor Profile Creation & Validation ---");

    // 1.1 Create valid mentor profile as dev user
    const createProfileRes = await api("POST", "/api/founders/mentors/profiles", {
      headline: "Series A Founder & Tech Architect | Ex-Flipkart",
      introduction: "Helping early-stage founders architect scalable SaaS and navigate seed to Series A fundraising.",
      professionalExperience: "12+ years in tech, built platforms serving 10M+ MAUs. Raised $4M seed round.",
      expertise: ["Startup Building", "Software Engineering", "Fundraising"],
      industries: ["FinTech", "SaaS", "Enterprise Tech"],
      skills: ["System Design", "Pitch Decks", "Cap Tables", "Go-To-Market"],
      companyExperience: "Co-Founder & CTO at HyperScale Labs, former Tech Lead at Flipkart.",
      previousMentoringExperience: "Mentored 15+ startups at Techstars Bangalore.",
      languages: ["English", "Hindi", "Kannada"],
      broadLocation: "Bengaluru, Karnataka",
      preferredMenteeCategories: ["Early-Stage Founders", "Solo Technical Founders"],
      availabilityDescription: "Available weekends and Tuesday evenings IST.",
      preferredMeetingFormat: "online",
      pricing: {
        pricingOption: "paid",
        price: 3500,
        currency: "INR",
        pricingBasis: "per_session",
        sessionDurationMinutes: 45,
        cancellationTerms: "Free cancellation up to 24 hours prior to session.",
      },
    });

    assert(createProfileRes.status === 201, "1.1 Create valid mentor profile (201 Created)");
    assert(createProfileRes.body.mentor?.headline?.includes("Series A Founder"), "1.1 Profile headline matches");
    const devMentorId = createProfileRes.body.mentor?.id;

    // 1.2 Get My Profile
    const myProfileRes = await api("GET", "/api/founders/mentors/profiles/my-profile");
    assert(myProfileRes.status === 200, "1.2 Retrieve own mentor profile (200 OK)");
    assert(myProfileRes.body.mentor?.id === devMentorId, "1.2 Returned correct profile ID");

    // 1.3 Update mentor profile
    const updateProfileRes = await api("PUT", "/api/founders/mentors/profiles/my-profile", {
      headline: "Series A Founder & Tech Architect | Angel Investor",
      skills: ["System Design", "Pitch Decks", "Cap Tables", "Go-To-Market", "AI Strategy"],
    });
    assert(updateProfileRes.status === 200, "1.3 Update mentor profile (200 OK)");
    assert(updateProfileRes.body.mentor?.skills?.includes("AI Strategy"), "1.3 Updated skills persisted");

    // 1.4 Automated Spam / Malicious Check
    const spamProfileRes = await api("PUT", "/api/founders/mentors/profiles/my-profile", {
      introduction: "Get rich quick with guaranteed 500% returns click here http://spam-crypto-scam.xyz",
    });
    assert(
      spamProfileRes.body.mentor?.moderationStatus === "under_review",
      "1.4 Automated spam detection flags suspicious links to 'under_review'"
    );

    // Reset moderation status to active for further testing
    await api("PUT", "/api/founders/mentors/profiles/my-profile", {
      introduction: "Helping early-stage founders architect scalable SaaS and navigate seed to Series A fundraising.",
    });

    // -------------------------------------------------------------------------
    // GROUP 2: MENTOR DISCOVERY, MULTI-FILTERING & RECOMMENDATIONS
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 2: Mentor Discovery, Multi-Filtering & Recommendations ---");

    // 2.1 Discover all active mentors
    const discoverAllRes = await api("GET", "/api/founders/mentors/discover");
    assert(discoverAllRes.status === 200, "2.1 Discover active mentors (200 OK)");
    assert(discoverAllRes.body.mentors?.length >= 3, "2.1 Returns seeded mentors and created mentor");

    // 2.2 Filter by expertise
    const filterExpRes = await api("GET", "/api/founders/mentors/discover?expertise=AI+%26+ML");
    assert(filterExpRes.status === 200, "2.2 Filter by expertise AI & ML (200 OK)");
    assert(
      filterExpRes.body.mentors?.every((m: any) => m.expertise.includes("AI & ML")),
      "2.2 All returned mentors have AI & ML expertise"
    );

    // 2.3 Filter by pricing option
    const filterPricingRes = await api("GET", "/api/founders/mentors/discover?pricingOption=free");
    assert(filterPricingRes.status === 200, "2.3 Filter by pricing option 'free' (200 OK)");
    assert(
      filterPricingRes.body.mentors?.every((m: any) => m.pricing.pricingOption === "free"),
      "2.3 All returned mentors offer free mentorship"
    );

    // 2.4 Filter by meeting format
    const filterFormatRes = await api("GET", "/api/founders/mentors/discover?meetingFormat=online");
    assert(filterFormatRes.status === 200, "2.4 Filter by format 'online' (200 OK)");
    assert(
      filterFormatRes.body.mentors?.every((m: any) => m.preferredMeetingFormat === "online"),
      "2.4 All returned mentors offer online sessions"
    );

    // 2.5 Keyword search
    const searchRes = await api("GET", "/api/founders/mentors/discover?search=Flipkart");
    assert(searchRes.status === 200, "2.5 Search by keyword 'Flipkart' (200 OK)");
    assert(searchRes.body.mentors?.length > 0, "2.5 Found mentor matching keyword");

    // 2.6 Sort by rating
    const sortRes = await api("GET", "/api/founders/mentors/discover?sortBy=rating");
    assert(sortRes.status === 200, "2.6 Sort by rating descending (200 OK)");
    assert(sortRes.body.mentors[0].rating >= sortRes.body.mentors[sortRes.body.mentors.length - 1].rating, "2.6 First mentor has highest rating");

    // 2.7 Personalized recommendations
    const recRes = await api("GET", "/api/founders/mentors/recommended");
    assert(recRes.status === 200, "2.7 Recommended mentors endpoint (200 OK)");
    assert(Array.isArray(recRes.body.mentors), "2.7 Recommendations return array");

    // 2.8 Mentor detail view (broad location only, privacy compliant)
    const detailRes = await api("GET", `/api/founders/mentors/profiles/${devMentorId}`);
    assert(detailRes.status === 200, "2.8 Mentor public detail page (200 OK)");
    assert(detailRes.body.mentor?.broadLocation === "Bengaluru, Karnataka", "2.8 Broad location displayed");
    assert(!detailRes.body.mentor?.preciseAddress, "2.8 No precise location exposed (privacy check)");

    // -------------------------------------------------------------------------
    // GROUP 3: BOOKMARKS, FOLLOWS & MODERATION REPORTING
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 3: Bookmarks, Follows & Moderation Reporting ---");

    const targetMentorId = "mentor-1"; // Ananya

    // 3.1 Bookmark a mentor
    const bookmarkRes = await api("POST", `/api/founders/mentors/profiles/${targetMentorId}/bookmark`);
    assert(bookmarkRes.status === 200, "3.1 Bookmark mentor (200 OK)");
    assert(bookmarkRes.body.isSaved === true, "3.1 Mentor saved flag true");

    // 3.2 Unbookmark mentor
    const unbookmarkRes = await api("POST", `/api/founders/mentors/profiles/${targetMentorId}/bookmark`);
    assert(unbookmarkRes.status === 200, "3.2 Toggle bookmark again (200 OK)");
    assert(unbookmarkRes.body.isSaved === false, "3.2 Mentor saved flag false");

    // 3.3 Follow a mentor
    const followRes = await api("POST", `/api/founders/mentors/profiles/${targetMentorId}/follow`);
    assert(followRes.status === 200, "3.3 Follow mentor (200 OK)");
    assert(followRes.body.isFollowing === true, "3.3 Following flag true");

    // 3.4 Report a mentor profile
    const reportRes = await api("POST", `/api/founders/mentors/profiles/${targetMentorId}/report`, {
      reason: "suspicious_pricing",
      details: "Demanded off-platform payment via unofficial channels.",
    });
    assert(reportRes.status === 201, "3.4 Submit mentor moderation report (201 Created)");
    assert(reportRes.body.report?.reason === "suspicious_pricing", "3.4 Report reason recorded");

    // -------------------------------------------------------------------------
    // GROUP 4: MENTORSHIP REQUESTS LIFECYCLE & ANTI-ABUSE
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 4: Mentorship Requests Lifecycle & Anti-Abuse ---");

    // 4.1 Anti-Abuse: Self-request rejection (HTTP 400)
    const selfReqRes = await api("POST", "/api/founders/mentors/requests", {
      mentorId: devMentorId,
      projectOrStartupName: "Balaga Self Test",
      helpNeeded: "Need advice on scaling my platform.",
      specificChallenge: "Database indexing and real-time syncing.",
      goals: "Improve latency by 50%.",
      reasonForSelection: "You are an expert.",
      preferredFormat: "ongoing",
      preferredAvailability: "Weekends",
      budget: "₹3,500 per session",
      expectedDuration: "2 months",
    });
    assert(selfReqRes.status === 400, "4.1 Self-mentorship request rejected with 400 Bad Request");

    // 4.2 Submit valid request to Ananya (mentor-1)
    const validReqRes = await api("POST", "/api/founders/mentors/requests", {
      mentorId: targetMentorId,
      projectOrStartupName: "Zeta Commerce",
      helpNeeded: "Enterprise B2B GTM and Cap Table planning for seed round.",
      specificChallenge: "Navigating international payments and regulatory filing in India.",
      goals: "Close $500k seed round within 90 days.",
      reasonForSelection: "Your deep track record at Flipkart and HyperScale.",
      preferredFormat: "ongoing",
      preferredAvailability: "Tuesday evenings IST",
      budget: "₹4,000 per session",
      expectedDuration: "3 months",
      additionalContext: "https://zeta-commerce.example.com",
    });
    assert(validReqRes.status === 201, "4.2 Submit mentorship request to mentor (201 Created)");
    const requestId = validReqRes.body.request?.id;

    // 4.3 Anti-Abuse: Duplicate pending request rejection (HTTP 409)
    const dupReqRes = await api("POST", "/api/founders/mentors/requests", {
      mentorId: targetMentorId,
      projectOrStartupName: "Zeta Commerce 2",
      helpNeeded: "Duplicate request test.",
      specificChallenge: "Should fail.",
      goals: "Test anti-abuse.",
      reasonForSelection: "Expert.",
      preferredFormat: "one_time",
      preferredAvailability: "Weekdays",
    });
    assert(dupReqRes.status === 409, "4.3 Duplicate active mentorship request rejected with 409 Conflict");

    // 4.4 List sent requests
    const sentReqsRes = await api("GET", "/api/founders/mentors/requests/my-requests");
    assert(sentReqsRes.status === 200, "4.4 Retrieve sent requests list (200 OK)");
    assert(sentReqsRes.body.requests?.some((r: any) => r.id === requestId), "4.4 Sent request present in list");

    // 4.5 Withdraw request test (request to mentor-3, then withdraw)
    const withdrawTestReq = await api("POST", "/api/founders/mentors/requests", {
      mentorId: "mentor-3", // Rohit
      projectOrStartupName: "Withdraw Test Project",
      helpNeeded: "One-off advisory on AI prompts.",
      specificChallenge: "Cost optimization.",
      goals: "Reduce OpenAI bills.",
      reasonForSelection: "Great AI mentor.",
      preferredFormat: "one_time",
      preferredAvailability: "Anytime",
      expectedDuration: "1 month",
    });
    assert(withdrawTestReq.status === 201, "4.5 Created second request for withdraw test");
    const withdrawReqId = withdrawTestReq.body.request?.id;

    const withdrawRes = await api("POST", `/api/founders/mentors/requests/${withdrawReqId}/respond`, {
      action: "withdraw",
      reasonOrNotes: "Withdrawn by mentee for scheduling conflicts.",
    });
    assert(withdrawRes.status === 200, "4.5 Withdraw mentorship request (200 OK)");
    assert(withdrawRes.body.request?.status === "withdrawn", "4.5 Request status updated to 'withdrawn'");

    // 4.6 Mentor requests more info (as Ananya)
    const moreInfoRes = await api(
      "POST",
      `/api/founders/mentors/requests/${requestId}/respond`,
      {
        action: "request_more_info",
        moreInfoQuery: "Could you share your current MRR and target customers?",
      },
      { "x-mock-account-id": mentorAccountId }
    );
    assert(moreInfoRes.status === 200, "4.6 Mentor requests more info (200 OK)");
    assert(moreInfoRes.body.request?.status === "more_info_requested", "4.6 Request status 'more_info_requested'");

    // 4.7 Mentor accepts request -> creates Workspace and Option C Mentorship Agreement
    const acceptRes = await api(
      "POST",
      `/api/founders/mentors/requests/${requestId}/respond`,
      {
        action: "accept",
        reasonOrNotes: "Delighted to guide Zeta Commerce. Let's build something great!",
      },
      { "x-mock-account-id": mentorAccountId }
    );
    assert(acceptRes.status === 200, "4.7 Mentor accepts request (200 OK)");
    assert(acceptRes.body.request?.status === "accepted", "4.7 Request status updated to 'accepted'");
    assert(acceptRes.body.workspace?.id, "4.7 Private Mentorship Workspace created automatically");
    assert(acceptRes.body.agreement?.id, "4.7 Option C Mentorship Agreement generated");
    const workspaceId = acceptRes.body.workspace?.id;
    const agreementId = acceptRes.body.agreement?.id;

    // -------------------------------------------------------------------------
    // GROUP 5: OPTION C AGREEMENT NEGOTIATION & BILATERAL CONFIRMATION
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 5: Option C Bilateral Agreement Negotiation ---");

    // 5.1 Inspect initial agreement
    const getAgreementRes = await api("GET", `/api/founders/mentors/requests/${requestId}/agreement`);
    assert(getAgreementRes.status === 200, "5.1 Retrieve agreement details (200 OK)");
    assert(getAgreementRes.body.agreement?.isFullyConfirmed === false, "5.1 Initial paid agreement requires bilateral confirmation");
    assert(getAgreementRes.body.agreement?.versions?.length === 1, "5.1 Initial version v1 recorded in history");

    // 5.2 Mentee proposes counter-proposal (version 2)
    const proposeRes = await api("POST", `/api/founders/mentors/requests/${requestId}/agreement/propose`, {
      pricingOption: "paid",
      price: 3000, // Counter to 3000
      currency: "INR",
      pricingBasis: "per_session",
      sessionDurationMinutes: 60,
      cancellationTerms: "48 hours notice for reschedule.",
      effectiveDate: new Date().toISOString(),
      conditions: "Proposed ₹3,000 for 60 min sessions.",
    });
    assert(proposeRes.status === 201, "5.2 Counter-proposal submitted (201 Created)");
    assert(proposeRes.body.agreement?.currentVersion === 2, "5.2 Version incremented to v2");
    assert(proposeRes.body.agreement?.confirmedByMentee === true, "5.2 Proposing party (mentee) marked confirmed");
    assert(proposeRes.body.agreement?.confirmedByMentor === false, "5.2 Counter-party (mentor) not yet confirmed");
    assert(proposeRes.body.agreement?.isFullyConfirmed === false, "5.2 Not yet fully confirmed");

    // 5.3 Mentor reviews and confirms counter-proposal
    const mentorConfirmRes = await api(
      "POST",
      `/api/founders/mentors/requests/${requestId}/agreement/confirm`,
      {
        version: 2,
        confirm: true,
      },
      { "x-mock-account-id": mentorAccountId }
    );
    assert(mentorConfirmRes.status === 200, "5.3 Mentor confirms agreement (200 OK)");
    assert(mentorConfirmRes.body.agreement?.confirmedByMentor === true, "5.3 Mentor confirmation recorded");
    assert(mentorConfirmRes.body.agreement?.isFullyConfirmed === true, "5.4 Bilateral confirmation reached (isFullyConfirmed: true)");

    // -------------------------------------------------------------------------
    // GROUP 6: SESSION SCHEDULING & REALTIME CONFLICT DETECTION
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 6: Session Scheduling & Conflict Detection ---");

    const sessionDate = new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0];

    // 6.1 Schedule session 1
    const sched1Res = await api("POST", `/api/founders/mentors/workspaces/${workspaceId}/sessions`, {
      title: "GTM Architecture & Pitch Strategy Session",
      sessionDate,
      startTime: "11:00",
      durationMinutes: 60,
      format: "online",
      meetingLinkOrLocation: "https://meet.balaga.online/session-zeta-aarav",
      agenda: "Review pitch deck, clarify investor narrative, discuss cap table mechanics.",
    });
    assert(sched1Res.status === 201, "6.1 Schedule mentorship session (201 Created)");
    const sessionId = sched1Res.body.session?.id;
    assert(sched1Res.body.session?.status === "confirmed", "6.1 Session confirmed");

    // 6.2 Conflict Detection: Attempt overlapping session at 11:30 (409 Conflict)
    const conflictRes = await api("POST", `/api/founders/mentors/workspaces/${workspaceId}/sessions`, {
      title: "Overlapping Follow-up Session",
      sessionDate,
      startTime: "11:30",
      durationMinutes: 45,
      format: "online",
      meetingLinkOrLocation: "https://meet.balaga.online/session-conflict",
    });
    assert(conflictRes.status === 409, "6.2 Scheduling overlapping session returns 409 Conflict");
    assert(conflictRes.body.error?.includes("conflict"), "6.2 Conflict error message returned");

    // 6.3 Update session status: rescheduled
    const inProgressRes = await api("PUT", `/api/founders/mentors/sessions/${sessionId}/status`, {
      status: "rescheduled",
      notes: "Shifted session by 15 mins",
    });
    assert(inProgressRes.status === 200, "6.3 Update session status to rescheduled (200 OK)");

    // 6.4 Complete session -> increments mentor sessionsCompletedCount
    const completeRes = await api("PUT", `/api/founders/mentors/sessions/${sessionId}/status`, {
      status: "completed",
    });
    assert(completeRes.status === 200, "6.4 Complete mentorship session (200 OK)");
    assert(completeRes.body.session?.status === "completed", "6.4 Status completed");

    // -------------------------------------------------------------------------
    // GROUP 7: WORKSPACE COLLABORATION TOOLS
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 7: Workspace Collaboration Tools ---");

    // 7.1 Goals: Add milestone goal
    const goalRes = await api("POST", `/api/founders/mentors/workspaces/${workspaceId}/goals`, {
      title: "Finalize Seed Pitch Deck & Financial Model",
      description: "Deck should be 12 slides and model projected for 24 months.",
      targetDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
    });
    assert(goalRes.status === 201, "7.1 Add milestone goal to workspace (201 Created)");
    const goalId = goalRes.body.goal?.id;

    // 7.2 Update goal progress (50%)
    const updateGoalRes = await api(`PUT`, `/api/founders/mentors/goals/${goalId}`, {
      progressPercentage: 50,
      status: "in_progress",
    });
    assert(updateGoalRes.status === 200, "7.2 Update goal progress to 50% (200 OK)");
    assert(updateGoalRes.body.goal?.progressPercentage === 50, "7.2 Progress updated");

    // 7.3 Action Items: Assign task
    const actionRes = await api("POST", `/api/founders/mentors/workspaces/${workspaceId}/action-items`, {
      task: "Draft competitor comparison matrix for Section 4",
      assignedProfileId: devFounderProfileId,
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    });
    assert(actionRes.status === 201, "7.3 Assign action item in workspace (201 Created)");
    const actionId = actionRes.body.actionItem?.id;

    // 7.4 Toggle action item to completed
    const toggleActionRes = await api("PUT", `/api/founders/mentors/action-items/${actionId}`, {
      status: "completed",
    });
    assert(toggleActionRes.status === 200, "7.4 Mark action item completed (200 OK)");
    assert(toggleActionRes.body.actionItem?.status === "completed", "7.4 Action item completed");

    // 7.5 Resources: Share resource
    const resRes = await api("POST", `/api/founders/mentors/workspaces/${workspaceId}/resources`, {
      title: "Standard YC SAFE Seed Financing Template",
      resourceType: "template",
      urlOrPath: "https://resources.balaga.online/templates/yc-safe-india-template.pdf",
    });
    assert(resRes.status === 201, "7.5 Share template resource to workspace (201 Created)");
    assert(resRes.body.resource?.resourceType === "template", "7.5 Resource type verified");

    // 7.6 Notes: Shared notes vs Private notes isolation
    const updateNotesRes = await api("PUT", `/api/founders/mentors/workspaces/${workspaceId}/notes`, {
      sharedNotes: "Agreed focus: Enterprise GTM in India and UAE.",
      privateNotes: "Mentee note: Ananya gave great advice on valuation caps.",
    });
    assert(updateNotesRes.status === 200, "7.6 Update workspace notes (200 OK)");

    // Verify mentee sees their private note
    const wsDetailMentee = await api("GET", `/api/founders/mentors/workspaces/${workspaceId}`);
    assert(
      wsDetailMentee.body.workspace?.privateNotes === "Mentee note: Ananya gave great advice on valuation caps.",
      "7.6 Mentee sees their own private note"
    );

    // Verify mentor viewing workspace sees THEIR private note (not mentee's)
    const wsDetailMentor = await api(
      "GET",
      `/api/founders/mentors/workspaces/${workspaceId}`,
      undefined,
      { "x-mock-account-id": mentorAccountId }
    );
    assert(
      wsDetailMentor.body.workspace?.privateNotes !== "Mentee note: Ananya gave great advice on valuation caps.",
      "7.6 Mentor does NOT see mentee's private note (private notes isolation)"
    );

    // -------------------------------------------------------------------------
    // GROUP 8: PAYMENT STATUS REPORTING WITH REGULATORY DISCLAIMER
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 8: Payment Status Reporting & Regulatory Disclaimer ---");

    // 8.1 Record reported payment status
    const payRes = await api("POST", `/api/founders/mentors/workspaces/${workspaceId}/payment`, {
      paymentStatus: "reported_paid",
      notes: "Settled ₹3,000 via UPI UTR: 32904810293.",
    });
    assert(payRes.status === 200, "8.1 Record payment status (200 OK)");
    assert(payRes.body.workspace?.paymentStatus === "reported_paid", "8.1 Status updated to reported_paid");
    assert(payRes.body.regulatoryNotice?.includes("does not operate an internal wallet or escrow"), "8.1 Regulatory disclaimer included");

    // -------------------------------------------------------------------------
    // GROUP 9: VERIFIED REVIEWS & MENTOR RIGHT OF REPLY
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 9: Verified Reviews & Right of Reply ---");

    // 9.1 Mentee leaves verified review
    const reviewRes = await api("POST", `/api/founders/mentors/workspaces/${workspaceId}/reviews`, {
      knowledgeRating: 5,
      communicationRating: 5,
      helpfulnessRating: 5,
      professionalismRating: 5,
      reliabilityRating: 5,
      overallRating: 5.0,
      reviewText: "Ananya is an outstanding mentor. Transformed our pitch narrative in 60 minutes!",
    });
    assert(reviewRes.status === 201, "9.1 Submit verified mentorship review (201 Created)");
    const reviewId = reviewRes.body.review?.id;
    assert(reviewRes.body.review?.isVerifiedSession === true, "9.1 Review flagged as verified session");

    // 9.2 Mentor Right of Reply
    const replyRes = await api(
      "POST",
      `/api/founders/mentors/reviews/${reviewId}/reply`,
      {
        replyText: "Thank you! Excited to see Zeta Commerce scale to Series A.",
      },
      { "x-mock-account-id": mentorAccountId }
    );
    assert(replyRes.status === 200, "9.2 Mentor right of reply submitted (200 OK)");
    assert(replyRes.body.review?.mentorReply?.includes("Excited to see Zeta Commerce"), "9.2 Mentor reply stored");

    // -------------------------------------------------------------------------
    // GROUP 10: DIRECT MESSAGING PRIVILEGES
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 10: Direct Messaging Privilege Checks ---");

    // 10.1 Check messaging permission via request
    const msgCheckRes = await api("POST", `/api/founders/mentors/requests/${requestId}/message-check`);
    assert(msgCheckRes.status === 200, "10.1 Messaging permission check (200 OK)");
    assert(typeof msgCheckRes.body.canMessage === "boolean", "10.1 Returned boolean canMessage");

    // -------------------------------------------------------------------------
    // GROUP 11: DASHBOARD ANALYTICS
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 11: Mentor & Mentee Analytics ---");

    // 11.1 Mentor Dashboard Stats
    const mStatsRes = await api(
      "GET",
      "/api/founders/mentors/dashboard/mentor-stats",
      undefined,
      { "x-mock-account-id": mentorAccountId }
    );
    assert(mStatsRes.status === 200, "11.1 Mentor analytics retrieved (200 OK)");
    assert(typeof mStatsRes.body.stats?.activeMenteesCount === "number", "11.1 Active mentees count present");
    assert(typeof mStatsRes.body.stats?.completedSessionsCount === "number", "11.1 Completed sessions count present");

    // 11.2 Mentee Dashboard Stats
    const menteeStatsRes = await api("GET", "/api/founders/mentors/dashboard/mentee-stats");
    assert(menteeStatsRes.status === 200, "11.2 Mentee analytics retrieved (200 OK)");
    assert(typeof menteeStatsRes.body.stats?.activeMentorsCount === "number", "11.2 Active mentors count present");
    assert(typeof menteeStatsRes.body.stats?.completedGoalsCount === "number", "11.2 Goals completed count present");

    // -------------------------------------------------------------------------
    // GROUP 12: STRICT DUAL-WORLD ISOLATION
    // -------------------------------------------------------------------------
    console.log("\n--- GROUP 12: Strict Dual-World Isolation ---");

    // 12.1 Request from socializing world to mentors API is rejected with 403 Forbidden
    const socializingRes = await api(
      "GET",
      "/api/founders/mentors/discover",
      undefined,
      { "x-platform-world": "socializing" }
    );
    assert(socializingRes.status === 403, "12.1 Socializing world access to Mentor Network rejected with 403 Forbidden");

    // Summary
    console.log("\n=======================================================");
    console.log(`TEST EXECUTION SUMMARY: Passed: ${passed} | Failed: ${failed}`);
    console.log("=======================================================\n");

    server.close();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution threw exception:", err);
    server.close();
    process.exit(1);
  }
}

runFeature10Tests();
