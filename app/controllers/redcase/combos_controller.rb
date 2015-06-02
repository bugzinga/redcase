
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

