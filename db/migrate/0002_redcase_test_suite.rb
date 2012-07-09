
class RedcaseTestSuite < ActiveRecord::Migration

    def self.up
        create_table :redcase_test_suites do |t|
            t.string  :name, :null =>false, :limit => 128
            t.integer :parent_id, :default => nil
            t.integer :project_id
        end
        add_index :redcase_test_suites, [ :name, :parent_id ], :unique => true, :name => :idx_redcase_test_suites
    end

    def self.down
        remove_index :redcase_test_suites, :name => :idx_redcase_test_suites
        drop_table :redcase_test_suites
    end

end
