
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

end
