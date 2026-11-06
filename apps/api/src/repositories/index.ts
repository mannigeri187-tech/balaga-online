import { BasePersistentRepository } from "./base.repository.js";
import {
  accountsStore,
  socialProfilesStore,
  founderProfilesStore,
  startupsStore,
  founderPostsStore,
  opportunitiesStore,
  opportunityApplicationsStore,
  startupJobsStore,
  jobApplicationsStore,
  launchpadProductsStore,
  referralListingsStore,
  referralRequestsStore,
  mentorProfilesStore,
  investorProfilesStore,
  buildSpacesStore,
  foundersConversationsStore,
  verificationApplicationsStore,
  accountSubscriptionsStore,
} from "../services/store.js";
import {
  Account,
  SocialProfile,
  FounderProfile,
  Startup,
  FounderPost,
  Opportunity,
  OpportunityApplication,
  JobListing,
  JobApplication,
  Product,
  ReferralListing,
  ReferralRequest,
  MentorProfile,
  InvestorProfile,
  BuildSpace,
  FoundersConversation,
  VerificationApplication,
  SubscriptionDetails,
} from "@platform/shared-types";

// Repositories bound to persistent stores
export const accountsRepository = new BasePersistentRepository<Account>("accounts", accountsStore);
export const socialProfilesRepository = new BasePersistentRepository<SocialProfile>("social_profiles", socialProfilesStore);
export const founderProfilesRepository = new BasePersistentRepository<FounderProfile>("founder_profiles", founderProfilesStore);
export const startupsRepository = new BasePersistentRepository<Startup>("startups", startupsStore);
export const founderPostsRepository = new BasePersistentRepository<FounderPost>("founder_posts", founderPostsStore);
export const opportunitiesRepository = new BasePersistentRepository<Opportunity>("opportunities", opportunitiesStore);
export const opportunityApplicationsRepository = new BasePersistentRepository<OpportunityApplication>("opportunity_applications", opportunityApplicationsStore);
export const jobsRepository = new BasePersistentRepository<JobListing>("startup_jobs", startupJobsStore);
export const jobApplicationsRepository = new BasePersistentRepository<JobApplication>("job_applications", jobApplicationsStore);
export const productsRepository = new BasePersistentRepository<Product>("products", launchpadProductsStore);
export const referralListingsRepository = new BasePersistentRepository<ReferralListing>("referral_listings", referralListingsStore);
export const referralRequestsRepository = new BasePersistentRepository<ReferralRequest>("referral_requests", referralRequestsStore);
export const mentorsRepository = new BasePersistentRepository<MentorProfile>("mentor_profiles", mentorProfilesStore);
export const investorsRepository = new BasePersistentRepository<InvestorProfile>("investor_profiles", investorProfilesStore);
export const buildSpacesRepository = new BasePersistentRepository<BuildSpace>("build_spaces", buildSpacesStore);
export const conversationsRepository = new BasePersistentRepository<FoundersConversation>("founders_conversations", foundersConversationsStore);
export const verificationRepository = new BasePersistentRepository<VerificationApplication>("verification_applications", verificationApplicationsStore);
export const subscriptionsRepository = new BasePersistentRepository<SubscriptionDetails>("account_subscriptions", accountSubscriptionsStore, "accountId");

export * from "./base.repository.js";
