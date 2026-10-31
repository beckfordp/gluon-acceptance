#!/usr/bin/env bash
# Phase 1 (US-1 browse catalog, ACC-3.1) verification for browse-cart_20261031.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "@US-1\\." 3 "Phase 1: US-1 browse catalog"
