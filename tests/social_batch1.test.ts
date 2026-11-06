import http from "http";
import app from "../apps/api/src/app.js";

async function runSocialBatch1Tests() {
  console.log("=== STARTING BATCH 1.1: SOCIAL FEED & POSTS ENGINE TEST SUITE ===\n");

  const server = app.listen(5001);
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
        `http://localhost:5001${path}`,
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
    // 1. Get Social Profile
    const profileRes = await request("/api/social/profile/me");
    assert(
      profileRes.status === 200 && profileRes.body.profile.username === "aarav_social",
      "GET /api/social/profile/me retrieves active social profile"
    );

    // 2. Update Social Profile Customization
    const updateRes = await request("/api/social/profile/me", {
      method: "PUT",
      body: {
        bio: "Updated bio: Street photography & cycling enthusiast.",
        pronouns: "he/him",
        city: "Bengaluru",
        state: "Karnataka",
        interests: ["Photography", "Cycling", "Indie Cinema", "Specialty Coffee"],
      },
    });
    assert(
      updateRes.status === 200 &&
        updateRes.body.profile.bio.includes("Street photography") &&
        updateRes.body.profile.city === "Bengaluru",
      "PUT /api/social/profile/me updates bio, pronouns, and interests"
    );

    // 3. Create Multi-Image Post
    const newPostRes = await request("/api/social/posts", {
      method: "POST",
      body: {
        content: "Sunrise cycling at Turahalli forest! The fresh eucalyptus air was invigorating 🌲🚲",
        postType: "multi_image",
        mediaUrls: [
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800",
          "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800",
        ],
      },
    });
    assert(
      newPostRes.status === 201 && newPostRes.body.post.postType === "multi_image",
      "POST /api/social/posts creates multi-image post"
    );
    const createdPostId = newPostRes.body.post.id;

    // 4. Create Poll Post
    const pollPostRes = await request("/api/social/posts", {
      method: "POST",
      body: {
        content: "Where should we host our next weekend book discussion meetup?",
        postType: "poll",
        pollOptions: [
          { text: "Atta Galatta (Indiranagar)" },
          { text: "Bookworm (Church Street)" },
          { text: "Champaca Bookstore (Vasanth Nagar)" },
        ],
      },
    });
    assert(
      pollPostRes.status === 201 &&
        pollPostRes.body.post.postType === "poll" &&
        pollPostRes.body.post.pollOptions.length === 3,
      "POST /api/social/posts creates interactive poll post"
    );

    // 5. Add Reaction to Post
    const reactRes = await request(`/api/social/posts/${createdPostId}/react`, {
      method: "POST",
      body: { reactionType: "love" },
    });
    assert(
      reactRes.status === 201 &&
        reactRes.body.hasLiked === true &&
        reactRes.body.userReaction === "love",
      "POST /api/social/posts/:id/react adds 'love' reaction"
    );

    // 6. Add Comment
    const commentRes = await request(`/api/social/posts/${createdPostId}/comments`, {
      method: "POST",
      body: { content: "Turahalli is great! Did you take the quarry trail?" },
    });
    assert(
      commentRes.status === 201 && commentRes.body.comment.content.includes("quarry trail"),
      "POST /api/social/posts/:id/comments adds top-level comment"
    );
    const commentId = commentRes.body.comment.id;

    // 7. Add Nested Reply
    const replyRes = await request(`/api/social/posts/${createdPostId}/comments`, {
      method: "POST",
      body: {
        content: "Yes, exactly! Super smooth descent on the North face.",
        parentCommentId: commentId,
      },
    });
    assert(
      replyRes.status === 201 && replyRes.body.comment.parentCommentId === commentId,
      "POST /api/social/posts/:id/comments adds nested reply"
    );

    // 8. Fetch Comments Hierarchy
    const commentsListRes = await request(`/api/social/posts/${createdPostId}/comments`);
    assert(
      commentsListRes.status === 200 &&
        commentsListRes.body.comments.length === 1 &&
        commentsListRes.body.comments[0].replies.length === 1,
      "GET /api/social/posts/:id/comments retrieves parent comment with nested replies"
    );

    // 9. Fetch Feed & Verify User Reaction
    const feedRes = await request("/api/social/feed?type=for_you");
    const found = feedRes.body.posts.find((p: any) => p.id === createdPostId);
    assert(
      feedRes.status === 200 && found && found.userReaction === "love" && found.hasLiked === true,
      "GET /api/social/feed returns newly created post with user reaction state"
    );

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error("Test error:", err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runSocialBatch1Tests();
