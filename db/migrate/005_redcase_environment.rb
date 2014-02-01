
class RedcaseEnvironment < ActiveRecord::Migration

  def self.up
    create_table :execution_environments do |t|
      t.string  :name, :null => false, :limit => 128
      t.string  :description
      t.integer :project_id
    end
    add_column :execution_journals, :environment_id, :integer
  end
  
  def self.down
    remove_column :execution_journals, :environment_id
    drop_table :execution_environments
  end
  
end
