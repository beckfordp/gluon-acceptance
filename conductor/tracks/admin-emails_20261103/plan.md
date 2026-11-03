# Acceptance C — Customer record and email history — Implementation Plan

## Phase 1 — Emails feature
- [x] Task: `AdminConsolePage.emailStatus`; `features/us-27-admin-emails.feature` + `steps/emails.steps.ts` (FR1–FR3) a5b3233
  - The cancel step waits on the order API, not Order History: the "me" branch warms the 60 s history cache before cancelling.
  - Cancels wait for the fulfilment task first (TD-23), as in track B.
- [x] Task: `OUT_OF_SCOPE` update (FR4) 30cd361
- [x] Task: Checks — `npm test` 47/47, lint, `tsc`; reset + seed → full Playwright run 52/52 → `bin/check-stock-ledger` OK.
  - First full run: 10 failures, all ECONNREFUSED — order-service OOMKilled at 384Mi (twice). Logged gluon TD-27; mitigated with 512Mi for order-service only (gluon 649efaf). Rerun green.
- [x] Task: Conductor - User Manual Verification 'Phase 1 — Emails feature' (Protocol in workflow.md) — scripted (prompt-off): full run above.

## Review
- FR1–FR4 met. Matrix problem left: US-28.1 (track D).
