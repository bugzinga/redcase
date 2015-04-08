require 'redmine'
require 'issue_patch'
require 'project_patch'
require 'version_patch'
require 'user_patch'
require 'redcase_override'

Redmine::Plugin.register :redcase do
	
	name 'Redcase'
	description 'Test cases management plugin for Redmine'
	author 'Evgeny Anikiev, Maxim Novikov & David Robinson'
	version '0.2'

	permission :view_test_cases,
		{
			:redcase => [
				:index,
				:get_attachment_urls
			],
			'redcase/environments' => [
				:index
			],
			'redcase/testsuites' => [
				:index
			],
			'redcase/testcases' => [
				:index
			],
			'redcase/executionjournals' => [
				:index
			],
			'redcase/export' => [
				:index
			],			
			'redcase/executionsuites' => [
				:index,
				:show
			],			
			'redcase/graph' => [
				:show
			],
			'redcase/combos' => [
				:index
			]			
		}

	permission :edit_test_cases,
		{
			:redcase => [
				:index,
				:get_attachment_urls
			],
			'redcase/environments' => [
				:index,
				:update,
				:destroy,
				:create
			],
			'redcase/testsuites' => [
				:index,
				:update,
				:destroy,
				:create
			],
			'redcase/testcases' => [
				:index,
				:update,
				:destroy,
				:copy
			],
			'redcase/executionjournals' => [
				:index
			],
			'redcase/export' => [
				:index
			],			
			'redcase/executionsuites' => [
				:index,
				:update,
				:destroy,
				:create,
				:show
			],			
			'redcase/graph' => [
				:show
			],
			'redcase/combos' => [
				:index
			]			
		}

	permission :execute_test_cases,
		{
			:redcase => [
				:index,
				:get_attachment_urls
			],
			'redcase/environments' => [
				:index
			],
			'redcase/testsuites' => [
				:index
			],
			'redcase/testcases' => [
				:index,
				:update
			],
			'redcase/executionjournals' => [
				:index
			],
			'redcase/export' => [
				:index
			],			
			'redcase/executionsuites' => [
				:index
			]		
		}

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
	end
	
end
