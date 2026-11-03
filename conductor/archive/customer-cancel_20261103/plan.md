# Acceptance A — Customer cancel — Implementation Plan

## Phase 1 — Cancellation feature
- [x] Task: Page objects — `OrderHistoryPage.cancel(orderId)` + alert; `FulfilmentPage` knows `Cancelled` and waits for a state (FR1–FR3) 68edef0
  - `waitForTask`/`waitForState` share one refresh-until loop.
- [x] Task: `features/us-09-21-cancellation.feature` + `steps/cancel.steps.ts` (FR1–FR3) 68edef0
  - The past-cancelling case keeps the shopper's history loaded while the operator dispatches in a second page, then cancels from the stale card.
- [x] Task: `OUT_OF_SCOPE` update (FR4) 68edef0
  - Dropped `NO_CANCEL_JOURNEY` and `CANCELLATION_BACKEND`; US-9.3 now points at `verify-void.sh`.
- [x] Task: Checks — `npm test`, lint, `tsc`; reset + seed → full Playwright run 41/41 → `bin/check-stock-ledger` OK.
- [x] Task: Conductor - User Manual Verification 'Phase 1 — Cancellation feature' (Protocol in workflow.md) — scripted (prompt-off): full run above.

## Review
- Spec FR1–FR4 met; matrix shows US-9.1, 9.4, 9.5, 9.8, 21.1, 21.5 covered. Remaining problems (US-9.6, 9.7, …) belong to later catch-up tracks.
