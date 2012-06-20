
require 'redmine'
require 'redcase'

Redmine::Plugin.register :redcase do

    name 'Redcase'
    description 'Test case management plugin for Redmine'
    version '1.0-alpha-2.36'
    url 'http://redcase.sourceforge.net'
    author 'Redcase Dev Team'

    permission :redcase_management, :redcase => :index, :require => :member
    permission :redcase_execution, :redcase => :index, :require => :member
    permission :redcase_report, :redcase => :index, :require => :member

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
