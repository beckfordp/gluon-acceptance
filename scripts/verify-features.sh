#!/usr/bin/env bash
# Runs a tagged slice of the suite against gluon-local and checks it: CI checks
# green, every expected scenario passed (none failed or skipped), inventory
# byte-identical before and after, gshop's dev server gone afterwards.
#   scripts/verify-features.sh <grep> <expected-scenarios> <label>
#   e.g. scripts/verify-features.sh "@US-1" 3 "US-1 browse catalog"
set -euo pipefail
cd "$(dirname "$0")/.."
grep_expr="$1"; expected="$2"; label="$3"
slug="$(tr -c 'A-Za-z0-9' '-' <<< "$grep_expr" | sed 's/-*$//')"

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

echo "== $label ($grep_expr) =="
scripts/inventory-snapshot.sh > "target/verify-$slug-inventory-before.txt"
report="target/verify-$slug.json"
npx playwright test --grep "$grep_expr" --reporter=json < /dev/null > "$report" 2> "target/verify-$slug.err" \
  || { echo "FAIL: run failed (see $report, npx playwright show-report)"; exit 1; }
node --input-type=module -e "
  import { readFileSync } from 'node:fs'
  const { stats } = JSON.parse(readFileSync('$report', 'utf8'))
  if (stats.expected !== $expected || stats.unexpected + stats.flaky + stats.skipped > 0) {
    console.log('FAIL: wanted $expected passed, got', JSON.stringify(stats)); process.exit(1)
  }
  console.log('ok   ' + stats.expected + ' scenarios passed')
"
scripts/inventory-snapshot.sh > "target/verify-$slug-inventory-after.txt"
cmp -s "target/verify-$slug-inventory-before.txt" "target/verify-$slug-inventory-after.txt" || {
  echo "FAIL: inventory changed:"
  diff "target/verify-$slug-inventory-before.txt" "target/verify-$slug-inventory-after.txt"; exit 1; }
echo "ok   inventory byte-identical"

if curl -s -m 2 -o /dev/null http://localhost:5173; then
  echo "FAIL: gshop dev server still running on :5173"; exit 1
fi
echo "PASS: $label verified"
