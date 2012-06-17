
require File.expand_path(File.dirname(__FILE__) + '/../test_helper')

#require 'test_helper'

class PluginTabsITest < RedcaseIntegrationTest

    fixtures :users, :roles, :projects

    # TODO: a temporary test, should be modified after the plugin rights
    #       implementations as the tab behaviour will be changed 
    test 'Redcase tab must be in the project menu' do
        @log.info ''
        @log.info 'Loading Redmine'
        get '/'
        assert_response :success
        @log.info 'Opening the login page'
        get '/login'
        assert_response :success
        @log.info 'Logging in as an administrator'
        post_via_redirect '/login', :username => 'admin', :password => 'admin'
        assert_response :success
        @log.info 'Finding a random project'
        project = Project.first
        assert_not_nil project
        @log.info "Project found: '#{project.name}' "
        @log.info "Loading the project page and check if '#{l(:redcase_i18n_tab)}' tab appeared there"
        get "/projects/#{project.name}"
        assert_response :success
        assert_select 'a.redcase', l(:redcase_i18n_tab)
    end

end
