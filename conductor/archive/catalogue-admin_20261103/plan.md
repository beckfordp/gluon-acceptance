# Acceptance D — Catalogue stock — Implementation Plan

## Phase 1 — Catalogue feature
- [x] Task: `CatalogueAdminPage` + `catalogueAdmin` fixture; `features/us-28-catalogue-admin.feature` + `steps/catalogue-admin.steps.ts` (FR1–FR2) 9abfdbb
- [x] Task: Checks — `npm test`, lint, `tsc`; `bin/run-acceptance --no-open` (matrix gate on): matrix no problems (60 covered, 25 out of scope, 0 missing), 53/53, ledger OK.
  - First gated run: "Cancelling while Packed" failed — the step navigated 35 ms after Confirm cancel, aborting the `PATCH`. `OrderHistoryPage.cancel` and the console actions now wait for their outcome (f1e1680). Rerun green.
- [x] Task: Conductor - User Manual Verification 'Phase 1 — Catalogue feature' (Protocol in workflow.md) — scripted (prompt-off): gated run above.

## Review
- FR1–FR2 met. Catch-up step 3 complete: coverage-matrix gate green for the first time since ADM work.
