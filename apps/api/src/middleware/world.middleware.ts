import { Request, Response, NextFunction } from "express";
import { WORLDS, WorldType } from "@platform/config";
import { getProfileForWorld } from "../services/store.js";

declare global {
  namespace Express {
    interface Request {
      worldContext?: {
        world: WorldType;
        profileId: string;
        accountId: string;
      };
    }
  }
}

/**
 * Validates the x-platform-world header AND strictly verifies that the authenticated user
 * actually owns an active profile in that world.
 * Never blindly trusts the incoming client header!
 */
export function worldContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const worldHeader = req.headers["x-platform-world"] as string | undefined;

  if (!worldHeader || (worldHeader !== WORLDS.SOCIALIZING && worldHeader !== WORLDS.FOUNDERS)) {
    return res.status(400).json({
      error: "Bad Request: Missing or invalid 'x-platform-world' header. Must be 'socializing' or 'founders'.",
    });
  }

  const accountId = req.user?.id;
  if (!accountId) {
    return res.status(401).json({ error: "Unauthorized: Missing authenticated account context" });
  }

  // Verify that this authenticated account actually owns a profile in the requested world
  const profile = getProfileForWorld(accountId, worldHeader as WorldType);
  if (!profile) {
    return res.status(403).json({
      error: `Profile Required: Account has not completed a profile for world '${worldHeader}'. Access denied.`,
      requiresProfileCreation: true,
      world: worldHeader,
    });
  }

  req.worldContext = {
    world: worldHeader as WorldType,
    profileId: profile.id,
    accountId,
  };

  next();
}

/**
 * Enforces strict boundary isolation: prevents Socializing context from calling Founders endpoints
 * and vice-versa.
 */
export function enforceWorld(requiredWorld: WorldType) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.worldContext || req.worldContext.world !== requiredWorld) {
      return res.status(403).json({
        error: `Boundary Isolation Violation: Endpoint requires world '${requiredWorld}', but active context is '${req.worldContext?.world}'. Automatic cross-world access is strictly prohibited.`,
      });
    }
    next();
  };
}
