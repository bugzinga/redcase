
class Redcase::TestcasesController < ApplicationController

	unloadable
	before_filter :find_project, :authorize

	def index
		# TODO: What if there is none?
		test_case = TestCase.where({ issue_id: params[:object_id] }).first
		render :json => test_case.to_json(view_context)
	end

	def copy
		destination_project = Project.find(params[:dest_project])
		unless User.current.allowed_to?(:add_issues, destination_project)
			raise ::Unauthorized
		end
		# TODO: What if there is none?
		test_case = TestCase.where({ issue_id: params[:id] }).first
		test_case.copy_to(destination_project)
		render :json => { :success => true }
	end

	def update
		# TODO: What if there is none?
		test_case = TestCase.where({ issue_id: params[:id] }).first
		# TODO: All this stuff with inline "unless" is very difficult to
		#       perceive.
		test_case.test_suite = TestSuite.find(
			params[:parent_id]
		) unless params[:parent_id].nil?
		test_case.change_execution_suite(
			params[:source_exec_id], params[:dest_exec_id]
		) unless (params[:source_exec_id].nil? || params[:dest_exec_id].nil?)
		test_case.add_to_execution_suite(
			params[:dest_exec_id]
		) unless (!params[:source_exec_id].nil? || params[:dest_exec_id].nil?)
		test_case.remove_from_execution_suite(
			params[:remove_from_exec_id]
		) unless params[:remove_from_exec_id].nil?
		test_case.test_suite = TestSuite.get_obsolete(
			@project
		) unless params[:obsolesce].nil?
		if params[:result].nil?
			test_case.save
			render :json => {:success => true}
		else
			execute(test_case)
		end
	end

	private

	# TODO: Extract to a base controller.
	def find_project
		@project = Project.find(params[:project_id])
	end

	def execute(test_case)
		version = Version.find_by_name_and_project_id(
			params[:version],
			@project.id
		)
		comment = params[:comment].blank? ? nil : params[:comment]
		result = ExecutionResult.find_by_name(params[:result])
		environment = ExecutionEnvironment.find(params[:envs])
		ExecutionJournal.create(
			version: version,
			comment: comment,
			test_case: test_case,
			result: result,
			executor: User.current,
			environment: environment
		)
		render :json => ExecutionJournal
			.order('created_on desc')
			.where({ test_case_id: test_case.id })
			.collect { |ej| ej.to_json }
	end

end

