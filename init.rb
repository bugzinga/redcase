
require 'redmine'
require 'redcase'

Redmine::Plugin.register :redcase do

    name 'Redcase'
    description 'Test case management plugin for Redmine'
    version '1.0-alpha-2.26'
    url 'http://redcase.sourceforge.net'
    author 'Redcase Dev Team'

    permission :redcase, { :redcase => [ :index ] }, :public => true

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

    Redcase::Injection::run do
        if Redcase::System::rails3?
            ActionDispatch::Routing::Mapper.send :include, Redcase
        end
    end

end
