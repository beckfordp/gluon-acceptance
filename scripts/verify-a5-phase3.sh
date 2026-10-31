#!/usr/bin/env bash
# Phase 3 (Capture failure, ACC-5.3) verification for fulfilment-capture_20261031:
# the whole of Acceptance 5, both features.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "Fulfilment and capture \\(US-17, US-19\\)|Dispatch failure \\(US-18\\)" 7 "Phase 3: Capture failure"
