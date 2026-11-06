import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  executeAiGateway,
  getUserConsent,
  updateUserConsent,
  getUserActivityLogs,
  getPlatformMetrics,
  getActionProposal,
  resolveActionProposal,
} from "../services/ai-gateway.service.js";
import { WORLDS, WorldType } from "@platform/config";

export const aiRouter = Router();

const aiQuerySchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty").max(4000, "Prompt exceeds 4000 chars limit"),
  taskType: z.enum([
    "summary",
    "matching",
    "assistance",
    "translation",
    "review",
    "discovery_explanation",
    "community_pulse",
    "action_proposal",
    "caption_assistant",
    "community_digest",
    "living_board_curator",
    "weekly_recap",
    "faq_detection",
    "braintrust_assist",
    "moderation_assist",
    "moderation_appeal",
    "market_research",
    "task_breakdown",
    "bottleneck_warning",
    "deadline_alert",
    "inactivity_alert",
  ]),
  systemPrompt: z.string().max(1000).optional(),
  contextData: z.record(z.any()).optional(),
  temperature: z.number().min(0).max(1).optional(),
  maxTokens: z.number().min(16).max(2048).optional(),
});

const updateConsentSchema = z.object({
  socialAiEnabled: z.boolean().optional(),
  foundersAiEnabled: z.boolean().optional(),
  allowSocialMemory: z.boolean().optional(),
  allowFoundersMemory: z.boolean().optional(),
  allowExperimentalModels: z.boolean().optional(),
});

// 1. Central Query Endpoint (World-Scoped)
aiRouter.post("/query", async (req: Request, res: Response) => {
  try {
    const parseResult = aiQuerySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation Error",
        details: parseResult.error.format(),
      });
    }

    const world = req.worldContext?.world as WorldType;
    const accountId = req.worldContext?.accountId;

    if (!world || !accountId) {
      return res.status(400).json({ error: "Missing active world context or account identity." });
    }

    const response = await executeAiGateway(world, accountId, parseResult.data);
    return res.status(200).json(response);
  } catch (err: any) {
    const message = err.message || "AI Gateway processing error";
    const status = message.includes("disabled in your") ? 403 : message.includes("Zero-Leakage") ? 403 : 500;
    return res.status(status).json({ error: message });
  }
});

// 2. User Consent Management
aiRouter.get("/consent", (req: Request, res: Response) => {
  const accountId = req.user?.id;
  if (!accountId) return res.status(401).json({ error: "Unauthorized" });

  const consent = getUserConsent(accountId);
  return res.status(200).json(consent);
});

aiRouter.put("/consent", (req: Request, res: Response) => {
  const accountId = req.user?.id;
  if (!accountId) return res.status(401).json({ error: "Unauthorized" });

  const parseResult = updateConsentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid consent payload", details: parseResult.error.format() });
  }

  const updated = updateUserConsent(accountId, parseResult.data);
  return res.status(200).json({
    message: "AI consent and memory preferences updated successfully",
    consent: updated,
  });
});

// 3. User Activity & Audit History
aiRouter.get("/activity", (req: Request, res: Response) => {
  const accountId = req.user?.id;
  if (!accountId) return res.status(401).json({ error: "Unauthorized" });

  const world = req.query.world as WorldType | undefined;
  const logs = getUserActivityLogs(accountId, world);
  return res.status(200).json({ logs });
});

// 4. Token & Cost Accounting Metrics
aiRouter.get("/metrics", (_req: Request, res: Response) => {
  const metrics = getPlatformMetrics();
  return res.status(200).json(metrics);
});

// 5. Consequential Action Proposal Approval Gate
aiRouter.get("/actions/:proposalId", (req: Request, res: Response) => {
  const proposal = getActionProposal(req.params.proposalId);
  if (!proposal) return res.status(404).json({ error: "Proposal not found" });
  return res.status(200).json(proposal);
});

aiRouter.post("/actions/:proposalId/resolve", (req: Request, res: Response) => {
  const { approved } = req.body;
  if (typeof approved !== "boolean") {
    return res.status(400).json({ error: "Field 'approved' (boolean) is required." });
  }

  try {
    const resolved = resolveActionProposal(req.params.proposalId, approved);
    return res.status(200).json({
      message: `Action ${approved ? "approved and queued for execution" : "rejected and discarded"}`,
      proposal: resolved,
    });
  } catch (err: any) {
    return res.status(404).json({ error: err.message });
  }
});
