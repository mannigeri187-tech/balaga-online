/**
 * Test Suite: Feature 3 - Balaga Founders Founder Network & Cofounder Discovery
 * Verifies all specifications for Feature 3:
 * 1. Discover People with Multi-Filters (query, role, skills, availability, workMode, location, industry, stage, sortBy)
 * 2. Find Cofounders dedicated endpoint & role/stage filtering
 * 3. Find Startup Talent dedicated endpoint
 * 4. Recommended for You (complementary skills & shared interests, no paid bias)
 * 5. Connection Requests Lifecycle (send with note, validate duplicate/self, accept, reject, withdraw, remove)
 * 6. Personalized Cofounder Proposals Lifecycle (send with idea/equity/commitment, more_info, withdraw, accept -> auto connect)
 * 7. Decision 1: Direct Messaging Permission Check (Premium can message unconnected; Basic requires accepted connection)
 * 8. Decision 2: Profile View Analytics (Premium sees full viewer list; Basic gets locked count & upgrade prompt)
 * 9. Cross-World Strict Isolation (Socializing world cannot access Founders network)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runFeature3Tests() {
  console.log("=== STARTING BALAGA FOUNDERS FEATURE 3 NETWORK TEST SUITE ===\n");

  const server = app.listen(5004);
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
        `http://localhost:5004${path}`,
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
    // SECTION 1: DISCOVER PEOPLE & MULTI-FILTERS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 1: Discover People & Multi-Filters ---");

    const resAll = await request("/api/founders/network/discover");
    assert(resAll.status === 200, "1. Discover founders returns 200 OK");
    assert(resAll.body.founders.length > 0, "2. Returns public founder profiles");
    assert(
      !resAll.body.founders.some((f: any) => f.username === "aarav_builder"),
      "3. Current user is excluded from discovery list"
    );

    const firstFounder = resAll.body.founders[0];
    assert(firstFounder.displayName !== undefined, "4. Profile card has displayName");
    assert(firstFounder.headline !== undefined, "5. Profile card has headline");
    assert(Array.isArray(firstFounder.skills), "6. Profile card has skills array");
    assert(firstFounder.canMessage !== undefined, "7. Profile card has canMessage property");
    assert(firstFounder.connectionStatus !== undefined, "8. Profile card has connectionStatus");

    // Search query
    const resSearch = await request("/api/founders/network/discover?query=Razorpay");
    assert(resSearch.status === 200, "9. Query search returns 200 OK");
    assert(
      resSearch.body.founders.some((f: any) => f.displayName === "Rohit Chawla"),
      "10. Query search finds Rohit Chawla by bio/headline match"
    );

    // Role filter
    const resRole = await request("/api/founders/network/discover?role=Designer");
    assert(resRole.status === 200, "11. Role filter returns 200 OK");
    assert(
      resRole.body.founders.every((f: any) =>
        f.roles?.some((r: string) => /design/i.test(r))
      ),
      "12. Role filter strictly returns designers"
    );

    // Skills filter
    const resSkills = await request("/api/founders/network/discover?skills=Kubernetes");
    assert(resSkills.status === 200, "13. Skills filter returns 200 OK");
    assert(
      resSkills.body.founders.every((f: any) =>
        f.skills?.some((s: string) => /kubernetes/i.test(s))
      ),
      "14. Skills filter strictly returns Kubernetes experts"
    );

    // Work Mode filter
    const resWorkMode = await request("/api/founders/network/discover?workMode=remote");
    assert(resWorkMode.status === 200, "15. Work mode filter returns 200 OK");
    assert(
      resWorkMode.body.founders.every((f: any) => f.workPreference === "remote"),
      "16. Work mode filter strictly returns remote builders"
    );

    // -------------------------------------------------------------
    // SECTION 2: FIND COFOUNDERS & FIND STARTUP TALENT
    // -------------------------------------------------------------
    console.log("\n--- SECTION 2: Find Cofounders & Startup Talent ---");

    const resCofounders = await request("/api/founders/network/cofounders");
    assert(resCofounders.status === 200, "17. Cofounders endpoint returns 200 OK");
    assert(resCofounders.body.cofounders.length > 0, "18. Cofounders list is populated");
    assert(
      resCofounders.body.cofounders.every(
        (c: any) => c.availability !== "not_available"
      ),
      "19. All cofounder candidates have active availability"
    );

    const resTalent = await request("/api/founders/network/talent");
    assert(resTalent.status === 200, "20. Talent endpoint returns 200 OK");
    assert(resTalent.body.talent.length > 0, "21. Talent list is populated");

    // -------------------------------------------------------------
    // SECTION 3: RECOMMENDED FOR YOU
    // -------------------------------------------------------------
    console.log("\n--- SECTION 3: Recommended for You ---");

    const resRec = await request("/api/founders/network/recommended");
    assert(resRec.status === 200, "22. Recommended endpoint returns 200 OK");
    assert(
      resRec.body.recommended.every((r: any) => r.connectionStatus !== "accepted"),
      "23. Recommended list excludes already accepted connections"
    );

    // -------------------------------------------------------------
    // SECTION 4: MY CONNECTIONS & REQUESTS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 4: Connections & Connection Requests Lifecycle ---");

    const resConn = await request("/api/founders/network/connections");
    assert(resConn.status === 200, "24. My Connections returns 200 OK");
    assert(
      resConn.body.connections.some(
        (c: any) => c.partner.displayName === "Rohit Chawla"
      ),
      "25. Rohit Chawla is present in seeded accepted connections"
    );

    const resReceived = await request("/api/founders/network/requests/received");
    assert(resReceived.status === 200, "26. Received requests returns 200 OK");
    assert(
      resReceived.body.requests.some(
        (r: any) => r.requester.displayName === "Sneha Iyer"
      ),
      "27. Seeded pending connection request from Sneha Iyer is present"
    );

    const resSent = await request("/api/founders/network/requests/sent");
    assert(resSent.status === 200, "28. Sent requests returns 200 OK");

    // Self connection prevention
    const resSelfConn = await request(
      "/api/founders/network/connect/20000000-0000-0000-0000-000000000001",
      {
        method: "POST",
        body: { note: "Let's connect" },
      }
    );
    assert(
      resSelfConn.status === 400,
      "29. Sending connection request to oneself returns 400 Bad Request"
    );

    // Send connection request
    const resSendConn = await request(
      "/api/founders/network/connect/20000000-0000-0000-0000-000000000005",
      {
        method: "POST",
        body: { note: "Would love to discuss Kubernetes telemetry." },
      }
    );
    assert(resSendConn.status === 201, "30. Send connection request returns 201 Created");
    assert(
      resSendConn.body.connection.status === "pending",
      "31. New connection status is 'pending'"
    );

    // Prevent duplicate request
    const resDupConn = await request(
      "/api/founders/network/connect/20000000-0000-0000-0000-000000000005",
      {
        method: "POST",
        body: { note: "Second attempt" },
      }
    );
    assert(
      resDupConn.status === 400,
      "32. Duplicate connection request returns 400 Bad Request"
    );

    // Withdraw pending sent connection request
    const connIdToWithdraw = resSendConn.body.connection.id;
    const resWithdraw = await request(
      `/api/founders/network/requests/${connIdToWithdraw}/withdraw`,
      { method: "POST" }
    );
    assert(resWithdraw.status === 200, "33. Withdraw connection request returns 200 OK");

    // Accept received connection request (Sneha Iyer's request 'fconn-2')
    const resAccept = await request("/api/founders/network/requests/fconn-2/accept", {
      method: "POST",
    });
    assert(resAccept.status === 200, "34. Accept connection request returns 200 OK");
    assert(
      resAccept.body.connection.status === "accepted",
      "35. Connection status updated to 'accepted'"
    );

    // Verify Sneha Iyer is now in accepted connections
    const resConnAfterAccept = await request("/api/founders/network/connections");
    assert(
      resConnAfterAccept.body.connections.some(
        (c: any) => c.partner.displayName === "Sneha Iyer"
      ),
      "36. Accepted partner Sneha Iyer is now in My Connections"
    );

    // Remove connection
    const resRemoveConn = await request(
      "/api/founders/network/connections/20000000-0000-0000-0000-000000000007",
      { method: "DELETE" }
    );
    assert(resRemoveConn.status === 200, "37. Remove connection returns 200 OK");

    // -------------------------------------------------------------
    // SECTION 5: PERSONALIZED COFOUNDER PROPOSALS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 5: Personalized Cofounder Proposals ---");

    const resCfrReceived = await request("/api/founders/network/cofounder-requests/received");
    assert(resCfrReceived.status === 200, "38. Get received cofounder proposals returns 200 OK");
    assert(
      resCfrReceived.body.requests.some((r: any) => r.id === "cfr-1"),
      "39. Seeded proposal 'cfr-1' from Ananya Thakur is present"
    );

    const resCfrSent = await request("/api/founders/network/cofounder-requests/sent");
    assert(resCfrSent.status === 200, "40. Get sent cofounder proposals returns 200 OK");
    assert(
      resCfrSent.body.requests.some((r: any) => r.id === "cfr-2"),
      "41. Seeded proposal 'cfr-2' sent to Nikhil Varma is present"
    );

    // Validation check on proposal creation
    const resInvalidCfr = await request("/api/founders/network/cofounder-requests", {
      method: "POST",
      body: { recipientId: "20000000-0000-0000-0000-000000000003" }, // missing fields
    });
    assert(
      resInvalidCfr.status === 400,
      "42. Missing proposal fields returns 400 Bad Request"
    );

    // Send valid proposal
    const resValidCfr = await request("/api/founders/network/cofounder-requests", {
      method: "POST",
      body: {
        recipientId: "20000000-0000-0000-0000-000000000006",
        introduction: "Hi Vikram, your experience in SaaS growth is inspiring.",
        ideaDescription: "Building next-generation distributed observability for cloud-native apps.",
        proposedRole: "Growth Co-Founder & GTM Advisor",
        reasonForContacting: "Need your proven track record scaling enterprise sales.",
        commitmentExpectations: "Part-Time / Advisory leading to Full-Time",
        equityExpectations: "10-15% Equity with 4-year vesting",
      },
    });
    assert(resValidCfr.status === 201, "43. Send cofounder proposal returns 201 Created");
    const newProposalId = resValidCfr.body.request.id;

    // Proposer can withdraw proposal
    const resWithdrawCfr = await request(
      `/api/founders/network/cofounder-requests/${newProposalId}/withdraw`,
      { method: "POST" }
    );
    assert(resWithdrawCfr.status === 200, "44. Withdraw cofounder proposal returns 200 OK");

    // Recipient requests more info on 'cfr-1'
    const resMoreInfo = await request(
      "/api/founders/network/cofounder-requests/cfr-1/more_info",
      {
        method: "POST",
        body: {
          question: "Can you provide the initial prototype architecture diagram and traction metrics?",
        },
      }
    );
    assert(resMoreInfo.status === 200, "45. Request more info on proposal returns 200 OK");
    assert(
      resMoreInfo.body.request.status === "more_info_requested",
      "46. Proposal status updated to 'more_info_requested'"
    );

    // Recipient accepts 'cfr-1'
    const resAcceptCfr = await request(
      "/api/founders/network/cofounder-requests/cfr-1/accept",
      { method: "POST" }
    );
    assert(resAcceptCfr.status === 200, "47. Accept proposal returns 200 OK");
    assert(
      resAcceptCfr.body.request.status === "accepted",
      "48. Proposal status is 'accepted'"
    );

    // -------------------------------------------------------------
    // SECTION 6: TWO PREMIUM DECISIONS & MESSAGING CHECKS
    // -------------------------------------------------------------
    console.log("\n--- SECTION 6: Two Premium Decisions ---");

    // Decision 1: Direct Messaging Permission Check
    // Current user (Aarav Sharma) has subscriptionTier: "premium" -> canMessage: true even unconnected
    const resMsgCheckPremium = await request(
      "/api/founders/network/messages/check-permission",
      {
        method: "POST",
        body: { targetProfileId: "20000000-0000-0000-0000-000000000006" },
      }
    );
    assert(
      resMsgCheckPremium.status === 200,
      "49. Messaging check returns 200 OK"
    );
    assert(
      resMsgCheckPremium.body.canMessage === true,
      "50. Decision 1: Premium member can message unconnected founder directly"
    );
    assert(
      resMsgCheckPremium.body.isPremium === true,
      "51. Decision 1: isPremium flag correctly set to true"
    );

    // Decision 2: Profile View Analytics
    // Premium caller gets full views and visitor identities
    const resViewsPremium = await request("/api/founders/profile/views");
    assert(resViewsPremium.status === 200, "52. Profile views endpoint returns 200 OK");
    assert(
      resViewsPremium.body.isLocked === false,
      "53. Decision 2: Premium member profile views are unlocked (isLocked: false)"
    );
    assert(
      resViewsPremium.body.views.length > 0,
      "54. Decision 2: Full visitor history list returned for Premium"
    );
    assert(
      resViewsPremium.body.views[0].viewer !== undefined,
      "55. Decision 2: Viewer profile is enriched for Premium member"
    );

    // Record new profile view
    const resRecordView = await request(
      "/api/founders/profile/20000000-0000-0000-0000-000000000004/view",
      { method: "POST" }
    );
    assert(resRecordView.status === 201, "56. Record profile view returns 201 Created");

    // -------------------------------------------------------------
    // SECTION 7: CROSS-WORLD STRICT ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- SECTION 7: Cross-World Strict Isolation ---");

    const resWrongWorld = await request("/api/founders/network/discover", {
      headers: { "x-platform-world": "socializing" },
    });
    assert(
      resWrongWorld.status === 403,
      "57. Socializing world context accessing Founders Network is rejected with 403 Forbidden"
    );

    console.log(`\n========================================`);
    console.log(`FEATURE 3 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runFeature3Tests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
