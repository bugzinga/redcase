class Redcase::ExecutionjournalsController < ApplicationController
	unloadable
	before_filter :find_project, :authorize
	
	def index
		if !params[:issue_id].nil?
			journals = ExecutionJournal.find_by_issue_id(params[:issue_id])
		else
			journals = ExecutionJournal.order('created_on desc')
		end
		render :json => journals.map(&:to_json)
	end	
	
	def find_project
		@project = Project.find(params[:project_id])
	end			
		
end


