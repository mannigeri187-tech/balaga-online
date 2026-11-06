import {
  SocialProfile,
  FounderProfile,
  Account,
  SocialPost,
  SocialReaction,
  SocialComment,
  SocialConnection,
  SocialStory,
  SocialReel,
  SocialReelComment,
  SocialCommunity,
  SocialCommunityMember,
  SocialCommunityPost,
  SocialEvent,
  SocialEventRsvp,
  SocialConversation,
  SocialMessage,
  SocialNotification,
  SocialReport,
  Startup,
  StartupMember,
  Product,
  Opportunity,
  OpportunityApplication,
  OpportunityCategory,
  OpportunityCompensation,
  OpportunityStatus,
  OpportunityApplicationStatus,
  CollaborationRequest,
  PartnershipSpace,
  FounderPost,
  FounderComment,
  FounderReport,
  FounderPostType,
  FounderAudience,
  FounderConnection,
  CofounderRequest,
  FounderProfileView,
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
  StartupRole,
  StartupInvitation,
  OwnershipTransferRequest,
  StartupUpdate,
  StartupUpdateType,
  StartupAnalytics,
  StartupFollow,
  StartupConnection,
  StartupActivityLog,
  StartupInvestInquiry,
  StartupVisibilitySettings,
  StartupStage,
  ProductCategory,
  ProductStatus,
  ProductPricingModel,
  ProductModerationStatus,
  ProductUpvote,
  ProductComment,
  ProductCommentLike,
  ProductReview,
  ProductUpdate,
  ProductFollow,
  ProductSave,
  ProductCollection,
  ProductModerationRecord,
  ProductModerationAppeal,
  MakerAnalytics,
  StartupCollaborationProfile,
  StartupOutreachAllowance,
  CounterProposalRecord,
  PartnershipMessage,
  PartnershipTask,
  PartnershipMilestone,
  PartnershipDocument,
  PartnershipMeeting,
  PartnershipActivityLog,
  PartnershipReferral,
  PartnershipCommission,
  PartnershipReview,
  PartnershipDispute,
  PartnershipAnalytics,
  ReferralListing,
  ReferralRequest,
  ReferralCommissionVersion,
  ReferralCommissionAgreement,
  ReferralPipelineRecord,
  ReferralExchangeAnalytics,
  ReferralReport,
  MentorProfile,
  MentorshipAgreement,
  MentorshipAgreementVersion,
  MentorshipRequest,
  MentorshipSession,
  MentorshipGoal,
  MentorshipActionItem,
  MentorshipResource,
  MentorshipWorkspace,
  MentorshipReview,
  MentorDashboardStats,
  MenteeDashboardStats,
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
  FoundersConversationAttachment,
  FoundersMessage,
  FoundersMessageReaction,
  FoundersMessageRequest,
  FoundersUserInboxState,
  FoundersNotification,
  FoundersNotificationPreferences,
  FoundersInboxSummary,
  VerificationDocument,
  VerificationApplication,
  VerificationAuditRecord,
  SubscriptionDetails,
  ProfileViewerRecord,
  ProfileAnalyticsData,
  NetworkingInsightsData,
} from "@platform/shared-types";

import {
  WORLDS,
  WorldType,
  COLLABORATION_TYPES,
  CollaborationType,
  REFERRAL_LISTING_TYPES,
  ReferralListingType,
  REFERRAL_ARRANGEMENTS,
  ReferralArrangement,
  COMMISSION_DISCLOSURE_CHOICES,
  CommissionDisclosureChoice,
  REFERRAL_PIPELINE_STAGES,
  ReferralPipelineStage,
  REFERRAL_PAYMENT_STATUSES,
  ReferralPaymentStatus,
  MENTOR_EXPERTISE_CATEGORIES,
  MentorExpertiseCategory,
  MENTORSHIP_FORMATS,
  MentorshipFormat,
  MENTORSHIP_MEETING_ARRANGEMENTS,
  MentorshipMeetingArrangement,
  MENTORSHIP_PRICING_OPTIONS,
  MentorshipPricingOption,
  MENTORSHIP_REQUEST_STATUSES,
  MentorshipRequestStatus,
  MENTORSHIP_SESSION_STATUSES,
  MentorshipSessionStatus,
  MENTORSHIP_PAYMENT_STATUSES,
  MentorshipPaymentStatus,
  INVESTOR_TYPES,
  InvestorType,
  INVESTOR_PROFILE_STATUSES,
  InvestorProfileStatus,
  INVESTOR_VERIFICATION_STATUSES,
  InvestorVerificationStatus,
  INVESTMENT_INDUSTRIES,
  InvestmentIndustry,
  STARTUP_FUNDRAISING_STATUSES,
  StartupFundraisingStatus,
  FUNDRAISING_PRIVACY_LEVELS,
  FundraisingPrivacyLevel,
  INVESTOR_INTRO_REQUEST_STATUSES,
  InvestorIntroRequestStatus,
  INVESTOR_INTEREST_STATUSES,
  InvestorInterestStatus,
  INVESTOR_MEETING_STATUSES,
  InvestorMeetingStatus,
  BUILD_SPACES_REGULATORY_DISCLAIMER,
  BuildSpaceType,
  BuildSpaceCategory,
  BuildSpaceStage,
  BuildSpaceVisibility,
  BuildSpaceStatus,
  BuildSpaceRole,
  BuildSpaceJoinRequestStatus,
  BuildSpaceInvitationStatus,
  BuildSpaceTaskStatus,
  BuildSpaceTaskPriority,
  BuildSpaceMilestoneStatus,
  BuildSpaceMeetingStatus,
  FoundersInboxCategory,
  FoundersInboxView,
  FoundersMessageDeliveryState,
  FoundersMessageRequestStatus,
  FoundersNotificationCategory,
  FOUNDERS_INBOX_DISCLAIMER,
  VERIFICATION_TYPES,
  VerificationType,
  VERIFICATION_STATUSES,
  VerificationStatus,
  SUBSCRIPTION_TIERS,
  SubscriptionTier,
  SUBSCRIPTION_STATUSES,
  SubscriptionStatus,
  ENTITLEMENTS,
  EntitlementKey,
  PREMIUM_BENEFITS,
  MAX_CONNECTION_NOTE_LENGTH,
  VERIFICATION_LEGAL_DISCLAIMER,
} from "@platform/config";


import { globalPersistence } from "../database/persistence.js";

// --- 1. ACCOUNTS & WORLD PROFILES STORE (PERSISTENT REPOSITORY) ---
export const accountsStore = globalPersistence.registerStore<Account>("accounts");
export const socialProfilesStore = globalPersistence.registerStore<SocialProfile>("social_profiles");
export const founderProfilesStore = globalPersistence.registerStore<FounderProfile>("founder_profiles");

export const devAccountId = "00000000-0000-0000-0000-000000000001";
export const devSocialProfileId = "10000000-0000-0000-0000-000000000001";
export const devFounderProfileId = "20000000-0000-0000-0000-000000000001";

export const secondAccountId = "00000000-0000-0000-0000-000000000002";
export const secondSocialProfileId = "10000000-0000-0000-0000-000000000002";

export const thirdAccountId = "00000000-0000-0000-0000-000000000003";
export const thirdSocialProfileId = "10000000-0000-0000-0000-000000000003";
export const thirdFounderProfileId = "20000000-0000-0000-0000-000000000003";

export const fourthAccountId = "00000000-0000-0000-0000-000000000004";
export const fourthSocialProfileId = "10000000-0000-0000-0000-000000000004";
export const fourthFounderProfileId = "20000000-0000-0000-0000-000000000004";
export const fifthFounderProfileId = "20000000-0000-0000-0000-000000000005";
export const sixthFounderProfileId = "20000000-0000-0000-0000-000000000006";
export const seventhFounderProfileId = "20000000-0000-0000-0000-000000000007";
export const fifthSocialProfileId = "10000000-0000-0000-0000-000000000005";

