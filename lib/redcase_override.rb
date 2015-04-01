
# Callback methods to subscribe on Redmine events

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
      root = TestSuite.get_root_for_project(context[:issue].project)
      execroot = ExecutionSuite.get_root_for_project(context[:issue].project)
      x = TestCase.create(:issue => context[:issue], :test_suite => root.children.detect { |o| o.name == ".Unsorted" } )
    end

    def view_projects_roadmap_version_bottom(context = { })
      test_cases = ExecutionJournal.where({version_id: context[:version]}).map { |x| x.test_case }.uniq
      issues = Issue.where(fixed_version_id: context[:version].id).collect { |x| x.id }
      test_cases = TestCase.where({issue_id: issues})
      results = ExecutionResult.all
      txt = "<span style='color: red'>Total test cases:</span> <b>" + test_cases.size.to_s + "</b>"
      for r in results do
        count = 0
        for t in test_cases do
          journals = ExecutionJournal.where({test_case_id: t.id, result_id: r.id})
          count = count + journals.size if !journals.nil?
        end
        txt = txt + " [" + r.name + "=" + count.to_s + "]"
      end
      txt = txt + "<br/>"
    end

  end

end
