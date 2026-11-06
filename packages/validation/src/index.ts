import { z } from "zod";
import {
  COLLABORATION_TYPES,
  WORLDS,
  BUILD_SPACE_CATEGORIES,
  BUILD_SPACE_STAGES,
  BUILD_SPACE_VISIBILITY,
  BUILD_SPACE_STATUSES,
  BUILD_SPACE_ROLES,
  BUILD_SPACE_JOIN_REQUEST_STATUSES,
  BUILD_SPACE_INVITATION_STATUSES,
  BUILD_SPACE_TASK_STATUSES,
  BUILD_SPACE_TASK_PRIORITIES,
  BUILD_SPACE_MILESTONE_STATUSES,
  BUILD_SPACE_MEETING_STATUSES,
  FOUNDERS_INBOX_CATEGORIES,
  FOUNDERS_INBOX_VIEWS,
  FOUNDERS_MESSAGE_DELIVERY_STATES,
  FOUNDERS_MESSAGE_REQUEST_STATUSES,
  FOUNDERS_NOTIFICATION_CATEGORIES,
} from "@platform/config";

// 1. AUTHENTICATION & AGE ASSURANCE (18+)
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  is18Plus: z.literal(true, {
    errorMap: () => ({ message: "You must be at least 18 years old to join this platform" }),
  }),
  firstWorld: z.enum([WORLDS.SOCIALIZING, WORLDS.FOUNDERS]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// 2. SOCIALIZING PROFILE CREATION / UPDATE
export const socialProfileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  pronouns: z.string().max(30).optional(),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
  interests: z.array(z.string()).max(20, "Maximum 20 interests allowed").default([]),
  hobbies: z.array(z.string()).max(20, "Maximum 20 hobbies allowed").default([]),
  languages: z.array(z.string()).max(10, "Maximum 10 languages allowed").default([]),
  broadLocation: z.string().max(100, "Location cannot exceed 100 characters").optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(50).optional(),
  allowDmsFrom: z.enum(["everyone", "connections", "none"]).default("everyone"),
  showActivityStatus: z.boolean().default(true),
  isPrivate: z.boolean().default(false),
});

export const updateSocialProfileSchema = socialProfileSchema.partial();

// 3. FOUNDERS PROFILE CREATION / UPDATE
export const founderProfileSchema = z.object({
  displayName: z.string().min(2, "Professional name must be at least 2 characters").max(60),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  headline: z.string().max(120, "Headline cannot exceed 120 characters").optional(),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional(),
  skills: z.array(z.string()).min(1, "Provide at least one skill").max(30),
  interests: z.array(z.string()).max(20).default([]),
  experienceYears: z.number().min(0).max(60).optional(),
  roles: z.array(z.string()).min(1, "Select at least one professional role"),
  availability: z.enum(["full_time", "part_time", "weekends", "advisory", "not_available"]),
  workPreference: z.enum(["remote", "hybrid", "in_person"]),
  broadLocation: z.string().min(2, "Broad location is required").max(100),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// 4. SOCIAL POST CREATION, REACTIONS & COMMENTS
export const createSocialPostSchema = z.object({
  content: z.string().max(2000, "Content cannot exceed 2000 characters").default(""),
  postType: z.enum(["text", "image", "multi_image", "video", "poll"]).default("text"),
  mediaUrls: z.array(z.string().url()).max(10).default([]),
  pollOptions: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1).max(100),
        votes: z.number().default(0),
      })
    )
    .min(2)
    .max(5)
    .optional(),
});

export const reactSocialPostSchema = z.object({
  reactionType: z.enum(["like", "love", "celebrate", "support", "insightful"]).default("like"),
});

export const createSocialCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment cannot exceed 1000 characters"),
  parentCommentId: z.string().min(1).optional(),
});

// 4B. SOCIAL CONNECTIONS & FOLLOWS
export const sendConnectionRequestSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
});

export const respondConnectionRequestSchema = z.object({
  action: z.enum(["accept", "reject", "withdrawn"]),
});

export const discoverPeopleQuerySchema = z.object({
  interest: z.string().optional(),
  hobby: z.string().optional(),
  language: z.string().optional(),
  city: z.string().optional(),
  q: z.string().optional(),
});

// 5. STARTUP CREATION (FEATURE 6 WIZARD)
export const createStartupSchema = z.object({
  name: z.string().min(2, "Startup name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  coverUrl: z.string().url().optional().or(z.literal("")),
  oneLiner: z.string().min(10, "One-liner must be at least 10 characters").max(200),
  fullAbout: z.string().max(5000).optional(),
  problem: z.string().max(3000).optional(),
  solution: z.string().max(3000).optional(),
  industry: z.string().min(2, "Industry is required").max(80),
  additionalCategories: z.array(z.string()).default([]),
  stage: z.enum([
    "idea",
    "research",
    "validation",
    "mvp",
    "early_traction",
    "growth",
    "scaling",
    "profitable",
  ]),
  foundedDate: z.string().optional(),
  businessModel: z.string().max(200).optional(),
  technologies: z.array(z.string()).default([]),
  targetCustomers: z.string().max(200).optional(),
  broadLocation: z.string().min(2, "Location is required").max(100),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  socialLinks: z
    .object({
      twitter: z.string().url().optional().or(z.literal("")),
      linkedin: z.string().url().optional().or(z.literal("")),
      github: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

// 6. PRODUCT LAUNCHPAD SUBMISSION & MANAGEMENT (FEATURE 7)
export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters").max(80),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .optional(),
  tagline: z.string().min(5, "Tagline must be at least 5 characters").max(140),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  problem: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  features: z.array(z.string().max(200)).max(20).optional().default([]),
  logoUrl: z.string().min(1).optional().default("🚀"),
  coverUrl: z.string().optional().or(z.literal("")),
  mediaUrls: z.array(z.string()).max(10).default([]),
  screenshots: z.array(z.string()).max(10).optional().default([]),
  websiteUrl: z.string().min(1, "Website URL is required"),
  demoUrl: z.string().optional().or(z.literal("")),
  category: z.string().min(2, "Category is required"),
  status: z.enum(["idea", "in_development", "beta", "live", "discontinued"]).default("live"),
  pricingModel: z.enum(["free", "freemium", "paid", "subscription", "open_source", "other"]).default("free"),
  technologies: z.array(z.string()).max(20).optional().default([]),
  targetAudience: z.string().max(300).optional(),
  startupId: z.string().optional().nullable(),
  scheduledLaunchDate: z.string().optional().nullable(),
  isDraft: z.boolean().optional().default(false),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(["idea", "in_development", "beta", "live", "discontinued"]).optional(),
  isPublished: z.boolean().optional(),
});

export const productCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  parentId: z.string().optional().nullable(),
  isQuestion: z.boolean().optional().default(false),
});

export const productReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  content: z.string().min(5, "Review content must be at least 5 characters").max(2000),
});

export const productUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  content: z.string().min(10, "Update content must be at least 10 characters").max(5000),
  version: z.string().max(30).optional(),
  mediaUrls: z.array(z.string()).max(5).optional().default([]),
  broadcastToFeed: z.boolean().optional().default(true),
});

