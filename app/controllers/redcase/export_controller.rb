class Redcase::ExportController < ApplicationController
	unloadable
	before_filter :find_project, :authorize
	
	def index
		case params[:export_to]
			when 'excel'
				excelDoc = Excel_Exporter.exportTestResults(@project.id, params[:suite_id], params[:version_id], params[:environment_id])
				project_name = @project.name.gsub(' ', '_');
				send_data(excelDoc, { :filename => "TCReport-#{project_name}-#{Time.now.strftime('%d%m%Y-%I%M%S')}.csv"})
			when 'rtf'
				rtfDoc = Rtf_Exporter.exportTestSuiteSpec(params[:suite_id].to_i, @project)
				project_name = @project.name.gsub(' ', '_');
				send_data(rtfDoc, { :filename => 'TCReport-' + project_name + '-' + Time.now.strftime('%d%m%Y-%I%M%S') + '.rtf'})			
		end
	end	

	def find_project
		@project = Project.find(params[:project_id])
	end			
end


