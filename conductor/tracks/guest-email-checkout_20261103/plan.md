# Guest email at checkout — Implementation Plan

## Phase 1 — Green suite
- [x] Task: Fill the guest email at signed-out checkout (FR1–FR2) fdd4acf
  - [x] Red: run the 14 failing scenarios; confirm they stop on "Enter an email address for order updates".
  - [x] Green: `CheckoutPage.guestEmail` + `fillShipping(address)` (guest email when shown, then shipping); steps use it.
- [x] Task: FulfilmentPage drives Admin's collapsible Fulfilment section (found during checks) ee17fd3
  - gshop 2b3111c removed "Open order processing"; open via Admin → Show fulfilment, scope to the Fulfilment region.
  - `waitForTask` waits for Refresh to settle — an in-flight fetch overwrote the next action with stale state.
- [x] Task: Checks — `npm test` 47/47, lint, `tsc`; reset + seed → full Playwright run 36/36 → `bin/check-stock-ledger` OK.
  - Needed gluon chart probe fix (startupProbe, liveness timeout 5s): order-service was liveness-killed under load.
  - Logged gluon TD-26: fulfilment drops `PaymentAuthorized` when it beats the order's commit (seen once; passes on rerun).
- [x] Task: Conductor - User Manual Verification 'Phase 1 — Green suite' (Protocol in workflow.md) — scripted (prompt-off): full run above.