export const productCollectionSchema = z.object({
  name: z.string().min(2, "Collection name must be at least 2 characters").max(80),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  productIds: z.array(z.string()).optional().default([]),
});

export const productAppealSchema = z.object({
  appealReason: z.string().min(10, "Appeal reason must be at least 10 characters").max(2000),
  supportingInfo: z.string().max(2000).optional(),
});

export const moderateProductSchema = z.object({
  action: z.enum(["approve", "restrict", "remove", "restore"]),
  reason: z.string().min(5, "Moderation reason must be at least 5 characters").max(1000),
});


// 7. STARTUP COLLABORATION & PARTNERSHIPS (FEATURE 8)
export const updateCollaborationProfileSchema = z.object({
  whatWeDo: z.string().min(10, "Summary of what startup does must be at least 10 characters").max(2000),
  productsAndServices: z.array(z.string()).default([]),
  industriesServed: z.array(z.string()).default([]),
  targetCustomers: z.string().max(500).default(""),
  technologies: z.array(z.string()).default([]),
  whatWeOffer: z.string().min(10, "Detail what you offer partners").max(2000),
  whatWeNeed: z.string().min(10, "Detail what you need from partners").max(2000),
  preferredPartnershipTypes: z.array(z.string()).default([]),
  collaborationGoals: z.string().max(1000).default(""),
  broadOperatingRegions: z.array(z.string()).default([]),
  preferredContactMethod: z.enum(["platform_proposal", "scheduled_intro", "connection_first"]).default("platform_proposal"),
  isActivelySeeking: z.boolean().default(true),
});

export const createCollaborationSchema = z.object({
  initiatorStartupId: z.string().optional(),
  receiverStartupId: z.string().min(1, "Receiver startup ID is required"),
  format: z.enum(["intro", "detailed"]).default("detailed"),
  collabType: z.enum([
    COLLABORATION_TYPES.REFERRAL,
    COLLABORATION_TYPES.REV_SHARE,
    COLLABORATION_TYPES.INTEGRATION,
    COLLABORATION_TYPES.JOINT_MARKETING,
    COLLABORATION_TYPES.DISTRIBUTION,
    COLLABORATION_TYPES.RESELLER,
    COLLABORATION_TYPES.RESOURCE_SHARE,
    COLLABORATION_TYPES.BUSINESS_COLLAB,
    COLLABORATION_TYPES.TECH_COLLAB,
    COLLABORATION_TYPES.TECH_SHARE,
    COLLABORATION_TYPES.CUSTOM,
  ]),
  title: z.string().min(3, "Proposal title must be at least 3 characters").max(140),
  message: z.string().max(1000).optional(),
  compatibilityReason: z.string().max(1000).optional(),
  expectedBenefits: z.string().max(2000).optional(),
  whatWeOffer: z.string().min(5, "Detail what you offer partners (at least 5 characters)").max(2500),
  whatWeNeed: z.string().min(5, "Detail what you need from partners (at least 5 characters)").max(2500),
  commercialTerms: z.string().max(2000).optional(),
  responsibilities: z.array(z.string()).max(15).optional().default([]),
  proposedDuration: z.string().max(100).optional(),
  successCriteria: z.string().max(1000).optional(),
  expectedOutcomes: z.string().max(1000).optional(),
  supportingLinks: z.array(z.string()).max(5).optional().default([]),
  isDraft: z.boolean().optional().default(false),
});

export const respondProposalSchema = z.object({
  action: z.enum(["accept", "reject", "counter", "request_info", "request_meeting", "withdraw"]),
  reasonOrNotes: z.string().max(1000).optional(),
  counterTerms: z
    .object({
      commercialTerms: z.string().max(2000).optional(),
      whatWeOffer: z.string().max(2500).optional(),
      whatWeNeed: z.string().max(2500).optional(),
      responsibilities: z.array(z.string()).optional(),
      notes: z.string().min(2, "Notes describing changes are required").max(1000),
    })
    .optional(),
  moreInfoQuery: z.string().max(1000).optional(),
  moreInfoResponse: z.string().max(1000).optional(),
  meetingDetails: z
    .object({
      datetime: z.string().min(1, "Meeting datetime is required"),
      agenda: z.string().min(3, "Meeting agenda is required").max(1000),
      linkOrLocation: z.string().max(500).optional(),
    })
    .optional(),
});

export const partnershipTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters").max(150),
  description: z.string().max(2000).optional().default(""),
  assignedProfileId: z.string().optional().nullable(),
  assignedStartupId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["todo", "in_progress", "review", "completed"]).default("todo"),
  progress: z.number().min(0).max(100).default(0),
});

export const partnershipMilestoneSchema = z.object({
  title: z.string().min(2, "Milestone title must be at least 2 characters").max(150),
  description: z.string().max(2000).optional().default(""),
  targetDate: z.string().min(1, "Target completion date is required"),
  isCompleted: z.boolean().optional().default(false),
  completionNotes: z.string().max(1000).optional(),
});

export const partnershipMeetingSchema = z.object({
  title: z.string().min(2, "Meeting title must be at least 2 characters").max(150),
  dateTime: z.string().min(1, "Date and time required"),
  timezone: z.string().max(50).default("IST (UTC+05:30)"),
  agenda: z.string().min(5, "Meeting agenda must be at least 5 characters").max(2000),
  meetingUrlOrLocation: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  followUpActions: z.array(z.string()).max(10).optional().default([]),
});

export const partnershipReferralSchema = z.object({
  receivingStartupId: z.string().min(1, "Receiving startup ID is required"),
  customerReference: z.string().min(3, "Customer reference must be at least 3 characters").max(100),
  referralDate: z.string().optional(),
  status: z.enum(["submitted", "received", "contacted", "qualified", "converted", "rejected", "closed"]).default("submitted"),
  outcomeNotes: z.string().max(1000).optional(),
  commissionTerms: z.string().max(500).optional(),
  reportedRevenueValue: z.number().min(0).optional(),
});

export const partnershipCommissionSchema = z.object({
  referralId: z.string().optional().nullable(),
  commissionType: z.enum(["no_commission", "fixed", "percentage", "recurring"]),
  rateOrAmount: z.string().min(1, "Rate or amount is required").max(100),
  calculationBasis: z.string().max(500).optional(),
  paymentFrequency: z.string().max(100).optional(),
  reportedPaymentStatus: z.enum(["pending", "invoiced", "settled_externally", "cancelled"]).default("pending"),
});

export const partnershipReviewSchema = z.object({
  communication: z.number().int().min(1).max(5),
  professionalism: z.number().int().min(1).max(5),
  reliability: z.number().int().min(1).max(5),
  delivery: z.number().int().min(1).max(5),
  transparency: z.number().int().min(1).max(5),
  overallExperience: z.number().int().min(1).max(5),
  feedback: z.string().min(5, "Feedback must be at least 5 characters").max(3000),
});

