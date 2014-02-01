
# This patch adds ExecutionJournal linkage to Version
module VersionPatch

  def self.included(base)
    base.class_eval do
      # One-to-many relationship: (1)Version <=> (*)ExecutionJournal
      has_many :execution_journals, :dependent => :destroy
    end
  end

end
