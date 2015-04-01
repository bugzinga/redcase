
# TODO: obsolete class, must be deleted after database migrate refactoring

class ExecutionResult < ActiveRecord::Base
  unloadable
  
  attr_protected :id
end
