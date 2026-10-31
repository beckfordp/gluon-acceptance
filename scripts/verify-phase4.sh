#!/usr/bin/env bash
# Phase 4 (Smoke feature, ACC-1.3) verification for suite-scaffold_20261031:
# CI checks green, catalog seeded, the @smoke feature passes against
# gluon-local with Gherkin steps in the report, and gshop's dev server is
# gone afterwards.
#   scripts/verify-phase4.sh
set -euo pipefail
cd "$(dirname "$0")/.."

major="$(node -v | sed 's/^v\([0-9]*\).*/\1/')"
[ "$major" -ge 24 ] || { echo "FAIL: node $(node -v); need 24 (nvm use)"; exit 1; }

echo "== CI checks =="
npx bddgen < /dev/null
npm run -s lint
npm run -s typecheck
npm test --silent 2>&1 | grep -E "Tests " | sed 's/^ */ok   /'

echo "== Catalog seeded =="
total="$(curl -s -m 5 -D - -o /dev/null \
  'http://catalog-service.gluon-local.svc.cluster.local:8080/catalogs?limit=1&offset=0' \
  | sed -n 's/^[Xx]-[Tt]otal-[Cc]ount: *\([0-9]*\).*/\1/p')"
[ "${total:-0}" -gt 0 ] || {
  echo "FAIL: catalog empty; run catalog-service scripts/seed-watches.sh"; exit 1; }
echo "ok   $total catalog items"

echo "== Smoke feature =="
if curl -s -m 2 -o /dev/null http://localhost:5173; then
  echo "FAIL: :5173 already in use; stop that server first"; exit 1
fi
mkdir -p target
npx playwright test --grep @smoke --reporter=json < /dev/null > target/verify-phase4.json 2> target/verify-phase4.err \
  || { echo "FAIL: smoke run failed (see target/verify-phase4.err)"; exit 1; }
node --input-type=module -e "
  import { readFileSync } from 'node:fs'
  const report = JSON.parse(readFileSync('target/verify-phase4.json', 'utf8'))
  const steps = []
  const walk = (s) => {
    for (const spec of s.specs ?? []) for (const t of spec.tests) for (const r of t.results)
      for (const st of r.steps ?? []) steps.push(st.title)
    for (const c of s.suites ?? []) walk(c)
  }
  report.suites.forEach(walk)
  const want = ['Given I open the shop', 'When I browse the catalog', 'Then I see products from the catalog']
  const missing = want.filter((w) => !steps.includes(w))
  if (report.stats.expected < 1 || report.stats.unexpected > 0 || missing.length > 0) {
    console.log('FAIL: stats', JSON.stringify(report.stats), 'missing steps', missing); process.exit(1)
  }
  console.log('ok   smoke passed; report steps: ' + want.join(' / '))
"
if curl -s -m 2 -o /dev/null http://localhost:5173; then
  echo "FAIL: gshop dev server still running on :5173"; exit 1
fi
echo "ok   gshop dev server stopped"

echo "PASS: Phase 4 (Smoke feature) verified"
