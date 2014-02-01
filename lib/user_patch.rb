
# This patch adds ExecutionJournal linkage to User
module UserPatch

  def self.included(base)
    base.class_eval do
      # One-to-many relationship: (1)User <=> (*)ExecutionJournal
      has_many :execution_journals, :foreign_key => 'executor_id', :dependent => :nullify
    end
  end

end
