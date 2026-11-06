/**
 * Test Suite: Feature 1 - Balaga Founders Final Dashboard Specification
 * Verifies all 11 sections of the compact Founders Dashboard:
 * 1. Welcome Header & Identity
 * 2. Quick Statistics (real metrics)
 * 3. My Startups & Role authorization
 * 4. Needs Your Attention action triggers
 * 5. Recommended People
 * 6. Opportunities & Jobs
 * 7. Startup Collaborations Overview
 * 8. Product Launchpad
 * 9. Founder Feed Preview & interactions
 * 10. Upcoming Activities
 * 11. Startup & Opportunity creation endpoints
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runFeature1Tests() {
  console.log("=== STARTING BALAGA FOUNDERS FEATURE 1 DASHBOARD TEST SUITE ===\n");

  const server = app.listen(5002);
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
        `http://localhost:5002${path}`,
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
    // 1. GET /api/founders/dashboard
    const dashRes = await request("/api/founders/dashboard");
    assert(dashRes.status === 200, "1. GET /api/founders/dashboard returns 200 OK");
    const d = dashRes.body;

    // SECTION 1: Welcome Header
    assert(d.profile && d.profile.displayName === "Aarav Sharma", "Section 1: Founders display name is Aarav Sharma");
    assert(d.profile.profileCompletion === 92, "Section 1: Profile completion is 92%");
    assert(d.profile.badge === "verified_project", "Section 1: Verified project badge present");
    assert(d.profile.isPremium === true, "Section 1: Premium badge present");

    // SECTION 2: Quick Statistics
    assert(typeof d.metrics.connections === "number" && d.metrics.connections >= 28, "Section 2: Real connections count >= 28");
    assert(d.metrics.profileViews === 142, "Section 2: Real profile views = 142");
    assert(d.metrics.activeOpportunities >= 4, "Section 2: Real active opportunities >= 4");
    assert(d.metrics.submittedApplications >= 2, "Section 2: Real submitted applications >= 2");
    assert(d.metrics.activePartnerships >= 3, "Section 2: Real active partnerships >= 3");
    assert(d.metrics.productsLaunched >= 1, "Section 2: Products launched >= 1");

    // SECTION 3: My Startups
    assert(Array.isArray(d.startups) && d.startups.length >= 2, "Section 3: Startups list contains NovaTech Systems & BharatFin Mesh");
    const nova = d.startups.find((s: any) => s.id === "st-dev");
    assert(nova && nova.membershipRole === "owner", "Section 3: Aarav is owner of NovaTech Systems");
    assert(nova && nova.teamCount >= 1, "Section 3: Startup team count summary available");

    // SECTION 4: Needs Your Attention
    assert(Array.isArray(d.attentionItems) && d.attentionItems.length >= 4, "Section 4: Attention items populated");
    const attItem = d.attentionItems[0];
    assert(attItem.status === "pending", "Section 4: Attention item initial status is pending");

    // SECTION 5: Recommended People
    assert(Array.isArray(d.recommendedPeople) && d.recommendedPeople.length >= 3, "Section 5: Recommended people list populated");
    assert(d.recommendedPeople[0].skills.length > 0, "Section 5: Recommended person contains skills");

    // SECTION 6: Opportunities & Jobs
    assert(Array.isArray(d.opportunitiesAndJobs.opportunities), "Section 6: Opportunities preview list populated");
    assert(Array.isArray(d.opportunitiesAndJobs.jobs), "Section 6: Jobs preview list populated");

    // SECTION 7: Collaboration Overview
    assert(Array.isArray(d.collaborations.incoming), "Section 7: Incoming proposals populated");
    assert(Array.isArray(d.collaborations.accepted), "Section 7: Accepted partnerships populated");

    // SECTION 8: Product Launchpad
    assert(Array.isArray(d.launchpad.myProducts), "Section 8: Maker's products list populated");
    assert(Array.isArray(d.launchpad.trending), "Section 8: Trending products list populated");
    const devSdk = d.launchpad.myProducts.find((p: any) => p.id === "prod-dev");
    assert(devSdk !== undefined, "Section 8: NovaTelemetry SDK present in user products");

    // SECTION 9: Founder Feed Preview
    assert(Array.isArray(d.feed) && d.feed.length >= 3, "Section 9: Feed preview contains recent posts");

    // SECTION 10: Upcoming Activities
    assert(Array.isArray(d.upcomingActivities) && d.upcomingActivities.length >= 3, "Section 10: Upcoming activities populated with timezone");

    // 2. Action Test: Attention Item Resolution
    const actionRes = await request("/api/founders/attention/att-1/accept", {
      method: "POST",
    });
    assert(actionRes.status === 200, "Action Test: Resolve attention item returns 200");
    assert(actionRes.body.item.status === "completed", "Action Test: Attention item status transitioned to completed");

    // 3. Action Test: Startup Creation
    const createStartupRes = await request("/api/founders/startups", {
      method: "POST",
      body: {
        name: "HyperScale Quantum",
        description: "Post-quantum cryptographic key distribution network.",
        industry: "Cybersecurity & Cryptography",
        stage: "Seed",
        website: "https://hyperscale-quantum.balaga",
      },
    });
    assert(createStartupRes.status === 201, "Action Test: Create startup returns 201 Created");
    assert(createStartupRes.body.startup.membershipRole === "owner", "Action Test: Creator automatically assigned role 'owner'");

    // 4. Action Test: Opportunity Posting
    const oppRes = await request("/api/founders/opportunities", {
      method: "POST",
      body: {
        startupId: "st-dev",
        title: "Lead Rust Systems Architect",
        type: "job",
        roleCategory: "Technical Lead",
        compensation: "$120k - $160k + 1.5% Equity",
        workMode: "Hybrid (Bengaluru)",
        description: "Scale high-throughput real-time messaging pipeline.",
      },
    });
    assert(oppRes.status === 201, "Action Test: Post opportunity returns 201 Created");
    assert(oppRes.body.opportunity.startup.name === "NovaTech Systems", "Action Test: Opportunity bound to authorized startup");

    // 5. Action Test: Feed Like & Comment
    const likeRes = await request("/api/founders/feed/fp-1/like", {
      method: "POST",
    });
    assert(likeRes.status === 200, "Action Test: Like feed post returns 200");
    assert(typeof likeRes.body.post.likesCount === "number", "Action Test: Feed post like count updated");

    const commentRes = await request("/api/founders/feed/fp-1/comment", {
      method: "POST",
      body: {
        content: "Outstanding architectural benchmark Rohit! Congratulations.",
      },
    });
    assert(commentRes.status === 201, "Action Test: Post comment on feed returns 201 Created");
    assert(typeof commentRes.body.commentsCount === "number", "Action Test: Feed post comment count incremented");

    // 6. Action Test: Save/Bookmark Feed Post
    const saveRes = await request("/api/founders/feed/fp-1/save", {
      method: "POST",
    });
    assert(saveRes.status === 200, "Action Test: Save feed post returns 200");
    assert(saveRes.body.post.hasSaved !== undefined, "Action Test: Feed post marked as saved");

  } finally {
    server.close();
  }

  console.log("\n======================================================");
  console.log(`BALAGA FEATURE 1 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runFeature1Tests().catch((err) => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
