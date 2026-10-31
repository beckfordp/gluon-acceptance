# Plan — Acceptance 1: Suite scaffold

## Phase 1: Project, CI and remote (ACC-1.1) [checkpoint: cd930be]
- [x] Task: npm project — `package.json` (ESM, scripts), `.nvmrc` (24), `tsconfig.json` (strict), ESLint flat config, `.gitignore`; install pinned deps (@playwright/test 1.64, playwright-bdd 9.2, TS 6.0, ESLint 10, typescript-eslint 8, vitest 5 + coverage-v8); `npx playwright install chromium` b194f6d
- [x] Task: placeholder vitest test; `npm run lint && npm run typecheck && npm test` green 1213916
- [x] Task: README (purpose, prerequisites, links to gluon ADRs 0020/0023, PLAN.md) 00e82ea
- [x] Task: GitHub Actions CI (`.github/workflows/ci.yml`, Node 24: ci, bddgen, lint, typecheck, test); create public `beckfordp/gluon-acceptance`, push; CI green 1c4392d
- [x] Task: Conductor - User Manual Verification 'Phase 1: Project, CI and remote' (Protocol in workflow.md)

## Phase 2: Config [checkpoint: 287e236]
- [x] Task: write failing tests — `loadConfig(env)`: defaults (GSHOP_URL, GSHOP_DIR, 8 service URLs on 18080–18087), overrides, accumulates every invalid-URL error; `viteEnv(config)` maps to `VITE_<NAME>_SERVICE_URL` 7cceaae
- [x] Task: implement `src/config.ts` (pure, `Result`-style return, no throws except at the config boundary); coverage >80% 7cceaae
- [x] Task: Conductor - User Manual Verification 'Phase 2: Config' (Protocol in workflow.md)

## Phase 3: Serving gshop (ACC-1.2) [checkpoint: 65d078b]
- [x] Task: service URLs default to OrbStack cluster DNS (`http://<svc>.gluon-local.svc.cluster.local:8080`, as gshop's `.env`); no port-forward script (deviation 2026-10-31, see spec FR3) 0690470
- [x] Task: `playwright.config.ts` — `defineBddConfig` (features/steps → `.features-gen/`), Chromium project, `baseURL` from config, `webServer` = `npm run dev` in `GSHOP_DIR` with `viteEnv`, `reuseExistingServer: !CI`, `trace: 'retain-on-failure'`, HTML report; add `bddgen` step to CI (deferred from Phase 1) c862116
- [x] Task: record the serving decision in `tech-stack.md` (dated note); README run instructions 6bbcab5
- [x] Task: Conductor - User Manual Verification 'Phase 3: Serving gshop' (Protocol in workflow.md)

## Phase 4: Smoke feature (ACC-1.3)
- [x] Task: `features/us-01-browse-catalog.feature` (`@US-1.1 @smoke`) — `bddgen` fails listing the 3 missing steps (red) 22bc80a
- [x] Task: `src/pages/CatalogPage.ts` (role/label locators), `src/fixtures.ts` (`test.extend` with `catalogPage`), `steps/catalog.steps.ts` via `createBdd(test)` — `bddgen` green 22bc80a
- [x] Task: `npm run test:acceptance` green against gluon-local; HTML report shows Gherkin steps; deliberately break the Then step → readable step-level failure, then revert 22bc80a
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Smoke feature' (Protocol in workflow.md)
