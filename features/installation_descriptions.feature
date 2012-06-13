Feature: Redcase Plugin Installation

  So that I installed Redcase plugin
  As an admin
  I want to see that Redcase has been installed correctly
  
  Scenario: Redcase in the plugins list
    Given I logged in as admin
    When I open plugins list
    Then I should see Redcase in the list of plugins