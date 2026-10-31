Feature: Checkout failures (US-14)
  A declined card, stock that runs out, or an invalid form stops checkout
  with a message saying why, and no order is created until it's put right.

  Background:
    Given a product is in stock

  @US-14.2 @US-14.4
  Scenario Outline: A declined card can be retried with another
    Given I am at checkout
    When I place my order paying with card "<declined card>"
    Then my payment is declined
    And no order was created
    When I pay with card "<approved card>"
    And I place my order
    Then my order is placed

    Examples:
      | declined card       | approved card       |
      | 4000 0000 0000 0002 | 4242 4242 4242 4242 |

  @US-14.2 @US-14.4
  Scenario Outline: An item that sold out (<available> left) can be removed and the rest ordered
    Given I am at checkout with 2 of it and 1 of another product
    When only <available> of it is left in stock
    And I place my order paying with card "4242 4242 4242 4242"
    Then it can't be reserved for insufficient stock
    And no order was created
    When I remove it from my cart and place my order again
    Then my order is placed for the other product only

    Examples:
      | available |
      | 0         |
      | 1         |

  @US-11.2 @US-13.3
  Scenario Outline: An invalid <field> is caught before ordering: "<message>"
    Given I am at checkout
    When I place my order with "<field>" set to "<value>"
    Then I see "<message>"
    And no order was created

    Examples:
      | field          | value | message                                  |
      | Address line 1 |       | Enter the first line of the address      |
      | City           |       | Enter a city                             |
      | Postcode       |       | Enter a postcode                         |
      | Country        | G     | Use a two-letter country code (e.g. GB)  |
      | Card number    |       | Enter a card number                      |
      | Card number    | 4242  | Card number must be 12 to 19 digits      |
      | Expiry date    |       | Enter the expiry date                    |
      | Expiry date    | 01/20 | Enter a valid future expiry date (MM/YY) |
