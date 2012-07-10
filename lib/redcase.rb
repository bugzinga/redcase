
module Redcase

    class System

        def self.rails_version
            @@rails_version ||= Rails::version.split('.').first.to_i
        end

        def self.rails2?
            (rails_version == 2)
        end

        def self.rails3?
            (rails_version == 3)
        end

    end

    if System::rails2?
        require 'dispatcher'
    end

    class Patch

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
                raise "Rails version '#{System::rails_version}' is not suported"
            end
        end

    end

    module ProjectPatch

        def self.included(base)
            base.class_eval do
                has_one :test_suite,
                        :dependent => :destroy
            end
        end

    end

end
