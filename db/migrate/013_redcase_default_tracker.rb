
class RedcaseDefaultTracker < ActiveRecord::Migration

  def self.up
    tracker = Tracker.find_by_name('Test case')
    tracker = Tracker.create(:name => 'Test case') if not tracker
    new_status = IssueStatus.find_by_name('New')
    new_status = IssueStatus.create(:name => "New", :is_closed => false, :is_default => false) if not new_status
    active_status = IssueStatus.find_by_name('In Progress')
    active_status = IssueStatus.create(:name => "In Progress", :is_closed => false, :is_default => false) if not active_status
    obsoleted_status = IssueStatus.find_by_name('Obsoleted')
    obsoleted_status = IssueStatus.create(:name => "Obsoleted", :is_closed => false, :is_default => false) if not obsoleted_status
    Role.all.each { |role|
      WorkflowTransition.create!(:tracker => tracker, :role => role , :old_status => new_status, :new_status => active_status)
      WorkflowTransition.create!(:tracker => tracker, :role => role , :old_status => active_status, :new_status => new_status)
      WorkflowTransition.create!(:tracker => tracker, :role => role , :old_status => active_status, :new_status => obsoleted_status)
      WorkflowTransition.create!(:tracker => tracker, :role => role , :old_status => obsoleted_status, :new_status => new_status)
    }
  end

  def self.down
  end
    
end
