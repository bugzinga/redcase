
# Workaround to build the path to 'test_helper' for different Redmine versions
current_folder = File.dirname(__FILE__)
test_helper_path = current_folder
if current_folder.include? 'vendor'
    test_helper_path += '/..'
end
test_helper_path += '/../../../test/test_helper'

require File.expand_path(test_helper_path)

class Test::Unit::TestCase

    include Redmine::I18n

    def log
        @log ||= Logger.new(STDOUT)
    end

end
