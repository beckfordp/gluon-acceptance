#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Phase 1 (Account, ACC-4.1) verification for account-checkout_20261031.
set -euo pipefail
exec "$(dirname "$0")/verify-features.sh" "@US-16\\." 6 "Phase 1: Account"
