# Spec — FUL-F tags on the scenarios fulfilment serves

PaymentAuthorized makes the task the operator lists and moves (FUL-F1, FUL-F5, FUL-F6);
dispatch records the carrier and drives capture (FUL-F7); a reported problem fails the
dispatch, a blank reason is refused (FUL-F8); a cancellation, by the customer, the
operator or an expired authorization, aborts the task (FUL-F10). So `--grep @FUL-F`
selects them.

Acceptance: `bin/run-acceptance --no-open --grep "@FUL-F"` green against
fulfilment-service-rs, ledger OK; full run 53/53.
