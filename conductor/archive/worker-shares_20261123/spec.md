# Spec — each worker picks from its own share of the catalog

`pickStockedProduct` indexed the products with enough stock by the worker's
`parallelIndex`, so when one worker's product dropped below what's needed (the sold-out
scenario sets it to 1 or 0) the candidates shifted and two workers could share a SKU:
"Cancelling while Packed stops fulfilment" then read another worker's stock (gluon
all-Rust Stage A, open O1; seen twice in three full runs).

Each worker now picks only from its own share of the catalog page (positions `worker`,
`worker + workers`, …, by catalog position, before any stock filter), first with enough
stock, or last for `otherStockedProduct`; shares never overlap however stock moves.

Acceptance: unit tests red first; full run 53/53.
