require 'open_flash_chart/open_flash_chart'
class Redcase::GraphController < ApplicationController
	unloadable
	before_filter :find_project, :authorize
	
	def show
		if params[:all]
			count = params[:all].inject(0) { |accumulator, (key, value)| accumulator += value.to_i; accumulator }			
			keys = params[:all].collect { |key, value| "#{key} (#{value})" if value.to_i != 0 }.compact
			values = params[:all].values.collect { |value| 100 * value.to_i / count if value.to_i != 0}.compact
			
			color = params[:all].inject([]) { |colors, (key, value)|
				if value.to_i != 0 then
					case key
					when "Failed"
						colors << "#FF9999"
					when "Passed"
						colors << "#99FF33"
					when "Blocked"
						colors << "#9999CC"
					when "Not Executed"
						colors << "#FFFFFF"
					when "Not Available"
						colors <<  "#000000"
					end			
				end
				colors
			}			
			graph = Graph.new
			graph.set_swf_path('plugin_assets/redcase/')
			graph.pie(60, '#505050', '{font-size: 12px; color: #404040; background-color: white}')
			graph.pie_values(values, keys)
			graph.set_tool_tip("#val#%")
			graph.set_bg_color('#ffffff')
			graph.pie_slice_colors(color)
			render :text => graph.render		
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


