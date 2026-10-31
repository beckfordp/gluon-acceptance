# Plan — Acceptance 4: Account and checkout

## Phase 1: Account (ACC-4.1) [checkpoint: 53aa87d]
- [x] Task: page objects `CheckoutPage`, `AuthDialog`; checkout + account steps; UI sign-ups tracked for cleanup d616e1a
- [x] Task: `features/us-16-account.feature` — sign up, sign in/out, wrong password, duplicate email, mismatched passwords 954d515
- [x] Task: Conductor - User Manual Verification 'Phase 1: Account' (Protocol in workflow.md)

## Phase 2: Checkout happy path (ACC-4.2)
- [ ] Task: `ConfirmationPage`, `orders.record`, stock snapshot on `stockedProduct`; checkout steps
- [ ] Task: `features/us-11-14-checkout.feature` — anonymous, billing differs, signed-in history
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Checkout happy path' (Protocol in workflow.md)

## Phase 3: Failure paths (ACC-4.3)
- [ ] Task: `otherStockedProduct`, sell-out step; `features/us-14-checkout-failures.feature` outlines — decline, out of stock, validation
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Failure paths' (Protocol in workflow.md)
