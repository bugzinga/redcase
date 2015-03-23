class TestcasesController < ApplicationController
	# TODO: remove it later
	#skip_before_filter :verify_authenticity_token

	unloadable
	before_filter :find_project, :authorize
	
	def index
		testCase = TestCase.find(:first, :conditions => 'issue_id = ' + params[:object_id])
		render :json => testCase.to_json
	end	
	
	def create

	end
	
	def update		
		testCase = TestCase.find(:first, :conditions => 'issue_id = ' + params[:id])
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
	
	def destroy

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
		ExecutionJournal.create(:version => version, :comment => comment, :test_case => testCase, :result => result, :executor => User.current, :environment => environment)
		render :json => ExecutionJournal.find(:all, :order => 'created_on desc', :conditions => 'test_case_id = ' + testCase.id.to_s).collect { |j| j.to_json }	
	end
end