export const partnershipDisputeSchema = z.object({
  category: z.enum(["commercial_terms", "non_delivery", "confidentiality", "communication_breakdown", "other"]),
  description: z.string().min(10, "Dispute description must be at least 10 characters").max(3000),
  supportingEvidence: z.array(z.string()).max(5).optional().default([]),
});


// 8. STORIES & REELS VALIDATION
export const createStorySchema = z.object({
  mediaUrl: z.string().url("Valid media URL is required"),
  mediaType: z.enum(["image", "video"]).default("image"),
  caption: z.string().max(200).optional(),
  audience: z.enum(["everyone", "connections"]).default("everyone"),
});

export const replyStorySchema = z.object({
  content: z.string().min(1, "Reply message cannot be empty").max(1000),
});

export const createReelSchema = z.object({
  videoUrl: z.string().url("Valid video URL is required"),
  thumbnailUrl: z.string().url().optional(),
  caption: z.string().max(1000).default(""),
  audioTrack: z.string().max(100).default("Original Audio"),
  hashtags: z.array(z.string()).max(15).default([]),
});

export const createReelCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500),
});

// 9. COMMUNITIES VALIDATION
export const createCommunitySchema = z.object({
  name: z.string().min(3, "Community name must be at least 3 characters").max(60),
  slug: z
    .string()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1500),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  coverUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().min(2).max(40).default("Interests"),
  isPrivate: z.boolean().default(false),
  rules: z.array(z.string().min(3).max(200)).max(10).default([]),
});

export const createCommunityPostSchema = z.object({
  content: z.string().min(2, "Post cannot be empty").max(3000),
  mediaUrls: z.array(z.string().url()).max(5).default([]),
});

// 10. EVENTS & MEETUPS VALIDATION
export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(3000),
  coverUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().min(2).max(50).default("Social Gathering"),
  venueName: z.string().min(3, "Venue name must be a public location").max(120),
  city: z.string().min(2, "City is required").max(60),
  isOnline: z.boolean().default(false),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  startTime: z.string().datetime("Must be a valid ISO datetime"),
  endTime: z.string().datetime().optional(),
  publicSafetyGuidance: z
    .string()
    .min(10, "Please provide public meeting and safety guidance for attendees")
    .max(1000),
  isAttendeeListVisible: z.boolean().default(true),
});

export const rsvpEventSchema = z.object({
  rsvpStatus: z.enum(["going", "interested", "not_going"]),
});

// 11. SOCIAL INBOX & MESSAGING VALIDATION
export const startConversationSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
  initialMessage: z.string().min(1, "Message content is required").max(2000),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(2000),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  attachments: z.any().optional(),
});

// 12. SAFETY, BLOCKING & REPORTING VALIDATION
export const blockUserSchema = z.object({
  targetProfileId: z.string().min(1, "Target profile ID is required"),
  reason: z.string().max(500).optional(),
});

export const muteUserSchema = z.object({
  targetProfileId: z.string().min(1, "Target profile ID is required"),
});

export const createReportSchema = z.object({
  targetType: z.enum(["profile", "post", "comment", "story", "reel", "community", "event", "message"]),
  targetId: z.string().min(1, "Target entity ID is required"),
  reason: z.string().min(3, "Report reason is required").max(100),
  details: z.string().max(1000).optional(),
});

// 13. UNIFIED SEARCH VALIDATION
export const unifiedSearchSchema = z.object({
  q: z.string().min(1, "Search term is required").max(100),
  type: z.enum(["all", "people", "posts", "communities", "events"]).default("all"),
  city: z.string().optional(),
});

// 14. FOUNDERS DASHBOARD VALIDATION
export const counterProposalSchema = z.object({
  commercialTerms: z.string().min(2, "Commercial terms required").max(500),
  revisedOffer: z.string().max(1000).optional(),
  revisedNeed: z.string().max(1000).optional(),
});

export const submitProductSchema = createProductSchema;


export const sendIntroRequestSchema = z.object({
  targetProfileId: z.string().min(1, "Target founder ID is required"),
  roleTitle: z.string().min(2, "Role or topic required").max(100),
  note: z.string().min(10, "Please provide an introduction note of at least 10 characters").max(1000),
  equityOrComp: z.string().max(200).optional(),
});

// 15. FEATURE 5: HIRING CENTRE VALIDATION
export const createJobSchema = z.object({
  startupId: z.string().min(1, "Startup association is required"),
  title: z.string().min(3, "Job title must be at least 3 characters").max(120),
  department: z.string().min(2, "Department is required").max(60),
  employmentType: z.enum(["full-time", "part-time", "contract", "freelance", "internship"]),
  jobSummary: z.string().min(10, "Job summary must be at least 10 characters").max(500),
  description: z.string().min(30, "Detailed description must be at least 30 characters").max(10000),
  responsibilities: z.array(z.string()).min(1, "List at least one responsibility"),
  requiredSkills: z.array(z.string()).min(1, "Specify at least one required skill"),
  preferredSkills: z.array(z.string()).default([]),
  experienceRequirements: z.string().min(2, "Experience requirement is required"),
  qualifications: z.string().max(500).optional(),
  workMode: z.enum(["remote", "hybrid", "on-site"]),
  broadLocation: z.string().min(2, "Broad location is required").max(100),
  compensationType: z.enum(["range", "fixed", "negotiable", "not_disclosed"]),
  compensationMin: z.number().min(0).optional(),
  compensationMax: z.number().min(0).optional(),
  currency: z.string().default("INR"),
  workingHours: z.string().max(100).optional(),
  openingsCount: z.number().int().min(1).default(1),
  applicationDeadline: z.string().min(5, "Application deadline is required"),
  screeningQuestions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string().min(3),
        required: z.boolean().default(false),
        type: z.enum(["text", "yes_no", "numeric"]).default("text"),
      })
    )
    .default([]),
  hiringContact: z
    .object({
      name: z.string(),
      title: z.string(),
      profileId: z.string().optional(),
      emailOrProfileUrl: z.string().optional(),
    })
    .optional(),
  recruitmentProcess: z.array(z.string()).default([]),
  status: z.enum(["draft", "open", "paused", "closed"]).default("open"),
});

export const updateJobSchema = createJobSchema.partial().omit({ startupId: true });

export const submitJobApplicationSchema = z.object({
  personalIntro: z.string().min(10, "Please provide an introduction of at least 10 characters").max(2000),
  resumeUrl: z.string().min(1, "Resume is required"),
  resumeFileName: z.string().optional(),
  resumeFileSize: z.number().optional(),
  relevantSkills: z.array(z.string()).default([]),
  experienceYears: z.number().min(0).optional(),
  currentRole: z.string().max(100).optional(),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  projectsSummary: z.string().max(3000).optional(),
  availability: z.string().min(2, "Availability is required"),
  joiningTimeline: z.string().min(2, "Joining timeline is required"),
  expectedCompensation: z.string().max(100).optional(),
  screeningAnswers: z.record(z.string()).default({}),
  supportingDocuments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        size: z.number().optional(),
      })
    )
    .default([]),
});

