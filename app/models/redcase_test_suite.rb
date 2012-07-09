
class RedcaseTestSuite < ActiveRecord::Base

    unloadable

    acts_as_tree :order => :name
    belongs_to   :project

    ##
    # Returns the root test suite for +project+
    # Creates default folders if there is no test suites for the project
    def self.root(project)
        test_suite = RedcaseTestSuite.find_by_project_id(
                        project.id,
                        :include => :children)
        if test_suite.nil? then
            test_suite = RedcaseTestSuite.create(:name => l(:redcase_i18n_root));
            test_suite.project = project
            test_suite.children << RedcaseTestSuite.create(:name => l(:redcase_i18n_obsolete));
            test_suite.children << RedcaseTestSuite.create(:name => l(:redcase_i18n_unsorted));
            test_suite.save
        end
        return test_suite
    end

    def isRoot?
        !project.nil?
    end

end
