
class RedcaseDefaultTracker < ActiveRecord::Migration

  def self.up
    new_status = IssueStatus.where(
      :name => "New",
      :is_closed => false
    ).first_or_create
    active_status = IssueStatus.where(
      :name => "In Progress",
      :is_closed => false
    ).first_or_create
    obsoleted_status = IssueStatus.where(
      :name => "Obsoleted",
      :is_closed => false
    ).first_or_create
    tracker = Tracker.where(
      :name => 'Test case',
      :default_status => new_status
    ).first_or_create
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