export const updateJobApplicationStatusSchema = z.object({
  status: z.enum([
    "applied",
    "viewed",
    "shortlisted",
    "screening",
    "interview",
    "offer",
    "hired",
    "rejected",
  ]),
  reasonOrNote: z.string().max(1000).optional(),
});

export const createJobInternalNoteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty").max(3000),
});

export const scheduleJobInterviewSchema = z.object({
  interviewDate: z.string().min(4, "Interview date is required"),
  interviewTime: z.string().min(2, "Interview time is required"),
  timezone: z.string().default("Asia/Kolkata"),
  interviewType: z.enum(["video", "phone", "in_person", "technical", "cultural_fit"]),
  meetingLocationOrLink: z.string().min(2, "Meeting location or link is required"),
  instructions: z.string().max(2000).optional(),
  candidateFacingNotes: z.string().max(2000).optional(),
  recruiterPrivateNotes: z.string().max(2000).optional(),
});

export const updateHiringPermissionSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  canManageHiring: z.boolean(),
});

export const reportJobSchema = z.object({
  reason: z.string().min(3, "Reason is required").max(100),
  details: z.string().max(2000).optional(),
});

// 16. FEATURE 6: STARTUP HUB VALIDATION
export const updateStartupSchema = createStartupSchema.partial().omit({ slug: true });

export const updateStartupSettingsSchema = z.object({
  isPublic: z.boolean().default(true),
  showTeam: z.boolean().default(true),
  showContact: z.boolean().default(true),
  allowCollabs: z.boolean().default(true),
  allowConnects: z.boolean().default(true),
});

export const inviteTeamMemberSchema = z.object({
  inviteeProfileId: z.string().min(1, "Invitee profile ID is required"),
  role: z.enum(["admin", "editor", "viewer", "hiring_manager"]),
  title: z.string().min(2, "Member title is required").max(100),
});

export const respondStartupInvitationSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const initiateOwnershipTransferSchema = z.object({
  targetOwnerProfileId: z.string().min(1, "Recipient profile ID is required"),
  previousOwnerResultingRole: z.enum(["admin", "editor", "viewer"]).default("admin"),
  note: z.string().max(500).optional(),
});

export const respondOwnershipTransferSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const createStartupUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  content: z.string().min(10, "Update content must be at least 10 characters").max(5000),
  updateType: z.enum([
    "announcement",
    "milestone",
    "product_update",
    "partnership",
    "hiring",
    "funding",
    "event",
    "achievement",
    "general",
  ]),
  mediaUrls: z.array(z.string().url()).default([]),
  associatedProductId: z.string().optional(),
  associatedJobId: z.string().optional(),
});

export const sendStartupConnectionSchema = z.object({
  note: z.string().max(500).optional(),
});

