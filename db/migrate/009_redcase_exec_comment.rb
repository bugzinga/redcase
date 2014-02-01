
class RedcaseExecComment < ActiveRecord::Migration

  def self.up
    change_table :execution_journals do |t|
      t.change :comment, :text
    end
  end
  
  def self.down
    change_table :execution_journals do |t|
      t.change :comment, :string
    end
  end
  
end
