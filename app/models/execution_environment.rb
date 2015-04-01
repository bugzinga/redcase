class ExecutionEnvironment < ActiveRecord::Base
	unloadable
	belongs_to :project	
	has_many :journals, :class_name => 'ExecutionJournal', :foreign_key => 'environment_id', :dependent => :destroy
	
	attr_protected :id
	
	def self.get_default_for_project(project)
		env = ExecutionEnvironment.where({project_id: project.id}).first
		if env.nil?
			env = ExecutionEnvironment.create :name => 'Default', :description => 'Default environment', :project => project
		end
		return env
	end  
end
