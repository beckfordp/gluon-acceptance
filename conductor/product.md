# Initial Concept

BDD acceptance suite — per ADRs 0020/0023 and gluon PLAN.md "Acceptance Testing": Playwright (TypeScript) + playwright-bdd, Gherkin features tagged `@US-N.M`, driving gshop against gluon-local.

# Product — gluon-acceptance

## Purpose
BDD acceptance suite for the Gluon platform (ADRs 0020, 0023). Re-checks the user journeys US-1 to US-20 end to end through gshop against the real local cluster, and traces every scenario back to the story it accepts in gluon `docs/user-stories.md`.

## Users
- The consultant (solo): runs the suite before demos and after cross-service changes
- Demo audience / reviewers: read the `.feature` files as plain-language acceptance criteria

## Goals
- Gherkin `.feature` files, one per story (or story group), compiled by playwright-bdd and run by Playwright's own runner
- Every scenario tagged `@US-N.M`; coverage matrix against `user-stories.md` (covered / not covered / out of scope)
- Domain-level steps over page objects; fixtures own test data and clean up after themselves
- Async outcomes (reservation, capture, dispatch) awaited with polling assertions, never fixed sleeps
- One-command run via gluon `bin/run-acceptance` (prechecks, run, report)

## Non-goals
- Replacing `verify-*.sh` scripts (they stay as track-level live checks)
- Performance/load (that's gluon-performance)
- Running in CI against a cluster: CI is `bddgen` + lint + typecheck only

## Scope (from gluon PLAN.md; units owned by this repo)
Acceptance 1 (scaffold), 2 (fixtures/test data), 3 (browse/cart), 4 (account/checkout), 5 (fulfilment/capture), 6 (traceability/runner, with gluon `bin/`)

## Constraints
Local OrbStack cluster, namespace `gluon-local`; demo data unchanged after a run; Debezium connectors must be registered (lost on OrbStack restart); laptop budget per ADR 0015.
