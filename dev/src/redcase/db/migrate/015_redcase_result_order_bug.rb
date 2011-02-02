#

class RedcaseResultOrderBug < ActiveRecord::Migration

  def self.up
    rename_column  :execution_results, :order, :order_num
  end

  def self.down
    remove_column :execution_results, :order_num
    ExecutionResult.create(:name => 'Not Run')
  end

end
