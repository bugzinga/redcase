
require 'application_helper'

module RedcaseHelper

	def get_id_or_default(obj, default_value)
		if obj.respond_to?(:id)
			return obj.id
		else
			return default_value
		end
	end

	module_function :get_id_or_default

	def get_plugin_tabs(project)
		if Version.where({ project_id: project.id }).empty?
			[{
				:name => 'Management',
				:partial => 'redcase/management',
				:label => :label_test_case_management
			}]
		else
			can_edit = User.current.allowed_to?(:edit_test_cases, project)
			can_execute = User.current.allowed_to?(:execute_test_cases, project)
			can_view = User.current.allowed_to?(:view_test_cases, project)
			tabs = []
			tabs << {
				:name => 'Management',
				:partial => 'redcase/management',
				:label => :label_test_case_management
			} if can_edit
			tabs << {
				:name => 'Execution',
				:partial => 'redcase/execution',
				:label => :label_test_case_execution
			} if can_execute
			tabs << {
				:name => 'Report',
				:partial => 'redcase/report',
				:label => :label_test_case_report
			} if (can_edit || can_execute || can_view )
			tabs
		end
	end

end

