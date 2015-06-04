
class Redcase::ExportController < ApplicationController

	unloadable
	before_filter :find_project, :authorize

	def index
		project_name = @project.name.gsub(' ', '_');
		current_time = Time.now.strftime('%d%m%Y-%I%M%S')
		filename = "TCReport-#{project_name}-#{current_time}"
		case params[:export_to]
			when 'excel'
				doc = export_to_excel				
			when 'rtf'
				doc = export_to_rtf
		end
		send_data(doc[:document], { :filename => "#{filename}.#{doc[:extension]}"})
	end
	
	private
	
	def export_to_excel
		excelDoc = Excel_Exporter.exportTestResults(
			@project.id,
			params[:suite_id],
			params[:version_id],
			params[:environment_id]
		)
		{
			:document => excelDoc,
			:extension => "csv"
		}		
	end
	
	def export_to_rtf
		rtfDoc = Rtf_Exporter.exportTestSuiteSpec(
			params[:suite_id].to_i,
			@project
		)
		{
			:document => rtfDoc,
			:extension => "rtf"
		}
	end	

	# TODO: Extract to a base controller.
	def find_project
		@project = Project.find(params[:project_id])
	end
end

