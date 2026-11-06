import {
  WorldType,
  BadgeType,
  CollaborationType,
  ReferralListingType,
  ReferralArrangement,
  CommissionDisclosureChoice,
  ReferralPipelineStage,
  ReferralPaymentStatus,
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
  VerificationType,
  VerificationStatus,
  SubscriptionTier,
  SubscriptionStatus,
  EntitlementKey,
} from "@platform/config";

// --- 1. MASTER ACCOUNT & IDENTITY ---
export interface Account {
  id: string;
  email: string;
  phone?: string | null;
  is18PlusVerified: boolean;
  ageVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  emailVerifiedAt?: string | null;
  subscriptionTier: "free" | "premium";
  subscriptionExpiresAt?: string | null;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- 2. WORLD PROFILES ---
export interface SocialProfile {
  id: string;
  accountId: string;
  username: string;
  displayName: string;
  pronouns?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  interests: string[];
  hobbies: string[];
  languages: string[];
  broadLocation?: string | null; // e.g. "Bengaluru, Karnataka"
  city?: string | null;
  state?: string | null;
  allowDmsFrom: "everyone" | "connections" | "none";
  showActivityStatus: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FounderProfile {
  id: string;
  accountId: string;
  username: string;
  displayName: string;
  headline?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  skills: string[];
  interests: string[];
  experienceYears?: number | null;
  roles: string[]; // e.g., ["Founder", "CTO", "Designer"]
  availability: "full_time" | "part_time" | "weekends" | "advisory" | "not_available";
  workPreference: "remote" | "hybrid" | "in_person";
  broadLocation?: string | null;
  portfolioUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- 3. SOCIALIZING ENTITIES ---
export interface SocialPost {
  id: string;
  authorId: string;
  author?: SocialProfile;
  content: string;
  postType: "text" | "image" | "multi_image" | "video" | "poll";
  mediaUrls: string[];
  mediaType: "none" | "image" | "video" | "poll";
  pollOptions?: Array<{ id: string; text: string; votes: number }> | null;
  resharesPostId?: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  userReaction?: "like" | "love" | "celebrate" | "support" | "insightful" | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialReaction {
  postId: string;
  profileId: string;
  reactionType: "like" | "love" | "celebrate" | "support" | "insightful";
  createdAt: string;
}

export interface SocialComment {
  id: string;
  postId: string;
  authorId: string;
  author?: SocialProfile;
  parentCommentId?: string | null;
  content: string;
  likesCount: number;
  replies?: SocialComment[];
  createdAt: string;
  updatedAt: string;
}

export type ConnectionStatus = "none" | "pending_sent" | "pending_received" | "connected";

export interface SocialConnection {
  id: string;
  requesterId: string;
  requester?: SocialProfile;
  recipientId: string;
  recipient?: SocialProfile;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  updatedAt: string;
}

export interface SocialFollow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface PeopleDiscoveryProfile extends SocialProfile {
  connectionStatus: ConnectionStatus;
  connectionId?: string | null;
  isFollowing: boolean;
  sharedInterests: string[];
  sharedHobbies: string[];
}

export interface SocialStory {
  id: string;
  authorId: string;
  author?: SocialProfile;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string | null;
  audience: "everyone" | "connections";
  expiresAt: string;
  createdAt: string;
  viewsCount?: number;
  hasViewed?: boolean;
}

export interface SocialStoryView {
  storyId: string;
  viewerId: string;
  viewer?: SocialProfile;
  viewedAt: string;
}

export interface SocialReel {
  id: string;
  authorId: string;
  author?: SocialProfile;
  videoUrl: string;
  thumbnailUrl?: string | null;
  caption: string;
  audioTrack: string;
  hashtags: string[];
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  hasSaved?: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface SocialReelComment {
  id: string;
  reelId: string;
  authorId: string;
  author?: SocialProfile;
  content: string;
  likesCount: number;
  createdAt: string;
}

export interface SocialCommunity {
  id: string;
  creatorId: string;
  creator?: SocialProfile;
  name: string;
  slug: string;
  description: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  category: string;
  isPrivate: boolean;
  rules: string[];
  membersCount: number;
  isMember?: boolean;
  membershipStatus?: "active" | "pending_request" | "none";
  myRole?: "owner" | "moderator" | "member" | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialCommunityMember {
  communityId: string;
  profileId: string;
  profile?: SocialProfile;
  role: "owner" | "moderator" | "member";
  status: "active" | "pending_request" | "banned";
  joinedAt: string;
}

export interface SocialCommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  author?: SocialProfile;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  hasLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialEvent {
  id: string;
  organizerId: string;
  organizer?: SocialProfile;
  title: string;
  description: string;
  coverUrl?: string | null;
  category: string;
  venueName: string;
  city: string;
  isOnline: boolean;
  meetingUrl?: string | null;
  startTime: string;
  endTime?: string | null;
  publicSafetyGuidance: string;
  isAttendeeListVisible: boolean;
  status: "active" | "cancelled" | "completed";
  rsvpsCount?: {
    going: number;
    interested: number;
  };
  myRsvp?: "going" | "interested" | "not_going" | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialEventRsvp {
  eventId: string;
  profileId: string;
  profile?: SocialProfile;
  rsvpStatus: "going" | "interested" | "not_going";
  updatedAt: string;
}

export interface SocialConversation {
  id: string;
  isGroup: boolean;
  title?: string | null;
  creatorId?: string | null;
  lastMessageAt: string;
  lastMessage?: string | null;
  unreadCount?: number;
  participants: SocialConversationParticipant[];
  createdAt: string;
}

export interface SocialConversationParticipant {
  conversationId: string;
  profileId: string;
  profile?: SocialProfile;
  isAdmin: boolean;
  status: "accepted" | "pending_request" | "declined";
  lastReadAt?: string | null;
  joinedAt: string;
}

export interface SocialMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: SocialProfile;
  content: string;
  mediaUrl?: string | null;
  attachments?: any;
  createdAt: string;
}

export interface SocialNotification {
  id: string;
  recipientProfileId: string;
  actorProfileId?: string | null;
  actor?: SocialProfile | null;
  notificationType:
    | "follow"
    | "connection_req"
    | "connection_accept"
    | "like"
    | "comment"
    | "comment_reply"
    | "nested_reply"
    | "story_reply"
    | "community_post"
    | "community_join"
    | "event_invite"
    | "event_rsvp"
    | "mention"
    | "reel_like"
    | "message";
  entityId?: string | null;
  entityType?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SocialBlock {
  blockerId: string;
  blockedId: string;
  blockedProfile?: SocialProfile;
  createdAt: string;
}

export interface SocialMute {
  muterId: string;
  mutedId: string;
  createdAt: string;
}

export interface SocialReport {
  id: string;
  reporterId: string;
  targetType: "profile" | "post" | "comment" | "story" | "reel" | "community" | "event" | "message";
  targetId: string;
  reason: string;
  details?: string | null;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedSearchResults {
  people: PeopleDiscoveryProfile[];
  posts: SocialPost[];
  communities: SocialCommunity[];
  events: SocialEvent[];
}

// --- 4. FOUNDERS & STARTUP ENTITIES ---
export type StartupRole = "owner" | "admin" | "editor" | "viewer" | "hiring_manager";
export type StartupStage =
  | "idea"
  | "research"
  | "validation"
  | "mvp"
  | "early_traction"
  | "growth"
  | "scaling"
  | "profitable";
export type VerificationLevel = "unverified" | "pending" | "verified_project" | "verified_business";

export interface StartupVisibilitySettings {
  isPublic: boolean;
  showTeam: boolean;
  showContact: boolean;
  allowCollabs: boolean;
  allowConnects: boolean;
}

export interface Startup {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  oneLiner: string;
  fullAbout?: string | null;
  problem?: string | null;
  solution?: string | null;
  industry: string;
  additionalCategories?: string[];
  stage: StartupStage;
  foundedDate?: string | null;
  businessModel?: string | null;
  technologies?: string[];
  targetCustomers?: string | null;
  broadLocation: string;
  websiteUrl?: string | null;
  demoUrl?: string | null;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  } | null;
  verificationLevel: VerificationLevel;
  visibilitySettings?: StartupVisibilitySettings;
  followersCount?: number;
  connectionsCount?: number;
  seekingTalent?: boolean;
  seekingCollabs?: boolean;
  seekingFunding?: boolean;
  isFollowing?: boolean;
  isConnected?: boolean;
  hasPendingConnection?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StartupMember {
  startupId: string;
  profileId: string;
  profile?: FounderProfile;
  role: StartupRole;
  title: string;
  joinedAt: string;
  canManageHiring?: boolean;
  canPublishUpdates?: boolean;
  canManageProducts?: boolean;
  canManageCollabs?: boolean;
}

export type ProductCategory =
  | "ai_ml"
  | "developer_tools"
  | "saas"
  | "productivity"
  | "education"
  | "finance"
  | "marketing"
  | "design"
  | "business"
  | "social"
  | "ecommerce"
  | "healthcare"
  | "gaming"
  | "other";

export type ProductStatus =
  | "idea"
  | "in_development"
  | "beta"
  | "live"
  | "discontinued";

export type ProductPricingModel =
  | "free"
  | "freemium"
  | "paid"
  | "subscription"
  | "open_source"
  | "other";

export type ProductModerationStatus =
  | "approved"
  | "monitoring"
  | "flagged"
  | "restricted"
  | "removed";

export interface Product {
  id: string;
  makerId: string;
  maker?: FounderProfile;
  startupId?: string | null;
  startup?: Startup;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  problem?: string | null;
  solution?: string | null;
  features?: string[];
  logoUrl: string;
  coverUrl?: string | null;
  mediaUrls: string[];
  screenshots?: string[];
  websiteUrl: string;
  demoUrl?: string | null;
  category: ProductCategory | string;
  status: ProductStatus;
  pricingModel: ProductPricingModel;
  technologies?: string[];
  targetAudience?: string | null;
  upvotesCount: number;
  hasUpvoted?: boolean;
  followersCount?: number;
  hasFollowed?: boolean;
  savesCount?: number;
  hasSaved?: boolean;
  canManage?: boolean;
  commentsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
  launchDate: string;
  scheduledLaunchDate?: string | null;
  isPublished: boolean;
  moderationStatus: ProductModerationStatus;
  moderationReason?: string | null;
  viewsCount?: number;
  websiteClicks?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductUpvote {
  productId: string;
  profileId: string;
  createdAt: string;
}

export interface ProductComment {
  id: string;
  productId: string;
  authorId: string;
  author?: FounderProfile;
  parentId?: string | null;
  content: string;
  isMakerReply?: boolean;
  isQuestion?: boolean;
  likesCount: number;
  hasLiked?: boolean;
  replies?: ProductComment[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductCommentLike {
  commentId: string;
  profileId: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  reviewerId: string;
  reviewer?: FounderProfile;
  rating: number; // 1 to 5
  title?: string | null;
  content: string;
  isVerifiedUser?: boolean;
  createdAt: string;
}

export interface ProductUpdate {
  id: string;
  productId: string;
  makerId: string;
  title: string;
  content: string;
  version?: string | null;
  mediaUrls?: string[];
  broadcastToFeed?: boolean;
  feedPostId?: string | null;
  createdAt: string;
}

export interface ProductFollow {
  productId: string;
  profileId: string;
  createdAt: string;
}

export interface ProductSave {
  productId: string;
  profileId: string;
  collectionId?: string | null;
  createdAt: string;
}

export interface ProductCollection {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
  itemCount: number;
  productIds: string[];
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductModerationRecord {
  id: string;
  productId: string;
  previousStatus: ProductModerationStatus;
  newStatus: ProductModerationStatus;
  reason: string;
  triggeredBy: "automated_system" | "admin" | "appeal_review";
  adminId?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ProductModerationAppeal {
  id: string;
  productId: string;
  makerId: string;
  appealReason: string;
  supportingInfo?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface MakerAnalytics {
  productId: string;
  viewsCount: number;
  upvotesCount: number;
  commentsCount: number;
  followersCount: number;
  savesCount: number;
  websiteClicks: number;
  rankToday?: number;
  trendHistory: Array<{
    date: string;
    views: number;
    upvotes: number;
    clicks: number;
  }>;
}


export type OpportunityCategory =
  | "cofounder"
  | "developer"
  | "designer"
  | "marketing"
  | "sales"
  | "contributor"
  | "freelance"
  | "beta_tester"
  | "mentor"
  | "collaboration"
  | "other";

export type OpportunityCompensation =
  | "paid"
  | "equity"
  | "paid_and_equity"
  | "voluntary"
  | "discussion"
  | "unpaid_internship";

export type OpportunityStatus = "draft" | "open" | "paused" | "closed";

export type OpportunityApplicationStatus =
  | "submitted"
  | "viewed"
  | "shortlisted"
  | "conversation"
  | "meeting"
  | "accepted"
  | "declined"
  | "withdrawn";

export interface Opportunity {
  id: string;
  creatorId: string;
  creator?: FounderProfile;
  startupId?: string | null;
  startup?: Startup | null;
  title: string;
  type?: "co_founder" | "developer" | "designer" | "marketing" | "sales" | "mentor" | "contributor" | "other";
  category?: OpportunityCategory;
  summary?: string;
  description: string;
  responsibilities?: string[];
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceLevel: string;
  commitmentHours?: string;
  workMode: "remote" | "hybrid" | "in_person";
  broadLocation: string;
  compensation: OpportunityCompensation;
  compensationDetails?: string;
  deadline?: string;
  openingsCount: number;
  applicationQuestions?: string[];
  portfolioLinks?: string[];
  status: OpportunityStatus;
  viewsCount?: number;
  applicationsCount?: number;
  shortlistedCount?: number;
  acceptedCount?: number;
  hasApplied?: boolean;
  hasSaved?: boolean;
  userApplicationStatus?: OpportunityApplicationStatus | null;
  createdAt: string;
  updatedAt?: string;
}

export type OpportunityListing = Opportunity;

export interface OpportunityApplication {
  id: string;
  opportunityId: string;
  opportunity?: Opportunity;
  applicantId: string;
  applicant?: FounderProfile;
  introduction: string;
  whyInterested: string;
  skillsAndExperience: string;
  portfolioLinks?: string[];
  availabilityCommitment: string;
  compensationExpectations?: string;
  questionAnswers?: Array<{ question: string; answer: string }>;
  status: OpportunityApplicationStatus;
  internalNotes?: string | null;
  meetingDetails?: {
    date: string;
    link?: string;
    agenda?: string;
  } | null;
  canMessage?: boolean;
  reviewedAt?: string | null;
  statusUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- 5. STARTUP COLLABORATION & PARTNERSHIPS (FEATURE 8) ---
export type CollaborationStatus =
  | "draft"
  | "pending"
  | "sent"
  | "received"
  | "under_review"
  | "more_info_requested"
  | "counter_proposed"
  | "countered"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "expired"
  | "meeting_requested";

export interface StartupCollaborationProfile {
  startupId: string;
  startup?: Startup;
  whatWeDo: string;
  productsAndServices: string[];
  industriesServed: string[];
  targetCustomers: string;
  technologies: string[];
  whatWeOffer: string;
  whatWeNeed: string;
  preferredPartnershipTypes: CollaborationType[];
  collaborationGoals: string;
  broadOperatingRegions: string[];
  preferredContactMethod: "platform_proposal" | "scheduled_intro" | "connection_first";
  isActivelySeeking: boolean;
  updatedAt: string;
}

export interface StartupOutreachAllowance {
  startupId: string;
  baseWeeklyLimit: number; // Default 5 per rolling 7 days
  earnedBonusLimit: number;
  totalWeeklyLimit: number;
  proposalsSentInRollingPeriod: number;
  allowanceRemaining: number;
  rollingPeriodDays: number;
  resetsAt: string;
}

export interface CounterProposalRecord {
  id: string;
  proposedByStartupId: string;
  proposedByProfileId: string;
  commercialTerms?: string | null;
  whatWeOffer?: string | null;
  whatWeNeed?: string | null;
  responsibilities?: string[];
  notes: string;
  createdAt: string;
}

export interface CollaborationRequest {
  id: string;
  initiatorStartupId: string;
  initiatorStartup?: Startup;
  receiverStartupId: string;
  receiverStartup?: Startup;
  sentByProfileId: string;
  sentBy?: FounderProfile;
  collabType: CollaborationType;
  title: string;
  format?: "intro" | "detailed";
  summary?: string;
  message?: string;
  compatibilityReason?: string;
  expectedBenefits?: string;
  whatWeOffer: string;
  whatWeNeed: string;
  commercialTerms?: string | null;
  responsibilities?: string[];
  proposedDuration?: string;
  successCriteria?: string;
  expectedOutcomes?: string;
  supportingLinks?: string[];
  status: CollaborationStatus;
  statusHandledByProfileId?: string | null;
  statusUpdatedAt?: string | null;
  meetingRequestDetails?: {
    datetime: string;
    agenda: string;
    linkOrLocation?: string;
  } | null;
  moreInfoQuery?: string | null;
  moreInfoResponse?: string | null;
  counterProposals?: CounterProposalRecord[];
  partnershipSpaceId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnershipSpace {
  id: string;
  collaborationRequestId: string;
  collaborationRequest?: CollaborationRequest;
  startupAId: string;
  startupA?: Startup;
  startupBId: string;
  startupB?: Startup;
  partnershipType: CollaborationType;
  title?: string;
  objectives: string;
  agreedDuration?: string;
  startDate: string;
  targetCompletionDate?: string;
  status: "active" | "completed" | "paused" | "disputed" | "terminated";
  authorizedMemberIds: string[]; // Explicit member profile IDs
  createdAt: string;
  updatedAt?: string;
}

export interface PartnershipMessage {
  id: string;
  spaceId: string;
  senderProfileId: string;
  senderStartupId: string;
  senderName: string;
  text: string;
  attachments?: string[];
  createdAt: string;
}

export interface PartnershipTask {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  assignedProfileId?: string | null;
  assignedStartupId?: string | null;
  dueDate?: string;
  status: "todo" | "in_progress" | "review" | "completed";
  progress: number; // 0 to 100
  createdByProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnershipMilestone {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string | null;
  isCompleted: boolean;
  completionNotes?: string | null;
  createdAt: string;
}

export interface PartnershipDocument {
  id: string;
  spaceId: string;
  uploadedByProfileId: string;
  uploadedByStartupId: string;
  name: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  accessLevel: "all_partners" | "lead_only";
  createdAt: string;
}

export interface PartnershipMeeting {
  id: string;
  spaceId: string;
  title: string;
  dateTime: string;
  timezone: string;
  agenda: string;
  meetingUrlOrLocation?: string;
  notes?: string | null;
  followUpActions?: string[];
  scheduledByProfileId: string;
  createdAt: string;
}

export interface PartnershipActivityLog {
  id: string;
  spaceId: string;
  actorProfileId: string;
  actorStartupId: string;
  action: string;
  details?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PartnershipReferral {
  id: string;
  spaceId: string;
  referringStartupId: string;
  referringStartup?: Startup;
  receivingStartupId: string;
  receivingStartup?: Startup;
  customerReference: string; // Minimal/anonymized reference
  referralDate: string;
  status:
    | "submitted"
    | "received"
    | "contacted"
    | "qualified"
    | "converted"
    | "rejected"
    | "closed";
  outcomeNotes?: string;
  commissionTerms?: string;
  reportedRevenueValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PartnershipCommission {
  id: string;
  spaceId: string;
  referralId?: string | null;
  commissionType: "no_commission" | "fixed" | "percentage" | "recurring";
  rateOrAmount: string;
  calculationBasis?: string;
  paymentFrequency?: string;
  reportedPaymentStatus: "pending" | "invoiced" | "settled_externally" | "cancelled";
  legalDisclaimer: string;
  createdAt: string;
}

export interface PartnershipReview {
  id: string;
  spaceId: string;
  reviewerStartupId: string;
  reviewedStartupId: string;
  reviewerProfileId: string;
  communication: number; // 1-5
  professionalism: number; // 1-5
  reliability: number; // 1-5
  delivery: number; // 1-5
  transparency: number; // 1-5
  overallExperience: number; // 1-5
  overallScore: number;
  feedback: string;
  rightOfReply?: {
    profileId: string;
    replyText: string;
    repliedAt: string;
  } | null;
  isModerated: boolean;
  createdAt: string;
}

export interface PartnershipDispute {
  id: string;
  spaceId: string;
  openedByStartupId: string;
  openedByProfileId: string;
  category: "commercial_terms" | "non_delivery" | "confidentiality" | "communication_breakdown" | "other";
  description: string;
  supportingEvidence?: string[];
  otherPartyResponse?: string | null;
  status: "opened" | "under_platform_review" | "mediation_suggested" | "resolved" | "closed";
  platformAssistanceNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface PartnershipAnalytics {
  startupId: string;
  incomingProposals: number;
  sentProposals: number;
  acceptedPartnerships: number;
  activePartnerships: number;
  completedPartnerships: number;
  rejectedProposals: number;
  totalReferrals: number;
  qualifiedReferrals: number;
  convertedReferrals: number;
  reportedCommercialValue: number;
  allowanceRemaining: number;
  allowanceResetsAt: string;
}


// --- 6. MESSAGING & CHAT ---
export interface ConversationSummary {
  id: string;
  world: WorldType;
  title?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  participants: Array<{
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string | null;
  }>;
}

// --- 7. WORLD CONTEXT ---
export interface WorldContextState {
  activeWorld: WorldType;
  switchWorld: (world: WorldType) => void;
  hasSocialProfile: boolean;
  hasFounderProfile: boolean;
  socialProfile: SocialProfile | null;
  founderProfile: FounderProfile | null;
  isLoading: boolean;
}

// --- 8. FOUNDER FEED ENTITIES (FEATURE 2) ---
export type FounderPostType =
  | "general"
  | "startup_announcement"
  | "product_launch"
  | "hiring"
  | "opportunity"
  | "question"
  | "milestone"
  | "collaboration";

export type FounderAudience = "public" | "founders" | "connections" | "only_me";

export interface FounderPost {
  id: string;
  authorId: string;
  author?: FounderProfile;
  authorHeadline?: string | null;
  postType: FounderPostType;
  content: string;
  mediaUrls: string[];
  mediaType: "none" | "image" | "video";
  linkPreview?: {
    url: string;
    title: string;
    description: string;
    image?: string;
  } | null;
  associatedStartupId?: string | null;
  associatedStartup?: Startup | null;
  associatedProductId?: string | null;
  associatedProduct?: Product | null;
  associatedOpportunityId?: string | null;
  associatedOpportunity?: Opportunity | null;
  audience: FounderAudience;
  topics: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  hasSaved?: boolean;
  hasReposted?: boolean;
  isDirectRepost?: boolean;
  repostedPostId?: string | null;
  repostedPost?: FounderPost | null;
  repostedByAuthorName?: string | null;
  commentary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FounderComment {
  id: string;
  postId: string;
  authorId: string;
  author?: FounderProfile;
  parentId?: string | null;
  content: string;
  likesCount: number;
  hasLiked?: boolean;
  replies?: FounderComment[];
  createdAt: string;
  updatedAt: string;
}

export interface FounderReport {
  id: string;
  reporterId: string;
  targetType: "post" | "comment" | "founder";
  targetId: string;
  reason: string;
  details?: string | null;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: string;
}

// --- 9. FEATURE 3: FOUNDER NETWORK & COFOUNDER DISCOVERY ---
export interface FounderConnection {
  id: string;
  requesterId: string;
  requester?: FounderProfile;
  recipientId: string;
  recipient?: FounderProfile;
  note?: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  updatedAt: string;
}

export interface CofounderRequest {
  id: string;
  requesterId: string;
  requester?: FounderProfile;
  recipientId: string;
  recipient?: FounderProfile;
  introduction: string;
  ideaDescription: string;
  proposedRole: string;
  reasonForContacting: string;
  commitmentExpectations: string;
  equityExpectations?: string;
  associatedStartupId?: string | null;
  associatedStartup?: Startup | null;
  status: "pending" | "accepted" | "rejected" | "more_info_requested" | "withdrawn";
  moreInfoResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FounderProfileView {
  id: string;
  profileId: string;
  viewerId: string;
  viewer?: FounderProfile;
  viewedAt: string;
}

export type NetworkConnectionStatus = "none" | "pending_sent" | "pending_received" | "accepted" | "rejected";

export interface NetworkFounderProfile extends FounderProfile {
  connectionStatus: NetworkConnectionStatus;
  connectionId?: string | null;
  connectionNote?: string | null;
  isFollowing: boolean;
  canMessage: boolean;
  startupAffiliation?: {
    id: string;
    name: string;
    role: string;
    stage: string;
    industry: string;
  } | null;
  lookingFor?: string[];
  verificationBadge?: "verified_founder" | "verified_builder" | "verified_business" | "none";
}

export interface ProfileViewAnalyticsResponse {
  isLocked: boolean;
  totalViews: number;
  uniqueViewersCount: number;
  views: FounderProfileView[];
  message?: string;
}

// --- 10. FEATURE 5: HIRING CENTRE ---
export type JobEmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "freelance"
  | "internship";

export type JobWorkMode = "remote" | "hybrid" | "on-site";

export type JobCompensationType = "range" | "fixed" | "negotiable" | "not_disclosed";

export type JobStatus = "draft" | "open" | "paused" | "closed" | "expired";

export type JobApplicationStatus =
  | "applied"
  | "viewed"
  | "shortlisted"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface ScreeningQuestion {
  id: string;
  question: string;
  required: boolean;
  type: "text" | "yes_no" | "numeric";
}

export interface ScreeningAnswer {
  questionId: string;
  question: string;
  answer: string;
}

export interface JobListing {
  id: string;
  startupId: string;
  startup?: Startup;
  creatorProfileId: string;
  creator?: FounderProfile;
  title: string;
  department: string;
  employmentType: JobEmploymentType;
  jobSummary: string;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experienceRequirements: string;
  qualifications?: string;
  workMode: JobWorkMode;
  broadLocation: string;
  compensationType: JobCompensationType;
  compensationMin?: number;
  compensationMax?: number;
  currency: string;
  workingHours?: string;
  openingsCount: number;
  applicationDeadline: string;
  screeningQuestions: ScreeningQuestion[];
  hiringContact?: {
    name: string;
    title: string;
    profileId?: string;
    emailOrProfileUrl?: string;
  };
  recruitmentProcess?: string[];
  status: JobStatus;
  viewsCount: number;
  applicationsCount: number;
  hasSaved?: boolean;
  hasApplied?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationStatusHistoryEntry {
  status: JobApplicationStatus;
  changedAt: string;
  changedByProfileId?: string;
  reasonOrNote?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job?: JobListing;
  startupId: string;
  startup?: Startup;
  applicantProfileId: string;
  applicant?: FounderProfile;
  personalIntro: string;
  resumeUrl: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  relevantSkills: string[];
  experienceYears?: number;
  currentRole?: string;
  portfolioUrl?: string;
  projectsSummary?: string;
  availability: string;
  joiningTimeline: string;
  expectedCompensation?: string;
  screeningAnswers: Record<string, string>;
  supportingDocuments?: Array<{ name: string; url: string; size?: number }>;
  status: JobApplicationStatus;
  statusHistory: JobApplicationStatusHistoryEntry[];
  reviewedAt?: string | null;
  canMessage?: boolean;
  interviews?: JobInterview[];
  createdAt: string;
  updatedAt: string;
}

export interface JobInternalNote {
  id: string;
  applicationId: string;
  startupId: string;
  authorProfileId: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export type JobInterviewType = "video" | "phone" | "in_person" | "technical" | "cultural_fit";
export type JobInterviewStatus = "scheduled" | "completed" | "rescheduled" | "cancelled";

export interface JobInterview {
  id: string;
  applicationId: string;
  startupId: string;
  jobId: string;
  scheduledByProfileId: string;
  candidateProfileId: string;
  candidateName?: string;
  jobTitle?: string;
  interviewDate: string;
  interviewTime: string;
  timezone: string;
  interviewType: JobInterviewType;
  meetingLocationOrLink: string;
  instructions?: string;
  candidateFacingNotes?: string;
  recruiterPrivateNotes?: string;
  status: JobInterviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HiringDashboardMetrics {
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  viewedApplications: number;
  shortlisted: number;
  screening: number;
  interviews: number;
  offers: number;
  hires: number;
  upcomingDeadlinesCount: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string;
    applicationsCount: number;
  }>;
}

export interface HiringPermissionMember {
  profileId: string;
  profileName: string;
  profileHeadline?: string;
  avatarUrl?: string;
  role: StartupRole;
  title: string;
  canManageHiring: boolean;
  isEffectiveRecruiter: boolean;
  joinedAt: string;
}

export interface JobModerationReport {
  id: string;
  reporterProfileId: string;
  jobId: string;
  reason: string;
  details?: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: string;
}

export interface HiringAuditLog {
  id: string;
  startupId: string;
  actorProfileId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// --- 11. FEATURE 6: STARTUP HUB ---
export interface StartupInvitation {
  id: string;
  startupId: string;
  startup?: Startup;
  inviteeProfileId: string;
  invitee?: FounderProfile;
  invitedByProfileId: string;
  invitedBy?: FounderProfile;
  role: StartupRole;
  title: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
}

export interface OwnershipTransferRequest {
  id: string;
  startupId: string;
  startup?: Startup;
  currentOwnerProfileId: string;
  currentOwner?: FounderProfile;
  targetOwnerProfileId: string;
  targetOwner?: FounderProfile;
  previousOwnerResultingRole: "admin" | "editor" | "viewer";
  note?: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  createdAt: string;
  completedAt?: string;
}

export type StartupUpdateType =
  | "announcement"
  | "milestone"
  | "product_update"
  | "partnership"
  | "hiring"
  | "funding"
  | "event"
  | "achievement"
  | "general";

export interface StartupUpdate {
  id: string;
  startupId: string;
  startup?: Startup;
  authorProfileId: string;
  author?: FounderProfile;
  title: string;
  content: string;
  updateType: StartupUpdateType;
  mediaUrls: string[];
  associatedProductId?: string | null;
  associatedProduct?: Product | null;
  associatedJobId?: string | null;
  associatedJob?: JobListing | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hasLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StartupAnalytics {
  profileViews: number;
  uniqueVisitors: number;
  followersCount: number;
  connectionsCount: number;
  productViews: number;
  websiteClicks: number;
  updateEngagement: number;
  jobViews: number;
  applicationsReceived: number;
  collaborationRequests: number;
  weeklyTrend: Array<{
    date: string;
    views: number;
    applications: number;
    engagement: number;
  }>;
}

export interface StartupFollow {
  startupId: string;
  profileId: string;
  createdAt: string;
}

export interface StartupConnection {
  id: string;
  startupId: string;
  startup?: Startup;
  requesterProfileId: string;
  requester?: FounderProfile;
  status: "pending" | "accepted" | "rejected";
  note?: string;
  createdAt: string;
}

export interface StartupActivityLog {
  id: string;
  startupId: string;
  actorProfileId: string;
  action: string;
  details?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StartupInvestInquiry {
  id: string;
  startupId: string;
  investorProfileId: string;
  investorName: string;
  investorHeadline?: string;
  ticketSizeRange?: string;
  inquiryType: "syndicate" | "angel" | "institutional" | "strategic" | "info_request";
  message: string;
  status: "pending" | "connected" | "declined";
  createdAt: string;
}

// --- FEATURE 9: REFERRAL EXCHANGE TYPES ---

export interface ReferralListing {
  id: string;
  publisherType: "individual" | "startup";
  publisherProfileId: string;
  publisherProfile?: FounderProfile;
  startupId?: string | null;
  startup?: Startup;
  listingType: ReferralListingType; // offering | requesting
  title: string;
  description: string;
  industry: string;
  targetAudience: string;
  customerCategory: string;
  productOrService: string;
  idealReferralProfile: string;
  requiredQualifications?: string;
  broadRegion: string;
  expectedOutcome: string;
  referralArrangement: ReferralArrangement;
  commissionChoice: CommissionDisclosureChoice;
  disclosedCommissionDetails?: string;
  expiryDate: string;
  websiteUrl?: string | null;
  status: "draft" | "active" | "paused" | "closed" | "expired";
  moderationStatus: "approved" | "monitoring" | "flagged" | "restricted" | "removed";
  moderationReason?: string | null;
  viewsCount: number;
  requestsCount: number;
  savedCount: number;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralRequest {
  id: string;
  listingId: string;
  listing?: ReferralListing;
  requesterType: "individual" | "startup";
  requesterProfileId: string;
  requesterProfile?: FounderProfile;
  requesterStartupId?: string | null;
  requesterStartup?: Startup;
  message: string;
  relevance: string;
  potentialOpportunity: string;
  relevantProductOrStartup?: string;
  expectedOutcome: string;
  supportingLinks?: string[];
  additionalContext?: string;
  status:
    | "submitted"
    | "received"
    | "under_review"
    | "more_info_requested"
    | "accepted"
    | "rejected"
    | "in_progress"
    | "qualified"
    | "converted"
    | "closed"
    | "withdrawn";
  statusNotes?: string;
  moreInfoQuery?: string;
  moreInfoResponse?: string;
  partnershipSpaceId?: string | null;
  commissionAgreementId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralCommissionVersion {
  version: number;
  proposedByProfileId: string;
  proposedByParty: "publisher" | "requester";
  commissionType: "no_commission" | "fixed" | "percentage" | "recurring" | "custom";
  rateOrAmount: string;
  calculationBasis: string;
  paymentFrequency: string;
  responsibilities: string;
  effectiveDate: string;
  confirmedByPartyA: boolean; // Publisher
  confirmedByPartyB: boolean; // Requester
  status: "draft" | "proposed" | "confirmed" | "superseded" | "declined";
  createdAt: string;
  confirmedAt?: string | null;
}

export interface ReferralCommissionAgreement {
  id: string;
  requestId: string;
  listingId: string;
  partyAProfileId: string; // Publisher
  partyBProfileId: string; // Requester
  partyAStartupId?: string | null;
  partyBStartupId?: string | null;
  currentVersion: number;
  versions: ReferralCommissionVersion[];
  isFullyConfirmed: boolean;
  activeTerms?: ReferralCommissionVersion;
  updatedAt: string;
}

export interface ReferralCustomerPrivateData {
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

export interface ReferralPipelineRecord {
  id: string;
  requestId: string;
  listingId: string;
  partnershipSpaceId?: string | null;
  referrerProfileId: string;
  referrerStartupId?: string | null;
  recipientProfileId: string;
  recipientStartupId?: string | null;
  stage: ReferralPipelineStage;
  customerReference: string;
  customerPrivateData?: ReferralCustomerPrivateData | null;
  introductionDate?: string | null;
  contactedDate?: string | null;
  qualifiedDate?: string | null;
  conversionDate?: string | null;
  closedDate?: string | null;
  outcomeNotes?: string | null;
  reportedRevenueValue?: number | null;
  calculatedCommissionAmount?: number | null;
  paymentStatus: ReferralPaymentStatus;
  paymentReportedDate?: string | null;
  paymentNotes?: string | null;
  stageHistory: Array<{
    stage: ReferralPipelineStage;
    updatedByProfileId: string;
    timestamp: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralExchangeAnalytics {
  activeListingsCount: number;
  offeringsCount: number;
  requestingsCount: number;
  requestsReceivedCount: number;
  requestsSentCount: number;
  acceptedReferralsCount: number;
  introductionsCompletedCount: number;
  qualifiedLeadsCount: number;
  reportedConversionsCount: number;
  totalReportedRevenue: number;
  totalReportedCommission: number;
  paidCommissionCount: number;
}

export interface ReferralReport {
  id: string;
  listingId: string;
  reporterProfileId: string;
  reason: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

// ---------------------------------------------------------------------------
// FEATURE 10: MENTOR NETWORK TYPES
// ---------------------------------------------------------------------------

export type {
  MentorExpertiseCategory,
  MentorshipFormat,
  MentorshipMeetingArrangement,
  MentorshipPricingOption,
  MentorshipRequestStatus,
  MentorshipSessionStatus,
  MentorshipPaymentStatus,
} from "@platform/config";

import type {
  MentorExpertiseCategory,
  MentorshipFormat,
  MentorshipMeetingArrangement,
  MentorshipPricingOption,
  MentorshipRequestStatus,
  MentorshipSessionStatus,
  MentorshipPaymentStatus,
} from "@platform/config";

export interface MentorPricingConfig {
  pricingOption: MentorshipPricingOption;
  price?: number | null;
  currency?: string;
  sessionDurationMinutes?: number;
  pricingBasis?: "per_session" | "monthly" | "total_package" | "custom";
  isRecurring?: boolean;
  includedServices?: string[];
  cancellationTerms?: string;
  additionalConditions?: string;
  subsequentSessionPrice?: number | null;
  subsequentSessionCurrency?: string;
}

export interface MentorProfile {
  id: string;
  profileId: string;
  profile?: FounderProfile;
  headline: string;
  introduction: string;
  professionalExperience: string;
  expertise: MentorExpertiseCategory[];
  industries: string[];
  skills: string[];
  companyExperience: string;
  previousMentoringExperience: string;
  achievements?: string;
  languages: string[];
  broadLocation: string;
  preferredMenteeCategories: string[];
  availabilityDescription: string;
  preferredMeetingFormat: MentorshipMeetingArrangement;
  pricing: MentorPricingConfig;
  websiteUrl?: string | null;
  portfolioUrl?: string | null;
  status: "active" | "paused" | "draft";
  moderationStatus?: "active" | "under_review" | "suspended";
  isVerified?: boolean;
  verifiedBadgeTitle?: string | null;
  viewsCount: number;
  menteesCount: number;
  sessionsCompletedCount: number;
  rating: number;
  reviewsCount: number;
  isSaved?: boolean;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipAgreementVersion {
  version: number;
  proposedByProfileId: string;
  pricingOption: MentorshipPricingOption;
  price?: number | null;
  currency: string;
  sessionDurationMinutes: number;
  pricingBasis: string;
  frequency?: string;
  cancellationTerms: string;
  includedServices?: string[];
  conditions?: string;
  effectiveDate: string;
  createdAt: string;
}

export interface MentorshipAgreement {
  id: string;
  mentorshipRequestId: string;
  mentorProfileId: string;
  menteeProfileId: string;
  currentVersion: number;
  versions: MentorshipAgreementVersion[];
  confirmedByMentor: boolean;
  confirmedByMentee: boolean;
  confirmedAtMentor?: string | null;
  confirmedAtMentee?: string | null;
  isFullyConfirmed: boolean;
  activeTerms: MentorshipAgreementVersion;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorProfileId: string;
  mentor?: MentorProfile;
  menteeProfileId: string;
  mentee?: FounderProfile;
  projectOrStartupName: string;
  helpNeeded: string;
  specificChallenge: string;
  goals: string;
  reasonForSelection: string;
  preferredFormat: MentorshipFormat;
  preferredAvailability: string;
  budget?: string | null;
  expectedDuration: string;
  additionalContext?: string | null;
  status: MentorshipRequestStatus;
  statusNotes?: string | null;
  statusHistory: Array<{
    status: MentorshipRequestStatus;
    updatedByProfileId: string;
    timestamp: string;
    notes?: string;
  }>;
  agreementId?: string | null;
  workspaceId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipSession {
  id: string;
  workspaceId: string;
  mentorshipRequestId: string;
  mentorProfileId: string;
  menteeProfileId: string;
  title: string;
  description?: string;
  sessionDate: string;
  startTime: string;
  timezone: string;
  durationMinutes: number;
  format: MentorshipMeetingArrangement;
  meetingLinkOrLocation: string;
  agenda?: string;
  preparationNotes?: string;
  status: MentorshipSessionStatus;
  notes?: string;
  actionItemsCreated?: string[];
  rescheduledFromSessionId?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipGoal {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  targetDate: string;
  progressPercentage: number;
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipActionItem {
  id: string;
  workspaceId: string;
  task: string;
  assignedProfileId: string;
  assignedName?: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  notes?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipResource {
  id: string;
  workspaceId: string;
  uploadedByProfileId: string;
  title: string;
  resourceType: "document" | "link" | "template" | "guide";
  urlOrPath: string;
  description?: string;
  createdAt: string;
}

export interface MentorshipWorkspace {
  id: string;
  mentorshipRequestId: string;
  mentorProfileId: string;
  mentor?: MentorProfile;
  menteeProfileId: string;
  mentee?: FounderProfile;
  mentorshipFormat: MentorshipFormat;
  agreedObjectives: string;
  startDate: string;
  expectedDuration: string;
  status: "active" | "completed" | "cancelled";
  sharedNotes: string;
  mentorPrivateNotes?: string;
  menteePrivateNotes?: string;
  paymentStatus: MentorshipPaymentStatus;
  paymentReportedDate?: string | null;
  paymentNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipReview {
  id: string;
  mentorshipRequestId: string;
  workspaceId: string;
  mentorProfileId: string;
  menteeProfileId: string;
  mentee?: FounderProfile;
  knowledgeRating: number;
  communicationRating: number;
  helpfulnessRating: number;
  professionalismRating: number;
  reliabilityRating: number;
  overallRating: number;
  reviewText: string;
  mentorReply?: string | null;
  mentorRepliedAt?: string | null;
  isReported?: boolean;
  isVerifiedSession?: boolean;
  moderationStatus: "approved" | "flagged" | "removed";
  createdAt: string;
  updatedAt: string;
}

export interface MentorDashboardStats {
  profileCompletion: number;
  profileViews: number;
  incomingRequestsCount: number;
  acceptedRequestsCount: number;
  activeMenteesCount: number;
  upcomingSessionsCount: number;
  completedSessionsCount: number;
  averageRating: number;
  reviewsCount: number;
  activityScore: number;
}

export interface MenteeDashboardStats {
  requestsSentCount: number;
  requestsAwaitingCount: number;
  activeMentorsCount: number;
  upcomingSessionsCount: number;
  completedSessionsCount: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  pendingActionItemsCount: number;
  reviewsSubmittedCount: number;
}

export interface MentorReport {
  id: string;
  mentorProfileId: string;
  reporterProfileId: string;
  reason: string;
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

// ============================================================================
// FEATURE 11: INVESTOR NETWORK TYPES
// ============================================================================

export interface InvestmentThesis {
  industries: string[];
  stages: string[];
  geographies: string[];
  businessModels: string[];
  technologies?: string[];
  targetMarkets?: string[];
  customerCategories?: string[];
  revenueStages?: string[];
  founderExperiencePreferences?: string[];
  minCheckSize?: number | null;
  maxCheckSize?: number | null;
  currency?: string;
  thesisSummary: string;
}

export interface InvestorRepresentative {
  profileId: string;
  profile?: FounderProfile;
  role: "principal" | "partner" | "associate" | "scout" | "authorized_representative";
  title: string;
  canManageProposals: boolean;
  canAcceptIntroductions: boolean;
  addedAt: string;
}

export interface InvestorProfile {
  id: string;
  profileId: string; // Associated Founder account/profile
  profile?: FounderProfile;
  investorType:
    | "angel_investor"
    | "vc_firm"
    | "corporate_investor"
    | "family_office"
    | "startup_investment_network"
    | "strategic_investor"
    | "syndicate"
    | "other";
  isOrganization: boolean;
  organizationName?: string | null;
  organizationLogoUrl?: string | null;
  headline: string;
  displayName?: string;
  biography: string;
  bio?: string;
  investmentExperience: string;
  thesis: InvestmentThesis;
  portfolioCompanies: {
    name: string;
    websiteUrl?: string;
    logoUrl?: string;
    investmentYear?: number;
    stage?: string;
  }[];
  websiteUrl?: string | null;
  professionalLinks: { label: string; url: string }[];
  preferredContactMethod: "balaga_message" | "email" | "introduction_only";
  isAvailableForIntros: boolean;
  acceptingPitches?: boolean;
  status: "active" | "paused" | "closed";
  verificationStatus:
    | "unverified"
    | "verification_submitted"
    | "pending"
    | "verified"
    | "rejected"
    | "expired"
    | "suspended";
  verifiedAt?: string | null;
  verifiedBadge?: boolean;
  verifiedBadgeTitle?: string | null;
  hasBookmarked?: boolean;
  isFollowing?: boolean;
  isMyProfile?: boolean;
  regulatoryDisclaimer?: string;
  representatives?: InvestorRepresentative[];
  viewsCount: number;
  introsReceivedCount: number;
  introsAcceptedCount: number;
  introRequestsReceivedCount?: number;
  investmentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorVerificationSubmission {
  id: string;
  investorProfileId: string;
  submittedByProfileId: string;
  evidenceType:
    | "identity_proof"
    | "organization_incorporation"
    | "fund_registration"
    | "portfolio_audit"
    | "other";
  documentUrls: string[];
  officialEntityName?: string;
  registrationNumber?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected" | "inconclusive";
  decisionNotes?: string;
  reviewedByProfileId?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface StartupFundraisingProfile {
  id: string;
  startupId: string;
  startup?: Startup;
  fundraisingStatus:
    | "not_fundraising"
    | "exploring"
    | "preparing"
    | "actively_fundraising"
    | "paused";
  privacyLevel: "private" | "connections_only" | "investors_only" | "public";
  fundingStage: string;
  amountSought?: number | null;
  currency: string;
  useOfFunds?: string;
  businessTraction?: string;
  revenueRange?: string | null;
  customerGrowth?: string | null;
  productMaturity?: string;
  pitchDeckUrl?: string | null;
  pitchDeckFilename?: string | null;
  demoUrl?: string | null;
  contactPreferences?: string;
  updatedByProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorIntroRequest {
  id: string;
  startupId: string;
  startup?: Startup;
  startupName?: string;
  founderProfileId: string;
  founder?: FounderProfile;
  requesterProfileId?: string;
  requesterName?: string;
  requesterHeadline?: string;
  investorProfileId: string;
  investor?: InvestorProfile;
  investorName?: string;
  investorOrg?: string | null;
  whyRelevant: string;
  businessOverview: string;
  fundraisingStage: string;
  targetRound?: string;
  askAmount?: number | null;
  amountSought?: number | null;
  currency?: string;
  note?: string;
  pitchDeckUrl?: string | null;
  specificRequest: string;
  additionalMessage?: string;
  status:
    | "submitted"
    | "received"
    | "under_review"
    | "more_info_requested"
    | "interested"
    | "accepted"
    | "rejected"
    | "meeting_requested"
    | "withdrawn"
    | "closed";
  statusNotes?: string;
  responseNote?: string;
  respondedAt?: string;
  statusHistory: {
    status: string;
    updatedByProfileId: string;
    timestamp: string;
    notes?: string;
  }[];
  fundraisingConversationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorInterest {
  id: string;
  investorProfileId: string;
  investor?: InvestorProfile;
  investorName?: string;
  investorOrg?: string | null;
  startupId: string;
  startup?: Startup;
  startupName?: string;
  personalizedNote: string;
  note?: string;
  proposedCheckSize?: number | null;
  timeline?: string | null;
  status:
    | "submitted"
    | "under_review"
    | "accepted"
    | "declined"
    | "more_info_requested"
    | "withdrawn";
  statusNotes?: string;
  responseNote?: string;
  respondedAt?: string;
  fundraisingConversationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorMeeting {
  id: string;
  conversationId?: string | null;
  investorProfileId: string;
  startupId: string;
  founderProfileId: string;
  introRequestId?: string | null;
  title: string;
  date?: string;
  time?: string;
  sessionDate: string;
  startTime: string;
  durationMinutes: number;
  timezone: string;
  format: "online" | "in_person" | "hybrid";
  meetingType?: "online" | "in_person" | "hybrid";
  meetingUrl?: string;
  locationAddress?: string;
  meetingLinkOrLocation: string;
  agenda?: string;
  preparationNotes?: string;
  notes?: string;
  status: "proposed" | "confirmed" | "rescheduled" | "cancelled" | "completed";
  proposedByProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundraisingConversation {
  id: string;
  startupId: string;
  startup?: Startup;
  startupName?: string;
  investorProfileId: string;
  investor?: InvestorProfile;
  investorName?: string;
  investorOrg?: string | null;
  founderProfileId: string;
  founder?: FounderProfile;
  founderName?: string;
  sourceType: "intro_request" | "investor_interest";
  sourceId: string;
  introRequestId?: string | null;
  discussionStatus:
    | "initial_review"
    | "meeting_scheduled"
    | "due_diligence"
    | "term_sheet_discussion"
    | "passed"
    | "closed";
  stage?: string;
  sharedPitchMaterials: {
    id: string;
    title: string;
    fileUrl: string;
    filename: string;
    uploadedByProfileId: string;
    uploadedAt: string;
  }[];
  sharedMaterials?: any[];
  followUpNotes?: string;
  notes?: string;
  lastActivityAt?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorDashboardStats {
  profileViews: number;
  savedStartupsCount: number;
  incomingIntroductionsCount: number;
  sentInterestCount: number;
  acceptedIntroductionsCount: number;
  upcomingMeetingsCount: number;
  activeConversationsCount: number;
  verificationStatus: string;
}

export interface FounderFundraisingDashboardStats {
  fundraisingProfileCompletion: number;
  investorViewsCount: number;
  introRequestsSentCount: number;
  incomingInvestorInterestCount: number;
  acceptedIntroductionsCount: number;
  upcomingMeetingsCount: number;
  activeConversationsCount: number;
  savedInvestorsCount: number;
}

export interface InvestorReport {
  id: string;
  investorProfileId: string;
  reporterProfileId: string;
  reason: "impersonation" | "fraudulent_claims" | "misleading_terms" | "spam" | "other";
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

// ============================================================================
// FEATURE 12: BALAGA BUILD SPACES INTERFACES
// ============================================================================

export interface BuildSpaceMember {
  id: string;
  spaceId: string;
  profileId: string;
  profile?: FounderProfile;
  role: BuildSpaceRole;
  title?: string;
  joinedAt: string;
}

export interface BuildSpaceJoinRequest {
  id: string;
  spaceId: string;
  space?: BuildSpace;
  applicantProfileId: string;
  applicant?: FounderProfile;
  introduction: string;
  relevantSkills: string[];
  portfolioLinks?: string[];
  status: BuildSpaceJoinRequestStatus;
  moreInfoQuery?: string;
  moreInfoResponse?: string;
  responseNotes?: string;
  reviewedByProfileId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildSpaceInvitation {
  id: string;
  spaceId: string;
  space?: BuildSpace;
  inviteeProfileId: string;
  invitee?: FounderProfile;
  invitedByProfileId: string;
  invitedBy?: FounderProfile;
  role: BuildSpaceRole;
  message?: string;
  status: BuildSpaceInvitationStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface BuildSpaceTaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedByProfileId?: string;
  completedAt?: string;
}

export interface BuildSpaceTaskComment {
  id: string;
  taskId: string;
  authorProfileId: string;
  authorName?: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface BuildSpaceTask {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  assignedProfileId?: string | null;
  assignee?: FounderProfile;
  priority: BuildSpaceTaskPriority;
  status: BuildSpaceTaskStatus;
  startDate?: string;
  dueDate?: string;
  tags?: string[];
  checklists: BuildSpaceTaskChecklistItem[];
  comments: BuildSpaceTaskComment[];
  attachments?: Array<{ id: string; name: string; url: string; size?: string }>;
  milestoneId?: string | null;
  createdByProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildSpaceMilestone {
  id: string;
  spaceId: string;
  title: string;
  description: string;
  targetDate: string;
  responsibleProfileId?: string | null;
  responsiblePerson?: FounderProfile;
  linkedTaskIds: string[];
  completionCriteria?: string;
  status: BuildSpaceMilestoneStatus;
  completionNotes?: string;
  completedDate?: string | null;
  createdByProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildSpaceMessage {
  id: string;
  spaceId: string;
  channel: string;
  senderProfileId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  attachments?: string[];
  isEdited?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BuildSpaceDocument {
  id: string;
  spaceId: string;
  folder: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileSize?: string;
  fileType?: string;
  version?: string;
  uploadedByProfileId: string;
  uploadedBy?: FounderProfile;
  createdAt: string;
  updatedAt: string;
}

export interface BuildSpaceMeeting {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  timezone: string;
  participantProfileIds: string[];
  agenda?: string;
  onlineMeetingLink?: string;
  publicLocation?: string;
  notes?: string;
  status: BuildSpaceMeetingStatus;
  scheduledByProfileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildSpaceActivity {
  id: string;
  spaceId: string;
  actorProfileId: string;
  actorName: string;
  action: string;
  details: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface BuildSpace {
  id: string;
  type: BuildSpaceType;
  name: string;
  slug: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  shortDescription: string;
  detailedOverview: string;
  category: BuildSpaceCategory;
  developmentStage: BuildSpaceStage;
  mainGoals: string[];
  expectedOutcomes: string[];
  skillsRequired: string[];
  technologiesUsed: string[];
  targetCompletionDate?: string | null;
  associatedStartupId?: string | null;
  associatedStartup?: Startup | null;
  visibility: BuildSpaceVisibility;
  status: BuildSpaceStatus;
  ownerProfileId: string;
  owner?: FounderProfile;
  memberCount: number;
  partnershipSpaceId?: string | null;
  partnershipSpace?: PartnershipSpace | null;
  createdAt: string;
  updatedAt: string;

  // Enriched client-facing computed fields
  currentUserRole?: BuildSpaceRole | null;
  isMember?: boolean;
  hasPendingJoinRequest?: boolean;
  hasPendingInvitation?: boolean;
  tasksTotalCount?: number;
  tasksCompletedCount?: number;
  taskProgressPercentage?: number;
  milestonesTotalCount?: number;
  milestonesCompletedCount?: number;
  milestoneProgressPercentage?: number;
  latestActivityAt?: string;
}

export interface BuildSpacePublicListing {
  id: string;
  type: "project";
  name: string;
  slug: string;
  logoUrl?: string | null;
  shortDescription: string;
  category: BuildSpaceCategory;
  developmentStage: BuildSpaceStage;
  skillsRequired: string[];
  technologiesUsed: string[];
  targetCompletionDate?: string | null;
  associatedStartupName?: string | null;
  memberCount: number;
  ownerName: string;
  ownerHeadline?: string;
  createdAt: string;
  hasPendingJoinRequest?: boolean;
}

export interface BuildSpaceStats {
  totalSpaces: number;
  projectSpacesCount: number;
  partnershipSpacesCount: number;
  myCreatedCount: number;
  joinedCount: number;
  pendingInvitationsCount: number;
  pendingJoinRequestsCount: number;
  activeTasksCount: number;
  completedTasksCount: number;
}

// --- 13. FEATURE 13: FOUNDERS INBOX & NOTIFICATIONS ---

export interface FoundersConversationAttachment {
  id: string;
  name: string;
  url: string;
  fileType: "image" | "document" | "pdf" | "other";
  sizeBytes: number;
}

export interface FoundersConversationParticipant {
  id: string;
  conversationId: string;
  profileId: string;
  profile?: FounderProfile;
  role: "admin" | "member";
  joinedAt: string;
  lastReadMessageId?: string | null;
  lastReadAt?: string | null;
}

export interface FoundersConversation {
  id: string;
  type: "direct" | "group" | "workspace";
  title?: string | null;
  category: FoundersInboxCategory;
  // Originating feature association references
  relatedEntityType?:
    | "connection"
    | "cofounder"
    | "opportunity"
    | "job_application"
    | "startup"
    | "product"
    | "partnership"
    | "referral"
    | "mentorship"
    | "investor_intro"
    | "build_space"
    | null;
  relatedEntityId?: string | null;
  startupId?: string | null;
  spaceId?: string | null;

  // Metadata & state
  creatorProfileId: string;
  avatarUrl?: string | null;
  description?: string | null;
  lastMessageSnippet?: string | null;
  lastMessageAt: string;
  lastMessageSenderId?: string | null;
  messageCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Populated dynamically for the current viewer
  isStarred?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  unreadCount?: number;
  participants?: FoundersConversationParticipant[];
}

export interface FoundersMessageReaction {
  emoji: string;
  profileId: string;
  profileName?: string;
  createdAt: string;
}

export interface FoundersMessage {
  id: string;
  conversationId: string;
  senderProfileId: string;
  sender?: FounderProfile;
  content: string;
  deliveryState: FoundersMessageDeliveryState;
  replyToMessageId?: string | null;
  replySnippet?: string | null;
  attachments: FoundersConversationAttachment[];
  reactions: FoundersMessageReaction[];
  isEdited: boolean;
  editedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoundersMessageRequest {
  id: string;
  senderProfileId: string;
  sender?: FounderProfile;
  recipientProfileId: string;
  recipient?: FounderProfile;
  category: FoundersInboxCategory;
  initialMessage: string;
  status: FoundersMessageRequestStatus;
  respondedAt?: string | null;
  conversationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FoundersUserInboxState {
  profileId: string;
  conversationId: string;
  isPinned: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isMuted: boolean;
  isDeletedFromInbox: boolean;
  customUnread: boolean;
  updatedAt: string;
}

export interface FoundersNotification {
  id: string;
  recipientProfileId: string;
  actorProfileId?: string | null;
  actor?: FounderProfile;
  title: string;
  description: string;
  category: FoundersNotificationCategory;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  navigationTarget: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface FoundersNotificationPreferences {
  profileId: string;
  inAppAlerts: boolean;
  emailAlerts: boolean;
  messageAlerts: boolean;
  connectionAlerts: boolean;
  opportunityAlerts: boolean;
  hiringAlerts: boolean;
  startupAlerts: boolean;
  collaborationAlerts: boolean;
  referralAlerts: boolean;
  mentorshipAlerts: boolean;
  investorAlerts: boolean;
  workspaceAlerts: boolean;
  mutedConversationIds: string[];
  updatedAt: string;
}

export interface FoundersInboxSummary {
  totalConversations: number;
  unreadConversationsCount: number;
  starredCount: number;
  archivedCount: number;
  pendingRequestsCount: number;
  unreadNotificationsCount: number;
}

// Feature 14: Verification & Premium System
export interface VerificationDocument {
  id: string;
  name: string;
  url: string;
  sizeBytes?: number;
  mimeType?: string;
  uploadedAt: string;
}

export interface VerificationApplication {
  id: string;
  type: VerificationType;
  applicantAccountId: string;
  applicantProfileId: string;
  applicant?: FounderProfile;
  startupId?: string | null;
  startupName: string;
  operatingStage?: string | null;
  website?: string | null;
  legalBusinessName?: string | null;
  registrationType?: string | null;
  registrationNumber?: string | null;
  jurisdiction?: string | null;
  supportingDocuments: VerificationDocument[];
  status: VerificationStatus;
  reviewerNotes?: string | null;
  rejectionReason?: string | null;
  appealNotes?: string | null;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationAuditRecord {
  id: string;
  applicationId: string;
  previousStatus: VerificationStatus;
  newStatus: VerificationStatus;
  changedByAccountId: string;
  notes?: string | null;
  createdAt: string;
}

export interface SubscriptionDetails {
  accountId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt?: string | null;
  autoRenew: boolean;
  paymentProvider?: string | null;
  entitlements: EntitlementKey[];
  updatedAt: string;
}

export interface ProfileViewerRecord {
  id: string;
  viewedProfileId: string;
  viewerProfileId: string;
  viewer?: FounderProfile;
  viewedAt: string;
}

export interface ProfileAnalyticsData {
  totalViews: number;
  uniqueViewersCount: number;
  recentViewsTrend: { date: string; views: number }[];
  engagementActionsCount: number;
}

export interface NetworkingInsightsData {
  connectionsCount: number;
  pendingRequestsSentCount: number;
  pendingRequestsReceivedCount: number;
  opportunitiesInteractionsCount: number;
  collaborationsCount: number;
  growthRatePercentage: number;
}







// --- 30. BALAGA INTELLIGENCE TYPES (MILESTONE 1: FOUNDATION) ---

export interface AiConsentState {
  accountId: string;
  socialAiEnabled: boolean;
  foundersAiEnabled: boolean;
  allowSocialMemory: boolean;
  allowFoundersMemory: boolean;
  allowExperimentalModels: boolean;
  updatedAt: string;
}

export type AiTaskType =
  | "summary"
  | "matching"
  | "assistance"
  | "translation"
  | "review"
  | "discovery_explanation"
  | "community_pulse"
  | "action_proposal";

export interface ConsequentialActionProposal {
  id: string;
  actionType: "draft_message" | "create_announcement" | "organize_board" | "generate_tasklist";
  title: string;
  description: string;
  payload: Record<string, any>;
  status: "pending_approval" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string | null;
}

export interface AiRequestPayload {
  prompt: string;
  systemPrompt?: string;
  taskType: AiTaskType;
  contextData?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
}

export interface AiResponsePayload {
  content: string;
  structuredOutput?: Record<string, any> | null;
  explanation?: string;
  model: string;
  provider: string;
  tokensPrompt: number;
  tokensCompletion: number;
  costInr: number;
  latencyMs: number;
  requiresApproval?: boolean;
  proposedAction?: ConsequentialActionProposal | null;
}

export interface AiActivityLog {
  id: string;
  accountId: string;
  world: "socializing" | "founders";
  taskType: AiTaskType;
  modelUsed: string;
  provider: string;
  tokensPrompt: number;
  tokensCompletion: number;
  estimatedCostInr: number;
  durationMs: number;
  status: "success" | "error" | "refused_consent";
  summary: string;
  timestamp: string;
}

export interface AiMetricsSummary {
  totalRequests: number;
  totalTokens: number;
  totalCostInr: number;
  socialRequests: number;
  foundersRequests: number;
  zeroDataLeakageGuaranteed: boolean;
  activeProvider: string;
}
