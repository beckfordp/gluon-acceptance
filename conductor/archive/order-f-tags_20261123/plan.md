# Plan

- [x] Task 1: tags; `--grep @ORDER-F` 21/21 against order-service-rs, ledger OK; full run 53/53 first time (gluon docs/ports/evidence/order-service/acceptance-order-f.txt, acceptance-full.txt) f1d820a

## Review

Self-review: tags only, each on a scenario that exercises the row (checkout F1/F5, sold out F3, decline F4, history F6, console list F7, cancels F8, refused cancels F9, capture F11, capture decline F12, expiry F13, dispatch and its failure F14); lint and typecheck clean, unit 52/52. No findings.
