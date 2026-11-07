# Balaga — Bugs & Remediation Log

**Scope:** Defect Discovery, Root-Cause Analysis, Remediation Actions, and Regression Verification  
**Auditor Roles:** Senior Full-Stack Engineer, QA Lead  
**Workspace:** `C:\Users\Manjunath H Annigeri\OneDrive\Desktop\antigravity workspace\platform`  

---

## 1. Remediation Summary Table

| Defect ID | Severity | Component | Root Cause | Remediation Applied | Test Verification | Status |
|---|---|---|---|---|---|---|
| `DEF-01` | High | `WorldLayout.tsx` | `useEffect` included `currentTab` in dependency array, resetting tabs back to `"feed"` within 1ms of click | Ref-guarded transition `prevWorldRef.current !== activeWorld` | Playwright Test 9 | ✅ `RESOLVED` |
| `DEF-02` | Medium | `SocialFeed.tsx` | Post creation in `CreateMediaModal` did not dispatch event to update active feed list | Decoupled event bus via `window.dispatchEvent(new CustomEvent("balaga:new-post"))` | Manual & E2E verification | ✅ `RESOLVED` |
| `DEF-03` | Low | `Header.tsx` | "Saved Posts" profile menu item dispatched `"feed"` instead of `"saved"` | Corrected call to `handleMenuClick("saved")` | Code inspection & navigation test | ✅ `RESOLVED` |
| `DEF-04` | Medium | `vite.config.ts` | Monolithic 1.45 MB bundle created performance overhead and risk of cross-realm code leakage | Added Rollup `manualChunks` splitting into `realm-socializing` and `realm-founders` | Vite build bundle audit | ✅ `RESOLVED` |
| `DEF-05` | Low | `e2e/dual_world_flows.spec.ts` | E2E selectors did not match refined button texts (e.g. `Start a Circle` vs `Create Circle`) | Aligned Playwright locators to live DOM placeholders and headers | `npx playwright test` (9/9 passed) | ✅ `RESOLVED` |
| `DEF-06` | Low | `tests/verify_ai_isolation.ts` | Test checked obsolete property `proposedAction.type` instead of `proposedAction.actionType` | Aligned property names and string matchers with `ai-gateway.service.ts` | `npx tsx tests/verify_ai_isolation.ts` (24/24 passed) | ✅ `RESOLVED` |

---

## 2. Detailed Technical Root-Cause Analyses

### DEF-01: Tab Trapping Loop in WorldLayout
- **Symptom:** User clicked on Explore, Reels, Circles, or Events in the Socializing sidebar, but the UI stayed on the Feed.
- **Root Cause:**
  ```typescript
  // Flawed implementation:
  useEffect(() => {
    setCurrentTab(isSocial ? "feed" : "dashboard");
  }, [activeWorld, isSocial, currentTab]); // currentTab in deps triggered immediate reset!
  ```
- **Remediation:**
  ```typescript
  // Fixed ref-guarded implementation:
  const prevWorldRef = React.useRef(activeWorld);
  useEffect(() => {
    if (prevWorldRef.current !== activeWorld) {
      prevWorldRef.current = activeWorld;
      setCurrentTab(isSocial ? "feed" : "dashboard");
    }
  }, [activeWorld, isSocial]);
  ```
- **Verification:** Verified in Playwright Test 9 (`Socializing Navigation: All sidebar tabs switch views seamlessly`).

---

### DEF-02: Missing Real-Time Feed Post Synchronization
- **Symptom:** Submitting a new post inside `CreateMediaModal` closed the modal, but the post was not displayed at the top of the feed until manual page refresh.
- **Root Cause:** `CreateMediaModal` wrote to `localStorage` without notifying `SocialFeed` to refresh its active state array.
- **Remediation:**
  1. `CreateMediaModal.tsx` dispatches `new CustomEvent("balaga:new-post", { detail: newPost })`.
  2. `SocialFeed.tsx` registers a listener on `window` for `"balaga:new-post"` and unshifts the incoming post to `posts` state, displaying a confirmation toast.

---

### DEF-04: Monolithic Bundle Chunking
- **Symptom:** Initial page bundle size warning: `dist/assets/index.js 1,455.61 kB`.
- **Root Cause:** Vite default configuration bundled both Socializing and Founders components into a single chunk.
- **Remediation:** Configured `manualChunks` in `apps/web/vite.config.ts`:
  ```typescript
  manualChunks: {
    "realm-socializing": ["./src/features/socializing"],
    "realm-founders": ["./src/features/founders"],
    "vendor-react": ["react", "react-dom"],
    "vendor-supabase": ["@supabase/supabase-js"],
    "vendor-icons": ["lucide-react"]
  }
  ```
- **Outcome:** Clean bundle segmentation: `realm-socializing.js` (444 kB), `realm-founders.js` (895 kB).

---

## 3. Outstanding Non-Blocking Advisories

1. **Render Free-Tier Cold Starts:** First API request after 15 minutes of inactivity experiences a ~35-50s spin-up delay. This is an expected cloud hosting tier constraint, not an application code bug.
2. **Supabase Remote Synchronization:** When testing in environments without valid `SUPABASE_SERVICE_ROLE_KEY` environment variables, the backend automatically and safely routes all persistence through the atomic local file store (`.data/platform_storage.json`).
