@smoke
Feature: Browse catalog (US-1)
  As a customer, I can browse a product catalog, so I can find items to buy.

  @US-1.1
  Scenario: The catalog shows products from the catalog service
    Given I open the shop
    When I browse the catalog
    Then I see products from the catalog
