
module RedcaseHelper

    include ApplicationHelper

    def get_redcase_inner_tabs(project)
        tabs = []
        if User.current.allowed_to?(::I18n.t(:redcase_i18n_permission_manage), project)
            tabs << { :name => 'Management', :partial => 'redcase/management', :label => :redcase_i18n_tab_management }
        end
        if User.current.allowed_to?(::I18n.t(:redcase_i18n_permission_execute), project)
            tabs << { :name => 'Execution', :partial => 'redcase/execution', :label => :redcase_i18n_tab_execution }
        end
        if User.current.allowed_to?(::I18n.t(:redcase_i18n_permission_view), project)
            tabs << { :name => 'Report', :partial => 'redcase/report', :label => :redcase_i18n_tab_report }
        end
        tabs
    end

end
