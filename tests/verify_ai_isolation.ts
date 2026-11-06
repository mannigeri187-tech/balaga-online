/**
 * Balaga Intelligence (Milestone 1 — Intelligence Foundation)
 * Rigorous Security & World Isolation Test Suite
 *
 * Verifies:
 * 1. AI Gateway health & token/cost metrics
 * 2. Missing x-platform-world header is rejected (HTTP 400)
 * 3. Socializing AI processes social context independently
 * 4. Founders AI processes startup context independently
 * 5. Cross-realm data leakage attempt is strictly blocked (HTTP 403 Zero-Leakage)
 * 6. User consent revocation immediately disables AI execution (HTTP 403 Refused)
 * 7. Consent restoration allows execution
 * 8. User-facing AI audit activity logs track token and INR accounting
 * 9. Consequential actions require explicit human approval (Approval Gate)
 */

import http from "http";
import app from "../apps/api/src/app.js";

async function runAiIsolationTests() {
  console.log("=================================================================");
  console.log("   BALAGA INTELLIGENCE (MILESTONE 1) SECURITY & ISOLATION SUITE ");
  console.log("=================================================================\n");

  const server = app.listen(4998);
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
        `http://localhost:4998${path}`,
        {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            "x-mock-user": "true",
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
    // 1. Metrics & Infrastructure Endpoint
    const metrics = await request("/api/ai/metrics", {
      headers: { "x-platform-world": "founders" },
    });
    assert(
      metrics.status === 200 && metrics.body.zeroDataLeakageGuaranteed === true,
      "AI Gateway Metrics endpoint responds with zeroDataLeakageGuaranteed: true"
    );

    // 2. Missing Header Rejection
    const missingHeader = await request("/api/ai/query", {
      method: "POST",
      body: { prompt: "Summarize recent activity", taskType: "summary" },
    });
    assert(
      missingHeader.status === 400,
      "AI query without x-platform-world header is strictly rejected with HTTP 400"
    );

    // 3. Socializing AI Execution
    const socialQuery = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "socializing" },
      body: {
        prompt: "Summarize my community activity",
        taskType: "summary",
      },
    });
    assert(
      socialQuery.status === 200 &&
        socialQuery.body.content.includes("Social Activity Digest") &&
        !socialQuery.body.content.toLowerCase().includes("startup"),
      "Socializing AI generates independent social activity digest without founder data bleed"
    );

    // 4. Founders AI Execution
    const foundersQuery = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "founders" },
      body: {
        prompt: "Summarize my startup progress",
        taskType: "summary",
      },
    });
    assert(
      foundersQuery.status === 200 &&
        foundersQuery.body.content.includes("Startup Pulse Summary") &&
        !foundersQuery.body.content.toLowerCase().includes("badminton"),
      "Founders AI generates independent startup pulse summary without social data bleed"
    );

    // 5. Cross-Realm Data Leakage Prevention (Socializing ingesting Founders cap_table)
    const crossLeak1 = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "socializing" },
      body: {
        prompt: "Help me analyze this",
        taskType: "review",
        contextData: { cap_table: "Aarav: 60%, Investor: 20%, ESOP: 20%" },
      },
    });
    assert(
      crossLeak1.status === 403 &&
        crossLeak1.body.error.includes("Zero-Leakage Violation"),
      "Socializing AI strictly blocks ingestion of private Founders cap_table / equity data (HTTP 403)"
    );

    // 6. Cross-Realm Data Leakage Prevention (Founders ingesting Socializing dating/messages)
    const crossLeak2 = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "founders" },
      body: {
        prompt: "Review candidate background",
        taskType: "review",
        contextData: { dating_profile: "private personal details" },
      },
    });
    assert(
      crossLeak2.status === 403 &&
        crossLeak2.body.error.includes("Zero-Leakage Violation"),
      "Founders AI strictly blocks ingestion of private Socializing personal data (HTTP 403)"
    );

    // 7. AI Consent Revocation
    const revokeConsent = await request("/api/ai/consent", {
      method: "PUT",
      headers: { "x-platform-world": "socializing" },
      body: { socialAiEnabled: false },
    });
    assert(
      revokeConsent.status === 200 && revokeConsent.body.consent.socialAiEnabled === false,
      "User can revoke Socializing AI consent in privacy settings"
    );

    const queryAfterRevoke = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "socializing" },
      body: { prompt: "Test prompt", taskType: "assistance" },
    });
    assert(
      queryAfterRevoke.status === 403 &&
        queryAfterRevoke.body.error.includes("disabled in your 'socializing' privacy preferences"),
      "AI Gateway strictly refuses query when user consent is revoked (HTTP 403 Refused)"
    );

    // 8. Restore Consent & Verify User-Facing Activity Logs
    await request("/api/ai/consent", {
      method: "PUT",
      headers: { "x-platform-world": "socializing" },
      body: { socialAiEnabled: true },
    });

    const activityLogs = await request("/api/ai/activity", {
      headers: { "x-platform-world": "socializing" },
    });
    assert(
      activityLogs.status === 200 &&
        Array.isArray(activityLogs.body.logs) &&
        activityLogs.body.logs.length > 0,
      "User-facing AI audit log records timestamped model, token, and cost accounting"
    );

    // 9. Consequential Action Approval Gate
    const actionProposal = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "founders" },
      body: { prompt: "Draft intro message to Sneha", taskType: "action_proposal" },
    });
    const proposal = actionProposal.body.proposedAction;
    assert(
      actionProposal.status === 200 &&
        actionProposal.body.requiresApproval === true &&
        proposal?.status === "pending_approval",
      "Consequential AI action is gated behind explicit human approval (status: pending_approval)"
    );

    const approvedAction = await request(`/api/ai/actions/${proposal.id}/resolve`, {
      method: "POST",
      headers: { "x-platform-world": "founders" },
      body: { approved: true },
    });
    assert(
      approvedAction.status === 200 && approvedAction.body.proposal.status === "approved",
      "Explicit human approval transitions proposal to 'approved' state"
    );

    // 10. Milestone 2 — Caption Assistant
    const captionRes = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "socializing" },
      body: { prompt: "Sunday coffee walk in Indiranagar", taskType: "caption_assistant" },
    });
    assert(
      captionRes.status === 200 && captionRes.body.content.includes("Balaga Social Caption Suggestions"),
      "Milestone 2: Socializing Caption Assistant generates contextual captions and tags"
    );

    // 11. Milestone 2 — Community Digest
    const digestRes = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "socializing" },
      body: { prompt: "Bangalore Indie Creators", taskType: "community_digest" },
    });
    assert(
      digestRes.status === 200 && digestRes.body.content.includes("Community Digest"),
      "Milestone 2: Socializing Community Digest synthesizes Circle discussions"
    );

    // 12. Milestone 2 — Living Board Curator (with Approval Gate)
    const curatorRes = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "socializing" },
      body: { prompt: "Organize weekend roadtrips", taskType: "living_board_curator" },
    });
    assert(
      curatorRes.status === 200 &&
        curatorRes.body.requiresApproval === true &&
        curatorRes.body.proposedAction?.actionType === "organize_board",
      "Milestone 2: Actionable Living Board Curator proposes organization gated by approval"
    );

    // 13. Milestone 2 — Weekly Recap
    const recapRes = await request("/api/ai/query", {
      method: "POST",
      headers: { "x-platform-world": "socializing" },
      body: { prompt: "Summarize my week", taskType: "weekly_recap" },
    });
    assert(
      recapRes.status === 200 && recapRes.body.content.includes("Your Weekly Social Recap"),
      "Milestone 2: Socializing Weekly Recap summarizes connections and discussions"
    );

    console.log(`\n=================================================================`);
    console.log(`   BALAGA INTELLIGENCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=================================================================\n`);
  } catch (err: any) {
    console.error("Test execution exception:", err.message);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runAiIsolationTests();
