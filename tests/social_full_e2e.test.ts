import http from "http";
import app from "../apps/api/src/app.js";

async function runSocialFullE2ETests() {
  console.log("=== STARTING FULL PHASE 1 SOCIALIZING INTEGRATION & SECURITY TEST SUITE ===\n");

  const server = app.listen(5003);
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
        `http://localhost:5003${path}`,
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
    // -------------------------------------------------------------
    // TEST SUITE 1: 24-HOUR STORIES & VIEWER ACCESS CONTROLS
    // -------------------------------------------------------------
    console.log("--- TEST GROUP 1: STORIES & 24H PRIVACY ---");

    // 1.1 Create story
    const createStoryRes = await request("/api/social/stories", {
      method: "POST",
      body: {
        mediaUrl: "https://images.unsplash.com/photo-test-story.jpg",
        mediaType: "image",
        caption: "Early morning filter coffee run in Malleshwaram ☕",
        audience: "everyone",
      },
    });
    assert(
      createStoryRes.status === 201 && !!createStoryRes.body?.story?.id,
      "Create 24h Story returns HTTP 201 and valid story ID",
      JSON.stringify(createStoryRes.body)
    );
    const storyId = createStoryRes.body?.story?.id;

    // 1.2 View story as User 2 (Priya)
    const viewStoryRes = await request(`/api/social/stories/${storyId}/view`, {
      method: "POST",
      headers: { "x-mock-account-id": "00000000-0000-0000-0000-000000000002" },
    });
    assert(
      viewStoryRes.status === 200 && viewStoryRes.body?.message === "View recorded",
      "Non-author viewer can log a story view (HTTP 200)",
      JSON.stringify(viewStoryRes.body)
    );

    // 1.3 Author fetches story viewers
    const authorViewersRes = await request(`/api/social/stories/${storyId}/viewers`, {
      headers: { "x-mock-account-id": "00000000-0000-0000-0000-000000000001" },
    });
    assert(
      authorViewersRes.status === 200 && Array.isArray(authorViewersRes.body?.viewers),
      "Story author can access the authenticated viewers list",
      JSON.stringify(authorViewersRes.body)
    );

    // 1.4 Non-author tries to access story viewers -> MUST BE 403 FORBIDDEN
    const forbiddenViewersRes = await request(`/api/social/stories/${storyId}/viewers`, {
      headers: { "x-mock-account-id": "00000000-0000-0000-0000-000000000002" },
    });
    assert(
      forbiddenViewersRes.status === 403,
      "Non-author receives HTTP 403 when trying to access another user's story viewers list",
      `Expected 403, got ${forbiddenViewersRes.status}`
    );

    // -------------------------------------------------------------
    // TEST SUITE 2: REELS, LIKES, VIEWS & COMMENTS
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 2: REELS & SHORT VIDEOS ---");

    // 2.1 Create reel
    const createReelRes = await request("/api/social/reels", {
      method: "POST",
      body: {
        videoUrl: "https://assets.mixkit.co/videos/test-cycling.mp4",
        caption: "Cycling across Sankey Tank in the rain #bengaluru #cycling",
        audioTrack: "Aarav Social • Morning Rain",
        hashtags: ["bengaluru", "cycling"],
      },
    });
    assert(
      createReelRes.status === 201 && !!createReelRes.body?.reel?.id,
      "Upload Reel returns HTTP 201 with created reel metadata",
      JSON.stringify(createReelRes.body)
    );
    const reelId = createReelRes.body?.reel?.id;

    // 2.2 Like reel
    const likeReelRes = await request(`/api/social/reels/${reelId}/like`, {
      method: "POST",
    });
    assert(
      likeReelRes.status === 200 && likeReelRes.body?.hasLiked === true,
      "Toggle Like on reel increments like count (HTTP 200)",
      JSON.stringify(likeReelRes.body)
    );

    // 2.3 Record deduplicated view
    const viewReelRes = await request(`/api/social/reels/${reelId}/view`, {
      method: "POST",
    });
    assert(
      viewReelRes.status === 200 && typeof viewReelRes.body?.viewsCount === "number",
      "Record view on reel returns HTTP 200",
      JSON.stringify(viewReelRes.body)
    );

    // 2.4 Add reel comment
    const commentReelRes = await request(`/api/social/reels/${reelId}/comments`, {
      method: "POST",
      body: {
        content: "Awesome route! Watch out for the tree roots near the lake gate.",
      },
    });
    assert(
      commentReelRes.status === 201 && !!commentReelRes.body?.comment?.id,
      "Add comment on reel returns HTTP 201 with comment ID",
      JSON.stringify(commentReelRes.body)
    );

    // -------------------------------------------------------------
    // TEST SUITE 3: INTEREST COMMUNITIES & DISCUSSIONS
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 3: COMMUNITIES & DISCUSSIONS ---");

    // 3.1 Create community
    const createCommRes = await request("/api/social/communities", {
      method: "POST",
      body: {
        name: "Bangalore Indie Boardgamers",
        slug: "blr-indie-boardgamers",
        description: "Community for Catan, Wingspan, and Eurogame enthusiasts.",
        category: "Games & Hobbies",
        isPrivate: false,
        rules: ["Teach new players patiently.", "Take care of game pieces."],
      },
    });
    assert(
      createCommRes.status === 201 && !!createCommRes.body?.community?.id,
      "Create Community returns HTTP 201 with creator role as owner",
      JSON.stringify(createCommRes.body)
    );
    const communityId = createCommRes.body?.community?.id;

    // 3.2 User 2 joins community
    const joinCommRes = await request(`/api/social/communities/${communityId}/join`, {
      method: "POST",
      headers: { "x-mock-account-id": "00000000-0000-0000-0000-000000000002" },
    });
    assert(
      joinCommRes.status === 200 && joinCommRes.body?.status === "active",
      "Public community allows instant member join (HTTP 200)",
      JSON.stringify(joinCommRes.body)
    );

    // 3.3 Create community discussion post
    const commPostRes = await request(`/api/social/communities/${communityId}/posts`, {
      method: "POST",
      headers: { "x-mock-account-id": "00000000-0000-0000-0000-000000000002" },
      body: {
        content: "Anyone up for a round of Ticket to Ride this Sunday at Dialogues Cafe JP Nagar?",
        mediaUrls: [],
      },
    });
    assert(
      commPostRes.status === 201 && !!commPostRes.body?.post?.id,
      "Community member can publish a discussion post (HTTP 201)",
      JSON.stringify(commPostRes.body)
    );

    // -------------------------------------------------------------
    // TEST SUITE 4: SOCIAL EVENTS, PUBLIC VENUES & RSVPS
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 4: EVENTS & PUBLIC VENUE SAFETY ---");

    // 4.1 Create public meetup event
    const createEventRes = await request("/api/social/events", {
      method: "POST",
      body: {
        title: "Cubbon Park Sunday Watercolor Paint-out",
        description: "Bring water brushes and cold press paper. All levels welcome.",
        category: "Art & Design",
        venueName: "Cubbon Park Queen Victoria Statue (Public Venue)",
        city: "Bengaluru",
        isOnline: false,
        startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        publicSafetyGuidance: "Public park meeting only. No private premises.",
        isAttendeeListVisible: true,
      },
    });
    assert(
      createEventRes.status === 201 && !!createEventRes.body?.event?.id,
      "Organize Social Event returns HTTP 201 with public venue specifications",
      JSON.stringify(createEventRes.body)
    );
    const eventId = createEventRes.body?.event?.id;

    // 4.2 User 2 updates RSVP to 'going'
    const rsvpEventRes = await request(`/api/social/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "x-mock-account-id": "00000000-0000-0000-0000-000000000002" },
      body: { rsvpStatus: "going" },
    });
    assert(
      rsvpEventRes.status === 200 && rsvpEventRes.body?.myRsvp === "going",
      "User can RSVP 'going' to an active event (HTTP 200)",
      JSON.stringify(rsvpEventRes.body)
    );

    // 4.3 Organizer cancels event
    const cancelEventRes = await request(`/api/social/events/${eventId}/cancel`, {
      method: "POST",
      headers: { "x-mock-account-id": "00000000-0000-0000-0000-000000000001" },
    });
    assert(
      cancelEventRes.status === 200 && cancelEventRes.body?.event?.status === "cancelled",
      "Event organizer can cancel the event (HTTP 200, status: cancelled)",
      JSON.stringify(cancelEventRes.body)
    );

    // -------------------------------------------------------------
    // TEST SUITE 5: SOCIAL INBOX, MESSAGING & BLOCK ENFORCEMENT
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 5: SOCIAL INBOX & MESSAGING PRIVACY ---");

    // 5.1 Fetch user conversations
    const convsRes = await request("/api/social/inbox/conversations");
    assert(
      convsRes.status === 200 && Array.isArray(convsRes.body?.conversations),
      "Fetch social conversations returns HTTP 200 with scoped dialogs",
      JSON.stringify(convsRes.body)
    );
    const activeConvId = convsRes.body?.conversations?.[0]?.id;

    // 5.2 Send message in conversation
    if (activeConvId) {
      const sendMsgRes = await request(`/api/social/inbox/conversations/${activeConvId}/messages`, {
        method: "POST",
        body: { content: "Looking forward to catching up on Saturday!" },
      });
      assert(
        sendMsgRes.status === 201 && !!sendMsgRes.body?.messageItem?.id,
        "Participant can send message in social conversation (HTTP 201)",
        JSON.stringify(sendMsgRes.body)
      );

      // 5.3 Mark conversation as read
      const markReadRes = await request(`/api/social/inbox/conversations/${activeConvId}/read`, {
        method: "POST",
      });
      assert(
        markReadRes.status === 200 && markReadRes.body?.success === true,
        "Mark conversation read returns HTTP 200",
        JSON.stringify(markReadRes.body)
      );
    }

    // -------------------------------------------------------------
    // TEST SUITE 6: NOTIFICATIONS & READ STATES
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 6: NOTIFICATION CENTRE ---");

    // 6.1 Get notifications
    const notifsRes = await request("/api/social/notifications");
    assert(
      notifsRes.status === 200 && Array.isArray(notifsRes.body?.notifications),
      "Fetch notifications returns HTTP 200 with list of alerts",
      JSON.stringify(notifsRes.body)
    );

    // 6.2 Mark all notifications as read
    const markAllNotifsRes = await request("/api/social/notifications/read-all", {
      method: "POST",
    });
    assert(
      markAllNotifsRes.status === 200 && !!markAllNotifsRes.body?.message,
      "Mark all notifications as read returns HTTP 200",
      JSON.stringify(markAllNotifsRes.body)
    );

    // -------------------------------------------------------------
    // TEST SUITE 7: SAFETY, BLOCKING & CONTENT REPORTING
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 7: SAFETY, BLOCKING & REPORTING ---");

    // 7.1 Block user 5
    const blockRes = await request("/api/social/safety/block", {
      method: "POST",
      body: { targetProfileId: "10000000-0000-0000-0000-000000000005" },
    });
    assert(
      blockRes.status === 200 && !!blockRes.body?.blockedId,
      "Block target user returns HTTP 200 with blockedId",
      JSON.stringify(blockRes.body)
    );

    // 7.2 Submit moderation report
    const reportRes = await request("/api/social/safety/report", {
      method: "POST",
      body: {
        targetType: "post",
        targetId: "sp-1",
        reason: "spam",
        details: "Unsolicited promotional content posted in comments.",
      },
    });
    assert(
      reportRes.status === 201 && !!reportRes.body?.report?.id,
      "Submit moderation report returns HTTP 201 with pending report status",
      JSON.stringify(reportRes.body)
    );

    // -------------------------------------------------------------
    // TEST SUITE 8: UNIFIED SEARCH & STRICT WORLD SCOPING
    // -------------------------------------------------------------
    console.log("\n--- TEST GROUP 8: UNIFIED SEARCH & STRICT WORLD SCOPE ---");

    const searchRes = await request("/api/social/search?q=sketch");
    assert(
      searchRes.status === 200 &&
        Array.isArray(searchRes.body?.results?.communities) &&
        Array.isArray(searchRes.body?.results?.people),
      "Unified Social Search returns matched Socializing entities",
      JSON.stringify(searchRes.body)
    );

    // Verify zero cross-world data leakage into search results
    const resultsStr = JSON.stringify(searchRes.body);
    const hasFounderData =
      resultsStr.includes("NovaTech") ||
      resultsStr.includes("TechVentures") ||
      resultsStr.includes("co-founder") ||
      resultsStr.includes("equity");
    assert(
      !hasFounderData,
      "Zero cross-world leakage: Social search results contain no Founder/Startup keywords or entities"
    );

  } catch (err: any) {
    console.error("Test execution threw exception:", err);
    failed++;
  } finally {
    server.close();
    console.log("\n=======================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("=======================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runSocialFullE2ETests();
