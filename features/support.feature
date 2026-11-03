@support
Feature: Test data fixtures (ACC-2)
  Scenarios that set up data through the services' APIs. Every order a
  scenario creates is deleted afterwards; each run starts from a reset + seed.

  Scenario: An order placed through the API shows in the shopper's history
    Given a product is in stock
    And I have placed an order for it
    When I open my order history
    Then I see my order with status "Authorized"
