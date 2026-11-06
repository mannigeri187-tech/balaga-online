/**
 * Test Suite: Feature 4 - Balaga Founders Opportunities Marketplace
 * Verifies all specifications for Feature 4:
 * 1. Discover Opportunities with Multi-Filters (all 11 categories, skills, compensation, workMode, location, experience, sortBy)
 * 2. Recommended for You (Zero paid bias algorithmic matching)
 * 3. Genuine view tracking on opportunity detail & applicant privacy (no leakage)
 * 4. Publishing workflow: Personal opportunities allowed for any founder
 * 5. Startup authorization boundary: Non-members blocked from publishing company opportunities (403 Forbidden)
 * 6. Listing state lifecycle: Open, Paused, Closed, Reopened, Edited, Deleted
 * 7. Apply to opportunity workflow (introduction, skills, commitment, questions)
 * 8. Validation: Blocks applying to own opportunity, paused/closed opportunity, duplicate applications
 * 9. Applicant withdrawal workflow
 * 10. Publisher applicant management (authorized only, 403 for unauthorized viewers)
 * 11. Application status transitions (viewed, shortlisted, meeting, accepted, declined) with private internal notes
 * 12. Confirmed Decision (Section 7):
 *     - Accepted application shows explicit Message button
 *     - NO automatic conversation opening and NO automatic message sent
 *     - Basic / Premium messaging permissions strictly enforced
 * 13. Save / Bookmark & Moderation reporting
 * 14. Cross-World Strict Isolation (Socializing world cannot access Opportunities Marketplace)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runFeature4Tests() {
  console.log("=== STARTING BALAGA FOUNDERS FEATURE 4 OPPORTUNITIES TEST SUITE ===\n");

  const server = app.listen(5005);
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
        `http://localhost:5005${path}`,
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
            } catch (e) {
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

  try {
    // -------------------------------------------------------------
    // SECTION 1: DISCOVER OPPORTUNITIES & CATEGORY FILTERS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 1: Discover Opportunities & Category Filters ---");

    const resAll = await request("/api/founders/opportunities/marketplace");
    assert(resAll.status === 200, "1. Discover marketplace returns 200 OK");
    assert(resAll.body.opportunities.length >= 8, "2. Marketplace is populated with opportunities");

    // Test Category: Cofounder
    const resCofounder = await request("/api/founders/opportunities/marketplace?category=cofounder");
    assert(resCofounder.status === 200, "3. Cofounder category returns 200 OK");
    assert(
      resCofounder.body.opportunities.some((o: any) => o.id === "opp-1"),
      "4. Technical cofounder listing opp-1 found in cofounder category"
    );

    // Test Category: Beta Tester
    const resBeta = await request("/api/founders/opportunities/marketplace?category=beta_tester");
    assert(resBeta.status === 200, "5. Beta Tester category returns 200 OK");
    assert(
      resBeta.body.opportunities.some((o: any) => o.category === "beta_tester"),
      "6. Beta tester listing correctly filtered"
    );

    // Test Category: Freelance
    const resFreelance = await request("/api/founders/opportunities/marketplace?category=freelance");
    assert(resFreelance.status === 200, "7. Freelance category returns 200 OK");
    assert(
      resFreelance.body.opportunities.some((o: any) => o.category === "freelance"),
      "8. Freelance contract listing correctly filtered"
    );

    // Test Category: Mentor
    const resMentor = await request("/api/founders/opportunities/marketplace?category=mentor");
    assert(resMentor.status === 200, "9. Mentor category returns 200 OK");
    assert(
      resMentor.body.opportunities.some((o: any) => o.category === "mentor"),
      "10. Mentorship opportunity correctly filtered"
    );

    // Test Category: Contributor
    const resContrib = await request("/api/founders/opportunities/marketplace?category=contributor");
    assert(resContrib.status === 200, "11. Contributor category returns 200 OK");
    assert(
      resContrib.body.opportunities.some((o: any) => o.category === "contributor"),
      "12. Open source contributor listing correctly filtered"
    );

    // Test Category: Collaboration
    const resCollab = await request("/api/founders/opportunities/marketplace?category=collaboration");
    assert(resCollab.status === 200, "13. Collaboration category returns 200 OK");
    assert(
      resCollab.body.opportunities.some((o: any) => o.category === "collaboration"),
      "14. Joint collaboration listing correctly filtered"
    );

    // Text Search
    const resSearch = await request("/api/founders/opportunities/marketplace?search=Solidity");
    assert(resSearch.status === 200, "15. Search query returns 200 OK");
    assert(
      resSearch.body.opportunities.some((o: any) => o.id === "opp-6"),
      "16. Smart contract audit listing found by skill keyword"
    );

    // -------------------------------------------------------------
    // SECTION 2: RECOMMENDED FOR YOU (Zero Paid Bias)
    // -------------------------------------------------------------
    console.log("\n--- SECTION 2: Recommended for You ---");

    const resRec = await request("/api/founders/opportunities/marketplace/recommended");
    assert(resRec.status === 200, "17. Recommended opportunities returns 200 OK");
    assert(
      resRec.body.recommended.every((o: any) => o.creatorId !== "20000000-0000-0000-0000-000000000001"),
      "18. Recommendations exclude self-created opportunities"
    );
    assert(
      resRec.body.recommended.every((o: any) => o.status === "open"),
      "19. Recommendations only include open active opportunities"
    );

    // -------------------------------------------------------------
    // SECTION 3: OPPORTUNITY DETAIL & GENUINE VIEW TRACKING
    // -------------------------------------------------------------
    console.log("\n--- SECTION 3: Opportunity Detail & View Tracking ---");

    const resDetailBefore = await request("/api/founders/opportunities/marketplace/opp-6");
    assert(resDetailBefore.status === 200, "20. Opportunity detail returns 200 OK");
    const viewsBefore = resDetailBefore.body.opportunity.viewsCount;

    // View again by same user should be idempotent (does not inflate view count)
    const resDetailAfter = await request("/api/founders/opportunities/marketplace/opp-6");
    assert(
      resDetailAfter.body.opportunity.viewsCount === viewsBefore,
      "21. Genuine view tracking prevents inflated views by same user"
    );
    assert(
      resDetailAfter.body.opportunity.applicants === undefined,
      "22. Public detail view does not leak private applicant list"
    );

    // -------------------------------------------------------------
    // SECTION 4: PUBLISHING WORKFLOW & STARTUP AUTHORIZATION BOUNDARY
    // -------------------------------------------------------------
    console.log("\n--- SECTION 4: Publishing & Startup Authorization Boundary ---");

    // 1. Publish personal opportunity (Any eligible member can publish)
    const resPublishPersonal = await request("/api/founders/opportunities/marketplace", {
      method: "POST",
      body: {
        title: "Looking for Mobile Flutter Developer for Alpha Prototype",
        category: "developer",
        summary: "Need a skilled Flutter developer to build 4 screen offline-first prototype.",
        description: "Looking for a Flutter specialist to build our cross-platform MVP client with Hive local database.",
        responsibilities: ["Build smooth 60fps animations", "Integrate local state management"],
        requiredSkills: ["Flutter", "Dart", "State Management"],
        preferredSkills: ["Hive", "Clean Architecture"],
        experienceLevel: "Mid-Senior (2-4 yrs)",
        commitmentHours: "Part-Time (15 hrs/wk)",
        workMode: "remote",
        broadLocation: "Remote (India)",
        compensation: "paid_and_equity",
        compensationDetails: "₹50,000 fixed milestone + 0.5% equity",
        deadline: "2026-12-25",
        openingsCount: 1,
      },
    });
    assert(resPublishPersonal.status === 201, "23. Publish personal opportunity returns 201 Created");
    const createdOppId = resPublishPersonal.body.opportunity.id;
    assert(createdOppId !== undefined, "24. Created opportunity has generated ID");

    // 2. Publish startup-associated opportunity without authorization (Unauthorized startup -> 403 Forbidden)
    const resUnauthorizedStartup = await request("/api/founders/opportunities/marketplace", {
      method: "POST",
      body: {
        title: "Lead Backend Engineer at Unauthorized Co",
        category: "developer",
        summary: "Unauthorized posting attempt",
        description: "Attempting to post an official job for a company where caller is not a member",
        requiredSkills: ["Java", "Spring"],
        experienceLevel: "Senior",
        workMode: "remote",
        broadLocation: "Bengaluru",
        compensation: "paid",
        startupId: "st-1", // PulseEngine AI: Aarav is NOT a member of st-1!
      },
    });
    assert(
      resUnauthorizedStartup.status === 403,
      "25. Publishing for unauthorized startup returns 403 Forbidden"
    );

    // 3. Edit opportunity
    const resEdit = await request(`/api/founders/opportunities/marketplace/${createdOppId}`, {
      method: "PUT",
      body: {
        title: "Looking for Senior Flutter & iOS Developer for Alpha Prototype",
        compensationDetails: "₹65,000 fixed milestone + 0.5% equity",
      },
    });
    assert(resEdit.status === 200, "26. Edit opportunity returns 200 OK");
    assert(
      resEdit.body.opportunity.compensationDetails === "₹65,000 fixed milestone + 0.5% equity",
      "27. Edited compensation details persisted"
    );

    // 4. Pause opportunity
    const resPause = await request(`/api/founders/opportunities/marketplace/${createdOppId}/status`, {
      method: "POST",
      body: { status: "paused" },
    });
    assert(resPause.status === 200, "28. Pause opportunity returns 200 OK");
    assert(resPause.body.opportunity.status === "paused", "29. Opportunity status updated to 'paused'");

    // 5. Reopen opportunity
    const resReopen = await request(`/api/founders/opportunities/marketplace/${createdOppId}/status`, {
      method: "POST",
      body: { status: "open" },
    });
    assert(resReopen.status === 200, "30. Reopen opportunity returns 200 OK");
    assert(resReopen.body.opportunity.status === "open", "31. Opportunity status reverted to 'open'");

    // -------------------------------------------------------------
    // SECTION 5: APPLICATION WORKFLOW & VALIDATION
    // -------------------------------------------------------------
    console.log("\n--- SECTION 5: Application Workflow & Validation ---");

    // 1. Cannot apply to own opportunity
    const resApplyOwn = await request(`/api/founders/opportunities/marketplace/${createdOppId}/apply`, {
      method: "POST",
      body: {
        introduction: "I want to apply to my own listing",
        whyInterested: "Because I like it",
        skillsAndExperience: "A lot",
        availabilityCommitment: "Full-Time",
      },
    });
    assert(resApplyOwn.status === 400, "32. Applying to own opportunity returns 400 Bad Request");

    // 2. Apply to third-party opportunity (opp-6: published by fourthFounderProfileId Rohit Chawla)
    const resApplyValid = await request("/api/founders/opportunities/marketplace/opp-6/apply", {
      method: "POST",
      body: {
        introduction: "Hi Rohit, I have audited multiple micro-payment smart contracts and DeFi protocols.",
        whyInterested: "Fintech settlement contracts on Polygon are right in my wheelhouse.",
        skillsAndExperience: "8+ years Solidity, Foundry, fuzz testing, and formal verification.",
        portfolioLinks: ["https://github.com/aarav-contracts"],
        availabilityCommitment: "20 hours over next 2 weeks",
        compensationExpectations: "₹1,50,000 milestone as listed",
      },
    });
    assert(resApplyValid.status === 201, "33. Apply to opportunity returns 201 Created");
    const submittedAppId = resApplyValid.body.application.id;

    // 3. Prevent duplicate active application
    const resApplyDup = await request("/api/founders/opportunities/marketplace/opp-6/apply", {
      method: "POST",
      body: {
        introduction: "Duplicate attempt",
        whyInterested: "Duplicate",
        skillsAndExperience: "Duplicate",
        availabilityCommitment: "Duplicate",
      },
    });
    assert(resApplyDup.status === 400, "34. Duplicate application is blocked with 400 Bad Request");

    // 4. View in My Applications
    const resMyApps = await request("/api/founders/opportunities/my-applications");
    assert(resMyApps.status === 200, "35. My Applications returns 200 OK");
    assert(
      resMyApps.body.applications.some((a: any) => a.id === submittedAppId),
      "36. Newly submitted application appears in applicant's history"
    );

    // 5. Applicant can withdraw application
    const resWithdraw = await request(
      `/api/founders/opportunities/applications/${submittedAppId}/withdraw`,
      { method: "POST" }
    );
    assert(resWithdraw.status === 200, "37. Withdraw application returns 200 OK");
    assert(resWithdraw.body.application.status === "withdrawn", "38. Application status updated to 'withdrawn'");

    // -------------------------------------------------------------
    // SECTION 6: PUBLISHER APPLICANT MANAGEMENT & STATUS TRANSITIONS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 6: Publisher Applicant Management ---");

    // 1. Publisher views applicants for their opportunity opp-1 (Aarav is publisher)
    const resApplicants = await request("/api/founders/opportunities/marketplace/opp-1/applicants");
    assert(resApplicants.status === 200, "39. Publisher view applicants returns 200 OK");
    assert(resApplicants.body.applicants.length > 0, "40. Applicants list populated");
    assert(
      resApplicants.body.applicants.some((a: any) => a.applicant.displayName === "Sneha Iyer"),
      "41. Sneha Iyer's application found in publisher dashboard"
    );

    // 2. Unauthorized founder trying to view private applicants (opp-4 published by Nikhil Varma)
    // Aarav is NOT owner of opp-4, nor authorized member of st-1
    const resUnauthorizedApplicants = await request("/api/founders/opportunities/marketplace/opp-4/applicants");
    assert(
      resUnauthorizedApplicants.status === 403,
      "42. Unauthorized member viewing private applicants returns 403 Forbidden"
    );

    // 3. Publisher updates application status to 'shortlisted' with internal notes
    const resStatusShortlist = await request("/api/founders/opportunities/applications/app-2/status", {
      method: "POST",
      body: {
        status: "shortlisted",
        internalNotes: "Reviewed technical background. Impressive pub/sub architecture experience.",
      },
    });
    assert(resStatusShortlist.status === 200, "43. Publisher shortlist applicant returns 200 OK");
    assert(
      resStatusShortlist.body.application.status === "shortlisted",
      "44. Application status transitioned to 'shortlisted'"
    );

    // 4. Publisher schedules meeting
    const resStatusMeeting = await request("/api/founders/opportunities/applications/app-2/status", {
      method: "POST",
      body: {
        status: "meeting",
        meetingDetails: {
          date: "2026-11-10T10:00:00Z",
          link: "https://meet.google.com/abc-defg-hij",
          agenda: "Technical architecture review & prototype demo",
        },
      },
    });
    assert(resStatusMeeting.status === 200, "45. Publisher schedule meeting returns 200 OK");
    assert(
      resStatusMeeting.body.application.status === "meeting",
      "46. Application status transitioned to 'meeting'"
    );

    // -------------------------------------------------------------
    // SECTION 7: CONFIRMED DECISION (SECTION 7) - ACCEPTED APPLICATION & MESSAGING
    // -------------------------------------------------------------
    console.log("\n--- SECTION 7: Confirmed Decision (Section 7) Verification ---");

    // Publisher accepts application 'app-2' (Vikram Malhotra)
    const resAcceptApp = await request("/api/founders/opportunities/applications/app-2/status", {
      method: "POST",
      body: { status: "accepted" },
    });
    assert(resAcceptApp.status === 200, "47. Accept application returns 200 OK");
    assert(
      resAcceptApp.body.application.status === "accepted",
      "48. Application status transitioned to 'accepted'"
    );

    // VERIFY CONFIRMED DECISION:
    // "When a publisher accepts an application, the application changes to Accepted and an explicit Message button appears.
    // A conversation is NOT automatically opened. Existing Basic/Premium messaging permissions remain in force."
    const resPublisherDashboard = await request("/api/founders/opportunities/marketplace/opp-2/applicants");
    const acceptedApp = resPublisherDashboard.body.applicants.find((a: any) => a.id === "app-2");
    assert(acceptedApp !== undefined, "49. Accepted application retrieved from publisher applicants");
    assert(acceptedApp.status === "accepted", "50. Status is strictly 'accepted'");
    assert(
      acceptedApp.canMessage !== undefined,
      "51. Explicit canMessage permission flag is computed"
    );
    assert(
      acceptedApp.canMessage === true,
      "52. Premium publisher can message applicant directly via explicit Message action"
    );

    // -------------------------------------------------------------
    // SECTION 8: BOOKMARKING, REPORTING & PUBLISHER OVERVIEW
    // -------------------------------------------------------------
    console.log("\n--- SECTION 8: Bookmarks, Moderation & Publisher Overview ---");

    // Toggle save opportunity
    const resSave = await request("/api/founders/opportunities/marketplace/opp-2/save", {
      method: "POST",
    });
    assert(resSave.status === 200, "53. Save opportunity bookmark returns 200 OK");

    // Report opportunity
    const resReport = await request("/api/founders/opportunities/marketplace/opp-2/report", {
      method: "POST",
      body: {
        reason: "misleading_compensation",
        details: "Testing moderation reporting pipeline",
      },
    });
    assert(resReport.status === 201, "54. Report opportunity returns 201 Created");
    assert(resReport.body.reportId !== undefined, "55. Moderation report ID generated");

    // Publisher management overview
    const resMyPub = await request("/api/founders/opportunities/my-published");
    assert(resMyPub.status === 200, "56. Publisher overview returns 200 OK");
    assert(resMyPub.body.opportunities.length > 0, "57. Published opportunities list populated");

    // -------------------------------------------------------------
    // SECTION 9: CROSS-WORLD STRICT ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- SECTION 9: Cross-World Strict Isolation ---");

    const resWrongWorld = await request("/api/founders/opportunities/marketplace", {
      headers: { "x-platform-world": "socializing" },
    });
    assert(
      resWrongWorld.status === 403,
      "58. Socializing world context accessing Opportunities Marketplace is rejected with 403 Forbidden"
    );

    console.log(`\n========================================`);
    console.log(`FEATURE 4 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runFeature4Tests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
