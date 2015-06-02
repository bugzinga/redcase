
# TODO: "Combos" is not business case specific name, we need to come up with a
#       better one. As this controller generates output for reports, it could be
#       ReportController which would had two separate methods to generate two
#       different kind of data (for the download button and the combo controls).
class Redcase::CombosController < ApplicationController

	unloadable
	helper RedcaseHelper
	before_filter :find_project, :authorize

	def index
		@environment =
			if params[:environment_id]
				ExecutionEnvironment.find(params[:environment_id])
			else
				ExecutionEnvironment.get_default_for_project(@project)
			end
		@version =
			if params[:version_id]
				Version.find(params[:version_id])
			else
				Version.order('created_on desc').find_by_project_id(@project.id)
			end
		@root_execution_suite =
			if params[:suite_id]
				ExecutionSuite.find_by_id(params[:suite_id])
			else
				ExecutionSuite.get_root_for_project(@project)
			end
		# TODO: Looks like two different partial views, should be separated.
		if params[:button]
			render :partial => 'redcase/report_download_button'
		else
			render :partial => 'redcase/report_combos'
		end
	end

	private

	def find_project
		@project = Project.find(params[:project_id] || params[:id])
	end

end

