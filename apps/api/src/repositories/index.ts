import { BasePersistentRepository } from "./base.repository.js";
import {
  accountsStore,
  socialProfilesStore,
  founderProfilesStore,
  startupsStore,
  startupUpdatesStore,
  startupInvitationsStore,
  founderPostsStore,
  founderConnectionsStore,
  founderReportsStore,
  opportunitiesStore,
  opportunityApplicationsStore,
  startupJobsStore,
  jobApplicationsStore,
  launchpadProductsStore,
  collaborationRequestsStore,
  partnershipSpacesStore,
  referralListingsStore,
  referralRequestsStore,
  mentorProfilesStore,
  investorProfilesStore,
  buildSpacesStore,
  foundersConversationsStore,
  foundersNotificationsStore,
  verificationApplicationsStore,
  accountSubscriptionsStore,
  socialPostsStore,
  socialCommentsStore,
  socialReactionsStore,
  socialConnectionsStore,
  socialStoriesStore,
  socialReelsStore,
  socialCommunitiesStore,
  socialEventsStore,
  socialConversationsStore,
  socialMessagesStore,
  socialNotificationsStore,
  socialReportsStore,
} from "../services/store.js";
import {
  Account,
  SocialProfile,
  FounderProfile,
  Startup,
  StartupUpdate,
  StartupInvitation,
  FounderPost,
  FounderConnection,
  FounderReport,
  Opportunity,
  OpportunityApplication,
  JobListing,
  JobApplication,
  Product,
  CollaborationRequest,
  PartnershipSpace,
  ReferralListing,
  ReferralRequest,
  MentorProfile,
  InvestorProfile,
  BuildSpace,
  FoundersConversation,
  FoundersNotification,
  VerificationApplication,
  SubscriptionDetails,
  SocialPost,
  SocialComment,
  SocialReaction,
  SocialConnection,
  SocialStory,
  SocialReel,
  SocialCommunity,
  SocialEvent,
  SocialConversation,
  SocialMessage,
  SocialNotification,
  SocialReport,
} from "@platform/shared-types";

// ============================================================================
// FOUNDERS REALM REPOSITORIES
// ============================================================================
export const accountsRepository = new BasePersistentRepository<Account>("accounts", accountsStore);
export const founderProfilesRepository = new BasePersistentRepository<FounderProfile>("founder_profiles", founderProfilesStore);
export const startupsRepository = new BasePersistentRepository<Startup>("startups", startupsStore);
export const startupUpdatesRepository = new BasePersistentRepository<StartupUpdate>("startup_updates", startupUpdatesStore);
export const startupInvitationsRepository = new BasePersistentRepository<StartupInvitation>("startup_invitations", startupInvitationsStore);
export const founderPostsRepository = new BasePersistentRepository<FounderPost>("founder_posts", founderPostsStore);
export const founderConnectionsRepository = new BasePersistentRepository<FounderConnection>("founder_connections", founderConnectionsStore);
export const founderReportsRepository = new BasePersistentRepository<FounderReport>("founder_reports", founderReportsStore);
export const opportunitiesRepository = new BasePersistentRepository<Opportunity>("opportunities", opportunitiesStore);
export const opportunityApplicationsRepository = new BasePersistentRepository<OpportunityApplication>("opportunity_applications", opportunityApplicationsStore);
export const jobsRepository = new BasePersistentRepository<JobListing>("startup_jobs", startupJobsStore);
export const jobApplicationsRepository = new BasePersistentRepository<JobApplication>("job_applications", jobApplicationsStore);
export const productsRepository = new BasePersistentRepository<Product>("products", launchpadProductsStore);
export const collaborationProposalsRepository = new BasePersistentRepository<CollaborationRequest>("collaboration_proposals", collaborationRequestsStore);
export const partnershipSpacesRepository = new BasePersistentRepository<PartnershipSpace>("partnership_spaces", partnershipSpacesStore);
export const referralListingsRepository = new BasePersistentRepository<ReferralListing>("referral_listings", referralListingsStore);
export const referralRequestsRepository = new BasePersistentRepository<ReferralRequest>("referral_requests", referralRequestsStore);
export const mentorsRepository = new BasePersistentRepository<MentorProfile>("mentor_profiles", mentorProfilesStore);
export const investorsRepository = new BasePersistentRepository<InvestorProfile>("investor_profiles", investorProfilesStore);
export const buildSpacesRepository = new BasePersistentRepository<BuildSpace>("build_spaces", buildSpacesStore);
export const conversationsRepository = new BasePersistentRepository<FoundersConversation>("founders_conversations", foundersConversationsStore);
export const foundersNotificationsRepository = new BasePersistentRepository<FoundersNotification>("founders_notifications", foundersNotificationsStore);
export const verificationRepository = new BasePersistentRepository<VerificationApplication>("verification_applications", verificationApplicationsStore);
export const subscriptionsRepository = new BasePersistentRepository<SubscriptionDetails>("account_subscriptions", accountSubscriptionsStore, "accountId");

