#!/usr/bin/env bash
# Phase 2 (API helpers, fixtures, cleanup, precheck; ACC-2.1–2.3) verification
# for fixtures-test-data_20261031: CI checks green, the @support feature
# passes, inventory is byte-identical before and after, the scenario's orders
# are gone, and the precheck stops a run when a service is unreachable.
#   scripts/verify-a2-phase2.sh
set -euo pipefail
cd "$(dirname "$0")/.."

major="$(node -v | sed 's/^v\([0-9]*\).*/\1/')"
[ "$major" -ge 24 ] || { echo "FAIL: node $(node -v); need 24 (nvm use)"; exit 1; }
mkdir -p target

echo "== CI checks =="
npx bddgen < /dev/null
npm run -s lint
npm run -s typecheck
npm test --silent 2>&1 | grep -E "Tests " | sed 's/^ */ok   /'

if curl -s -m 2 -o /dev/null http://localhost:5173; then
  echo "FAIL: :5173 already in use; stop that server first"; exit 1
fi

echo "== @support feature with cleanup =="
scripts/inventory-snapshot.sh > target/inventory-before.txt
npx playwright test --grep @support --reporter=json < /dev/null > target/verify-a2-phase2.json 2> target/verify-a2-phase2.err \
  || { echo "FAIL: @support run failed (see target/verify-a2-phase2.err)"; exit 1; }
scripts/inventory-snapshot.sh > target/inventory-after.txt
cmp -s target/inventory-before.txt target/inventory-after.txt \
  || { echo "FAIL: inventory changed:"; diff target/inventory-before.txt target/inventory-after.txt; exit 1; }
echo "ok   @support passed; $(wc -l < target/inventory-after.txt | tr -d ' ') inventory rows byte-identical"
# Every order the scenario placed (its `order` annotations) must now 404.
ids="$(node --input-type=module -e "
  import { readFileSync } from 'node:fs'
  const ids = []
  const walk = (s) => {
    for (const spec of s.specs ?? []) for (const t of spec.tests)
      for (const a of t.annotations ?? []) if (a.type === 'order') ids.push(a.description)
    for (const c of s.suites ?? []) walk(c)
  }
  JSON.parse(readFileSync('target/verify-a2-phase2.json', 'utf8')).suites.forEach(walk)
  console.log(ids.join(' '))
")"
[ -n "$ids" ] || { echo "FAIL: no order annotations in the report"; exit 1; }
for id in $ids; do
  code="$(curl -s -m 5 -o /dev/null -w '%{http_code}' "http://order-service.gluon-local.svc.cluster.local:8080/orders/$id")"
  [ "$code" = 404 ] || { echo "FAIL: order $id -> $code (not cleaned up)"; exit 1; }
done
echo "ok   scenario orders deleted: $ids"

echo "== Precheck fails fast =="
out="$(ORDER_URL=http://localhost:1 npx playwright test --grep @support < /dev/null 2>&1 || true)"
grep -q "Acceptance precheck failed (1 problem)" <<< "$out" \
  && grep -q "order-service not ready at http://localhost:1/health/ready" <<< "$out" \
  || { echo "FAIL: precheck didn't stop the run"; echo "$out" | head -20; exit 1; }
grep -q "passed" <<< "$out" && { echo "FAIL: scenarios ran despite failed precheck"; exit 1; }
echo "ok   unreachable order-service stops the run before any scenario"

if curl -s -m 2 -o /dev/null http://localhost:5173; then
  echo "FAIL: gshop dev server still running on :5173"; exit 1
fi
echo "PASS: Phase 2 (API helpers, fixtures, cleanup, precheck) verified"
