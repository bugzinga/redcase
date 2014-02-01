
class RedcaseTrackerObsoleteBug < ActiveRecord::Migration

  def self.up
    obsoleted_state = IssueStatus.find_by_name('Obsoleted')
    obsoleted_state.name = 'Obsolete'
    obsoleted_state.save
  end
    
end
