#!/usr/bin/env bash
# Phase 3 (Failure paths, ACC-4.3) verification for account-checkout_20261031.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "Checkout failures \\(US-14\\)" 11 "Phase 3: Failure paths"
