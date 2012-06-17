
# Load the normal Rails helper
if Redcase::System::rails2?
    test_helper = File.expand_path(File.dirname(__FILE__) + '/../../../../test/test_helper')
elsif Redcase::System::rails3?
    test_helper = File.expand_path(File.dirname(__FILE__) + '/../../../test/test_helper')
end

require test_helper

# Ensure that we are using the temporary fixture path
#Engines::Testing.set_fixture_path

class RedcaseIntegrationTest < ActionController::IntegrationTest

    include Redmine::I18n

    def initialize(name)
        super(name)
        @log = Logger.new(STDOUT)
    end

end
