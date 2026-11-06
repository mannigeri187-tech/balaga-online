// Application Constants & Config

export const DEFAULT_BRAND_NAME = "Balaga";
export const BRAND_DOMAIN = "balaga.online";

export const WORLDS = {
  SOCIALIZING: "socializing",
  FOUNDERS: "founders",
} as const;

export type WorldType = (typeof WORLDS)[keyof typeof WORLDS];

export const WORLD_METADATA = {
  [WORLDS.SOCIALIZING]: {
    name: "Socializing",
    tagline: "Friends, communities, stories and shared interests",
    accentColor: "indigo",
    routePrefix: "/social",
  },
  [WORLDS.FOUNDERS]: {
    name: "Founders",
    tagline: "Startups, talent, product launchpad and business collaboration",
    accentColor: "emerald",
    routePrefix: "/founders",
  },
} as const;

export const BADGE_TYPES = {
  VERIFIED_PROJECT: "verified_project", // Blue badge
  VERIFIED_BUSINESS: "verified_business", // Teal badge
  PREMIUM_MEMBER: "premium_member", // Purple badge
} as const;

export type BadgeType = (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];

export const BADGE_METADATA = {
  [BADGE_TYPES.VERIFIED_PROJECT]: {
    label: "Verified Project / Startup",
    color: "blue",
    description: "Authenticated project demonstrating real codebase and milestones",
  },
  [BADGE_TYPES.VERIFIED_BUSINESS]: {
    label: "Verified Registered Business",
    color: "teal",
    description: "Official registered corporate entity with verified statutory registration",
  },
  [BADGE_TYPES.PREMIUM_MEMBER]: {
    label: "Premium Member",
    color: "gold",
    description: "Active platform subscriber with direct connection privileges and gold crown",
  },
} as const;

export const COLLABORATION_TYPES = {
  REFERRAL: "referral",
  REV_SHARE: "rev_share",
  INTEGRATION: "integration",
  JOINT_MARKETING: "joint_marketing",
  DISTRIBUTION: "distribution",
  RESELLER: "reseller",
  RESOURCE_SHARE: "resource_share",
  BUSINESS_COLLAB: "business_collab",
  TECH_COLLAB: "tech_collab",
  TECH_SHARE: "tech_share",
  CUSTOM: "custom",
} as const;

export type CollaborationType = (typeof COLLABORATION_TYPES)[keyof typeof COLLABORATION_TYPES];

// Feature 9 — Referral Exchange Constants
export const REFERRAL_LISTING_TYPES = {
  OFFERING: "offering",
  REQUESTING: "requesting",
} as const;

export type ReferralListingType = (typeof REFERRAL_LISTING_TYPES)[keyof typeof REFERRAL_LISTING_TYPES];

export const REFERRAL_ARRANGEMENTS = {
  MUTUAL: "mutual_referral",
  ONE_WAY: "one_way",
  COMMISSION_BASED: "commission_based",
  NON_COMMERCIAL: "non_commercial",
  OPEN_DISCUSSION: "open_discussion",
} as const;

export type ReferralArrangement = (typeof REFERRAL_ARRANGEMENTS)[keyof typeof REFERRAL_ARRANGEMENTS];

export const COMMISSION_DISCLOSURE_CHOICES = {
  NO_COMMISSION: "no_commission",
  FIXED: "fixed",
  PERCENTAGE: "percentage",
  RECURRING: "recurring",
  NEGOTIABLE: "negotiable",
  OPEN_TO_DISCUSSION: "open_to_discussion",
} as const;

export type CommissionDisclosureChoice = (typeof COMMISSION_DISCLOSURE_CHOICES)[keyof typeof COMMISSION_DISCLOSURE_CHOICES];

export const REFERRAL_PIPELINE_STAGES = {
  ACCEPTED: "accepted",
  INTRODUCED: "introduced",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  CONVERTED: "converted",
  CLOSED: "closed",
} as const;

export type ReferralPipelineStage = (typeof REFERRAL_PIPELINE_STAGES)[keyof typeof REFERRAL_PIPELINE_STAGES];

