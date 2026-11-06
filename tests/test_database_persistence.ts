/**
 * Database Persistence Test Suite
 * Tests:
 * 1. Storage directory & file initialization
 * 2. Creating records persists to disk
 * 3. Server restart simulation: fresh PersistenceEngine instance hydrates existing records
 * 4. Record updates persist across restart
 * 5. Record deletions persist across restart
 * 6. BasePersistentRepository CRUD operations survive process restart simulation
 */

import fs from "fs";
import path from "path";
import { PersistenceEngine } from "../apps/api/src/database/persistence.js";
import { BasePersistentRepository } from "../apps/api/src/repositories/base.repository.js";

async function runPersistenceTests() {
  console.log("=== STARTING DATABASE PERSISTENCE TEST SUITE ===\n");

  let failed = 0;
  let passed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: ${detail || ""}`);
      failed++;
    }
  }

  const testStorageFile = path.resolve(process.cwd(), `.data/test_persistence_${Date.now()}.json`);

  // Clean test file if already exists
  try {
    if (fs.existsSync(testStorageFile)) {
      fs.unlinkSync(testStorageFile);
    }
  } catch {}

  try {
    // 1. Initialize Engine 1 (Simulating Server Run 1)
    const engine1 = new PersistenceEngine(testStorageFile);
    assert(
      fs.existsSync(path.dirname(testStorageFile)),
      "1. Storage directory initialized successfully"
    );

    // Register a test startups store
    interface TestStartup {
      id: string;
      name: string;
      stage: string;
    }
    const startupsStore1 = engine1.registerStore<TestStartup>("startups");
    const repo1 = new BasePersistentRepository<TestStartup>("startups", startupsStore1);

    // 2. Insert records in Engine 1
    const s1: TestStartup = { id: "startup-alpha", name: "Alpha Technologies", stage: "seed" };
    const s2: TestStartup = { id: "startup-beta", name: "Beta Robotics", stage: "series_a" };
    await repo1.create(s1);
    await repo1.create(s2);

    assert(
      startupsStore1.size === 2,
      "2. Records stored in active persistent map (size = 2)"
    );

    assert(
      fs.existsSync(testStorageFile),
      "3. Data file written to disk synchronously/atomically"
    );

    // 3. Simulate Server Restart / Crash (Dispose Engine 1, spawn Engine 2 from same disk file)
    const engine2 = new PersistenceEngine(testStorageFile);
    const startupsStore2 = engine2.registerStore<TestStartup>("startups");
    const repo2 = new BasePersistentRepository<TestStartup>("startups", startupsStore2);

    assert(
      startupsStore2.size === 2,
      "4. Server restart simulation: Engine 2 hydrated 2 records from disk",
      `Expected size 2, got ${startupsStore2.size}`
    );

    const reloadedS1 = await repo2.findById("startup-alpha");
    assert(
      reloadedS1?.name === "Alpha Technologies" && reloadedS1?.stage === "seed",
      "5. Hydrated record matches original stored data exactly",
      `Got: ${JSON.stringify(reloadedS1)}`
    );

    // 4. Update record in Engine 2
    await repo2.update("startup-alpha", { stage: "series_b" });

    // Simulate Restart 2 (Engine 3)
    const engine3 = new PersistenceEngine(testStorageFile);
    const startupsStore3 = engine3.registerStore<TestStartup>("startups");
    const repo3 = new BasePersistentRepository<TestStartup>("startups", startupsStore3);

    const updatedS1 = await repo3.findById("startup-alpha");
    assert(
      updatedS1?.stage === "series_b",
      "6. Updated record persisted to disk across restart",
      `Expected stage 'series_b', got '${updatedS1?.stage}'`
    );

    // 5. Delete record in Engine 3
    await repo3.delete("startup-beta");

    // Simulate Restart 3 (Engine 4)
    const engine4 = new PersistenceEngine(testStorageFile);
    const startupsStore4 = engine4.registerStore<TestStartup>("startups");
    const repo4 = new BasePersistentRepository<TestStartup>("startups", startupsStore4);

    const deletedS2 = await repo4.findById("startup-beta");
    assert(
      deletedS2 === null && startupsStore4.size === 1,
      "7. Record deletion persisted to disk across restart",
      `Expected null, got ${JSON.stringify(deletedS2)}`
    );

  } catch (err: any) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    // Clean up test file
    if (fs.existsSync(testStorageFile)) {
      try {
        fs.unlinkSync(testStorageFile);
      } catch {}
    }
  }

  console.log(`\n=== PERSISTENCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runPersistenceTests();
