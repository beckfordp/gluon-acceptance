Feature: Dispatch failure (US-18)
  As a customer, if my order can't be dispatched, my payment authorization is
  released and I'm told, so I'm not left holding a reservation and a payment
  hold for an order that won't ship.

  Background:
    Given a product is in stock
    And I have bought it with card "4242 4242 4242 4242"
    And the operator opens order processing

  @US-18.1 @US-18.3 @US-18.5
  Scenario Outline: A problem reported while <state> fails the dispatch
    Given the operator has moved my order to "<state>"
    When the operator reports a problem: "Damaged in the warehouse"
    Then my order shows as "Dispatch failed"
    And it shows it wasn't dispatched because "Damaged in the warehouse"
    And its stock is released
    And my order history eventually shows status "Dispatch failed"

    Examples:
      | state   |
      | Pending |
      | Picking |
      | Packed  |

  @US-17.7
  Scenario: A problem can't be reported without a reason
    When the operator reports a problem: ""
    Then the operator is told "A reason is required"
    And my order shows as "Pending"
