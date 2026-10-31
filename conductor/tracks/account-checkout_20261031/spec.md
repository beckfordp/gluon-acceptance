# Spec — Acceptance 4: Account and checkout

## Overview
gluon PLAN.md ACC-4.1–4.3: Gherkin features accepting US-16 (sign up, sign in, sign out) and the US-11–14 checkout journey (shipping/billing address, card, authorize) through gshop, with the failure paths as `Scenario Outline`s. gshop's auth lives in a dialog on the Checkout screen, so every scenario starts with a stocked product in the cart, at checkout.

## Functional Requirements
1. **US-16 feature** (`features/us-16-account.feature`):
   - `@US-16.1 @US-16.5` create an account with a new email → "Signed in as {email}"
   - `@US-16.2 @US-16.5` sign in as a registered customer → signed in; sign out → "Sign in" offered again
   - `@US-16.2` wrong password → "Email or password is incorrect"
   - `@US-16.1` an email already registered → "An account with this email already exists"
   - `@US-16.5` mismatched confirm password → "Passwords must match" (client-side)
2. **Checkout feature** (`features/us-11-14-checkout.feature`):
   - `@US-11.2 @US-12.2 @US-13.3 @US-14.4` anonymous checkout with the approve card → "Order placed", "Status: Authorized", "Payment authorised", shipping address and total on confirmation; stock reserved; order history shows it `Authorized`
   - `@US-12.2` billing address different from shipping → order placed
   - `@US-16.5 @US-14.4` a signed-in customer's order shows in history under their account
3. **Failure paths (`Scenario Outline`s)** in `features/us-14-checkout-failures.feature`:
   - decline (402): card `4000 0000 0000 0002` → "Payment declined: … Try another card and submit again."; no order; retry with `4242…` → order placed
   - out of stock (409): stock set below the cart quantity via the API (Examples: available 0 and 1, cart qty 2), a second product in the cart → "{name}: insufficient stock"; "Remove {name} from cart", submit again → order placed for the other product
   - validation (400, caught client-side): one Example per field rule (address line 1, city, postcode, country, card number empty/short, expiry empty/past) → the field's message; no order created
4. **Support:** `CheckoutPage`, `AuthDialog`, `ConfirmationPage` page objects; `stockedProduct` carries its stock snapshot, plus `otherStockedProduct`; `orders.record(id)` adds a UI-placed order (fetched via the API) to the scenario's orders; UI sign-ups are tracked for cleanup (session read from `gshop:authSession`)

## Non-Functional Requirements
- Inventory byte-identical before/after (out-of-stock scenarios restore via snapshot)
- No order left behind (decline/validation create none; placed ones cleaned up)

## Acceptance Criteria
- `@US-16`, `@US-11`…`@US-14` scenarios green against gluon-local; inventory identical; CI green

## Out of Scope
- US-16.3/16.4 (`UserRegistered` event, welcome email): not UI-observable; matrix (ACC-6.1)
- Server-side `400`s: gshop validates first, so they can't be reached through the UI
