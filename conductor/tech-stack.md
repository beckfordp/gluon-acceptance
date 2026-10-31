# Tech Stack — gluon-acceptance

## Language / runtime
- **TypeScript 6.0.x** (strict; ESM, `"type": "module"`) — latest typescript-eslint supports (<6.1); TS 7 (native) not yet supported by the linter
- **Node 26 LTS** (`.nvmrc`; nvm default) *(2026-10-31: was 24; 26 is Active LTS and matches purerest's AsyncAPI docs toolchain)*. `engines` ≥24; Playwright 1.64 and playwright-bdd 9 need Node ≥20
- npm (package-lock committed)

## Test stack
- **@playwright/test 1.64.x** — runner, fixtures, web-first assertions, HTML report, trace viewer; Chromium only
- **playwright-bdd 9.2.x** — `defineBddConfig` in `playwright.config.ts`; `bddgen` compiles `features/**/*.feature` + `steps/**/*.ts` into `.features-gen/` (gitignored); `createBdd(test)` for Given/When/Then
- **vitest 5** — unit tests for pure helpers (config, coverage matrix); coverage via `@vitest/coverage-v8`, >80% on `src/`

## Layout
- `features/` — Gherkin, `@US-N.M` tags
- `steps/` — step definitions (thin)
- `src/` — `fixtures.ts` (`test.extend` + `createBdd(test)`), `pages/` (page objects), `api/` (shape-checked service API helpers), `support/` (test-data cleanup, `globalSetup` precheck), pure `config.ts`/`testData.ts`/`precheck.ts`/`poll.ts` (unit-tested; glue excluded from coverage, exercised by scenarios)
- Test data *(2026-10-31, ACC-2)*: fixtures `shopper` (auto; pins `gshop:customerId`), `registeredCustomer`, `stockedProduct` (inventory snapshotted, picked by `parallelIndex`; carries its `stock` snapshot), `otherStockedProduct` *(2026-10-31, ACC-4.3; picked from the catalog's far end)*, `orders` (`place` via API, `record` for UI-placed orders), `testData` (auto teardown: fail open fulfilment task, wait terminal, delete order, restore stock until stable). Waits are `pollUntil`, `expect.poll` or `toPass` with deadlines, never fixed sleeps. Order History is cached by order-service (60 s TTL, no invalidation): poll the order API to the expected status before opening it *(2026-10-31, ACC-5)*
- `scripts/verify-phase*.sh` — scripted phase verification
- `scripts/coverage-matrix.ts` — run by Node's built-in type stripping (no tsx/ts-node), so its imports carry `.ts` (`allowImportingTsExtensions`); logic in pure `src/coverage.ts`, out-of-scope list in `src/outOfScope.ts` *(2026-10-31, ACC-6.1)*
- `playwright.config.ts` — `baseURL` from env, retries 0, `workers: 2` *(2026-10-31, ACC-5: more workers overload the local cluster; order-service fails its liveness probe and restarts)*, Chromium `--host-resolver-rules` pins service hosts to addresses resolved in Node *(2026-10-31, ACC-5: Chromium's own `.cluster.local` lookups time out under load as `ERR_NAME_NOT_RESOLVED`)*, `trace: 'retain-on-failure'`, `SLOW_MO` → `launchOptions.slowMo`; playwright-bdd `steps` glob includes `src/fixtures.ts`
- Watching runs: `npm run test:acceptance:ui` (UI mode, steps beside live gshop), `npm run test:acceptance:headed` (visible Chromium, `SLOW_MO` default 500 ms)

## Config
- Env vars via a small typed config module (`src/config.ts`): `GSHOP_URL`, `GSHOP_DIR`, `KAFKA_CONNECT_URL`, `<SERVICE>_URL`; invalid values fail fast, listing every error; `viteEnv` pins gshop's checkout/auth mocks off
- Service URLs default to OrbStack in-cluster DNS (`http://<svc>.gluon-local.svc.cluster.local:8080`), resolvable from the Mac host; no port-forwards *(2026-10-31: replaces planned port-forward script)*

## Lint / format
- ESLint 10 flat config + typescript-eslint 8.x (as gshop, newer majors)
- `@stylistic/eslint-plugin` 5.10 for `@stylistic/semi: always` (style guide: explicit semicolons; ESLint 10 dropped core `semi`) *(2026-10-31, review fix)*
- `npm run typecheck` = `tsc --noEmit`

## How gshop is served
- *(2026-10-31, ACC-1.2)* Vite dev server from the gshop checkout (`GSHOP_DIR`, default `../../frontends/gshop`), started by Playwright `webServer` (`npm run dev --port <GSHOP_URL port> --strictPort`), reused if already running locally
- Wired to real services via `viteEnv(config)` → `VITE_<NAME>_SERVICE_URL` (process env overrides gshop's `.env`); defaults are OrbStack cluster DNS, no port-forwards
- Why: zero new infra; tests the current gshop source; same wiring as day-to-day gshop dev. Rejected: `vite preview` of a build (slower, no extra signal yet); deploying gshop to the cluster (new image/manifest, bigger track)

## CI
- GitHub Actions, Node from `.nvmrc` (26): `npm ci && npx bddgen && npm run lint && npm run typecheck && npm test` (unit only). No cluster, no browsers installed in CI. No GH_PACKAGES_TOKEN (no purerestlib dependency)

## Target
- Local: OrbStack k8s, namespace `gluon-local` (ADR 0002); runner wired into gluon `bin/run-acceptance` (ACC-6.2)
