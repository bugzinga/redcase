
class ExecutionJournal < ActiveRecord::Base
  unloadable
  belongs_to :test_case
  belongs_to :version
  belongs_to :result, :class_name => 'ExecutionResult'
  belongs_to :executor, :class_name => 'User'
  belongs_to :environment, :class_name => 'ExecutionEnvironment'
end
