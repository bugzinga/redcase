
# Workaround to build the path to 'test_helper' for different Redmine versions
current_folder = File.dirname(__FILE__)
test_helper_path = current_folder
if current_folder.include? 'vendor'
    test_helper_path += '/..'
end
test_helper_path += '/../../../test/test_helper'

require File.expand_path(test_helper_path)

# Loads ALL Redcase fixtures if +aFixtures+ is empty
# Otherwise loads specified fixtures
def load_redcase_fixtures(aFixtures = [])
    fixturesPath = File.expand_path(File.dirname(__FILE__) + '/fixtures')
    
    unless aFixtures.empty?
        ActiveRecord::Fixtures.create_fixtures(fixturesPath, aFixtures)
    else
        fixtures = []
        Dir.new(fixturesPath).each do |file|
            file.gsub!(/\.+$|\.yml/,'') 
            fixtures << file unless file.empty?
        end
        ActiveRecord::Fixtures.create_fixtures(fixturesPath, fixtures)
    end
end

class Test::Unit::TestCase

    include Redmine::I18n

    def log
        @log ||= Logger.new(STDOUT)
    end

end
