
require 'dispatcher'

module Redcase

    class System

        def self.get_rails_version
            Rails::version.split('.').first.to_i
        end

        def self.rails2?
            (get_rails_version == 2)
        end

        def self.rails3?
            (get_rails_version == 3)
        end

    end

    class Injection

        def self.run(&block)
            if System::rails2?
                Dispatcher.to_prepare :redcase do
                    block.call
                end
            elsif System::rails3?
                Rails.configuration.to_prepare do
                    block.call
                end
            else
                raise "Rails version '#{System::get_rails_version}' is not suported"
            end
        end

    end

end
