# Spec — Acceptance 3: Browse and cart

## Overview
gluon PLAN.md ACC-3.1–3.2: Gherkin features accepting US-1 (browse catalog) and US-2 (add/remove items in a cart) through gshop against `gluon-local`, using Acceptance 2's fixtures.

## Functional Requirements
1. **US-1 feature** (`features/us-01-browse-catalog.feature`, `@US-1.1`):
   - existing smoke scenario (catalog shows catalog-service's products)
   - product details: every card on the first page shows the product's name, SKU and price (`$N.NN`, gshop's format) exactly as catalog-service returns them. gshop has no separate detail view; the card is the product detail
   - paging: "Load more" shows the next page (first 20, then up to 40), in catalog order
2. **US-2 feature** (`features/us-02-cart.feature`, `@US-2.1`), on a stocked first-page product:
   - add from the catalog: button reads "Added", cart shows the line with qty 1 and total = price
   - `+1`: qty 2, total = 2 × price
   - remove: the cart is empty ("Your cart is empty.")
   - a new shopper's cart is empty
3. **Page objects:** `CatalogPage` (card details, add to cart, load more), `CartPage` (lines, +1, remove, total, empty)
4. **Pure helper:** `formatPrice(cents)` mirroring gshop's `src/lib/format.ts` (unit-tested)
5. `stockedProduct` picks from catalog's first page so it's visible without paging

## Non-Functional Requirements
- Steps thin; assertions via web-first `expect`
- Inventory unchanged after the run (carts don't reserve stock)

## Acceptance Criteria
- `npx playwright test --grep "@US-1|@US-2"` green against gluon-local; inventory byte-identical before/after
- CI green

## Out of Scope
- US-1.2 (Redis read-through cache): not observable through the UI; recorded as out of scope in Acceptance 6's matrix
- Cart cleanup: carts live in Redis, are per browser identity, and are invisible to demo history/inventory
