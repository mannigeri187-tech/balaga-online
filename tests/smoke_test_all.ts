/**
 * Balaga.online Comprehensive Production Smoke Test Runner
 */

const BACKEND_URL = "https://balaga-online.onrender.com";
const FRONTEND_URL = "https://balagaonline-50ke8tkyf-manjunathannigeri120-glitch.vercel.app";

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

  // 2. Security: Missing x-platform-world header must be rejected
  await check("Boundary: Missing x-platform-world header returns HTTP 400", async () => {
    const res = await fetch(`${BACKEND_URL}/api/founders/feed`, {
      headers: { "x-mock-user": "true" }
    });
    return res.status === 400;
  });

  // 3. Security: Socializing header cannot access Founders feed
  await check("Isolation: Socializing header cannot access Founders feed (HTTP 403)", async () => {
    const res = await fetch(`${BACKEND_URL}/api/founders/feed`, {
      headers: {
        "x-platform-world": "socializing",
        "x-mock-user": "true"
      }
    });
    return res.status === 403;
  });

  // 4. Security: Founders header cannot access Social feed
  await check("Isolation: Founders header cannot access Social feed (HTTP 403)", async () => {
    const res = await fetch(`${BACKEND_URL}/api/social/feed`, {
      headers: {
        "x-platform-world": "founders",
        "x-mock-user": "true"
      }
    });
    return res.status === 403;
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