export const sendStartupInvestInquirySchema = z.object({
  inquiryType: z.enum(["syndicate", "angel", "institutional", "strategic", "info_request"]),
  ticketSizeRange: z.string().max(100).optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

// 17. FEATURE 9: REFERRAL EXCHANGE VALIDATION
export const createReferralListingSchema = z.object({
  publisherType: z.enum(["individual", "startup"]).default("individual"),
  startupId: z.string().optional().nullable(),
  listingType: z.enum(["offering", "requesting"]),
  title: z.string().min(3, "Title must be at least 3 characters").max(140),
  description: z.string().min(10, "Description must be at least 10 characters").max(4000),
  industry: z.string().min(2, "Industry is required").max(80),
  targetAudience: z.string().min(2, "Target audience is required").max(150),
  customerCategory: z.string().min(2, "Customer category is required").max(100),
  productOrService: z.string().min(2, "Product or service is required").max(150),
  idealReferralProfile: z.string().min(5, "Ideal referral profile is required").max(1500),
  requiredQualifications: z.string().max(1000).optional(),
  broadRegion: z.string().min(2, "Broad region is required").max(100),
  expectedOutcome: z.string().min(2, "Expected outcome is required").max(1000),
  referralArrangement: z.enum([
    "mutual_referral",
    "one_way",
    "commission_based",
    "non_commercial",
    "open_discussion",
  ]),
  commissionChoice: z.enum([
    "no_commission",
    "fixed",
    "percentage",
    "recurring",
    "negotiable",
    "open_to_discussion",
  ]),
  disclosedCommissionDetails: z.string().max(500).optional(),
  expiryDate: z.string().min(4, "Expiry date is required"),
  websiteUrl: z.string().url().optional().or(z.literal("")).nullable(),
  isDraft: z.boolean().optional().default(false),
});

export const updateReferralListingSchema = createReferralListingSchema.partial();

export const submitReferralRequestSchema = z.object({
  requesterType: z.enum(["individual", "startup"]).default("individual"),
  requesterStartupId: z.string().optional().nullable(),
  message: z.string().min(10, "Please provide a personalized message of at least 10 characters").max(3000),
  relevance: z.string().min(5, "Explain why this referral is relevant").max(2000),
  potentialOpportunity: z.string().min(5, "Describe the potential opportunity or intro").max(2000),
  relevantProductOrStartup: z.string().max(200).optional(),
  expectedOutcome: z.string().min(2, "Expected outcome is required").max(1000),
  supportingLinks: z.array(z.string().url()).max(5).optional().default([]),
  additionalContext: z.string().max(2000).optional(),
});

export const respondReferralRequestSchema = z.object({
  action: z.enum(["accept", "reject", "request_info", "withdraw"]),
  reasonOrNotes: z.string().max(1000).optional(),
  moreInfoQuery: z.string().max(1000).optional(),
  moreInfoResponse: z.string().max(1000).optional(),
});

export const proposeCommissionTermsSchema = z.object({
  commissionType: z.enum(["no_commission", "fixed", "percentage", "recurring", "custom"]),
  rateOrAmount: z.string().min(1, "Commission rate or amount is required").max(100),
  calculationBasis: z.string().min(2, "Calculation basis is required").max(500),
  paymentFrequency: z.string().min(2, "Payment frequency is required").max(200),
  responsibilities: z.string().min(5, "Parties responsibilities must be defined").max(2000),
  effectiveDate: z.string().min(4, "Effective date required"),
});

export const confirmCommissionTermsSchema = z.object({
  version: z.number().int().min(1),
  confirm: z.boolean(),
});

export const updatePipelineStageSchema = z.object({
  stage: z.enum(["accepted", "introduced", "contacted", "qualified", "converted", "closed"]),
  notes: z.string().max(1000).optional(),
  customerPrivateData: z
    .object({
      companyName: z.string().optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional().or(z.literal("")),
      contactPhone: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export const recordReferralOutcomeSchema = z.object({
  reportedRevenueValue: z.number().min(0).optional(),
  calculatedCommissionAmount: z.number().min(0).optional(),
  outcomeNotes: z.string().min(2, "Outcome notes required").max(2000),
});

export const recordReferralPaymentSchema = z.object({
  paymentStatus: z.enum(["pending", "reported_paid", "disputed", "cancelled"]),
  paymentNotes: z.string().max(1000).optional(),
});

export const reportReferralListingSchema = z.object({
  reason: z.string().min(3, "Reason is required").max(100),
  details: z.string().max(1500).optional(),
});

// ===========================================================================
// FEATURE 10: MENTOR NETWORK VALIDATION SCHEMAS
// ===========================================================================

export const mentorPricingConfigSchema = z.object({
  pricingOption: z.enum(["free", "paid", "first_session_free", "custom", "discussion"]),
  price: z.number().min(0).optional().nullable(),
  currency: z.string().default("INR"),
  sessionDurationMinutes: z.number().min(15).max(240).default(45),
  pricingBasis: z.enum(["per_session", "monthly", "total_package", "custom"]).default("per_session"),
  isRecurring: z.boolean().default(false),
  includedServices: z.array(z.string()).default([]),
  cancellationTerms: z.string().max(1000).optional(),
  additionalConditions: z.string().max(1000).optional(),
  subsequentSessionPrice: z.number().min(0).optional().nullable(),
  subsequentSessionCurrency: z.string().optional(),
});

export const createMentorProfileSchema = z.object({
  headline: z.string().min(3, "Professional headline is required").max(150),
  introduction: z.string().min(10, "Introduction must be at least 10 characters").max(2000),
  professionalExperience: z.string().min(10, "Professional experience is required").max(3000),
  expertise: z.array(z.string()).min(1, "Select at least one expertise category"),
  industries: z.array(z.string()).min(1, "Select at least one industry"),
  skills: z.array(z.string()).min(1, "List at least one core skill"),
  companyExperience: z.string().min(2, "Company experience is required").max(2000),
  previousMentoringExperience: z.string().max(2000).optional().default(""),
  achievements: z.string().max(2000).optional(),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  broadLocation: z.string().min(2, "Broad location is required").max(100),
  preferredMenteeCategories: z.array(z.string()).min(1, "Select at least one mentee category"),
  availabilityDescription: z.string().min(2, "Availability description is required").max(500),
  preferredMeetingFormat: z.enum(["online", "in_person", "hybrid"]).default("online"),
  pricing: mentorPricingConfigSchema,
  websiteUrl: z.string().url("Must be valid URL").optional().or(z.literal("")).nullable(),
  portfolioUrl: z.string().url("Must be valid URL").optional().or(z.literal("")).nullable(),
  isDraft: z.boolean().default(false),
});

export const updateMentorProfileSchema = createMentorProfileSchema.partial();

export const submitMentorshipRequestSchema = z.object({
  projectOrStartupName: z.string().min(2, "Project or startup name is required").max(150),
  helpNeeded: z.string().min(10, "Describe what help you need (min 10 characters)").max(2000),
  specificChallenge: z.string().min(10, "Describe your specific challenge").max(2000),
  goals: z.string().min(10, "Describe your goals").max(2000),
  reasonForSelection: z.string().min(5, "Explain why you chose this mentor").max(2000),
  preferredFormat: z.enum(["one_time", "ongoing", "project", "startup", "career", "group"]),
  preferredAvailability: z.string().min(2, "Preferred availability is required").max(500),
  budget: z.string().max(100).optional().nullable(),
  expectedDuration: z.string().min(2, "Expected duration is required").max(100),
  additionalContext: z.string().max(2000).optional().nullable(),
});

export const respondMentorshipRequestSchema = z.object({
  action: z.enum(["accept", "reject", "request_more_info", "withdraw", "cancel"]),
  reasonOrNotes: z.string().max(1000).optional(),
  moreInfoQuery: z.string().max(1000).optional(),
  moreInfoResponse: z.string().max(1000).optional(),
});

export const proposeMentorshipAgreementSchema = z.object({
  pricingOption: z.enum(["free", "paid", "first_session_free", "custom", "discussion"]),
  price: z.number().min(0).optional().nullable(),
  currency: z.string().default("INR"),
  sessionDurationMinutes: z.number().min(15).max(240).default(45),
  pricingBasis: z.string().default("per_session"),
  frequency: z.string().max(100).optional(),
  cancellationTerms: z.string().min(2, "Cancellation terms are required").max(1000),
  includedServices: z.array(z.string()).default([]),
  conditions: z.string().max(1000).optional(),
  effectiveDate: z.string().min(4, "Effective date is required"),
});

export const confirmMentorshipAgreementSchema = z.object({
  version: z.number().int().min(1),
  confirm: z.boolean(),
});

export const scheduleMentorshipSessionSchema = z.object({
  title: z.string().min(3, "Session title is required").max(150),
  description: z.string().max(1000).optional(),
  sessionDate: z.string().min(4, "Session date is required"),
  startTime: z.string().min(2, "Start time is required"),
  timezone: z.string().default("Asia/Kolkata"),
  durationMinutes: z.number().min(15).max(240).default(45),
  format: z.enum(["online", "in_person", "hybrid"]).default("online"),
  meetingLinkOrLocation: z.string().min(2, "Meeting link or public location is required").max(500),
  agenda: z.string().max(2000).optional(),
  preparationNotes: z.string().max(2000).optional(),
});

export const updateMentorshipSessionStatusSchema = z.object({
  status: z.enum(["confirmed", "rescheduled", "completed", "cancelled", "no_show"]),
  notes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(1000).optional(),
  newSessionDate: z.string().optional(),
  newStartTime: z.string().optional(),
});

export const createMentorshipGoalSchema = z.object({
  title: z.string().min(3, "Goal title is required").max(150),
  description: z.string().min(5, "Description is required").max(1500),
  targetDate: z.string().min(4, "Target date is required"),
});

export const updateMentorshipGoalSchema = z.object({
  progressPercentage: z.number().min(0).max(100).optional(),
  status: z.enum(["not_started", "in_progress", "completed", "abandoned"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const createMentorshipActionItemSchema = z.object({
  task: z.string().min(3, "Action item task is required").max(300),
  assignedProfileId: z.string().min(1, "Assigned user is required"),
  dueDate: z.string().min(4, "Due date is required"),
  notes: z.string().max(1000).optional(),
});

export const updateMentorshipActionItemSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  notes: z.string().max(1000).optional(),
});

export const createMentorshipResourceSchema = z.object({
  title: z.string().min(2, "Title is required").max(150),
  resourceType: z.enum(["document", "link", "template", "guide"]).default("link"),
  urlOrPath: z.string().min(2, "URL or path is required").max(1000),
  description: z.string().max(1000).optional(),
});

export const updateMentorshipWorkspaceNotesSchema = z.object({
  sharedNotes: z.string().max(10000).optional(),
  privateNotes: z.string().max(10000).optional(),
});

export const recordMentorshipPaymentSchema = z.object({
  paymentStatus: z.enum(["not_due", "pending", "reported_paid", "disputed", "cancelled"]),
  paymentNotes: z.string().max(1000).optional(),
});

export const submitMentorshipReviewSchema = z.object({
  knowledgeRating: z.number().min(1).max(5),
  communicationRating: z.number().min(1).max(5),
  helpfulnessRating: z.number().min(1).max(5),
  professionalismRating: z.number().min(1).max(5),
  reliabilityRating: z.number().min(1).max(5),
  overallRating: z.number().min(1).max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

export const replyMentorshipReviewSchema = z.object({
  reply: z.string().min(2, "Reply is required").max(1000),
});

export const reportMentorSchema = z.object({
  reason: z.string().min(3, "Reason is required").max(100),
  details: z.string().max(1500).optional(),
});

// ============================================================================
// FEATURE 11: INVESTOR NETWORK SCHEMAS
// ============================================================================

export const investmentThesisSchema = z.object({
  industries: z.array(z.string()).min(1, "Select at least one industry of interest"),
  stages: z.array(z.string()).min(1, "Select at least one preferred startup stage"),
  geographies: z.array(z.string()).min(1, "Select at least one geographic preference"),
  businessModels: z.array(z.string()).min(1, "Select at least one preferred business model"),
  technologies: z.array(z.string()).optional(),
  targetMarkets: z.array(z.string()).optional(),
  customerCategories: z.array(z.string()).optional(),
  revenueStages: z.array(z.string()).optional(),
  founderExperiencePreferences: z.array(z.string()).optional(),
  minCheckSize: z.number().min(0).optional().nullable(),
  maxCheckSize: z.number().min(0).optional().nullable(),
  currency: z.string().default("INR"),
  thesisSummary: z.string().min(10, "Investment thesis summary must be at least 10 characters").max(3000),
});

export const createInvestorProfileSchema = z.object({
  investorType: z.enum([
    "angel_investor",
    "vc_firm",
    "corporate_investor",
    "family_office",
    "startup_investment_network",
    "strategic_investor",
    "syndicate",
    "other",
  ]),
  isOrganization: z.boolean().default(false),
  organizationName: z.string().max(200).optional().nullable(),
  organizationLogoUrl: z.string().max(1000).optional().nullable(),
  headline: z.string().min(3, "Professional headline is required").max(200),
  biography: z.string().min(10, "Biography must be at least 10 characters").max(3000),
  investmentExperience: z.string().min(5, "Investment experience is required").max(3000),
  thesis: investmentThesisSchema,
  portfolioCompanies: z
    .array(
      z.object({
        name: z.string().min(1),
        websiteUrl: z.string().optional().nullable(),
        logoUrl: z.string().optional().nullable(),
        investmentYear: z.number().int().optional().nullable(),
        stage: z.string().optional().nullable(),
      })
    )
    .default([]),
  websiteUrl: z.string().max(500).optional().nullable(),
  professionalLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().min(1),
      })
    )
    .default([]),
  preferredContactMethod: z.enum(["balaga_message", "email", "introduction_only"]).default("balaga_message"),
  isAvailableForIntros: z.boolean().default(true),
});

export const updateInvestorProfileSchema = createInvestorProfileSchema.partial().extend({
  status: z.enum(["active", "paused", "closed"]).optional(),
});

export const submitInvestorVerificationSchema = z.object({
  evidenceType: z.enum([
    "identity_proof",
    "organization_incorporation",
    "fund_registration",
    "portfolio_audit",
    "other",
  ]),
  documentUrls: z.array(z.string().min(1)).min(1, "At least one verification document is required"),
  officialEntityName: z.string().max(250).optional(),
  registrationNumber: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const reviewInvestorVerificationSchema = z.object({
  decision: z.enum(["approve", "reject", "inconclusive", "suspend"]),
  decisionNotes: z.string().max(2000).optional(),
  badgeTitle: z.string().max(100).optional(),
});

export const updateStartupFundraisingProfileSchema = z.object({
  fundraisingStatus: z.enum([
    "not_fundraising",
    "exploring",
    "preparing",
    "actively_fundraising",
    "paused",
  ]),
  privacyLevel: z.enum(["private", "connections_only", "investors_only", "public"]),
  fundingStage: z.string().min(2, "Funding stage is required").max(100),
  amountSought: z.number().min(0).optional().nullable(),
  currency: z.string().default("INR"),
  useOfFunds: z.string().max(2000).optional().nullable(),
  businessTraction: z.string().max(3000).optional().nullable(),
  revenueRange: z.string().max(100).optional().nullable(),
  customerGrowth: z.string().max(500).optional().nullable(),
  productMaturity: z.string().max(500).optional().nullable(),
  pitchDeckUrl: z.string().max(1000).optional().nullable(),
  pitchDeckFilename: z.string().max(200).optional().nullable(),
  demoUrl: z.string().max(1000).optional().nullable(),
  contactPreferences: z.string().max(500).optional().nullable(),
});

export const submitInvestorIntroRequestSchema = z.object({
  startupId: z.string().min(1, "Startup ID is required"),
  investorProfileId: z.string().min(1, "Investor profile ID is required"),
  whyRelevant: z.string().min(10, "Explain why this investor is relevant (min 10 chars)").max(2000),
  businessOverview: z.string().min(10, "Provide a business overview (min 10 chars)").max(2000),
  fundraisingStage: z.string().min(2, "Fundraising stage is required").max(100),
  amountSought: z.number().min(0).optional().nullable(),
  currency: z.string().default("INR"),
  pitchDeckUrl: z.string().max(1000).optional().nullable(),
  specificRequest: z.string().min(5, "State your specific introduction request").max(1000),
  additionalMessage: z.string().max(2000).optional().nullable(),
});

export const respondInvestorIntroRequestSchema = z.object({
  action: z.enum([
    "accept",
    "reject",
    "request_more_info",
    "express_interest",
    "request_meeting",
    "withdraw",
    "close",
  ]),
  reasonOrNotes: z.string().max(1000).optional(),
  moreInfoQuery: z.string().max(1000).optional(),
  moreInfoResponse: z.string().max(1000).optional(),
});

export const submitInvestorInterestSchema = z.object({
  startupId: z.string().min(1, "Startup ID is required"),
  personalizedNote: z.string().min(10, "Personalized intro note must be at least 10 chars").max(2000),
});

export const respondInvestorInterestSchema = z.object({
  action: z.enum(["accept", "decline", "request_more_info", "withdraw"]),
  reasonOrNotes: z.string().max(1000).optional(),
});

export const scheduleInvestorMeetingSchema = z.object({
  title: z.string().min(3, "Meeting title is required").max(200),
  sessionDate: z.string().min(4, "Meeting date is required"),
  startTime: z.string().min(2, "Start time is required"),
  durationMinutes: z.number().min(15).max(240).default(30),
  timezone: z.string().default("Asia/Kolkata"),
  format: z.enum(["online", "in_person", "hybrid"]).default("online"),
  meetingLinkOrLocation: z.string().min(2, "Meeting link or public location is required").max(500),
  agenda: z.string().max(2000).optional(),
  preparationNotes: z.string().max(2000).optional(),
});

export const updateInvestorMeetingStatusSchema = z.object({
  status: z.enum(["confirmed", "rescheduled", "cancelled", "completed"]),
  notes: z.string().max(1000).optional(),
  newSessionDate: z.string().optional(),
  newStartTime: z.string().optional(),
});

export const sharePitchMaterialSchema = z.object({
  title: z.string().min(2, "Document title is required").max(200),
  fileUrl: z.string().min(2, "File URL is required").max(1000),
  filename: z.string().min(2, "Filename is required").max(200),
});

export const reportInvestorSchema = z.object({
  reason: z.enum(["impersonation", "fraudulent_claims", "misleading_terms", "spam", "other"]),
  details: z.string().max(2000).optional(),
});

// ============================================================================
// FEATURE 12: BALAGA BUILD SPACES VALIDATION SCHEMAS
// ============================================================================

export const createProjectBuildSpaceSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(100),
  logoUrl: z.string().max(1000).optional().nullable(),
  coverUrl: z.string().max(1000).optional().nullable(),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(300),
  detailedOverview: z.string().min(20, "Detailed overview must be at least 20 characters").max(5000),
  category: z.enum(BUILD_SPACE_CATEGORIES),
  developmentStage: z.enum(BUILD_SPACE_STAGES).default("idea"),
  mainGoals: z.array(z.string().min(2)).min(1, "At least one main goal is required"),
  expectedOutcomes: z.array(z.string().min(2)).optional().default([]),
  skillsRequired: z.array(z.string().min(1)).optional().default([]),
  technologiesUsed: z.array(z.string().min(1)).optional().default([]),
  targetCompletionDate: z.string().optional().nullable(),
  associatedStartupId: z.string().optional().nullable(),
  visibility: z.enum(BUILD_SPACE_VISIBILITY).default("private"),
});

export const updateProjectBuildSpaceSchema = createProjectBuildSpaceSchema.partial();

export const changeBuildSpaceVisibilitySchema = z.object({
  visibility: z.enum(BUILD_SPACE_VISIBILITY),
});

export const updateBuildSpaceStatusSchema = z.object({
  status: z.enum(BUILD_SPACE_STATUSES),
});

export const submitBuildSpaceJoinRequestSchema = z.object({
  introduction: z.string().min(10, "Introduction must be at least 10 characters").max(1000),
  relevantSkills: z.array(z.string().min(1)).min(1, "Specify at least one relevant skill"),
  portfolioLinks: z.array(z.string().max(500)).optional(),
});

export const reviewBuildSpaceJoinRequestSchema = z.object({
  action: z.enum(["accept", "reject", "request_more_info"]),
  assignedRole: z.enum(["admin", "editor", "member", "viewer"]).default("member"),
  moreInfoQuery: z.string().max(1000).optional(),
  responseNotes: z.string().max(1000).optional(),
  reviewerNotes: z.string().max(1000).optional(),
});

export const respondBuildSpaceMoreInfoSchema = z.object({
  moreInfoResponse: z.string().min(5, "Response must be at least 5 characters").max(2000).optional(),
  additionalInfo: z.string().min(5, "Response must be at least 5 characters").max(2000).optional(),
}).refine((data) => Boolean(data.moreInfoResponse || data.additionalInfo), {
  message: "Either moreInfoResponse or additionalInfo must be provided",
});

export const inviteBuildSpaceMemberSchema = z.object({
  inviteeProfileId: z.string().min(1, "Invitee profile ID is required"),
  role: z.enum(["admin", "editor", "member", "viewer"]).default("member"),
  message: z.string().max(500).optional(),
});

export const respondBuildSpaceInvitationSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export const updateBuildSpaceMemberRoleSchema = z.object({
  role: z.enum(["admin", "editor", "member", "viewer"]),
});

export const transferBuildSpaceOwnershipSchema = z.object({
  newOwnerProfileId: z.string().min(1, "New owner profile ID is required"),
  previousOwnerRole: z.enum(["admin", "member"]).default("admin"),
});

export const respondBuildSpaceOwnershipTransferSchema = z.object({
  action: z.enum(["accept", "decline"]),
});

export const createBuildSpaceTaskSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters").max(200),
  description: z.string().max(2000).optional().default(""),
  assignedProfileId: z.string().optional().nullable(),
  priority: z.enum(BUILD_SPACE_TASK_PRIORITIES).default("normal"),
  status: z.enum(BUILD_SPACE_TASK_STATUSES).default("todo"),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  milestoneId: z.string().optional().nullable(),
  checklists: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().min(1),
        completed: z.boolean().default(false),
      })
    )
    .optional()
    .default([]),
});

export const updateBuildSpaceTaskSchema = createBuildSpaceTaskSchema.partial();

export const addBuildSpaceTaskCommentSchema = z
  .object({
    content: z.string().min(1, "Comment content cannot be empty").max(1000).optional(),
    text: z.string().min(1, "Comment text cannot be empty").max(1000).optional(),
  })
  .refine((d) => Boolean(d.content || d.text), {
    message: "Comment content or text is required",
  });

export const createBuildSpaceMilestoneSchema = z.object({
  title: z.string().min(2, "Milestone title must be at least 2 characters").max(200),
  description: z.string().max(2000).optional().default(""),
  targetDate: z.string().min(4, "Target date is required"),
  responsibleProfileId: z.string().optional().nullable(),
  linkedTaskIds: z.array(z.string()).optional().default([]),
  completionCriteria: z.string().max(1000).optional(),
  status: z.enum(BUILD_SPACE_MILESTONE_STATUSES).default("planned"),
});

export const updateBuildSpaceMilestoneSchema = createBuildSpaceMilestoneSchema.partial().extend({
  completionNotes: z.string().max(1000).optional(),
});

export const sendBuildSpaceMessageSchema = z.object({
  channel: z.enum(["general", "announcements", "tasks", "milestones", "meetings"]).default("general"),
  text: z.string().min(1, "Message text cannot be empty").max(2000),
  attachments: z.array(z.string()).optional(),
});

export const uploadBuildSpaceDocumentSchema = z.object({
  name: z.string().min(2, "Document name is required").max(200),
  folder: z
    .enum([
      "specifications",
      "designs",
      "presentations",
      "agreements",
      "tech_docs",
      "reports",
      "notes",
      "other",
    ])
    .default("other"),
  fileUrl: z.string().min(2, "File URL is required").max(1000),
  description: z.string().max(500).optional(),
  fileSize: z.string().optional(),
  fileType: z.string().optional(),
  version: z.string().optional(),
});

export const scheduleBuildSpaceMeetingSchema = z.object({
  title: z.string().min(2, "Meeting title is required").max(200),
  description: z.string().max(1000).optional(),
  date: z.string().min(4, "Meeting date is required"),
  time: z.string().min(2, "Meeting time is required"),
  timezone: z.string().default("Asia/Kolkata"),
  participantProfileIds: z.array(z.string()).optional().default([]),
  agenda: z.string().max(2000).optional(),
  onlineMeetingLink: z.string().max(500).optional(),
  publicLocation: z.string().max(300).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateBuildSpaceMeetingStatusSchema = z.object({
  status: z.enum(BUILD_SPACE_MEETING_STATUSES),
  notes: z.string().max(1000).optional(),
  newDate: z.string().optional(),
  newTime: z.string().optional(),
});

// ============================================================================
// FEATURE 13: FOUNDERS INBOX & NOTIFICATIONS SCHEMAS
// ============================================================================

export const createFoundersConversationSchema = z
  .object({
    type: z.enum(["direct", "group", "workspace"]).default("direct"),
    recipientProfileId: z.string().optional(),
    participantProfileIds: z.array(z.string()).optional(),
    title: z.string().max(200).optional(),
    category: z.enum(FOUNDERS_INBOX_CATEGORIES).default("professional"),
    initialMessage: z.string().max(5000).optional(),
    relatedEntityType: z
      .enum([
        "connection",
        "cofounder",
        "opportunity",
        "job_application",
        "startup",
        "product",
        "partnership",
        "referral",
        "mentorship",
        "investor_intro",
        "build_space",
      ])
      .optional()
      .nullable(),
    relatedEntityId: z.string().optional().nullable(),
    startupId: z.string().optional().nullable(),
    spaceId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "direct") return Boolean(data.recipientProfileId);
      if (data.type === "group") return Boolean(data.participantProfileIds && data.participantProfileIds.length > 0);
      return true;
    },
    { message: "Recipient or participants required based on conversation type" }
  );

export const sendFoundersMessageSchema = z
  .object({
    content: z.string().min(1, "Message content cannot be empty").max(5000).optional(),
    text: z.string().min(1, "Message text cannot be empty").max(5000).optional(),
    replyToMessageId: z.string().optional().nullable(),
    replyToId: z.string().optional().nullable(),
    attachments: z
      .array(
        z.object({
          id: z.string().optional(),
          name: z.string(),
          url: z.string(),
          fileType: z.enum(["image", "document", "pdf", "other"]).default("other"),
          sizeBytes: z.number().default(0),
        })
      )
      .optional()
      .default([]),
  })
  .refine((d) => Boolean(d.content || d.text), {
    message: "Message content or text is required",
  });

export const editFoundersMessageSchema = z
  .object({
    content: z.string().min(1, "Updated message content cannot be empty").max(5000).optional(),
    text: z.string().min(1, "Updated message text cannot be empty").max(5000).optional(),
  })
  .refine((d) => Boolean(d.content || d.text), {
    message: "Message content or text is required",
  });

export const messageReactionSchema = z.object({
  emoji: z.string().min(1, "Reaction emoji required").max(10),
});

export const updateConversationStateSchema = z.object({
  isPinned: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isMuted: z.boolean().optional(),
  customUnread: z.boolean().optional(),
});

export const createFoundersGroupSchema = z.object({
  title: z.string().min(2, "Group name must be at least 2 characters").max(200),
  description: z.string().max(1000).optional().default(""),
  category: z.enum(FOUNDERS_INBOX_CATEGORIES).default("professional"),
  participantProfileIds: z.array(z.string()).min(1, "At least one participant required"),
  avatarUrl: z.string().optional().nullable(),
});

export const addFoundersGroupMemberSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  role: z.enum(["admin", "member"]).default("member"),
});

export const createFoundersMessageRequestSchema = z
  .object({
    recipientProfileId: z.string().min(1, "Recipient profile ID is required"),
    category: z.enum(FOUNDERS_INBOX_CATEGORIES).default("professional"),
    message: z.string().min(1, "Initial message cannot be empty").max(2000).optional(),
    initialMessage: z.string().min(1, "Initial message cannot be empty").max(2000).optional(),
  })
  .refine((d) => Boolean(d.message || d.initialMessage), {
    message: "Initial message is required",
  });

export const respondFoundersMessageRequestSchema = z.object({
  action: z.enum(["accept", "decline", "block", "report"]),
  reason: z.string().max(500).optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  inAppAlerts: z.boolean().optional(),
  emailAlerts: z.boolean().optional(),
  messageAlerts: z.boolean().optional(),
  connectionAlerts: z.boolean().optional(),
  opportunityAlerts: z.boolean().optional(),
  hiringAlerts: z.boolean().optional(),
  startupAlerts: z.boolean().optional(),
  collaborationAlerts: z.boolean().optional(),
  referralAlerts: z.boolean().optional(),
  mentorshipAlerts: z.boolean().optional(),
  investorAlerts: z.boolean().optional(),
  workspaceAlerts: z.boolean().optional(),
  mutedConversationIds: z.array(z.string()).optional(),
});

export const reportMessageSchema = z.object({
  messageId: z.string().optional(),
  conversationId: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  reportedProfileId: z.string().optional(),
  reason: z.string().min(1).default("spam"),
  category: z.string().optional(),
  details: z.string().max(1000).optional(),
});

// Feature 14: Verification & Premium System
export const verificationDocumentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Document name is required"),
  url: z.string().min(1, "Document URL is required"),
  sizeBytes: z.number().optional(),
  mimeType: z.string().optional(),
});

