import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { socialRouter } from "./routes/social.routes.js";
import { founderRouter } from "./routes/founder.routes.js";
import { aiRouter } from "./routes/ai.routes.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { worldContextMiddleware } from "./middleware/world.middleware.js";
import { createRateLimiter } from "./middleware/rate-limiter.middleware.js";

export const app = express();

// Security & Parsing Middleware
app.use(helmet());

const defaultAllowedOrigins = [
  "https://balaga.online",
  "https://www.balaga.online",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : defaultAllowedOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, test suites, server-to-server)
      if (!origin) return callback(null, true);
      // In non-production, permit all localhost / dev origins
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      if (configuredOrigins.includes(origin) || configuredOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: origin not allowed"), false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Public & Global Routes
app.use("/api/health", healthRouter);

// Rate limiter for auth endpoints (60 req/min per IP)
const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many authentication requests from this IP. Please try again after 60 seconds.",
});
app.use("/api/auth", authLimiter, authRouter);

// World-Scoped Routes (Enforces authentication THEN world boundary verification)
app.use("/api/social", authMiddleware, worldContextMiddleware, socialRouter);
app.use("/api/founders", authMiddleware, worldContextMiddleware, founderRouter);

// Central Balaga Intelligence Gateway (Milestone 1)
app.use("/api/ai", authMiddleware, worldContextMiddleware, aiRouter);

export default app;

