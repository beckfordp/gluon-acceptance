# Plan — Acceptance 5: Fulfilment and capture

## Phase 1: Pick, pack, dispatch (ACC-5.1, ACC-5.4)
- [x] Task: `FulfilmentPage` page object (open via Admin, task card by order ID with refresh-until-present, actions, badge/outcome); fulfilment steps; history "eventually shows status" step polling via reopen 20928c0
- [x] Task: `features/us-17-19-fulfilment.feature` — pick/pack/dispatch, captured → `Confirmed` 23200b2
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Pick, pack, dispatch' (Protocol in workflow.md)

## Phase 2: Dispatch failure (ACC-5.2)
- [ ] Task: report-problem steps; stock-released step (poll inventory back to snapshot)
- [ ] Task: `features/us-18-dispatch-failure.feature` — outline over Pending/Picking/Packed, missing reason
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Dispatch failure' (Protocol in workflow.md)

## Phase 3: Capture failure (ACC-5.3)
- [ ] Task: capture-decline scenario (`5555 5555 5555 4444`) → `Payment failed` in us-17-19 feature
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Capture failure' (Protocol in workflow.md)
