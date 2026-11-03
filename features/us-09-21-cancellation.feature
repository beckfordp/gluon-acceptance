Feature: Cancellation (US-9, US-21)
  As a customer, I can cancel an order until it ships: the payment hold and
  reserved stock are released and fulfilment stops. Once it has shipped, I'm
  told it's past cancelling.

  Background:
    Given a product is in stock
    And I have bought it with card "4242 4242 4242 4242"

  @US-9.1 @US-9.4 @US-9.8
  Scenario: I cancel my authorized order
    When I cancel my order from my order history
    Then I see my order with status "Cancelled"
    And its stock is released

  @US-9.5
  Scenario Outline: Cancelling while <state> stops fulfilment
    Given the operator opens order processing
    And the operator has moved my order to "<state>"
    When I cancel my order from my order history
    Then the operator sees my order as "Cancelled"
    And its stock is released

    Examples:
      | state   |
      | Pending |
      | Picking |
      | Packed  |

  @US-21.1 @US-21.5
  Scenario: I can't cancel once my order has shipped
    Given I open my order history
    And meanwhile the operator picks, packs and dispatches my order
    When I try to cancel it
    Then I'm told it's past cancelling and pointed at returns
    And my order is still "Confirmed"
