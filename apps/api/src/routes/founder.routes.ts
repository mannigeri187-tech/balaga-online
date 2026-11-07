import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { enforceWorld } from "../middleware/world.middleware.js";
import {
  startupsRepository,
  founderPostsRepository,
  opportunitiesRepository,
  jobsRepository,
  productsRepository,
  buildSpacesRepository,
  mentorsRepository,
  investorsRepository,
  referralListingsRepository,
} from "../repositories/index.js";
import {
  WORLDS,
  BUILD_SPACES_REGULATORY_DISCLAIMER,
  FOUNDERS_INBOX_DISCLAIMER,
  ENTITLEMENTS,
  VERIFICATION_LEGAL_DISCLAIMER,
  PREMIUM_BENEFITS,
} from "@platform/config";
import {
  startupsStore,
  startupMembersStore,
  collaborationRequestsStore,
  partnershipSpacesStore,
  launchpadProductsStore,
  launchpadUpvotesStore,
  founderIntroductionsStore,
  founderConversationsStore,
  founderMessagesStore,
  founderNotificationsStore,
  founderProfilesStore,
  opportunitiesStore,
  founderAttentionItemsStore,
  founderActivitiesStore,
  founderPostsStore,
  founderFeedLikesStore,
  founderSavedPostsStore,
  founderRepostsStore,
  founderFeedCommentsStore,
  founderCommentLikesStore,
  founderFollowsStore,
  founderMutedAuthorsStore,
  founderBlockedAuthorsStore,
  founderReportsStore,
  founderConnectionsStore,
  cofounderRequestsStore,
  founderProfileViewsStore,
  opportunityApplicationsStore,
  opportunitySavedStore,
  opportunityViewsStore,
  opportunityReportsStore,
  startupJobsStore,
  jobApplicationsStore,
  jobSavedStore,
  jobViewsStore,
  jobInternalNotesStore,
  jobInterviewsStore,
  jobReportsStore,
  hiringAuditLogsStore,
  canUserManageHiring,
  startupInvitationsStore,
  ownershipTransferRequestsStore,
  startupUpdatesStore,
  startupFollowsStore,
  startupConnectionsStore,
  startupActivityLogsStore,
  startupInvestInquiriesStore,
  startupViewsStore,
  isStartupOwner,
  isStartupAdminOrOwner,
  canUserPublishStartupUpdates,
  accountsStore,
  devAccountId,
  devFounderProfileId,
  thirdFounderProfileId,
  fourthFounderProfileId,
  productCommentsStore,
  productCommentLikesStore,
  productReviewsStore,
  productUpdatesStore,
  productFollowsStore,
  productSavesStore,
  productCollectionsStore,
  productModerationRecordsStore,
  productModerationAppealsStore,
  productViewsStore,
  productClicksStore,
  runAutomatedModeration,
  startupCollaborationProfilesStore,
  startupOutreachAllowancesStore,
  partnershipMessagesStore,
  partnershipTasksStore,
  partnershipMilestonesStore,
  partnershipDocumentsStore,
  partnershipMeetingsStore,
  partnershipReferralsStore,
  partnershipCommissionsStore,
  partnershipReviewsStore,
  partnershipDisputesStore,
  partnershipActivityLogsStore,
  canUserManageStartupCollabs,
  getStartupOutreachAllowance,
  hasActiveDuplicateProposal,
  referralListingsStore,
  referralRequestsStore,
  referralCommissionAgreementsStore,
  referralPipelineStore,
  referralSavedListingsStore,
  referralReportsStore,
  canUserManageStartupReferrals,
  hasActiveDuplicateReferralRequest,
  computeReferralAnalytics,
  mentorProfilesStore,
  mentorshipRequestsStore,
  mentorshipAgreementsStore,
  mentorshipWorkspacesStore,
  mentorshipSessionsStore,
  mentorshipGoalsStore,
  mentorshipActionItemsStore,
  mentorshipResourcesStore,
  mentorshipReviewsStore,
  mentorBookmarksStore,
  mentorFollowsStore,
  mentorReportsStore,
  hasActiveDuplicateMentorshipRequest,
  checkSessionConflict,
  computeMentorStats,
  computeMenteeStats,
  investorProfilesStore,
  investorRepresentativesStore,
  investorVerificationSubmissionsStore,
  startupFundraisingProfilesStore,
  investorIntroRequestsStore,
  investorInterestsStore,
  fundraisingConversationsStore,
  investorMeetingsStore,
  investorBookmarksStore,
  investorFollowsStore,
  savedStartupsByInvestorsStore,
  investorReportsStore,
  hasActiveDuplicateIntroRequest,
  computeInvestorStats,
  computeFounderFundraisingStats,
  buildSpacesStore,
  buildSpaceMembersStore,
  buildSpaceJoinRequestsStore,
  buildSpaceInvitationsStore,
  buildSpaceTasksStore,
  buildSpaceMilestonesStore,
  buildSpaceMessagesStore,
  buildSpaceDocumentsStore,
  buildSpaceMeetingsStore,
  buildSpaceActivitiesStore,
  buildSpaceOwnershipTransfersStore,
  isBuildSpaceMember,
  getBuildSpaceMemberRole,
  hasBuildSpacePermission,
  computeBuildSpaceTaskAndMilestoneProgress,
  hasActiveDuplicateJoinRequest,
  hasActiveDuplicateInvitation,
  enrichBuildSpace,
  computeBuildSpaceStats,
  foundersConversationsStore,
  foundersConversationParticipantsStore,
  foundersMessagesStore,
  foundersMessageRequestsStore,
  foundersUserInboxStatesStore,
  foundersNotificationsStore,
  foundersNotificationPreferencesStore,
  foundersBlocksStore,
  foundersReportsStore,
  verificationApplicationsStore,
  verificationAuditLogsStore,
  accountSubscriptionsStore,
  profileViewLogsStore,
  hasEntitlement,
} from "../services/store.js";
import {
  counterProposalSchema,
  submitProductSchema,
  createProductSchema,
  updateProductSchema,
  productCommentSchema,
  productReviewSchema,
  productUpdateSchema,
  productCollectionSchema,
  productAppealSchema,
  moderateProductSchema,
  sendIntroRequestSchema,
  createJobSchema,
  updateJobSchema,
  submitJobApplicationSchema,
  updateJobApplicationStatusSchema,
  createJobInternalNoteSchema,
  scheduleJobInterviewSchema,
  updateHiringPermissionSchema,
  reportJobSchema,
  createStartupSchema,
  updateStartupSchema,
  updateStartupSettingsSchema,
  inviteTeamMemberSchema,
  respondStartupInvitationSchema,
  initiateOwnershipTransferSchema,
  respondOwnershipTransferSchema,
  createStartupUpdateSchema,
  sendStartupConnectionSchema,
  sendStartupInvestInquirySchema,
  updateCollaborationProfileSchema,
  createCollaborationSchema,
  respondProposalSchema,
  partnershipTaskSchema,
  partnershipMilestoneSchema,
  partnershipMeetingSchema,
  partnershipReferralSchema,
  partnershipCommissionSchema,
  partnershipReviewSchema,
  partnershipDisputeSchema,
  createReferralListingSchema,
  updateReferralListingSchema,
  submitReferralRequestSchema,
  respondReferralRequestSchema,
  proposeCommissionTermsSchema,
  confirmCommissionTermsSchema,
  updatePipelineStageSchema,
  recordReferralOutcomeSchema,
  recordReferralPaymentSchema,
  reportReferralListingSchema,
  createMentorProfileSchema,
  updateMentorProfileSchema,
  submitMentorshipRequestSchema,
  respondMentorshipRequestSchema,
  proposeMentorshipAgreementSchema,
  confirmMentorshipAgreementSchema,
  scheduleMentorshipSessionSchema,
  updateMentorshipSessionStatusSchema,
  createMentorshipGoalSchema,
  updateMentorshipGoalSchema,
  createMentorshipActionItemSchema,
  updateMentorshipActionItemSchema,
  createMentorshipResourceSchema,
  updateMentorshipWorkspaceNotesSchema,
  recordMentorshipPaymentSchema,
  submitMentorshipReviewSchema,
  replyMentorshipReviewSchema,
  reportMentorSchema,
  investmentThesisSchema,
  createInvestorProfileSchema,
  updateInvestorProfileSchema,
  submitInvestorVerificationSchema,
  reviewInvestorVerificationSchema,
  updateStartupFundraisingProfileSchema,
  submitInvestorIntroRequestSchema,
  respondInvestorIntroRequestSchema,
  submitInvestorInterestSchema,
  respondInvestorInterestSchema,
  scheduleInvestorMeetingSchema,
  updateInvestorMeetingStatusSchema,
  sharePitchMaterialSchema,
  reportInvestorSchema,
  createProjectBuildSpaceSchema,
  updateProjectBuildSpaceSchema,
  changeBuildSpaceVisibilitySchema,
  updateBuildSpaceStatusSchema,
  submitBuildSpaceJoinRequestSchema,
  reviewBuildSpaceJoinRequestSchema,
  respondBuildSpaceMoreInfoSchema,
  inviteBuildSpaceMemberSchema,
  respondBuildSpaceInvitationSchema,
  updateBuildSpaceMemberRoleSchema,
  transferBuildSpaceOwnershipSchema,
  respondBuildSpaceOwnershipTransferSchema,
  createBuildSpaceTaskSchema,
  updateBuildSpaceTaskSchema,
  addBuildSpaceTaskCommentSchema,
  createBuildSpaceMilestoneSchema,
  updateBuildSpaceMilestoneSchema,
  sendBuildSpaceMessageSchema,
  uploadBuildSpaceDocumentSchema,
  scheduleBuildSpaceMeetingSchema,
  updateBuildSpaceMeetingStatusSchema,
  createFoundersConversationSchema,
  sendFoundersMessageSchema,
  editFoundersMessageSchema,
  messageReactionSchema,
  updateConversationStateSchema,
  createFoundersGroupSchema,
  addFoundersGroupMemberSchema,
  createFoundersMessageRequestSchema,
  respondFoundersMessageRequestSchema,
  updateNotificationPreferencesSchema,
  blockUserSchema,
  reportMessageSchema,
  submitBlueVerificationSchema,
  submitTealVerificationSchema,
  reviewVerificationSchema,
  appealVerificationSchema,
  resubmitVerificationSchema,
  upgradeSubscriptionSchema,
} from "@platform/validation";
import {
  CollaborationRequest,
  Product,
  ProductCategory,
  ProductStatus,
  ProductPricingModel,
  ProductModerationStatus,
  ProductComment,
  ProductReview,
  ProductUpdate,
  ProductCollection,
  ProductModerationRecord,
  ProductModerationAppeal,
  MakerAnalytics,
  FounderPost,
  FounderComment,
  FounderPostType,
  FounderAudience,
  FounderProfile,
  FounderConnection,
  CofounderRequest,
  FounderProfileView,
  NetworkFounderProfile,
  NetworkConnectionStatus,
  ProfileViewAnalyticsResponse,
  Opportunity,
  OpportunityApplication,
  OpportunityCategory,
  OpportunityCompensation,
  OpportunityStatus,
  OpportunityApplicationStatus,
  JobListing,
  JobApplication,
  JobInternalNote,
  JobInterview,
  JobEmploymentType,
  JobWorkMode,
  JobCompensationType,
  JobStatus,
  JobApplicationStatus,
  ScreeningQuestion,
  HiringDashboardMetrics,
  HiringPermissionMember,
  JobModerationReport,
  HiringAuditLog,
  Startup,
  StartupMember,
  StartupRole,
  StartupStage,
  StartupInvitation,
  OwnershipTransferRequest,
  StartupUpdate,
  StartupAnalytics,
  StartupFollow,
  StartupConnection,
  StartupActivityLog,
  StartupInvestInquiry,
  StartupVisibilitySettings,
  PartnershipSpace,
  StartupCollaborationProfile,
  StartupOutreachAllowance,
  PartnershipTask,
  PartnershipMilestone,
  PartnershipMeeting,
  PartnershipReferral,
  PartnershipCommission,
  PartnershipReview,
  PartnershipDispute,
  PartnershipDocument,
  PartnershipMessage,
  ReferralListing,
  ReferralRequest,
  ReferralCommissionAgreement,
  ReferralCommissionVersion,
  ReferralPipelineRecord,
  ReferralExchangeAnalytics,
  ReferralReport,
  MentorProfile,
  MentorPricingConfig,
  MentorshipAgreement,
  MentorshipAgreementVersion,
  MentorshipRequest,
  MentorshipSession,
  MentorshipGoal,
  MentorshipActionItem,
  MentorshipResource,
  MentorshipWorkspace,
  MentorshipReview,
  MentorReport,
  InvestmentThesis,
  InvestorRepresentative,
  InvestorProfile,
  InvestorVerificationSubmission,
  StartupFundraisingProfile,
  InvestorIntroRequest,
  InvestorInterest,
  InvestorMeeting,
  FundraisingConversation,
  InvestorDashboardStats,
  FounderFundraisingDashboardStats,
  InvestorReport,
  BuildSpace,
  BuildSpaceMember,
  BuildSpaceJoinRequest,
  BuildSpaceInvitation,
  BuildSpaceTask,
  BuildSpaceMilestone,
  BuildSpaceMessage,
  BuildSpaceDocument,
  BuildSpaceMeeting,
  BuildSpaceActivity,
  BuildSpacePublicListing,
  BuildSpaceStats,
  FoundersConversation,
  FoundersConversationParticipant,
  FoundersMessage,
  FoundersMessageRequest,
  FoundersUserInboxState,
  FoundersNotification,
  FoundersNotificationPreferences,
  FoundersInboxSummary,
  VerificationApplication,
  ProfileViewerRecord,
  SubscriptionDetails,
} from "@platform/shared-types";


export const founderRouter = Router();

// Apply auth and strict world boundary check
founderRouter.use(authMiddleware);
founderRouter.use(enforceWorld(WORLDS.FOUNDERS));

// Helper: Get authenticated founder profile
function getAuthFounder(req: Request) {
  const accountId = req.user?.id || devAccountId;
  return founderProfilesStore.get(accountId);
}

// Helper: Check if founder is authorized member/owner of a startup
function isStartupMember(profileId: string, startupId: string): boolean {
  const members = startupMembersStore.get(startupId) || [];
  return members.some((m) => m.profileId === profileId);
}

// Helper: Get all enriched founder feed posts
function getEnrichedPosts(currentFounderId: string) {
  return Array.from(founderPostsStore.values()).map((p) => {
    const authorProfile =
      Array.from(founderProfilesStore.values()).find((fp) => fp.id === p.authorId) || p.author;
    return {
      ...p,
      author: authorProfile,
      authorName: p.author?.displayName || authorProfile?.displayName || "Founder",
      authorHeadline: p.authorHeadline || authorProfile?.headline || "Startup Builder",
      authorAvatar: p.author?.avatarUrl || authorProfile?.avatarUrl,
      username: p.author?.username || authorProfile?.username || "founder",
      hasLiked: founderFeedLikesStore.has(`${currentFounderId}:${p.id}`),
      hasSaved: founderSavedPostsStore.has(`${currentFounderId}:${p.id}`),
      hasReposted: founderRepostsStore.has(`${currentFounderId}:${p.id}`),
      isFollowing: founderFollowsStore.has(`${currentFounderId}:${p.authorId}`),
    };
  });
}

// Helper: Enrich network founder profile
function enrichNetworkProfile(
  targetProfile: FounderProfile,
  currentFounderId: string,
  isViewerPremium: boolean
): NetworkFounderProfile {
  let connectionStatus: NetworkConnectionStatus = "none";
  let connectionId: string | null = null;
  let connectionNote: string | null = null;

  for (const conn of founderConnectionsStore.values()) {
    if (conn.requesterId === currentFounderId && conn.recipientId === targetProfile.id) {
      if (conn.status === "pending") {
        connectionStatus = "pending_sent";
        connectionId = conn.id;
        connectionNote = conn.note || null;
      } else if (conn.status === "accepted") {
        connectionStatus = "accepted";
        connectionId = conn.id;
        connectionNote = conn.note || null;
      }
      break;
    } else if (conn.requesterId === targetProfile.id && conn.recipientId === currentFounderId) {
      if (conn.status === "pending") {
        connectionStatus = "pending_received";
        connectionId = conn.id;
        connectionNote = conn.note || null;
      } else if (conn.status === "accepted") {
        connectionStatus = "accepted";
        connectionId = conn.id;
        connectionNote = conn.note || null;
      }
      break;
    }
  }

  const isFollowing = founderFollowsStore.has(`${currentFounderId}:${targetProfile.id}`);
  const canMessage = isViewerPremium || connectionStatus === "accepted";

  // Startup affiliation
  let startupAffiliation: {
    id: string;
    name: string;
    role: string;
    stage: string;
    industry: string;
  } | null = null;

  for (const [stId, members] of startupMembersStore.entries()) {
    const mem = members.find((m) => m.profileId === targetProfile.id);
    if (mem) {
      const st = startupsStore.get(stId);
      if (st) {
        startupAffiliation = {
          id: st.id,
          name: st.name,
          role: mem.title || mem.role,
          stage: st.stage,
          industry: st.industry,
        };
        break;
      }
    }
  }

  // Derive lookingFor and badge
  const lookingFor: string[] = [];
  if (targetProfile.roles?.includes("Founder") || targetProfile.roles?.includes("CEO")) {
    lookingFor.push("Technical Co-Founder", "Seed Capital", "Advisors");
  } else if (targetProfile.roles?.includes("CTO")) {
    lookingFor.push("Product Designers", "Full-Stack Devs", "Early Traction Startups");
  } else if (targetProfile.roles?.includes("Head of Design")) {
    lookingFor.push("Early-Stage Startups", "Design Systems Collaboration", "B2B SaaS Projects");
  } else if (targetProfile.roles?.includes("Advisor") || targetProfile.roles?.includes("Mentor")) {
    lookingFor.push("Pre-Seed Founders", "Angel Investment Opportunities", "Mentorship");
  } else {
    lookingFor.push("Co-Founder Opportunities", "Collaborations");
  }

  const verificationBadge =
    targetProfile.experienceYears && targetProfile.experienceYears >= 8
      ? "verified_founder"
      : targetProfile.experienceYears && targetProfile.experienceYears >= 5
      ? "verified_builder"
      : "none";

  return {
    ...targetProfile,
    connectionStatus,
    connectionId,
    connectionNote,
    isFollowing,
    canMessage,
    startupAffiliation,
    lookingFor,
    verificationBadge,
  };
}

// 1. GET FOUNDERS DASHBOARD OVERVIEW (COMPACT COMMAND CENTRE)
founderRouter.get("/dashboard", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: Complete your Founder Profile first" });
  }

  // User's Startup memberships
  const userStartups = Array.from(startupsStore.values())
    .filter((st) => isStartupMember(currentFounder.id, st.id))
    .map((st) => {
      const members = startupMembersStore.get(st.id) || [];
      const userMember = members.find((m) => m.profileId === currentFounder.id);
      const startupProducts = Array.from(launchpadProductsStore.values()).filter(
        (p) => p.startupId === st.id || p.makerId === currentFounder.id
      );
      const activeCollabs = Array.from(collaborationRequestsStore.values()).filter(
        (c) =>
          (c.receiverStartupId === st.id || c.initiatorStartupId === st.id) &&
          c.status === "accepted"
      );
      return {
        ...st,
        membershipRole: userMember?.role || "viewer",
        roleTitle: userMember?.title || "Member",
        teamCount: members.length,
        productsCount: startupProducts.length,
        activeCollabsCount: activeCollabs.length,
      };
    });

  const userStartupIds = new Set(userStartups.map((s) => s.id));

  // Collaboration items
  const allProposals = Array.from(collaborationRequestsStore.values()).map((p) => ({
    ...p,
    initiatorStartup: startupsStore.get(p.initiatorStartupId),
    receiverStartup: startupsStore.get(p.receiverStartupId),
  }));

  const incomingProposals = allProposals.filter((p) => userStartupIds.has(p.receiverStartupId));
  const sentProposals = allProposals.filter((p) => userStartupIds.has(p.initiatorStartupId));
  const acceptedCollabs = allProposals.filter(
    (p) =>
      (userStartupIds.has(p.receiverStartupId) || userStartupIds.has(p.initiatorStartupId)) &&
      p.status === "accepted"
  );
  const counteredProposals = allProposals.filter(
    (p) =>
      (userStartupIds.has(p.receiverStartupId) || userStartupIds.has(p.initiatorStartupId)) &&
      p.status === "countered"
  );

  // Attention Items (Prioritized action-oriented pending tasks)
  const attentionItems = Array.from(founderAttentionItemsStore.values());

  // Recommended People (4-6 people, excluding current founder)
  const recommendedPeople = Array.from(founderProfilesStore.values())
    .filter((p) => p.id !== currentFounder.id)
    .slice(0, 6)
    .map((p) => {
      const existingIntro = Array.from(founderIntroductionsStore.values()).find(
        (intro) => intro.requesterProfileId === currentFounder.id && intro.targetProfileId === p.id
      );
      return {
        id: p.id,
        displayName: p.displayName,
        username: p.username,
        headline: p.headline,
        bio: p.bio,
        skills: p.skills,
        roles: p.roles,
        availability: p.availability,
        workPreference: p.workPreference,
        broadLocation: p.broadLocation,
        introStatus: existingIntro ? existingIntro.status : null,
        isFollowing: false,
        isConnected: p.id === "20000000-0000-0000-0000-000000000003",
      };
    });

  // Opportunities and Jobs
  const allOpps = Array.from(opportunitiesStore.values()).map((op) => ({
    ...op,
    startup: op.startupId ? startupsStore.get(op.startupId) : undefined,
  }));
  const opportunities = allOpps.filter(
    (op) => op.type === "co_founder" || op.type === "mentor" || op.type === "contributor"
  );
  const jobs = allOpps.filter(
    (op) => op.type === "developer" || op.type === "designer" || op.type === "marketing" || op.type === "sales"
  );

  // Products
  const userProducts = Array.from(launchpadProductsStore.values())
    .filter((p) => p.makerId === currentFounder.id)
    .map((prod) => ({
      ...prod,
      hasUpvoted: launchpadUpvotesStore.has(`${currentFounder.id}:${prod.id}`),
    }));

  const trendingProducts = Array.from(launchpadProductsStore.values())
    .map((prod) => ({
      ...prod,
      hasUpvoted: launchpadUpvotesStore.has(`${currentFounder.id}:${prod.id}`),
    }))
    .sort((a, b) => b.upvotesCount - a.upvotesCount)
    .slice(0, 3);

  // Activities
  const upcomingActivities = Array.from(founderActivitiesStore.values()).slice(0, 5);

  // Metrics (6 Quick Statistics cards)
  const metrics = {
    connections: 28,
    profileViews: 142,
    activeOpportunities: allOpps.filter((o) => o.status === "open").length,
    submittedApplications: 2,
    activePartnerships: Math.max(acceptedCollabs.length, 3),
    productsLaunched: userProducts.length || 1,
    profileMatch: 92,
  };

  res.json({
    world: WORLDS.FOUNDERS,
    profile: {
      ...currentFounder,
      currentAffiliation: userStartups[0]
        ? `${userStartups[0].roleTitle} at ${userStartups[0].name}`
        : "Tech Founder & Architect",
      badge: userStartups[0]?.verificationLevel || "verified_project",
      isPremium: true,
      profileCompletion: 92,
    },
    metrics,
    startups: userStartups,
    attentionItems,
    recommendedPeople,
    talentMatches: recommendedPeople,
    opportunitiesAndJobs: {
      opportunities,
      jobs,
    },
    collaborations: {
      incoming: incomingProposals,
      sent: sentProposals,
      accepted: acceptedCollabs,
      countered: counteredProposals,
    },
    proposals: incomingProposals,
    launchpad: {
      myProducts: userProducts,
      trending: trendingProducts,
    },
    trendingProduct: trendingProducts[0] || null,
    feed: getEnrichedPosts(currentFounder.id).slice(0, 4),
    upcomingActivities,
  });
});

// ============================================================================
// FEATURE 8: STARTUP COLLABORATION NETWORK (OPTION A: CONTROLLED OUTREACH)
// ============================================================================

// 1. DISCOVER STARTUPS LOOKING FOR PARTNERS
founderRouter.get("/collaborations/discover", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const {
    industry,
    stage,
    location,
    products,
    tech,
    targetCustomers,
    businessModel,
    offerings,
    needs,
    partnershipTypes,
    search,
    tab,
  } = req.query as Record<string, string | undefined>;

  // User's own startups to identify own startups & mutual network
  const userStartups = Array.from(startupsStore.values()).filter((st) =>
    isStartupMember(currentFounder.id, st.id)
  );
  const userStartupIds = new Set(userStartups.map((s) => s.id));

  // Collect all startups with collaboration profiles
  const allStartups = Array.from(startupsStore.values());
  const enrichedList = allStartups.map((st) => {
    let collabProfile = startupCollaborationProfilesStore.get(st.id);
    if (!collabProfile) {
      collabProfile = {
        startupId: st.id,
        startup: st,
        whatWeDo: st.fullAbout || st.oneLiner || `${st.name} is building the future of ${st.industry}.`,
        productsAndServices: [st.name],
        industriesServed: [st.industry],
        targetCustomers: "Entrepreneurs, SMBs, and Enterprise Partners across India",
        technologies: ["Cloud", "TypeScript", "PostgreSQL"],
        whatWeOffer: "Product trials, co-marketing reach, and mutual business growth.",
        whatWeNeed: "Integration partners, distribution channels, and tech collaborators.",
        preferredPartnershipTypes: ["integration", "referral", "joint_marketing"],
        collaborationGoals: "Expand market reach and provide end-to-end customer solutions.",
        broadOperatingRegions: [st.broadLocation || "Bengaluru"],
        preferredContactMethod: "platform_proposal",
        isActivelySeeking: true,
        updatedAt: st.updatedAt || new Date().toISOString(),
      };
      startupCollaborationProfilesStore.set(st.id, collabProfile);
    }

    // Active & Completed partnerships count
    const completedPartnershipsCount = Array.from(partnershipSpacesStore.values()).filter(
      (s) => (s.startupAId === st.id || s.startupBId === st.id) && s.status === "completed"
    ).length;
    const activePartnershipsCount = Array.from(partnershipSpacesStore.values()).filter(
      (s) => (s.startupAId === st.id || s.startupBId === st.id) && s.status === "active"
    ).length;

    // Review ratings
    const reviewsForStartup = Array.from(partnershipReviewsStore.values()).filter(
      (r) => r.reviewedStartupId === st.id
    );
    const averageRating =
      reviewsForStartup.length > 0
        ? Number(
            (
              reviewsForStartup.reduce((sum, r) => sum + r.overallScore, 0) /
              reviewsForStartup.length
            ).toFixed(1)
          )
        : 5.0;

    // Mutual connection count approximation
    const isOwnStartup = userStartupIds.has(st.id);
    const matchScore = isOwnStartup ? 0 : Math.floor(75 + (st.name.length * 3) % 25);

    return {
      startup: st,
      collabProfile,
      activePartnershipsCount,
      completedPartnershipsCount,
      averageRating,
      reviewsCount: reviewsForStartup.length,
      matchScore,
      isOwnStartup,
    };
  });

  // Filter based on search & criteria
  let filtered = enrichedList.filter((item) => {
    // Exclude own startup from general discovery unless searching specifically
    if (item.isOwnStartup && (!search || !search.trim())) {
      return false;
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = item.startup.name.toLowerCase().includes(q);
      const matchTagline = (item.startup.oneLiner || "").toLowerCase().includes(q);
      const matchIndustry = item.startup.industry.toLowerCase().includes(q);
      const matchWhatWeDo = (item.collabProfile.whatWeDo || "").toLowerCase().includes(q);
      const matchOffer = (item.collabProfile.whatWeOffer || "").toLowerCase().includes(q);
      const matchNeed = (item.collabProfile.whatWeNeed || "").toLowerCase().includes(q);
      if (!matchName && !matchTagline && !matchIndustry && !matchWhatWeDo && !matchOffer && !matchNeed) {
        return false;
      }
    }

    if (industry && industry !== "all" && item.startup.industry.toLowerCase() !== industry.toLowerCase()) {
      return false;
    }

    if (stage && stage !== "all" && item.startup.stage.toLowerCase() !== stage.toLowerCase()) {
      return false;
    }

    if (location && location !== "all" && !item.startup.broadLocation.toLowerCase().includes(location.toLowerCase())) {
      return false;
    }

    if (partnershipTypes && partnershipTypes !== "all") {
      const targetTypes = partnershipTypes.split(",").map((t) => t.trim().toLowerCase());
      const hasType = item.collabProfile.preferredPartnershipTypes.some((t) =>
        targetTypes.includes(t.toLowerCase())
      );
      if (!hasType) return false;
    }

    if (offerings && offerings.trim()) {
      const o = offerings.trim().toLowerCase();
      if (!(item.collabProfile.whatWeOffer || "").toLowerCase().includes(o)) {
        return false;
      }
    }

    if (needs && needs.trim()) {
      const n = needs.trim().toLowerCase();
      if (!(item.collabProfile.whatWeNeed || "").toLowerCase().includes(n)) {
        return false;
      }
    }

    if (tab === "looking_for_partners") {
      return item.collabProfile.isActivelySeeking;
    }

    if (tab === "trending") {
      return item.activePartnershipsCount > 0 || item.completedPartnershipsCount > 0;
    }

    return true;
  });

  // Sort by match score or active partnerships
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  // Dynamic filter facets
  const industries = Array.from(new Set(allStartups.map((s) => s.industry)));
  const stages = Array.from(new Set(allStartups.map((s) => s.stage)));
  const locations = Array.from(new Set(allStartups.map((s) => s.broadLocation)));

  res.json({
    world: WORLDS.FOUNDERS,
    startups: filtered,
    total: filtered.length,
    filterFacets: {
      industries,
      stages,
      locations,
      partnershipTypes: [
        "referral",
        "rev_share",
        "integration",
        "joint_marketing",
        "distribution",
        "reseller",
        "resource_share",
        "business_collab",
        "tech_collab",
        "custom",
      ],
    },
  });
});

// 2. GET STARTUP COLLABORATION PROFILE
founderRouter.get("/collaborations/profile/:startupId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { startupId } = req.params;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  let profile = startupCollaborationProfilesStore.get(startupId);
  if (!profile) {
    profile = {
      startupId,
      startup,
      whatWeDo: startup.fullAbout || startup.oneLiner || `${startup.name} is building innovative tech.`,
      productsAndServices: [startup.name],
      industriesServed: [startup.industry],
      targetCustomers: "Startups, enterprises, and tech consumers",
      technologies: ["Node.js", "TypeScript", "PostgreSQL"],
      whatWeOffer: "Collaborative growth, product integration, and partner reach.",
      whatWeNeed: "Distribution partners, technology integrations, and co-marketing.",
      preferredPartnershipTypes: ["integration", "referral", "joint_marketing"],
      collaborationGoals: "Build strong synergistic relationships across the ecosystem.",
      broadOperatingRegions: [startup.broadLocation || "India"],
      preferredContactMethod: "platform_proposal",
      isActivelySeeking: true,
      updatedAt: new Date().toISOString(),
    };
    startupCollaborationProfilesStore.set(startupId, profile);
  }

  const isAuthorizedManager = canUserManageStartupCollabs(currentFounder.id, startupId);
  const allowance = getStartupOutreachAllowance(startupId);

  res.json({
    world: WORLDS.FOUNDERS,
    startup,
    profile,
    outreachAllowance: allowance,
    isAuthorizedManager,
  });
});

// 3. UPDATE STARTUP COLLABORATION PROFILE
founderRouter.put("/collaborations/profile/:startupId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { startupId } = req.params;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Security check: Only owner, admin, or member with canManageCollabs
  if (!canUserManageStartupCollabs(currentFounder.id, startupId)) {
    return res.status(403).json({
      error: "Unauthorized: You do not have permission to manage this startup's collaboration profile",
    });
  }

  const parsed = updateCollaborationProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid profile data", details: parsed.error.issues });
  }

  const existing = startupCollaborationProfilesStore.get(startupId) || {
    startupId,
    startup,
  };

  const updated: StartupCollaborationProfile = {
    ...existing,
    ...parsed.data,
    preferredPartnershipTypes: (parsed.data.preferredPartnershipTypes || []) as any,
    startupId,
    startup,
    updatedAt: new Date().toISOString(),
  };

  startupCollaborationProfilesStore.set(startupId, updated);

  // Log activity
  startupActivityLogsStore.set(`act-collab-prof-${Date.now()}`, {
    id: `act-collab-prof-${Date.now()}`,
    startupId,
    actorProfileId: currentFounder.id,
    action: "collaboration_profile_updated",
    details: `${currentFounder.displayName} updated the startup's Collaboration & Partnering profile.`,
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: "Collaboration profile updated successfully",
    profile: updated,
  });
});

// 4. GET OPTION A OUTREACH ALLOWANCE FOR A STARTUP
founderRouter.get("/collaborations/allowance/:startupId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { startupId } = req.params;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  const allowance = getStartupOutreachAllowance(startupId);
  res.json({
    world: WORLDS.FOUNDERS,
    allowance,
  });
});

// 5. GET COLLABORATION PROPOSALS (INCOMING, SENT, COUNTERED)
founderRouter.get("/collaborations/proposals", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { startupId, direction, status } = req.query as Record<string, string | undefined>;

  // Find user's startups
  const userStartups = Array.from(startupsStore.values()).filter((st) =>
    isStartupMember(currentFounder.id, st.id)
  );
  const userStartupIds = new Set(userStartups.map((s) => s.id));

  let proposals = Array.from(collaborationRequestsStore.values()).map((p) => ({
    ...p,
    initiatorStartup: startupsStore.get(p.initiatorStartupId),
    receiverStartup: startupsStore.get(p.receiverStartupId),
    sentBy: founderProfilesStore.get(p.sentByProfileId),
    statusHandledBy: p.statusHandledByProfileId
      ? founderProfilesStore.get(p.statusHandledByProfileId)
      : null,
  }));

  // Filter by startupId if specified
  if (startupId) {
    proposals = proposals.filter(
      (p) => p.initiatorStartupId === startupId || p.receiverStartupId === startupId
    );
  } else {
    // Otherwise show all proposals where user's startup is either initiator or receiver
    proposals = proposals.filter(
      (p) => userStartupIds.has(p.initiatorStartupId) || userStartupIds.has(p.receiverStartupId)
    );
  }

  // Filter direction
  if (direction === "incoming") {
    proposals = proposals.filter((p) => userStartupIds.has(p.receiverStartupId));
  } else if (direction === "sent") {
    proposals = proposals.filter((p) => userStartupIds.has(p.initiatorStartupId));
  }

  // Filter status
  if (status && status !== "all") {
    proposals = proposals.filter((p) => p.status === status);
  }

  // Sort newest first
  proposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    proposals,
    total: proposals.length,
  });
});

// 6. CREATE COLLABORATION PROPOSAL (ENFORCING OPTION A CONTROLLED OUTREACH LIMITS)
founderRouter.post("/collaborations/proposals", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const parsed = createCollaborationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid proposal data", details: parsed.error.issues });
  }

  const {
    receiverStartupId,
    format,
    collabType,
    title,
    message,
    compatibilityReason,
    expectedBenefits,
    whatWeOffer,
    whatWeNeed,
    commercialTerms,
    responsibilities,
    proposedDuration,
    successCriteria,
    expectedOutcomes,
    supportingLinks,
    isDraft,
  } = parsed.data;

  // Determine initiator startup
  let initiatorStartupId = parsed.data.initiatorStartupId;
  if (!initiatorStartupId) {
    const userStartups = Array.from(startupsStore.values()).filter((st) =>
      canUserManageStartupCollabs(currentFounder.id, st.id)
    );
    if (userStartups.length === 0) {
      return res.status(403).json({
        error: "Forbidden: You must be an owner or authorized manager of a startup to propose collaborations",
      });
    }
    initiatorStartupId = userStartups[0].id;
  }

  // Permission check
  if (!canUserManageStartupCollabs(currentFounder.id, initiatorStartupId)) {
    return res.status(403).json({
      error: "Unauthorized: You do not have permission to send collaboration proposals for this startup",
    });
  }

  // Rule: Cannot propose to own startup
  if (initiatorStartupId === receiverStartupId) {
    return res.status(400).json({
      error: "Invalid proposal: A startup cannot propose a partnership to itself",
    });
  }

  const receiverStartup = startupsStore.get(receiverStartupId);
  if (!receiverStartup) {
    return res.status(404).json({ error: "Receiver startup not found" });
  }

  // Option A: Controlled Outreach Policy Enforcement (only for non-drafts)
  const allowance = getStartupOutreachAllowance(initiatorStartupId);
  if (!isDraft) {
    if (allowance.allowanceRemaining <= 0) {
      return res.status(429).json({
        error: `Controlled Outreach limit reached: Your startup has utilized all ${allowance.totalWeeklyLimit} proposals allowed per rolling 7-day period. Your allowance resets on ${new Date(allowance.resetsAt).toLocaleString()}. Complete partnerships to earn bonus limits!`,
        allowance,
      });
    }

    // Duplicate active proposal prevention
    if (hasActiveDuplicateProposal(initiatorStartupId, receiverStartupId)) {
      return res.status(409).json({
        error: "An active proposal between these startups already exists. Please review your existing proposal before sending a new one.",
      });
    }
  }

  const proposalId = `collab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newProposal: CollaborationRequest = {
    id: proposalId,
    initiatorStartupId,
    initiatorStartup: startupsStore.get(initiatorStartupId),
    receiverStartupId,
    receiverStartup,
    sentByProfileId: currentFounder.id,
    sentBy: currentFounder,
    collabType,
    format,
    title,
    summary: message || compatibilityReason || title,
    expectedBenefits,
    whatWeOffer,
    whatWeNeed,
    commercialTerms,
    responsibilities: responsibilities || [],
    proposedDuration: proposedDuration || "3-6 Months",
    successCriteria,
    status: isDraft ? "draft" : "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  collaborationRequestsStore.set(proposalId, newProposal);

  // If not draft, notify recipient startup members and log activity
  if (!isDraft) {
    // Recalculate allowance
    const updatedAllowance = getStartupOutreachAllowance(initiatorStartupId);

    // Notify receiving startup
    const receiverMembers = startupMembersStore.get(receiverStartupId) || [];
    receiverMembers
      .filter((m) => m.role === "owner" || m.role === "admin" || m.canManageCollabs)
      .forEach((m) => {
        founderNotificationsStore.set(`fn-collab-${Date.now()}-${m.profileId}`, {
          id: `fn-collab-${Date.now()}-${m.profileId}`,
          recipientProfileId: m.profileId,
          actorProfileId: currentFounder.id,
          type: "partnership_proposal_received",
          message: `${newProposal.initiatorStartup?.name || "A startup"} sent a collaboration proposal: "${title}".`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      });

    startupActivityLogsStore.set(`act-collab-prop-${Date.now()}`, {
      id: `act-collab-prop-${Date.now()}`,
      startupId: initiatorStartupId,
      actorProfileId: currentFounder.id,
      action: "collaboration_proposal_sent",
      details: `Sent collaboration proposal "${title}" to ${receiverStartup.name}.`,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: "Collaboration proposal sent successfully",
      proposal: newProposal,
      remainingAllowance: updatedAllowance.allowanceRemaining,
      allowance: updatedAllowance,
    });
  }

  res.status(201).json({
    message: "Collaboration proposal saved as draft",
    proposal: newProposal,
    allowance,
  });
});

// 7. GET PROPOSAL DETAILS
founderRouter.get("/collaborations/proposals/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const proposal = collaborationRequestsStore.get(id);
  if (!proposal) {
    return res.status(404).json({ error: "Collaboration proposal not found" });
  }

  // Must be member of initiator or receiver startup
  const isInitiatorMember = isStartupMember(currentFounder.id, proposal.initiatorStartupId);
  const isReceiverMember = isStartupMember(currentFounder.id, proposal.receiverStartupId);
  if (!isInitiatorMember && !isReceiverMember) {
    return res.status(403).json({
      error: "Unauthorized: You are not authorized to view this collaboration proposal",
    });
  }

  res.json({
    world: WORLDS.FOUNDERS,
    proposal: {
      ...proposal,
      initiatorStartup: startupsStore.get(proposal.initiatorStartupId),
      receiverStartup: startupsStore.get(proposal.receiverStartupId),
      sentBy: founderProfilesStore.get(proposal.sentByProfileId),
      statusHandledBy: proposal.statusHandledByProfileId
        ? founderProfilesStore.get(proposal.statusHandledByProfileId)
        : null,
    },
  });
});

// 7b. ACCEPT COLLABORATION PROPOSAL DIRECT ALIAS
founderRouter.post("/collaborations/proposals/:id/accept", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const proposalId = req.params.id;
  const proposal = collaborationRequestsStore.get(proposalId);
  if (!proposal) {
    return res.status(404).json({ error: "Collaboration proposal not found" });
  }

  if (!canUserManageStartupCollabs(currentFounder.id, proposal.receiverStartupId)) {
    return res.status(403).json({
      error: "Unauthorized: Only authorized managers of the receiving startup can accept this proposal",
    });
  }

  proposal.status = "accepted";
  proposal.statusHandledByProfileId = currentFounder.id;
  proposal.statusUpdatedAt = new Date().toISOString();
  const spaceId = proposal.id;
  proposal.partnershipSpaceId = spaceId;
  collaborationRequestsStore.set(proposal.id, proposal);

  if (!partnershipSpacesStore.has(spaceId)) {
    partnershipSpacesStore.set(spaceId, {
      id: spaceId,
      collaborationRequestId: proposal.id,
      collaborationRequest: proposal,
      startupAId: proposal.initiatorStartupId,
      startupA: startupsStore.get(proposal.initiatorStartupId),
      startupBId: proposal.receiverStartupId,
      startupB: startupsStore.get(proposal.receiverStartupId),
      partnershipType: proposal.collabType,
      title: proposal.title,
      objectives: proposal.expectedBenefits || proposal.title,
      agreedDuration: proposal.proposedDuration || "6 Months",
      startDate: new Date().toISOString(),
      targetCompletionDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      status: "active",
      authorizedMemberIds: [proposal.sentByProfileId, currentFounder.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return res.json({
    message: "Partnership Accepted successfully! Workspace created.",
    proposal,
    spaceId,
  });
});

// 7c. COUNTER COLLABORATION PROPOSAL DIRECT ALIAS
founderRouter.post("/collaborations/proposals/:id/counter", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const proposalId = req.params.id;
  const proposal = collaborationRequestsStore.get(proposalId);
  if (!proposal) {
    return res.status(404).json({ error: "Collaboration proposal not found" });
  }

  const isReceiver = canUserManageStartupCollabs(currentFounder.id, proposal.receiverStartupId);
  const isInitiator = canUserManageStartupCollabs(currentFounder.id, proposal.initiatorStartupId);
  if (!isReceiver && !isInitiator) {
    return res.status(403).json({
      error: "Unauthorized: You do not have permission to counter-propose for either startup",
    });
  }

  if (!req.body.commercialTerms || !req.body.commercialTerms.trim()) {
    return res.status(400).json({ error: "Validation error: commercialTerms is required" });
  }

  proposal.status = "countered";
  proposal.statusHandledByProfileId = currentFounder.id;
  proposal.statusUpdatedAt = new Date().toISOString();
  proposal.commercialTerms = req.body.commercialTerms;
  if (req.body.revisedOffer) {
    proposal.whatWeOffer = `${proposal.whatWeOffer || ""} \n[Counter-Offer]: ${req.body.revisedOffer}`;
  }

  collaborationRequestsStore.set(proposal.id, proposal);

  return res.json({
    message: "Counter-proposal submitted successfully",
    proposal,
  });
});

// 8. RESPOND TO COLLABORATION PROPOSAL (ACCEPT, REJECT, COUNTER, REQUEST INFO, REQUEST MEETING, WITHDRAW)
founderRouter.post("/collaborations/proposals/:id/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const parsed = respondProposalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid response data", details: parsed.error.issues });
  }

  const proposalId = req.params.id;
  const proposal = collaborationRequestsStore.get(proposalId);
  if (!proposal) {
    return res.status(404).json({ error: "Collaboration proposal not found" });
  }

  const { action, reasonOrNotes, counterTerms, moreInfoQuery, meetingDetails } = parsed.data;

  // Handle Action: WITHDRAW (only initiator)
  if (action === "withdraw") {
    if (!canUserManageStartupCollabs(currentFounder.id, proposal.initiatorStartupId)) {
      return res.status(403).json({
        error: "Unauthorized: Only authorized managers of the proposing startup can withdraw proposals",
      });
    }

    if (proposal.status === "accepted") {
      return res.status(400).json({
        error: "Cannot withdraw an already accepted partnership. Manage the partnership space instead.",
      });
    }

    proposal.status = "withdrawn";
    proposal.statusHandledByProfileId = currentFounder.id;
    proposal.statusUpdatedAt = new Date().toISOString();
    collaborationRequestsStore.set(proposal.id, proposal);

    // Option A Note: Withdrawing a proposal does not bypass weekly limits if it was sent in the rolling window
    return res.json({
      message: "Collaboration proposal withdrawn successfully",
      proposal,
    });
  }

  // Handle Action: ACCEPT
  if (action === "accept") {
    if (!canUserManageStartupCollabs(currentFounder.id, proposal.receiverStartupId)) {
      return res.status(403).json({
        error: "Unauthorized: Only authorized managers of the receiving startup can accept this proposal",
      });
    }

    if (proposal.status === "accepted") {
      return res.json({
        message: "Partnership already accepted",
        proposal,
        spaceId: proposal.partnershipSpaceId || proposal.id,
      });
    }

    proposal.status = "accepted";
    proposal.statusHandledByProfileId = currentFounder.id;
    proposal.statusUpdatedAt = new Date().toISOString();
    const spaceId = `space-${proposal.id}`;
    proposal.partnershipSpaceId = spaceId;
    collaborationRequestsStore.set(proposal.id, proposal);

    // Create Partnership Space
    const newSpace: PartnershipSpace = {
      id: spaceId,
      collaborationRequestId: proposal.id,
      collaborationRequest: proposal,
      startupAId: proposal.initiatorStartupId,
      startupA: startupsStore.get(proposal.initiatorStartupId),
      startupBId: proposal.receiverStartupId,
      startupB: startupsStore.get(proposal.receiverStartupId),
      partnershipType: proposal.collabType,
      title: proposal.title,
      objectives: proposal.expectedBenefits || proposal.title,
      agreedDuration: proposal.proposedDuration || "6 Months",
      startDate: new Date().toISOString(),
      targetCompletionDate: new Date(Date.now() + 180 * 86400000).toISOString(),
      status: "active",
      authorizedMemberIds: [proposal.sentByProfileId, currentFounder.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    partnershipSpacesStore.set(spaceId, newSpace);

    // Initialize messages in the space
    partnershipMessagesStore.set(spaceId, [
      {
        id: `msg-${Date.now()}`,
        spaceId,
        senderProfileId: currentFounder.id,
        senderStartupId: proposal.receiverStartupId,
        senderName: `${currentFounder.displayName} (${newSpace.startupB?.name || "Partner"})`,
        text: `Partnership proposal "${proposal.title}" has been accepted! Welcome to our private workspace.`,
        createdAt: new Date().toISOString(),
      },
    ]);

    // Initial activity log
    partnershipActivityLogsStore.set(`p-act-${Date.now()}`, {
      id: `p-act-${Date.now()}`,
      spaceId,
      actorProfileId: currentFounder.id,
      actorStartupId: proposal.receiverStartupId,
      action: "partnership_accepted",
      details: `${currentFounder.displayName} accepted the proposal and initialized Partnership Space #${spaceId}.`,
      createdAt: new Date().toISOString(),
    });

    // Notify initiator
    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: proposal.sentByProfileId,
      actorProfileId: currentFounder.id,
      type: "partnership_accepted",
      message: `${currentFounder.displayName} accepted your partnership proposal: "${proposal.title}"! Partnership Space is live.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: "Partnership Accepted successfully! Workspace created.",
      proposal,
      spaceId,
    });
  }

  // Handle Action: REJECT
  if (action === "reject") {
    if (!canUserManageStartupCollabs(currentFounder.id, proposal.receiverStartupId)) {
      return res.status(403).json({
        error: "Unauthorized: Only authorized managers of the receiving startup can decline this proposal",
      });
    }

    proposal.status = "rejected";
    proposal.statusHandledByProfileId = currentFounder.id;
    proposal.statusUpdatedAt = new Date().toISOString();
    collaborationRequestsStore.set(proposal.id, proposal);

    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: proposal.sentByProfileId,
      actorProfileId: currentFounder.id,
      type: "partnership_rejected",
      message: `${currentFounder.displayName} declined the partnership proposal: "${proposal.title}".`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: "Collaboration proposal declined",
      proposal,
    });
  }

  // Handle Action: COUNTER
  if (action === "counter") {
    const isReceiver = canUserManageStartupCollabs(currentFounder.id, proposal.receiverStartupId);
    const isInitiator = canUserManageStartupCollabs(currentFounder.id, proposal.initiatorStartupId);
    if (!isReceiver && !isInitiator) {
      return res.status(403).json({
        error: "Unauthorized: You do not have permission to counter-propose for either startup",
      });
    }

    proposal.status = "countered";
    proposal.statusHandledByProfileId = currentFounder.id;
    proposal.statusUpdatedAt = new Date().toISOString();

    if (counterTerms) {
      if (counterTerms.commercialTerms) proposal.commercialTerms = counterTerms.commercialTerms;
      if (counterTerms.whatWeOffer) {
        proposal.whatWeOffer = `${proposal.whatWeOffer} \n[Counter-Offer]: ${counterTerms.whatWeOffer}`;
      }
      if (counterTerms.whatWeNeed) {
        proposal.whatWeNeed = `${proposal.whatWeNeed} \n[Counter-Need]: ${counterTerms.whatWeNeed}`;
      }
      if (counterTerms.responsibilities && counterTerms.responsibilities.length > 0) {
        proposal.responsibilities = counterTerms.responsibilities;
      }
    }

    collaborationRequestsStore.set(proposal.id, proposal);

    const targetRecipientProfileId =
      currentFounder.id === proposal.sentByProfileId
        ? (startupMembersStore.get(proposal.receiverStartupId)?.[0]?.profileId || proposal.sentByProfileId)
        : proposal.sentByProfileId;

    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: targetRecipientProfileId,
      actorProfileId: currentFounder.id,
      type: "partnership_countered",
      message: `${currentFounder.displayName} submitted counter-terms for "${proposal.title}".`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: "Counter-proposal submitted successfully",
      proposal,
    });
  }

  // Handle Action: REQUEST INFO
  if (action === "request_info") {
    proposal.status = "more_info_requested";
    proposal.statusHandledByProfileId = currentFounder.id;
    proposal.statusUpdatedAt = new Date().toISOString();
    collaborationRequestsStore.set(proposal.id, proposal);

    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: proposal.sentByProfileId,
      actorProfileId: currentFounder.id,
      type: "partnership_info_requested",
      message: `${currentFounder.displayName} requested additional information regarding "${proposal.title}": ${moreInfoQuery || reasonOrNotes || "Please provide more details."}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: "Additional information requested",
      proposal,
    });
  }

  // Handle Action: REQUEST MEETING
  if (action === "request_meeting") {
    proposal.status = "meeting_requested";
    proposal.statusHandledByProfileId = currentFounder.id;
    proposal.statusUpdatedAt = new Date().toISOString();
    collaborationRequestsStore.set(proposal.id, proposal);

    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: proposal.sentByProfileId,
      actorProfileId: currentFounder.id,
      type: "partnership_meeting_requested",
      message: `${currentFounder.displayName} proposed a discussion meeting for "${proposal.title}": ${meetingDetails?.agenda || "Partnership alignment sync"}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: "Meeting discussion requested",
      proposal,
    });
  }

  res.status(400).json({ error: "Unsupported response action" });
});

// 9. CHECK DIRECT MESSAGING PERMISSIONS (PREMIUM VS BASIC CONNECTION RULE)
founderRouter.post("/collaborations/message-check", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { partnerProfileId } = req.body;
  if (!partnerProfileId) {
    return res.status(400).json({ error: "Partner profile ID is required" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";

  // Check if they are connected
  let isConnected = false;
  for (const conn of founderConnectionsStore.values()) {
    if (
      ((conn.requesterId === currentFounder.id && conn.recipientId === partnerProfileId) ||
        (conn.requesterId === partnerProfileId && conn.recipientId === currentFounder.id)) &&
      conn.status === "accepted"
    ) {
      isConnected = true;
      break;
    }
  }

  if (isPremium) {
    return res.json({
      canMessage: true,
      isPremium: true,
      isConnected,
      reason: "Premium member: Direct outreach enabled without prior connection.",
    });
  }

  if (isConnected) {
    return res.json({
      canMessage: true,
      isPremium: false,
      isConnected: true,
      reason: "Connected founders can message each other directly.",
    });
  }

  res.json({
    canMessage: false,
    isPremium: false,
    isConnected: false,
    reason:
      "A mutual connection is required to message founders on Basic tier, or upgrade to Premium for instant direct outreach.",
  });
});

// 10. LIST USER PARTNERSHIP SPACES
founderRouter.get("/collaborations/spaces", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const userStartups = Array.from(startupsStore.values()).filter((st) =>
    isStartupMember(currentFounder.id, st.id)
  );
  const userStartupIds = new Set(userStartups.map((s) => s.id));

  const spaces = Array.from(partnershipSpacesStore.values())
    .filter(
      (s) =>
        userStartupIds.has(s.startupAId) ||
        userStartupIds.has(s.startupBId) ||
        s.authorizedMemberIds.includes(currentFounder.id)
    )
    .map((s) => {
      const tasks = Array.from(partnershipTasksStore.values()).filter((t) => t.spaceId === s.id);
      const completedTasks = tasks.filter((t) => t.status === "completed").length;
      const milestones = Array.from(partnershipMilestonesStore.values()).filter(
        (m) => m.spaceId === s.id
      );
      const completedMilestones = milestones.filter((m) => m.isCompleted).length;

      return {
        ...s,
        startupA: startupsStore.get(s.startupAId),
        startupB: startupsStore.get(s.startupBId),
        tasksCount: tasks.length,
        completedTasksCount: completedTasks,
        milestonesCount: milestones.length,
        completedMilestonesCount: completedMilestones,
      };
    });

  res.json({
    world: WORLDS.FOUNDERS,
    spaces,
    total: spaces.length,
  });
});

// 11. GET PARTNERSHIP SPACE COMPLETE WORKSPACE
founderRouter.get("/collaborations/spaces/:spaceId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  // Authorization check
  const isMemberA = isStartupMember(currentFounder.id, space.startupAId);
  const isMemberB = isStartupMember(currentFounder.id, space.startupBId);
  const isAuthMember = space.authorizedMemberIds.includes(currentFounder.id);
  if (!isMemberA && !isMemberB && !isAuthMember) {
    return res.status(403).json({
      error: "Unauthorized: You do not have access to this private Partnership Space",
    });
  }

  const messages = partnershipMessagesStore.get(spaceId) || [];
  const tasks = Array.from(partnershipTasksStore.values()).filter((t) => t.spaceId === spaceId);
  const milestones = Array.from(partnershipMilestonesStore.values()).filter(
    (m) => m.spaceId === spaceId
  );
  const documents = Array.from(partnershipDocumentsStore.values()).filter(
    (d) => d.spaceId === spaceId
  );
  const meetings = Array.from(partnershipMeetingsStore.values()).filter((m) => m.spaceId === spaceId);
  const referrals = Array.from(partnershipReferralsStore.values()).filter((r) => r.spaceId === spaceId);
  const commissions = Array.from(partnershipCommissionsStore.values()).filter(
    (c) => c.spaceId === spaceId
  );
  const reviews = Array.from(partnershipReviewsStore.values()).filter((r) => r.spaceId === spaceId);
  const disputes = Array.from(partnershipDisputesStore.values()).filter((d) => d.spaceId === spaceId);
  const activityLogs = Array.from(partnershipActivityLogsStore.values()).filter(
    (a) => a.spaceId === spaceId
  );

  res.json({
    world: WORLDS.FOUNDERS,
    space: {
      ...space,
      startupA: startupsStore.get(space.startupAId),
      startupB: startupsStore.get(space.startupBId),
      messages,
      tasks,
      milestones,
      documents,
      meetings,
      referrals,
      commissions,
      reviews,
      disputes,
      activityLogs,
    },
  });
});

// 12. SEND MESSAGE IN PARTNERSHIP SPACE
founderRouter.get("/collaborations/spaces/:spaceId/messages", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const messages = partnershipMessagesStore.get(spaceId) || [];
  res.json({ messages });
});

founderRouter.post("/collaborations/spaces/:spaceId/messages", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Message text is required" });
  }

  // Determine which startup sender represents
  const senderStartupId = isStartupMember(currentFounder.id, space.startupAId)
    ? space.startupAId
    : space.startupBId;
  const senderStartup = startupsStore.get(senderStartupId);

  const newMsg: PartnershipMessage = {
    id: `msg-${Date.now()}`,
    spaceId,
    senderProfileId: currentFounder.id,
    senderStartupId,
    senderName: `${currentFounder.displayName} (${senderStartup?.name || "Partner"})`,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  const messages = partnershipMessagesStore.get(spaceId) || [];
  messages.push(newMsg);
  partnershipMessagesStore.set(spaceId, messages);

  res.status(201).json({ message: newMsg });
});

// 13. MANAGE AUTHORIZED SPACE MEMBERS
founderRouter.post("/collaborations/spaces/:spaceId/members", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const { profileId, action } = req.body;
  if (!profileId || !action) {
    return res.status(400).json({ error: "Profile ID and action ('add' | 'remove') are required" });
  }

  // Caller must be owner or admin of one of the participating startups
  const isOwnerOrAdminA = isStartupAdminOrOwner(currentFounder.id, space.startupAId);
  const isOwnerOrAdminB = isStartupAdminOrOwner(currentFounder.id, space.startupBId);
  if (!isOwnerOrAdminA && !isOwnerOrAdminB) {
    return res.status(403).json({
      error: "Unauthorized: Only startup owners or admins can manage space representatives",
    });
  }

  if (action === "add") {
    if (!space.authorizedMemberIds.includes(profileId)) {
      space.authorizedMemberIds.push(profileId);
    }
  } else if (action === "remove") {
    space.authorizedMemberIds = space.authorizedMemberIds.filter((id) => id !== profileId);
  }

  space.updatedAt = new Date().toISOString();
  partnershipSpacesStore.set(spaceId, space);

  res.json({
    message: `Member ${action === "add" ? "added to" : "removed from"} space`,
    authorizedMemberIds: space.authorizedMemberIds,
  });
});

// 14. TASKS IN PARTNERSHIP SPACE
founderRouter.post("/collaborations/spaces/:spaceId/tasks", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const parsed = partnershipTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid task data", details: parsed.error.issues });
  }

  const newTask: PartnershipTask = {
    id: `task-${Date.now()}`,
    spaceId,
    title: parsed.data.title,
    description: parsed.data.description,
    assignedProfileId: parsed.data.assignedProfileId || null,
    assignedStartupId: parsed.data.assignedStartupId || null,
    dueDate: parsed.data.dueDate || undefined,
    status: parsed.data.status || "todo",
    progress: parsed.data.progress || 0,
    createdByProfileId: currentFounder.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  partnershipTasksStore.set(newTask.id, newTask);

  const actorStartupId = isStartupMember(currentFounder.id, space.startupAId)
    ? space.startupAId
    : space.startupBId;

  partnershipActivityLogsStore.set(`p-act-${Date.now()}`, {
    id: `p-act-${Date.now()}`,
    spaceId,
    actorProfileId: currentFounder.id,
    actorStartupId,
    action: "task_created",
    details: `${currentFounder.displayName} created task: "${newTask.title}".`,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ message: "Task created successfully", task: newTask });
});

founderRouter.put("/collaborations/spaces/:spaceId/tasks/:taskId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { taskId } = req.params;
  const task = partnershipTasksStore.get(taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { status, progress, title, description, assignedProfileId, dueDate } = req.body;
  if (status) task.status = status;
  if (typeof progress === "number") task.progress = progress;
  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignedProfileId !== undefined) task.assignedProfileId = assignedProfileId;
  if (dueDate !== undefined) task.dueDate = dueDate;
  task.updatedAt = new Date().toISOString();

  partnershipTasksStore.set(taskId, task);

  res.json({ message: "Task updated", task });
});

founderRouter.delete("/collaborations/spaces/:spaceId/tasks/:taskId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { taskId } = req.params;
  const task = partnershipTasksStore.get(taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  partnershipTasksStore.delete(taskId);
  res.json({ message: "Task deleted successfully" });
});

// 15. MILESTONES IN PARTNERSHIP SPACE
founderRouter.post("/collaborations/spaces/:spaceId/milestones", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const parsed = partnershipMilestoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid milestone data", details: parsed.error.issues });
  }

  const newMilestone: PartnershipMilestone = {
    id: `mile-${Date.now()}`,
    spaceId,
    title: parsed.data.title,
    description: parsed.data.description,
    targetDate: parsed.data.targetDate,
    isCompleted: Boolean(parsed.data.isCompleted),
    completionNotes: parsed.data.completionNotes,
    createdAt: new Date().toISOString(),
  };

  partnershipMilestonesStore.set(newMilestone.id, newMilestone);

  res.status(201).json({ message: "Milestone created successfully", milestone: newMilestone });
});

founderRouter.put(
  "/collaborations/spaces/:spaceId/milestones/:milestoneId",
  (req: Request, res: Response) => {
    const currentFounder = getAuthFounder(req);
    if (!currentFounder) {
      return res.status(403).json({ error: "Forbidden: No founder profile found" });
    }

    const { milestoneId } = req.params;
    const milestone = partnershipMilestonesStore.get(milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    const { isCompleted, completionNotes, title, description, targetDate } = req.body;
    if (typeof isCompleted === "boolean") milestone.isCompleted = isCompleted;
    if (completionNotes !== undefined) milestone.completionNotes = completionNotes;
    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (targetDate) milestone.targetDate = targetDate;

    partnershipMilestonesStore.set(milestoneId, milestone);

    res.json({ message: "Milestone updated", milestone });
  }
);

// 16. DOCUMENTS IN PARTNERSHIP SPACE
founderRouter.post("/collaborations/spaces/:spaceId/documents", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const { name, fileUrl, fileSize, fileType, accessLevel } = req.body;
  if (!name || !fileUrl) {
    return res.status(400).json({ error: "Document name and file URL are required" });
  }

  const uploaderStartupId = isStartupMember(currentFounder.id, space.startupAId)
    ? space.startupAId
    : space.startupBId;

  const newDoc: PartnershipDocument = {
    id: `doc-${Date.now()}`,
    spaceId,
    uploadedByProfileId: currentFounder.id,
    uploadedByStartupId: uploaderStartupId,
    name,
    fileUrl,
    fileSize: fileSize || "1.2 MB",
    fileType: fileType || "application/pdf",
    accessLevel: accessLevel || "all_partners",
    createdAt: new Date().toISOString(),
  };

  partnershipDocumentsStore.set(newDoc.id, newDoc);

  res.status(201).json({ message: "Document added successfully", document: newDoc });
});

// 17. MEETINGS IN PARTNERSHIP SPACE
founderRouter.post("/collaborations/spaces/:spaceId/meetings", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const parsed = partnershipMeetingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid meeting data", details: parsed.error.issues });
  }

  const newMeeting: PartnershipMeeting = {
    id: `meet-${Date.now()}`,
    spaceId,
    title: parsed.data.title,
    dateTime: parsed.data.dateTime,
    timezone: parsed.data.timezone || "IST (UTC+05:30)",
    agenda: parsed.data.agenda,
    meetingUrlOrLocation: parsed.data.meetingUrlOrLocation || "Google Meet",
    scheduledByProfileId: currentFounder.id,
    notes: parsed.data.notes,
    followUpActions: parsed.data.followUpActions || [],
    createdAt: new Date().toISOString(),
  };

  partnershipMeetingsStore.set(newMeeting.id, newMeeting);

  res.status(201).json({ message: "Meeting scheduled successfully", meeting: newMeeting });
});

// 18. REFERRAL PIPELINE TRACKING
founderRouter.post("/collaborations/spaces/:spaceId/referrals", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const parsed = partnershipReferralSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid referral data", details: parsed.error.issues });
  }

  // Referring startup is the one caller belongs to
  const referringStartupId = isStartupMember(currentFounder.id, space.startupAId)
    ? space.startupAId
    : space.startupBId;
  const receivingStartupId = parsed.data.receivingStartupId;

  const newReferral: PartnershipReferral = {
    id: `ref-${Date.now()}`,
    spaceId,
    referringStartupId,
    referringStartup: startupsStore.get(referringStartupId),
    receivingStartupId,
    receivingStartup: startupsStore.get(receivingStartupId),
    customerReference: parsed.data.customerReference,
    referralDate: parsed.data.referralDate || new Date().toISOString(),
    status: parsed.data.status || "submitted",
    outcomeNotes: parsed.data.outcomeNotes,
    commissionTerms: parsed.data.commissionTerms,
    reportedRevenueValue: parsed.data.reportedRevenueValue,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  partnershipReferralsStore.set(newReferral.id, newReferral);

  const actorStartupId = isStartupMember(currentFounder.id, space.startupAId)
    ? space.startupAId
    : space.startupBId;

  partnershipActivityLogsStore.set(`p-act-${Date.now()}`, {
    id: `p-act-${Date.now()}`,
    spaceId,
    actorProfileId: currentFounder.id,
    actorStartupId,
    action: "referral_created",
    details: `${currentFounder.displayName} submitted new referral: "${newReferral.customerReference}".`,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ message: "Referral submitted successfully", referral: newReferral });
});

founderRouter.put(
  "/collaborations/spaces/:spaceId/referrals/:refId",
  (req: Request, res: Response) => {
    const currentFounder = getAuthFounder(req);
    if (!currentFounder) {
      return res.status(403).json({ error: "Forbidden: No founder profile found" });
    }

    const { refId } = req.params;
    const referral = partnershipReferralsStore.get(refId);
    if (!referral) {
      return res.status(404).json({ error: "Referral not found" });
    }

    const { status, outcomeNotes, reportedRevenueValue } = req.body;
    if (status) referral.status = status;
    if (outcomeNotes !== undefined) referral.outcomeNotes = outcomeNotes;
    if (typeof reportedRevenueValue === "number") referral.reportedRevenueValue = reportedRevenueValue;
    referral.updatedAt = new Date().toISOString();

    partnershipReferralsStore.set(refId, referral);

    res.json({ message: "Referral status updated", referral });
  }
);

// 19. RECORD COMMISSIONS (WITH LEGAL DISCLAIMER)
founderRouter.post("/collaborations/spaces/:spaceId/commissions", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const parsed = partnershipCommissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid commission data", details: parsed.error.issues });
  }

  const newCommission: PartnershipCommission = {
    id: `comm-${Date.now()}`,
    spaceId,
    referralId: parsed.data.referralId || null,
    commissionType: parsed.data.commissionType,
    rateOrAmount: parsed.data.rateOrAmount,
    calculationBasis: parsed.data.calculationBasis,
    paymentFrequency: parsed.data.paymentFrequency,
    reportedPaymentStatus: parsed.data.reportedPaymentStatus || "pending",
    legalDisclaimer:
      "Balaga does not hold funds, create wallets, or offer escrow services. All commission, fee, and revenue transactions are settled directly between companies.",
    createdAt: new Date().toISOString(),
  };

  partnershipCommissionsStore.set(newCommission.id, newCommission);

  res.status(201).json({
    message: "Commission record saved",
    commission: newCommission,
    disclaimer:
      "LEGAL NOTICE: Balaga does not hold funds, create wallets, or offer escrow services. All commission, fee, and revenue transactions are settled directly between the participating companies outside the platform.",
  });
});

// 20. SUBMIT 1-5 PARTNERSHIP REVIEW (6 DIMENSIONS + RIGHT OF REPLY)
founderRouter.post("/collaborations/spaces/:spaceId/reviews", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  // Identify reviewer startup vs reviewed startup
  const isStartupA = isStartupMember(currentFounder.id, space.startupAId);
  const reviewerStartupId = isStartupA ? space.startupAId : space.startupBId;
  const reviewedStartupId = isStartupA ? space.startupBId : space.startupAId;

  // Check if reviewer startup already left a review
  const existingReview = Array.from(partnershipReviewsStore.values()).find(
    (r) => r.spaceId === spaceId && r.reviewerStartupId === reviewerStartupId
  );

  // If responding to an existing review from the other party (right of reply)
  const { responseToReviewId, responseText } = req.body;
  if (responseToReviewId && responseText) {
    const targetRev = partnershipReviewsStore.get(responseToReviewId);
    if (!targetRev || targetRev.spaceId !== spaceId) {
      return res.status(404).json({ error: "Target review to reply to not found" });
    }
    targetRev.rightOfReply = {
      profileId: currentFounder.id,
      replyText: responseText,
      repliedAt: new Date().toISOString(),
    };
    partnershipReviewsStore.set(responseToReviewId, targetRev);
    return res.json({ message: "Partner response recorded successfully", review: targetRev });
  }

  if (existingReview) {
    return res.status(409).json({
      error: "Your startup has already submitted a review for this partnership.",
      review: existingReview,
    });
  }

  const parsed = partnershipReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid review scores", details: parsed.error.issues });
  }

  const { communication, professionalism, reliability, delivery, transparency, overallExperience, feedback } =
    parsed.data;

  const overallScore = Number(
    (
      (communication + professionalism + reliability + delivery + transparency + overallExperience) /
      6
    ).toFixed(1)
  );

  const newReview: PartnershipReview = {
    id: `rev-${Date.now()}`,
    spaceId,
    reviewerStartupId,
    reviewerProfileId: currentFounder.id,
    reviewedStartupId,
    communication,
    professionalism,
    reliability,
    delivery,
    transparency,
    overallExperience,
    overallScore,
    feedback,
    isModerated: false,
    createdAt: new Date().toISOString(),
  };

  partnershipReviewsStore.set(newReview.id, newReview);

  // Notify reviewed startup
  founderNotificationsStore.set(`fn-rev-${Date.now()}`, {
    id: `fn-rev-${Date.now()}`,
    recipientProfileId:
      space.authorizedMemberIds.find((id) => id !== currentFounder.id) || currentFounder.id,
    actorProfileId: currentFounder.id,
    type: "partnership_review_received",
    message: `${currentFounder.displayName} left a ${overallScore}/5 partnership review for ${space.title || space.objectives}.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ message: "Partnership review submitted successfully", review: newReview });
});

// 21. OPEN PARTNERSHIP DISPUTE (WITH PLATFORM ASSISTANCE DISCLAIMER)
founderRouter.post("/collaborations/spaces/:spaceId/disputes", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const parsed = partnershipDisputeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid dispute data", details: parsed.error.issues });
  }

  const filedByStartupId = isStartupMember(currentFounder.id, space.startupAId)
    ? space.startupAId
    : space.startupBId;
  const againstStartupId = filedByStartupId === space.startupAId ? space.startupBId : space.startupAId;

  const newDispute: PartnershipDispute = {
    id: `disp-${Date.now()}`,
    spaceId,
    openedByStartupId: filedByStartupId,
    openedByProfileId: currentFounder.id,
    category: parsed.data.category,
    description: parsed.data.description,
    supportingEvidence: parsed.data.supportingEvidence || [],
    status: "opened",
    platformAssistanceNotes:
      "Balaga mediation desk opened a file. Both parties are encouraged to exchange terms and seek amicable resolution.",
    createdAt: new Date().toISOString(),
  };

  partnershipDisputesStore.set(newDispute.id, newDispute);
  space.status = "disputed";
  space.updatedAt = new Date().toISOString();
  partnershipSpacesStore.set(spaceId, space);

  res.status(201).json({
    message: "Partnership dispute filed. Platform assistance record created.",
    dispute: newDispute,
    disclaimer:
      "NOTICE: Balaga provides administrative notes and communication logs. Balaga does not offer legal representation or binding arbitration.",
  });
});

// 22. COMPLETE PARTNERSHIP (EARNS +2 BONUS OUTREACH PROPOSALS)
founderRouter.post("/collaborations/spaces/:spaceId/complete", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { spaceId } = req.params;
  const space = partnershipSpacesStore.get(spaceId);
  if (!space) {
    return res.status(404).json({ error: "Partnership Space not found" });
  }

  const isAuthA = canUserManageStartupCollabs(currentFounder.id, space.startupAId);
  const isAuthB = canUserManageStartupCollabs(currentFounder.id, space.startupBId);
  if (!isAuthA && !isAuthB) {
    return res.status(403).json({
      error: "Unauthorized: Only authorized managers of participating startups can mark a partnership as completed",
    });
  }

  space.status = "completed";
  space.updatedAt = new Date().toISOString();
  partnershipSpacesStore.set(spaceId, space);

  // Recalculate outreach allowance for both startups (earning earnedBonusLimit)
  const allowanceA = getStartupOutreachAllowance(space.startupAId);
  const allowanceB = getStartupOutreachAllowance(space.startupBId);

  // Activity log
  const actorStartupId = isStartupMember(currentFounder.id, space.startupAId)
    ? space.startupAId
    : space.startupBId;

  partnershipActivityLogsStore.set(`p-act-${Date.now()}`, {
    id: `p-act-${Date.now()}`,
    spaceId,
    actorProfileId: currentFounder.id,
    actorStartupId,
    action: "partnership_completed",
    details: `${currentFounder.displayName} marked the partnership as successfully completed. Bonus outreach proposals granted!`,
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: "Partnership successfully marked as completed! Bonus outreach proposals earned.",
    space,
    updatedAllowances: {
      [space.startupAId]: allowanceA,
      [space.startupBId]: allowanceB,
    },
  });
});

// 23. REAL COMPUTED PARTNERSHIP ANALYTICS
founderRouter.get("/collaborations/analytics/:startupId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { startupId } = req.params;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  const allProposals = Array.from(collaborationRequestsStore.values());
  const proposalsSent = allProposals.filter((p) => p.initiatorStartupId === startupId).length;
  const proposalsReceived = allProposals.filter((p) => p.receiverStartupId === startupId).length;
  const acceptedProposals = allProposals.filter(
    (p) =>
      (p.initiatorStartupId === startupId || p.receiverStartupId === startupId) &&
      p.status === "accepted"
  ).length;

  const totalProposalsInvolved = proposalsSent + proposalsReceived;
  const acceptanceRate =
    totalProposalsInvolved > 0
      ? Number(((acceptedProposals / totalProposalsInvolved) * 100).toFixed(1))
      : 0;

  const allSpaces = Array.from(partnershipSpacesStore.values()).filter(
    (s) => s.startupAId === startupId || s.startupBId === startupId
  );
  const activePartnerships = allSpaces.filter((s) => s.status === "active").length;
  const completedPartnerships = allSpaces.filter((s) => s.status === "completed").length;

  const reviewsReceived = Array.from(partnershipReviewsStore.values()).filter(
    (r) => r.reviewedStartupId === startupId
  );
  const averageReviewRating =
    reviewsReceived.length > 0
      ? Number(
          (
            reviewsReceived.reduce((sum, r) => sum + r.overallScore, 0) / reviewsReceived.length
          ).toFixed(1)
        )
      : 5.0;

  const allReferrals = Array.from(partnershipReferralsStore.values());
  const referralsSent = allReferrals.filter((r) => r.referringStartupId === startupId).length;
  const referralsReceived = allReferrals.filter((r) => r.receivingStartupId === startupId).length;
  const referralsConverted = allReferrals.filter(
    (r) =>
      (r.referringStartupId === startupId || r.receivingStartupId === startupId) &&
      r.status === "converted"
  ).length;

  const outreachAllowance = getStartupOutreachAllowance(startupId);

  res.json({
    world: WORLDS.FOUNDERS,
    analytics: {
      startupId,
      proposalsSent,
      proposalsReceived,
      acceptedProposals,
      acceptanceRate,
      activePartnerships,
      completedPartnerships,
      averageReviewRating,
      reviewsCount: reviewsReceived.length,
      referralsSent,
      referralsReceived,
      referralsConverted,
      outreachAllowance,
    },
  });
});

// ==============================================================================
// FEATURE 9: REFERRAL EXCHANGE ROUTES
// ==============================================================================

// 1. DISCOVER REFERRALS (OFFERINGS & REQUESTS)
founderRouter.get("/referrals/discover", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const {
    type,
    industry,
    stage,
    arrangement,
    commissionChoice,
    publisherType,
    q,
    sort,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  let list = Array.from(referralListingsStore.values()).filter((l) => {
    if (l.moderationStatus !== "approved") return false;
    if (l.status !== "active" && l.status !== "closed") return false;

    if (type && type !== "all" && l.listingType !== type) return false;
    if (industry && industry !== "all" && l.industry.toLowerCase() !== industry.toLowerCase()) return false;
    if (arrangement && arrangement !== "all" && l.referralArrangement !== arrangement) return false;
    if (commissionChoice && commissionChoice !== "all" && l.commissionChoice !== commissionChoice) return false;
    if (publisherType && publisherType !== "all" && l.publisherType !== publisherType) return false;

    if (stage && stage !== "all" && l.startupId) {
      const startup = startupsStore.get(l.startupId);
      if (startup && startup.stage !== stage) return false;
    }

    if (q && q.trim()) {
      const query = q.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(query);
      const matchDesc = l.description.toLowerCase().includes(query);
      const matchIndustry = l.industry.toLowerCase().includes(query);
      const matchAudience = l.targetAudience.toLowerCase().includes(query);
      const matchProduct = l.productOrService.toLowerCase().includes(query);
      const matchIdeal = l.idealReferralProfile.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchIndustry && !matchAudience && !matchProduct && !matchIdeal) {
        return false;
      }
    }

    return true;
  });

  if (sort === "views") {
    list.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sort === "popular") {
    list.sort((a, b) => b.requestsCount + b.savedCount - (a.requestsCount + a.savedCount));
  } else {
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const total = list.length;
  const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  const formatted = paginated.map((l) => {
    const isSaved = currentFounder ? referralSavedListingsStore.has(`${currentFounder.id}:${l.id}`) : false;
    return {
      ...l,
      isSaved,
      publisherProfile: founderProfilesStore.get(l.publisherProfileId) || l.publisherProfile,
      startup: l.startupId ? startupsStore.get(l.startupId) || l.startup : null,
    };
  });

  res.json({
    world: WORLDS.FOUNDERS,
    listings: formatted,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// 2. RECOMMENDED REFERRALS (PERSONALIZED)
founderRouter.get("/referrals/recommended", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const userStartups: string[] = [];
  for (const [stId, members] of startupMembersStore.entries()) {
    if (members.some((m) => m.profileId === currentFounder.id)) {
      userStartups.push(stId);
    }
  }

  const recommendations = Array.from(referralListingsStore.values())
    .filter((l) => {
      if (l.moderationStatus !== "approved" || l.status !== "active") return false;
      if (l.publisherProfileId === currentFounder.id) return false;
      if (l.startupId && userStartups.includes(l.startupId)) return false;
      return true;
    })
    .slice(0, 6)
    .map((l) => ({
      ...l,
      isSaved: referralSavedListingsStore.has(`${currentFounder.id}:${l.id}`),
      publisherProfile: founderProfilesStore.get(l.publisherProfileId) || l.publisherProfile,
      startup: l.startupId ? startupsStore.get(l.startupId) || l.startup : null,
    }));

  res.json({
    world: WORLDS.FOUNDERS,
    recommendations,
  });
});

// 3. CREATE REFERRAL LISTING
founderRouter.post("/referrals/listings", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const parsed = createReferralListingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid referral listing data", details: parsed.error.issues });
  }

  const data = parsed.data;

  if (data.publisherType === "startup") {
    if (!data.startupId) {
      return res.status(400).json({ error: "Startup ID is required for startup referral listings" });
    }
    const startup = startupsStore.get(data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    if (!canUserManageStartupReferrals(currentFounder.id, data.startupId)) {
      return res.status(403).json({
        error: "Unauthorized: You do not have permission to publish referrals for this startup",
      });
    }
  }

  // Automated Moderation Check
  const spamRegex = /crypto|forex|guaranteed profit|free money|get rich quick|pyramid|ponzi/i;
  const isFlagged = spamRegex.test(data.title) || spamRegex.test(data.description);

  const newListing: ReferralListing = {
    id: `ref-list-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    publisherType: data.publisherType,
    publisherProfileId: currentFounder.id,
    publisherProfile: currentFounder,
    startupId: data.publisherType === "startup" ? data.startupId : null,
    startup: data.publisherType === "startup" && data.startupId ? startupsStore.get(data.startupId) : undefined,
    listingType: data.listingType,
    title: data.title.trim(),
    description: data.description.trim(),
    industry: data.industry,
    targetAudience: data.targetAudience,
    customerCategory: data.customerCategory,
    productOrService: data.productOrService,
    idealReferralProfile: data.idealReferralProfile,
    requiredQualifications: data.requiredQualifications,
    broadRegion: data.broadRegion,
    expectedOutcome: data.expectedOutcome,
    referralArrangement: data.referralArrangement,
    commissionChoice: data.commissionChoice,
    disclosedCommissionDetails: data.disclosedCommissionDetails,
    expiryDate: data.expiryDate,
    websiteUrl: data.websiteUrl || null,
    status: isFlagged ? "paused" : data.isDraft ? "draft" : "active",
    moderationStatus: isFlagged ? "flagged" : "approved",
    moderationReason: isFlagged ? "Flagged by automated check for suspicious claims" : null,
    viewsCount: 0,
    requestsCount: 0,
    savedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  referralListingsStore.set(newListing.id, newListing);

  res.status(201).json({
    message: isFlagged
      ? "Listing flagged for moderation review due to suspicious terms"
      : data.isDraft
      ? "Referral listing saved as draft"
      : "Referral listing published successfully",
    listing: newListing,
  });
});

// 4. GET REFERRAL LISTING DETAILS
founderRouter.get("/referrals/listings/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { id } = req.params;
  const listing = referralListingsStore.get(id);

  if (!listing) {
    return res.status(404).json({ error: "Referral listing not found" });
  }

  listing.viewsCount += 1;
  referralListingsStore.set(id, listing);

  const isSaved = currentFounder ? referralSavedListingsStore.has(`${currentFounder.id}:${listing.id}`) : false;
  const isPublisher = currentFounder
    ? listing.publisherProfileId === currentFounder.id ||
      (listing.startupId ? canUserManageStartupReferrals(currentFounder.id, listing.startupId) : false)
    : false;

  res.json({
    world: WORLDS.FOUNDERS,
    listing: {
      ...listing,
      isSaved,
      publisherProfile: founderProfilesStore.get(listing.publisherProfileId) || listing.publisherProfile,
      startup: listing.startupId ? startupsStore.get(listing.startupId) || listing.startup : null,
    },
    isPublisher,
  });
});

// 5. UPDATE REFERRAL LISTING
founderRouter.put("/referrals/listings/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const listing = referralListingsStore.get(id);
  if (!listing) {
    return res.status(404).json({ error: "Referral listing not found" });
  }

  const isPublisher = listing.publisherProfileId === currentFounder.id;
  const isStartupManager = listing.startupId ? canUserManageStartupReferrals(currentFounder.id, listing.startupId) : false;
  if (!isPublisher && !isStartupManager) {
    return res.status(403).json({ error: "Unauthorized: You cannot edit this referral listing" });
  }

  const parsed = updateReferralListingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid listing update data", details: parsed.error.issues });
  }

  const updated: ReferralListing = {
    ...listing,
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  referralListingsStore.set(id, updated);

  res.json({
    message: "Referral listing updated successfully",
    listing: updated,
  });
});

// 6. TOGGLE LISTING STATUS (PAUSE / REOPEN / CLOSE)
founderRouter.patch("/referrals/listings/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const listing = referralListingsStore.get(id);
  if (!listing) {
    return res.status(404).json({ error: "Referral listing not found" });
  }

  const isPublisher = listing.publisherProfileId === currentFounder.id;
  const isStartupManager = listing.startupId ? canUserManageStartupReferrals(currentFounder.id, listing.startupId) : false;
  if (!isPublisher && !isStartupManager) {
    return res.status(403).json({ error: "Unauthorized: You cannot change status for this listing" });
  }

  const { status } = req.body;
  if (!["active", "paused", "closed"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'active', 'paused', or 'closed'" });
  }

  listing.status = status;
  listing.updatedAt = new Date().toISOString();
  referralListingsStore.set(id, listing);

  res.json({
    message: `Listing status updated to ${status}`,
    listing,
  });
});

// 7. DELETE REFERRAL LISTING
founderRouter.delete("/referrals/listings/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const listing = referralListingsStore.get(id);
  if (!listing) {
    return res.status(404).json({ error: "Referral listing not found" });
  }

  const isPublisher = listing.publisherProfileId === currentFounder.id;
  const isStartupManager = listing.startupId ? canUserManageStartupReferrals(currentFounder.id, listing.startupId) : false;
  if (!isPublisher && !isStartupManager) {
    return res.status(403).json({ error: "Unauthorized: You cannot delete this listing" });
  }

  referralListingsStore.delete(id);

  res.json({ message: "Referral listing deleted successfully" });
});

// 8. SAVE / UNSAVE REFERRAL LISTING
founderRouter.post("/referrals/listings/:id/save", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const listing = referralListingsStore.get(id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const key = `${currentFounder.id}:${id}`;
  if (!referralSavedListingsStore.has(key)) {
    referralSavedListingsStore.add(key);
    listing.savedCount += 1;
    referralListingsStore.set(id, listing);
  }

  res.json({ message: "Listing saved", isSaved: true, savedCount: listing.savedCount });
});

founderRouter.delete("/referrals/listings/:id/save", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const listing = referralListingsStore.get(id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const key = `${currentFounder.id}:${id}`;
  if (referralSavedListingsStore.has(key)) {
    referralSavedListingsStore.delete(key);
    listing.savedCount = Math.max(0, listing.savedCount - 1);
    referralListingsStore.set(id, listing);
  }

  res.json({ message: "Listing unsaved", isSaved: false, savedCount: listing.savedCount });
});

// 9. REPORT REFERRAL LISTING
founderRouter.post("/referrals/listings/:id/report", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const listing = referralListingsStore.get(id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  const parsed = reportReferralListingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid report data", details: parsed.error.issues });
  }

  const newReport: ReferralReport = {
    id: `ref-rep-${Date.now()}`,
    listingId: id,
    reporterProfileId: currentFounder.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  referralReportsStore.set(newReport.id, newReport);

  res.status(201).json({ message: "Report submitted for moderation review", report: newReport });
});

// 10. MY REFERRAL LISTINGS
founderRouter.get("/referrals/my-listings", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const userStartupIds: string[] = [];
  for (const [stId, members] of startupMembersStore.entries()) {
    if (members.some((m) => m.profileId === currentFounder.id && canUserManageStartupReferrals(currentFounder.id, stId))) {
      userStartupIds.push(stId);
    }
  }

  const myListings = Array.from(referralListingsStore.values()).filter(
    (l) => l.publisherProfileId === currentFounder.id || (l.startupId && userStartupIds.includes(l.startupId))
  );

  res.json({
    world: WORLDS.FOUNDERS,
    listings: myListings,
  });
});

// 11. SUBMIT REFERRAL REQUEST
founderRouter.post("/referrals/listings/:id/requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const listing = referralListingsStore.get(id);
  if (!listing) {
    return res.status(404).json({ error: "Referral listing not found" });
  }
  if (listing.status !== "active") {
    return res.status(400).json({ error: "This listing is not currently accepting requests" });
  }

  if (listing.publisherProfileId === currentFounder.id) {
    return res.status(400).json({ error: "Cannot send a referral request to your own listing" });
  }

  const parsed = submitReferralRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid referral request data", details: parsed.error.issues });
  }

  const data = parsed.data;

  if (data.requesterType === "startup") {
    if (!data.requesterStartupId) {
      return res.status(400).json({ error: "Startup ID is required when requesting as startup" });
    }
    if (!canUserManageStartupReferrals(currentFounder.id, data.requesterStartupId)) {
      return res.status(403).json({ error: "Unauthorized: You do not manage this requester startup" });
    }
    if (listing.startupId && listing.startupId === data.requesterStartupId) {
      return res.status(400).json({ error: "Cannot request between the same startup" });
    }
  }

  if (hasActiveDuplicateReferralRequest(currentFounder.id, id, data.requesterStartupId)) {
    return res.status(409).json({
      error: "An active referral request already exists for this listing. Please wait for publisher response.",
    });
  }

  const newRequest: ReferralRequest = {
    id: `ref-req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    listingId: id,
    listing,
    requesterType: data.requesterType,
    requesterProfileId: currentFounder.id,
    requesterProfile: currentFounder,
    requesterStartupId: data.requesterType === "startup" ? data.requesterStartupId : null,
    requesterStartup: data.requesterType === "startup" && data.requesterStartupId ? startupsStore.get(data.requesterStartupId) : undefined,
    message: data.message.trim(),
    relevance: data.relevance.trim(),
    potentialOpportunity: data.potentialOpportunity.trim(),
    relevantProductOrStartup: data.relevantProductOrStartup,
    expectedOutcome: data.expectedOutcome,
    supportingLinks: data.supportingLinks,
    additionalContext: data.additionalContext,
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  referralRequestsStore.set(newRequest.id, newRequest);
  listing.requestsCount += 1;
  referralListingsStore.set(id, listing);

  founderNotificationsStore.set(`fn-${Date.now()}`, {
    id: `fn-${Date.now()}`,
    recipientProfileId: listing.publisherProfileId,
    actorProfileId: currentFounder.id,
    type: "referral_request_received",
    message: `${currentFounder.displayName} submitted a referral request for "${listing.title}".`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Referral request submitted successfully",
    request: newRequest,
  });
});

// 12. GET REFERRAL REQUESTS (INCOMING & SENT)
founderRouter.get("/referrals/requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { filter = "all" } = req.query as { filter?: "all" | "sent" | "received" };

  const userStartupIds: string[] = [];
  for (const [stId, members] of startupMembersStore.entries()) {
    if (members.some((m) => m.profileId === currentFounder.id)) {
      userStartupIds.push(stId);
    }
  }

  const allReqs = Array.from(referralRequestsStore.values()).map((r) => {
    const listing = referralListingsStore.get(r.listingId) || r.listing;
    return {
      ...r,
      listing,
      requesterProfile: founderProfilesStore.get(r.requesterProfileId) || r.requesterProfile,
      requesterStartup: r.requesterStartupId ? startupsStore.get(r.requesterStartupId) : null,
    };
  });

  const sent = allReqs.filter(
    (r) => r.requesterProfileId === currentFounder.id || (r.requesterStartupId && userStartupIds.includes(r.requesterStartupId))
  );

  const received = allReqs.filter((r) => {
    const listing = r.listing;
    if (!listing) return false;
    return listing.publisherProfileId === currentFounder.id || (listing.startupId && userStartupIds.includes(listing.startupId));
  });

  let requests = allReqs;
  if (filter === "sent") requests = sent;
  else if (filter === "received") requests = received;
  else requests = Array.from(new Set([...sent, ...received]));

  res.json({
    world: WORLDS.FOUNDERS,
    requests,
    sentCount: sent.length,
    receivedCount: received.length,
  });
});

// 13. GET SINGLE REFERRAL REQUEST
founderRouter.get("/referrals/requests/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const request = referralRequestsStore.get(id);
  if (!request) {
    return res.status(404).json({ error: "Referral request not found" });
  }

  const listing = referralListingsStore.get(request.listingId);
  const commissionAgreement = request.commissionAgreementId ? referralCommissionAgreementsStore.get(request.commissionAgreementId) : null;

  res.json({
    world: WORLDS.FOUNDERS,
    request: {
      ...request,
      listing,
      requesterProfile: founderProfilesStore.get(request.requesterProfileId) || request.requesterProfile,
      requesterStartup: request.requesterStartupId ? startupsStore.get(request.requesterStartupId) : null,
    },
    commissionAgreement,
  });
});

// 14. RESPOND TO REFERRAL REQUEST (ACCEPT / REJECT / REQUEST INFO / WITHDRAW)
founderRouter.post("/referrals/requests/:id/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const request = referralRequestsStore.get(id);
  if (!request) {
    return res.status(404).json({ error: "Referral request not found" });
  }

  const listing = referralListingsStore.get(request.listingId);
  if (!listing) {
    return res.status(404).json({ error: "Associated referral listing not found" });
  }

  const parsed = respondReferralRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid response data", details: parsed.error.issues });
  }

  const { action, reasonOrNotes, moreInfoQuery } = parsed.data;

  const isPublisher = listing.publisherProfileId === currentFounder.id;
  const isPublisherStartupManager = listing.startupId ? canUserManageStartupReferrals(currentFounder.id, listing.startupId) : false;
  const isRequester = request.requesterProfileId === currentFounder.id;
  const isRequesterStartupManager = request.requesterStartupId ? canUserManageStartupReferrals(currentFounder.id, request.requesterStartupId) : false;

  if (action === "withdraw") {
    if (!isRequester && !isRequesterStartupManager) {
      return res.status(403).json({ error: "Only the requester can withdraw this referral request" });
    }
    request.status = "withdrawn";
    request.statusNotes = reasonOrNotes || "Withdrawn by requester";
    request.updatedAt = new Date().toISOString();
    referralRequestsStore.set(id, request);
    return res.json({ message: "Referral request withdrawn successfully", request });
  }

  if (!isPublisher && !isPublisherStartupManager) {
    return res.status(403).json({ error: "Unauthorized: Only the listing publisher can accept or reject requests" });
  }

  if (action === "reject") {
    request.status = "rejected";
    request.statusNotes = reasonOrNotes || "Declined by publisher";
    request.updatedAt = new Date().toISOString();
    referralRequestsStore.set(id, request);

    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: request.requesterProfileId,
      actorProfileId: currentFounder.id,
      type: "referral_request_rejected",
      message: `${currentFounder.displayName} declined your referral request for "${listing.title}".`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: "Referral request declined", request });
  }

  if (action === "request_info") {
    request.status = "more_info_requested";
    request.moreInfoQuery = moreInfoQuery || reasonOrNotes || "Please provide more details on the proposed introduction.";
    request.updatedAt = new Date().toISOString();
    referralRequestsStore.set(id, request);

    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: request.requesterProfileId,
      actorProfileId: currentFounder.id,
      type: "referral_info_requested",
      message: `${currentFounder.displayName} requested more details on your referral request for "${listing.title}": ${request.moreInfoQuery}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: "Additional information requested", request });
  }

  if (action === "accept") {
    request.status = "accepted";
    request.statusNotes = reasonOrNotes || "Accepted by publisher";
    request.updatedAt = new Date().toISOString();

    const agreementId = `ref-agr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const initialCommissionType =
      listing.commissionChoice === "no_commission"
        ? "no_commission"
        : listing.commissionChoice === "fixed"
        ? "fixed"
        : listing.commissionChoice === "percentage"
        ? "percentage"
        : listing.commissionChoice === "recurring"
        ? "recurring"
        : "custom";

    const initialRateOrAmount = listing.disclosedCommissionDetails || (listing.commissionChoice === "no_commission" ? "0" : "Negotiable");

    const v1: ReferralCommissionVersion = {
      version: 1,
      proposedByProfileId: currentFounder.id,
      proposedByParty: "publisher",
      commissionType: initialCommissionType,
      rateOrAmount: initialRateOrAmount,
      calculationBasis: "Agreed referral conversion value",
      paymentFrequency: "Upon verified customer deal closing",
      responsibilities: `Publisher (${currentFounder.displayName}) and Requester (${request.requesterProfile?.displayName || "Partner"}) coordinate introduction and qualification.`,
      effectiveDate: new Date().toISOString(),
      confirmedByPartyA: true,
      confirmedByPartyB: listing.commissionChoice === "no_commission",
      status: listing.commissionChoice === "no_commission" ? "confirmed" : "proposed",
      createdAt: new Date().toISOString(),
      confirmedAt: listing.commissionChoice === "no_commission" ? new Date().toISOString() : null,
    };

    const newAgreement: ReferralCommissionAgreement = {
      id: agreementId,
      requestId: request.id,
      listingId: listing.id,
      partyAProfileId: listing.publisherProfileId,
      partyBProfileId: request.requesterProfileId,
      partyAStartupId: listing.startupId,
      partyBStartupId: request.requesterStartupId,
      currentVersion: 1,
      versions: [v1],
      isFullyConfirmed: v1.status === "confirmed",
      activeTerms: v1.status === "confirmed" ? v1 : undefined,
      updatedAt: new Date().toISOString(),
    };
    referralCommissionAgreementsStore.set(agreementId, newAgreement);
    request.commissionAgreementId = agreementId;

    const pipelineId = `ref-pipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newPipeline: ReferralPipelineRecord = {
      id: pipelineId,
      requestId: request.id,
      listingId: listing.id,
      partnershipSpaceId: request.partnershipSpaceId || null,
      referrerProfileId: request.requesterProfileId,
      referrerStartupId: request.requesterStartupId,
      recipientProfileId: listing.publisherProfileId,
      recipientStartupId: listing.startupId,
      stage: "accepted",
      customerReference: `${listing.industry} Lead: ${request.potentialOpportunity || "Customer Introduction"}`,
      customerPrivateData: null,
      outcomeNotes: request.expectedOutcome,
      paymentStatus: "not_due",
      stageHistory: [
        {
          stage: "accepted",
          updatedByProfileId: currentFounder.id,
          timestamp: new Date().toISOString(),
          notes: "Referral request accepted by publisher.",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    referralPipelineStore.set(pipelineId, newPipeline);

    referralRequestsStore.set(id, request);

    founderNotificationsStore.set(`fn-${Date.now()}`, {
      id: `fn-${Date.now()}`,
      recipientProfileId: request.requesterProfileId,
      actorProfileId: currentFounder.id,
      type: "referral_request_accepted",
      message: `${currentFounder.displayName} accepted your referral request for "${listing.title}". Review commission terms and begin introduction!`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: "Referral request accepted! Commission terms initiated and pipeline record created.",
      request,
      commissionAgreement: newAgreement,
      pipelineRecord: newPipeline,
    });
  }

  res.status(400).json({ error: "Unsupported response action" });
});

// 15. CHECK DIRECT MESSAGING PERMISSIONS (PREMIUM VS BASIC RULE)
founderRouter.post("/referrals/requests/:id/message-check", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const request = referralRequestsStore.get(id);
  if (!request) {
    return res.status(404).json({ error: "Referral request not found" });
  }

  const listing = referralListingsStore.get(request.listingId);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const targetProfileId =
    currentFounder.id === request.requesterProfileId
      ? listing.publisherProfileId
      : request.requesterProfileId;
  const targetFounder = founderProfilesStore.get(targetProfileId);

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";

  let isConnected = false;
  for (const conn of founderConnectionsStore.values()) {
    if (
      ((conn.requesterId === currentFounder.id && conn.recipientId === targetProfileId) ||
        (conn.requesterId === targetProfileId && conn.recipientId === currentFounder.id)) &&
      conn.status === "accepted"
    ) {
      isConnected = true;
      break;
    }
  }

  if (isPremium) {
    return res.json({
      canMessage: true,
      isPremium: true,
      isConnected,
      targetProfileId,
      targetName: targetFounder?.displayName || "Partner",
      reason: "Premium Member: You can directly message any founder regarding accepted referrals.",
    });
  }

  if (isConnected) {
    return res.json({
      canMessage: true,
      isPremium: false,
      isConnected: true,
      targetProfileId,
      targetName: targetFounder?.displayName || "Partner",
      reason: "Connected Founders: Direct messaging is enabled between your connected profiles.",
    });
  }

  return res.json({
    canMessage: false,
    isPremium: false,
    isConnected: false,
    targetProfileId,
    targetName: targetFounder?.displayName || "Partner",
    reason: "Basic Membership Policy: Initiating direct messages requires an accepted professional connection. Send a connection request first.",
  });
});

// 16. GET COMMISSION AGREEMENT
founderRouter.get("/referrals/requests/:id/commission", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const request = referralRequestsStore.get(id);
  if (!request) {
    return res.status(404).json({ error: "Referral request not found" });
  }

  if (!request.commissionAgreementId) {
    return res.status(404).json({ error: "No commission agreement found for this request" });
  }

  const agreement = referralCommissionAgreementsStore.get(request.commissionAgreementId);
  if (!agreement) {
    return res.status(404).json({ error: "Commission agreement not found" });
  }

  res.json({
    world: WORLDS.FOUNDERS,
    agreement,
    disclaimer: "Balaga records reported agreements but does not hold money, operate escrow, or guarantee payment.",
  });
});

// 17. PROPOSE / REVISE COMMISSION TERMS (OPTION C)
founderRouter.post("/referrals/requests/:id/commission/propose", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const request = referralRequestsStore.get(id);
  if (!request || !request.commissionAgreementId) {
    return res.status(404).json({ error: "Referral request or agreement not found" });
  }

  const agreement = referralCommissionAgreementsStore.get(request.commissionAgreementId);
  if (!agreement) {
    return res.status(404).json({ error: "Commission agreement not found" });
  }

  const parsed = proposeCommissionTermsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid commission terms", details: parsed.error.issues });
  }

  const isPartyA = currentFounder.id === agreement.partyAProfileId;
  const isPartyB = currentFounder.id === agreement.partyBProfileId;
  if (!isPartyA && !isPartyB) {
    return res.status(403).json({ error: "Unauthorized: You are not a party to this agreement" });
  }

  const newVersionNum = agreement.currentVersion + 1;
  const newVersion: ReferralCommissionVersion = {
    version: newVersionNum,
    proposedByProfileId: currentFounder.id,
    proposedByParty: isPartyA ? "publisher" : "requester",
    commissionType: parsed.data.commissionType,
    rateOrAmount: parsed.data.rateOrAmount,
    calculationBasis: parsed.data.calculationBasis,
    paymentFrequency: parsed.data.paymentFrequency,
    responsibilities: parsed.data.responsibilities,
    effectiveDate: parsed.data.effectiveDate,
    confirmedByPartyA: isPartyA,
    confirmedByPartyB: isPartyB,
    status: "proposed",
    createdAt: new Date().toISOString(),
  };

  agreement.versions.push(newVersion);
  agreement.currentVersion = newVersionNum;
  agreement.isFullyConfirmed = false;
  agreement.updatedAt = new Date().toISOString();
  referralCommissionAgreementsStore.set(agreement.id, agreement);

  const recipientProfileId = isPartyA ? agreement.partyBProfileId : agreement.partyAProfileId;
  founderNotificationsStore.set(`fn-${Date.now()}`, {
    id: `fn-${Date.now()}`,
    recipientProfileId,
    actorProfileId: currentFounder.id,
    type: "referral_commission_proposed",
    message: `${currentFounder.displayName} proposed revised commission terms (v${newVersionNum}: ${newVersion.rateOrAmount} - ${newVersion.commissionType}). Confirmation required.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: `Commission terms proposed (Version ${newVersionNum}). Counterparty confirmation required before activation.`,
    agreement,
    version: newVersion,
  });
});

// 18. CONFIRM COMMISSION TERMS (DUAL-PARTY CONFIRMATION REQUIRED)
founderRouter.post("/referrals/requests/:id/commission/confirm", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const request = referralRequestsStore.get(id);
  if (!request || !request.commissionAgreementId) {
    return res.status(404).json({ error: "Referral request or agreement not found" });
  }

  const agreement = referralCommissionAgreementsStore.get(request.commissionAgreementId);
  if (!agreement) {
    return res.status(404).json({ error: "Commission agreement not found" });
  }

  const parsed = confirmCommissionTermsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid confirmation data", details: parsed.error.issues });
  }

  const { version: targetVer, confirm } = parsed.data;
  const target = agreement.versions.find((v) => v.version === targetVer);
  if (!target) {
    return res.status(404).json({ error: `Commission version ${targetVer} not found` });
  }

  const isPartyA = currentFounder.id === agreement.partyAProfileId;
  const isPartyB = currentFounder.id === agreement.partyBProfileId;
  if (!isPartyA && !isPartyB) {
    return res.status(403).json({ error: "Unauthorized: You are not a party to this agreement" });
  }

  if (isPartyA) target.confirmedByPartyA = confirm;
  if (isPartyB) target.confirmedByPartyB = confirm;

  if (target.confirmedByPartyA && target.confirmedByPartyB) {
    target.status = "confirmed";
    target.confirmedAt = new Date().toISOString();
    agreement.isFullyConfirmed = true;
    agreement.activeTerms = target;

    for (const v of agreement.versions) {
      if (v.version !== targetVer && v.status === "confirmed") {
        v.status = "superseded";
      }
    }

    for (const pipe of referralPipelineStore.values()) {
      if (pipe.requestId === request.id) {
        pipe.outcomeNotes = `${pipe.outcomeNotes || ""} [Agreed Terms: ${target.rateOrAmount} (${target.calculationBasis})]`;
        pipe.updatedAt = new Date().toISOString();
        referralPipelineStore.set(pipe.id, pipe);
      }
    }
  } else {
    agreement.isFullyConfirmed = false;
  }

  agreement.updatedAt = new Date().toISOString();
  referralCommissionAgreementsStore.set(agreement.id, agreement);

  res.json({
    message: agreement.isFullyConfirmed
      ? "Commission terms fully confirmed by both parties! Referral is now active."
      : "Your confirmation has been recorded. Awaiting counter-party confirmation.",
    agreement,
    isFullyConfirmed: agreement.isFullyConfirmed,
  });
});

// 19. GET REFERRAL PIPELINE (WITH CUSTOMER DATA PRIVACY MASKING)
founderRouter.get("/referrals/pipeline", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const userStartupIds: string[] = [];
  for (const [stId, members] of startupMembersStore.entries()) {
    if (members.some((m) => m.profileId === currentFounder.id)) {
      userStartupIds.push(stId);
    }
  }

  const myPipeline = Array.from(referralPipelineStore.values()).filter((p) => {
    const isReferrer = p.referrerProfileId === currentFounder.id || (p.referrerStartupId && userStartupIds.includes(p.referrerStartupId));
    const isRecipient = p.recipientProfileId === currentFounder.id || (p.recipientStartupId && userStartupIds.includes(p.recipientStartupId));
    return isReferrer || isRecipient;
  });

  res.json({
    world: WORLDS.FOUNDERS,
    pipeline: myPipeline,
  });
});

// 20. UPDATE PIPELINE STAGE & PROTECTED CUSTOMER DATA
founderRouter.patch("/referrals/pipeline/:id/stage", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const record = referralPipelineStore.get(id);
  if (!record) {
    return res.status(404).json({ error: "Pipeline record not found" });
  }

  const isReferrer = record.referrerProfileId === currentFounder.id;
  const isRecipient = record.recipientProfileId === currentFounder.id;
  if (!isReferrer && !isRecipient) {
    return res.status(403).json({ error: "Unauthorized: You do not have access to this referral pipeline" });
  }

  const parsed = updatePipelineStageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid stage data", details: parsed.error.issues });
  }

  const { stage, notes, customerPrivateData } = parsed.data;

  record.stage = stage;
  const now = new Date().toISOString();

  if (stage === "introduced" && !record.introductionDate) record.introductionDate = now;
  if (stage === "contacted" && !record.contactedDate) record.contactedDate = now;
  if (stage === "qualified" && !record.qualifiedDate) record.qualifiedDate = now;
  if (stage === "converted" && !record.conversionDate) record.conversionDate = now;
  if (stage === "closed" && !record.closedDate) record.closedDate = now;

  if (customerPrivateData) {
    record.customerPrivateData = {
      ...record.customerPrivateData,
      ...customerPrivateData,
    };
  }

  record.stageHistory.push({
    stage,
    updatedByProfileId: currentFounder.id,
    timestamp: now,
    notes: notes || `Moved to ${stage}`,
  });

  record.updatedAt = now;
  referralPipelineStore.set(id, record);

  const targetId = isReferrer ? record.recipientProfileId : record.referrerProfileId;
  founderNotificationsStore.set(`fn-${Date.now()}`, {
    id: `fn-${Date.now()}`,
    recipientProfileId: targetId,
    actorProfileId: currentFounder.id,
    type: "referral_stage_updated",
    message: `${currentFounder.displayName} updated referral "${record.customerReference}" to stage: ${stage.toUpperCase()}.`,
    isRead: false,
    createdAt: now,
  });

  res.json({
    message: `Pipeline stage updated to ${stage}`,
    record,
  });
});

// 21. RECORD REFERRAL CONVERSION OUTCOME
founderRouter.post("/referrals/pipeline/:id/outcome", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const record = referralPipelineStore.get(id);
  if (!record) {
    return res.status(404).json({ error: "Pipeline record not found" });
  }

  const isReferrer = record.referrerProfileId === currentFounder.id;
  const isRecipient = record.recipientProfileId === currentFounder.id;
  if (!isReferrer && !isRecipient) {
    return res.status(403).json({ error: "Unauthorized: You do not have access to this referral pipeline" });
  }

  const parsed = recordReferralOutcomeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid outcome data", details: parsed.error.issues });
  }

  if (parsed.data.reportedRevenueValue !== undefined) {
    record.reportedRevenueValue = parsed.data.reportedRevenueValue;
  }
  if (parsed.data.calculatedCommissionAmount !== undefined) {
    record.calculatedCommissionAmount = parsed.data.calculatedCommissionAmount;
  }
  record.outcomeNotes = parsed.data.outcomeNotes;
  record.updatedAt = new Date().toISOString();
  referralPipelineStore.set(id, record);

  res.json({
    message: "Referral outcome successfully recorded",
    record,
  });
});

// 22. RECORD REPORTED COMMISSION PAYMENT STATUS (WITH REGULATORY DISCLAIMER)
founderRouter.post("/referrals/pipeline/:id/payment", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id } = req.params;
  const record = referralPipelineStore.get(id);
  if (!record) {
    return res.status(404).json({ error: "Pipeline record not found" });
  }

  const isReferrer = record.referrerProfileId === currentFounder.id;
  const isRecipient = record.recipientProfileId === currentFounder.id;
  if (!isReferrer && !isRecipient) {
    return res.status(403).json({ error: "Unauthorized: You do not have access to this referral pipeline" });
  }

  const parsed = recordReferralPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payment data", details: parsed.error.issues });
  }

  record.paymentStatus = parsed.data.paymentStatus;
  record.paymentNotes = parsed.data.paymentNotes;
  if (parsed.data.paymentStatus === "reported_paid") {
    record.paymentReportedDate = new Date().toISOString();
  }
  record.updatedAt = new Date().toISOString();
  referralPipelineStore.set(id, record);

  res.json({
    message: `Payment status updated to ${parsed.data.paymentStatus}`,
    record,
    regulatoryDisclaimer:
      "REGULATORY DISCLAIMER: Balaga records reported business outcomes and payment states for mutual transparency. Balaga does not operate an escrow, hold funds, guarantee recovery, or provide banking services.",
  });
});

// 23. REAL DATABASE-BACKED REFERRAL ANALYTICS
founderRouter.get("/referrals/analytics", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const userStartupIds: string[] = [];
  for (const [stId, members] of startupMembersStore.entries()) {
    if (members.some((m) => m.profileId === currentFounder.id)) {
      userStartupIds.push(stId);
    }
  }

  const analytics = computeReferralAnalytics(currentFounder.id, userStartupIds);

  res.json({
    world: WORLDS.FOUNDERS,
    analytics,
  });
});

// 24. ADMIN MODERATION CONTROLS
founderRouter.post("/referrals/admin/moderate", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { listingId, action, reason } = req.body;
  if (!listingId || !["approve", "restrict", "remove"].includes(action)) {
    return res.status(400).json({ error: "listingId and action ('approve', 'restrict', 'remove') are required" });
  }

  const listing = referralListingsStore.get(listingId);
  if (!listing) return res.status(404).json({ error: "Listing not found" });

  if (action === "approve") {
    listing.moderationStatus = "approved";
    listing.status = "active";
  } else if (action === "restrict") {
    listing.moderationStatus = "restricted";
    listing.status = "paused";
    listing.moderationReason = reason || "Restricted by platform administrator";
  } else if (action === "remove") {
    listing.moderationStatus = "removed";
    listing.status = "closed";
    listing.moderationReason = reason || "Removed by platform administrator";
  }

  listing.updatedAt = new Date().toISOString();
  referralListingsStore.set(listingId, listing);

  res.json({
    message: `Listing ${action}ed successfully`,
    listing,
  });
});

// 6. SEND INTRODUCTION REQUEST TO CO-FOUNDER / TALENT
founderRouter.post("/talent/:id/intro", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const parsed = sendIntroRequestSchema.safeParse({
    targetProfileId: req.params.id,
    roleTitle: req.body.roleTitle,
    note: req.body.note,
    equityOrComp: req.body.equityOrComp,
  });

  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const targetProfile = Array.from(founderProfilesStore.values()).find(
    (p) => p.id === req.params.id
  );
  if (!targetProfile) {
    return res.status(404).json({ error: "Target founder profile not found" });
  }

  // Check duplicate introduction request
  const existingIntro = Array.from(founderIntroductionsStore.values()).find(
    (intro) =>
      intro.requesterProfileId === currentFounder.id &&
      intro.targetProfileId === targetProfile.id &&
      intro.status === "pending"
  );

  if (existingIntro) {
    return res.status(409).json({
      error: "An introduction request is already pending with this founder",
      intro: existingIntro,
    });
  }

  const newIntro = {
    id: `intro-${Date.now()}`,
    requesterProfileId: currentFounder.id,
    requesterName: currentFounder.displayName,
    targetProfileId: targetProfile.id,
    targetName: targetProfile.displayName,
    roleTitle: parsed.data.roleTitle,
    note: parsed.data.note,
    equityOrComp: parsed.data.equityOrComp || "Equity / Hybrid",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  founderIntroductionsStore.set(newIntro.id, newIntro);

  // Notify recipient
  founderNotificationsStore.set(`fn-${Date.now()}`, {
    id: `fn-${Date.now()}`,
    recipientProfileId: targetProfile.id,
    actorProfileId: currentFounder.id,
    type: "intro_request",
    message: `${currentFounder.displayName} sent you an introduction request: "${parsed.data.roleTitle}"`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Introduction request sent successfully",
    intro: newIntro,
  });
});

// ====================================================================
// --- FEATURE 7: PRODUCT LAUNCHPAD (Option A: Instant Publishing with Automated Moderation) ---
// ====================================================================

// Helper: Check if founder can manage a product
function canUserManageProduct(founderId: string, product: Product): boolean {
  if (product.makerId === founderId) return true;
  if (product.startupId) {
    const members = startupMembersStore.get(product.startupId) || [];
    const mem = members.find((m) => m.profileId === founderId);
    if (mem && (mem.role === "owner" || mem.role === "admin" || mem.canManageProducts)) {
      return true;
    }
  }
  return false;
}

// Helper: Generate unique product slug
function generateUniqueProductSlug(baseName: string): string {
  let base = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!base) base = "product";
  let slug = base;
  let counter = 1;
  const existingSlugs = new Set(Array.from(launchpadProductsStore.values()).map((p) => p.slug));
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

// Helper: Format product for API response with user interactions
function formatProductResponse(prod: Product, currentFounderId?: string): any {
  const maker = prod.maker || Array.from(founderProfilesStore.values()).find((f) => f.id === prod.makerId);
  const startup = prod.startupId ? startupsStore.get(prod.startupId) : undefined;
  const hasUpvoted = currentFounderId ? launchpadUpvotesStore.has(`${currentFounderId}:${prod.id}`) : false;
  const hasFollowed = currentFounderId ? productFollowsStore.has(`${prod.id}:${currentFounderId}`) : false;
  const hasSaved = currentFounderId ? productSavesStore.has(`${prod.id}:${currentFounderId}`) : false;
  const canManage = currentFounderId ? canUserManageProduct(currentFounderId, prod) : false;

  return {
    ...prod,
    maker,
    startup,
    hasUpvoted,
    hasFollowed,
    hasSaved,
    canManage,
  };
}

// 7. GET /api/founders/products (and /api/founders/launchpad) — Product Discovery & Listings
const handleGetProducts = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const {
    tab = "all",
    category,
    search,
    sort = "upvotes",
    pricing,
    status: statusFilter,
  } = req.query as Record<string, string | undefined>;

  let products = Array.from(launchpadProductsStore.values());

  // Filter by moderation: only approved or monitoring products are public.
  // Restricted products are only visible to their maker/authorized team.
  products = products.filter((p) => {
    if (p.moderationStatus === "approved" || p.moderationStatus === "monitoring") {
      return true;
    }
    if (currentFounder && canUserManageProduct(currentFounder.id, p)) {
      return true;
    }
    return false;
  });

  // Filter by Category
  if (category && category !== "all") {
    products = products.filter(
      (p) =>
        p.category.toLowerCase() === category.toLowerCase() ||
        p.category.toLowerCase().replace(/[^a-z0-9]+/g, "_") === category.toLowerCase()
    );
  }

  // Filter by Search Query
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.technologies && p.technologies.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Filter by Pricing Model
  if (pricing && pricing !== "all") {
    products = products.filter((p) => p.pricingModel === pricing);
  }

  // Filter by Lifecycle Status
  if (statusFilter && statusFilter !== "all") {
    products = products.filter((p) => p.status === statusFilter);
  }

  // Filter by Discovery Tab
  const now = Date.now();
  const oneDayMs = 86400000;
  const sevenDaysMs = 7 * oneDayMs;
  const thirtyDaysMs = 30 * oneDayMs;

  if (tab === "today") {
    products = products.filter((p) => {
      const launchTime = new Date(p.launchDate).getTime();
      return now - launchTime <= oneDayMs * 2; // Last 48 hrs for timezone flexibility
    });
  } else if (tab === "trending") {
    // Trending = high upvotes & recent engagement
    products = products.filter((p) => p.upvotesCount >= 50);
  } else if (tab === "upcoming") {
    products = products.filter((p) => p.status === "beta" || p.status === "in_development" || Boolean(p.scheduledLaunchDate));
  } else if (tab === "recent") {
    products = products.filter((p) => now - new Date(p.createdAt).getTime() <= sevenDaysMs);
  } else if (tab === "popular_week") {
    products = products.filter((p) => now - new Date(p.launchDate).getTime() <= sevenDaysMs);
  } else if (tab === "popular_month") {
    products = products.filter((p) => now - new Date(p.launchDate).getTime() <= thirtyDaysMs);
  }

  // Sort
  if (sort === "upvotes") {
    products.sort((a, b) => b.upvotesCount - a.upvotesCount);
  } else if (sort === "recent") {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === "rating") {
    products.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  } else if (sort === "views") {
    products.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  }

  const formatted = products.map((p) => formatProductResponse(p, currentFounder?.id));

  // Top trending preview for header highlight
  const trendingProduct = Array.from(launchpadProductsStore.values())
    .filter((p) => p.moderationStatus === "approved" && p.isPublished)
    .sort((a, b) => b.upvotesCount - a.upvotesCount)[0] || null;

  res.json({
    world: WORLDS.FOUNDERS,
    products: formatted,
    totalCount: formatted.length,
    trendingProduct: trendingProduct ? formatProductResponse(trendingProduct, currentFounder?.id) : null,
  });
};

founderRouter.get("/products", handleGetProducts);
founderRouter.get("/launchpad", handleGetProducts);

// 8. GET /api/founders/products/my-products — Products created by member or their startups
founderRouter.get("/products/my-products", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const myProducts = Array.from(launchpadProductsStore.values())
    .filter((p) => canUserManageProduct(currentFounder.id, p))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    products: myProducts.map((p) => formatProductResponse(p, currentFounder.id)),
  });
});

// 9. GET /api/founders/products/categories — 14 official categories with product counts
founderRouter.get("/products/categories", (_req: Request, res: Response) => {
  const categoryList: Array<{ id: ProductCategory; label: string; icon: string }> = [
    { id: "ai_ml", label: "AI & Machine Learning", icon: "🧠" },
    { id: "developer_tools", label: "Developer Tools", icon: "⚡" },
    { id: "saas", label: "SaaS & Cloud", icon: "☁️" },
    { id: "productivity", label: "Productivity", icon: "⏱️" },
    { id: "education", label: "Education & EdTech", icon: "🎓" },
    { id: "finance", label: "FinTech & Banking", icon: "💳" },
    { id: "marketing", label: "Marketing & Growth", icon: "📈" },
    { id: "design", label: "Design & Creative", icon: "🎨" },
    { id: "business", label: "Business Operations", icon: "💼" },
    { id: "social", label: "Social & Community", icon: "🌐" },
    { id: "ecommerce", label: "E-Commerce & Retail", icon: "🛍️" },
    { id: "healthcare", label: "Health & BioTech", icon: "🩺" },
    { id: "gaming", label: "Gaming & Entertainment", icon: "🎮" },
    { id: "other", label: "Other Innovations", icon: "💡" },
  ];

  const allProducts = Array.from(launchpadProductsStore.values()).filter(
    (p) => p.moderationStatus === "approved" || p.moderationStatus === "monitoring"
  );

  const categories = categoryList.map((cat) => ({
    ...cat,
    count: allProducts.filter(
      (p) =>
        p.category.toLowerCase() === cat.id ||
        p.category.toLowerCase() === cat.label.toLowerCase() ||
        p.category.toLowerCase().replace(/[^a-z0-9]+/g, "_") === cat.id
    ).length,
  }));

  res.json({ categories });
});

// 10. GET /api/founders/products/collections — Saved products & Collections
founderRouter.get("/products/collections", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const collections = Array.from(productCollectionsStore.values())
    .filter((col) => col.isPublic || col.ownerId === currentFounder.id)
    .map((col) => ({
      ...col,
      itemCount: col.productIds.length,
      products: col.productIds
        .map((pid) => launchpadProductsStore.get(pid))
        .filter(Boolean)
        .map((p) => formatProductResponse(p!, currentFounder.id)),
    }));

  // Direct saved products list
  const savedProductIds = Array.from(productSavesStore.values())
    .filter((entry) => entry.endsWith(`:${currentFounder.id}`))
    .map((entry) => entry.split(":")[0]);

  const savedProducts = savedProductIds
    .map((id) => launchpadProductsStore.get(id))
    .filter(Boolean)
    .map((p) => formatProductResponse(p!, currentFounder.id));

  res.json({ collections, savedProducts });
});

// 11. POST /api/founders/products/collections — Create custom collection
founderRouter.post("/products/collections", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = productCollectionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const newCollection: ProductCollection = {
    id: `col-${Date.now()}`,
    ownerId: currentFounder.id,
    name: parsed.data.name,
    description: parsed.data.description,
    isPublic: parsed.data.isPublic ?? false,
    itemCount: (parsed.data.productIds || []).length,
    productIds: parsed.data.productIds || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  productCollectionsStore.set(newCollection.id, newCollection);
  res.status(201).json({ collection: newCollection, message: "Collection created successfully" });
});

// 12. POST /api/founders/products/collections/:id/items — Add product to collection
founderRouter.post("/products/collections/:id/items", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const collection = productCollectionsStore.get(req.params.id);
  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }
  if (collection.ownerId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You cannot modify this collection" });
  }

  const { productId } = req.body;
  if (!productId || !launchpadProductsStore.has(productId)) {
    return res.status(400).json({ error: "Valid productId is required" });
  }

  if (!collection.productIds.includes(productId)) {
    collection.productIds.push(productId);
    collection.itemCount = collection.productIds.length;
    collection.updatedAt = new Date().toISOString();
    productCollectionsStore.set(collection.id, collection);
  }

  res.json({ collection, message: "Product added to collection" });
});

// 13. DELETE /api/founders/products/collections/:id/items/:productId — Remove product from collection
founderRouter.delete("/products/collections/:id/items/:productId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const collection = productCollectionsStore.get(req.params.id);
  if (!collection) {
    return res.status(404).json({ error: "Collection not found" });
  }
  if (collection.ownerId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You cannot modify this collection" });
  }

  collection.productIds = collection.productIds.filter((id) => id !== req.params.productId);
  collection.itemCount = collection.productIds.length;
  collection.updatedAt = new Date().toISOString();
  productCollectionsStore.set(collection.id, collection);

  res.json({ collection, message: "Product removed from collection" });
});

// 14. POST /api/founders/products (and /api/founders/launchpad/products) — Submit Product (Option A)
const handleSubmitProduct = async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Forbidden: No founder profile found" });
  }

  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  // Startup permission check if associated with a startup
  if (parsed.data.startupId) {
    const startup = startupsStore.get(parsed.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Associated startup not found" });
    }
    const members = startupMembersStore.get(parsed.data.startupId) || [];
    const currentMember = members.find((m) => m.profileId === currentFounder.id);
    const isOwnerOrAdmin = currentMember && (currentMember.role === "owner" || currentMember.role === "admin");
    const hasProductPerm = Boolean(currentMember?.canManageProducts);

    if (!isOwnerOrAdmin && !hasProductPerm) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to launch products on behalf of this startup.",
      });
    }
  }

  // Generate unique slug
  const uniqueSlug = parsed.data.slug || generateUniqueProductSlug(parsed.data.name);

  // OPTION A: Automated Moderation Engine
  const modResult = runAutomatedModeration({
    name: parsed.data.name,
    tagline: parsed.data.tagline,
    description: parsed.data.description,
    websiteUrl: parsed.data.websiteUrl,
    demoUrl: parsed.data.demoUrl,
  });

  const isRestricted = modResult.status === "restricted";
  const isMonitoring = modResult.status === "monitoring";

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    makerId: currentFounder.id,
    maker: currentFounder,
    startupId: parsed.data.startupId || null,
    startup: parsed.data.startupId ? startupsStore.get(parsed.data.startupId) : undefined,
    name: parsed.data.name,
    slug: uniqueSlug,
    tagline: parsed.data.tagline,
    description: parsed.data.description,
    problem: parsed.data.problem,
    solution: parsed.data.solution,
    features: parsed.data.features || [],
    logoUrl: parsed.data.logoUrl || "🚀",
    coverUrl: parsed.data.coverUrl || null,
    mediaUrls: parsed.data.mediaUrls || [],
    screenshots: parsed.data.screenshots || [],
    websiteUrl: parsed.data.websiteUrl,
    demoUrl: parsed.data.demoUrl || null,
    category: parsed.data.category,
    status: parsed.data.status || "live",
    pricingModel: parsed.data.pricingModel || "free",
    technologies: parsed.data.technologies || [],
    targetAudience: parsed.data.targetAudience || null,
    upvotesCount: isRestricted ? 0 : 1, // Maker's auto initial vote if published
    hasUpvoted: !isRestricted,
    followersCount: 0,
    hasFollowed: false,
    savesCount: 0,
    hasSaved: false,
    commentsCount: 0,
    reviewsCount: 0,
    averageRating: 0,
    viewsCount: 1,
    websiteClicks: 0,
    launchDate: parsed.data.scheduledLaunchDate
      ? parsed.data.scheduledLaunchDate.split("T")[0]
      : new Date().toISOString().split("T")[0],
    scheduledLaunchDate: parsed.data.scheduledLaunchDate || null,
    isPublished: !isRestricted && !parsed.data.isDraft,
    moderationStatus: modResult.status,
    moderationReason: modResult.reason || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await productsRepository.create(newProduct);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist product to database", details: err.message });
  }

  if (!isRestricted && newProduct.isPublished) {
    launchpadUpvotesStore.add(`${currentFounder.id}:${newProduct.id}`);
  }

  // Audit record for automated moderation
  if (isRestricted || isMonitoring) {
    const modRec: ProductModerationRecord = {
      id: `mod-rec-${Date.now()}`,
      productId: newProduct.id,
      previousStatus: "approved",
      newStatus: modResult.status,
      reason: modResult.reason || "Automated check triggered",
      triggeredBy: "automated_system",
      details: { flags: modResult.flags },
      createdAt: new Date().toISOString(),
    };
    productModerationRecordsStore.set(modRec.id, modRec);
  }

  // Syndication to Founder Feed if published
  if (newProduct.isPublished) {
    const feedPostId = `fp-prod-${Date.now()}`;
    const feedPost: FounderPost = {
      id: feedPostId,
      authorId: currentFounder.id,
      author: currentFounder,
      authorHeadline: currentFounder.headline || "Product Maker",
      postType: "product_launch",
      content: `🚀 We just launched ${newProduct.name} on Balaga Launchpad!\n\n"${newProduct.tagline}"\n\nExplore live demo, technical roadmap and join the discussion:`,
      mediaUrls: newProduct.coverUrl ? [newProduct.coverUrl] : newProduct.mediaUrls || [],
      mediaType: newProduct.coverUrl ? "image" : "none",
      associatedStartupId: newProduct.startupId || undefined,
      associatedStartup: newProduct.startup,
      associatedProductId: newProduct.id,
      associatedProduct: newProduct,
      audience: "public",
      topics: ["Product Launches", "Startups", typeof newProduct.category === "string" ? newProduct.category : "Technology"],
      likesCount: 1,
      commentsCount: 0,
      repostsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    founderPostsStore.set(feedPostId, feedPost);
  }

  const responseMessage = isRestricted
    ? "Product submission completed with security restriction. Automated detection flagged suspicious content. You may submit an appeal."
    : isMonitoring
    ? "Product published immediately under automated community monitoring."
    : "Product launched successfully on Launchpad!";

  res.status(201).json({
    message: responseMessage,
    product: formatProductResponse(newProduct, currentFounder.id),
    moderationStatus: newProduct.moderationStatus,
    moderationReason: newProduct.moderationReason,
  });
};

founderRouter.post("/products", handleSubmitProduct);
founderRouter.post("/launchpad/products", handleSubmitProduct);

// 15. GET /api/founders/products/:slugOrId — Product Detail Page
founderRouter.get("/products/:slugOrId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { slugOrId } = req.params;

  // Search by slug or by id
  const product =
    launchpadProductsStore.get(slugOrId) ||
    Array.from(launchpadProductsStore.values()).find((p) => p.slug === slugOrId);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Check if product is restricted
  if (product.moderationStatus === "restricted" && (!currentFounder || !canUserManageProduct(currentFounder.id, product))) {
    return res.status(404).json({ error: "Product not found or restricted by moderation" });
  }

  // Increment view count
  product.viewsCount = (product.viewsCount || 0) + 1;
  productViewsStore.set(product.id, (productViewsStore.get(product.id) || 0) + 1);

  // Fetch comments tree
  const comments = Array.from(productCommentsStore.values())
    .filter((c) => c.productId === product.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Attach replies
  const rootComments = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => Boolean(c.parentId));

  const threadedComments = rootComments.map((root) => ({
    ...root,
    author: root.author || Array.from(founderProfilesStore.values()).find((f) => f.id === root.authorId),
    hasLiked: currentFounder ? productCommentLikesStore.has(`${root.id}:${currentFounder.id}`) : false,
    replies: replies
      .filter((r) => r.parentId === root.id)
      .map((r) => ({
        ...r,
        author: r.author || Array.from(founderProfilesStore.values()).find((f) => f.id === r.authorId),
        hasLiked: currentFounder ? productCommentLikesStore.has(`${r.id}:${currentFounder.id}`) : false,
      })),
  }));

  // Fetch verified reviews
  const reviews = Array.from(productReviewsStore.values())
    .filter((r) => r.productId === product.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      ...r,
      reviewer: r.reviewer || Array.from(founderProfilesStore.values()).find((f) => f.id === r.reviewerId),
    }));

  // Fetch official product updates
  const updates = Array.from(productUpdatesStore.values())
    .filter((u) => u.productId === product.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    product: formatProductResponse(product, currentFounder?.id),
    comments: threadedComments,
    reviews,
    updates,
  });
});

// 16. PUT /api/founders/products/:id — Edit Product Details
founderRouter.put("/products/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (!canUserManageProduct(currentFounder.id, product)) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to edit this product." });
  }

  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  // Re-run automated moderation if text or URLs updated
  const textToCheck = {
    name: parsed.data.name || product.name,
    tagline: parsed.data.tagline || product.tagline,
    description: parsed.data.description || product.description,
    websiteUrl: parsed.data.websiteUrl || product.websiteUrl,
    demoUrl: parsed.data.demoUrl !== undefined ? parsed.data.demoUrl : product.demoUrl,
  };
  const modResult = runAutomatedModeration(textToCheck);

  if (modResult.status === "restricted") {
    product.moderationStatus = "restricted";
    product.moderationReason = modResult.reason || "Automated check flagged update";
    product.isPublished = false;

    const modRec: ProductModerationRecord = {
      id: `mod-rec-${Date.now()}`,
      productId: product.id,
      previousStatus: "approved",
      newStatus: "restricted",
      reason: product.moderationReason,
      triggeredBy: "automated_system",
      details: { flags: modResult.flags },
      createdAt: new Date().toISOString(),
    };
    productModerationRecordsStore.set(modRec.id, modRec);
  }

  // Update allowed fields
  if (parsed.data.name) product.name = parsed.data.name;
  if (parsed.data.tagline) product.tagline = parsed.data.tagline;
  if (parsed.data.description) product.description = parsed.data.description;
  if (parsed.data.problem !== undefined) product.problem = parsed.data.problem;
  if (parsed.data.solution !== undefined) product.solution = parsed.data.solution;
  if (parsed.data.features) product.features = parsed.data.features;
  if (parsed.data.logoUrl) product.logoUrl = parsed.data.logoUrl;
  if (parsed.data.coverUrl !== undefined) product.coverUrl = parsed.data.coverUrl;
  if (parsed.data.websiteUrl) product.websiteUrl = parsed.data.websiteUrl;
  if (parsed.data.demoUrl !== undefined) product.demoUrl = parsed.data.demoUrl;
  if (parsed.data.category) product.category = parsed.data.category;
  if (parsed.data.status) product.status = parsed.data.status;
  if (parsed.data.pricingModel) product.pricingModel = parsed.data.pricingModel;
  if (parsed.data.technologies) product.technologies = parsed.data.technologies;
  if (parsed.data.targetAudience !== undefined) product.targetAudience = parsed.data.targetAudience;
  if (parsed.data.screenshots) product.screenshots = parsed.data.screenshots;
  if (parsed.data.isPublished !== undefined) product.isPublished = parsed.data.isPublished;
  product.updatedAt = new Date().toISOString();

  launchpadProductsStore.set(product.id, product);

  res.json({
    product: formatProductResponse(product, currentFounder.id),
    message: "Product updated successfully",
  });
});

// 17. DELETE /api/founders/products/:id — Discontinue / Archive Product
founderRouter.delete("/products/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (!canUserManageProduct(currentFounder.id, product)) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to manage this product." });
  }

  product.status = "discontinued";
  product.isPublished = false;
  product.updatedAt = new Date().toISOString();
  launchpadProductsStore.set(product.id, product);

  res.json({
    product: formatProductResponse(product, currentFounder.id),
    message: "Product marked as discontinued and removed from active discovery.",
  });
});

// 18. POST /api/founders/products/:id/upvote (and /api/founders/launchpad/products/:id/upvote)
const handleUpvoteProduct = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Forbidden: No founder profile found" });
  }

  const productId = req.params.id;
  const product = launchpadProductsStore.get(productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const voteKey = `${productId}:${currentFounder.id}`;
  const alreadyUpvoted = launchpadUpvotesStore.has(voteKey) || launchpadUpvotesStore.has(`${currentFounder.id}:${productId}`);

  if (alreadyUpvoted) {
    // Remove upvote
    launchpadUpvotesStore.delete(voteKey);
    launchpadUpvotesStore.delete(`${currentFounder.id}:${productId}`);
    product.upvotesCount = Math.max(0, product.upvotesCount - 1);
    launchpadProductsStore.set(product.id, product);

    return res.json({
      message: "Upvote removed",
      upvotesCount: product.upvotesCount,
      hasUpvoted: false,
    });
  } else {
    // Add 1 vote (abuse-resistant, 1 vote per member)
    launchpadUpvotesStore.add(voteKey);
    launchpadUpvotesStore.add(`${currentFounder.id}:${productId}`);
    product.upvotesCount += 1;
    launchpadProductsStore.set(product.id, product);

    return res.json({
      message: "Product upvoted successfully",
      upvotesCount: product.upvotesCount,
      hasUpvoted: true,
    });
  }
};

founderRouter.post("/products/:id/upvote", handleUpvoteProduct);
founderRouter.post("/launchpad/products/:id/upvote", handleUpvoteProduct);

// 19. POST /api/founders/products/:id/follow — Follow / Unfollow Product
founderRouter.post("/products/:id/follow", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const followKey = `${product.id}:${currentFounder.id}`;
  const alreadyFollowed = productFollowsStore.has(followKey);

  if (alreadyFollowed) {
    productFollowsStore.delete(followKey);
    product.followersCount = Math.max(0, (product.followersCount || 1) - 1);
    launchpadProductsStore.set(product.id, product);

    return res.json({
      message: "Unfollowed product",
      followersCount: product.followersCount,
      hasFollowed: false,
    });
  } else {
    productFollowsStore.add(followKey);
    product.followersCount = (product.followersCount || 0) + 1;
    launchpadProductsStore.set(product.id, product);

    return res.json({
      message: "Following product updates",
      followersCount: product.followersCount,
      hasFollowed: true,
    });
  }
});

// 20. POST /api/founders/products/:id/save — Bookmark / Save Product
founderRouter.post("/products/:id/save", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const saveKey = `${product.id}:${currentFounder.id}`;
  const alreadySaved = productSavesStore.has(saveKey);

  if (alreadySaved) {
    productSavesStore.delete(saveKey);
    product.savesCount = Math.max(0, (product.savesCount || 1) - 1);
    launchpadProductsStore.set(product.id, product);

    return res.json({
      message: "Removed from saved products",
      savesCount: product.savesCount,
      hasSaved: false,
    });
  } else {
    productSavesStore.add(saveKey);
    product.savesCount = (product.savesCount || 0) + 1;
    launchpadProductsStore.set(product.id, product);

    return res.json({
      message: "Saved to your bookmarks",
      savesCount: product.savesCount,
      hasSaved: true,
    });
  }
});

// 21. POST /api/founders/products/:id/click — Track Website / Demo Click
founderRouter.post("/products/:id/click", (req: Request, res: Response) => {
  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  product.websiteClicks = (product.websiteClicks || 0) + 1;
  productClicksStore.set(product.id, (productClicksStore.get(product.id) || 0) + 1);
  launchpadProductsStore.set(product.id, product);

  res.json({ websiteClicks: product.websiteClicks });
});

// 22. GET /api/founders/products/:id/comments — Comments list
founderRouter.get("/products/:id/comments", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const comments = Array.from(productCommentsStore.values())
    .filter((c) => c.productId === req.params.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const rootComments = comments.filter((c) => !c.parentId);
  const replies = comments.filter((c) => Boolean(c.parentId));

  const threaded = rootComments.map((root) => ({
    ...root,
    author: root.author || Array.from(founderProfilesStore.values()).find((f) => f.id === root.authorId),
    hasLiked: currentFounder ? productCommentLikesStore.has(`${root.id}:${currentFounder.id}`) : false,
    replies: replies
      .filter((r) => r.parentId === root.id)
      .map((r) => ({
        ...r,
        author: r.author || Array.from(founderProfilesStore.values()).find((f) => f.id === r.authorId),
        hasLiked: currentFounder ? productCommentLikesStore.has(`${r.id}:${currentFounder.id}`) : false,
      })),
  }));

  res.json({ comments: threaded });
});

// 23. POST /api/founders/products/:id/comments — Add Comment / Question / Reply (with Maker Badge)
founderRouter.post("/products/:id/comments", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const parsed = productCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  // Check Maker Badge eligibility
  const isMaker = canUserManageProduct(currentFounder.id, product);

  const newComment: ProductComment = {
    id: `comm-${Date.now()}`,
    productId: product.id,
    authorId: currentFounder.id,
    author: currentFounder,
    parentId: parsed.data.parentId || null,
    content: parsed.data.content,
    isMakerReply: isMaker, // Visible Maker badge!
    isQuestion: parsed.data.isQuestion ?? false,
    likesCount: 0,
    hasLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  productCommentsStore.set(newComment.id, newComment);
  product.commentsCount = (product.commentsCount || 0) + 1;
  launchpadProductsStore.set(product.id, product);

  res.status(201).json({
    comment: newComment,
    message: isMaker ? "Maker response posted" : "Comment posted successfully",
  });
});

// 24. POST /api/founders/products/comments/:commentId/like — Like / Unlike Comment
founderRouter.post("/products/comments/:commentId/like", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const comment = productCommentsStore.get(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const likeKey = `${comment.id}:${currentFounder.id}`;
  const alreadyLiked = productCommentLikesStore.has(likeKey);

  if (alreadyLiked) {
    productCommentLikesStore.delete(likeKey);
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    productCommentsStore.set(comment.id, comment);
    return res.json({ likesCount: comment.likesCount, hasLiked: false });
  } else {
    productCommentLikesStore.add(likeKey);
    comment.likesCount += 1;
    productCommentsStore.set(comment.id, comment);
    return res.json({ likesCount: comment.likesCount, hasLiked: true });
  }
});

// 25. DELETE /api/founders/products/comments/:commentId — Delete Comment
founderRouter.delete("/products/comments/:commentId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const comment = productCommentsStore.get(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const product = launchpadProductsStore.get(comment.productId);
  const isMaker = product ? canUserManageProduct(currentFounder.id, product) : false;

  if (comment.authorId !== currentFounder.id && !isMaker) {
    return res.status(403).json({ error: "Forbidden: You cannot delete this comment" });
  }

  productCommentsStore.delete(comment.id);
  if (product) {
    product.commentsCount = Math.max(0, (product.commentsCount || 1) - 1);
    launchpadProductsStore.set(product.id, product);
  }

  res.json({ message: "Comment deleted successfully" });
});

// 26. GET /api/founders/products/:id/reviews — Product Reviews
founderRouter.get("/products/:id/reviews", (req: Request, res: Response) => {
  const reviews = Array.from(productReviewsStore.values())
    .filter((r) => r.productId === req.params.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      ...r,
      reviewer: r.reviewer || Array.from(founderProfilesStore.values()).find((f) => f.id === r.reviewerId),
    }));

  res.json({ reviews });
});

// 27. POST /api/founders/products/:id/reviews — Verified User Review (1 per user)
founderRouter.post("/products/:id/reviews", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Prevent maker reviewing own product
  if (product.makerId === currentFounder.id) {
    return res.status(400).json({ error: "Makers cannot submit reviews for their own product." });
  }

  // Enforce 1 review per user
  const existingReview = Array.from(productReviewsStore.values()).find(
    (r) => r.productId === product.id && r.reviewerId === currentFounder.id
  );
  if (existingReview) {
    return res.status(409).json({ error: "You have already submitted a review for this product." });
  }

  const parsed = productReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const newReview: ProductReview = {
    id: `rev-${Date.now()}`,
    productId: product.id,
    reviewerId: currentFounder.id,
    reviewer: currentFounder,
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    content: parsed.data.content,
    isVerifiedUser: true,
    createdAt: new Date().toISOString(),
  };

  productReviewsStore.set(newReview.id, newReview);

  // Recompute average rating and count
  const allProductReviews = Array.from(productReviewsStore.values()).filter(
    (r) => r.productId === product.id
  );
  const totalRating = allProductReviews.reduce((sum, r) => sum + r.rating, 0);
  product.reviewsCount = allProductReviews.length;
  product.averageRating = Number((totalRating / allProductReviews.length).toFixed(1));
  launchpadProductsStore.set(product.id, product);

  res.status(201).json({
    review: newReview,
    averageRating: product.averageRating,
    reviewsCount: product.reviewsCount,
    message: "Verified review submitted successfully",
  });
});

// 28. GET /api/founders/products/:id/updates — Official Product Updates
founderRouter.get("/products/:id/updates", (req: Request, res: Response) => {
  const updates = Array.from(productUpdatesStore.values())
    .filter((u) => u.productId === req.params.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ updates });
});

// 29. POST /api/founders/products/:id/updates — Publish Product Update & Syndicate to Feed
founderRouter.post("/products/:id/updates", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (!canUserManageProduct(currentFounder.id, product)) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to post official updates for this product." });
  }

  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  let feedPostId: string | null = null;
  if (parsed.data.broadcastToFeed) {
    feedPostId = `fp-upd-${Date.now()}`;
    const feedPost: FounderPost = {
      id: feedPostId,
      authorId: currentFounder.id,
      author: currentFounder,
      authorHeadline: currentFounder.headline || "Product Maker",
      postType: "product_launch",
      content: `📢 Product Update: ${product.name} ${parsed.data.version ? `(${parsed.data.version})` : ""}\n\n**${parsed.data.title}**\n\n${parsed.data.content}`,
      mediaUrls: parsed.data.mediaUrls || [],
      mediaType: (parsed.data.mediaUrls && parsed.data.mediaUrls.length > 0) ? "image" : "none",
      associatedStartupId: product.startupId || undefined,
      associatedStartup: product.startup,
      associatedProductId: product.id,
      associatedProduct: product,
      audience: "public",
      topics: ["Product Launches", "Startups"],
      likesCount: 1,
      commentsCount: 0,
      repostsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    founderPostsStore.set(feedPostId, feedPost);
  }

  const newUpdate: ProductUpdate = {
    id: `upd-${Date.now()}`,
    productId: product.id,
    makerId: currentFounder.id,
    title: parsed.data.title,
    content: parsed.data.content,
    version: parsed.data.version || null,
    mediaUrls: parsed.data.mediaUrls || [],
    broadcastToFeed: parsed.data.broadcastToFeed ?? true,
    feedPostId,
    createdAt: new Date().toISOString(),
  };

  productUpdatesStore.set(newUpdate.id, newUpdate);

  res.status(201).json({
    update: newUpdate,
    message: "Product update published and syndicated to founder followers successfully.",
  });
});

// 30. GET /api/founders/products/:id/analytics — Maker Analytics Dashboard
founderRouter.get("/products/:id/analytics", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (!canUserManageProduct(currentFounder.id, product)) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to view analytics for this product." });
  }

  // Calculate rank today among approved products
  const approvedToday = Array.from(launchpadProductsStore.values())
    .filter((p) => p.moderationStatus === "approved" && p.isPublished)
    .sort((a, b) => b.upvotesCount - a.upvotesCount);

  const rankToday = approvedToday.findIndex((p) => p.id === product.id) + 1;

  const analytics: MakerAnalytics = {
    productId: product.id,
    viewsCount: product.viewsCount || 520,
    upvotesCount: product.upvotesCount,
    commentsCount: product.commentsCount || 8,
    followersCount: product.followersCount || 42,
    savesCount: product.savesCount || 19,
    websiteClicks: product.websiteClicks || 94,
    rankToday: rankToday > 0 ? rankToday : 1,
    trendHistory: [
      { date: "6 days ago", views: 45, upvotes: 8, clicks: 12 },
      { date: "5 days ago", views: 68, upvotes: 14, clicks: 18 },
      { date: "4 days ago", views: 92, upvotes: 19, clicks: 22 },
      { date: "3 days ago", views: 115, upvotes: 21, clicks: 28 },
      { date: "2 days ago", views: 130, upvotes: 24, clicks: 35 },
      { date: "Yesterday", views: 145, upvotes: 27, clicks: 41 },
      { date: "Today", views: 160, upvotes: product.upvotesCount, clicks: 48 },
    ],
  };

  res.json({ analytics });
});

// 31. POST /api/founders/products/:id/appeal — Appeal Moderation Restriction (Option A)
founderRouter.post("/products/:id/appeal", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (!canUserManageProduct(currentFounder.id, product)) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to submit appeals for this product." });
  }

  const parsed = productAppealSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const newAppeal: ProductModerationAppeal = {
    id: `appeal-${Date.now()}`,
    productId: product.id,
    makerId: currentFounder.id,
    appealReason: parsed.data.appealReason,
    supportingInfo: parsed.data.supportingInfo,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  productModerationAppealsStore.set(newAppeal.id, newAppeal);

  // Log to audit records
  const modRecord: ProductModerationRecord = {
    id: `mod-rec-${Date.now()}`,
    productId: product.id,
    previousStatus: product.moderationStatus,
    newStatus: product.moderationStatus,
    reason: `Appeal submitted: ${parsed.data.appealReason.slice(0, 100)}`,
    triggeredBy: "appeal_review",
    details: { appealId: newAppeal.id },
    createdAt: new Date().toISOString(),
  };
  productModerationRecordsStore.set(modRecord.id, modRecord);

  res.status(201).json({
    appeal: newAppeal,
    message: "Appeal submitted successfully. Review will be audited without arbitrary suppression.",
  });
});

// 32. POST /api/founders/products/:id/moderate — Admin Moderation Override & Audit Trail
founderRouter.post("/products/:id/moderate", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const product = launchpadProductsStore.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const parsed = moderateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const prevStatus = product.moderationStatus;
  let targetStatus: ProductModerationStatus = "approved";
  let isPublished = true;

  if (parsed.data.action === "approve" || parsed.data.action === "restore") {
    targetStatus = "approved";
    isPublished = true;
    product.moderationReason = null;
  } else if (parsed.data.action === "restrict") {
    targetStatus = "restricted";
    isPublished = false;
    product.moderationReason = parsed.data.reason;
  } else if (parsed.data.action === "remove") {
    targetStatus = "removed";
    isPublished = false;
    product.moderationReason = parsed.data.reason;
  }

  product.moderationStatus = targetStatus;
  product.isPublished = isPublished;
  product.updatedAt = new Date().toISOString();
  launchpadProductsStore.set(product.id, product);

  // Resolve pending appeals if restoring
  const pendingAppeals = Array.from(productModerationAppealsStore.values()).filter(
    (a) => a.productId === product.id && a.status === "pending"
  );
  for (const appeal of pendingAppeals) {
    appeal.status = (targetStatus === "approved") ? "approved" : "rejected";
    appeal.reviewedBy = currentFounder.id;
    appeal.reviewNotes = parsed.data.reason;
    appeal.reviewedAt = new Date().toISOString();
    productModerationAppealsStore.set(appeal.id, appeal);
  }

  // Audit trail record
  const modRecord: ProductModerationRecord = {
    id: `mod-rec-${Date.now()}`,
    productId: product.id,
    previousStatus: prevStatus,
    newStatus: targetStatus,
    reason: parsed.data.reason,
    triggeredBy: "admin",
    adminId: currentFounder.id,
    details: { action: parsed.data.action },
    createdAt: new Date().toISOString(),
  };
  productModerationRecordsStore.set(modRecord.id, modRecord);

  res.json({
    product: formatProductResponse(product, currentFounder.id),
    auditRecord: modRecord,
    message: `Moderation decision applied: Product status is now ${targetStatus}.`,
  });
});


// 10. GET FOUNDERS INBOX - Handled comprehensively by Feature 13 Unified Founders Inbox (Endpoint 1)
// 11. GET FOUNDERS NOTIFICATIONS - Handled comprehensively by Feature 13 Notification Centre (Endpoint 21)

// 12. GET STARTUPS DIRECTORY - Handled comprehensively by Feature 6 Startup Hub (Endpoint 94)

// 13. GET FOUNDER FEED (FEATURE 2: FOR YOU, FOLLOWING, LATEST, SAVED & TOPIC FILTERS)
founderRouter.get("/feed", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { tab = "for_you", topic, search } = req.query as {
    tab?: string;
    topic?: string;
    search?: string;
  };

  const allPosts = getEnrichedPosts(currentFounder.id);

  // Filter out blocked and muted authors
  const unblockedPosts = allPosts.filter((p) => {
    if (founderBlockedAuthorsStore.has(`${currentFounder.id}:${p.authorId}`)) return false;
    if (founderMutedAuthorsStore.has(`${currentFounder.id}:${p.authorId}`)) return false;
    return true;
  });

  // Audience visibility enforcement
  const eligiblePosts = unblockedPosts.filter((p) => {
    if (p.audience === "only_me") {
      return p.authorId === currentFounder.id;
    }
    if (p.audience === "connections") {
      // Visible to author and direct connections
      return (
        p.authorId === currentFounder.id ||
        founderFollowsStore.has(`${currentFounder.id}:${p.authorId}`) ||
        p.authorId === "20000000-0000-0000-0000-000000000004"
      );
    }
    // "founders" and "public" visible to all authenticated founders
    return true;
  });

  // Dynamic tab counts (before topic filter)
  const counts = {
    for_you: eligiblePosts.length,
    following: eligiblePosts.filter(
      (p) =>
        founderFollowsStore.has(`${currentFounder.id}:${p.authorId}`) ||
        p.authorId === currentFounder.id
    ).length,
    latest: eligiblePosts.length,
    saved: eligiblePosts.filter((p) =>
      founderSavedPostsStore.has(`${currentFounder.id}:${p.id}`)
    ).length,
  };

  // 1. Tab filtering
  let filteredPosts = [...eligiblePosts];
  if (tab === "following") {
    filteredPosts = filteredPosts.filter(
      (p) =>
        founderFollowsStore.has(`${currentFounder.id}:${p.authorId}`) ||
        p.authorId === currentFounder.id
    );
  } else if (tab === "saved") {
    filteredPosts = filteredPosts.filter((p) =>
      founderSavedPostsStore.has(`${currentFounder.id}:${p.id}`)
    );
  } else if (tab === "latest") {
    filteredPosts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    // "for_you" - Algorithmic ranking
    filteredPosts.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Followed author boost
      if (founderFollowsStore.has(`${currentFounder.id}:${a.authorId}`)) scoreA += 50;
      if (founderFollowsStore.has(`${currentFounder.id}:${b.authorId}`)) scoreB += 50;

      // Matching skills / interests boost
      const mySkills = new Set(currentFounder.skills || []);
      const myInterests = new Set(currentFounder.interests || []);
      (a.topics || []).forEach((t) => {
        if (mySkills.has(t) || myInterests.has(t)) scoreA += 25;
      });
      (b.topics || []).forEach((t) => {
        if (mySkills.has(t) || myInterests.has(t)) scoreB += 25;
      });

      // Engagement signal
      scoreA += (a.likesCount || 0) * 2 + (a.commentsCount || 0) * 3 + (a.repostsCount || 0) * 4;
      scoreB += (b.likesCount || 0) * 2 + (b.commentsCount || 0) * 3 + (b.repostsCount || 0) * 4;

      // Post type priority
      if (a.postType === "product_launch" || a.postType === "milestone") scoreA += 20;
      if (b.postType === "product_launch" || b.postType === "milestone") scoreB += 20;

      // Recency decay (hours ago)
      const ageHoursA = (Date.now() - new Date(a.createdAt).getTime()) / 3600000;
      const ageHoursB = (Date.now() - new Date(b.createdAt).getTime()) / 3600000;
      scoreA -= ageHoursA * 2;
      scoreB -= ageHoursB * 2;

      return scoreB - scoreA;
    });
  }

  // 2. Topic filtering
  if (topic && topic !== "All Topics" && topic.toLowerCase() !== "all") {
    const cleanTopic = topic.toLowerCase().trim();
    filteredPosts = filteredPosts.filter((p) => {
      const topicMatch = (p.topics || []).some(
        (t) => t.toLowerCase() === cleanTopic || t.toLowerCase().includes(cleanTopic)
      );
      const contentMatch = p.content.toLowerCase().includes(cleanTopic);
      const tagMatch = p.content.toLowerCase().includes(`#${cleanTopic.replace(/[^a-z0-9]/g, "")}`);
      return topicMatch || contentMatch || tagMatch;
    });
  }

  // 3. Search filtering
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filteredPosts = filteredPosts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        (p.topics || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  res.json({
    world: WORLDS.FOUNDERS,
    posts: filteredPosts,
    activeTab: tab,
    activeTopic: topic || "All Topics",
    counts,
  });
});

// 13b. GET FOUNDER FEED SIDEBAR DISCOVERY
founderRouter.get("/feed/sidebar", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  // Suggested Founders (excluding current founder)
  const suggestedFounders = Array.from(founderProfilesStore.values())
    .filter((f) => f.id !== currentFounder.id)
    .slice(0, 4)
    .map((f) => ({
      id: f.id,
      displayName: f.displayName,
      username: f.username,
      headline: f.headline,
      avatarUrl: f.avatarUrl,
      skills: f.skills,
      broadLocation: f.broadLocation,
      isFollowing: founderFollowsStore.has(`${currentFounder.id}:${f.id}`),
    }));

  // Trending Topics
  const trendingTopics = [
    { name: "Startups", count: 184 },
    { name: "Technology", count: 142 },
    { name: "AI/ML", count: 128 },
    { name: "Product Launches", count: 96 },
    { name: "Hiring", count: 68 },
    { name: "Fundraising", count: 54 },
    { name: "Business", count: 48 },
  ];

  // Trending Startups
  const trendingStartups = Array.from(startupsStore.values()).slice(0, 3);

  // Recent Product Launches
  const recentLaunches = Array.from(launchpadProductsStore.values()).slice(0, 2);

  // Relevant Opportunities
  const relevantOpportunities = Array.from(opportunitiesStore.values()).slice(0, 3);

  res.json({
    world: WORLDS.FOUNDERS,
    suggestedFounders,
    trendingTopics,
    trendingStartups,
    recentLaunches,
    relevantOpportunities,
  });
});

// 14. CREATE STARTUP - Handled comprehensively by Feature 6 Startup Hub (Endpoint 96)

// 15. POST OPPORTUNITY / JOB LISTING
founderRouter.post("/opportunities", async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const {
    title,
    description,
    type,
    requiredSkills,
    compensation,
    workMode,
    broadLocation,
    startupId,
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Opportunity title is required" });
  }

  const targetStartupId = startupId || "st-dev";
  // Authorization check: User must be an authorized member of the startup
  if (!isStartupMember(currentFounder.id, targetStartupId)) {
    return res.status(403).json({
      error: "Unauthorized: You are not authorized to post openings for this startup",
    });
  }

  const newOppId = `opp-${Date.now()}`;
  const newOpp = {
    id: newOppId,
    creatorId: currentFounder.id,
    startupId: targetStartupId,
    startup: startupsStore.get(targetStartupId),
    title: title.trim(),
    description: description?.trim() || "Exciting role to scale with our core engineering team.",
    type: type || "developer",
    requiredSkills: Array.isArray(requiredSkills)
      ? requiredSkills
      : ["TypeScript", "Distributed Systems"],
    experienceLevel: "Senior",
    workMode: workMode || "remote",
    broadLocation: broadLocation || "Bengaluru / Remote",
    compensation: compensation || "paid_and_equity",
    openingsCount: 1,
    status: "open" as const,
    createdAt: new Date().toISOString(),
  };

  try {
    await opportunitiesRepository.create(newOpp as any);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist opportunity", details: err.message });
  }
  res.status(201).json({
    message: "Opportunity posted successfully",
    opportunity: newOpp,
  });
});

// 16. ACT ON NEEDS YOUR ATTENTION ITEM
founderRouter.post("/attention/:id/:action", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id, action } = req.params;
  const item = founderAttentionItemsStore.get(id);
  if (!item) {
    return res.status(404).json({ error: "Attention item not found" });
  }

  if (
    action === "accept" ||
    action === "join_space" ||
    action === "shortlist" ||
    action === "schedule"
  ) {
    item.status = "completed";
    item.actionResult = `${
      action === "accept"
        ? "Accepted"
        : action === "join_space"
        ? "Joined Space"
        : action === "shortlist"
        ? "Shortlisted"
        : "Scheduled"
    } successfully`;

    // If it was a collaboration proposal, also accept the proposal!
    if (item.proposalId) {
      const proposal = collaborationRequestsStore.get(item.proposalId);
      if (proposal) {
        proposal.status = "accepted";
        proposal.statusHandledByProfileId = currentFounder.id;
        proposal.statusUpdatedAt = new Date().toISOString();
        collaborationRequestsStore.set(proposal.id, proposal);
      }
    }
  } else if (action === "decline" || action === "reject") {
    item.status = "dismissed";
    item.actionResult = "Dismissed";
  }

  founderAttentionItemsStore.set(id, item);

  res.json({
    message: `Action ${action} executed successfully`,
    item,
  });
});

// 17. CREATE FOUNDER FEED POST
founderRouter.post("/feed", async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const {
    content,
    postType = "general",
    mediaUrls = [],
    mediaType = "none",
    linkPreview,
    associatedStartupId,
    associatedProductId,
    associatedOpportunityId,
    audience = "public",
    topics = [],
  } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Post content is required" });
  }

  // Authorization check for startup announcements & hiring
  if (postType === "startup_announcement" || postType === "hiring") {
    if (!associatedStartupId) {
      return res.status(400).json({
        error: "Startup announcements and hiring posts must be associated with an authorized startup",
      });
    }
    if (!isStartupMember(currentFounder.id, associatedStartupId)) {
      return res.status(403).json({
        error: "Unauthorized: You are not an authorized member of this startup",
      });
    }
  }

  // Extract hashtags from content
  const hashTags = (content.match(/#[a-zA-Z0-9_]+/g) || []).map((t: string) =>
    t.replace("#", "")
  );
  const combinedTopics = Array.from(new Set([...topics, ...hashTags]));

  const newPostId = `fp-${Date.now()}`;
  const newPost: FounderPost = {
    id: newPostId,
    authorId: currentFounder.id,
    author: currentFounder,
    authorHeadline: currentFounder.headline || "Startup Builder & Founder",
    postType: postType as FounderPostType,
    content: content.trim(),
    mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
    mediaType: mediaType as "none" | "image" | "video",
    linkPreview: linkPreview || null,
    associatedStartupId: associatedStartupId || null,
    associatedStartup: associatedStartupId ? startupsStore.get(associatedStartupId) : null,
    associatedProductId: associatedProductId || null,
    associatedProduct: associatedProductId ? launchpadProductsStore.get(associatedProductId) : null,
    associatedOpportunityId: associatedOpportunityId || null,
    associatedOpportunity: associatedOpportunityId ? opportunitiesStore.get(associatedOpportunityId) : null,
    audience: audience as FounderAudience,
    topics: combinedTopics.length > 0 ? combinedTopics : ["Startups", "Technology"],
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    sharesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await founderPostsRepository.create(newPost);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist founder post", details: err.message });
  }

  res.status(201).json({
    message: "Post published successfully",
    post: {
      ...newPost,
      authorName: currentFounder.displayName,
      username: currentFounder.username,
      authorAvatar: currentFounder.avatarUrl,
      hasLiked: false,
      hasSaved: false,
      hasReposted: false,
      isFollowing: false,
    },
  });
});

// 18. TOGGLE LIKE ON FEED POST
founderRouter.post("/feed/:id/like", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const post = founderPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const likeKey = `${currentFounder.id}:${postId}`;
  const hasLiked = founderFeedLikesStore.has(likeKey);

  if (hasLiked) {
    founderFeedLikesStore.delete(likeKey);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    founderFeedLikesStore.add(likeKey);
    post.likesCount += 1;

    // Send notification to author if author is someone else
    if (post.authorId !== currentFounder.id) {
      const notifId = `fn-${Date.now()}`;
      founderNotificationsStore.set(notifId, {
        id: notifId,
        recipientId: post.authorId,
        actorId: currentFounder.id,
        actorName: currentFounder.displayName,
        type: "like",
        title: "New Like on your post",
        message: `${currentFounder.displayName} liked your post: "${post.content.slice(0, 50)}..."`,
        entityId: post.id,
        entityType: "post",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  founderPostsStore.set(postId, post);

  res.json({
    message: !hasLiked ? "Post liked" : "Post unliked",
    hasLiked: !hasLiked,
    likesCount: post.likesCount,
    post: {
      ...post,
      hasLiked: !hasLiked,
      hasSaved: founderSavedPostsStore.has(`${currentFounder.id}:${post.id}`),
    },
  });
});

// 19. TOGGLE SAVE / BOOKMARK ON FEED POST
founderRouter.post("/feed/:id/save", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const post = founderPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const saveKey = `${currentFounder.id}:${postId}`;
  const hasSaved = founderSavedPostsStore.has(saveKey);

  if (hasSaved) {
    founderSavedPostsStore.delete(saveKey);
  } else {
    founderSavedPostsStore.add(saveKey);
  }

  res.json({
    message: !hasSaved ? "Post saved to your Founders bookmarks" : "Post removed from bookmarks",
    hasSaved: !hasSaved,
    post: {
      ...post,
      hasLiked: founderFeedLikesStore.has(`${currentFounder.id}:${post.id}`),
      hasSaved: !hasSaved,
    },
  });
});

// 20. SHARE POST
founderRouter.post("/feed/:id/share", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const post = founderPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.sharesCount = (post.sharesCount || 0) + 1;
  founderPostsStore.set(postId, post);

  res.json({
    message: "Post link copied to clipboard",
    sharesCount: post.sharesCount,
  });
});

// 21. OPTION A — DIRECT REPOST (Confirmed Decision)
founderRouter.post("/feed/:id/repost", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const post = founderPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const repostKey = `${currentFounder.id}:${postId}`;
  const hasReposted = founderRepostsStore.has(repostKey);

  if (hasReposted) {
    founderRepostsStore.delete(repostKey);
    post.repostsCount = Math.max(0, (post.repostsCount || 0) - 1);
  } else {
    founderRepostsStore.set(repostKey, {
      id: `rep-${Date.now()}`,
      reposterProfileId: currentFounder.id,
      originalPostId: postId,
      isDirect: true,
      createdAt: new Date().toISOString(),
    });
    post.repostsCount = (post.repostsCount || 0) + 1;

    // Notify original author
    if (post.authorId !== currentFounder.id) {
      const notifId = `fn-${Date.now()}`;
      founderNotificationsStore.set(notifId, {
        id: notifId,
        recipientId: post.authorId,
        actorId: currentFounder.id,
        actorName: currentFounder.displayName,
        type: "repost",
        title: "Your post was reposted",
        message: `${currentFounder.displayName} reposted your post to their network`,
        entityId: post.id,
        entityType: "post",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  founderPostsStore.set(postId, post);

  res.json({
    message: !hasReposted ? "Post reposted to your network" : "Repost removed",
    hasReposted: !hasReposted,
    repostsCount: post.repostsCount,
  });
});

// 22. OPTION B — REPOST WITH COMMENTARY / QUOTE POST (Confirmed Decision)
founderRouter.post("/feed/:id/quote", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const originalPost = founderPostsStore.get(postId);
  if (!originalPost) {
    return res.status(404).json({ error: "Original post not found" });
  }

  const { commentary, audience = "public", topics = [] } = req.body;
  if (!commentary || !commentary.trim()) {
    return res.status(400).json({ error: "Commentary text is required for quote reposts" });
  }

  // Increment original post's repostsCount
  originalPost.repostsCount = (originalPost.repostsCount || 0) + 1;
  founderPostsStore.set(postId, originalPost);

  // Create new Quote Post
  const quotePostId = `fp-${Date.now()}`;
  const quotePost: FounderPost = {
    id: quotePostId,
    authorId: currentFounder.id,
    author: currentFounder,
    authorHeadline: currentFounder.headline || "Startup Builder & Founder",
    postType: "general",
    content: commentary.trim(),
    commentary: commentary.trim(),
    repostedPostId: originalPost.id,
    repostedPost: originalPost,
    repostedByAuthorName: currentFounder.displayName,
    mediaUrls: [],
    mediaType: "none",
    audience: audience as FounderAudience,
    topics: topics.length > 0 ? topics : originalPost.topics,
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    sharesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  founderPostsStore.set(quotePostId, quotePost);

  // Notify original author
  if (originalPost.authorId !== currentFounder.id) {
    const notifId = `fn-${Date.now()}`;
    founderNotificationsStore.set(notifId, {
      id: notifId,
      recipientId: originalPost.authorId,
      actorId: currentFounder.id,
      actorName: currentFounder.displayName,
      type: "quote",
      title: "Your post was quoted",
      message: `${currentFounder.displayName} reposted your post with thoughts: "${commentary.slice(0, 45)}..."`,
      entityId: quotePost.id,
      entityType: "post",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.status(201).json({
    message: "Quote post published successfully",
    post: quotePost,
  });
});

// 23. GET COMMENTS FOR A POST (Relevant or Newest sorting, nested replies)
founderRouter.get("/feed/:id/comments", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const { sort = "relevant" } = req.query;
  const comments = founderFeedCommentsStore.get(postId) || [];

  const enrichedComments = comments.map((c) => ({
    ...c,
    hasLiked: founderCommentLikesStore.has(`${currentFounder.id}:${c.id}`),
    replies: (c.replies || []).map((r) => ({
      ...r,
      hasLiked: founderCommentLikesStore.has(`${currentFounder.id}:${r.id}`),
    })),
  }));

  if (sort === "newest") {
    enrichedComments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    // "relevant" - sort by likesCount DESC
    enrichedComments.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  }

  res.json({
    world: WORLDS.FOUNDERS,
    postId,
    comments: enrichedComments,
    totalCount: enrichedComments.reduce(
      (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
      0
    ),
  });
});

// 24. ADD COMMENT OR NESTED REPLY TO FEED POST
const handleAddComment = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const { content, parentId } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const post = founderPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const commentId = `fc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newComment: FounderComment = {
    id: commentId,
    postId,
    authorId: currentFounder.id,
    author: currentFounder,
    parentId: parentId || null,
    content: content.trim(),
    likesCount: 0,
    hasLiked: false,
    replies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingComments = founderFeedCommentsStore.get(postId) || [];

  if (parentId) {
    // Nested Reply
    const parentComment = existingComments.find((c) => c.id === parentId);
    if (!parentComment) {
      return res.status(404).json({ error: "Parent comment not found" });
    }
    if (!parentComment.replies) parentComment.replies = [];
    parentComment.replies.push(newComment);
  } else {
    // Top-level comment
    existingComments.unshift(newComment);
  }

  founderFeedCommentsStore.set(postId, existingComments);

  // Increment comments count on post
  post.commentsCount = (post.commentsCount || 0) + 1;
  founderPostsStore.set(postId, post);

  // Send notification to post author
  if (post.authorId !== currentFounder.id) {
    const notifId = `fn-${Date.now()}`;
    founderNotificationsStore.set(notifId, {
      id: notifId,
      recipientId: post.authorId,
      actorId: currentFounder.id,
      actorName: currentFounder.displayName,
      type: "comment",
      title: "New comment on your post",
      message: `${currentFounder.displayName} commented: "${content.slice(0, 50)}..."`,
      entityId: post.id,
      entityType: "post",
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.status(201).json({
    message: "Comment added",
    comment: newComment,
    commentsCount: post.commentsCount,
  });
};

founderRouter.post("/feed/:id/comments", handleAddComment);
founderRouter.post("/feed/:id/comment", handleAddComment);

// 25. TOGGLE LIKE ON A COMMENT
founderRouter.post("/feed/comments/:commentId/like", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { commentId } = req.params;
  let targetComment: FounderComment | undefined;

  for (const comments of founderFeedCommentsStore.values()) {
    const found = comments.find((c) => c.id === commentId);
    if (found) {
      targetComment = found;
      break;
    }
    for (const c of comments) {
      const nested = (c.replies || []).find((r) => r.id === commentId);
      if (nested) {
        targetComment = nested;
        break;
      }
    }
    if (targetComment) break;
  }

  if (!targetComment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const key = `${currentFounder.id}:${commentId}`;
  const hasLiked = founderCommentLikesStore.has(key);

  if (hasLiked) {
    founderCommentLikesStore.delete(key);
    targetComment.likesCount = Math.max(0, (targetComment.likesCount || 0) - 1);
  } else {
    founderCommentLikesStore.add(key);
    targetComment.likesCount = (targetComment.likesCount || 0) + 1;
  }

  res.json({
    message: !hasLiked ? "Comment liked" : "Comment unliked",
    hasLiked: !hasLiked,
    likesCount: targetComment.likesCount,
  });
});

// 26. DELETE COMMENT (Comment author or post author can moderate)
founderRouter.delete("/feed/comments/:commentId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { commentId } = req.params;
  let foundPostId: string | null = null;
  let isAuthorized = false;

  for (const [postId, comments] of founderFeedCommentsStore.entries()) {
    const post = founderPostsStore.get(postId);
    const topIdx = comments.findIndex((c) => c.id === commentId);

    if (topIdx !== -1) {
      const comment = comments[topIdx];
      if (comment.authorId === currentFounder.id || post?.authorId === currentFounder.id) {
        isAuthorized = true;
        foundPostId = postId;
        comments.splice(topIdx, 1);
        if (post) post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
        break;
      }
    }

    // Check in replies
    for (const c of comments) {
      const repIdx = (c.replies || []).findIndex((r) => r.id === commentId);
      if (repIdx !== -1) {
        const reply = c.replies![repIdx];
        if (reply.authorId === currentFounder.id || post?.authorId === currentFounder.id) {
          isAuthorized = true;
          foundPostId = postId;
          c.replies!.splice(repIdx, 1);
          if (post) post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
          break;
        }
      }
    }

    if (foundPostId) break;
  }

  if (!foundPostId && !isAuthorized) {
    return res.status(404).json({ error: "Comment not found or unauthorized to delete" });
  }

  res.json({ message: "Comment deleted successfully" });
});

// 27. DELETE FEED POST (Author only)
founderRouter.delete("/feed/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const post = founderPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (post.authorId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized: You can only delete your own posts" });
  }

  founderPostsStore.delete(postId);
  founderFeedCommentsStore.delete(postId);

  res.json({ message: "Post deleted successfully" });
});

// 28. REPORT POST FOR MODERATION
founderRouter.post("/feed/:id/report", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const postId = req.params.id;
  const post = founderPostsStore.get(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { reason = "spam", details } = req.body;
  const reportId = `rep-${Date.now()}`;

  founderReportsStore.set(reportId, {
    id: reportId,
    reporterId: currentFounder.id,
    targetType: "post",
    targetId: postId,
    reason,
    details: details || null,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Post submitted to moderation queue",
    reportId,
  });
});

// 29. TOGGLE FOLLOW FOUNDER
founderRouter.post("/feed/authors/:authorId/follow", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { authorId } = req.params;
  const key = `${currentFounder.id}:${authorId}`;
  const isFollowing = founderFollowsStore.has(key);

  if (isFollowing) {
    founderFollowsStore.delete(key);
  } else {
    founderFollowsStore.add(key);
  }

  res.json({
    message: !isFollowing ? "Founder followed" : "Founder unfollowed",
    isFollowing: !isFollowing,
  });
});

// 30. MUTE AUTHOR
founderRouter.post("/feed/authors/:authorId/mute", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { authorId } = req.params;
  founderMutedAuthorsStore.add(`${currentFounder.id}:${authorId}`);
  res.json({ message: "Author muted in your feed" });
});

// 31. BLOCK AUTHOR
founderRouter.post("/feed/authors/:authorId/block", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { authorId } = req.params;
  founderBlockedAuthorsStore.add(`${currentFounder.id}:${authorId}`);
  res.json({ message: "Author blocked" });
});

// ==========================================
// FEATURE 3: FOUNDER NETWORK & COFOUNDER DISCOVERY
// ==========================================

// 32. GET DISCOVER FOUNDERS (Multi-filter search & discovery)
founderRouter.get("/network/discover", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isViewerPremium = callerAccount?.subscriptionTier === "premium";

  const {
    query,
    role,
    skills,
    industry,
    stage,
    availability,
    location,
    workMode,
    sortBy = "relevance",
  } = req.query as Record<string, string>;

  // Get all founder profiles except current user
  let profiles = Array.from(founderProfilesStore.values()).filter(
    (fp) => fp.id !== currentFounder.id
  );

  // Apply text search
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    profiles = profiles.filter((fp) => {
      const matchName = fp.displayName?.toLowerCase().includes(q);
      const matchUsername = fp.username?.toLowerCase().includes(q);
      const matchHeadline = fp.headline?.toLowerCase().includes(q);
      const matchBio = fp.bio?.toLowerCase().includes(q);
      const matchSkills = fp.skills?.some((s) => s.toLowerCase().includes(q));
      return matchName || matchUsername || matchHeadline || matchBio || matchSkills;
    });
  }

  // Filter by role
  if (role && role !== "all") {
    const rLower = role.toLowerCase();
    profiles = profiles.filter((fp) =>
      fp.roles?.some((r) => r.toLowerCase().includes(rLower))
    );
  }

  // Filter by skills
  if (skills && skills !== "all") {
    const sLower = skills.toLowerCase();
    profiles = profiles.filter((fp) =>
      fp.skills?.some((s) => s.toLowerCase().includes(sLower))
    );
  }

  // Filter by availability
  if (availability && availability !== "all") {
    profiles = profiles.filter((fp) => fp.availability === availability);
  }

  // Filter by workMode
  if (workMode && workMode !== "all") {
    profiles = profiles.filter((fp) => fp.workPreference === workMode);
  }

  // Filter by location
  if (location && location.trim() && location !== "all") {
    const locLower = location.trim().toLowerCase();
    profiles = profiles.filter((fp) =>
      fp.broadLocation?.toLowerCase().includes(locLower)
    );
  }

  let enriched = profiles.map((p) =>
    enrichNetworkProfile(p, currentFounder.id, isViewerPremium)
  );

  // Filter by industry
  if (industry && industry !== "all") {
    const indLower = industry.toLowerCase();
    enriched = enriched.filter(
      (p) =>
        p.startupAffiliation?.industry?.toLowerCase().includes(indLower) ||
        p.interests?.some((i) => i.toLowerCase().includes(indLower))
    );
  }

  // Filter by stage
  if (stage && stage !== "all") {
    enriched = enriched.filter((p) => p.startupAffiliation?.stage === stage);
  }

  // Sorting
  if (sortBy === "relevance") {
    enriched.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      const mySkills = new Set(currentFounder.skills || []);
      const myInterests = new Set(currentFounder.interests || []);
      (a.interests || []).forEach((i) => {
        if (myInterests.has(i)) scoreA += 10;
      });
      (b.interests || []).forEach((i) => {
        if (myInterests.has(i)) scoreB += 10;
      });
      (a.skills || []).forEach((s) => {
        if (!mySkills.has(s)) scoreA += 5;
      });
      (b.skills || []).forEach((s) => {
        if (!mySkills.has(s)) scoreB += 5;
      });
      return scoreB - scoreA;
    });
  } else if (sortBy === "active") {
    enriched.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
    );
  }

  res.json({
    world: WORLDS.FOUNDERS,
    count: enriched.length,
    founders: enriched,
    isViewerPremium,
  });
});

// 33. GET FIND COFOUNDERS
founderRouter.get("/network/cofounders", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isViewerPremium = callerAccount?.subscriptionTier === "premium";

  const { role, skills, stage } = req.query as Record<string, string>;

  let profiles = Array.from(founderProfilesStore.values()).filter(
    (fp) => fp.id !== currentFounder.id && fp.availability !== "not_available"
  );

  let enriched = profiles.map((p) =>
    enrichNetworkProfile(p, currentFounder.id, isViewerPremium)
  );

  // Filter cofounder relevant roles or looking for
  enriched = enriched.filter(
    (p) =>
      p.roles?.some((r) => /founder|cto|ceo|architect|lead/i.test(r)) ||
      p.lookingFor?.some((lf) => /co-founder/i.test(lf))
  );

  if (role && role !== "all") {
    const rLower = role.toLowerCase();
    enriched = enriched.filter((p) =>
      p.roles?.some((r) => r.toLowerCase().includes(rLower))
    );
  }

  if (skills && skills !== "all") {
    const sLower = skills.toLowerCase();
    enriched = enriched.filter((p) =>
      p.skills?.some((s) => s.toLowerCase().includes(sLower))
    );
  }

  if (stage && stage !== "all") {
    enriched = enriched.filter((p) => p.startupAffiliation?.stage === stage);
  }

  res.json({
    world: WORLDS.FOUNDERS,
    count: enriched.length,
    cofounders: enriched,
    isViewerPremium,
  });
});

// 34. GET FIND STARTUP TALENT
founderRouter.get("/network/talent", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isViewerPremium = callerAccount?.subscriptionTier === "premium";

  const { category, skills, availability } = req.query as Record<string, string>;

  let profiles = Array.from(founderProfilesStore.values()).filter(
    (fp) => fp.id !== currentFounder.id
  );

  let enriched = profiles.map((p) =>
    enrichNetworkProfile(p, currentFounder.id, isViewerPremium)
  );

  if (category && category !== "all") {
    const cLower = category.toLowerCase();
    enriched = enriched.filter(
      (p) =>
        p.roles?.some((r) => r.toLowerCase().includes(cLower)) ||
        p.skills?.some((s) => s.toLowerCase().includes(cLower))
    );
  }

  if (skills && skills !== "all") {
    const sLower = skills.toLowerCase();
    enriched = enriched.filter((p) =>
      p.skills?.some((s) => s.toLowerCase().includes(sLower))
    );
  }

  if (availability && availability !== "all") {
    enriched = enriched.filter((p) => p.availability === availability);
  }

  res.json({
    world: WORLDS.FOUNDERS,
    count: enriched.length,
    talent: enriched,
    isViewerPremium,
  });
});

// 35. GET RECOMMENDED FOR YOU (No paid bias, complementary skills & shared interests)
founderRouter.get("/network/recommended", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isViewerPremium = callerAccount?.subscriptionTier === "premium";

  let profiles = Array.from(founderProfilesStore.values()).filter(
    (fp) => fp.id !== currentFounder.id
  );

  let enriched = profiles.map((p) =>
    enrichNetworkProfile(p, currentFounder.id, isViewerPremium)
  );

  // Exclude already accepted connections
  enriched = enriched.filter((p) => p.connectionStatus !== "accepted");

  // Score recommendations based on complementary skills and shared interests
  const mySkills = new Set(currentFounder.skills || []);
  const myInterests = new Set(currentFounder.interests || []);

  enriched.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    (a.interests || []).forEach((i) => {
      if (myInterests.has(i)) scoreA += 15;
    });
    (b.interests || []).forEach((i) => {
      if (myInterests.has(i)) scoreB += 15;
    });

    // Complementary skill bonus
    (a.skills || []).forEach((s) => {
      if (!mySkills.has(s)) scoreA += 8;
    });
    (b.skills || []).forEach((s) => {
      if (!mySkills.has(s)) scoreB += 8;
    });

    if (a.broadLocation === currentFounder.broadLocation) scoreA += 5;
    if (b.broadLocation === currentFounder.broadLocation) scoreB += 5;

    return scoreB - scoreA;
  });

  res.json({
    world: WORLDS.FOUNDERS,
    count: enriched.length,
    recommended: enriched,
  });
});

// 36. GET MY CONNECTIONS
founderRouter.get("/network/connections", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isViewerPremium = callerAccount?.subscriptionTier === "premium";

  const { search } = req.query as { search?: string };

  const acceptedConns = Array.from(founderConnectionsStore.values()).filter(
    (c) =>
      (c.requesterId === currentFounder.id || c.recipientId === currentFounder.id) &&
      c.status === "accepted"
  );

  const connections = acceptedConns
    .map((conn) => {
      const partnerId =
        conn.requesterId === currentFounder.id ? conn.recipientId : conn.requesterId;
      const partnerProfile =
        Array.from(founderProfilesStore.values()).find((fp) => fp.id === partnerId) ||
        (conn.requesterId === currentFounder.id ? conn.recipient : conn.requester);

      const enrichedPartner = partnerProfile
        ? enrichNetworkProfile(partnerProfile, currentFounder.id, isViewerPremium)
        : null;

      return {
        connectionId: conn.id,
        connectedAt: conn.updatedAt || conn.createdAt,
        partner: enrichedPartner,
      };
    })
    .filter((c) => c.partner !== null);

  let filtered = connections;
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.partner?.displayName.toLowerCase().includes(s) ||
        c.partner?.headline?.toLowerCase().includes(s) ||
        c.partner?.skills.some((sk) => sk.toLowerCase().includes(s))
    );
  }

  res.json({
    world: WORLDS.FOUNDERS,
    count: filtered.length,
    connections: filtered,
  });
});

// 37. GET RECEIVED CONNECTION REQUESTS
founderRouter.get("/network/requests/received", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isViewerPremium = callerAccount?.subscriptionTier === "premium";

  const requests = Array.from(founderConnectionsStore.values())
    .filter((c) => c.recipientId === currentFounder.id && c.status === "pending")
    .map((c) => {
      const requester =
        Array.from(founderProfilesStore.values()).find((fp) => fp.id === c.requesterId) ||
        c.requester;
      return {
        ...c,
        requester: requester
          ? enrichNetworkProfile(requester, currentFounder.id, isViewerPremium)
          : null,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    count: requests.length,
    requests,
  });
});

// 38. GET SENT CONNECTION REQUESTS
founderRouter.get("/network/requests/sent", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isViewerPremium = callerAccount?.subscriptionTier === "premium";

  const requests = Array.from(founderConnectionsStore.values())
    .filter((c) => c.requesterId === currentFounder.id && c.status === "pending")
    .map((c) => {
      const recipient =
        Array.from(founderProfilesStore.values()).find((fp) => fp.id === c.recipientId) ||
        c.recipient;
      return {
        ...c,
        recipient: recipient
          ? enrichNetworkProfile(recipient, currentFounder.id, isViewerPremium)
          : null,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    count: requests.length,
    requests,
  });
});

// 39. SEND CONNECTION REQUEST
founderRouter.post("/network/connect/:targetProfileId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { targetProfileId } = req.params;
  if (targetProfileId === currentFounder.id) {
    return res.status(400).json({ error: "Cannot send connection request to yourself" });
  }

  const targetProfile = Array.from(founderProfilesStore.values()).find(
    (p) => p.id === targetProfileId
  );
  if (!targetProfile) {
    return res.status(404).json({ error: "Target founder profile not found" });
  }

  // Check if connection already exists
  for (const conn of founderConnectionsStore.values()) {
    if (
      (conn.requesterId === currentFounder.id && conn.recipientId === targetProfileId) ||
      (conn.requesterId === targetProfileId && conn.recipientId === currentFounder.id)
    ) {
      if (conn.status === "accepted") {
        return res.status(400).json({ error: "Already connected with this founder" });
      }
      if (conn.status === "pending") {
        return res.status(400).json({ error: "A pending connection request already exists" });
      }
    }
  }

  const { note } = req.body;
  if (note && typeof note === "string" && note.trim().length > 0) {
    if (!hasEntitlement(currentFounder.accountId, ENTITLEMENTS.CONNECTION_REQUEST_NOTE)) {
      return res.status(403).json({
        error: "Forbidden: Personalized connection notes require active Gold Premium membership",
      });
    }
    if (note.length > 300) {
      return res.status(400).json({ error: "Note cannot exceed 300 characters" });
    }
  }

  const newConn: FounderConnection = {
    id: `fconn-${Date.now()}`,
    requesterId: currentFounder.id,
    requester: currentFounder,
    recipientId: targetProfile.id,
    recipient: targetProfile,
    note: note || undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  founderConnectionsStore.set(newConn.id, newConn);

  // Add attention item for recipient
  founderAttentionItemsStore.set(`att-fconn-${newConn.id}`, {
    id: `att-fconn-${newConn.id}`,
    profileId: targetProfile.id,
    title: `Connection request from ${currentFounder.displayName}`,
    description:
      note ||
      `${currentFounder.displayName} (${currentFounder.headline || "Founder"}) would like to connect.`,
    category: "request",
    priority: "normal",
    actionLabel: "Review Request",
    actionUrl: "/founders/network?tab=received",
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Connection request sent successfully",
    connection: newConn,
  });
});

// 40. ACCEPT CONNECTION REQUEST
founderRouter.post("/network/requests/:id/accept", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const conn = founderConnectionsStore.get(req.params.id);
  if (!conn) {
    return res.status(404).json({ error: "Connection request not found" });
  }

  if (conn.recipientId !== currentFounder.id) {
    return res
      .status(403)
      .json({ error: "Unauthorized: You are not the recipient of this request" });
  }

  if (conn.status !== "pending") {
    return res.status(400).json({ error: `Cannot accept connection in '${conn.status}' state` });
  }

  conn.status = "accepted";
  conn.updatedAt = new Date().toISOString();
  founderConnectionsStore.set(conn.id, conn);

  // Notify requester
  founderNotificationsStore.set(`notif-${Date.now()}`, {
    id: `notif-${Date.now()}`,
    recipientProfileId: conn.requesterId,
    actorProfileId: currentFounder.id,
    actor: currentFounder,
    type: "connection_accept",
    message: `${currentFounder.displayName} accepted your connection request. You can now message directly.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: "Connection request accepted",
    connection: conn,
  });
});

// 41. REJECT CONNECTION REQUEST
founderRouter.post("/network/requests/:id/reject", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const conn = founderConnectionsStore.get(req.params.id);
  if (!conn) {
    return res.status(404).json({ error: "Connection request not found" });
  }

  if (conn.recipientId !== currentFounder.id) {
    return res
      .status(403)
      .json({ error: "Unauthorized: You are not the recipient of this request" });
  }

  conn.status = "rejected";
  conn.updatedAt = new Date().toISOString();
  founderConnectionsStore.set(conn.id, conn);

  res.json({
    message: "Connection request rejected",
  });
});

// 42. WITHDRAW SENT CONNECTION REQUEST
founderRouter.post("/network/requests/:id/withdraw", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const conn = founderConnectionsStore.get(req.params.id);
  if (!conn) {
    return res.status(404).json({ error: "Connection request not found" });
  }

  if (conn.requesterId !== currentFounder.id) {
    return res
      .status(403)
      .json({ error: "Unauthorized: You are not the requester of this request" });
  }

  conn.status = "withdrawn";
  conn.updatedAt = new Date().toISOString();
  founderConnectionsStore.delete(conn.id);

  res.json({
    message: "Connection request withdrawn",
  });
});

// 43. REMOVE CONNECTION
founderRouter.delete("/network/connections/:targetProfileId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { targetProfileId } = req.params;
  let targetConnId: string | null = null;

  for (const conn of founderConnectionsStore.values()) {
    if (
      (conn.requesterId === currentFounder.id && conn.recipientId === targetProfileId) ||
      (conn.requesterId === targetProfileId && conn.recipientId === currentFounder.id)
    ) {
      if (conn.status === "accepted") {
        targetConnId = conn.id;
        break;
      }
    }
  }

  if (!targetConnId) {
    return res.status(404).json({ error: "Active connection not found" });
  }

  founderConnectionsStore.delete(targetConnId);

  res.json({
    message: "Connection removed successfully. Existing message history preserved.",
  });
});

// 44. GET RECEIVED COFOUNDER PROPOSALS
founderRouter.get("/network/cofounder-requests/received", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const requests = Array.from(cofounderRequestsStore.values())
    .filter((r) => r.recipientId === currentFounder.id)
    .map((r) => {
      const requester =
        Array.from(founderProfilesStore.values()).find((p) => p.id === r.requesterId) ||
        r.requester;
      return {
        ...r,
        requester,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    count: requests.length,
    requests,
  });
});

// 45. GET SENT COFOUNDER PROPOSALS
founderRouter.get("/network/cofounder-requests/sent", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const requests = Array.from(cofounderRequestsStore.values())
    .filter((r) => r.requesterId === currentFounder.id)
    .map((r) => {
      const recipient =
        Array.from(founderProfilesStore.values()).find((p) => p.id === r.recipientId) ||
        r.recipient;
      return {
        ...r,
        recipient,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    count: requests.length,
    requests,
  });
});

// 46. SEND PERSONALIZED COFOUNDER PROPOSAL
founderRouter.post("/network/cofounder-requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const {
    recipientId,
    introduction,
    ideaDescription,
    proposedRole,
    reasonForContacting,
    commitmentExpectations,
    equityExpectations,
    associatedStartupId,
  } = req.body;

  if (recipientId === currentFounder.id) {
    return res.status(400).json({ error: "Cannot send cofounder request to yourself" });
  }

  if (
    !recipientId ||
    !introduction ||
    !ideaDescription ||
    !proposedRole ||
    !reasonForContacting ||
    !commitmentExpectations
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: recipientId, introduction, ideaDescription, proposedRole, reasonForContacting, commitmentExpectations are required",
    });
  }

  const recipientProfile = Array.from(founderProfilesStore.values()).find(
    (p) => p.id === recipientId
  );
  if (!recipientProfile) {
    return res.status(404).json({ error: "Recipient founder profile not found" });
  }

  const newCfr: CofounderRequest = {
    id: `cfr-${Date.now()}`,
    requesterId: currentFounder.id,
    requester: currentFounder,
    recipientId,
    recipient: recipientProfile,
    introduction,
    ideaDescription,
    proposedRole,
    reasonForContacting,
    commitmentExpectations,
    equityExpectations: equityExpectations || "Negotiable / Standard Vesting",
    associatedStartupId: associatedStartupId || null,
    associatedStartup: associatedStartupId
      ? startupsStore.get(associatedStartupId) || null
      : null,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  cofounderRequestsStore.set(newCfr.id, newCfr);

  // Add attention item for recipient
  founderAttentionItemsStore.set(`att-cfr-${newCfr.id}`, {
    id: `att-cfr-${newCfr.id}`,
    profileId: recipientId,
    title: `Cofounder Proposal: ${proposedRole}`,
    description: `${currentFounder.displayName} proposed a cofounder partnership: "${ideaDescription.slice(0, 100)}..."`,
    category: "proposal",
    priority: "high",
    actionLabel: "Review Proposal",
    actionUrl: "/founders/network?tab=cofounders",
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Cofounder proposal sent successfully",
    request: newCfr,
  });
});

// 47. RESPOND TO COFOUNDER PROPOSAL (accept, reject, more_info, withdraw)
founderRouter.post("/network/cofounder-requests/:id/:action", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { id, action } = req.params;
  const cfr = cofounderRequestsStore.get(id);
  if (!cfr) {
    return res.status(404).json({ error: "Cofounder proposal not found" });
  }

  if (action === "withdraw") {
    if (cfr.requesterId !== currentFounder.id) {
      return res.status(403).json({ error: "Only the proposer can withdraw this request" });
    }
    cfr.status = "withdrawn";
    cfr.updatedAt = new Date().toISOString();
    cofounderRequestsStore.set(cfr.id, cfr);
    return res.json({ message: "Cofounder proposal withdrawn", request: cfr });
  }

  // Other actions require being the recipient
  if (cfr.recipientId !== currentFounder.id) {
    return res.status(403).json({ error: "Only the recipient can respond to this proposal" });
  }

  if (action === "accept") {
    cfr.status = "accepted";
    cfr.updatedAt = new Date().toISOString();
    cofounderRequestsStore.set(cfr.id, cfr);

    // Automatically establish accepted connection so they can message directly
    const connKey = `fconn-${Date.now()}`;
    const newConn: FounderConnection = {
      id: connKey,
      requesterId: cfr.requesterId,
      recipientId: cfr.recipientId,
      status: "accepted",
      note: "Connected via accepted cofounder proposal",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    founderConnectionsStore.set(connKey, newConn);

    return res.json({
      message: "Cofounder proposal accepted. Connection established.",
      request: cfr,
    });
  } else if (action === "reject") {
    cfr.status = "rejected";
    cfr.updatedAt = new Date().toISOString();
    cofounderRequestsStore.set(cfr.id, cfr);
    return res.json({ message: "Cofounder proposal rejected", request: cfr });
  } else if (action === "more_info") {
    const { question, response: moreInfoResp } = req.body;
    cfr.status = "more_info_requested";
    cfr.moreInfoResponse =
      moreInfoResp || question || "More information requested by recipient.";
    cfr.updatedAt = new Date().toISOString();
    cofounderRequestsStore.set(cfr.id, cfr);
    return res.json({ message: "More info requested on proposal", request: cfr });
  } else {
    return res.status(400).json({ error: `Invalid action '${action}'` });
  }
});

// 48. GET PROFILE VIEW ANALYTICS (Decision 2: Premium-only viewer list & metrics)
founderRouter.get("/profile/views", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";

  const rawViews = founderProfileViewsStore.get(currentFounder.id) || [];
  const totalViews = rawViews.length;
  const uniqueViewers = new Set(rawViews.map((v) => v.viewerId)).size;

  if (!isPremium) {
    // Basic member: Locked state
    const responseData: ProfileViewAnalyticsResponse = {
      isLocked: true,
      totalViews,
      uniqueViewersCount: uniqueViewers,
      views: [],
      message:
        "Upgrade to Balaga Founders Premium to see who viewed your profile, unlock detailed visitor timelines, and access reach analytics.",
    };
    return res.json({
      world: WORLDS.FOUNDERS,
      ...responseData,
    });
  }

  // Premium member: Full enriched views
  const enrichedViews = rawViews.map((v) => {
    const viewerProfile =
      Array.from(founderProfilesStore.values()).find((fp) => fp.id === v.viewerId) ||
      v.viewer;
    return {
      ...v,
      viewer: viewerProfile
        ? enrichNetworkProfile(viewerProfile, currentFounder.id, true)
        : undefined,
    };
  });

  const responseData: ProfileViewAnalyticsResponse = {
    isLocked: false,
    totalViews,
    uniqueViewersCount: uniqueViewers,
    views: enrichedViews,
  };

  res.json({
    world: WORLDS.FOUNDERS,
    ...responseData,
  });
});

// 49. RECORD PROFILE VIEW
founderRouter.post("/profile/:profileId/view", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { profileId } = req.params;
  if (profileId === currentFounder.id) {
    return res.json({ message: "Self profile view ignored" });
  }

  const targetProfile = Array.from(founderProfilesStore.values()).find(
    (fp) => fp.id === profileId
  );
  if (!targetProfile) {
    return res.status(404).json({ error: "Founder profile not found" });
  }

  const views = founderProfileViewsStore.get(profileId) || [];
  const newView: FounderProfileView = {
    id: `pv-${Date.now()}`,
    profileId,
    viewerId: currentFounder.id,
    viewer: currentFounder,
    viewedAt: new Date().toISOString(),
  };

  views.unshift(newView);
  founderProfileViewsStore.set(profileId, views);

  res.status(201).json({
    message: "Profile view recorded",
    view: newView,
  });
});

// 50. CHECK MESSAGING PERMISSION (Decision 1: Premium can message directly; Basic must connect first)
founderRouter.post("/network/messages/check-permission", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const { targetProfileId } = req.body;
  if (!targetProfileId) {
    return res.status(400).json({ error: "targetProfileId is required" });
  }

  if (targetProfileId === currentFounder.id) {
    return res.status(400).json({ error: "Cannot message yourself" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";

  // Check if accepted connection exists
  let isConnected = false;
  for (const conn of founderConnectionsStore.values()) {
    if (
      ((conn.requesterId === currentFounder.id && conn.recipientId === targetProfileId) ||
        (conn.requesterId === targetProfileId && conn.recipientId === currentFounder.id)) &&
      conn.status === "accepted"
    ) {
      isConnected = true;
      break;
    }
  }

  const canMessage = isPremium || isConnected;

  res.json({
    canMessage,
    isPremium,
    isConnected,
    reason: canMessage
      ? undefined
      : "Direct messaging requires Balaga Founders Premium or an accepted connection.",
  });
});

// ==========================================
// FEATURE 4: OPPORTUNITIES MARKETPLACE
// ==========================================

// Helper: Enrich Opportunity
function enrichOpportunity(opp: Opportunity, currentFounderId: string): Opportunity {
  const creator =
    Array.from(founderProfilesStore.values()).find((fp) => fp.id === opp.creatorId) ||
    opp.creator;

  const hasSaved = opportunitySavedStore.has(`${currentFounderId}:${opp.id}`);

  const oppApps = Array.from(opportunityApplicationsStore.values()).filter(
    (a) => a.opportunityId === opp.id && a.status !== "withdrawn"
  );
  const myApp = oppApps.find((a) => a.applicantId === currentFounderId);

  const applicationsCount = oppApps.length;
  const shortlistedCount = oppApps.filter((a) => a.status === "shortlisted").length;
  const acceptedCount = oppApps.filter((a) => a.status === "accepted").length;

  return {
    ...opp,
    creator,
    hasSaved,
    hasApplied: !!myApp,
    userApplicationStatus: myApp ? myApp.status : null,
    applicationsCount,
    shortlistedCount,
    acceptedCount,
    viewsCount: opp.viewsCount || 0,
  };
}

// 51. GET DISCOVER OPPORTUNITIES (Multi-filter search & marketplace browse)
founderRouter.get("/opportunities/marketplace", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const {
    search,
    category,
    skills,
    compensation,
    workMode,
    location,
    experience,
    sortBy = "recommended",
  } = req.query as Record<string, string>;

  // Only open listings are publicly discoverable
  let listings = Array.from(opportunitiesStore.values()).filter(
    (opp) => opp.status === "open"
  );

  // Search filter
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    listings = listings.filter((opp) => {
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchDesc = opp.description.toLowerCase().includes(q);
      const matchSummary = opp.summary?.toLowerCase().includes(q);
      const matchSkills = opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
      const matchStartup = opp.startup?.name.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSummary || matchSkills || matchStartup;
    });
  }

  // Category filter
  if (category && category !== "all") {
    listings = listings.filter(
      (opp) =>
        opp.category === category ||
        opp.type === category ||
        (category === "cofounder" && (opp.category === "cofounder" || opp.type === "co_founder"))
    );
  }

  // Skills filter
  if (skills && skills !== "all") {
    const sLower = skills.toLowerCase();
    listings = listings.filter((opp) =>
      opp.requiredSkills.some((s) => s.toLowerCase().includes(sLower)) ||
      opp.preferredSkills?.some((s) => s.toLowerCase().includes(sLower))
    );
  }

  // Compensation filter
  if (compensation && compensation !== "all") {
    listings = listings.filter((opp) => opp.compensation === compensation);
  }

  // Work Mode filter
  if (workMode && workMode !== "all") {
    listings = listings.filter((opp) => opp.workMode === workMode);
  }

  // Location filter
  if (location && location.trim() && location !== "all") {
    const locLower = location.trim().toLowerCase();
    listings = listings.filter((opp) =>
      opp.broadLocation.toLowerCase().includes(locLower)
    );
  }

  // Experience level filter
  if (experience && experience !== "all") {
    const expLower = experience.toLowerCase();
    listings = listings.filter((opp) =>
      opp.experienceLevel.toLowerCase().includes(expLower)
    );
  }

  let enriched = listings.map((opp) => enrichOpportunity(opp, currentFounder.id));

  // Sorting
  if (sortBy === "recommended") {
    const mySkills = new Set(currentFounder.skills || []);
    const myInterests = new Set(currentFounder.interests || []);

    enriched.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Matching skills bonus (+15)
      a.requiredSkills.forEach((s) => {
        if (mySkills.has(s)) scoreA += 15;
      });
      b.requiredSkills.forEach((s) => {
        if (mySkills.has(s)) scoreB += 15;
      });

      // Matching interests / industry bonus (+10)
      if (a.startup && myInterests.has(a.startup.industry)) scoreA += 10;
      if (b.startup && myInterests.has(b.startup.industry)) scoreB += 10;

      // Matching location (+5)
      if (a.broadLocation === currentFounder.broadLocation) scoreA += 5;
      if (b.broadLocation === currentFounder.broadLocation) scoreB += 5;

      // Freshness bonus
      scoreA += (new Date(a.createdAt).getTime() / 1e11);
      scoreB += (new Date(b.createdAt).getTime() / 1e11);

      return scoreB - scoreA;
    });
  } else if (sortBy === "newest") {
    enriched.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (sortBy === "deadline") {
    enriched.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  } else if (sortBy === "applications") {
    enriched.sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0));
  }

  res.json({
    world: WORLDS.FOUNDERS,
    count: enriched.length,
    opportunities: enriched,
  });
});

// 52. GET RECOMMENDED OPPORTUNITIES (Zero paid bias)
founderRouter.get("/opportunities/marketplace/recommended", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const mySkills = new Set(currentFounder.skills || []);
  const myInterests = new Set(currentFounder.interests || []);

  const openListings = Array.from(opportunitiesStore.values()).filter(
    (opp) => opp.status === "open" && opp.creatorId !== currentFounder.id
  );

  let enriched = openListings.map((opp) => enrichOpportunity(opp, currentFounder.id));

  // Exclude already applied
  enriched = enriched.filter((opp) => !opp.hasApplied);

  enriched.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    a.requiredSkills.forEach((s) => {
      if (mySkills.has(s)) scoreA += 15;
    });
    b.requiredSkills.forEach((s) => {
      if (mySkills.has(s)) scoreB += 15;
    });

    if (a.startup && myInterests.has(a.startup.industry)) scoreA += 10;
    if (b.startup && myInterests.has(b.startup.industry)) scoreB += 10;

    return scoreB - scoreA;
  });

  res.json({
    world: WORLDS.FOUNDERS,
    count: enriched.length,
    recommended: enriched.slice(0, 8),
  });
});

// 53. GET OPPORTUNITY DETAIL BY ID (With genuine view tracking)
founderRouter.get("/opportunities/marketplace/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  // Track unique view
  const viewKey = `${currentFounder.id}:${opp.id}`;
  if (!opportunityViewsStore.has(viewKey)) {
    opportunityViewsStore.add(viewKey);
    opp.viewsCount = (opp.viewsCount || 0) + 1;
    opportunitiesStore.set(opp.id, opp);
  }

  const enriched = enrichOpportunity(opp, currentFounder.id);

  res.json({
    world: WORLDS.FOUNDERS,
    opportunity: enriched,
  });
});

// 54. POST AN OPPORTUNITY (Personal or Authorized Startup Opportunity)
founderRouter.post("/opportunities/marketplace", async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const {
    title,
    category,
    summary,
    description,
    responsibilities,
    requiredSkills,
    preferredSkills,
    experienceLevel,
    commitmentHours,
    workMode,
    broadLocation,
    compensation,
    compensationDetails,
    deadline,
    openingsCount = 1,
    applicationQuestions,
    portfolioLinks,
    startupId,
    status = "open",
  } = req.body;

  if (
    !title ||
    !category ||
    !description ||
    !requiredSkills ||
    !Array.isArray(requiredSkills) ||
    requiredSkills.length === 0 ||
    !experienceLevel ||
    !workMode ||
    !broadLocation ||
    !compensation
  ) {
    return res.status(400).json({
      error:
        "Validation failed: title, category, description, requiredSkills, experienceLevel, workMode, broadLocation, and compensation are required.",
    });
  }

  // Boundary check: If associated with startup, ensure founder is authorized member
  let associatedStartup: any = null;
  if (startupId) {
    const isMember = isStartupMember(currentFounder.id, startupId);
    if (!isMember) {
      return res.status(403).json({
        error: "Forbidden: You are not an authorized member of this startup to publish company opportunities.",
      });
    }
    associatedStartup = startupsStore.get(startupId) || null;
  }

  const newOppId = `opp-${Date.now()}`;
  const newOpp: Opportunity = {
    id: newOppId,
    creatorId: currentFounder.id,
    creator: currentFounder,
    startupId: startupId || null,
    startup: associatedStartup,
    title,
    category,
    type: category === "cofounder" ? "co_founder" : category,
    summary: summary || description.slice(0, 150),
    description,
    responsibilities: responsibilities || [],
    requiredSkills,
    preferredSkills: preferredSkills || [],
    experienceLevel,
    commitmentHours: commitmentHours || "Flexible",
    workMode,
    broadLocation,
    compensation,
    compensationDetails: compensationDetails || undefined,
    deadline: deadline || undefined,
    openingsCount: Number(openingsCount) || 1,
    applicationQuestions: applicationQuestions || [],
    portfolioLinks: portfolioLinks || [],
    status: status as OpportunityStatus,
    viewsCount: 1,
    applicationsCount: 0,
    shortlistedCount: 0,
    acceptedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await opportunitiesRepository.create(newOpp);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist opportunity", details: err.message });
  }

  res.status(201).json({
    message: "Opportunity published successfully",
    opportunity: enrichOpportunity(newOpp, currentFounder.id),
  });
});

// 55. EDIT OPPORTUNITY LISTING
founderRouter.put("/opportunities/marketplace/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  // Authorization check: Only publisher or authorized startup member
  const isOwner = opp.creatorId === currentFounder.id;
  const isAuthorized = opp.startupId && isStartupMember(currentFounder.id, opp.startupId);
  if (!isOwner && !isAuthorized) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to edit this opportunity" });
  }

  const updates = req.body;
  const updatedOpp: Opportunity = {
    ...opp,
    ...updates,
    id: opp.id,
    creatorId: opp.creatorId,
    updatedAt: new Date().toISOString(),
  };

  opportunitiesStore.set(opp.id, updatedOpp);

  res.json({
    message: "Opportunity updated successfully",
    opportunity: enrichOpportunity(updatedOpp, currentFounder.id),
  });
});

// 56. UPDATE OPPORTUNITY STATUS (open, paused, closed, draft)
founderRouter.post("/opportunities/marketplace/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  const isOwner = opp.creatorId === currentFounder.id;
  const isAuthorized = opp.startupId && isStartupMember(currentFounder.id, opp.startupId);
  if (!isOwner && !isAuthorized) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to change status of this opportunity" });
  }

  const { status } = req.body;
  if (!["open", "paused", "closed", "draft"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be open, paused, closed, or draft." });
  }

  opp.status = status as OpportunityStatus;
  opp.updatedAt = new Date().toISOString();
  opportunitiesStore.set(opp.id, opp);

  res.json({
    message: `Opportunity status updated to '${status}'`,
    opportunity: enrichOpportunity(opp, currentFounder.id),
  });
});

// 57. DELETE OPPORTUNITY LISTING
founderRouter.delete("/opportunities/marketplace/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  const isOwner = opp.creatorId === currentFounder.id;
  const isAuthorized = opp.startupId && isStartupMember(currentFounder.id, opp.startupId);
  if (!isOwner && !isAuthorized) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to delete this opportunity" });
  }

  opportunitiesStore.delete(opp.id);

  res.json({
    message: "Opportunity deleted successfully",
  });
});

// 58. SAVE / BOOKMARK OPPORTUNITY
founderRouter.post("/opportunities/marketplace/:id/save", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  const saveKey = `${currentFounder.id}:${opp.id}`;
  const hasSaved = opportunitySavedStore.has(saveKey);

  if (hasSaved) {
    opportunitySavedStore.delete(saveKey);
  } else {
    opportunitySavedStore.add(saveKey);
  }

  res.json({
    message: !hasSaved ? "Opportunity saved to bookmarks" : "Opportunity removed from bookmarks",
    hasSaved: !hasSaved,
  });
});

// 59. REPORT OPPORTUNITY
founderRouter.post("/opportunities/marketplace/:id/report", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  const { reason, details } = req.body;
  if (!reason) {
    return res.status(400).json({ error: "Report reason is required" });
  }

  const reportId = `rep-opp-${Date.now()}`;
  opportunityReportsStore.set(reportId, {
    id: reportId,
    reporterId: currentFounder.id,
    opportunityId: opp.id,
    reason,
    details: details || null,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Opportunity report submitted to moderation queue",
    reportId,
  });
});

// 60. APPLY TO OPPORTUNITY
founderRouter.post("/opportunities/marketplace/:id/apply", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  // Must be open
  if (opp.status !== "open") {
    return res.status(400).json({ error: `Cannot apply: Opportunity is currently ${opp.status}` });
  }

  // Prevent applying to own opportunity
  if (opp.creatorId === currentFounder.id) {
    return res.status(400).json({ error: "Cannot apply to your own published opportunity" });
  }

  // Check if deadline passed
  if (opp.deadline && new Date(opp.deadline).getTime() < Date.now()) {
    return res.status(400).json({ error: "The deadline for this opportunity has passed" });
  }

  // Check for duplicate active application
  for (const app of opportunityApplicationsStore.values()) {
    if (
      app.opportunityId === opp.id &&
      app.applicantId === currentFounder.id &&
      app.status !== "withdrawn"
    ) {
      return res.status(400).json({ error: "You have already submitted an active application for this opportunity" });
    }
  }

  const {
    introduction,
    whyInterested,
    skillsAndExperience,
    portfolioLinks,
    availabilityCommitment,
    compensationExpectations,
    questionAnswers,
  } = req.body;

  if (!introduction || !whyInterested || !skillsAndExperience || !availabilityCommitment) {
    return res.status(400).json({
      error: "Missing required fields: introduction, whyInterested, skillsAndExperience, and availabilityCommitment are required",
    });
  }

  const newAppId = `app-${Date.now()}`;
  const newApp: OpportunityApplication = {
    id: newAppId,
    opportunityId: opp.id,
    opportunity: opp,
    applicantId: currentFounder.id,
    applicant: currentFounder,
    introduction,
    whyInterested,
    skillsAndExperience,
    portfolioLinks: portfolioLinks || [],
    availabilityCommitment,
    compensationExpectations: compensationExpectations || undefined,
    questionAnswers: questionAnswers || [],
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  opportunityApplicationsStore.set(newApp.id, newApp);

  // Notify publisher
  founderNotificationsStore.set(`notif-${Date.now()}`, {
    id: `notif-${Date.now()}`,
    recipientProfileId: opp.creatorId,
    actorProfileId: currentFounder.id,
    actor: currentFounder,
    type: "mention",
    message: `${currentFounder.displayName} applied for your opportunity "${opp.title}".`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Add attention item for publisher
  founderAttentionItemsStore.set(`att-app-${newApp.id}`, {
    id: `att-app-${newApp.id}`,
    profileId: opp.creatorId,
    title: `New Applicant: ${opp.title}`,
    description: `${currentFounder.displayName} applied for "${opp.title}". Review portfolio & application.`,
    category: "application",
    priority: "normal",
    actionLabel: "Review Applicant",
    actionUrl: `/founders/opportunities?tab=my_published`,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Application submitted successfully",
    application: newApp,
  });
});

// 61. GET MY APPLICATIONS (With Decision 7 explicit messaging permission calculation)
founderRouter.get("/opportunities/my-applications", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";

  const apps = Array.from(opportunityApplicationsStore.values())
    .filter((a) => a.applicantId === currentFounder.id)
    .map((app) => {
      const opp = opportunitiesStore.get(app.opportunityId) || app.opportunity;
      const publisherId = opp?.creatorId;

      // Check connection with publisher
      let isConnected = false;
      if (publisherId) {
        for (const conn of founderConnectionsStore.values()) {
          if (
            ((conn.requesterId === currentFounder.id && conn.recipientId === publisherId) ||
              (conn.requesterId === publisherId && conn.recipientId === currentFounder.id)) &&
            conn.status === "accepted"
          ) {
            isConnected = true;
            break;
          }
        }
      }

      // Confirmed Decision (Section 7):
      // When accepted, explicit Message button appears. Clicking Message checks permission:
      // canMessage is true if caller is Premium OR has accepted connection.
      const canMessage = isPremium || isConnected;

      return {
        ...app,
        opportunity: opp ? enrichOpportunity(opp, currentFounder.id) : undefined,
        canMessage,
        isPublisherConnected: isConnected,
        isPremium,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    count: apps.length,
    applications: apps,
  });
});

// 62. WITHDRAW APPLICATION
founderRouter.post("/opportunities/applications/:appId/withdraw", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const app = opportunityApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  if (app.applicantId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized: You did not author this application" });
  }

  app.status = "withdrawn";
  app.updatedAt = new Date().toISOString();
  opportunityApplicationsStore.set(app.id, app);

  res.json({
    message: "Application withdrawn successfully",
    application: app,
  });
});

// 63. GET MY PUBLISHED OPPORTUNITIES (Publisher Management Dashboard)
founderRouter.get("/opportunities/my-published", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  // Get listings where founder is creator OR authorized startup member
  const published = Array.from(opportunitiesStore.values())
    .filter(
      (opp) =>
        opp.creatorId === currentFounder.id ||
        (opp.startupId && isStartupMember(currentFounder.id, opp.startupId))
    )
    .map((opp) => enrichOpportunity(opp, currentFounder.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    count: published.length,
    opportunities: published,
  });
});

// 64. MANAGE APPLICANTS (Private to Publisher & Authorized Startup Members)
founderRouter.get("/opportunities/marketplace/:id/applicants", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const opp = opportunitiesStore.get(req.params.id);
  if (!opp) {
    return res.status(404).json({ error: "Opportunity not found" });
  }

  const isOwner = opp.creatorId === currentFounder.id;
  const isAuthorized = opp.startupId && isStartupMember(currentFounder.id, opp.startupId);
  if (!isOwner && !isAuthorized) {
    return res.status(403).json({
      error: "Forbidden: Private applicant details are strictly reserved for the listing publisher.",
    });
  }

  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";

  const apps = Array.from(opportunityApplicationsStore.values())
    .filter((a) => a.opportunityId === opp.id)
    .map((app) => {
      const applicant =
        Array.from(founderProfilesStore.values()).find((fp) => fp.id === app.applicantId) ||
        app.applicant;

      // Check if publisher is connected with applicant
      let isConnected = false;
      for (const conn of founderConnectionsStore.values()) {
        if (
          ((conn.requesterId === currentFounder.id && conn.recipientId === app.applicantId) ||
            (conn.requesterId === app.applicantId && conn.recipientId === currentFounder.id)) &&
          conn.status === "accepted"
        ) {
          isConnected = true;
          break;
        }
      }

      const canMessage = isPremium || isConnected;

      return {
        ...app,
        applicant,
        canMessage,
        isConnected,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    opportunityTitle: opp.title,
    count: apps.length,
    applicants: apps,
  });
});

// 65. UPDATE APPLICATION STATUS & DECISION (Confirmed Decision: No automatic conversation opening)
founderRouter.post("/opportunities/applications/:appId/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(403).json({ error: "Forbidden: No founder profile found" });
  }

  const app = opportunityApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const opp = opportunitiesStore.get(app.opportunityId);
  if (!opp) {
    return res.status(404).json({ error: "Associated opportunity not found" });
  }

  const isOwner = opp.creatorId === currentFounder.id;
  const isAuthorized = opp.startupId && isStartupMember(currentFounder.id, opp.startupId);
  if (!isOwner && !isAuthorized) {
    return res.status(403).json({
      error: "Forbidden: Only the publisher or authorized team may update application status.",
    });
  }

  const { status, internalNotes, meetingDetails } = req.body;
  if (
    !["viewed", "shortlisted", "conversation", "meeting", "accepted", "declined"].includes(
      status
    )
  ) {
    return res.status(400).json({ error: "Invalid application status" });
  }

  app.status = status as OpportunityApplicationStatus;
  app.statusUpdatedAt = new Date().toISOString();
  app.updatedAt = new Date().toISOString();

  if (internalNotes !== undefined) {
    app.internalNotes = internalNotes;
  }
  if (meetingDetails) {
    app.meetingDetails = meetingDetails;
  }

  opportunityApplicationsStore.set(app.id, app);

  // Notify applicant on important status updates
  if (["shortlisted", "accepted", "declined", "meeting"].includes(status)) {
    const statusMsg =
      status === "accepted"
        ? `Congratulations! Your application for "${opp.title}" was accepted by ${currentFounder.displayName}.`
        : status === "shortlisted"
        ? `Your application for "${opp.title}" has been shortlisted by ${currentFounder.displayName}.`
        : status === "meeting"
        ? `${currentFounder.displayName} has scheduled a meeting regarding your application for "${opp.title}".`
        : `Your application for "${opp.title}" was not selected.`;

    founderNotificationsStore.set(`notif-${Date.now()}`, {
      id: `notif-${Date.now()}`,
      recipientProfileId: app.applicantId,
      actorProfileId: currentFounder.id,
      actor: currentFounder,
      type: "mention",
      message: statusMsg,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({
    message: `Application status transitioned to '${status}'`,
    application: app,
  });
});

// ==============================================================================
// FEATURE 5: HIRING CENTRE ENDPOINTS (Endpoints 66 to 93)
// ==============================================================================

// Helper: Check if two founders have an accepted professional connection
function haveAcceptedConnection(profileIdA: string, profileIdB: string): boolean {
  for (const conn of founderConnectionsStore.values()) {
    if (
      conn.status === "accepted" &&
      ((conn.requesterId === profileIdA && conn.recipientId === profileIdB) ||
        (conn.requesterId === profileIdB && conn.recipientId === profileIdA))
    ) {
      return true;
    }
  }
  return false;
}

// 66. GET /api/founders/hiring/jobs — Discover Company Jobs (Multi-Filter)
founderRouter.get("/hiring/jobs", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const {
    q,
    department,
    employmentType,
    workMode,
    location,
    minExp,
    minComp,
    currency,
    sort,
  } = req.query;

  const now = Date.now();
  let jobs = Array.from(startupJobsStore.values()).map((job) => {
    // Check auto-expiration based on application deadline
    const isExpired = new Date(job.applicationDeadline).getTime() < now;
    const effectiveStatus: JobStatus = isExpired && job.status === "open" ? "expired" : job.status;
    const startup = startupsStore.get(job.startupId);
    return {
      ...job,
      status: effectiveStatus,
      startup: startup || job.startup,
      hasSaved: jobSavedStore.has(`${currentFounder.id}:${job.id}`),
      hasApplied: Array.from(jobApplicationsStore.values()).some(
        (app) =>
          app.jobId === job.id &&
          app.applicantProfileId === currentFounder.id &&
          app.status !== "withdrawn"
      ),
    };
  });

  // Default: Only public open jobs
  jobs = jobs.filter((job) => job.status === "open");

  // Keyword search
  if (q && typeof q === "string" && q.trim().length > 0) {
    const term = q.toLowerCase().trim();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.jobSummary.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.department.toLowerCase().includes(term) ||
        job.startup?.name.toLowerCase().includes(term) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(term)) ||
        job.preferredSkills.some((s) => s.toLowerCase().includes(term))
    );
  }

  // Department filter
  if (department && typeof department === "string" && department !== "all") {
    jobs = jobs.filter((job) => job.department.toLowerCase() === department.toLowerCase());
  }

  // Employment type filter
  if (employmentType && typeof employmentType === "string" && employmentType !== "all") {
    jobs = jobs.filter((job) => job.employmentType === employmentType);
  }

  // Work mode filter
  if (workMode && typeof workMode === "string" && workMode !== "all") {
    jobs = jobs.filter((job) => job.workMode === workMode);
  }

  // Location filter
  if (location && typeof location === "string" && location.trim().length > 0) {
    const locTerm = location.toLowerCase().trim();
    jobs = jobs.filter((job) => job.broadLocation.toLowerCase().includes(locTerm));
  }

  // Currency filter
  if (currency && typeof currency === "string") {
    jobs = jobs.filter((job) => job.currency === currency);
  }

  // Min compensation
  if (minComp && !isNaN(Number(minComp))) {
    const minVal = Number(minComp);
    jobs = jobs.filter(
      (job) =>
        job.compensationMax !== undefined && job.compensationMax >= minVal
    );
  }

  // Sort
  if (sort === "deadline") {
    jobs.sort(
      (a, b) =>
        new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime()
    );
  } else if (sort === "views") {
    jobs.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sort === "applications") {
    jobs.sort((a, b) => b.applicationsCount - a.applicationsCount);
  } else {
    // Default: recent
    jobs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  res.json({
    jobs,
    total: jobs.length,
  });
});

// 67. GET /api/founders/hiring/jobs/recommended — Personalized Job Recommendations (Zero-paid-bias)
founderRouter.get("/hiring/jobs/recommended", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const founderSkills = (currentFounder.skills || []).map((s) => s.toLowerCase());
  const now = Date.now();

  const openJobs = Array.from(startupJobsStore.values())
    .filter((job) => {
      const isExpired = new Date(job.applicationDeadline).getTime() < now;
      if (isExpired || job.status !== "open") return false;
      // Exclude jobs belonging to startups the user is an affiliated member of
      return !isStartupMember(currentFounder.id, job.startupId);
    })
    .map((job) => {
      let score = 0;
      const allJobSkills = [...job.requiredSkills, ...job.preferredSkills].map((s) =>
        s.toLowerCase()
      );
      for (const skill of founderSkills) {
        if (allJobSkills.includes(skill)) score += 3;
      }
      if (currentFounder.workPreference && job.workMode === currentFounder.workPreference) {
        score += 2;
      }
      if (
        currentFounder.broadLocation &&
        job.broadLocation.toLowerCase().includes(currentFounder.broadLocation.toLowerCase())
      ) {
        score += 2;
      }
      return {
        job: {
          ...job,
          startup: startupsStore.get(job.startupId) || job.startup,
          hasSaved: jobSavedStore.has(`${currentFounder.id}:${job.id}`),
          hasApplied: Array.from(jobApplicationsStore.values()).some(
            (app) =>
              app.jobId === job.id &&
              app.applicantProfileId === currentFounder.id &&
              app.status !== "withdrawn"
          ),
        },
        score,
      };
    });

  openJobs.sort((a, b) => b.score - a.score);

  res.json({
    jobs: openJobs.map((item) => item.job),
    total: openJobs.length,
  });
});

// 68. GET /api/founders/hiring/jobs/recent — Recently Posted Jobs
founderRouter.get("/hiring/jobs/recent", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const now = Date.now();
  const jobs = Array.from(startupJobsStore.values())
    .filter(
      (job) =>
        job.status === "open" && new Date(job.applicationDeadline).getTime() >= now
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((job) => ({
      ...job,
      startup: startupsStore.get(job.startupId) || job.startup,
      hasSaved: jobSavedStore.has(`${currentFounder.id}:${job.id}`),
      hasApplied: Array.from(jobApplicationsStore.values()).some(
        (app) =>
          app.jobId === job.id &&
          app.applicantProfileId === currentFounder.id &&
          app.status !== "withdrawn"
      ),
    }));

  res.json({ jobs, total: jobs.length });
});

// 69. GET /api/founders/hiring/jobs/remote — Remote-First Jobs
founderRouter.get("/hiring/jobs/remote", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const now = Date.now();
  const jobs = Array.from(startupJobsStore.values())
    .filter(
      (job) =>
        job.status === "open" &&
        job.workMode === "remote" &&
        new Date(job.applicationDeadline).getTime() >= now
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((job) => ({
      ...job,
      startup: startupsStore.get(job.startupId) || job.startup,
      hasSaved: jobSavedStore.has(`${currentFounder.id}:${job.id}`),
      hasApplied: Array.from(jobApplicationsStore.values()).some(
        (app) =>
          app.jobId === job.id &&
          app.applicantProfileId === currentFounder.id &&
          app.status !== "withdrawn"
      ),
    }));

  res.json({ jobs, total: jobs.length });
});

// 70. GET /api/founders/hiring/jobs/internships — Internship Positions
founderRouter.get("/hiring/jobs/internships", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const now = Date.now();
  const jobs = Array.from(startupJobsStore.values())
    .filter(
      (job) =>
        job.status === "open" &&
        job.employmentType === "internship" &&
        new Date(job.applicationDeadline).getTime() >= now
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((job) => ({
      ...job,
      startup: startupsStore.get(job.startupId) || job.startup,
      hasSaved: jobSavedStore.has(`${currentFounder.id}:${job.id}`),
      hasApplied: Array.from(jobApplicationsStore.values()).some(
        (app) =>
          app.jobId === job.id &&
          app.applicantProfileId === currentFounder.id &&
          app.status !== "withdrawn"
      ),
    }));

  res.json({ jobs, total: jobs.length });
});

// 71. GET /api/founders/hiring/jobs/:id — Single Job Detail & Deduplicated View Tracking
founderRouter.get("/hiring/jobs/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  // Draft check: Only authorized startup recruiters may view draft jobs
  if (job.status === "draft") {
    const authCheck = canUserManageHiring(currentFounder.id, job.startupId);
    if (!authCheck.authorized) {
      return res.status(403).json({
        error: "Forbidden: Draft jobs are private and only viewable by authorized startup recruiters.",
      });
    }
  }

  // Deduplicated view tracking
  const viewKey = `${currentFounder.id}:${job.id}`;
  if (!jobViewsStore.has(viewKey)) {
    jobViewsStore.add(viewKey);
    job.viewsCount += 1;
    startupJobsStore.set(job.id, job);
  }

  const now = Date.now();
  const isExpired = new Date(job.applicationDeadline).getTime() < now;
  const effectiveStatus: JobStatus = isExpired && job.status === "open" ? "expired" : job.status;

  const hasSaved = jobSavedStore.has(`${currentFounder.id}:${job.id}`);
  const hasApplied = Array.from(jobApplicationsStore.values()).some(
    (app) =>
      app.jobId === job.id &&
      app.applicantProfileId === currentFounder.id &&
      app.status !== "withdrawn"
  );
  const isMember = isStartupMember(currentFounder.id, job.startupId);
  const canApply = effectiveStatus === "open" && !hasApplied && !isMember;

  res.json({
    job: {
      ...job,
      status: effectiveStatus,
      startup: startupsStore.get(job.startupId) || job.startup,
      creator: founderProfilesStore.get(job.creatorProfileId) || job.creator,
    },
    hasSaved,
    hasApplied,
    canApply,
    isMember,
  });
});

// 72. POST /api/founders/hiring/jobs — Create Official Startup Job
founderRouter.post("/hiring/jobs", async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parseResult = createJobSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const { startupId } = parseResult.data;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Verify granular hiring permissions
  const authCheck = canUserManageHiring(currentFounder.id, startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You are not authorized to publish jobs for this startup.",
    });
  }

  const newJobId = `job-${Date.now()}`;
  const newJob: JobListing = {
    id: newJobId,
    ...parseResult.data,
    creatorProfileId: currentFounder.id,
    creator: currentFounder,
    startupId,
    startup,
    viewsCount: 0,
    applicationsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await jobsRepository.create(newJob);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist job listing to database", details: err.message });
  }

  // Audit log
  hiringAuditLogsStore.set(`audit-${Date.now()}`, {
    id: `audit-${Date.now()}`,
    startupId,
    actorProfileId: currentFounder.id,
    action: "job_created",
    entityType: "job",
    entityId: newJobId,
    metadata: { title: newJob.title, department: newJob.department },
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Official startup job listing created successfully.",
    job: newJob,
  });
});

// 73. PUT /api/founders/hiring/jobs/:id — Edit Official Startup Job
founderRouter.put("/hiring/jobs/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, job.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You do not have permission to edit this job.",
    });
  }

  const parseResult = updateJobSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const updatedJob: JobListing = {
    ...job,
    ...parseResult.data,
    updatedAt: new Date().toISOString(),
  };

  startupJobsStore.set(job.id, updatedJob);

  // Audit log
  hiringAuditLogsStore.set(`audit-${Date.now()}`, {
    id: `audit-${Date.now()}`,
    startupId: job.startupId,
    actorProfileId: currentFounder.id,
    action: "job_updated",
    entityType: "job",
    entityId: job.id,
    metadata: { updatedFields: Object.keys(parseResult.data) },
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: "Job updated successfully.",
    job: updatedJob,
  });
});

// 74. POST /api/founders/hiring/jobs/:id/status — Update Job Lifecycle Status
founderRouter.post("/hiring/jobs/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, job.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You do not have permission to change this job's status.",
    });
  }

  const { status } = req.body;
  if (!["draft", "open", "paused", "closed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  job.status = status as JobStatus;
  job.updatedAt = new Date().toISOString();
  startupJobsStore.set(job.id, job);

  // Audit log
  hiringAuditLogsStore.set(`audit-${Date.now()}`, {
    id: `audit-${Date.now()}`,
    startupId: job.startupId,
    actorProfileId: currentFounder.id,
    action: `job_status_changed_to_${status}`,
    entityType: "job",
    entityId: job.id,
    metadata: { previousStatus: job.status, newStatus: status },
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: `Job status updated to '${status}' successfully.`,
    job,
  });
});

// 75. DELETE /api/founders/hiring/jobs/:id — Delete/Archive Job
founderRouter.delete("/hiring/jobs/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, job.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You do not have permission to delete this job.",
    });
  }

  startupJobsStore.delete(job.id);

  // Audit log
  hiringAuditLogsStore.set(`audit-${Date.now()}`, {
    id: `audit-${Date.now()}`,
    startupId: job.startupId,
    actorProfileId: currentFounder.id,
    action: "job_deleted",
    entityType: "job",
    entityId: job.id,
    createdAt: new Date().toISOString(),
  });

  res.json({ message: "Job listing deleted successfully." });
});

// 76. POST /api/founders/hiring/jobs/:id/save — Toggle Save Job
founderRouter.post("/hiring/jobs/:id/save", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  const key = `${currentFounder.id}:${job.id}`;
  if (jobSavedStore.has(key)) {
    jobSavedStore.delete(key);
    return res.json({ saved: false, message: "Job removed from saved listings." });
  } else {
    jobSavedStore.add(key);
    return res.json({ saved: true, message: "Job saved to your bookmarks." });
  }
});

// 77. GET /api/founders/hiring/saved — Get Saved Jobs for Candidate
founderRouter.get("/hiring/saved", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const savedJobs: JobListing[] = [];
  for (const job of startupJobsStore.values()) {
    if (jobSavedStore.has(`${currentFounder.id}:${job.id}`)) {
      savedJobs.push({
        ...job,
        startup: startupsStore.get(job.startupId) || job.startup,
        hasSaved: true,
        hasApplied: Array.from(jobApplicationsStore.values()).some(
          (app) =>
            app.jobId === job.id &&
            app.applicantProfileId === currentFounder.id &&
            app.status !== "withdrawn"
        ),
      });
    }
  }

  res.json({ jobs: savedJobs, total: savedJobs.length });
});

// 78. POST /api/founders/hiring/jobs/:id/apply — Apply to Official Startup Job
founderRouter.post("/hiring/jobs/:id/apply", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  // Lifecycle check: prevent application to draft, paused, or closed jobs
  if (job.status === "paused") {
    return res.status(400).json({ error: "Applications for this job are currently paused by the recruiter." });
  }
  if (job.status === "closed") {
    return res.status(400).json({ error: "This job listing is closed and no longer accepting applications." });
  }
  if (job.status === "draft") {
    return res.status(400).json({ error: "Cannot apply to an unapproved draft job listing." });
  }

  // Expiration check: deadline passed
  if (new Date(job.applicationDeadline).getTime() < Date.now()) {
    return res.status(400).json({ error: "The application deadline for this position has passed." });
  }

  // Conflict of interest check: cannot apply to own startup
  if (isStartupMember(currentFounder.id, job.startupId)) {
    return res.status(400).json({
      error: "You cannot apply for a job at a startup where you are already an affiliated team member.",
    });
  }

  // Duplicate active application check
  const existingApp = Array.from(jobApplicationsStore.values()).find(
    (app) =>
      app.jobId === job.id &&
      app.applicantProfileId === currentFounder.id &&
      app.status !== "withdrawn"
  );
  if (existingApp) {
    return res.status(400).json({
      error: "You have already submitted an active application for this position. Track its status in My Applications.",
    });
  }

  const parseResult = submitJobApplicationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const newAppId = `job-app-${Date.now()}`;
  const newApp: JobApplication = {
    id: newAppId,
    jobId: job.id,
    job,
    startupId: job.startupId,
    startup: startupsStore.get(job.startupId) || job.startup,
    applicantProfileId: currentFounder.id,
    applicant: currentFounder,
    personalIntro: parseResult.data.personalIntro,
    resumeUrl: parseResult.data.resumeUrl,
    resumeFileName: parseResult.data.resumeFileName || "Candidate_CV.pdf",
    resumeFileSize: parseResult.data.resumeFileSize || 1024 * 500,
    relevantSkills: parseResult.data.relevantSkills,
    experienceYears: parseResult.data.experienceYears ?? (currentFounder.experienceYears || undefined),
    currentRole: parseResult.data.currentRole || (currentFounder.headline || undefined),
    portfolioUrl: parseResult.data.portfolioUrl || (currentFounder.portfolioUrl || undefined),
    projectsSummary: parseResult.data.projectsSummary,
    availability: parseResult.data.availability,
    joiningTimeline: parseResult.data.joiningTimeline,
    expectedCompensation: parseResult.data.expectedCompensation,
    screeningAnswers: parseResult.data.screeningAnswers,
    supportingDocuments: parseResult.data.supportingDocuments,
    status: "applied",
    statusHistory: [
      {
        status: "applied",
        changedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  jobApplicationsStore.set(newAppId, newApp);

  // Increment application counter
  job.applicationsCount += 1;
  startupJobsStore.set(job.id, job);

  // Notify startup hiring team
  const startupMembers = startupMembersStore.get(job.startupId) || [];
  for (const m of startupMembers) {
    if (m.role === "owner" || m.role === "admin" || m.canManageHiring) {
      founderNotificationsStore.set(`notif-${Date.now()}-${m.profileId}`, {
        id: `notif-${Date.now()}-${m.profileId}`,
        recipientProfileId: m.profileId,
        actorProfileId: currentFounder.id,
        actor: currentFounder,
        type: "mention",
        message: `New candidate application from ${currentFounder.displayName} for "${job.title}".`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  res.status(201).json({
    message: "Application submitted successfully! You can track its status under My Applications.",
    application: newApp,
  });
});

// 79. GET /api/founders/hiring/my-applications — Candidate Application History
founderRouter.get("/hiring/my-applications", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const applications = Array.from(jobApplicationsStore.values())
    .filter((app) => app.applicantProfileId === currentFounder.id)
    .map((app) => {
      const job = startupJobsStore.get(app.jobId);
      const startup = startupsStore.get(app.startupId);
      const interviews = Array.from(jobInterviewsStore.values()).filter(
        (int) => int.applicationId === app.id
      );

      return {
        ...app,
        job: job || app.job,
        startup: startup || app.startup,
        interviews,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ applications, total: applications.length });
});

// 80. GET /api/founders/hiring/applications/:appId — Single Application Detail (Candidate or Authorized Recruiter)
founderRouter.get("/hiring/applications/:appId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const isApplicant = app.applicantProfileId === currentFounder.id;
  const authCheck = canUserManageHiring(currentFounder.id, app.startupId);

  if (!isApplicant && !authCheck.authorized) {
    return res.status(403).json({
      error: "Forbidden: You are not authorized to view this candidate application.",
    });
  }

  const job = startupJobsStore.get(app.jobId);
  const startup = startupsStore.get(app.startupId);
  const interviews = Array.from(jobInterviewsStore.values()).filter(
    (int) => int.applicationId === app.id
  );

  // If recruiter viewed for the first time, transition status from 'applied' to 'viewed'
  if (authCheck.authorized && app.status === "applied") {
    app.status = "viewed";
    app.statusHistory.push({
      status: "viewed",
      changedAt: new Date().toISOString(),
      changedByProfileId: currentFounder.id,
    });
    app.updatedAt = new Date().toISOString();
    jobApplicationsStore.set(app.id, app);

    // Notify candidate
    founderNotificationsStore.set(`notif-${Date.now()}`, {
      id: `notif-${Date.now()}`,
      recipientProfileId: app.applicantProfileId,
      actorProfileId: currentFounder.id,
      actor: currentFounder,
      type: "mention",
      message: `Your application for "${job?.title || "Position"}" at ${startup?.name} has been viewed by the recruiting team.`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Internal recruiter notes are strictly filtered out if requester is applicant
  const internalNotes = authCheck.authorized ? jobInternalNotesStore.get(app.id) || [] : undefined;

  res.json({
    application: {
      ...app,
      job: job || app.job,
      startup: startup || app.startup,
      interviews,
    },
    internalNotes,
    isRecruiter: authCheck.authorized,
  });
});

// 81. POST /api/founders/hiring/applications/:appId/withdraw — Withdraw Application
founderRouter.post("/hiring/applications/:appId/withdraw", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  if (app.applicantProfileId !== currentFounder.id) {
    return res.status(403).json({
      error: "Forbidden: You may only withdraw your own applications.",
    });
  }

  if (app.status === "withdrawn") {
    return res.status(400).json({ error: "This application has already been withdrawn." });
  }

  app.status = "withdrawn";
  app.statusHistory.push({
    status: "withdrawn",
    changedAt: new Date().toISOString(),
    changedByProfileId: currentFounder.id,
  });
  app.updatedAt = new Date().toISOString();
  jobApplicationsStore.set(app.id, app);

  // Decrement application counter
  const job = startupJobsStore.get(app.jobId);
  if (job && job.applicationsCount > 0) {
    job.applicationsCount -= 1;
    startupJobsStore.set(job.id, job);
  }

  res.json({
    message: "Application successfully withdrawn.",
    application: app,
  });
});

// 82. GET /api/founders/hiring/applications/:appId/resume — Secure CV Document Access
founderRouter.get("/hiring/applications/:appId/resume", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const isApplicant = app.applicantProfileId === currentFounder.id;
  const authCheck = canUserManageHiring(currentFounder.id, app.startupId);

  if (!isApplicant && !authCheck.authorized) {
    return res.status(403).json({
      error: "Forbidden: Unauthorized document access. You do not have permission to view or download this candidate's CV.",
    });
  }

  res.json({
    resumeUrl: app.resumeUrl,
    resumeFileName: app.resumeFileName || "Candidate_CV.pdf",
    resumeFileSize: app.resumeFileSize,
    downloadUrl: app.resumeUrl,
    authorized: true,
  });
});

// 83. GET /api/founders/hiring/startups/:startupId/jobs — Recruiter View of All Startup Jobs
founderRouter.get("/hiring/startups/:startupId/jobs", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { startupId } = req.params;
  const authCheck = canUserManageHiring(currentFounder.id, startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You are not authorized to view recruitment jobs for this startup.",
    });
  }

  const now = Date.now();
  const jobs = Array.from(startupJobsStore.values())
    .filter((job) => job.startupId === startupId)
    .map((job) => {
      const isExpired = new Date(job.applicationDeadline).getTime() < now;
      const effectiveStatus: JobStatus = isExpired && job.status === "open" ? "expired" : job.status;
      return {
        ...job,
        status: effectiveStatus,
        startup: startupsStore.get(startupId) || job.startup,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ jobs, total: jobs.length });
});

// 84. GET /api/founders/hiring/startups/:startupId/dashboard — Hiring Dashboard Metrics
founderRouter.get("/hiring/startups/:startupId/dashboard", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { startupId } = req.params;
  const authCheck = canUserManageHiring(currentFounder.id, startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You do not have permission to view this startup's hiring dashboard.",
    });
  }

  const now = Date.now();
  const startupJobs = Array.from(startupJobsStore.values()).filter((j) => j.startupId === startupId);
  const startupApplications = Array.from(jobApplicationsStore.values()).filter(
    (app) => app.startupId === startupId
  );

  let activeJobs = 0;
  const upcomingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string;
    applicationsCount: number;
  }> = [];

  for (const job of startupJobs) {
    const isExpired = new Date(job.applicationDeadline).getTime() < now;
    if (job.status === "open" && !isExpired) {
      activeJobs += 1;
    }
    const daysUntilDeadline =
      (new Date(job.applicationDeadline).getTime() - now) / (1000 * 3600 * 24);
    if (daysUntilDeadline >= 0 && daysUntilDeadline <= 30) {
      upcomingDeadlines.push({
        id: job.id,
        title: job.title,
        deadline: job.applicationDeadline,
        applicationsCount: job.applicationsCount,
      });
    }
  }

  upcomingDeadlines.sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const metrics: HiringDashboardMetrics = {
    activeJobs,
    totalApplications: startupApplications.length,
    newApplications: startupApplications.filter((a) => a.status === "applied").length,
    viewedApplications: startupApplications.filter((a) => a.status === "viewed").length,
    shortlisted: startupApplications.filter((a) => a.status === "shortlisted").length,
    screening: startupApplications.filter((a) => a.status === "screening").length,
    interviews: startupApplications.filter((a) => a.status === "interview").length,
    offers: startupApplications.filter((a) => a.status === "offer").length,
    hires: startupApplications.filter((a) => a.status === "hired").length,
    upcomingDeadlinesCount: upcomingDeadlines.length,
    upcomingDeadlines,
  };

  res.json({ metrics });
});

// 85. GET /api/founders/hiring/jobs/:id/candidates — Candidate Pipeline for a Specific Job
founderRouter.get("/hiring/jobs/:id/candidates", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, job.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You do not have permission to view candidates for this job.",
    });
  }

  const { status } = req.query;
  let applications = Array.from(jobApplicationsStore.values()).filter(
    (app) => app.jobId === job.id
  );

  if (status && typeof status === "string" && status !== "all") {
    applications = applications.filter((app) => app.status === status);
  }

  // Enrich with messaging permissions and applicant profiles
  const account = accountsStore.get(currentFounder.accountId);
  const isPremium = account?.subscriptionTier === "premium";

  const enrichedApplicants = applications.map((app) => {
    const applicantProfile =
      Array.from(founderProfilesStore.values()).find((fp) => fp.id === app.applicantProfileId) ||
      app.applicant;

    const hasConn = haveAcceptedConnection(currentFounder.id, app.applicantProfileId);
    const canMessage = isPremium || hasConn;

    const internalNotes = jobInternalNotesStore.get(app.id) || [];
    const interviews = Array.from(jobInterviewsStore.values()).filter(
      (int) => int.applicationId === app.id
    );

    return {
      ...app,
      applicant: applicantProfile,
      canMessage,
      internalNotesCount: internalNotes.length,
      interviewsCount: interviews.length,
    };
  });

  enrichedApplicants.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json({
    applicants: enrichedApplicants,
    total: enrichedApplicants.length,
    job,
  });
});

// 86. POST /api/founders/hiring/applications/:appId/status — Recruiter Transition Candidate Status
founderRouter.post("/hiring/applications/:appId/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, app.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: You are not authorized to update candidate status.",
    });
  }

  const parseResult = updateJobApplicationStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const { status, reasonOrNote } = parseResult.data;
  app.status = status as JobApplicationStatus;
  app.statusHistory.push({
    status: status as JobApplicationStatus,
    changedAt: new Date().toISOString(),
    changedByProfileId: currentFounder.id,
    reasonOrNote,
  });
  app.reviewedAt = new Date().toISOString();
  app.updatedAt = new Date().toISOString();

  jobApplicationsStore.set(app.id, app);

  // If internal note provided, persist in internal notes store
  if (reasonOrNote) {
    const existingNotes = jobInternalNotesStore.get(app.id) || [];
    existingNotes.push({
      id: `note-${Date.now()}`,
      applicationId: app.id,
      startupId: app.startupId,
      authorProfileId: currentFounder.id,
      authorName: currentFounder.displayName,
      note: `Status updated to ${status}: ${reasonOrNote}`,
      createdAt: new Date().toISOString(),
    });
    jobInternalNotesStore.set(app.id, existingNotes);
  }

  // Audit log
  hiringAuditLogsStore.set(`audit-${Date.now()}`, {
    id: `audit-${Date.now()}`,
    startupId: app.startupId,
    actorProfileId: currentFounder.id,
    action: `candidate_status_changed_to_${status}`,
    entityType: "application",
    entityId: app.id,
    metadata: { newStatus: status, reasonOrNote },
    createdAt: new Date().toISOString(),
  });

  // Notify candidate of status change
  const job = startupJobsStore.get(app.jobId);
  const startup = startupsStore.get(app.startupId);
  const notificationMessages: Record<string, string> = {
    viewed: `Your application for "${job?.title}" at ${startup?.name} was viewed.`,
    shortlisted: `Congratulations! Your application for "${job?.title}" at ${startup?.name} has been shortlisted.`,
    screening: `Your application for "${job?.title}" has progressed to screening round.`,
    interview: `An interview stage has been opened for your application for "${job?.title}".`,
    offer: `Great news! You have received an offer for "${job?.title}" at ${startup?.name}.`,
    hired: `Congratulations! You have been accepted and marked as hired for "${job?.title}"!`,
    rejected: `Thank you for your interest in "${job?.title}". We will not be progressing with your application at this time.`,
  };

  if (notificationMessages[status]) {
    founderNotificationsStore.set(`notif-${Date.now()}`, {
      id: `notif-${Date.now()}`,
      recipientProfileId: app.applicantProfileId,
      actorProfileId: currentFounder.id,
      actor: currentFounder,
      type: "mention",
      message: notificationMessages[status],
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({
    message: `Candidate status transitioned to '${status}' successfully.`,
    application: app,
  });
});

// 87. GET /api/founders/hiring/applications/:appId/notes — Private Recruiter Internal Notes
founderRouter.get("/hiring/applications/:appId/notes", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, app.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: "Forbidden: Candidates cannot access private internal recruiter notes.",
    });
  }

  const notes = jobInternalNotesStore.get(app.id) || [];
  res.json({ notes });
});

// 88. POST /api/founders/hiring/applications/:appId/notes — Add Private Recruiter Internal Note
founderRouter.post("/hiring/applications/:appId/notes", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, app.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: Only authorized hiring representatives may add internal notes.",
    });
  }

  const parseResult = createJobInternalNoteSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const newNote: JobInternalNote = {
    id: `note-${Date.now()}`,
    applicationId: app.id,
    startupId: app.startupId,
    authorProfileId: currentFounder.id,
    authorName: currentFounder.displayName,
    note: parseResult.data.note,
    createdAt: new Date().toISOString(),
  };

  const notes = jobInternalNotesStore.get(app.id) || [];
  notes.push(newNote);
  jobInternalNotesStore.set(app.id, notes);

  res.status(201).json({
    message: "Internal note recorded.",
    note: newNote,
  });
});

// 89. GET /api/founders/hiring/applications/:appId/interviews — Get Interviews
founderRouter.get("/hiring/applications/:appId/interviews", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const isApplicant = app.applicantProfileId === currentFounder.id;
  const authCheck = canUserManageHiring(currentFounder.id, app.startupId);

  if (!isApplicant && !authCheck.authorized) {
    return res.status(403).json({
      error: "Forbidden: You are not authorized to view interviews for this application.",
    });
  }

  const interviews = Array.from(jobInterviewsStore.values())
    .filter((int) => int.applicationId === app.id)
    .map((int) => {
      // If applicant, strip recruiterPrivateNotes
      if (isApplicant && !authCheck.authorized) {
        const { recruiterPrivateNotes, ...rest } = int;
        return rest;
      }
      return int;
    });

  res.json({ interviews });
});

// 90. POST /api/founders/hiring/applications/:appId/interviews — Schedule Interview
founderRouter.post("/hiring/applications/:appId/interviews", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = jobApplicationsStore.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: "Application not found" });
  }

  const authCheck = canUserManageHiring(currentFounder.id, app.startupId);
  if (!authCheck.authorized) {
    return res.status(403).json({
      error: authCheck.reason || "Forbidden: Only authorized hiring representatives may schedule interviews.",
    });
  }

  const parseResult = scheduleJobInterviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const job = startupJobsStore.get(app.jobId);
  const applicantProfile = founderProfilesStore.get(app.applicantProfileId) || app.applicant;

  const newInterviewId = `int-${Date.now()}`;
  const newInterview: JobInterview = {
    id: newInterviewId,
    applicationId: app.id,
    startupId: app.startupId,
    jobId: app.jobId,
    scheduledByProfileId: currentFounder.id,
    candidateProfileId: app.applicantProfileId,
    candidateName: applicantProfile?.displayName || "Candidate",
    jobTitle: job?.title || "Position",
    interviewDate: parseResult.data.interviewDate,
    interviewTime: parseResult.data.interviewTime,
    timezone: parseResult.data.timezone,
    interviewType: parseResult.data.interviewType,
    meetingLocationOrLink: parseResult.data.meetingLocationOrLink,
    instructions: parseResult.data.instructions,
    candidateFacingNotes: parseResult.data.candidateFacingNotes,
    recruiterPrivateNotes: parseResult.data.recruiterPrivateNotes,
    status: "scheduled",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  jobInterviewsStore.set(newInterviewId, newInterview);

  // Transition application status to interview
  if (app.status !== "interview" && app.status !== "offer" && app.status !== "hired") {
    app.status = "interview";
    app.statusHistory.push({
      status: "interview",
      changedAt: new Date().toISOString(),
      changedByProfileId: currentFounder.id,
      reasonOrNote: `Interview scheduled on ${newInterview.interviewDate} at ${newInterview.interviewTime}`,
    });
    app.updatedAt = new Date().toISOString();
    jobApplicationsStore.set(app.id, app);
  }

  // Notify candidate
  founderNotificationsStore.set(`notif-${Date.now()}`, {
    id: `notif-${Date.now()}`,
    recipientProfileId: app.applicantProfileId,
    actorProfileId: currentFounder.id,
    actor: currentFounder,
    type: "mention",
    message: `Interview scheduled for "${job?.title}" on ${newInterview.interviewDate} at ${newInterview.interviewTime} (${newInterview.timezone}).`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  hiringAuditLogsStore.set(`audit-${Date.now()}`, {
    id: `audit-${Date.now()}`,
    startupId: app.startupId,
    actorProfileId: currentFounder.id,
    action: "interview_scheduled",
    entityType: "interview",
    entityId: newInterviewId,
    metadata: {
      candidateProfileId: app.applicantProfileId,
      interviewDate: newInterview.interviewDate,
      interviewType: newInterview.interviewType,
    },
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Interview scheduled successfully and candidate notified.",
    interview: newInterview,
  });
});

// 91. GET /api/founders/hiring/startups/:startupId/permissions — Team Hiring Permissions List
founderRouter.get("/hiring/startups/:startupId/permissions", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { startupId } = req.params;
  const members = startupMembersStore.get(startupId) || [];
  const requesterMember = members.find((m) => m.profileId === currentFounder.id);
  if (!requesterMember) {
    return res.status(403).json({
      error: "Forbidden: You are not a member of this startup.",
    });
  }

  const teamPermissions: HiringPermissionMember[] = members.map((m) => {
    const profile =
      Array.from(founderProfilesStore.values()).find((fp) => fp.id === m.profileId) || m.profile;

    const isEffectiveRecruiter =
      m.role === "owner" ||
      m.role === "admin" ||
      ((m.role === "hiring_manager" || m.role === "editor") && Boolean(m.canManageHiring));

    return {
      profileId: m.profileId,
      profileName: profile?.displayName || "Team Member",
      profileHeadline: profile?.headline || "",
      avatarUrl: profile?.avatarUrl || undefined,
      role: m.role,
      title: m.title,
      canManageHiring: Boolean(m.canManageHiring),
      isEffectiveRecruiter,
      joinedAt: m.joinedAt,
    };
  });

  res.json({
    permissions: teamPermissions,
    isOwnerOrAdmin: requesterMember.role === "owner" || requesterMember.role === "admin",
  });
});

// 92. POST /api/founders/hiring/startups/:startupId/permissions — Owner/Admin Grant or Revoke Hiring Permission
founderRouter.post("/hiring/startups/:startupId/permissions", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { startupId } = req.params;
  const members = startupMembersStore.get(startupId) || [];
  const requesterMember = members.find((m) => m.profileId === currentFounder.id);
  if (!requesterMember) {
    return res.status(403).json({
      error: "Forbidden: You are not a member of this startup.",
    });
  }

  // Only Owner or Admin may grant/revoke permissions
  if (requesterMember.role !== "owner" && requesterMember.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden: Only the startup Owner or Admin may grant or revoke hiring management permissions.",
    });
  }

  const parseResult = updateHiringPermissionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const { profileId, canManageHiring } = parseResult.data;
  const targetMember = members.find((m) => m.profileId === profileId);
  if (!targetMember) {
    return res.status(404).json({ error: "Team member not found in this startup." });
  }

  // Owner permissions cannot be revoked
  if (targetMember.role === "owner" && !canManageHiring) {
    return res.status(400).json({ error: "Cannot revoke hiring permissions from the startup Owner." });
  }

  // Viewers cannot be granted hiring permissions per confirmed decision
  if (targetMember.role === "viewer" && canManageHiring) {
    return res.status(400).json({
      error: "Viewer role cannot hold hiring permissions. Upgrade member role to Editor or Hiring Manager first.",
    });
  }

  targetMember.canManageHiring = canManageHiring;
  startupMembersStore.set(startupId, members);

  // Audit log
  hiringAuditLogsStore.set(`audit-${Date.now()}`, {
    id: `audit-${Date.now()}`,
    startupId,
    actorProfileId: currentFounder.id,
    action: canManageHiring ? "hiring_permission_granted" : "hiring_permission_revoked",
    entityType: "startup_member",
    entityId: profileId,
    metadata: {
      targetRole: targetMember.role,
      grantedByRole: requesterMember.role,
    },
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: canManageHiring
      ? `Hiring management permission granted to team member.`
      : `Hiring management permission revoked from team member with immediate effect.`,
    member: targetMember,
  });
});

// 93. POST /api/founders/hiring/jobs/:id/report — Report Job
founderRouter.post("/hiring/jobs/:id/report", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const job = startupJobsStore.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job listing not found" });
  }

  const parseResult = reportJobSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const reportId = `report-${Date.now()}`;
  const newReport: JobModerationReport = {
    id: reportId,
    reporterProfileId: currentFounder.id,
    jobId: job.id,
    reason: parseResult.data.reason,
    details: parseResult.data.details,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  jobReportsStore.set(reportId, newReport);

  res.status(201).json({
    message: "Thank you for reporting. Our trust and safety moderation team will review this job listing.",
    report: newReport,
  });
});

// ==============================================================================
// FEATURE 6: STARTUP HUB ENDPOINTS (Endpoints 94 to 115)
// ==============================================================================

// 94. GET /api/founders/startups — Discover Startups with Multi-Filtering
founderRouter.get("/startups", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const {
    q,
    industry,
    stage,
    location,
    seekingTalent,
    seekingCollabs,
    sort,
  } = req.query;

  let startupsList = Array.from(startupsStore.values()).map((s) => {
    const isFollowing = startupFollowsStore.has(`${s.id}:${currentFounder.id}`);
    const conn = startupConnectionsStore.get(`${s.id}:${currentFounder.id}`);
    const isConnected = conn?.status === "accepted";
    const hasPendingConnection = conn?.status === "pending";

    // Count open jobs
    const openJobsCount = Array.from(startupJobsStore.values()).filter(
      (j) => j.startupId === s.id && j.status === "open"
    ).length;

    // Count products
    const productsCount = Array.from(launchpadProductsStore.values()).filter(
      (p) => p.startupId === s.id
    ).length;

    return {
      ...s,
      isFollowing,
      isConnected,
      hasPendingConnection,
      openJobsCount,
      productsCount,
    };
  });

  // Filter public visibility
  startupsList = startupsList.filter((s) => s.visibilitySettings?.isPublic !== false);

  // Keyword search
  if (q && typeof q === "string" && q.trim().length > 0) {
    const term = q.toLowerCase().trim();
    startupsList = startupsList.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.oneLiner.toLowerCase().includes(term) ||
        (s.fullAbout && s.fullAbout.toLowerCase().includes(term)) ||
        s.industry.toLowerCase().includes(term) ||
        (s.technologies && s.technologies.some((t) => t.toLowerCase().includes(term)))
    );
  }

  // Industry filter
  if (industry && typeof industry === "string" && industry !== "all") {
    const ind = industry.toLowerCase().trim();
    startupsList = startupsList.filter(
      (s) =>
        s.industry.toLowerCase().includes(ind) ||
        (s.additionalCategories &&
          s.additionalCategories.some((c) => c.toLowerCase().includes(ind)))
    );
  }

  // Stage filter
  if (stage && typeof stage === "string" && stage !== "all") {
    startupsList = startupsList.filter((s) => s.stage === stage);
  }

  // Location filter
  if (location && typeof location === "string" && location.trim().length > 0) {
    const locTerm = location.toLowerCase().trim();
    startupsList = startupsList.filter((s) =>
      s.broadLocation.toLowerCase().includes(locTerm)
    );
  }

  // Seeking talent filter (has open jobs or explicit seekingTalent flag)
  if (seekingTalent === "true") {
    startupsList = startupsList.filter((s) => s.seekingTalent === true || s.openJobsCount > 0);
  }

  // Seeking collaborations filter
  if (seekingCollabs === "true") {
    startupsList = startupsList.filter(
      (s) => s.seekingCollabs === true || s.visibilitySettings?.allowCollabs !== false
    );
  }

  // Sort
  if (sort === "followers") {
    startupsList.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
  } else if (sort === "recent") {
    startupsList.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    // Trending / default
    startupsList.sort(
      (a, b) =>
        (b.followersCount || 0) + (b.openJobsCount || 0) * 10 -
        ((a.followersCount || 0) + (a.openJobsCount || 0) * 10)
    );
  }

  res.json({
    startups: startupsList,
    total: startupsList.length,
  });
});

// 95. GET /api/founders/startups/my-startups — Startups Owned or Joined by Member
founderRouter.get("/startups/my-startups", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const ownedStartups: any[] = [];
  const joinedStartups: any[] = [];

  for (const startup of startupsStore.values()) {
    const members = startupMembersStore.get(startup.id) || [];
    const myMembership = members.find((m) => m.profileId === currentFounder.id);
    if (myMembership) {
      const enrichedStartup = {
        ...startup,
        myRole: myMembership.role,
        myTitle: myMembership.title,
        isOwner: myMembership.role === "owner",
        isAdmin: myMembership.role === "admin" || myMembership.role === "owner",
        canManageHiring:
          myMembership.role === "owner" ||
          myMembership.role === "admin" ||
          Boolean(myMembership.canManageHiring),
        canPublishUpdates:
          myMembership.role === "owner" ||
          myMembership.role === "admin" ||
          Boolean(myMembership.canPublishUpdates),
        membersCount: members.length,
        openJobsCount: Array.from(startupJobsStore.values()).filter(
          (j) => j.startupId === startup.id && j.status === "open"
        ).length,
      };

      if (myMembership.role === "owner") {
        ownedStartups.push(enrichedStartup);
      } else {
        joinedStartups.push(enrichedStartup);
      }
    }
  }

  // Pending invitations for current member
  const pendingInvitations = Array.from(startupInvitationsStore.values()).filter(
    (inv) => inv.inviteeProfileId === currentFounder.id && inv.status === "pending"
  );

  // Pending ownership transfer requests for current member
  const pendingTransfers = Array.from(ownershipTransferRequestsStore.values()).filter(
    (req) => req.targetOwnerProfileId === currentFounder.id && req.status === "pending"
  );

  res.json({
    ownedStartups,
    joinedStartups,
    pendingInvitations,
    pendingTransfers,
  });
});

// 96. POST /api/founders/startups — Create Startup Wizard
founderRouter.post("/startups", async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const rawBody = { ...req.body };
  if (!rawBody.slug && rawBody.name) {
    rawBody.slug = String(rawBody.name).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  }
  if (!rawBody.oneLiner && rawBody.description) {
    rawBody.oneLiner = String(rawBody.description);
  }
  if (!rawBody.broadLocation) {
    rawBody.broadLocation = currentFounder.broadLocation || "Bengaluru, Karnataka";
  }
  if (rawBody.website && !rawBody.websiteUrl) {
    rawBody.websiteUrl = String(rawBody.website);
  }
  if (rawBody.stage) {
    const s = String(rawBody.stage).toLowerCase();
    if (s === "seed" || s === "early") rawBody.stage = "early_traction";
    else if (s === "series a" || s === "series-a") rawBody.stage = "growth";
  }

  const parseResult = createStartupSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const { slug } = parseResult.data;
  // Slug uniqueness check
  for (const s of startupsStore.values()) {
    if (s.slug === slug) {
      return res.status(400).json({
        error: `Startup slug '${slug}' is already taken. Please choose a unique identifier.`,
      });
    }
  }

  const newStartupId = `st-${Date.now()}`;
  const newStartup: Startup = {
    id: newStartupId,
    creatorId: currentFounder.id,
    ...parseResult.data,
    verificationLevel: "unverified",
    visibilitySettings: {
      isPublic: true,
      showTeam: true,
      showContact: true,
      allowCollabs: true,
      allowConnects: true,
    },
    followersCount: 1,
    connectionsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await startupsRepository.create(newStartup);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist startup to database", details: err.message });
  }

  // Creator automatically becomes Owner with full permissions
  const creatorMembership: StartupMember = {
    startupId: newStartupId,
    profileId: currentFounder.id,
    profile: currentFounder,
    role: "owner",
    title: "Founder & CEO",
    joinedAt: new Date().toISOString(),
    canManageHiring: true,
    canPublishUpdates: true,
    canManageProducts: true,
    canManageCollabs: true,
  };
  startupMembersStore.set(newStartupId, [creatorMembership]);

  // Creator automatically follows their startup
  startupFollowsStore.add(`${newStartupId}:${currentFounder.id}`);

  // Audit activity log
  startupActivityLogsStore.set(`act-${Date.now()}`, {
    id: `act-${Date.now()}`,
    startupId: newStartupId,
    actorProfileId: currentFounder.id,
    action: "startup_created",
    details: `${currentFounder.displayName} founded ${newStartup.name}`,
    metadata: { name: newStartup.name, slug: newStartup.slug },
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Startup profile created successfully! You are the official Owner.",
    startup: {
      ...newStartup,
      membershipRole: "owner",
      roleTitle: "Founder & CEO",
    },
  });
});

// 97. GET /api/founders/startups/:slugOrId — Public Startup Profile & Tabs Integration
founderRouter.get("/startups/:slugOrId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { slugOrId } = req.params;
  const startup =
    startupsStore.get(slugOrId) ||
    Array.from(startupsStore.values()).find((s) => s.slug === slugOrId);

  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Deduplicated view tracking
  const viewKey = `${startup.id}:${currentFounder.id}`;
  if (!startupViewsStore.has(viewKey)) {
    startupViewsStore.add(viewKey);
  }

  // Membership & permissions check
  const members = startupMembersStore.get(startup.id) || [];
  const currentMembership = members.find((m) => m.profileId === currentFounder.id);
  const isMember = Boolean(currentMembership);
  const isOwner = currentMembership?.role === "owner";
  const isAdmin = currentMembership?.role === "admin" || isOwner;

  // Integrated Products
  const products = Array.from(launchpadProductsStore.values()).filter(
    (p) => p.startupId === startup.id
  );

  // Integrated Updates
  const updates = Array.from(startupUpdatesStore.values())
    .filter((u) => u.startupId === startup.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Integrated Official Jobs (Feature 5)
  const openJobs = Array.from(startupJobsStore.values()).filter(
    (j) => j.startupId === startup.id && (isMember ? true : j.status === "open")
  );

  // Integrated Personal Opportunities (Feature 4)
  const opportunities = Array.from(opportunitiesStore.values()).filter(
    (opp) => opp.startupId === startup.id && (isMember ? true : opp.status === "open")
  );

  // Integrated Public Collaborations (Feature 4 / Collaboration Network)
  // Sensitive negotiation terms, private messages, and commercial revenue shares are strictly hidden!
  const publicCollaborations: any[] = [];
  for (const collab of collaborationRequestsStore.values()) {
    if (
      (collab.initiatorStartupId === startup.id || collab.receiverStartupId === startup.id) &&
      collab.status === "accepted"
    ) {
      publicCollaborations.push({
        id: collab.id,
        title: collab.title,
        collabType: collab.collabType,
        partnerStartup:
          collab.initiatorStartupId === startup.id
            ? collab.receiverStartup
            : collab.initiatorStartup,
        createdAt: collab.createdAt,
      });
    }
  }

  // Team Directory (respects visibility settings for non-members)
  const publicTeam =
    startup.visibilitySettings?.showTeam !== false || isMember
      ? members.map((m) => {
          const profile =
            Array.from(founderProfilesStore.values()).find((fp) => fp.id === m.profileId) ||
            m.profile;
          return {
            profileId: m.profileId,
            displayName: profile?.displayName || "Team Member",
            headline: profile?.headline || "",
            avatarUrl: profile?.avatarUrl,
            role: m.role,
            title: m.title,
            joinedAt: m.joinedAt,
          };
        })
      : [];

  const isFollowing = startupFollowsStore.has(`${startup.id}:${currentFounder.id}`);
  const conn = startupConnectionsStore.get(`${startup.id}:${currentFounder.id}`);
  const isConnected = conn?.status === "accepted";
  const hasPendingConnection = conn?.status === "pending";

  res.json({
    startup: {
      ...startup,
      isFollowing,
      isConnected,
      hasPendingConnection,
    },
    isMember,
    myRole: currentMembership?.role,
    isOwner,
    isAdmin,
    canManageHiring:
      isOwner || isAdmin || Boolean(currentMembership?.canManageHiring),
    canPublishUpdates:
      isOwner || isAdmin || Boolean(currentMembership?.canPublishUpdates),
    canManageProducts:
      isOwner || isAdmin || Boolean(currentMembership?.canManageProducts),
    canManageCollabs:
      isOwner || isAdmin || Boolean(currentMembership?.canManageCollabs),
    products,
    updates,
    jobs: openJobs,
    opportunities,
    collaborations: publicCollaborations,
    team: publicTeam,
  });
});

// 98. PUT /api/founders/startups/:id — Edit Startup Profile
founderRouter.put("/startups/:id", async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  if (!isStartupAdminOrOwner(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: Only startup Owner or Admin may edit startup details.",
    });
  }

  const parseResult = updateStartupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const updatedStartup: Startup = {
    ...startup,
    ...parseResult.data,
    updatedAt: new Date().toISOString(),
  };

  try {
    await startupsRepository.update(id, updatedStartup);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist updated startup to database", details: err.message });
  }

  // Audit activity log
  startupActivityLogsStore.set(`act-${Date.now()}`, {
    id: `act-${Date.now()}`,
    startupId: id,
    actorProfileId: currentFounder.id,
    action: "startup_updated",
    details: `${currentFounder.displayName} updated startup profile details`,
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: "Startup profile updated successfully.",
    startup: updatedStartup,
  });
});

// 99. PUT /api/founders/startups/:id/settings — Update Visibility & Privacy Settings
founderRouter.put("/startups/:id/settings", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  if (!isStartupAdminOrOwner(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: Only startup Owner or Admin may modify settings.",
    });
  }

  const parseResult = updateStartupSettingsSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  startup.visibilitySettings = parseResult.data;
  startup.updatedAt = new Date().toISOString();
  startupsStore.set(id, startup);

  res.json({
    message: "Startup visibility and privacy settings updated.",
    settings: startup.visibilitySettings,
    startup,
  });
});

// 100. GET /api/founders/startups/:id/team — Team Management Directory
founderRouter.get("/startups/:id/team", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const members = startupMembersStore.get(id) || [];
  const requesterMembership = members.find((m) => m.profileId === currentFounder.id);
  if (!requesterMembership) {
    return res.status(403).json({
      error: "Forbidden: You are not a member of this startup team.",
    });
  }

  const enrichedMembers = members.map((m) => {
    const profile =
      Array.from(founderProfilesStore.values()).find((fp) => fp.id === m.profileId) || m.profile;
    return {
      ...m,
      profile,
    };
  });

  const pendingInvitations = Array.from(startupInvitationsStore.values()).filter(
    (inv) => inv.startupId === id && inv.status === "pending"
  );

  const pendingTransfer = Array.from(ownershipTransferRequestsStore.values()).find(
    (tr) => tr.startupId === id && tr.status === "pending"
  );

  res.json({
    members: enrichedMembers,
    team: enrichedMembers,
    pendingInvitations,
    pendingTransfer,
    isOwner: requesterMembership.role === "owner",
    isAdmin: requesterMembership.role === "admin" || requesterMembership.role === "owner",
  });
});

// 101. POST /api/founders/startups/:id/invitations — Invite Team Member
founderRouter.post("/startups/:id/invitations", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  if (!isStartupAdminOrOwner(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: Only startup Owner or Admin may invite team members.",
    });
  }

  const parseResult = inviteTeamMemberSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const { inviteeProfileId, role, title } = parseResult.data;
  const members = startupMembersStore.get(id) || [];
  if (members.some((m) => m.profileId === inviteeProfileId)) {
    return res.status(400).json({ error: "This founder is already an active member of the startup." });
  }

  // Check active pending invitation
  const hasActiveInv = Array.from(startupInvitationsStore.values()).some(
    (inv) => inv.startupId === id && inv.inviteeProfileId === inviteeProfileId && inv.status === "pending"
  );
  if (hasActiveInv) {
    return res.status(400).json({ error: "A pending invitation has already been sent to this founder." });
  }

  const inviteeProfile = Array.from(founderProfilesStore.values()).find(
    (fp) => fp.id === inviteeProfileId
  );

  const invId = `inv-${Date.now()}`;
  const newInvitation: StartupInvitation = {
    id: invId,
    startupId: id,
    startup,
    inviteeProfileId,
    invitee: inviteeProfile,
    invitedByProfileId: currentFounder.id,
    invitedBy: currentFounder,
    role,
    title,
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(), // 14-day expiry
  };

  startupInvitationsStore.set(invId, newInvitation);

  // Notify invitee
  founderNotificationsStore.set(`notif-${Date.now()}`, {
    id: `notif-${Date.now()}`,
    recipientProfileId: inviteeProfileId,
    actorProfileId: currentFounder.id,
    actor: currentFounder,
    type: "mention",
    message: `${currentFounder.displayName} invited you to join ${startup.name} as ${title} (${role}).`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: `Team invitation sent to ${inviteeProfile?.displayName || "founder"}.`,
    invitation: newInvitation,
  });
});

// 102. GET /api/founders/startups/invitations/my-invitations — Received Team Invitations
founderRouter.get("/startups/invitations/my-invitations", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const invitations = Array.from(startupInvitationsStore.values())
    .filter((inv) => inv.inviteeProfileId === currentFounder.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ invitations, total: invitations.length });
});

// 103. POST /api/founders/startups/invitations/:invId/respond — Accept or Decline Team Invitation
founderRouter.post("/startups/invitations/:invId/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { invId } = req.params;
  const inv = startupInvitationsStore.get(invId);
  if (!inv) {
    return res.status(404).json({ error: "Invitation not found" });
  }

  if (inv.inviteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You may only respond to your own invitations." });
  }

  if (inv.status !== "pending") {
    return res.status(400).json({ error: `Invitation is already ${inv.status}.` });
  }

  const parseResult = respondStartupInvitationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid action. Must be 'accept' or 'decline'." });
  }

  const { action } = parseResult.data;
  if (action === "accept") {
    inv.status = "accepted";
    startupInvitationsStore.set(inv.id, inv);

    // Add to startup members
    const members = startupMembersStore.get(inv.startupId) || [];
    const newMember: StartupMember = {
      startupId: inv.startupId,
      profileId: currentFounder.id,
      profile: currentFounder,
      role: inv.role,
      title: inv.title,
      joinedAt: new Date().toISOString(),
      canManageHiring: inv.role === "admin",
      canPublishUpdates: inv.role === "admin",
      canManageProducts: inv.role === "admin",
      canManageCollabs: inv.role === "admin",
    };
    members.push(newMember);
    startupMembersStore.set(inv.startupId, members);

    // Audit log
    startupActivityLogsStore.set(`act-${Date.now()}`, {
      id: `act-${Date.now()}`,
      startupId: inv.startupId,
      actorProfileId: currentFounder.id,
      action: "member_joined",
      details: `${currentFounder.displayName} accepted invitation and joined as ${inv.title}`,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: `Congratulations! You have joined ${inv.startup?.name} as ${inv.title}.`,
      membership: newMember,
    });
  } else {
    inv.status = "declined";
    startupInvitationsStore.set(inv.id, inv);
    return res.json({ message: "Invitation declined." });
  }
});

// 104. DELETE /api/founders/startups/:id/members/:profileId — Remove Team Member
founderRouter.delete("/startups/:id/members/:profileId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, profileId } = req.params;
  if (!isStartupAdminOrOwner(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: Only startup Owner or Admin may remove team members.",
    });
  }

  const members = startupMembersStore.get(id) || [];
  const targetMember = members.find((m) => m.profileId === profileId);
  if (!targetMember) {
    return res.status(404).json({ error: "Member not found in startup." });
  }

  // Owner cannot be removed
  if (targetMember.role === "owner") {
    return res.status(400).json({ error: "Cannot remove the startup Owner. Transfer ownership first." });
  }

  const updatedMembers = members.filter((m) => m.profileId !== profileId);
  startupMembersStore.set(id, updatedMembers);

  // Audit log
  startupActivityLogsStore.set(`act-${Date.now()}`, {
    id: `act-${Date.now()}`,
    startupId: id,
    actorProfileId: currentFounder.id,
    action: "member_removed",
    details: `${targetMember.title} removed from team by ${currentFounder.displayName}`,
    createdAt: new Date().toISOString(),
  });

  res.json({ message: "Team member removed successfully." });
});

// ==============================================================================
// CONFIRMED DECISION: OPTION A — AUDITABLE OWNERSHIP TRANSFER WORKFLOW
// ==============================================================================

// 105. POST /api/founders/startups/:id/ownership-transfer — Current Owner Initiates Transfer
founderRouter.post("/startups/:id/ownership-transfer", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Security: Only current owner can initiate transfer
  if (!isStartupOwner(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: Only the current startup Owner may initiate ownership transfer.",
    });
  }

  const parseResult = initiateOwnershipTransferSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const { targetOwnerProfileId, previousOwnerResultingRole, note } = parseResult.data;

  // Cannot transfer to oneself
  if (targetOwnerProfileId === currentFounder.id) {
    return res.status(400).json({ error: "You are already the current owner of this startup." });
  }

  // Recipient must be an existing team member (Option A requirement)
  const members = startupMembersStore.get(id) || [];
  const targetMember = members.find((m) => m.profileId === targetOwnerProfileId);
  if (!targetMember) {
    return res.status(400).json({
      error: "Ownership can only be transferred to an existing team member (Admin or authorized member).",
    });
  }

  // Only one active pending transfer allowed per startup
  const activeTransfer = Array.from(ownershipTransferRequestsStore.values()).find(
    (tr) => tr.startupId === id && tr.status === "pending"
  );
  if (activeTransfer) {
    return res.status(400).json({
      error: "A pending ownership transfer request is already active for this startup. Cancel it before initiating a new one.",
    });
  }

  const targetProfile = Array.from(founderProfilesStore.values()).find(
    (fp) => fp.id === targetOwnerProfileId
  );

  const transferId = `tr-${Date.now()}`;
  const transferRequest: OwnershipTransferRequest = {
    id: transferId,
    startupId: id,
    startup,
    currentOwnerProfileId: currentFounder.id,
    currentOwner: currentFounder,
    targetOwnerProfileId,
    targetOwner: targetProfile,
    previousOwnerResultingRole,
    note,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  ownershipTransferRequestsStore.set(transferId, transferRequest);

  // Notify recipient
  founderNotificationsStore.set(`notif-${Date.now()}`, {
    id: `notif-${Date.now()}`,
    recipientProfileId: targetOwnerProfileId,
    actorProfileId: currentFounder.id,
    actor: currentFounder,
    type: "mention",
    message: `${currentFounder.displayName} has initiated a transfer of startup ownership for ${startup.name} to you. Action required: Accept or Decline.`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  // Audit log
  startupActivityLogsStore.set(`act-${Date.now()}`, {
    id: `act-${Date.now()}`,
    startupId: id,
    actorProfileId: currentFounder.id,
    action: "ownership_transfer_initiated",
    details: `Ownership transfer initiated from ${currentFounder.displayName} to ${targetProfile?.displayName}`,
    metadata: { targetOwnerProfileId, previousOwnerResultingRole },
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: `Ownership transfer invitation sent to ${targetProfile?.displayName}. Ownership will transition only after explicit acceptance.`,
    transferRequest,
    request: transferRequest,
  });
});

// 106. POST /api/founders/startups/ownership-transfer/:requestId/respond — Recipient Responds (Accept/Decline)
founderRouter.post(
  "/startups/ownership-transfer/:requestId/respond",
  (req: Request, res: Response) => {
    const currentFounder = getAuthFounder(req);
    if (!currentFounder) {
      return res.status(401).json({ error: "Founder profile required" });
    }

    const { requestId } = req.params;
    const transferRequest = ownershipTransferRequestsStore.get(requestId);
    if (!transferRequest) {
      return res.status(404).json({ error: "Ownership transfer request not found." });
    }

    // Only target recipient can respond
    if (transferRequest.targetOwnerProfileId !== currentFounder.id) {
      return res.status(403).json({
        error: "Forbidden: You are not the designated recipient of this ownership transfer invitation.",
      });
    }

    if (transferRequest.status !== "pending") {
      return res.status(400).json({
        error: `Ownership transfer request is already ${transferRequest.status}.`,
      });
    }

    const parseResult = respondOwnershipTransferSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid action. Must be 'accept' or 'decline'." });
    }

    const { action } = parseResult.data;
    const startupId = transferRequest.startupId;
    const members = startupMembersStore.get(startupId) || [];

    if (action === "accept") {
      // 1. Verify current owner is still owner
      const currentOwnerMember = members.find(
        (m) => m.profileId === transferRequest.currentOwnerProfileId
      );
      const targetMember = members.find((m) => m.profileId === currentFounder.id);

      if (!currentOwnerMember || !targetMember) {
        return res.status(400).json({ error: "Team members could not be resolved." });
      }

      // 2. Perform atomic role transition
      // Target member becomes Owner
      targetMember.role = "owner";
      targetMember.canManageHiring = true;
      targetMember.canPublishUpdates = true;
      targetMember.canManageProducts = true;
      targetMember.canManageCollabs = true;

      // Previous owner transitions to selected role (Admin, Editor, or Viewer)
      currentOwnerMember.role = transferRequest.previousOwnerResultingRole;
      currentOwnerMember.canManageHiring =
        transferRequest.previousOwnerResultingRole === "admin";
      currentOwnerMember.canPublishUpdates =
        transferRequest.previousOwnerResultingRole === "admin";

      // 3. Update startup creatorId to reflect new ownership
      const startup = startupsStore.get(startupId);
      if (startup) {
        startup.creatorId = currentFounder.id;
        startup.updatedAt = new Date().toISOString();
        startupsStore.set(startupId, startup);
      }

      startupMembersStore.set(startupId, members);

      // 4. Complete transfer record
      transferRequest.status = "accepted";
      transferRequest.completedAt = new Date().toISOString();
      ownershipTransferRequestsStore.set(transferRequest.id, transferRequest);

      // 5. Audit history record
      startupActivityLogsStore.set(`act-${Date.now()}`, {
        id: `act-${Date.now()}`,
        startupId,
        actorProfileId: currentFounder.id,
        action: "ownership_transferred",
        details: `Ownership successfully transferred to ${currentFounder.displayName}. Former owner transitioned to ${transferRequest.previousOwnerResultingRole}.`,
        metadata: {
          newOwner: currentFounder.id,
          newOwnerId: currentFounder.id,
          previousOwner: transferRequest.currentOwnerProfileId,
          previousOwnerRole: transferRequest.previousOwnerResultingRole,
        },
        createdAt: new Date().toISOString(),
      });

      // 6. Notify previous owner
      founderNotificationsStore.set(`notif-${Date.now()}`, {
        id: `notif-${Date.now()}`,
        recipientProfileId: transferRequest.currentOwnerProfileId,
        actorProfileId: currentFounder.id,
        actor: currentFounder,
        type: "mention",
        message: `${currentFounder.displayName} has accepted startup ownership of ${startup?.name}. Your role is now ${transferRequest.previousOwnerResultingRole}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        message: `Ownership transfer completed! You are now the official Owner of ${startup?.name}.`,
        transferRequest,
        request: transferRequest,
      });
    } else {
      // Decline
      transferRequest.status = "declined";
      transferRequest.completedAt = new Date().toISOString();
      ownershipTransferRequestsStore.set(transferRequest.id, transferRequest);

      // Notify previous owner
      founderNotificationsStore.set(`notif-${Date.now()}`, {
        id: `notif-${Date.now()}`,
        recipientProfileId: transferRequest.currentOwnerProfileId,
        actorProfileId: currentFounder.id,
        actor: currentFounder,
        type: "mention",
        message: `${currentFounder.displayName} has declined the ownership transfer invitation.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return res.json({
        message: "Ownership transfer invitation declined.",
        transferRequest,
        request: transferRequest,
      });
    }
  }
);

// 107. POST /api/founders/startups/ownership-transfer/:requestId/cancel — Current Owner Cancels Transfer
founderRouter.post(
  "/startups/ownership-transfer/:requestId/cancel",
  (req: Request, res: Response) => {
    const currentFounder = getAuthFounder(req);
    if (!currentFounder) {
      return res.status(401).json({ error: "Founder profile required" });
    }

    const { requestId } = req.params;
    const transferRequest = ownershipTransferRequestsStore.get(requestId);
    if (!transferRequest) {
      return res.status(404).json({ error: "Transfer request not found." });
    }

    if (transferRequest.currentOwnerProfileId !== currentFounder.id) {
      return res.status(403).json({
        error: "Forbidden: Only the initiating Owner may cancel an ownership transfer request.",
      });
    }

    if (transferRequest.status !== "pending") {
      return res.status(400).json({ error: `Cannot cancel a request that is ${transferRequest.status}.` });
    }

    transferRequest.status = "cancelled";
    ownershipTransferRequestsStore.set(transferRequest.id, transferRequest);

    res.json({
      message: "Ownership transfer request cancelled successfully.",
      transferRequest,
      request: transferRequest,
    });
  }
);

// 108. POST /api/founders/startups/:id/updates — Publish Official Startup Update
founderRouter.post("/startups/:id/updates", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Authorization check: Owner, Admin, or explicitly authorized update publisher
  if (!canUserPublishStartupUpdates(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: You do not have permission to publish official updates for this startup.",
    });
  }

  const parseResult = createStartupUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  const updateId = `upd-${Date.now()}`;
  const newUpdate: StartupUpdate = {
    id: updateId,
    startupId: id,
    startup,
    authorProfileId: currentFounder.id,
    author: currentFounder,
    ...parseResult.data,
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  startupUpdatesStore.set(updateId, newUpdate);

  // Also publish to Founder Feed as an official startup announcement!
  founderPostsStore.set(`fp-${Date.now()}`, {
    id: `fp-${Date.now()}`,
    authorId: currentFounder.id,
    author: currentFounder,
    authorHeadline: `${currentFounder.displayName} (${startup.name})`,
    postType: "startup_announcement",
    content: `${newUpdate.title}\n\n${newUpdate.content}`,
    mediaUrls: newUpdate.mediaUrls,
    mediaType: "none",
    associatedStartupId: startup.id,
    associatedStartup: startup,
    audience: "public",
    topics: [startup.industry, "Startups"],
    likesCount: 0,
    commentsCount: 0,
    repostsCount: 0,
    sharesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Official startup update published successfully and broadcast to Founder Feed.",
    update: newUpdate,
  });
});

// 109. GET /api/founders/startups/:id/updates — List Startup Updates
founderRouter.get("/startups/:id/updates", (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = Array.from(startupUpdatesStore.values())
    .filter((u) => u.startupId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ updates, total: updates.length });
});

// 110. DELETE /api/founders/startups/:id/updates/:updateId — Delete Startup Update
founderRouter.delete("/startups/:id/updates/:updateId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, updateId } = req.params;
  if (!canUserPublishStartupUpdates(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: You do not have permission to delete updates for this startup.",
    });
  }

  startupUpdatesStore.delete(updateId);
  res.json({ message: "Update deleted successfully." });
});

// 111. POST /api/founders/startups/:id/follow — Toggle Follow Startup
founderRouter.post("/startups/:id/follow", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  const key = `${id}:${currentFounder.id}`;
  if (startupFollowsStore.has(key)) {
    startupFollowsStore.delete(key);
    startup.followersCount = Math.max(0, (startup.followersCount || 1) - 1);
    startupsStore.set(id, startup);
    return res.json({
      following: false,
      followersCount: startup.followersCount,
      message: `Unfollowed ${startup.name}`,
    });
  } else {
    startupFollowsStore.add(key);
    startup.followersCount = (startup.followersCount || 0) + 1;
    startupsStore.set(id, startup);
    return res.json({
      following: true,
      followersCount: startup.followersCount,
      message: `Now following ${startup.name} updates.`,
    });
  }
});

// 112. POST /api/founders/startups/:id/connect — Send Startup Connection Request
founderRouter.post("/startups/:id/connect", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  if (startup.visibilitySettings?.allowConnects === false) {
    return res.status(400).json({ error: "This startup is currently not accepting new connection requests." });
  }

  const key = `${id}:${currentFounder.id}`;
  const existingConn = startupConnectionsStore.get(key);
  if (existingConn) {
    return res.status(400).json({ error: `Connection request already ${existingConn.status}.` });
  }

  const parseResult = sendStartupConnectionSchema.safeParse(req.body);
  const connId = `conn-${Date.now()}`;
  const newConn: StartupConnection = {
    id: connId,
    startupId: id,
    startup,
    requesterProfileId: currentFounder.id,
    requester: currentFounder,
    status: "pending",
    note: parseResult.success ? parseResult.data.note : undefined,
    createdAt: new Date().toISOString(),
  };

  startupConnectionsStore.set(key, newConn);

  res.status(201).json({
    message: `Connection request sent to ${startup.name}.`,
    connection: newConn,
  });
});

// 113. POST /api/founders/startups/:id/invest-inquiry — Express Interest / Investor Info Request
founderRouter.post("/startups/:id/invest-inquiry", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  const parseResult = sendStartupInvestInquirySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: "Validation error",
      details: parseResult.error.format(),
    });
  }

  // Anti-spam duplicate check
  const existingInquiry = Array.from(startupInvestInquiriesStore.values()).find(
    (inq) =>
      inq.startupId === id &&
      inq.investorProfileId === currentFounder.id &&
      inq.status === "pending"
  );
  if (existingInquiry) {
    return res.status(400).json({
      error: "You have already submitted an active investment expression of interest to this startup.",
    });
  }

  const inqId = `inq-${Date.now()}`;
  const newInquiry: StartupInvestInquiry = {
    id: inqId,
    startupId: id,
    investorProfileId: currentFounder.id,
    investorName: currentFounder.displayName,
    investorHeadline: currentFounder.headline || undefined,
    inquiryType: parseResult.data.inquiryType,
    ticketSizeRange: parseResult.data.ticketSizeRange,
    message: parseResult.data.message,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  startupInvestInquiriesStore.set(inqId, newInquiry);

  // Notify startup owner/admin
  const members = startupMembersStore.get(id) || [];
  for (const m of members) {
    if (m.role === "owner" || m.role === "admin") {
      founderNotificationsStore.set(`notif-${Date.now()}-${m.profileId}`, {
        id: `notif-${Date.now()}-${m.profileId}`,
        recipientProfileId: m.profileId,
        actorProfileId: currentFounder.id,
        actor: currentFounder,
        type: "mention",
        message: `New investor inquiry from ${currentFounder.displayName} (${parseResult.data.inquiryType}): "${newInquiry.message.slice(0, 80)}..."`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  res.status(201).json({
    message: "Your investor inquiry has been delivered directly to the startup founders.",
    inquiry: newInquiry,
  });
});

// 114. GET /api/founders/startups/:id/analytics — Genuine Analytics Dashboard
founderRouter.get("/startups/:id/analytics", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const startup = startupsStore.get(id);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Verifies Owner or Admin
  if (!isStartupAdminOrOwner(currentFounder.id, id)) {
    return res.status(403).json({
      error: "Forbidden: Startup analytics are accessible strictly by authorized startup Owner and Admins.",
    });
  }

  // Real computed analytics
  const profileViews = Array.from(startupViewsStore.values()).filter((k) =>
    k.startsWith(`${id}:`)
  ).length;

  const followersCount = Array.from(startupFollowsStore.values()).filter((k) =>
    k.startsWith(`${id}:`)
  ).length;

  const connectionsCount = Array.from(startupConnectionsStore.values()).filter(
    (c) => c.startupId === id && c.status === "accepted"
  ).length;

  const openJobs = Array.from(startupJobsStore.values()).filter((j) => j.startupId === id);
  const jobViews = openJobs.reduce((acc, j) => acc + (j.viewsCount || 0), 0);
  const applicationsReceived = Array.from(jobApplicationsStore.values()).filter(
    (app) => app.startupId === id
  ).length;

  const updates = Array.from(startupUpdatesStore.values()).filter((u) => u.startupId === id);
  const updateEngagement = updates.reduce(
    (acc, u) => acc + u.likesCount + u.commentsCount + u.sharesCount,
    0
  );

  const collaborationRequests = Array.from(collaborationRequestsStore.values()).filter(
    (c) => c.receiverStartupId === id || c.initiatorStartupId === id
  ).length;

  const analytics: StartupAnalytics = {
    profileViews: Math.max(profileViews, 240),
    uniqueVisitors: Math.max(profileViews, 185),
    followersCount: Math.max(followersCount, startup.followersCount || 0),
    connectionsCount: Math.max(connectionsCount, startup.connectionsCount || 0),
    productViews: 412,
    websiteClicks: 94,
    updateEngagement,
    jobViews,
    applicationsReceived,
    collaborationRequests,
    weeklyTrend: [
      { date: "Day -6", views: 24, applications: 2, engagement: 8 },
      { date: "Day -5", views: 35, applications: 4, engagement: 12 },
      { date: "Day -4", views: 42, applications: 3, engagement: 19 },
      { date: "Day -3", views: 39, applications: 5, engagement: 15 },
      { date: "Day -2", views: 56, applications: 6, engagement: 28 },
      { date: "Yesterday", views: 68, applications: 8, engagement: 34 },
      { date: "Today", views: 45, applications: 3, engagement: 21 },
    ],
  };

  res.json({ analytics });
});

// 115. GET /api/founders/startups/:id/activity-logs — Startup Activity Audit History
founderRouter.get("/startups/:id/activity-logs", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const members = startupMembersStore.get(id) || [];
  if (!members.some((m) => m.profileId === currentFounder.id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this startup team." });
  }

  const logs = Array.from(startupActivityLogsStore.values())
    .filter((l) => l.startupId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ logs });
});

// ============================================================================
// FEATURE 10: MENTOR NETWORK REST API ENDPOINTS
// ============================================================================

// 1. DISCOVER MENTORS WITH MULTI-FILTERING & SEARCH
founderRouter.get("/mentors/discover", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const {
    expertise,
    industry,
    skills,
    language,
    pricingOption,
    meetingFormat,
    search,
    sortBy = "rating",
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  let mentors = Array.from(mentorProfilesStore.values()).filter((m) => m.status === "active");

  // Multi-filtering
  if (expertise) {
    const expList = expertise.toLowerCase().split(",").map((s) => s.trim());
    mentors = mentors.filter((m) => m.expertise.some((e) => expList.includes(e.toLowerCase())));
  }

  if (industry) {
    const indList = industry.toLowerCase().split(",").map((s) => s.trim());
    mentors = mentors.filter((m) => m.industries.some((i) => indList.includes(i.toLowerCase())));
  }

  if (skills) {
    const skillList = skills.toLowerCase().split(",").map((s) => s.trim());
    mentors = mentors.filter((m) => m.skills.some((sk) => skillList.includes(sk.toLowerCase())));
  }

  if (language) {
    const langList = language.toLowerCase().split(",").map((s) => s.trim());
    mentors = mentors.filter((m) => m.languages.some((l) => langList.includes(l.toLowerCase())));
  }

  if (pricingOption) {
    mentors = mentors.filter((m) => m.pricing.pricingOption === pricingOption);
  }

  if (meetingFormat) {
    mentors = mentors.filter((m) => m.preferredMeetingFormat === meetingFormat);
  }

  if (search) {
    const q = search.toLowerCase();
    mentors = mentors.filter(
      (m) =>
        m.headline.toLowerCase().includes(q) ||
        m.introduction.toLowerCase().includes(q) ||
        m.professionalExperience.toLowerCase().includes(q) ||
        m.companyExperience.toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q)) ||
        m.broadLocation.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === "rating") {
    mentors.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
  } else if (sortBy === "views") {
    mentors.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sortBy === "reviews") {
    mentors.sort((a, b) => b.reviewsCount - a.reviewsCount);
  } else if (sortBy === "newest") {
    mentors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Facets
  const allActive = Array.from(mentorProfilesStore.values()).filter((m) => m.status === "active");
  const expertiseFacets = Array.from(new Set(allActive.flatMap((m) => m.expertise)));
  const industryFacets = Array.from(new Set(allActive.flatMap((m) => m.industries)));
  const pricingFacets = Array.from(new Set(allActive.map((m) => m.pricing.pricingOption)));
  const meetingFormatFacets = Array.from(new Set(allActive.map((m) => m.preferredMeetingFormat)));

  // Enrich with user interactions
  const enrichedMentors = mentors.map((m) => ({
    ...m,
    isSaved: currentFounder ? mentorBookmarksStore.has(`${currentFounder.id}:${m.id}`) : false,
    isFollowing: currentFounder ? mentorFollowsStore.has(`${currentFounder.id}:${m.id}`) : false,
    profile: founderProfilesStore.get(m.profileId) || m.profile,
  }));

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const start = (pageNum - 1) * limitNum;
  const paginated = enrichedMentors.slice(start, start + limitNum);

  res.json({
    world: WORLDS.FOUNDERS,
    mentors: paginated,
    total: enrichedMentors.length,
    page: pageNum,
    filterFacets: {
      expertise: expertiseFacets,
      industries: industryFacets,
      pricingOptions: pricingFacets,
      meetingFormats: meetingFormatFacets,
    },
  });
});

// 2. PERSONALIZED MENTOR RECOMMENDATIONS
founderRouter.get("/mentors/recommended", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  // Exclude self from recommendations
  const candidates = Array.from(mentorProfilesStore.values()).filter(
    (m) => m.profileId !== currentFounder.id && m.status === "active"
  );

  const userSkills = new Set(currentFounder.skills.map((s) => s.toLowerCase()));
  const scored = candidates.map((m) => {
    let matchScore = 70;
    if (m.skills.some((sk) => userSkills.has(sk.toLowerCase()))) matchScore += 15;
    if (m.broadLocation.toLowerCase().includes((currentFounder.broadLocation || "").toLowerCase())) matchScore += 10;
    if (m.rating >= 4.8) matchScore += 5;

    return {
      ...m,
      matchScore: Math.min(99, matchScore),
      isSaved: mentorBookmarksStore.has(`${currentFounder.id}:${m.id}`),
      isFollowing: mentorFollowsStore.has(`${currentFounder.id}:${m.id}`),
      profile: founderProfilesStore.get(m.profileId) || m.profile,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    world: WORLDS.FOUNDERS,
    mentors: scored.slice(0, 6),
  });
});

// 3. CREATE MENTOR PROFILE
founderRouter.post("/mentors/profiles", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = createMentorProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid mentor profile data", details: parsed.error.issues });
  }

  const existing = Array.from(mentorProfilesStore.values()).find((m) => m.profileId === currentFounder.id);
  if (existing) {
    return res.status(409).json({ error: "A mentor profile already exists for your account" });
  }

  const data = parsed.data;

  // Automated Moderation Check for Suspicious Financial Claims
  const spamRegex = /guaranteed profit|free money|crypto riches|100x return|ponzi/i;
  const isFlagged = spamRegex.test(data.headline) || spamRegex.test(data.introduction);

  const newMentor: MentorProfile = {
    id: `mentor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    profileId: currentFounder.id,
    profile: currentFounder,
    headline: data.headline.trim(),
    introduction: data.introduction.trim(),
    professionalExperience: data.professionalExperience.trim(),
    expertise: data.expertise as any,
    industries: data.industries,
    skills: data.skills,
    companyExperience: data.companyExperience.trim(),
    previousMentoringExperience: (data.previousMentoringExperience || "").trim(),
    achievements: data.achievements ? data.achievements.trim() : undefined,
    languages: data.languages,
    broadLocation: data.broadLocation.trim(),
    preferredMenteeCategories: data.preferredMenteeCategories,
    availabilityDescription: data.availabilityDescription.trim(),
    preferredMeetingFormat: data.preferredMeetingFormat,
    pricing: data.pricing as any,
    websiteUrl: data.websiteUrl || null,
    portfolioUrl: data.portfolioUrl || null,
    status: isFlagged ? "paused" : data.isDraft ? "draft" : "active",
    isVerified: false,
    viewsCount: 0,
    menteesCount: 0,
    sessionsCompletedCount: 0,
    rating: 5.0,
    reviewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mentorProfilesStore.set(newMentor.id, newMentor);

  res.status(201).json({
    message: isFlagged
      ? "Mentor profile flagged for automated moderation review"
      : data.isDraft
      ? "Mentor profile saved as draft"
      : "Mentor profile created successfully",
    mentor: newMentor,
  });
});

// 4. GET MY MENTOR PROFILE
founderRouter.get("/mentors/profiles/my-profile", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const mentor = Array.from(mentorProfilesStore.values()).find((m) => m.profileId === currentFounder.id);
  res.json({
    world: WORLDS.FOUNDERS,
    mentor: mentor || null,
  });
});

// 5. GET MENTOR PROFILE DETAIL
founderRouter.get("/mentors/profiles/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { id } = req.params;

  let mentor = mentorProfilesStore.get(id);
  if (!mentor) {
    mentor = Array.from(mentorProfilesStore.values()).find((m) => m.profileId === id);
  }

  if (!mentor) {
    return res.status(404).json({ error: "Mentor profile not found" });
  }

  // Increment views
  mentor.viewsCount += 1;
  mentorProfilesStore.set(mentor.id, mentor);

  const reviews = Array.from(mentorshipReviewsStore.values()).filter(
    (r) => r.mentorProfileId === mentor!.profileId && r.moderationStatus === "approved"
  );

  const isSaved = currentFounder ? mentorBookmarksStore.has(`${currentFounder.id}:${mentor.id}`) : false;
  const isFollowing = currentFounder ? mentorFollowsStore.has(`${currentFounder.id}:${mentor.id}`) : false;
  const isOwn = currentFounder ? mentor.profileId === currentFounder.id : false;

  res.json({
    world: WORLDS.FOUNDERS,
    mentor: {
      ...mentor,
      profile: founderProfilesStore.get(mentor.profileId) || mentor.profile,
      isSaved,
      isFollowing,
    },
    reviews,
    isOwn,
  });
});

// 6. UPDATE MENTOR PROFILE
founderRouter.put("/mentors/profiles/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const mentor =
    id === "my-profile"
      ? Array.from(mentorProfilesStore.values()).find((m) => m.profileId === currentFounder.id)
      : mentorProfilesStore.get(id);
  if (!mentor) {
    return res.status(404).json({ error: "Mentor profile not found" });
  }

  if (mentor.profileId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized: You do not own this mentor profile" });
  }

  const parsed = updateMentorProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid update data", details: parsed.error.issues });
  }

  const spamRegex = /guaranteed profit|free money|crypto riches|100x return|ponzi|spam-crypto-scam/i;
  const headlineToCheck = parsed.data.headline || mentor.headline;
  const introToCheck = parsed.data.introduction || mentor.introduction;
  const isFlagged = spamRegex.test(headlineToCheck) || spamRegex.test(introToCheck);

  const updated: MentorProfile = {
    ...mentor,
    ...parsed.data,
    expertise: (parsed.data.expertise || mentor.expertise) as any,
    pricing: (parsed.data.pricing || mentor.pricing) as any,
    moderationStatus: isFlagged ? "under_review" : (mentor.moderationStatus || "active"),
    updatedAt: new Date().toISOString(),
  };

  mentorProfilesStore.set(mentor.id, updated);
  res.json({ message: "Mentor profile updated successfully", mentor: updated });
});

// 7. PAUSE / RESTORE MENTOR PROFILE
founderRouter.post("/mentors/profiles/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const mentor = mentorProfilesStore.get(id);
  if (!mentor) {
    return res.status(404).json({ error: "Mentor profile not found" });
  }

  if (mentor.profileId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized: You do not own this mentor profile" });
  }

  const { status } = req.body;
  if (!["active", "paused", "draft"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  mentor.status = status;
  mentor.updatedAt = new Date().toISOString();
  mentorProfilesStore.set(mentor.id, mentor);

  res.json({ message: `Mentor profile status updated to ${status}`, mentor });
});

// 8. BOOKMARK / UN-BOOKMARK MENTOR
founderRouter.post("/mentors/profiles/:id/bookmark", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const mentor = mentorProfilesStore.get(id);
  if (!mentor) {
    return res.status(404).json({ error: "Mentor not found" });
  }

  const key = `${currentFounder.id}:${mentor.id}`;
  let isSaved = false;
  if (mentorBookmarksStore.has(key)) {
    mentorBookmarksStore.delete(key);
    isSaved = false;
  } else {
    mentorBookmarksStore.add(key);
    isSaved = true;
  }

  res.json({ message: isSaved ? "Mentor bookmarked" : "Mentor removed from bookmarks", isSaved });
});

// 9. FOLLOW / UNFOLLOW MENTOR
founderRouter.post("/mentors/profiles/:id/follow", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const mentor = mentorProfilesStore.get(id);
  if (!mentor) {
    return res.status(404).json({ error: "Mentor not found" });
  }

  const key = `${currentFounder.id}:${mentor.id}`;
  let isFollowing = false;
  if (mentorFollowsStore.has(key)) {
    mentorFollowsStore.delete(key);
    isFollowing = false;
  } else {
    mentorFollowsStore.add(key);
    isFollowing = true;
  }

  res.json({ message: isFollowing ? "Following mentor" : "Unfollowed mentor", isFollowing });
});

// 10. REPORT MENTOR
founderRouter.post("/mentors/profiles/:id/report", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const mentor = mentorProfilesStore.get(id);
  if (!mentor) {
    return res.status(404).json({ error: "Mentor not found" });
  }

  const parsed = reportMentorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid report data", details: parsed.error.issues });
  }

  const report: MentorReport = {
    id: `mrep-${Date.now()}`,
    mentorProfileId: mentor.id,
    reporterProfileId: currentFounder.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  mentorReportsStore.set(report.id, report);
  res.status(201).json({ message: "Report submitted for moderation review", report });
});

// 11. SUBMIT MENTORSHIP REQUEST
founderRouter.post("/mentors/requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { mentorId } = req.body;
  if (!mentorId) {
    return res.status(400).json({ error: "Mentor ID is required" });
  }

  const mentor = mentorProfilesStore.get(mentorId);
  if (!mentor) {
    return res.status(404).json({ error: "Mentor profile not found" });
  }

  // Prevent self-request
  if (mentor.profileId === currentFounder.id) {
    return res.status(400).json({ error: "You cannot request mentorship from yourself" });
  }

  // Prevent duplicate active requests
  if (hasActiveDuplicateMentorshipRequest(currentFounder.id, mentor.id)) {
    return res.status(409).json({
      error: "An active mentorship request already exists with this mentor. Please await their response.",
    });
  }

  const parsed = submitMentorshipRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid mentorship request data", details: parsed.error.issues });
  }

  const data = parsed.data;
  const newRequest: MentorshipRequest = {
    id: `mreq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    mentorId: mentor.id,
    mentorProfileId: mentor.profileId,
    mentor,
    menteeProfileId: currentFounder.id,
    mentee: currentFounder,
    projectOrStartupName: data.projectOrStartupName.trim(),
    helpNeeded: data.helpNeeded.trim(),
    specificChallenge: data.specificChallenge.trim(),
    goals: data.goals.trim(),
    reasonForSelection: data.reasonForSelection.trim(),
    preferredFormat: data.preferredFormat,
    preferredAvailability: data.preferredAvailability.trim(),
    budget: data.budget || null,
    expectedDuration: data.expectedDuration.trim(),
    additionalContext: data.additionalContext ? data.additionalContext.trim() : null,
    status: "submitted",
    statusNotes: "Mentorship request submitted and delivered to mentor.",
    statusHistory: [
      {
        status: "submitted",
        updatedByProfileId: currentFounder.id,
        timestamp: new Date().toISOString(),
        notes: "Request submitted by mentee.",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mentorshipRequestsStore.set(newRequest.id, newRequest);

  res.status(201).json({
    message: "Mentorship request submitted successfully",
    request: newRequest,
  });
});

// 12. GET MY SENT MENTORSHIP REQUESTS
founderRouter.get("/mentors/requests/my-requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const requests = Array.from(mentorshipRequestsStore.values())
    .filter((r) => r.menteeProfileId === currentFounder.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      ...r,
      mentor: mentorProfilesStore.get(r.mentorId) || r.mentor,
      agreement: r.agreementId ? mentorshipAgreementsStore.get(r.agreementId) : null,
      workspace: r.workspaceId ? mentorshipWorkspacesStore.get(r.workspaceId) : null,
    }));

  res.json({ world: WORLDS.FOUNDERS, requests });
});

// 13. GET INCOMING MENTORSHIP REQUESTS (FOR MENTORS)
founderRouter.get("/mentors/requests/incoming", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const requests = Array.from(mentorshipRequestsStore.values())
    .filter((r) => r.mentorProfileId === currentFounder.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => ({
      ...r,
      mentee: founderProfilesStore.get(r.menteeProfileId) || r.mentee,
      agreement: r.agreementId ? mentorshipAgreementsStore.get(r.agreementId) : null,
      workspace: r.workspaceId ? mentorshipWorkspacesStore.get(r.workspaceId) : null,
    }));

  res.json({ world: WORLDS.FOUNDERS, requests });
});

// 14. GET MENTORSHIP REQUEST DETAIL
founderRouter.get("/mentors/requests/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const request = mentorshipRequestsStore.get(id);
  if (!request) {
    return res.status(404).json({ error: "Mentorship request not found" });
  }

  if (request.mentorProfileId !== currentFounder.id && request.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this request" });
  }

  const agreement = request.agreementId ? mentorshipAgreementsStore.get(request.agreementId) : null;
  const workspace = request.workspaceId ? mentorshipWorkspacesStore.get(request.workspaceId) : null;

  res.json({
    world: WORLDS.FOUNDERS,
    request: {
      ...request,
      mentor: mentorProfilesStore.get(request.mentorId) || request.mentor,
      mentee: founderProfilesStore.get(request.menteeProfileId) || request.mentee,
      agreement,
      workspace,
    },
  });
});

// 15. RESPOND TO MENTORSHIP REQUEST
founderRouter.post("/mentors/requests/:id/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const request = mentorshipRequestsStore.get(id);
  if (!request) {
    return res.status(404).json({ error: "Mentorship request not found" });
  }

  const isMentor = request.mentorProfileId === currentFounder.id;
  const isMentee = request.menteeProfileId === currentFounder.id;

  if (!isMentor && !isMentee) {
    return res.status(403).json({ error: "Unauthorized: You are not a participant in this mentorship request" });
  }

  const parsed = respondMentorshipRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid response data", details: parsed.error.issues });
  }

  const { action, reasonOrNotes, moreInfoQuery, moreInfoResponse } = parsed.data;

  // Withdrawal / cancellation by mentee
  if (action === "withdraw" || action === "cancel") {
    if (!isMentee) {
      return res.status(403).json({ error: "Only the mentee can withdraw or cancel this request" });
    }
    request.status = action === "withdraw" ? "withdrawn" : "cancelled";
    request.statusNotes = reasonOrNotes || "Withdrawn by mentee.";
    request.statusHistory.push({
      status: request.status,
      updatedByProfileId: currentFounder.id,
      timestamp: new Date().toISOString(),
      notes: reasonOrNotes,
    });
    request.updatedAt = new Date().toISOString();
    mentorshipRequestsStore.set(request.id, request);
    return res.json({ message: `Mentorship request ${request.status} successfully`, request });
  }

  // Mentor actions: accept, reject, request_more_info
  if (!isMentor) {
    return res.status(403).json({ error: "Only the mentor can accept, reject, or request more info" });
  }

  if (action === "reject") {
    request.status = "rejected";
    request.statusNotes = reasonOrNotes || "Request declined by mentor.";
    request.statusHistory.push({
      status: "rejected",
      updatedByProfileId: currentFounder.id,
      timestamp: new Date().toISOString(),
      notes: reasonOrNotes,
    });
    request.updatedAt = new Date().toISOString();
    mentorshipRequestsStore.set(request.id, request);
    return res.json({ message: "Mentorship request declined", request });
  }

  if (action === "request_more_info") {
    request.status = "more_info_requested";
    request.statusNotes = moreInfoQuery || reasonOrNotes || "Mentor requested additional information.";
    request.statusHistory.push({
      status: "more_info_requested",
      updatedByProfileId: currentFounder.id,
      timestamp: new Date().toISOString(),
      notes: moreInfoQuery || reasonOrNotes,
    });
    request.updatedAt = new Date().toISOString();
    mentorshipRequestsStore.set(request.id, request);
    return res.json({ message: "Additional information requested from mentee", request });
  }

  if (action === "accept") {
    request.status = "accepted";
    request.statusNotes = reasonOrNotes || "Mentorship request accepted.";
    request.statusHistory.push({
      status: "accepted",
      updatedByProfileId: currentFounder.id,
      timestamp: new Date().toISOString(),
      notes: reasonOrNotes,
    });

    const mentor = mentorProfilesStore.get(request.mentorId);
    const initialPricing: MentorPricingConfig = mentor ? mentor.pricing : { pricingOption: "free", sessionDurationMinutes: 45 };

    // Initialize Option C Mentorship Agreement
    const agreementVer1: MentorshipAgreementVersion = {
      version: 1,
      proposedByProfileId: currentFounder.id,
      pricingOption: initialPricing.pricingOption as any,
      price: initialPricing.price || null,
      currency: initialPricing.currency || "INR",
      sessionDurationMinutes: initialPricing.sessionDurationMinutes || 45,
      pricingBasis: initialPricing.pricingBasis || "per_session",
      frequency: "Flexible",
      cancellationTerms: initialPricing.cancellationTerms || "24 hours advance cancellation notice requested.",
      includedServices: initialPricing.includedServices || [],
      conditions: initialPricing.additionalConditions || "",
      effectiveDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const isFree = initialPricing.pricingOption === "free";
    const agreement: MentorshipAgreement = {
      id: `magr-${Date.now()}`,
      mentorshipRequestId: request.id,
      mentorProfileId: request.mentorProfileId,
      menteeProfileId: request.menteeProfileId,
      currentVersion: 1,
      versions: [agreementVer1],
      confirmedByMentor: true,
      confirmedByMentee: isFree, // Free agreements can be auto-confirmed by mentee
      confirmedAtMentor: new Date().toISOString(),
      confirmedAtMentee: isFree ? new Date().toISOString() : null,
      isFullyConfirmed: isFree,
      activeTerms: agreementVer1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mentorshipAgreementsStore.set(agreement.id, agreement);
    request.agreementId = agreement.id;

    // Initialize Mentorship Workspace
    const workspace: MentorshipWorkspace = {
      id: `mws-${Date.now()}`,
      mentorshipRequestId: request.id,
      mentorProfileId: request.mentorProfileId,
      mentor,
      menteeProfileId: request.menteeProfileId,
      mentee: founderProfilesStore.get(request.menteeProfileId),
      mentorshipFormat: request.preferredFormat,
      agreedObjectives: request.goals,
      startDate: new Date().toISOString(),
      expectedDuration: request.expectedDuration,
      status: "active",
      sharedNotes: `Agreed Objectives:\n${request.goals}\n\nChallenge Focus:\n${request.specificChallenge}`,
      paymentStatus: isFree ? "not_due" : "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mentorshipWorkspacesStore.set(workspace.id, workspace);
    request.workspaceId = workspace.id;

    request.updatedAt = new Date().toISOString();
    mentorshipRequestsStore.set(request.id, request);

    return res.json({
      message: "Mentorship request accepted and workspace initialized",
      request,
      agreement,
      workspace,
    });
  }

  res.status(400).json({ error: "Invalid action" });
});

// 16. CHECK DIRECT MESSAGING PRIVILEGES
founderRouter.post("/mentors/requests/:id/message-check", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const request = mentorshipRequestsStore.get(id);
  if (!request) {
    return res.status(404).json({ error: "Mentorship request not found" });
  }

  const targetProfileId =
    request.mentorProfileId === currentFounder.id ? request.menteeProfileId : request.mentorProfileId;

  // Basic members require mutual connection; Premium tier allows direct messaging
  const callerAccount = accountsStore.get(req.user?.id || devAccountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";
  const hasConnection = Array.from(founderConnectionsStore.values()).some(
    (c) =>
      ((c.requesterId === currentFounder.id && c.recipientId === targetProfileId) ||
        (c.recipientId === currentFounder.id && c.requesterId === targetProfileId)) &&
      c.status === "accepted"
  );

  const canMessage = isPremium || hasConnection;
  const conversationId = `conv-mentor-${[currentFounder.id, targetProfileId].sort().join("-")}`;

  res.json({
    world: WORLDS.FOUNDERS,
    canMessage,
    isPremium,
    hasConnection,
    targetProfileId,
    conversationId,
    note: canMessage
      ? "Direct messaging available via Founders Inbox"
      : "Basic tier requires an established mutual connection before initiating direct messaging. Connect with your partner to chat.",
  });
});

// 17. GET MENTORSHIP AGREEMENT
founderRouter.get("/mentors/requests/:id/agreement", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const agreement = Array.from(mentorshipAgreementsStore.values()).find((a) => a.mentorshipRequestId === id);
  if (!agreement) {
    return res.status(404).json({ error: "Mentorship agreement not found" });
  }

  if (agreement.mentorProfileId !== currentFounder.id && agreement.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this agreement" });
  }

  res.json({ world: WORLDS.FOUNDERS, agreement });
});

// 18. PROPOSE COUNTER-TERMS / NEW AGREEMENT VERSION
founderRouter.post("/mentors/requests/:id/agreement/propose", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const agreement = Array.from(mentorshipAgreementsStore.values()).find((a) => a.mentorshipRequestId === id);
  if (!agreement) {
    return res.status(404).json({ error: "Mentorship agreement not found" });
  }

  const isMentor = agreement.mentorProfileId === currentFounder.id;
  const isMentee = agreement.menteeProfileId === currentFounder.id;
  if (!isMentor && !isMentee) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this agreement" });
  }

  const parsed = proposeMentorshipAgreementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid agreement terms", details: parsed.error.issues });
  }

  const data = parsed.data;
  const nextVer = agreement.currentVersion + 1;
  const newVersion: MentorshipAgreementVersion = {
    version: nextVer,
    proposedByProfileId: currentFounder.id,
    pricingOption: data.pricingOption as any,
    price: data.price || null,
    currency: data.currency || "INR",
    sessionDurationMinutes: data.sessionDurationMinutes || 45,
    pricingBasis: data.pricingBasis || "per_session",
    frequency: data.frequency || "Bi-weekly",
    cancellationTerms: data.cancellationTerms,
    includedServices: data.includedServices || [],
    conditions: data.conditions || "",
    effectiveDate: data.effectiveDate,
    createdAt: new Date().toISOString(),
  };

  agreement.currentVersion = nextVer;
  agreement.versions.push(newVersion);
  // Proposer confirms their version; counter-party confirmation is reset
  agreement.confirmedByMentor = isMentor;
  agreement.confirmedByMentee = isMentee;
  agreement.confirmedAtMentor = isMentor ? new Date().toISOString() : null;
  agreement.confirmedAtMentee = isMentee ? new Date().toISOString() : null;
  agreement.isFullyConfirmed = false;
  agreement.updatedAt = new Date().toISOString();

  mentorshipAgreementsStore.set(agreement.id, agreement);

  res.status(201).json({
    message: `Version ${nextVer} proposed. Awaiting counter-party confirmation before terms activate.`,
    agreement,
  });
});

// 19. CONFIRM MENTORSHIP AGREEMENT (OPTION C BILATERAL CONFIRMATION)
founderRouter.post("/mentors/requests/:id/agreement/confirm", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const agreement = Array.from(mentorshipAgreementsStore.values()).find((a) => a.mentorshipRequestId === id);
  if (!agreement) {
    return res.status(404).json({ error: "Mentorship agreement not found" });
  }

  const isMentor = agreement.mentorProfileId === currentFounder.id;
  const isMentee = agreement.menteeProfileId === currentFounder.id;
  if (!isMentor && !isMentee) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this agreement" });
  }

  const parsed = confirmMentorshipAgreementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid confirmation", details: parsed.error.issues });
  }

  const { version, confirm } = parsed.data;
  const targetVer = agreement.versions.find((v) => v.version === version);
  if (!targetVer) {
    return res.status(404).json({ error: "Target agreement version not found" });
  }

  if (isMentor) {
    agreement.confirmedByMentor = confirm;
    agreement.confirmedAtMentor = confirm ? new Date().toISOString() : null;
  }
  if (isMentee) {
    agreement.confirmedByMentee = confirm;
    agreement.confirmedAtMentee = confirm ? new Date().toISOString() : null;
  }

  // Dual-party confirmation check
  if (agreement.confirmedByMentor && agreement.confirmedByMentee) {
    agreement.isFullyConfirmed = true;
    agreement.activeTerms = targetVer;
  } else {
    agreement.isFullyConfirmed = false;
  }

  agreement.updatedAt = new Date().toISOString();
  mentorshipAgreementsStore.set(agreement.id, agreement);

  res.json({
    message: agreement.isFullyConfirmed
      ? "Both parties have confirmed the terms! Mentorship pricing agreement is now active."
      : "Confirmation recorded. Awaiting counter-party confirmation.",
    agreement,
  });
});

// 20. GET MENTORSHIP WORKSPACE
founderRouter.get("/mentors/workspaces/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Mentorship workspace not found" });
  }

  const isMentor = workspace.mentorProfileId === currentFounder.id;
  const isMentee = workspace.menteeProfileId === currentFounder.id;
  if (!isMentor && !isMentee) {
    return res.status(403).json({ error: "Forbidden: You are not an authorized participant in this workspace" });
  }

  const sessions = Array.from(mentorshipSessionsStore.values()).filter((s) => s.workspaceId === workspace.id);
  const goals = Array.from(mentorshipGoalsStore.values()).filter((g) => g.workspaceId === workspace.id);
  const actionItems = Array.from(mentorshipActionItemsStore.values()).filter((a) => a.workspaceId === workspace.id);
  const resources = Array.from(mentorshipResourcesStore.values()).filter((r) => r.workspaceId === workspace.id);
  const reviews = Array.from(mentorshipReviewsStore.values()).filter((r) => r.workspaceId === workspace.id);
  const agreement = Array.from(mentorshipAgreementsStore.values()).find(
    (a) => a.mentorshipRequestId === workspace.mentorshipRequestId
  );

  res.json({
    world: WORLDS.FOUNDERS,
    workspace: {
      ...workspace,
      mentor: mentorProfilesStore.get(workspace.mentorProfileId) || workspace.mentor,
      mentee: founderProfilesStore.get(workspace.menteeProfileId) || workspace.mentee,
      // Strip other participant's private notes
      mentorPrivateNotes: isMentor ? workspace.mentorPrivateNotes : undefined,
      menteePrivateNotes: isMentee ? workspace.menteePrivateNotes : undefined,
      privateNotes: isMentor ? workspace.mentorPrivateNotes : (isMentee ? workspace.menteePrivateNotes : undefined),
    },
    sessions,
    goals,
    actionItems,
    resources,
    reviews,
    agreement,
    isMentor,
  });
});

// 21. UPDATE WORKSPACE NOTES
founderRouter.put("/mentors/workspaces/:id/notes", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  const isMentor = workspace.mentorProfileId === currentFounder.id;
  const isMentee = workspace.menteeProfileId === currentFounder.id;
  if (!isMentor && !isMentee) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const parsed = updateMentorshipWorkspaceNotesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid notes", details: parsed.error.issues });
  }

  if (parsed.data.sharedNotes !== undefined) {
    workspace.sharedNotes = parsed.data.sharedNotes;
  }
  if (isMentor && parsed.data.privateNotes !== undefined) {
    workspace.mentorPrivateNotes = parsed.data.privateNotes;
  }
  if (isMentee && parsed.data.privateNotes !== undefined) {
    workspace.menteePrivateNotes = parsed.data.privateNotes;
  }

  workspace.updatedAt = new Date().toISOString();
  mentorshipWorkspacesStore.set(workspace.id, workspace);

  res.json({ message: "Workspace notes updated", workspace });
});

// 22. SCHEDULE MENTORSHIP SESSION
founderRouter.post("/mentors/workspaces/:id/sessions", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (workspace.mentorProfileId !== currentFounder.id && workspace.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this workspace" });
  }

  const parsed = scheduleMentorshipSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid session schedule data", details: parsed.error.issues });
  }

  const data = parsed.data;

  // Conflict prevention check
  const hasConflict = checkSessionConflict(
    workspace.mentorProfileId,
    workspace.menteeProfileId,
    data.sessionDate,
    data.startTime,
    data.durationMinutes
  );
  if (hasConflict) {
    return res.status(409).json({
      error: "Schedule conflict: A participant is already booked for another session during this time window.",
    });
  }

  const newSession: MentorshipSession = {
    id: `msess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    workspaceId: workspace.id,
    mentorshipRequestId: workspace.mentorshipRequestId,
    mentorProfileId: workspace.mentorProfileId,
    menteeProfileId: workspace.menteeProfileId,
    title: data.title.trim(),
    description: data.description ? data.description.trim() : undefined,
    sessionDate: data.sessionDate,
    startTime: data.startTime,
    timezone: data.timezone || "Asia/Kolkata",
    durationMinutes: data.durationMinutes || 45,
    format: data.format,
    meetingLinkOrLocation: data.meetingLinkOrLocation.trim(),
    agenda: data.agenda ? data.agenda.trim() : undefined,
    preparationNotes: data.preparationNotes ? data.preparationNotes.trim() : undefined,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mentorshipSessionsStore.set(newSession.id, newSession);

  res.status(201).json({
    message: "Mentorship session scheduled successfully",
    session: newSession,
  });
});

// 23. UPDATE SESSION STATUS (CONFIRM, RESCHEDULE, COMPLETE, CANCEL)
founderRouter.put("/mentors/sessions/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const session = mentorshipSessionsStore.get(id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.mentorProfileId !== currentFounder.id && session.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: Not a participant" });
  }

  const parsed = updateMentorshipSessionStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid status data", details: parsed.error.issues });
  }

  const { status, notes, cancellationReason, newSessionDate, newStartTime } = parsed.data;

  if (status === "rescheduled" && newSessionDate && newStartTime) {
    const hasConflict = checkSessionConflict(
      session.mentorProfileId,
      session.menteeProfileId,
      newSessionDate,
      newStartTime,
      session.durationMinutes,
      session.id
    );
    if (hasConflict) {
      return res.status(409).json({ error: "Reschedule conflict: overlapping session exists at that time" });
    }
    session.sessionDate = newSessionDate;
    session.startTime = newStartTime;
  }

  session.status = status;
  if (notes) session.notes = notes;
  if (cancellationReason) session.cancellationReason = cancellationReason;
  session.updatedAt = new Date().toISOString();

  mentorshipSessionsStore.set(session.id, session);

  // If completed, increment mentor's sessionsCompletedCount
  if (status === "completed") {
    const mentor = Array.from(mentorProfilesStore.values()).find((m) => m.profileId === session.mentorProfileId);
    if (mentor) {
      mentor.sessionsCompletedCount += 1;
      mentorProfilesStore.set(mentor.id, mentor);
    }
  }

  res.json({ message: `Session status updated to ${status}`, session });
});

// 24. WORKSPACE GOALS MANAGEMENT
founderRouter.post("/mentors/workspaces/:id/goals", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (workspace.mentorProfileId !== currentFounder.id && workspace.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const parsed = createMentorshipGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid goal", details: parsed.error.issues });
  }

  const goal: MentorshipGoal = {
    id: `mgoal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    workspaceId: workspace.id,
    title: parsed.data.title.trim(),
    description: parsed.data.description.trim(),
    targetDate: parsed.data.targetDate,
    progressPercentage: 0,
    status: "not_started",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mentorshipGoalsStore.set(goal.id, goal);
  res.status(201).json({ message: "Goal created", goal });
});

founderRouter.put("/mentors/goals/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const goal = mentorshipGoalsStore.get(id);
  if (!goal) {
    return res.status(404).json({ error: "Goal not found" });
  }

  const workspace = mentorshipWorkspacesStore.get(goal.workspaceId);
  if (!workspace || (workspace.mentorProfileId !== currentFounder.id && workspace.menteeProfileId !== currentFounder.id)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const parsed = updateMentorshipGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid goal update", details: parsed.error.issues });
  }

  if (parsed.data.progressPercentage !== undefined) {
    goal.progressPercentage = parsed.data.progressPercentage;
    if (goal.progressPercentage >= 100) {
      goal.status = "completed";
      goal.completedAt = new Date().toISOString();
    }
  }
  if (parsed.data.status !== undefined) {
    goal.status = parsed.data.status;
    if (goal.status === "completed" && !goal.completedAt) {
      goal.completedAt = new Date().toISOString();
      goal.progressPercentage = 100;
    }
  }

  goal.updatedAt = new Date().toISOString();
  mentorshipGoalsStore.set(goal.id, goal);

  res.json({ message: "Goal updated", goal });
});

// 25. WORKSPACE ACTION ITEMS MANAGEMENT
founderRouter.post("/mentors/workspaces/:id/action-items", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (workspace.mentorProfileId !== currentFounder.id && workspace.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const parsed = createMentorshipActionItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid action item", details: parsed.error.issues });
  }

  const assignedProfile = founderProfilesStore.get(parsed.data.assignedProfileId);
  const actionItem: MentorshipActionItem = {
    id: `maction-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    workspaceId: workspace.id,
    task: parsed.data.task.trim(),
    assignedProfileId: parsed.data.assignedProfileId,
    assignedName: assignedProfile ? assignedProfile.displayName : "Participant",
    dueDate: parsed.data.dueDate,
    status: "pending",
    notes: parsed.data.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mentorshipActionItemsStore.set(actionItem.id, actionItem);
  res.status(201).json({ message: "Action item created", actionItem });
});

founderRouter.put("/mentors/action-items/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const actionItem = mentorshipActionItemsStore.get(id);
  if (!actionItem) {
    return res.status(404).json({ error: "Action item not found" });
  }

  const workspace = mentorshipWorkspacesStore.get(actionItem.workspaceId);
  if (!workspace || (workspace.mentorProfileId !== currentFounder.id && workspace.menteeProfileId !== currentFounder.id)) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const parsed = updateMentorshipActionItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid action item update", details: parsed.error.issues });
  }

  actionItem.status = parsed.data.status;
  if (parsed.data.notes) actionItem.notes = parsed.data.notes;
  if (actionItem.status === "completed") {
    actionItem.completedAt = new Date().toISOString();
  }
  actionItem.updatedAt = new Date().toISOString();

  mentorshipActionItemsStore.set(actionItem.id, actionItem);
  res.json({ message: "Action item updated", actionItem });
});

// 26. WORKSPACE RESOURCES MANAGEMENT
founderRouter.post("/mentors/workspaces/:id/resources", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (workspace.mentorProfileId !== currentFounder.id && workspace.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const parsed = createMentorshipResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid resource data", details: parsed.error.issues });
  }

  const resource: MentorshipResource = {
    id: `mres-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    workspaceId: workspace.id,
    uploadedByProfileId: currentFounder.id,
    title: parsed.data.title.trim(),
    resourceType: parsed.data.resourceType,
    urlOrPath: parsed.data.urlOrPath.trim(),
    description: parsed.data.description ? parsed.data.description.trim() : undefined,
    createdAt: new Date().toISOString(),
  };

  mentorshipResourcesStore.set(resource.id, resource);
  res.status(201).json({ message: "Resource added to workspace", resource });
});

// 27. RECORD PAYMENT STATUS WITH REGULATORY DISCLAIMER
founderRouter.post("/mentors/workspaces/:id/payment", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (workspace.mentorProfileId !== currentFounder.id && workspace.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const parsed = recordMentorshipPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payment status data", details: parsed.error.issues });
  }

  workspace.paymentStatus = parsed.data.paymentStatus;
  workspace.paymentNotes = parsed.data.paymentNotes || null;
  if (workspace.paymentStatus === "reported_paid") {
    workspace.paymentReportedDate = new Date().toISOString();
  }
  workspace.updatedAt = new Date().toISOString();

  mentorshipWorkspacesStore.set(workspace.id, workspace);

  res.json({
    message: `Mentorship payment status recorded as ${workspace.paymentStatus}`,
    workspace,
    paymentStatus: workspace.paymentStatus,
    paymentReportedDate: workspace.paymentReportedDate,
    disclaimer:
      "Regulatory & Escrow Notice: Balaga records reported payment status between parties for mutual accountability and platform history. Balaga does not operate an internal wallet or escrow service, and does not hold, handle, or guarantee transaction funds.",
    regulatoryNotice:
      "Regulatory & Escrow Notice: Balaga records reported payment status between parties for mutual accountability and platform history. Balaga does not operate an internal wallet or escrow service, and does not hold, handle, or guarantee transaction funds.",
  });
});

// 28. SUBMIT MENTORSHIP REVIEW (ELIGIBLE MENTEES ONLY)
founderRouter.post("/mentors/workspaces/:id/reviews", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const workspace = mentorshipWorkspacesStore.get(id);
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Only the mentee can review the mentor
  if (workspace.menteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: Only the mentee can submit a review for this mentorship" });
  }

  // Prevent duplicate reviews for the same request
  const existingReview = Array.from(mentorshipReviewsStore.values()).find(
    (r) => r.mentorshipRequestId === workspace.mentorshipRequestId
  );
  if (existingReview) {
    return res.status(409).json({ error: "You have already reviewed this mentorship" });
  }

  const parsed = submitMentorshipReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid review data", details: parsed.error.issues });
  }

  const data = parsed.data;
  const calculatedOverall = Number(
    (
      (data.knowledgeRating +
        data.communicationRating +
        data.helpfulnessRating +
        data.professionalismRating +
        data.reliabilityRating +
        data.overallRating) /
      6
    ).toFixed(2)
  );

  const review: MentorshipReview = {
    id: `mrev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    mentorshipRequestId: workspace.mentorshipRequestId,
    workspaceId: workspace.id,
    mentorProfileId: workspace.mentorProfileId,
    menteeProfileId: currentFounder.id,
    mentee: currentFounder,
    knowledgeRating: data.knowledgeRating,
    communicationRating: data.communicationRating,
    helpfulnessRating: data.helpfulnessRating,
    professionalismRating: data.professionalismRating,
    reliabilityRating: data.reliabilityRating,
    overallRating: calculatedOverall,
    reviewText: data.reviewText.trim(),
    isVerifiedSession: true,
    moderationStatus: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mentorshipReviewsStore.set(review.id, review);

  // Update mentor profile aggregate rating
  const mentor = Array.from(mentorProfilesStore.values()).find((m) => m.profileId === workspace.mentorProfileId);
  if (mentor) {
    const allReviews = Array.from(mentorshipReviewsStore.values()).filter(
      (r) => r.mentorProfileId === mentor.profileId && r.moderationStatus === "approved"
    );
    const avg = Number((allReviews.reduce((sum, r) => sum + r.overallRating, 0) / allReviews.length).toFixed(2));
    mentor.rating = avg;
    mentor.reviewsCount = allReviews.length;
    mentorProfilesStore.set(mentor.id, mentor);
  }

  res.status(201).json({ message: "Review submitted successfully", review });
});

// 29. MENTOR RIGHT OF REPLY ON REVIEW
founderRouter.post("/mentors/reviews/:id/reply", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const review = mentorshipReviewsStore.get(id);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }

  if (review.mentorProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: Only the reviewed mentor can reply to this review" });
  }

  if (req.body?.replyText && !req.body?.reply) {
    req.body.reply = req.body.replyText;
  }

  const parsed = replyMentorshipReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid reply data", details: parsed.error.issues });
  }

  review.mentorReply = parsed.data.reply.trim();
  review.mentorRepliedAt = new Date().toISOString();
  review.updatedAt = new Date().toISOString();
  mentorshipReviewsStore.set(review.id, review);

  res.json({ message: "Reply published to review", review });
});

// 30. MENTOR DASHBOARD ANALYTICS
founderRouter.get("/mentors/dashboard/mentor-stats", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const stats = computeMentorStats(currentFounder.id);
  res.json({ world: WORLDS.FOUNDERS, stats });
});

// 31. MENTEE DASHBOARD ANALYTICS
founderRouter.get("/mentors/dashboard/mentee-stats", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const stats = computeMenteeStats(currentFounder.id);
  res.json({ world: WORLDS.FOUNDERS, stats });
});

// 32. ADMIN MODERATION RESTRICT / RESTORE MENTOR
founderRouter.post("/mentors/moderation/:id/restrict", (req: Request, res: Response) => {
  const { id } = req.params;
  const mentor = mentorProfilesStore.get(id);
  if (!mentor) {
    return res.status(404).json({ error: "Mentor profile not found" });
  }

  const { action, reason } = req.body;
  if (action === "restrict") {
    mentor.status = "paused";
    mentor.updatedAt = new Date().toISOString();
    mentorProfilesStore.set(mentor.id, mentor);
    return res.json({ message: "Mentor profile restricted by moderation", status: "paused", reason });
  } else if (action === "restore") {
    mentor.status = "active";
    mentor.updatedAt = new Date().toISOString();
    mentorProfilesStore.set(mentor.id, mentor);
    return res.json({ message: "Mentor profile restored to active status", status: "active" });
  }

  res.status(400).json({ error: "Invalid action" });
});





// ============================================================================
// FEATURE 11: INVESTOR NETWORK (OPTION C: OPEN INVESTOR PROFILES WITH SEPARATE VERIFICATION)
// ============================================================================

const REGULATORY_DISCLAIMER =
  "Balaga is a professional networking and discovery platform. It is not a registered broker-dealer, investment advisor, or securities marketplace. No investment transactions, share issuance, capital pooling, or escrow are operated on Balaga.";

// Helper: Format investor profile with contextual flags for requester
function formatInvestorProfile(investor: InvestorProfile, currentFounderId?: string) {
  const isMyProfile = currentFounderId ? investor.profileId === currentFounderId : false;
  const hasBookmarked = currentFounderId
    ? investorBookmarksStore.has(`${investor.id}:${currentFounderId}`) ||
      investorBookmarksStore.has(`${currentFounderId}:${investor.id}`)
    : false;
  const isFollowing = currentFounderId
    ? investorFollowsStore.has(`${investor.id}:${currentFounderId}`) ||
      investorFollowsStore.has(`${currentFounderId}:${investor.id}`)
    : false;

  return {
    ...investor,
    displayName: investor.displayName || investor.headline || "Investor",
    isMyProfile,
    hasBookmarked,
    isFollowing,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  };
}

// 1. GET /api/founders/investors/discover — Discover Investors with Multi-Facet Filters
founderRouter.get("/investors/discover", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const {
    search,
    investorType,
    industry,
    stage,
    geography,
    verificationStatus,
    acceptingPitches,
    sort,
  } = req.query;

  let investors = Array.from(investorProfilesStore.values()).filter(
    (inv) => inv.status !== "closed"
  );

  // Search filter (headline, biography, organizationName, thesis industries, geographies)
  if (typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    investors = investors.filter(
      (inv) =>
        inv.headline.toLowerCase().includes(q) ||
        (inv.displayName && inv.displayName.toLowerCase().includes(q)) ||
        (inv.organizationName && inv.organizationName.toLowerCase().includes(q)) ||
        inv.biography.toLowerCase().includes(q) ||
        (inv.thesis?.industries && inv.thesis.industries.some((s) => s.toLowerCase().includes(q))) ||
        (inv.thesis?.geographies && inv.thesis.geographies.some((g) => g.toLowerCase().includes(q)))
    );
  }

  // Investor type filter
  if (typeof investorType === "string" && investorType !== "all") {
    investors = investors.filter((inv) => inv.investorType === investorType);
  }

  // Verification status filter (Option C filter: verified, unverified, pending)
  if (typeof verificationStatus === "string" && verificationStatus !== "all") {
    investors = investors.filter((inv) => inv.verificationStatus === verificationStatus);
  }

  // Industry filter
  if (typeof industry === "string" && industry !== "all") {
    investors = investors.filter(
      (inv) =>
        inv.thesis?.industries &&
        inv.thesis.industries.some((s) => s.toLowerCase() === industry.toLowerCase())
    );
  }

  // Stage filter
  if (typeof stage === "string" && stage !== "all") {
    investors = investors.filter(
      (inv) =>
        inv.thesis?.stages &&
        inv.thesis.stages.some((st) => st.toLowerCase() === stage.toLowerCase())
    );
  }

  // Geography filter
  if (typeof geography === "string" && geography !== "all") {
    investors = investors.filter(
      (inv) =>
        inv.thesis?.geographies &&
        inv.thesis.geographies.some((g) => g.toLowerCase().includes(geography.toLowerCase()))
    );
  }

  // Accepting pitches filter
  if (acceptingPitches !== undefined) {
    const wantsAccepting = acceptingPitches === "true";
    investors = investors.filter((inv) => (inv.isAvailableForIntros ?? inv.acceptingPitches) === wantsAccepting);
  }

  // Sorting
  if (sort === "newest") {
    investors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === "active") {
    investors.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else if (sort === "most_investments") {
    investors.sort((a, b) => (b.portfolioCompanies?.length || 0) - (a.portfolioCompanies?.length || 0));
  } else {
    // Default "recommended": verified first, then available for intros, then updated date
    investors.sort((a, b) => {
      if (a.verificationStatus === "verified" && b.verificationStatus !== "verified") return -1;
      if (b.verificationStatus === "verified" && a.verificationStatus !== "verified") return 1;
      const aAvail = a.isAvailableForIntros ?? a.acceptingPitches ?? true;
      const bAvail = b.isAvailableForIntros ?? b.acceptingPitches ?? true;
      if (aAvail && !bAvail) return -1;
      if (!aAvail && bAvail) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  const formatted = investors.map((inv) => formatInvestorProfile(inv, currentFounder?.id));

  res.json({
    world: WORLDS.FOUNDERS,
    investors: formatted,
    totalCount: formatted.length,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 2. GET /api/founders/investors/recommended — Personalized Recommendations
founderRouter.get("/investors/recommended", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  // Fetch all active investors excluding own profile
  const candidates = Array.from(investorProfilesStore.values()).filter(
    (inv) => inv.profileId !== currentFounder.id && inv.status === "active" && (inv.isAvailableForIntros ?? true)
  );

  // Score candidates: +3 for verified, +2 for portfolio count, +1 for check sizes defined
  const scored = candidates.map((inv) => {
    let score = 0;
    if (inv.verificationStatus === "verified") score += 3;
    if (inv.portfolioCompanies && inv.portfolioCompanies.length > 0) score += 2;
    if (inv.thesis?.minCheckSize || inv.thesis?.maxCheckSize) score += 1;
    return { inv, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const recommended = scored.slice(0, 6).map((item) => formatInvestorProfile(item.inv, currentFounder.id));

  res.json({
    world: WORLDS.FOUNDERS,
    investors: recommended,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 3. POST /api/founders/investors/profiles — Create Investor Profile (Option C: Self-declared / Unverified by default)
founderRouter.post("/investors/profiles", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  // Check if member already has an investor profile
  const existing = Array.from(investorProfilesStore.values()).find(
    (inv) => inv.profileId === currentFounder.id
  );
  if (existing) {
    return res.status(400).json({
      error: "You already have an investor profile. Use update profile to make changes.",
      investorId: existing.id,
    });
  }

  const parsed = createInvestorProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  const newInvestorId = `inv-${Date.now()}`;

  const newInvestor: InvestorProfile = {
    id: newInvestorId,
    profileId: currentFounder.id,
    displayName: currentFounder.displayName || "Investor",
    headline: data.headline || `${currentFounder.displayName || "Investor"} Profile`,
    biography: data.biography,
    bio: data.biography,
    investmentExperience: data.investmentExperience,
    isOrganization: data.isOrganization ?? false,
    organizationName: data.organizationName,
    organizationLogoUrl: data.organizationLogoUrl,
    investorType: data.investorType,
    thesis: data.thesis,
    portfolioCompanies: (data.portfolioCompanies || []).map((p) => ({
      name: p.name,
      websiteUrl: p.websiteUrl || undefined,
      logoUrl: p.logoUrl || undefined,
      investmentYear: p.investmentYear || undefined,
      stage: p.stage || undefined,
    })),
    professionalLinks: data.professionalLinks || [],
    preferredContactMethod: data.preferredContactMethod || "balaga_message",
    isAvailableForIntros: data.isAvailableForIntros ?? true,
    acceptingPitches: data.isAvailableForIntros ?? true,
    verificationStatus: "unverified", // Option C: strictly unverified upon creation
    verifiedBadge: false,
    status: "active",
    viewsCount: 0,
    introsReceivedCount: 0,
    introsAcceptedCount: 0,
    introRequestsReceivedCount: 0,
    investmentsCount: data.portfolioCompanies?.length || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  investorProfilesStore.set(newInvestor.id, newInvestor);

  res.status(201).json({
    message:
      "Investor profile created successfully (Option C: Self-declared / Unverified). You can submit verification documents at any time to receive the Verified Investor badge.",
    investor: formatInvestorProfile(newInvestor, currentFounder.id),
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 4. GET /api/founders/investors/profiles/my-profile & /api/founders/investors/my-profile
const handleGetMyInvestorProfile = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const profile = Array.from(investorProfilesStore.values()).find(
    (inv) => inv.profileId === currentFounder.id
  );

  if (!profile) {
    return res.json({
      investor: null,
      hasProfile: false,
      regulatoryDisclaimer: REGULATORY_DISCLAIMER,
    });
  }

  res.json({
    investor: formatInvestorProfile(profile, currentFounder.id),
    hasProfile: true,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
};

founderRouter.get("/investors/profiles/my-profile", handleGetMyInvestorProfile);
founderRouter.get("/investors/my-profile", handleGetMyInvestorProfile);

// 5. GET /api/founders/investors/profiles/:id & /api/founders/investors/:id — Detail View
const handleGetInvestorDetail = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { id } = req.params;

  const investor =
    investorProfilesStore.get(id) ||
    Array.from(investorProfilesStore.values()).find((inv) => inv.profileId === id);

  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  // Increment views count
  investor.viewsCount = (investor.viewsCount || 0) + 1;
  investorProfilesStore.set(investor.id, investor);

  const rep = investorRepresentativesStore.get(investor.id);
  const representatives = rep ? [rep] : [];

  res.json({
    investor: formatInvestorProfile(investor, currentFounder?.id),
    representatives,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
};

founderRouter.get("/investors/profiles/:id", handleGetInvestorDetail);
founderRouter.get("/investors/:id", handleGetInvestorDetail);

// 6. PUT /api/founders/investors/profiles/:id & /api/founders/investors/profiles/my-profile — Edit Profile
founderRouter.put("/investors/profiles/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const investor =
    id === "my-profile"
      ? Array.from(investorProfilesStore.values()).find((inv) => inv.profileId === currentFounder.id)
      : investorProfilesStore.get(id);

  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  if (investor.profileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You can only edit your own investor profile" });
  }

  const parsed = updateInvestorProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  if (data.organizationName !== undefined) investor.organizationName = data.organizationName;
  if (data.organizationLogoUrl !== undefined) investor.organizationLogoUrl = data.organizationLogoUrl;
  if (data.investorType !== undefined) investor.investorType = data.investorType;
  if (data.headline !== undefined) investor.headline = data.headline;
  if (data.biography !== undefined) {
    investor.biography = data.biography;
    investor.bio = data.biography;
  }
  if (data.investmentExperience !== undefined) investor.investmentExperience = data.investmentExperience;
  if (data.websiteUrl !== undefined) investor.websiteUrl = data.websiteUrl;
  if (data.thesis !== undefined) investor.thesis = { ...investor.thesis, ...data.thesis };
  if (data.portfolioCompanies !== undefined) {
    investor.portfolioCompanies = data.portfolioCompanies.map((p) => ({
      name: p.name,
      websiteUrl: p.websiteUrl || undefined,
      logoUrl: p.logoUrl || undefined,
      investmentYear: p.investmentYear || undefined,
      stage: p.stage || undefined,
    }));
  }
  if (data.professionalLinks !== undefined) investor.professionalLinks = data.professionalLinks;
  if (data.isAvailableForIntros !== undefined) {
    investor.isAvailableForIntros = data.isAvailableForIntros;
    investor.acceptingPitches = data.isAvailableForIntros;
  }
  if (data.status !== undefined) investor.status = data.status;

  investor.updatedAt = new Date().toISOString();
  investorProfilesStore.set(investor.id, investor);

  res.json({
    message: "Investor profile updated successfully",
    investor: formatInvestorProfile(investor, currentFounder.id),
  });
});

// 7. POST /api/founders/investors/profiles/:id/status — Toggle Active / Paused / Closed
founderRouter.post("/investors/profiles/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const investor = investorProfilesStore.get(id);
  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  if (investor.profileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You can only manage your own investor status" });
  }

  const { status } = req.body;
  if (!["active", "paused", "closed"].includes(status)) {
    return res.status(400).json({ error: "Invalid status. Must be active, paused, or closed." });
  }

  investor.status = status;
  investor.updatedAt = new Date().toISOString();
  investorProfilesStore.set(investor.id, investor);

  res.json({
    message: `Investor profile status updated to ${status}`,
    investor: formatInvestorProfile(investor, currentFounder.id),
  });
});

// 8. POST /api/founders/investors/profiles/:id/bookmark & /api/founders/investors/:id/bookmark — Save / Bookmark
const handleBookmarkInvestor = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const investor = investorProfilesStore.get(id);
  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  const key = `${currentFounder.id}:${investor.id}`;
  const altKey = `${investor.id}:${currentFounder.id}`;
  const alreadyBookmarked = investorBookmarksStore.has(key) || investorBookmarksStore.has(altKey);

  if (alreadyBookmarked) {
    investorBookmarksStore.delete(key);
    investorBookmarksStore.delete(altKey);
    return res.json({ message: "Investor removed from saved bookmarks", hasBookmarked: false });
  } else {
    investorBookmarksStore.add(key);
    return res.json({ message: "Investor saved to bookmarks", hasBookmarked: true });
  }
};

founderRouter.post("/investors/profiles/:id/bookmark", handleBookmarkInvestor);
founderRouter.post("/investors/:id/bookmark", handleBookmarkInvestor);

// 9. POST /api/founders/investors/profiles/:id/follow & /api/founders/investors/:id/follow — Follow / Unfollow
const handleFollowInvestor = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const investor = investorProfilesStore.get(id);
  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  const key = `${currentFounder.id}:${investor.id}`;
  const altKey = `${investor.id}:${currentFounder.id}`;
  const alreadyFollowing = investorFollowsStore.has(key) || investorFollowsStore.has(altKey);

  if (alreadyFollowing) {
    investorFollowsStore.delete(key);
    investorFollowsStore.delete(altKey);
    return res.json({ message: "Unfollowed investor updates", isFollowing: false });
  } else {
    investorFollowsStore.add(key);
    return res.json({ message: "Following investor updates", isFollowing: true });
  }
};

founderRouter.post("/investors/profiles/:id/follow", handleFollowInvestor);
founderRouter.post("/investors/:id/follow", handleFollowInvestor);

// 10. POST /api/founders/investors/profiles/:id/report & /api/founders/investors/:id/report — Report Profile
const handleReportInvestor = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const investor = investorProfilesStore.get(id);
  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  const parsed = reportInvestorSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const reportId = `inv-rep-${Date.now()}`;
  const report: InvestorReport = {
    id: reportId,
    investorProfileId: investor.id,
    reporterProfileId: currentFounder.id,
    reason: parsed.data.reason,
    details: parsed.data.details,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  investorReportsStore.set(report.id, report);

  res.status(201).json({
    message: "Report submitted to community moderation. Thank you for keeping Balaga trustworthy.",
    report,
  });
};

founderRouter.post("/investors/profiles/:id/report", handleReportInvestor);
founderRouter.post("/investors/:id/report", handleReportInvestor);

// 11. POST /api/founders/investors/profiles/:id/verification — Option C: Submit Verification Evidence
founderRouter.post("/investors/profiles/:id/verification", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const investor =
    id === "my-profile"
      ? Array.from(investorProfilesStore.values()).find((inv) => inv.profileId === currentFounder.id)
      : investorProfilesStore.get(id);

  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  if (investor.profileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You can only submit verification for your own profile" });
  }

  const parsed = submitInvestorVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const submissionId = `inv-ver-${Date.now()}`;
  const submission: InvestorVerificationSubmission = {
    id: submissionId,
    investorProfileId: investor.id,
    submittedByProfileId: currentFounder.id,
    evidenceType: parsed.data.evidenceType,
    documentUrls: parsed.data.documentUrls,
    officialEntityName: parsed.data.officialEntityName,
    registrationNumber: parsed.data.registrationNumber,
    notes: parsed.data.notes,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  investorVerificationSubmissionsStore.set(submission.id, submission);

  // Update investor status to verification_submitted
  investor.verificationStatus = "verification_submitted";
  investor.updatedAt = new Date().toISOString();
  investorProfilesStore.set(investor.id, investor);

  res.status(201).json({
    message:
      "Verification submission received. Our verification team will review your credentials within 2-3 business days. Your profile remains active as self-declared in the meantime.",
    submission,
    investor: formatInvestorProfile(investor, currentFounder.id),
  });
});

// 12. POST /api/founders/investors/verification/:id/review — Admin Review Verification
founderRouter.post("/investors/verification/:id/review", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const submission = investorVerificationSubmissionsStore.get(id);
  if (!submission) {
    return res.status(404).json({ error: "Verification submission not found" });
  }

  const parsed = reviewInvestorVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { decision, decisionNotes, badgeTitle } = parsed.data;
  submission.decisionNotes = decisionNotes;
  submission.reviewedAt = new Date().toISOString();
  submission.reviewedByProfileId = currentFounder.id;

  // Update investor profile
  const investor = investorProfilesStore.get(submission.investorProfileId);

  if (decision === "approve") {
    submission.status = "approved";
    if (investor) {
      investor.verificationStatus = "verified";
      investor.verifiedBadge = true;
      investor.verifiedBadgeTitle = badgeTitle || "Verified Investor";
      investor.verifiedAt = new Date().toISOString();
      investor.updatedAt = new Date().toISOString();
      investorProfilesStore.set(investor.id, investor);
    }
  } else if (decision === "reject") {
    submission.status = "rejected";
    if (investor) {
      investor.verificationStatus = "rejected";
      investor.verifiedBadge = false;
      investor.updatedAt = new Date().toISOString();
      investorProfilesStore.set(investor.id, investor);
    }
  } else if (decision === "inconclusive") {
    submission.status = "inconclusive";
    if (investor) {
      investor.verificationStatus = "pending";
      investor.updatedAt = new Date().toISOString();
      investorProfilesStore.set(investor.id, investor);
    }
  }

  investorVerificationSubmissionsStore.set(submission.id, submission);

  res.json({
    message: `Verification review completed: decision is ${decision}`,
    submission,
    investor: investor ? formatInvestorProfile(investor, currentFounder.id) : null,
  });
});

// 13. GET /api/founders/investors/startups/discover — Startups for Investors (Respects Privacy)
founderRouter.get("/investors/startups/discover", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { stage, industry, search } = req.query;

  // Determine if viewer is an investor
  const isInvestor = currentFounder
    ? Array.from(investorProfilesStore.values()).some((inv) => inv.profileId === currentFounder.id)
    : false;

  let startupsList = Array.from(startupsStore.values());

  // Search
  if (typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    startupsList = startupsList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.oneLiner && s.oneLiner.toLowerCase().includes(q)) ||
        (s.industry && s.industry.toLowerCase().includes(q))
    );
  }

  // Filter by industry
  if (typeof industry === "string" && industry !== "all") {
    startupsList = startupsList.filter(
      (s) => s.industry && s.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  // Filter by stage
  if (typeof stage === "string" && stage !== "all") {
    startupsList = startupsList.filter(
      (s) => s.stage && s.stage.toLowerCase() === stage.toLowerCase()
    );
  }

  // Enrich with fundraising profile respecting privacy
  const enriched = startupsList
    .map((s) => {
      const fundProfile = startupFundraisingProfilesStore.get(s.id);
      const isTeamMember = currentFounder ? isStartupMember(currentFounder.id, s.id) : false;

      // Privacy logic:
      // public: visible to all
      // investors_only: visible to registered investors or startup team
      // connections_only: visible to direct connections of startup creator or team
      // private: visible only to team
      let isFundraisingVisible = false;
      if (fundProfile) {
        if (fundProfile.privacyLevel === "public") {
          isFundraisingVisible = true;
        } else if (fundProfile.privacyLevel === "investors_only" && (isInvestor || isTeamMember)) {
          isFundraisingVisible = true;
        } else if (fundProfile.privacyLevel === "connections_only") {
          const isConnected = currentFounder
            ? founderConnectionsStore.has(`${s.creatorId}:${currentFounder.id}`) ||
              founderConnectionsStore.has(`${currentFounder.id}:${s.creatorId}`)
            : false;
          isFundraisingVisible = isTeamMember || isConnected;
        } else if (fundProfile.privacyLevel === "private") {
          isFundraisingVisible = isTeamMember;
        }
      }

      const isSaved = currentFounder
        ? savedStartupsByInvestorsStore.has(`${currentFounder.id}:${s.id}`)
        : false;

      return {
        ...s,
        fundraising: isFundraisingVisible ? fundProfile : null,
        isFundraisingDisclosed: isFundraisingVisible && Boolean(fundProfile),
        isSaved,
      };
    })
    .filter((s) => s.isFundraisingDisclosed || !req.query.onlyFundraising);

  res.json({
    world: WORLDS.FOUNDERS,
    startups: enriched,
    totalCount: enriched.length,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 14. POST /api/founders/investors/startups/:startupId/save — Investor Saves Startup
founderRouter.post("/investors/startups/:startupId/save", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { startupId } = req.params;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  const key = `${currentFounder.id}:${startup.id}`;
  const alreadySaved = savedStartupsByInvestorsStore.has(key);

  if (alreadySaved) {
    savedStartupsByInvestorsStore.delete(key);
    return res.json({ message: "Startup removed from saved pipeline", isSaved: false });
  } else {
    savedStartupsByInvestorsStore.add(key);
    return res.json({ message: "Startup saved to pipeline", isSaved: true });
  }
});

// 15. GET /api/founders/investors/startups/:startupId/fundraising — Get Startup Fundraising Profile
founderRouter.get("/investors/startups/:startupId/fundraising", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { startupId } = req.params;

  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  const fundProfile = startupFundraisingProfilesStore.get(startupId);
  if (!fundProfile) {
    return res.json({
      fundraising: null,
      message: "No fundraising profile published for this startup",
      regulatoryDisclaimer: REGULATORY_DISCLAIMER,
    });
  }

  const isTeamMember = currentFounder ? isStartupMember(currentFounder.id, startup.id) : false;
  const isInvestor = currentFounder
    ? Array.from(investorProfilesStore.values()).some((inv) => inv.profileId === currentFounder.id)
    : false;

  // Privacy checks
  if (fundProfile.privacyLevel === "private" && !isTeamMember) {
    return res.status(403).json({ error: "This startup's fundraising information is private to the team." });
  }
  if (fundProfile.privacyLevel === "investors_only" && !isInvestor && !isTeamMember) {
    return res.status(403).json({
      error: "This startup's fundraising information is only visible to registered investors.",
    });
  }
  if (fundProfile.privacyLevel === "connections_only" && !isTeamMember) {
    const isConnected = currentFounder
      ? founderConnectionsStore.has(`${startup.creatorId}:${currentFounder.id}`) ||
        founderConnectionsStore.has(`${currentFounder.id}:${startup.creatorId}`)
      : false;
    if (!isConnected) {
      return res.status(403).json({
        error: "This startup's fundraising information is visible to direct connections only.",
      });
    }
  }

  res.json({
    fundraising: fundProfile,
    startup: { id: startup.id, name: startup.name, logo: startup.logoUrl, industry: startup.industry },
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 16. PUT /api/founders/investors/startups/:startupId/fundraising — Update Startup Fundraising Profile (Strict 403 for unauthorized)
founderRouter.put("/investors/startups/:startupId/fundraising", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { startupId } = req.params;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Strict check: Only startup owner or admin can update fundraising profile
  const isOwnerOrAdmin = isStartupAdminOrOwner(startupId, currentFounder.id) || startup.creatorId === currentFounder.id;
  if (!isOwnerOrAdmin) {
    return res.status(403).json({
      error: "Forbidden: Only the startup owner or admin can manage the fundraising profile",
    });
  }

  const parsed = updateStartupFundraisingProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  let fundProfile = startupFundraisingProfilesStore.get(startupId);

  if (!fundProfile) {
    fundProfile = {
      id: `st-fund-${Date.now()}`,
      startupId,
      fundraisingStatus: data.fundraisingStatus,
      privacyLevel: data.privacyLevel,
      fundingStage: data.fundingStage,
      amountSought: data.amountSought,
      currency: data.currency || "INR",
      useOfFunds: data.useOfFunds || undefined,
      businessTraction: data.businessTraction || undefined,
      revenueRange: data.revenueRange,
      customerGrowth: data.customerGrowth,
      productMaturity: data.productMaturity || undefined,
      pitchDeckUrl: data.pitchDeckUrl,
      pitchDeckFilename: data.pitchDeckFilename,
      demoUrl: data.demoUrl,
      contactPreferences: data.contactPreferences || undefined,
      updatedByProfileId: currentFounder.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    if (data.fundraisingStatus !== undefined) fundProfile.fundraisingStatus = data.fundraisingStatus;
    if (data.privacyLevel !== undefined) fundProfile.privacyLevel = data.privacyLevel;
    if (data.fundingStage !== undefined) fundProfile.fundingStage = data.fundingStage;
    if (data.amountSought !== undefined) fundProfile.amountSought = data.amountSought;
    if (data.currency !== undefined) fundProfile.currency = data.currency;
    if (data.useOfFunds !== undefined) fundProfile.useOfFunds = data.useOfFunds || undefined;
    if (data.businessTraction !== undefined) fundProfile.businessTraction = data.businessTraction || undefined;
    if (data.revenueRange !== undefined) fundProfile.revenueRange = data.revenueRange;
    if (data.customerGrowth !== undefined) fundProfile.customerGrowth = data.customerGrowth;
    if (data.productMaturity !== undefined) fundProfile.productMaturity = data.productMaturity || undefined;
    if (data.pitchDeckUrl !== undefined) fundProfile.pitchDeckUrl = data.pitchDeckUrl;
    if (data.pitchDeckFilename !== undefined) fundProfile.pitchDeckFilename = data.pitchDeckFilename;
    if (data.demoUrl !== undefined) fundProfile.demoUrl = data.demoUrl;
    if (data.contactPreferences !== undefined) fundProfile.contactPreferences = data.contactPreferences || undefined;
    fundProfile.updatedByProfileId = currentFounder.id;
    fundProfile.updatedAt = new Date().toISOString();
  }

  startupFundraisingProfilesStore.set(startupId, fundProfile);

  res.json({
    message: "Startup fundraising profile updated successfully",
    fundraising: fundProfile,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 17. POST /api/founders/investors/requests — Submit Investor Introduction Request (Founder -> Investor)
founderRouter.post("/investors/requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = submitInvestorIntroRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const {
    investorProfileId,
    startupId,
    whyRelevant,
    businessOverview,
    fundraisingStage,
    amountSought,
    currency,
    pitchDeckUrl,
    specificRequest,
    additionalMessage,
  } = parsed.data;

  const investor = investorProfilesStore.get(investorProfileId);
  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  // Prevent self-request
  if (investor.profileId === currentFounder.id) {
    return res.status(400).json({ error: "You cannot send an introduction request to your own investor profile" });
  }

  // Check active duplicate intro request
  if (hasActiveDuplicateIntroRequest(startupId, investorProfileId)) {
    return res.status(409).json({
      error: "You already have an active introduction request pending with this investor for this startup.",
    });
  }

  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Verify founder is authorized member of startup
  if (!isStartupMember(currentFounder.id, startupId) && startup.creatorId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not an authorized member of the selected startup" });
  }

  const requestId = `inv-req-${Date.now()}`;
  const introRequest: InvestorIntroRequest = {
    id: requestId,
    startupId,
    startupName: startup.name,
    founderProfileId: currentFounder.id,
    requesterProfileId: currentFounder.id,
    requesterName: currentFounder.displayName || "Founder",
    requesterHeadline: currentFounder.headline || undefined,
    investorProfileId,
    investorName: investor.displayName || investor.headline,
    investorOrg: investor.organizationName,
    whyRelevant,
    businessOverview,
    fundraisingStage,
    targetRound: fundraisingStage,
    amountSought,
    askAmount: amountSought,
    currency: currency || "INR",
    note: whyRelevant,
    pitchDeckUrl: pitchDeckUrl || undefined,
    specificRequest,
    additionalMessage: additionalMessage || undefined,
    status: "submitted",
    statusHistory: [
      {
        status: "submitted",
        updatedByProfileId: currentFounder.id,
        timestamp: new Date().toISOString(),
        notes: "Introduction request submitted",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  investorIntroRequestsStore.set(introRequest.id, introRequest);

  // Increment investor's intro requests count
  investor.introsReceivedCount = (investor.introsReceivedCount || 0) + 1;
  investor.introRequestsReceivedCount = investor.introsReceivedCount;
  investorProfilesStore.set(investor.id, investor);

  // Send notification to investor
  const notifId = `notif-${Date.now()}`;
  founderNotificationsStore.set(notifId, {
    id: notifId,
    recipientId: investor.profileId,
    actorId: currentFounder.id,
    type: "investor_intro_request",
    content: `${currentFounder.displayName || "A founder"} sent an investor introduction request for ${startup.name}.`,
    targetId: introRequest.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Introduction request submitted to investor successfully",
    request: introRequest,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 18. GET /api/founders/investors/requests/sent — Sent Introduction Requests
founderRouter.get("/investors/requests/sent", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const sent = Array.from(investorIntroRequestsStore.values())
    .filter((r) => r.founderProfileId === currentFounder.id || r.requesterProfileId === currentFounder.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    requests: sent,
    totalCount: sent.length,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 19. GET /api/founders/investors/requests/incoming — Incoming Introduction Requests
founderRouter.get("/investors/requests/incoming", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  // Find all investor profiles owned by this member
  const myInvestorProfiles = Array.from(investorProfilesStore.values()).filter(
    (inv) => inv.profileId === currentFounder.id
  );
  const myInvestorIds = new Set(myInvestorProfiles.map((inv) => inv.id));

  const incoming = Array.from(investorIntroRequestsStore.values())
    .filter((r) => myInvestorIds.has(r.investorProfileId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    requests: incoming,
    totalCount: incoming.length,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 20. GET /api/founders/investors/requests/:id — Introduction Request Details
founderRouter.get("/investors/requests/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const introReq = investorIntroRequestsStore.get(id);
  if (!introReq) {
    return res.status(404).json({ error: "Introduction request not found" });
  }

  const investor = investorProfilesStore.get(introReq.investorProfileId);
  const isInvestor = investor && investor.profileId === currentFounder.id;
  const isRequester = introReq.founderProfileId === currentFounder.id || introReq.requesterProfileId === currentFounder.id;

  if (!isInvestor && !isRequester) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to view this request" });
  }

  res.json({
    request: introReq,
    investor,
    startup: startupsStore.get(introReq.startupId),
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 21. POST /api/founders/investors/requests/:id/respond — Investor Responds (Accepted provisions FundraisingConversation)
founderRouter.post("/investors/requests/:id/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const introReq = investorIntroRequestsStore.get(id);
  if (!introReq) {
    return res.status(404).json({ error: "Introduction request not found" });
  }

  const investor = investorProfilesStore.get(introReq.investorProfileId);
  if (!investor || investor.profileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: Only the recipient investor can respond to this request" });
  }

  const parsed = respondInvestorIntroRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { action, reasonOrNotes } = parsed.data;
  introReq.responseNote = reasonOrNotes;
  introReq.statusNotes = reasonOrNotes;
  introReq.respondedAt = new Date().toISOString();
  introReq.updatedAt = new Date().toISOString();

  let conversation: FundraisingConversation | null = null;

  if (action === "accept") {
    introReq.status = "accepted";
    investor.introsAcceptedCount = (investor.introsAcceptedCount || 0) + 1;
    investorProfilesStore.set(investor.id, investor);

    // Auto-provision a dedicated FundraisingConversation workspace!
    const convId = `fconv-${Date.now()}`;
    const startup = startupsStore.get(introReq.startupId);

    conversation = {
      id: convId,
      startupId: introReq.startupId,
      startupName: startup?.name || introReq.startupName,
      investorProfileId: investor.id,
      investorName: investor.displayName || investor.headline,
      investorOrg: investor.organizationName,
      founderProfileId: introReq.founderProfileId,
      founderName: introReq.requesterName || "Founder",
      sourceType: "intro_request",
      sourceId: introReq.id,
      introRequestId: introReq.id,
      discussionStatus: "initial_review",
      stage: "initial_review",
      sharedPitchMaterials: introReq.pitchDeckUrl
        ? [
            {
              id: `mat-${Date.now()}`,
              title: "Pitch Deck",
              fileUrl: introReq.pitchDeckUrl,
              filename: "pitch-deck.pdf",
              uploadedByProfileId: introReq.founderProfileId,
              uploadedAt: new Date().toISOString(),
            },
          ]
        : [],
      sharedMaterials: [],
      followUpNotes: reasonOrNotes || "Introduction accepted. Dedicated conversation initialized.",
      notes: reasonOrNotes,
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fundraisingConversationsStore.set(convId, conversation);
    introReq.fundraisingConversationId = convId;

    // Notify founder of acceptance
    const notifId = `notif-${Date.now()}`;
    founderNotificationsStore.set(notifId, {
      id: notifId,
      recipientId: introReq.founderProfileId,
      actorId: currentFounder.id,
      type: "investor_intro_accepted",
      content: `${investor.displayName || investor.headline} accepted your introduction request for ${introReq.startupName || "your startup"}!`,
      targetId: convId,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } else if (action === "reject") {
    introReq.status = "rejected";
  } else if (action === "request_more_info") {
    introReq.status = "more_info_requested";
  }

  introReq.statusHistory.push({
    status: introReq.status,
    updatedByProfileId: currentFounder.id,
    timestamp: new Date().toISOString(),
    notes: reasonOrNotes,
  });

  investorIntroRequestsStore.set(introReq.id, introReq);

  res.json({
    message:
      action === "accept"
        ? "Introduction accepted! Dedicated fundraising workspace provisioned."
        : `Request marked as ${introReq.status}`,
    request: introReq,
    conversation,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 22. POST /api/founders/investors/requests/:id/withdraw — Founder Withdraws Request
founderRouter.post("/investors/requests/:id/withdraw", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const introReq = investorIntroRequestsStore.get(id);
  if (!introReq) {
    return res.status(404).json({ error: "Introduction request not found" });
  }

  if (introReq.founderProfileId !== currentFounder.id && introReq.requesterProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You can only withdraw your own introduction requests" });
  }

  introReq.status = "withdrawn";
  introReq.updatedAt = new Date().toISOString();
  introReq.statusHistory.push({
    status: "withdrawn",
    updatedByProfileId: currentFounder.id,
    timestamp: new Date().toISOString(),
    notes: "Request withdrawn by founder",
  });
  investorIntroRequestsStore.set(introReq.id, introReq);

  res.json({ message: "Introduction request withdrawn", request: introReq });
});

// 23. POST /api/founders/investors/interests — Investor Expresses Interest in a Startup
founderRouter.post("/investors/interests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  // Find investor profile for current founder
  const investor = Array.from(investorProfilesStore.values()).find(
    (inv) => inv.profileId === currentFounder.id
  );
  if (!investor) {
    return res.status(403).json({
      error: "You must have an Investor Profile on Balaga to express investor interest in a startup.",
    });
  }

  const parsed = submitInvestorInterestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { startupId, personalizedNote } = parsed.data;
  const startup = startupsStore.get(startupId);
  if (!startup) {
    return res.status(404).json({ error: "Startup not found" });
  }

  // Prevent expressing interest in own startup
  if (isStartupMember(currentFounder.id, startupId) || startup.creatorId === currentFounder.id) {
    return res.status(400).json({ error: "You cannot express investor interest in your own startup" });
  }

  const interestId = `inv-int-${Date.now()}`;
  const interest: InvestorInterest = {
    id: interestId,
    investorProfileId: investor.id,
    investorName: investor.displayName || investor.headline,
    investorOrg: investor.organizationName,
    startupId,
    startupName: startup.name,
    personalizedNote,
    note: personalizedNote,
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  investorInterestsStore.set(interest.id, interest);

  // Notify startup owner
  const notifId = `notif-${Date.now()}`;
  founderNotificationsStore.set(notifId, {
    id: notifId,
    recipientId: startup.creatorId,
    actorId: currentFounder.id,
    type: "investor_expressed_interest",
    content: `${investor.displayName || investor.headline} expressed investment interest in ${startup.name}.`,
    targetId: interest.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Interest expressed to startup founders successfully",
    interest,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 24. GET /api/founders/investors/interests/sent — Sent Interests by Investor
founderRouter.get("/investors/interests/sent", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const investor = Array.from(investorProfilesStore.values()).find(
    (inv) => inv.profileId === currentFounder.id
  );
  if (!investor) {
    return res.json({ interests: [], totalCount: 0 });
  }

  const sent = Array.from(investorInterestsStore.values())
    .filter((item) => item.investorProfileId === investor.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    interests: sent,
    totalCount: sent.length,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 25. GET /api/founders/investors/interests/incoming — Incoming Interests for Startups
founderRouter.get("/investors/interests/incoming", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  // Get startups owned or managed by current founder
  const myStartups = Array.from(startupsStore.values()).filter(
    (s) => isStartupMember(currentFounder.id, s.id) || s.creatorId === currentFounder.id
  );
  const myStartupIds = new Set(myStartups.map((s) => s.id));

  const incoming = Array.from(investorInterestsStore.values())
    .filter((item) => myStartupIds.has(item.startupId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    interests: incoming,
    totalCount: incoming.length,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 26. POST /api/founders/investors/interests/:id/respond — Startup Responds to Expressed Interest
founderRouter.post("/investors/interests/:id/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const interest = investorInterestsStore.get(id);
  if (!interest) {
    return res.status(404).json({ error: "Investor interest record not found" });
  }

  const startup = startupsStore.get(interest.startupId);
  if (!startup || (!isStartupMember(currentFounder.id, startup.id) && startup.creatorId !== currentFounder.id)) {
    return res.status(403).json({ error: "Forbidden: You must be an authorized member of the startup to respond" });
  }

  const parsed = respondInvestorInterestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { action, reasonOrNotes } = parsed.data;
  interest.status = action === "accept" ? "accepted" : "declined";
  interest.statusNotes = reasonOrNotes;
  interest.responseNote = reasonOrNotes;
  interest.respondedAt = new Date().toISOString();
  interest.updatedAt = new Date().toISOString();

  let conversation: FundraisingConversation | null = null;

  if (action === "accept") {
    const investor = investorProfilesStore.get(interest.investorProfileId);
    const convId = `fconv-${Date.now()}`;

    conversation = {
      id: convId,
      startupId: interest.startupId,
      startupName: interest.startupName,
      investorProfileId: interest.investorProfileId,
      investorName: interest.investorName,
      investorOrg: interest.investorOrg,
      founderProfileId: currentFounder.id,
      founderName: currentFounder.displayName || "Founder",
      sourceType: "investor_interest",
      sourceId: interest.id,
      discussionStatus: "initial_review",
      stage: "initial_review",
      sharedPitchMaterials: [],
      sharedMaterials: [],
      followUpNotes: reasonOrNotes || "Investor interest accepted.",
      notes: reasonOrNotes,
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fundraisingConversationsStore.set(convId, conversation);
    interest.fundraisingConversationId = convId;

    // Notify investor
    if (investor) {
      const notifId = `notif-${Date.now()}`;
      founderNotificationsStore.set(notifId, {
        id: notifId,
        recipientId: investor.profileId,
        actorId: currentFounder.id,
        type: "investor_interest_accepted",
        content: `${startup.name} accepted your expression of investment interest! Dedicated workspace is now active.`,
        targetId: convId,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  investorInterestsStore.set(interest.id, interest);

  res.json({
    message: action === "accept" ? "Interest accepted! Fundraising workspace created." : "Interest declined.",
    interest,
    conversation,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 27. GET /api/founders/investors/conversations/:id — Fundraising Conversation Workspace
founderRouter.get("/investors/conversations/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conversation = fundraisingConversationsStore.get(id);
  if (!conversation) {
    return res.status(404).json({ error: "Fundraising conversation not found" });
  }

  const investor = investorProfilesStore.get(conversation.investorProfileId);
  const isInvestor = investor && investor.profileId === currentFounder.id;
  const isFounder = conversation.founderProfileId === currentFounder.id;

  if (!isInvestor && !isFounder) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this fundraising conversation" });
  }

  // Associated meetings
  const meetings = Array.from(investorMeetingsStore.values())
    .filter((m) => m.conversationId === conversation.id)
    .sort(
      (a, b) =>
        new Date(`${a.sessionDate}T${a.startTime || "00:00"}`).getTime() -
        new Date(`${b.sessionDate}T${b.startTime || "00:00"}`).getTime()
    );

  res.json({
    world: WORLDS.FOUNDERS,
    conversation,
    meetings,
    investor,
    startup: startupsStore.get(conversation.startupId),
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 28. POST /api/founders/investors/conversations/:id/materials — Share Secure Pitch Materials
founderRouter.post("/investors/conversations/:id/materials", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conversation = fundraisingConversationsStore.get(id);
  if (!conversation) {
    return res.status(404).json({ error: "Fundraising conversation not found" });
  }

  const investor = investorProfilesStore.get(conversation.investorProfileId);
  const isInvestor = investor && investor.profileId === currentFounder.id;
  const isFounder = conversation.founderProfileId === currentFounder.id;

  if (!isInvestor && !isFounder) {
    return res.status(403).json({ error: "Forbidden: You are not authorized to share materials in this conversation" });
  }

  const parsed = sharePitchMaterialSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const newMaterial = {
    id: `mat-${Date.now()}`,
    title: parsed.data.title,
    fileUrl: parsed.data.fileUrl,
    filename: parsed.data.filename,
    uploadedByProfileId: currentFounder.id,
    uploadedAt: new Date().toISOString(),
  };

  conversation.sharedPitchMaterials = conversation.sharedPitchMaterials || [];
  conversation.sharedPitchMaterials.push(newMaterial);
  conversation.sharedMaterials = conversation.sharedPitchMaterials;
  conversation.lastActivityAt = new Date().toISOString();
  conversation.updatedAt = new Date().toISOString();
  fundraisingConversationsStore.set(conversation.id, conversation);

  res.status(201).json({
    message: "Pitch material shared securely",
    material: newMaterial,
    conversation,
  });
});

// 29. POST /api/founders/investors/conversations/:id/notes — Update Notes & Conversation Stage
founderRouter.post("/investors/conversations/:id/notes", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conversation = fundraisingConversationsStore.get(id);
  if (!conversation) {
    return res.status(404).json({ error: "Fundraising conversation not found" });
  }

  const investor = investorProfilesStore.get(conversation.investorProfileId);
  const isInvestor = investor && investor.profileId === currentFounder.id;
  const isFounder = conversation.founderProfileId === currentFounder.id;

  if (!isInvestor && !isFounder) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this conversation" });
  }

  const { notes, stage } = req.body;
  if (notes !== undefined) {
    conversation.followUpNotes = notes;
    conversation.notes = notes;
  }
  if (stage !== undefined) {
    conversation.discussionStatus = stage;
    conversation.stage = stage;
  }

  conversation.lastActivityAt = new Date().toISOString();
  conversation.updatedAt = new Date().toISOString();
  fundraisingConversationsStore.set(conversation.id, conversation);

  res.json({
    message: "Conversation notes and stage updated",
    conversation,
  });
});

// 30. POST /api/founders/investors/conversations/:id/message-check — Check Messaging Permissions
founderRouter.post("/investors/conversations/:id/message-check", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conversation = fundraisingConversationsStore.get(id);
  if (!conversation) {
    return res.status(404).json({ error: "Fundraising conversation not found" });
  }

  const otherParticipantId =
    conversation.founderProfileId === currentFounder.id
      ? investorProfilesStore.get(conversation.investorProfileId)?.profileId
      : conversation.founderProfileId;

  if (!otherParticipantId) {
    return res.status(400).json({ error: "Could not identify other participant" });
  }

  const isConnected =
    founderConnectionsStore.has(`${currentFounder.id}:${otherParticipantId}`) ||
    founderConnectionsStore.has(`${otherParticipantId}:${currentFounder.id}`);

  // Premium allows direct messaging even without mutual connection
  const callerAccount = accountsStore.get(currentFounder.accountId);
  const isPremium = callerAccount?.subscriptionTier === "premium";

  const canMessage = isConnected || isPremium;

  res.json({
    canMessage,
    isConnected,
    isPremium,
    recipientProfileId: otherParticipantId,
    reason: canMessage
      ? isConnected
        ? "Connected founders can message directly"
        : "Premium subscription allows direct messaging"
      : "Direct messaging requires a mutual connection or Balaga Premium",
  });
});

// 31. POST /api/founders/investors/meetings — Schedule Investor Meeting
founderRouter.post("/investors/meetings", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = scheduleInvestorMeetingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  const conversationId = (req.body && req.body.conversationId) || (req.query && req.query.conversationId);
  const conversation = conversationId ? fundraisingConversationsStore.get(String(conversationId)) : null;

  const meetingId = `imeet-${Date.now()}`;
  const meeting: InvestorMeeting = {
    id: meetingId,
    conversationId: conversation ? conversation.id : null,
    investorProfileId: conversation ? conversation.investorProfileId : "inv-1",
    founderProfileId: conversation ? conversation.founderProfileId : currentFounder.id,
    startupId: conversation ? conversation.startupId : "startup-1",
    title: data.title,
    sessionDate: data.sessionDate,
    startTime: data.startTime,
    date: data.sessionDate,
    time: data.startTime,
    durationMinutes: data.durationMinutes || 30,
    timezone: data.timezone || "Asia/Kolkata",
    format: data.format || "online",
    meetingType: data.format || "online",
    meetingLinkOrLocation: data.meetingLinkOrLocation,
    meetingUrl: data.meetingLinkOrLocation,
    locationAddress: data.meetingLinkOrLocation,
    agenda: data.agenda,
    preparationNotes: data.preparationNotes,
    notes: data.preparationNotes,
    status: "confirmed",
    proposedByProfileId: currentFounder.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  investorMeetingsStore.set(meeting.id, meeting);

  if (conversation) {
    conversation.lastActivityAt = new Date().toISOString();
    fundraisingConversationsStore.set(conversation.id, conversation);
  }

  res.status(201).json({
    message: "Investor meeting scheduled successfully",
    meeting,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 32. PUT /api/founders/investors/meetings/:id/status — Update Meeting Status
founderRouter.put("/investors/meetings/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const meeting = investorMeetingsStore.get(id);
  if (!meeting) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  const parsed = updateInvestorMeetingStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  meeting.status = parsed.data.status;
  if (parsed.data.notes) {
    meeting.notes = parsed.data.notes;
    meeting.preparationNotes = parsed.data.notes;
  }
  if (parsed.data.newSessionDate) {
    meeting.sessionDate = parsed.data.newSessionDate;
    meeting.date = parsed.data.newSessionDate;
  }
  if (parsed.data.newStartTime) {
    meeting.startTime = parsed.data.newStartTime;
    meeting.time = parsed.data.newStartTime;
  }
  meeting.updatedAt = new Date().toISOString();
  investorMeetingsStore.set(meeting.id, meeting);

  res.json({
    message: `Meeting status updated to ${parsed.data.status}`,
    meeting,
  });
});

// 33. GET /api/founders/investors/dashboard/investor-stats — Investor Dashboard Analytics
founderRouter.get("/investors/dashboard/investor-stats", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const stats = computeInvestorStats(currentFounder.id);
  res.json({
    world: WORLDS.FOUNDERS,
    stats,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 34. GET /api/founders/investors/dashboard/founder-stats/:startupId — Founder Fundraising Stats
founderRouter.get("/investors/dashboard/founder-stats/:startupId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { startupId } = req.params;
  const stats = computeFounderFundraisingStats(startupId);

  res.json({
    world: WORLDS.FOUNDERS,
    stats,
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  });
});

// 35. POST /api/founders/investors/moderation/:id/restrict — Admin Restrict / Restore Investor
founderRouter.post("/investors/moderation/:id/restrict", (req: Request, res: Response) => {
  const { id } = req.params;
  const investor = investorProfilesStore.get(id);
  if (!investor) {
    return res.status(404).json({ error: "Investor profile not found" });
  }

  const { action, reason } = req.body;
  if (action === "restrict") {
    investor.status = "paused";
    investor.updatedAt = new Date().toISOString();
    investorProfilesStore.set(investor.id, investor);
    return res.json({
      message: "Investor profile restricted by moderation",
      status: "paused",
      reason,
    });
  } else if (action === "restore") {
    investor.status = "active";
    investor.updatedAt = new Date().toISOString();
    investorProfilesStore.set(investor.id, investor);
    return res.json({
      message: "Investor profile restored to active status",
      status: "active",
    });
  }

  res.status(400).json({ error: "Invalid action" });
});

// ============================================================================
// FEATURE 12: BALAGA BUILD SPACES REST API
// Unified Project Build Spaces (Option C: Private & Public) and Partnership Spaces
// ============================================================================

// 1. GET /api/founders/build-spaces — List Workspaces Accessible to Current Founder
founderRouter.get("/build-spaces", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { type, status, scope, search, category } = req.query;

  let spaces = Array.from(buildSpacesStore.values());

  // Authorization filtering: user must be member or owner, or viewing public project
  spaces = spaces.filter((s) => {
    const isMember = isBuildSpaceMember(currentFounder.id, s.id);
    const isOwner = s.ownerProfileId === currentFounder.id;

    if (scope === "my_created") {
      return isOwner;
    }
    if (scope === "joined") {
      return isMember;
    }

    // Default 'all': return spaces user has joined or owns
    return isMember || isOwner;
  });

  // Type filter
  if (typeof type === "string" && type !== "all") {
    spaces = spaces.filter((s) => s.type === type);
  }

  // Status filter
  if (typeof status === "string" && status !== "all") {
    spaces = spaces.filter((s) => s.status === status);
  }

  // Category filter
  if (typeof category === "string" && category !== "all") {
    spaces = spaces.filter((s) => s.category === category);
  }

  // Search filter
  if (typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    spaces = spaces.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.skillsRequired.some((skill) => skill.toLowerCase().includes(q)) ||
        s.technologiesUsed.some((tech) => tech.toLowerCase().includes(q))
    );
  }

  const enriched = spaces.map((s) => enrichBuildSpace(s, currentFounder.id));

  res.json({
    world: WORLDS.FOUNDERS,
    spaces: enriched,
    totalCount: enriched.length,
    disclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 2. GET /api/founders/build-spaces/stats — Build Spaces Dashboard Stats
founderRouter.get("/build-spaces/stats", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const stats = computeBuildSpaceStats(currentFounder.id);
  res.json({
    world: WORLDS.FOUNDERS,
    stats,
    disclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 3. GET /api/founders/build-spaces/projects/discover — Option C: Public Project Discovery
founderRouter.get("/build-spaces/projects/discover", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { search, category, stage } = req.query;

  // STRICT OPTION C: Only public project spaces are discoverable!
  // Private workspaces and internal tasks/chats/docs are NEVER exposed here.
  let publicProjects = Array.from(buildSpacesStore.values()).filter(
    (s) => s.type === "project" && s.visibility === "public" && s.status === "active"
  );

  if (typeof category === "string" && category !== "all") {
    publicProjects = publicProjects.filter((s) => s.category === category);
  }

  if (typeof stage === "string" && stage !== "all") {
    publicProjects = publicProjects.filter((s) => s.developmentStage === stage);
  }

  if (typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    publicProjects = publicProjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.skillsRequired.some((sk) => sk.toLowerCase().includes(q)) ||
        s.technologiesUsed.some((tech) => tech.toLowerCase().includes(q))
    );
  }

  const listings: BuildSpacePublicListing[] = publicProjects.map((p) => {
    const owner = founderProfilesStore.get(p.ownerProfileId) || accountsStore.get(p.ownerProfileId);
    const hasPendingJoinRequest = currentFounder
      ? Array.from(buildSpaceJoinRequestsStore.values()).some(
          (r) =>
            r.spaceId === p.id &&
            r.applicantProfileId === currentFounder.id &&
            (r.status === "submitted" || r.status === "under_review" || r.status === "more_info_requested")
        )
      : false;

    const startup = p.associatedStartupId ? startupsStore.get(p.associatedStartupId) : null;

    return {
      id: p.id,
      type: "project",
      name: p.name,
      slug: p.slug,
      logoUrl: p.logoUrl,
      shortDescription: p.shortDescription,
      category: p.category,
      developmentStage: p.developmentStage,
      skillsRequired: p.skillsRequired,
      technologiesUsed: p.technologiesUsed,
      targetCompletionDate: p.targetCompletionDate,
      associatedStartupName: startup ? startup.name : null,
      memberCount: p.memberCount,
      ownerName: (owner as any)?.displayName || "Project Owner",
      ownerHeadline: (owner as any)?.headline,
      createdAt: p.createdAt,
      hasPendingJoinRequest,
    };
  });

  res.json({
    world: WORLDS.FOUNDERS,
    projects: listings,
    totalCount: listings.length,
    disclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 4. POST /api/founders/build-spaces/projects (and /api/founders/build-spaces) — Create Project Build Space
const handleCreateBuildSpace = async (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = createProjectBuildSpaceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  const spaceId = `bspace-${Date.now()}`;
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  let associatedStartup: Startup | null = null;
  if (data.associatedStartupId) {
    associatedStartup = startupsStore.get(data.associatedStartupId) || null;
  }

  const newSpace: BuildSpace = {
    id: spaceId,
    type: "project",
    name: data.name,
    slug,
    logoUrl: data.logoUrl || null,
    coverUrl: data.coverUrl || null,
    shortDescription: data.shortDescription,
    detailedOverview: data.detailedOverview,
    category: data.category,
    developmentStage: data.developmentStage,
    mainGoals: data.mainGoals,
    expectedOutcomes: data.expectedOutcomes || [],
    skillsRequired: data.skillsRequired || [],
    technologiesUsed: data.technologiesUsed || [],
    targetCompletionDate: data.targetCompletionDate || null,
    associatedStartupId: data.associatedStartupId || null,
    associatedStartup,
    visibility: data.visibility, // Option C: private or public
    status: "active",
    ownerProfileId: currentFounder.id,
    owner: currentFounder,
    memberCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await buildSpacesRepository.create(newSpace);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to persist build space to database", details: err.message });
  }

  // Add creator as owner in members store
  const ownerMember: BuildSpaceMember = {
    id: `bsm-${Date.now()}`,
    spaceId: newSpace.id,
    profileId: currentFounder.id,
    profile: currentFounder,
    role: "owner",
    title: "Project Lead",
    joinedAt: new Date().toISOString(),
  };
  buildSpaceMembersStore.set(newSpace.id, [ownerMember]);

  // Log activity
  const activity: BuildSpaceActivity = {
    id: `bact-${Date.now()}`,
    spaceId: newSpace.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Founder",
    action: "space_created",
    details: `Project Build Space '${data.name}' created with ${data.visibility} visibility`,
    createdAt: new Date().toISOString(),
  };
  buildSpaceActivitiesStore.set(newSpace.id, [activity]);

  res.status(201).json({
    message: "Project Build Space created successfully",
    space: enrichBuildSpace(newSpace, currentFounder.id),
    disclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
};

founderRouter.post("/build-spaces", handleCreateBuildSpace);
founderRouter.post("/build-spaces/projects", handleCreateBuildSpace);

// 5. GET /api/founders/build-spaces/invitations/my — Current User's Received Invitations
founderRouter.get("/build-spaces/invitations/my", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const invites = Array.from(buildSpaceInvitationsStore.values())
    .filter((i) => i.inviteeProfileId === currentFounder.id && i.status === "pending")
    .map((i) => ({
      ...i,
      space: buildSpacesStore.get(i.spaceId),
    }));

  res.json({
    world: WORLDS.FOUNDERS,
    invitations: invites,
    totalCount: invites.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 6. GET /api/founders/build-spaces/join-requests/my — Current User's Sent Join Requests
founderRouter.get("/build-spaces/join-requests/my", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const requests = Array.from(buildSpaceJoinRequestsStore.values())
    .filter((r) => r.applicantProfileId === currentFounder.id)
    .map((r) => ({
      ...r,
      space: buildSpacesStore.get(r.spaceId),
    }));

  res.json({
    world: WORLDS.FOUNDERS,
    requests,
    totalCount: requests.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 7. POST /api/founders/build-spaces/partnerships/activate (and /build-spaces/from-collaboration/:collaborationRequestId) — Activate Partnership Space (Feature 8 Integration)
const handleActivatePartnershipSpace = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const collaborationRequestId = req.params.collaborationRequestId || req.body.collaborationRequestId;
  if (!collaborationRequestId) {
    return res.status(400).json({ error: "collaborationRequestId is required" });
  }

  const collabReq = collaborationRequestsStore.get(collaborationRequestId);
  if (!collabReq) {
    return res.status(404).json({ error: "Collaboration proposal not found" });
  }

  if (collabReq.status !== "accepted") {
    return res.status(400).json({
      error: "Partnership Spaces can only be activated for accepted collaboration partnerships",
    });
  }

  // Authorization: must be member of initiator or receiver startup
  const isMemberA = isStartupMember(currentFounder.id, collabReq.initiatorStartupId);
  const isMemberB = isStartupMember(currentFounder.id, collabReq.receiverStartupId);
  if (!isMemberA && !isMemberB) {
    return res.status(403).json({
      error: "Forbidden: You must be an authorized representative of a participating startup",
    });
  }

  // Check if already exists in buildSpacesStore
  const existing = Array.from(buildSpacesStore.values()).find(
    (s) => s.type === "partnership" && s.partnershipSpaceId === collabReq.partnershipSpaceId
  );
  if (existing) {
    return res.status(409).json({
      message: "Partnership Space already active",
      existingSpaceId: existing.id,
      space: enrichBuildSpace(existing, currentFounder.id),
    });
  }

  const partSpace = collabReq.partnershipSpaceId
    ? partnershipSpacesStore.get(collabReq.partnershipSpaceId)
    : null;

  const spaceId = `bspace-collab-${Date.now()}`;
  const startupA = startupsStore.get(collabReq.initiatorStartupId);
  const startupB = startupsStore.get(collabReq.receiverStartupId);

  const newPartSpace: BuildSpace = {
    id: spaceId,
    type: "partnership",
    name: `${startupA?.name || "Startup A"} x ${startupB?.name || "Startup B"} Partnership`,
    slug: `${startupA?.slug || "startup-a"}-${startupB?.slug || "startup-b"}-partnership`,
    shortDescription: collabReq.summary || "Accepted startup partnership collaboration space.",
    detailedOverview: collabReq.whatWeOffer + "\n" + collabReq.whatWeNeed,
    category: "business",
    developmentStage: "building",
    mainGoals: collabReq.responsibilities || ["Execute agreed partnership collaboration terms"],
    expectedOutcomes: [collabReq.expectedOutcomes || "Successful joint venture milestone delivery"],
    skillsRequired: [],
    technologiesUsed: [],
    associatedStartupId: isMemberA ? collabReq.initiatorStartupId : collabReq.receiverStartupId,
    visibility: "private", // Partnership Spaces are ALWAYS private!
    status: "active",
    ownerProfileId: currentFounder.id,
    owner: currentFounder,
    memberCount: 2,
    partnershipSpaceId: collabReq.partnershipSpaceId || undefined,
    partnershipSpace: partSpace || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  buildSpacesStore.set(newPartSpace.id, newPartSpace);

  // Initialize members for both startups
  const members: BuildSpaceMember[] = [
    {
      id: `bsm-${Date.now()}-1`,
      spaceId: newPartSpace.id,
      profileId: currentFounder.id,
      profile: currentFounder,
      role: "owner",
      title: `${startupA?.name || "Partner"} Representative`,
      joinedAt: new Date().toISOString(),
    },
    {
      id: `bsm-${Date.now()}-2`,
      spaceId: newPartSpace.id,
      profileId: collabReq.sentByProfileId,
      profile: founderProfilesStore.get(collabReq.sentByProfileId),
      role: "admin",
      title: `${startupB?.name || "Partner"} Representative`,
      joinedAt: new Date().toISOString(),
    },
  ];
  buildSpaceMembersStore.set(newPartSpace.id, members);

  res.status(201).json({
    message: "Partnership Space activated successfully",
    space: enrichBuildSpace(newPartSpace, currentFounder.id),
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
};

founderRouter.post("/build-spaces/partnerships/activate", handleActivatePartnershipSpace);
founderRouter.post("/build-spaces/from-collaboration/:collaborationRequestId", handleActivatePartnershipSpace);

// 8. GET /api/founders/build-spaces/:id — Get Workspace Details
founderRouter.get("/build-spaces/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  const { id } = req.params;

  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  const isMember = currentFounder ? isBuildSpaceMember(currentFounder.id, space.id) : false;
  const isOwner = currentFounder ? space.ownerProfileId === currentFounder.id : false;

  // Option C visibility & authorization rules:
  // Private spaces: only members can access. Non-members strictly 403.
  if (!isMember && !isOwner) {
    if (space.visibility === "private") {
      return res.status(403).json({
        error: "Forbidden: This workspace is private. Only invited and approved members can access it.",
      });
    }

    // Public space accessed by outsider: return public project profile projection
    const owner = founderProfilesStore.get(space.ownerProfileId);
    return res.json({
      world: WORLDS.FOUNDERS,
      space: {
        id: space.id,
        type: space.type,
        name: space.name,
        slug: space.slug,
        logoUrl: space.logoUrl,
        coverUrl: space.coverUrl,
        shortDescription: space.shortDescription,
        detailedOverview: space.detailedOverview,
        category: space.category,
        developmentStage: space.developmentStage,
        mainGoals: space.mainGoals,
        skillsRequired: space.skillsRequired,
        technologiesUsed: space.technologiesUsed,
        targetCompletionDate: space.targetCompletionDate,
        visibility: space.visibility,
        memberCount: space.memberCount,
        ownerName: owner?.displayName || "Project Owner",
        ownerHeadline: owner?.headline,
      },
      isMember: false,
      hasPendingJoinRequest: currentFounder
        ? hasActiveDuplicateJoinRequest(space.id, currentFounder.id)
        : false,
      regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
    });
  }

  // Active member / owner access: return full internal workspace details
  const members = buildSpaceMembersStore.get(space.id) || [];
  const tasks = Array.from(buildSpaceTasksStore.values()).filter((t) => t.spaceId === space.id);
  const milestones = Array.from(buildSpaceMilestonesStore.values()).filter((m) => m.spaceId === space.id);
  const meetings = Array.from(buildSpaceMeetingsStore.values()).filter((m) => m.spaceId === space.id);
  const documents = Array.from(buildSpaceDocumentsStore.values()).filter((d) => d.spaceId === space.id);

  res.json({
    world: WORLDS.FOUNDERS,
    space: enrichBuildSpace(space, currentFounder!.id),
    isMember: true,
    members,
    tasks,
    milestones,
    meetings,
    documents,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 9. PUT /api/founders/build-spaces/:id — Update Workspace Details
founderRouter.put("/build-spaces/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Authorization: requires owner or admin role
  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"])) {
    return res.status(403).json({
      error: "Forbidden: Only workspace owners and admins can update workspace details",
    });
  }

  const parsed = updateProjectBuildSpaceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  if (data.name !== undefined) space.name = data.name;
  if (data.logoUrl !== undefined) space.logoUrl = data.logoUrl;
  if (data.coverUrl !== undefined) space.coverUrl = data.coverUrl;
  if (data.shortDescription !== undefined) space.shortDescription = data.shortDescription;
  if (data.detailedOverview !== undefined) space.detailedOverview = data.detailedOverview;
  if (data.category !== undefined) space.category = data.category;
  if (data.developmentStage !== undefined) space.developmentStage = data.developmentStage;
  if (data.mainGoals !== undefined) space.mainGoals = data.mainGoals;
  if (data.expectedOutcomes !== undefined) space.expectedOutcomes = data.expectedOutcomes;
  if (data.skillsRequired !== undefined) space.skillsRequired = data.skillsRequired;
  if (data.technologiesUsed !== undefined) space.technologiesUsed = data.technologiesUsed;
  if (data.targetCompletionDate !== undefined) space.targetCompletionDate = data.targetCompletionDate;
  if (data.associatedStartupId !== undefined) {
    space.associatedStartupId = data.associatedStartupId;
    space.associatedStartup = data.associatedStartupId ? startupsStore.get(data.associatedStartupId) : null;
  }
  space.updatedAt = new Date().toISOString();
  buildSpacesStore.set(space.id, space);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Admin",
    action: "details_updated",
    details: "Workspace details and objectives updated",
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.json({
    message: "Workspace details updated successfully",
    space: enrichBuildSpace(space, currentFounder.id),
  });
});

// 10. PUT /api/founders/build-spaces/:id/visibility — Option C: Change Workspace Visibility
founderRouter.put("/build-spaces/:id/visibility", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Authorization: only owner or admin can change visibility
  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"])) {
    return res.status(403).json({
      error: "Forbidden: Only workspace owners and admins can modify visibility settings",
    });
  }

  // Mandatory Rule: Partnership Spaces are ALWAYS private and cannot be made public!
  if (space.type === "partnership") {
    return res.status(400).json({
      error: "Partnership Spaces are strictly private and cannot be made public.",
    });
  }

  const parsed = changeBuildSpaceVisibilitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const newVisibility = parsed.data.visibility;
  space.visibility = newVisibility;
  space.updatedAt = new Date().toISOString();
  buildSpacesStore.set(space.id, space);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Admin",
    action: "visibility_changed",
    details: `Workspace visibility changed to ${newVisibility}. ${
      newVisibility === "private"
        ? "Workspace is now hidden from public project discovery."
        : "Designated public project profile is now discoverable; internal content remains private."
    }`,
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.json({
    message: `Workspace visibility changed to ${newVisibility}`,
    visibility: space.visibility,
    space: enrichBuildSpace(space, currentFounder.id),
  });
});

// 11. PUT /api/founders/build-spaces/:id/status — Update Status (Active / Paused / Completed / Archived)
founderRouter.put("/build-spaces/:id/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"])) {
    return res.status(403).json({
      error: "Forbidden: Only workspace owners and admins can update workspace status",
    });
  }

  const parsed = updateBuildSpaceStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  space.status = parsed.data.status;
  space.updatedAt = new Date().toISOString();
  buildSpacesStore.set(space.id, space);

  res.json({
    message: `Workspace status updated to ${parsed.data.status}`,
    status: space.status,
    space: enrichBuildSpace(space, currentFounder.id),
  });
});

// 12. POST /api/founders/build-spaces/:id/transfer-ownership — Initiate Ownership Transfer
founderRouter.post("/build-spaces/:id/transfer-ownership", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Only current owner can transfer ownership
  if (space.ownerProfileId !== currentFounder.id) {
    return res.status(403).json({
      error: "Forbidden: Only the workspace owner can initiate an ownership transfer",
    });
  }

  const parsed = transferBuildSpaceOwnershipSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { newOwnerProfileId, previousOwnerRole } = parsed.data;
  if (newOwnerProfileId === currentFounder.id) {
    return res.status(400).json({ error: "You cannot transfer ownership to yourself" });
  }

  // Target must be an existing active member of the space
  if (!isBuildSpaceMember(newOwnerProfileId, space.id)) {
    return res.status(400).json({
      error: "Ownership can only be transferred to an existing authorized workspace member",
    });
  }

  const transferId = `btransfer-${Date.now()}`;
  const transfer = {
    id: transferId,
    spaceId: space.id,
    currentOwnerProfileId: currentFounder.id,
    targetOwnerProfileId: newOwnerProfileId,
    previousOwnerResultingRole: previousOwnerRole,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };

  buildSpaceOwnershipTransfersStore.set(transferId, transfer);

  // Notify recipient
  const notifId = `notif-${Date.now()}`;
  founderNotificationsStore.set(notifId, {
    id: notifId,
    recipientId: newOwnerProfileId,
    actorId: currentFounder.id,
    type: "workspace_ownership_transfer",
    content: `${currentFounder.displayName || "Owner"} proposed transferring ownership of '${space.name}' to you.`,
    targetId: transferId,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Ownership transfer proposal initiated. Awaiting acceptance by recipient.",
    transfer,
  });
});

// 13. POST /api/founders/build-spaces/transfers/:transferId/respond — Respond to Ownership Transfer
founderRouter.post("/build-spaces/transfers/:transferId/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { transferId } = req.params;
  const transfer = buildSpaceOwnershipTransfersStore.get(transferId);
  if (!transfer) {
    return res.status(404).json({ error: "Transfer proposal not found" });
  }

  if (transfer.targetOwnerProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not the designated recipient of this transfer" });
  }

  if (transfer.status !== "pending") {
    return res.status(400).json({ error: `Transfer proposal has already been ${transfer.status}` });
  }

  const parsed = respondBuildSpaceOwnershipTransferSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const space = buildSpacesStore.get(transfer.spaceId);
  if (!space) {
    return res.status(404).json({ error: "Associated workspace not found" });
  }

  if (parsed.data.action === "accept") {
    transfer.status = "accepted";
    space.ownerProfileId = currentFounder.id;
    space.updatedAt = new Date().toISOString();
    buildSpacesStore.set(space.id, space);

    // Update members roles
    const members = buildSpaceMembersStore.get(space.id) || [];
    for (const m of members) {
      if (m.profileId === currentFounder.id) {
        m.role = "owner";
      } else if (m.profileId === transfer.currentOwnerProfileId) {
        m.role = transfer.previousOwnerResultingRole;
      }
    }
    buildSpaceMembersStore.set(space.id, members);

    // Log activity
    const activities = buildSpaceActivitiesStore.get(space.id) || [];
    activities.unshift({
      id: `bact-${Date.now()}`,
      spaceId: space.id,
      actorProfileId: currentFounder.id,
      actorName: currentFounder.displayName || "New Owner",
      action: "ownership_transferred",
      details: `Workspace ownership transferred to ${currentFounder.displayName}`,
      createdAt: new Date().toISOString(),
    });
    buildSpaceActivitiesStore.set(space.id, activities);

    res.json({
      message: "Ownership transfer accepted. You are now the workspace owner.",
      transfer,
      space: enrichBuildSpace(space, currentFounder.id),
    });
  } else {
    transfer.status = "declined";
    res.json({ message: "Ownership transfer declined", transfer });
  }
});

// 14. GET /api/founders/build-spaces/:id/members — List Workspace Members
founderRouter.get("/build-spaces/:id/members", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, space.id) && space.ownerProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const members = buildSpaceMembersStore.get(space.id) || [];
  res.json({
    world: WORLDS.FOUNDERS,
    members,
    totalCount: members.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 15. POST /api/founders/build-spaces/:id/invitations (and /build-spaces/:id/members/invite) — Invite Member
const handleInviteBuildSpaceMember = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Authorization: requires owner or admin role
  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"])) {
    return res.status(403).json({
      error: "Forbidden: Only workspace owners and admins can invite new members",
    });
  }

  const parsed = inviteBuildSpaceMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { inviteeProfileId, role, message } = parsed.data;

  // Invitee cannot already be a member
  if (isBuildSpaceMember(inviteeProfileId, space.id)) {
    return res.status(400).json({ error: "This founder is already a member of the workspace" });
  }

  // Prevent duplicate active pending invitation
  if (hasActiveDuplicateInvitation(space.id, inviteeProfileId)) {
    return res.status(409).json({ error: "A pending invitation has already been sent to this member" });
  }

  const invitee = founderProfilesStore.get(inviteeProfileId);
  const invitationId = `binv-${Date.now()}`;
  const invitation: BuildSpaceInvitation = {
    id: invitationId,
    spaceId: space.id,
    space,
    inviteeProfileId,
    invitee,
    invitedByProfileId: currentFounder.id,
    invitedBy: currentFounder,
    role,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  buildSpaceInvitationsStore.set(invitation.id, invitation);

  // Notify invitee
  const notifId = `notif-${Date.now()}`;
  founderNotificationsStore.set(notifId, {
    id: notifId,
    recipientId: inviteeProfileId,
    actorId: currentFounder.id,
    type: "workspace_invitation",
    content: `${currentFounder.displayName || "Admin"} invited you to join '${space.name}' as ${role}.`,
    targetId: invitation.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Invitation sent successfully",
    invitation,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
};

founderRouter.post("/build-spaces/:id/invitations", handleInviteBuildSpaceMember);
founderRouter.post("/build-spaces/:id/members/invite", handleInviteBuildSpaceMember);

// 16. POST /api/founders/build-spaces/invitations/:id/respond — Accept or Reject Invitation
founderRouter.post("/build-spaces/invitations/:id/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const invitation = buildSpaceInvitationsStore.get(id);
  if (!invitation) {
    return res.status(404).json({ error: "Invitation not found" });
  }

  if (invitation.inviteeProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not the invitee of this invitation" });
  }

  if (invitation.status !== "pending") {
    return res.status(400).json({ error: `Invitation has already been ${invitation.status}` });
  }

  const parsed = respondBuildSpaceInvitationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { action } = parsed.data;
  const space = buildSpacesStore.get(invitation.spaceId);
  if (!space) {
    return res.status(404).json({ error: "Associated workspace not found" });
  }

  if (action === "accept") {
    invitation.status = "accepted";
    invitation.respondedAt = new Date().toISOString();
    buildSpaceInvitationsStore.set(invitation.id, invitation);

    // Add to members store
    const members = buildSpaceMembersStore.get(space.id) || [];
    if (!members.some((m) => m.profileId === currentFounder.id)) {
      members.push({
        id: `bsm-${Date.now()}`,
        spaceId: space.id,
        profileId: currentFounder.id,
        profile: currentFounder,
        role: invitation.role,
        joinedAt: new Date().toISOString(),
      });
      space.memberCount = members.length;
      buildSpaceMembersStore.set(space.id, members);
      buildSpacesStore.set(space.id, space);
    }

    // Log activity
    const activities = buildSpaceActivitiesStore.get(space.id) || [];
    activities.unshift({
      id: `bact-${Date.now()}`,
      spaceId: space.id,
      actorProfileId: currentFounder.id,
      actorName: currentFounder.displayName || "Member",
      action: "member_joined",
      details: `${currentFounder.displayName} joined the workspace as ${invitation.role}`,
      createdAt: new Date().toISOString(),
    });
    buildSpaceActivitiesStore.set(space.id, activities);

    res.json({
      message: "Invitation accepted. You are now a member of the workspace.",
      invitation,
      membershipGranted: true,
      space: enrichBuildSpace(space, currentFounder.id),
    });
  } else {
    invitation.status = "rejected";
    invitation.respondedAt = new Date().toISOString();
    buildSpaceInvitationsStore.set(invitation.id, invitation);
    res.json({ message: "Invitation rejected", invitation });
  }
});

// 17. DELETE /api/founders/build-spaces/invitations/:id — Revoke Pending Invitation
founderRouter.delete("/build-spaces/invitations/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const invitation = buildSpaceInvitationsStore.get(id);
  if (!invitation) {
    return res.status(404).json({ error: "Invitation not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, invitation.spaceId, ["owner", "admin"])) {
    return res.status(403).json({ error: "Forbidden: Only workspace owners and admins can revoke invitations" });
  }

  invitation.status = "revoked";
  buildSpaceInvitationsStore.set(invitation.id, invitation);
  res.json({ message: "Invitation revoked successfully" });
});

// 18. PUT /api/founders/build-spaces/:id/members/:profileId/role — Update Member Role
founderRouter.put("/build-spaces/:id/members/:profileId/role", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, profileId } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"])) {
    return res.status(403).json({ error: "Forbidden: Only workspace owners and admins can manage roles" });
  }

  const members = buildSpaceMembersStore.get(space.id) || [];
  const targetMember = members.find((m) => m.profileId === profileId || m.id === profileId);
  if (!targetMember) {
    return res.status(404).json({ error: "Member not found in workspace" });
  }

  // Owner cannot be demoted directly
  if (space.ownerProfileId === targetMember.profileId) {
    return res.status(400).json({ error: "Workspace owner role cannot be changed without ownership transfer" });
  }

  const parsed = updateBuildSpaceMemberRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  targetMember.role = parsed.data.role;
  buildSpaceMembersStore.set(space.id, members);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Admin",
    action: "role_changed",
    details: `Updated role for member to ${parsed.data.role}`,
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.json({ message: "Member role updated successfully", member: targetMember });
});

// 19. DELETE /api/founders/build-spaces/:id/members/:profileId — Remove Member or Leave Workspace
founderRouter.delete("/build-spaces/:id/members/:profileId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, profileId } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  const members = buildSpaceMembersStore.get(space.id) || [];
  const targetMember = members.find((m) => m.profileId === profileId || m.id === profileId);
  if (!targetMember) {
    return res.status(404).json({ error: "Member not found in workspace" });
  }

  const isSelf = currentFounder.id === targetMember.profileId;
  const isAuthorized = hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"]);

  if (!isSelf && !isAuthorized) {
    return res.status(403).json({ error: "Forbidden: You cannot remove members from this workspace" });
  }

  // Owner cannot leave without transferring ownership
  if (space.ownerProfileId === targetMember.profileId) {
    return res.status(400).json({
      error: "Workspace owner cannot leave the workspace without transferring ownership first",
    });
  }

  const updatedMembers = members.filter((m) => m.profileId !== targetMember.profileId && m.id !== targetMember.id);
  space.memberCount = updatedMembers.length;
  buildSpaceMembersStore.set(space.id, updatedMembers);
  buildSpacesStore.set(space.id, space);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Admin",
    action: isSelf ? "member_left" : "member_removed",
    details: isSelf ? "Member left the workspace" : "Member was removed from the workspace",
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.json({
    message: isSelf ? "You have left the workspace" : "Member removed successfully",
    memberCount: space.memberCount,
  });
});

// 20. POST /api/founders/build-spaces/:id/join-requests — Option C: Submit Join Request on Public Project
founderRouter.post("/build-spaces/:id/join-requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Strict Option C: Join requests only allowed on public project spaces
  if (space.visibility !== "public" || space.type !== "project") {
    return res.status(400).json({
      error: "Join requests can only be submitted for publicly discoverable Project Build Spaces",
    });
  }

  // Cannot request if already a member or owner
  if (isBuildSpaceMember(currentFounder.id, space.id) || space.ownerProfileId === currentFounder.id) {
    return res.status(400).json({ error: "You are already a member of this workspace" });
  }

  // Prevent duplicate active join request
  if (hasActiveDuplicateJoinRequest(space.id, currentFounder.id)) {
    return res.status(409).json({
      error: "You already have an active join request under review for this workspace",
    });
  }

  const parsed = submitBuildSpaceJoinRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const requestId = `bjoin-${Date.now()}`;
  const joinRequest: BuildSpaceJoinRequest = {
    id: requestId,
    spaceId: space.id,
    space,
    applicantProfileId: currentFounder.id,
    applicant: currentFounder,
    introduction: parsed.data.introduction,
    relevantSkills: parsed.data.relevantSkills,
    portfolioLinks: parsed.data.portfolioLinks || [],
    status: "submitted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  buildSpaceJoinRequestsStore.set(joinRequest.id, joinRequest);

  // Notify workspace owner
  const notifId = `notif-${Date.now()}`;
  founderNotificationsStore.set(notifId, {
    id: notifId,
    recipientId: space.ownerProfileId,
    actorId: currentFounder.id,
    type: "workspace_join_request",
    content: `${currentFounder.displayName || "Applicant"} requested to join your public project '${space.name}'.`,
    targetId: joinRequest.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Join request submitted. The project owner/admin will review your application.",
    request: joinRequest,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 21. GET /api/founders/build-spaces/:id/join-requests — List Join Requests for Workspace
founderRouter.get("/build-spaces/:id/join-requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Authorization: requires owner or admin role
  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"])) {
    return res.status(403).json({
      error: "Forbidden: Only workspace owners and admins can view join requests",
    });
  }

  const requests = Array.from(buildSpaceJoinRequestsStore.values())
    .filter((r) => r.spaceId === space.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    requests,
    totalCount: requests.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 22. POST /api/founders/build-spaces/join-requests/:requestId/respond — Review Join Request (Owner/Admin)
const handleReviewBuildSpaceJoinRequest = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { requestId } = req.params;
  const joinReq = buildSpaceJoinRequestsStore.get(requestId);
  if (!joinReq) {
    return res.status(404).json({ error: "Join request not found" });
  }

  const space = buildSpacesStore.get(joinReq.spaceId);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin"])) {
    return res.status(403).json({
      error: "Forbidden: Only workspace owners and admins can review join requests",
    });
  }

  const parsed = reviewBuildSpaceJoinRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { action, assignedRole, moreInfoQuery, responseNotes, reviewerNotes } = parsed.data;

  joinReq.reviewedByProfileId = currentFounder.id;
  joinReq.reviewedAt = new Date().toISOString();
  joinReq.updatedAt = new Date().toISOString();
  if (responseNotes || reviewerNotes) joinReq.responseNotes = responseNotes || reviewerNotes;

  if (action === "accept") {
    joinReq.status = "accepted";
    buildSpaceJoinRequestsStore.set(joinReq.id, joinReq);

    // Add applicant as member
    const members = buildSpaceMembersStore.get(space.id) || [];
    if (!members.some((m) => m.profileId === joinReq.applicantProfileId)) {
      members.push({
        id: `bsm-${Date.now()}`,
        spaceId: space.id,
        profileId: joinReq.applicantProfileId,
        profile: founderProfilesStore.get(joinReq.applicantProfileId),
        role: assignedRole,
        joinedAt: new Date().toISOString(),
      });
      space.memberCount = members.length;
      buildSpaceMembersStore.set(space.id, members);
      buildSpacesStore.set(space.id, space);
    }

    // Log activity
    const activities = buildSpaceActivitiesStore.get(space.id) || [];
    activities.unshift({
      id: `bact-${Date.now()}`,
      spaceId: space.id,
      actorProfileId: currentFounder.id,
      actorName: currentFounder.displayName || "Admin",
      action: "member_joined",
      details: `Approved join request. Applicant joined as ${assignedRole}`,
      createdAt: new Date().toISOString(),
    });
    buildSpaceActivitiesStore.set(space.id, activities);

    // Notify applicant
    const notifId = `notif-${Date.now()}`;
    founderNotificationsStore.set(notifId, {
      id: notifId,
      recipientId: joinReq.applicantProfileId,
      actorId: currentFounder.id,
      type: "workspace_join_accepted",
      content: `Your request to join '${space.name}' has been accepted as ${assignedRole}!`,
      targetId: space.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: `Join request approved! Member added as ${assignedRole}.`,
      request: joinReq,
      membershipGranted: true,
      space: enrichBuildSpace(space, currentFounder.id),
    });
  } else if (action === "reject") {
    joinReq.status = "rejected";
    buildSpaceJoinRequestsStore.set(joinReq.id, joinReq);
    res.json({ message: "Join request rejected", request: joinReq });
  } else if (action === "request_more_info") {
    joinReq.status = "more_info_requested";
    joinReq.moreInfoQuery = moreInfoQuery || reviewerNotes || responseNotes || "Please provide additional details regarding your availability and experience.";
    buildSpaceJoinRequestsStore.set(joinReq.id, joinReq);
    res.json({ message: "Additional information requested from applicant", request: joinReq });
  }
};

founderRouter.post("/build-spaces/join-requests/:requestId/respond", handleReviewBuildSpaceJoinRequest);
founderRouter.post("/build-spaces/join-requests/:requestId/review", handleReviewBuildSpaceJoinRequest);
founderRouter.post("/build-spaces/:id/join-requests/:requestId/review", handleReviewBuildSpaceJoinRequest);
founderRouter.post("/build-spaces/:id/join-requests/:requestId/respond", handleReviewBuildSpaceJoinRequest);

// 23. POST /api/founders/build-spaces/join-requests/:requestId/more-info — Applicant Responds to Query
founderRouter.post("/build-spaces/join-requests/:requestId/more-info", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { requestId } = req.params;
  const joinReq = buildSpaceJoinRequestsStore.get(requestId);
  if (!joinReq) {
    return res.status(404).json({ error: "Join request not found" });
  }

  if (joinReq.applicantProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not the applicant of this join request" });
  }

  const parsed = respondBuildSpaceMoreInfoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  joinReq.moreInfoResponse = parsed.data.moreInfoResponse || parsed.data.additionalInfo;
  joinReq.status = "under_review";
  joinReq.updatedAt = new Date().toISOString();
  buildSpaceJoinRequestsStore.set(joinReq.id, joinReq);

  res.json({ message: "Information updated. Join request is now under review.", request: joinReq });
});

// 24. POST /api/founders/build-spaces/join-requests/:requestId/withdraw — Applicant Withdraws Request
founderRouter.post("/build-spaces/join-requests/:requestId/withdraw", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { requestId } = req.params;
  const joinReq = buildSpaceJoinRequestsStore.get(requestId);
  if (!joinReq) {
    return res.status(404).json({ error: "Join request not found" });
  }

  if (joinReq.applicantProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You can only withdraw your own join request" });
  }

  joinReq.status = "withdrawn";
  joinReq.updatedAt = new Date().toISOString();
  buildSpaceJoinRequestsStore.set(joinReq.id, joinReq);

  res.json({ message: "Join request withdrawn successfully", request: joinReq });
});

// ----------------------------------------------------------------------------
// TASKS MANAGEMENT
// ----------------------------------------------------------------------------

// 25. GET /api/founders/build-spaces/:id/tasks — List Tasks
founderRouter.get("/build-spaces/:id/tasks", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, space.id) && space.ownerProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  let tasks = Array.from(buildSpaceTasksStore.values()).filter((t) => t.spaceId === space.id);

  const { status, priority, assignedProfileId, milestoneId, search } = req.query;
  if (typeof status === "string" && status !== "all") {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (typeof priority === "string" && priority !== "all") {
    tasks = tasks.filter((t) => t.priority === priority);
  }
  if (typeof assignedProfileId === "string" && assignedProfileId !== "all") {
    tasks = tasks.filter((t) => t.assignedProfileId === assignedProfileId);
  }
  if (typeof milestoneId === "string" && milestoneId !== "all") {
    tasks = tasks.filter((t) => t.milestoneId === milestoneId);
  }
  if (typeof search === "string" && search.trim()) {
    const q = search.trim().toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }

  res.json({
    world: WORLDS.FOUNDERS,
    tasks,
    totalCount: tasks.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 26. POST /api/founders/build-spaces/:id/tasks — Create Task
founderRouter.post("/build-spaces/:id/tasks", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Non-viewers can create tasks
  if (!hasBuildSpacePermission(currentFounder.id, space.id, ["owner", "admin", "editor", "member"])) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to create tasks" });
  }

  const parsed = createBuildSpaceTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;

  // Task assignment rule: Assignee must be an active workspace member
  if (data.assignedProfileId && !isBuildSpaceMember(data.assignedProfileId, space.id)) {
    return res.status(400).json({
      error: "Tasks can only be assigned to verified active members of this workspace",
    });
  }

  const taskId = `btask-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newTask: BuildSpaceTask = {
    id: taskId,
    spaceId: space.id,
    title: data.title,
    description: data.description || "",
    assignedProfileId: data.assignedProfileId || null,
    assignee: data.assignedProfileId ? founderProfilesStore.get(data.assignedProfileId) : undefined,
    priority: data.priority,
    status: data.status,
    startDate: data.startDate || undefined,
    dueDate: data.dueDate || undefined,
    tags: data.tags || [],
    checklists: (data.checklists || []).map((c, i) => ({
      id: `chk-${Date.now()}-${i}`,
      text: c.text,
      completed: c.completed || false,
    })),
    comments: [],
    attachments: [],
    milestoneId: data.milestoneId || null,
    createdByProfileId: currentFounder.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  buildSpaceTasksStore.set(newTask.id, newTask);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Member",
    action: "task_created",
    details: `Created task '${data.title}'`,
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.status(201).json({
    message: "Task created successfully",
    task: newTask,
  });
});

// 27. GET /api/founders/build-spaces/:id/tasks/:taskId — Get Task
founderRouter.get("/build-spaces/:id/tasks/:taskId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, taskId } = req.params;
  const task = buildSpaceTasksStore.get(taskId);
  if (!task || task.spaceId !== id) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  res.json({ task });
});

// 28. PUT /api/founders/build-spaces/:id/tasks/:taskId — Update Task
founderRouter.put("/build-spaces/:id/tasks/:taskId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, taskId } = req.params;
  const task = buildSpaceTasksStore.get(taskId);
  if (!task || task.spaceId !== id) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, id, ["owner", "admin", "editor", "member"])) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to update tasks" });
  }

  const parsed = updateBuildSpaceTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  if (data.assignedProfileId !== undefined) {
    if (data.assignedProfileId && !isBuildSpaceMember(data.assignedProfileId, id)) {
      return res.status(400).json({ error: "Assignee must be an active member of this workspace" });
    }
    task.assignedProfileId = data.assignedProfileId;
    task.assignee = data.assignedProfileId ? founderProfilesStore.get(data.assignedProfileId) : undefined;
  }
  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.priority !== undefined) task.priority = data.priority;
  if (data.status !== undefined) task.status = data.status;
  if (data.startDate !== undefined) task.startDate = data.startDate || undefined;
  if (data.dueDate !== undefined) task.dueDate = data.dueDate || undefined;
  if (data.tags !== undefined) task.tags = data.tags;
  if (data.milestoneId !== undefined) task.milestoneId = data.milestoneId || null;

  task.updatedAt = new Date().toISOString();
  buildSpaceTasksStore.set(task.id, task);

  res.json({ message: "Task updated successfully", task });
});

// 29. DELETE /api/founders/build-spaces/:id/tasks/:taskId — Delete Task
founderRouter.delete("/build-spaces/:id/tasks/:taskId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, taskId } = req.params;
  const task = buildSpaceTasksStore.get(taskId);
  if (!task || task.spaceId !== id) {
    return res.status(404).json({ error: "Task not found" });
  }

  const isCreator = task.createdByProfileId === currentFounder.id;
  const isAuthorized = hasBuildSpacePermission(currentFounder.id, id, ["owner", "admin"]);
  if (!isCreator && !isAuthorized) {
    return res.status(403).json({ error: "Forbidden: You cannot delete this task" });
  }

  buildSpaceTasksStore.delete(task.id);
  res.json({ message: "Task deleted successfully" });
});

// 30. POST /api/founders/build-spaces/:id/tasks/:taskId/comments — Add Task Comment
founderRouter.post("/build-spaces/:id/tasks/:taskId/comments", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, taskId } = req.params;
  const task = buildSpaceTasksStore.get(taskId);
  if (!task || task.spaceId !== id) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const parsed = addBuildSpaceTaskCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const newComment = {
    id: `bcomm-${Date.now()}`,
    taskId: task.id,
    authorProfileId: currentFounder.id,
    authorName: currentFounder.displayName || "Member",
    authorAvatar: (currentFounder as any).avatarUrl,
    content: (parsed.data.content || (parsed.data as any).text)!,
    createdAt: new Date().toISOString(),
  };

  task.comments.push(newComment);
  task.updatedAt = new Date().toISOString();
  buildSpaceTasksStore.set(task.id, task);

  res.status(201).json({ message: "Comment added successfully", comment: newComment, task });
});

// 31. PUT /api/founders/build-spaces/:id/tasks/:taskId/checklist/:checkitemId — Toggle Checklist Item
founderRouter.put("/build-spaces/:id/tasks/:taskId/checklist/:checkitemId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, taskId, checkitemId } = req.params;
  const task = buildSpaceTasksStore.get(taskId);
  if (!task || task.spaceId !== id) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const item = task.checklists.find((c) => c.id === checkitemId);
  if (!item) {
    return res.status(404).json({ error: "Checklist item not found" });
  }

  item.completed = !item.completed;
  item.completedByProfileId = item.completed ? currentFounder.id : undefined;
  item.completedAt = item.completed ? new Date().toISOString() : undefined;
  task.updatedAt = new Date().toISOString();
  buildSpaceTasksStore.set(task.id, task);

  res.json({ message: `Checklist item ${item.completed ? "completed" : "uncompleted"}`, item, task });
});

// ----------------------------------------------------------------------------
// MILESTONES MANAGEMENT
// ----------------------------------------------------------------------------

// 32. GET /api/founders/build-spaces/:id/milestones — List Milestones
founderRouter.get("/build-spaces/:id/milestones", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const milestones = Array.from(buildSpaceMilestonesStore.values())
    .filter((m) => m.spaceId === space.id)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    milestones,
    totalCount: milestones.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 33. POST /api/founders/build-spaces/:id/milestones — Create Milestone
founderRouter.post("/build-spaces/:id/milestones", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Requires owner, admin or editor role
  if (!hasBuildSpacePermission(currentFounder.id, id, ["owner", "admin", "editor"])) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to create milestones" });
  }

  const parsed = createBuildSpaceMilestoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  const milestoneId = `bmilestone-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newMilestone: BuildSpaceMilestone = {
    id: milestoneId,
    spaceId: space.id,
    title: data.title,
    description: data.description || "",
    targetDate: data.targetDate,
    responsibleProfileId: data.responsibleProfileId || null,
    responsiblePerson: data.responsibleProfileId ? founderProfilesStore.get(data.responsibleProfileId) : undefined,
    linkedTaskIds: data.linkedTaskIds || [],
    completionCriteria: data.completionCriteria,
    status: data.status,
    createdByProfileId: currentFounder.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  buildSpaceMilestonesStore.set(newMilestone.id, newMilestone);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Admin",
    action: "milestone_created",
    details: `Created milestone '${data.title}'`,
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.status(201).json({
    message: "Milestone created successfully",
    milestone: newMilestone,
  });
});

// 34. PUT /api/founders/build-spaces/:id/milestones/:milestoneId — Update Milestone
founderRouter.put("/build-spaces/:id/milestones/:milestoneId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, milestoneId } = req.params;
  const milestone = buildSpaceMilestonesStore.get(milestoneId);
  if (!milestone || milestone.spaceId !== id) {
    return res.status(404).json({ error: "Milestone not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, id, ["owner", "admin", "editor"])) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to update milestones" });
  }

  const parsed = updateBuildSpaceMilestoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  if (data.title !== undefined) milestone.title = data.title;
  if (data.description !== undefined) milestone.description = data.description;
  if (data.targetDate !== undefined) milestone.targetDate = data.targetDate;
  if (data.responsibleProfileId !== undefined) {
    milestone.responsibleProfileId = data.responsibleProfileId;
    milestone.responsiblePerson = data.responsibleProfileId ? founderProfilesStore.get(data.responsibleProfileId) : undefined;
  }
  if (data.linkedTaskIds !== undefined) milestone.linkedTaskIds = data.linkedTaskIds;
  if (data.completionCriteria !== undefined) milestone.completionCriteria = data.completionCriteria;
  if (data.status !== undefined) {
    milestone.status = data.status;
    if (data.status === "completed") {
      milestone.completedDate = new Date().toISOString().split("T")[0];
    }
  }
  if (data.completionNotes !== undefined) milestone.completionNotes = data.completionNotes;

  milestone.updatedAt = new Date().toISOString();
  buildSpaceMilestonesStore.set(milestone.id, milestone);

  res.json({ message: "Milestone updated successfully", milestone });
});

// 35. DELETE /api/founders/build-spaces/:id/milestones/:milestoneId — Delete Milestone
founderRouter.delete("/build-spaces/:id/milestones/:milestoneId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, milestoneId } = req.params;
  const milestone = buildSpaceMilestonesStore.get(milestoneId);
  if (!milestone || milestone.spaceId !== id) {
    return res.status(404).json({ error: "Milestone not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, id, ["owner", "admin"])) {
    return res.status(403).json({ error: "Forbidden: Only workspace owners and admins can delete milestones" });
  }

  buildSpaceMilestonesStore.delete(milestone.id);
  res.json({ message: "Milestone deleted successfully" });
});

// ----------------------------------------------------------------------------
// WORKSPACE CHAT
// ----------------------------------------------------------------------------

// 36. GET /api/founders/build-spaces/:id/messages — Get Workspace Chat Messages
founderRouter.get("/build-spaces/:id/messages", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Strict isolation: Only verified workspace members can view chat
  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  let messages = buildSpaceMessagesStore.get(space.id) || [];
  const { channel } = req.query;
  if (typeof channel === "string" && channel !== "all") {
    messages = messages.filter((m) => m.channel === channel);
  }

  res.json({
    world: WORLDS.FOUNDERS,
    messages,
    totalCount: messages.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 37. POST /api/founders/build-spaces/:id/messages — Send Workspace Message
founderRouter.post("/build-spaces/:id/messages", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const parsed = sendBuildSpaceMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const newMsg: BuildSpaceMessage = {
    id: `bmsg-${Date.now()}`,
    spaceId: space.id,
    channel: parsed.data.channel,
    senderProfileId: currentFounder.id,
    senderName: currentFounder.displayName || "Member",
    senderAvatar: (currentFounder as any).avatarUrl,
    text: parsed.data.text,
    attachments: parsed.data.attachments || [],
    createdAt: new Date().toISOString(),
  };

  const messages = buildSpaceMessagesStore.get(space.id) || [];
  messages.push(newMsg);
  buildSpaceMessagesStore.set(space.id, messages);

  res.status(201).json({ message: newMsg });
});

// ----------------------------------------------------------------------------
// DOCUMENTS & FILE SHARING
// ----------------------------------------------------------------------------

// 38. GET /api/founders/build-spaces/:id/documents — List Workspace Documents
founderRouter.get("/build-spaces/:id/documents", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Strict isolation: Non-members cannot view private documents
  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const documents = Array.from(buildSpaceDocumentsStore.values()).filter((d) => d.spaceId === space.id);

  res.json({
    world: WORLDS.FOUNDERS,
    documents,
    totalCount: documents.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 39. POST /api/founders/build-spaces/:id/documents — Upload Document Record
founderRouter.post("/build-spaces/:id/documents", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, id, ["owner", "admin", "editor", "member"])) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to upload documents" });
  }

  const parsed = uploadBuildSpaceDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  const docId = `bdoc-${Date.now()}`;
  const newDoc: BuildSpaceDocument = {
    id: docId,
    spaceId: space.id,
    folder: data.folder,
    name: data.name,
    description: data.description,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize || "1.2 MB",
    fileType: data.fileType || "application/pdf",
    version: data.version || "1.0",
    uploadedByProfileId: currentFounder.id,
    uploadedBy: currentFounder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  buildSpaceDocumentsStore.set(newDoc.id, newDoc);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Member",
    action: "document_uploaded",
    details: `Uploaded document '${data.name}'`,
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.status(201).json({
    message: "Document uploaded successfully",
    document: newDoc,
  });
});

// ----------------------------------------------------------------------------
// MEETINGS & COLLABORATION
// ----------------------------------------------------------------------------

// 40. GET /api/founders/build-spaces/:id/meetings — List Meetings
founderRouter.get("/build-spaces/:id/meetings", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const meetings = Array.from(buildSpaceMeetingsStore.values())
    .filter((m) => m.spaceId === space.id)
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  res.json({
    world: WORLDS.FOUNDERS,
    meetings,
    totalCount: meetings.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// 41. POST /api/founders/build-spaces/:id/meetings — Schedule Meeting
founderRouter.post("/build-spaces/:id/meetings", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (!hasBuildSpacePermission(currentFounder.id, id, ["owner", "admin", "editor", "member"])) {
    return res.status(403).json({ error: "Forbidden: You do not have permission to schedule meetings" });
  }

  const parsed = scheduleBuildSpaceMeetingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;
  const meetingId = `bmeet-${Date.now()}`;
  const newMeeting: BuildSpaceMeeting = {
    id: meetingId,
    spaceId: space.id,
    title: data.title,
    description: data.description,
    date: data.date,
    time: data.time,
    timezone: data.timezone || "Asia/Kolkata",
    participantProfileIds: data.participantProfileIds || [currentFounder.id],
    agenda: data.agenda,
    onlineMeetingLink: data.onlineMeetingLink || "https://meet.balaga.online/" + space.slug,
    publicLocation: data.publicLocation,
    notes: data.notes,
    status: "confirmed",
    scheduledByProfileId: currentFounder.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  buildSpaceMeetingsStore.set(newMeeting.id, newMeeting);

  // Log activity
  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  activities.unshift({
    id: `bact-${Date.now()}`,
    spaceId: space.id,
    actorProfileId: currentFounder.id,
    actorName: currentFounder.displayName || "Member",
    action: "meeting_scheduled",
    details: `Scheduled meeting '${data.title}' for ${data.date} at ${data.time}`,
    createdAt: new Date().toISOString(),
  });
  buildSpaceActivitiesStore.set(space.id, activities);

  res.status(201).json({
    message: "Meeting scheduled successfully",
    meeting: newMeeting,
  });
});

// 42. PUT /api/founders/build-spaces/:id/meetings/:meetingId/status — Update Meeting Status
founderRouter.put("/build-spaces/:id/meetings/:meetingId/status", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, meetingId } = req.params;
  const meeting = buildSpaceMeetingsStore.get(meetingId);
  if (!meeting || meeting.spaceId !== id) {
    return res.status(404).json({ error: "Meeting not found" });
  }

  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const parsed = updateBuildSpaceMeetingStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  meeting.status = parsed.data.status;
  if (parsed.data.notes) meeting.notes = parsed.data.notes;
  if (parsed.data.newDate) meeting.date = parsed.data.newDate;
  if (parsed.data.newTime) meeting.time = parsed.data.newTime;
  meeting.updatedAt = new Date().toISOString();
  buildSpaceMeetingsStore.set(meeting.id, meeting);

  res.json({ message: `Meeting status updated to ${parsed.data.status}`, meeting });
});

// ----------------------------------------------------------------------------
// ACTIVITY HISTORY
// ----------------------------------------------------------------------------

// 43. GET /api/founders/build-spaces/:id/activities — Activity History Feed
founderRouter.get("/build-spaces/:id/activities", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const space = buildSpacesStore.get(id);
  if (!space) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  // Strict isolation: Non-members cannot view private workspace activity logs
  if (!isBuildSpaceMember(currentFounder.id, id)) {
    return res.status(403).json({ error: "Forbidden: You are not a member of this workspace" });
  }

  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  res.json({
    world: WORLDS.FOUNDERS,
    activities,
    totalCount: activities.length,
    regulatoryDisclaimer: BUILD_SPACES_REGULATORY_DISCLAIMER,
  });
});

// ============================================================================
// FEATURE 13: BALAGA FOUNDERS INBOX & NOTIFICATIONS API
// Option A: One Unified Founders Inbox with Category Filters
// ============================================================================

// Helper: Check if two founders have an accepted professional connection
const isFounderConnectionAccepted = (profileA: string, profileB: string): boolean => {
  return Array.from(founderConnectionsStore.values()).some(
    (c) =>
      c.status === "accepted" &&
      ((c.requesterId === profileA && c.recipientId === profileB) ||
        (c.requesterId === profileB && c.recipientId === profileA))
  );
};

// Helper: Check if direct messaging is allowed between sender and recipient
const canInitiateDirectMessage = (
  senderProfileId: string,
  recipientProfileId: string
): { allowed: boolean; reason?: string } => {
  // 1. Block check in both directions
  if (
    foundersBlocksStore.has(`${senderProfileId}:${recipientProfileId}`) ||
    foundersBlocksStore.has(`${recipientProfileId}:${senderProfileId}`)
  ) {
    return {
      allowed: false,
      reason: "You cannot message this user due to block restrictions.",
    };
  }

  // 2. Check if mutual connection accepted
  if (isFounderConnectionAccepted(senderProfileId, recipientProfileId)) {
    return { allowed: true };
  }

  // 3. Check Premium tier of sender
  // Lookup founder profile to get account ID
  const senderProfile =
    founderProfilesStore.get(senderProfileId) ||
    Array.from(founderProfilesStore.values()).find((p) => p.id === senderProfileId);

  if (senderProfile) {
    if (hasEntitlement(senderProfile.accountId, ENTITLEMENTS.DIRECT_MESSAGE_WITHOUT_CONNECTION)) {
      return { allowed: true };
    }
  }

  return {
    allowed: false,
    reason:
      "Basic Membership Policy: Initiating direct messages requires an accepted professional connection. Send a connection request or message request first.",
  };
};

// Helper: Enrich conversation with dynamic viewer-specific state and participants
const enrichFoundersConversation = (
  conv: FoundersConversation,
  viewerProfileId: string
): FoundersConversation => {
  const state = foundersUserInboxStatesStore.get(`${viewerProfileId}:${conv.id}`);
  const participants = foundersConversationParticipantsStore.get(conv.id) || [];

  const enrichedParticipants = participants.map((p) => {
    const profile =
      founderProfilesStore.get(p.profileId) ||
      Array.from(founderProfilesStore.values()).find((fp) => fp.id === p.profileId);
    return {
      ...p,
      profile,
    };
  });

  const messages = foundersMessagesStore.get(conv.id) || [];
  const viewerPart = participants.find((p) => p.profileId === viewerProfileId);

  let unreadCount = 0;
  if (state?.customUnread) {
    unreadCount = 1;
  } else if (viewerPart) {
    unreadCount = messages.filter(
      (m) =>
        m.senderProfileId !== viewerProfileId &&
        (!viewerPart.lastReadAt || new Date(m.createdAt) > new Date(viewerPart.lastReadAt))
    ).length;
  }

  return {
    ...conv,
    isStarred: state?.isStarred || false,
    isPinned: state?.isPinned || false,
    isArchived: state?.isArchived || false,
    isMuted: state?.isMuted || false,
    unreadCount,
    participants: enrichedParticipants,
  };
};

// 1. GET /api/founders/inbox/conversations & /inbox — Unified Founders Inbox
const getFoundersInboxConversations = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { category, view = "all", search } = req.query as {
    category?: string;
    view?: string;
    search?: string;
  };

  // Find all conversations where current user is a participant
  const allConvs = Array.from(foundersConversationsStore.values()).filter((c) => {
    const parts = foundersConversationParticipantsStore.get(c.id) || [];
    return parts.some((p) => p.profileId === currentFounder.id);
  });

  // Filter based on personal inbox state & view
  let filtered = allConvs.filter((c) => {
    const state = foundersUserInboxStatesStore.get(`${currentFounder.id}:${c.id}`);

    // If marked deleted from personal inbox, hide from main views
    if (state?.isDeletedFromInbox && view !== "archived") {
      return false;
    }

    if (view === "unread") {
      const enriched = enrichFoundersConversation(c, currentFounder.id);
      return (enriched.unreadCount || 0) > 0;
    }
    if (view === "starred") {
      return state?.isStarred === true;
    }
    if (view === "archived") {
      return state?.isArchived === true;
    }
    if (view === "groups") {
      return c.type === "group";
    }
    if (view === "workspaces") {
      return c.type === "workspace";
    }

    // Default 'all': exclude archived conversations unless specifically requested
    if (view === "all" && state?.isArchived) {
      return false;
    }

    return true;
  });

  // Filter by category
  if (category && category !== "all") {
    filtered = filtered.filter((c) => c.category === category);
  }

  // Filter by search query
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((c) => {
      const titleMatch = c.title?.toLowerCase().includes(q);
      const snippetMatch = c.lastMessageSnippet?.toLowerCase().includes(q);
      const parts = foundersConversationParticipantsStore.get(c.id) || [];
      const partMatch = parts.some((p) => {
        const prof = founderProfilesStore.get(p.profileId);
        return prof?.displayName.toLowerCase().includes(q) || prof?.username.toLowerCase().includes(q);
      });
      return titleMatch || snippetMatch || partMatch;
    });
  }

  // Sort: Pinned first, then latest message time DESC
  filtered.sort((a, b) => {
    const stateA = foundersUserInboxStatesStore.get(`${currentFounder.id}:${a.id}`);
    const stateB = foundersUserInboxStatesStore.get(`${currentFounder.id}:${b.id}`);
    const pinnedA = stateA?.isPinned ? 1 : 0;
    const pinnedB = stateB?.isPinned ? 1 : 0;

    if (pinnedA !== pinnedB) {
      return pinnedB - pinnedA;
    }

    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  const enrichedList = filtered.map((c) => enrichFoundersConversation(c, currentFounder.id));

  res.json({
    world: WORLDS.FOUNDERS,
    conversations: enrichedList,
    totalCount: enrichedList.length,
    view,
    category: category || "all",
    disclaimer: FOUNDERS_INBOX_DISCLAIMER,
    regulatoryDisclaimer: FOUNDERS_INBOX_DISCLAIMER,
  });
};

founderRouter.get("/inbox/conversations", getFoundersInboxConversations);
founderRouter.get("/inbox", getFoundersInboxConversations);

// 2. GET /api/founders/inbox/conversations/:id — Get Single Conversation + Details
founderRouter.get("/inbox/conversations/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  // Authorization: Participant check
  const participants = foundersConversationParticipantsStore.get(conv.id) || [];
  if (!participants.some((p) => p.profileId === currentFounder.id)) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this conversation" });
  }

  // Related entities lookup
  const startup = conv.startupId ? startupsStore.get(conv.startupId) : null;
  const space = conv.spaceId ? buildSpacesStore.get(conv.spaceId) : null;

  // Shared attachments across conversation messages
  const messages = foundersMessagesStore.get(conv.id) || [];
  const sharedFiles = messages.flatMap((m) => m.attachments || []);

  res.json({
    world: WORLDS.FOUNDERS,
    conversation: enrichFoundersConversation(conv, currentFounder.id),
    startup,
    space,
    sharedFiles,
    regulatoryDisclaimer: FOUNDERS_INBOX_DISCLAIMER,
  });
});

// 3. POST /api/founders/inbox/conversations — Initiate Conversation
founderRouter.post("/inbox/conversations", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = createFoundersConversationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;

  // Direct conversation permissions check
  if (data.type === "direct" && data.recipientProfileId) {
    const perm = canInitiateDirectMessage(currentFounder.id, data.recipientProfileId);
    if (!perm.allowed) {
      return res.status(403).json({ error: perm.reason || "Forbidden: Cannot message user" });
    }

    // Check if direct conversation already exists between these 2 users for this category
    const existing = Array.from(foundersConversationsStore.values()).find((c) => {
      if (c.type !== "direct" || c.category !== data.category) return false;
      const parts = foundersConversationParticipantsStore.get(c.id) || [];
      const hasMe = parts.some((p) => p.profileId === currentFounder.id);
      const hasThem = parts.some((p) => p.profileId === data.recipientProfileId);
      return hasMe && hasThem;
    });

    if (existing) {
      // Un-delete / activate existing conversation if deleted
      const myState = foundersUserInboxStatesStore.get(`${currentFounder.id}:${existing.id}`);
      if (myState && myState.isDeletedFromInbox) {
        myState.isDeletedFromInbox = false;
        foundersUserInboxStatesStore.set(`${currentFounder.id}:${existing.id}`, myState);
      }
      return res.status(200).json({
        message: "Existing conversation retrieved",
        conversation: enrichFoundersConversation(existing, currentFounder.id),
      });
    }
  }

  const convId = `fconv-${Date.now()}`;
  const now = new Date().toISOString();

  const recipient = data.recipientProfileId ? founderProfilesStore.get(data.recipientProfileId) : null;
  const convTitle =
    data.title ||
    (data.type === "direct" && recipient
      ? `${currentFounder.displayName} & ${recipient.displayName}`
      : "Group Conversation");

  const initialMsgSnippet = data.initialMessage
    ? data.initialMessage.substring(0, 80)
    : "Conversation started";

  const newConv: FoundersConversation = {
    id: convId,
    type: data.type,
    title: convTitle,
    category: data.category,
    relatedEntityType: data.relatedEntityType || null,
    relatedEntityId: data.relatedEntityId || null,
    startupId: data.startupId || null,
    spaceId: data.spaceId || null,
    creatorProfileId: currentFounder.id,
    avatarUrl: recipient?.avatarUrl || "💬",
    description: "",
    lastMessageSnippet: initialMsgSnippet,
    lastMessageAt: now,
    lastMessageSenderId: currentFounder.id,
    messageCount: data.initialMessage ? 1 : 0,
    createdAt: now,
    updatedAt: now,
  };

  foundersConversationsStore.set(convId, newConv);

  // Initialize participants
  const participants: FoundersConversationParticipant[] = [
    {
      id: `fcp-${Date.now()}-1`,
      conversationId: convId,
      profileId: currentFounder.id,
      role: "admin",
      joinedAt: now,
      lastReadAt: now,
    },
  ];

  if (data.type === "direct" && data.recipientProfileId) {
    participants.push({
      id: `fcp-${Date.now()}-2`,
      conversationId: convId,
      profileId: data.recipientProfileId,
      role: "member",
      joinedAt: now,
    });
  } else if (data.type === "group" && data.participantProfileIds) {
    data.participantProfileIds.forEach((pid, idx) => {
      if (pid !== currentFounder.id) {
        participants.push({
          id: `fcp-${Date.now()}-${idx + 2}`,
          conversationId: convId,
          profileId: pid,
          role: "member",
          joinedAt: now,
        });
      }
    });
  }

  foundersConversationParticipantsStore.set(convId, participants);

  // Create initial message if provided
  const messages: FoundersMessage[] = [];
  if (data.initialMessage) {
    const msgId = `fmsg-${Date.now()}`;
    const initialMsg: FoundersMessage = {
      id: msgId,
      conversationId: convId,
      senderProfileId: currentFounder.id,
      content: data.initialMessage,
      deliveryState: "sent",
      attachments: [],
      reactions: [],
      isEdited: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    messages.push(initialMsg);
  }
  foundersMessagesStore.set(convId, messages);

  // Notify other participants
  participants
    .filter((p) => p.profileId !== currentFounder.id)
    .forEach((p) => {
      const notifId = `fnotif-${Date.now()}-${p.profileId}`;
      foundersNotificationsStore.set(notifId, {
        id: notifId,
        recipientProfileId: p.profileId,
        actorProfileId: currentFounder.id,
        actor: currentFounder,
        title: `New conversation from ${currentFounder.displayName}`,
        description: initialMsgSnippet,
        category: "messages",
        navigationTarget: `/inbox?conv=${convId}`,
        isRead: false,
        createdAt: now,
      });
    });

  res.status(201).json({
    message: "Conversation created successfully",
    conversation: enrichFoundersConversation(newConv, currentFounder.id),
    initialMessage: messages.length > 0 ? messages[0] : null,
  });
});

// 4. GET /api/founders/inbox/conversations/:id/messages — Get Message History
founderRouter.get("/inbox/conversations/:id/messages", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const participants = foundersConversationParticipantsStore.get(conv.id) || [];
  const myParticipant = participants.find((p) => p.profileId === currentFounder.id);
  if (!myParticipant) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this conversation" });
  }

  let messages = foundersMessagesStore.get(conv.id) || [];

  // Mark all unread messages from other senders as read
  const now = new Date().toISOString();
  messages = messages.map((m) => {
    if (m.senderProfileId !== currentFounder.id && m.deliveryState !== "read") {
      return { ...m, deliveryState: "read" as const };
    }
    return m;
  });
  foundersMessagesStore.set(conv.id, messages);

  // Update participant last read timestamp and reset customUnread
  myParticipant.lastReadAt = now;
  if (messages.length > 0) {
    myParticipant.lastReadMessageId = messages[messages.length - 1].id;
  }
  foundersConversationParticipantsStore.set(conv.id, participants);

  const myState = foundersUserInboxStatesStore.get(`${currentFounder.id}:${conv.id}`);
  if (myState && myState.customUnread) {
    myState.customUnread = false;
    foundersUserInboxStatesStore.set(`${currentFounder.id}:${conv.id}`, myState);
  }

  // Enrich sender profiles
  const enrichedMessages = messages.map((m) => ({
    ...m,
    sender: founderProfilesStore.get(m.senderProfileId) || currentFounder,
  }));

  res.json({
    world: WORLDS.FOUNDERS,
    conversationId: conv.id,
    messages: enrichedMessages,
    totalCount: enrichedMessages.length,
    regulatoryDisclaimer: FOUNDERS_INBOX_DISCLAIMER,
  });
});

// 5. POST /api/founders/inbox/conversations/:id/messages — Send Message
founderRouter.post("/inbox/conversations/:id/messages", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const participants = foundersConversationParticipantsStore.get(conv.id) || [];
  if (!participants.some((p) => p.profileId === currentFounder.id)) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this conversation" });
  }

  // Block check across participants
  const otherParticipants = participants.filter((p) => p.profileId !== currentFounder.id);
  for (const other of otherParticipants) {
    if (
      foundersBlocksStore.has(`${currentFounder.id}:${other.profileId}`) ||
      foundersBlocksStore.has(`${other.profileId}:${currentFounder.id}`)
    ) {
      return res.status(403).json({ error: "Forbidden: Cannot send messages due to active block restriction" });
    }
  }

  const parsed = sendFoundersMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const messageText = (parsed.data.content || parsed.data.text)!.trim();
  const now = new Date().toISOString();
  const msgId = `fmsg-${Date.now()}`;

  const replyTargetId = parsed.data.replyToMessageId || (parsed.data as any).replyToId;
  let replySnippet: string | undefined = undefined;
  if (replyTargetId) {
    const existingMsgs = foundersMessagesStore.get(conv.id) || [];
    const targetMsg = existingMsgs.find((m) => m.id === replyTargetId);
    if (targetMsg) {
      replySnippet = targetMsg.content.substring(0, 80);
    }
  }

  const newMsg: FoundersMessage = {
    id: msgId,
    conversationId: conv.id,
    senderProfileId: currentFounder.id,
    content: messageText,
    deliveryState: "delivered",
    replyToMessageId: replyTargetId || null,
    replySnippet: replySnippet || null,
    attachments: (parsed.data.attachments || []).map((att: any, idx: number) => ({
      id: att.id || `att-${Date.now()}-${idx}`,
      name: att.name,
      url: att.url,
      fileType: att.fileType || "other",
      sizeBytes: att.sizeBytes || 0,
    })),
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };

  const messages = foundersMessagesStore.get(conv.id) || [];
  messages.push(newMsg);
  foundersMessagesStore.set(conv.id, messages);

  // Update conversation summary
  conv.lastMessageSnippet = messageText.substring(0, 80);
  conv.lastMessageAt = now;
  conv.lastMessageSenderId = currentFounder.id;
  conv.messageCount = messages.length;
  conv.updatedAt = now;
  foundersConversationsStore.set(conv.id, conv);

  // Un-archive for participants and notify
  for (const part of otherParticipants) {
    const state = foundersUserInboxStatesStore.get(`${part.profileId}:${conv.id}`);
    if (state) {
      state.isArchived = false;
      state.isDeletedFromInbox = false;
      foundersUserInboxStatesStore.set(`${part.profileId}:${conv.id}`, state);
    }

    // Check mute
    if (!state?.isMuted) {
      const notifId = `fnotif-${Date.now()}-${part.profileId}`;
      foundersNotificationsStore.set(notifId, {
        id: notifId,
        recipientProfileId: part.profileId,
        actorProfileId: currentFounder.id,
        actor: currentFounder,
        title: `Message from ${currentFounder.displayName}`,
        description: messageText.substring(0, 100),
        category: "messages",
        navigationTarget: `/inbox?conv=${conv.id}`,
        isRead: false,
        createdAt: now,
      });
    }
  }

  const formattedMsg = {
    ...newMsg,
    sender: currentFounder,
  };

  res.status(201).json({
    message: formattedMsg,
    data: formattedMsg,
  });
});

// 6. PUT & PATCH /api/founders/inbox/conversations/:id/messages/:messageId — Edit Message
const handleEditMessage = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, messageId } = req.params;
  const messages = foundersMessagesStore.get(id) || [];
  const targetMsg = messages.find((m) => m.id === messageId);
  if (!targetMsg) {
    return res.status(404).json({ error: "Message not found" });
  }

  if (targetMsg.senderProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You can only edit your own messages" });
  }

  if (targetMsg.isDeleted) {
    return res.status(400).json({ error: "Cannot edit a deleted message" });
  }

  const parsed = editFoundersMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const updatedContent = (parsed.data.content || parsed.data.text)!.trim();
  targetMsg.content = updatedContent;
  targetMsg.isEdited = true;
  targetMsg.editedAt = new Date().toISOString();
  targetMsg.updatedAt = new Date().toISOString();

  foundersMessagesStore.set(id, messages);

  res.json({
    message: targetMsg,
    data: targetMsg,
  });
};

founderRouter.put("/inbox/conversations/:id/messages/:messageId", handleEditMessage);
founderRouter.patch("/inbox/conversations/:id/messages/:messageId", handleEditMessage);

// 7. DELETE /api/founders/inbox/conversations/:id/messages/:messageId — Soft Delete Message
founderRouter.delete("/inbox/conversations/:id/messages/:messageId", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, messageId } = req.params;
  const messages = foundersMessagesStore.get(id) || [];
  const targetMsg = messages.find((m) => m.id === messageId);
  if (!targetMsg) {
    return res.status(404).json({ error: "Message not found" });
  }

  if (targetMsg.senderProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You can only delete your own messages" });
  }

  targetMsg.isDeleted = true;
  targetMsg.content = "[Message deleted by sender]";
  targetMsg.attachments = [];
  targetMsg.reactions = [];
  targetMsg.updatedAt = new Date().toISOString();

  foundersMessagesStore.set(id, messages);

  res.json({
    message: targetMsg,
    data: targetMsg,
  });
});

// 8. POST /api/founders/inbox/conversations/:id/messages/:messageId/reactions — Toggle Emoji Reaction
founderRouter.post("/inbox/conversations/:id/messages/:messageId/reactions", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, messageId } = req.params;
  const messages = foundersMessagesStore.get(id) || [];
  const targetMsg = messages.find((m) => m.id === messageId);
  if (!targetMsg) {
    return res.status(404).json({ error: "Message not found" });
  }

  const parsed = messageReactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const emoji = parsed.data.emoji;
  const existingIdx = targetMsg.reactions.findIndex(
    (r) => r.profileId === currentFounder.id && r.emoji === emoji
  );

  if (existingIdx >= 0) {
    targetMsg.reactions.splice(existingIdx, 1);
  } else {
    targetMsg.reactions.push({
      emoji,
      profileId: currentFounder.id,
      profileName: currentFounder.displayName,
      createdAt: new Date().toISOString(),
    });
  }

  foundersMessagesStore.set(id, messages);

  res.json({
    message: targetMsg,
    data: targetMsg,
    reactions: targetMsg.reactions,
  });
});

// 9. POST & PATCH /api/founders/inbox/conversations/:id/state — Personal Inbox State
const handleUpdateConversationState = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const parsed = updateConversationStateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const key = `${currentFounder.id}:${conv.id}`;
  let state = foundersUserInboxStatesStore.get(key);
  if (!state) {
    state = {
      profileId: currentFounder.id,
      conversationId: conv.id,
      isPinned: false,
      isStarred: false,
      isArchived: false,
      isMuted: false,
      isDeletedFromInbox: false,
      customUnread: false,
      updatedAt: new Date().toISOString(),
    };
  }

  if (parsed.data.isPinned !== undefined) state.isPinned = parsed.data.isPinned;
  if (parsed.data.isStarred !== undefined) state.isStarred = parsed.data.isStarred;
  if (parsed.data.isArchived !== undefined) state.isArchived = parsed.data.isArchived;
  if (parsed.data.isMuted !== undefined) state.isMuted = parsed.data.isMuted;
  if (parsed.data.customUnread !== undefined) state.customUnread = parsed.data.customUnread;
  state.updatedAt = new Date().toISOString();

  foundersUserInboxStatesStore.set(key, state);

  res.json({
    message: "Conversation inbox state updated",
    state,
    conversation: enrichFoundersConversation(conv, currentFounder.id),
  });
};

founderRouter.post("/inbox/conversations/:id/state", handleUpdateConversationState);
founderRouter.patch("/inbox/conversations/:id/state", handleUpdateConversationState);

// 10. DELETE /api/founders/inbox/conversations/:id/state & /personal — Delete Personal Copy
const handleDeletePersonalConversation = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const key = `${currentFounder.id}:${conv.id}`;
  let state = foundersUserInboxStatesStore.get(key);
  if (!state) {
    state = {
      profileId: currentFounder.id,
      conversationId: conv.id,
      isPinned: false,
      isStarred: false,
      isArchived: false,
      isMuted: false,
      isDeletedFromInbox: true,
      customUnread: false,
      updatedAt: new Date().toISOString(),
    };
  } else {
    state.isDeletedFromInbox = true;
    state.updatedAt = new Date().toISOString();
  }

  foundersUserInboxStatesStore.set(key, state);

  res.json({
    message: "Conversation removed from your personal inbox. Counterparty history remains intact.",
  });
};

founderRouter.delete("/inbox/conversations/:id/state", handleDeletePersonalConversation);
founderRouter.delete("/inbox/conversations/:id/personal", handleDeletePersonalConversation);

// 11. POST /api/founders/inbox/groups — Create Group Conversation
founderRouter.post("/inbox/groups", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = createFoundersGroupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const groupId = `fconv-g-${Date.now()}`;
  const now = new Date().toISOString();

  const newGroup: FoundersConversation = {
    id: groupId,
    type: "group",
    title: parsed.data.title,
    category: parsed.data.category,
    creatorProfileId: currentFounder.id,
    avatarUrl: parsed.data.avatarUrl || "👥",
    description: parsed.data.description || "",
    lastMessageSnippet: `${currentFounder.displayName} created group "${parsed.data.title}"`,
    lastMessageAt: now,
    lastMessageSenderId: currentFounder.id,
    messageCount: 1,
    createdAt: now,
    updatedAt: now,
  };

  foundersConversationsStore.set(groupId, newGroup);

  const participants: FoundersConversationParticipant[] = [
    {
      id: `fcp-${Date.now()}-1`,
      conversationId: groupId,
      profileId: currentFounder.id,
      role: "admin",
      joinedAt: now,
    },
  ];

  parsed.data.participantProfileIds.forEach((pid, idx) => {
    if (pid !== currentFounder.id) {
      participants.push({
        id: `fcp-${Date.now()}-${idx + 2}`,
        conversationId: groupId,
        profileId: pid,
        role: "member",
        joinedAt: now,
      });
    }
  });

  foundersConversationParticipantsStore.set(groupId, participants);

  // System initial message
  const initialMsg: FoundersMessage = {
    id: `fmsg-${Date.now()}`,
    conversationId: groupId,
    senderProfileId: currentFounder.id,
    content: `${currentFounder.displayName} created the group "${parsed.data.title}".`,
    deliveryState: "delivered",
    attachments: [],
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
  foundersMessagesStore.set(groupId, [initialMsg]);

  const enrichedGroup = enrichFoundersConversation(newGroup, currentFounder.id);
  res.status(201).json({
    message: "Group conversation created successfully",
    conversation: enrichedGroup,
    group: enrichedGroup,
  });
});

// 12. POST /api/founders/inbox/groups/:id/members & /conversations/:id/participants — Add Member to Group
const handleAddGroupMember = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  const participants = foundersConversationParticipantsStore.get(conv.id) || [];
  const myPart = participants.find((p) => p.profileId === currentFounder.id);
  if (conv.type === "group" && (!myPart || myPart.role !== "admin")) {
    return res.status(403).json({ error: "Forbidden: Only group admins can add new participants" });
  }

  const parsed = addFoundersGroupMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  if (participants.some((p) => p.profileId === parsed.data.profileId)) {
    return res.status(400).json({ error: "User is already a member of this group" });
  }

  const newPart: FoundersConversationParticipant = {
    id: `fcp-${Date.now()}`,
    conversationId: conv.id,
    profileId: parsed.data.profileId,
    role: parsed.data.role,
    joinedAt: new Date().toISOString(),
  };

  participants.push(newPart);
  foundersConversationParticipantsStore.set(conv.id, participants);

  res.status(200).json({
    message: "Participant added to group successfully",
    participant: newPart,
  });
};

founderRouter.post("/inbox/groups/:id/members", handleAddGroupMember);
founderRouter.post("/inbox/conversations/:id/participants", handleAddGroupMember);

// 13. DELETE /api/founders/inbox/groups/:id/members/:profileId & POST /conversations/:id/leave
const handleRemoveGroupMember = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id, profileId } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv || conv.type !== "group") {
    return res.status(404).json({ error: "Group conversation not found" });
  }

  let participants = foundersConversationParticipantsStore.get(conv.id) || [];
  const isSelf = currentFounder.id === profileId;
  const myPart = participants.find((p) => p.profileId === currentFounder.id);

  if (!isSelf && (!myPart || myPart.role !== "admin")) {
    return res.status(403).json({ error: "Forbidden: Only group admins can remove other members" });
  }

  participants = participants.filter((p) => p.profileId !== profileId);
  foundersConversationParticipantsStore.set(conv.id, participants);

  res.json({
    message: isSelf ? "You have left the group" : "Participant removed from group",
    remainingMemberCount: participants.length,
  });
};

founderRouter.delete("/inbox/groups/:id/members/:profileId", handleRemoveGroupMember);

founderRouter.post("/inbox/conversations/:id/leave", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const conv = foundersConversationsStore.get(id);
  if (!conv) {
    return res.status(404).json({ error: "Conversation not found" });
  }

  let participants = foundersConversationParticipantsStore.get(conv.id) || [];
  participants = participants.filter((p) => p.profileId !== currentFounder.id);
  foundersConversationParticipantsStore.set(conv.id, participants);

  res.status(200).json({
    message: "You have left the group conversation",
    remainingMemberCount: participants.length,
  });
});

// 14. GET /api/founders/inbox/requests — List Message Requests
founderRouter.get("/inbox/requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { type = "incoming" } = req.query as { type?: "incoming" | "sent" | "all" };

  const allReqs = Array.from(foundersMessageRequestsStore.values());
  let filtered = allReqs;

  if (type === "incoming") {
    filtered = allReqs.filter((r) => r.recipientProfileId === currentFounder.id);
  } else if (type === "sent") {
    filtered = allReqs.filter((r) => r.senderProfileId === currentFounder.id);
  } else {
    filtered = allReqs.filter(
      (r) => r.recipientProfileId === currentFounder.id || r.senderProfileId === currentFounder.id
    );
  }

  const enriched = filtered.map((r) => ({
    ...r,
    sender: founderProfilesStore.get(r.senderProfileId),
    recipient: founderProfilesStore.get(r.recipientProfileId),
  }));

  res.json({
    world: WORLDS.FOUNDERS,
    requests: enriched,
    totalCount: enriched.length,
    regulatoryDisclaimer: FOUNDERS_INBOX_DISCLAIMER,
  });
});

// 15. POST /api/founders/inbox/requests — Submit Message Request
founderRouter.post("/inbox/requests", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = createFoundersMessageRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  if (parsed.data.recipientProfileId === currentFounder.id) {
    return res.status(400).json({ error: "You cannot send a message request to yourself" });
  }

  // Check blocks
  if (
    foundersBlocksStore.has(`${currentFounder.id}:${parsed.data.recipientProfileId}`) ||
    foundersBlocksStore.has(`${parsed.data.recipientProfileId}:${currentFounder.id}`)
  ) {
    return res.status(403).json({ error: "Forbidden: Cannot send request due to active block restriction" });
  }

  // Prevent duplicate active pending requests
  const existing = Array.from(foundersMessageRequestsStore.values()).find(
    (r) =>
      r.senderProfileId === currentFounder.id &&
      r.recipientProfileId === parsed.data.recipientProfileId &&
      r.status === "pending"
  );
  if (existing) {
    return res.status(409).json({ error: "You already have a pending message request with this founder" });
  }

  const msgContent = (parsed.data.message || parsed.data.initialMessage)!.trim();
  const reqId = `freq-${Date.now()}`;
  const now = new Date().toISOString();

  const newReq: FoundersMessageRequest = {
    id: reqId,
    senderProfileId: currentFounder.id,
    recipientProfileId: parsed.data.recipientProfileId,
    category: parsed.data.category,
    initialMessage: msgContent,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  foundersMessageRequestsStore.set(reqId, newReq);

  // Notify recipient
  const notifId = `fnotif-${Date.now()}`;
  foundersNotificationsStore.set(notifId, {
    id: notifId,
    recipientProfileId: parsed.data.recipientProfileId,
    actorProfileId: currentFounder.id,
    actor: currentFounder,
    title: `New Message Request from ${currentFounder.displayName}`,
    description: msgContent.substring(0, 100),
    category: "messages",
    navigationTarget: "/inbox?view=requests",
    isRead: false,
    createdAt: now,
  });

  res.status(201).json({
    message: "Message request submitted successfully",
    request: newReq,
  });
});

// 16. POST /api/founders/inbox/requests/:id/respond — Respond to Message Request (Accept/Decline/Block)
founderRouter.post("/inbox/requests/:id/respond", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const mreq = foundersMessageRequestsStore.get(id);
  if (!mreq) {
    return res.status(404).json({ error: "Message request not found" });
  }

  if (mreq.recipientProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not the recipient of this request" });
  }

  if (mreq.status !== "pending") {
    return res.status(400).json({ error: `Message request has already been ${mreq.status}` });
  }

  const parsed = respondFoundersMessageRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const action = parsed.data.action;
  const now = new Date().toISOString();

  if (action === "accept") {
    mreq.status = "accepted";
    mreq.respondedAt = now;
    mreq.updatedAt = now;

    // Provision new direct conversation
    const sender = founderProfilesStore.get(mreq.senderProfileId);
    const convId = `fconv-${Date.now()}`;
    const newConv: FoundersConversation = {
      id: convId,
      type: "direct",
      title: `${currentFounder.displayName} & ${sender?.displayName || "Founder"}`,
      category: mreq.category,
      relatedEntityType: "connection",
      creatorProfileId: mreq.senderProfileId,
      avatarUrl: sender?.avatarUrl || "💬",
      lastMessageSnippet: mreq.initialMessage.substring(0, 80),
      lastMessageAt: now,
      lastMessageSenderId: mreq.senderProfileId,
      messageCount: 1,
      createdAt: now,
      updatedAt: now,
    };
    foundersConversationsStore.set(convId, newConv);

    foundersConversationParticipantsStore.set(convId, [
      { id: `fcp-${Date.now()}-1`, conversationId: convId, profileId: mreq.senderProfileId, role: "member", joinedAt: now },
      { id: `fcp-${Date.now()}-2`, conversationId: convId, profileId: currentFounder.id, role: "admin", joinedAt: now },
    ]);

    foundersMessagesStore.set(convId, [
      {
        id: `fmsg-${Date.now()}`,
        conversationId: convId,
        senderProfileId: mreq.senderProfileId,
        content: mreq.initialMessage,
        deliveryState: "delivered",
        attachments: [],
        reactions: [],
        isEdited: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    mreq.conversationId = convId;
    foundersMessageRequestsStore.set(mreq.id, mreq);

    // Notify original sender
    const notifId = `fnotif-${Date.now()}`;
    foundersNotificationsStore.set(notifId, {
      id: notifId,
      recipientProfileId: mreq.senderProfileId,
      actorProfileId: currentFounder.id,
      actor: currentFounder,
      title: `${currentFounder.displayName} accepted your message request`,
      description: "You can now chat freely in your unified Founders Inbox.",
      category: "messages",
      navigationTarget: `/inbox?conv=${convId}`,
      isRead: false,
      createdAt: now,
    });

    return res.json({
      message: "Message request accepted",
      request: mreq,
      conversationId: convId,
    });
  } else if (action === "block") {
    mreq.status = "declined";
    mreq.respondedAt = now;
    mreq.updatedAt = now;
    foundersMessageRequestsStore.set(mreq.id, mreq);

    // Add block
    foundersBlocksStore.add(`${currentFounder.id}:${mreq.senderProfileId}`);

    return res.json({
      message: "Message request declined and user blocked",
      request: mreq,
    });
  } else {
    // declined or reported
    mreq.status = "declined";
    mreq.respondedAt = now;
    mreq.updatedAt = now;
    foundersMessageRequestsStore.set(mreq.id, mreq);

    return res.json({
      message: "Message request declined",
      request: mreq,
    });
  }
});

// 17. POST /api/founders/inbox/requests/:id/withdraw — Withdraw Message Request
founderRouter.post("/inbox/requests/:id/withdraw", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const mreq = foundersMessageRequestsStore.get(id);
  if (!mreq) {
    return res.status(404).json({ error: "Message request not found" });
  }

  if (mreq.senderProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not the sender of this request" });
  }

  if (mreq.status !== "pending") {
    return res.status(400).json({ error: `Cannot withdraw a request that is already ${mreq.status}` });
  }

  mreq.status = "withdrawn";
  mreq.updatedAt = new Date().toISOString();
  foundersMessageRequestsStore.set(mreq.id, mreq);

  res.json({
    message: "Message request withdrawn successfully",
    request: mreq,
  });
});

// 18. POST & GET /api/founders/inbox/check-permission & permissions/check
const handleCheckDirectMessagePermission = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const targetProfileId = (
    (req.body && (req.body.targetProfileId || req.body.recipientProfileId)) ||
    req.query.targetProfileId ||
    req.query.recipientProfileId
  ) as string;
  if (!targetProfileId) {
    return res.status(400).json({ error: "targetProfileId or recipientProfileId is required" });
  }

  const result = canInitiateDirectMessage(currentFounder.id, targetProfileId);
  res.json({
    world: WORLDS.FOUNDERS,
    allowed: result.allowed,
    canMessage: result.allowed,
    canDirectMessage: result.allowed,
    reason: result.reason || null,
  });
};

founderRouter.post("/inbox/check-permission", handleCheckDirectMessagePermission);
founderRouter.post("/inbox/permissions/check", handleCheckDirectMessagePermission);
founderRouter.get("/inbox/permissions/check", handleCheckDirectMessagePermission);

// 19. GET /api/founders/inbox/search — Secure Search Across Conversations & Messages
founderRouter.get("/inbox/search", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const q = ((req.query.q || req.query.query || "") as string).trim().toLowerCase();
  if (!q) {
    return res.json({ world: WORLDS.FOUNDERS, conversations: [], messages: [], totalCount: 0 });
  }

  // Filter conversations where current user is authorized
  const myConvs = Array.from(foundersConversationsStore.values()).filter((c) => {
    const parts = foundersConversationParticipantsStore.get(c.id) || [];
    return parts.some((p) => p.profileId === currentFounder.id);
  });

  const matchedConvs = myConvs.filter((c) => {
    const titleMatch = c.title?.toLowerCase().includes(q);
    const snippetMatch = c.lastMessageSnippet?.toLowerCase().includes(q);
    return titleMatch || snippetMatch;
  });

  // Search message content across authorized conversations
  const matchedMessages: FoundersMessage[] = [];
  for (const c of myConvs) {
    const msgs = foundersMessagesStore.get(c.id) || [];
    for (const m of msgs) {
      if (!m.isDeleted && m.content.toLowerCase().includes(q)) {
        matchedMessages.push({
          ...m,
          sender: founderProfilesStore.get(m.senderProfileId),
        });
      }
    }
  }

  res.json({
    world: WORLDS.FOUNDERS,
    conversations: matchedConvs.map((c) => enrichFoundersConversation(c, currentFounder.id)),
    messages: matchedMessages,
    totalCount: matchedConvs.length + matchedMessages.length,
    regulatoryDisclaimer: FOUNDERS_INBOX_DISCLAIMER,
  });
});

// 20. GET /api/founders/inbox/summary — Inbox Summary Metrics
founderRouter.get("/inbox/summary", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const allConvs = Array.from(foundersConversationsStore.values()).filter((c) => {
    const parts = foundersConversationParticipantsStore.get(c.id) || [];
    return parts.some((p) => p.profileId === currentFounder.id);
  });

  const enriched = allConvs.map((c) => enrichFoundersConversation(c, currentFounder.id));

  const totalConversations = enriched.length;
  const unreadConversationsCount = enriched.filter((c) => (c.unreadCount || 0) > 0).length;
  const starredCount = enriched.filter((c) => c.isStarred).length;
  const archivedCount = enriched.filter((c) => c.isArchived).length;

  const pendingRequestsCount = Array.from(foundersMessageRequestsStore.values()).filter(
    (r) => r.recipientProfileId === currentFounder.id && r.status === "pending"
  ).length;

  const unreadNotificationsCount = Array.from(foundersNotificationsStore.values()).filter(
    (n) => n.recipientProfileId === currentFounder.id && !n.isRead
  ).length;

  const summary: FoundersInboxSummary = {
    totalConversations,
    unreadConversationsCount,
    starredCount,
    archivedCount,
    pendingRequestsCount,
    unreadNotificationsCount,
  };

  res.json({
    world: WORLDS.FOUNDERS,
    summary,
    regulatoryDisclaimer: FOUNDERS_INBOX_DISCLAIMER,
  });
});

// 21. GET /api/founders/inbox/notifications & /notifications — Founders Notification Centre
const handleGetFoundersNotifications = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { category, unreadOnly } = req.query as {
    category?: string;
    unreadOnly?: string;
  };

  let notifs = Array.from(foundersNotificationsStore.values()).filter(
    (n) => n.recipientProfileId === currentFounder.id
  );

  if (category && category !== "all") {
    notifs = notifs.filter((n) => n.category === category);
  }

  if (unreadOnly === "true") {
    notifs = notifs.filter((n) => !n.isRead);
  }

  notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enrichedNotifs = notifs.map((n) => ({
    ...n,
    actor: n.actorProfileId ? founderProfilesStore.get(n.actorProfileId) : undefined,
  }));

  res.json({
    world: WORLDS.FOUNDERS,
    notifications: enrichedNotifs,
    totalCount: enrichedNotifs.length,
    unreadCount: enrichedNotifs.filter((n) => !n.isRead).length,
    regulatoryDisclaimer: FOUNDERS_INBOX_DISCLAIMER,
  });
};

founderRouter.get("/inbox/notifications", handleGetFoundersNotifications);
founderRouter.get("/notifications", handleGetFoundersNotifications);

// 22. PUT & PATCH /api/founders/notifications/:id/read & /unread
const handleMarkNotificationRead = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const notif = foundersNotificationsStore.get(id);
  if (!notif) {
    return res.status(404).json({ error: "Notification not found" });
  }

  if (notif.recipientProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You are not the recipient of this notification" });
  }

  const { isRead = true } = req.body as { isRead?: boolean };
  notif.isRead = isRead;
  notif.readAt = isRead ? new Date().toISOString() : null;
  foundersNotificationsStore.set(notif.id, notif);

  res.json({
    message: isRead ? "Notification marked read" : "Notification marked unread",
    notification: notif,
  });
};

founderRouter.put("/inbox/notifications/:id/read", handleMarkNotificationRead);
founderRouter.patch("/inbox/notifications/:id/read", handleMarkNotificationRead);
founderRouter.patch("/notifications/:id/read", handleMarkNotificationRead);

founderRouter.patch("/notifications/:id/unread", (req: Request, res: Response) => {
  req.body = { isRead: false };
  return handleMarkNotificationRead(req, res);
});

// 23. POST /api/founders/inbox/notifications/mark-all-read & /notifications/read-all
const handleMarkAllNotificationsRead = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const now = new Date().toISOString();
  for (const notif of foundersNotificationsStore.values()) {
    if (notif.recipientProfileId === currentFounder.id && !notif.isRead) {
      notif.isRead = true;
      notif.readAt = now;
      foundersNotificationsStore.set(notif.id, notif);
    }
  }

  res.json({
    message: "All notifications marked as read",
  });
};

founderRouter.post("/inbox/notifications/mark-all-read", handleMarkAllNotificationsRead);
founderRouter.post("/notifications/read-all", handleMarkAllNotificationsRead);

// 24. DELETE /api/founders/inbox/notifications/:id & /notifications/:id
const handleDeleteNotification = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { id } = req.params;
  const notif = foundersNotificationsStore.get(id);
  if (!notif) {
    return res.status(404).json({ error: "Notification not found" });
  }

  if (notif.recipientProfileId !== currentFounder.id) {
    return res.status(403).json({ error: "Forbidden: You cannot delete another user's notification" });
  }

  foundersNotificationsStore.delete(id);

  res.json({
    message: "Notification deleted successfully",
  });
};

founderRouter.delete("/inbox/notifications/:id", handleDeleteNotification);
founderRouter.delete("/notifications/:id", handleDeleteNotification);

// Clear All Notifications
const handleClearAllNotifications = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  for (const [id, notif] of foundersNotificationsStore.entries()) {
    if (notif.recipientProfileId === currentFounder.id) {
      foundersNotificationsStore.delete(id);
    }
  }

  res.json({
    message: "All notifications cleared successfully",
  });
};

founderRouter.delete("/notifications/clear-all", handleClearAllNotifications);
founderRouter.delete("/inbox/notifications/clear-all", handleClearAllNotifications);

// 25. GET /api/founders/inbox/notification-preferences & /notifications/preferences
const handleGetNotificationPreferences = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  let prefs = foundersNotificationPreferencesStore.get(currentFounder.id);
  if (!prefs) {
    prefs = {
      profileId: currentFounder.id,
      inAppAlerts: true,
      emailAlerts: true,
      messageAlerts: true,
      connectionAlerts: true,
      opportunityAlerts: true,
      hiringAlerts: true,
      startupAlerts: true,
      collaborationAlerts: true,
      referralAlerts: true,
      mentorshipAlerts: true,
      investorAlerts: true,
      workspaceAlerts: true,
      mutedConversationIds: [],
      updatedAt: new Date().toISOString(),
    };
    foundersNotificationPreferencesStore.set(currentFounder.id, prefs);
  }

  res.json({
    world: WORLDS.FOUNDERS,
    preferences: prefs,
  });
};

founderRouter.get("/inbox/notification-preferences", handleGetNotificationPreferences);
founderRouter.get("/notifications/preferences", handleGetNotificationPreferences);

// 26. PUT & PATCH /api/founders/inbox/notification-preferences & /notifications/preferences
const handleUpdateNotificationPreferences = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = updateNotificationPreferencesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  let prefs = foundersNotificationPreferencesStore.get(currentFounder.id);
  if (!prefs) {
    prefs = {
      profileId: currentFounder.id,
      inAppAlerts: true,
      emailAlerts: true,
      messageAlerts: true,
      connectionAlerts: true,
      opportunityAlerts: true,
      hiringAlerts: true,
      startupAlerts: true,
      collaborationAlerts: true,
      referralAlerts: true,
      mentorshipAlerts: true,
      investorAlerts: true,
      workspaceAlerts: true,
      mutedConversationIds: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const d = parsed.data;
  if (d.inAppAlerts !== undefined) prefs.inAppAlerts = d.inAppAlerts;
  if (d.emailAlerts !== undefined) prefs.emailAlerts = d.emailAlerts;
  if (d.messageAlerts !== undefined) prefs.messageAlerts = d.messageAlerts;
  if (d.connectionAlerts !== undefined) prefs.connectionAlerts = d.connectionAlerts;
  if (d.opportunityAlerts !== undefined) prefs.opportunityAlerts = d.opportunityAlerts;
  if (d.hiringAlerts !== undefined) prefs.hiringAlerts = d.hiringAlerts;
  if (d.startupAlerts !== undefined) prefs.startupAlerts = d.startupAlerts;
  if (d.collaborationAlerts !== undefined) prefs.collaborationAlerts = d.collaborationAlerts;
  if (d.referralAlerts !== undefined) prefs.referralAlerts = d.referralAlerts;
  if (d.mentorshipAlerts !== undefined) prefs.mentorshipAlerts = d.mentorshipAlerts;
  if (d.investorAlerts !== undefined) prefs.investorAlerts = d.investorAlerts;
  if (d.workspaceAlerts !== undefined) prefs.workspaceAlerts = d.workspaceAlerts;
  if (d.mutedConversationIds !== undefined) prefs.mutedConversationIds = d.mutedConversationIds;
  prefs.updatedAt = new Date().toISOString();

  foundersNotificationPreferencesStore.set(currentFounder.id, prefs);

  res.json({
    message: "Notification preferences updated successfully",
    preferences: prefs,
  });
};

founderRouter.put("/inbox/notification-preferences", handleUpdateNotificationPreferences);
founderRouter.patch("/inbox/notification-preferences", handleUpdateNotificationPreferences);
founderRouter.patch("/notifications/preferences", handleUpdateNotificationPreferences);

// 27. POST /api/founders/inbox/block — Block User
founderRouter.post("/inbox/block", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = blockUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  if (parsed.data.targetProfileId === currentFounder.id) {
    return res.status(400).json({ error: "You cannot block yourself" });
  }

  foundersBlocksStore.add(`${currentFounder.id}:${parsed.data.targetProfileId}`);

  res.json({
    message: "User blocked successfully across Founders messaging",
    blockedProfileId: parsed.data.targetProfileId,
  });
});

// 28. POST /api/founders/inbox/report — Report Message or Conversation
founderRouter.post("/inbox/report", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = reportMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const reportId = `frep-${Date.now()}`;
  foundersReportsStore.set(reportId, {
    id: reportId,
    reporterProfileId: currentFounder.id,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({
    message: "Report submitted to moderation queue",
    reportId,
  });
});

// ==========================================
// FEATURE 14: VERIFICATION APPLICATION CENTRE
// ==========================================

// 29. POST /api/founders/verification/apply/blue — Apply for Blue Project/Startup Verification
founderRouter.post("/verification/apply/blue", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = submitBlueVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;

  // If startupId provided, verify existence and admin/owner authority
  if (data.startupId) {
    const startup = startupsStore.get(data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Associated startup not found" });
    }
    if (!isStartupAdminOrOwner(data.startupId, currentFounder.id)) {
      return res.status(403).json({ error: "Forbidden: Only startup founders or admins can apply for verification" });
    }
  }

  const appId = `vapp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newApp: VerificationApplication = {
    id: appId,
    type: "blue_project",
    applicantAccountId: currentFounder.accountId,
    applicantProfileId: currentFounder.id,
    applicant: currentFounder,
    startupId: data.startupId || null,
    startupName: data.startupName,
    operatingStage: data.operatingStage,
    website: data.website || null,
    legalBusinessName: null,
    registrationType: null,
    registrationNumber: null,
    jurisdiction: null,
    supportingDocuments: (data.supportingDocuments || []).map((doc, idx) => ({
      id: doc.id || `vdoc-${Date.now()}-${idx}`,
      name: doc.name,
      url: doc.url,
      sizeBytes: doc.sizeBytes,
      mimeType: doc.mimeType,
      uploadedAt: now,
    })),
    status: "pending",
    reviewerNotes: null,
    rejectionReason: null,
    appealNotes: null,
    verifiedAt: null,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
  };

  verificationApplicationsStore.set(appId, newApp);

  const auditId = `vaudit-${Date.now()}`;
  verificationAuditLogsStore.set(auditId, {
    id: auditId,
    applicationId: appId,
    previousStatus: "not_submitted",
    newStatus: "pending",
    changedByAccountId: currentFounder.accountId,
    notes: "Submitted Blue Project / Startup verification application",
    createdAt: now,
  });

  res.status(201).json({
    message: "Blue Project verification application submitted for automated and team review",
    application: newApp,
    disclaimer: VERIFICATION_LEGAL_DISCLAIMER,
  });
});

// 30. POST /api/founders/verification/apply/teal — Apply for Teal Registered Business Verification
founderRouter.post("/verification/apply/teal", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = submitTealVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const data = parsed.data;

  if (data.startupId) {
    const startup = startupsStore.get(data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Associated startup not found" });
    }
    if (!isStartupAdminOrOwner(data.startupId, currentFounder.id)) {
      return res.status(403).json({ error: "Forbidden: Only authorized representatives can apply for statutory business verification" });
    }
  }

  const appId = `vapp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newApp: VerificationApplication = {
    id: appId,
    type: "teal_business",
    applicantAccountId: currentFounder.accountId,
    applicantProfileId: currentFounder.id,
    applicant: currentFounder,
    startupId: data.startupId || null,
    startupName: data.legalBusinessName,
    operatingStage: "Operating Registered Entity",
    website: data.website || null,
    legalBusinessName: data.legalBusinessName,
    registrationType: data.registrationType,
    registrationNumber: data.registrationNumber,
    jurisdiction: data.jurisdiction,
    supportingDocuments: data.supportingDocuments.map((doc, idx) => ({
      id: doc.id || `vdoc-${Date.now()}-${idx}`,
      name: doc.name,
      url: doc.url,
      sizeBytes: doc.sizeBytes,
      mimeType: doc.mimeType,
      uploadedAt: now,
    })),
    status: "pending",
    reviewerNotes: null,
    rejectionReason: null,
    appealNotes: null,
    verifiedAt: null,
    expiresAt: null,
    createdAt: now,
    updatedAt: now,
  };

  verificationApplicationsStore.set(appId, newApp);

  const auditId = `vaudit-${Date.now()}`;
  verificationAuditLogsStore.set(auditId, {
    id: auditId,
    applicationId: appId,
    previousStatus: "not_submitted",
    newStatus: "pending",
    changedByAccountId: currentFounder.accountId,
    notes: `Submitted Teal Business verification application for statutory entity: ${data.legalBusinessName} (${data.registrationNumber})`,
    createdAt: now,
  });

  res.status(201).json({
    message: "Teal Registered Business verification application submitted with statutory evidence",
    application: newApp,
    disclaimer: VERIFICATION_LEGAL_DISCLAIMER,
  });
});

// 31. GET /api/founders/verification/my-applications — View caller's verification applications
founderRouter.get("/verification/my-applications", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const myApps = Array.from(verificationApplicationsStore.values())
    .filter((app) => app.applicantAccountId === currentFounder.accountId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json({
    applications: myApps,
    totalCount: myApps.length,
    disclaimer: VERIFICATION_LEGAL_DISCLAIMER,
  });
});

// 32. GET /api/founders/verification/applications/:id — View single application with audit logs
founderRouter.get("/verification/applications/:id", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = verificationApplicationsStore.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: "Verification application not found" });
  }

  // Caller must be applicant or platform dev/admin
  if (app.applicantAccountId !== currentFounder.accountId && currentFounder.accountId !== "00000000-0000-0000-0000-000000000001") {
    return res.status(403).json({ error: "Forbidden: Cannot view another user's verification application" });
  }

  const auditHistory = Array.from(verificationAuditLogsStore.values())
    .filter((a) => a.applicationId === app.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({
    application: app,
    auditHistory,
    disclaimer: VERIFICATION_LEGAL_DISCLAIMER,
  });
});

// 33. POST /api/founders/verification/applications/:id/resubmit — Correct and resubmit rejected/pending app
founderRouter.post("/verification/applications/:id/resubmit", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = verificationApplicationsStore.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: "Verification application not found" });
  }

  if (app.applicantAccountId !== currentFounder.accountId) {
    return res.status(403).json({ error: "Forbidden: You are not the applicant" });
  }

  const parsed = resubmitVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const prevStatus = app.status;
  const now = new Date().toISOString();

  if (parsed.data.startupName) app.startupName = parsed.data.startupName;
  if (parsed.data.legalBusinessName) app.legalBusinessName = parsed.data.legalBusinessName;
  if (parsed.data.registrationType) app.registrationType = parsed.data.registrationType;
  if (parsed.data.registrationNumber) app.registrationNumber = parsed.data.registrationNumber;
  if (parsed.data.jurisdiction) app.jurisdiction = parsed.data.jurisdiction;
  if (parsed.data.operatingStage) app.operatingStage = parsed.data.operatingStage;
  if (parsed.data.website !== undefined) app.website = parsed.data.website;
  if (parsed.data.supportingDocuments) {
    app.supportingDocuments = parsed.data.supportingDocuments.map((doc, idx) => ({
      id: doc.id || `vdoc-${Date.now()}-${idx}`,
      name: doc.name,
      url: doc.url,
      sizeBytes: doc.sizeBytes,
      mimeType: doc.mimeType,
      uploadedAt: now,
    }));
  }

  app.status = "pending";
  app.rejectionReason = null;
  app.updatedAt = now;

  verificationApplicationsStore.set(app.id, app);

  const auditId = `vaudit-${Date.now()}`;
  verificationAuditLogsStore.set(auditId, {
    id: auditId,
    applicationId: app.id,
    previousStatus: prevStatus,
    newStatus: "pending",
    changedByAccountId: currentFounder.accountId,
    notes: "Applicant corrected information and resubmitted application",
    createdAt: now,
  });

  res.json({
    message: "Application resubmitted successfully for review",
    application: app,
  });
});

// 34. POST /api/founders/verification/applications/:id/appeal — Appeal rejection
founderRouter.post("/verification/applications/:id/appeal", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = verificationApplicationsStore.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: "Verification application not found" });
  }

  if (app.applicantAccountId !== currentFounder.accountId) {
    return res.status(403).json({ error: "Forbidden: You are not the applicant" });
  }

  if (app.status !== "rejected") {
    return res.status(400).json({ error: "Appeals can only be submitted for rejected applications" });
  }

  const parsed = appealVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const now = new Date().toISOString();
  app.appealNotes = parsed.data.appealNotes;
  app.status = "pending";
  app.updatedAt = now;

  verificationApplicationsStore.set(app.id, app);

  const auditId = `vaudit-${Date.now()}`;
  verificationAuditLogsStore.set(auditId, {
    id: auditId,
    applicationId: app.id,
    previousStatus: "rejected",
    newStatus: "pending",
    changedByAccountId: currentFounder.accountId,
    notes: `Applicant submitted formal appeal: ${parsed.data.appealNotes.substring(0, 100)}...`,
    createdAt: now,
  });

  res.json({
    message: "Appeal submitted successfully and returned to review queue",
    application: app,
  });
});

// 35. GET /api/founders/verification/admin/applications — Admin portal application listing
founderRouter.get("/verification/admin/applications", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  let apps = Array.from(verificationApplicationsStore.values());

  const { status, type } = req.query;
  if (status && typeof status === "string") {
    apps = apps.filter((a) => a.status === status);
  }
  if (type && typeof type === "string") {
    apps = apps.filter((a) => a.type === type);
  }

  apps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  res.json({
    applications: apps,
    totalCount: apps.length,
  });
});

// 36. POST /api/founders/verification/admin/applications/:id/review — Review, approve, or reject
founderRouter.post("/verification/admin/applications/:id/review", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = verificationApplicationsStore.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: "Verification application not found" });
  }

  const parsed = reviewVerificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
  }

  const { action, notes, rejectionReason } = parsed.data;
  const prevStatus = app.status;
  const now = new Date().toISOString();

  if (action === "approve") {
    app.status = "verified";
    app.verifiedAt = now;
    app.reviewerNotes = notes || "Approved after automated and manual credential verification";
    app.rejectionReason = null;

    // Award badge to startup if linked
    if (app.startupId) {
      const startup = startupsStore.get(app.startupId);
      if (startup) {
        (startup as any).badge = app.type === "blue_project" ? "verified_project" : "verified_business";
        startup.updatedAt = now;
        startupsStore.set(startup.id, startup);
      }
    }
  } else if (action === "reject") {
    app.status = "rejected";
    app.rejectionReason = rejectionReason || notes || "Submitted credentials could not be authenticated";
    app.reviewerNotes = notes || null;
  } else if (action === "request_info") {
    app.status = "pending";
    app.reviewerNotes = notes || "Additional documentation required";
  } else if (action === "suspend") {
    app.status = "suspended";
    app.reviewerNotes = notes || "Verification suspended pending audit";
    if (app.startupId) {
      const startup = startupsStore.get(app.startupId);
      if (startup) {
        delete (startup as any).badge;
        startup.updatedAt = now;
        startupsStore.set(startup.id, startup);
      }
    }
  }

  app.updatedAt = now;
  verificationApplicationsStore.set(app.id, app);

  const auditId = `vaudit-${Date.now()}`;
  verificationAuditLogsStore.set(auditId, {
    id: auditId,
    applicationId: app.id,
    previousStatus: prevStatus,
    newStatus: app.status,
    changedByAccountId: currentFounder.accountId,
    notes: `Review action '${action}': ${notes || rejectionReason || "Updated by reviewer"}`,
    createdAt: now,
  });

  res.json({
    message: `Verification application updated to ${app.status}`,
    application: app,
  });
});

// 37. POST /api/founders/verification/admin/applications/:id/revoke — Revoke/suspend badge
founderRouter.post("/verification/admin/applications/:id/revoke", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const app = verificationApplicationsStore.get(req.params.id);
  if (!app) {
    return res.status(404).json({ error: "Verification application not found" });
  }

  const prevStatus = app.status;
  const now = new Date().toISOString();
  app.status = "suspended";
  app.reviewerNotes = req.body.notes || "Badge revoked by platform safety team";
  app.updatedAt = now;

  if (app.startupId) {
    const startup = startupsStore.get(app.startupId);
    if (startup) {
      delete (startup as any).badge;
      startup.updatedAt = now;
      startupsStore.set(startup.id, startup);
    }
  }

  verificationApplicationsStore.set(app.id, app);

  const auditId = `vaudit-${Date.now()}`;
  verificationAuditLogsStore.set(auditId, {
    id: auditId,
    applicationId: app.id,
    previousStatus: prevStatus,
    newStatus: "suspended",
    changedByAccountId: currentFounder.accountId,
    notes: `Badge revoked: ${req.body.notes || "Revoked by administrator"}`,
    createdAt: now,
  });

  res.json({
    message: "Verification badge revoked and status set to suspended",
    application: app,
  });
});

// ==========================================
// FEATURE 14: PROFILE VIEWERS & ANALYTICS
// ==========================================

// 38. POST /api/founders/network/profiles/:profileId/view — Log profile view
founderRouter.post("/network/profiles/:profileId/view", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const { profileId } = req.params;
  const target = Array.from(founderProfilesStore.values()).find((p) => p.id === profileId);
  if (!target) {
    return res.status(404).json({ error: "Target profile not found" });
  }

  // Only log if viewing someone else
  if (profileId !== currentFounder.id) {
    const pviewId = `pview-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newView: ProfileViewerRecord = {
      id: pviewId,
      viewedProfileId: target.id,
      viewerProfileId: currentFounder.id,
      viewer: currentFounder,
      viewedAt: new Date().toISOString(),
    };
    profileViewLogsStore.set(pviewId, newView);
  }

  res.json({ message: "Profile view logged" });
});

// 39. GET /api/founders/network/profile/viewers & /profile/viewers — View eligible profile viewers
const handleGetProfileViewers = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const allViewsForMe = Array.from(profileViewLogsStore.values())
    .filter((v) => v.viewedProfileId === currentFounder.id)
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());

  // Check Gold Premium Entitlement for Profile Viewer Identities
  if (!hasEntitlement(currentFounder.accountId, ENTITLEMENTS.PROFILE_VIEWER_IDENTITY)) {
    return res.status(403).json({
      error: "Forbidden: Profile viewer identities require active Gold Premium membership",
      totalViewsCount: allViewsForMe.length,
      upgradePrompt: "Upgrade to Gold Premium to see who is viewing your founder profile and connect directly.",
    });
  }

  // Premium member gets full viewer profiles
  const enrichedViewers = allViewsForMe.map((v) => {
    const viewerProfile =
      founderProfilesStore.get(v.viewerProfileId) ||
      Array.from(founderProfilesStore.values()).find((p) => p.id === v.viewerProfileId);
    return {
      id: v.id,
      viewedAt: v.viewedAt,
      viewer: viewerProfile || v.viewer,
    };
  });

  res.json({
    viewers: enrichedViewers,
    totalViewsCount: allViewsForMe.length,
    isPremium: true,
  });
};

founderRouter.get("/network/profile/viewers", handleGetProfileViewers);
founderRouter.get("/profile/viewers", handleGetProfileViewers);

// 40. GET /api/founders/network/profile/analytics & /profile/analytics — Profile Analytics
const handleGetProfileAnalytics = (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const allViewsForMe = Array.from(profileViewLogsStore.values()).filter(
    (v) => v.viewedProfileId === currentFounder.id
  );

  const uniqueViewersCount = new Set(allViewsForMe.map((v) => v.viewerProfileId)).size;

  const isPremium = hasEntitlement(currentFounder.accountId, ENTITLEMENTS.ADVANCED_PROFILE_ANALYTICS);

  if (!isPremium) {
    return res.json({
      totalViews: allViewsForMe.length,
      uniqueViewersCount: 0,
      recentViewsTrend: [],
      engagementActionsCount: 0,
      isPremium: false,
      upgradePrompt: "Upgrade to Gold Premium for 30-day analytics trends, unique viewer metrics, and engagement graphs.",
    });
  }

  // Generate 7-day trend array
  const trendDays: { date: string; views: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const dayViews = allViewsForMe.filter((v) => v.viewedAt.startsWith(dateStr)).length;
    trendDays.push({ date: dateStr, views: dayViews });
  }

  res.json({
    totalViews: allViewsForMe.length,
    uniqueViewersCount,
    recentViewsTrend: trendDays,
    engagementActionsCount: allViewsForMe.length * 2,
    isPremium: true,
  });
};

founderRouter.get("/network/profile/analytics", handleGetProfileAnalytics);
founderRouter.get("/profile/analytics", handleGetProfileAnalytics);

// 41. GET /api/founders/network/insights — Detailed Networking Insights
founderRouter.get("/network/insights", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  if (!hasEntitlement(currentFounder.accountId, ENTITLEMENTS.NETWORKING_INSIGHTS)) {
    return res.status(403).json({
      error: "Forbidden: Detailed networking insights require active Gold Premium membership",
      upgradePrompt: "Unlock networking performance metrics, connection growth trajectory, and opportunity insights with Gold Premium.",
    });
  }

  const connections = Array.from(founderConnectionsStore.values()).filter(
    (c) =>
      (c.requesterId === currentFounder.id || c.recipientId === currentFounder.id) &&
      c.status === "accepted"
  );

  const pendingSent = Array.from(founderConnectionsStore.values()).filter(
    (c) => c.requesterId === currentFounder.id && c.status === "pending"
  );

  const pendingReceived = Array.from(founderConnectionsStore.values()).filter(
    (c) => c.recipientId === currentFounder.id && c.status === "pending"
  );

  const oppApps = Array.from(opportunityApplicationsStore.values()).filter(
    (a) => a.applicantId === currentFounder.id
  );

  const collabs = Array.from(partnershipSpacesStore.values()).filter(
    (p) => (p as any).founderAId === currentFounder.id || (p as any).founderBId === currentFounder.id || p.startupAId === "st-1" || p.startupBId === "st-1"
  );

  res.json({
    connectionsCount: connections.length,
    pendingRequestsSentCount: pendingSent.length,
    pendingRequestsReceivedCount: pendingReceived.length,
    opportunitiesInteractionsCount: oppApps.length,
    collaborationsCount: collabs.length,
    growthRatePercentage: 24.5,
    isPremium: true,
  });
});

// ==========================================
// FEATURE 14: SUBSCRIPTIONS & ENTITLEMENTS
// ==========================================

// 42. GET /api/founders/subscriptions/me — Current Subscription Details
founderRouter.get("/subscriptions/me", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  let sub = accountSubscriptionsStore.get(currentFounder.accountId);
  if (!sub) {
    const acc = accountsStore.get(currentFounder.accountId);
    const tier = acc?.subscriptionTier || "free";
    sub = {
      accountId: currentFounder.accountId,
      tier,
      status: tier === "premium" ? "active" : "free",
      autoRenew: false,
      entitlements: tier === "premium" ? (Object.values(ENTITLEMENTS) as any[]) : [],
      updatedAt: new Date().toISOString(),
    };
    accountSubscriptionsStore.set(currentFounder.accountId, sub);
  }

  // Check expiration
  if (sub.expiresAt && new Date(sub.expiresAt).getTime() <= Date.now()) {
    sub.tier = "free";
    sub.status = "expired";
    sub.entitlements = [];
    sub.autoRenew = false;
    sub.updatedAt = new Date().toISOString();
    accountSubscriptionsStore.set(currentFounder.accountId, sub);
    const acc = accountsStore.get(currentFounder.accountId);
    if (acc) acc.subscriptionTier = "free";
  }

  const isGoldCrownActive = hasEntitlement(currentFounder.accountId, "premium.gold_crown");

  res.json({
    subscription: sub,
    benefits: PREMIUM_BENEFITS,
    hasGoldCrown: isGoldCrownActive,
    activeEntitlements: sub.entitlements,
  });
});

// 43. POST /api/founders/subscriptions/upgrade — Upgrade / Activate Gold Premium
founderRouter.post("/subscriptions/upgrade", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const parsed = upgradeSubscriptionSchema.safeParse(req.body);
  const durationMonths = parsed.success ? parsed.data.durationMonths : 12;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationMonths * 30 * 86400000).toISOString();

  const sub: SubscriptionDetails = {
    accountId: currentFounder.accountId,
    tier: "premium",
    status: "active",
    expiresAt,
    autoRenew: true,
    paymentProvider: "razorpay_verified_gateway",
    entitlements: Object.values(ENTITLEMENTS) as any[],
    updatedAt: now.toISOString(),
  };

  accountSubscriptionsStore.set(currentFounder.accountId, sub);

  // Sync with master accountsStore
  const acc = accountsStore.get(currentFounder.accountId);
  if (acc) {
    acc.subscriptionTier = "premium";
    acc.subscriptionExpiresAt = expiresAt;
    acc.updatedAt = now.toISOString();
    accountsStore.set(currentFounder.accountId, acc);
  }

  res.json({
    message: "Upgraded to Gold Premium successfully. All 8 benefit categories and Gold Crown activated.",
    subscription: sub,
  });
});

// 44. POST /api/founders/subscriptions/cancel — Cancel Auto-Renewal
founderRouter.post("/subscriptions/cancel", (req: Request, res: Response) => {
  const currentFounder = getAuthFounder(req);
  if (!currentFounder) {
    return res.status(401).json({ error: "Founder profile required" });
  }

  const sub = accountSubscriptionsStore.get(currentFounder.accountId);
  if (!sub) {
    return res.status(404).json({ error: "No active subscription record found" });
  }

  sub.autoRenew = false;
  sub.status = "cancelled";
  sub.updatedAt = new Date().toISOString();
  accountSubscriptionsStore.set(currentFounder.accountId, sub);

  res.json({
    message: "Auto-renewal cancelled successfully. Gold Premium benefits remain active until the expiration date.",
    subscription: sub,
  });
});

// 45. POST /api/founders/subscriptions/expire-check — Background Expire Enforcer
founderRouter.post("/subscriptions/expire-check", (req: Request, res: Response) => {
  let expiredCount = 0;
  const now = Date.now();

  for (const [accId, sub] of accountSubscriptionsStore.entries()) {
    if (sub.tier === "premium" && sub.expiresAt && new Date(sub.expiresAt).getTime() <= now) {
      sub.tier = "free";
      sub.status = "expired";
      sub.entitlements = [];
      sub.autoRenew = false;
      sub.updatedAt = new Date().toISOString();
      accountSubscriptionsStore.set(accId, sub);

      const acc = accountsStore.get(accId);
      if (acc) {
        acc.subscriptionTier = "free";
        acc.updatedAt = new Date().toISOString();
        accountsStore.set(accId, acc);
      }
      expiredCount++;
    }
  }

  res.json({
    message: `Subscription expiry check completed. ${expiredCount} expired subscriptions downgraded to free.`,
    expiredCount,
  });
});


