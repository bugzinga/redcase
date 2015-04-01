class Redcase::CombosController < ApplicationController
	unloadable
	helper RedcaseHelper
	before_filter :find_project, :authorize
	
	def index
		@environment = params[:environment_id] ? ExecutionEnvironment.find(params[:environment_id]) : ExecutionEnvironment.get_default_for_project(@project)
		@version = params[:version_id] ? Version.find(params[:version_id]) : Version.order('created_on desc').find_by_project_id(@project.id)
		@execroot = params[:suite_id] ? ExecutionSuite.find_by_id(params[:suite_id]) : ExecutionSuite.get_root_for_project(@project)
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