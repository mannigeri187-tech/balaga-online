/**
 * Balaga Mandatory Email Verification & Auth Redesign Test Suite
 * Validates:
 * 1. Missing Authorization header -> 401 Unauthorized
 * 2. Unverified account token (email_confirmed_at is null) -> 403 Forbidden (email_not_verified)
 * 3. Protected routes (/api/auth/me, /api/social/feed, /api/founders/dashboard) reject unverified accounts
 * 4. Demo profile mock headers / bypasses are completely rejected -> 401 Unauthorized
 * 5. Verified user token (email_confirmed_at is valid timestamp) -> 200 OK
 * 6. Existing seeded verified accounts are preserved and authorized
 * 7. Malformed / forged token signatures rejected -> 401 Unauthorized
 * 8. Expired verification / token claim rejected -> 401 Expired
 */

import http from "http";
import crypto from "crypto";
import app from "../apps/api/src/app.js";
import { accountsStore, devAccountId, secondAccountId } from "../apps/api/src/services/store.js";

const TEST_SECRET = "balaga-test-verification-secret-32-chars-min!!";

function createJwt(payload: Record<string, any>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  return `${headerB64}.${payloadB64}.${signature}`;
}

async function runEmailVerificationTests() {
  console.log("=== BALAGA MANDATORY EMAIL VERIFICATION & AUTH SUITE ===\n");

  process.env.SUPABASE_JWT_SECRET = TEST_SECRET;

  const port = 5005;
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
            "x-platform-world": "socializing",
            ...options.headers,
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
    // -------------------------------------------------------------
    // TEST 1: Missing auth header -> 401
    // -------------------------------------------------------------
    const res1 = await request("/api/auth/me");
    assert(res1.status === 401, "Test 1: Unauthenticated request to /api/auth/me is blocked with 401");

    // -------------------------------------------------------------
    // TEST 2: Demo profile mock header bypass is strictly rejected
    // -------------------------------------------------------------
    const res2 = await request("/api/auth/me", {
      headers: {
        "x-mock-user": "true",
        "x-mock-account-id": devAccountId,
      },
    });
    assert(
      res2.status === 401,
      "Test 2: Demo profile header bypass (x-mock-user) cannot authenticate and is rejected with 401"
    );

    // -------------------------------------------------------------
    // TEST 3: Unverified user token (email_confirmed_at === null) -> 403 Forbidden
    // -------------------------------------------------------------
    const unverifiedId = "acc-unverified-001";
    accountsStore.set(unverifiedId, {
      id: unverifiedId,
      email: "newuser.unverified@example.com",
      is18PlusVerified: true,
      subscriptionTier: "free",
      isSuspended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const unverifiedToken = createJwt(
      {
        sub: unverifiedId,
        email: "newuser.unverified@example.com",
        aud: "authenticated",
        role: "authenticated",
        email_confirmed_at: null, // UNVERIFIED!
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      TEST_SECRET
    );

    const res3 = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${unverifiedToken}` },
    });
    assert(
      res3.status === 403 && res3.body?.error === "email_not_verified",
      "Test 3: Unverified user token is rejected by backend with 403 Forbidden (email_not_verified)"
    );

    // -------------------------------------------------------------
    // TEST 4: Unverified user blocked from accessing Socializing feed
    // -------------------------------------------------------------
    const res4 = await request("/api/social/feed", {
      headers: {
        Authorization: `Bearer ${unverifiedToken}`,
        "x-platform-world": "socializing",
      },
    });
    assert(
      res4.status === 403,
      "Test 4: Unverified account cannot access Socializing protected feed"
    );

    // -------------------------------------------------------------
    // TEST 5: Unverified user blocked from accessing Founders dashboard
    // -------------------------------------------------------------
    const res5 = await request("/api/founders/dashboard", {
      headers: {
        Authorization: `Bearer ${unverifiedToken}`,
        "x-platform-world": "founders",
      },
    });
    assert(
      res5.status === 403,
      "Test 5: Unverified account cannot access Founders protected dashboard"
    );

    // -------------------------------------------------------------
    // TEST 6: Verified user token (email_confirmed_at is timestamp) -> 200 OK
    // -------------------------------------------------------------
    const verifiedId = "acc-verified-999";
    accountsStore.set(verifiedId, {
      id: verifiedId,
      email: "founder.verified@example.com",
      is18PlusVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      subscriptionTier: "free",
      isSuspended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const verifiedToken = createJwt(
      {
        sub: verifiedId,
        email: "founder.verified@example.com",
        aud: "authenticated",
        role: "authenticated",
        email_confirmed_at: new Date().toISOString(), // VERIFIED!
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      TEST_SECRET
    );

    const res6 = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${verifiedToken}` },
    });
    assert(
      res6.status === 200 && res6.body?.account?.id === verifiedId,
      "Test 6: Verified user with valid email_confirmed_at is authenticated successfully (200 OK)"
    );

    // -------------------------------------------------------------
    // TEST 7: Existing seeded accounts are preserved and authorized
    // -------------------------------------------------------------
    const seededToken = createJwt(
      {
        sub: devAccountId,
        email: "founder.dev@platform.local",
        aud: "authenticated",
        role: "authenticated",
        email_confirmed_at: "2026-11-01T00:00:00.000Z",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      TEST_SECRET
    );

    const res7 = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${seededToken}` },
    });
    assert(
      res7.status === 200 && res7.body?.account?.id === devAccountId,
      "Test 7: Existing seeded account is preserved and can access protected resources"
    );

    // -------------------------------------------------------------
    // TEST 8: Malformed token signature is rejected
    // -------------------------------------------------------------
    const res8 = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${verifiedToken}tampered` },
    });
    assert(
      res8.status === 401,
      "Test 8: Tampered or forged token signature is rejected with 401"
    );

    // -------------------------------------------------------------
    // TEST 9: Expired token claim is rejected
    // -------------------------------------------------------------
    const expiredToken = createJwt(
      {
        sub: verifiedId,
        email: "founder.verified@example.com",
        aud: "authenticated",
        role: "authenticated",
        email_confirmed_at: new Date().toISOString(),
        exp: Math.floor(Date.now() / 1000) - 300, // Expired 5 mins ago
      },
      TEST_SECRET
    );

    const res9 = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(res9.status === 401, "Test 9: Expired token is rejected with 401");

  } finally {
    server.close();
  }

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runEmailVerificationTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