// ============================================================================
// SOCIALIZING REALM REPOSITORIES
// ============================================================================
export const socialProfilesRepository = new BasePersistentRepository<SocialProfile>("social_profiles", socialProfilesStore);
export const socialPostsRepository = new BasePersistentRepository<SocialPost>("social_posts", socialPostsStore);
export const socialCommentsRepository = new BasePersistentRepository<SocialComment>("social_comments", socialCommentsStore);
export const socialReactionsRepository = new BasePersistentRepository<SocialReaction>("social_reactions", socialReactionsStore);
export const socialConnectionsRepository = new BasePersistentRepository<SocialConnection>("social_connections", socialConnectionsStore);
export const socialStoriesRepository = new BasePersistentRepository<SocialStory>("social_stories", socialStoriesStore);
export const socialReelsRepository = new BasePersistentRepository<SocialReel>("social_reels", socialReelsStore);
export const socialCommunitiesRepository = new BasePersistentRepository<SocialCommunity>("social_communities", socialCommunitiesStore);
export const socialEventsRepository = new BasePersistentRepository<SocialEvent>("social_events", socialEventsStore);
export const socialConversationsRepository = new BasePersistentRepository<SocialConversation>("social_conversations", socialConversationsStore);
export const socialMessagesRepository = new BasePersistentRepository<SocialMessage>("social_messages", socialMessagesStore);
export const socialNotificationsRepository = new BasePersistentRepository<SocialNotification>("social_notifications", socialNotificationsStore);
export const socialReportsRepository = new BasePersistentRepository<SocialReport>("social_reports", socialReportsStore);

// Master registry of all repositories across both realms
export const allRepositories: BasePersistentRepository<any>[] = [
  // Core & Founders
  accountsRepository,
  founderProfilesRepository,
  startupsRepository,
  startupUpdatesRepository,
  startupInvitationsRepository,
  founderPostsRepository,
  founderConnectionsRepository,
  founderReportsRepository,
  opportunitiesRepository,
  opportunityApplicationsRepository,
  jobsRepository,
  jobApplicationsRepository,
  productsRepository,
  collaborationProposalsRepository,
  partnershipSpacesRepository,
  referralListingsRepository,
  referralRequestsRepository,
  mentorsRepository,
  investorsRepository,
  buildSpacesRepository,
  conversationsRepository,
  foundersNotificationsRepository,
  verificationRepository,
  subscriptionsRepository,
  // Socializing
  socialProfilesRepository,
  socialPostsRepository,
  socialCommentsRepository,
  socialReactionsRepository,
  socialConnectionsRepository,
  socialStoriesRepository,
  socialReelsRepository,
  socialCommunitiesRepository,
  socialEventsRepository,
  socialConversationsRepository,
  socialMessagesRepository,
  socialNotificationsRepository,
  socialReportsRepository,
];

/**
 * Initialize all repositories and hydrate from remote PostgreSQL when credentials are configured.
 */
export async function initializeAllRepositories(): Promise<{
  totalRepositories: number;
  authoritative: boolean;
  hydratedTables: number;
  totalRecordsHydrated: number;
}> {
  const authoritative = accountsRepository.isRemoteAuthoritative();
  let hydratedTables = 0;
  let totalRecordsHydrated = 0;

  if (authoritative) {
    console.log(`[Repository Registry] Authoritative PostgreSQL mode active. Hydrating ${allRepositories.length} repositories...`);
    for (const repo of allRepositories) {
      try {
        const count = await repo.hydrateAllFromRemote();
        hydratedTables++;
        totalRecordsHydrated += count;
      } catch (err: any) {
        console.warn(`[Repository Registry] Failed to hydrate table ${repo.getTableName()}:`, err.message);
      }
    }
    console.log(`[Repository Registry] Hydration complete: ${hydratedTables}/${allRepositories.length} tables, ${totalRecordsHydrated} total records.`);
  } else {
    console.log(`[Repository Registry] Local development mode active. Fallback persistent storage enabled.`);
  }

  return {
    totalRepositories: allRepositories.length,
    authoritative,
    hydratedTables,
    totalRecordsHydrated,
  };
}

export * from "./base.repository.js";
