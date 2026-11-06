/**
 * Balaga.online Comprehensive Production Smoke Test Runner
 */

const BACKEND_URL = "https://balaga-online.onrender.com";
const FRONTEND_URL = "https://balagaonline.vercel.app";

async function runSmokeTests() {
  console.log("=================================================================");
  console.log("   BALAGA.ONLINE FULL PRODUCTION SMOKE TEST SUITE               ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  async function check(name: string, fn: () => Promise<boolean>) {
    process.stdout.write(`⏳ Testing: ${name}... `);
    try {
      const ok = await fn();
      if (ok) {
        console.log("✅ PASS");
        passed++;
      } else {
        console.log("❌ FAIL");
        failed++;
      }
    } catch (err: any) {
      console.log(`❌ ERROR: ${err.message}`);
      failed++;
    }
  }

  // 1. Backend Health Check
  await check("Backend API Health Endpoint (/api/health)", async () => {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    return res.status === 200;
  });

  // 2. Production Security: Unauthenticated requests to protected endpoints are rejected (HTTP 401)
  await check("Security: Unauthenticated request to Founders feed rejected (HTTP 401)", async () => {
    const res = await fetch(`${BACKEND_URL}/api/founders/feed`);
    return res.status === 401;
  });

  // 3. Production Security: Unauthenticated requests to Social feed are rejected (HTTP 401)
  await check("Security: Unauthenticated request to Social feed rejected (HTTP 401)", async () => {
    const res = await fetch(`${BACKEND_URL}/api/social/feed`);
    return res.status === 401;
  });

  // 4. Production Registration: 18+ enforcement on register endpoint
  await check("Security: Underage registration rejected on production (HTTP 400)", async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "underage_smoke@balaga.online",
        password: "Pass12345!Secure",
        is18Plus: false,
        firstWorld: "founders"
      })
    });
    return res.status === 400;
  });

  // 5. Frontend Production Shell
  await check("Frontend: Production Web Shell returns HTTP 200", async () => {
    const res = await fetch(FRONTEND_URL);
    return res.status === 200;
  });

  // 6. Assets: Dual-Realm Vector Brand Mark
  await check("Assets: Dual-Realm Vector Brand Mark (/icon.svg) responds HTTP 200", async () => {
    const res = await fetch(`${FRONTEND_URL}/icon.svg`);
    return res.status === 200;
  });

  // 7. PWA: Service Worker
  await check("PWA: Service Worker (/sw.js) responds HTTP 200", async () => {
    const res = await fetch(`${FRONTEND_URL}/sw.js`);
    return res.status === 200;
  });

  console.log("\n=================================================================");
  console.log(`   SMOKE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSmokeTests();
