
class TestSuite < ActiveRecord::Base
  unloadable
  acts_as_tree :order => "name"
  has_many :test_cases, :dependent => :destroy
  belongs_to :project
end
