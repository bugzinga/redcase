
require File.expand_path(File.dirname(__FILE__) + '/../test_helper')

class PluginTabsITest < ActionController::IntegrationTest

    fixtures :users, :roles, :projects
    load_redcase_fixtures

    test 'Redcase tab should be in the project menu and all three tabs should be displayed' do
        log.info ''
        log.info 'Loading Redmine'
        get '/'
        assert_response :success
        log.info 'Opening the login page'
        get '/login'
        assert_response :success
        user = User.find_by_mail("rhill@somenet.foo")
        log.info "Logging in as an #{user.firstname} #{user.lastname}"
        post_via_redirect '/login', :username => user.login, :password => 'foo'
        assert_response :success
        log.info 'Opening project Redcase'
        project = Project.find_by_name('Redcase')
        assert_not_nil project
        log.info "Loading the project page and check if '#{l(:redcase_i18n_tab)}' tab appeared there"
        get "/projects/#{project.identifier}"
        assert_response :success
        assert_select 'a.redcase', l(:redcase_i18n_tab)
        log.info "Opening '#{l(:redcase_i18n_tab)}' tab"
        get "/redcase?project_id=#{project.identifier}"
        assert_response :success
        assert_select 'a#tab-Management', l(:redcase_i18n_tab_management)
        assert_select 'a#tab-Execution', l(:redcase_i18n_tab_execution)
        assert_select 'a#tab-Report', l(:redcase_i18n_tab_report)
    end

end
