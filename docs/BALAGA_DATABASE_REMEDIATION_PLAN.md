# Balaga — Critical Database Authority Remediation Plan

**Document ID:** `BALAGA_DATABASE_REMEDIATION_PLAN.md`  
**Date:** November 7, 2026  
**Auditor Roles:** Principal Database Architect, Senior Backend Systems Engineer  
**Workspace:** `C:\Users\Manjunath H Annigeri\OneDrive\Desktop\antigravity workspace\platform`  
**Target Authority:** Supabase PostgreSQL 15 (authoritative) with explicit development-only fallback  

---

## 1. Architectural Diagnosis & Root Cause

The second-pass audit uncovered that Balaga's runtime data flows currently bypass Supabase PostgreSQL:
1. **The Bypass:** Route controllers in [`founder.routes.ts`](file:///C:/Users/Manjunath%20H%20Annigeri/OneDrive/Desktop/antigravity%20workspace/platform/apps/api/src/routes/founder.routes.ts) and [`social.routes.ts`](file:///C:/Users/Manjunath%20H%20Annigeri/OneDrive/Desktop/antigravity%20workspace/platform/apps/api/src/routes/social.routes.ts) import and mutate JavaScript `Map` instances from [`store.ts`](file:///C:/Users/Manjunath%20H%20Annigeri/OneDrive/Desktop/antigravity%20workspace/platform/apps/api/src/services/store.ts) directly.
2. **Ephemeral Disk Vulnerability:** `PersistentMap` serializes data to `.data/platform_storage.json` on local disk. On Render's production web service, containers have **ephemeral filesystems**. Any user actions recorded solely in `.data/platform_storage.json` will be wiped whenever Render spins down an idle container (after 15 minutes) or deploys a new build.
3. **Disconnected Repositories:** [`apps/api/src/repositories/index.ts`](file:///C:/Users/Manjunath%20H%20Annigeri/OneDrive/Desktop/antigravity%20workspace/platform/apps/api/src/repositories/index.ts) was created with Supabase upsert logic, but zero routes currently import from it. Furthermore, it only covered Founders entities, completely omitting the Socializing realm.

---

## 2. Complete Entity-to-Table Mapping Matrix

Every runtime entity in Balaga maps to an existing table defined across the 17 migrations in `supabase/migrations/`:

| Entity / Domain Model | TypeScript Interface | In-Memory Store (`store.ts`) | Target PostgreSQL Table | Migration File Reference |
|---|---|---|---|---|
| **Account** | `Account` | `accountsStore` | `public.accounts` | `20261104000001_foundation.sql` |
| **Social Profile** | `SocialProfile` | `socialProfilesStore` | `public.social_profiles` | `20261104000002_socializing_core.sql` |
| **Social Connection** | `SocialConnection` | `socialConnectionsStore` | `public.social_connections` | `20261104000003_social_connections_discovery.sql` |
| **Social Follow** | `SocialFollow` | `socialFollowsStore` | `public.social_follows` | `20261104000003_social_connections_discovery.sql` |
| **Social Post** | `SocialPost` | `socialPostsStore` | `public.social_posts` | `20261104000004_socializing_full.sql` |
| **Social Reaction** | `SocialReaction` | `socialReactionsStore` | `public.social_reactions` | `20261104000004_socializing_full.sql` |
| **Social Comment** | `SocialComment` | `socialCommentsStore` | `public.social_comments` | `20261104000004_socializing_full.sql` |
| **Social Story** | `SocialStory` | `socialStoriesStore` | `public.social_stories` | `20261104000004_socializing_full.sql` |
| **Social Reel** | `SocialReel` | `socialReelsStore` | `public.social_reels` | `20261104000004_socializing_full.sql` |
| **Social Community** | `SocialCommunity` | `socialCommunitiesStore` | `public.social_communities` | `20261104000004_socializing_full.sql` |
| **Social Event** | `SocialEvent` | `socialEventsStore` | `public.social_events` | `20261104000004_socializing_full.sql` |
| **Social Conversation** | `SocialConversation` | `socialConversationsStore`| `public.social_conversations` | `20261104000004_socializing_full.sql` |
| **Social Message** | `SocialMessage` | `socialMessagesStore` | `public.social_messages` | `20261104000004_socializing_full.sql` |
| **Social Notification** | `SocialNotification` | `socialNotificationsStore`| `public.social_notifications` | `20261104000004_socializing_full.sql` |
| **Founder Profile** | `FounderProfile` | `founderProfilesStore` | `public.founder_profiles` | `20261105000000_founders_core_foundation.sql` |
| **Founder Post** | `FounderPost` | `founderPostsStore` | `public.founder_posts` | `20261105000000_founders_core_foundation.sql` |
| **Founder Connection** | `FounderConnection` | `founderConnectionsStore` | `public.founder_connections` | `20261105000000_founders_core_foundation.sql` |
| **Startup** | `Startup` | `startupsStore` | `public.startups` | `20261105000000_founders_core_foundation.sql` |
| **Startup Member** | `StartupMember` | `startupMembersStore` | `public.startup_members` | `20261105000002_feature6_startup_hub.sql` |
| **Startup Update** | `StartupUpdate` | `startupUpdatesStore` | `public.startup_updates` | `20261105000002_feature6_startup_hub.sql` |
| **Job Listing** | `JobListing` | `startupJobsStore` | `public.startup_jobs` | `20261105000001_feature5_hiring_centre.sql` |
| **Job Application** | `JobApplication` | `jobApplicationsStore` | `public.job_applications` | `20261105000001_feature5_hiring_centre.sql` |
| **Product** | `Product` | `launchpadProductsStore` | `public.products` | `20261105000003_feature7_product_launchpad.sql` |
| **Product Upvote** | `ProductUpvote` | `productUpvotesStore` | `public.product_upvotes` | `20261105000003_feature7_product_launchpad.sql` |
| **Opportunity** | `Opportunity` | `opportunitiesStore` | `public.opportunities` | `20261105000000_founders_core_foundation.sql` |
| **Opportunity App** | `OpportunityApplication` | `opportunityApplicationsStore`| `public.opportunity_applications` | `20261105000000_founders_core_foundation.sql` |
| **Collab Proposal** | `CollaborationRequest`| `collaborationRequestsStore`| `public.collaboration_proposals` | `20261105000004_feature8_startup_collaboration.sql` |
| **Partnership Space** | `PartnershipSpace` | `partnershipSpacesStore` | `public.partnership_spaces` | `20261105000004_feature8_startup_collaboration.sql` |
| **Referral Listing** | `ReferralListing` | `referralListingsStore` | `public.referral_listings` | `20261105000005_feature9_referral_exchange.sql` |
| **Referral Request** | `ReferralRequest` | `referralRequestsStore` | `public.referral_requests` | `20261105000005_feature9_referral_exchange.sql` |
| **Mentor Profile** | `MentorProfile` | `mentorProfilesStore` | `public.mentor_profiles` | `20261105000006_feature10_mentor_network.sql` |
| **Investor Profile** | `InvestorProfile` | `investorProfilesStore` | `public.investor_profiles` | `20261105000007_feature11_investor_network.sql` |
| **Build Space** | `BuildSpace` | `buildSpacesStore` | `public.build_spaces` | `20261105000008_feature12_build_spaces.sql` |
| **Founders Conversation**| `FoundersConversation`| `foundersConversationsStore`| `public.founders_conversations` | `20261105000009_feature13_founders_inbox.sql` |
| **Founders Message** | `FoundersMessage` | `foundersMessagesStore` | `public.founders_messages` | `20261105000009_feature13_founders_inbox.sql` |
| **Verification App** | `VerificationApplication`| `verificationApplicationsStore`| `public.verification_applications`| `20261105000010_feature14_verification_premium.sql` |
| **Subscription** | `SubscriptionDetails` | `accountSubscriptionsStore`| `public.account_subscriptions` | `20261105000010_feature14_verification_premium.sql` |

---

## 3. The 5-Stage Remediation Plan

### Stage 1: Complete the Repository Layer
- Expand [`apps/api/src/repositories/index.ts`](file:///C:/Users/Manjunath%20H%20Annigeri/OneDrive/Desktop/antigravity workspace/platform/apps/api/src/repositories/index.ts) to register repositories for **all Socializing entities** (`socialPostsRepository`, `socialCommentsRepository`, `socialCommunitiesRepository`, `socialEventsRepository`, `socialConversationsRepository`, `socialMessagesRepository`, etc.).
- Ensure all repository instances are bound to their respective tables and stores.

### Stage 2: Enforce Authoritative Database Writes & Error Propagation
- Update [`BasePersistentRepository`](file:///C:/Users/Manjunath%20H%20Annigeri/OneDrive/Desktop/antigravity workspace/platform/apps/api/src/repositories/base.repository.ts) so that:
  - When `isRemoteAuthoritative()` is enabled, `create()`, `update()`, and `delete()` methods execute synchronous database queries against Supabase PostgreSQL.
  - If Supabase returns an error, the repository throws an error immediately with exact PostgreSQL error codes (`23505` unique violation, `23503` foreign key violation, `42501` RLS violation).
  - The cache is only updated **after** the database write succeeds.

### Stage 3: Server Startup Database Hydration
- Implement `hydrateAllRepositoriesFromRemote()` in `repositories/index.ts`:
  - When the server boots in an authoritative environment (`SUPABASE_SERVICE_ROLE_KEY` present), it queries all tables in topological order and populates the in-memory cache from PostgreSQL.
  - If a container restarts, it hydronates from Supabase PostgreSQL rather than depending on ephemeral disk.

### Stage 4: Critical Route Controller Rewiring
- Wire critical business write routes to call repository methods:
  - Startup creation: `POST /api/founders/startups` -> `await startupsRepository.create(...)`.
  - Social post creation: `POST /api/social/posts` -> `await socialPostsRepository.create(...)`.
  - Founder post creation: `POST /api/founders/posts` -> `await founderPostsRepository.create(...)`.
  - Job creation: `POST /api/founders/hiring/jobs` -> `await jobsRepository.create(...)`.
  - Build space creation: `POST /api/founders/build-spaces` -> `await buildSpacesRepository.create(...)`.
  - Opportunity creation: `POST /api/founders/opportunities` -> `await opportunitiesRepository.create(...)`.
- Add explicit `try / catch` blocks propagating database errors as `res.status(500).json({ error: "Database persistence error", details: err.message })`.

### Stage 5: Zero-Regression Testing & Isolation Verification
- Ensure that in test mode or local offline mode without remote credentials, `isRemoteAuthoritative()` gracefully falls back to `PersistentMap`, so all 700+ automated unit and integration tests continue to pass with 100% fidelity.
- Re-run `verify_isolation.ts`, `verify_ai_isolation.ts`, `test_database_persistence.ts`, `test_auth_security.ts`, and `test_rls_security.ts`.

---

## 4. Current Blockers & Constraints

1. **Remote Supabase Direct DDL Access:**
   - In the current workspace, direct administrative database access to `https://idzqiquioioaqpfssqun.supabase.co` is not available without the user providing the service role key or executing migrations via the Supabase dashboard SQL editor.
   - **Remediation Constraint:** All code changes must be developed, tested, and verified locally. Production migration execution is halted until explicit user authorization is provided.
2. **Backward Compatibility:**
   - The route changes must not break the existing in-memory query filters used by search and discovery algorithms. The repository layer will act as the write-through and read-through authority while maintaining Map compatibility.
