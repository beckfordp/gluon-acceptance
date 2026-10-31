# Spec — Acceptance 2: Fixtures and test data

## Overview
gluon PLAN.md ACC-2.1–2.3. Give steps the test data they need through Playwright fixtures (injected via `createBdd(test)`), clean up after every scenario so demo inventory and order history are unchanged, and fail fast before a run when the cluster isn't ready.

## Functional Requirements
1. **API helpers (`src/api/`)** over the services' real REST contracts (cluster DNS URLs from config): user signup (`POST /auth/signup`), inventory lookup/update (`GET /inventorys?sku=`, `PUT /inventorys/{id}`), payment method + order placement (`POST /payments/methods`, `POST /orders`), order get/list/delete (`GET /orders/{id}`, `GET /orders?customerId=`, `DELETE /orders/{id}`), fulfilment task get/fail (`GET /fulfilment-tasks`, `POST /fulfilment-tasks/{id}/fail`), Kafka Connect connector status (`GET /connectors?expand=status`). Responses are shape-checked, never cast.
2. **Pure helpers (`src/`, unit-tested):** throwaway email generator; test cards (approve `4242…4242`, decline-at-authorize `4000…0002`, decline-at-capture `5555…4444`) and a test address; stocked-product picker (first catalog page ∩ inventory with enough available); precheck evaluation (problems list → one clear message).
3. **Fixtures (`src/fixtures.ts`):**
   - `shopper` (auto): a fresh anonymous customer id pinned into gshop's `localStorage` (`gshop:customerId`) before the page loads, so API-placed orders show in that browser's history
   - `registeredCustomer`: a throwaway user signed up via the API (unique email, known password)
   - `stockedProduct`: a catalog product with enough stock; its inventory row is snapshotted
   - `testData` (auto): tracks orders and inventory snapshots; teardown cleans up (below)
   - `orders`: places an order through the API for the current shopper (Acceptance 5 setup)
4. **Shared steps (`steps/common.steps.ts`):** "Given I am a registered customer", "Given a product is in stock", "Given I have placed an order for it" (API).
5. **Cleanup (ACC-2.2), in `testData` teardown:** every order for the scenario's customer ids (anonymous + registered) is found via `GET /orders?customerId=`; a non-terminal fulfilment task is failed (`acceptance cleanup`), which releases the reservation and voids the authorization; wait for a terminal order status; `DELETE /orders/{id}` and confirm `404`; finally restore every snapshotted inventory row exactly.
6. **Precheck (ACC-2.3):** Playwright `globalSetup`: all 8 services `/health/ready` 200, all 5 Debezium outbox connectors `RUNNING` (tasks too), catalog non-empty. Any failure stops the run before the first scenario with one message listing every problem and its fix (`bin/k8s-local-up` re-creates connectors; `seed-watches.sh` seeds the catalog).
7. **Real wiring:** `viteEnv` also pins `VITE_CHECKOUT_MOCK=false`, `VITE_AUTH_MOCK=false`. Config gains `KAFKA_CONNECT_URL` (default `http://kafka-connect.gluon-local.svc.cluster.local:8083`).

## Non-Functional Requirements
- Pure helpers >80% coverage; I/O glue (`src/api/**`, `src/support/**`, fixtures, pages) exercised by scenarios
- No fixed sleeps: polling with deadlines

## Acceptance Criteria
- A `@support` scenario using the fixtures (API order) passes; after the run every inventory row in the cluster is byte-identical (available/reserved) to before, and the scenario's orders return 404
- Precheck fails fast with a clear message when a service is unreachable (e.g. `ORDER_URL=http://localhost:1`)
- CI: bddgen + lint + typecheck + unit tests green

## Out of Scope
- Deleting users, carts, payment methods, fulfilment tasks (no delete endpoints; invisible to demo history/inventory). Failed fulfilment tasks remain in the Admin queue, marked `acceptance cleanup`
