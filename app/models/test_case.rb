class TestCase < ActiveRecord::Base
	unloadable
	belongs_to :test_suite
	belongs_to :issue
	has_and_belongs_to_many :execution_suites, :join_table => "execution_suite_test_case"
	has_many :execution_journals, :dependent => :destroy
	
	attr_protected :id
	
	def copy_to(project)		
		new_issue = Issue.new
		new_issue.copy_from(issue, :subtasks => false)
		new_issue.project = project
		# Changing project resets the custom field values
		new_issue.custom_field_values = issue.custom_field_values.inject({}) {|h,v| h[v.custom_field_id] = v.value; h}
		# Reassign fixed_versions by name, since names are unique per project
		if issue.fixed_version && issue.fixed_version.project == project
			new_issue.fixed_version = self.versions.detect {|v| v.name == issue.fixed_version.name}
		end
		# Reassign the category by name, since names are unique per project
		if issue.category
			new_issue.category = self.issue_categories.detect {|c| c.name == issue.category.name}
		end
		new_issue.save
	end
		
	def self.maintenance(project)
		all_issues = Issue.includes(:tracker, :test_case, :status).where({project_id: project.id})
		
		cleanup_obsolete(all_issues, project)
		move_unsorted(all_issues, project)
		remove_orphaned(all_issues)
	end
	
	def self.remove_orphaned(issues)
		missed_tc = issues.collect { |issue|
			tc = issue.test_case
			tc if (tc && (issue.tracker.name != "Test case"))
		}.compact
		missed_tc.each { |tc| tc.destroy }
	end	
	
	#Move all test cases that aren't assigned to a test suite to the ".Unsorted" test suite
	def self.move_unsorted(issues, project)
		unlinked_issues = issues.select { |issue| (issue.tracker.name == "Test case") and (issue.test_case.nil?) }
		unlinked_issues.each { |issue|
			x = TestCase.create(:issue => issue, :test_suite => TestSuite.get_root_for_project(project).children.detect { |o| o.name == ".Unsorted" } )
		}
	end	
	
	def self.cleanup_obsolete(issues, project)
		#Move all test cases with status "Obsolete" to ".Obsolete" test suite if they aren't already there
		obsoleted_issues = issues.select { |issue| (issue.tracker.name == "Test case") and (issue.status.name == "Obsolete")}
		obsoleted_issues.each { |issue|
			if not issue.test_case.nil?
				if not issue.test_case.test_suite.name == ".Obsolete"
					issue.test_case.test_suite = TestSuite.get_obsolete(project)
					issue.test_case.save();
				end
				#Remove test_case from all execution suites
				if not issue.test_case.execution_suites.nil?
					issue.test_case.execution_suites.each { |x| x.test_cases.delete(issue.test_case) }
				end
			end
		}
	end  
	
	def in_suite?(suite_id, project_id)
		# is the test case directly in the suite?		
		included = execution_suites.any? {|es| (es.id == suite_id) and (not es.project.nil? and es.project.id == project_id) }
		if (not included) then
			# all nested suites
			# apparently nested suites don't have a project so we don't filter by that here
			othersuites = execution_suites.select {|es| (es.parent != nil) }
			while (othersuites.any?) do				
				if (othersuites.any? {|es| es.parent.id == suite_id}) then
					included = true
					break
				else						
					othersuites.collect! {|es| es.parent}.select! {|es| not es.parent.nil?}						
					othersuites.compact!
				end
			end
		end	
		return included	
	end
	
	#TODO Move to view f.ex. using JBuilder (https://github.com/rails/jbuilder)
	def to_json(context)
		atext = issue_id.to_s + ' - ' + issue.subject
		lastresult = 'none'
		if execution_journals.any?
			lastresult = execution_journals.last.result.name.gsub ' ', ''
		end
		textilized_description = issue.description ? context.textilizable(issue, :description, {}) : ''
		{
			'id' => 'issue_' + issue_id.to_s,
			'issue_id'     => issue_id,
			'text'         => atext,
			'editable'     => false,
			'desc'         => textilized_description,
			'leaf'         => true,
			'status'       => issue.status,
			'iconCls' => 'testcase-result-icon-' + lastresult,
			'icon' => 'testcase-result-icon-' + lastresult,
			'draggable'    => true,
			'qtipCfg'      => {
				:cls => 'test',
				:width => '500',
				:closable => 'true',
				:text => '"' + issue.subject + '"<br/>' +
				(issue.description.nil? ? '' : ('<br/><b>Description:</b><br/>' + textilized_description)) +
				'<br/><b>Priority:</b> ' + issue.priority.name +
				'<br/><b>Author:</b> ' + issue.author.name +
				'<br/><b>Created:</b> ' + issue.created_on.strftime('%d.%m.%Y %H:%M'),
				:title => ('Issue #' + issue.id.to_s),
				:dismissDelay => 30000
			},
			'type' => 'case',
			'state' => { 'disabled' => issue.status.name != 'In Progress' }			
		}	
	end
	
	def remove_from_execution_suite(suite_id)
		executionSuite = ExecutionSuite.find(suite_id)
		executionSuite.test_cases.delete(self)
	end
	
	def change_execution_suite(source_id, dest_id)
		sourceSuite = ExecutionSuite.find(source_id)
		destinationSuite = ExecutionSuite.find(dest_id)
		destinationSuite.test_cases << self
		sourceSuite.test_cases.delete(self)
	end	
	
	def add_to_execution_suite(dest_id)
		executionSuite = ExecutionSuite.find(dest_id)
		executionSuite.test_cases << self	
	end
end
