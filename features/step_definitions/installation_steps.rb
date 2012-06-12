Given /^I logged in as admin$/ do
  visit "/"
  click_link "Sign in"
  fill_in "Login", :with => "admin"
  fill_in "Password", :with => "admin"
  click_button "Login"
  page.should have_no_content("Invalid")
end

When /^I open plugins list$/ do
  click_link "Administration"
  click_link "Plugins"
end

Then /^Redcase should be in the Redmine plugins collection$/ do
  Redmine::Plugin.all.detect { |p| p.name == "Redcase" }.should_not be_nil
end

Then /^I should see Redcase in the list of plugins$/ do
  page.should have_content("Redcase")
end