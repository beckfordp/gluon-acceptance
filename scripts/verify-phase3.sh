#!/usr/bin/env bash
# Phase 3 (Serving gshop, ACC-1.2) verification for suite-scaffold_20261031:
# CI checks green, Playwright config loads and rejects bad env, every service
# reachable on its OrbStack cluster DNS name, and gshop's dev server starts
# on the configured port with the suite's VITE_* wiring.
#   scripts/verify-phase3.sh
set -euo pipefail
cd "$(dirname "$0")/.."

major="$(node -v | sed 's/^v\([0-9]*\).*/\1/')"
[ "$major" -ge 24 ] || { echo "FAIL: node $(node -v); need 24 (nvm use)"; exit 1; }

echo "== CI checks =="
npx bddgen < /dev/null
npm run -s lint
npm run -s typecheck
npm test --silent 2>&1 | grep -E "Tests " | sed 's/^ */ok   /'

echo "== Playwright config =="
list="$(npx playwright test --list < /dev/null 2>&1 || true)"
grep -q "Total: 0 tests" <<< "$list" || { echo "FAIL: config didn't load"; echo "$list"; exit 1; }
echo "ok   config loads (no features yet)"
bad="$(ORDER_URL=nope npx playwright test --list < /dev/null 2>&1 || true)"
grep -q "ORDER_URL: 'nope' is not an absolute http(s) URL" <<< "$bad" \
  || { echo "FAIL: bad ORDER_URL not rejected"; echo "$bad"; exit 1; }
echo "ok   bad ORDER_URL rejected at startup"

echo "== Services on cluster DNS =="
for svc in order payment inventory user catalog fulfilment cart notification; do
  url="http://${svc}-service.gluon-local.svc.cluster.local:8080/health/ready"
  code="$(curl -s -m 5 -o /dev/null -w '%{http_code}' "$url" || true)"
  [ "$code" = 200 ] || { echo "FAIL: $url -> $code"; exit 1; }
  echo "ok   $svc-service ready"
done

echo "== gshop dev server =="
gshop_dir="../../frontends/gshop"
[ -d "$gshop_dir/node_modules" ] || { echo "FAIL: run npm ci in $gshop_dir"; exit 1; }
if curl -s -m 2 -o /dev/null http://localhost:5173; then
  echo "FAIL: :5173 already in use; stop that server first"; exit 1
fi
mkdir -p target
log="target/verify-phase3-gshop.log"
env $(node --no-warnings --input-type=module -e "
  import { configFromEnv, viteEnv } from './src/config.ts'
  console.log(Object.entries(viteEnv(configFromEnv())).map(([k, v]) => k + '=' + v).join(' '))
") nohup npm --prefix "$gshop_dir" run dev -- --port 5173 --strictPort > "$log" 2>&1 < /dev/null &
pid=$!
stop() { pkill -P "$pid" 2>/dev/null || true; kill -9 "$pid" 2>/dev/null || true; }
trap stop EXIT
for _ in $(seq 1 60); do
  curl -s -m 2 -o /dev/null http://localhost:5173 && break
  sleep 0.5
done
code="$(curl -s -m 5 -o /dev/null -w '%{http_code}' http://localhost:5173 || true)"
[ "$code" = 200 ] || { echo "FAIL: gshop dev server -> $code (see $log)"; exit 1; }
echo "ok   gshop served on :5173"

echo "PASS: Phase 3 (Serving gshop) verified"
