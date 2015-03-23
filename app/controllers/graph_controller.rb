class GraphController < ApplicationController
	# TODO: remove it later
	#skip_before_filter :verify_authenticity_token

	unloadable
	#helper RedcaseHelper
	before_filter :find_project, :authorize
	
	def show
		if params[:all]
			count = 0
			keys = []
			values = []
			params[:all].each { |key, value| count += value.to_i }
			keys = params[:all].collect { |key, value| "#{key} (#{value})" if value.to_i != 0 }.compact
			color=[]
			params[:all].each { |key, value|
				if value.to_i != 0 then
					if key == "Failed"
						color << "#FF9999"
					elsif key == "Passed"
						color << "#99FF33"
					elsif key == "Blocked"
						color << "#9999CC"
					elsif key == "Not Executed"
						color << "#FFFFFF"
					elsif key == "Not Available"
						color <<  "#000000"
					end
				end
			}
			values = params[:all].values.collect { |x| 100 * x.to_i / count if x.to_i != 0}.compact
			g = Graph.new
			g.set_swf_path('plugin_assets/redcase/')
			g.pie(60, '#505050', '{font-size: 12px; color: #404040; background-color: white}')
			g.pie_values(values, keys)
			g.set_tool_tip("#val#%")
			g.set_bg_color('#ffffff')
			g.pie_slice_colors(color)
			render :text => g.render		
		else
			environment = ExecutionEnvironment.find(params[:environment_id])
			version = Version.find(params[:version_id])
			execroot = ExecutionSuite.find_by_id(params[:suite_id])
			graphData = TestGraph.get_data(version.id, environment.id, execroot.nil? ? -1 : execroot.id, @project.id)
			graph = open_flash_chart_object(500, 500, url_for(:action => 'show', :all => graphData), true, '/plugin_assets/redcase/')
			render :text => graph	
		end	
	end
	
	private
	def find_project
		@project = Project.find(params[:project_id])
	end			
end


