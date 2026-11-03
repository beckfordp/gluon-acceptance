# TD-24 — stock teardown restores quantityAvailable only

## Overview
`TestData.restore` PUT each snapshotted inventory row back including `quantityReserved`,
wiping reservations still held at teardown; their later release/ship drove the counter negative
(gluon TD-24, the confirmed cause). inventory-service now owns `quantityReserved` via its ledger
and ignores a sent value; the suite stops sending and comparing it.

## Functional Requirements
- FR1: `setStock` PUTs `{quantityAvailable}` only.
- FR2: Teardown's settle check compares `quantityAvailable` only — reserved may legitimately
  differ while other orders hold stock, so comparing it would rewrite/loop to timeout.

## Acceptance Criteria
- Unit tests cover FR1 (request body) and FR2 (comparison); `npm test`, lint, typecheck green.
- A full acceptance run after a DB reset + seed leaves 0 drift rows (reserved = active ledger).

## Out of Scope
- Resetting all databases + seeding before acceptance runs (gluon follow-up, user rule
  2026-11-03).
