# Balaga — Shared Platform Infrastructure Audit Report

**Scope:** Genuinely cross-world infrastructure supporting both Socializing and Founders realms.  
**Auditor Roles:** Principal Software Architect, Senior Backend Engineer, DevOps Engineer  
**Workspace:** `C:\Users\Manjunath H Annigeri\OneDrive\Desktop\antigravity workspace\platform`  
**Production Domain:** [https://balaga.online](https://balaga.online)  
**Strict Invariant:** A shared technical service must never merge Socializing and Founders data, permissions, or user experiences.

---

## 1. Master Identity, Authentication & 18+ Age Assurance

### INFRA-AUTH-01: Master Account & Cryptographic Age Gate
- **Status:** `WORKING_VERIFIED`
- **Frontend File:** `apps/web/src/contexts/AuthContext.tsx`
- **Backend Files:**
  - `apps/api/src/routes/auth.routes.ts`
  - `apps/api/src/middleware/auth.middleware.ts`
  - `apps/api/src/lib/supabase.ts`
- **Database Table:** `public.accounts`
- **Verified Capabilities:**
  - Unified account credential allowing a single user to participate in both Socializing and Founders realms.
  - Cryptographic 18+ Age Verification at registration: user's birthdate is validated against the Unix epoch, strictly rejecting anyone under 18 years of age (`HTTP 400 Bad Request`).
  - Real Supabase Auth JWT bearer token validation (Header: `Authorization: Bearer <token>`).
  - Rejection of forged, expired, or unsigned tokens (`HTTP 401 Unauthorized`).
  - Suspension enforcement: accounts marked `isSuspended: true` are blocked from all endpoints (`HTTP 403 Forbidden`).
  - Dev-Mock Lockout: `x-mock-user` bypass headers are strictly disabled when `NODE_ENV=production`.

### INFRA-AUTH-02: World Switcher & Anti-Spoofing Protocol
- **Status:** `WORKING_VERIFIED`
- **Frontend Files:**
  - `apps/web/src/components/layout/WorldSwitcher.tsx`
  - `apps/web/src/contexts/WorldContext.tsx`
- **Backend File:** `apps/api/src/middleware/world.middleware.ts`
- **Verified Capabilities:**
  - Header Switcher: Top-left navigation pill allows instant switching between "Socializing" and "Founders" realms.
  - Anti-Spoofing Guard: If a client injects `x-platform-world: founders` without having created a `founder_profiles` record, the request is immediately rejected (`HTTP 403 Profile Required`), preventing unvetted identity spoofing.
  - Dedicated Profile Creation Modal: Uninitialized realms trigger an onboarding flow rather than allowing silent data access.

---

## 2. World Isolation & Security Middleware

### INFRA-SEC-01: Boundary Context Middleware
- **Status:** `WORKING_VERIFIED`
- **Backend File:** `apps/api/src/middleware/world.middleware.ts`
- **Verified Capabilities:**
  - Mandatory `x-platform-world` verification on every protected route.
  - Missing header returns `HTTP 400 Bad Request`.
  - Calling a Founders route with `x-platform-world: socializing` returns `HTTP 403 Boundary Isolation Violation`.
  - Calling a Socializing route with `x-platform-world: founders` returns `HTTP 403 Boundary Isolation Violation`.

### INFRA-SEC-02: Network Defense & Rate Limiting
- **Status:** `WORKING_VERIFIED`
- **Backend Files:**
  - `apps/api/src/middleware/rate-limiter.middleware.ts`
  - `apps/api/src/app.ts`
- **Verified Capabilities:**
  - Helmet security headers: Content Security Policy (CSP), Strict Transport Security (HSTS), and frameguards.
  - Production CORS whitelist: strictly restricted to `balaga.online`, `balagaonline.vercel.app`, and authorized preview origins.
  - IP-based sliding window rate limiter: 60 requests/minute for authentication; 120 requests/minute for feed endpoints.

---

## 3. Balaga Intelligence Shared Infrastructure (Milestones 1–8)

The Balaga Intelligence platform provides shared AI foundation without permitting cross-world private data bleed:

### INFRA-AI-01: Central AI Gateway (`/api/ai/query`)
- **Status:** `WORKING_VERIFIED`
- **Backend Files:**
  - `apps/api/src/services/ai-gateway.service.ts`
  - `apps/api/src/routes/ai.routes.ts`
- **Verified Capabilities:**
  - World-scoped execution: request must supply `x-platform-world` matching query intent.
  - Model routing with multi-provider abstraction (Gemini, OpenAI, Claude).
  - Deterministic Indian Intelligence Engine fallback: operates locally at ₹0 cost, zero network latency, and zero external data export when cloud keys are unconfigured.
  - AbortSignal timeout enforcement (15s limit) with automatic retry policy.

### INFRA-AI-02: Zero-Leakage AI Context Isolator
- **Status:** `WORKING_VERIFIED`
- **Backend File:** `apps/api/src/services/ai-gateway.service.ts`
- **Verified Capabilities:**
  - Context Isolation Assertion (`assertContextIsolation()`):
    - Socializing queries attempting to ingest cap table, equity, or SAFE note terms are rejected (`HTTP 403`).
    - Founders queries attempting to ingest private social circles or dating profiles are rejected (`HTTP 403`).

### INFRA-AI-03: AI Consent & Activity History Registry
- **Status:** `WORKING_VERIFIED`
- **Backend File:** `apps/api/src/services/ai-gateway.service.ts`
- **Verified Capabilities:**
  - Independent user consent toggles for Social AI and Founders AI.
  - Revoking consent immediately blocks all subsequent AI queries with `HTTP 403 Consent Revoked`.
  - Timestamped audit log tracking model version, token consumption, and INR cost calculations.

### INFRA-AI-04: Consequential Action Gate
- **Status:** `WORKING_VERIFIED`
- **Backend File:** `apps/api/src/services/ai-gateway.service.ts`
- **Verified Capabilities:**
  - Actions that affect external state (e.g. posting an event announcement, moderating a member, or scheduling a sprint) are generated with `status: pending_approval`.
  - Actions cannot execute without explicit human approval via `/api/ai/actions/:id/approve`.

### INFRA-AI-05: Intelligence Control Centre Modal
- **Status:** `WORKING_VERIFIED`
- **Frontend File:** `apps/web/src/components/IntelligenceControlModal.tsx`
- **Verified Capabilities:**
  - World-aware task selector: shows Socializing tasks (Captions, Digests, Organizers) when in Social realm; shows Founders tasks (Market Research, Task Breakdowns, Deadlines) when in Founders realm.
  - Zero-Leakage Shield status badge displayed in real-time.
  - Real-time token counter and INR cost estimator.

---

## 4. UI Utilities & Progressive Web App (PWA)

### INFRA-UI-01: Global Command Palette (`CommandPaletteModal.tsx`)
- **Status:** `WORKING_VERIFIED`
- **Frontend File:** `apps/web/src/components/CommandPaletteModal.tsx`
- **Verified Capabilities:**
  - Triggered globally via `Ctrl+K` or `Cmd+K`.
  - Instant search filtering across all 35+ tabs and features.
  - One-tap world switching and navigation jumping.

### INFRA-UI-02: Progressive Web App (PWA) Suite
- **Status:** `WORKING_VERIFIED`
- **Frontend Files:**
  - `apps/web/public/manifest.webmanifest`
  - `apps/web/public/sw.js`
  - `apps/web/public/icon.svg`
- **Verified Capabilities:**
  - Web App Manifest: standalone display mode, theme colors, and icons.
  - Service Worker (`sw.js`): offline caching of static assets and shell UI.
  - Verified HTTP 200 response on production endpoints.

---

## 5. Deployment Topology & Build Optimization

### INFRA-OPS-01: Vercel Frontend & Realm Code Splitting
- **Status:** `WORKING_VERIFIED`
- **Configuration Files:** `apps/web/vite.config.ts`, `apps/web/vercel.json`
- **Verified Capabilities:**
  - Rollup `manualChunks` enforce realm-level chunking:
    - `realm-socializing.js`: ~444 kB
    - `realm-founders.js`: ~895 kB
    - `vendor-react.js`: ~141 kB
    - `vendor-supabase.js`: ~228 kB
    - `vendor-icons.js`: ~62 kB
  - SPA Rewrites: scoped to `/index.html` avoiding asset hijacking.

### INFRA-OPS-02: Render Backend Service
- **Status:** `WORKING_VERIFIED`
- **Configuration File:** `render.yaml`
- **Production URL:** `https://balaga-online.onrender.com`
- **Verified Capabilities:**
  - Node.js 20 runtime with targeted TypeScript compilation (`npm run build:api`).
  - `/api/health` heartbeat endpoint returning HTTP 200.
