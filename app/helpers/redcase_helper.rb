
module RedcaseHelper

    include ApplicationHelper

    def get_plugin_tabs
        [
            { :name => 'Management', :partial => 'redcase/management', :label => :redcase_i18n_tab_management },
            { :name => 'Execution', :partial => 'redcase/execution', :label => :redcase_i18n_tab_execution },
            { :name => 'Report', :partial => 'redcase/report', :label => :redcase_i18n_tab_report }
        ]
    end

end
