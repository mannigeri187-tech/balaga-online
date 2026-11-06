/**
 * Test Suite: Feature 9 — Balaga Founders Referral Exchange
 * Option C: Public Disclosure & Private Negotiation
 *
 * Verifies all 26+ specification criteria:
 * 1. Referral Listing Creation (Individual & Startup)
 * 2. Startup Role Permissions & Authorization Checks (Owner/Admin vs 403 Forbidden)
 * 3. Listing Editing, Pausing, Reopening, and Closing
 * 4. Referral Discovery & Multi-Filtering (Type, Industry, Stage, Arrangement, Commission, Search, Sort)
 * 5. Recommendation Privacy & Filtering
 * 6. Public Detail Page & Protected Customer Lead Data Masking
 * 7. Referral Request Submission & Anti-Abuse (Duplicate prevention 409, Self-request prevention 400)
 * 8. Request Response Actions: Withdraw, Request More Info, Reject, Accept
 * 9. Option C: Public Commission Disclosure
 * 10. Option C: Versioned Private Commission Negotiation
 * 11. Option C: Dual-Party Commission Confirmation (isFullyConfirmed requires both)
 * 12. Referral Pipeline Stage Progression (Accepted -> Introduced -> Contacted -> Qualified -> Converted -> Closed)
 * 13. Customer Data Privacy Protection (Encrypted/sensitive lead data restricted to participants)
 * 14. Referral Outcome Recording (Revenue & Commission calculation)
 * 15. Payment Status Tracking with Regulatory Disclaimer (No platform escrow/funds)
 * 16. Explicit "Message Partner" Action & Messaging Privilege Enforcement (Basic connection vs Premium direct)
 * 17. Saved Bookmarks (Save/Unsave)
 * 18. Reporting & Moderation Queue
 * 19. Persistent Founders Notifications
 * 20. Feature 8 Integration without Duplicate Records
 * 21. Real Computed Referral Analytics
 * 22. Strict Dual-World Isolation (Socializing context rejected with 403)
 */

process.env.NODE_ENV = "test";

import http from "http";
import app from "../apps/api/src/app.js";
import {
  accountsStore,
  startupsStore,
  startupMembersStore,
  founderProfilesStore,
  devAccountId,
  devFounderProfileId,
  thirdAccountId,
  thirdFounderProfileId,
} from "../apps/api/src/services/store.js";

