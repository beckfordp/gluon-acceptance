# Spec — INV-F tags on the scenarios inventory serves

Checkout reserves (INV-F7), cancellation releases (INV-F12), dispatch ships (INV-F13) and
the admin console reads the ledger (INV-F11), so `--grep @INV-F` selects them.

Acceptance: `bin/run-acceptance --no-open --grep "@INV-F"` (every service: the scenarios
place orders) 10 passed against inventory-service-rs, ledger OK.
