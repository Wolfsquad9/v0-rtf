# RTF App Audit Report (Code + Infrastructure)

## 1) Executive scorecard (100-point framework)

| Area | Weight | Current score | Why it scored this way |
|---|---:|---:|---|
| Product clarity & value proposition | 15 | 12 | Core proposition is clear: a 12-week planner + AI coach. |
| UX flow & beginner friendliness | 20 | 10 | Feature-rich, but currently dense for first-time users and lacks explicit guided empty-state journeys. |
| Training science quality | 15 | 11 | Good RPE/progression foundations and future session projection hooks are present. |
| Reliability & state safety | 15 | 10 | Dual storage strategy (local + Supabase fallback) is solid, but there is no automated test suite. |
| Security & privacy posture | 10 | 6 | Basic API validation/rate limit exist, but identity is browser-generated and in-memory limits are instance-local. |
| Performance & scalability | 10 | 6 | React context + large client state works for now; server limits/cache are process-local and no formal perf budgets observed. |
| Observability & ops readiness | 10 | 5 | Some console diagnostics and Vercel analytics, but no structured logging, SLOs, or error tracking platform. |
| Engineering maturity (CI/tests/code health) | 5 | 2 | Typecheck passes; lint setup is incomplete (interactive) and no CI pipeline in repo. |

**Overall score: 62 / 100 (promising foundation, not yet top-tier).**

---

## 2) Most precise measurable metrics gathered

### Codebase size and composition
- TypeScript files (`.ts`): **17 files / 1,220 LOC**.
- TSX files (`.tsx`): **33 files / 2,618 LOC**.
- JavaScript files (`.js`): **4 files / 1,723 LOC**.
- CSS files: **2 files / 237 LOC**.
- Total tracked app code/docs measured in this pass: **5,798 LOC**.

### Dependency surface
- Runtime dependencies: **60**.
- Dev dependencies: **8**.
- UI stack is broad (many Radix packages + shadcn patterns), which helps speed of building but increases maintenance/update surface.

### Build quality signals (local checks)
- `pnpm exec tsc --noEmit` ✅ **Pass**.
- `pnpm lint` ⚠️ **Blocked by interactive ESLint setup prompt** (no committed eslint config yet).
- `pnpm build` ⚠️ **Fails in this environment due to fetching Google Geist fonts** from `next/font/google`.

---

## 3) Architecture assessment

### What is strong today
1. **Clear app architecture and domain model**
   - Strong typed planner state with week/day/exercise primitives and progression framework metadata.
2. **Smart resilience pattern**
   - State is saved locally first and then synced in background to server DB endpoint.
3. **AI safety baseline**
   - AI route has validation, sanitization, timeout, and demo-mode fallback behavior.
4. **Fitness-specific depth**
   - RPE, progression logic, weekly review, habits, and recovery are aligned with real training workflows.

### What blocks “top-tier app” status
1. **Onboarding friction for beginners**
   - App starts with many controls; fewer guided "first workout in 3 taps" paths.
2. **Testing gap**
   - No repository-level unit/integration/e2e test pipeline to protect changes.
3. **Operational maturity gap**
   - No explicit CI workflow, no error tracking (e.g., Sentry), and no production health dashboards.
4. **Identity and multi-device trust gap**
   - Browser-generated user ID helps quick start but is weak for robust account continuity.
5. **Scalability/security gap**
   - In-memory rate limiting/caching is not globally shared across instances.

---

## 4) Breakthrough strategy (from good app → category-leading app)

## North-star product principle
**"Coach-level personalization with zero overwhelm."**

### 4.1 Product moves (highest impact)
1. **Beginner-first mode (default)**
   - 5-minute onboarding wizard: goal, equipment, experience level, schedule.
   - Auto-generate a "Week 1 Starter Plan" with just 3 key metrics shown.
2. **Adaptive coach timeline**
   - Daily single-card recommendation: "Do this today" + one reason + one fallback option.
3. **Confidence loops**
   - Weekly "scoreboard" with streaks, readiness trend, and 1 suggested adjustment.
4. **Habit automation**
   - Auto-detect missed sessions and offer "recovery week" templates.

### 4.2 Engineering moves (must-have)
1. **CI quality gate in GitHub**
   - On PR: install, typecheck, lint, unit tests, and build smoke test.
2. **Testing pyramid**
   - Unit tests for progression and validation logic.
   - Integration tests for API routes (AI + DB endpoints).
   - E2E test for the core "plan -> log -> coach insight" user path.
3. **Observability stack**
   - Add Sentry (frontend + API routes), structured JSON logs, and health/latency dashboards.
4. **Security hardening**
   - Replace anonymous browser ID with real auth (Supabase Auth).
   - Move rate limiting to shared storage (Upstash/Redis or edge-compatible strategy).
5. **Reliability upgrades**
   - Add schema versioning/migrations for planner state.
   - Add idempotent DB writes with conflict-safe merge semantics.

### 4.3 UX moves (streamlined experience)
1. **Progressive disclosure**
   - Hide advanced settings behind "Advanced" drawer.
2. **One-screen daily workflow**
   - "Today" screen with: session card, RPE selector, done button, coach output.
3. **Reduce cognitive load**
   - Prioritize 3 metrics: consistency, readiness, progressive overload.
4. **Human language everywhere**
   - Replace jargon with beginner-friendly helper text and examples.

---

## 5) 30/60/90-day execution roadmap

### First 30 days (Foundation)
- Ship guided onboarding + beginner mode.
- Add ESLint config + CI workflow + baseline unit tests.
- Fix build portability by avoiding runtime Google font fetch dependency in restricted environments.

### Days 31-60 (Intelligence)
- Add readiness scoring and recommendation card.
- Add session quality feedback loop ("too easy / just right / too hard") to tune progression.
- Add event tracking for funnel metrics.

### Days 61-90 (Scale)
- Add authentication and secure multi-device sync.
- Roll out shared rate limiting and cache infrastructure.
- Publish quality dashboard (errors, p95 API latency, onboarding completion, 4-week retention).

---

## 6) Beginner-friendly help: how you should work day-to-day

Because you are a beginner, use this operating model:

1. **One source of truth:** GitHub issues + a simple roadmap board.
2. **One branch per feature:** Keep pull requests small (200-400 lines when possible).
3. **One quality rule:** Never merge without typecheck + tests + build smoke.
4. **One product rule:** Every feature must reduce user effort or increase adherence.
5. **One weekly ritual:** Friday review with 3 metrics: activation, retention, bug count.

### Your current tool stack (VS Code + GPT + GitHub + Codex) is enough
You do **not** need more tools to start. Add only:
- **Sentry** for errors,
- **GitHub Actions** for CI,
- **PostHog or Vercel Analytics events** for product usage insights.

---

## 7) Final verdict

Your app already has meaningful value and stronger fitness logic than many early products. The fastest path to a breakthrough is **not** adding dozens of new features; it is:
1) beginner-first UX simplification,
2) production-grade quality gates,
3) adaptive coaching that feels personal every day.

If executed, this can move from **62/100** to **85+/100** in one focused quarter.
