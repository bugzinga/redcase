
class RedcaseSetup < ActiveRecord::Migration

  def self.up
    create_table :test_suites do |t|
      t.string  :name, :null => false, :limit => 128
      t.integer :parent_id, :default => nil
    end
    add_index :test_suites, [:name, :parent_id], :unique => true
    create_table :test_suite_project, :id => false do |t|
      t.integer :test_suite_id, :null => false
      t.integer :project_id, :null => false
    end
    add_index :test_suite_project, [:project_id], :unique => true
    add_index :test_suite_project, [:test_suite_id, :project_id], :unique => true, :name => "test_suite_project_index"
    create_table :execution_suites do |t|
      t.string  :name, :null => false, :limit => 128
      t.integer :parent_id, :default => nil
    end
    add_index :execution_suites, [:name, :parent_id], :unique => true
    create_table :execution_suite_project, :id => false do |t|
      t.integer :execution_suite_id, :null => false
      t.integer :project_id, :null => false
    end
    add_index :execution_suite_project, [:project_id], :unique => true
    add_index :execution_suite_project, [:execution_suite_id, :project_id], :unique => true, :name => "execution_suite_project_index"
    create_table :test_cases do |t|
      t.integer :test_suite_id, :null => false
      t.integer :issue_id, :null => false
    end
    add_index :test_cases, [:test_suite_id, :issue_id], :unique => true, :name => "test_suite_test_case_index"
    create_table :execution_suite_test_case, :id => false do |t|
      t.integer :execution_suite_id, :null => false
      t.integer :test_case_id, :null => false
    end
    add_index :execution_suite_test_case, [:execution_suite_id, :test_case_id], :unique => true, :name => "execution_suite_test_case_index"
  end
  
  def self.down
    drop_table :execution_suite_test_case
    drop_table :test_cases
    drop_table :execution_suite_project
    drop_table :execution_suites
    drop_table :test_suite_project
    drop_table :test_suites
  end
  
end
