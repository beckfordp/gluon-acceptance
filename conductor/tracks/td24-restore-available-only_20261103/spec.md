# TD-24 — stock teardown restores quantityAvailable only

## Overview
`TestData.restore` PUT each snapshotted inventory row back including `quantityReserved`,
wiping reservations still held at teardown; their later release/ship drove the counter negative
(gluon TD-24, the confirmed cause). inventory-service now owns `quantityReserved` via its ledger
and ignores a sent value; the suite stops sending and comparing it.

## Functional Requirements
- FR1: `setStock` PUTs `{quantityAvailable}` only.
- FR2 (re-scoped 2026-11-03): no teardown stock restore at all — `TestData` no longer snapshots
  or rewrites inventory. Each run starts from a reset + seed (gluon `bin/run-acceptance`), so
  scenarios leave stock as they found it only up to the next reset. Fixtures read current stock
  instead of snapshotting it. The low-stock scenario keeps `setStock` (available only) on its own
  worker's product; `pickStockedProduct` already skips rows with < 2 available.
- Order cleanup in teardown is kept (cheap; keeps the cluster tidy for demos).

## Acceptance Criteria
- Unit test covers FR1 (request body); restore code and `sameStock` removed; `npm test`, lint,
  typecheck green.
- A full acceptance run via `bin/run-acceptance` (reset + seed first, ledger-invariant check
  after) passes with 0 drift rows.

## Out of Scope
- `bin/run-acceptance` reset + seed pre-step and invariant check (gluon, done alongside).
- Scenario-owned catalogue products (would need gshop search/paging support).
