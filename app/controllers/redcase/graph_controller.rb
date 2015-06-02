
class Redcase::GraphController < ApplicationController

	unloadable
	before_filter :find_project, :authorize

	def show
		environment = ExecutionEnvironment.find(params[:environment_id])
		version = Version.find(params[:version_id])
		root_execution_suite = ExecutionSuite.find_by_id(params[:suite_id])
		graph_data = TestGraph.get_data(
			version.id,
			environment.id,
			root_execution_suite.nil? ? -1 : root_execution_suite.id,
			@project.id
		)
		render :json => get_json(graph_data)
	end

	private

	# TODO: This should go to some plugin's common config class.
	HIGHLIGHT_COLORS = {
		"Failed" => "#FFCCCC",
		"Passed" => "#C3FF76",
		"Blocked" => "#BBBBDD",
		"Not Executed" => "#E6E6E6",
		"Not Available" => "#2A2A2A"
	}

	# TODO: This should go to some plugin's common config class.
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

	# TODO: Extract to a base controller.
	def find_project
		@project = Project.find(params[:project_id])
	end

end

