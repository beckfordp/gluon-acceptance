#!/usr/bin/env bash
# Phase 1 (Pick, pack, dispatch, ACC-5.1) verification for fulfilment-capture_20261031.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "Fulfilment and capture \\(US-17, US-19\\)" 4 "Phase 1: Pick, pack, dispatch"
