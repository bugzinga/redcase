
class Redcase::ExportController < ApplicationController

	unloadable
	before_filter :find_project, :authorize

	def index
		project_name = @project.name.gsub(' ', '_');
		current_time = Time.now.strftime('%d%m%Y-%I%M%S')
		filename = "TCReport-#{project_name}-#{current_time}"
		case params[:export_to]
			when 'excel'
				excelDoc = Excel_Exporter.exportTestResults(
					@project.id,
					params[:suite_id],
					params[:version_id],
					params[:environment_id]
				)
				send_data(excelDoc, { :filename => "#{filename}.csv" })
			when 'rtf'
				rtfDoc = Rtf_Exporter.exportTestSuiteSpec(
					params[:suite_id].to_i,
					@project
				)
				send_data(rtfDoc, { :filename => "#{filename}.rtf" })
		end
	end

	# TODO: Extract to a base controller.
	def find_project
		@project = Project.find(params[:project_id])
	end

end

