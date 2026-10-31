#!/usr/bin/env bash
# Phase 2 (Checkout happy path, ACC-4.2) verification for account-checkout_20261031.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "Checkout \\(US-11 to US-14\\)" 3 "Phase 2: Checkout happy path"
