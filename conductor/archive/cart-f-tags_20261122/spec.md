# Spec — CART-F tags on the cart scenarios

Each us-02 scenario also carries the tests/contract CART-F rows it exercises, so a staged
run selects them (`--grep @CART-F`). The coverage matrix reads only `@US-N.M` tags.

Acceptance: `ACCEPTANCE_SERVICES=cart bin/run-acceptance --grep @CART-F` 4 passed.
