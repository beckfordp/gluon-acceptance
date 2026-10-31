# Product Guidelines — gluon-acceptance

## Code conventions
Canonical: [`code_styleguides/typescript.md`](./code_styleguides/typescript.md) (+ `general.md`), as gshop. Strict TS, no `any`, ESLint clean.

## Feature files (Gherkin)
- One `.feature` per story or story group under `features/`, named after the story (e.g. `us-02-cart.feature`)
- Every scenario (or its feature) tagged `@US-N.M`; out-of-scope stories recorded in the coverage matrix, not as skipped scenarios
- Written in the shopper's / dispatcher's words: "When I add 2 of a stocked product to my cart", never selectors or clicks
- Declarative, not imperative: one behaviour per scenario, 3–7 steps; `Background` for shared setup
- Failure variants as `Scenario Outline` + `Examples`

## Steps and page objects
- Steps via playwright-bdd `createBdd(test)` against the suite's own extended `test` (fixtures injected, no globals)
- Steps are thin: delegate to page objects (UI) or API helpers (setup); assertions in `Then` steps only
- Page objects use role/label locators (`getByRole`, `getByLabel`), `data-testid` only as a fallback
- Shared steps reused across features; `bddgen` fails on missing/ambiguous steps — keep it green

## Test data and async
- Fixtures create unique throwaway data (users, orders) and clean up; never shared demo accounts
- Setup the UI can't drive goes through API fixtures (ADR 0020)
- Async outcomes via `expect.poll` / web-first assertions with explicit timeouts; no `waitForTimeout`

## Testing / quality gate
- Before every commit: `npx bddgen && npm run lint && npm run typecheck` (CI enforces)
- Pure helpers (tag → matrix, config) unit-tested; scenarios themselves are the integration test, run locally against gluon-local
