
class RedcaseExecRes < ActiveRecord::Migration

  def self.up
    create_table :execution_results do |t|
      t.string :name, :null => false
    end
    add_index :execution_results, [:name], :unique => true
    ExecutionResult.create(:name => 'Passed')
    ExecutionResult.create(:name => 'Failed')
    ExecutionResult.create(:name => 'Blocked')
    ExecutionResult.create(:name => 'Not Run')
    ExecutionResult.create(:name => 'Not Available')
  end
  
  def self.down
    drop_table :execution_results
  end
  
end
