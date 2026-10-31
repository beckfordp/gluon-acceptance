Feature: Account (US-16)
  As a customer, I can sign up and log in, so my identity is established
  before I check out. gshop offers both from the checkout screen.

  Background:
    Given a product is in stock
    And I am at checkout

  @US-16.1 @US-16.5
  Scenario: Creating an account signs me in
    When I create an account with a new email
    Then I am signed in

  @US-16.2 @US-16.5
  Scenario: Signing in and out
    Given I am a registered customer
    When I sign in
    Then I am signed in
    When I sign out
    Then I am signed out

  @US-16.2
  Scenario: A wrong password is rejected
    Given I am a registered customer
    When I sign in with a wrong password
    Then the sign-in fails with "Email or password is incorrect"

  @US-16.1
  Scenario: An email can only be registered once
    Given I am a registered customer
    When I create an account with my email
    Then the sign-in fails with "An account with this email already exists"

  @US-16.5
  Scenario: Passwords must match when creating an account
    When I create an account with passwords that don't match
    Then I see "Passwords must match"
