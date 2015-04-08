class Redcase::TestcasesController < ApplicationController
	unloadable
	before_filter :find_project, :authorize
	
	def index
		testCase = TestCase.where({issue_id: params[:object_id]}).first
		render :json => testCase.to_json(view_context)
	end

	def copy
		destination_project = Project.find(params[:dest_project])
		unless User.current.allowed_to?(:add_issues, destination_project)
			raise ::Unauthorized
		end
		testCase = TestCase.where({issue_id: params[:id]}).first
		testCase.copy_to(destination_project)
		render :json => {:success => true}
	end
		
	def update		
		testCase = TestCase.where({issue_id: params[:id]}).first
		testCase.test_suite = TestSuite.find(params[:parent_id]) unless params[:parent_id].nil?
		testCase.change_execution_suite(params[:source_exec_id], params[:dest_exec_id]) unless params[:source_exec_id].nil? or params[:dest_exec_id].nil?
		testCase.add_to_execution_suite(params[:dest_exec_id]) unless !params[:source_exec_id].nil? or params[:dest_exec_id].nil?
		testCase.remove_from_execution_suite(params[:remove_from_exec_id]) unless params[:remove_from_exec_id].nil?		
		testCase.test_suite = TestSuite.get_obsolete(@project) unless params[:obsolesce].nil?
		if params[:result].nil?			
			testCase.save
			render :json => {:success => true}
		else
			execute(testCase)
		end
	end
	

	private
	def find_project
		@project = Project.find(params[:project_id])
	end

	def execute(testCase)
		version = Version.find_by_name_and_project_id(params[:version], @project.id)
		comment = params[:comment].blank? ? nil : params[:comment]
		result = ExecutionResult.find_by_name(params[:result])
		environment = ExecutionEnvironment.find(params[:envs])
		ExecutionJournal.create(version: version, comment: comment, test_case: testCase, result: result, executor: User.current, environment: environment)
		render :json => ExecutionJournal.order('created_on desc').where({test_case_id: testCase.id}).collect { |j| j.to_json }	
	end
end


