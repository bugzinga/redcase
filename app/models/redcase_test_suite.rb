
class RedcaseTestSuite < ActiveRecord::Base

    unloadable

    acts_as_tree :order => :name
    belongs_to   :project

    ##
    # Returns the root test suite of the tree that includes this test suite
    def root
        if self.project_id
            # Only root node has a reference to the project_id
            return self
        elsif self.parent
            # Going one level up
            return self.parent.root
        else
            # Someting wrong here, maybe the node is not included in the tree
            return nil
        end
    end

    ##
    # Returns the root test suite for +project+
    # Creates default folders if there is no test suites for the project
    def self.root(project = 0)
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

    def builtin?
        if self.project_id
            return true
        elsif self.parent.project_id && ( (name == l(:redcase_i18n_obsolete)) || (name == l(:redcase_i18n_unsorted)) 
            return true
        else
            return false
        end
    end
end
