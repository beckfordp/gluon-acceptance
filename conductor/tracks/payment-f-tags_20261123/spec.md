# Spec — PAY-F tags on the scenarios payment serves

Checkout tokenizes the card and authorizes (PAY-F1, PAY-F5), a declined card is retried
(PAY-F6), dispatch captures or fails the capture (PAY-F10, PAY-F11, and its email),
cancellation voids (PAY-F12) and the operator expires a hold (PAY-F9), so `--grep @PAY-F`
selects them.

Acceptance: `bin/run-acceptance --no-open --grep "@PAY-F"` (every service: the scenarios
place orders) green against payment-service-rs, ledger OK; full run 53/53.
