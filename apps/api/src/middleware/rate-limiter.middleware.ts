import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * Lightweight, stdlib-only in-memory rate limiter for sensitive endpoints (auth, registration).
 * Zero external dependencies.
 */
export function createRateLimiter(options: { windowMs: number; max: number; message?: string }) {
  const store = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (record.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  cleanupInterval.unref?.();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown-ip";
    const now = Date.now();
    const record = store.get(ip);

    if (!record || record.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    record.count++;
    if (record.count > options.max) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSec.toString());
      return res.status(429).json({
        error: options.message || "Too many requests. Please try again later.",
        retryAfter: retryAfterSec,
      });
    }

    return next();
  };
}
