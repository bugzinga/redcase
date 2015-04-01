
class ExecutionJournal < ActiveRecord::Base
	unloadable
	belongs_to :test_case
	belongs_to :version
	belongs_to :result, :class_name => 'ExecutionResult'
	belongs_to :executor, :class_name => 'User'
	belongs_to :environment, :class_name => 'ExecutionEnvironment'
	
	attr_protected :id

	#TODO Move to view f.ex. using JBuilder (https://github.com/rails/jbuilder)
	def to_json
	{
		'created_on'  => created_on.strftime('%d.%m.%Y %H:%M:%S'),
		'result'      => result.name,
		'comment'     => comment,
		'executor'    => (executor.nil? ? '' : executor.name),
		'environment' => environment.name,
		'version'     => version.name
	}	
	end
	
	def self.find_by_issue_id(issue_id)
		test_case = TestCase.find_by_issue_id(issue_id)
		return ExecutionJournal.order('created_on desc').where({test_case_id: test_case.id})
	end
end
