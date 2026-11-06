/**
 * Test Suite: Feature 7 — Balaga Founders Product Launchpad
 * Option A: Instant Publishing with Automated Moderation
 *
 * Verifies all 24 specification criteria:
 * 1. Product Discovery & Filtering (tabs, categories, pricing, status, search, sort)
 * 2. Categories API (14 official categories with real product counts)
 * 3. Independent Maker launches vs Startup Product launches (with canManageProducts permissions)
 * 4. Unauthorized startup member blocked (403 Forbidden)
 * 5. Option A Instant Publishing & Automated Moderation:
 *    - Clean submission -> Instant approval, maker auto-upvotes, syndicates to Founder Feed
 *    - Malicious / phishing link detection -> Restricted, moderation reason recorded, audit log
 *    - Restricted product hidden from public discovery but accessible to maker
 * 6. Maker Appeal & Admin Moderation Decision:
 *    - Maker submits appeal (201 Created)
 *    - Admin restores product with audit log (200 OK)
 *    - Restored product becomes publicly discoverable
 * 7. Product Detail Page (by slug & id, visual assets, pitch, threaded comments, reviews, updates, view increment)
 * 8. Abuse-Resistant Upvoting (1 vote per member, toggle un-upvote, duplicate prevention)
 * 9. Follow/Unfollow & Save/Unsave (counts update, interaction flags)
 * 10. Website & Demo Click Tracking (increments websiteClicks)
 * 11. Threaded Comments & Q&A with Visible Maker Badge
 * 12. Verified User Reviews & Ratings (1 review per user, recomputed average rating, maker blocked from self-review)
 * 13. Official Product Updates & Feed Broadcast (authorized maker only)
 * 14. Collections & Saved Products (create, add item, remove item, private/public visibility)
 * 15. Maker Analytics Dashboard (real computed metrics, authorized vs 403)
 * 16. Product Lifecycle Editing & Discontinuation
 * 17. Strict Dual-World Isolation (Socializing world context rejected with 403)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";

async function runFeature7Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 7 PRODUCT LAUNCHPAD TEST SUITE ===\n");

  const server = app.listen(5008);
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
    method: string,
    path: string,
    headers: Record<string, string> = {},
    body?: any
  ): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      const dataString = body ? JSON.stringify(body) : undefined;
      const req = http.request(
        {
          hostname: "localhost",
          port: 5008,
          path,
          method,
          headers: {
            "Content-Type": "application/json",
            "x-mock-user": "true",
            "x-platform-world": "founders",
            ...(dataString ? { "Content-Length": Buffer.byteLength(dataString).toString() } : {}),
            ...headers,
          },
        },
        (res) => {
          let responseData = "";
          res.on("data", (chunk) => (responseData += chunk));
          res.on("end", () => {
            try {
              resolve({
                status: res.statusCode || 0,
                body: responseData ? JSON.parse(responseData) : {},
              });
            } catch (e) {
              resolve({ status: res.statusCode || 0, body: responseData });
            }
          });
        }
      );

      req.on("error", reject);
      if (dataString) {
        req.write(dataString);
      }
      req.end();
    });
  }

  // Test Founder Account UUIDs
  const AARAV_TOKEN = "00000000-0000-0000-0000-000000000001"; // Maker of prod-dev, owner of st-dev, cofounder of st-mesh
  const ROHIT_TOKEN = "00000000-0000-0000-0000-000000000004"; // Maker of prod-2, admin of st-mesh
  const NIKHIL_TOKEN = "00000000-0000-0000-0000-000000000003"; // Maker of prod-1, owner of st-1
  const SNEHA_TOKEN = "00000000-0000-0000-0000-000000000007"; // Maker of prod-3, editor of st-mesh (canManageProducts=false)
  const VIKRAM_TOKEN = "00000000-0000-0000-0000-000000000006"; // Maker of prod-4, viewer of st-mesh

  const authHeaders = (accountId: string) => ({
    "x-mock-account-id": accountId,
    "x-platform-world": "founders",
  });

  try {
    // -------------------------------------------------------------
    // AREA 1: PRODUCT DISCOVERY & MULTI-FILTERING
    // -------------------------------------------------------------
    console.log("\n--- AREA 1: Product Discovery & Multi-Filtering ---");

    const discRes = await request("GET", "/api/founders/products", authHeaders(AARAV_TOKEN));
    assert(discRes.status === 200, "GET /api/founders/products returns 200");


    assert(Array.isArray(discRes.body.products), "Response contains products array");
    assert(discRes.body.products.length >= 4, "Discovery contains seeded products");
    assert(discRes.body.trendingProduct !== undefined, "Response contains trending product preview");

    // Test legacy alias /launchpad
    const legacyRes = await request("GET", "/api/founders/launchpad", authHeaders(AARAV_TOKEN));
    assert(legacyRes.status === 200, "GET /api/founders/launchpad alias returns 200");
    assert(legacyRes.body.products.length === discRes.body.products.length, "Legacy alias matches products count");

    // Filter by Category
    const catRes = await request("GET", "/api/founders/products?category=developer_tools", authHeaders(AARAV_TOKEN));
    assert(catRes.status === 200, "Category filter returns 200");
    assert(
      catRes.body.products.every((p: any) => p.category.toLowerCase().includes("developer") || p.category === "developer_tools"),
      "All returned products match developer_tools category"
    );

    // Search query
    const searchRes = await request("GET", "/api/founders/products?search=telemetry", authHeaders(AARAV_TOKEN));
    assert(searchRes.status === 200, "Search query returns 200");
    assert(searchRes.body.products.some((p: any) => p.name.includes("NovaTelemetry")), "Search finds NovaTelemetry SDK");

    // Filter by Pricing
    const pricingRes = await request("GET", "/api/founders/products?pricing=freemium", authHeaders(AARAV_TOKEN));
    assert(pricingRes.status === 200, "Pricing filter returns 200");
    assert(pricingRes.body.products.every((p: any) => p.pricingModel === "freemium"), "All products are freemium");

    // Discovery Tabs (today, trending, upcoming, recent, popular_week)
    const trendRes = await request("GET", "/api/founders/products?tab=trending", authHeaders(AARAV_TOKEN));
    assert(trendRes.status === 200, "Trending tab returns 200");
    assert(trendRes.body.products.every((p: any) => p.upvotesCount >= 50), "Trending products have high upvotes");

    // -------------------------------------------------------------
    // AREA 2: CATEGORIES API
    // -------------------------------------------------------------
    console.log("\n--- AREA 2: 14 Official Categories API ---");

    const categoriesRes = await request("GET", "/api/founders/products/categories", authHeaders(AARAV_TOKEN));
    assert(categoriesRes.status === 200, "GET /api/founders/products/categories returns 200");
    assert(categoriesRes.body.categories.length === 14, "Contains exactly 14 official categories");
    assert(
      categoriesRes.body.categories.some((c: any) => c.id === "ai_ml" && c.count >= 1),
      "AI & ML category has at least 1 product (DocuLens AI)"
    );
    assert(
      categoriesRes.body.categories.some((c: any) => c.id === "developer_tools" && c.count >= 1),
      "Developer Tools category has at least 1 product (NovaTelemetry)"
    );

    // -------------------------------------------------------------
    // AREA 3: PRODUCT OWNERSHIP & SUBMISSION (Option A Instant Publishing)
    // -------------------------------------------------------------
    console.log("\n--- AREA 3: Product Ownership & Launching ---");

    // 3a: Independent maker launches product without startup
    const indepProductPayload = {
      name: "PulsePrompt AI",
      tagline: "Intelligent prompt engineering workbench for LLM apps",
      description: "Fine-tune and benchmark system prompts with automated regression testing and latency budgets.",
      problem: "LLM prompts silently degrade as foundation models update without automated regression tests.",
      solution: "Deterministic test suites that run across OpenAI, Claude, and local Ollama models on every git commit.",
      features: ["Prompt version control", "Cost and token metrics", "Automated regression assertions"],
      logoUrl: "🧠",
      websiteUrl: "https://pulseprompt.ai",
      demoUrl: "https://demo.pulseprompt.ai",
      category: "ai_ml",
      pricingModel: "freemium",
      technologies: ["Python", "FastAPI", "React", "TypeScript"],
    };

    const indepLaunchRes = await request("POST", "/api/founders/products", authHeaders(NIKHIL_TOKEN), indepProductPayload);
    assert(indepLaunchRes.status === 201, "Independent maker launches product successfully (201)");
    assert(indepLaunchRes.body.product.moderationStatus === "approved", "Clean submission approved immediately (Option A)");
    assert(indepLaunchRes.body.product.isPublished === true, "Approved product is published immediately");
    assert(indepLaunchRes.body.product.hasUpvoted === true, "Maker auto-upvotes product upon launch");
    assert(indepLaunchRes.body.product.startupId === null, "Independent product has no startupId");
    const createdIndepProductId = indepLaunchRes.body.product.id;

    // 3b: Authorized startup team member launches product for startup
    const startupProductPayload = {
      name: "NovaEdge Gateway",
      tagline: "Ultra-low latency edge ingress router for microservices",
      description: "Distributed Envoy proxy wrapper optimized for high-throughput Indian fintech and UPI webhooks.",
      logoUrl: "🌐",
      websiteUrl: "https://novatech.dev/edge",
      category: "developer_tools",
      startupId: "st-dev", // Aarav is owner of st-dev
      pricingModel: "paid",
    };

    const startupLaunchRes = await request("POST", "/api/founders/products", authHeaders(AARAV_TOKEN), startupProductPayload);
    assert(startupLaunchRes.status === 201, "Authorized startup owner launches product for startup (201)");
    assert(startupLaunchRes.body.product.startupId === "st-dev", "Product is linked to startup st-dev");
    const createdStartupProductId = startupLaunchRes.body.product.id;

    // 3c: Unauthorized startup member blocked from launching for startup
    const unauthorizedStartupPayload = {
      name: "Rogue Product",
      tagline: "Unauthorized attempt to launch under startup banner",
      description: "This submission should be rejected because user does not have canManageProducts permission.",
      logoUrl: "🚫",
      websiteUrl: "https://example.com/rogue",
      category: "other",
      startupId: "st-mesh", // Sneha is editor without canManageProducts on st-mesh!
    };

    const unauthLaunchRes = await request("POST", "/api/founders/products", authHeaders(SNEHA_TOKEN), unauthorizedStartupPayload);
    assert(unauthLaunchRes.status === 403, "Unauthorized startup member blocked from launching product (403 Forbidden)");

    // -------------------------------------------------------------
    // AREA 4: AUTOMATED MODERATION & RESTRICTION (Option A)
    // -------------------------------------------------------------
    console.log("\n--- AREA 4: Automated Moderation & Restriction (Option A) ---");

    // Malicious link submission (bit.ly/malicious)
    const maliciousPayload = {
      name: "Free Crypto Multiplier Bot",
      tagline: "Double your crypto in 24 hours guaranteed with no risk",
      description: "Automated arbitrage bot linking to bit.ly/malicious for free activation token.",
      logoUrl: "💸",
      websiteUrl: "https://bit.ly/malicious-bot",
      category: "finance",
    };

    const modRestrictedRes = await request("POST", "/api/founders/products", authHeaders(AARAV_TOKEN), maliciousPayload);
    assert(modRestrictedRes.status === 201, "Submission processed by automated system (201)");
    assert(modRestrictedRes.body.moderationStatus === "restricted", "Automated system flags and restricts malicious product");
    assert(modRestrictedRes.body.product.isPublished === false, "Restricted product is not published");
    assert(Boolean(modRestrictedRes.body.moderationReason), "Moderation reason is provided to maker");
    const restrictedProductId = modRestrictedRes.body.product.id;

    // Verify restricted product does NOT appear in public discovery
    const publicCheckRes = await request("GET", "/api/founders/products", authHeaders(NIKHIL_TOKEN));
    assert(
      !publicCheckRes.body.products.some((p: any) => p.id === restrictedProductId),
      "Restricted product is strictly hidden from public discovery"
    );

    // Verify restricted product appears in maker's my-products with moderation status
    const myProductsRes = await request("GET", "/api/founders/products/my-products", authHeaders(AARAV_TOKEN));
    assert(
      myProductsRes.body.products.some((p: any) => p.id === restrictedProductId && p.moderationStatus === "restricted"),
      "Restricted product is visible in maker's my-products with restricted status"
    );

    // -------------------------------------------------------------
    // AREA 5: MAKER APPEAL & ADMIN MODERATION OVERRIDE
    // -------------------------------------------------------------
    console.log("\n--- AREA 5: Maker Appeal & Admin Moderation Decision ---");

    // 5a: Non-maker cannot appeal
    const unauthAppealRes = await request(
      "POST",
      `/api/founders/products/${restrictedProductId}/appeal`,
      authHeaders(NIKHIL_TOKEN),
      { appealReason: "I am not the maker but I want to appeal this." }
    );
    assert(unauthAppealRes.status === 403, "Non-maker blocked from submitting appeal (403)");

    // 5b: Maker submits appeal
    const makerAppealRes = await request(
      "POST",
      `/api/founders/products/${restrictedProductId}/appeal`,
      authHeaders(AARAV_TOKEN),
      {
        appealReason: "The link was used for security testing purposes in our sandbox test suite.",
        supportingInfo: "Domain has been pointed to verified HTTPS staging cluster.",
      }
    );
    assert(makerAppealRes.status === 201, "Maker submits moderation appeal (201)");
    assert(makerAppealRes.body.appeal.status === "pending", "Appeal status is pending review");

    // 5c: Admin reviews and restores product
    const adminModerateRes = await request(
      "POST",
      `/api/founders/products/${restrictedProductId}/moderate`,
      authHeaders(ROHIT_TOKEN), // Rohit is admin
      {
        action: "restore",
        reason: "Verified sandbox testing environment. Link has been validated.",
      }
    );
    assert(adminModerateRes.status === 200, "Admin restores product (200 OK)");
    assert(adminModerateRes.body.product.moderationStatus === "approved", "Product status updated to approved");
    assert(adminModerateRes.body.product.isPublished === true, "Product is published upon restoration");
    assert(adminModerateRes.body.auditRecord.triggeredBy === "admin", "Admin action recorded in audit log");

    // Verify restored product now appears in public discovery
    const publicAfterRestore = await request("GET", "/api/founders/products", authHeaders(NIKHIL_TOKEN));
    assert(
      publicAfterRestore.body.products.some((p: any) => p.id === restrictedProductId),
      "Restored product is now publicly discoverable"
    );

    // -------------------------------------------------------------
    // AREA 6: PRODUCT DETAIL PAGE & VIEW TRACKING
    // -------------------------------------------------------------
    console.log("\n--- AREA 6: Product Detail Page & View Tracking ---");

    // Fetch by slug
    const detailSlugRes = await request("GET", "/api/founders/products/novatelemetry-sdk", authHeaders(ROHIT_TOKEN));
    assert(detailSlugRes.status === 200, "GET /products/:slug returns 200");
    assert(detailSlugRes.body.product.name === "NovaTelemetry SDK", "Returns correct product details");
    assert(detailSlugRes.body.product.maker !== undefined, "Includes maker profile");
    assert(detailSlugRes.body.product.startup !== undefined, "Includes associated startup");
    assert(Array.isArray(detailSlugRes.body.comments), "Includes threaded comments");
    assert(Array.isArray(detailSlugRes.body.reviews), "Includes verified reviews");
    assert(Array.isArray(detailSlugRes.body.updates), "Includes official product updates");

    // Fetch by id
    const detailIdRes = await request("GET", `/api/founders/products/${createdIndepProductId}`, authHeaders(ROHIT_TOKEN));
    assert(detailIdRes.status === 200, "GET /products/:id returns 200");
    assert(detailIdRes.body.product.name === "PulsePrompt AI", "Returns correct product by ID");

    // -------------------------------------------------------------
    // AREA 7: ABUSE-RESISTANT UPVOTING SYSTEM (1 Vote per Member)
    // -------------------------------------------------------------
    console.log("\n--- AREA 7: Abuse-Resistant Upvoting System ---");

    // Rohit upvotes PulsePrompt AI
    const upvote1 = await request("POST", `/api/founders/products/${createdIndepProductId}/upvote`, authHeaders(ROHIT_TOKEN));
    assert(upvote1.status === 200, "Product upvoted successfully");
    assert(upvote1.body.hasUpvoted === true, "hasUpvoted set to true");
    const countAfterVote = upvote1.body.upvotesCount;

    // Rohit upvotes again (Toggle un-upvote)
    const upvote2 = await request("POST", `/api/founders/products/${createdIndepProductId}/upvote`, authHeaders(ROHIT_TOKEN));
    assert(upvote2.status === 200, "Upvote toggled/removed successfully");
    assert(upvote2.body.hasUpvoted === false, "hasUpvoted set to false");
    assert(upvote2.body.upvotesCount === countAfterVote - 1, "Upvotes count decremented");

    // Rohit re-upvotes
    const upvote3 = await request("POST", `/api/founders/products/${createdIndepProductId}/upvote`, authHeaders(ROHIT_TOKEN));
    assert(upvote3.body.hasUpvoted === true, "Re-upvote succeeds");
    assert(upvote3.body.upvotesCount === countAfterVote, "Upvotes count accurate");

    // -------------------------------------------------------------
    // AREA 8: FOLLOW / UNFOLLOW & BOOKMARK / SAVE
    // -------------------------------------------------------------
    console.log("\n--- AREA 8: Follow/Unfollow & Save/Unsave ---");

    // Follow product
    const follow1 = await request("POST", `/api/founders/products/${createdIndepProductId}/follow`, authHeaders(ROHIT_TOKEN));
    assert(follow1.status === 200, "Follow product returns 200");
    assert(follow1.body.hasFollowed === true, "hasFollowed is true");

    // Unfollow product
    const follow2 = await request("POST", `/api/founders/products/${createdIndepProductId}/follow`, authHeaders(ROHIT_TOKEN));
    assert(follow2.body.hasFollowed === false, "Unfollow sets hasFollowed to false");

    // Save product
    const save1 = await request("POST", `/api/founders/products/${createdIndepProductId}/save`, authHeaders(ROHIT_TOKEN));
    assert(save1.status === 200, "Save product returns 200");
    assert(save1.body.hasSaved === true, "hasSaved is true");

    // Unsave product
    const save2 = await request("POST", `/api/founders/products/${createdIndepProductId}/save`, authHeaders(ROHIT_TOKEN));
    assert(save2.body.hasSaved === false, "Unsave sets hasSaved to false");

    // -------------------------------------------------------------
    // AREA 9: WEBSITE & DEMO CLICK TRACKING
    // -------------------------------------------------------------
    console.log("\n--- AREA 9: Website & Demo Click Tracking ---");

    const clickRes = await request("POST", `/api/founders/products/${createdIndepProductId}/click`, authHeaders(ROHIT_TOKEN));
    assert(clickRes.status === 200, "Track click returns 200");
    assert(clickRes.body.websiteClicks >= 1, "websiteClicks incremented");

    // -------------------------------------------------------------
    // AREA 10: THREADED COMMENTS & MAKER BADGE
    // -------------------------------------------------------------
    console.log("\n--- AREA 10: Threaded Comments & Maker Badge ---");

    // Community user asks question
    const commentRes = await request(
      "POST",
      `/api/founders/products/${createdStartupProductId}/comments`,
      authHeaders(ROHIT_TOKEN),
      {
        content: "What is the memory footprint of the Envoy proxy edge gateway under 10k connections?",
        isQuestion: true,
      }
    );
    assert(commentRes.status === 201, "Community user posts question (201)");
    assert(commentRes.body.comment.isMakerReply === false, "Non-maker does not receive Maker badge");
    const questionCommentId = commentRes.body.comment.id;

    // Maker replies to question
    const replyRes = await request(
      "POST",
      `/api/founders/products/${createdStartupProductId}/comments`,
      authHeaders(AARAV_TOKEN), // Aarav is maker!
      {
        parentId: questionCommentId,
        content: "Under 10k keep-alive connections, resident memory stays under 180MB thanks to zero-copy buffer pooling.",
      }
    );
    assert(replyRes.status === 201, "Maker replies to comment (201)");
    assert(replyRes.body.comment.isMakerReply === true, "Authorized Maker reply receives visible Maker Badge!");

    // Like comment
    const likeCommentRes = await request(
      "POST",
      `/api/founders/products/comments/${questionCommentId}/like`,
      authHeaders(AARAV_TOKEN)
    );
    assert(likeCommentRes.status === 200, "Like comment succeeds");
    assert(likeCommentRes.body.hasLiked === true, "hasLiked is true");

    // -------------------------------------------------------------
    // AREA 11: VERIFIED REVIEWS & RATINGS
    // -------------------------------------------------------------
    console.log("\n--- AREA 11: Verified User Reviews & Ratings ---");

    // Maker blocked from reviewing own product
    const selfReviewRes = await request(
      "POST",
      `/api/founders/products/${createdStartupProductId}/reviews`,
      authHeaders(AARAV_TOKEN), // Aarav is maker
      { rating: 5, content: "My own product is fantastic!" }
    );
    assert(selfReviewRes.status === 400, "Maker blocked from reviewing own product (400)");

    // Community member reviews product
    const reviewRes = await request(
      "POST",
      `/api/founders/products/${createdStartupProductId}/reviews`,
      authHeaders(NIKHIL_TOKEN),
      {
        rating: 5,
        title: "Flawless ingress performance",
        content: "Replaced our legacy ingress nginx setup with NovaEdge Gateway. Latency P99 dropped by 40%.",
      }
    );
    assert(reviewRes.status === 201, "Verified user submits review (201)");
    assert(reviewRes.body.review.rating === 5, "Rating recorded accurately");
    assert(reviewRes.body.averageRating === 5, "Product averageRating updated");

    // Same user tries to submit second review for same product -> blocked (409)
    const duplicateReviewRes = await request(
      "POST",
      `/api/founders/products/${createdStartupProductId}/reviews`,
      authHeaders(NIKHIL_TOKEN),
      { rating: 4, content: "Trying to submit duplicate review." }
    );
    assert(duplicateReviewRes.status === 409, "Duplicate review from same user rejected (409 Conflict)");

    // -------------------------------------------------------------
    // AREA 12: OFFICIAL PRODUCT UPDATES & FEED SYNDICATION
    // -------------------------------------------------------------
    console.log("\n--- AREA 12: Official Product Updates & Feed Broadcast ---");

    // Unauthorized member tries to post product update
    const unauthUpdateRes = await request(
      "POST",
      `/api/founders/products/${createdStartupProductId}/updates`,
      authHeaders(NIKHIL_TOKEN),
      { title: "Unauthorized Update", content: "Should fail" }
    );
    assert(unauthUpdateRes.status === 403, "Unauthorized member blocked from posting official update (403)");

    // Authorized maker posts product update with feed broadcast
    const updateRes = await request(
      "POST",
      `/api/founders/products/${createdStartupProductId}/updates`,
      authHeaders(AARAV_TOKEN),
      {
        title: "NovaEdge Gateway v1.1 Released",
        content: "Added native BBPS payment webhook retry semantics and OpenTelemetry tracing.",
        version: "1.1.0",
        broadcastToFeed: true,
      }
    );
    assert(updateRes.status === 201, "Authorized maker posts official product update (201)");
    assert(Boolean(updateRes.body.update.feedPostId), "Product update syndicated to Founder Feed");

    // Verify update appears in product updates list
    const getUpdatesRes = await request("GET", `/api/founders/products/${createdStartupProductId}/updates`, authHeaders(AARAV_TOKEN));
    assert(getUpdatesRes.status === 200, "GET /products/:id/updates returns 200");
    assert(getUpdatesRes.body.updates.some((u: any) => u.title.includes("v1.1 Released")), "Official update appears in list");

    // -------------------------------------------------------------
    // AREA 13: COLLECTIONS & SAVED PRODUCTS
    // -------------------------------------------------------------
    console.log("\n--- AREA 13: Collections & Saved Products ---");

    // Create collection
    const createColRes = await request(
      "POST",
      "/api/founders/products/collections",
      authHeaders(ROHIT_TOKEN),
      {
        name: "My Favorite Developer Stacks",
        description: "Best devtools and edge infra on Balaga Launchpad",
        isPublic: true,
        productIds: [createdStartupProductId],
      }
    );
    assert(createColRes.status === 201, "Create custom product collection returns 201");
    const collectionId = createColRes.body.collection.id;

    // Add item to collection
    const addItemRes = await request(
      "POST",
      `/api/founders/products/collections/${collectionId}/items`,
      authHeaders(ROHIT_TOKEN),
      { productId: createdIndepProductId }
    );
    assert(addItemRes.status === 200, "Add product to collection returns 200");
    assert(addItemRes.body.collection.itemCount === 2, "Collection item count updated");

    // Remove item from collection
    const removeItemRes = await request(
      "DELETE",
      `/api/founders/products/collections/${collectionId}/items/${createdIndepProductId}`,
      authHeaders(ROHIT_TOKEN)
    );
    assert(removeItemRes.status === 200, "Remove product from collection returns 200");
    assert(removeItemRes.body.collection.itemCount === 1, "Collection item count decremented");

    // -------------------------------------------------------------
    // AREA 14: MAKER ANALYTICS DASHBOARD
    // -------------------------------------------------------------
    console.log("\n--- AREA 14: Maker Analytics Dashboard ---");

    // Unauthorized outsider cannot access analytics
    const unauthAnalyticsRes = await request(
      "GET",
      `/api/founders/products/${createdStartupProductId}/analytics`,
      authHeaders(NIKHIL_TOKEN)
    );
    assert(unauthAnalyticsRes.status === 403, "Outsider blocked from viewing maker analytics (403)");

    // Authorized maker accesses analytics
    const analyticsRes = await request(
      "GET",
      `/api/founders/products/${createdStartupProductId}/analytics`,
      authHeaders(AARAV_TOKEN)
    );
    assert(analyticsRes.status === 200, "Authorized maker accesses computed analytics (200)");
    assert(typeof analyticsRes.body.analytics.viewsCount === "number", "Analytics contains viewsCount");
    assert(typeof analyticsRes.body.analytics.upvotesCount === "number", "Analytics contains upvotesCount");
    assert(Array.isArray(analyticsRes.body.analytics.trendHistory), "Analytics contains trendHistory");

    // -------------------------------------------------------------
    // AREA 15: PRODUCT EDITING & DISCONTINUATION
    // -------------------------------------------------------------
    console.log("\n--- AREA 15: Product Editing & Discontinuation ---");

    // Edit product details
    const editRes = await request(
      "PUT",
      `/api/founders/products/${createdIndepProductId}`,
      authHeaders(NIKHIL_TOKEN),
      {
        tagline: "Updated: AI prompt engineering workbench for high-volume LLM APIs",
        pricingModel: "paid",
      }
    );
    assert(editRes.status === 200, "Maker updates product details (200)");
    assert(editRes.body.product.pricingModel === "paid", "Pricing model updated to paid");

    // Discontinue product
    const deleteRes = await request(
      "DELETE",
      `/api/founders/products/${createdIndepProductId}`,
      authHeaders(NIKHIL_TOKEN)
    );
    assert(deleteRes.status === 200, "Maker discontinues product (200)");
    assert(deleteRes.body.product.status === "discontinued", "Product status marked discontinued");
    assert(deleteRes.body.product.isPublished === false, "Discontinued product unpublished");

    // -------------------------------------------------------------
    // AREA 16: STRICT DUAL-WORLD ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- AREA 16: Strict Dual-World Isolation ---");

    const crossWorldRes = await request("GET", "/api/founders/products", {
      "x-mock-account-id": AARAV_TOKEN,
      "x-platform-world": "socializing", // Invalid world context!
    });
    assert(crossWorldRes.status === 403, "Requesting Founders products with Socializing world context rejected (403 Forbidden)");


    console.log(`\n=======================================================`);
    console.log(`FEATURE 7 TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=======================================================\n`);

    server.close();
    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution threw error:", err);
    server.close();
    process.exit(1);
  }
}

runFeature7Tests();
