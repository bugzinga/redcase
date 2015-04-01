class TestSuite < ActiveRecord::Base
	unloadable
	acts_as_tree :order => "name"
	has_many :test_cases, :dependent => :destroy
	belongs_to :project
	
	attr_protected :id

	# Returns root test suite linked to the project and creates one and nested 'system'
	# test suites (for 'obsolete' and 'unsorted' test cases) if they don't exist yet
	def self.get_root_for_project(project)
		test_suite = TestSuite.find_by_project_id(project.id)
		if test_suite.nil? then
			test_suite = TestSuite.create(:name => "Root");
			test_suite.project = project
			test_suite.children << TestSuite.create(:name => ".Obsolete");
			test_suite.children << TestSuite.create(:name => ".Unsorted");
			test_suite.save
		end
		
		return test_suite
	end
	
	def self.get_obsolete(project)
		return TestSuite.get_root_for_project(project).children.detect { |o| o.name == ".Obsolete"}	
	end
	
	#TODO Move to view f.ex. using JBuilder (https://github.com/rails/jbuilder)
	def to_json(context)
		if parent_id then
			kids = children.collect { |s|
				s.to_json(context)
			} + test_cases.sort_by { |x|
				x.issue.subject
			}.collect { |tc|
				tc.to_json(context)
			}
		else
			kids = children.select { |x|
				(x.name != '.Obsolete' and x.name != '.Unsorted')
			}.collect { |s|
				s.to_json(context)
			} +
			test_cases.sort_by { |x|
			x.issue.subject }.collect { |tc|
				tc.to_json(context)
			} +
			children.select { |x|
				(x.name == '.Obsolete' or x.name == '.Unsorted')
			}.collect { |s|
				s.to_json(context)
			}

		end
		{
			'suite_id'       => id,
			'text'           => name,
			'id'             => (name != ".Obsolete" and name != '.Unsorted') ? 'suite_' + id.to_s : name,
			'expandable'     => true,
			'expanded'       => false, #(suite.children.count + suite.test_cases.count) == 0,
			'editable'       => (!((name == ".Unsorted" or name == ".Obsolete") and parent.parent.nil?) and !parent.nil?),
			'children'       => kids,
			'draggable'      => (!parent.nil? and !((name == ".Unsorted" or name == ".Obsolete") and parent.parent.nil?)),
			'state' => { 'opened' => parent.nil? },
			'type' => 'suite'
		}	
	end
end
