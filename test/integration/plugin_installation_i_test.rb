
require File.expand_path(File.dirname(__FILE__) + '/../test_helper')

class PluginInstallationITest < ActionController::IntegrationTest

    fixtures :users, :roles

    test "Redcase must be listed in the plugins list" do
        log.info ''
        log.info 'Loading Redmine'
        get "/"
        assert_response :success
        log.info 'Opening the login page'
        get "/login"
        assert_response :success
        log.info 'Logging in as an administrator'
        post_via_redirect "/login", :username => "admin", :password => "admin"
        assert_response :success
        log.info 'Opening the plugins page'
        get "admin/plugins"
        assert_response :success
        log.info 'Checking if there is Redcase plugin on the page'
        assert_tag :span, :content => "Redcase"
    end

end
