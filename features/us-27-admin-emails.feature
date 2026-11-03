Feature: Customer record and email history (US-27, and every customer email)
  As an operator, I can open a customer's record and see their orders and
  every email we sent them, so I can answer "did you tell me?" without
  reading logs. Guests are known by the email they gave at checkout.

  Background:
    Given a product is in stock

  @US-27.1 @US-27.2 @US-27.4 @US-7.1 @US-17.5 @US-19.4
  Scenario: A guest's record shows their order and its emails
    Given I have bought it with card "4242 4242 4242 4242"
    And the operator picks, packs and dispatches my order
    And my order history eventually shows status "Confirmed"
    When the operator opens my customer record
    Then it shows my order as "confirmed"
    And it lists the emails "Your order has shipped", "Your payment was received" and "Your order is confirmed"

  @US-19.4 @US-7.1
  Scenario: A card declined at capture is emailed
    Given I have bought it with card "5555 5555 5555 4444"
    And the operator picks, packs and dispatches my order
    And my order history eventually shows status "Payment failed"
    When the operator opens my customer record
    Then it lists the emails "We couldn't take your payment" and "We couldn't process your payment"

  @US-18.4
  Scenario: A failed dispatch is emailed
    Given I have bought it with card "4242 4242 4242 4242"
    And the operator opens order processing
    And the operator reports a problem: "Damaged in the warehouse"
    And my order history eventually shows status "Dispatch failed"
    When the operator opens my customer record
    Then it lists the email "We couldn't ship your order"

  @US-9.9 @US-20.5
  Scenario Outline: The cancellation email says why: <why>
    Given I have bought it with card "4242 4242 4242 4242"
    And my order is cancelled by "<who>"
    When the operator opens my customer record
    Then the email "Your order was cancelled" says "<copy>"

    Examples:
      | why                      | who          | copy                                                     |
      | I asked                  | me           | was cancelled at your request.                           |
      | support cancelled it     | the operator | was cancelled by our support team.                       |
      | the payment hold ran out | expiry       | was cancelled because its payment authorization expired. |

  @US-16.4 @US-27.4
  Scenario: A registered customer's record shows their welcome email
    Given I am a registered customer
    And I am at checkout
    When I sign in
    And I place my order paying with card "4242 4242 4242 4242"
    And my order is placed
    And the operator opens my customer record
    Then it lists the email "Welcome to gshop"
