#!/usr/bin/env bash
# Phase 1 (Coverage matrix, ACC-6.1) verification for traceability-runner_20261031:
# CI checks and coverage green, and the matrix complete (no done task missing).
#   scripts/verify-a6-phase1.sh
set -euo pipefail
cd "$(dirname "$0")/.."

major="$(node -v | sed 's/^v\([0-9]*\).*/\1/')"
[ "$major" -ge 24 ] || { echo "FAIL: node $(node -v); need 24 (nvm use)"; exit 1; }
mkdir -p target

echo "== CI checks =="
npx bddgen < /dev/null
npm run -s lint
npm run -s typecheck
npm run -s test:coverage < /dev/null > target/verify-a6-phase1.log 2>&1 \
  || { echo "FAIL: unit tests/coverage (see target/verify-a6-phase1.log)"; exit 1; }
echo "ok   unit tests and coverage"

echo "== Coverage matrix =="
npm run -s coverage:matrix || { echo "FAIL: matrix has problems (see target/coverage-matrix.md)"; exit 1; }
grep -q "Missing: 0 " target/coverage-matrix.md || { echo "FAIL: done tasks missing from the matrix"; exit 1; }
echo "ok   every done task covered or out of scope"
echo "PASS: Phase 1: Coverage matrix verified"
