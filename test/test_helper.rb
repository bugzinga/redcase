
current_folder = File.dirname(__FILE__)

# Workaround to build the path to 'test_helper' for different Redmine versions
if current_folder.include? 'vendor'
    test_helper_relative_path = '/../../../../test/test_helper'
else
    test_helper_relative_path = '/../../../test/test_helper'
end

require File.expand_path(current_folder + test_helper_relative_path)

class Test::Unit::TestCase
    include Redmine::I18n
    
    def log
        @log ||= Logger.new(STDOUT)
    end

end