module RedcaseHelper	
    include ApplicationHelper
    
    def get_plugin_tabs
        [
            {:name => 'Management', :partial => 'redcase/management', :label => :label_test_case_management},
            {:name => 'Execution', :partial => 'redcase/execution', :label => :label_test_case_execution},
            {:name => 'Report', :partial => 'redcase/report', :label => :label_test_case_report}
        ]
    end
    
end