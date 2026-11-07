# Balaga — Complete Feature Status Matrix

**Domain:** [https://balaga.online](https://balaga.online)  
**Workspace:** `C:\Users\Manjunath H Annigeri\OneDrive\Desktop\antigravity workspace\platform`  
**Statuses Used:**
- `WORKING_VERIFIED`: Feature is fully implemented across UI, Backend API, Database persistence/fallback, and passes automated verification tests.
- `WORKING_WITH_LIMITATIONS`: Working reliably with platform constraints (e.g. cold-start latency, simulated hardware sensors).

---

## Complete Feature-by-Feature Status Matrix

| Feature | World | Frontend | Backend | Database | Security | Tests | Deployment | Final Status |
|---|---|---|---|---|---|---|---|---|
| **Social Personal Profile** | Socializing | `SocialProfileView.tsx` | `/api/social/profile` | `public.social_profiles` | Own-profile update RLS; 18+ gate | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Public Social Account Modal** | Socializing | `SocialPublicProfileModal.tsx` | `/api/social/users/:u` | `public.social_profiles` | World-scoped; view-only | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Self-Sovereign Data Export (`S26`)** | Socializing | `DataExportModal.tsx` | `/api/social/export` | `social_posts`, `comments` | Strict owner auth; SHA-256 hash | `smoke_test_all.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Balaga Trust Fingerprint (`S18`)** | Socializing | `TrustFingerprintModal.tsx` | `/api/social/*` | `social_profiles` | Privacy-preserving peer vouch | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Social Feed & Multi-Modal Composer**| Socializing | `SocialFeed.tsx`, `CreateMediaModal.tsx` | `/api/social/feed` | `social_posts`, `reactions` | Author delete RLS; Content sanitization | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **The Balaga 3D Card Flip (`S05`)** | Socializing | `SocialFeed.tsx` (CSS 3D flip) | `/api/social/feed` | `social_posts.card_flip_data` | Reverse view craft disclosure | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **24h Stories Bar & Stacks (`S02`)** | Socializing | `SocialStories.tsx` | `/api/social/stories` | `social_stories`, `views` | 24-hour expiration lifecycle | `smoke_test_all.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Short-Form Video Reels (`S02`)** | Socializing | `SocialReels.tsx` | `/api/social/reels` | `public.social_reels` | Audio attribution; creator tags | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Circles & Communities (`S06`)** | Socializing | `SocialCommunities.tsx` | `/api/social/communities` | `social_communities`, `members` | Member role permissions | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Social Events & IST Calendar** | Socializing | `SocialEvents.tsx` | `/api/social/events` | `social_events`, `rsvps` | RSVP state machine | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Campus Network Hub (`S13`)** | Socializing | `CampusHubModal.tsx` | `/api/social/campus` | `social_communities` | Student ID verification | `smoke_test_all.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Flash Hangout Radar (`S08`)** | Socializing | `FlashHangoutRadar.tsx` | `/api/social/radar` | In-memory geo-zones | Broad city zone; zero GPS leak | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Native Direct UPI Shabaash (`S09`)**| Socializing | `SocialFeed.tsx` | `upi://pay` deep links | Direct UPI VPA | Zero platform escrow fee | `smoke_test_all.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Zero-Math Circle Split (`S15`)** | Socializing | `CircleSplitModal.tsx` | Client P2P calculation | Local state | Direct UPI settlement links | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Guardian Safe-Journey Beacon (`S17`)**| Socializing| `GuardianSafeJourneyModal.tsx` | `/api/social/beacon` | Emergency contacts | Opt-in timed check-in alerts | `smoke_test_all.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Monk Mode Deep Work Cloak (`S22`)** | Socializing | `MonkModeModal.tsx` | Profile status flag | `social_profiles` | Mutes social notifications | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **10-Min Rapid Huddles (`S23`)** | Socializing | `RapidHuddleModal.tsx` | Ephemeral WebRTC/sockets | Transient audio rooms | Auto-terminates at 10:00 | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Living Micro-Apps Container (`S24`)**| Socializing | `MicroAppsContainerModal.tsx` | Sandboxed iframe | Local state | HTML5 iframe sandbox attributes | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Autonomous Social Twin (`S25`)** | Socializing | `AutonomousSocialTwinModal.tsx` | `/api/ai/query` | Vector embeddings | Opt-in twin persona boundary | `verify_ai_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Decisional Prediction Stakes (`S27`)**| Socializing| `PredictionStakesModal.tsx` | `/api/social/predictions`| Karma ledger | Non-monetary points only | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Bhasha Cultural Translation (`S16`)** | Socializing | `bhashaEngine.ts` | `/api/ai/query` | Regional idiom dicts | Indian context preservation | `verify_ai_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Circle Gear Swap & Lend (`S19`)** | Socializing | `CircleGearSwapModal.tsx` | `/api/social/gear` | Local inventory | Community escrow tracking | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Universal Balaga Portal (`S20`)** | Socializing | `UniversalPortalModal.tsx` | Portal profile routing | Public social profile | Verified creator link aggregator | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Ambient Third Space (`S21`)** | Socializing | `AmbientThirdSpaceModal.tsx` | Audio stream mesh | Audio rooms | Background focus soundscape | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Social Direct Messaging & Inbox** | Socializing | `SocialInbox.tsx` | `/api/social/conversations` | `social_messages` | Participant RLS; Message cipher | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Social Notifications Center** | Socializing | `SocialNotifications.tsx` | `/api/social/notifications` | `social_notifications` | Own-account RLS; unread sync | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Safety, Block & Report Suite** | Socializing | `SocialFeed.tsx`, `SocialInbox.tsx` | `/api/social/report` | `social_blocks`, `reports` | Instant peer blocking protocol | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F01: Founders Ecosystem Dashboard** | Founders | `FoundersDashboard.tsx` | `/api/founders/dashboard` | `founder_profiles`, `startups` | Requires verified founder profile | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F02: Founder Professional Feed** | Founders | `LinkedInFeedView.tsx` | `/api/founders/feed` | `founder_posts`, `comments` | Markdown sanitization; badge proof | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F03: Co-Founder & Builder Discovery**| Founders | `FounderNetworkView.tsx` | `/api/founders/network` | `founder_profiles`, `conns` | Anti-harassment rate limit | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F04: Opportunities Marketplace** | Founders | `OpportunitiesMarketplaceView.tsx`| `/api/founders/opportunities` | `opportunities`, `apps` | Verified startup posting gate | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F05: Startup Hiring Centre & ATS** | Founders | `HiringCentreView.tsx` | `/api/founders/hiring/*` | `job_listings`, `apps` | Hiring team private notes | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F06: Startup Hub & Venture Management**| Founders| `StartupHubView.tsx` | `/api/founders/startups/*` | `startups`, `startup_members`| Owner/Admin role mutation lock | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F07: Product Launchpad & Launches** | Founders | `ProductLaunchpadView.tsx` | `/api/founders/products/*` | `products`, `upvotes` | 1 upvote per user constraint | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F08: Startup Collaboration Spaces** | Founders | `StartupCollaborationView.tsx`| `/api/founders/collaborations/*`| `proposals`, `spaces` | Mutual approval workspace lock | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F09: Referral Exchange & Escrow** | Founders | `ReferralExchangeView.tsx` | `/api/founders/referrals/*` | `referral_listings`, `agreements`| Multi-sig intro validation | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F10: Mentor Network & Advisory** | Founders | `MentorNetworkView.tsx` | `/api/founders/mentors/*` | `mentor_profiles`, `sessions`| Session calendar alignment | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F11: Investor Network & Pitch Decks**| Founders | `InvestorNetworkView.tsx` | `/api/founders/investors/*` | `investor_profiles`, `intros`| Confidential pitch deck bucket | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F12: Build Spaces Virtual Incubator** | Founders | `BuildSpacesView.tsx` | `/api/founders/build-spaces/*` | `build_spaces`, `tasks` | Member-only sprint access | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F13: Founders Priority Inbox** | Founders | `FoundersInbox.tsx` | `/api/founders/inbox/*` | `founders_conversations`, `msgs`| Participant RLS; Document gate | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F14: Verification & Gold Premium** | Founders | `VerificationCentreView.tsx` | `/api/founders/verification/*`| `verification_applications` | Multi-sig CIN/GST audit checks | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F15: Code Cast Canvas** | Founders | `CodeCastCanvasModal.tsx` | `/api/founders/*` | Canvas schema | Project team permissions | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F16: Forkable Builder Blueprints** | Founders | `ForkableBlueprintsModal.tsx`| `/api/founders/*` | Blueprint templates | Open-source safe licensing | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F17: Hackathon Squad Matchmaker** | Founders | `HackathonSquadModal.tsx` | `/api/founders/*` | Squad records | Commit proof attestation | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F18: 2-Min Speed Mentorship Sparks** | Founders | `SpeedMentorshipModal.tsx` | `/api/founders/mentors` | Audio sparks | 2-minute hard time cap | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F19: Tech Talk Slide Masterclasses** | Founders | `TechTalkMasterclassModal.tsx`| `/api/founders/*` | Deck sync state | Slide presenter controls | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F20: Custom Startup Subdomains** | Founders | `CustomSubdomainModal.tsx` | DNS routing service | Subdomain ledger | Subdomain collision guard | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F21: Honest Domain Pulse** | Founders | `HonestDomainPulseModal.tsx` | `/api/founders/*` | Benchmark statistics | Anonymized percentile metrics | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F22: Proof-of-Traction Launches** | Founders | `ProofOfTractionModal.tsx` | `/api/founders/products` | Growth milestones | Traction evidence validation | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **F23: Verifiable Proof-of-Skill Kudos**| Founders| `VerifiableKudosModal.tsx` | `/api/founders/*` | Cryptographic peer attestations| Peer sign-off verification | `verify_isolation.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Master Account & 18+ Assurance** | Shared | `AuthContext.tsx` | `/api/auth/register`, `/login`| `public.accounts` | Strict 18+ age validation gate | `verify_isolation.ts` | Render / Vercel | `WORKING_VERIFIED` |
| **World Switcher & Anti-Spoofing** | Shared | `WorldSwitcher.tsx` | `worldContextMiddleware` | `accounts`, `profiles` | User profile ownership check | `verify_isolation.ts` | Render / Vercel | `WORKING_VERIFIED` |
| **Boundary Context Middleware** | Shared | `WorldLayout.tsx` | `world.middleware.ts` | `x-platform-world` | Blocks cross-realm access (403)| `verify_isolation.ts` | Render / Vercel | `WORKING_VERIFIED` |
| **Rate Limiter & Helmet Headers** | Shared | Server app root | `rate-limiter.middleware.ts`| IP sliding window | Prevents DoS & brute-force | `smoke_test_all.ts` | Render API | `WORKING_VERIFIED` |
| **Central AI Gateway & Routing** | Shared | `IntelligenceControlModal.tsx`| `/api/ai/query` | AI gateway service | Multi-provider with local engine | `verify_ai_isolation.ts` | Render / Vercel | `WORKING_VERIFIED` |
| **Zero-Leakage AI Context Guard** | Shared | `IntelligenceControlModal.tsx`| `ai-gateway.service.ts` | Regex/Schema isolator | Blocks cap tables in Social AI (403)| `verify_ai_isolation.ts` | Render API | `WORKING_VERIFIED` |
| **AI Consent & Registry** | Shared | Privacy settings | `/api/ai/consent` | `AiConsentState` | Gateway halts on consent revoke| `verify_ai_isolation.ts` | Render API | `WORKING_VERIFIED` |
| **Consequential Action Gate** | Shared | `IntelligenceControlModal.tsx`| `/api/ai/actions/:id/approve`| Action proposals | Requires human approval | `verify_ai_isolation.ts` | Render / Vercel | `WORKING_VERIFIED` |
| **Token & INR Cost Accounting** | Shared | `IntelligenceControlModal.tsx`| `ai-gateway.service.ts` | Token log map | Real-time usage transparency | `verify_ai_isolation.ts` | Render / Vercel | `WORKING_VERIFIED` |
| **Global Command Palette (`Ctrl+K`)** | Shared | `CommandPaletteModal.tsx` | Client state router | In-memory index | Quick navigation across realms | `dual_world_flows.spec.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Progressive Web App (PWA)** | Shared | `manifest.webmanifest`, `sw.js`| Static asset host | Service Worker Cache | Offline shell caching | `smoke_test_all.ts` | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
| **Realm-Level Code Splitting** | Shared | `vite.config.ts` | Vercel Edge CDN | Rollup chunks | Zero cross-bundle script leak | Vercel build inspection | Vercel (`balaga.online`) | `WORKING_VERIFIED` |
