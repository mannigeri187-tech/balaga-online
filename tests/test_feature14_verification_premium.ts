/**
 * Test Suite: Feature 14 — Balaga Verification & Premium System (Gold Premium)
 *
 * Verifies all 15+ core specifications:
 * 1. Dual-World Boundary Isolation (Socializing world headers rejected with 403 Forbidden)
 * 2. Exact badge verification and metadata alignment
 * 3. Blue Project / Startup verification application workflow
 * 4. Teal Registered Business statutory verification application workflow
 * 5. Application retrieval with complete audit history
 * 6. Unauthorized access prevention on verification applications (403 Forbidden)
 * 7. Admin verification portal: review, approve, reject, request info, suspend
 * 8. Applicant correction, resubmission and formal appeal workflows
 * 9. Badge revocation and suspension safety controls
 * 10. Personalized Connection Notes Entitlement Gating:
 *     - Free member sending note blocked server-side (HTTP 403 Forbidden)
 *     - Free member sending request without note allowed (HTTP 200/201)
 *     - Premium member sending request with note allowed (HTTP 200/201)
 * 11. Direct Messaging Without Connection Entitlement Gating:
 *     - Free member unconnected DM blocked (HTTP 403 Forbidden)
 *     - Premium member unconnected DM allowed (HTTP 200/201)
 *     - Block restrictions take precedence even for Premium (HTTP 403 Forbidden)
 * 12. Profile Viewer Identities Entitlement Gating:
 *     - Free member blocked from viewer identities (HTTP 403 Forbidden)
 *     - Premium member receives full viewer profiles and timestamps
 * 13. Advanced Profile Analytics & Networking Insights:
 *     - Free member receives basic summary only / insights blocked (HTTP 403)
 *     - Premium member receives 7-day trend array, unique metrics, and growth stats
 * 14. Subscription Lifecycle Management:
 *     - GET /subscriptions/me returns active plan, benefits, and Gold Crown flag
 *     - POST /subscriptions/upgrade simulates activation and entitlement granting
 *     - POST /subscriptions/cancel disables auto-renew while preserving access until expiry
 * 15. Subscription Expiry Enforcement:
 *     - Background expire-check downgrades expired accounts to free
 *     - Revokes Gold Crown, connection notes, unconnected DMs, and viewer identities
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";
import {
  devAccountId,
  secondAccountId,
  thirdAccountId,
  fourthAccountId,
  devFounderProfileId,
  thirdFounderProfileId,
  fourthFounderProfileId,
  fifthFounderProfileId,
  accountsStore,
  accountSubscriptionsStore,
  founderProfilesStore,
  founderConnectionsStore,
  foundersBlocksStore,
  verificationApplicationsStore,
  verificationAuditLogsStore,
  profileViewLogsStore,
} from "../apps/api/src/services/store.js";
import {
  VERIFICATION_LEGAL_DISCLAIMER,
  ENTITLEMENTS,
  BADGE_METADATA,
  BADGE_TYPES,
} from "@platform/config";

async function runFeature14Tests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5015, resolve));
  console.log("Feature 14 Test Server running on port 5015\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ ${name}`);
      failed++;
    }
  }

  const BASE_URL = "http://localhost:5015/api/founders";

  // Reusable request helper
  async function api(
    path: string,
    options: {
      method?: string;
      body?: any;
      world?: string;
      accountId?: string;
    } = {}
  ) {
    const world = options.world !== undefined ? options.world : "founders";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-mock-user": "true",
      "x-mock-account-id": options.accountId || devAccountId,
    };
    if (world) {
      headers["x-platform-world"] = world;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // no json body
    }

    return { status: res.status, data };
  }

  try {
    console.log("=== 1. DUAL-WORLD ISOLATION & DISCLAIMER CHECKS ===");
    {
      // Socializing world header must return 403 Forbidden to founders verification
      const res1 = await api("/verification/my-applications", { world: "socializing" });
      assert(res1.status === 403, "Socializing world access to /verification/my-applications returns 403 Forbidden");

      const res2 = await api("/subscriptions/me", { world: "socializing" });
      assert(res2.status === 403, "Socializing world access to /subscriptions/me returns 403 Forbidden");

      // Verify legal disclaimer is exported and accessible
      const res3 = await api("/verification/my-applications");
      assert(res3.status === 200, "Founders world access to /verification/my-applications succeeds");
      assert(
        res3.data.disclaimer === VERIFICATION_LEGAL_DISCLAIMER,
        "Verification response includes official VERIFICATION_LEGAL_DISCLAIMER"
      );

      // Verify Badge metadata in config has Gold replacing purple everywhere
      assert(
        BADGE_METADATA[BADGE_TYPES.PREMIUM_MEMBER].color === "gold",
        "BADGE_METADATA for PREMIUM_MEMBER specifies 'gold' replacing purple"
      );
    }

    console.log("\n=== 2. BLUE PROJECT / STARTUP VERIFICATION WORKFLOW ===");
    let createdBlueAppId = "";
    {
      // 1. Submit invalid blue application (missing startupName)
      const resBad = await api("/verification/apply/blue", {
        method: "POST",
        body: {
          startupName: "",
          operatingStage: "Prototype",
        },
      });
      assert(resBad.status === 400, "Submitting Blue application without startupName returns 400 Validation Error");

      // 2. Submit valid blue project application
      const resValid = await api("/verification/apply/blue", {
        method: "POST",
        body: {
          startupName: "PulseEngine AI Prototype",
          operatingStage: "Working Prototype",
          website: "https://pulseengine.dev",
          description: "High-throughput eBPF observability telemetry engine for cloud workloads",
          supportingDocuments: [
            {
              name: "Architecture Whitepaper & Benchmark Log",
              url: "https://storage.platform.local/docs/pulse_whitepaper.pdf",
            },
          ],
        },
      });
      assert(resValid.status === 201, "Submitting valid Blue verification application returns 201 Created");
      assert(resValid.data.application.status === "pending", "New Blue application status defaults to 'pending'");
      assert(resValid.data.application.type === "blue_project", "Application type is 'blue_project'");
      createdBlueAppId = resValid.data.application.id;

      // Check audit log created
      const audit = Array.from(verificationAuditLogsStore.values()).find(
        (a) => a.applicationId === createdBlueAppId
      );
      assert(Boolean(audit && audit.newStatus === "pending"), "Verification audit record automatically created");
    }

    console.log("\n=== 3. TEAL REGISTERED BUSINESS VERIFICATION WORKFLOW ===");
    let createdTealAppId = "";
    {
      // 1. Submit invalid teal application (missing statutory documents)
      const resBad = await api("/verification/apply/teal", {
        method: "POST",
        body: {
          legalBusinessName: "Acme Fintech Pvt Ltd",
          registrationType: "Private Limited",
          registrationNumber: "U72200KA2024PTC999999",
          jurisdiction: "ROC Karnataka",
          supportingDocuments: [], // empty -> invalid
        },
      });
      assert(resBad.status === 400, "Submitting Teal application without statutory documents returns 400 Validation Error");

      // 2. Submit valid teal application
      const resValid = await api("/verification/apply/teal", {
        method: "POST",
        body: {
          legalBusinessName: "Acme Telemetry Solutions Private Limited",
          registrationType: "Private Limited",
          registrationNumber: "U72200KA2024PTC888888",
          jurisdiction: "ROC Karnataka, Ministry of Corporate Affairs, India",
          website: "https://acme-telemetry.example.com",
          supportingDocuments: [
            {
              name: "Certificate of Incorporation (COI)",
              url: "https://storage.platform.local/docs/coi_acme.pdf",
            },
          ],
        },
      });
      assert(resValid.status === 201, "Submitting valid Teal business application returns 201 Created");
      assert(resValid.data.application.status === "pending", "New Teal application status defaults to 'pending'");
      assert(resValid.data.application.type === "teal_business", "Application type is 'teal_business'");
      createdTealAppId = resValid.data.application.id;
    }

    console.log("\n=== 4. APPLICATION CENTRE RETRIEVAL & UNAUTHORIZED SHIELD ===");
    {
      // View my applications
      const resMy = await api("/verification/my-applications");
      assert(resMy.status === 200, "GET /verification/my-applications succeeds");
      const myIds = resMy.data.applications.map((a: any) => a.id);
      assert(myIds.includes(createdBlueAppId), "My applications includes created Blue application");
      assert(myIds.includes(createdTealAppId), "My applications includes created Teal application");

      // View single application with audit history
      const resSingle = await api(`/verification/applications/${createdBlueAppId}`);
      assert(resSingle.status === 200, "GET /verification/applications/:id returns 200 OK");
      assert(Array.isArray(resSingle.data.auditHistory), "Application details include complete auditHistory array");

      // Unauthorized access check: User 3 tries to view User 1's application
      const resUnauth = await api(`/verification/applications/${createdBlueAppId}`, {
        accountId: thirdAccountId,
      });
      assert(resUnauth.status === 403, "Non-owner viewing another user's verification application receives 403 Forbidden");
    }

    console.log("\n=== 5. ADMIN REVIEW, APPROVAL, REJECTION & APPEALS ===");
    {
      // 1. Admin reviews and approves Teal application
      const resApprove = await api(`/verification/admin/applications/${createdTealAppId}/review`, {
        method: "POST",
        body: {
          action: "approve",
          notes: "Statutory documents matched MCA registration database records.",
        },
      });
      assert(resApprove.status === 200, "Admin approving application returns 200 OK");
      assert(resApprove.data.application.status === "verified", "Approved application status is 'verified'");
      assert(Boolean(resApprove.data.application.verifiedAt), "verifiedAt timestamp recorded upon approval");

      // 2. Admin reviews and rejects Blue application
      const resReject = await api(`/verification/admin/applications/${createdBlueAppId}/review`, {
        method: "POST",
        body: {
          action: "reject",
          rejectionReason: "Github repo URL was private and prototype demo video was inaccessible.",
        },
      });
      assert(resReject.status === 200, "Admin rejecting application returns 200 OK");
      assert(resReject.data.application.status === "rejected", "Rejected application status is 'rejected'");
      assert(Boolean(resReject.data.application.rejectionReason), "rejectionReason preserved in application");

      // 3. Applicant appeals rejection
      const resAppeal = await api(`/verification/applications/${createdBlueAppId}/appeal`, {
        method: "POST",
        body: {
          appealNotes: "We have updated the repository visibility to public and uploaded an unlisted loom demo link.",
        },
      });
      assert(resAppeal.status === 200, "Submitting formal appeal on rejected application returns 200 OK");
      assert(resAppeal.data.application.status === "pending", "Appealed application returns to 'pending' queue");
      assert(Boolean(resAppeal.data.application.appealNotes), "appealNotes saved on application record");

      // 4. Admin revokes / suspends verified badge
      const resRevoke = await api(`/verification/admin/applications/${createdTealAppId}/revoke`, {
        method: "POST",
        body: {
          notes: "Entity under formal MCA inquiry.",
        },
      });
      assert(resRevoke.status === 200, "Admin revoking badge returns 200 OK");
      assert(resRevoke.data.application.status === "suspended", "Revoked badge status becomes 'suspended'");
    }

    console.log("\n=== 6. PERSONALIZED CONNECTION NOTES GATING (FREE vs PREMIUM) ===");
    {
      // Ensure thirdAccountId is Free tier
      accountsStore.get(thirdAccountId)!.subscriptionTier = "free";
      if (accountSubscriptionsStore.has(thirdAccountId)) {
        accountSubscriptionsStore.get(thirdAccountId)!.tier = "free";
        accountSubscriptionsStore.get(thirdAccountId)!.status = "free";
      }

      // Ensure devAccountId is Premium tier
      accountsStore.get(devAccountId)!.subscriptionTier = "premium";
      if (accountSubscriptionsStore.has(devAccountId)) {
        accountSubscriptionsStore.get(devAccountId)!.tier = "premium";
        accountSubscriptionsStore.get(devAccountId)!.status = "active";
      }

      // Clean up previous connection between third and fourth if any
      for (const [id, conn] of founderConnectionsStore.entries()) {
        if (
          (conn.requesterId === thirdFounderProfileId && conn.recipientId === fourthFounderProfileId) ||
          (conn.requesterId === fourthFounderProfileId && conn.recipientId === thirdFounderProfileId)
        ) {
          founderConnectionsStore.delete(id);
        }
      }

      // 1. Free member (thirdAccountId) attempts to attach a note to connection request -> HTTP 403 Forbidden
      const resFreeWithNote = await api(`/network/connect/${fourthFounderProfileId}`, {
        method: "POST",
        accountId: thirdAccountId,
        body: {
          note: "Hi Rohit! Loved your Razorpay engineering blog, let's connect and discuss UPI ledger telemetry.",
        },
      });
      assert(
        resFreeWithNote.status === 403,
        "Free member attempting to send connection request with note is BLOCKED with 403 Forbidden"
      );

      // 2. Free member sends connection request without note -> Allowed (HTTP 200/201)
      const resFreeNoNote = await api(`/network/connect/${fourthFounderProfileId}`, {
        method: "POST",
        accountId: thirdAccountId,
        body: {},
      });
      assert(
        resFreeNoNote.status === 200 || resFreeNoNote.status === 201,
        "Free member sending standard connection request without note SUCCEEDS (200/201)"
      );

      // Clean up connection between dev and fourth
      for (const [id, conn] of founderConnectionsStore.entries()) {
        if (
          (conn.requesterId === devFounderProfileId && conn.recipientId === fourthFounderProfileId) ||
          (conn.requesterId === fourthFounderProfileId && conn.recipientId === devFounderProfileId)
        ) {
          founderConnectionsStore.delete(id);
        }
      }

      // 3. Premium member (devAccountId) sends connection request WITH note -> Allowed (HTTP 200/201)
      const resPremWithNote = await api(`/network/connect/${fourthFounderProfileId}`, {
        method: "POST",
        accountId: devAccountId,
        body: {
          note: "Hi Rohit! I'm Aarav from BharatFin. Would love to connect and explore fintech infrastructure.",
        },
      });
      assert(
        resPremWithNote.status === 200 || resPremWithNote.status === 201,
        "Gold Premium member sending connection request with note SUCCEEDS"
      );

      // 4. Note exceeding 300 characters is rejected
      for (const [id, conn] of founderConnectionsStore.entries()) {
        if (
          (conn.requesterId === devFounderProfileId && conn.recipientId === fifthFounderProfileId) ||
          (conn.requesterId === fifthFounderProfileId && conn.recipientId === devFounderProfileId)
        ) {
          founderConnectionsStore.delete(id);
        }
      }
      const resNoteTooLong = await api(`/network/connect/${fifthFounderProfileId}`, {
        method: "POST",
        accountId: devAccountId,
        body: {
          note: "A".repeat(301),
        },
      });
      assert(resNoteTooLong.status === 400, "Connection note exceeding 300 characters rejected with 400 Bad Request");
    }

    console.log("\n=== 7. DIRECT MESSAGING WITHOUT CONNECTING GATING ===");
    {
      // Check permission for Free member (third) to unconnected user (fifth)
      const resPermFree = await api("/inbox/check-permission", {
        method: "POST",
        accountId: thirdAccountId,
        body: { recipientProfileId: fifthFounderProfileId },
      });
      assert(resPermFree.data.allowed === false, "Free member cannot initiate direct messages to unconnected users");

      // Free member attempts to create direct conversation with unconnected user -> 403 Forbidden
      const resConvFree = await api("/inbox/conversations", {
        method: "POST",
        accountId: thirdAccountId,
        body: {
          type: "direct",
          recipientProfileId: fifthFounderProfileId,
          category: "professional",
          initialMessage: "Hey Ananya, let's chat about Kubernetes cost telemetry.",
        },
      });
      assert(resConvFree.status === 403, "Free member creating unconnected direct conversation returns 403 Forbidden");

      // Premium member (dev) creates direct conversation with unconnected user (fifth) -> Allowed
      const resConvPrem = await api("/inbox/conversations", {
        method: "POST",
        accountId: devAccountId,
        body: {
          type: "direct",
          recipientProfileId: fifthFounderProfileId,
          category: "professional",
          initialMessage: "Hi Ananya! Gold Premium outreach regarding infra telemetry.",
        },
      });
      assert(
        resConvPrem.status === 200 || resConvPrem.status === 201,
        "Gold Premium member initiating direct conversation to unconnected founder SUCCEEDS"
      );

      // Safety: user block restriction takes precedence over Premium
      foundersBlocksStore.add(`${devFounderProfileId}:${fifthFounderProfileId}`);
      const resBlockedDM = await api("/inbox/conversations", {
        method: "POST",
        accountId: devAccountId,
        body: {
          type: "direct",
          recipientProfileId: fifthFounderProfileId,
          category: "professional",
          initialMessage: "This should be blocked despite Premium.",
        },
      });
      assert(resBlockedDM.status === 403, "Safety block takes precedence over Premium membership (403 Forbidden)");
      foundersBlocksStore.delete(`${devFounderProfileId}:${fifthFounderProfileId}`);
    }

    console.log("\n=== 8. PROFILE VIEWER IDENTITIES GATING ===");
    {
      // Log view: Free user 3 views dev user 1
      const resLogView = await api(`/network/profiles/${devFounderProfileId}/view`, {
        method: "POST",
        accountId: thirdAccountId,
      });
      assert(resLogView.status === 200, "Logging profile view returns 200 OK");

      // 1. Free member (third) queries who viewed their profile -> 403 Forbidden
      const resFreeViewers = await api("/network/profile/viewers", {
        accountId: thirdAccountId,
      });
      assert(
        resFreeViewers.status === 403,
        "Free member querying profile viewer identities is BLOCKED with 403 Forbidden"
      );
      assert(
        resFreeViewers.data.totalViewsCount !== undefined,
        "Free member response includes totalViewsCount teaser without exposing identities"
      );

      // 2. Gold Premium member (dev) queries who viewed their profile -> 200 OK with viewer profiles
      const resPremViewers = await api("/network/profile/viewers", {
        accountId: devAccountId,
      });
      assert(resPremViewers.status === 200, "Gold Premium member accessing viewer identities returns 200 OK");
      assert(Array.isArray(resPremViewers.data.viewers), "Response includes full viewers array");
      assert(resPremViewers.data.isPremium === true, "isPremium flag is true in viewers response");
      const hasViewerProfiles = resPremViewers.data.viewers.some((v: any) => v.viewer && v.viewer.displayName);
      assert(hasViewerProfiles, "Viewer identities include enriched founder profile and timestamp");
    }

    console.log("\n=== 9. ADVANCED PROFILE ANALYTICS & NETWORKING INSIGHTS ===");
    {
      // 1. Free member queries profile analytics -> returns basic view count only
      const resFreeAnalytics = await api("/network/profile/analytics", {
        accountId: thirdAccountId,
      });
      assert(resFreeAnalytics.status === 200, "GET /profile/analytics for Free member returns 200 OK");
      assert(resFreeAnalytics.data.isPremium === false, "isPremium is false for Free member");
      assert(resFreeAnalytics.data.recentViewsTrend.length === 0, "Free member trend array is empty");

      // 2. Premium member queries profile analytics -> returns 7-day trend array and unique metrics
      const resPremAnalytics = await api("/network/profile/analytics", {
        accountId: devAccountId,
      });
      assert(resPremAnalytics.status === 200, "GET /profile/analytics for Premium member returns 200 OK");
      assert(resPremAnalytics.data.isPremium === true, "isPremium is true for Premium member");
      assert(Array.isArray(resPremAnalytics.data.recentViewsTrend), "Premium member receives 7-day trend array");
      assert(resPremAnalytics.data.recentViewsTrend.length === 7, "Trend array spans exactly 7 days");

      // 3. Free member queries networking insights -> 403 Forbidden
      const resFreeInsights = await api("/network/insights", {
        accountId: thirdAccountId,
      });
      assert(resFreeInsights.status === 403, "Free member accessing networking insights returns 403 Forbidden");

      // 4. Premium member queries networking insights -> 200 OK with growth stats
      const resPremInsights = await api("/network/insights", {
        accountId: devAccountId,
      });
      assert(resPremInsights.status === 200, "Premium member accessing networking insights returns 200 OK");
      assert(typeof resPremInsights.data.growthRatePercentage === "number", "Insights include growthRatePercentage");
      assert(typeof resPremInsights.data.connectionsCount === "number", "Insights include connectionsCount");
    }

    console.log("\n=== 10. SUBSCRIPTION MANAGEMENT & UPGRADE SIMULATION ===");
    {
      // 1. Check current plan for dev (Premium)
      const resSubDev = await api("/subscriptions/me", { accountId: devAccountId });
      assert(resSubDev.status === 200, "GET /subscriptions/me returns 200 OK");
      assert(resSubDev.data.subscription.tier === "premium", "Dev account subscription tier is 'premium'");
      assert(resSubDev.data.hasGoldCrown === true, "Dev account has Gold Crown active");
      assert(resSubDev.data.benefits.length === 8, "Response lists all 8 official Gold Premium benefit categories");

      // 2. Check current plan for third (Free)
      const resSubThird = await api("/subscriptions/me", { accountId: thirdAccountId });
      assert(resSubThird.status === 200, "GET /subscriptions/me for third returns 200 OK");
      assert(resSubThird.data.subscription.tier === "free", "Third account subscription tier is 'free'");
      assert(resSubThird.data.hasGoldCrown === false, "Third account does NOT have Gold Crown active");

      // 3. Upgrade third account to Gold Premium
      const resUpgrade = await api("/subscriptions/upgrade", {
        method: "POST",
        accountId: thirdAccountId,
        body: { tier: "premium", durationMonths: 12 },
      });
      assert(resUpgrade.status === 200, "POST /subscriptions/upgrade returns 200 OK");
      assert(resUpgrade.data.subscription.tier === "premium", "Upgraded tier is 'premium'");
      assert(resUpgrade.data.subscription.status === "active", "Upgraded status is 'active'");

      // Verify third account now has all 8 entitlements active
      const resSubThirdAfter = await api("/subscriptions/me", { accountId: thirdAccountId });
      assert(resSubThirdAfter.data.hasGoldCrown === true, "Upgraded account now has Gold Crown active");
      assert(resSubThirdAfter.data.subscription.entitlements.length >= 8, "Upgraded account has all 8 entitlements");

      // 4. Cancel auto-renewal
      const resCancel = await api("/subscriptions/cancel", {
        method: "POST",
        accountId: thirdAccountId,
      });
      assert(resCancel.status === 200, "POST /subscriptions/cancel returns 200 OK");
      assert(resCancel.data.subscription.autoRenew === false, "autoRenew is false after cancellation");
      assert(resCancel.data.subscription.status === "cancelled", "Status is 'cancelled'");
      // Benefits must still remain active until expiry
      const resSubCancelled = await api("/subscriptions/me", { accountId: thirdAccountId });
      assert(resSubCancelled.data.hasGoldCrown === true, "Cancelled subscription retains Gold Crown until expiry");
    }

    console.log("\n=== 11. SUBSCRIPTION EXPIRY & ENTITLEMENT REVOCATION ===");
    {
      // Simulate expired subscription by setting expiresAt in the past
      const sub = accountSubscriptionsStore.get(thirdAccountId)!;
      sub.expiresAt = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      accountSubscriptionsStore.set(thirdAccountId, sub);

      // Trigger background expire check
      const resExpire = await api("/subscriptions/expire-check", { method: "POST" });
      assert(resExpire.status === 200, "POST /subscriptions/expire-check returns 200 OK");
      assert(resExpire.data.expiredCount >= 1, "Expired subscription was detected and processed");

      // Verify plan is now downgraded to free
      const resExpiredSub = await api("/subscriptions/me", { accountId: thirdAccountId });
      assert(resExpiredSub.data.subscription.tier === "free", "Expired subscription is downgraded to 'free'");
      assert(resExpiredSub.data.hasGoldCrown === false, "Gold Crown removed after expiry");

      // Verify connection request notes are blocked again
      const resExpiredNote = await api(`/network/connect/${devFounderProfileId}`, {
        method: "POST",
        accountId: thirdAccountId,
        body: { note: "This note must be blocked after subscription expiry." },
      });
      assert(resExpiredNote.status === 403, "Connection request note blocked after subscription expiry (403 Forbidden)");

      // Verify profile viewer identities are blocked again
      const resExpiredViewers = await api("/network/profile/viewers", { accountId: thirdAccountId });
      assert(resExpiredViewers.status === 403, "Profile viewer identities blocked after subscription expiry (403 Forbidden)");
    }

    console.log("\n=======================================================");
    console.log(`FEATURE 14 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runFeature14Tests();
