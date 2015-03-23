class ExecutionjournalsController < ApplicationController
	# TODO: remove it later
	#skip_before_filter :verify_authenticity_token

	unloadable
	#helper RedcaseHelper
	before_filter :find_project, :authorize
	
	def index
		if (!params[:issue_id].nil?)
			journals = ExecutionJournal.find_by_issue_id(params[:issue_id])
		else
			journals = ExecutionJournal.find(:all, :order => 'created_on desc')
		end
		render :json => journals.collect { |j| j.to_json }			
	end	
	
	def find_project
		@project = Project.find(params[:project_id])
	end			
		
end


