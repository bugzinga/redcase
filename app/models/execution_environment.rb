
class ExecutionEnvironment < ActiveRecord::Base
  unloadable
  belongs_to :project
  has_many :journals, :class_name => 'ExecutionJournal', :foreign_key => 'environment_id', :dependent => :destroy
end
