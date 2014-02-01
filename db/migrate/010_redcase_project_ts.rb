
class RedcaseProjectTs < ActiveRecord::Migration

  def self.up
    add_column :test_suites, :project_id, :integer
    drop_table :test_suite_project
  end
  
  def self.down
    create_table :test_suite_project, :id => false do |t|
      t.integer :test_suite_id, :null => false
      t.integer :project_id, :null => false
    end
    add_index :test_suite_project, [:project_id], :unique => true
    add_index :test_suite_project, [:test_suite_id, :project_id], :unique => true, :name => "test_suite_project_index"
    remove_column :test_suites, :project_id
  end
  
end
