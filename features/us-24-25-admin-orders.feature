Feature: Operator order console (US-24, US-25, US-22, US-20)
  As an operator, I see every order with its reserved stock and fulfilment,
  and I can cancel an order or expire its payment authorization, watching
  each service release its side.

  Background:
    Given a product is in stock
    And I have bought it with card "4242 4242 4242 4242"

  @US-24.1 @US-24.2 @US-24.3 @US-27.3
  Scenario: The operator sees my order, its customer and its reserved stock
    When the operator opens the console
    Then the console lists my order as "authorized" for my guest email
    When the operator opens my order in the console
    Then the console shows my order "authorized" with fulfilment "PENDING" and its stock "active"

  # Waits for fulfilment to have the order before acting: a cancel that beats
  # the task's creation leaves it Pending (gluon TD-23).
  @US-22.2 @US-22.4 @US-25.2
  Scenario: The operator cancels my order
    Given the operator opens my order in the console
    And the console shows my order "authorized" with fulfilment "PENDING" and its stock "active"
    When the operator cancels it from the console
    Then the console shows my order "cancelled" with fulfilment "CANCELLED" and its stock "released"
    And its stock is released
    And my order history eventually shows status "Cancelled"

  @US-20.1 @US-20.2 @US-20.3 @US-20.4 @US-20.6 @US-25.1 @US-25.2
  Scenario: The operator expires my payment authorization
    Given the operator opens my order in the console
    And the console shows my order "authorized" with fulfilment "PENDING" and its stock "active"
    When the operator expires its payment authorization
    Then the console shows my order "cancelled" with fulfilment "CANCELLED" and its stock "released"
    And its stock is released
    And my order history eventually shows status "Cancelled"

  @US-22.4 @US-25.2
  Scenario: A shipped order can't be cancelled from the console
    Given the operator picks, packs and dispatches my order
    And my order history eventually shows status "Confirmed"
    When the operator opens my order in the console
    Then the console offers no cancel or expiry, saying "Past cancelling — returns/refunds are out of scope (US-23)."
