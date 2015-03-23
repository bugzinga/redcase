
class ExecutionSuite < ActiveRecord::Base
  unloadable
  acts_as_tree :order => "name"
  has_and_belongs_to_many :test_cases, :join_table => "execution_suite_test_case"
  belongs_to :project
  
	def self.get_root_for_project(project)
		execution_suite = ExecutionSuite.find_by_project_id(project.id)
		if execution_suite.nil?
			execution_suite = ExecutionSuite.create(:name => "Root", :project => project)
		end
		return execution_suite
	end
	
	def self.get_results(environment, version, suite_id, project_id)	
		issues = Issue.find_all_by_project_id(project_id).collect { |i| i.id }
		test_cases = TestCase.find(:all, :conditions => { :issue_id => issues })
		unless suite_id < 0
			test_cases = test_cases.select {|tc| tc.in_suite?(suite_id, project_id) }			
		end
		results = []
		test_cases.each do |tc|
			found = ExecutionJournal.find_by_test_case_id_and_environment_id_and_version_id(tc.id, environment.id, version.id, :order => 'created_on desc')
			results << found
		end
		return results.compact	

	end
	
	def to_json
		{		 
			'suite_id'       => id,
			'text'           => name,
			'id'             => id,
			'expandable'     => true,
			'expanded'       => (children.count + test_cases.count) == 0,
			'state' 		 => { 'opened' => parent.nil? },
			'editable'       => !parent.nil?,
			'children'       => children.collect { |s| s.to_json } + test_cases.sort_by { |x| x.issue.subject }.collect { |tc| tc.to_json },
			'type' 			 => 'suite'
		}	
	end
end
