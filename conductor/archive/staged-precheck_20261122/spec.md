# Spec — staged precheck (gluon all-Rust Stage A P0.5)

## Overview
gluon's staged acceptance (`ACCEPTANCE_SERVICES=cart,catalog bin/run-acceptance …`)
limits reset, seeding, connector and ledger checks to the listed services. The suite's
own precheck (`globalSetup`) must do the same, so a staged run isn't stopped by a
service it doesn't cover.

## Functional requirements
1. `ACCEPTANCE_SERVICES` (comma or space separated; `cart` or `cart-service`): the
   precheck checks only those services' readiness and outbox connectors, and the catalog
   count only when `catalog` is listed.
2. Unset: exactly today's precheck. Set but empty, or naming an unknown service: the
   precheck fails, naming it.
3. Feature files and step assertions are unchanged.

## Acceptance criteria
Unit tests red first; `npm test`, `npm run lint`, `npm run typecheck` green.

## Out of scope
gluon's scripts (bin/lib/acceptance-services.sh).
