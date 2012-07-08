
module RedcaseHelper

    include ApplicationHelper

    def get_redcase_inner_tabs(project)
        tabs = []
        if (project.trackers.find_by_name(::I18n.t(:redcase_i18n_tracker)))
            if User.current.allowed_to?(:redcase_manage_test_cases, project)
                tabs << { :name => 'Management', :partial => 'redcase/management', :label => :redcase_i18n_tab_management }
            end
            if User.current.allowed_to?(:redcase_execute_test_cases, project)
                tabs << { :name => 'Execution', :partial => 'redcase/execution', :label => :redcase_i18n_tab_execution }
            end
            if User.current.allowed_to?(:redcase_view_test_results, project)
                tabs << { :name => 'Report', :partial => 'redcase/report', :label => :redcase_i18n_tab_report }
            end
        end
        tabs
    end

end
