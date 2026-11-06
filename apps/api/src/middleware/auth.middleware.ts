import { Request, Response, NextFunction } from "express";
import { verifySupabaseToken } from "../lib/supabase.js";
import { accountsStore } from "../services/store.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  is18PlusVerified: boolean;
  subscriptionTier: "free" | "premium";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Real Supabase JWT Authentication Middleware
 * Validates cryptographically signed tokens, enforces account status and security restrictions.
 * Never accepts arbitrary or forged bearer tokens!
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // 1. Check for missing Authorization header
  if (!authHeader) {
    // Development / Test only mock fallback (strictly disabled in production)
    const isProd = process.env.NODE_ENV === "production";
    const allowDevMock = !isProd && (process.env.ENABLE_DEV_MOCK_AUTH === "true" || req.headers["x-mock-user"] === "true");

    if (allowDevMock) {
      const mockId = (req.headers["x-mock-account-id"] as string) || "00000000-0000-0000-0000-000000000001";
      const account = accountsStore.get(mockId);
      req.user = {
        id: mockId,
        email: account?.email || (mockId.endsWith("2") ? "priya.art@platform.local" : "founder.dev@platform.local"),
        is18PlusVerified: account?.is18PlusVerified ?? true,
        subscriptionTier: account?.subscriptionTier || "free",
      };
      return next();
    }

    return res.status(401).json({
      error: "Unauthorized: Missing Authorization header. Real Supabase bearer token required.",
    });
  }

  // 2. Validate Authorization header format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized: Malformed Authorization header. Expected 'Bearer <token>'.",
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: "Unauthorized: Empty bearer token.",
    });
  }

  try {
    // 3. Cryptographic token verification via Supabase Auth
    const { user: verifiedUser, error } = await verifySupabaseToken(token);

    if (error || !verifiedUser) {
      return res.status(401).json({
        error: `Unauthorized: ${error || "Invalid or rejected authentication token."}`,
      });
    }

    // 4. Derive identity strictly from validated claims (never from request body or client headers!)
    const validatedAccountId = verifiedUser.id;
    const account = accountsStore.get(validatedAccountId);

    if (account?.isSuspended) {
      return res.status(403).json({
        error: "Forbidden: Account has been suspended by administration.",
      });
    }

    req.user = {
      id: validatedAccountId,
      email: verifiedUser.email || account?.email || "user@platform.local",
      is18PlusVerified: account?.is18PlusVerified ?? false,
      subscriptionTier: account?.subscriptionTier || "free",
    };

    return next();
  } catch (err: any) {
    console.error("[AuthMiddleware] Token verification exception:", err.message);
    return res.status(401).json({
      error: "Unauthorized: Authentication verification failed.",
    });
  }
}
