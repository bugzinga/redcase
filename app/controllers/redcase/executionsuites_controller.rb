class Redcase::ExecutionsuitesController < ApplicationController
	unloadable
	before_filter :find_project, :authorize
	
	
	def index
		if params[:get_results].nil?
			@list2 = ExecutionSuite.find_by_project_id(@project.id)
			@version = Version.order('created_on desc').find_by_project_id(@project.id)
			render :partial => 'redcase/execution_list'		
		else
			@environment = ExecutionEnvironment.find(params[:environment_id])
			@version = Version.find(params[:version_id])
			@execroot = ExecutionSuite.find_by_id(params[:suite_id])
			@results = ExecutionSuite.get_results(@environment, @version, params[:suite_id].to_i, @project.id)
			render :partial => 'redcase/report_results'
		end
	end
	
	def show
		render :json => ExecutionSuite.find(params[:id]).to_json(view_context)
	end
	
	def create
		if params[:parent_id].nil?		
			executionSuite = ExecutionSuite.create(:name => params[:name], :project_id => @project.id)
		else
			executionSuite = ExecutionSuite.create(:name => params[:name], :parent_id => params[:parent_id])
		end
		render :json => executionSuite.to_json(view_context)
	end
	
	def update		
		executionSuite = ExecutionSuite.find(params[:id])
		executionSuite.parent = ExecutionSuite.find(params[:parent_id]) unless params[:parent_id].nil?
		executionSuite.name = params[:new_name]	unless params[:new_name].nil?
		executionSuite.save
		render :json => { 'success' => true }
	end
	
	def destroy
		ExecutionSuite.destroy(params[:id])
		render :json => { 'success' => true }
	end

	def find_project
		@project = Project.find(params[:project_id])
	end			
end


