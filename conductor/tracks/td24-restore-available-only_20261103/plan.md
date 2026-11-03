# TD-24 Implementation Plan

## Phase 1 — Available-only stock restore
- [x] Task: `setStock` sends `quantityAvailable` only; restore compares available only (FR1–FR2) — 297fb26
  - [x] Red: `tests/unit/stock.test.ts` — `setStock` PUT body is `{quantityAvailable}`; `sameStock` ignores `quantityReserved`. Confirm failure.
  - [x] Green: `src/api/inventory.ts` `setStock`; export `sameStock` from `src/support/testData.ts`, compare available only.
  - [x] Refactor; coverage.
- [~] Task: Remove teardown stock snapshot/restore (FR2, re-scoped 2026-11-03)
  - [ ] Red: drop `sameStock` tests; confirm suite/typecheck still reference restore code to remove.
  - [ ] Green: remove `snapshotStock`/`restore`/`sameStock` from `TestData`; fixture `stock()` reads `stockFor`; docs/comments.
- [ ] Task: Checks — `npm test`, lint, `tsc --noEmit`; full `bin/run-acceptance` (reset + seed + invariant check) passes.
- [ ] Task: Conductor - User Manual Verification 'Phase 1 — Available-only stock restore' (Protocol in workflow.md)
