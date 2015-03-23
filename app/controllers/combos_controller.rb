class CombosController < ApplicationController
	# TODO: remove it later
	#skip_before_filter :verify_authenticity_token

	unloadable
	helper RedcaseHelper
	before_filter :find_project, :authorize
	
	def index
		@environment = ExecutionEnvironment.find(params[:environment_id])
		@version = Version.find(params[:version_id])
		@execroot = ExecutionSuite.find_by_id(params[:suite_id])
		
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


