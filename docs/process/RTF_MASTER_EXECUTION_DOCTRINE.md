# RTF Master Execution Doctrine (Work Ethic Standard)

This doctrine is the default operating system for building this app.
If a task conflicts with this order, this order wins.

## 1) Strategic Order of Operations (Non-Negotiable)
1. Identity & Ownership
2. Deterministic Core Protection
3. Persistence Trust & Sync Visibility
4. Build + CI Hardening
5. Multi-Device Safety
6. Monetization
7. Scale Optimization

Any task outside the active phase is deferred.

---

## 2) Phased Roadmap

## Phase 1 — Trust Foundation
### Objectives
- Authenticated users only
- No client-trusted identity
- RLS enforced
- Build fails on unsafe code

### Deliverables
- Supabase Auth implemented
- `userId` removed from client payload trust path
- API derives user from session
- `401` on unauthenticated routes
- TypeScript and ESLint enforced in release path

### Definition of Done
- Identity spoofing blocked
- Build safety bypass removed
- Manual attack attempts fail

## Phase 2 — Deterministic Core Lockdown
### Objectives
- Progression engine test-protected
- Edge cases documented
- No silent behavior

### Deliverables
- Unit tests for `resolveSessionRpe`, `applySteppedLoadChange`, `calculateNextWeight`
- Edge-case matrix documented
- >=90% coverage for progression module

### Definition of Done
- Logic regressions fail tests
- Deterministic behavior verified

## Phase 3 — Persistence Integrity
### Objectives
- No silent desync
- Explicit sync state
- Conflict detection

### Deliverables
- `syncStatus` exposed to UI
- `updatedAt` conflict detection
- `409` on stale save attempts
- Visible last-sync timestamp

### Definition of Done
- Network/sync failures are user-visible
- Multi-device overwrite protection in place

## Phase 4 — CI + Deployment Discipline
### Objectives
- No broken code reaches production
- Predictable releases

### Deliverables
- CI gates: lint, typecheck, test, build
- PR-required merges
- 30-minute post-deploy verification script
- Rollback runbook

### Definition of Done
- Every merge auto-validated
- Deployment surprise risk minimized

## Phase 5 — Monetization Layer
Only starts after trust layers are stable.

### Deliverables
- Stripe subscriptions
- Webhook verification
- Server-side subscription state
- Server-side entitlement checks
- Beta pricing model

---

## 3) Mandatory Codex Execution Loop (Every Task)
1. Scope first (objective, acceptance criteria, risks, files, <=6 steps, no code)
2. Surgical implementation (minimal diff, no drift)
3. Targeted test plan
4. Adversarial self-review
5. Release gate decision (BLOCK/SHIP)

Critical ambiguity = BLOCK.

---

## 4) PR Discipline
Every PR must include:
- Objective (1 sentence)
- Acceptance criteria
- Validation output (lint/typecheck/test/build)
- Manual test results
- Risk assessment
- Rollback plan

No checklist = no merge.

---

## 5) Weekly Cadence
- Monday: one objective aligned with active phase
- Tuesday–Thursday: small PRs only
- Friday: adversarial review across merged diffs + risk register update

---

## 6) Quality Bar (Absolute)
A change is complete only if:
1. Acceptance criteria satisfied
2. No silent failure path introduced
3. Deterministic behavior preserved
4. Validation commands pass
5. Diff is minimal and explainable
6. Rollback path exists

---

## 7) Founder Oversight Filter
Approve work only if it improves at least one:
- Data trust
- Revenue protection
- User retention
- Deployment predictability

If none apply, defer.

---

## 8) Current Risk Priority Map
### Critical
- Auth not fully enforced
- Client-trusted identity
- Build safety bypass
- No conflict protection

### Medium
- Instance-local rate limiting
- Limited integration tests

### Low
- UI polish
- AI tuning
