#!/usr/bin/env bash
# Phase 2 (Dispatch failure, ACC-5.2) verification for fulfilment-capture_20261031.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "Dispatch failure \\(US-18\\)" 4 "Phase 2: Dispatch failure"
