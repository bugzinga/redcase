
class RedcaseResultOrder < ActiveRecord::Migration

  def self.up
    add_column :execution_results, :order, :integer, :unique => true
    res = ExecutionResult.find_by_name('Not Run')
    res.destroy
    res = ExecutionResult.find_by_name('Passed')
    res.order = 1
    res.save
    res = ExecutionResult.find_by_name('Failed')
    res.order = 2
    res.save
    res = ExecutionResult.find_by_name('Blocked')
    res.order = 3
    res.save
    res = ExecutionResult.find_by_name('Not Available')
    res.order = 4
    res.save
  end
  
  def self.down
    remove_column :execution_results, :order
    ExecutionResult.create(:name => 'Not Run')
  end
  
end
