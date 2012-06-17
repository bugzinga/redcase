
class RedcaseSetup < ActiveRecord::Migration

    include Redmine::I18n

    def self.up

        tracker = Tracker.find_or_create_by_name(l(:redcase_i18n_tracker))

        status_new = IssueStatus.find_by_name(l(:redcase_i18n_status_new))
        if not status_new
            status_new = IssueStatus.create(:name => l(:redcase_i18n_status_new), :is_default => true, :is_closed => false)
        end

        status_in_progress = IssueStatus.find_by_name(l(:redcase_i18n_status_in_progress))
        if not status_in_progress
            status_in_progress = IssueStatus.create(:name => l(:redcase_i18n_status_in_progress), :is_default => false, :is_closed => false)
        end

        status_obsolete = IssueStatus.find_by_name(l(:redcase_i18n_status_obsolete))
        if not status_obsolete 
            status_obsolete = IssueStatus.create(:name => l(:redcase_i18n_status_obsolete), :is_default => false, :is_closed => true)
        end
      
        Role.all.each do |role|
            Workflow.create!(:role => role, :tracker_id => tracker.id, :old_status => status_new, :new_status => status_in_progress)
            Workflow.create!(:role => role, :tracker_id => tracker.id, :old_status => status_in_progress, :new_status => status_obsolete)
            Workflow.create!(:role => role, :tracker_id => tracker.id, :old_status => status_obsolete, :new_status => status_in_progress)
        end

    end

    def self.down
    end

end

