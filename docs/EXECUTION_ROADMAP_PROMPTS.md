# RTF Execution Roadmap + Exact Prompting Playbook

## Objective
Create a strict execution system so the app reaches high trust, high reliability, and production-grade quality with predictable progress.

---

## 1) Strategy Roadmap (phased, outcome-first)

## Phase 0 — Delivery Operating System (Week 1)
**Goal:** Stop random changes; enforce predictable shipping.

### Outcomes
- Every task has scope, acceptance criteria, and rollback plan.
- Every PR has reproducible validation output.
- No merges without passing checks.

### Required outputs
- PR checklist template.
- Issue template for bug vs feature vs hardening.
- Release checklist (pre-deploy + post-deploy).

### Definition of done
- Build passes in CI and local.
- Typecheck passes.
- No hidden config drift.

---

## Phase 1 — Correctness and Safety Baseline (Weeks 2–3)
**Goal:** Make core planner logic and persistence trustworthy.

### Outcomes
- Progression logic deterministic under all known edge cases.
- State save/load behavior predictable during refresh, reconnect, and partial failure.
- Failure handling explicit (no silent ambiguity where user trust is impacted).

### Required outputs
- Unit tests for progression boundaries and stepping.
- Integration tests for save/load API routes.
- Risk register mapping each failure mode to expected behavior.

### Definition of done
- Core tests green.
- Documented behavior for missing/malformed inputs.
- Verified no schema drift introduced.

---

## Phase 2 — Production Readiness Hardening (Weeks 4–5)
**Goal:** Eliminate ship blockers related to trust and environment stability.

### Outcomes
- Configuration is explicit and environment-safe.
- Build behavior is deterministic across deployment environments.
- Operational visibility exists for critical errors.

### Required outputs
- Environment matrix (dev/staging/prod required vars and defaults).
- Deploy runbook with rollback steps.
- Error taxonomy (user-facing vs internal).

### Definition of done
- No critical deploy-time surprises.
- Clear operational playbook for incidents.

---

## Phase 3 — UX Reliability for Real Users (Weeks 6–7)
**Goal:** Ensure users can complete primary flows without confusion or state loss.

### Outcomes
- Primary workflow can be completed without hidden assumptions.
- Empty states, loading states, and error states are explicit.
- Session continuity behavior is predictable.

### Required outputs
- Primary-flow test script (manual + e2e where applicable).
- UX state map (loading/empty/error/success for critical screens).
- Regression checklist for each release.

### Definition of done
- New users complete core flow without intervention.
- No critical UX dead-ends.

---

## Phase 4 — Scale Confidence Loop (Week 8+)
**Goal:** Move from reactive fixes to measurable quality improvement.

### Outcomes
- Weekly reliability review with action items.
- Recurring defect classes reduced release-over-release.

### Required outputs
- Weekly quality report.
- Open risk burndown list.

### Definition of done
- Quality trend is stable or improving over multiple releases.

---

## 2) Exact Prompting System (copy/paste)

Use these prompts exactly, in order.

## Prompt A — Task Scoping (before coding)
```text
You are my senior engineer. Scope this task with zero assumptions.

Task:
<PASTE TASK>

Output format:
1) Objective (1 sentence)
2) In-scope
3) Out-of-scope
4) Risks and unknowns
5) Acceptance criteria (binary, testable)
6) Files likely touched
7) Minimal implementation plan (max 6 steps)

Rules:
- Do not write code.
- Do not add features not requested.
- If ambiguous, list explicit assumptions.
```

## Prompt B — Surgical Implementation
```text
Implement only the scoped plan.

Constraints:
- Minimal diff.
- Preserve existing behavior unless required by acceptance criteria.
- No schema changes unless explicitly approved.
- No temporary hacks, TODOs, or debug logs.

Execution requirements:
- Update only necessary files.
- Run local validation commands.
- Provide concise change summary with file-level reasoning.
```

## Prompt C — Adversarial Review (after coding)
```text
Perform an adversarial code review of your own diff.

Output:
1) Correctness risks
2) Determinism risks
3) State/data integrity risks
4) Edge cases not covered
5) Deployment/config risks
6) Exact fixes required before merge

Rules:
- Be strict.
- No optimism.
- If untestable, mark untestable.
```

## Prompt D — Test Plan Generation
```text
Generate a targeted test plan for this exact diff.

Output:
1) Unit tests to add/run
2) Integration tests to add/run
3) Manual test script (step-by-step)
4) Expected results per test
5) Failure signatures to watch for

Rules:
- No generic tests.
- Only tests relevant to changed code paths.
```

## Prompt E — Pre-Deploy Gate
```text
Act as release gatekeeper.

Given this change, decide:
- BLOCK or SHIP

Output:
1) Gate decision
2) Blocking reasons (if any)
3) Required fixes
4) Post-deploy checks (first 15 minutes)

Rules:
- If any critical ambiguity exists, choose BLOCK.
```

## Prompt F — Post-Deploy Verification
```text
Build a 30-minute post-deploy verification checklist for this release.

Output:
1) Minute 0-5 checks
2) Minute 5-15 checks
3) Minute 15-30 checks
4) Rollback triggers
5) Communication template if rollback occurs
```

---

## 3) Weekly Execution Cadence

- **Monday:** pick 1 high-impact objective only.
- **Tuesday–Thursday:** ship small verified PRs against objective.
- **Friday:** run adversarial review + incident/risk review; update next week plan.

Use Prompt C every Friday against all merged diffs of that week.

---

## 4) Quality Bar (non-negotiable)

A change cannot be considered complete unless:
1. Acceptance criteria are all satisfied.
2. Validation commands pass.
3. Failure behavior is defined for invalid/missing inputs.
4. No hidden side effects were introduced.
5. Diff is minimal and explainable.

---

## 5) Fast Start (today)

Use this exact sequence today:
1. Run Prompt A on your top blocker.
2. Run Prompt B to implement.
3. Run Prompt D to verify.
4. Run Prompt C for adversarial review.
5. Run Prompt E for go/no-go decision.

This gives you a deterministic loop from idea → safe release.

---

## 6) Governance Source of Truth

This playbook is governed by:
- `docs/process/RTF_MASTER_EXECUTION_DOCTRINE.md`
- `.github/pull_request_template.md`
- `docs/process/RELEASE_GATE_CHECKLIST.md`
- `docs/process/WEEKLY_EXECUTION_RHYTHM.md`

If any prompt output conflicts with the doctrine, follow the doctrine.
