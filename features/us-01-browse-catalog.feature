Feature: Browse catalog (US-1)
  As a customer, I can browse a product catalog, so I can find items to buy.

  Background:
    Given I open the shop
    When I browse the catalog

  @US-1.1 @smoke
  Scenario: The catalog shows products from the catalog service
    Then I see products from the catalog

  @US-1.1
  Scenario: Each product shows its name, SKU and price
    Then each product shows its name, SKU and price

  @US-1.1
  Scenario: Loading more shows the next page of the catalog
    When I load more products
    Then I see the first two pages of the catalog in order
