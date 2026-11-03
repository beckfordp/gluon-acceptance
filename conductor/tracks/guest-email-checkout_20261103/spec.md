# Fill the guest email at signed-out checkout

## Overview
Since ADM-10 (US-27.3) gshop requires "Email for order updates" when a signed-out shopper checks
out. The suite's checkout steps never fill it, so every UI checkout stops on validation: 14 of 36
scenarios fail (found 2026-11-03 during TD-24). Step 1 of the acceptance catch-up: get back to
green before adding coverage.

## Functional Requirements
- FR1: `CheckoutPage` exposes the guest email field and fills it with a throwaway address when it
  is shown; signed-in checkouts (field absent) are unaffected.
- FR2: every step that fills the shipping address for a signed-out shopper also fills the guest
  email.

## Acceptance Criteria
- `bin/run-acceptance` steps (reset + seed → Playwright → ledger check): all scenarios pass.
- `npm test`, lint, `tsc --noEmit` green.

## Out of Scope
- A dedicated scenario for US-27.3 and the other uncovered stories (step 2/3 of the catch-up).
- The coverage-matrix gate (still red until the catch-up tracks land).
