
class RedcaseDefaultTracker < ActiveRecord::Migration

  def self.up
    tc = Tracker.find_by_name('Test case')
    tc = Tracker.create(:name => 'Test case') if not tc
    new_st = IssueStatus.find_by_name('New')
    new_st = IssueStatus.create(:name => "New", :is_closed => false, :is_default => false) if not new_st
    active_st = IssueStatus.find_by_name('In Progress')
    active_st = IssueStatus.create(:name => "In Progress", :is_closed => false, :is_default => false) if not active_st
    obsoleted_st = IssueStatus.find_by_name('Obsoleted')
    obsoleted_st = IssueStatus.create(:name => "Obsoleted", :is_closed => false, :is_default => false) if not obsoleted_st
    Role.find(:all).each{ |rl|
      WorkflowRule.create!(:tracker_id => tc.id, :role_id => rl.id , :old_status_id => new_st.id, :new_status_id => active_st.id)
      WorkflowRule.create!(:tracker_id => tc.id, :role_id => rl.id , :old_status_id => active_st.id, :new_status_id => new_st.id)
      WorkflowRule.create!(:tracker_id => tc.id, :role_id => rl.id , :old_status_id => active_st.id, :new_status_id => obsoleted_st.id)
      WorkflowRule.create!(:tracker_id => tc.id, :role_id => rl.id , :old_status_id => obsoleted_st.id, :new_status_id => new_st.id)
    }
  end

  def self.down
  end
    
end
