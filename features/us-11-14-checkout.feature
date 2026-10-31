Feature: Checkout (US-11 to US-14)
  As a customer, I enter my shipping and billing address and card, and my
  order is placed with its stock reserved and payment authorised.

  Background:
    Given a product is in stock
    And I am at checkout

  @US-11.2 @US-12.2 @US-13.3 @US-14.4
  Scenario: An anonymous shopper places an order
    When I place my order paying with card "4242 4242 4242 4242"
    Then my order is placed
    And my payment is authorized
    And the confirmation shows my shipping address and total
    And its stock is reserved
    And my order history eventually shows status "Authorized"

  @US-12.2
  Scenario: Billing address different from shipping
    When I enter my shipping address
    And I enter a different billing address
    And I pay with card "4242 4242 4242 4242"
    And I place my order
    Then my order is placed

  @US-16.5 @US-14.4
  Scenario: A signed-in customer's order is saved to their account
    Given I am a registered customer
    When I sign in
    And I place my order paying with card "4242 4242 4242 4242"
    Then my order is placed
    And my order is saved to my account
