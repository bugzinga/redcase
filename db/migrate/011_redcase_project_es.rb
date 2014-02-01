
class RedcaseProjectEs < ActiveRecord::Migration

  def self.up
    add_column :execution_suites, :project_id, :integer
    drop_table :execution_suite_project
  end
  
  def self.down
    create_table :execution_suite_project, :id => false do |t|
      t.integer :execution_suite_id, :null => false
      t.integer :project_id, :null => false
    end
    add_index :execution_suite_project, [:project_id], :unique => true
    add_index :execution_suite_project, [:execution_suite_id, :project_id], :unique => true, :name => "execution_suite_project_index"
    remove_column :execution_suites, :project_id
  end
  
end
