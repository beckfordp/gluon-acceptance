Feature: Fulfilment and capture (US-17, US-19)
  As a customer, once my payment is authorized my order is picked, packed and
  dispatched, and my card is only charged once it ships.

  Background:
    Given a product is in stock

  @US-17.1 @US-17.2 @US-17.7
  Scenario: An operator picks, packs and dispatches my order
    Given I have bought it with card "4242 4242 4242 4242"
    When the operator opens order processing
    Then my order shows as "Pending"
    When the operator starts picking it
    Then my order shows as "Picking"
    When the operator packs it
    Then my order shows as "Packed"
    When the operator dispatches it
    Then my order shows as "Dispatched"
    And it shows the carrier and tracking number

  @US-17.4 @US-19.1 @US-19.2 @US-19.5
  Scenario: My payment is captured once my order is dispatched
    Given I have bought it with card "4242 4242 4242 4242"
    When the operator picks, packs and dispatches my order
    Then my order history eventually shows status "Confirmed"

  @US-19.1 @US-19.3 @US-19.5
  Scenario: A card declined at capture leaves my order with payment failed
    Given I have bought it with card "5555 5555 5555 4444"
    When the operator picks, packs and dispatches my order
    Then my order history eventually shows status "Payment failed"
