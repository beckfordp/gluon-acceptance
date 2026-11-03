# Acceptance A — Customer cancel

## Overview
Step 3 of the acceptance catch-up (classification approved 2026-11-03). gshop's Order History
has a Cancel action for `authorized` orders (US-9.8) and surfaces the `409` once an order is past
cancelling (US-21.5). The suite has no cancellation scenario, and `src/outOfScope.ts` still says
the Cancel action isn't built.

## Functional Requirements
- FR1: a customer cancels an `authorized` order from Order History; the card shows `Cancelled`
  (US-9.1, US-9.8).
- FR2: after the cancel its stock is released (US-9.4) and the fulfilment task, wherever it was
  in Pending/Picking/Packed, shows `Cancelled` (US-9.5).
- FR3: cancelling from a stale Order History after the order was dispatched shows the `409`
  message pointing at returns, and the order stays `Confirmed` (US-21.1, US-21.5).
- FR4: `OUT_OF_SCOPE` drops US-9.1, 9.4, 9.5, 9.8, 21.1 and the `NO_CANCEL_JOURNEY` constant.
  `CANCELLATION_BACKEND` only remains for US-9.3, reworded (void is internal to payment-service).

## Acceptance Criteria
- New scenarios pass on a reset + seeded cluster, and the full suite stays green; ledger check OK.
- Coverage matrix: the six tasks above show as covered; no new problems.
- `npm test`, lint, `tsc --noEmit` green.

## Out of Scope
- Operator cancel / expiry (track B), cancellation emails (track C).
- The cancel-vs-dispatch race itself (US-21.2–21.4, out of scope: not deterministic via gshop).