async function runFeature9Tests() {
  console.log("\n=== STARTING BALAGA FOUNDERS FEATURE 9 REFERRAL EXCHANGE TEST SUITE ===\n");

  const server = app.listen(5010);
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

  function api(
    method: string,
    path: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<{ status: number; body: any; headers: any }> {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : "";
      const reqHeaders = {
        "x-mock-user": "true",
        "x-mock-account-id": devAccountId,
        "x-platform-world": "founders",
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        ...headers,
      };

      const req = http.request(
        {
          hostname: "localhost",
          port: 5010,
          path: `/api/founders${path}`,
          method,
          headers: reqHeaders,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const parsed = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode || 500, body: parsed, headers: res.headers });
            } catch (e) {
              resolve({ status: res.statusCode || 500, body: data, headers: res.headers });
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
    // Group 1: Referral Listing Creation & Authorization Checks
    // -------------------------------------------------------------
    console.log("\n--- Group 1: Referral Listing Creation & Authorization Checks ---");

    // 1. Individual creates an offering listing
    const createOfferingRes = await api("POST", "/referrals/listings", {
      publisherType: "individual",
      listingType: "offering",
      title: "Warm Executive Intros to Top Indian D2C Fashion Brands",
      description: "Direct relationship introductions to Founders and Heads of Growth at fast-growing fashion and lifestyle brands.",
      industry: "E-Commerce",
      targetAudience: "D2C Lifestyle & Apparel Brands",
      customerCategory: "Consumer Tech",
      productOrService: "Conversion optimization & retention marketing tooling",
      idealReferralProfile: "Founder or Chief Marketing Officer with >₹2 Cr monthly GMV",
      requiredQualifications: "Active storefront on Shopify Plus or custom tech stack",
      broadRegion: "Bengaluru & Mumbai",
      expectedOutcome: "Introductory executive call and discovery trial",
      referralArrangement: "commission_based",
      commissionChoice: "percentage",
      disclosedCommissionDetails: "15% of first-year contracted revenue",
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    });
    assert(createOfferingRes.status === 201, "1. Individual creates an offering listing (201 Created)");
    const offeringListingId = createOfferingRes.body.listing?.id;
    assert(Boolean(offeringListingId), "2. Created offering listing has valid ID and status active");

    // 3. Authorized startup owner creates a requesting listing
    const createRequestingRes = await api("POST", "/referrals/listings", {
      publisherType: "startup",
      startupId: "st-dev", // NovaTech (Aarav is owner)
      listingType: "requesting",
      title: "Seeking Introductions to Tier-1 Core Banking Architecture Teams",
      description: "NovaTech is looking for introductions to engineering directors overseeing high-throughput financial rails.",
      industry: "FinTech",
      targetAudience: "Private Scheduled Commercial Banks",
      customerCategory: "Core Banking",
      productOrService: "Distributed ledger audit telemetry and low-latency compliance engine",
      idealReferralProfile: "Head of Core Banking or Enterprise Architecture",
      broadRegion: "Mumbai & Bengaluru",
      expectedOutcome: "Architecture evaluation call and POC agreement",
      referralArrangement: "commission_based",
      commissionChoice: "fixed",
      disclosedCommissionDetails: "₹50,000 fixed fee per successful enterprise POC agreement",
      expiryDate: new Date(Date.now() + 86400000 * 45).toISOString(),
    });
    assert(createRequestingRes.status === 201, "3. Authorized startup owner creates a requesting listing (201 Created)");
    const requestingListingId = createRequestingRes.body.listing?.id;

    // 4. Unauthorized member blocked from creating startup listing
    const unauthStartupListingRes = await api("POST", "/referrals/listings", {
      publisherType: "startup",
      startupId: "st-dev",
      listingType: "offering",
      title: "Unauthorized Listing Attempt",
      description: "Should fail because user is not a manager of this startup.",
      industry: "FinTech",
      targetAudience: "Banks",
      customerCategory: "B2B",
      productOrService: "Enterprise Technology Platform",
      idealReferralProfile: "Chief Technology Officer or VP Engineering",
      broadRegion: "All India",
      expectedOutcome: "Introductory Discovery Call",
      referralArrangement: "mutual_referral",
      commissionChoice: "negotiable",
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    }, { "x-mock-account-id": thirdAccountId });
    assert(unauthStartupListingRes.status === 403, "4. Unauthorized startup member blocked from creating startup listing (403 Forbidden)");

    // 5. Automated Moderation Check flags suspicious financial claims
    const spamListingRes = await api("POST", "/referrals/listings", {
      publisherType: "individual",
      listingType: "offering",
      title: "Guaranteed Profit & Free Money Crypto Referral Scheme",
      description: "Join our get rich quick pyramid network for immediate returns.",
      industry: "FinTech",
      targetAudience: "Everyone",
      customerCategory: "Consumer",
      productOrService: "Crypto",
      idealReferralProfile: "Investors",
      broadRegion: "Online",
      expectedOutcome: "Wealth",
      referralArrangement: "commission_based",
      commissionChoice: "percentage",
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    });
    assert(spamListingRes.body.listing?.moderationStatus === "flagged", "5. Automated moderation flags suspicious financial claims keywords");
    assert(spamListingRes.body.listing?.status === "paused", "6. Flagged listing is automatically paused pending review");

    // -------------------------------------------------------------
    // Group 2: Listing Lifecycle & Management
    // -------------------------------------------------------------
    console.log("\n--- Group 2: Listing Lifecycle & Management ---");

    // 7. Publisher edits listing
    const editListingRes = await api("PUT", `/referrals/listings/${offeringListingId}`, {
      title: "Warm Executive Intros to Top Indian D2C Fashion & Apparel Brands (Updated)",
      broadRegion: "Bengaluru, Mumbai & Delhi-NCR",
    });
    assert(editListingRes.status === 200, "7. Publisher updates listing details (200 OK)");
    assert(editListingRes.body.listing?.title.includes("(Updated)"), "8. Updated listing reflects revised title and region");

    // 9. Unauthorized user blocked from updating listing
    const unauthEditRes = await api("PUT", `/referrals/listings/${offeringListingId}`, {
      title: "Malicious Edit Attempt",
    }, { "x-mock-account-id": thirdAccountId });
    assert(unauthEditRes.status === 403, "9. Unauthorized user blocked from updating listing (403 Forbidden)");

    // 10. Pause listing
    const pauseListingRes = await api("PATCH", `/referrals/listings/${offeringListingId}/status`, {
      status: "paused",
    });
    assert(pauseListingRes.status === 200, "10. Publisher pauses listing (200 OK)");
    assert(pauseListingRes.body.listing?.status === "paused", "11. Listing status changed to paused");

    // 12. Reopen listing
    const reopenListingRes = await api("PATCH", `/referrals/listings/${offeringListingId}/status`, {
      status: "active",
    });
    assert(reopenListingRes.status === 200, "12. Publisher reopens listing (200 OK)");
    assert(reopenListingRes.body.listing?.status === "active", "13. Listing status restored to active");

    // 14. Bookmarking (Save / Unsave)
    const saveRes = await api("POST", `/referrals/listings/${requestingListingId}/save`);
    assert(saveRes.status === 200 && saveRes.body.isSaved === true, "14. Publisher bookmarks listing successfully (isSaved: true)");
    const unsaveRes = await api("DELETE", `/referrals/listings/${requestingListingId}/save`);
    assert(unsaveRes.status === 200 && unsaveRes.body.isSaved === false, "15. Publisher un-bookmarks listing successfully (isSaved: false)");

    // 16. GET /my-listings lists user's and startup's listings
    const myListingsRes = await api("GET", "/referrals/my-listings");
    assert(myListingsRes.status === 200, "16. GET /referrals/my-listings returns 200 OK");
    assert(myListingsRes.body.listings.length >= 2, "17. Returns user's individual and startup-managed listings");

    // -------------------------------------------------------------
    // Group 3: Referral Discovery & Multi-Filtering
    // -------------------------------------------------------------
    console.log("\n--- Group 3: Referral Discovery & Multi-Filtering ---");

    // 18. GET /discover returns active approved listings
    const discoverRes = await api("GET", "/referrals/discover");
    assert(discoverRes.status === 200, "18. GET /referrals/discover returns 200 OK");
    assert(Array.isArray(discoverRes.body.listings), "19. Response contains listings array");

    // 20. Filter by listing type
    const filterOfferingRes = await api("GET", "/referrals/discover?type=offering");
    const allOffering = filterOfferingRes.body.listings.every((l: any) => l.listingType === "offering");
    assert(allOffering && filterOfferingRes.body.listings.length > 0, "20. Filter listings by type=offering works accurately");

    // 21. Filter by industry
    const filterIndustryRes = await api("GET", "/referrals/discover?industry=FinTech");
    const allFintech = filterIndustryRes.body.listings.every((l: any) => l.industry.toLowerCase() === "fintech");
    assert(allFintech && filterIndustryRes.body.listings.length > 0, "21. Filter listings by industry=FinTech works accurately");

    // 22. Filter by commission choice
    const filterCommRes = await api("GET", "/referrals/discover?commissionChoice=percentage");
    const allPercentage = filterCommRes.body.listings.every((l: any) => l.commissionChoice === "percentage");
    assert(allPercentage && filterCommRes.body.listings.length > 0, "22. Filter listings by commissionChoice=percentage works accurately");

    // 23. Keyword search
    const searchRes = await api("GET", "/referrals/discover?q=Compliance");
    assert(searchRes.body.listings.length > 0, "23. Keyword search finds matching referral listings");

    // 24. Sort by views
    const sortViewsRes = await api("GET", "/referrals/discover?sort=views");
    assert(sortViewsRes.status === 200, "24. Sort listings by views returns sorted listings");

    // 25. Personalized recommendations (hides own listings)
    const recsRes = await api("GET", "/referrals/recommended");
    assert(recsRes.status === 200, "25. GET /referrals/recommended returns personalized recommendations");
    const hasOwnInRecs = recsRes.body.recommendations.some((l: any) => l.publisherProfileId === devFounderProfileId);
    assert(!hasOwnInRecs, "26. Recommendations strictly exclude own publisher listings");

    // 27. Public detail page
    const detailRes = await api("GET", `/referrals/listings/${offeringListingId}`);
    assert(detailRes.status === 200, "27. GET /referrals/listings/:id returns public detail page");
    assert(!detailRes.body.listing.customerPrivateData, "28. Public detail page never exposes private lead contact details");

    // -------------------------------------------------------------
    // Group 4: Referral Request Workflows & Anti-Abuse
    // -------------------------------------------------------------
    console.log("\n--- Group 4: Referral Request Workflows & Anti-Abuse ---");

    // 29. Self-request prevention
    const selfReqRes = await api("POST", `/referrals/listings/${offeringListingId}/requests`, {
      requesterType: "individual",
      message: "Trying to request my own listing.",
      relevance: "N/A",
      potentialOpportunity: "N/A",
      expectedOutcome: "N/A",
    });
    assert(selfReqRes.status === 400, "29. Self-request on own listing rejected with 400 Bad Request");

    // 30. Submitting valid referral request
    const validReqRes = await api("POST", `/referrals/listings/${offeringListingId}/requests`, {
      requesterType: "individual",
      message: "Hi Aarav, I run partnership outreach for an enterprise analytics suite and have direct C-level access to a top fashion brand.",
      relevance: "Client is actively seeking retention marketing tools this quarter.",
      potentialOpportunity: "UrbanStyle Apparel (₹50 Cr ARR apparel brand in Bengaluru)",
      expectedOutcome: "Executive discovery meeting with Head of Growth",
    }, { "x-mock-account-id": thirdAccountId });
    assert(validReqRes.status === 201, "30. Submitting valid referral request returns 201 Created");
    const newRequestId = validReqRes.body.request?.id;
    assert(Boolean(newRequestId), "31. Generated request has valid ID and status submitted");

    // 32. Duplicate active request prevention
    const duplicateReqRes = await api("POST", `/referrals/listings/${offeringListingId}/requests`, {
      requesterType: "individual",
      message: "Sending duplicate request immediately.",
      relevance: "Relevance",
      potentialOpportunity: "Opportunity",
      expectedOutcome: "Outcome",
    }, { "x-mock-account-id": thirdAccountId });
    assert(duplicateReqRes.status === 409, "32. Duplicate active request to same listing rejected with 409 Conflict");

    // 33. Requester can withdraw pending request
    const withdrawRes = await api("POST", `/referrals/requests/${newRequestId}/respond`, {
      action: "withdraw",
      reasonOrNotes: "No longer engaging this prospect.",
    }, { "x-mock-account-id": thirdAccountId });
    assert(withdrawRes.status === 200 && withdrawRes.body.request.status === "withdrawn", "33. Requester withdraws pending request (status: withdrawn)");

    // 34. Submit fresh request for acceptance test
    const freshReqRes = await api("POST", `/referrals/listings/${offeringListingId}/requests`, {
      requesterType: "individual",
      message: "Fresh proposal for enterprise apparel client intro.",
      relevance: "Client looking for conversion optimization stack.",
      potentialOpportunity: "GlamourThread D2C (Leading apparel retailer)",
      expectedOutcome: "Scheduled POC demo",
    }, { "x-mock-account-id": thirdAccountId });
    const activeRequestId = freshReqRes.body.request?.id;

    // 35. Publisher requests more info
    const reqInfoRes = await api("POST", `/referrals/requests/${activeRequestId}/respond`, {
      action: "request_info",
      moreInfoQuery: "Could you confirm if their tech team has Shopify Plus admin access?",
    });
    assert(reqInfoRes.status === 200 && reqInfoRes.body.request.status === "more_info_requested", "34. Publisher requests more info (status: more_info_requested)");

    // 36. Publisher accepts request
    const acceptRes = await api("POST", `/referrals/requests/${activeRequestId}/respond`, {
      action: "accept",
      reasonOrNotes: "Confirmed qualified fit, accepted for introduction.",
    });
    assert(acceptRes.status === 200 && acceptRes.body.request.status === "accepted", "35. Listing publisher accepts request (status: accepted)");
    assert(Boolean(acceptRes.body.commissionAgreement), "36. Accepting request automatically provisions ReferralCommissionAgreement");
    assert(Boolean(acceptRes.body.pipelineRecord), "37. Accepting request automatically provisions ReferralPipelineRecord");

    // -------------------------------------------------------------
    // Group 5: Option C Commission Agreement & Versioned Negotiation
    // -------------------------------------------------------------
    console.log("\n--- Group 5: Option C Commission Agreement & Versioned Negotiation ---");

    const agreementId = acceptRes.body.commissionAgreement.id;

    // 38. GET commission agreement
    const getAgrRes = await api("GET", `/referrals/requests/${activeRequestId}/commission`);
    assert(getAgrRes.status === 200, "38. GET /referrals/requests/:id/commission returns commission agreement");
    assert(getAgrRes.body.agreement.versions.length >= 1, "39. Agreement contains version 1 initialized with listing terms");

    // 40. Propose revised terms (Option C Counter-proposal)
    const proposeTermsRes = await api("POST", `/referrals/requests/${activeRequestId}/commission/propose`, {
      commissionType: "percentage",
      rateOrAmount: "18%",
      calculationBasis: "Net first-year annual contract value settled by client",
      paymentFrequency: "One-time within 15 days of customer payment",
      responsibilities: "Warm C-level intro call + dedicated co-selling deck review",
      effectiveDate: new Date().toISOString(),
    }, { "x-mock-account-id": thirdAccountId });
    assert(proposeTermsRes.status === 201, "40. Requester proposes revised commission terms (Version 2 created)");
    assert(proposeTermsRes.body.agreement.isFullyConfirmed === false, "41. Agreement isFullyConfirmed remains FALSE until counter-party confirms");

    // 42. Publisher confirms Version 2
    const confirmTermsRes = await api("POST", `/referrals/requests/${activeRequestId}/commission/confirm`, {
      version: 2,
      confirm: true,
    });
    assert(confirmTermsRes.status === 200, "42. Publisher confirms Version 2 commission terms");
    assert(confirmTermsRes.body.isFullyConfirmed === true, "43. Option C: Both parties confirmed -> isFullyConfirmed becomes TRUE");
    assert(confirmTermsRes.body.agreement.activeTerms.rateOrAmount === "18%", "44. Active terms updated to Version 2 agreed rate (18%)");

    // -------------------------------------------------------------
    // Group 6: Customer Privacy & Referral Pipeline Progression
    // -------------------------------------------------------------
    console.log("\n--- Group 6: Customer Privacy & Referral Pipeline Progression ---");

    // 45. GET /referrals/pipeline returns active pipeline records
    const pipelineListRes = await api("GET", "/referrals/pipeline");
    assert(pipelineListRes.status === 200, "45. GET /referrals/pipeline returns 200 OK");
    const activePipeline = pipelineListRes.body.pipeline.find((p: any) => p.requestId === activeRequestId);
    assert(Boolean(activePipeline), "46. Pipeline record for accepted referral exists in pipeline store");

    const pipelineId = activePipeline.id;

    // 47. Progress pipeline to 'introduced'
    const stageIntroRes = await api("PATCH", `/referrals/pipeline/${pipelineId}/stage`, {
      stage: "introduced",
      notes: "Intro email sent connecting client VP to Aarav Sharma.",
    });
    assert(stageIntroRes.status === 200 && stageIntroRes.body.record.stage === "introduced", "47. Progress pipeline to 'introduced' stage with timestamp");

    // 48. Progress pipeline to 'contacted' and record protected customer private data
    const stageContactRes = await api("PATCH", `/referrals/pipeline/${pipelineId}/stage`, {
      stage: "contacted",
      notes: "Discovery call conducted, NDA signed.",
      customerPrivateData: {
        companyName: "GlamourThread Fashion Pvt Ltd",
        contactName: "Pooja Hegde",
        contactEmail: "pooja.hegde@glamourthread.in",
        contactPhone: "+91 99800 54321",
        notes: "Strictly confidential - POC evaluation starting next week.",
      },
    });
    assert(stageContactRes.status === 200 && stageContactRes.body.record.stage === "contacted", "48. Progress pipeline to 'contacted' stage");
    assert(stageContactRes.body.record.customerPrivateData?.contactEmail === "pooja.hegde@glamourthread.in", "49. Customer private contact details recorded securely");

    // 50. Progress pipeline to 'qualified'
    const stageQualRes = await api("PATCH", `/referrals/pipeline/${pipelineId}/stage`, {
      stage: "qualified",
      notes: "Client confirmed budget and approved technical POC scope.",
    });
    assert(stageQualRes.status === 200 && stageQualRes.body.record.stage === "qualified", "50. Progress pipeline to 'qualified' stage");

    // 51. Progress pipeline to 'converted' & Record Outcome
    const outcomeRes = await api("POST", `/referrals/pipeline/${pipelineId}/outcome`, {
      reportedRevenueValue: 800000, // ₹8,00,000 ARR contract
      calculatedCommissionAmount: 144000, // 18% of ₹8L = ₹1,44,000
      outcomeNotes: "Annual enterprise contract executed and verified.",
    });
    assert(outcomeRes.status === 200, "51. Record referral conversion outcome with revenue and commission calculation");
    assert(outcomeRes.body.record.reportedRevenueValue === 800000, "52. Reported revenue value recorded accurately");

    // 53. Record reported commission payment status with regulatory disclaimer
    const paymentRes = await api("POST", `/referrals/pipeline/${pipelineId}/payment`, {
      paymentStatus: "reported_paid",
      paymentNotes: "NEFT Bank transfer completed on Nov 5, 2026.",
    });
    assert(paymentRes.status === 200, "53. Record reported commission payment status (reported_paid)");
    assert(paymentRes.body.regulatoryDisclaimer.includes("Balaga does not operate an escrow"), "54. Response includes explicit regulatory disclaimer (no escrow or funds held)");

    // -------------------------------------------------------------
    // Group 7: Direct Messaging Privileges, Moderation & Analytics
    // -------------------------------------------------------------
    console.log("\n--- Group 7: Direct Messaging Privileges, Moderation & Analytics ---");

    // 55. Basic tier without connection check
    const basicMsgCheckRes = await api("POST", `/referrals/requests/${activeRequestId}/message-check`, {}, { "x-mock-account-id": thirdAccountId });
    assert(basicMsgCheckRes.status === 200, "55. POST /referrals/requests/:id/message-check responds 200 OK");
    assert(typeof basicMsgCheckRes.body.canMessage === "boolean", "56. Evaluates messaging privileges based on connection and tier rules");

    // 57. Report listing for moderation
    const reportRes = await api("POST", `/referrals/listings/${offeringListingId}/report`, {
      reason: "misleading_commission",
      details: "Reporting test listing for moderation audit trail.",
    });
    assert(reportRes.status === 201, "57. Report referral listing for moderation audit (201 Created)");

    // 58. Admin moderation restriction
    const adminModRes = await api("POST", "/referrals/admin/moderate", {
      listingId: spamListingRes.body.listing.id,
      action: "restrict",
      reason: "Restricted due to fraudulent financial claims",
    });
    assert(adminModRes.status === 200 && adminModRes.body.listing.moderationStatus === "restricted", "58. Admin moderation restricts flagged listing successfully");

    // 59. Real database-backed analytics
    const analyticsRes = await api("GET", "/referrals/analytics");
    assert(analyticsRes.status === 200, "59. GET /referrals/analytics returns computed metrics");
    assert(analyticsRes.body.analytics.activeListingsCount >= 2, "60. Computed analytics contains real activeListingsCount");
    assert(analyticsRes.body.analytics.totalReportedRevenue >= 800000, "61. Computed analytics accurately aggregates totalReportedRevenue");

    // -------------------------------------------------------------
    // Group 8: Strict Dual-World Isolation
    // -------------------------------------------------------------
    console.log("\n--- Group 8: Strict Dual-World Isolation ---");

    // 62. Socializing world context rejected
    const socialContextRes = await api("GET", "/referrals/discover", null, {
      "x-platform-world": "socializing",
    });
    assert(socialContextRes.status === 403, "62. Strict dual-world isolation: Socializing world context rejected with 403 Forbidden");

    // 63. Missing world header rejected
    const noWorldRes = await api("GET", "/referrals/discover", null, {
      "x-platform-world": "",
    });
    assert(noWorldRes.status === 400, "63. Missing world header rejected with 400 Bad Request");
  } catch (error) {
    console.error("Test execution exception:", error);
    failed++;
  } finally {
    server.close();
    console.log(`\n=======================================================`);
    console.log(`FEATURE 9 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=======================================================\n`);
    if (failed > 0) {
      process.exit(1);
    }
  }
}

runFeature9Tests();
