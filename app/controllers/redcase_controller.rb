class RedcaseController < ApplicationController
	unloadable
	helper RedcaseHelper
	before_filter :find_project, :authorize

	def index
		redcase_performance = RedcasePerformance.new

		redcase_performance.start('Getting root execution suite')
		@execroot = ExecutionSuite.get_root_for_project(@project)
		redcase_performance.stop

		redcase_performance.start('Getting project last version')
		@version = Version.order('created_on desc').find_by_project_id(@project.id)
		redcase_performance.stop

		redcase_performance.start('Getting default environment')
		@environment = ExecutionEnvironment.get_default_for_project(@project)
		redcase_performance.stop
		
		redcase_performance.start('Performing testcase maintenance')
		TestCase.maintenance(@project)
		redcase_performance.stop
		
		@list = ExecutionSuite.all.detect { |x| x.project == @project and x.parent == nil }
					
		@results = ExecutionSuite.get_results(@environment, @version, RedcaseHelper.get_id_or_default(@execroot, -1), @project.id)
	end
	
	def get_attachment_urls
		issue = Issue.find(params[:issue_id])
		result =  issue.attachments.collect { |x| { :url => url_for( :controller => '/attachments', :action => :show, :id => x.id), :name => x.filename } }
		render :json => result
	end
	
	
	private

	def find_project
		@project = Project.find(params[:id] || params[:project_id])
		if !User.current.allowed_to?(:view_test_cases, @project) && !User.current.allowed_to?(:edit_test_cases, @project)
			render_403
		end
	end	
end


