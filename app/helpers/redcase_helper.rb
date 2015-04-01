
# Different help methods to use them anywhere

require 'application_helper'
require 'prototype_legacy'

module RedcaseHelper
	def get_id_or_default(obj, defaultval)
		if obj.respond_to?(:id)
			return obj.id
		else
			return defaultval
		end
	end

	module_function :get_id_or_default	

	def get_plugin_tabs(project)
		if Version.where({project_id: project.id}).length == 0
			tabs = [
				{:name => 'Management', :partial => 'redcase/management', :label => :label_test_case_management}
			]
		elsif !User.current.allowed_to?(:edit_test_cases, project)
			tabs = [
				{:name => 'Report', :partial => 'redcase/report', :label => :label_test_case_report}
			]
		else
			tabs = [
				{:name => 'Management', :partial => 'redcase/management', :label => :label_test_case_management},
				{:name => 'Execution', :partial => 'redcase/execution', :label => :label_test_case_execution},
				{:name => 'Report', :partial => 'redcase/report', :label => :label_test_case_report}
			]
		end
		return tabs
	end
end
