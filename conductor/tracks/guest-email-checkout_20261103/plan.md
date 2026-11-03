# Guest email at checkout — Implementation Plan

## Phase 1 — Green suite
- [ ] Task: Fill the guest email at signed-out checkout (FR1–FR2)
  - [ ] Red: run the 14 failing scenarios; confirm they stop on "Enter an email address for order updates".
  - [ ] Green: `CheckoutPage.guestEmail` + `fillShipping(address)` (guest email when shown, then shipping); steps use it.
- [ ] Task: Checks — `npm test`, lint, `tsc`; reset + seed → full Playwright run all green → `bin/check-stock-ledger`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1 — Green suite' (Protocol in workflow.md)
