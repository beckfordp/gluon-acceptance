# Spec — Acceptance 6: Traceability and runner

## Overview
gluon PLAN.md ACC-6.1–6.2: trace the suite back to gluon's `docs/user-stories.md` — every done `US-N.M` task is either accepted by a tagged scenario or explicitly out of scope with a reason — and give gluon a one-command runner, `bin/run-acceptance`. ACC-6.3 (US-20 feature) waits on Checkout Journey 5; US-20 is not built, so it stays open in PLAN.md.

## Functional Requirements
1. **Coverage matrix (pure, `src/coverage.ts`):**
   - parse user-stories task lines (`- [x] US-N.M: title`, `- [ ]` = not built)
   - parse `.feature` files: `@US-N.M` tags on a Feature apply to all its scenarios; tags on a Scenario/Scenario Outline to that one
   - build the matrix: per task → `covered` (scenario titles), `out-of-scope` (reason), `missing` (done, neither), `not built` (open task)
   - problems: done task `missing`; tag naming an unknown or not-built task; out-of-scope entry that's also covered or names an unknown task
   - render Markdown (summary counts + one row per task)
2. **Out-of-scope list (`src/outOfScope.ts`):** id → reason, committed, e.g. US-1.2 (cache not UI-observable), notification emails, events with no UI, US-17.6 (transient), US-4.2 (resilience), retired async paths (US-5.x, US-6.x, ADR 0011)
3. **Tags:** add `@US-N.M` where an existing scenario already observes the task's outcome (e.g. US-3.1 order created, US-4.1 stock reserved, US-11.1 address on confirmation, US-13.1/13.2 card accepted, US-14.1 authorized, US-14.3 capture, US-8.1 history)
4. **CLI** `npm run coverage:matrix` (`node scripts/coverage-matrix.ts`, Node 24 type stripping): reads `${GLUON_DIR:-../..}/docs/user-stories.md` + `features/`, writes `target/coverage-matrix.md`, prints the summary, exits 1 listing problems
5. **`gluon/bin/run-acceptance`:** preflight (OrbStack context, `gluon-local` namespace, Node 24, suite deps installed, :5173 free), coverage matrix, `bddgen` + `playwright test` (extra args passed through, e.g. `--grep @US-17`), inventory snapshot before/after (warn on change), open the HTML report unless `--no-open`; exits with the suite's status

## Non-Functional Requirements
- Pure matrix logic unit-tested (>80% coverage); no new dependencies
- Runner follows `bin/run-perf` conventions (usage header, `FAIL:` preflight messages)

## Acceptance Criteria
- Matrix: 0 missing — every done task covered or out of scope with a reason; CI green
- `bin/run-acceptance` runs the full suite green from gluon root, report opens

## Out of Scope
- ACC-6.3 / US-20 feature (US-20 not built)
- Matrix in CI (user-stories.md lives in the gluon repo, not this one)