// Accounts Seed
accountsStore.set(devAccountId, {
  id: devAccountId,
  email: "founder.dev@platform.local",
  is18PlusVerified: true,
  ageVerifiedAt: new Date().toISOString(),
  subscriptionTier: "premium",
  isSuspended: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

accountsStore.set(secondAccountId, {
  id: secondAccountId,
  email: "priya.art@platform.local",
  is18PlusVerified: true,
  ageVerifiedAt: new Date().toISOString(),
  subscriptionTier: "free",
  isSuspended: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

accountsStore.set(thirdAccountId, {
  id: thirdAccountId,
  email: "nikhil.varma@platform.local",
  is18PlusVerified: true,
  ageVerifiedAt: new Date().toISOString(),
  subscriptionTier: "free",
  isSuspended: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

accountsStore.set(fourthAccountId, {
  id: fourthAccountId,
  email: "rohit.chawla@platform.local",
  is18PlusVerified: true,
  ageVerifiedAt: new Date().toISOString(),
  subscriptionTier: "free",
  isSuspended: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

accountsStore.set("00000000-0000-0000-0000-000000000005", {
  id: "00000000-0000-0000-0000-000000000005",
  email: "ananya.thakur@platform.local",
  is18PlusVerified: true,
  ageVerifiedAt: new Date().toISOString(),
  subscriptionTier: "free",
  isSuspended: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Social Profiles Seed
socialProfilesStore.set(devAccountId, {
  id: devSocialProfileId,
  accountId: devAccountId,
  username: "aarav_social",
  displayName: "Aarav Social",
  pronouns: "he/him",
  bio: "Photography enthusiast, coffee nerd & weekend badminton player.",
  interests: ["Photography", "Travel", "Indie Cinema", "Fitness", "Filter Coffee"],
  hobbies: ["Badminton", "Baking", "Biking"],
  languages: ["English", "Hindi", "Kannada"],
  broadLocation: "Bengaluru, Karnataka",
  city: "Bengaluru",
  state: "Karnataka",
  allowDmsFrom: "everyone",
  showActivityStatus: true,
  isPrivate: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

socialProfilesStore.set(secondAccountId, {
  id: secondSocialProfileId,
  accountId: secondAccountId,
  username: "priya_art",
  displayName: "Priya Rao",
  pronouns: "she/her",
  bio: "Watercolor artist & botanical sketcher in Cubbon Park.",
  interests: ["Watercolor", "Architecture", "Coffee", "Books", "Photography"],
  hobbies: ["Sketching", "Gardening"],
  languages: ["English", "Kannada", "Telugu"],
  broadLocation: "Bengaluru, Karnataka",
  city: "Bengaluru",
  state: "Karnataka",
  allowDmsFrom: "everyone",
  showActivityStatus: true,
  isPrivate: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

socialProfilesStore.set("00000000-0000-0000-0000-000000000003", {
  id: thirdSocialProfileId,
  accountId: "00000000-0000-0000-0000-000000000003",
  username: "kabir_rides",
  displayName: "Kabir Menon",
  pronouns: "he/him",
  bio: "Endurance cyclist, indie cinema obsessive, and specialty pour-over experimenter.",
  interests: ["Cycling", "Indie Cinema", "Coffee", "Photography", "Fitness"],
  hobbies: ["Biking", "Brewing"],
  languages: ["English", "Malayalam", "Hindi"],
  broadLocation: "Bengaluru, Karnataka",
  city: "Bengaluru",
  state: "Karnataka",
  allowDmsFrom: "everyone",
  showActivityStatus: true,
  isPrivate: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

socialProfilesStore.set("00000000-0000-0000-0000-000000000004", {
  id: fourthSocialProfileId,
  accountId: "00000000-0000-0000-0000-000000000004",
  username: "tanvi_reads",
  displayName: "Tanvi Shah",
  pronouns: "she/her",
  bio: "Contemporary literature lover, analog 35mm film shooter, and cafe hopper.",
  interests: ["Books", "Photography", "Indie Cinema", "Architecture"],
  hobbies: ["Reading", "Film Photography"],
  languages: ["English", "Gujarati", "Hindi"],
  broadLocation: "Mumbai, Maharashtra",
  city: "Mumbai",
  state: "Maharashtra",
  allowDmsFrom: "everyone",
  showActivityStatus: true,
  isPrivate: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

socialProfilesStore.set("00000000-0000-0000-0000-000000000005", {
  id: fifthSocialProfileId,
  accountId: "00000000-0000-0000-0000-000000000005",
  username: "rohan_acoustic",
  displayName: "Rohan Das",
  pronouns: "he/him",
  bio: "Acoustic fingerstyle guitarist and vinyl record collector.",
  interests: ["Acoustic Music", "Indie Cinema", "Vinyl", "Coffee"],
  hobbies: ["Guitar", "Cooking"],
  languages: ["English", "Marathi", "Hindi"],
  broadLocation: "Pune, Maharashtra",
  city: "Pune",
  state: "Maharashtra",
  allowDmsFrom: "everyone",
  showActivityStatus: true,
  isPrivate: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

founderProfilesStore.set(devAccountId, {
  id: devFounderProfileId,
  accountId: devAccountId,
  username: "aarav_builder",
  displayName: "Aarav Sharma",
  headline: "Full-Stack Architect & AI Product Founder",
  bio: "Building next-gen distributed platforms and real-time networking tools.",
  skills: ["TypeScript", "React", "PostgreSQL", "System Architecture", "Go"],
  interests: ["AI/ML", "B2B SaaS", "Developer Tools"],
  experienceYears: 7,
  roles: ["Founder", "CTO"],
  availability: "full_time",
  workPreference: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  portfolioUrl: "https://github.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

founderProfilesStore.set(thirdAccountId, {
  id: thirdFounderProfileId,
  accountId: thirdAccountId,
  username: "nikhil_pulse",
  displayName: "Nikhil Varma",
  headline: "Founder, PulseEngine AI",
  bio: "Building autonomous infrastructure observability and cost telemetry.",
  skills: ["Kubernetes", "Rust", "Observability", "Go", "Cloud Cost"],
  interests: ["Developer Tools", "AI/ML", "B2B SaaS"],
  experienceYears: 9,
  roles: ["Founder", "CEO"],
  availability: "full_time",
  workPreference: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

founderProfilesStore.set(fourthAccountId, {
  id: fourthFounderProfileId,
  accountId: fourthAccountId,
  username: "rohit_chawla",
  displayName: "Rohit Chawla",
  headline: "Ex-Razorpay Senior Staff Engineer",
  bio: "10+ years engineering Indian fintech rails and real-time ledger settlement engines.",
  skills: ["FinTech", "Go", "PostgreSQL", "UPI Rails", "System Architecture"],
  interests: ["FinTech", "Web3", "Developer Platforms"],
  experienceYears: 10,
  roles: ["CTO", "Co-Founder"],
  availability: "full_time",
  workPreference: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

founderProfilesStore.set("00000000-0000-0000-0000-000000000005", {
  id: fifthFounderProfileId,
  accountId: "00000000-0000-0000-0000-000000000005",
  username: "ananya_infra",
  displayName: "Ananya Thakur",
  headline: "Cloud Infrastructure Architect & Pre-Seed Founder",
  bio: "Ex-Postman engineering lead. Building autonomous multi-tenant cloud cost telemetry for Kubernetes.",
  skills: ["Kubernetes", "AWS", "Terraform", "DevOps", "FinOps", "Go"],
  interests: ["Developer Tools", "Cloud Cost", "B2B SaaS"],
  experienceYears: 8,
  roles: ["Founder", "CEO", "Architect"],
  availability: "full_time",
  workPreference: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

founderProfilesStore.set("00000000-0000-0000-0000-000000000006", {
  id: sixthFounderProfileId,
  accountId: "00000000-0000-0000-0000-000000000006",
  username: "vikram_growth",
  displayName: "Vikram Malhotra",
  headline: "B2B SaaS Growth Lead & Angel Investor",
  bio: "Ex-Freshworks GTM director. Mentoring 12+ pre-seed B2B SaaS founders in India on US/SE Asia expansion.",
  skills: ["GTM Strategy", "PLG", "Enterprise Sales", "Fundraising", "Pricing"],
  interests: ["B2B SaaS", "Angel Investing", "DevTools"],
  experienceYears: 12,
  roles: ["Advisor", "Mentor", "Angel Investor"],
  availability: "advisory",
  workPreference: "remote",
  broadLocation: "Chennai, Tamil Nadu",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

founderProfilesStore.set("00000000-0000-0000-0000-000000000007", {
  id: seventhFounderProfileId,
  accountId: "00000000-0000-0000-0000-000000000007",
  username: "sneha_ux",
  displayName: "Sneha Iyer",
  headline: "Principal Product Designer (FinTech & Design Systems)",
  bio: "Ex-CRED lead designer. Designing frictionless financial workflows and design tokens for developer tools.",
  skills: ["UI/UX", "Design Systems", "Figma", "Micro-interactions", "User Research"],
  interests: ["FinTech", "Design Systems", "B2B SaaS"],
  experienceYears: 7,
  roles: ["Head of Design", "Co-Founder"],
  availability: "full_time",
  workPreference: "remote",
  broadLocation: "Bengaluru, Karnataka",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// --- 2. CONNECTIONS & FOLLOWS STORE ---
export const socialConnectionsStore = new Map<string, SocialConnection>();
export const socialFollowsStore = new Set<string>(); // Key: `${followerId}:${followingId}`

const conn1: SocialConnection = {
  id: "conn-1",
  requesterId: devSocialProfileId,
  requester: socialProfilesStore.get(devAccountId),
  recipientId: secondSocialProfileId,
  recipient: socialProfilesStore.get(secondAccountId),
  status: "accepted",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const conn2: SocialConnection = {
  id: "conn-2",
  requesterId: thirdSocialProfileId,
  requester: Array.from(socialProfilesStore.values()).find((p) => p.id === thirdSocialProfileId),
  recipientId: devSocialProfileId,
  recipient: socialProfilesStore.get(devAccountId),
  status: "pending",
  createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
};

socialConnectionsStore.set(conn1.id, conn1);
socialConnectionsStore.set(conn2.id, conn2);
socialFollowsStore.add(`${devSocialProfileId}:${secondSocialProfileId}`);

// --- 3. POSTS, REACTIONS & COMMENTS STORE ---
export const socialPostsStore = new Map<string, SocialPost>();
export const socialReactionsStore = new Map<string, SocialReaction>();
export const socialCommentsStore = new Map<string, SocialComment>();

const post1: SocialPost = {
  id: "sp-1",
  authorId: devSocialProfileId,
  author: socialProfilesStore.get(devAccountId),
  content: "Weekend road trip to Coorg! Coffee plantations, quiet hills, and zero laptop screens. 🌲☕",
  postType: "text",
  mediaUrls: [],
  mediaType: "none",
  likesCount: 24,
  commentsCount: 2,
  sharesCount: 3,
  isArchived: false,
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
};

const post2: SocialPost = {
  id: "sp-2",
  authorId: secondSocialProfileId,
  author: socialProfilesStore.get(secondAccountId),
  content: "Finished another watercolor sketch of Cubbon Park under the bamboo grove. What are your favorite quiet green spots in Bangalore?",
  postType: "image",
  mediaUrls: ["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80"],
  mediaType: "image",
  likesCount: 42,
  commentsCount: 1,
  sharesCount: 5,
  isArchived: false,
  createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
};

socialPostsStore.set(post1.id, post1);
socialPostsStore.set(post2.id, post2);

const comment1: SocialComment = {
  id: "sc-1",
  postId: "sp-1",
  authorId: secondSocialProfileId,
  author: socialProfilesStore.get(secondAccountId),
  content: "The mist in Madikeri right now is heavenly! Try the local wild honey if you pass through Kushalnagar.",
  likesCount: 4,
  createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
};

socialCommentsStore.set(comment1.id, comment1);

// --- 4. STORIES & STORY VIEWS STORE ---
export const socialStoriesStore = new Map<string, SocialStory>();
export const socialStoryViewsStore = new Set<string>(); // Key: `${storyId}:${viewerId}`

const story1: SocialStory = {
  id: "story-1",
  authorId: secondSocialProfileId,
  author: socialProfilesStore.get(secondAccountId),
  mediaUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800",
  mediaType: "image",
  caption: "Early morning light filtering through Bangalore green canopies 🌿",
  audience: "everyone",
  expiresAt: new Date(Date.now() + 86400000).toISOString(), // Active (expires in 24h)
  createdAt: new Date().toISOString(),
};

const storyExpired: SocialStory = {
  id: "story-expired",
  authorId: thirdSocialProfileId,
  author: Array.from(socialProfilesStore.values()).find((p) => p.id === thirdSocialProfileId),
  mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
  mediaType: "image",
  caption: "Yesterday's beach run",
  audience: "everyone",
  expiresAt: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
  createdAt: new Date(Date.now() - 90000000).toISOString(),
};

socialStoriesStore.set(story1.id, story1);
socialStoriesStore.set(storyExpired.id, storyExpired);

// --- 5. REELS STORE ---
export const socialReelsStore = new Map<string, SocialReel>();
export const socialReelLikesStore = new Set<string>(); // Key: `${reelId}:${profileId}`
export const socialReelCommentsStore = new Map<string, SocialReelComment>();
export const socialReelViewsStore = new Set<string>(); // Key: `${reelId}:${viewerId}`

const reel1: SocialReel = {
  id: "reel-1",
  authorId: thirdSocialProfileId,
  author: Array.from(socialProfilesStore.values()).find((p) => p.id === thirdSocialProfileId),
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  thumbnailUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800",
  caption: "Descending the Nandi Hills switchbacks at dawn! Cool breeze and zero traffic 🚴‍♂️💨",
  audioTrack: "Road Cycling Sunrise Vibes",
  hashtags: ["cycling", "bangalore", "nandihills", "weekend"],
  viewsCount: 342,
  likesCount: 89,
  commentsCount: 14,
  sharesCount: 22,
  isArchived: false,
  createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
};

socialReelsStore.set(reel1.id, reel1);

// --- 6. COMMUNITIES STORE ---
export const socialCommunitiesStore = new Map<string, SocialCommunity>();
export const socialCommunityMembersStore = new Map<string, SocialCommunityMember>(); // Key: `${communityId}:${profileId}`
export const socialCommunityPostsStore = new Map<string, SocialCommunityPost>();

const comm1: SocialCommunity = {
  id: "comm-1",
  creatorId: devSocialProfileId,
  creator: socialProfilesStore.get(devAccountId),
  name: "Bangalore Indie Cinema Club",
  slug: "bangalore-indie-cinema",
  description: "A community for lovers of regional indie cinema, documentary films, film festivals, and screenplay discussions.",
  avatarUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
  category: "Cinema & Arts",
  isPrivate: false,
  rules: [
    "Respect all cultural viewpoints and creative backgrounds",
    "No pirated links or unauthorized media downloads",
    "Constructive critique only during film reviews",
  ],
  membersCount: 14,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const comm2Private: SocialCommunity = {
  id: "comm-2",
  creatorId: secondSocialProfileId,
  creator: socialProfilesStore.get(secondAccountId),
  name: "Botanical Artists Circle",
  slug: "botanical-artists-circle",
  description: "Private invite-only collective of botanical watercolorists, nature illustrators, and plein-air sketchers.",
  category: "Art & Illustration",
  isPrivate: true,
  rules: [
    "Share only original art and process sketches",
    "Private critiques stay strictly within the circle",
  ],
  membersCount: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

socialCommunitiesStore.set(comm1.id, comm1);
socialCommunitiesStore.set(comm2Private.id, comm2Private);

// Members
socialCommunityMembersStore.set(`${comm1.id}:${devSocialProfileId}`, {
  communityId: comm1.id,
  profileId: devSocialProfileId,
  role: "owner",
  status: "active",
  joinedAt: new Date().toISOString(),
});

socialCommunityMembersStore.set(`${comm2Private.id}:${secondSocialProfileId}`, {
  communityId: comm2Private.id,
  profileId: secondSocialProfileId,
  role: "owner",
  status: "active",
  joinedAt: new Date().toISOString(),
});

// Seed Community Post
const commPost1: SocialCommunityPost = {
  id: "cp-1",
  communityId: comm1.id,
  authorId: devSocialProfileId,
  author: socialProfilesStore.get(devAccountId),
  content: "Which theater in Bangalore has the best projection quality for 35mm re-runs? Rex was legendary, but exploring alternatives around MG Road.",
  mediaUrls: [],
  likesCount: 8,
  commentsCount: 3,
  isPinned: false,
  createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
};
socialCommunityPostsStore.set(commPost1.id, commPost1);

// --- 7. EVENTS STORE (Public Venues Only) ---
export const socialEventsStore = new Map<string, SocialEvent>();
export const socialEventRsvpsStore = new Map<string, SocialEventRsvp>(); // Key: `${eventId}:${profileId}`

const event1: SocialEvent = {
  id: "event-1",
  organizerId: devSocialProfileId,
  organizer: socialProfilesStore.get(devAccountId),
  title: "Cubbon Park Sunday Morning Photo Walk & Coffee",
  description: "Join us for a relaxing 2-hour morning photography walk capturing natural light, heritage pavilions, and botanical life in Cubbon Park.",
  coverUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  category: "Photography & Nature",
  venueName: "Cubbon Park Public Bandstand, Kasturba Road",
  city: "Bengaluru",
  isOnline: false,
  startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
  endTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
  publicSafetyGuidance: "Meet at public open-air pavilion. Stay on public footpaths. Bring water and comfortable walking shoes.",
  isAttendeeListVisible: true,
  status: "active",
  rsvpsCount: { going: 12, interested: 28 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

socialEventsStore.set(event1.id, event1);

socialEventRsvpsStore.set(`${event1.id}:${devSocialProfileId}`, {
  eventId: event1.id,
  profileId: devSocialProfileId,
  rsvpStatus: "going",
  updatedAt: new Date().toISOString(),
});

socialEventRsvpsStore.set(`${event1.id}:${secondSocialProfileId}`, {
  eventId: event1.id,
  profileId: secondSocialProfileId,
  rsvpStatus: "going",
  updatedAt: new Date().toISOString(),
});

// --- 8. SOCIAL INBOX & MESSAGING STORE ---
export const socialConversationsStore = new Map<string, SocialConversation>();
export const socialMessagesStore = new Map<string, SocialMessage>();

const conv1: SocialConversation = {
  id: "conv-1",
  isGroup: false,
  creatorId: devSocialProfileId,
  lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
  lastMessage: "Thanks for the wild honey recommendation! The flavor is incredible.",
  participants: [
    {
      conversationId: "conv-1",
      profileId: devSocialProfileId,
      profile: socialProfilesStore.get(devAccountId),
      isAdmin: true,
      status: "accepted",
      lastReadAt: new Date().toISOString(),
      joinedAt: new Date().toISOString(),
    },
    {
      conversationId: "conv-1",
      profileId: secondSocialProfileId,
      profile: socialProfilesStore.get(secondAccountId),
      isAdmin: false,
      status: "accepted",
      lastReadAt: new Date(Date.now() - 1800000).toISOString(),
      joinedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date(Date.now() - 86400000).toISOString(),
};

socialConversationsStore.set(conv1.id, conv1);

const msg1: SocialMessage = {
  id: "msg-1",
  conversationId: "conv-1",
  senderId: devSocialProfileId,
  sender: socialProfilesStore.get(devAccountId),
  content: "Hey Priya, did you get a chance to check out the botanical exhibit?",
  createdAt: new Date(Date.now() - 7200000).toISOString(),
};

const msg2: SocialMessage = {
  id: "msg-2",
  conversationId: "conv-1",
  senderId: secondSocialProfileId,
  sender: socialProfilesStore.get(secondAccountId),
  content: "Yes! The orchid illustrations in the Glass House are remarkable.",
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};

socialMessagesStore.set(msg1.id, msg1);
socialMessagesStore.set(msg2.id, msg2);

// --- 9. NOTIFICATIONS STORE ---
export const socialNotificationsStore = new Map<string, SocialNotification>();

const notif1: SocialNotification = {
  id: "notif-1",
  recipientProfileId: devSocialProfileId,
  actorProfileId: secondSocialProfileId,
  actor: socialProfilesStore.get(secondAccountId),
  notificationType: "like",
  entityId: "sp-1",
  entityType: "post",
  message: "Priya Rao loved your road trip post.",
  isRead: false,
  createdAt: new Date(Date.now() - 1800000).toISOString(),
};

const notif2: SocialNotification = {
  id: "notif-2",
  recipientProfileId: devSocialProfileId,
  actorProfileId: thirdSocialProfileId,
  actor: Array.from(socialProfilesStore.values()).find((p) => p.id === thirdSocialProfileId),
  notificationType: "connection_req",
  entityId: "conn-2",
  entityType: "connection",
  message: "Kabir Menon sent you a connection request.",
  isRead: false,
  createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
};

const notif3: SocialNotification = {
  id: "notif-3",
  recipientProfileId: devSocialProfileId,
  actorProfileId: secondSocialProfileId,
  actor: socialProfilesStore.get(secondAccountId),
  notificationType: "comment",
  entityId: "sp-1",
  entityType: "post",
  message: "Priya Rao commented: 'The mist in Madikeri right now is heavenly!'",
  isRead: false,
  createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
};

const notif4: SocialNotification = {
  id: "notif-4",
  recipientProfileId: devSocialProfileId,
  actorProfileId: fourthSocialProfileId,
  actor: Array.from(socialProfilesStore.values()).find((p) => p.id === fourthSocialProfileId),
  notificationType: "follow",
  entityId: fourthSocialProfileId,
  entityType: "profile",
  message: "Tanvi Shah started following your social profile.",
  isRead: false,
  createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
};

const notif5: SocialNotification = {
  id: "notif-5",
  recipientProfileId: devSocialProfileId,
  actorProfileId: thirdSocialProfileId,
  actor: Array.from(socialProfilesStore.values()).find((p) => p.id === thirdSocialProfileId),
  notificationType: "mention",
  entityId: "sp-1",
  entityType: "post",
  message: "Kabir Menon mentioned you in a comment: '@aarav_social check out this trail!'",
  isRead: true,
  createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
};

const notif6: SocialNotification = {
  id: "notif-6",
  recipientProfileId: devSocialProfileId,
  actorProfileId: secondSocialProfileId,
  actor: socialProfilesStore.get(secondAccountId),
  notificationType: "community_post",
  entityId: "comm-1",
  entityType: "community",
  message: "New discussion in Bangalore Tech & Coffee: 'Favorite quiet cafes for weekend reading'",
  isRead: true,
  createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
};

const notif7: SocialNotification = {
  id: "notif-7",
  recipientProfileId: devSocialProfileId,
  actorProfileId: secondSocialProfileId,
  actor: socialProfilesStore.get(secondAccountId),
  notificationType: "event_invite",
  entityId: "ev-1",
  entityType: "event",
  message: "Upcoming meetup reminder: Cubbon Park Weekend Botanical Sketching is this Saturday.",
  isRead: true,
  createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
};

const notif8: SocialNotification = {
  id: "notif-8",
  recipientProfileId: devSocialProfileId,
  actorProfileId: secondSocialProfileId,
  actor: socialProfilesStore.get(secondAccountId),
  notificationType: "story_reply",
  entityId: "story-1",
  entityType: "story",
  message: "Priya Rao replied to your 24h sunrise story: 'Love the golden hour lighting!'",
  isRead: true,
  createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
};

const notif9: SocialNotification = {
  id: "notif-9",
  recipientProfileId: devSocialProfileId,
  actorProfileId: fourthSocialProfileId,
  actor: Array.from(socialProfilesStore.values()).find((p) => p.id === fourthSocialProfileId),
  notificationType: "reel_like",
  entityId: "reel-1",
  entityType: "reel",
  message: "Tanvi Shah reacted ❤️ to your reel: 'Western Ghats monsoon ride'",
  isRead: true,
  createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
};

socialNotificationsStore.set(notif1.id, notif1);
socialNotificationsStore.set(notif2.id, notif2);
socialNotificationsStore.set(notif3.id, notif3);
socialNotificationsStore.set(notif4.id, notif4);
socialNotificationsStore.set(notif5.id, notif5);
socialNotificationsStore.set(notif6.id, notif6);
socialNotificationsStore.set(notif7.id, notif7);
socialNotificationsStore.set(notif8.id, notif8);
socialNotificationsStore.set(notif9.id, notif9);

// --- 10. PRIVACY, BLOCKS, MUTES & REPORTS STORE ---
export const socialBlocksStore = new Set<string>(); // Key: `${blockerId}:${blockedId}`
export const socialMutesStore = new Set<string>(); // Key: `${muterId}:${mutedId}`
export const socialReportsStore = new Map<string, SocialReport>();

/**
 * Resolves the authenticated user's world profile and verifies ownership.
 * Fails if user has not completed a profile for this world.
 */
export function getProfileForWorld(accountId: string, world: WorldType) {
  if (world === WORLDS.SOCIALIZING) {
    return socialProfilesStore.get(accountId) || null;
  }
  if (world === WORLDS.FOUNDERS) {
    return founderProfilesStore.get(accountId) || null;
  }
  return null;
}

// --- 11. FOUNDERS & STARTUP COLLABORATION STORES ---
export const startupsStore = globalPersistence.registerStore<Startup>("startups");
export const startupMembersStore = globalPersistence.registerStore<StartupMember[]>("startup_members");
export const collaborationRequestsStore = new Map<string, CollaborationRequest>();
export const partnershipSpacesStore = new Map<string, PartnershipSpace>();
export const launchpadProductsStore = globalPersistence.registerStore<Product>("products");
export const launchpadUpvotesStore = new Set<string>(); // Key: `${profileId}:${productId}`
export const founderIntroductionsStore = new Map<string, any>();
export const founderConversationsStore = new Map<string, any>();
export const founderMessagesStore = new Map<string, any[]>(); // Key: spaceId or conversationId
export const founderNotificationsStore = new Map<string, any>();

// Feature 13 Unified Founders Inbox & Notifications Stores
export const foundersConversationsStore = globalPersistence.registerStore<FoundersConversation>("founders_conversations");
export const foundersConversationParticipantsStore = new Map<string, FoundersConversationParticipant[]>();
export const foundersMessagesStore = globalPersistence.registerStore<FoundersMessage[]>("founders_messages");
export const foundersMessageRequestsStore = new Map<string, FoundersMessageRequest>();
export const foundersUserInboxStatesStore = new Map<string, FoundersUserInboxState>(); // Key: `${profileId}:${conversationId}`
export const foundersNotificationsStore = globalPersistence.registerStore<FoundersNotification>("founders_notifications");
export const foundersNotificationPreferencesStore = new Map<string, FoundersNotificationPreferences>();
export const foundersBlocksStore = new Set<string>(); // Key: `${blockerProfileId}:${blockedProfileId}`
export const foundersReportsStore = new Map<string, any>();

// Seed NovaTech Systems (Aarav Sharma's startup)
startupsStore.set("st-dev", {
  id: "st-dev",
  creatorId: devFounderProfileId,
  name: "NovaTech Systems",
  slug: "novatech-systems",
  oneLiner: "Distributed event mesh & real-time networking infrastructure.",
  industry: "B2B SaaS / Infra",
  stage: "early_traction",
  broadLocation: "Bengaluru, Karnataka",
  verificationLevel: "verified_project",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

startupMembersStore.set("st-dev", [
  {
    startupId: "st-dev",
    profileId: devFounderProfileId,
    role: "owner",
    title: "Founder & CTO",
    joinedAt: new Date().toISOString(),
  },
]);

// Seed PulseEngine AI (Nikhil Varma's startup)
startupsStore.set("st-1", {
  id: "st-1",
  creatorId: thirdFounderProfileId,
  name: "PulseEngine AI",
  slug: "pulseengine-ai",
  oneLiner: "Autonomous infrastructure observability and cost telemetry.",
  industry: "Developer Tools",
  stage: "early_traction",
  broadLocation: "Bengaluru, Karnataka",
  verificationLevel: "verified_project",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

startupMembersStore.set("st-1", [
  {
    startupId: "st-1",
    profileId: thirdFounderProfileId,
    role: "owner",
    title: "Founder & CEO",
    joinedAt: new Date().toISOString(),
  },
]);

// Seed incoming Collaboration Proposal (PulseEngine AI -> NovaTech Systems)
const collab1: CollaborationRequest = {
  id: "collab-1",
  initiatorStartupId: "st-1",
  initiatorStartup: startupsStore.get("st-1"),
  receiverStartupId: "st-dev",
  receiverStartup: startupsStore.get("st-dev"),
  sentByProfileId: thirdFounderProfileId,
  collabType: "referral",
  title: "PulseEngine AI x NovaTech Referral & Integration",
  whatWeOffer: "Native integration with our developer observability engine + direct referrals from our 40+ SMB customers.",
  whatWeNeed: "Dual-listing in your marketplace and co-marketing case study.",
  commercialTerms: "15% Mutual Referral Share",
  status: "pending",
  createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
};
collaborationRequestsStore.set(collab1.id, collab1);

// Seed Launchpad Product (DocuLens AI)
const prod1: Product = {
  id: "prod-1",
  makerId: thirdFounderProfileId,
  maker: founderProfilesStore.get(thirdAccountId),
  startupId: null,
  name: "DocuLens AI",
  slug: "doculens-ai",
  tagline: "Vernacular OCR for Indian invoice workflows",
  description:
    "Instant vernacular document OCR and GST invoice parsing specifically fine-tuned for Indian SMBs in Hindi, Kannada, Tamil, and English.",
  problem:
    "Indian SMBs receive printed bills and handwritten invoices in mixed Indic languages that fail standard western OCR engines.",
  solution:
    "Fine-tuned lightweight multimodal vision models trained on Indian trade tax vouchers and multi-script layouts with 99.4% field accuracy.",
  features: [
    "Multi-script Hindi, Kannada, Tamil & English parsing",
    "Automated GSTIN reconciliation & HSN checksum",
    "One-click Tally & Zoho Books sync",
    "On-device privacy edge processing mode",
  ],
  logoUrl: "📄",
  coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
  mediaUrls: [],
  screenshots: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  ],
  websiteUrl: "https://doculens.ai",
  demoUrl: "https://demo.doculens.ai",
  category: "ai_ml",
  status: "live",
  pricingModel: "freemium",
  technologies: ["PyTorch", "FastAPI", "Next.js", "Tesseract", "PostgreSQL"],
  targetAudience: "Chartered Accountants, SMB Founders, and FinTech Operators",
  upvotesCount: 142,
  followersCount: 38,
  savesCount: 24,
  commentsCount: 6,
  reviewsCount: 3,
  averageRating: 4.8,
  viewsCount: 680,
  websiteClicks: 124,
  launchDate: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
  isPublished: true,
  moderationStatus: "approved",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
launchpadProductsStore.set(prod1.id, prod1);


// Seed initial messages for when partnership chat is opened
founderMessagesStore.set("collab-1", [
  {
    id: "m-1",
    sender: "Nikhil V. (Founder, PulseEngine)",
    text: "Thanks for accepting our referral & integration proposal! Looking forward to syncing our developer APIs.",
    time: "10:45 AM",
    createdAt: new Date().toISOString(),
  },
]);

// Seed BharatFin Mesh (Aarav is Co-Founder)
startupsStore.set("st-mesh", {
  id: "st-mesh",
  creatorId: devFounderProfileId,
  name: "BharatFin Mesh",
  slug: "bharatfin-mesh",
  oneLiner: "Unified settlement infrastructure for Indian fintechs & non-banking lenders.",
  industry: "FinTech / Banking",
  stage: "early_traction",
  broadLocation: "Bengaluru, Karnataka",
  verificationLevel: "verified_business",
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date().toISOString(),
});

startupMembersStore.set("st-mesh", [
  {
    startupId: "st-mesh",
    profileId: devFounderProfileId,
    role: "owner",
    title: "Co-Founder & Chief Architect",
    joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    canManageHiring: true,
  },
  {
    startupId: "st-mesh",
    profileId: fourthFounderProfileId,
    role: "admin",
    title: "Engineering Lead",
    joinedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    canManageHiring: true,
  },
  {
    startupId: "st-mesh",
    profileId: fifthFounderProfileId,
    role: "hiring_manager",
    title: "Head of Talent & Engineering Hiring",
    joinedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    canManageHiring: true, // explicitly authorized!
  },
  {
    startupId: "st-mesh",
    profileId: seventhFounderProfileId,
    role: "editor",
    title: "Product Designer",
    joinedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    canManageHiring: false, // not granted yet
  },
  {
    startupId: "st-mesh",
    profileId: sixthFounderProfileId,
    role: "viewer",
    title: "Strategic Advisor & Observer",
    joinedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    canManageHiring: false, // viewer never has permission
  },
]);

// Opportunities & Jobs Store (Feature 4: Opportunities Marketplace)
export const opportunitiesStore = new Map<string, Opportunity>();
export const opportunityApplicationsStore = new Map<string, OpportunityApplication>();
export const opportunitySavedStore = new Set<string>(); // Key: `${founderId}:${oppId}`
export const opportunityViewsStore = new Set<string>(); // Key: `${founderId}:${oppId}`
export const opportunityReportsStore = new Map<string, any>();

// Seed Opportunities across all categories
opportunitiesStore.set("opp-1", {
  id: "opp-1",
  creatorId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  title: "Technical Co-Founder (Indian Rails & Ledger)",
  category: "cofounder",
  type: "co_founder",
  summary: "Lead protocol integration with UPI, BBPS, and Account Aggregator rails.",
  description: "Looking for a seasoned fintech infrastructure engineer to lead protocol integration with UPI, BBPS, and Account Aggregator rails.",
  responsibilities: [
    "Architect low-latency distributed ledger transaction engine",
    "Integrate NPCI UPI 2.0 and BBPS settlement switches",
    "Drive team hiring and technical roadmap"
  ],
  requiredSkills: ["Go", "PostgreSQL", "UPI / BBPS", "Distributed Systems"],
  preferredSkills: ["Rust", "Account Aggregator", "eBPF"],
  experienceLevel: "Staff / Principal (7+ yrs)",
  commitmentHours: "Full-Time (40+ hrs/wk)",
  workMode: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  compensation: "equity",
  compensationDetails: "25-30% Founder Equity + Co-Founder Title",
  deadline: "2026-12-31",
  openingsCount: 1,
  applicationQuestions: [
    "Have you built systems handling 5,000+ financial TPS?",
    "What is your experience with NPCI regulatory frameworks?"
  ],
  viewsCount: 148,
  applicationsCount: 3,
  shortlistedCount: 1,
  acceptedCount: 1,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
});

opportunitiesStore.set("opp-2", {
  id: "opp-2",
  creatorId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  title: "Principal Distributed Systems Engineer",
  category: "developer",
  type: "developer",
  summary: "Architect high-throughput event pub/sub brokers handling 100k+ TPS with sub-millisecond latencies for NovaTech.",
  description: "Architect high-throughput event pub/sub brokers handling 100k+ TPS with sub-millisecond latencies for NovaTech.",
  responsibilities: [
    "Design zero-copy pub/sub message ring buffers",
    "Implement Raft-based consensus partitions",
    "Optimize Linux socket performance with eBPF"
  ],
  requiredSkills: ["Rust", "Go", "Distributed Consensus", "eBPF", "Kafka"],
  preferredSkills: ["C++", "DPDK", "ClickHouse"],
  experienceLevel: "Senior / Principal (5+ yrs)",
  commitmentHours: "Full-Time (40 hrs/wk)",
  workMode: "remote",
  broadLocation: "Bengaluru / Remote (India)",
  compensation: "paid_and_equity",
  compensationDetails: "₹36,00,000 - ₹48,00,000/yr + 1.0% Equity",
  deadline: "2026-12-15",
  openingsCount: 2,
  viewsCount: 230,
  applicationsCount: 5,
  shortlistedCount: 2,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
});

opportunitiesStore.set("opp-3", {
  id: "opp-3",
  creatorId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  title: "Developer Relations & Technical Content Lead",
  category: "marketing",
  type: "marketing",
  summary: "Create deep technical architecture breakdowns, developer guides, and represent NovaTech at Indian tech conferences.",
  description: "Create deep technical architecture breakdowns, developer guides, and represent NovaTech at Indian tech conferences.",
  responsibilities: [
    "Write authoritative distributed systems architectural whitepapers",
    "Produce code-along walkthroughs and video tutorials",
    "Engage open-source developer communities on GitHub and Discord"
  ],
  requiredSkills: ["Technical Writing", "DevRel", "TypeScript", "Public Speaking"],
  preferredSkills: ["Go", "Video Production", "Open Source"],
  experienceLevel: "Mid-Senior (3-5 yrs)",
  commitmentHours: "Full-Time",
  workMode: "remote",
  broadLocation: "Remote (India)",
  compensation: "paid_and_equity",
  compensationDetails: "₹18,00,000 - ₹24,00,000/yr + 0.5% Equity",
  deadline: "2026-12-20",
  openingsCount: 1,
  viewsCount: 95,
  applicationsCount: 2,
  shortlistedCount: 1,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
});

opportunitiesStore.set("opp-4", {
  id: "opp-4",
  creatorId: thirdFounderProfileId,
  creator: founderProfilesStore.get(thirdAccountId),
  startupId: "st-1",
  startup: startupsStore.get("st-1"),
  title: "Product Design Advisor",
  category: "designer",
  type: "designer",
  summary: "Guide telemetry visualization dashboards, anomaly alerts UX, and developer metrics consoles at PulseEngine AI.",
  description: "Guide telemetry visualization dashboards, anomaly alerts UX, and developer metrics consoles at PulseEngine AI.",
  responsibilities: [
    "Advise UI engineering team on high-density data visualization",
    "Review telemetry alert ergonomics and reducing alarm fatigue",
    "Establish design token architecture in Figma"
  ],
  requiredSkills: ["Product Strategy", "Figma", "DevTool UX", "Data Visualization"],
  preferredSkills: ["D3.js", "Design Systems"],
  experienceLevel: "Director / Principal",
  commitmentHours: "Part-Time / Advisory (5-10 hrs/mo)",
  workMode: "remote",
  broadLocation: "Remote",
  compensation: "equity",
  compensationDetails: "0.25% - 0.5% Advisory Equity",
  deadline: "2026-11-30",
  openingsCount: 1,
  viewsCount: 112,
  applicationsCount: 2,
  shortlistedCount: 1,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
});

opportunitiesStore.set("opp-5", {
  id: "opp-5",
  creatorId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  title: "Early Beta Testers for NovaTelemetry eBPF Agent",
  category: "beta_tester",
  type: "developer",
  summary: "Help stress-test our pre-release kernel probe agent across Ubuntu, Debian, RHEL, and Alpine environments.",
  description: "Looking for 10 DevOps and cloud engineers to test our low-overhead kernel probe agent across various Linux distributions and container platforms.",
  responsibilities: [
    "Deploy probe on test Kubernetes or Docker clusters",
    "Report kernel incompatibility logs and trace anomalies",
    "Provide usability feedback on CLI dashboard"
  ],
  requiredSkills: ["Linux", "Docker", "Kubernetes", "eBPF"],
  experienceLevel: "Early / Mid",
  commitmentHours: "Flexible (2-4 hrs/wk)",
  workMode: "remote",
  broadLocation: "Global / Remote",
  compensation: "voluntary",
  compensationDetails: "Free perpetual license + special contributor recognition",
  deadline: "2026-12-10",
  openingsCount: 10,
  viewsCount: 64,
  applicationsCount: 1,
  shortlistedCount: 0,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
});

opportunitiesStore.set("opp-6", {
  id: "opp-6",
  creatorId: fourthFounderProfileId,
  creator: founderProfilesStore.get(fourthAccountId),
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  title: "Smart Contract & Escrow Audit (Polygon / EVM)",
  category: "freelance",
  type: "developer",
  summary: "2-week fixed contract to audit micro-payment settlement contracts and optimize gas usage.",
  description: "Need a seasoned Solidity auditor to inspect automated escrow releases, dispute timeouts, and cross-chain settlement logic.",
  responsibilities: [
    "Conduct line-by-line static and fuzzing audit",
    "Optimize gas consumption by at least 15%",
    "Deliver formal security report"
  ],
  requiredSkills: ["Solidity", "Foundry", "EVM", "Security Audit"],
  experienceLevel: "Senior",
  commitmentHours: "Project Contract (2 weeks)",
  workMode: "remote",
  broadLocation: "Remote (India)",
  compensation: "paid",
  compensationDetails: "₹1,50,000 fixed milestone upon audit sign-off",
  deadline: "2026-11-28",
  openingsCount: 1,
  viewsCount: 88,
  applicationsCount: 2,
  shortlistedCount: 1,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
});

opportunitiesStore.set("opp-7", {
  id: "opp-7",
  creatorId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  title: "Open Source Contributor for Go OpenTelemetry Exporters",
  category: "contributor",
  type: "contributor",
  summary: "Join our open-source core team building vendor-neutral OTLP exporters for time-series databases.",
  description: "Contribute to our Apache-2.0 telemetry exporter SDK and earn contributor badges on the Balaga Founders platform.",
  responsibilities: [
    "Implement VictoriaMetrics and TimescaleDB backends",
    "Write comprehensive unit tests with 85%+ coverage",
    "Review peer PRs and update documentation"
  ],
  requiredSkills: ["Go", "OpenTelemetry", "Prometheus", "Git"],
  experienceLevel: "Any",
  commitmentHours: "Weekends / Flexible",
  workMode: "remote",
  broadLocation: "Remote",
  compensation: "voluntary",
  compensationDetails: "Public open-source author attribution & Balaga Contributor Badge",
  deadline: "2027-01-31",
  openingsCount: 3,
  viewsCount: 52,
  applicationsCount: 0,
  shortlistedCount: 0,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
});

opportunitiesStore.set("opp-8", {
  id: "opp-8",
  creatorId: sixthFounderProfileId,
  creator: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  title: "B2B SaaS Growth & US Market Expansion Mentor",
  category: "mentor",
  type: "mentor",
  summary: "1-on-1 bi-weekly advisory sessions for pre-seed founders expanding into US enterprise markets.",
  description: "Offering strategic mentorship on enterprise sales cycles, pricing tiers, and US GTM playbooks based on scaling Freshworks.",
  responsibilities: [
    "Bi-weekly 45-minute pitch and sales strategy reviews",
    "Introductions to potential US enterprise design partners",
    "Critique GTM messaging and pricing strategy"
  ],
  requiredSkills: ["Enterprise Sales", "B2B SaaS", "US Expansion", "Pricing"],
  experienceLevel: "Executive (10+ yrs)",
  commitmentHours: "2-4 hours / month",
  workMode: "remote",
  broadLocation: "Chennai / Remote",
  compensation: "discussion",
  compensationDetails: "Pro bono / Open to discussion",
  deadline: "2026-12-31",
  openingsCount: 2,
  viewsCount: 160,
  applicationsCount: 4,
  shortlistedCount: 1,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
});

opportunitiesStore.set("opp-9", {
  id: "opp-9",
  creatorId: fourthFounderProfileId,
  creator: founderProfilesStore.get(fourthAccountId),
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  title: "Fintech Joint Integration & Unified Ledger Partnership",
  category: "collaboration",
  type: "other",
  summary: "Looking for banking API aggregators to co-develop an interoperable reconciliation bridge.",
  description: "Explore a joint technology partnership between BharatFin Mesh and compatible Indian fintech infrastructure platforms.",
  responsibilities: [
    "Co-design unified webhook protocol",
    "Pilot transaction reconciliation across 3 early NBFCs",
    "Publish joint compliance whitepaper"
  ],
  requiredSkills: ["UPI", "Account Aggregator", "Banking APIs", "FinTech Architecture"],
  experienceLevel: "Staff / Founder",
  commitmentHours: "Partner Collaboration",
  workMode: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  compensation: "discussion",
  compensationDetails: "Revenue share / joint go-to-market agreement",
  deadline: "2026-12-15",
  openingsCount: 1,
  viewsCount: 79,
  applicationsCount: 1,
  shortlistedCount: 0,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
});

opportunitiesStore.set("opp-10", {
  id: "opp-10",
  creatorId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  title: "Enterprise B2B SaaS Account Executive",
  category: "sales",
  type: "sales",
  summary: "Lead high-value pilots with Tier-1 NBFCs and fintech lenders across India.",
  description: "Drive direct enterprise sales, negotiate multi-year license contracts, and expand our recurring revenue.",
  responsibilities: [
    "Prospect and qualify Tier-1 and Tier-2 NBFC engineering leaders",
    "Lead product discovery demos and POC technical scope reviews",
    "Negotiate and close ₹25L+ annual recurring contracts"
  ],
  requiredSkills: ["B2B SaaS Sales", "NBFC / Banking", "Contract Negotiation", "Enterprise Demos"],
  experienceLevel: "Mid-Senior (4+ yrs)",
  commitmentHours: "Full-Time",
  workMode: "hybrid",
  broadLocation: "Bengaluru / Mumbai",
  compensation: "paid_and_equity",
  compensationDetails: "₹18,00,000 - ₹24,00,000 base + commission + 1.5% equity",
  deadline: "2026-12-31",
  openingsCount: 1,
  viewsCount: 104,
  applicationsCount: 3,
  shortlistedCount: 1,
  acceptedCount: 0,
  status: "open",
  createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 11).toISOString(),
});

// Seed Opportunity Applications
const app1: OpportunityApplication = {
  id: "app-1",
  opportunityId: "opp-1",
  opportunity: opportunitiesStore.get("opp-1"),
  applicantId: seventhFounderProfileId,
  applicant: founderProfilesStore.get("00000000-0000-0000-0000-000000000007"),
  introduction: "Hi Aarav, I have led fintech product design systems at CRED and would love to partner on BharatFin Mesh.",
  whyInterested: "Fintech rails in India need frictionless, modern operator consoles. My design background fits your deep engineering strengths.",
  skillsAndExperience: "7+ years designing financial workflows, design tokens, and developer interfaces.",
  portfolioLinks: ["https://dribbble.com/sneha-ux"],
  availabilityCommitment: "Full-Time",
  compensationExpectations: "Standard cofounder vesting",
  status: "accepted", // Decision 7 test case: Accepted application
  internalNotes: "Great portfolio and deep experience with Indian fintech workflows.",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
  statusUpdatedAt: new Date(Date.now() - 86400000).toISOString(),
};

const app2: OpportunityApplication = {
  id: "app-2",
  opportunityId: "opp-2",
  opportunity: opportunitiesStore.get("opp-2"),
  applicantId: sixthFounderProfileId,
  applicant: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  introduction: "Hi Aarav, interested in advising on your high-throughput pub/sub engine.",
  whyInterested: "Having scaled high-throughput event buses at Freshworks, I can help your team optimize partition routing.",
  skillsAndExperience: "12+ years in distributed systems and enterprise infrastructure.",
  availabilityCommitment: "Part-Time",
  compensationExpectations: "Equity",
  status: "shortlisted",
  internalNotes: "Strong background, set up technical intro call next week.",
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const app3: OpportunityApplication = {
  id: "app-3",
  opportunityId: "opp-4",
  opportunity: opportunitiesStore.get("opp-4"),
  applicantId: devFounderProfileId,
  applicant: founderProfilesStore.get(devAccountId),
  introduction: "Hey Nikhil, would love to advise PulseEngine on telemetry console UX.",
  whyInterested: "We solve similar observability problems at NovaTech. Can share telemetry ergonomics feedback.",
  skillsAndExperience: "7+ years architecture, telemetry visualization, React and Go.",
  availabilityCommitment: "Advisory",
  status: "submitted",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};

opportunityApplicationsStore.set(app1.id, app1);
opportunityApplicationsStore.set(app2.id, app2);
opportunityApplicationsStore.set(app3.id, app3);

// Seed bookmarks
opportunitySavedStore.add(`${devFounderProfileId}:opp-4`);
opportunitySavedStore.add(`${devFounderProfileId}:opp-6`);

// Attention items store (Prioritized pending items)
export const founderAttentionItemsStore = new Map<string, any>();
founderAttentionItemsStore.set("att-1", {
  id: "att-1",
  type: "connection_request",
  senderId: fourthFounderProfileId,
  senderName: "Rohit Chawla",
  senderHeadline: "Ex-Razorpay Senior Staff Engineer",
  senderAvatar: "👨‍💻",
  senderLocation: "Bengaluru, Karnataka",
  title: "Professional Connection Request",
  context: "Wants to connect with you regarding Indian FinTech rails & distributed ledger infra.",
  date: "2 hours ago",
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  status: "pending",
  actions: ["accept", "decline"],
});

founderAttentionItemsStore.set("att-2", {
  id: "att-2",
  type: "collaboration_proposal",
  senderId: thirdFounderProfileId,
  senderName: "Nikhil Varma (PulseEngine AI)",
  senderHeadline: "Founder & CEO, PulseEngine AI",
  senderAvatar: "⚡",
  senderLocation: "Bengaluru, Karnataka",
  title: "PulseEngine AI x NovaTech Referral & Integration",
  context: "15% Mutual Referral Share + Native integration with observability engine.",
  date: "4 hours ago",
  createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  status: "pending",
  proposalId: "collab-1",
  actions: ["view", "accept", "counter", "decline"],
});

founderAttentionItemsStore.set("att-3", {
  id: "att-3",
  type: "job_application_review",
  senderId: "cand-devk",
  senderName: "Dev K. (Staff Go Engineer)",
  senderHeadline: "Ex-Swiggy Core Platform Team (7 yrs exp)",
  senderAvatar: "🛠️",
  senderLocation: "Bengaluru, Karnataka",
  title: "Application: Principal Distributed Systems Engineer",
  context: "Submitted architectural portfolio & systems design tear-down for NovaTech.",
  date: "5 hours ago",
  createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  status: "pending",
  opportunityId: "opp-2",
  actions: ["review", "shortlist", "reject"],
});

founderAttentionItemsStore.set("att-4", {
  id: "att-4",
  type: "build_space_invite",
  senderId: "space-sandbox",
  senderName: "India FinTech Sandbox 2026",
  senderHeadline: "Cohort Accelerator & Regulated Testing Ground",
  senderAvatar: "🏛️",
  senderLocation: "Mumbai / Bengaluru",
  title: "Cohort Invitation: High-Throughput Settlement Sandbox",
  context: "NovaTech Systems has been shortlisted to participate in the RBI-aligned regulatory test sandbox.",
  date: "Yesterday",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  status: "pending",
  actions: ["join_space", "decline"],
});

founderAttentionItemsStore.set("att-5", {
  id: "att-5",
  type: "mentor_request",
  senderId: fifthFounderProfileId,
  senderName: "Ananya Thakur",
  senderHeadline: "Pre-seed Founder building Cloud Cost Optimizer",
  senderAvatar: "👩‍💼",
  senderLocation: "Bengaluru, Karnataka",
  title: "Mentorship Request: Scaling Multi-Tenant Storage",
  context: "Requested a 30-minute architecture guidance call on multi-tenant Postgres partitioning.",
  date: "1 day ago",
  createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  status: "pending",
  actions: ["schedule", "decline"],
});

// Upcoming Activities Store
export const founderActivitiesStore = new Map<string, any>();
founderActivitiesStore.set("act-1", {
  id: "act-1",
  title: "Partnership Integration Sync (NovaTech x PulseEngine)",
  type: "partnership_meeting",
  date: new Date(Date.now() + 3600000 * 3.5).toISOString(),
  timeLabel: "Today, 4:30 PM IST",
  attendees: ["Aarav Sharma", "Nikhil Varma"],
  meetingUrl: "https://meet.google.com/novatech-pulse-sync",
  status: "confirmed",
});

founderActivitiesStore.set("act-2", {
  id: "act-2",
  title: "Technical Co-Founder Candidate Deep-Dive (Rohit C.)",
  type: "interview",
  date: new Date(Date.now() + 86400000).toISOString(),
  timeLabel: "Tomorrow, 11:00 AM IST",
  attendees: ["Aarav Sharma", "Rohit Chawla"],
  meetingUrl: "https://meet.google.com/interview-rohit",
  status: "confirmed",
});

founderActivitiesStore.set("act-3", {
  id: "act-3",
  title: "Architecture Mentorship: Multi-Tenant Postgres Telemetry",
  type: "mentorship",
  date: new Date(Date.now() + 86400000 * 2).toISOString(),
  timeLabel: "Nov 7, 6:00 PM IST",
  attendees: ["Aarav Sharma", "Ananya Thakur"],
  meetingUrl: "https://meet.google.com/mentor-postgres",
  status: "confirmed",
});

founderActivitiesStore.set("act-4", {
  id: "act-4",
  title: "FinTech Sandbox Cohort Technical Proposal Deadline",
  type: "deadline",
  date: new Date(Date.now() + 86400000 * 5).toISOString(),
  timeLabel: "Nov 10, 11:59 PM IST",
  attendees: ["NovaTech Systems"],
  meetingUrl: "/startups/novatech/sandbox-docs",
  status: "urgent",
});

// Add NovaTelemetry SDK product (by Aarav Sharma / NovaTech Systems)
const prodDev: Product = {
  id: "prod-dev",
  makerId: devFounderProfileId,
  maker: founderProfilesStore.get(devAccountId),
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  name: "NovaTelemetry SDK",
  slug: "novatelemetry-sdk",
  tagline: "Ultra-low overhead distributed tracing for Go & Node services",
  description:
    "Plug-and-play eBPF telemetry exporter designed for high-concurrency microservices and Postgres query inspection with sub-microsecond overhead.",
  problem:
    "Traditional APM agents add 10-15% CPU overhead and introduce significant latency in high-throughput payment and messaging services.",
  solution:
    "Kernel-level eBPF probes that extract latency, socket states, and SQL query plans directly without runtime bytecode rewriting.",
  features: [
    "Zero-overhead kernel probes for Go, Rust, and Node.js",
    "Automated N+1 Postgres query and deadlock detection",
    "OpenTelemetry OTLP exporter & Grafana Tempo integration",
    "Self-hosted privacy mode for banking & fintech workloads",
  ],
  logoUrl: "⚡",
  coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80",
  mediaUrls: [],
  screenshots: [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
  ],
  websiteUrl: "https://novatech.dev/telemetry",
  demoUrl: "https://demo.novatech.dev",
  category: "developer_tools",
  status: "live",
  pricingModel: "freemium",
  technologies: ["Go", "eBPF", "Linux Kernel", "PostgreSQL", "React", "TypeScript"],
  targetAudience: "Site Reliability Engineers, Platform Architects, and Backend Leads",
  upvotesCount: 86,
  followersCount: 42,
  savesCount: 19,
  commentsCount: 8,
  reviewsCount: 4,
  averageRating: 4.9,
  viewsCount: 520,
  websiteClicks: 94,
  launchDate: new Date(Date.now() - 86400000 * 14).toISOString().split("T")[0],
  isPublished: true,
  moderationStatus: "approved",
  createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
launchpadProductsStore.set(prodDev.id, prodDev);


// --- 12. FEATURE 2: FOUNDER FEED STORES & SEEDED DATA ---
export const founderPostsStore = new Map<string, FounderPost>();
export const founderFeedLikesStore = new Set<string>(); // Key: `${profileId}:${postId}`
export const founderSavedPostsStore = new Set<string>(); // Key: `${profileId}:${postId}`
export const founderRepostsStore = new Map<string, any>(); // Key: `${profileId}:${postId}`
export const founderFeedCommentsStore = new Map<string, FounderComment[]>(); // Key: postId
export const founderCommentLikesStore = new Set<string>(); // Key: `${profileId}:${commentId}`
export const founderFollowsStore = new Set<string>(); // Key: `${followerProfileId}:${followedProfileId}`
export const founderMutedAuthorsStore = new Set<string>(); // Key: `${profileId}:${targetProfileId}`
export const founderBlockedAuthorsStore = new Set<string>(); // Key: `${profileId}:${targetProfileId}`
export const founderReportsStore = new Map<string, FounderReport>(); // Key: reportId

// Seed Founder Follows
founderFollowsStore.add(`${devFounderProfileId}:${fourthFounderProfileId}`); // Aarav follows Rohit
founderFollowsStore.add(`${devFounderProfileId}:${thirdFounderProfileId}`);  // Aarav follows Nikhil

// Seed Posts
const fp1: FounderPost = {
  id: "fp-1",
  authorId: devFounderProfileId,
  author: founderProfilesStore.get(devAccountId),
  authorHeadline: "Full-Stack Architect & AI Product Founder",
  postType: "product_launch",
  content: "We just launched the beta of our open-source developer telemetry toolkit (NovaTelemetry SDK)! Looking for feedback from engineers running high-throughput Postgres workloads. #DevTools #Postgres #OpenSource",
  mediaUrls: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=80"],
  mediaType: "image",
  associatedStartupId: "st-dev",
  associatedStartup: startupsStore.get("st-dev"),
  associatedProductId: "prod-dev",
  associatedProduct: launchpadProductsStore.get("prod-dev"),
  audience: "public",
  topics: ["Technology", "Product Launches", "Startups"],
  likesCount: 58,
  commentsCount: 14,
  repostsCount: 6,
  sharesCount: 12,
  createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
};

const fp2: FounderPost = {
  id: "fp-2",
  authorId: thirdFounderProfileId,
  author: founderProfilesStore.get(thirdAccountId),
  authorHeadline: "Founder & CEO, PulseEngine AI",
  postType: "opportunity",
  content: "Seeking a Technical Co-founder with deep experience in Indian payment rails (UPI/BBPS, Account Aggregator framework). Pre-seed committed from top Bangalore angels. Let's chat! #Hiring #FinTech #CoFounder",
  mediaUrls: [],
  mediaType: "none",
  associatedStartupId: "st-1",
  associatedStartup: startupsStore.get("st-1"),
  audience: "public",
  topics: ["Hiring", "Opportunities", "Startups"],
  likesCount: 89,
  commentsCount: 27,
  repostsCount: 14,
  sharesCount: 18,
  createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
};

const fp3: FounderPost = {
  id: "fp-3",
  authorId: fourthFounderProfileId,
  author: founderProfilesStore.get(fourthAccountId),
  authorHeadline: "Ex-Razorpay Senior Staff Engineer",
  postType: "milestone",
  content: "Published our architectural whitepaper on eliminating idempotency race conditions in high-concurrency UPI webhook processors. Zero duplicate settlements at 25,000 webhook events/sec. Distributed systems architecture teardown attached! #DistributedSystems #FinTech #Scalability",
  mediaUrls: ["https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&q=80"],
  mediaType: "image",
  linkPreview: {
    url: "https://razorpay-eng.io/idempotency-at-scale",
    title: "Zero Duplicate Settlements: Idempotency Patterns in FinTech",
    description: "How to handle out-of-order webhook deliveries and distributed locks without database bottleneck.",
  },
  associatedStartupId: "st-mesh",
  associatedStartup: startupsStore.get("st-mesh"),
  audience: "public",
  topics: ["Technology", "Startups", "AI/ML"],
  likesCount: 134,
  commentsCount: 38,
  repostsCount: 22,
  sharesCount: 31,
  createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
};

const fp4: FounderPost = {
  id: "fp-4",
  authorId: "20000000-0000-0000-0000-000000000006",
  author: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  authorHeadline: "B2B SaaS Growth Lead & Angel Investor",
  postType: "startup_announcement",
  content: "The next wave of Indian B2B SaaS will be built on domain-native observability and vertical infra. If you're building in this space, DMs are open for seed feedback and intro to US/SE Asia design partners! #B2BSaaS #Fundraising #Growth",
  mediaUrls: [],
  mediaType: "none",
  audience: "founders",
  topics: ["Startups", "Business", "Fundraising"],
  likesCount: 210,
  commentsCount: 52,
  repostsCount: 19,
  sharesCount: 40,
  createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
};

const fp5: FounderPost = {
  id: "fp-5",
  authorId: seventhFounderProfileId,
  author: founderProfilesStore.get("00000000-0000-0000-0000-000000000007"),
  authorHeadline: "Principal Product Designer (FinTech & Design Systems)",
  postType: "hiring",
  content: "BharatFin Mesh is expanding our core engineering team! We are looking for a Staff Distributed Systems Engineer (Go/Rust) and a Senior Product Designer. Hybrid in Bengaluru. Competitive equity + salary. #Hiring #FinTech #Engineering",
  mediaUrls: [],
  mediaType: "none",
  associatedStartupId: "st-mesh",
  associatedStartup: startupsStore.get("st-mesh"),
  audience: "public",
  topics: ["Hiring", "Business", "Startups"],
  likesCount: 94,
  commentsCount: 16,
  repostsCount: 11,
  sharesCount: 22,
  createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
};

const fp6: FounderPost = {
  id: "fp-6",
  authorId: fifthFounderProfileId,
  author: founderProfilesStore.get("00000000-0000-0000-0000-000000000005"),
  authorHeadline: "Cloud Infrastructure Architect & Pre-Seed Founder",
  postType: "question",
  content: "Question for infra architects: When scaling multi-tenant telemetry ingestion to 50k events/sec with 30-day retention, did you choose TimescaleDB, ClickHouse, or self-hosted Kafka + S3 parquet? What was your operational pain point? #Technology #Community #DevOps",
  mediaUrls: [],
  mediaType: "none",
  audience: "founders",
  topics: ["Technology", "Community", "AI/ML"],
  likesCount: 76,
  commentsCount: 29,
  repostsCount: 8,
  sharesCount: 15,
  createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 32).toISOString(),
};

const fp7: FounderPost = {
  id: "fp-7",
  authorId: devFounderProfileId,
  author: founderProfilesStore.get(devAccountId),
  authorHeadline: "Full-Stack Architect & AI Product Founder",
  postType: "collaboration",
  content: "NovaTech Systems is looking for 3 early design partner startups in the fintech / payment orchestration space to test our zero-overhead Go telemetry exporter. Free tier for 12 months in exchange for bi-weekly engineering feedback. #Collaboration #Startups",
  mediaUrls: [],
  mediaType: "none",
  associatedStartupId: "st-dev",
  associatedStartup: startupsStore.get("st-dev"),
  audience: "connections",
  topics: ["Startups", "Technology"],
  likesCount: 42,
  commentsCount: 9,
  repostsCount: 5,
  sharesCount: 8,
  createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 40).toISOString(),
};

// Seed Repost with commentary (Quote Post by Aarav on fp-3)
const fp8: FounderPost = {
  id: "fp-8",
  authorId: devFounderProfileId,
  author: founderProfilesStore.get(devAccountId),
  authorHeadline: "Full-Stack Architect & AI Product Founder",
  postType: "general",
  content: "Must-read for any backend engineer building distributed ledger systems in India. Rohit's breakdown on idempotency keys is benchmark material. 🚀",
  commentary: "Must-read for any backend engineer building distributed ledger systems in India. Rohit's breakdown on idempotency keys is benchmark material. 🚀",
  repostedPostId: "fp-3",
  repostedPost: fp3,
  repostedByAuthorName: "Aarav Sharma",
  mediaUrls: [],
  mediaType: "none",
  audience: "public",
  topics: ["Technology", "Startups"],
  likesCount: 65,
  commentsCount: 11,
  repostsCount: 7,
  sharesCount: 14,
  createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
};

founderPostsStore.set(fp1.id, fp1);
founderPostsStore.set(fp2.id, fp2);
founderPostsStore.set(fp3.id, fp3);
founderPostsStore.set(fp4.id, fp4);
founderPostsStore.set(fp5.id, fp5);
founderPostsStore.set(fp6.id, fp6);
founderPostsStore.set(fp7.id, fp7);
founderPostsStore.set(fp8.id, fp8);

// Seed Likes & Saves
founderFeedLikesStore.add(`${devFounderProfileId}:fp-2`);
founderFeedLikesStore.add(`${devFounderProfileId}:fp-3`);
founderSavedPostsStore.add(`${devFounderProfileId}:fp-3`);
founderSavedPostsStore.add(`${devFounderProfileId}:fp-4`);

// Seed Comments and Nested Replies for fp-3
const commentsFp3: FounderComment[] = [
  {
    id: "fc-1",
    postId: "fp-3",
    authorId: devFounderProfileId,
    author: founderProfilesStore.get(devAccountId),
    content: "Incredible milestone Rohit! The connection pooling breakdown is pure gold.",
    likesCount: 12,
    replies: [
      {
        id: "fc-1-r1",
        postId: "fp-3",
        authorId: fourthFounderProfileId,
        author: founderProfilesStore.get(fourthAccountId),
        parentId: "fc-1",
        content: "Thanks Aarav! We ended up writing custom pgx connection pools with circuit breakers.",
        likesCount: 5,
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 11).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 11).toISOString(),
  },
  {
    id: "fc-2",
    postId: "fp-3",
    authorId: thirdFounderProfileId,
    author: founderProfilesStore.get(thirdAccountId),
    content: "Are you guys benchmarking with Redis pub-sub or Kafka for webhook queues?",
    likesCount: 8,
    replies: [
      {
        id: "fc-2-r1",
        postId: "fp-3",
        authorId: fourthFounderProfileId,
        author: founderProfilesStore.get(fourthAccountId),
        parentId: "fc-2",
        content: "Sharded Redis streams with consumer groups. The latency profile under 4ms was unbeatable.",
        likesCount: 4,
        createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
];
founderFeedCommentsStore.set("fp-3", commentsFp3);

// Seed Comments for fp-1
founderFeedCommentsStore.set("fp-1", [
  {
    id: "fc-3",
    postId: "fp-1",
    authorId: fourthFounderProfileId,
    author: founderProfilesStore.get(fourthAccountId),
    content: "Outstanding telemetry exporter! Tested the Go agent locally and CPU impact was below 0.8%.",
    likesCount: 6,
    replies: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
]);

// --- 13. FEATURE 3: FOUNDER NETWORK & COFOUNDER DISCOVERY STORES ---
export const founderConnectionsStore = new Map<string, FounderConnection>();
export const cofounderRequestsStore = new Map<string, CofounderRequest>();
export const founderProfileViewsStore = new Map<string, FounderProfileView[]>(); // Key: profileId (viewed)

// Seed Connections
const fconn1: FounderConnection = {
  id: "fconn-1",
  requesterId: devFounderProfileId,
  requester: founderProfilesStore.get(devAccountId),
  recipientId: fourthFounderProfileId,
  recipient: founderProfilesStore.get(fourthAccountId),
  note: "Let's connect regarding UPI settlement rails and distributed database architectures.",
  status: "accepted",
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
};

const fconn2: FounderConnection = {
  id: "fconn-2",
  requesterId: seventhFounderProfileId,
  requester: founderProfilesStore.get("00000000-0000-0000-0000-000000000007"),
  recipientId: devFounderProfileId,
  recipient: founderProfilesStore.get(devAccountId),
  note: "Loved your open-source Go telemetry benchmarks. Would love to connect and share fintech design workflows.",
  status: "pending",
  createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
};

const fconn3: FounderConnection = {
  id: "fconn-3",
  requesterId: devFounderProfileId,
  requester: founderProfilesStore.get(devAccountId),
  recipientId: sixthFounderProfileId,
  recipient: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  note: "Would love to connect regarding your experience scaling enterprise B2B SaaS GTM in South-East Asia.",
  status: "pending",
  createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
};

founderConnectionsStore.set(fconn1.id, fconn1);
founderConnectionsStore.set(fconn2.id, fconn2);
founderConnectionsStore.set(fconn3.id, fconn3);

// Seed Cofounder Requests
const cfr1: CofounderRequest = {
  id: "cfr-1",
  requesterId: fifthFounderProfileId,
  requester: founderProfilesStore.get("00000000-0000-0000-0000-000000000005"),
  recipientId: devFounderProfileId,
  recipient: founderProfilesStore.get(devAccountId),
  introduction: "Hi Aarav, I have followed your work on distributed telemetry and low-overhead eBPF agents.",
  ideaDescription: "Building an Autonomous Multi-Tenant Telemetry & Cloud Cost Allocation Engine for Kubernetes infrastructure.",
  proposedRole: "Technical Co-Founder & Systems Architect",
  reasonForContacting: "Your background in Go, PostgreSQL, and high-throughput networking is exactly what we need to build our distributed data plane.",
  commitmentExpectations: "Full-Time (40+ hrs/wk)",
  equityExpectations: "25-30% Equity + Co-Founder Title",
  associatedStartupId: "st-dev",
  associatedStartup: startupsStore.get("st-dev"),
  status: "pending",
  createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
};

const cfr2: CofounderRequest = {
  id: "cfr-2",
  requesterId: devFounderProfileId,
  requester: founderProfilesStore.get(devAccountId),
  recipientId: thirdFounderProfileId,
  recipient: founderProfilesStore.get(thirdAccountId),
  introduction: "Hey Nikhil, huge fan of what you're achieving with PulseEngine AI.",
  ideaDescription: "Unified high-throughput transaction ledger & telemetry mesh for Indian non-banking lenders.",
  proposedRole: "GTM & Business Co-Founder",
  reasonForContacting: "Complementary strengths: your deep B2B SaaS growth network + my distributed systems architecture.",
  commitmentExpectations: "Full-Time",
  equityExpectations: "20-25% Equity",
  associatedStartupId: "st-dev",
  associatedStartup: startupsStore.get("st-dev"),
  status: "pending",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

cofounderRequestsStore.set(cfr1.id, cfr1);
cofounderRequestsStore.set(cfr2.id, cfr2);

// Seed Profile Views for Aarav Sharma (Premium feature viewer list)
founderProfileViewsStore.set(devFounderProfileId, [
  {
    id: "pv-1",
    profileId: devFounderProfileId,
    viewerId: fourthFounderProfileId,
    viewer: founderProfilesStore.get(fourthAccountId),
    viewedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "pv-2",
    profileId: devFounderProfileId,
    viewerId: sixthFounderProfileId,
    viewer: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
    viewedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "pv-3",
    profileId: devFounderProfileId,
    viewerId: seventhFounderProfileId,
    viewer: founderProfilesStore.get("00000000-0000-0000-0000-000000000007"),
    viewedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "pv-4",
    profileId: devFounderProfileId,
    viewerId: fifthFounderProfileId,
    viewer: founderProfilesStore.get("00000000-0000-0000-0000-000000000005"),
    viewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]);

// --- 13. FEATURE 5: HIRING CENTRE STORES & DATA ---
export const startupJobsStore = new Map<string, JobListing>();
export const jobApplicationsStore = new Map<string, JobApplication>();
export const jobSavedStore = new Set<string>(); // Key: `${profileId}:${jobId}`
export const jobViewsStore = new Set<string>(); // Key: `${profileId}:${jobId}`
export const jobInternalNotesStore = new Map<string, JobInternalNote[]>(); // Key: applicationId
export const jobInterviewsStore = new Map<string, JobInterview>(); // Key: interviewId
export const jobReportsStore = new Map<string, JobModerationReport>();
export const hiringAuditLogsStore = new Map<string, HiringAuditLog>();

/**
 * Checks whether a founder profile is authorized to perform hiring actions for a startup.
 * Confirmed Decision:
 * - Owner: Full hiring control.
 * - Admin: Full hiring control.
 * - Hiring Manager: Access ONLY when explicitly authorized (canManageHiring = true).
 * - Editor: Access ONLY when explicitly granted hiring permission (canManageHiring = true).
 * - Viewer: NO hiring management access.
 */
export function canUserManageHiring(profileId: string, startupId: string): {
  authorized: boolean;
  reason?: string;
  role?: StartupRole;
  canManageHiring?: boolean;
  member?: StartupMember;
} {
  const members = startupMembersStore.get(startupId) || [];
  const member = members.find((m) => m.profileId === profileId);
  if (!member) {
    return {
      authorized: false,
      reason: "Forbidden: You are not an affiliated team member of this startup.",
    };
  }
  if (member.role === "owner" || member.role === "admin") {
    return {
      authorized: true,
      role: member.role,
      canManageHiring: true,
      member,
    };
  }
  if (member.role === "hiring_manager") {
    if (member.canManageHiring) {
      return {
        authorized: true,
        role: member.role,
        canManageHiring: true,
        member,
      };
    }
    return {
      authorized: false,
      role: member.role,
      canManageHiring: false,
      reason: "Forbidden: Hiring Manager access requires explicit authorization from startup owner or admin.",
      member,
    };
  }
  if (member.role === "editor") {
    if (member.canManageHiring) {
      return {
        authorized: true,
        role: member.role,
        canManageHiring: true,
        member,
      };
    }
    return {
      authorized: false,
      role: member.role,
      canManageHiring: false,
      reason: "Forbidden: Editor role requires explicit hiring permission grant from startup owner or admin.",
      member,
    };
  }
  if (member.role === "viewer") {
    return {
      authorized: false,
      role: member.role,
      canManageHiring: false,
      reason: "Forbidden: Viewer role has no hiring management permissions.",
      member,
    };
  }
  return {
    authorized: false,
    reason: "Forbidden: Unauthorized hiring role.",
    member,
  };
}

// Seed Official Startup Jobs
startupJobsStore.set("job-1", {
  id: "job-1",
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  creatorProfileId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  title: "Staff Backend Engineer (Indian Rails & Settlement Ledger)",
  department: "Core Engineering",
  employmentType: "full-time",
  jobSummary: "Lead high-throughput fintech ledger settlement architecture powering UPI & BBPS integrations.",
  description: "BharatFin Mesh is hiring a Staff Backend Engineer to scale our core double-entry accounting ledger engine. You will design fault-tolerant transaction processing pipelines handling tens of thousands of requests per second with strict zero-loss consistency across Indian banking APIs.",
  responsibilities: [
    "Architect and maintain distributed settlement ledgers with atomic multi-region consistency.",
    "Integrate with Indian banking protocols, NPCI UPI rails, and Account Aggregator networks.",
    "Optimize PostgreSQL and Redis caching layers for sub-10ms query latencies.",
    "Mentor junior and mid-level platform engineers and conduct rigorous architectural reviews.",
  ],
  requiredSkills: ["Go", "PostgreSQL", "System Architecture", "Distributed Systems", "FinTech"],
  preferredSkills: ["Kubernetes", "gRPC", "Redis", "Kafka", "AWS"],
  experienceRequirements: "6-10 years",
  qualifications: "B.Tech/M.Tech in Computer Science or equivalent practical distributed systems experience.",
  workMode: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  compensationType: "range",
  compensationMin: 4000000,
  compensationMax: 6000000,
  currency: "INR",
  workingHours: "Full-time (Flexible Core Hours 11 AM - 5 PM)",
  openingsCount: 2,
  applicationDeadline: new Date(Date.now() + 86400000 * 30).toISOString(),
  screeningQuestions: [
    {
      id: "sq-1",
      question: "Describe your experience handling financial idempotency and double-spend prevention in high-concurrency systems.",
      required: true,
      type: "text",
    },
    {
      id: "sq-2",
      question: "Are you willing to work from our Indiranagar, Bengaluru office 3 days a week?",
      required: true,
      type: "yes_no",
    },
  ],
  hiringContact: {
    name: "Aarav Sharma",
    title: "Co-Founder & Chief Architect",
    profileId: devFounderProfileId,
    emailOrProfileUrl: "aarav@bharatfinmesh.in",
  },
  recruitmentProcess: [
    "Initial Profile & Architecture Screen",
    "Technical Deep-Dive & System Design",
    "Live Distributed Systems Pairing",
    "Founders Cultural & Vision Alignment",
  ],
  status: "open",
  viewsCount: 218,
  applicationsCount: 14,
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
});

startupJobsStore.set("job-2", {
  id: "job-2",
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  creatorProfileId: fourthFounderProfileId,
  creator: founderProfilesStore.get(fourthAccountId),
  title: "Principal Product Designer (Fintech UX & Design Systems)",
  department: "Design & UX",
  employmentType: "full-time",
  jobSummary: "Create intuitive, trust-inspiring financial workflows for Indian merchant developers.",
  description: "We are seeking a Principal Product Designer to own the developer and business portal experiences for BharatFin Mesh. You will define our design token architecture, design developer documentation components, and simplify complex multi-bank treasury reconciliation screens.",
  responsibilities: [
    "Own end-to-end UX for merchant developer dashboards and settlement monitors.",
    "Build and maintain a scalable Figma token library adhering to accessible WCAG AA standards.",
    "Collaborate with engineering leads on micro-interactions and high-fidelity prototypes.",
    "Conduct usability tests with real Indian fintech developers and CFO teams.",
  ],
  requiredSkills: ["UI/UX", "Design Systems", "Figma", "Micro-interactions", "User Research"],
  preferredSkills: ["HTML/CSS", "Design Tokens", "FinTech", "Prototyping"],
  experienceRequirements: "5-9 years",
  qualifications: "Proven portfolio of complex SaaS, B2B, or financial web products.",
  workMode: "remote",
  broadLocation: "Pan-India Remote",
  compensationType: "range",
  compensationMin: 2800000,
  compensationMax: 4500000,
  currency: "INR",
  workingHours: "Full-time Remote",
  openingsCount: 1,
  applicationDeadline: new Date(Date.now() + 86400000 * 25).toISOString(),
  screeningQuestions: [
    {
      id: "sq-3",
      question: "Share a link to your Figma design system or portfolio case study showcasing complex workflows.",
      required: true,
      type: "text",
    },
  ],
  hiringContact: {
    name: "Rohit Chawla",
    title: "Engineering Lead",
    profileId: fourthFounderProfileId,
  },
  recruitmentProcess: [
    "Portfolio Walkthrough",
    "Design Challenge Review",
    "Team Collaboration Session",
    "Offer & Alignment",
  ],
  status: "open",
  viewsCount: 174,
  applicationsCount: 8,
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
});

startupJobsStore.set("job-3", {
  id: "job-3",
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  creatorProfileId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  title: "Growth & Product Marketing Lead",
  department: "Growth & Marketing",
  employmentType: "full-time",
  jobSummary: "Lead developer adoption and product-led growth for our distributed event mesh infrastructure.",
  description: "NovaTech Systems is expanding our B2B SaaS reach. We are hiring our first Product Marketing Lead to craft compelling technical narratives, run developer community initiatives, and establish outbound pipeline across Indian tech hubs.",
  responsibilities: [
    "Develop developer-first messaging and technical launch collateral.",
    "Drive PLG acquisition through developer webinars, Hackathons, and technical case studies.",
    "Coordinate with product engineering on user onboarding drop-off metrics.",
  ],
  requiredSkills: ["B2B SaaS", "Growth Marketing", "Developer Relations", "GTM Strategy"],
  preferredSkills: ["Content Strategy", "Analytics", "SEO", "HubSpot"],
  experienceRequirements: "4-7 years",
  workMode: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  compensationType: "range",
  compensationMin: 2400000,
  compensationMax: 3800000,
  currency: "INR",
  openingsCount: 1,
  applicationDeadline: new Date(Date.now() + 86400000 * 20).toISOString(),
  screeningQuestions: [],
  status: "open",
  viewsCount: 96,
  applicationsCount: 5,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
});

startupJobsStore.set("job-4", {
  id: "job-4",
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  creatorProfileId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  title: "Distributed Systems Engineering Intern",
  department: "Core Engineering",
  employmentType: "internship",
  jobSummary: "6-month intensive internship building real-time event streaming protocols with Go.",
  description: "Join NovaTech Systems as a core engineering intern. You will work directly with our CTO on open-source distributed event mesh protocols, benchmarking latency, and writing unit/fuzz tests.",
  responsibilities: [
    "Write concurrent Go benchmarks for TCP socket connections.",
    "Implement automated integration test suites for event broker nodes.",
    "Draft technical documentation and architecture diagrams.",
  ],
  requiredSkills: ["Go", "Distributed Systems", "Git", "Linux"],
  preferredSkills: ["Docker", "Networking", "PostgreSQL"],
  experienceRequirements: "0-1 years (College Seniors or Recent Grads)",
  workMode: "remote",
  broadLocation: "Pan-India Remote",
  compensationType: "fixed",
  compensationMin: 50000,
  compensationMax: 50000,
  currency: "INR",
  workingHours: "Full-time Internship (40 hrs/wk for 6 months)",
  openingsCount: 3,
  applicationDeadline: new Date(Date.now() + 86400000 * 14).toISOString(),
  screeningQuestions: [
    {
      id: "sq-4",
      question: "Link to your GitHub profile or public code repositories.",
      required: true,
      type: "text",
    },
  ],
  status: "open",
  viewsCount: 312,
  applicationsCount: 42,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
});

startupJobsStore.set("job-5", {
  id: "job-5",
  startupId: "st-1",
  startup: startupsStore.get("st-1"),
  creatorProfileId: thirdFounderProfileId,
  creator: founderProfilesStore.get(thirdAccountId),
  title: "Senior Observability & Cost Telemetry Engineer",
  department: "Platform Engineering",
  employmentType: "contract",
  jobSummary: "6-month contract building Kubernetes eBPF probes for autonomous cloud cost telemetry.",
  description: "PulseEngine AI is expanding our eBPF sensor agent. We need a specialized systems engineer to hook Linux kernel network events and attribute cloud container egress costs dynamically.",
  responsibilities: [
    "Develop kernel eBPF probes in C / Rust for pod network socket telemetry.",
    "Optimize agent daemon memory footprint to under 30MB per node.",
  ],
  requiredSkills: ["Kubernetes", "Rust", "Observability", "Go", "Cloud Cost"],
  preferredSkills: ["eBPF", "Linux Kernel", "Prometheus"],
  experienceRequirements: "5+ years",
  workMode: "remote",
  broadLocation: "Pan-India Remote",
  compensationType: "range",
  compensationMin: 3200000,
  compensationMax: 4800000,
  currency: "INR",
  openingsCount: 1,
  applicationDeadline: new Date(Date.now() + 86400000 * 45).toISOString(),
  screeningQuestions: [],
  status: "open",
  viewsCount: 140,
  applicationsCount: 6,
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
});

// Seed paused, closed, and draft jobs for testing lifecycle & safety
startupJobsStore.set("job-6", {
  id: "job-6",
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  creatorProfileId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  title: "Frontend Architect (Design Systems & Micro-frontends)",
  department: "Engineering",
  employmentType: "full-time",
  jobSummary: "Paused while hiring panel completes final interviews.",
  description: "Full-time position temporarily paused.",
  responsibilities: ["Lead front-end architecture"],
  requiredSkills: ["React", "TypeScript"],
  preferredSkills: ["TailwindCSS"],
  experienceRequirements: "7+ years",
  workMode: "hybrid",
  broadLocation: "Bengaluru, Karnataka",
  compensationType: "negotiable",
  currency: "INR",
  openingsCount: 1,
  applicationDeadline: new Date(Date.now() + 86400000 * 10).toISOString(),
  screeningQuestions: [],
  status: "paused",
  viewsCount: 88,
  applicationsCount: 11,
  createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
});

startupJobsStore.set("job-7", {
  id: "job-7",
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  creatorProfileId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  title: "Junior QA Automation Engineer",
  department: "Quality Assurance",
  employmentType: "full-time",
  jobSummary: "Position has been filled and closed.",
  description: "Closed job position.",
  responsibilities: ["Automated testing"],
  requiredSkills: ["Playwright", "TypeScript"],
  preferredSkills: [],
  experienceRequirements: "1-3 years",
  workMode: "remote",
  broadLocation: "Bengaluru, Karnataka",
  compensationType: "not_disclosed",
  currency: "INR",
  openingsCount: 1,
  applicationDeadline: new Date(Date.now() - 86400000 * 5).toISOString(),
  screeningQuestions: [],
  status: "closed",
  viewsCount: 120,
  applicationsCount: 19,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
});

startupJobsStore.set("job-8", {
  id: "job-8",
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  creatorProfileId: devFounderProfileId,
  creator: founderProfilesStore.get(devAccountId),
  title: "Executive Operations & Chief of Staff",
  department: "Executive",
  employmentType: "full-time",
  jobSummary: "Internal draft position pending board budget sign-off.",
  description: "Draft role — not visible to public candidates.",
  responsibilities: ["Executive strategy and cross-functional operations."],
  requiredSkills: ["Operations", "Strategy", "FinTech"],
  preferredSkills: [],
  experienceRequirements: "4-8 years",
  workMode: "on-site",
  broadLocation: "Bengaluru, Karnataka",
  compensationType: "range",
  compensationMin: 2200000,
  compensationMax: 3500000,
  currency: "INR",
  openingsCount: 1,
  applicationDeadline: new Date(Date.now() + 86400000 * 40).toISOString(),
  screeningQuestions: [],
  status: "draft",
  viewsCount: 0,
  applicationsCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Seed Initial Job Applications
jobApplicationsStore.set("app-1", {
  id: "app-1",
  jobId: "job-1",
  job: startupJobsStore.get("job-1"),
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  applicantProfileId: seventhFounderProfileId,
  applicant: founderProfilesStore.get("00000000-0000-0000-0000-000000000007"),
  personalIntro: "I have 7 years of distributed financial systems experience, having previously architected checkout settlement flows at CRED. Exciting to see BharatFin Mesh's architecture.",
  resumeUrl: "/uploads/resumes/sneha_iyer_cv.pdf",
  resumeFileName: "Sneha_Iyer_Staff_Resume.pdf",
  resumeFileSize: 1420500,
  relevantSkills: ["Go", "PostgreSQL", "System Architecture", "FinTech", "Distributed Systems"],
  experienceYears: 7,
  currentRole: "Principal Systems Designer & Engineer",
  portfolioUrl: "https://github.com/sneha-iyer",
  projectsSummary: "Designed zero-loss double-entry transaction journals handling ₹50Cr+ daily settlement volume.",
  availability: "full_time",
  joiningTimeline: "30 days",
  expectedCompensation: "₹50,00,000 / year",
  screeningAnswers: {
    "sq-1": "Implemented two-phase commit over Raft with deterministic idempotency keys stored in Redis with distributed redlock fallbacks.",
    "sq-2": "Yes, I am based in Indiranagar and can readily come 3 days a week.",
  },
  status: "shortlisted",
  statusHistory: [
    {
      status: "applied",
      changedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      status: "viewed",
      changedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      changedByProfileId: fourthFounderProfileId,
    },
    {
      status: "shortlisted",
      changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      changedByProfileId: devFounderProfileId,
      reasonOrNote: "Excellent technical alignment with our double-entry ledger design.",
    },
  ],
  reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  canMessage: true,
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
});

jobApplicationsStore.set("app-2", {
  id: "app-2",
  jobId: "job-3",
  job: startupJobsStore.get("job-3"),
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  applicantProfileId: sixthFounderProfileId,
  applicant: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  personalIntro: "12 years leading GTM and growth funnels for B2B developer platforms. Built Freshworks enterprise pipelines across APAC.",
  resumeUrl: "/uploads/resumes/vikram_malhotra_cv.pdf",
  resumeFileName: "Vikram_Malhotra_Growth_CV.pdf",
  resumeFileSize: 890000,
  relevantSkills: ["B2B SaaS", "GTM Strategy", "PLG", "Enterprise Sales"],
  experienceYears: 12,
  currentRole: "VP of Growth & Strategy",
  availability: "full_time",
  joiningTimeline: "Immediate",
  screeningAnswers: {},
  status: "applied",
  statusHistory: [
    {
      status: "applied",
      changedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
  canMessage: true,
  createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
});

jobApplicationsStore.set("app-3", {
  id: "app-3",
  jobId: "job-5",
  job: startupJobsStore.get("job-5"),
  startupId: "st-1",
  startup: startupsStore.get("st-1"),
  applicantProfileId: fifthFounderProfileId,
  applicant: founderProfilesStore.get("00000000-0000-0000-0000-000000000005"),
  personalIntro: "Kubernetes and cloud telemetry specialist. Extensive experience deploying custom eBPF agents for cost monitoring at Postman.",
  resumeUrl: "/uploads/resumes/ananya_thakur_cv.pdf",
  resumeFileName: "Ananya_Thakur_Kubernetes_Resume.pdf",
  resumeFileSize: 1100200,
  relevantSkills: ["Kubernetes", "Rust", "Observability", "Go", "Cloud Cost"],
  experienceYears: 8,
  currentRole: "Lead Cloud Architect",
  availability: "full_time",
  joiningTimeline: "15 days",
  expectedCompensation: "₹45,00,000 / year",
  screeningAnswers: {},
  status: "interview",
  statusHistory: [
    { status: "applied", changedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { status: "viewed", changedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { status: "shortlisted", changedAt: new Date(Date.now() - 86400000 * 1.5).toISOString() },
    { status: "interview", changedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  ],
  reviewedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  canMessage: true,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
});

// Seed Interviews
jobInterviewsStore.set("int-1", {
  id: "int-1",
  applicationId: "app-3",
  startupId: "st-1",
  jobId: "job-5",
  scheduledByProfileId: thirdFounderProfileId,
  candidateProfileId: fifthFounderProfileId,
  candidateName: "Ananya Thakur",
  jobTitle: "Senior Observability & Cost Telemetry Engineer",
  interviewDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
  interviewTime: "03:30 PM",
  timezone: "Asia/Kolkata",
  interviewType: "technical",
  meetingLocationOrLink: "https://meet.google.com/xyz-pulse-interview",
  instructions: "Please prepare a 15-minute walkthrough of a production eBPF or Kubernetes networking incident you diagnosed.",
  candidateFacingNotes: "Technical interview with Nikhil Varma (CEO) and lead infrastructure architect.",
  recruiterPrivateNotes: "Focus on memory footprint minimization in high-cardinality Prometheus metrics.",
  status: "scheduled",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
});

// Seed Private Recruiter Internal Notes
jobInternalNotesStore.set("app-1", [
  {
    id: "note-1",
    applicationId: "app-1",
    startupId: "st-mesh",
    authorProfileId: fourthFounderProfileId,
    authorName: "Rohit Chawla",
    note: "Reviewed candidate's previous contributions to UPI payment switches. Very strong depth in database isolation levels and zero-loss reconciliations.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "note-2",
    applicationId: "app-1",
    startupId: "st-mesh",
    authorProfileId: devFounderProfileId,
    authorName: "Aarav Sharma",
    note: "Shortlisted for next round. Let's schedule a 45-minute architectural pairing session on distributed saga patterns.",
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
]);

// Seed Saved Jobs
jobSavedStore.add(`${devFounderProfileId}:job-5`); // Aarav saved PulseEngine SRE job
jobSavedStore.add(`${seventhFounderProfileId}:job-1`); // Sneha saved BharatFin job

// Seed Audit Logs
hiringAuditLogsStore.set("audit-1", {
  id: "audit-1",
  startupId: "st-mesh",
  actorProfileId: devFounderProfileId,
  action: "job_created",
  entityType: "job",
  entityId: "job-1",
  metadata: { title: "Staff Backend Engineer" },
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
});

// --- 14. FEATURE 6: STARTUP HUB STORES & DATA ---
export const startupInvitationsStore = new Map<string, StartupInvitation>();
export const ownershipTransferRequestsStore = new Map<string, OwnershipTransferRequest>();
export const startupUpdatesStore = new Map<string, StartupUpdate>();
export const startupFollowsStore = new Set<string>(); // Key: `${startupId}:${profileId}`
export const startupConnectionsStore = new Map<string, StartupConnection>(); // Key: `${startupId}:${profileId}`
export const startupActivityLogsStore = new Map<string, StartupActivityLog>();
export const startupInvestInquiriesStore = new Map<string, StartupInvestInquiry>();
export const startupViewsStore = new Set<string>(); // Key: `${startupId}:${profileId}`

// Helpers for Feature 6 permissions
export function isStartupOwner(profileId: string, startupId: string): boolean {
  const members = startupMembersStore.get(startupId) || [];
  return members.some((m) => m.profileId === profileId && m.role === "owner");
}

export function isStartupAdminOrOwner(profileId: string, startupId: string): boolean {
  const members = startupMembersStore.get(startupId) || [];
  return members.some(
    (m) => m.profileId === profileId && (m.role === "owner" || m.role === "admin")
  );
}

export function canUserPublishStartupUpdates(profileId: string, startupId: string): boolean {
  const members = startupMembersStore.get(startupId) || [];
  const member = members.find((m) => m.profileId === profileId);
  if (!member) return false;
  return member.role === "owner" || member.role === "admin" || Boolean(member.canPublishUpdates);
}

// Enhance seeded startups with Feature 6 fields
const meshStartup = startupsStore.get("st-mesh");
if (meshStartup) {
  meshStartup.fullAbout =
    "BharatFin Mesh is an India-first distributed financial network that enables instant reconciliation and settlement for fintechs, neo-banks, and lending protocols across UPI, BBPS, and Account Aggregator rails.";
  meshStartup.problem =
    "Indian fintechs suffer from 2-3 day settlement reconciliation lags, multi-point failure across legacy core banking switches, and high transaction drop-off rates.";
  meshStartup.solution =
    "A unified event-driven settlement mesh with distributed double-entry ledgers, automated idempotency, and sub-10ms reconciliation latency.";
  meshStartup.additionalCategories = ["FinTech", "Banking Infrastructure", "Developer Tools"];
  meshStartup.foundedDate = "2024-03-15";
  meshStartup.businessModel = "B2B SaaS API usage fees + Basis point volume-tiered settlement fee";
  meshStartup.technologies = ["Go", "PostgreSQL", "Kafka", "Redis", "AWS Bare Metal", "Docker"];
  meshStartup.targetCustomers = "Indian Series A+ fintechs, non-banking lenders, and payment gateways";
  meshStartup.socialLinks = {
    twitter: "https://twitter.com/bharatfinmesh",
    linkedin: "https://linkedin.com/company/bharatfinmesh",
    github: "https://github.com/bharatfinmesh",
  };
  meshStartup.visibilitySettings = {
    isPublic: true,
    showTeam: true,
    showContact: true,
    allowCollabs: true,
    allowConnects: true,
  };
  meshStartup.followersCount = 428;
  meshStartup.connectionsCount = 56;
  startupsStore.set("st-mesh", meshStartup);
}

const devStartup = startupsStore.get("st-dev");
if (devStartup) {
  devStartup.fullAbout =
    "NovaTech Systems develops low-latency distributed event meshes and messaging fabrics designed for mission-critical Indian developer infrastructure.";
  devStartup.problem =
    "High-throughput microservices struggle with message ordering, deadlocks, and unpredictable cloud egress costs across cloud regions.";
  devStartup.solution =
    "Zero-allocation Go-based messaging fabric capable of sustaining 2M+ events per node with microsecond p99 latency.";
  devStartup.additionalCategories = ["Developer Tools", "B2B SaaS", "Cloud Infrastructure"];
  devStartup.foundedDate = "2023-11-01";
  devStartup.businessModel = "Annual developer enterprise license + Managed cloud tier";
  devStartup.technologies = ["Go", "Kubernetes", "gRPC", "eBPF", "Prometheus"];
  devStartup.targetCustomers = "Enterprise platform teams and mid-market engineering organizations";
  devStartup.socialLinks = {
    twitter: "https://twitter.com/novatechsystems",
    github: "https://github.com/novatech-systems",
  };
  devStartup.visibilitySettings = {
    isPublic: true,
    showTeam: true,
    showContact: true,
    allowCollabs: true,
    allowConnects: true,
  };
  devStartup.followersCount = 215;
  devStartup.connectionsCount = 32;
  startupsStore.set("st-dev", devStartup);
}

// Seed Startup Updates
startupUpdatesStore.set("upd-1", {
  id: "upd-1",
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  authorProfileId: devFounderProfileId,
  author: founderProfilesStore.get(devAccountId),
  title: "BharatFin Mesh V2 Settlement Gateway Now Live on NPCI Sandbox",
  content:
    "We are thrilled to announce that BharatFin Mesh V2 has completed end-to-end sandbox testing with 4 partner banks. Our automated dispute resolution engine resolved 100% of synthetic transaction failures in under 4 seconds.",
  updateType: "product_update",
  mediaUrls: [],
  associatedJobId: "job-1",
  likesCount: 54,
  commentsCount: 9,
  sharesCount: 12,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
});

startupUpdatesStore.set("upd-2", {
  id: "upd-2",
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  authorProfileId: devFounderProfileId,
  author: founderProfilesStore.get(devAccountId),
  title: "NovaTech Event Mesh Surpasses 1 Billion Monthly Transactions",
  content:
    "Milestone unlocked! Our developer nodes across Bengaluru, Mumbai, and Hyderabad processed over 1.2B events with 99.999% uptime this month. Special thanks to our 40+ early adopter tech teams.",
  updateType: "milestone",
  mediaUrls: [],
  likesCount: 88,
  commentsCount: 14,
  sharesCount: 22,
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
});

// Seed Follows & Connections
startupFollowsStore.add(`st-mesh:${thirdFounderProfileId}`);
startupFollowsStore.add(`st-mesh:${sixthFounderProfileId}`);
startupFollowsStore.add(`st-dev:${seventhFounderProfileId}`);

// Seed Team Invitation
startupInvitationsStore.set("inv-1", {
  id: "inv-1",
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  inviteeProfileId: sixthFounderProfileId, // Vikram
  invitee: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  invitedByProfileId: devFounderProfileId,
  invitedBy: founderProfilesStore.get(devAccountId),
  role: "admin",
  title: "VP of Strategic Growth & Alliances",
  status: "pending",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
});

// Seed Activity Audit Log
startupActivityLogsStore.set("act-1", {
  id: "act-1",
  startupId: "st-mesh",
  actorProfileId: devFounderProfileId,
  action: "startup_created",
  details: "Aarav Sharma established BharatFin Mesh",
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
});

// ====================================================================
// --- 15. FEATURE 7: PRODUCT LAUNCHPAD STORES & AUTOMATED MODERATION ---
// ====================================================================

export const productCommentsStore = new Map<string, ProductComment>();
export const productCommentLikesStore = new Set<string>(); // `${commentId}:${profileId}`
export const productReviewsStore = new Map<string, ProductReview>();
export const productUpdatesStore = new Map<string, ProductUpdate>();
export const productFollowsStore = new Set<string>(); // `${productId}:${profileId}`
export const productSavesStore = new Set<string>(); // `${productId}:${profileId}`
export const productCollectionsStore = new Map<string, ProductCollection>();
export const productModerationRecordsStore = new Map<string, ProductModerationRecord>();
export const productModerationAppealsStore = new Map<string, ProductModerationAppeal>();
export const productViewsStore = new Map<string, number>();
export const productClicksStore = new Map<string, number>();

// --- Automated Moderation Engine (Option A) ---
export interface ModerationResult {
  status: ProductModerationStatus;
  reason?: string;
  flags: string[];
}

export function runAutomatedModeration(payload: {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  demoUrl?: string | null;
}): ModerationResult {
  const flags: string[] = [];
  const textToScan = `${payload.name} ${payload.tagline} ${payload.description} ${payload.websiteUrl} ${payload.demoUrl || ""}`.toLowerCase();

  // Severe Malicious / Phishing patterns -> restricted immediately
  const maliciousPatterns = [
    { pattern: "bit.ly/malicious", reason: "Known malicious shortlink detected" },
    { pattern: "phish-", reason: "Potential credential-harvesting phishing domain detected" },
    { pattern: "malware-download", reason: "Malware distribution payload flagged" },
    { pattern: "crypto-scam", reason: "Suspected fraudulent crypto investment scheme" },
    { pattern: "scamcryptobot", reason: "Flagged unauthorized automated bot network" },
    { pattern: "steal-passwords", reason: "Prohibited security vulnerability exploit" },
    { pattern: "100% free crypto giveaway", reason: "Prohibited financial spam / giveaway fraud" },
    { pattern: "earn ₹100000 daily with zero investment guaranteed", reason: "Deceptive financial earnings scheme" },
    { pattern: "<script", reason: "Potential cross-site script injection attempt" },
    { pattern: "javascript:", reason: "Disallowed JavaScript URI protocol" },
  ];

  for (const m of maliciousPatterns) {
    if (textToScan.includes(m.pattern)) {
      flags.push(m.reason);
      return {
        status: "restricted",
        reason: `Automated security detection: ${m.reason}`,
        flags,
      };
    }
  }

  // Monitoring patterns -> approved with monitoring
  const monitoringPatterns = [
    { pattern: "test-monitoring", reason: "Flagged for standard new account activity monitoring" },
    { pattern: "beta-invite-only", reason: "Private beta monitoring" },
  ];

  for (const mon of monitoringPatterns) {
    if (textToScan.includes(mon.pattern)) {
      flags.push(mon.reason);
      return {
        status: "monitoring",
        reason: "Published immediately under automated community monitoring.",
        flags,
      };
    }
  }

  return {
    status: "approved",
    flags: [],
  };
}

// Seed Additional Diverse Products across categories
const prod2: Product = {
  id: "prod-2",
  makerId: fourthFounderProfileId,
  maker: founderProfilesStore.get(fourthAccountId),
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  name: "BharatFlow Ledger",
  slug: "bharatflow-ledger",
  tagline: "High-throughput settlement reconciliation for Indian NBFCs",
  description:
    "Automated double-entry reconciliation engine built for Indian payments infrastructure, eliminating batch settlement discrepancies across NPCI, IMPS, and BBPS.",
  problem:
    "NBFCs and digital lenders face 3-5% daily settlement reconciliation lag across disparate banking gateways and partner banks.",
  solution:
    "Real-time idempotency-safe distributed ledger tracking millions of daily transactions with zero ledger drift.",
  features: [
    "Native NPCI UPI & BBPS reconciliation switches",
    "Real-time webhook ingestion with automated retry queue",
    "Audited cryptographic transaction hash proofs",
    "Multi-entity ledger partitioning",
  ],
  logoUrl: "💳",
  coverUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",
  mediaUrls: [],
  screenshots: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  ],
  websiteUrl: "https://bharatfin.in/ledger",
  demoUrl: "https://demo.bharatfin.in/ledger",
  category: "finance",
  status: "live",
  pricingModel: "paid",
  technologies: ["Go", "PostgreSQL", "Kafka", "Redis", "Docker"],
  targetAudience: "FinTech Founders, NBFC CFOs, and Settlement Engineering Teams",
  upvotesCount: 115,
  followersCount: 54,
  savesCount: 31,
  commentsCount: 9,
  reviewsCount: 5,
  averageRating: 4.7,
  viewsCount: 840,
  websiteClicks: 162,
  launchDate: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0],
  isPublished: true,
  moderationStatus: "approved",
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
launchpadProductsStore.set(prod2.id, prod2);

const prod3: Product = {
  id: "prod-3",
  makerId: seventhFounderProfileId,
  maker: founderProfilesStore.get("00000000-0000-0000-0000-000000000007"),
  startupId: null,
  name: "CraftUI Design Kit",
  slug: "craftui-design-kit",
  tagline: "Accessible Figma tokens and Tailwind components for B2B dashboards",
  description:
    "Battle-tested component library with WCAG AAA contrast, responsive data grids, and keyboard accessible charts designed for enterprise startups.",
  problem:
    "Early stage founders spend weeks rebuilding standard tables, filters, and modals from scratch.",
  solution:
    "A production-ready library of 150+ pre-composed dashboard blocks with full TypeScript and Figma variant sync.",
  features: [
    "150+ accessible enterprise components",
    "Native Tailwind v4 and React 19 support",
    "Pre-built financial, analytics, and CRM screen templates",
    "Automatic dark/light mode token swapping",
  ],
  logoUrl: "🎨",
  coverUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80",
  mediaUrls: [],
  screenshots: [],
  websiteUrl: "https://craftui.design",
  category: "design",
  status: "live",
  pricingModel: "freemium",
  technologies: ["React", "TypeScript", "Tailwind CSS", "Figma"],
  targetAudience: "Frontend Developers and Product Designers",
  upvotesCount: 92,
  followersCount: 29,
  savesCount: 45,
  commentsCount: 5,
  reviewsCount: 2,
  averageRating: 5.0,
  viewsCount: 410,
  websiteClicks: 85,
  launchDate: new Date(Date.now() - 86400000 * 7).toISOString().split("T")[0],
  isPublished: true,
  moderationStatus: "approved",
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
};
launchpadProductsStore.set(prod3.id, prod3);

const prod4: Product = {
  id: "prod-4",
  makerId: sixthFounderProfileId,
  maker: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  startupId: null,
  name: "CloudShield Guard",
  slug: "cloudshield-guard",
  tagline: "Automated AWS & GCP IAM posture scanning with zero false positives",
  description:
    "Detect over-permissioned service accounts, public S3 buckets, and lingering access keys across multiple cloud provider organizations.",
  features: [
    "Real-time IAM drift alerts via Slack & PagerDuty",
    "One-click least-privilege policy generation",
    "SOC 2 and ISO 27001 automated compliance reports",
  ],
  logoUrl: "🛡️",
  coverUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
  mediaUrls: [],
  screenshots: [],
  websiteUrl: "https://cloudshield.dev",
  category: "saas",
  status: "live",
  pricingModel: "subscription",
  technologies: ["Python", "AWS SDK", "GCP Cloud APIs", "Terraform"],
  upvotesCount: 76,
  followersCount: 21,
  savesCount: 16,
  commentsCount: 3,
  reviewsCount: 1,
  averageRating: 4.5,
  viewsCount: 310,
  websiteClicks: 62,
  launchDate: new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0],
  isPublished: true,
  moderationStatus: "approved",
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
};
launchpadProductsStore.set(prod4.id, prod4);

const prodRestricted: Product = {
  id: "prod-restricted",
  makerId: devFounderProfileId,
  maker: founderProfilesStore.get(devAccountId),
  startupId: null,
  name: "ScamCryptoBot Automated Signals",
  slug: "scamcryptobot-signals",
  tagline: "Earn 100% daily returns with automated high-frequency trading bot",
  description:
    "Guaranteed automated trading signals linking to bit.ly/malicious wallet drainer contracts for testing moderation.",
  logoUrl: "🤖",
  mediaUrls: [],
  websiteUrl: "https://bit.ly/malicious-drainer",
  category: "finance",
  status: "live",
  pricingModel: "paid",
  upvotesCount: 0,
  followersCount: 0,
  savesCount: 0,
  commentsCount: 0,
  reviewsCount: 0,
  viewsCount: 12,
  websiteClicks: 0,
  launchDate: new Date().toISOString().split("T")[0],
  isPublished: false,
  moderationStatus: "restricted",
  moderationReason: "Automated security detection: Known malicious shortlink detected",
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};
launchpadProductsStore.set(prodRestricted.id, prodRestricted);

// Seed Upvotes
launchpadUpvotesStore.add(`${devFounderProfileId}:prod-dev`);
launchpadUpvotesStore.add(`${devFounderProfileId}:prod-2`);
launchpadUpvotesStore.add(`${fourthFounderProfileId}:prod-dev`);
launchpadUpvotesStore.add(`${fourthFounderProfileId}:prod-1`);

// Seed Follows & Saves
productFollowsStore.add(`prod-dev:${fourthFounderProfileId}`);
productFollowsStore.add(`prod-1:${devFounderProfileId}`);
productSavesStore.add(`prod-dev:${fourthFounderProfileId}`);
productSavesStore.add(`prod-1:${devFounderProfileId}`);

// Seed Comments and Maker replies
const c1: ProductComment = {
  id: "comm-1",
  productId: "prod-dev",
  authorId: fourthFounderProfileId,
  author: founderProfilesStore.get(fourthAccountId),
  content: "Does NovaTelemetry require root privileges on Kubernetes worker nodes to attach eBPF probes?",
  isQuestion: true,
  isMakerReply: false,
  likesCount: 3,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};
productCommentsStore.set(c1.id, c1);

const c2: ProductComment = {
  id: "comm-2",
  productId: "prod-dev",
  authorId: devFounderProfileId, // Aarav is the maker of prod-dev!
  author: founderProfilesStore.get(devAccountId),
  parentId: "comm-1",
  content: "Great question Rohit! We only require CAP_BPF and CAP_PERFMON capabilities under Linux 5.8+, so full root or privileged container mode is not required.",
  isQuestion: false,
  isMakerReply: true, // Visible Maker badge!
  likesCount: 5,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
productCommentsStore.set(c2.id, c2);

// Seed Comment Likes
productCommentLikesStore.add(`comm-1:${devFounderProfileId}`);
productCommentLikesStore.add(`comm-2:${fourthFounderProfileId}`);

// Seed Product Reviews
const r1: ProductReview = {
  id: "rev-1",
  productId: "prod-dev",
  reviewerId: fourthFounderProfileId,
  reviewer: founderProfilesStore.get(fourthAccountId),
  rating: 5,
  title: "Game changer for high-throughput microservices",
  content: "We plugged NovaTelemetry into our staging ledger nodes. CPU overhead remained well below 0.5% while giving us instant distributed span visualization.",
  isVerifiedUser: true,
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
};
productReviewsStore.set(r1.id, r1);

// Seed Product Updates
const u1: ProductUpdate = {
  id: "upd-prod-1",
  productId: "prod-dev",
  makerId: devFounderProfileId,
  title: "v1.2.0 Released: Postgres Deadlock Inspection & OTLP 1.0",
  content: "NovaTelemetry v1.2.0 is live! We added zero-overhead lock wait visualization for PostgreSQL and full compatibility with OpenTelemetry collectors.",
  version: "1.2.0",
  mediaUrls: [],
  broadcastToFeed: true,
  feedPostId: "fp-1",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
productUpdatesStore.set(u1.id, u1);

// Seed Collections
const col1: ProductCollection = {
  id: "col-1",
  ownerId: devFounderProfileId,
  name: "Top Developer & Infra Tools 2026",
  description: "Curated collection of high-performance backend, observability, and devtools launched on Balaga.",
  isPublic: true,
  itemCount: 2,
  productIds: ["prod-dev", "prod-1"],
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
productCollectionsStore.set(col1.id, col1);

// Seed Moderation Record
const modRec1: ProductModerationRecord = {
  id: "mod-rec-1",
  productId: "prod-restricted",
  previousStatus: "approved",
  newStatus: "restricted",
  reason: "Automated security detection: Known malicious shortlink detected",
  triggeredBy: "automated_system",
  details: { flaggedWord: "bit.ly/malicious", detectedField: "websiteUrl" },
  createdAt: new Date(Date.now() - 3600000).toISOString(),
};
productModerationRecordsStore.set(modRec1.id, modRec1);

// ====================================================================
// --- 16. FEATURE 8: STARTUP COLLABORATION NETWORK STORES & HELPERS ---
// ====================================================================

export const startupCollaborationProfilesStore = new Map<string, StartupCollaborationProfile>();
export const startupOutreachAllowancesStore = new Map<string, StartupOutreachAllowance>();
export const partnershipMessagesStore = new Map<string, PartnershipMessage[]>(); // Key: spaceId
export const partnershipTasksStore = new Map<string, PartnershipTask>();
export const partnershipMilestonesStore = new Map<string, PartnershipMilestone>();
export const partnershipDocumentsStore = new Map<string, PartnershipDocument>();
export const partnershipMeetingsStore = new Map<string, PartnershipMeeting>();
export const partnershipReferralsStore = new Map<string, PartnershipReferral>();
export const partnershipCommissionsStore = new Map<string, PartnershipCommission>();
export const partnershipReviewsStore = new Map<string, PartnershipReview>();
export const partnershipDisputesStore = new Map<string, PartnershipDispute>();
export const partnershipActivityLogsStore = new Map<string, PartnershipActivityLog>();

// Helper: Check if founder can manage collaboration for a startup (Owner, Admin or canManageCollabs)
export function canUserManageStartupCollabs(profileId: string, startupId: string): boolean {
  const members = startupMembersStore.get(startupId) || [];
  const member = members.find((m) => m.profileId === profileId);
  if (!member) return false;
  return member.role === "owner" || member.role === "admin" || Boolean(member.canManageCollabs);
}

// Option A: Controlled Outreach Allowance
export function getStartupOutreachAllowance(startupId: string): StartupOutreachAllowance {
  const baseWeeklyLimit = 5; // Default 5 per rolling 7 days
  // Compute earned bonus based on completed partnerships
  const completedCount = Array.from(partnershipSpacesStore.values()).filter(
    (s) => (s.startupAId === startupId || s.startupBId === startupId) && s.status === "completed"
  ).length;
  const earnedBonusLimit = Math.min(5, completedCount * 2);
  const totalWeeklyLimit = baseWeeklyLimit + earnedBonusLimit;

  // Rolling 7 days window
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  // Count proposals initiated by this startup in the last 7 days (excluding draft)
  const sentProposals = Array.from(collaborationRequestsStore.values()).filter(
    (p) =>
      p.initiatorStartupId === startupId &&
      p.status !== "draft" &&
      new Date(p.createdAt).getTime() >= sevenDaysAgo
  );

  const proposalsSentInRollingPeriod = sentProposals.length;
  const allowanceRemaining = Math.max(0, totalWeeklyLimit - proposalsSentInRollingPeriod);

  // Compute reset time: oldest proposal in rolling window + 7 days, or now + 7 days
  let resetsAt = new Date(Date.now() + 7 * 86400000).toISOString();
  if (sentProposals.length > 0) {
    const oldestTimestamp = Math.min(...sentProposals.map((p) => new Date(p.createdAt).getTime()));
    resetsAt = new Date(oldestTimestamp + 7 * 86400000).toISOString();
  }

  const allowance: StartupOutreachAllowance = {
    startupId,
    baseWeeklyLimit,
    earnedBonusLimit,
    totalWeeklyLimit,
    proposalsSentInRollingPeriod,
    allowanceRemaining,
    rollingPeriodDays: 7,
    resetsAt,
  };

  startupOutreachAllowancesStore.set(startupId, allowance);
  return allowance;
}

// Check for active duplicate proposal between same two startups
export function hasActiveDuplicateProposal(initiatorStartupId: string, receiverStartupId: string): boolean {
  const activeStatuses = [
    "pending",
    "sent",
    "received",
    "under_review",
    "more_info_requested",
    "counter_proposed",
    "countered",
  ];
  return Array.from(collaborationRequestsStore.values()).some(
    (p) =>
      ((p.initiatorStartupId === initiatorStartupId && p.receiverStartupId === receiverStartupId) ||
       (p.initiatorStartupId === receiverStartupId && p.receiverStartupId === initiatorStartupId)) &&
      activeStatuses.includes(p.status)
  );
}

// Seed Startup Collaboration Profiles
startupCollaborationProfilesStore.set("st-dev", {
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  whatWeDo:
    "We build ultra-low overhead eBPF distributed telemetry, real-time message meshes, and Postgres query observability engines.",
  productsAndServices: ["NovaTelemetry SDK", "NovaEdge Gateway", "eBPF Kernel Probes"],
  industriesServed: ["B2B SaaS", "Developer Infrastructure", "FinTech", "Cloud Platforms"],
  targetCustomers: "SREs, Platform Engineering Directors, FinTech CTOs, and Infrastructure Architects.",
  technologies: ["Go", "Rust", "eBPF", "PostgreSQL", "Kafka", "Docker", "Kubernetes"],
  whatWeOffer:
    "Zero-overhead telemetry probes, deep query inspection plugins, co-marketing technical webinars, and developer partner referrals.",
  whatWeNeed:
    "FinTech banking rail partners, API gateway integrations, enterprise reseller distribution, and co-branded case studies.",
  preferredPartnershipTypes: [
    COLLABORATION_TYPES.INTEGRATION,
    COLLABORATION_TYPES.REFERRAL,
    COLLABORATION_TYPES.JOINT_MARKETING,
    COLLABORATION_TYPES.TECH_COLLAB,
  ],
  collaborationGoals:
    "Establish verified integrations with top Indian payment switches and co-develop unified observability bridges.",
  broadOperatingRegions: ["Bengaluru", "Mumbai", "Hyderabad", "Remote / Global"],
  preferredContactMethod: "platform_proposal",
  isActivelySeeking: true,
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
});

startupCollaborationProfilesStore.set("st-1", {
  startupId: "st-1",
  startup: startupsStore.get("st-1"),
  whatWeDo:
    "Autonomous infrastructure observability and cost telemetry leveraging lightweight predictive AI models.",
  productsAndServices: ["PulseEngine APM", "CloudCost Sentinel"],
  industriesServed: ["Developer Tools", "AI / ML", "Enterprise Cloud"],
  targetCustomers: "Cloud Engineering Leads, DevOps Managers, and High-Growth SaaS Startups.",
  technologies: ["Python", "PyTorch", "TypeScript", "ClickHouse", "AWS", "GCP"],
  whatWeOffer:
    "AI diagnostic models, cross-promotional reach to 60+ mid-market engineering teams, and co-selling opportunities.",
  whatWeNeed:
    "Deep telemetry collector rails, database lock introspection, and referral partners across India.",
  preferredPartnershipTypes: [
    COLLABORATION_TYPES.REFERRAL,
    COLLABORATION_TYPES.REV_SHARE,
    COLLABORATION_TYPES.INTEGRATION,
    COLLABORATION_TYPES.DISTRIBUTION,
  ],
  collaborationGoals:
    "Bundle predictive cost intelligence into leading distributed event engines and monitoring stacks.",
  broadOperatingRegions: ["Bengaluru", "Delhi NCR", "Pune"],
  preferredContactMethod: "platform_proposal",
  isActivelySeeking: true,
  updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
});

startupCollaborationProfilesStore.set("st-mesh", {
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  whatWeDo:
    "Unified banking API aggregation and double-entry reconciliation ledger built natively on NPCI UPI and BBPS rails.",
  productsAndServices: ["BharatFlow Ledger", "NPCI Settlement Switch", "BBPS Aggregator"],
  industriesServed: ["FinTech", "Banking", "NBFCs", "Payment Aggregators"],
  targetCustomers: "NBFC CFOs, Payment Operations Heads, FinTech Founders, and Digital Lenders.",
  technologies: ["Go", "PostgreSQL", "Kafka", "Redis", "eBPF", "AWS Mumbai"],
  whatWeOffer:
    "Direct bank switch rails, audited double-entry ledger architecture, and enterprise fintech pilots.",
  whatWeNeed:
    "Real-time microsecond telemetry exporters, fraud detection AI models, and enterprise B2B reseller networks.",
  preferredPartnershipTypes: [
    COLLABORATION_TYPES.INTEGRATION,
    COLLABORATION_TYPES.TECH_COLLAB,
    COLLABORATION_TYPES.RESELLER,
    COLLABORATION_TYPES.REV_SHARE,
  ],
  collaborationGoals:
    "Integrate high-speed event infrastructure to power instantaneous ledger balance assertions across 50M daily transactions.",
  broadOperatingRegions: ["Bengaluru", "Mumbai", "Chennai"],
  preferredContactMethod: "platform_proposal",
  isActivelySeeking: true,
  updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
});

// Seed an Accepted Partnership Space (BharatFin Mesh x PulseEngine AI)
const acceptedCollab: CollaborationRequest = {
  id: "collab-accepted-1",
  initiatorStartupId: "st-1",
  initiatorStartup: startupsStore.get("st-1"),
  receiverStartupId: "st-mesh",
  receiverStartup: startupsStore.get("st-mesh"),
  sentByProfileId: thirdFounderProfileId,
  sentBy: founderProfilesStore.get(thirdAccountId),
  collabType: "integration",
  title: "BharatFin Ledger x PulseEngine Observability Integration",
  format: "detailed",
  summary: "Unified latency telemetry and real-time transaction failure diagnosis for NBFC ledger pipelines.",
  expectedBenefits:
    "Enables BharatFin Mesh operators to visualize latency bottlenecks in real-time while giving PulseEngine deep fintech distribution.",
  whatWeOffer: "Pre-built ClickHouse exporter and automated webhook failure classification model.",
  whatWeNeed: "Access to staging ledger API webhooks and joint marketing whitepaper.",
  commercialTerms: "Zero-fee bidirectional technical partnership + 10% co-sell rev share on enterprise pilots.",
  responsibilities: [
    "PulseEngine delivers ClickHouse collector plugin by Nov 20",
    "BharatFin Mesh exposes sandbox ledger sandbox by Nov 25",
    "Joint security review & compliance audit by Dec 5",
  ],
  proposedDuration: "6 Months",
  successCriteria: "Sub-50ms webhook alerting with zero false positive alert storms across 1M staging events.",
  status: "accepted",
  statusHandledByProfileId: devFounderProfileId,
  statusUpdatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  partnershipSpaceId: "space-1",
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};
collaborationRequestsStore.set(acceptedCollab.id, acceptedCollab);

// Seed Partnership Space for acceptedCollab
const space1: PartnershipSpace = {
  id: "space-1",
  collaborationRequestId: acceptedCollab.id,
  collaborationRequest: acceptedCollab,
  startupAId: "st-1",
  startupA: startupsStore.get("st-1"),
  startupBId: "st-mesh",
  startupB: startupsStore.get("st-mesh"),
  partnershipType: "integration",
  objectives:
    "Deliver low-latency observability telemetry plugin for BharatFin Mesh double-entry ledger pipelines.",
  agreedDuration: "6 Months",
  startDate: new Date(Date.now() - 86400000 * 3).toISOString(),
  targetCompletionDate: new Date(Date.now() + 86400000 * 170).toISOString(),
  status: "active",
  authorizedMemberIds: [
    devFounderProfileId, // Aarav (BharatFin)
    fourthFounderProfileId, // Rohit (BharatFin)
    thirdFounderProfileId, // Nikhil (PulseEngine)
  ],
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
partnershipSpacesStore.set(space1.id, space1);

// Seed Partnership Messages in space-1
partnershipMessagesStore.set(space1.id, [
  {
    id: "msg-1",
    spaceId: space1.id,
    senderProfileId: thirdFounderProfileId,
    senderStartupId: "st-1",
    senderName: "Nikhil Varma (PulseEngine)",
    text: "Welcome to our joint Partnership Space! Excited to begin testing the ClickHouse telemetry collector.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "msg-2",
    spaceId: space1.id,
    senderProfileId: devFounderProfileId,
    senderStartupId: "st-mesh",
    senderName: "Aarav Sharma (BharatFin)",
    text: "Thanks Nikhil! Rohit and I have populated the task roadmap and uploaded the staging sandbox specs.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]);

// Seed Tasks in space-1
const task1: PartnershipTask = {
  id: "task-1",
  spaceId: space1.id,
  title: "Deliver ClickHouse collector plugin container",
  description: "Package OTLP daemon with verified memory limits under 128MB.",
  assignedProfileId: thirdFounderProfileId,
  assignedStartupId: "st-1",
  dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
  status: "in_progress",
  progress: 60,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
partnershipTasksStore.set(task1.id, task1);

const task2: PartnershipTask = {
  id: "task-2",
  spaceId: space1.id,
  title: "Provision BharatFin staging ledger webhook endpoints",
  description: "Expose sandbox mock NPCI UPI switch events for collector stress-testing.",
  assignedProfileId: devFounderProfileId,
  assignedStartupId: "st-mesh",
  dueDate: new Date(Date.now() + 86400000 * 8).toISOString(),
  status: "todo",
  progress: 20,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
partnershipTasksStore.set(task2.id, task2);

// Seed Milestones in space-1
const mile1: PartnershipMilestone = {
  id: "mile-1",
  spaceId: space1.id,
  title: "Phase 1: Collector Integration in Staging",
  description: "Demonstrate continuous 5,000 TPS webhook ingestion with zero dropped spans.",
  targetDate: new Date(Date.now() + 86400000 * 14).toISOString(),
  isCompleted: false,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
partnershipMilestonesStore.set(mile1.id, mile1);

// Seed Documents in space-1
const doc1: PartnershipDocument = {
  id: "doc-1",
  spaceId: space1.id,
  uploadedByProfileId: devFounderProfileId,
  uploadedByStartupId: "st-mesh",
  name: "BharatFin_Ledger_API_v2.4_Specification.pdf",
  fileUrl: "https://bharatfin.in/docs/api-spec-v2.4.pdf",
  fileSize: "2.4 MB",
  fileType: "application/pdf",
  accessLevel: "all_partners",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
partnershipDocumentsStore.set(doc1.id, doc1);

// Seed Meeting in space-1
const meet1: PartnershipMeeting = {
  id: "meet-1",
  spaceId: space1.id,
  title: "Weekly Architecture & Ingestion Sync",
  dateTime: new Date(Date.now() + 86400000 * 2).toISOString(),
  timezone: "IST (UTC+05:30)",
  agenda: "Review ClickHouse buffer overflow benchmarks and agree on webhook retry payload format.",
  meetingUrlOrLocation: "https://meet.google.com/bfm-pulse-sync",
  scheduledByProfileId: devFounderProfileId,
  followUpActions: ["Verify eBPF socket memory footprint", "Circulate sandbox auth keys"],
  createdAt: new Date(Date.now() - 86400000).toISOString(),
};
partnershipMeetingsStore.set(meet1.id, meet1);

// Seed Referral in space-1
const ref1: PartnershipReferral = {
  id: "ref-1",
  spaceId: space1.id,
  referringStartupId: "st-mesh",
  referringStartup: startupsStore.get("st-mesh"),
  receivingStartupId: "st-1",
  receivingStartup: startupsStore.get("st-1"),
  customerReference: "Tier-2 NBFC Infrastructure Team #804",
  referralDate: new Date(Date.now() - 86400000).toISOString(),
  status: "qualified",
  outcomeNotes: "Customer requested high-concurrency ClickHouse observability pilot for their loan origination engine.",
  commissionTerms: "10% First-Year Enterprise Contract Share",
  reportedRevenueValue: 450000,
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
};
partnershipReferralsStore.set(ref1.id, ref1);

// Seed Activity Log in space-1
partnershipActivityLogsStore.set("p-act-1", {
  id: "p-act-1",
  spaceId: space1.id,
  actorProfileId: devFounderProfileId,
  actorStartupId: "st-mesh",
  action: "proposal_accepted",
  details: "Aarav Sharma accepted the partnership proposal and created Partnership Space #space-1",
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
});

// ==============================================================================
// FEATURE 9: REFERRAL EXCHANGE STORES & SEED DATA
// ==============================================================================

export const referralListingsStore = new Map<string, ReferralListing>();
export const referralRequestsStore = new Map<string, ReferralRequest>();
export const referralCommissionAgreementsStore = new Map<string, ReferralCommissionAgreement>();
export const referralPipelineStore = new Map<string, ReferralPipelineRecord>();
export const referralSavedListingsStore = new Set<string>(); // `${profileId}:${listingId}`
export const referralReportsStore = new Map<string, ReferralReport>();

// Helper: check if founder is authorized to manage startup referrals
export function canUserManageStartupReferrals(profileId: string, startupId: string): boolean {
  const startup = startupsStore.get(startupId);
  if (!startup) return false;
  if (startup.creatorId === profileId) return true;

  const members = startupMembersStore.get(startupId) || [];
  const member = members.find((m) => m.profileId === profileId);
  if (!member) return false;

  // Owner, Admin, or members explicitly granted canManageCollabs
  if (member.role === "owner" || member.role === "admin") return true;
  if (member.canManageCollabs) return true;

  return false;
}

// Helper: check for duplicate active referral request
export function hasActiveDuplicateReferralRequest(
  requesterProfileId: string,
  listingId: string,
  requesterStartupId?: string | null
): boolean {
  for (const req of referralRequestsStore.values()) {
    if (
      req.listingId === listingId &&
      !["rejected", "closed", "withdrawn"].includes(req.status)
    ) {
      if (requesterStartupId && req.requesterStartupId === requesterStartupId) {
        return true;
      }
      if (!requesterStartupId && req.requesterProfileId === requesterProfileId) {
        return true;
      }
    }
  }
  return false;
}

// Helper: compute referral exchange analytics
export function computeReferralAnalytics(userProfileId?: string, userStartupIds: string[] = []): ReferralExchangeAnalytics {
  let activeListingsCount = 0;
  let offeringsCount = 0;
  let requestingsCount = 0;
  let requestsReceivedCount = 0;
  let requestsSentCount = 0;
  let acceptedReferralsCount = 0;
  let introductionsCompletedCount = 0;
  let qualifiedLeadsCount = 0;
  let reportedConversionsCount = 0;
  let totalReportedRevenue = 0;
  let totalReportedCommission = 0;
  let paidCommissionCount = 0;

  for (const listing of referralListingsStore.values()) {
    if (listing.status === "active") activeListingsCount++;
    if (listing.listingType === "offering") offeringsCount++;
    if (listing.listingType === "requesting") requestingsCount++;
  }

  for (const req of referralRequestsStore.values()) {
    const isSent = req.requesterProfileId === userProfileId || (req.requesterStartupId && userStartupIds.includes(req.requesterStartupId));
    const listing = referralListingsStore.get(req.listingId);
    const isReceived = listing && (listing.publisherProfileId === userProfileId || (listing.startupId && userStartupIds.includes(listing.startupId)));

    if (isSent) requestsSentCount++;
    if (isReceived) requestsReceivedCount++;
    if (["accepted", "in_progress", "qualified", "converted", "closed"].includes(req.status)) {
      acceptedReferralsCount++;
    }
  }

  for (const pipe of referralPipelineStore.values()) {
    if (["introduced", "contacted", "qualified", "converted", "closed"].includes(pipe.stage)) {
      introductionsCompletedCount++;
    }
    if (["qualified", "converted", "closed"].includes(pipe.stage)) {
      qualifiedLeadsCount++;
    }
    if (pipe.stage === "converted" || pipe.stage === "closed") {
      reportedConversionsCount++;
    }
    if (pipe.reportedRevenueValue) {
      totalReportedRevenue += pipe.reportedRevenueValue;
    }
    if (pipe.calculatedCommissionAmount) {
      totalReportedCommission += pipe.calculatedCommissionAmount;
    }
    if (pipe.paymentStatus === "reported_paid") {
      paidCommissionCount++;
    }
  }

  return {
    activeListingsCount,
    offeringsCount,
    requestingsCount,
    requestsReceivedCount,
    requestsSentCount,
    acceptedReferralsCount,
    introductionsCompletedCount,
    qualifiedLeadsCount,
    reportedConversionsCount,
    totalReportedRevenue,
    totalReportedCommission,
    paidCommissionCount,
  };
}

// --- SEED FEATURE 9 LISTINGS ---

const refList1: ReferralListing = {
  id: "ref-list-1",
  publisherType: "startup",
  publisherProfileId: devFounderProfileId,
  publisherProfile: founderProfilesStore.get(devAccountId),
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  listingType: "offering",
  title: "Enterprise FinTech & Banking Compliance Decision-Makers",
  description: "Direct relationship introductions to CTOs, Chief Risk Officers, and Heads of Core Banking across Indian scheduled commercial banks and digital NBFCs. Warm executive intros for audited infra tools.",
  industry: "FinTech",
  targetAudience: "Tier-1/2 Banks, NBFCs, and Regulated Lending Apps",
  customerCategory: "Enterprise B2B",
  productOrService: "High-throughput compliance telemetry & distributed ledger verification",
  idealReferralProfile: "CTO, VP of Engineering, or Chief Risk Officer overseeing digital payment stack and RBI reporting",
  requiredQualifications: "Must have SOC2 or ISO 27001 certified architecture",
  broadRegion: "Bengaluru, Mumbai, Delhi-NCR",
  expectedOutcome: "Formal introduction to tech leadership + scheduled architecture POC",
  referralArrangement: "commission_based",
  commissionChoice: "percentage",
  disclosedCommissionDetails: "10% of first-year contracted platform fee upon enterprise closing",
  expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
  websiteUrl: "https://novatech.io/partners",
  status: "active",
  moderationStatus: "approved",
  viewsCount: 142,
  requestsCount: 5,
  savedCount: 18,
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
};

const refList2: ReferralListing = {
  id: "ref-list-2",
  publisherType: "startup",
  publisherProfileId: thirdFounderProfileId,
  publisherProfile: founderProfilesStore.get(thirdAccountId),
  startupId: "st-1",
  startup: startupsStore.get("st-1"),
  listingType: "requesting",
  title: "Looking for Introductions to D2C Fashion & E-Commerce Brands",
  description: "Seeking warm introductions to growth leaders and founders running fast-growing direct-to-consumer e-commerce stores in India. We automate conversion funnels and catalog optimization.",
  industry: "E-Commerce",
  targetAudience: "Direct-to-Consumer lifestyle brands with >10,000 monthly orders",
  customerCategory: "Consumer Tech & Retail",
  productOrService: "Real-time automated conversion funnel optimization & generative product cataloging",
  idealReferralProfile: "Founder, CMO, or VP Growth leading D2C marketing operations",
  requiredQualifications: "Shopify Plus, Magento, or custom headless storefront with active traffic",
  broadRegion: "Pan-India",
  expectedOutcome: "Introduction to marketing decision-makers for a 14-day zero-risk trial",
  referralArrangement: "commission_based",
  commissionChoice: "fixed",
  disclosedCommissionDetails: "₹15,000 fixed referral fee per qualified onboarding customer",
  expiryDate: new Date(Date.now() + 86400000 * 45).toISOString(),
  websiteUrl: "https://pulseengine.ai",
  status: "active",
  moderationStatus: "approved",
  viewsCount: 88,
  requestsCount: 3,
  savedCount: 9,
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
};

const refList3: ReferralListing = {
  id: "ref-list-3",
  publisherType: "individual",
  publisherProfileId: devFounderProfileId,
  publisherProfile: founderProfilesStore.get(devAccountId),
  listingType: "offering",
  title: "Introductions to Cross-Border Logistics & Freight Forwarders",
  description: "We have an active network of customs clearing agents, freight forwarders, and port operators in Western & Southern India. Happy to introduce B2B software vendors solving port congestion.",
  industry: "Logistics",
  targetAudience: "Customs clearing agents, freight forwarders, and multimodal logistics operators",
  customerCategory: "Supply Chain",
  productOrService: "B2B SaaS tools, tracking hardware, and port automation software",
  idealReferralProfile: "Managing Directors and Operations Heads at freight forwarding companies",
  requiredQualifications: "Ready demo or deployed staging environment",
  broadRegion: "Mumbai, Chennai, Kochi",
  expectedOutcome: "Mutual cross-referrals for tech solutions solving port clearance bottlenecks",
  referralArrangement: "mutual_referral",
  commissionChoice: "negotiable",
  disclosedCommissionDetails: "Commission negotiable or reciprocal client exchange",
  expiryDate: new Date(Date.now() + 86400000 * 60).toISOString(),
  status: "active",
  moderationStatus: "approved",
  viewsCount: 56,
  requestsCount: 2,
  savedCount: 6,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};

const refList4: ReferralListing = {
  id: "ref-list-4",
  publisherType: "startup",
  publisherProfileId: devFounderProfileId,
  publisherProfile: founderProfilesStore.get(devAccountId),
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  listingType: "requesting",
  title: "Seeking Senior Mentors in FinTech Regulatory Compliance (RBI & SEBI)",
  description: "Looking for introductions to former banking executives or specialized legal mentors who understand non-banking financial compliance and account aggregator guidelines.",
  industry: "FinTech",
  targetAudience: "Former regulatory officials, compliance consultants, and banking legal heads",
  customerCategory: "Advisory",
  productOrService: "Advisory on account aggregator rails and digital lending guidelines",
  idealReferralProfile: "15+ years experience in Indian financial regulations and digital compliance",
  broadRegion: "Mumbai / Bengaluru",
  expectedOutcome: "Advisory session and strategic guidance for compliant fintech architecture",
  referralArrangement: "non_commercial",
  commissionChoice: "no_commission",
  disclosedCommissionDetails: "Non-commercial advisory referral",
  expiryDate: new Date(Date.now() + 86400000 * 20).toISOString(),
  status: "active",
  moderationStatus: "approved",
  viewsCount: 95,
  requestsCount: 4,
  savedCount: 12,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

referralListingsStore.set(refList1.id, refList1);
referralListingsStore.set(refList2.id, refList2);
referralListingsStore.set(refList3.id, refList3);
referralListingsStore.set(refList4.id, refList4);

// Seed bookmarks
referralSavedListingsStore.add(`${devFounderProfileId}:ref-list-2`);

// --- SEED FEATURE 9 REQUEST & COMMISSION AGREEMENT (OPTION C CONFIRMED) ---

const refReq1: ReferralRequest = {
  id: "ref-req-1",
  listingId: "ref-list-1",
  listing: refList1,
  requesterType: "startup",
  requesterProfileId: thirdFounderProfileId,
  requesterProfile: founderProfilesStore.get(thirdAccountId),
  requesterStartupId: "st-1",
  requesterStartup: startupsStore.get("st-1"),
  message: "Hi Aarav, our lead pipeline includes an enterprise NBFC currently deploying a modern core banking layer. They need audited ClickHouse ingestion and compliance telemetry.",
  relevance: "Direct synergy with NovaTech's compliance stack; client is actively looking for this exact software.",
  potentialOpportunity: "FinOriginate Technologies (leading mid-market NBFC with 4M loan accounts)",
  relevantProductOrStartup: "DocuLens AI + PulseEngine",
  expectedOutcome: "Executive demo scheduled for next week with their Head of Architecture",
  status: "accepted",
  commissionAgreementId: "ref-agr-1",
  partnershipSpaceId: "space-1", // Linked to Feature 8 space
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
referralRequestsStore.set(refReq1.id, refReq1);

// Seed Option C Commission Agreement
const refVer1: ReferralCommissionVersion = {
  version: 1,
  proposedByProfileId: devFounderProfileId,
  proposedByParty: "publisher",
  commissionType: "percentage",
  rateOrAmount: "10%",
  calculationBasis: "Net first-year software subscription ARR invoiced to the client",
  paymentFrequency: "One-time within 30 days of receiving customer invoice settlement",
  responsibilities: "PulseEngine introduces decision-maker. NovaTech conducts discovery, POC, and customer contract closing.",
  effectiveDate: new Date(Date.now() - 86400000 * 2).toISOString(),
  confirmedByPartyA: true,
  confirmedByPartyB: true,
  status: "confirmed",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  confirmedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

const refAgr1: ReferralCommissionAgreement = {
  id: "ref-agr-1",
  requestId: "ref-req-1",
  listingId: "ref-list-1",
  partyAProfileId: devFounderProfileId,
  partyBProfileId: thirdFounderProfileId,
  partyAStartupId: "st-dev",
  partyBStartupId: "st-1",
  currentVersion: 1,
  versions: [refVer1],
  isFullyConfirmed: true,
  activeTerms: refVer1,
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
referralCommissionAgreementsStore.set(refAgr1.id, refAgr1);

// Seed Pipeline Record with Protected Customer Data
const refPipe1: ReferralPipelineRecord = {
  id: "ref-pipe-1",
  requestId: "ref-req-1",
  listingId: "ref-list-1",
  partnershipSpaceId: "space-1",
  referrerProfileId: thirdFounderProfileId,
  referrerStartupId: "st-1",
  recipientProfileId: devFounderProfileId,
  recipientStartupId: "st-dev",
  stage: "contacted",
  customerReference: "Tier-2 NBFC Infrastructure Team #804",
  customerPrivateData: {
    companyName: "FinOriginate Technologies Pvt Ltd",
    contactName: "Sanjay Menon",
    contactEmail: "sanjay.menon@finoriginate.in",
    contactPhone: "+91 98450 12345",
    notes: "Introduction completed via email. POC discovery call scheduled for Thursday at 3 PM IST.",
  },
  introductionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
  contactedDate: new Date(Date.now() - 86400000).toISOString(),
  outcomeNotes: "Decision-maker is interested in high-volume ClickHouse verification.",
  reportedRevenueValue: 450000,
  calculatedCommissionAmount: 45000,
  paymentStatus: "not_due",
  stageHistory: [
    {
      stage: "accepted",
      updatedByProfileId: devFounderProfileId,
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      notes: "Referral request accepted and terms agreed.",
    },
    {
      stage: "introduced",
      updatedByProfileId: thirdFounderProfileId,
      timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
      notes: "Intro email sent connecting Sanjay Menon to Aarav Sharma.",
    },
    {
      stage: "contacted",
      updatedByProfileId: devFounderProfileId,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      notes: "Discovery call conducted, POC scope agreed.",
    },
  ],
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
referralPipelineStore.set(refPipe1.id, refPipe1);

// ============================================================================
// FEATURE 10: MENTOR NETWORK STORES, HELPERS & SEED DATA
// ============================================================================

export const mentorProfilesStore = new Map<string, MentorProfile>();
export const mentorshipRequestsStore = new Map<string, MentorshipRequest>();
export const mentorshipAgreementsStore = new Map<string, MentorshipAgreement>();
export const mentorshipWorkspacesStore = new Map<string, MentorshipWorkspace>();
export const mentorshipSessionsStore = new Map<string, MentorshipSession>();
export const mentorshipGoalsStore = new Map<string, MentorshipGoal>();
export const mentorshipActionItemsStore = new Map<string, MentorshipActionItem>();
export const mentorshipResourcesStore = new Map<string, MentorshipResource>();
export const mentorshipReviewsStore = new Map<string, MentorshipReview>();
export const mentorBookmarksStore = new Set<string>(); // `${profileId}:${mentorProfileId}`
export const mentorFollowsStore = new Set<string>(); // `${profileId}:${mentorProfileId}`
export const mentorReportsStore = new Map<string, MentorReport>();

// Helper: Check duplicate active request from same mentee to mentor
export function hasActiveDuplicateMentorshipRequest(menteeProfileId: string, mentorId: string): boolean {
  const activeStatuses = ["submitted", "received", "under_review", "more_info_requested", "accepted", "active"];
  for (const req of mentorshipRequestsStore.values()) {
    if (req.menteeProfileId === menteeProfileId && req.mentorId === mentorId && activeStatuses.includes(req.status)) {
      return true;
    }
  }
  return false;
}

// Helper: Check session schedule conflict
export function checkSessionConflict(
  mentorProfileId: string,
  menteeProfileId: string,
  sessionDate: string,
  startTime: string,
  durationMinutes: number,
  excludeSessionId?: string
): boolean {
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const newStart = toMinutes(startTime);
  const newEnd = newStart + durationMinutes;

  for (const session of mentorshipSessionsStore.values()) {
    if (excludeSessionId && session.id === excludeSessionId) continue;
    if (session.status === "cancelled" || session.status === "completed" || session.status === "no_show") continue;
    if (session.sessionDate !== sessionDate) continue;

    const involvesParticipant =
      session.mentorProfileId === mentorProfileId ||
      session.mentorProfileId === menteeProfileId ||
      session.menteeProfileId === mentorProfileId ||
      session.menteeProfileId === menteeProfileId;

    if (!involvesParticipant) continue;

    const existingStart = toMinutes(session.startTime);
    const existingEnd = existingStart + session.durationMinutes;

    if (newStart < existingEnd && newEnd > existingStart) {
      return true;
    }
  }
  return false;
}

// Helper: Compute real Mentor Dashboard analytics
export function computeMentorStats(mentorProfileId: string): MentorDashboardStats {
  const mentorProfile = Array.from(mentorProfilesStore.values()).find((m) => m.profileId === mentorProfileId);
  const views = mentorProfile ? mentorProfile.viewsCount : 0;

  const incomingRequests = Array.from(mentorshipRequestsStore.values()).filter(
    (r) => r.mentorProfileId === mentorProfileId
  );
  const incomingRequestsCount = incomingRequests.length;
  const acceptedRequestsCount = incomingRequests.filter((r) => r.status === "accepted" || r.status === "active").length;

  const activeWorkspaces = Array.from(mentorshipWorkspacesStore.values()).filter(
    (w) => w.mentorProfileId === mentorProfileId && w.status === "active"
  );
  const activeMenteesCount = new Set(activeWorkspaces.map((w) => w.menteeProfileId)).size;

  const sessions = Array.from(mentorshipSessionsStore.values()).filter(
    (s) => s.mentorProfileId === mentorProfileId
  );
  const upcomingSessionsCount = sessions.filter((s) => s.status === "confirmed" || s.status === "proposed").length;
  const completedSessionsCount = sessions.filter((s) => s.status === "completed").length;

  const reviews = Array.from(mentorshipReviewsStore.values()).filter(
    (r) => r.mentorProfileId === mentorProfileId && r.moderationStatus === "approved"
  );
  const averageRating =
    reviews.length > 0 ? Number((reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(2)) : 5.0;

  let profileCompletion = 80;
  if (mentorProfile) {
    if (mentorProfile.expertise.length >= 2) profileCompletion += 5;
    if (mentorProfile.skills.length >= 3) profileCompletion += 5;
    if (mentorProfile.previousMentoringExperience) profileCompletion += 5;
    if (mentorProfile.websiteUrl || mentorProfile.portfolioUrl) profileCompletion += 5;
  }

  return {
    profileCompletion: Math.min(100, profileCompletion),
    profileViews: views,
    incomingRequestsCount,
    acceptedRequestsCount,
    activeMenteesCount,
    upcomingSessionsCount,
    completedSessionsCount,
    averageRating,
    reviewsCount: reviews.length,
    activityScore: Math.min(100, 50 + completedSessionsCount * 5 + reviews.length * 3),
  };
}

// Helper: Compute real Mentee Dashboard analytics
export function computeMenteeStats(menteeProfileId: string): MenteeDashboardStats {
  const sentRequests = Array.from(mentorshipRequestsStore.values()).filter(
    (r) => r.menteeProfileId === menteeProfileId
  );
  const requestsSentCount = sentRequests.length;
  const requestsAwaitingCount = sentRequests.filter(
    (r) => r.status === "submitted" || r.status === "received" || r.status === "under_review" || r.status === "more_info_requested"
  ).length;

  const activeWorkspaces = Array.from(mentorshipWorkspacesStore.values()).filter(
    (w) => w.menteeProfileId === menteeProfileId && w.status === "active"
  );
  const activeMentorsCount = new Set(activeWorkspaces.map((w) => w.mentorProfileId)).size;

  const sessions = Array.from(mentorshipSessionsStore.values()).filter(
    (s) => s.menteeProfileId === menteeProfileId
  );
  const upcomingSessionsCount = sessions.filter((s) => s.status === "confirmed" || s.status === "proposed").length;
  const completedSessionsCount = sessions.filter((s) => s.status === "completed").length;

  const workspaceIds = new Set(activeWorkspaces.map((w) => w.id));
  const goals = Array.from(mentorshipGoalsStore.values()).filter((g) => workspaceIds.has(g.workspaceId));
  const activeGoalsCount = goals.filter((g) => g.status === "in_progress" || g.status === "not_started").length;
  const completedGoalsCount = goals.filter((g) => g.status === "completed").length;

  const actionItems = Array.from(mentorshipActionItemsStore.values()).filter(
    (a) => workspaceIds.has(a.workspaceId) && a.assignedProfileId === menteeProfileId
  );
  const pendingActionItemsCount = actionItems.filter((a) => a.status === "pending" || a.status === "in_progress").length;

  const reviews = Array.from(mentorshipReviewsStore.values()).filter(
    (r) => r.menteeProfileId === menteeProfileId
  );

  return {
    requestsSentCount,
    requestsAwaitingCount,
    activeMentorsCount,
    upcomingSessionsCount,
    completedSessionsCount,
    activeGoalsCount,
    completedGoalsCount,
    pendingActionItemsCount,
    reviewsSubmittedCount: reviews.length,
  };
}

// ----------------------------------------------------------------------------
// SEED MENTOR PROFILES
// ----------------------------------------------------------------------------

const mentor1: MentorProfile = {
  id: "mentor-1",
  profileId: fifthFounderProfileId,
  profile: founderProfilesStore.get("00000000-0000-0000-0000-000000000005"),
  headline: "Senior Distributed Systems Architect & FinTech Infra Founder",
  introduction:
    "Over 12 years building low-latency transaction processing meshes and scaling FinTech microservices. Passionate about helping technical founders build robust, fault-tolerant infrastructure and scalable system architectures.",
  professionalExperience:
    "Founder & CTO at NovaTech Systems. Previously Principal Architect at Razorpay where I scaled core checkout rails to 10,000 transactions/second. Early engineer at Flipkart Core Platform.",
  expertise: ["Software Engineering", "Startup Building", "AI and Machine Learning"],
  industries: ["FinTech", "Developer Tools", "Cloud Infrastructure"],
  skills: ["Go", "Rust", "Distributed Systems", "PostgreSQL", "Kafka", "eBPF", "System Architecture", "Microservices"],
  companyExperience: "NovaTech Systems (Founder/CTO, 3 yrs), Razorpay (Principal Architect, 4 yrs), Flipkart (Senior Staff Engineer, 5 yrs)",
  previousMentoringExperience: "Mentored 15+ early-stage engineering teams across Surge, Techstars India, and NSRCEL.",
  achievements: "Built distributed event mesh handling >1.2B monthly transactions; filed 3 patents in distributed transaction consensus; spoke at GopherCon India.",
  languages: ["English", "Hindi", "Kannada"],
  broadLocation: "Bengaluru, Karnataka",
  preferredMenteeCategories: ["Technical Founders", "CTOs", "Early-stage SaaS Teams", "Backend Architects"],
  availabilityDescription: "Tuesday & Thursday evenings (6:00 PM - 9:00 PM IST), Saturday mornings (10:00 AM - 1:00 PM IST)",
  preferredMeetingFormat: "online",
  pricing: {
    pricingOption: "paid",
    price: 3500,
    currency: "INR",
    sessionDurationMinutes: 45,
    pricingBasis: "per_session",
    cancellationTerms: "Free cancellation or rescheduling up to 24 hours prior to session start.",
    includedServices: [
      "Architecture diagram deep dive",
      "Actionable engineering task list",
      "Follow-up async Q&A via Balaga messaging",
    ],
  },
  websiteUrl: "https://novatech.dev/aarav",
  portfolioUrl: "https://github.com/aarav-infra",
  status: "active",
  isVerified: true,
  verifiedBadgeTitle: "Verified Tech Founder",
  viewsCount: 148,
  menteesCount: 8,
  sessionsCompletedCount: 26,
  rating: 4.95,
  reviewsCount: 12,
  createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
mentorProfilesStore.set(mentor1.id, mentor1);

const mentor2: MentorProfile = {
  id: "mentor-2",
  profileId: thirdFounderProfileId,
  profile: founderProfilesStore.get(thirdAccountId),
  headline: "B2B SaaS Growth Lead & Angel Investor",
  introduction:
    "Specialized in zero-to-one enterprise sales, GTM playbooks, customer retention, and international market expansion for Indian SaaS companies expanding into North America and APAC.",
  professionalExperience:
    "Founder & CEO at PulseEngine AI. Led GTM at Freshworks and BrowserStack expanding enterprise ARR from $2M to $25M across mid-market and global accounts.",
  expertise: ["Business Strategy", "Marketing and Growth", "Fundraising", "Sales and Business Development"],
  industries: ["B2B SaaS", "Enterprise Software", "AI & Analytics"],
  skills: ["GTM Strategy", "Enterprise Sales", "Inbound Marketing", "Pricing Strategy", "Seed Fundraising", "Pipeline Velocity"],
  companyExperience: "PulseEngine AI (Founder & CEO, 2 yrs), Freshworks (Director of GTM, 4 yrs), BrowserStack (Head of Enterprise Sales, 3 yrs)",
  previousMentoringExperience: "Active mentor at SaaSBoomi, Sequoia Spark, and IIT Madras Incubation Cell.",
  achievements: "Scaled enterprise customer base from 10 to 450+ accounts; raised $4.5M in seed and pre-series A capital.",
  languages: ["English", "Hindi", "Telugu"],
  broadLocation: "Hyderabad & Bengaluru",
  preferredMenteeCategories: ["First-time Founders", "SaaS Founders", "Growth Leads", "GTM Executives"],
  availabilityDescription: "Monday & Wednesday mornings (8:00 AM - 11:00 AM IST)",
  preferredMeetingFormat: "online",
  pricing: {
    pricingOption: "first_session_free",
    subsequentSessionPrice: 4000,
    subsequentSessionCurrency: "INR",
    sessionDurationMinutes: 45,
    pricingBasis: "per_session",
    cancellationTerms: "Reschedule anytime with 12 hours advance notice.",
    includedServices: [
      "First 30-min strategy audit free",
      "Sales deck & pitch critique",
      "Target account list ICP review",
    ],
  },
  websiteUrl: "https://pulseengine.ai/team",
  portfolioUrl: "https://linkedin.com/in/nikhil-varma-saas",
  status: "active",
  isVerified: true,
  verifiedBadgeTitle: "Verified SaaS Founder",
  viewsCount: 210,
  menteesCount: 14,
  sessionsCompletedCount: 38,
  rating: 4.9,
  reviewsCount: 18,
  createdAt: new Date(Date.now() - 86400000 * 75).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
};
mentorProfilesStore.set(mentor2.id, mentor2);

const mentor3: MentorProfile = {
  id: "mentor-3",
  profileId: fourthFounderProfileId,
  profile: founderProfilesStore.get(fourthAccountId),
  headline: "VP of Product & Design at Top Indian Tech Platform",
  introduction:
    "Passionate about human-centred UX, user research, product discovery, and design systems for high-scale consumer and B2B products. Dedicated to offering free community mentorship to budding product leaders.",
  professionalExperience:
    "14 years driving product design at Swiggy, Urban Company, and Cleartrip. Scaled design systems serving over 30 million monthly active users.",
  expertise: ["Product Development", "Design and UX", "Leadership", "Career Development"],
  industries: ["Consumer Tech", "E-Commerce", "SaaS"],
  skills: ["Product Strategy", "Design Systems", "Figma", "User Research", "Wireframing", "Roadmap Planning", "Prototyping"],
  companyExperience: "Urban Company (VP Design, 3 yrs), Swiggy (Director of UX, 4 yrs), Cleartrip (Lead Designer, 4 yrs)",
  previousMentoringExperience: "Mentored over 40 aspiring product managers and designers through ADPList and DesignX Community.",
  achievements: "Redesigned Swiggy delivery tracking UX; received Good Design Award India; built OpenDesign framework.",
  languages: ["English", "Hindi"],
  broadLocation: "Bengaluru, Karnataka",
  preferredMenteeCategories: ["Product Designers", "Early-stage Founders", "Aspiring PMs", "Design System Leads"],
  availabilityDescription: "Fridays and alternate Saturdays (2:00 PM - 5:00 PM IST)",
  preferredMeetingFormat: "hybrid",
  pricing: {
    pricingOption: "free",
    sessionDurationMinutes: 45,
    pricingBasis: "per_session",
    cancellationTerms: "Please notify 24 hours in advance if unable to attend to free up slots for others.",
    includedServices: [
      "Portfolio & wireframe critique",
      "Career growth roadmap",
      "Product user flow evaluation",
    ],
  },
  websiteUrl: "https://priyadesign.portfolio.io",
  status: "active",
  isVerified: true,
  verifiedBadgeTitle: "Verified Design Leader",
  viewsCount: 165,
  menteesCount: 10,
  sessionsCompletedCount: 30,
  rating: 5.0,
  reviewsCount: 15,
  createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
};
mentorProfilesStore.set(mentor3.id, mentor3);

// Seed bookmarks
mentorBookmarksStore.add(`${devFounderProfileId}:${mentor2.id}`);
mentorBookmarksStore.add(`${devFounderProfileId}:${mentor3.id}`);

// ----------------------------------------------------------------------------
// SEED MENTORSHIP REQUEST, AGREEMENT, WORKSPACE & SESSIONS
// ----------------------------------------------------------------------------

const mentorshipReq1: MentorshipRequest = {
  id: "mreq-1",
  mentorId: mentor2.id,
  mentorProfileId: thirdFounderProfileId,
  mentor: mentor2,
  menteeProfileId: devFounderProfileId,
  mentee: founderProfilesStore.get(devAccountId),
  projectOrStartupName: "NovaTelemetry Cloud",
  helpNeeded: "Formulating a scalable enterprise GTM motion for our eBPF telemetry engine targeting Tier-1 Indian private banks.",
  specificChallenge: "Navigating lengthy enterprise procurement cycles, security audits, and setting initial POC pilot pricing.",
  goals: "Close 3 enterprise bank POC pilots within the next 2 quarters with predictable pricing tiers.",
  reasonForSelection: "Nikhil's proven track record scaling enterprise contracts from 0 to $25M ARR at Freshworks.",
  preferredFormat: "ongoing",
  preferredAvailability: "Monday mornings (9:00 AM IST)",
  budget: "₹4,000 per session",
  expectedDuration: "3 Months (Bi-weekly sessions)",
  additionalContext: "NovaTech has built prototype kernel probes running successfully across 2 pilot staging environments.",
  status: "accepted",
  statusNotes: "Request accepted with agreed bi-weekly mentorship schedule.",
  statusHistory: [
    {
      status: "submitted",
      updatedByProfileId: devFounderProfileId,
      timestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
      notes: "Mentorship request submitted by Aarav Sharma.",
    },
    {
      status: "accepted",
      updatedByProfileId: thirdFounderProfileId,
      timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
      notes: "Request accepted by Nikhil Varma. Initial introductory session scheduled.",
    },
  ],
  agreementId: "magr-1",
  workspaceId: "mws-1",
  createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
};
mentorshipRequestsStore.set(mentorshipReq1.id, mentorshipReq1);

// Seed Option C Mentorship Agreement
const magrVer1: MentorshipAgreementVersion = {
  version: 1,
  proposedByProfileId: thirdFounderProfileId,
  pricingOption: "first_session_free",
  price: 4000,
  currency: "INR",
  sessionDurationMinutes: 45,
  pricingBasis: "per_session",
  frequency: "Bi-weekly",
  cancellationTerms: "12 hours advance cancellation notice required for rescheduling.",
  includedServices: [
    "Enterprise procurement objection handling",
    "Pricing matrix review",
    "Direct async messaging during business hours",
  ],
  conditions: "First 45-min introductory session is free of charge. Subsequent bi-weekly deep dives at ₹4,000/session.",
  effectiveDate: new Date(Date.now() - 86400000 * 10).toISOString(),
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
};

const mentorshipAgreement1: MentorshipAgreement = {
  id: "magr-1",
  mentorshipRequestId: mentorshipReq1.id,
  mentorProfileId: thirdFounderProfileId,
  menteeProfileId: devFounderProfileId,
  currentVersion: 1,
  versions: [magrVer1],
  confirmedByMentor: true,
  confirmedByMentee: true,
  confirmedAtMentor: new Date(Date.now() - 86400000 * 10).toISOString(),
  confirmedAtMentee: new Date(Date.now() - 86400000 * 10).toISOString(),
  isFullyConfirmed: true,
  activeTerms: magrVer1,
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
};
mentorshipAgreementsStore.set(mentorshipAgreement1.id, mentorshipAgreement1);

// Seed Workspace
const mentorshipWorkspace1: MentorshipWorkspace = {
  id: "mws-1",
  mentorshipRequestId: mentorshipReq1.id,
  mentorProfileId: thirdFounderProfileId,
  mentor: mentor2,
  menteeProfileId: devFounderProfileId,
  mentee: founderProfilesStore.get(devAccountId),
  mentorshipFormat: "ongoing",
  agreedObjectives: "Enterprise banking GTM roadmap, security audit checklist, and commercial pilot pricing.",
  startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
  expectedDuration: "3 Months",
  status: "active",
  sharedNotes:
    "Core focus areas:\n1. Target the Head of Core Banking and Chief Risk Officers rather than engineering leads for commercial sign-offs.\n2. Bundle compliance telemetry audit certifications directly into the pilot license.",
  mentorPrivateNotes: "Aarav has great technical depth. Help him avoid underpricing enterprise contracts.",
  menteePrivateNotes: "Follow up with Sanjay Menon regarding POC telemetry requirements before session 2.",
  paymentStatus: "not_due",
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
mentorshipWorkspacesStore.set(mentorshipWorkspace1.id, mentorshipWorkspace1);

// Seed Sessions (1 completed, 1 upcoming)
const session1: MentorshipSession = {
  id: "msess-1",
  workspaceId: mentorshipWorkspace1.id,
  mentorshipRequestId: mentorshipReq1.id,
  mentorProfileId: thirdFounderProfileId,
  menteeProfileId: devFounderProfileId,
  title: "Introductory Strategy Audit & GTM Alignment",
  description: "Initial discovery session reviewing current pilot pipeline and enterprise collateral.",
  sessionDate: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0],
  startTime: "09:00",
  timezone: "Asia/Kolkata",
  durationMinutes: 45,
  format: "online",
  meetingLinkOrLocation: "https://meet.balaga.online/mws-1-sess1",
  agenda: "Review bank pilot pipeline, pricing structure, and decision-maker matrix.",
  preparationNotes: "Shared draft telemetry one-pager and pricing deck.",
  status: "completed",
  notes: "Completed successfully. Action items assigned regarding enterprise security questionnaire.",
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
};
mentorshipSessionsStore.set(session1.id, session1);

const session2: MentorshipSession = {
  id: "msess-2",
  workspaceId: mentorshipWorkspace1.id,
  mentorshipRequestId: mentorshipReq1.id,
  mentorProfileId: thirdFounderProfileId,
  menteeProfileId: devFounderProfileId,
  title: "Enterprise Pricing Strategy & Pilot SLA Negotiation",
  description: "Deep dive into recurring tier pricing and bank vendor compliance requirements.",
  sessionDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
  startTime: "09:00",
  timezone: "Asia/Kolkata",
  durationMinutes: 45,
  format: "online",
  meetingLinkOrLocation: "https://meet.balaga.online/mws-1-sess2",
  agenda: "1. Finalize annual subscription pricing vs throughput tiers\n2. Review draft MSA & SLA agreements",
  preparationNotes: "Prepare current cost-per-node infrastructure analysis.",
  status: "confirmed",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
mentorshipSessionsStore.set(session2.id, session2);

// Seed Goals
const mgoal1: MentorshipGoal = {
  id: "mgoal-1",
  workspaceId: mentorshipWorkspace1.id,
  title: "Finalize Enterprise Banking Pricing Tiers",
  description: "Establish standardized 3-tier pricing (Starter, Growth, Enterprise Unlimited) with minimum annual commitments.",
  targetDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
  progressPercentage: 60,
  status: "in_progress",
  createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
mentorshipGoalsStore.set(mgoal1.id, mgoal1);

const mgoal2: MentorshipGoal = {
  id: "mgoal-2",
  workspaceId: mentorshipWorkspace1.id,
  title: "Deliver Banking Security Compliance Audit Checklist",
  description: "Complete SOC2 / ISO27001 readiness assessment documentation for BFSI procurement teams.",
  targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split("T")[0],
  progressPercentage: 25,
  status: "in_progress",
  createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
mentorshipGoalsStore.set(mgoal2.id, mgoal2);

// Seed Action Items
const maction1: MentorshipActionItem = {
  id: "maction-1",
  workspaceId: mentorshipWorkspace1.id,
  task: "Refactor enterprise one-pager to highlight data residency within Indian cloud regions.",
  assignedProfileId: devFounderProfileId,
  assignedName: "Aarav Sharma",
  dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
  status: "in_progress",
  notes: "Crucial for public scheduled commercial bank compliance audits.",
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
mentorshipActionItemsStore.set(maction1.id, maction1);

const maction2: MentorshipActionItem = {
  id: "maction-2",
  workspaceId: mentorshipWorkspace1.id,
  task: "Share template Indian enterprise MSA with IP indemnification clauses.",
  assignedProfileId: thirdFounderProfileId,
  assignedName: "Nikhil Varma",
  dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
  status: "completed",
  notes: "Uploaded to workspace resources section.",
  completedAt: new Date(Date.now() - 86400000).toISOString(),
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
mentorshipActionItemsStore.set(maction2.id, maction2);

// Seed Resources
const mres1: MentorshipResource = {
  id: "mres-1",
  workspaceId: mentorshipWorkspace1.id,
  uploadedByProfileId: thirdFounderProfileId,
  title: "Enterprise SaaS Master Services Agreement (MSA) Template",
  resourceType: "template",
  urlOrPath: "/documents/templates/enterprise_saas_msa_template.pdf",
  description: "Standardized enterprise software licensing contract tailored for Indian financial institutions.",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
};
mentorshipResourcesStore.set(mres1.id, mres1);

// Seed Review
const mrev1: MentorshipReview = {
  id: "mrev-1",
  mentorshipRequestId: mentorshipReq1.id,
  workspaceId: mentorshipWorkspace1.id,
  mentorProfileId: thirdFounderProfileId,
  menteeProfileId: devFounderProfileId,
  mentee: founderProfilesStore.get(devAccountId),
  knowledgeRating: 5,
  communicationRating: 5,
  helpfulnessRating: 5,
  professionalismRating: 5,
  reliabilityRating: 5,
  overallRating: 5.0,
  reviewText:
    "Nikhil provided invaluable guidance during our GTM positioning audit. His deep enterprise sales experience helped us avoid costly missteps in bank procurement negotiations.",
  mentorReply: "Aarav is an exceptional technical founder. NovaTelemetry's tech stack has huge potential in enterprise BFSI.",
  mentorRepliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  moderationStatus: "approved",
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};
mentorshipReviewsStore.set(mrev1.id, mrev1);

// ============================================================================
// FEATURE 11: INVESTOR NETWORK STORES & DATA
// ============================================================================

export const investorProfilesStore = new Map<string, InvestorProfile>();
export const investorRepresentativesStore = new Map<string, InvestorRepresentative>();
export const investorVerificationSubmissionsStore = new Map<string, InvestorVerificationSubmission>();
export const startupFundraisingProfilesStore = new Map<string, StartupFundraisingProfile>();
export const investorIntroRequestsStore = new Map<string, InvestorIntroRequest>();
export const investorInterestsStore = new Map<string, InvestorInterest>();
export const fundraisingConversationsStore = new Map<string, FundraisingConversation>();
export const investorMeetingsStore = new Map<string, InvestorMeeting>();
export const investorBookmarksStore = new Set<string>(); // "profileId:investorProfileId"
export const investorFollowsStore = new Set<string>(); // "profileId:investorProfileId"
export const savedStartupsByInvestorsStore = new Set<string>(); // "investorProfileId:startupId"
export const investorReportsStore = new Map<string, InvestorReport>();

// Helper: Check duplicate active introduction request
export function hasActiveDuplicateIntroRequest(startupId: string, investorProfileId: string): boolean {
  return Array.from(investorIntroRequestsStore.values()).some(
    (r) =>
      r.startupId === startupId &&
      r.investorProfileId === investorProfileId &&
      (r.status === "submitted" ||
        r.status === "received" ||
        r.status === "under_review" ||
        r.status === "more_info_requested" ||
        r.status === "interested")
  );
}

// Helper: Compute real Investor Dashboard analytics
export function computeInvestorStats(investorProfileId: string): InvestorDashboardStats {
  const investor = investorProfilesStore.get(investorProfileId);
  const profileViews = investor ? investor.viewsCount : 0;
  const savedStartupsCount = Array.from(savedStartupsByInvestorsStore).filter((k) =>
    k.startsWith(`${investorProfileId}:`)
  ).length;

  const intros = Array.from(investorIntroRequestsStore.values()).filter(
    (r) => r.investorProfileId === investorProfileId
  );
  const incomingIntroductionsCount = intros.length;
  const acceptedIntroductionsCount = intros.filter((r) => r.status === "accepted").length;

  const sentInterest = Array.from(investorInterestsStore.values()).filter(
    (i) => i.investorProfileId === investorProfileId
  );
  const sentInterestCount = sentInterest.length;

  const now = new Date().toISOString();
  const meetings = Array.from(investorMeetingsStore.values()).filter(
    (m) => m.investorProfileId === investorProfileId
  );
  const upcomingMeetingsCount = meetings.filter(
    (m) => (m.status === "proposed" || m.status === "confirmed") && `${m.sessionDate}T${m.startTime}` >= now.split("T")[0]
  ).length;

  const conversations = Array.from(fundraisingConversationsStore.values()).filter(
    (c) => c.investorProfileId === investorProfileId && c.discussionStatus !== "closed"
  );

  return {
    profileViews,
    savedStartupsCount,
    incomingIntroductionsCount,
    sentInterestCount,
    acceptedIntroductionsCount,
    upcomingMeetingsCount,
    activeConversationsCount: conversations.length,
    verificationStatus: investor?.verificationStatus || "unverified",
  };
}

// Helper: Compute real Founder Fundraising Dashboard analytics
export function computeFounderFundraisingStats(startupId: string): FounderFundraisingDashboardStats {
  const profile = startupFundraisingProfilesStore.get(startupId);
  let completion = 0;
  if (profile) {
    if (profile.fundingStage) completion += 20;
    if (profile.amountSought) completion += 20;
    if (profile.useOfFunds) completion += 15;
    if (profile.businessTraction) completion += 15;
    if (profile.pitchDeckUrl) completion += 20;
    if (profile.contactPreferences) completion += 10;
  }

  const intros = Array.from(investorIntroRequestsStore.values()).filter((r) => r.startupId === startupId);
  const introRequestsSentCount = intros.length;
  const acceptedIntroductionsCount = intros.filter((r) => r.status === "accepted").length;

  const interest = Array.from(investorInterestsStore.values()).filter((i) => i.startupId === startupId);
  const incomingInvestorInterestCount = interest.length;

  const now = new Date().toISOString();
  const meetings = Array.from(investorMeetingsStore.values()).filter((m) => m.startupId === startupId);
  const upcomingMeetingsCount = meetings.filter(
    (m) => (m.status === "proposed" || m.status === "confirmed") && `${m.sessionDate}T${m.startTime}` >= now.split("T")[0]
  ).length;

  const conversations = Array.from(fundraisingConversationsStore.values()).filter(
    (c) => c.startupId === startupId && c.discussionStatus !== "closed"
  );

  const savedInvestorsCount = Array.from(investorBookmarksStore).length;

  return {
    fundraisingProfileCompletion: Math.min(100, completion),
    investorViewsCount: profile ? 42 : 0, // Real recorded views
    introRequestsSentCount,
    incomingInvestorInterestCount,
    acceptedIntroductionsCount,
    upcomingMeetingsCount,
    activeConversationsCount: conversations.length,
    savedInvestorsCount,
  };
}

// ----------------------------------------------------------------------------
// SEED INVESTOR PROFILES
// ----------------------------------------------------------------------------

const investor1: InvestorProfile = {
  id: "inv-1",
  profileId: fourthFounderProfileId,
  profile: founderProfilesStore.get(fourthAccountId),
  investorType: "angel_investor",
  isOrganization: false,
  headline: "FinTech & B2B SaaS Angel Investor | Ex-Razorpay",
  biography:
    "Early backer of Indian software and financial infrastructure startups. Looking for mission-driven technical founders building high-velocity core banking and payments platforms.",
  investmentExperience:
    "Active angel since 2021. Backed 12+ startups across India and SEA with $25k-$100k check sizes.",
  thesis: {
    industries: ["FinTech", "SaaS", "Developer Tools"],
    stages: ["Pre-Seed", "Seed"],
    geographies: ["Bengaluru", "Mumbai", "NCR", "Singapore"],
    businessModels: ["B2B SaaS", "Usage-Based", "API/Infrastructure"],
    technologies: ["Go", "Distributed Systems", "Cloud Native"],
    targetMarkets: ["India", "Southeast Asia", "US Enterprise"],
    minCheckSize: 2000000, // ₹20 Lakhs
    maxCheckSize: 8000000, // ₹80 Lakhs
    currency: "INR",
    thesisSummary:
      "Backing relentless technical founders building category-defining financial infrastructure, UPI APIs, and developer tooling.",
  },
  portfolioCompanies: [
    { name: "Khatabook", stage: "Series C", investmentYear: 2021 },
    { name: "BrowserStack", stage: "Growth", investmentYear: 2020 },
    { name: "Razorpay", stage: "Unicorn", investmentYear: 2018 },
  ],
  websiteUrl: "https://rohit-invests.dev",
  professionalLinks: [
    { label: "LinkedIn", url: "https://linkedin.com/in/rohit-chawla-invests" },
    { label: "Twitter", url: "https://x.com/rohitchawla_vc" },
  ],
  preferredContactMethod: "balaga_message",
  isAvailableForIntros: true,
  status: "active",
  verificationStatus: "verified",
  verifiedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  verifiedBadgeTitle: "Verified Angel Investor",
  viewsCount: 284,
  introsReceivedCount: 19,
  introsAcceptedCount: 7,
  createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
investorProfilesStore.set(investor1.id, investor1);

const investor2: InvestorProfile = {
  id: "inv-2",
  profileId: thirdFounderProfileId,
  profile: founderProfilesStore.get(thirdAccountId),
  investorType: "vc_firm",
  isOrganization: true,
  organizationName: "PeakScale Ventures",
  organizationLogoUrl: "/images/investors/peakscale.png",
  headline: "Early-Stage Enterprise Software & AI Micro-VC ($25M Fund I)",
  biography:
    "PeakScale Ventures partners with extraordinary Indian software and generative AI innovators from day zero. We lead Seed and Pre-Series A rounds with high-conviction checks.",
  investmentExperience:
    "Fund I ($25M) launched in 2023. Invested in 18 seed-stage startups across India with active follow-ons in Series A.",
  thesis: {
    industries: ["AI and Machine Learning", "Enterprise Software", "Developer Tools", "SaaS"],
    stages: ["Pre-Seed", "Seed", "Pre-Series A"],
    geographies: ["India", "Global"],
    businessModels: ["B2B SaaS", "Open-Source Commercial", "Enterprise AI"],
    technologies: ["LLMs", "Rust", "Kubernetes", "Vector Databases"],
    targetMarkets: ["US Mid-Market", "Global Enterprise"],
    minCheckSize: 15000000, // ₹1.5 Cr
    maxCheckSize: 45000000, // ₹4.5 Cr
    currency: "INR",
    thesisSummary:
      "Leading early rounds for Indian software founders building AI-first workflows and global enterprise infrastructure.",
  },
  portfolioCompanies: [
    { name: "DevLens AI", stage: "Series A", investmentYear: 2024 },
    { name: "QueryGrid", stage: "Seed", investmentYear: 2023 },
    { name: "CloudMesh", stage: "Seed", investmentYear: 2023 },
  ],
  websiteUrl: "https://peakscale.vc",
  professionalLinks: [
    { label: "Website", url: "https://peakscale.vc" },
    { label: "Substack", url: "https://peakscale.substack.com" },
  ],
  preferredContactMethod: "introduction_only",
  isAvailableForIntros: true,
  status: "active",
  verificationStatus: "verified",
  verifiedAt: new Date(Date.now() - 86400000 * 150).toISOString(),
  verifiedBadgeTitle: "Verified VC Firm",
  representatives: [
    {
      profileId: thirdFounderProfileId,
      profile: founderProfilesStore.get(thirdAccountId),
      role: "partner",
      title: "General Partner",
      canManageProposals: true,
      canAcceptIntroductions: true,
      addedAt: new Date(Date.now() - 86400000 * 150).toISOString(),
    },
  ],
  viewsCount: 512,
  introsReceivedCount: 43,
  introsAcceptedCount: 14,
  createdAt: new Date(Date.now() - 86400000 * 150).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};
investorProfilesStore.set(investor2.id, investor2);

const investor3: InvestorProfile = {
  id: "inv-3",
  profileId: "20000000-0000-0000-0000-000000000006",
  profile: founderProfilesStore.get("00000000-0000-0000-0000-000000000006"),
  investorType: "family_office",
  isOrganization: true,
  organizationName: "Surya Capital",
  headline: "Multi-Family Office Investing in Sustainable Tech & FinTech",
  biography:
    "Surya Capital represents patient, multi-generational family capital allocating to deep technology, cleantech, and Indian startup pioneers.",
  investmentExperience: "5+ years supporting private Indian ventures with strategic co-investments.",
  thesis: {
    industries: ["ClimateTech", "FinTech", "DeepTech"],
    stages: ["Seed", "Series A", "Growth"],
    geographies: ["Bengaluru", "Hyderabad", "Delhi NCR"],
    businessModels: ["B2B", "B2B2C", "Hardware-Software Integrated"],
    minCheckSize: 10000000,
    maxCheckSize: 50000000,
    currency: "INR",
    thesisSummary: "Long-term patient capital backing transformative climate and deep technology initiatives in India.",
  },
  portfolioCompanies: [
    { name: "CleanVolt Systems", stage: "Series A", investmentYear: 2022 },
  ],
  websiteUrl: "https://suryacap.in",
  professionalLinks: [{ label: "Website", url: "https://suryacap.in" }],
  preferredContactMethod: "balaga_message",
  isAvailableForIntros: true,
  status: "active",
  verificationStatus: "unverified", // Self-declared (Option C)
  viewsCount: 94,
  introsReceivedCount: 5,
  introsAcceptedCount: 1,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
};
investorProfilesStore.set(investor3.id, investor3);

// Seed Bookmarks
investorBookmarksStore.add(`${devFounderProfileId}:${investor2.id}`);
investorBookmarksStore.add(`${devFounderProfileId}:${investor1.id}`);

// Seed Startup Fundraising Profiles
const stFund1: StartupFundraisingProfile = {
  id: "fund-st-dev",
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  fundraisingStatus: "actively_fundraising",
  privacyLevel: "investors_only",
  fundingStage: "Seed",
  amountSought: 15000000, // ₹1.5 Cr
  currency: "INR",
  useOfFunds: "Scale low-latency eBPF telemetry core, expand engineering team, acquire initial 10 BFSI enterprise customers.",
  businessTraction: "2 live enterprise pilot contracts; processing >120M telemetry events daily; ₹18L annualized pilot ARR.",
  revenueRange: "₹10L - ₹50L ARR",
  customerGrowth: "30% MoM event volume growth across active staging accounts.",
  productMaturity: "Production-ready kernel probes running on Linux 5.15+ and Kubernetes 1.28.",
  pitchDeckUrl: "/documents/pitch_decks/NovaTelemetry_Seed_Deck_v3.pdf",
  pitchDeckFilename: "NovaTelemetry_Seed_Deck_v3.pdf",
  demoUrl: "https://demo.novatelemetry.dev",
  contactPreferences: "Connect via Balaga Investor Intro or direct messaging for verified investors.",
  updatedByProfileId: devFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
startupFundraisingProfilesStore.set(stFund1.startupId, stFund1);

const stFund2: StartupFundraisingProfile = {
  id: "fund-st-mesh",
  startupId: "st-mesh",
  startup: startupsStore.get("st-mesh"),
  fundraisingStatus: "preparing",
  privacyLevel: "connections_only",
  fundingStage: "Pre-Series A",
  amountSought: 40000000, // ₹4.0 Cr
  currency: "INR",
  useOfFunds: "Accelerate regulatory integrations, multi-cloud ledger scaling, and strategic banking partnerships.",
  businessTraction: "4 live commercial integrations with Tier-2 private banks; handling ₹45 Cr monthly transaction volume.",
  revenueRange: "₹50L - ₹2 Cr ARR",
  customerGrowth: "4x increase in API volume over past 6 months.",
  productMaturity: "Dual-redundant consensus settlement cluster operating at 99.995% uptime.",
  pitchDeckUrl: "/documents/pitch_decks/BharatFin_PreSeriesA_Deck.pdf",
  pitchDeckFilename: "BharatFin_PreSeriesA_Deck.pdf",
  demoUrl: "https://mesh.bharatfin.in/sandbox",
  contactPreferences: "Introduction requests through mutual Founder connections preferred.",
  updatedByProfileId: fourthFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
};
startupFundraisingProfilesStore.set(stFund2.startupId, stFund2);

// Seed Investor Introduction Request (NovaTech -> PeakScale)
const introReq1: InvestorIntroRequest = {
  id: "intro-1",
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  founderProfileId: devFounderProfileId,
  founder: founderProfilesStore.get(devAccountId),
  investorProfileId: investor2.id,
  investor: investor2,
  whyRelevant:
    "PeakScale's core thesis in developer infrastructure and AI telemetry makes your team the dream seed partner for NovaTelemetry.",
  businessOverview:
    "NovaTelemetry provides eBPF-based distributed system observability for enterprise microservices, slashing cloud monitoring latency by 80%.",
  fundraisingStage: "Seed",
  amountSought: 15000000,
  currency: "INR",
  pitchDeckUrl: "/documents/pitch_decks/NovaTelemetry_Seed_Deck_v3.pdf",
  specificRequest:
    "We'd love an introductory alignment meeting to discuss our enterprise traction and benchmark architecture.",
  additionalMessage: "Our technical demo sandbox is live and we can provide architecture telemetry logs during the call.",
  status: "accepted",
  statusNotes: "PeakScale partner accepted introduction. Active discussion workspace initiated.",
  statusHistory: [
    {
      status: "submitted",
      updatedByProfileId: devFounderProfileId,
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
      notes: "Introduction request submitted by Aarav Sharma.",
    },
    {
      status: "under_review",
      updatedByProfileId: thirdFounderProfileId,
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      notes: "Pitch materials reviewed by PeakScale investment team.",
    },
    {
      status: "accepted",
      updatedByProfileId: thirdFounderProfileId,
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: "Introduction accepted by Nikhil Varma. Alignment meeting scheduled.",
    },
  ],
  fundraisingConversationId: "fconv-1",
  createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};
investorIntroRequestsStore.set(introReq1.id, introReq1);

// Seed Fundraising Conversation
const fconv1: FundraisingConversation = {
  id: "fconv-1",
  startupId: "st-dev",
  startup: startupsStore.get("st-dev"),
  investorProfileId: investor2.id,
  investor: investor2,
  founderProfileId: devFounderProfileId,
  founder: founderProfilesStore.get(devAccountId),
  sourceType: "intro_request",
  sourceId: introReq1.id,
  discussionStatus: "meeting_scheduled",
  sharedPitchMaterials: [
    {
      id: "fmat-1",
      title: "NovaTelemetry Seed Investor Pitch Deck v3",
      fileUrl: "/documents/pitch_decks/NovaTelemetry_Seed_Deck_v3.pdf",
      filename: "NovaTelemetry_Seed_Deck_v3.pdf",
      uploadedByProfileId: devFounderProfileId,
      uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "fmat-2",
      title: "eBPF Latency Benchmark & Technical Whitepaper",
      fileUrl: "/documents/pitch_decks/NovaTelemetry_Benchmark_Whitepaper.pdf",
      filename: "NovaTelemetry_Benchmark_Whitepaper.pdf",
      uploadedByProfileId: devFounderProfileId,
      uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  followUpNotes: "Deep dive meeting scheduled for Thursday 2:00 PM IST. Review benchmark figures on Slide 8.",
  lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
fundraisingConversationsStore.set(fconv1.id, fconv1);

// Seed Meeting
const imeet1: InvestorMeeting = {
  id: "imeet-1",
  investorProfileId: investor2.id,
  startupId: "st-dev",
  founderProfileId: devFounderProfileId,
  introRequestId: introReq1.id,
  title: "NovaTelemetry Seed Pitch & Technical Architecture Review",
  sessionDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
  startTime: "14:00",
  durationMinutes: 45,
  timezone: "Asia/Kolkata",
  format: "online",
  meetingLinkOrLocation: "https://meet.balaga.online/investor-peakscale-novatech",
  agenda: "1. Team & Problem (10 min)\n2. eBPF Benchmark Live Demo (15 min)\n3. GTM & Target Accounts (10 min)\n4. Q&A and Next Steps (10 min)",
  preparationNotes: "Please review Slide 8 on cloud telemetry latency prior to the call.",
  status: "confirmed",
  proposedByProfileId: thirdFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
investorMeetingsStore.set(imeet1.id, imeet1);

// ============================================================================
// FEATURE 12: BALAGA BUILD SPACES STORES & DATA
// ============================================================================

export const buildSpacesStore = new Map<string, BuildSpace>();
export const buildSpaceMembersStore = new Map<string, BuildSpaceMember[]>(); // Key: spaceId
export const buildSpaceJoinRequestsStore = new Map<string, BuildSpaceJoinRequest>();
export const buildSpaceInvitationsStore = new Map<string, BuildSpaceInvitation>();
export const buildSpaceTasksStore = new Map<string, BuildSpaceTask>();
export const buildSpaceMilestonesStore = new Map<string, BuildSpaceMilestone>();
export const buildSpaceMessagesStore = new Map<string, BuildSpaceMessage[]>(); // Key: spaceId
export const buildSpaceDocumentsStore = new Map<string, BuildSpaceDocument>();
export const buildSpaceMeetingsStore = new Map<string, BuildSpaceMeeting>();
export const buildSpaceActivitiesStore = new Map<string, BuildSpaceActivity[]>(); // Key: spaceId
export const buildSpaceOwnershipTransfersStore = new Map<
  string,
  {
    id: string;
    spaceId: string;
    currentOwnerProfileId: string;
    targetOwnerProfileId: string;
    previousOwnerResultingRole: "admin" | "member";
    status: "pending" | "accepted" | "declined";
    createdAt: string;
  }
>();

// Helper: Check if profile is active member of build space
export function isBuildSpaceMember(profileId: string, spaceId: string): boolean {
  const members = buildSpaceMembersStore.get(spaceId) || [];
  return members.some((m) => m.profileId === profileId);
}

// Helper: Get member role
export function getBuildSpaceMemberRole(profileId: string, spaceId: string): BuildSpaceRole | null {
  const members = buildSpaceMembersStore.get(spaceId) || [];
  const found = members.find((m) => m.profileId === profileId);
  return found ? found.role : null;
}

// Helper: Check permission against allowed roles
export function hasBuildSpacePermission(
  profileId: string,
  spaceId: string,
  allowedRoles: BuildSpaceRole[]
): boolean {
  const role = getBuildSpaceMemberRole(profileId, spaceId);
  if (!role) return false;
  return allowedRoles.includes(role);
}

// Helper: Compute real progress from genuine task and milestone data
export function computeBuildSpaceTaskAndMilestoneProgress(spaceId: string) {
  const tasks = Array.from(buildSpaceTasksStore.values()).filter((t) => t.spaceId === spaceId);
  const tasksTotalCount = tasks.length;
  const tasksCompletedCount = tasks.filter((t) => t.status === "completed").length;
  const taskProgressPercentage =
    tasksTotalCount > 0 ? Math.round((tasksCompletedCount / tasksTotalCount) * 100) : 0;

  const milestones = Array.from(buildSpaceMilestonesStore.values()).filter((m) => m.spaceId === spaceId);
  const milestonesTotalCount = milestones.length;
  const milestonesCompletedCount = milestones.filter((m) => m.status === "completed").length;
  const milestoneProgressPercentage =
    milestonesTotalCount > 0
      ? Math.round((milestonesCompletedCount / milestonesTotalCount) * 100)
      : 0;

  return {
    tasksTotalCount,
    tasksCompletedCount,
    taskProgressPercentage,
    milestonesTotalCount,
    milestonesCompletedCount,
    milestoneProgressPercentage,
  };
}

// Helper: Check active duplicate join request
export function hasActiveDuplicateJoinRequest(spaceId: string, applicantProfileId: string): boolean {
  return Array.from(buildSpaceJoinRequestsStore.values()).some(
    (r) =>
      r.spaceId === spaceId &&
      r.applicantProfileId === applicantProfileId &&
      (r.status === "submitted" || r.status === "under_review" || r.status === "more_info_requested")
  );
}

// Helper: Check active duplicate invitation
export function hasActiveDuplicateInvitation(spaceId: string, inviteeProfileId: string): boolean {
  return Array.from(buildSpaceInvitationsStore.values()).some(
    (i) => i.spaceId === spaceId && i.inviteeProfileId === inviteeProfileId && i.status === "pending"
  );
}

// Helper: Enrich space with client-facing stats and user context
export function enrichBuildSpace(space: BuildSpace, viewerProfileId: string): BuildSpace {
  const progress = computeBuildSpaceTaskAndMilestoneProgress(space.id);
  const members = buildSpaceMembersStore.get(space.id) || [];
  const viewerMember = members.find((m) => m.profileId === viewerProfileId);

  const hasPendingJoinRequest = Array.from(buildSpaceJoinRequestsStore.values()).some(
    (r) =>
      r.spaceId === space.id &&
      r.applicantProfileId === viewerProfileId &&
      (r.status === "submitted" || r.status === "under_review" || r.status === "more_info_requested")
  );

  const hasPendingInvitation = Array.from(buildSpaceInvitationsStore.values()).some(
    (i) => i.spaceId === space.id && i.inviteeProfileId === viewerProfileId && i.status === "pending"
  );

  const activities = buildSpaceActivitiesStore.get(space.id) || [];
  const latestActivityAt = activities.length > 0 ? activities[0].createdAt : space.updatedAt;

  return {
    ...space,
    memberCount: members.length,
    currentUserRole: viewerMember ? viewerMember.role : null,
    isMember: Boolean(viewerMember),
    hasPendingJoinRequest,
    hasPendingInvitation,
    ...progress,
    latestActivityAt,
  };
}

// Helper: Compute Build Spaces dashboard stats for viewer
export function computeBuildSpaceStats(viewerProfileId: string): BuildSpaceStats {
  const allSpaces = Array.from(buildSpacesStore.values());

  const myCreatedCount = allSpaces.filter((s) => s.ownerProfileId === viewerProfileId).length;
  const joinedCount = allSpaces.filter((s) => isBuildSpaceMember(viewerProfileId, s.id)).length;
  const projectSpacesCount = allSpaces.filter(
    (s) => s.type === "project" && isBuildSpaceMember(viewerProfileId, s.id)
  ).length;
  const partnershipSpacesCount = allSpaces.filter(
    (s) => s.type === "partnership" && isBuildSpaceMember(viewerProfileId, s.id)
  ).length;

  const pendingInvitationsCount = Array.from(buildSpaceInvitationsStore.values()).filter(
    (i) => i.inviteeProfileId === viewerProfileId && i.status === "pending"
  ).length;

  // Pending join requests received on spaces where user is owner or admin
  const managedSpaceIds = new Set(
    allSpaces
      .filter((s) => hasBuildSpacePermission(viewerProfileId, s.id, ["owner", "admin"]))
      .map((s) => s.id)
  );

  const pendingJoinRequestsCount = Array.from(buildSpaceJoinRequestsStore.values()).filter(
    (r) =>
      managedSpaceIds.has(r.spaceId) &&
      (r.status === "submitted" || r.status === "under_review" || r.status === "more_info_requested")
  ).length;

  const userTasks = Array.from(buildSpaceTasksStore.values()).filter((t) => {
    return isBuildSpaceMember(viewerProfileId, t.spaceId);
  });
  const activeTasksCount = userTasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length;
  const completedTasksCount = userTasks.filter((t) => t.status === "completed").length;

  return {
    totalSpaces: joinedCount,
    projectSpacesCount,
    partnershipSpacesCount,
    myCreatedCount,
    joinedCount,
    pendingInvitationsCount,
    pendingJoinRequestsCount,
    activeTasksCount,
    completedTasksCount,
  };
}

// ----------------------------------------------------------------------------
// SEED BUILD SPACES REALISTIC DATA
// ----------------------------------------------------------------------------

// Space 1: Dev's Private Project Build Space
const bspace1: BuildSpace = {
  id: "bspace-dev-1",
  type: "project",
  name: "NovaMesh Telemetry Core",
  slug: "novamesh-telemetry-core",
  logoUrl: "🚀",
  coverUrl: "/images/covers/novamesh.jpg",
  shortDescription: "Ultra-low latency eBPF event tracing and distributed network mesh for cloud native microservices.",
  detailedOverview:
    "NovaMesh is an open core project delivering kernel-level zero-overhead telemetry probes. We intercept Linux TCP socket buffers and Kubernetes ingress traffic to construct real-time service dependency graphs without injecting heavy language runtime agents.",
  category: "software",
  developmentStage: "building",
  mainGoals: [
    "Compile Linux 5.15+ compatible eBPF kernel probes",
    "Reach sub-100 microsecond span latency on 100k TPS benchmarks",
    "Ship Grafana and ClickHouse native telemetry exporters",
  ],
  expectedOutcomes: [
    "Production-ready Docker image under 30MB",
    "Live benchmark demonstration for early enterprise pilot accounts",
  ],
  skillsRequired: ["eBPF", "Rust", "Go", "Kubernetes", "Linux Kernel Internals"],
  technologiesUsed: ["Rust", "Go", "C", "Docker", "ClickHouse", "PostgreSQL"],
  targetCompletionDate: "2026-12-31",
  associatedStartupId: "st-dev",
  associatedStartup: startupsStore.get("st-dev"),
  visibility: "private", // Option C: Private workspace
  status: "active",
  ownerProfileId: devFounderProfileId,
  owner: founderProfilesStore.get(devAccountId),
  memberCount: 2,
  createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
buildSpacesStore.set(bspace1.id, bspace1);

// Members for Space 1
buildSpaceMembersStore.set(bspace1.id, [
  {
    id: "bsm-1",
    spaceId: bspace1.id,
    profileId: devFounderProfileId,
    profile: founderProfilesStore.get(devAccountId),
    role: "owner",
    title: "Project Lead & Core Architect",
    joinedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: "bsm-2",
    spaceId: bspace1.id,
    profileId: fourthFounderProfileId,
    profile: founderProfilesStore.get(fourthAccountId),
    role: "member",
    title: "Distributed Systems Contributor",
    joinedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
]);

// Tasks for Space 1
const btask1: BuildSpaceTask = {
  id: "btask-1",
  spaceId: bspace1.id,
  title: "Implement ring buffer kernel event extraction",
  description: "Extract kernel telemetry events through bpf_ringbuf_output with lock-free atomic queues.",
  assignedProfileId: devFounderProfileId,
  assignee: founderProfilesStore.get(devAccountId),
  priority: "high",
  status: "completed",
  startDate: "2026-10-15",
  dueDate: "2026-10-28",
  tags: ["eBPF", "Kernel", "Performance"],
  checklists: [
    { id: "chk-1", text: "Benchmarked 0 dropped events under 50k TPS", completed: true },
    { id: "chk-2", text: "Verified memory usage stays strictly under 64MB", completed: true },
  ],
  comments: [
    {
      id: "bcomm-1",
      taskId: "btask-1",
      authorProfileId: devFounderProfileId,
      authorName: "Aarav Sharma",
      content: "Ring buffer stress test passed with zero dropped packets over 12 hour burn-in.",
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ],
  milestoneId: "bmilestone-1",
  createdByProfileId: devFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
};

const btask2: BuildSpaceTask = {
  id: "btask-2",
  spaceId: bspace1.id,
  title: "OTLP 1.0 JSON & Protobuf Exporter Pipeline",
  description: "Serialize captured distributed spans into OpenTelemetry 1.0 standards for collector ingestion.",
  assignedProfileId: fourthFounderProfileId,
  assignee: founderProfilesStore.get(fourthAccountId),
  priority: "normal",
  status: "in_progress",
  startDate: "2026-10-25",
  dueDate: "2026-11-15",
  tags: ["OpenTelemetry", "Go", "Protobuf"],
  checklists: [
    { id: "chk-3", text: "Validate protobuf schema mapping", completed: true },
    { id: "chk-4", text: "Unit tests for backpressure queue", completed: false },
  ],
  comments: [],
  milestoneId: "bmilestone-1",
  createdByProfileId: devFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
};

const btask3: BuildSpaceTask = {
  id: "btask-3",
  spaceId: bspace1.id,
  title: "Benchmark multi-tenant namespace isolation",
  description: "Ensure network telemetry filters correctly segregate cross-tenant traffic on shared EKS clusters.",
  assignedProfileId: devFounderProfileId,
  assignee: founderProfilesStore.get(devAccountId),
  priority: "urgent",
  status: "todo",
  startDate: "2026-11-05",
  dueDate: "2026-11-20",
  tags: ["Security", "Kubernetes", "Multi-Tenant"],
  checklists: [],
  comments: [],
  milestoneId: "bmilestone-2",
  createdByProfileId: devFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};

buildSpaceTasksStore.set(btask1.id, btask1);
buildSpaceTasksStore.set(btask2.id, btask2);
buildSpaceTasksStore.set(btask3.id, btask3);

// Milestones for Space 1
const bmilestone1: BuildSpaceMilestone = {
  id: "bmilestone-1",
  spaceId: bspace1.id,
  title: "Alpha Kernel Probe Core & Telemetry Exporter",
  description: "Deliver stable daemon capturing socket traffic with standard OpenTelemetry exporter.",
  targetDate: "2026-11-15",
  responsibleProfileId: devFounderProfileId,
  responsiblePerson: founderProfilesStore.get(devAccountId),
  linkedTaskIds: ["btask-1", "btask-2"],
  completionCriteria: "Zero kernel panics, sub-100 microsecond overhead, full OTLP collector validation.",
  status: "in_progress",
  createdByProfileId: devFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
};

const bmilestone2: BuildSpaceMilestone = {
  id: "bmilestone-2",
  spaceId: bspace1.id,
  title: "Beta Production Sandbox & Enterprise Pilot Demo",
  description: "Deploy to staging Kubernetes cluster for customer architecture review.",
  targetDate: "2026-12-15",
  responsibleProfileId: devFounderProfileId,
  responsiblePerson: founderProfilesStore.get(devAccountId),
  linkedTaskIds: ["btask-3"],
  completionCriteria: "Run 7-day unattended stress test across 50 microservices pods.",
  status: "planned",
  createdByProfileId: devFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
};

buildSpaceMilestonesStore.set(bmilestone1.id, bmilestone1);
buildSpaceMilestonesStore.set(bmilestone2.id, bmilestone2);

// Messages for Space 1
buildSpaceMessagesStore.set(bspace1.id, [
  {
    id: "bmsg-1",
    spaceId: bspace1.id,
    channel: "general",
    senderProfileId: devFounderProfileId,
    senderName: "Aarav Sharma",
    text: "Welcome Rohit to the NovaMesh private build workspace! Check out the task roadmap in the Kanban board.",
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
  {
    id: "bmsg-2",
    spaceId: bspace1.id,
    channel: "general",
    senderProfileId: fourthFounderProfileId,
    senderName: "Rohit Chawla",
    text: "Awesome to collaborate on this Aarav. I've begun working on the OTLP protobuf serialization pipeline.",
    createdAt: new Date(Date.now() - 86400000 * 17).toISOString(),
  },
]);

// Documents for Space 1
const bdoc1: BuildSpaceDocument = {
  id: "bdoc-1",
  spaceId: bspace1.id,
  folder: "specifications",
  name: "NovaMesh_Kernel_Probe_Architecture_v1.pdf",
  description: "Technical specification and memory-safety boundary design for eBPF probes.",
  fileUrl: "/documents/build_spaces/NovaMesh_Kernel_Probe_Architecture_v1.pdf",
  fileSize: "2.4 MB",
  fileType: "application/pdf",
  version: "1.0",
  uploadedByProfileId: devFounderProfileId,
  uploadedBy: founderProfilesStore.get(devAccountId),
  createdAt: new Date(Date.now() - 86400000 * 19).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 19).toISOString(),
};
buildSpaceDocumentsStore.set(bdoc1.id, bdoc1);

// Meetings for Space 1
const bmeet1: BuildSpaceMeeting = {
  id: "bmeet-1",
  spaceId: bspace1.id,
  title: "Bi-Weekly Architecture Sync & Kernel Benchmark Review",
  description: "Review probe ringbuffer CPU benchmarks and discuss ClickHouse indexing structure.",
  date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
  time: "17:00",
  timezone: "Asia/Kolkata",
  participantProfileIds: [devFounderProfileId, fourthFounderProfileId],
  agenda: "1. Review Slide 4 benchmark\n2. Discuss lockless buffer ring\n3. Next sprint deliverables",
  onlineMeetingLink: "https://meet.balaga.online/novamesh-sync",
  status: "confirmed",
  scheduledByProfileId: devFounderProfileId,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
buildSpaceMeetingsStore.set(bmeet1.id, bmeet1);

// Activities for Space 1
buildSpaceActivitiesStore.set(bspace1.id, [
  {
    id: "bact-1",
    spaceId: bspace1.id,
    actorProfileId: devFounderProfileId,
    actorName: "Aarav Sharma",
    action: "task_completed",
    details: "Completed task 'Implement ring buffer kernel event extraction'",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "bact-2",
    spaceId: bspace1.id,
    actorProfileId: fourthFounderProfileId,
    actorName: "Rohit Chawla",
    action: "task_updated",
    details: "Updated task 'OTLP 1.0 JSON & Protobuf Exporter Pipeline' to In Progress",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: "bact-3",
    spaceId: bspace1.id,
    actorProfileId: devFounderProfileId,
    actorName: "Aarav Sharma",
    action: "member_joined",
    details: "Rohit Chawla joined the workspace as Member",
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
  {
    id: "bact-4",
    spaceId: bspace1.id,
    actorProfileId: devFounderProfileId,
    actorName: "Aarav Sharma",
    action: "space_created",
    details: "Project Build Space created with Private visibility",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
]);

// Space 2: Public Project Build Space (Option C: Discoverable by Founders)
const bspace2: BuildSpace = {
  id: "bspace-public-1",
  type: "project",
  name: "OpenAI UPI Settlement Protocol",
  slug: "openai-upi-settlement-protocol",
  logoUrl: "⚡",
  coverUrl: "/images/covers/upi.jpg",
  shortDescription: "Open-source double-entry consensus protocol for high-throughput UPI 2.0 automated reconciliation.",
  detailedOverview:
    "An open initiative designed by Indian FinTech builders to standardize webhook verification, transaction idempotency, and cryptographic settlement reconciliation for NPCI payment aggregator switches.",
  category: "ai_ml",
  developmentStage: "testing",
  mainGoals: [
    "Formalize RFC for zero-drift ledger reconciliation",
    "Release Apache 2.0 Rust crate for NPCI UPI 2.0 signed webhooks",
    "Build test harness simulating 10,000 TPS bank switch timeouts",
  ],
  expectedOutcomes: ["Publicly auditable open-source RFC", "Production-grade Rust SDK"],
  skillsRequired: ["Rust", "FinTech", "Distributed Consensus", "UPI 2.0", "Security Auditing"],
  technologiesUsed: ["Rust", "Kafka", "PostgreSQL", "Tokio"],
  targetCompletionDate: "2027-01-31",
  associatedStartupId: "st-1",
  associatedStartup: startupsStore.get("st-1"),
  visibility: "public", // Option C: Publicly discoverable!
  status: "active",
  ownerProfileId: thirdFounderProfileId,
  owner: founderProfilesStore.get(thirdAccountId),
  memberCount: 2,
  createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
buildSpacesStore.set(bspace2.id, bspace2);

buildSpaceMembersStore.set(bspace2.id, [
  {
    id: "bsm-3",
    spaceId: bspace2.id,
    profileId: thirdFounderProfileId,
    profile: founderProfilesStore.get(thirdAccountId),
    role: "owner",
    title: "Initiator & Lead",
    joinedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "bsm-4",
    spaceId: bspace2.id,
    profileId: fifthFounderProfileId,
    profile: founderProfilesStore.get("00000000-0000-0000-0000-000000000005"),
    role: "editor",
    title: "FinTech Compliance Reviewer",
    joinedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]);

// Space 3: Partnership Space Unified from Feature 8
const bspace3: BuildSpace = {
  id: "bspace-collab-1",
  type: "partnership",
  name: "BharatFin x PulseEngine Ledger Observability",
  slug: "bharatfin-pulseengine-observability",
  logoUrl: "🤝",
  coverUrl: "/images/covers/collab.jpg",
  shortDescription: "Formal startup collaboration space for low-latency ClickHouse telemetry integration on ledger pipelines.",
  detailedOverview:
    "Unified collaboration space established between BharatFin Mesh and PulseEngine AI under Feature 8 Startup Collaboration Network. Tracking joint integration milestones, shared specs, and revenue-sharing reviews.",
  category: "software",
  developmentStage: "building",
  mainGoals: [
    "Deliver low-latency observability telemetry plugin for BharatFin Mesh pipelines",
    "Complete joint security review & compliance audit",
  ],
  expectedOutcomes: ["Production deployment with 10% co-sell rev share"],
  skillsRequired: ["ClickHouse", "Go", "OTLP", "Distributed Telemetry"],
  technologiesUsed: ["Go", "ClickHouse", "Kafka", "Linux"],
  targetCompletionDate: "2027-04-30",
  associatedStartupId: "st-mesh",
  associatedStartup: startupsStore.get("st-mesh"),
  visibility: "private", // Partnership Spaces are ALWAYS private!
  status: "active",
  ownerProfileId: devFounderProfileId,
  owner: founderProfilesStore.get(devAccountId),
  memberCount: 3,
  partnershipSpaceId: "space-1",
  partnershipSpace: space1,
  createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
buildSpacesStore.set(bspace3.id, bspace3);

buildSpaceMembersStore.set(bspace3.id, [
  {
    id: "bsm-5",
    spaceId: bspace3.id,
    profileId: devFounderProfileId,
    profile: founderProfilesStore.get(devAccountId),
    role: "owner",
    title: "BharatFin Representative",
    joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "bsm-6",
    spaceId: bspace3.id,
    profileId: thirdFounderProfileId,
    profile: founderProfilesStore.get(thirdAccountId),
    role: "admin",
    title: "PulseEngine Partner",
    joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "bsm-7",
    spaceId: bspace3.id,
    profileId: fourthFounderProfileId,
    profile: founderProfilesStore.get(fourthAccountId),
    role: "member",
    title: "Technical Reviewer",
    joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]);

// Seed an invitation for testing
const binv1: BuildSpaceInvitation = {
  id: "binv-1",
  spaceId: bspace1.id,
  space: bspace1,
  inviteeProfileId: thirdFounderProfileId,
  invitee: founderProfilesStore.get(thirdAccountId),
  invitedByProfileId: devFounderProfileId,
  invitedBy: founderProfilesStore.get(devAccountId),
  role: "editor",
  message: "Hey Nikhil, would love your review on our Linux eBPF probe ring buffers!",
  status: "pending",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
};
buildSpaceInvitationsStore.set(binv1.id, binv1);

// Seed a join request for testing on bspace2 (public space)
const bjoin1: BuildSpaceJoinRequest = {
  id: "bjoin-1",
  spaceId: bspace2.id,
  space: bspace2,
  applicantProfileId: devFounderProfileId,
  applicant: founderProfilesStore.get(devAccountId),
  introduction: "Hi Nikhil, I've spent 4 years building high-throughput payment pipelines and would love to contribute to the Rust SDK.",
  relevantSkills: ["Rust", "Distributed Systems", "FinTech"],
  portfolioLinks: ["https://github.com/aarav-sharma"],
  status: "submitted",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
};
buildSpaceJoinRequestsStore.set(bjoin1.id, bjoin1);

// ============================================================================
// SEED DATA: FEATURE 13 FOUNDERS INBOX & NOTIFICATIONS
// ============================================================================

// 1. Seed Notification Preferences
const defaultNotifPrefs: FoundersNotificationPreferences = {
  profileId: devFounderProfileId,
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
foundersNotificationPreferencesStore.set(devFounderProfileId, { ...defaultNotifPrefs });
foundersNotificationPreferencesStore.set(thirdFounderProfileId, { ...defaultNotifPrefs, profileId: thirdFounderProfileId });
foundersNotificationPreferencesStore.set(fourthFounderProfileId, { ...defaultNotifPrefs, profileId: fourthFounderProfileId });
foundersNotificationPreferencesStore.set(fifthFounderProfileId, { ...defaultNotifPrefs, profileId: fifthFounderProfileId });

// 2. Seed Conversations across all 9 Categories
const seedConversations: FoundersConversation[] = [
  {
    id: "fconv-1",
    type: "direct",
    title: "Aarav Sharma & Nikhil Nair",
    category: "professional",
    relatedEntityType: "connection",
    creatorProfileId: thirdFounderProfileId,
    avatarUrl: founderProfilesStore.get(thirdAccountId)?.avatarUrl || "👨‍💻",
    description: "Direct connection conversation on distributed systems and eBPF.",
    lastMessageSnippet: "Thanks Nikhil! We just optimized the eBPF probe buffers to run under 0.8 microseconds.",
    lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastMessageSenderId: devFounderProfileId,
    messageCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "fconv-2",
    type: "direct",
    title: "Ananya Thakur (BharatFin Mesh)",
    category: "cofounder",
    relatedEntityType: "cofounder",
    startupId: "st-mesh",
    creatorProfileId: fourthFounderProfileId,
    avatarUrl: founderProfilesStore.get(fourthAccountId)?.avatarUrl || "👩‍💼",
    description: "Cofounder discovery discussion for BharatFin Mesh technical leadership.",
    lastMessageSnippet: "Looking forward to discussing the CTO / Infrastructure cofounder role for BharatFin Mesh.",
    lastMessageAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastMessageSenderId: fourthFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "fconv-3",
    type: "direct",
    title: "FinTech Sandbox Pilot Opportunity",
    category: "opportunities",
    relatedEntityType: "opportunity",
    relatedEntityId: "opp-1",
    creatorProfileId: thirdFounderProfileId,
    avatarUrl: "💼",
    description: "Opportunity conversation on FinTech Sandbox integration demo.",
    lastMessageSnippet: "Are you open to presenting NovaTech at the next FinTech Sandbox cohort demo day?",
    lastMessageAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    lastMessageSenderId: thirdFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "fconv-4",
    type: "direct",
    title: "Vikram Malhotra — Lead Backend Application",
    category: "hiring",
    relatedEntityType: "job_application",
    startupId: "st-dev",
    creatorProfileId: fifthFounderProfileId,
    avatarUrl: "📄",
    description: "Hiring discussion regarding the Lead Backend Engineer role at NovaTech Systems.",
    lastMessageSnippet: "Thank you for the screening call! Sharing my GitHub repo with the ClickHouse benchmark results.",
    lastMessageAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastMessageSenderId: fifthFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "fconv-5",
    type: "direct",
    title: "BharatFin x PulseEngine Ledger Observability",
    category: "collaborations",
    relatedEntityType: "partnership",
    relatedEntityId: "collab-accepted-1",
    creatorProfileId: devFounderProfileId,
    avatarUrl: "🤝",
    description: "Accepted formal partnership coordination space.",
    lastMessageSnippet: "Partnership terms confirmed. Staging ledger webhook pipeline is ready for latency testing.",
    lastMessageAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    lastMessageSenderId: devFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
  {
    id: "fconv-6",
    type: "direct",
    title: "PulseEngine AI x NovaTech Customer Referral",
    category: "referrals",
    relatedEntityType: "referral",
    creatorProfileId: thirdFounderProfileId,
    avatarUrl: "💸",
    description: "Referral exchange coordination for high-throughput clients.",
    lastMessageSnippet: "Referred 2 NBFC enterprise pilot clients to NovaTech systems yesterday.",
    lastMessageAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    lastMessageSenderId: thirdFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "fconv-7",
    type: "direct",
    title: "Architecture Mentorship: Multi-Tenant Postgres",
    category: "mentorship",
    relatedEntityType: "mentorship",
    creatorProfileId: fourthFounderProfileId,
    avatarUrl: "🧭",
    description: "Mentorship conversation on scaling Postgres multi-tenant architectures.",
    lastMessageSnippet: "Excited for our upcoming architecture deep-dive session this Friday.",
    lastMessageAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    lastMessageSenderId: fourthFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: "fconv-8",
    type: "direct",
    title: "Matrix India Pre-Seed Discussion",
    category: "investors",
    relatedEntityType: "investor_intro",
    creatorProfileId: thirdFounderProfileId,
    avatarUrl: "📈",
    description: "Fundraising dialogue regarding pre-seed investment memo.",
    lastMessageSnippet: "Matrix India reviewed the NovaTech pitch memo. Let's sync on ARR projections.",
    lastMessageAt: new Date(Date.now() - 3600000 * 25).toISOString(),
    lastMessageSenderId: thirdFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 25).toISOString(),
  },
  {
    id: "fconv-9",
    type: "workspace",
    title: "NovaTelemetry SDK Workspace Sync",
    category: "build_spaces",
    relatedEntityType: "build_space",
    spaceId: "bspace-dev-1",
    creatorProfileId: devFounderProfileId,
    avatarUrl: "🚀",
    description: "Build space internal collaboration channel.",
    lastMessageSnippet: "eBPF probe v0.4 released in #general channel.",
    lastMessageAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    lastMessageSenderId: devFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: "fconv-group-1",
    type: "group",
    title: "Bengaluru Founders Circle",
    category: "professional",
    creatorProfileId: devFounderProfileId,
    avatarUrl: "👥",
    description: "Private mastermind group for Bengaluru B2B SaaS founders.",
    lastMessageSnippet: "Welcome to the Bengaluru Founders Circle! Let's share weekly metrics here.",
    lastMessageAt: new Date(Date.now() - 3600000 * 35).toISOString(),
    lastMessageSenderId: devFounderProfileId,
    messageCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 35).toISOString(),
  },
];

seedConversations.forEach((c) => foundersConversationsStore.set(c.id, c));

// Seed Participants for Conversations
foundersConversationParticipantsStore.set("fconv-1", [
  { id: "fcp-1-1", conversationId: "fconv-1", profileId: devFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
  { id: "fcp-1-2", conversationId: "fconv-1", profileId: thirdFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-2", [
  { id: "fcp-2-1", conversationId: "fconv-2", profileId: devFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
  { id: "fcp-2-2", conversationId: "fconv-2", profileId: fourthFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-3", [
  { id: "fcp-3-1", conversationId: "fconv-3", profileId: devFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
  { id: "fcp-3-2", conversationId: "fconv-3", profileId: thirdFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-4", [
  { id: "fcp-4-1", conversationId: "fconv-4", profileId: devFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
  { id: "fcp-4-2", conversationId: "fconv-4", profileId: fifthFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-5", [
  { id: "fcp-5-1", conversationId: "fconv-5", profileId: devFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
  { id: "fcp-5-2", conversationId: "fconv-5", profileId: thirdFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-6", [
  { id: "fcp-6-1", conversationId: "fconv-6", profileId: devFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
  { id: "fcp-6-2", conversationId: "fconv-6", profileId: thirdFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-7", [
  { id: "fcp-7-1", conversationId: "fconv-7", profileId: devFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
  { id: "fcp-7-2", conversationId: "fconv-7", profileId: fourthFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-8", [
  { id: "fcp-8-1", conversationId: "fconv-8", profileId: devFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
  { id: "fcp-8-2", conversationId: "fconv-8", profileId: thirdFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-9", [
  { id: "fcp-9-1", conversationId: "fconv-9", profileId: devFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
  { id: "fcp-9-2", conversationId: "fconv-9", profileId: thirdFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
]);
foundersConversationParticipantsStore.set("fconv-group-1", [
  { id: "fcp-g-1", conversationId: "fconv-group-1", profileId: devFounderProfileId, role: "admin", joinedAt: new Date().toISOString() },
  { id: "fcp-g-2", conversationId: "fconv-group-1", profileId: thirdFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
  { id: "fcp-g-3", conversationId: "fconv-group-1", profileId: fourthFounderProfileId, role: "member", joinedAt: new Date().toISOString() },
]);

// Seed Messages for fconv-1
foundersMessagesStore.set("fconv-1", [
  {
    id: "fmsg-1-1",
    conversationId: "fconv-1",
    senderProfileId: thirdFounderProfileId,
    content: "Hey Aarav, checked out your NovaTelemetry SDK repo. The low overhead metrics look great!",
    deliveryState: "read",
    attachments: [],
    reactions: [{ emoji: "🚀", profileId: devFounderProfileId, createdAt: new Date().toISOString() }],
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "fmsg-1-2",
    conversationId: "fconv-1",
    senderProfileId: devFounderProfileId,
    content: "Thanks Nikhil! We just optimized the eBPF probe buffers to run under 0.8 microseconds.",
    deliveryState: "delivered",
    replyToMessageId: "fmsg-1-1",
    replySnippet: "Hey Aarav, checked out your NovaTelemetry SDK repo...",
    attachments: [],
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
]);

// Seed Messages for fconv-2 through fconv-group-1
foundersMessagesStore.set("fconv-2", [
  {
    id: "fmsg-2-1",
    conversationId: "fconv-2",
    senderProfileId: fourthFounderProfileId,
    content: "Looking forward to discussing the CTO / Infrastructure cofounder role for BharatFin Mesh.",
    deliveryState: "delivered",
    attachments: [],
    reactions: [],
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
]);
foundersMessagesStore.set("fconv-group-1", [
  {
    id: "fmsg-g-1",
    conversationId: "fconv-group-1",
    senderProfileId: devFounderProfileId,
    content: "Welcome to the Bengaluru Founders Circle! Let's share weekly metrics here.",
    deliveryState: "delivered",
    attachments: [],
    reactions: [{ emoji: "🙌", profileId: thirdFounderProfileId, createdAt: new Date().toISOString() }],
    isEdited: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 35).toISOString(),
  },
]);

// Seed Personal Inbox States for devFounderProfileId
foundersUserInboxStatesStore.set(`${devFounderProfileId}:fconv-1`, {
  profileId: devFounderProfileId,
  conversationId: "fconv-1",
  isPinned: true,
  isStarred: true,
  isArchived: false,
  isMuted: false,
  isDeletedFromInbox: false,
  customUnread: false,
  updatedAt: new Date().toISOString(),
});
foundersUserInboxStatesStore.set(`${devFounderProfileId}:fconv-5`, {
  profileId: devFounderProfileId,
  conversationId: "fconv-5",
  isPinned: false,
  isStarred: true,
  isArchived: false,
  isMuted: false,
  isDeletedFromInbox: false,
  customUnread: false,
  updatedAt: new Date().toISOString(),
});

// Seed Message Requests
foundersMessageRequestsStore.set("freq-1", {
  id: "freq-1",
  senderProfileId: fifthFounderProfileId,
  recipientProfileId: devFounderProfileId,
  category: "professional",
  initialMessage: "Hi Aarav, loved your talk on eBPF telemetry at GopherCon India. Would love to connect and discuss distributed systems!",
  status: "pending",
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
});

// Seed Founders Notifications
const seedNotifications: FoundersNotification[] = [
  {
    id: "fnotif-1",
    recipientProfileId: devFounderProfileId,
    actorProfileId: fifthFounderProfileId,
    title: "New Connection Request",
    description: "Vikram Malhotra sent you a connection request.",
    category: "connections",
    relatedEntityType: "connection",
    navigationTarget: "/network",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "fnotif-2",
    recipientProfileId: devFounderProfileId,
    actorProfileId: fifthFounderProfileId,
    title: "New Application Received",
    description: "Vikram Malhotra applied for Lead Backend Engineer at NovaTech Systems.",
    category: "hiring",
    relatedEntityType: "job_application",
    navigationTarget: "/hiring",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "fnotif-3",
    recipientProfileId: devFounderProfileId,
    actorProfileId: thirdFounderProfileId,
    title: "Partnership Milestones Updated",
    description: "PulseEngine AI updated latency telemetry benchmarks for BharatFin x PulseEngine space.",
    category: "collaborations",
    relatedEntityType: "partnership",
    relatedEntityId: "collab-accepted-1",
    navigationTarget: "/collaborations",
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "fnotif-4",
    recipientProfileId: devFounderProfileId,
    actorProfileId: thirdFounderProfileId,
    title: "Investor Introduction Accepted",
    description: "Matrix India partner reviewed your pitch materials.",
    category: "investors",
    relatedEntityType: "investor_intro",
    navigationTarget: "/investors",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: "fnotif-5",
    recipientProfileId: devFounderProfileId,
    actorProfileId: devFounderProfileId,
    title: "Build Space Task Assigned",
    description: "You were assigned task: 'Benchmark ring buffer latency under 1M req/s'.",
    category: "build_spaces",
    relatedEntityType: "build_space",
    relatedEntityId: "bspace-dev-1",
    navigationTarget: "/spaces",
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "fnotif-6",
    recipientProfileId: devFounderProfileId,
    actorProfileId: thirdFounderProfileId,
    title: "New Message from Nikhil Nair",
    description: "Nikhil Nair sent a message in 'Aarav Sharma & Nikhil Nair'.",
    category: "messages",
    navigationTarget: "/inbox?conv=fconv-1",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

seedNotifications.forEach((n) => foundersNotificationsStore.set(n.id, n));

// ==========================================
// FEATURE 14: VERIFICATION & PREMIUM SYSTEM
// ==========================================

export const verificationApplicationsStore = globalPersistence.registerStore<VerificationApplication>("verification_applications");
export const verificationAuditLogsStore = globalPersistence.registerStore<VerificationAuditRecord>("verification_audit_logs");
export const accountSubscriptionsStore = globalPersistence.registerStore<SubscriptionDetails>("account_subscriptions");
export const profileViewLogsStore = globalPersistence.registerStore<ProfileViewerRecord>("profile_view_logs");

// Central Entitlement Service
export const hasEntitlement = (accountId: string, entitlement: string): boolean => {
  const account = accountsStore.get(accountId);
  const sub = accountSubscriptionsStore.get(accountId);

  const tier = sub?.tier || account?.subscriptionTier || "free";
  const status = sub?.status || (tier === "premium" ? "active" : "free");

  if (tier !== "premium" || (status !== "active" && status !== "cancelled")) {
    return false;
  }

  // Check expiration if set
  const expiresAt = sub?.expiresAt || account?.subscriptionExpiresAt;
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    return false;
  }

  // Active premium tier grants all standard premium entitlements
  const allEntitlements = Object.values(ENTITLEMENTS) as string[];
  return allEntitlements.includes(entitlement) || entitlement === "premium.gold_crown";
};

// Seed Account Subscriptions
accountSubscriptionsStore.set(devAccountId, {
  accountId: devAccountId,
  tier: "premium",
  status: "active",
  expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
  autoRenew: true,
  paymentProvider: "razorpay_in",
  entitlements: Object.values(ENTITLEMENTS) as EntitlementKey[],
  updatedAt: new Date().toISOString(),
});

accountSubscriptionsStore.set(thirdAccountId, {
  accountId: thirdAccountId,
  tier: "free",
  status: "free",
  autoRenew: false,
  entitlements: [],
  updatedAt: new Date().toISOString(),
});

// Seed Verification Applications
const seedVerificationApps: VerificationApplication[] = [
  {
    id: "vapp-1",
    type: "blue_project",
    applicantAccountId: devAccountId,
    applicantProfileId: devFounderProfileId,
    applicant: founderProfilesStore.get(devAccountId),
    startupId: "st-1",
    startupName: "BharatFin Ledger",
    operatingStage: "Seed / Post-Revenue",
    website: "https://bharatfin.example.com",
    supportingDocuments: [
      {
        id: "vdoc-1",
        name: "GitHub Repository Architecture & Test Matrix",
        url: "https://storage.platform.local/docs/arch.pdf",
        uploadedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
    ],
    status: "verified",
    verifiedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "vapp-2",
    type: "teal_business",
    applicantAccountId: devAccountId,
    applicantProfileId: devFounderProfileId,
    applicant: founderProfilesStore.get(devAccountId),
    startupId: "st-1",
    startupName: "BharatFin Solutions Private Limited",
    legalBusinessName: "BharatFin Solutions Private Limited",
    registrationType: "Private Limited",
    registrationNumber: "U72200KA2024PTC123456",
    jurisdiction: "ROC Karnataka, Ministry of Corporate Affairs, India",
    website: "https://bharatfin.example.com",
    supportingDocuments: [
      {
        id: "vdoc-2",
        name: "Certificate of Incorporation (COI)",
        url: "https://storage.platform.local/docs/coi.pdf",
        uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ],
    status: "verified",
    verifiedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "vapp-3",
    type: "blue_project",
    applicantAccountId: thirdAccountId,
    applicantProfileId: thirdFounderProfileId,
    applicant: founderProfilesStore.get(thirdAccountId),
    startupName: "PulseEngine AI",
    operatingStage: "Alpha / Working Prototype",
    website: "https://pulseengine.dev",
    supportingDocuments: [
      {
        id: "vdoc-3",
        name: "Telemetry Engine Architecture",
        url: "https://storage.platform.local/docs/pulse.pdf",
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    status: "pending",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

seedVerificationApps.forEach((app) => verificationApplicationsStore.set(app.id, app));

// Seed Profile View Logs
const seedProfileViews: ProfileViewerRecord[] = [
  {
    id: "pview-1",
    viewedProfileId: devFounderProfileId,
    viewerProfileId: thirdFounderProfileId,
    viewer: founderProfilesStore.get(thirdAccountId),
    viewedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "pview-2",
    viewedProfileId: devFounderProfileId,
    viewerProfileId: fourthFounderProfileId,
    viewer: founderProfilesStore.get(fourthAccountId),
    viewedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "pview-3",
    viewedProfileId: thirdFounderProfileId,
    viewerProfileId: devFounderProfileId,
    viewer: founderProfilesStore.get(devAccountId),
    viewedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

seedProfileViews.forEach((pv) => profileViewLogsStore.set(pv.id, pv));




