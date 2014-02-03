
require 'redmine'
require 'issue_patch'
require 'project_patch'
require 'version_patch'
require 'user_patch'
require 'application_controller_patch'
require 'redcase_override'

Redmine::Plugin.register :redcase do
  
  name 'Redcase'
  description 'Test cases management plugin for Redmine'
  author 'Evgeny Anikiev, Maxim Novikov'
  version '1.0 beta 2.0'

  permission :view_test_cases,
    :redcase => [
      :index,
      :execlist,
      :test_suite_manager,
      :reassign_test_case,
      :execution_suite_manager,
      :copy_test_case_to_exec,
      :delete_test_case_from_execution_suite,
      :test_case_to_obsolete,
      :get_test_case,
      :execute,
      :get_executions,
      :export_to_excel,
      :export_to_excel2,
      :export_to_rtf,
      :update_environment,
      :update_exelists,
      :graph,
      :get_graph,
      :update_combos,
      :update_combos2,
      :update_exelists2,
      :get_advanced_execution,
      :get_attachment_urls
    ]

  permission :edit_test_cases,
    :redcase => [
      :index,
      :execlist,
      :test_suite_manager,
      :reassign_test_case,
      :execution_suite_manager,
      :copy_test_case_to_exec,
      :delete_test_case_from_execution_suite,
      :test_case_to_obsolete,
      :get_test_case,
      :execute,
      :get_executions,
      :export_to_excel,
      :export_to_excel2,
      :export_to_rtf,
      :update_environment,
      :update_exelists,
      :graph,
      :get_graph,
      :update_combos,
      :update_combos2,
      :update_exelists2,
      :get_advanced_execution,
      :get_attachment_urls
    ]

  permission :execute_test_cases,
    :redcase => [
      :index,
      :execlist,
      :test_suite_manager,
      :reassign_test_case,
      :execution_suite_manager,
      :copy_test_case_to_exec,
      :delete_test_case_from_execution_suite,
      :test_case_to_obsolete,
      :get_test_case,
      :execute,
      :get_executions,
      :export_to_excel,
      :export_to_excel2,
      :export_to_rtf,
      :update_environment,
      :update_exelists,
      :graph,
      :get_graph,
      :update_combos,
      :update_combos2,
      :update_exelists2,
      :get_advanced_execution,
      :get_attachment_urls
    ]

  menu :project_menu,
    :redcase, {
      :controller => 'redcase',
      :action => 'index'
    }, {
      :if => proc { |p|
        (User.current.allowed_to?(:view_test_cases, p) or User.current.allowed_to?(:edit_test_cases, p)) and (p.trackers.select { |t| t.name == 'Test case' }.length > 0)
      },
      :caption => 'Test cases',
      :after => :new_issue
    }

  Rails.configuration.to_prepare do
    Issue.send :include, IssuePatch
    Project.send :include, ProjectPatch
    Version.send :include, VersionPatch
    User.send :include, UserPatch
    RedcaseController.send :include, ApplicationControllerPatch
  end
  
end
