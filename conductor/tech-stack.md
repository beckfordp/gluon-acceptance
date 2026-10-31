# Tech Stack — gluon-acceptance

## Language / runtime
- **TypeScript 6.0.x** (strict; ESM, `"type": "module"`) — latest typescript-eslint supports (<6.1); TS 7 (native) not yet supported by the linter
- **Node 24 LTS** (`.nvmrc`; Homebrew node 24 already installed). Playwright 1.64 and playwright-bdd 9 need Node ≥20; local nvm default (18.16) is too old
- npm (package-lock committed)

## Test stack
- **@playwright/test 1.64.x** — runner, fixtures, web-first assertions, HTML report, trace viewer; Chromium only
- **playwright-bdd 9.2.x** — `defineBddConfig` in `playwright.config.ts`; `bddgen` compiles `features/**/*.feature` + `steps/**/*.ts` into `.features-gen/` (gitignored); `createBdd(test)` for Given/When/Then
- **vitest 5** — unit tests for pure helpers (config, coverage matrix); coverage via `@vitest/coverage-v8`, >80% on `src/`

## Layout
- `features/` — Gherkin, `@US-N.M` tags
- `steps/` — step definitions (thin)
- `src/` — fixtures (`test` extension), page objects, API helpers, config (pure, unit-tested)
- `playwright.config.ts` — `baseURL` from env, retries 0 locally, `trace: 'retain-on-failure'`

## Config
- Env vars via a small typed config module (`src/config.ts`): `GSHOP_URL`, `GSHOP_DIR`, `<SERVICE>_URL`; invalid values fail fast, listing every error
- Service URLs default to OrbStack in-cluster DNS (`http://<svc>.gluon-local.svc.cluster.local:8080`), resolvable from the Mac host; no port-forwards *(2026-10-31: replaces planned port-forward script)*

## Lint / format
- ESLint 10 flat config + typescript-eslint 8.x (as gshop, newer majors)
- `npm run typecheck` = `tsc --noEmit`

## How gshop is served
- Decided in ACC-1.2 (vite dev with real wiring vs deployed build) — recorded here once decided

## CI
- GitHub Actions, Node 24: `npm ci && npx bddgen && npm run lint && npm run typecheck && npm test` (unit only). No cluster, no browsers installed in CI. No GH_PACKAGES_TOKEN (no purerestlib dependency)

## Target
- Local: OrbStack k8s, namespace `gluon-local` (ADR 0002); runner wired into gluon `bin/run-acceptance` (ACC-6.2)
