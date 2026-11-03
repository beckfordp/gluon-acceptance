# Acceptance B — Operator order console and expiry — Implementation Plan

## Phase 1 — Console feature
- [x] Task: `AdminConsolePage` page object + `adminConsole` fixture; `CheckoutPage` remembers the guest email it filled (FR1–FR4) 15e3649
  - Also carries the Customers-tab methods track C uses.
- [x] Task: `features/us-24-25-admin-orders.feature` + `steps/admin.steps.ts` (FR1–FR4) 15e3649
  - First run: operator cancel within 1 s of checkout reached fulfilment before `PaymentAuthorized` made the task, so it stayed Pending — gluon TD-23. Cancel/expire scenarios now wait for fulfilment `PENDING` first, as an operator would; commented in the feature.
- [x] Task: `OUT_OF_SCOPE` update (FR5) def9a3c
  - `EXPIRY` gone; `RACE` (US-9.6, 21.2–21.4), `NO_FLAG` (US-26.1, 26.3), plus US-9.7, 22.1, 22.3, 26.2.
- [x] Task: Checks — `npm test` 47/47, lint, `tsc`; reset + seed → full Playwright run 45/45 → `bin/check-stock-ledger` OK.
- [x] Task: Conductor - User Manual Verification 'Phase 1 — Console feature' (Protocol in workflow.md) — scripted (prompt-off): full run above.

## Review
- FR1–FR5 met. Matrix problems left: US-27.1, 27.2, 27.4 (track C), US-28.1 (track D).
- Backlog "Acceptance 7: US-20 authorization expiry" is now covered (Expire action) — struck.
