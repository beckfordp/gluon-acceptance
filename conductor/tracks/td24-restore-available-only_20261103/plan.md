# TD-24 Implementation Plan

## Phase 1 — Available-only stock restore
- [x] Task: `setStock` sends `quantityAvailable` only; restore compares available only (FR1–FR2) — 297fb26
  - [x] Red: `tests/unit/stock.test.ts` — `setStock` PUT body is `{quantityAvailable}`; `sameStock` ignores `quantityReserved`. Confirm failure.
  - [x] Green: `src/api/inventory.ts` `setStock`; export `sameStock` from `src/support/testData.ts`, compare available only.
  - [x] Refactor; coverage.
- [x] Task: Remove teardown stock snapshot/restore (FR2, re-scoped 2026-11-03) — 20b4e71
  - [x] Red: drop `sameStock` tests; confirm suite/typecheck still reference restore code to remove.
  - [x] Green: remove `snapshotStock`/`restore`/`sameStock` from `TestData`; fixture `stock()` reads `stockFor`; docs/comments.
- [x] Task: Checks — `npm test`, lint, `tsc --noEmit`; full `bin/run-acceptance` (reset + seed + invariant check) passes. — no code change. 47/47 unit, lint, tsc clean. Full run after `bin/reset-data`: **ledger invariant OK (0 drift)**; Playwright 22 passed / 14 failed — all 14 pre-existing, unrelated: since ADM-9 gshop requires a guest email at signed-out checkout and the suite's checkout page object doesn't fill it. `bin/run-acceptance` itself stops earlier at the coverage-matrix gate (pre-existing: US-9.6/9.7, US-21.2–21.5 done without scenario or out-of-scope note), so the run used its steps directly.
- [x] Task: Conductor - User Manual Verification 'Phase 1 — Available-only stock restore' (Protocol in workflow.md)
