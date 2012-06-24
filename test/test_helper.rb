
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
    
    ##
    # Load local Recase fixtures
    # It should be a class method
    # Params:
    # +test_fixtures:: +array+ of fixtures to be loaded; if empty, all availavle fixtures will be loaded
    def self.load_redcase_fixtures(test_fixtures = [])
        fixtures_path = File.expand_path(File.dirname(__FILE__) + '/fixtures')
        fixtures = test_fixtures.dup
        if fixtures.empty?
            Dir.new(fixtures_path).each do |file|
                # Loading only .yml files
                if file.gsub!(/\.yml$/, '') != nil
                    fixtures << file
                end
            end
        end
        if Redcase::System::rails2?
            Fixtures.create_fixtures(fixtures_path, fixtures)
        elsif Redcase::System::rails3?
            ActiveRecord::Fixtures.create_fixtures(fixtures_path, fixtures)
        end
    end

end
