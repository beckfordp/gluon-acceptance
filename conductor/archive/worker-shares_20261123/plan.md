# Plan

- [x] Task 1: unit tests (shares by catalog position, disjoint whatever the stock; from the end; exclude) red first (3 failed), then `pickStockedProduct` and the fixtures db6ab6f
- [x] Task 2: full run 53/53 (gluon docs/ports/evidence/user-service/acceptance-full.txt; the race run kept as acceptance-full-1-race.txt)

## Review

Self-review: shares are by catalog position so stock changes can't move a worker into another's share; `otherStockedProduct` takes the far end of the same share, excluding the first. No findings.
