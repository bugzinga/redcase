
require 'redmine'
require 'redcase'

I18n.load_path << Dir[File.dirname(__FILE__) + "/config/locales/*.{rb,yml}"]

Redmine::Plugin.register :redcase do

    name 'Redcase'
    description 'Test case management plugin for Redmine'
    version '1.0-alpha-2.38'
    url 'http://redcase.sourceforge.net'
    author 'Redcase Dev Team'

    permission ::I18n.t(:redcase_i18n_permission_manage), :redcase => :index, :require => :member
    permission ::I18n.t(:redcase_i18n_permission_execute), :redcase => :index, :require => :member
    permission ::I18n.t(:redcase_i18n_permission_view), :redcase => :index, :require => :member

    menu :project_menu,
         :redcase,
         {
             :controller => 'redcase',
             :action     => 'index'
         },
         {
             :param   => :project_id,
             :caption => ::I18n.t(:redcase_i18n_tab),
             :after   => :new_issue
         }

    Redcase::Patch::run do
        # TODO: injection in Redmine entities
    end

end