export const submitBlueVerificationSchema = z.object({
  startupName: z.string().min(2, "Startup/project name must be at least 2 characters").max(100),
  startupId: z.string().optional().nullable(),
  operatingStage: z.string().min(2, "Operating stage is required").max(50),
  website: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  supportingDocuments: z.array(verificationDocumentSchema).default([]),
});

export const submitTealVerificationSchema = z.object({
  legalBusinessName: z.string().min(2, "Legal business name is required").max(150),
  registrationType: z.string().min(2, "Registration type is required").max(50),
  registrationNumber: z.string().min(3, "Registration identifier (CIN/LLPIN/GSTIN) is required").max(50),
  jurisdiction: z.string().min(2, "Jurisdiction is required").max(100),
  website: z.string().max(200).optional().nullable(),
  startupId: z.string().optional().nullable(),
  supportingDocuments: z.array(verificationDocumentSchema).min(1, "At least one statutory registration document is required"),
});

export const reviewVerificationSchema = z.object({
  action: z.enum(["approve", "reject", "request_info", "suspend"]),
  notes: z.string().max(1000).optional(),
  rejectionReason: z.string().max(1000).optional(),
});

export const appealVerificationSchema = z.object({
  appealNotes: z.string().min(10, "Appeal description must be at least 10 characters").max(2000),
});

export const resubmitVerificationSchema = z.object({
  startupName: z.string().max(100).optional(),
  legalBusinessName: z.string().max(150).optional(),
  registrationType: z.string().max(50).optional(),
  registrationNumber: z.string().max(50).optional(),
  jurisdiction: z.string().max(100).optional(),
  operatingStage: z.string().max(50).optional(),
  website: z.string().max(200).optional().nullable(),
  supportingDocuments: z.array(verificationDocumentSchema).optional(),
});

export const sendConnectionWithNoteSchema = z.object({
  recipientProfileId: z.string().optional(),
  note: z.string().max(300, "Connection note cannot exceed 300 characters").optional(),
});

export const upgradeSubscriptionSchema = z.object({
  tier: z.enum(["free", "premium"]),
  durationMonths: z.number().int().min(1).max(36).default(12),
});





