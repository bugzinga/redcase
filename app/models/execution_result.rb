
# TODO: Obsolete class, must be deleted after database migrate refactoring.
# TODO: Really?

class ExecutionResult < ActiveRecord::Base

	unloadable
	attr_protected :id

end

