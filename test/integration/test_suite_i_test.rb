require File.expand_path(File.dirname(__FILE__) + '/../test_helper')

class TestSuiteITest < ActionController::IntegrationTest
    test "Project should have one test suite" do
        log.info ''
        log.info 'Loading Redmine'
        get "/"
        assert_response :success
        
        project = Project.new( :name => 'Redcase' )
        assert_not_nil project
        test_suite_1 = TestSuite.new( :name => 'Test suite 1' )
        assert_not_nil test_suite_1
        project.test_suite = test_suite_1
        assert_not_empty project.test_suite
    end
end