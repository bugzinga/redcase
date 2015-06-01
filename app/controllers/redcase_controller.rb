
class RedcaseController < ApplicationController

	unloadable
	helper RedcaseHelper
	before_filter :find_project, :authorize

	def index
		# TODO: Consider extending Project class instead to request a root
		#       execution suite from there.
		#       -- Example: @project.root_execution_suite
		@root_execution_suite = ExecutionSuite.get_root_for_project(@project)
		# TODO: Project class probably provides functionality to obtain all
		#       available versions. That can be used, or the class can be
		#       extended to provide a move convenient method.
		#       -- Example: @project.last_version
		@version = Version
			.order('created_on desc')
			.find_by_project_id(@project.id)
		# TODO: Request a default environment from a project.
		#       -- Example: @project.default_environment
		@environment = ExecutionEnvironment.get_default_for_project(@project)
		# TODO: Move maintenance() method in here as it seems to be not test
		#       case specific, but rather provides general kind of
		#       functionality. Or move it to some shared plugin entry point.
		TestCase.maintenance(@project)
		@results = ExecutionSuite.get_results(
			@environment,
			# FIXME: The page can be opened when the project has no versions
			#        yet. That might be the cause of some error messages that
			#        appear in popups if get_results() does not handle this case
			#        properly.
			@version,
			# FIXME: Get rid of the magic number -1.
			RedcaseHelper.get_id_or_default(@root_execution_suite, -1),
			# TODO: More OOP kind of style would be to supply a Project object
			#       instead of an indentifier.
			@project.id
		)
	end

	def get_attachment_urls
		issue = Issue.find(params[:issue_id])
		result =  issue.attachments.collect { |a| {
			:url => url_for(
				# TODO: This probably will fail if Redmine is running not in the
				#       root context. Shouldn't we remove '/'?
				:controller => '/attachments',
				:action => :show,
				:id => a.id
			),
			:name => a.filename
		} }
		render :json => result
	end

	private

	def find_project
		@project = Project.find(params[:id] || params[:project_id])
		can_view = User.current.allowed_to?(:view_test_cases, @project)
		can_edit = User.current.allowed_to?(:edit_test_cases, @project)
		render_403 unless (can_view || can_edit)
	end

end

