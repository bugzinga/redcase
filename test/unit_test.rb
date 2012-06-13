require 'test_helper'

class UnitTest < ActiveSupport::TestCase
  test "Redcase plugin should be in the Redmine plugins list" do
    assert_not_nil Redmine::Plugin.all.detect { |p| p.name == "Redcase" }
  end
end