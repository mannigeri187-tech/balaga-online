/**
 * Test Suite: Founders Dashboard Button Fixes & Workflow Verification
 * Tests:
 * 1. Accept Partnership (Authorization, persistence, status update, idempotent acceptance)
 * 2. Counter-Propose (Validation, authorization, revised terms persistence, status update)
 * 3. View All Proposals (Filtered queries: all, pending, accepted, countered)
 * 4. Send Introduction Request (Submission, duplicate prevention, validation)
 * 5. Submit Product (Validation, persistence on Launchpad)
 * 6. Upvote (Idempotency, 1 vote per user, count consistency)
 * 7. Private Partnership Messaging (Persistence, retrieval)
 * 8. World Isolation (Social context cannot call Founders routes)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runTests() {
  console.log("=== STARTING BALAGA FOUNDERS DASHBOARD FIXES TEST SUITE ===\n");

  const server = app.listen(5001);
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
        `http://localhost:5001${path}`,
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
              resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
            } catch {
              resolve({ status: res.statusCode || 500, body: data });
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
    // TEST 1: Dashboard Overview endpoint returns metrics & proposal
    const dashRes = await request("/api/founders/dashboard");
    assert(dashRes.status === 200, "1. Founders Dashboard endpoint returns 200 OK");
    assert(dashRes.body.metrics.profileMatch === 92, "1.1 Profile match metric is 92%");
    assert(dashRes.body.proposals.length > 0, "1.2 Incoming collaboration proposals populated");

    // TEST 2: Accept Partnership - Unauthorized user blocked
    const unauthAcceptRes = await request("/api/founders/collaborations/proposals/collab-1/accept", {
      method: "POST",
      headers: {
        "x-mock-account-id": "00000000-0000-0000-0000-000000000002", // Nikhil Varma (Initiator, not recipient)
      },
    });
    assert(
      unauthAcceptRes.status === 403,
      "2. Unauthorized user cannot accept proposal on behalf of recipient startup (403 Forbidden)"
    );

    // TEST 3: Accept Partnership - Authorized startup owner succeeds
    const acceptRes = await request("/api/founders/collaborations/proposals/collab-1/accept", {
      method: "POST",
      headers: {
        "x-mock-account-id": "00000000-0000-0000-0000-000000000001", // Aarav Sharma (NovaTech owner)
      },
    });
    assert(acceptRes.status === 200, "3. Authorized startup owner accepts partnership (200 OK)");
    assert(acceptRes.body.proposal.status === "accepted", "3.1 Proposal status persisted as 'accepted'");
    assert(acceptRes.body.spaceId === "collab-1", "3.2 Partnership workspace created for private messaging");

    // TEST 4: View All Proposals - Filtering by status
    const allPropsRes = await request("/api/founders/collaborations/proposals");
    assert(allPropsRes.status === 200, "4. View All Proposals returns 200 OK");
    assert(allPropsRes.body.proposals.length >= 1, "4.1 Contains persisted proposals");

    const acceptedFilterRes = await request("/api/founders/collaborations/proposals?status=accepted");
    assert(
      acceptedFilterRes.body.proposals.every((p: any) => p.status === "accepted"),
      "4.2 Filter '?status=accepted' correctly returns only accepted proposals"
    );

    // TEST 5: Counter-Propose - Validation requires commercial terms
    const invalidCounterRes = await request("/api/founders/collaborations/proposals/collab-1/counter", {
      method: "POST",
      body: { commercialTerms: "" },
    });
    assert(invalidCounterRes.status === 400, "5. Counter-proposal with empty terms is rejected (400 Bad Request)");

    // TEST 6: Counter-Propose - Valid revision persists
    const counterRes = await request("/api/founders/collaborations/proposals/collab-1/counter", {
      method: "POST",
      body: {
        commercialTerms: "25% Mutual Referral Share + Co-Marketing Webinar",
        revisedOffer: "Dedicated integration engineering support for 30 days",
      },
    });
    assert(counterRes.status === 200, "6. Counter-proposal accepted and persisted (200 OK)");
    assert(counterRes.body.proposal.status === "countered", "6.1 Proposal status updated to 'countered'");
    assert(
      counterRes.body.proposal.commercialTerms.includes("25%"),
      "6.2 Revised commercial terms persisted"
    );

    // TEST 7: Send Introduction Request to Co-Founder
    const introRes = await request("/api/founders/talent/20000000-0000-0000-0000-000000000004/intro", {
      method: "POST",
      body: {
        roleTitle: "Technical Co-Founder (FinTech Settlement Rails)",
        note: "Hi Rohit, building next-gen UPI settlement mesh. Would love to discuss co-founding.",
        equityOrComp: "20-25% Equity",
      },
    });
    assert(introRes.status === 201, "7. Send Introduction Request returns 201 Created");
    assert(introRes.body.intro.status === "pending", "7.1 Introduction request persisted with 'pending' status");

    // TEST 8: Prevent Duplicate Introduction Request
    const dupIntroRes = await request("/api/founders/talent/20000000-0000-0000-0000-000000000004/intro", {
      method: "POST",
      body: {
        roleTitle: "Technical Co-Founder",
        note: "Second attempt duplicate note",
      },
    });
    assert(
      dupIntroRes.status === 409,
      "8. Duplicate introduction request to same candidate is blocked (409 Conflict)"
    );

    // TEST 9: Submit Product to Launchpad
    const submitProdRes = await request("/api/founders/launchpad/products", {
      method: "POST",
      body: {
        name: "ApexMesh Telemetry",
        tagline: "Real-time distributed tracing for Postgres & Kafka",
        description: "Zero-overhead observability pipeline for Indian high-throughput fintech platforms.",
        category: "Developer Tools",
        websiteUrl: "https://apexmesh.dev",
      },
    });
    assert(submitProdRes.status === 201, "9. Submit Product returns 201 Created");
    assert(submitProdRes.body.product.upvotesCount === 1, "9.1 Newly launched product starts with maker's upvote (1)");

    const newProdId = submitProdRes.body.product.id;

    // TEST 10: Upvote - Idempotent toggle and single vote enforcement
    // First upvote attempt on new product by same maker toggles off (1 -> 0)
    const toggleOffRes = await request(`/api/founders/launchpad/products/${newProdId}/upvote`, {
      method: "POST",
    });
    assert(toggleOffRes.status === 200, "10. Upvote toggle call returns 200 OK");
    assert(toggleOffRes.body.upvotesCount === 0 && toggleOffRes.body.hasUpvoted === false, "10.1 Upvote successfully toggled off (count decremented to 0)");

    // Second upvote attempt toggles on (0 -> 1)
    const toggleOnRes = await request(`/api/founders/launchpad/products/${newProdId}/upvote`, {
      method: "POST",
    });
    assert(toggleOnRes.body.upvotesCount === 1 && toggleOnRes.body.hasUpvoted === true, "10.2 Upvote successfully toggled on (count incremented to 1)");

    // Upvote on DocuLens AI
    const docuUpvoteRes = await request("/api/founders/launchpad/products/prod-1/upvote", {
      method: "POST",
    });
    assert(docuUpvoteRes.body.upvotesCount === 143, "10.3 Upvote on DocuLens AI increments count to 143");

    // TEST 11: Private Partnership Chat Messaging
    const sendMsgRes = await request("/api/founders/collaborations/spaces/collab-1/messages", {
      method: "POST",
      body: {
        text: "Looking forward to our engineering kickoff call this Friday at 3 PM.",
      },
    });
    assert(sendMsgRes.status === 201, "11. Sending message in partnership workspace returns 201 Created");

    const getMsgsRes = await request("/api/founders/collaborations/spaces/collab-1/messages");
    assert(getMsgsRes.status === 200, "11.1 Fetching partnership messages returns 200 OK");
    assert(
      getMsgsRes.body.messages.some((m: any) => m.text.includes("kickoff call")),
      "11.2 Sent message persists and is retrievable"
    );

    // TEST 12: World Isolation Boundary Check
    const crossWorldRes = await request("/api/founders/dashboard", {
      headers: {
        "x-platform-world": "socializing", // Attempting to access Founders dashboard with Socializing world header
      },
    });
    assert(
      crossWorldRes.status === 403,
      "12. Cross-world isolation: Socializing context blocked from Founders endpoints (403 Forbidden)"
    );

    console.log(`\n======================================================`);
    console.log(`FOUNDERS DASHBOARD TEST SUITE: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
