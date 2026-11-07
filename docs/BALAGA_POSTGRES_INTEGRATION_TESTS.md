# Balaga — PostgreSQL Integration & Persistence Test Design

**Document ID:** `BALAGA_POSTGRES_INTEGRATION_TESTS.md`  
**Date:** November 7, 2026  
**Auditor Roles:** Principal QA Architect, Database Verification Engineer  
**Workspace:** `C:\Users\Manjunath H Annigeri\OneDrive\Desktop\antigravity workspace\platform`  

---

## 1. Test Suite Architecture

The PostgreSQL Integration Test Suite is designed to verify that the application layer communicates authoritatively with the database and never produces false success:

```mermaid
flowchart TD
    Runner["Test Harness (tsx / Node.js)"]
    API["Express API Server (apps/api)"]
    Repo["BasePersistentRepository"]
    PG["Authoritative PostgreSQL / Supabase Client"]
    Store["PersistentMap / Local Cache"]

    Runner -->|1. HTTP Mutations| API
    API -->|2. Authoritative Write| Repo
    Repo -->|3. PostgreSQL Upsert / Query| PG
    PG --x|4a. Simulated Failure (e.g. Unique Violation)| Repo
    Repo --x|5a. Hard Error Thrown| API
    API -->|6a. HTTP 500 / 400 Propagated| Runner
    PG -->|4b. Write Success| Repo
    Repo -->|5b. Synchronize Cache| Store
    API -->|6b. HTTP 201 Created| Runner
```

---

## 2. Test Specifications

### Test 1: Authoritative PostgreSQL Write & Read-Through
- **Objective:** Verify that `create()` executes a genuine SQL upsert and returns the persisted record.
- **Assertion:**
  - Create a new startup via `startupsRepository.create(...)`.
  - Query directly via `startupsRepository.findById(...)`.
  - Assert record exists and matches payload attributes exactly.

### Test 2: Hard Database Error Propagation (No False Success)
- **Objective:** Ensure database errors are never swallowed.
- **Assertion:**
  - Attempt to write an invalid record that violates a PostgreSQL check constraint (e.g. invalid status enum or null mandatory foreign key).
  - Assert that the repository **throws a descriptive exception**.
  - Assert that the API endpoint returns `HTTP 500 Internal Server Error` or `HTTP 400 Bad Request` with exact database error details.
  - Assert that the in-memory cache was **not** updated with the failed record.

### Test 3: Duplicate Request & Unique Constraint Enforcement
- **Objective:** Verify that duplicate unique identifiers (e.g. startup slug or username) are rejected at the database level.
- **Assertion:**
  - Submit `POST /api/founders/startups` with slug `duplicate-test-slug`.
  - Submit the identical payload a second time.
  - Assert that the second request returns `HTTP 400 Bad Request` with message `Startup slug 'duplicate-test-slug' is already taken`.

### Test 4: Cold Restart Persistence Recovery
- **Objective:** Prove data survives server process termination.
- **Assertion:**
  - Insert records via API.
  - Terminate Express process.
  - Instantiate a new Express process.
  - Query `GET /api/founders/startups/:id`.
  - Assert record is returned with 100% byte-for-byte fidelity without relying on previous memory state.

### Test 5: Cross-World Database Row Level Security (RLS)
- **Objective:** Verify that Socializing user context cannot query private Founders tables.
- **Assertion:**
  - Issue authenticated query using a Socializing JWT to `founder_profiles` or `startups`.
  - Assert PostgreSQL RLS policy blocks query and returns 0 rows or `HTTP 403 Forbidden`.

---

## 3. Test Runner Implementation

These tests will be added into `tests/test_postgres_authority.ts` to complement existing unit and E2E suites.
