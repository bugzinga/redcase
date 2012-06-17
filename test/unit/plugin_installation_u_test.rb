
require File.expand_path(File.dirname(__FILE__) + '/../test_helper')

class PluginInstallationUTest < ActiveSupport::TestCase

    test "Redcase plugin must be in the Redmine plugins list" do
        assert_not_nil Redmine::Plugin.all.detect { |p| p.name == "Redcase" }
    end

end
