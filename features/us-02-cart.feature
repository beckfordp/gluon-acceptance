Feature: Add to cart (US-2)
  As a customer, I can add/remove items in a cart, so I can build an order
  before checking out.

  Background:
    Given a product is in stock
    And I open the shop
    And I browse the catalog

  @US-2.1
  Scenario: A new shopper's cart is empty
    When I view my cart
    Then my cart is empty

  @US-2.1
  Scenario: Adding a product puts it in my cart
    When I add it to my cart
    Then the product shows it was added
    When I view my cart
    Then my cart has it with quantity 1

  @US-2.1
  Scenario: Adding one more increases the quantity and total
    Given I have added it to my cart
    When I view my cart
    And I increase its quantity
    Then my cart has it with quantity 2

  @US-2.1
  Scenario: Removing the product empties my cart
    Given I have added it to my cart
    When I view my cart
    And I remove it from my cart
    Then my cart is empty
