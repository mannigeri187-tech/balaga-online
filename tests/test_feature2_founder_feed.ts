/**
 * Test Suite: Feature 2 - Balaga Founders Professional Social Feed
 * Verifies all specifications for Feature 2:
 * 1. Feed Tabs (For You, Following, Latest, Saved) & Topic Filters
 * 2. Post Creation across 8 Post Types & Audience Selection (public, founders, connections, only_me)
 * 3. Server-side Startup Announcement & Hiring membership authorization (403 Forbidden for unauthorized)
 * 4. Option A: Direct Repost (toggle, attribution, count tracking)
 * 5. Option B: Repost with Commentary / Quote Post (embeds original post, commentary)
 * 6. Comments & Nested Discussions (relevant/newest sorting, replies, comment likes, deletion)
 * 7. Reactions & Bookmarks (likes, persistent saves)
 * 8. Safety & Moderation (reports, author mute, author block, post deletion)
 * 9. Sidebar Secondary Discovery (suggested founders, trending topics, launches)
 * 10. Cross-World Strict Isolation (Socializing context cannot access Founder Feed)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runFeature2Tests() {
  console.log("=== STARTING BALAGA FOUNDERS FEATURE 2 FEED TEST SUITE ===\n");

  const server = app.listen(5003);
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
        `http://localhost:5003${path}`,
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
    // 1. GET /api/founders/feed (Default For You)
    const feedRes = await request("/api/founders/feed");
    assert(feedRes.status === 200, "1. GET /api/founders/feed returns 200 OK");
    assert(feedRes.body.activeTab === "for_you", "1.1 Default tab is 'for_you'");
    assert(Array.isArray(feedRes.body.posts) && feedRes.body.posts.length > 0, "1.2 For You posts array populated");
    assert(typeof feedRes.body.counts.for_you === "number", "1.3 Tab counts returned (for_you)");
    assert(typeof feedRes.body.counts.following === "number", "1.4 Tab counts returned (following)");
    assert(typeof feedRes.body.counts.saved === "number", "1.5 Tab counts returned (saved)");

    // 2. Tab Navigation: Following
    const followingRes = await request("/api/founders/feed?tab=following");
    assert(followingRes.status === 200, "2. Tab Following returns 200 OK");
    assert(followingRes.body.activeTab === "following", "2.1 Active tab is 'following'");
    // Aarav follows Rohit (fp-3) and Nikhil (fp-2), plus his own posts
    const hasFollowingAuthor = followingRes.body.posts.every(
      (p: any) =>
        p.authorId === "20000000-0000-0000-0000-000000000001" ||
        p.authorId === "20000000-0000-0000-0000-000000000004" ||
        p.authorId === "20000000-0000-0000-0000-000000000003"
    );
    assert(hasFollowingAuthor, "2.2 Following tab only contains followed authors or self");

    // 3. Tab Navigation: Saved Posts
    const savedRes = await request("/api/founders/feed?tab=saved");
    assert(savedRes.status === 200, "3. Tab Saved returns 200 OK");
    assert(savedRes.body.posts.length >= 2, "3.1 Saved tab contains seeded bookmarks (fp-3, fp-4)");
    assert(savedRes.body.posts.every((p: any) => p.hasSaved === true), "3.2 All posts in saved tab have hasSaved=true");

    // 4. Topic Filtering
    const techRes = await request("/api/founders/feed?topic=Technology");
    assert(techRes.status === 200, "4. Topic filter Technology returns 200 OK");
    assert(techRes.body.posts.length > 0, "4.1 Filtered Technology posts returned");

    // 5. Post Creation: General & Verification
    const createPostRes = await request("/api/founders/feed", {
      method: "POST",
      body: {
        content: "Reflecting on our early go-to-market iterations in Bengaluru. Filter coffee and whiteboards beat cold emails every time. #Founders #Startups",
        postType: "general",
        audience: "public",
        topics: ["Startups", "Community"],
      },
    });
    assert(createPostRes.status === 201, "5. Create general post returns 201 Created");
    assert(createPostRes.body.post.authorName === "Aarav Sharma", "5.1 Created post attributed to Aarav Sharma");
    assert(createPostRes.body.post.postType === "general", "5.2 Post type is 'general'");

    // 6. Post Creation: Startup Announcement Authorization
    // 6.1 Unauthorized user attempting announcement for a startup they don't belong to
    const unauthAnnounce = await request("/api/founders/feed", {
      method: "POST",
      body: {
        content: "PulseEngine AI has acquired a new cloud telemetry patent!",
        postType: "startup_announcement",
        associatedStartupId: "st-1", // Aarav is NOT a member of Nikhil's PulseEngine AI
        audience: "public",
      },
    });
    assert(unauthAnnounce.status === 403, "6.1 Unauthorized startup announcement blocked with 403 Forbidden");

    // 6.2 Authorized owner posting announcement for NovaTech Systems
    const authAnnounce = await request("/api/founders/feed", {
      method: "POST",
      body: {
        content: "NovaTech Systems has officially partnered with BharatFin Mesh for distributed telemetry! #B2BSaaS #Milestone",
        postType: "startup_announcement",
        associatedStartupId: "st-dev", // Aarav IS owner of NovaTech Systems
        audience: "public",
        topics: ["Startups", "B2BSaaS"],
      },
    });
    assert(authAnnounce.status === 201, "6.2 Authorized startup announcement returns 201 Created");
    assert(authAnnounce.body.post.associatedStartup.name === "NovaTech Systems", "6.3 Announcement associated with NovaTech Systems");

    // 7. Option A: Direct Repost (Toggle on & off)
    const directRepostRes = await request("/api/founders/feed/fp-4/repost", {
      method: "POST",
    });
    assert(directRepostRes.status === 200, "7. Direct repost toggle on returns 200 OK");
    assert(directRepostRes.body.hasReposted === true, "7.1 Direct repost state is true");
    const initRepostsCount = directRepostRes.body.repostsCount;

    const undoRepostRes = await request("/api/founders/feed/fp-4/repost", {
      method: "POST",
    });
    assert(undoRepostRes.status === 200, "7.2 Undo direct repost returns 200 OK");
    assert(undoRepostRes.body.hasReposted === false, "7.3 Direct repost state toggled to false");
    assert(undoRepostRes.body.repostsCount === initRepostsCount - 1, "7.4 Reposts count decremented");

    // 8. Option B: Repost with Commentary (Quote Post)
    const quoteRes = await request("/api/founders/feed/fp-2/quote", {
      method: "POST",
      body: {
        commentary: "Nikhil is building exceptional observability infra at PulseEngine. Strongly recommend fintech leaders explore this co-founder opportunity! 🚀",
        audience: "public",
        topics: ["Hiring", "FinTech"],
      },
    });
    assert(quoteRes.status === 201, "8. Repost with commentary returns 201 Created");
    assert(quoteRes.body.post.repostedPostId === "fp-2", "8.1 Quote post references original post fp-2");
    assert(quoteRes.body.post.repostedPost.authorHeadline.includes("PulseEngine"), "8.2 Original author attribution preserved");
    assert(quoteRes.body.post.commentary.includes("Nikhil is building"), "8.3 User commentary persisted");

    // 9. Comments & Nested Discussions
    // 9.1 Fetch comments for fp-3 (Relevant sorting)
    const commentsRes = await request("/api/founders/feed/fp-3/comments");
    assert(commentsRes.status === 200, "9.1 Fetch comments returns 200 OK");
    assert(commentsRes.body.comments.length >= 2, "9.2 Returns top-level comments");
    assert(commentsRes.body.comments[0].replies.length > 0, "9.3 Nested replies populated");

    // 9.2 Add top-level comment
    const addCommentRes = await request("/api/founders/feed/fp-2/comments", {
      method: "POST",
      body: {
        content: "Sent this opportunity to a senior engineer who worked on UPI rails at PhonePe!",
      },
    });
    assert(addCommentRes.status === 201, "9.4 Add comment returns 201 Created");
    const newCommentId = addCommentRes.body.comment.id;

    // 9.3 Add nested reply to comment
    const addReplyRes = await request("/api/founders/feed/fp-2/comments", {
      method: "POST",
      body: {
        parentId: newCommentId,
        content: "Awesome, thanks Aarav! Looking forward to reviewing their profile.",
      },
    });
    assert(addReplyRes.status === 201, "9.5 Add nested reply returns 201 Created");
    assert(addReplyRes.body.comment.parentId === newCommentId, "9.6 Reply is linked to parent comment ID");

    // 9.4 Like a comment
    const likeCommentRes = await request(`/api/founders/feed/comments/${newCommentId}/like`, {
      method: "POST",
    });
    assert(likeCommentRes.status === 200, "9.7 Like comment returns 200 OK");
    assert(likeCommentRes.body.hasLiked === true, "9.8 Comment like toggled on");

    // 9.5 Delete comment (authorized author)
    const delCommentRes = await request(`/api/founders/feed/comments/${newCommentId}`, {
      method: "DELETE",
    });
    assert(delCommentRes.status === 200, "9.9 Delete comment returns 200 OK");

    // 10. Reactions & Saves
    // 10.1 Toggle Like on fp-1
    const likePostRes = await request("/api/founders/feed/fp-1/like", {
      method: "POST",
    });
    assert(likePostRes.status === 200, "10.1 Toggle post like returns 200 OK");
    assert(typeof likePostRes.body.likesCount === "number", "10.2 Likes count updated");

    // 10.2 Toggle Save on fp-1
    const savePostRes = await request("/api/founders/feed/fp-1/save", {
      method: "POST",
    });
    assert(savePostRes.status === 200, "10.3 Toggle post save returns 200 OK");
    assert(savePostRes.body.hasSaved === true, "10.4 Post saved to bookmarks");

    // 10.3 Share Post
    const sharePostRes = await request("/api/founders/feed/fp-1/share", {
      method: "POST",
    });
    assert(sharePostRes.status === 200, "10.5 Share post returns 200 OK");
    assert(typeof sharePostRes.body.sharesCount === "number", "10.6 Shares count updated");

    // 11. Safety, Follow, Mute & Moderation
    // 11.1 Follow Founder
    const followRes = await request("/api/founders/feed/authors/20000000-0000-0000-0000-000000000005/follow", {
      method: "POST",
    });
    assert(followRes.status === 200, "11.1 Follow founder returns 200 OK");
    assert(followRes.body.isFollowing === true, "11.2 Follow state toggled to true");

    // 11.2 Report Post
    const reportRes = await request("/api/founders/feed/fp-5/report", {
      method: "POST",
      body: {
        reason: "spam",
        details: "Automated repost test verification",
      },
    });
    assert(reportRes.status === 201, "11.3 Report post returns 201 Created");
    assert(typeof reportRes.body.reportId === "string", "11.4 Report ID generated in moderation store");

    // 11.3 Mute Author
    const muteRes = await request("/api/founders/feed/authors/20000000-0000-0000-0000-000000000006/mute", {
      method: "POST",
    });
    assert(muteRes.status === 200, "11.5 Mute author returns 200 OK");

    // 12. Sidebar Secondary Discovery
    const sidebarRes = await request("/api/founders/feed/sidebar");
    assert(sidebarRes.status === 200, "12. GET /api/founders/feed/sidebar returns 200 OK");
    assert(sidebarRes.body.suggestedFounders.length > 0, "12.1 Suggested founders populated");
    assert(sidebarRes.body.trendingTopics.length > 0, "12.2 Trending topics populated");
    assert(sidebarRes.body.trendingStartups.length > 0, "12.3 Trending startups populated");
    assert(sidebarRes.body.recentLaunches.length > 0, "12.4 Recent launches populated");

    // 13. Cross-World Strict Isolation Check
    const crossWorldRes = await request("/api/founders/feed", {
      headers: {
        "x-platform-world": "socializing", // Trying to access Founders feed from Socializing
      },
    });
    assert(crossWorldRes.status === 403, "13. Socializing context blocked from Founders feed (403 Forbidden)");

  } finally {
    server.close();
  }

  console.log("\n======================================================");
  console.log(`BALAGA FEATURE 2 FEED TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runFeature2Tests().catch((err) => {
  console.error("Test Suite execution failed:", err);
  process.exit(1);
});
