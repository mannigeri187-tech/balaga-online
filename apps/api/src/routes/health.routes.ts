import { Router } from "express";
import { DEFAULT_BRAND_NAME } from "@platform/config";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const hasRemoteDb = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 20
  );

  res.json({
    status: "healthy",
    platform: process.env.PLATFORM_BRAND_NAME || DEFAULT_BRAND_NAME,
    timestamp: new Date().toISOString(),
    worlds: ["socializing", "founders"],
    storageMode: hasRemoteDb ? "supabase_postgresql" : "local_fallback",
  });
});