export const REFERRAL_PAYMENT_STATUSES = {
  NOT_DUE: "not_due",
  PENDING: "pending",
  REPORTED_PAID: "reported_paid",
  DISPUTED: "disputed",
  CANCELLED: "cancelled",
} as const;

export type ReferralPaymentStatus = (typeof REFERRAL_PAYMENT_STATUSES)[keyof typeof REFERRAL_PAYMENT_STATUSES];

// Feature 10: Mentor Network Constants
export const MENTOR_EXPERTISE_CATEGORIES = [
  "Startup Building",
  "AI and Machine Learning",
  "Software Engineering",
  "Product Development",
  "Business Strategy",
  "Marketing and Growth",
  "Sales and Business Development",
  "Fundraising",
  "Finance and Accounting",
  "Legal and Compliance",
  "Leadership",
  "Career Development",
  "Design and UX",
  "Operations",
  "Other",
] as const;

export type MentorExpertiseCategory = (typeof MENTOR_EXPERTISE_CATEGORIES)[number];

export const MENTORSHIP_FORMATS = [
  "one_time",
  "ongoing",
  "project",
  "startup",
  "career",
  "group",
] as const;

export type MentorshipFormat = (typeof MENTORSHIP_FORMATS)[number];

export const MENTORSHIP_MEETING_ARRANGEMENTS = [
  "online",
  "in_person",
  "hybrid",
] as const;

export type MentorshipMeetingArrangement = (typeof MENTORSHIP_MEETING_ARRANGEMENTS)[number];

export const MENTORSHIP_PRICING_OPTIONS = [
  "free",
  "paid",
  "first_session_free",
  "custom",
  "discussion",
] as const;

export type MentorshipPricingOption = (typeof MENTORSHIP_PRICING_OPTIONS)[number];

export const MENTORSHIP_REQUEST_STATUSES = [
  "submitted",
  "received",
  "under_review",
  "more_info_requested",
  "accepted",
  "rejected",
  "withdrawn",
  "active",
  "completed",
  "cancelled",
] as const;

export type MentorshipRequestStatus = (typeof MENTORSHIP_REQUEST_STATUSES)[number];

