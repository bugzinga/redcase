
class TestSuite < ActiveRecord::Base

    unloadable

    acts_as_tree :order => :name
    belongs_to   :project

end
