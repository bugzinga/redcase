
class TestCase < ActiveRecord::Base

	unloadable
	belongs_to :test_suite
	belongs_to :issue
	has_and_belongs_to_many(
		:execution_suites,
		:join_table => 'execution_suite_test_case'
	)
	has_many :execution_journals, :dependent => :destroy
	attr_protected :id

	def copy_to(project)
		new_issue = Issue.new
		new_issue.copy_from(issue, :subtasks => false)
		new_issue.project = project
		# Changing project resets the custom field values.
		new_issue.custom_field_values = issue.custom_field_values
			.inject({}) { |h, v|
				h[v.custom_field_id] = v.value
				h
			}
		# Reassign fixed_versions by name, since names are unique per project.
		if issue.fixed_version && (issue.fixed_version.project == project)
			new_issue.fixed_version = self.versions.detect { |v|
				v.name == issue.fixed_version.name
			}
		end
		# Reassign the category by name, since names are unique per project.
		if issue.category
			new_issue.category = self.issue_categories.detect { |c|
				c.name == issue.category.name
			}
		end
		new_issue.save
	end

	def self.maintenance(project)
		all_issues = Issue
			.includes(:tracker, :test_case, :status)
			.where({ project_id: project.id })
		cleanup_obsolete(all_issues, project)
		move_unsorted(all_issues, project)
		remove_orphaned(all_issues)
	end

	def self.remove_orphaned(issues)
		missed_tc = issues.collect { |issue|
			tc = issue.test_case
			tc if (tc && (issue.tracker.name != 'Test case'))
		}.compact
		missed_tc.each { |tc| tc.destroy }
	end

	# Move all test cases that aren't assigned to a test suite to the
	# ".Unsorted" test suite.
	def self.move_unsorted(issues, project)
		unlinked_issues = issues.select { |issue|
			(issue.tracker.name == 'Test case') && issue.test_case.nil?
		}
		unlinked_issues.each { |issue|
			x = TestCase.create(
				:issue => issue,
				:test_suite => TestSuite
					.get_root_for_project(project)
					.children.detect { |o| o.name == '.Unsorted' }
			)
		}
	end

	def self.cleanup_obsolete(issues, project)
		# Move all test cases with status "Obsolete" to ".Obsolete" test suite
		# if they aren't already there.
		obsoleted_issues = issues.select { |issue|
			(issue.tracker.name == 'Test case') && (issue.status.name == 'Obsolete')
		}
		obsoleted_issues.each { |issue|
			if !issue.test_case.nil?
				if issue.test_case.test_suite.name != '.Obsolete'
					issue.test_case.test_suite = TestSuite.get_obsolete(project)
					issue.test_case.save()
				end
				# Remove test_case from all execution suites.
				if !issue.test_case.execution_suites.nil?
					issue.test_case.execution_suites.each { |x|
						x.test_cases.delete(issue.test_case)
					}
				end
			end
		}
	end

	def in_suite?(suite_id, project_id)
		# Is the test case directly in the suite?
		included = execution_suites.any? { |es|
			(es.id == suite_id) && (!es.project.nil? && (es.project.id == project_id))
		}
		if !included
			# Apparently nested suites don't have a project so we don't filter
			# by that here.
			other_suites = execution_suites.select { |es| !es.parent.nil? }
			while other_suites.any?
				if other_suites.any? { |es| (es.parent.id == suite_id) }
					included = true
					break
				else
					other_suites
						.collect! { |es| es.parent }
						.select! { |es| !es.parent.nil? }
					other_suites.compact!
				end
			end
		end
		included
	end

	# TODO: Move to view f.ex. using JBuilder
	#       (https://github.com/rails/jbuilder).
	def to_json(context)
		atext = "#{issue_id}-#{issue.subject}"
		last_result = 'none'
		if execution_journals.any?
			last_result = execution_journals.last.result.name.gsub(' ', '')
		end
		textilized_description =
			if issue.description
				context.textilizable(issue, :description, {})
			else
				''
			end
		{
			'id'        => "issue_#{issue_id}",
			'issue_id'  => issue_id,
			'text'      => atext,
			'editable'  => false,
			'desc'      => textilized_description,
			'leaf'      => true,
			'status'    => issue.status,
			'iconCls'   => "testcase-result-icon-#{last_result}",
			'icon'      => "testcase-result-icon-#{last_result}",
			'draggable' => true,
			'qtipCfg'   => {
				:cls          => 'test',
				:width        => '500',
				:closable     => 'true',
				:text         => (
					"\"#{issue.subject}\"<br/>" + (
						issue.description.nil? ? '' : (
							"<br/><b>Description:</b><br/>#{textilized_description}"
						)
					) +
					"<br/><b>Priority:</b> #{issue.priority.name}" +
					"<br/><b>Author:</b> #{issue.author.name}" +
					"<br/><b>Created:</b> #{issue.created_on.strftime('%d.%m.%Y %H:%M')}"
				),
				:title        => "Issue ##{issue.id}",
				:dismissDelay => 30000
			},
			'type'      => 'case',
			'state'     => {
				'disabled' => (issue.status.name != 'In Progress')
			}
		}
	end

	def remove_from_execution_suite(suite_id)
		execution_suite = ExecutionSuite.find(suite_id)
		execution_suite.test_cases.delete(self)
	end

	def change_execution_suite?(source_id, dest_id)
		destination_suite = ExecutionSuite.find(dest_id)
		source_suite = ExecutionSuite.find(source_id)
		if (source_suite.root == destination_suite.root) or (destination_suite.is_test_case_id_unique?(id))
			destination_suite.test_cases << self
			source_suite.test_cases.delete(self)
			true
		else
			false
		end
	end

	def add_to_execution_suite?(dest_id)
		execution_suite = ExecutionSuite.find(dest_id)
		if execution_suite.is_test_case_id_unique?(id)
			execution_suite.test_cases << self
			true
		else
			false
		end
	end

end

