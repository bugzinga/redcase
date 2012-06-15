
require 'test_helper'

class PluginInstallationITest < ActionController::IntegrationTest

    fixtures :users, :roles

    test "Redcase should be listes in plugins list" do
        get "/"
        assert_response :success

        get "/login"
        assert_response :success

        post_via_redirect "/login", :username => "admin", :password => "admin"
        get "admin/plugins"
        assert_response :success
        assert_tag :span, :content => "Redcase"
    end

end
