Feature: Catalogue stock (US-28)
  As an operator, I can see each product's stock in the catalogue and adjust
  it by one, and the change is saved to inventory.

  Background:
    Given a product is in stock

  @US-28.1
  Scenario: The operator adds and removes one unit of stock
    When the operator finds the product in the catalogue
    Then the catalogue shows its stock
    When the operator adds one to its stock
    Then the catalogue and inventory both show 1 more available
    When the operator removes one from its stock
    Then the catalogue and inventory both show 0 more available
