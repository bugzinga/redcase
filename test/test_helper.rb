
# Load the normal Rails helper
# require File.expand_path(File.dirname(__FILE__) + '/../../../test/test_helper')

# Ensure that we are using the temporary fixture path
Engines::Testing.set_fixture_path

class RedcaseIntegrationTest < ActionController::IntegrationTest

    include Redmine::I18n

    def initialize(name)
        super(name)
        @log = Logger.new(STDOUT)
    end
    
end
