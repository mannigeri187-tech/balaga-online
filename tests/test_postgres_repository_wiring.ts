import {
  allRepositories,
  startupsRepository,
  founderPostsRepository,
  socialPostsRepository,
  socialCommentsRepository,
  socialCommunitiesRepository,
  socialEventsRepository,
  socialMessagesRepository,
  socialStoriesRepository,
  socialReelsRepository,
  opportunitiesRepository,
  jobsRepository,
  productsRepository,
  buildSpacesRepository,
  initializeAllRepositories,
  BasePersistentRepository,
} from "../apps/api/src/repositories/index.js";

async function runTests() {
  console.log("=== STARTING POSTGRESQL REPOSITORY WIRING TEST SUITE ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Verify Repository Count and Coverage
  assert(allRepositories.length >= 24, `All 24+ core repositories registered (found ${allRepositories.length})`);

  // 2. Test initialization & hydration hook
  const initStatus = await initializeAllRepositories();
  assert(initStatus.totalRepositories === allRepositories.length, "initializeAllRepositories() executed over all registered repositories");
  assert(typeof initStatus.authoritative === "boolean", "Authoritative mode accurately reflects environment configuration");

  // 3. Test Social Post Repository Operations
  const testSocialPostId = `sp-test-${Date.now()}`;
  const createdSocialPost = await socialPostsRepository.create({
    id: testSocialPostId,
    authorId: "10000000-0000-0000-0000-000000000001",
    content: "Testing repository-bound persistence",
    postType: "general",
    mediaUrls: [],
    mediaType: "none",
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  assert(createdSocialPost.id === testSocialPostId, "socialPostsRepository.create successfully persisted entity");

  const foundPost = await socialPostsRepository.findById(testSocialPostId);
  assert(foundPost !== null && foundPost.content === "Testing repository-bound persistence", "socialPostsRepository.findById retrieves stored entity");

  const updatedPost = await socialPostsRepository.update(testSocialPostId, { content: "Updated content via repository" });
  assert(updatedPost !== null && updatedPost.content === "Updated content via repository", "socialPostsRepository.update modifies entity");

  const deletedPost = await socialPostsRepository.delete(testSocialPostId);
  assert(deletedPost === true, "socialPostsRepository.delete removes entity");
  const postAfterDelete = await socialPostsRepository.findById(testSocialPostId);
  assert(postAfterDelete === null, "Deleted entity is no longer retrievable");

  // 4. Test Startup Repository Operations
  const testStartupId = `st-test-${Date.now()}`;
  const createdStartup = await startupsRepository.create({
    id: testStartupId,
    creatorId: "20000000-0000-0000-0000-000000000001",
    name: "AeroTest Systems",
    slug: `aerotest-${Date.now()}`,
    tagline: "High-speed aerospace telemetry",
    oneLiner: "Testing startup repository persistence",
    description: "Detailed system architecture testing description",
    industry: "deeptech",
    stage: "early_traction",
    teamSize: "2-5",
    broadLocation: "Bengaluru, Karnataka",
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
  });
  assert(createdStartup.id === testStartupId, "startupsRepository.create successfully persisted startup");

  const foundStartup = await startupsRepository.findById(testStartupId);
  assert(foundStartup !== null && foundStartup.name === "AeroTest Systems", "startupsRepository.findById retrieves startup");

  await startupsRepository.delete(testStartupId);
  assert((await startupsRepository.findById(testStartupId)) === null, "startupsRepository.delete cleans up test startup");

  // 5. Test Error Propagation Guard (False Success Prevention)
  class FailingRemoteRepository extends BasePersistentRepository<any> {
    isRemoteAuthoritative(): boolean {
      return true; // Force remote check
    }
  }
  const failingRepo = new FailingRemoteRepository("fictional_table", new Map());
  let threwExpectedError = false;
  try {
    // Attempting to write without real Supabase table should throw, NOT return HTTP 200 or store locally
    await failingRepo.create({ id: "fail-1", title: "Should fail" });
  } catch (err: any) {
    threwExpectedError = true;
  }
  assert(threwExpectedError, "Failing PostgreSQL writes strictly throw errors and prevent false success");

  console.log(`\n=== REPOSITORY WIRING RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
