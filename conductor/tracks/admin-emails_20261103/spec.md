# Acceptance C — Customer record and email history

## Overview
Step 3 of the acceptance catch-up. Admin → Operations → Customers (US-27.4) shows a customer's
orders and every email notification-service recorded for them (`sent_email`, US-27.1), with
recipients resolved from user-service or the guest email (US-27.2). So the old reason for leaving
emails out of scope ("not visible in gshop") no longer holds: approved to bring all seven email
tasks into scope.

## Functional Requirements
- FR1: a guest's record (labelled `Guest {email}`) lists their order and its status (US-27.1,
  27.2, 27.4).
- FR2: each email shows as `sent` in the record: confirmed / shipped / payment received after
  capture (US-7.1, 17.5, 19.4); payment failed after a capture decline (US-19.4, 7.1); couldn't
  ship after a dispatch failure (US-18.4); welcome for a registered customer (US-16.4).
- FR3: the cancellation email's copy names the reason: customer, operator, authorization expiry
  (US-9.9, US-20.5).
- FR4: `OUT_OF_SCOPE` drops the seven `EMAIL` entries and the `EMAIL` constant.

## Acceptance Criteria
- New scenarios pass; full suite green from reset; ledger check OK.
- Coverage matrix: only US-28.1 left as a problem (track D).
- `npm test`, lint, `tsc --noEmit` green.

## Out of Scope
- Email delivery itself (stub sender, logged only).
