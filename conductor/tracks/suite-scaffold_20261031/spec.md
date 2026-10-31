# Spec — Acceptance 1: Suite scaffold

## Overview
Stand up `gluon-acceptance` (gluon PLAN.md ACC-1.1–1.3, ADRs 0020/0023): a Playwright + playwright-bdd TypeScript project with CI and a public remote, gshop served for tests via its Vite dev server against port-forwarded services, and one smoke feature proving the feature → step → page-object chain against the real local cluster.

## Functional Requirements
1. **Project (ACC-1.1):** npm/ESM TypeScript 6 project, Node 24 (`.nvmrc`); `@playwright/test` 1.64 + `playwright-bdd` 9.2 (Chromium); ESLint 10 + typescript-eslint; vitest 5 for pure helpers. Scripts: `bddgen`, `test` (unit), `test:acceptance` (`bddgen && playwright test`), `lint`, `typecheck`. `.features-gen/`, `test-results/`, `playwright-report/`, `node_modules/` gitignored. Layout `features/`, `steps/`, `src/`.
2. **Config:** typed `loadConfig(env)` — `GSHOP_URL` (default `http://localhost:5173`), `GSHOP_DIR` (default `../../frontends/gshop`), per-service URLs defaulting to the port-forward map; invalid URLs fail fast listing every error. Pure, unit-tested.
3. **Serving gshop (ACC-1.2):** `scripts/port-forward.sh up|down` (same 8-service map/ports as gluon-performance, 18080–18087; logs to file, no tail pipes). Playwright `webServer` runs `npm run dev` in `GSHOP_DIR` with `VITE_<NAME>_SERVICE_URL` from config, `reuseExistingServer` locally. Decision recorded in `tech-stack.md`.
4. **Fixtures/steps:** `src/fixtures.ts` extends `test` (page objects as fixtures); `steps/` uses `createBdd(test)`; `CatalogPage` page object (role/label locators).
5. **Smoke feature (ACC-1.3):** `features/us-01-browse-catalog.feature`, tagged `@US-1.1 @smoke`: Given I open the shop, When I browse the catalog, Then I see products from the catalog. Asserts ≥1 real product name returned by catalog-service.
6. **CI + remote:** public `beckfordp/gluon-acceptance`; GitHub Actions on Node 24: `npm ci`, `bddgen`, lint, typecheck, unit tests (no browsers, no cluster).
7. **README:** purpose, prerequisites, port-forward + run instructions, links to ADRs 0020/0023 and PLAN.md.

## Non-Functional Requirements
- `bddgen` fails on missing/ambiguous steps; no `waitForTimeout`
- >80% coverage on `src/` pure helpers (config)
- Smoke run leaves cluster data unchanged (read-only)

## Acceptance Criteria
- `npm run lint && npm run typecheck && npm test && npx bddgen` green locally and in CI
- With port-forwards up, `npm run test:acceptance` runs the smoke feature green against gluon-local; HTML report shows the Gherkin steps
- Breaking a step (e.g. wrong expected product) fails the scenario with a readable step-level error

## Out of Scope
- API helpers, throwaway users, cleanup, prechecks (Acceptance 2)
- Story features beyond smoke (Acceptance 3–5); coverage matrix, `bin/run-acceptance` (Acceptance 6)
- Deploying gshop to the cluster; running browsers in CI
