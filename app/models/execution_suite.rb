
class ExecutionSuite < ActiveRecord::Base
  unloadable
  acts_as_tree :order => "name"
  has_and_belongs_to_many :test_cases, :join_table => "execution_suite_test_case"
  belongs_to :project
  
  attr_protected :id
  
	def self.get_root_for_project(project)
		execution_suite = ExecutionSuite.find_by_project_id(project.id)
		if execution_suite.nil?
			execution_suite = ExecutionSuite.create(:name => "Root", :project => project)
		end
		execution_suite
	end
	
	def self.get_results(environment, version, suite_id, project_id)
	    if environment and version
			issues = Issue.where({project_id: project_id}).collect { |i| i.id }
			test_cases = TestCase.where({issue_id: issues})
			unless suite_id < 0
				test_cases = test_cases.select {|tc| tc.in_suite?(suite_id, project_id) }			
			end
			test_cases.inject([]) {|journals, tc| 
				journals << ExecutionJournal.order('created_on desc').find_by_test_case_id_and_environment_id_and_version_id(tc.id, environment.id, version.id)
				journals
			}.compact		
		else
			[]
		end
	end
	
	#TODO Move to view f.ex. using JBuilder (https://github.com/rails/jbuilder)
	def to_json(context)
		{		 
			'suite_id'       => id,
			'text'           => name,
			'id'             => id,
			'expandable'     => true,
			'expanded'       => (children.count + test_cases.count) == 0,
			'state' 		 => { 'opened' => parent.nil? },
			'editable'       => !parent.nil?,
			'children'       => children.collect { |s| s.to_json(context) } + test_cases.sort_by { |x| x.issue.subject }.collect { |tc| tc.to_json(context) },
			'type' 			 => 'suite'
		}	
	end
end
