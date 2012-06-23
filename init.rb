
require 'redmine'
require 'redcase'

Redmine::Plugin.register :redcase do

    name 'Redcase'
    description 'Test case management plugin for Redmine'
    version '1.0-alpha-2.41'
    url 'http://redcase.sourceforge.net'
    author 'Redcase Dev Team'

    permission :manage_test_cases, :redcase => :index, :require => :member
    permission :execute_test_cases, :redcase => :index, :require => :member
    permission :view_test_results, :redcase => :index, :require => :member

    menu :project_menu,
         :redcase,
         {
             :controller => 'redcase',
             :action     => 'index'
         },
         {
             :param   => :project_id,
             :caption => :redcase_i18n_tab,
             :after   => :new_issue
         }

    Redcase::Patch::run do
        # TODO: injection in Redmine entities
    end

end
