# Plan — Acceptance 5: Fulfilment and capture

## Phase 1: Pick, pack, dispatch (ACC-5.1, ACC-5.4) [checkpoint: 93b2f48]
- [x] Task: `FulfilmentPage` page object (open via Admin, task card by order ID with refresh-until-present, actions, badge/outcome); fulfilment steps; history "eventually shows status" step (polls the uncached order API, then opens history: its cache has a 60s TTL) 20928c0
- [x] Task: `features/us-17-19-fulfilment.feature` — pick/pack/dispatch, captured → `Confirmed` 23200b2
- [x] Task: Conductor - User Manual Verification 'Phase 1: Pick, pack, dispatch' (Protocol in workflow.md)

## Phase 2: Dispatch failure (ACC-5.2) [checkpoint: 86c23e5]
- [x] Task: report-problem steps; stock-released step (poll inventory back to snapshot) d65d3ba
- [x] Task: `features/us-18-dispatch-failure.feature` — outline over Pending/Picking/Packed, missing reason e943890
- [x] Task: Conductor - User Manual Verification 'Phase 2: Dispatch failure' (Protocol in workflow.md)

## Phase 3: Capture failure (ACC-5.3)
- [~] Task: capture-decline scenario (`5555 5555 5555 4444`) → `Payment failed` in us-17-19 feature
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Capture failure' (Protocol in workflow.md)
