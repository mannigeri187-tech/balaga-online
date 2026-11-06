import { Router } from "express";
import { registerSchema, loginSchema, socialProfileSchema, founderProfileSchema } from "@platform/validation";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  accountsStore,
  socialProfilesStore,
  founderProfilesStore,
  devAccountId,
} from "../services/store.js";

export const authRouter = Router();

// REGISTER (Requires 18+ attestation)
authRouter.post("/register", (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const { email, firstWorld } = result.data;
  const newId = `acc-${Date.now()}`;
  const account = {
    id: newId,
    email,
    is18PlusVerified: true,
    ageVerifiedAt: new Date().toISOString(),
    subscriptionTier: "free" as const,
    isSuspended: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  accountsStore.set(newId, account);

  return res.status(201).json({
    message: "Account registered successfully",
    account,
    token: `mock-token-${newId}`,
    firstWorld,
  });
});

// LOGIN
authRouter.post("/login", (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  return res.json({
    token: `mock-token-${devAccountId}`,
    account: accountsStore.get(devAccountId),
  });
});

// GET CURRENT SESSION & PROFILES
authRouter.get("/me", authMiddleware, (req, res) => {
  const accountId = req.user?.id || devAccountId;
  const account = accountsStore.get(accountId);
  const socialProfile = socialProfilesStore.get(accountId) || null;
  const founderProfile = founderProfilesStore.get(accountId) || null;

  return res.json({
    account,
    profiles: {
      socializing: socialProfile,
      founders: founderProfile,
    },
  });
});

// CREATE / UPDATE SOCIAL PROFILE
authRouter.post("/profiles/social", authMiddleware, (req, res) => {
  const result = socialProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const accountId = req.user!.id;
  const existing = socialProfilesStore.get(accountId);
  const profile = {
    id: existing ? existing.id : `soc-${Date.now()}`,
    accountId,
    ...result.data,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  socialProfilesStore.set(accountId, profile);
  return res.status(201).json({ message: "Social profile saved", profile });
});

// CREATE / UPDATE FOUNDER PROFILE
authRouter.post("/profiles/founder", authMiddleware, (req, res) => {
  const result = founderProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Validation failed", details: result.error.errors });
  }

  const accountId = req.user!.id;
  const existing = founderProfilesStore.get(accountId);
  const profile = {
    id: existing ? existing.id : `fnd-${Date.now()}`,
    accountId,
    ...result.data,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  founderProfilesStore.set(accountId, profile);
  return res.status(201).json({ message: "Founder profile saved", profile });
});
