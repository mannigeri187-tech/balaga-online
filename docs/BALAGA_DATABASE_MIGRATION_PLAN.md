# Balaga — Database Migration & Remote Data Preservation Plan

**Document ID:** `BALAGA_DATABASE_MIGRATION_PLAN.md`  
**Date:** November 7, 2026  
**Auditor Roles:** Principal Database Administrator, DevOps Engineer  
**Workspace:** `C:\Users\Manjunath H Annigeri\OneDrive\Desktop\antigravity workspace\platform`  

---

## 1. Remote Migration Status & Reconciliation Strategy

To avoid data loss or schema corruption, the remote database at `https://idzqiquioioaqpfssqun.supabase.co` must be reconciled systematically rather than blindly overwriting tables:

### Migration Inventory Breakdown (17 Files):
- **Phase A (Socializing Foundation):**
  - `20261104000001_foundation.sql`
  - `20261104000002_socializing_core.sql`
  - `20261104000003_social_connections_discovery.sql`
  - `20261104000004_socializing_full.sql`
- **Phase B (Founders Core & Protected Modules):**
  - `20261105000000_founders_core_foundation.sql`
  - `20261105000001_feature5_hiring_centre.sql`
  - `20261105000002_feature6_startup_hub.sql`
  - `20261105000003_feature7_product_launchpad.sql`
  - `20261105000004_feature8_startup_collaboration.sql`
  - `20261105000005_feature9_referral_exchange.sql`
  - `20261105000006_feature10_mentor_network.sql`
  - `20261105000007_feature11_investor_network.sql`
  - `20261105000008_feature12_build_spaces.sql`
  - `20261105000009_feature13_founders_inbox.sql`
  - `20261105000010_feature14_verification_premium.sql`
- **Phase C (Repair & Forward Compatibility):**
  - `20261105000011_schema_foundation_repair.sql`
  - `20261105000012_forward_type_compatibility.sql`

---

## 2. Non-Destructive Execution Principles

1. **Zero Table Drops:** Under no circumstances should `DROP TABLE CASCADE` or `TRUNCATE` be executed on production.
2. **Idempotent DDL:** Every table creation uses `CREATE TABLE IF NOT EXISTS`; every column addition uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
3. **Preservation of Existing Data:** Any seed data or testing accounts created in Supabase Auth or PostgreSQL must remain intact.
4. **Clean Install Script Usage:**
   - `supabase/BALAGA_CLEAN_DATABASE_INSTALL.sql` (177 KB) combines all 17 migrations into an idempotent script with conditional checks.
   - It is verified to be non-destructive when executed on an existing database instance.

---

## 3. Data Migration from Local JSON Stores to PostgreSQL

To ensure that accounts and records created during testing or local development are not lost:
1. **Extraction Script:** Create an extraction script (`scripts/migrate_json_to_postgres.ts`) that reads `.data/platform_storage.json`.
2. **Transform & Upsert:**
   - Connects to Supabase using the service role key.
   - Iterates through `accounts`, `social_profiles`, `founder_profiles`, and `startups`.
   - Executes batch `upsert()` with `onConflict: "id"` to merge records into PostgreSQL without overwriting newer remote timestamps.
3. **Execution Gate:** This script will only run in an authenticated administrative environment after PostgreSQL schema verification.

---

## 4. Rollback & Disaster Recovery Procedures

1. **Pre-Migration Snapshot:** Before executing any SQL on Supabase, generate a database backup snapshot via Supabase Dashboard -> Project Settings -> Database -> Backups.
2. **Point-In-Time Recovery (PITR):** Verify that WAL archiving is enabled on the Supabase project.
3. **Schema Reversion Plan:** If a migration fails halfway through execution, the transaction aborts automatically (`BEGIN ... COMMIT` blocks ensure atomicity).
