require 'test_helper'

class PluginTabsTest < ActionController::IntegrationTest
    fixtures :users, :roles, :projects

    test "Redcase should be listes in plugins list" do
        get "/"
        assert_response :success
        
        get "/login"
        assert_response :success
        
        post_via_redirect "/login", :username => "admin", :password => "admin"
        assert_response :success
        
        get "/projects/ecookbook"
        assert_response :success
        assert_select 'a.redcase', I18n.translate('redcase_tab_title')
    end

end
