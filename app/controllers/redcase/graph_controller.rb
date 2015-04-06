class Redcase::GraphController < ApplicationController
	unloadable
	before_filter :find_project, :authorize
	
	def show
		environment = ExecutionEnvironment.find(params[:environment_id])
		version = Version.find(params[:version_id])
		execroot = ExecutionSuite.find_by_id(params[:suite_id])
		graphData = TestGraph.get_data(version.id, environment.id, execroot.nil? ? -1 : execroot.id, @project.id)
		render :json => get_json(graphData)
	end
	
	private
	
	HIGHLIGHT_COLORS = { 
		"Failed" => "#FFCCCC",
		"Passed" => "#C3FF76",
		"Blocked" => "#BBBBDD",
		"Not Executed" => "#E6E6E6",
		"Not Available" => "#2A2A2A"
	}
	
	COLORS = { 
		"Failed" => "#FF9999",
		"Passed" => "#99FF33",
		"Blocked" => "#9999CC",
		"Not Executed" => "#FFFFFF",
		"Not Available" => "#000000"
	}	
	
	def get_json(counts)
		counts.inject([]) { |results, (result_name, count)| 
			result = {
				:value => count,
				:color => COLORS[result_name],
				:highlight => HIGHLIGHT_COLORS[result_name],
				:label => result_name				
			}
			results << result
		}
	end
	
	def find_project
		@project = Project.find(params[:project_id])
	end			
end


