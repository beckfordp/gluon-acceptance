#!/usr/bin/env bash
# Phase 2 (Runner, ACC-6.2) verification for traceability-runner_20261031:
# gluon's bin/run-acceptance runs the whole suite green, with the coverage
# matrix complete and inventory unchanged.
#   scripts/verify-a6-phase2.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p target
log=target/verify-a6-phase2.log

../../bin/run-acceptance --no-open > "$log" 2>&1 \
  || { echo "FAIL: bin/run-acceptance exited non-zero (see $log)"; exit 1; }
grep -q "0 missing" "$log" || { echo "FAIL: coverage matrix incomplete (see $log)"; exit 1; }
echo "ok   $(grep -E 'coverage matrix:' "$log")"
grep -E "^\s+[0-9]+ passed" "$log" | sed 's/^ */ok   /'
if grep -qE "^\s+[0-9]+ (failed|flaky|skipped|did not run)" "$log"; then
  echo "FAIL: not every scenario passed (see $log)"; exit 1
fi
if grep -q "^WARN: inventory changed" "$log"; then
  echo "FAIL: inventory changed (see $log)"; exit 1
fi
echo "ok   inventory unchanged"
echo "PASS: Phase 2: Runner verified"
