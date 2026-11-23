# Spec — ORDER-F tags on the scenarios order serves

Checkout places the order (ORDER-F1) and shows it (ORDER-F5); a sold-out line is refused
(ORDER-F3) and a declined card retried (ORDER-F4); the signed-in history lists it
(ORDER-F6); the console lists orders (ORDER-F7); the customer and operator cancel
(ORDER-F8) and a shipped order can't be (ORDER-F9); capture confirms (ORDER-F11), a
capture decline fails the order (ORDER-F12), the operator's expiry cancels it
(ORDER-F13), dispatch and its failure move it (ORDER-F14). So `--grep @ORDER-F` selects
them.

Acceptance: `bin/run-acceptance --no-open --grep "@ORDER-F"` green against
order-service-rs, ledger OK; full run 53/53.
