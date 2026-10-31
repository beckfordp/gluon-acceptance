# Spec — Acceptance 5: Fulfilment and capture

## Overview
gluon PLAN.md ACC-5.1–5.4: Gherkin features accepting the post-authorization order lifecycle through gshop — an operator picks, packs and dispatches on the Order processing screen (Admin → "Open order processing") (US-17), or reports a problem (US-18); dispatch triggers capture, and Order History shows the outcome (US-19). Each scenario starts from an order placed through the UI (Acceptance 4's checkout steps), so the whole lifecycle is driven by the UI.

## Functional Requirements
1. **Order processing page object** (`FulfilmentPage`): open via Admin; find this scenario's task card by order ID (the queue is shared, so never "the first card"); Start picking, Mark packed, Dispatch → Confirm dispatch (default DHL + generated tracking), Report problem → reason → Confirm failure; card state badge and outcome text. The screen fetches on entry and on Refresh only, so finding a card refreshes until the task (created async from `PaymentAuthorized`) appears.
2. **US-17 + US-19 feature** (`features/us-17-19-fulfilment.feature`), Background: an order placed with the approve card:
   - `@US-17.1 @US-17.2 @US-17.7` pick, pack, dispatch → badge `Picking`, `Packed`, `Dispatched`; "Shipped via DHL — tracking …"
   - `@US-17.4 @US-19.1 @US-19.2 @US-19.5` a dispatched order's payment is captured → Order History eventually shows `Confirmed`
   - `@US-19.1 @US-19.3 @US-19.5` an order paid with `5555 5555 5555 4444` (authorizes, declines on capture) is dispatched → Order History eventually shows `Payment failed`
3. **US-18 feature** (`features/us-18-dispatch-failure.feature`):
   - `@US-18.1 @US-18.3 @US-18.5` `Scenario Outline` over the state the problem is reported in (`Pending`, `Picking`, `Packed`) → badge `Dispatch failed`, "Not dispatched: {reason}"; Order History eventually shows `Dispatch failed`; stock reservation released (inventory back to its pre-order snapshot)
   - `@US-17.7` Confirm failure with no reason → "A reason is required"; task unchanged
4. **Async waits (ACC-5.4):** every wait for an async effect (task appearing, history status, stock release) is a polling assertion inside a `Then` (`expect.poll`/`expect(...).toPass` reopening/refreshing the screen, or `pollUntil` for API reads); no fixed sleeps.

## Non-Functional Requirements
- Inventory byte-identical before/after (dispatch consumes stock; teardown restores the snapshot)
- No order left behind: `Confirmed`, `Payment failed`, `Dispatch failed` are terminal, existing teardown deletes them
- Scenarios never touch other tasks in the shared queue; Auto-drive stays off

## Acceptance Criteria
- `@US-17`, `@US-18`, `@US-19` scenarios green against gluon-local; inventory identical across a run; CI green

## Out of Scope
- `Dispatched` in Order History (US-17.6): capture follows dispatch within ms, so the status is transient and racy to observe; covered by gshop's unit tests, marked in the ACC-6.1 matrix
- Emails (US-17.5, US-18.4, US-19.4), payment void (US-18.2), idempotency, manual-reconciliation flag (US-19.3): not UI-observable; matrix (ACC-6.1)
- Fulfilment tasks and captured/voided payments remain after teardown (no delete endpoints), like Acceptance 2's leftovers
