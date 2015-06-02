
class Redcase::ExecutionjournalsController < ApplicationController

	unloadable
	before_filter :find_project, :authorize

	def index
		journals =
			if !params[:issue_id].nil?
				ExecutionJournal.find_by_issue_id(params[:issue_id])
			else
				ExecutionJournal.order('created_on desc')
			end
		render :json => journals.map(&:to_json)
	end

	# TODO: Extract to a base controller.
	def find_project
		@project = Project.find(params[:project_id])
	end

end