export const MENTORSHIP_SESSION_STATUSES = [
  "proposed",
  "confirmed",
  "rescheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type MentorshipSessionStatus = (typeof MENTORSHIP_SESSION_STATUSES)[number];

export const MENTORSHIP_PAYMENT_STATUSES = [
  "not_due",
  "pending",
  "reported_paid",
  "disputed",
  "cancelled",
] as const;

export type MentorshipPaymentStatus = (typeof MENTORSHIP_PAYMENT_STATUSES)[number];

// ============================================================================
// FEATURE 11: INVESTOR NETWORK CONSTANTS
// ============================================================================

export const INVESTOR_TYPES = [
  "angel_investor",
  "vc_firm",
  "corporate_investor",
  "family_office",
  "startup_investment_network",
  "strategic_investor",
  "syndicate",
  "other",
] as const;

export type InvestorType = (typeof INVESTOR_TYPES)[number];

export const INVESTOR_PROFILE_STATUSES = [
  "active",
  "paused",
  "closed",
] as const;

export type InvestorProfileStatus = (typeof INVESTOR_PROFILE_STATUSES)[number];

export const INVESTOR_VERIFICATION_STATUSES = [
  "unverified",
  "verification_submitted",
  "pending",
  "verified",
  "rejected",
  "expired",
  "suspended",
] as const;

export type InvestorVerificationStatus = (typeof INVESTOR_VERIFICATION_STATUSES)[number];

export const INVESTMENT_INDUSTRIES = [
  "AI and Machine Learning",
  "SaaS",
  "FinTech",
  "EdTech",
  "HealthTech",
  "Developer Tools",
  "ClimateTech",
  "Consumer Technology",
  "Enterprise Software",
  "DeepTech",
  "Other",
] as const;

export type InvestmentIndustry = (typeof INVESTMENT_INDUSTRIES)[number];

export const STARTUP_FUNDRAISING_STATUSES = [
  "not_fundraising",
  "exploring",
  "preparing",
  "actively_fundraising",
  "paused",
] as const;

export type StartupFundraisingStatus = (typeof STARTUP_FUNDRAISING_STATUSES)[number];

export const FUNDRAISING_PRIVACY_LEVELS = [
  "private",
  "connections_only",
  "investors_only",
  "public",
] as const;

export type FundraisingPrivacyLevel = (typeof FUNDRAISING_PRIVACY_LEVELS)[number];

export const INVESTOR_INTRO_REQUEST_STATUSES = [
  "submitted",
  "received",
  "under_review",
  "more_info_requested",
  "interested",
  "accepted",
  "rejected",
  "meeting_requested",
  "withdrawn",
  "closed",
] as const;

export type InvestorIntroRequestStatus = (typeof INVESTOR_INTRO_REQUEST_STATUSES)[number];

export const INVESTOR_INTEREST_STATUSES = [
  "submitted",
  "under_review",
  "accepted",
  "declined",
  "more_info_requested",
  "withdrawn",
] as const;

export type InvestorInterestStatus = (typeof INVESTOR_INTEREST_STATUSES)[number];

export const INVESTOR_MEETING_STATUSES = [
  "proposed",
  "confirmed",
  "rescheduled",
  "cancelled",
  "completed",
] as const;

export type InvestorMeetingStatus = (typeof INVESTOR_MEETING_STATUSES)[number];

// ============================================================================
// FEATURE 12: BALAGA BUILD SPACES CONSTANTS
// ============================================================================

export const BUILD_SPACE_TYPES = [
  "project",
  "partnership",
] as const;

export type BuildSpaceType = (typeof BUILD_SPACE_TYPES)[number];

export const BUILD_SPACE_CATEGORIES = [
  "software",
  "ai_ml",
  "saas",
  "mobile_apps",
  "web_dev",
  "hardware",
  "education",
  "business",
  "research",
  "design",
  "community_projects",
  "other",
] as const;

export type BuildSpaceCategory = (typeof BUILD_SPACE_CATEGORIES)[number];

export const BUILD_SPACE_STAGES = [
  "idea",
  "research",
  "planning",
  "building",
  "testing",
  "launching",
  "completed",
  "paused",
] as const;

export type BuildSpaceStage = (typeof BUILD_SPACE_STAGES)[number];

export const BUILD_SPACE_VISIBILITY = [
  "private",
  "public",
] as const;

export type BuildSpaceVisibility = (typeof BUILD_SPACE_VISIBILITY)[number];

export const BUILD_SPACE_STATUSES = [
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export type BuildSpaceStatus = (typeof BUILD_SPACE_STATUSES)[number];

export const BUILD_SPACE_ROLES = [
  "owner",
  "admin",
  "editor",
  "member",
  "viewer",
] as const;

export type BuildSpaceRole = (typeof BUILD_SPACE_ROLES)[number];

export const BUILD_SPACE_JOIN_REQUEST_STATUSES = [
  "submitted",
  "under_review",
  "more_info_requested",
  "accepted",
  "rejected",
  "withdrawn",
] as const;

export type BuildSpaceJoinRequestStatus = (typeof BUILD_SPACE_JOIN_REQUEST_STATUSES)[number];

export const BUILD_SPACE_INVITATION_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "expired",
  "revoked",
] as const;

export type BuildSpaceInvitationStatus = (typeof BUILD_SPACE_INVITATION_STATUSES)[number];

export const BUILD_SPACE_TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "blocked",
  "completed",
  "cancelled",
] as const;

export type BuildSpaceTaskStatus = (typeof BUILD_SPACE_TASK_STATUSES)[number];

export const BUILD_SPACE_TASK_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

export type BuildSpaceTaskPriority = (typeof BUILD_SPACE_TASK_PRIORITIES)[number];

