# Acceptance A — Customer cancel — Implementation Plan

## Phase 1 — Cancellation feature
- [ ] Task: Page objects — `OrderHistoryPage.cancel(orderId)` + alert; `FulfilmentPage` knows `Cancelled` and waits for a state (FR1–FR3)
- [ ] Task: `features/us-09-21-cancellation.feature` + `steps/cancel.steps.ts` (FR1–FR3)
- [ ] Task: `OUT_OF_SCOPE` update (FR4)
- [ ] Task: Checks — `npm test`, lint, `tsc`; reset + seed → full Playwright run → `bin/check-stock-ledger`
- [ ] Task: Conductor - User Manual Verification 'Phase 1 — Cancellation feature' (Protocol in workflow.md) — scripted (prompt-off)
