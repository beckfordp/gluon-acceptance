# Plan — Acceptance 2: Fixtures and test data

## Phase 1: Pure helpers and config [checkpoint: 1eff64a]
- [x] Task: config — `KAFKA_CONNECT_URL`, `viteEnv` pins mock flags off (tests first) a067a90
- [x] Task: `src/testData.ts` — throwaway email, test cards/address, stocked-product picker (tests first) 0db1849
- [x] Task: `src/precheck.ts` — evaluate readiness results into one message (tests first) 15a7fcc
- [x] Task: Conductor - User Manual Verification 'Phase 1: Pure helpers and config' (Protocol in workflow.md)

## Phase 2: API helpers, fixtures, cleanup, precheck (ACC-2.1–2.3) [checkpoint: 861c820]
- [x] Task: `src/api/` — users, inventory, orders, fulfilment, connect (shape-checked) 308b024
- [x] Task: `src/support/testData.ts` cleanup + `src/support/globalSetup.ts` precheck; fixtures `shopper`, `registeredCustomer`, `stockedProduct`, `testData`, `orders` 0bc6352
- [x] Task: shared steps + `@support` feature exercising them; run green against gluon-local 7e248d1
- [x] Task: Conductor - User Manual Verification 'Phase 2: API helpers, fixtures, cleanup, precheck' (Protocol in workflow.md)
