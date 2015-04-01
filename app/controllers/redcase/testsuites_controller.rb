class Redcase::TestsuitesController < ApplicationController
	unloadable
	before_filter :find_project, :authorize
	
	def index
		testsuites = TestSuite.get_root_for_project(@project).to_json(view_context)
		render :json => testsuites
	end	
	
	def create
		created = TestSuite.create(:name => params[:name], :parent_id => params[:parent_id])
		render :json => created.to_json(view_context)
	end
	
	def update		
		testSuite = TestSuite.find(params[:id])		
		testSuite.parent = TestSuite.find(params[:parent_id]) unless (params[:parent_id].nil?)
		testSuite.name = params[:new_name] unless (params[:new_name].nil?)
		testSuite.save
		render :json => {:success => true}
	end
	
	def destroy
		TestSuite.destroy(params[:id])
		render :json => { 'success' => true }
	end

	def find_project
		@project = Project.find(params[:project_id])
	end			
end


