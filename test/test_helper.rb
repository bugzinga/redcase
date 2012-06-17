
current_folder = File.expand_path(File.dirname(__FILE__))

# Workaround to build the path to 'test_helper' for different Redmine versions
if current_folder.include? 'vendor'
    test_helper_relative_path = '/../../../../test/test_helper'
else
    test_helper_relative_path = '/../../../test/test_helper'
end

require current_folder + test_helper_relative_path

class RedcaseIntegrationTest < ActionController::IntegrationTest

    include Redmine::I18n

    def initialize(name)
        super(name)
        @log = Logger.new(STDOUT)
    end

end