export const BUILD_SPACE_MILESTONE_STATUSES = [
  "planned",
  "in_progress",
  "at_risk",
  "completed",
  "delayed",
  "cancelled",
] as const;

export type BuildSpaceMilestoneStatus = (typeof BUILD_SPACE_MILESTONE_STATUSES)[number];

export const BUILD_SPACE_MEETING_STATUSES = [
  "proposed",
  "confirmed",
  "rescheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type BuildSpaceMeetingStatus = (typeof BUILD_SPACE_MEETING_STATUSES)[number];

export const BUILD_SPACES_REGULATORY_DISCLAIMER =
  "Balaga Build Spaces provides secure project collaboration, task tracking, and milestone coordination. Internal workspace contents, tasks, chats, and documents remain private to authorized members.";

// Feature 13: Founders Inbox & Notifications Constants
export const FOUNDERS_INBOX_CATEGORIES = [
  "professional",
  "cofounder",
  "opportunities",
  "hiring",
  "collaborations",
  "referrals",
  "mentorship",
  "investors",
  "build_spaces",
] as const;

export type FoundersInboxCategory = (typeof FOUNDERS_INBOX_CATEGORIES)[number];

export const FOUNDERS_INBOX_VIEWS = [
  "all",
  "unread",
  "starred",
  "archived",
  "requests",
  "groups",
  "workspaces",
] as const;

export type FoundersInboxView = (typeof FOUNDERS_INBOX_VIEWS)[number];

export const FOUNDERS_MESSAGE_DELIVERY_STATES = [
  "sending",
  "sent",
  "delivered",
  "read",
  "failed",
] as const;

export type FoundersMessageDeliveryState = (typeof FOUNDERS_MESSAGE_DELIVERY_STATES)[number];

export const FOUNDERS_MESSAGE_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "withdrawn",
] as const;

export type FoundersMessageRequestStatus = (typeof FOUNDERS_MESSAGE_REQUEST_STATUSES)[number];

export const FOUNDERS_NOTIFICATION_CATEGORIES = [
  "connections",
  "cofounder_requests",
  "opportunities",
  "hiring",
  "startup_hub",
  "product_launchpad",
  "collaborations",
  "referrals",
  "mentorship",
  "investors",
  "build_spaces",
  "messages",
  "verification",
  "account_security",
] as const;

export type FoundersNotificationCategory = (typeof FOUNDERS_NOTIFICATION_CATEGORIES)[number];

export const FOUNDERS_INBOX_DISCLAIMER =
  "Balaga Founders Inbox provides unified, confidential communication across professional networks, partnerships, mentorships, and workspaces. Communications remain strictly segregated from Socializing.";

// Feature 14: Verification & Premium System Constants
export const VERIFICATION_TYPES = {
  BLUE_PROJECT: "blue_project",
  TEAL_BUSINESS: "teal_business",
} as const;

export type VerificationType = (typeof VERIFICATION_TYPES)[keyof typeof VERIFICATION_TYPES];

