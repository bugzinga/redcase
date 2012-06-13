require File.expand_path('../../../../test/test_helper', __FILE__)

class UnitTest < ActiveSupport::TestCase
  test "Redcase plugin should be in the Redmine plugins list" do
    assert_not_nil Redmine::Plugin.all.detect { |p| p.name == "Redcase" }
  end
end