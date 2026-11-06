/**
 * Real Supabase Authentication & Security Test Suite
 * Tests:
 * 1. Missing Authorization header -> 401 Unauthorized
 * 2. Malformed Authorization header -> 401 Unauthorized
 * 3. Arbitrary/forged bearer token string -> 401 Unauthorized
 * 4. Expired token claim -> 401 Expired
 * 5. Tampered token signature -> 401 Invalid signature
 * 6. Cryptographically valid JWT token -> 200 OK
 * 7. Identity derives strictly from verified claims (body spoofing prevented)
 * 8. Suspended account -> 403 Forbidden
 * 9. Production enforcement: Dev mock headers blocked in NODE_ENV=production
 */

import http from "http";
import crypto from "crypto";
import app from "../apps/api/src/app.js";
import { accountsStore } from "../apps/api/src/services/store.js";

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

async function runAuthSecurityTests() {
  console.log("=== STARTING REAL SUPABASE AUTH & SECURITY TEST SUITE ===\n");

  const port = 5001;
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
      req.on("error", (err) => {
        resolve({ status: 500, body: { error: err.message } });
      });
      if (payload) req.write(payload);
      req.end();
    });
  }

  try {
    const testSecret = process.env.SUPABASE_JWT_SECRET || "test-super-secret-jwt-key-32chars!";
    process.env.SUPABASE_JWT_SECRET = testSecret;

    // Test 1: Missing Authorization header (no dev mock headers)
    const res1 = await request("/api/founders/dashboard", {
      headers: {}, // strictly no x-mock-user or Authorization
    });
    assert(
      res1.status === 401,
      "1. Missing Authorization header rejected with 401",
      `Expected 401, got ${res1.status}`
    );

    // Test 2: Malformed Authorization header format (not Bearer)
    const res2 = await request("/api/founders/dashboard", {
      headers: { Authorization: "Basic invalid_credentials" },
    });
    assert(
      res2.status === 401,
      "2. Malformed non-Bearer authorization rejected with 401",
      `Expected 401, got ${res2.status}`
    );

    // Test 3: Arbitrary dummy string token (forged bearer bypass)
    const res3 = await request("/api/founders/dashboard", {
      headers: { Authorization: "Bearer arbitrary-forged-string-token" },
    });
    assert(
      res3.status === 401,
      "3. Arbitrary/forged bearer token string rejected with 401",
      `Expected 401, got ${res3.status}`
    );

    // Test 4: Expired token
    const expiredPayload = {
      sub: "00000000-0000-0000-0000-000000000001",
      email: "aarav.dev@platform.local",
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
    };
    const expiredToken = createJwt(expiredPayload, testSecret);
    const res4 = await request("/api/founders/dashboard", {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(
      res4.status === 401,
      "4. Expired token rejected with 401",
      `Expected 401, got ${res4.status} (${JSON.stringify(res4.body)})`
    );

    // Test 5: Tampered token signature
    const validPayload = {
      sub: "00000000-0000-0000-0000-000000000001",
      email: "aarav.dev@platform.local",
      aud: "authenticated",
      role: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600, // valid for 1 hour
    };
    const tamperedToken = createJwt(validPayload, "wrong-secret-key");
    const res5 = await request("/api/founders/dashboard", {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    });
    assert(
      res5.status === 401,
      "5. Token with invalid/tampered signature rejected with 401",
      `Expected 401, got ${res5.status}`
    );

    // Test 6: Valid cryptographically signed JWT token
    const validToken = createJwt(validPayload, testSecret);
    const res6 = await request("/api/founders/dashboard", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    assert(
      res6.status === 200,
      "6. Cryptographically valid signed JWT token accepted with 200",
      `Expected 200, got ${res6.status}`
    );

    // Test 7: Suspended account access attempt
    const suspendedId = "00000000-0000-0000-0000-000000000999";
    accountsStore.set(suspendedId, {
      id: suspendedId,
      email: "suspended@platform.local",
      is18PlusVerified: true,
      subscriptionTier: "free",
      isSuspended: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const suspendedToken = createJwt(
      {
        sub: suspendedId,
        email: "suspended@platform.local",
        aud: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      testSecret
    );
    const res7 = await request("/api/founders/dashboard", {
      headers: { Authorization: `Bearer ${suspendedToken}` },
    });
    assert(
      res7.status === 403,
      "7. Suspended account token blocked with 403 Forbidden",
      `Expected 403, got ${res7.status}`
    );

    // Test 8: Body spoofing prevention - user claims cannot be overridden by request payload
    const res8 = await request("/api/founders/feed", {
      method: "POST",
      headers: { Authorization: `Bearer ${validToken}` },
      body: {
        authorId: "spoofed-user-id-9999", // Attempt to spoof authorId
        content: "Testing that authorId is strictly derived from verified token claims.",
        postType: "update",
      },
    });
    assert(
      res8.status === 201 && (res8.body.authorProfileId === "00000000-0000-0000-0000-000000000001" || res8.body.authorId !== "spoofed-user-id-9999"),
      "8. User identity cannot be forged via request body parameters",
      `Got status: ${res8.status}, body author: ${res8.body?.authorProfileId || res8.body?.authorId}`
    );

    // Test 9: Dev mock bypass is strictly blocked in production
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const res9 = await request("/api/founders/dashboard", {
      headers: { "x-mock-user": "true" },
    });
    process.env.NODE_ENV = origEnv;
    assert(
      res9.status === 401,
      "9. Dev mock header (x-mock-user) strictly denied in production (NODE_ENV=production)",
      `Expected 401, got ${res9.status}`
    );

  } catch (err: any) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n=== AUTH & SECURITY TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runAuthSecurityTests();
