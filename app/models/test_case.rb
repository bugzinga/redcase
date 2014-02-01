
class TestCase < ActiveRecord::Base
  unloadable
  belongs_to :test_suite
  belongs_to :issue
  has_and_belongs_to_many :execution_suites, :join_table => "execution_suite_test_case"
  has_many :execution_journals, :dependent => :destroy
end
