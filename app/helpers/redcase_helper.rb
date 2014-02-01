
# Different help methods to use them anywhere

require 'application_helper'
require 'prototype_legacy'

module RedcaseHelper

  include ApplicationHelper

  class RedcasePerformance < ActionController::Base
    def start(action)
      @action = action
      @start_time = Time.now
      logger.info "[Redcase] Time calculation: #{@action}"
    end
    def stop()
      result = (Time.now - @start_time)
      logger.info "#{result.round(4)} sec(s): #{@action}"
    end
  end

  def test_cases_count(test_suite)
    test_suite.test_cases.count + test_suite.children.inject(0) { |res, x| res + test_cases_count(x) }
  end

  # Returns root test suite linked to the project and creates one and nested 'system'
  # test suites (for 'obsolete' and 'unsorted' test cases) if they are not exist yet
  def test_suite_root(project)
    test_suite = TestSuite.find_by_project_id(
      project.id,
      :joins => :children,
      :include => [
        { :children => [
            { :children => { :test_cases => [ { :issue => [ :author, :status, :priority ] } ] }} ,
            { :test_cases => [ { :issue => [ :author, :status, :priority ] } ] } ] },
        [ { :children => :children }, { :test_cases => [{ :issue => [:author, :status, :priority] } ] } ]
      ])
    #test_suite = test_suites.detect { |x| x.project_id == project.id }
    if test_suite.nil? then
      test_suite = TestSuite.create(:name => "Root");
      test_suite.project = project
      test_suite.children << TestSuite.create(:name => ".Obsolete");
      test_suite.children << TestSuite.create(:name => ".Unsorted");
      test_suite.save
    end
    return test_suite
  end

  # Returns test suite linked to the project for 'obsolete' test cases
  def test_suite_unsorted(project)
    return test_suite_root(project).children.detect { |o| o.name == ".Unsorted"}
  end

  # Returns test suite linked to the project for 'unsorted' test cases
  def test_suite_obsolete(project)
    return test_suite_root(project).children.detect { |o| o.name == ".Obsolete"}
  end
  
  def execution_suite_root(project)
    # execution_suite = ExecutionSuite.find_by_project_id(
    #       project.id,
    #       :joins => :children,
    #       :include => [
    #         
    #         { :children => [
    #           
    #           { :children => { :test_cases => [ { :issue => [ :author, :status, :priority ] } ] } },
    #           { :test_cases => [ { :issue => [ :author, :status, :priority ] } ] } 
    #         
    #         ]},
    #         
    #         { :test_cases => [ { :issue => [ :author, :status, :priority ] } ] }
    #       ])
    execution_suite = ExecutionSuite.find_by_project_id(project.id)
    if execution_suite.nil?
      execution_suite = ExecutionSuite.create(:name => "Root", :project => project)
    end
    return execution_suite
  end

  def execution_environment_default(project)
    env = ExecutionEnvironment.find(:first, :conditions => "project_id = #{project.id}")
    if env.nil?
      env = ExecutionEnvironment.create :name => 'Default', :description => 'Default environment', :project => project
    end
    return env
  end
  
  def get_plugin_tabs(project)
    if Version.find_all_by_project_id(project.id).length == 0
      tabs = [
        {:name => 'Management', :partial => 'redcase/management', :label => :label_test_case_management}
      ]
    elsif !User.current.allowed_to?(:edit_test_cases, project)
      tabs = [
        {:name => 'Report', :partial => 'redcase/report', :label => :label_test_case_report}
      ]
    else
      tabs = [
        {:name => 'Management', :partial => 'redcase/management', :label => :label_test_case_management},
        {:name => 'Execution', :partial => 'redcase/execution', :label => :label_test_case_execution},
        {:name => 'Report', :partial => 'redcase/report', :label => :label_test_case_report}
      ]
    end
    return tabs
  end

  def find_test_suite_root(test_suite)
    root = test_suite
    while root.parent
      root = root.parent 
    end
    return root.reload
  end

  def get_test_suite_counts_tree(test_suite, result = nil)
    if not result then
      result = []
    end
    result << { :id => test_suite.id, :inner => test_suite.test_cases.count, :all => test_cases_count(test_suite) }
    test_suite.children.each { |x| get_test_suite_counts_tree(x, result) }
    result
  end

  def find_exec_suite_root(exec_suite)
    root = exec_suite
    while root.parent
      root = root.parent
    end
    return root.reload
  end

  def get_exec_suite_counts_tree(exec_suite, result = nil)
    if not result then
      result = []
    end
    result << { :id => exec_suite.id, :inner => exec_suite.test_cases.count, :all => test_cases_count(exec_suite) }
    exec_suite.children.each { |x| get_test_suite_counts_tree(x, result) }
    result
  end

  def get_test_suite_counts_trees(test_case)
    result = {}
    test_case.execution_suites.each { |x|
      root = find_exec_suite_root(x)
      result[root.id] = get_exec_suite_counts_tree(root)
    }
    result
  end

  def execution_journal_to_json(journal)
    {
      'created_on'  => journal.created_on.strftime('%d.%m.%Y %H:%M:%S'),
      'result'      => journal.result.name,
      'comment'     => journal.comment,
      'executor'    => (journal.executor.nil? ? '' : journal.executor.name),
      'environment' => journal.environment.name,
      'version'     => journal.version.name
    }
  end

  def test_case_to_json(test_case)
    textilized_description = (textilizable(test_case.issue.description.gsub(/#\d/) { |s| s.gsub("#", "N") }) if test_case.issue.description)
    {
      'issue_id'     => test_case.issue_id,
      'text'         => test_case.issue.subject,
      'editable'     => false,
      'desc'         => textilized_description,
      'leaf'         => true,
      'status'       => test_case.issue.status,
      'draggable'    => true,
      'qtipCfg'      => {
        :cls => 'test',
        :width => '500',
        :closable => 'true',
        :text => '"' + test_case.issue.subject + '"<br/>' +
          (test_case.issue.description.nil? ? '' : ('<br/><b>Description:</b><br/>' + textilized_description)) +
          '<br/><b>Priority:</b> ' + test_case.issue.priority.name +
          '<br/><b>Author:</b> ' + test_case.issue.author.name +
          '<br/><b>Created:</b> ' + test_case.issue.created_on.strftime('%d.%m.%Y %H:%M'),
        :title => ('Issue #' + test_case.issue.id.to_s),
        :dismissDelay => 30000
      },
      'counts'       => 0, #get_test_suite_counts_tree(find_test_suite_root(test_suite)).to_json,
      'counts_execs' => 0 #get_test_suite_counts_trees(self).to_json
    }
  end

  def execution_suite_to_json(suite)
    {
      'suite_id'       => suite.id,
      'text'           => suite.name,
      'id'             => suite.id,
      'expandable'     => true,
      'expanded'       => (suite.children.count + suite.test_cases.count) == 0,
      'editable'       => !suite.parent.nil?,
      'child_tc_count' => 0, #test_cases.count,
      'all_tc_count'   => 0, #test_cases_count(self),
      'children'       => suite.children.collect { |s| execution_suite_to_json(s) } + suite.test_cases.sort_by { |x| x.issue.subject }.collect { |tc| test_case_to_json(tc) },
      'counts'         => 0, #get_exec_suite_counts_tree(find_exec_suite_root(self)).to_json
    }
  end

  def test_suite_to_json(suite)
    if suite.parent_id then
      #logger.info("Child: #{suite.name}");
      kids = suite.children.collect { |s|
        #logger.info("select not root #{s.name}");
        test_suite_to_json(s)
      } + suite.test_cases.sort_by { |x|
        #logger.info("sort_by not root #{x.issue.subject}");
        x.issue.subject
      }.collect { |tc|
        #logger.info("sort_by not root/collect #{tc.issue.subject}");
        test_case_to_json(tc)
      }
    else
      #logger.info("Root: #{suite.name}");
      kids = suite.children.select { |x|
        #logger.info("select not obsolete/unsorted #{x.name}");
        (x.name != '.Obsolete' and x.name != '.Unsorted')
      }.collect { |s|
        #logger.info("select not/collect");
        test_suite_to_json(s)
      } +
        suite.test_cases.sort_by { |x|
        #logger.info("sort_by");
        x.issue.subject }.collect { |tc|
        #logger.info("sort_by/collect");
        test_case_to_json(tc)
      } +
        suite.children.select { |x|
        #logger.info("select obsolete/unsorted #{x.name}");
        (x.name == '.Obsolete' or x.name == '.Unsorted') }.collect { |s|
        #logger.info("select/collect");
        test_suite_to_json(s)
      }
    end
    {
      'suite_id'       => suite.id,
      'text'           => suite.name,
      'id'             => suite.id,
      'expandable'     => true,
      'expanded'       => false, #(suite.children.count + suite.test_cases.count) == 0,
      'editable'       => (!((suite.name == ".Unsorted" or suite.name == ".Obsolete") and suite.parent.parent.nil?) and !suite.parent.nil?),
      'children'       => kids,
      'draggable'      => (!suite.parent.nil? and !((suite.name == ".Unsorted" or suite.name == ".Obsolete") and suite.parent.parent.nil?)),
      'child_tc_count' => 0, #test_cases.count,
      'all_tc_count'   => 0, #test_cases_count(self),
      'counts'         => 0 #get_test_suite_counts_tree(find_test_suite_root(self)).to_json
    }
		
  end

  def get_url_for(action, project_id)
    "#{url_for(:action => action, :project_id => project_id)}"
  end
	
  def get_execution_suites_by_project_and_parent(project, parent = nil)
    ExecutionSuite.find_all_by_project_id_and_parent_id(project.id, parent.nil? ? nil : parent.id)
  end

  def get_environments_by_project(project)
    ExecutionEnvironment.find_all_by_project_id(project.id)
  end

  def update_execution_suite_link(icon, act, size = '20x20')
    link_to_remote image_tag(icon, :plugin => 'redcase', :size=> size, :style => 'vertical-align: middle'), :url => { :action => 'update_exelists', :project_id => @project.id, :act => act }, :update => :management_execution_suites_id, :submit => 'list_form', :complete => 'full()'
  end

  def update_environment_link(icon, act, size = '20x20')
    link_to_remote image_tag(icon, :plugin => 'redcase', :size=> size, :style => 'vertical-align: middle'), :url => { :action => 'update_environment', :project_id => @project.id, :act => act }, :update => :management_environments_id, :submit => 'environment_form_id', :complete => 'full()'
  end

  def get_last_version(project_id)
    Version.find_by_project_id(project_id, :order => 'created_on desc')
  end

end
