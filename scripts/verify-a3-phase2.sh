#!/usr/bin/env bash
# Phase 2 (US-2 cart, ACC-3.2) verification for browse-cart_20261031: the
# whole Acceptance 3 slice (US-1 and US-2) green, inventory untouched.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "@US-[12]\\." 7 "Phase 2: US-2 cart (with US-1)"
