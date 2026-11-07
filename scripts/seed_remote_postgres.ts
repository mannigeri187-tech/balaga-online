import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), "apps/api/.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/ANON_KEY are required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runSeed() {
  console.log("=== BALAGA REMOTE POSTGRESQL SEED & SYNC ===");
  console.log(`Connecting to: ${supabaseUrl}`);

  const storageFile = path.resolve(process.cwd(), ".data/platform_storage.json");
  if (!fs.existsSync(storageFile)) {
    console.error(`❌ Local storage file not found at ${storageFile}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(storageFile, "utf8");
  const localData = JSON.parse(raw);

  const tablesToSeed = [
    { localKey: "accounts", table: "accounts" },
    { localKey: "social_profiles", table: "social_profiles" },
    { localKey: "founder_profiles", table: "founder_profiles" },
    { localKey: "startups", table: "startups" },
    { localKey: "products", table: "products" },
    { localKey: "founders_conversations", table: "founders_conversations" },
    { localKey: "founders_notifications", table: "founders_notifications" },
    { localKey: "verification_applications", table: "verification_applications" },
    { localKey: "verification_audit_logs", table: "verification_audit_logs" },
    { localKey: "account_subscriptions", table: "account_subscriptions" },
  ];

  let totalSeeded = 0;

  for (const { localKey, table } of tablesToSeed) {
    const store = localData[localKey];
    if (!store) continue;

    const items = Object.values(store);
    if (items.length === 0) continue;

    console.log(`\nSyncing ${items.length} records to table '${table}'...`);

    for (const item of items) {
      try {
        const { error } = await supabase.from(table).upsert(item as any);
        if (error) {
          console.warn(`  ⚠️ Upsert to ${table} failed for id ${(item as any).id || (item as any).accountId}: ${error.message}`);
        } else {
          totalSeeded++;
        }
      } catch (err: any) {
        console.warn(`  ⚠️ Error syncing item to ${table}:`, err.message);
      }
    }
  }

  console.log(`\n✅ Remote PostgreSQL Seed Complete. Successfully synced ${totalSeeded} records.`);
}

runSeed().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
