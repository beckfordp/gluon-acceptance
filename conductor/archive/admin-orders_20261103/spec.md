# Acceptance B — Operator order console and expiry

## Overview
Step 3 of the acceptance catch-up. gshop's Admin → Operations console lists every order with its
reservation ledger and fulfilment task (US-24), and offers operator Cancel (US-22) and Expire
authorization (US-25), which runs payment-service's real expiry sweep for one order. Expire
replaces the old reason for leaving US-20 out of scope ("needs a seeded past expiresAt").

## Functional Requirements
- FR1: the console lists my order with its status and guest email, and its detail shows the
  status, fulfilment `PENDING` and ledger line `active` (US-24.1–24.3, tag US-27.3).
- FR2: operator cancel → console shows `cancelled`, fulfilment `CANCELLED`, ledger `released`;
  stock released; Order History shows `Cancelled` (US-22.2, US-22.4, US-25.2).
- FR3: Expire authorization → same outcome via `PaymentAuthorizationExpired` (US-20.1–20.4,
  US-20.6, US-25.1, US-25.2).
- FR4: a confirmed order offers neither action and says why (US-22.4, US-25.2: eligible only).
- FR5: `OUT_OF_SCOPE` drops the `EXPIRY` entries and adds the approved out-of-scope tasks: US-9.6,
  9.7, 21.2–21.4, 22.1, 22.3, 26.1–26.3, each naming what covers it.

## Acceptance Criteria
- New scenarios pass; full suite green from reset; ledger check OK.
- Coverage matrix: all tasks above covered or out of scope.
- `npm test`, lint, `tsc --noEmit` green.

## Out of Scope
- Emails (track C), catalogue (track D), reconciliation UI (no deterministic way to raise a flag).
