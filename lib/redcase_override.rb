
# Callback methods to subscribe on Redmine events

#require "plugins/redcase/app/helpers/redcase_helper"
require File.expand_path("../../app/helpers/redcase_helper", __FILE__)

module RedcaseOverride

  class RO < Redmine::Hook::ViewListener
  
    include RedcaseHelper

    def controller_issues_edit_after_save(context = { })
      journal_details = JournalDetail.find_by_journal_id(context[:journal])
      if journal_details.nil? then
        # ???
        return
      end
      if journal_details.prop_key == 'tracker_id' then
        if journal_details.value == Tracker.find_by_name('Test case').id.to_s then
          controller_issues_new_after_save(context)
        elsif journal_details.old_value == Tracker.find_by_name('Test case').id.to_s then
          tc = TestCase.find_by_issue_id(context[:issue].id)
          tc.destroy if !tc.nil?
        end
      end
    end

    def controller_issues_new_after_save(context = { })
      if context[:issue].tracker.name != "Test case" then
        return
      end
      root = test_suite_root(context[:issue].project)
      execroot = execution_suite_root(context[:issue].project)
      x = TestCase.create(:issue => context[:issue], :test_suite => root.children.detect { |o| o.name == ".Unsorted" } )
      # execroot.test_cases << x
    end

    def view_projects_roadmap_version_bottom(context = { })
      test_cases = ExecutionJournal.find_all_by_version_id(context[:version]).map { |x| x.test_case }.uniq
      issues = Issue.find(:all, :conditions => 'fixed_version_id = ' + context[:version].id.to_s).collect { |x| x.id }
      test_cases = TestCase.find_all_by_issue_id(issues)
      results = ExecutionResult.all
      txt = "<span style='color: red'>Total test cases:</span> <b>" + test_cases.size.to_s + "</b>"
      for r in results do
        count = 0
        for t in test_cases do
          journals = ExecutionJournal.find_all_by_test_case_id_and_result_id(t.id, r.id)
          count = count + journals.size if !journals.nil?
        end
        txt = txt + " [" + r.name + "=" + count.to_s + "]"
      end
      txt = txt + "<br/>"
    end

  end

end
