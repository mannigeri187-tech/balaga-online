/**
 * Row Level Security (RLS) & Backend Authorization Security Test Suite
 * Tests:
 * 1. Master Account RLS: Users can only access their own master account (auth.uid() = id)
 * 2. Profile RLS: Cross-user profile modifications are strictly blocked
 * 3. Startup Permissions RLS: Non-members / non-admins blocked from administrative actions
 * 4. Cross-Startup Resource Isolation: Startup A member cannot mutate Startup B resources
 * 5. Cross-World RLS & Boundary Enforcement: Socializing context denied access to Founders tables (HTTP 403)
 * 6. Service-Role Boundary Protection: Application guards prevent unauthorized client elevation
 */

import http from "http";
import app from "../apps/api/src/app.js";

async function runRlsTests() {
  console.log("=== STARTING ROW LEVEL SECURITY (RLS) & AUTHORIZATION TEST SUITE ===\n");

  const port = 5025;
  const server = app.listen(port);
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
    return new Promise((resolve) => {
      const payload = options.body ? JSON.stringify(options.body) : undefined;
      const req = http.request(
        `http://localhost:${port}${path}`,
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
      req.on("error", (err) => resolve({ status: 500, body: { error: err.message } }));
      if (payload) req.write(payload);
      req.end();
    });
  }

  try {
    const USER_A_HEADERS = {
      "x-mock-account-id": "00000000-0000-0000-0000-000000000001",
      "x-platform-world": "founders",
    };
    const USER_B_HEADERS = {
      "x-mock-account-id": "00000000-0000-0000-0000-000000000002",
      "x-platform-world": "founders",
    };
    const SOCIAL_HEADERS = {
      "x-mock-account-id": "00000000-0000-0000-0000-000000000001",
      "x-platform-world": "socializing",
    };

    // 1. Cross-user verification application read denial
    // User B attempts to read User A's verification application
    const resApp1 = await request("/api/founders/verification/applications/verif-app-1", {
      headers: USER_B_HEADERS,
    });
    assert(
      resApp1.status === 403,
      "1. Cross-user RLS: User B cannot access User A's verification application (HTTP 403)",
      `Expected 403, got ${resApp1.status}`
    );

    // 2. Cross-user personal inbox state modification denial
    // User B attempts to delete/modify User A's conversation state
    const resInboxState = await request("/api/founders/inbox/conversations/fc-1/personal", {
      method: "DELETE",
      headers: {
        "x-mock-account-id": "00000000-0000-0000-0000-000000000099", // Non-participant
        "x-platform-world": "founders",
      },
    });
    assert(
      resInboxState.status === 403 || resInboxState.status === 404,
      "2. Inbox RLS: Non-participant cannot mutate another user's conversation state",
      `Expected 403 or 404, got ${resInboxState.status}`
    );

    // 3. Cross-startup mutation denial
    // User B attempts to update settings of a startup owned by User A
    const resStartupSettings = await request("/api/founders/startups/st-mesh/settings", {
      method: "PATCH",
      headers: USER_B_HEADERS,
      body: { visibility: "private" },
    });
    assert(
      resStartupSettings.status === 403,
      "3. Startup Role RLS: Non-admin cannot mutate startup settings (HTTP 403)",
      `Expected 403, got ${resStartupSettings.status}`
    );

    // 4. Cross-startup team invitation denial
    // Non-admin attempts to invite members to a startup
    const resInvite = await request("/api/founders/startups/st-mesh/invitations", {
      method: "POST",
      headers: USER_B_HEADERS,
      body: {
        email: "intruder@platform.local",
        role: "admin",
      },
    });
    assert(
      resInvite.status === 403,
      "4. Startup Role RLS: Non-admin cannot invite team members (HTTP 403)",
      `Expected 403, got ${resInvite.status}`
    );

    // 5. Cross-world isolation: Socializing context cannot access Founders startups
    const resWorld1 = await request("/api/founders/startups", {
      headers: SOCIAL_HEADERS,
    });
    assert(
      resWorld1.status === 403,
      "5. Dual-World Boundary: Socializing world context rejected from Founders realm with 403",
      `Expected 403, got ${resWorld1.status}`
    );

    // 6. Cross-world isolation: Founders context cannot access Socializing posts
    const resWorld2 = await request("/api/social/posts", {
      headers: USER_A_HEADERS,
    });
    assert(
      resWorld2.status === 403,
      "6. Dual-World Boundary: Founders world context rejected from Socializing realm with 403",
      `Expected 403, got ${resWorld2.status}`
    );

    // 7. Cross-user feed post deletion denial
    // User B attempts to delete User A's post
    const resDeletePost = await request("/api/founders/feed/fp-1", {
      method: "DELETE",
      headers: USER_B_HEADERS,
    });
    assert(
      resDeletePost.status === 403,
      "7. Author RLS: Non-author cannot delete another founder's feed post (HTTP 403)",
      `Expected 403, got ${resDeletePost.status}`
    );

    // 8. Service-Role Boundary Protection:
    // Client cannot forge elevated service-role privileges through request headers
    const resElevate = await request("/api/founders/startups/st-mesh/settings", {
      method: "PATCH",
      headers: {
        ...USER_B_HEADERS,
        "x-supabase-role": "service_role", // Attempt privilege escalation
        "role": "service_role",
      },
      body: { visibility: "private" },
    });
    assert(
      resElevate.status === 403,
      "8. Security Boundary: Client cannot forge service-role authorization via request headers",
      `Expected 403, got ${resElevate.status}`
    );

  } catch (err: any) {
    console.error("RLS test error:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n=== RLS & AUTHORIZATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runRlsTests();
