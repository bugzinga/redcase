
class TestSuite < ActiveRecord::Base

    unloadable

    acts_as_tree :order => :name
    belongs_to   :project
    
    ##
    # Returns the root test suite for +project+
    # Creates default folders if there is no test suites for the project
    def self.root(project)
        test_suite = TestSuite.find_by_project_id(
                        project.id,
                        :include => :children)
        if test_suite.nil? then
            test_suite = TestSuite.create(:name => l(:redcase_i18n_root));
            test_suite.project = project
            test_suite.children << TestSuite.create(:name => l(:redcase_i18n_obsolete));
            test_suite.children << TestSuite.create(:name => l(:redcase_i18n_unsorted));
            test_suite.save
        end
        return test_suite
    end
    
    def isRoot?
        name == "Root"
    end
end
