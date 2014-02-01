
class ExecutionSuite < ActiveRecord::Base
  unloadable
  acts_as_tree :order => "name"
  has_and_belongs_to_many :test_cases, :join_table => "execution_suite_test_case"
  belongs_to :project
end
