# TD-24 Implementation Plan

## Phase 1 — Available-only stock restore
- [x] Task: `setStock` sends `quantityAvailable` only; restore compares available only (FR1–FR2) — 297fb26
  - [x] Red: `tests/unit/stock.test.ts` — `setStock` PUT body is `{quantityAvailable}`; `sameStock` ignores `quantityReserved`. Confirm failure.
  - [x] Green: `src/api/inventory.ts` `setStock`; export `sameStock` from `src/support/testData.ts`, compare available only.
  - [x] Refactor; coverage.
- [~] Task: Checks — `npm test`, lint, `tsc --noEmit`; full acceptance run on a reset+seeded cluster; drift SQL → 0 rows.
- [ ] Task: Conductor - User Manual Verification 'Phase 1 — Available-only stock restore' (Protocol in workflow.md)
