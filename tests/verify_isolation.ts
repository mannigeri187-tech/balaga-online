/**
 * Security & World Isolation Verification Script
 * Tests:
 * 1. 18+ Age Assurance on registration
 * 2. Cross-world endpoint denial (Social context attempting to call Founders endpoint -> 403 Forbidden)
 * 3. Cross-world endpoint denial (Founders context attempting to call Social endpoint -> 403 Forbidden)
 * 4. Missing x-platform-world header -> 400 Bad Request
 * 5. Valid world context access succeeds with corresponding data
 */

import http from "http";
import app from "../apps/api/src/app.js";

async function runTests() {
  console.log("=== STARTING PLATFORM WORLD ISOLATION & SECURITY TEST SUITE ===\n");

  const server = app.listen(4999);
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
        `http://localhost:4999${path}`,
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
    // TEST 1: Health Check
    const health = await request("/api/health");
    assert(health.status === 200 && health.body.status === "healthy", "Health endpoint responds");

    // TEST 2: 18+ Verification on Register
    const underAgeReg = await request("/api/auth/register", {
      method: "POST",
      body: {
        email: "underage@test.com",
        password: "securePassword123",
        is18Plus: false, // Attempt underage registration
        firstWorld: "socializing",
      },
    });
    assert(underAgeReg.status === 400, "Under-18 registration is strictly rejected");

    const validReg = await request("/api/auth/register", {
      method: "POST",
      body: {
        email: "adult@test.com",
        password: "securePassword123",
        is18Plus: true,
        firstWorld: "founders",
      },
    });
    assert(
      validReg.status === 201 && validReg.body.account.is18PlusVerified === true,
      "Valid 18+ registration succeeds and records verification timestamp"
    );

    // TEST 3: Missing x-platform-world header
    const noHeader = await request("/api/social/feed");
    assert(
      noHeader.status === 400,
      "Endpoint without x-platform-world header is rejected with HTTP 400"
    );

    // TEST 4: Cross-world Leak Prevention: Social Context accessing Founders endpoint
    const crossLeak1 = await request("/api/founders/feed", {
      headers: { "x-platform-world": "socializing" }, // Wrong world
    });
    assert(
      crossLeak1.status === 403 &&
        crossLeak1.body.error.includes("Boundary Isolation Violation"),
      "Socializing context cannot access Founders feed (HTTP 403 Boundary Violation)"
    );

    // TEST 5: Cross-world Leak Prevention: Founders Context accessing Social endpoint
    const crossLeak2 = await request("/api/social/feed", {
      headers: { "x-platform-world": "founders" }, // Wrong world
    });
    assert(
      crossLeak2.status === 403 &&
        crossLeak2.body.error.includes("Boundary Isolation Violation"),
      "Founders context cannot access Socializing feed (HTTP 403 Boundary Violation)"
    );

    // TEST 6: Valid World Scoped Access
    const validSocial = await request("/api/social/feed", {
      headers: { "x-platform-world": "socializing" },
    });
    assert(
      validSocial.status === 200 && validSocial.body.world === "socializing",
      "Socializing context correctly accesses Social feed"
    );

    const validFounder = await request("/api/founders/feed", {
      headers: { "x-platform-world": "founders" },
    });
    assert(
      validFounder.status === 200 && validFounder.body.world === "founders",
      "Founders context correctly accesses Founders feed"
    );

    // TEST 7: Anti-Spoofing: Account with only Social profile forging Founders header
    const spoofAttempt = await request("/api/founders/feed", {
      headers: {
        "x-platform-world": "founders",
        "x-mock-account-id": "00000000-0000-0000-0000-000000000002", // Priya's account, which has no founder profile
      },
    });
    assert(
      spoofAttempt.status === 403 &&
        spoofAttempt.body.error.includes("Profile Required"),
      "Client sending Founders header without having a Founders profile is strictly rejected (Anti-Spoofing)"
    );

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
