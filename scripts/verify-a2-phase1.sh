#!/usr/bin/env bash
# Phase 1 (Pure helpers and config) verification for fixtures-test-data_20261031:
# CI checks green, coverage thresholds met, and gshop's env pins mocks off.
#   scripts/verify-a2-phase1.sh
set -euo pipefail
cd "$(dirname "$0")/.."

major="$(node -v | sed 's/^v\([0-9]*\).*/\1/')"
[ "$major" -ge 24 ] || { echo "FAIL: node $(node -v); need 24 (nvm use)"; exit 1; }

echo "== CI checks =="
npx bddgen < /dev/null
npm run -s lint
npm run -s typecheck
npm run -s test:coverage < /dev/null > target/verify-a2-phase1.log 2>&1 \
  || { echo "FAIL: unit tests/coverage (see target/verify-a2-phase1.log)"; exit 1; }
grep -E "Tests " target/verify-a2-phase1.log | sed 's/^ */ok   /'
grep -E "^All files" target/verify-a2-phase1.log | sed 's/^/ok   coverage: /'

echo "== gshop env =="
env_out="$(node --no-warnings --input-type=module -e "
  import { configFromEnv, viteEnv } from './src/config.ts'
  const env = viteEnv(configFromEnv())
  console.log(env.VITE_CHECKOUT_MOCK, env.VITE_AUTH_MOCK, configFromEnv().kafkaConnectUrl)
")"
[ "$env_out" = "false false http://kafka-connect.gluon-local.svc.cluster.local:8083" ] \
  || { echo "FAIL: unexpected env: $env_out"; exit 1; }
echo "ok   mocks pinned off; Kafka Connect $(cut -d' ' -f3 <<< "$env_out")"

echo "PASS: Phase 1 (Pure helpers and config) verified"
