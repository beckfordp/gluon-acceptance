# Acceptance D — Catalogue stock

## Overview
Last step-3 track of the acceptance catch-up. Admin → Catalogue (US-28.1, ADM-11) is a prototype:
product add/edit/retire are simulated in the browser, but the stock ±1 controls write to
inventory-service. Only the real part is accepted; US-28.2–28.10 aren't built yet.

## Functional Requirements
- FR1: the catalogue row for a stocked product shows its available stock.
- FR2: +1 then −1 changes the row and inventory-service's `quantityAvailable` by one each way,
  ending where it started.

## Acceptance Criteria
- Scenario passes; full run via `bin/run-acceptance` with the coverage-matrix gate on: matrix has
  no problems, suite green, ledger check OK.
- `npm test`, lint, `tsc --noEmit` green.

## Out of Scope
- Simulated add/edit/retire (prototype) — accepted when ADM-12–21 real-wire them.