export const VERIFICATION_STATUSES = [
  "not_submitted",
  "submitted",
  "pending",
  "verified",
  "rejected",
  "expired",
  "suspended",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const SUBSCRIPTION_TIERS = ["free", "premium"] as const;
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const SUBSCRIPTION_STATUSES = [
  "free",
  "pending",
  "active",
  "past_due",
  "cancelled",
  "expired",
  "refunded",
  "suspended",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const ENTITLEMENTS = {
  DIRECT_MESSAGE_WITHOUT_CONNECTION: "premium.direct_message_without_connection",
  CONNECTION_REQUEST_NOTE: "premium.connection_request_note",
  PROFILE_VIEWER_IDENTITY: "premium.profile_viewer_identity",
  PROFILE_VIEW_ANALYTICS: "premium.profile_view_analytics",
  ADVANCED_PROFILE_ANALYTICS: "premium.advanced_profile_analytics",
  NETWORKING_INSIGHTS: "premium.networking_insights",
  PROFILE_CUSTOMIZATION: "premium.profile_customization",
  PRODUCTIVITY_TOOLS: "premium.productivity_tools",
} as const;

export type EntitlementKey = (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];

export const PREMIUM_BENEFITS = [
  {
    key: "direct_messaging",
    entitlement: ENTITLEMENTS.DIRECT_MESSAGE_WITHOUT_CONNECTION,
    title: "Direct Messaging Without Connecting",
    description: "Initiate eligible professional direct messages without requiring an accepted connection.",
  },
  {
    key: "connection_notes",
    entitlement: ENTITLEMENTS.CONNECTION_REQUEST_NOTE,
    title: "Personalized Connection Request Notes",
    description: "Include a personalized introduction with connection requests (up to 300 characters).",
  },
  {
    key: "gold_crown",
    entitlement: "premium.gold_crown",
    title: "Gold Premium Crown",
    description: "Distinctive gold crown badge beside your name across profiles, cards, and feeds.",
  },
  {
    key: "profile_viewers",
    entitlement: ENTITLEMENTS.PROFILE_VIEWER_IDENTITY,
    title: "Profile Viewer Identities",
    description: "See eligible profile viewers, their profiles, and view timestamps.",
  },
  {
    key: "advanced_analytics",
    entitlement: ENTITLEMENTS.ADVANCED_PROFILE_ANALYTICS,
    title: "Advanced Profile Analytics",
    description: "Comprehensive view trends over time, unique viewer metrics, and profile engagement.",
  },
  {
    key: "networking_insights",
    entitlement: ENTITLEMENTS.NETWORKING_INSIGHTS,
    title: "Detailed Networking Insights",
    description: "Track connection growth, opportunity performance, and ecosystem engagement.",
  },
  {
    key: "profile_customization",
    entitlement: ENTITLEMENTS.PROFILE_CUSTOMIZATION,
    title: "Enhanced Profile Customization",
    description: "Highlight featured projects, custom portfolio sections, and executive summary options.",
  },
  {
    key: "productivity_tools",
    entitlement: ENTITLEMENTS.PRODUCTIVITY_TOOLS,
    title: "Professional Productivity Tools",
    description: "Advanced saved item categorization, note-taking, and follow-up reminders.",
  },
] as const;

export const MAX_CONNECTION_NOTE_LENGTH = 300;

export const VERIFICATION_LEGAL_DISCLAIMER =
  "Verification confirms platform review of provided credentials and does not constitute financial, legal, endorsement, or investment advice. Balaga does not guarantee business viability or commercial success.";

/**
 * India Regulatory Compliance & Legal Disclosures
 * Pursuant to Information Technology (Intermediary Guidelines) Rules, 2021
 * and Digital Personal Data Protection Act (DPDP), 2023.
 */
export const INDIA_COMPLIANCE = {
  INTERMEDIARY_STATUS:
    "Balaga (balaga.online) operates strictly as an intermediary communication and networking platform under Section 79 of the Information Technology Act, 2000. Balaga does not hold, manage, process, or escrow user funds, investment sums, or commercial transactions.",
  FINANCIAL_DISCLAIMER:
    "Balaga is not an RBI-licensed non-banking financial company (NBFC), payment aggregator, or SEBI-registered investment advisor / merchant banker. All financial discussions, co-founding equity negotiations, investment connections, and commercial partnership settlements occur directly and externally between independent parties.",
  GRIEVANCE_OFFICER: {
    title: "Grievance Redressal Officer (IT Rules, 2021)",
    name: "Grievance Officer - Balaga Legal Operations",
    email: "grievance@balaga.online",
    responseWindow: "Within 24 hours acknowledgment, redressal within 15 days",
    address: "Bengaluru, Karnataka, India",
  },
  DPDP_RIGHTS: {
    law: "Digital Personal Data Protection Act (DPDP Act), 2023",
    summary:
      "Users maintain absolute rights to access, correction, erasure of personal data, and grievance redressal. World-scoped data segregation enforces that Socializing and Founders personal data are treated as independent digital representations.",
    dataFiduciary: "Balaga Online",
  },
} as const;




