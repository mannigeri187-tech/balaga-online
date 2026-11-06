import http from "http";
import app from "../apps/api/src/app.js";

async function runSocialBatch2Tests() {
  console.log("=== STARTING BATCH 1.2: CONNECTIONS & PEOPLE DISCOVERY TEST SUITE ===\n");

  const server = app.listen(5002);
  let passed = 0;
  let failed = 0;

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
            "x-platform-world": "socializing",
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
    // 1. People Discovery default
    const discoveryAll = await request("/api/social/discover/people");
    assert(
      discoveryAll.status === 200 && discoveryAll.body.results.length >= 3,
      "GET /api/social/discover/people returns discovery candidates"
    );

    // 2. Filter by Interest (Cycling)
    const discoveryCycling = await request("/api/social/discover/people?interest=Cycling");
    assert(
      discoveryCycling.status === 200 &&
        discoveryCycling.body.results.some((p: any) => p.username === "kabir_rides"),
      "Filter by interest 'Cycling' correctly matches Kabir Menon"
    );

    // 3. Filter by City (Mumbai)
    const discoveryMumbai = await request("/api/social/discover/people?city=Mumbai");
    assert(
      discoveryMumbai.status === 200 &&
        discoveryMumbai.body.results.length === 1 &&
        discoveryMumbai.body.results[0].username === "tanvi_reads",
      "Filter by city 'Mumbai' correctly matches Tanvi Shah"
    );

    // 4. Send Connection Request (Aarav to Tanvi)
    const tanviProfileId = discoveryMumbai.body.results[0].id;
    const sendReq = await request("/api/social/connections/request", {
      method: "POST",
      body: { recipientId: tanviProfileId },
    });
    assert(
      sendReq.status === 201 && sendReq.body.connection.status === "pending",
      "POST /api/social/connections/request sends pending connection request"
    );

    // 5. Anti-Self Connection Test
    const selfReq = await request("/api/social/connections/request", {
      method: "POST",
      body: { recipientId: "10000000-0000-0000-0000-000000000001" }, // Self profile
    });
    assert(
      selfReq.status === 400 && selfReq.body.error.includes("yourself"),
      "Self connection requests are strictly prohibited (HTTP 400)"
    );

    // 6. View Connections Overview (Accepted, Pending Incoming, Pending Outgoing)
    const connList = await request("/api/social/connections");
    assert(
      connList.status === 200 &&
        connList.body.connections.length >= 1 && // Priya is accepted
        connList.body.pendingIncoming.length >= 1 && // Kabir has requested Aarav
        connList.body.pendingOutgoing.some((c: any) => c.recipientId === tanviProfileId),
      "GET /api/social/connections accurately segments active, incoming, and outgoing connections"
    );

    // 7. Accept Incoming Connection Request (Accept Kabir's request)
    const kabirConnectionId = connList.body.pendingIncoming[0].id;
    const acceptReq = await request(`/api/social/connections/${kabirConnectionId}/respond`, {
      method: "POST",
      body: { action: "accept" },
    });
    assert(
      acceptReq.status === 200 && acceptReq.body.connection.status === "accepted",
      "POST /api/social/connections/:id/respond accepts pending connection request"
    );

    // 8. Follow Profile
    const followRes = await request(`/api/social/follows/${tanviProfileId}`, {
      method: "POST",
    });
    assert(
      followRes.status === 201 && followRes.body.message.includes("Now following"),
      "POST /api/social/follows/:profileId follows user"
    );

    // 9. Unfollow Profile
    const unfollowRes = await request(`/api/social/follows/${tanviProfileId}`, {
      method: "DELETE",
    });
    assert(
      unfollowRes.status === 200 && unfollowRes.body.message.includes("Unfollowed"),
      "DELETE /api/social/follows/:profileId unfollows user"
    );

    // 10. Remove Connection
    const removeConnRes = await request(`/api/social/connections/${tanviProfileId}`, {
      method: "DELETE",
    });
    assert(
      removeConnRes.status === 200 && removeConnRes.body.message.includes("removed"),
      "DELETE /api/social/connections/:partnerProfileId removes connection"
    );

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runSocialBatch2Tests();
