
# require "redcase_helper"

# The library for CSV format export.
# CSV should be replaced with XLS soon.
require 'csv'

# The library for RTF format export.
#require 'rtf'
require 'open_flash_chart/open_flash_chart'

class RedcaseController < ApplicationController

  # TODO: remove it later
  skip_before_filter :verify_authenticity_token

  unloadable
  include RTF
  include RedcaseHelper
  before_filter :find_project, :authorize

  def index
    redcase_performance = RedcasePerformance.new
    #redcase_performance.start('Getting all test suites and links')
    #all_test_suites = TestSuite.find(:all, :include => [ { :test_cases => { :issue => [ :author, :priority, :status ] } } ] )
    #redcase_performance.stop
    #redcase_performance.start('Getting all execution suites and links')
    #all_execution_suites = ExecutionSuite.find(:all, :include => [ { :test_cases => { :issue => [ :author, :priority, :status ] } } ] )
    #redcase_performance.stop
    redcase_performance.start('Searching all other projects')
    @other_projects = Project.find(:all, :conditions => "id <> #{@project.id}")
    redcase_performance.stop
    redcase_performance.start('Getting root test suite')
    @root = test_suite_root(@project)
    redcase_performance.stop
    redcase_performance.start('Getting root execution suite')
    @execroot = execution_suite_root(@project)
    redcase_performance.stop
    redcase_performance.start('Getting project last version')
    @version = get_last_version(@project)
    redcase_performance.stop
    redcase_performance.start('Getting default environment')
    @environment = execution_environment_default(@project)
    redcase_performance.stop
    redcase_performance.start('Getting graph information')
    get_graph_core(@version.id, @environment.id) if not @version.nil?
    redcase_performance.stop
    redcase_performance.start('Getting all project issues')
    all_issues = Issue.find_all_by_project_id(@project.id, :include => [ :tracker, :test_case, :status ]);
    redcase_performance.stop
    redcase_performance.start('Getting all obsolete issues')
    obsoleted_issues = all_issues.select { |issue| (issue.tracker.name == "Test case") and (issue.status.name == "Obsolete")}
    obsoleted_issues.each { |issue|
      if not issue.test_case.nil?
        if not issue.test_case.test_suite.name == ".Obsolete"
          issue.test_case.test_suite = test_suite_obsolete(@project)
          issue.test_case.save();
        end
        if not issue.test_case.execution_suites.nil?
          issue.test_case.execution_suites.each { |x| x.test_cases.delete(issue.test_case) }
        end
      end

    }
    redcase_performance.stop
    redcase_performance.start('Searching for unlinked test case issues')
    unlinked_issues = all_issues.select { |issue| (issue.tracker.name == "Test case") and (issue.test_case.nil?) }
    unlinked_issues.each { |issue|
      x = TestCase.create(:issue => issue, :test_suite => @root.children.detect { |o| o.name == ".Unsorted" } )
    }
    redcase_performance.stop
    redcase_performance.start('Searching for dead test cases')
    missed_tc = all_issues.collect { |issue|
      tc = issue.test_case # TestCase.find_by_issue_id(issue.id)
      tc if (tc && (issue.tracker.name != "Test case"))
    }.compact
    missed_tc.each { |tc| tc.destroy }
    redcase_performance.stop
    redcase_performance.start('Getting all root execution suites')
    @list = ExecutionSuite.all.detect { |x| x.project == @project and x.parent == nil }
    redcase_performance.stop
    redcase_performance.start('Getting default execution environment')
    @env = execution_environment_default(@project)
    redcase_performance.stop
    redcase_performance.start('Convert root test suite to json')
    @root_json = test_suite_to_json(@root)
    redcase_performance.stop
    redcase_performance.start('Convert root execution suite to json')
    @exec_json = execution_suite_to_json(@execroot)
    redcase_performance.stop
    respond_to do |format|
      format.html
      format.json {
        if params[:node].to_i == @root.id then
          ts = TestSuite.find(params[:node], :include => [ :test_cases ] )
          c = ts.children.select { |x| (x.name != '.Obsolete' and x.name != '.Unsorted') }.collect { |x| test_suite_to_json(x) } +
            ts.test_cases.collect { |tc| test_case_to_json(tc) } +
            ts.children.select { |x| (x.name == '.Obsolete' or x.name == '.Unsorted') }.collect { |x| test_suite_to_json(x) }
          render :json => c
        elsif params[:ex] then
          render :json => execution_suite_to_json(ExecutionSuite.find(params[:ex]))
        else
          ts = TestSuite.find(params[:node], :include => [ :test_cases ] )
          c = ts.children.collect { |x| test_suite_to_json(x) } + ts.test_cases.collect { |tc| test_case_to_json(tc) }
          render :json => c
        end
      }
    end
  end

  def execlist
    @project = Project.find(params[:project_id])
    @other_projects = Project.find(:all, :conditions => 'id <> ' + @project.id.to_s)
    @execroot = execution_suite_root(@project)
    respond_to do |format|
      format.html
      format.json { render :json => ExecutionSuite.find(params[:node]).children.collect { |es| execution_suite_to_json(es) } + ExecutionSuite.find(params[:node]).test_cases.collect { |tc| test_case_to_json(tc) } }
    end
  end

  def test_suite_manager
    if params[:do] == 'create' then
      @created = TestSuite.create(:name => params[:name], :parent_id => params[:parent_id])
      respond_to do |format|
        format.json { render :json => test_suite_to_json(@created) }
      end
    elsif params[:do] == 'delete' then
      TestSuite.destroy(params[:test_suite_id])
      redirect_to :action => "index", :params => { "project_id" => params[:project_id] }
    elsif params[:do] == 'move' then
      x = TestSuite.find(params[:object_id])
      x.parent = TestSuite.find(params[:parent_id])
      x.save
      respond_to do |format|
        format.json { render :json => test_suite_to_json(x) }
      end
    elsif params[:do] == 'rename' then
      ts = TestSuite.find(params[:test_suite_id])
      ts.name = params[:new_name]
      ts.save
      respond_to do |format|
        format.json { render :json => test_suite_to_json(ts) }
      end
    elsif params[:do] == 'move_test_case'
      x = TestCase.find(:first, :conditions => 'issue_id = ' + params[:object_id])
      x.test_suite = TestSuite.find(params[:parent_id])
      x.save
      respond_to do |format|
        format.json { render :json => test_case_to_json(x) }
      end
    end
  end

  def execution_suite_manager
    if params[:do] == 'create' then
      ExecutionSuite.create(:name => params[:name], :parent_id => params[:parent_id])
      redirect_to :action => "index", :params => { "project_id" => params[:project_id] }
    elsif params[:do] == 'delete' then
      ExecutionSuite.destroy(params[:suite_id])
      redirect_to :action => "index", :params => { "project_id" => params[:project_id] }
    elsif params[:do] == 'move' then
      x = ExecutionSuite.find(params[:object_id])
      x.parent = ExecutionSuite.find(params[:parent_id])
      x.save
      respond_to do |format|
        format.json { render :json => execution_suite_to_json(x) }
      end
    elsif params[:do] == 'rename' then
      es = ExecutionSuite.find(params[:exec_suite_id])
      es.name = params[:new_name]
      es.save
      respond_to do |format|
        format.json { render :json => execution_suite_to_json(es) }
      end
    elsif params[:do] == 'move_test_case' then
      tc = TestCase.find(:first, :conditions => 'issue_id = ' + params[:object_id])
      x = ExecutionSuite.find(params[:owner_id])
      y = ExecutionSuite.find(params[:parent_id])
      y.test_cases << tc
      x.test_cases.delete(tc)
      respond_to do |format|
        format.json { render :json => execution_suite_to_json(y) }
      end
    end
  end

  def reassign_test_case
    tc = TestCase.find_by_issue_id(params[:id])
    ts = tc.test_suite
    col = []
    parent = ts
    while parent != test_suite_root(Project.find(params[:real_project_id])) do
      col << parent
      parent = parent.parent
    end
    col = col.reverse
    nts = test_suite_root(Project.find(params[:project_id]))
    col.each { |x|
      det = nts.children.detect { |y| y.name == x.name }
      if !det then
        det = TestSuite.new(:name => x.name)
        nts.children << det
        det.reload
      end
      nts = det
      nts.reload
    }
    ois = Issue.find(params[:id])
    #is = Issue.create(:project_id => params[:project_id], :subject => ois.subject, :tracker_id => ois.tracker_id, :author_id => ois.author_id)
    is = Issue.create(:project_id => params[:project_id], :tracker_id => ois.tracker_id, :author_id => ois.author_id, :status_id => ois.status_id, :priority_id => ois.priority_id, :subject => ois.subject)
    TestCase.create(:issue => is, :test_suite => nts)
    redirect_to :action => "index", :params => { "project_id" => params[:real_project_id] }
  end

  def copy_test_case_to_exec
    tc = TestCase.where(:issue_id => params[:object_id]).first
    y = ExecutionSuite.find(params[:parent_id])
    y.test_cases << tc
    respond_to do |format|
      format.json { render :json => execution_suite_to_json(y) }
    end
  rescue ActiveRecord::RecordNotUnique
    head :not_acceptable
  end

  def delete_test_case_from_execution_suite
    tc = TestCase.find(:first, :conditions => 'issue_id = ' + params[:issue_id])
    x = ExecutionSuite.find(params[:suite_id])
    x.test_cases.delete(tc)
    respond_to do |format|
      format.json { render :json => execution_suite_to_json(x) }
    end
  end

  def test_case_to_obsolete
    tc = TestCase.find(:first, :conditions => 'issue_id = ' + params[:issue_id])
    tc.test_suite = test_suite_obsolete(Project.find(params[:project_id]))
    tc.save
    respond_to do |format|
      format.json { render :json => test_case_to_json(tc) }
    end
  end

  def get_test_case
    tc = TestCase.find(:first, :conditions => 'issue_id = ' + params[:object_id])
    respond_to do |format|
      format.json { render :json => test_case_to_json(tc) }
    end
  end

  def get_advanced_execution
    @environment = ExecutionEnvironment.find(params[:environment_id])
    @version = Version.find(params[:version_id])
    issues = Issue.find_all_by_project_id(@project.id).collect { |i| i.id }
    test_cases = TestCase.find(:all, :conditions => { :issue_id => issues })
    @all_res = {}
    @results = []
    test_cases.each do |tc|
      found = ExecutionJournal.find_by_test_case_id_and_environment_id_and_version_id(tc.id, @environment.id, @version.id, :order => 'created_on desc')
      @results << found
    end
    @results = @results.compact
    render :partial => 'report_results'
  end

  def execute
    version = params[:version].blank? ? nil : Version.find_by_name_and_project_id(params[:version], params[:project_id])
    comment = params[:comment].blank? ? nil : params[:comment]
    test_case = TestCase.find_by_issue_id(params[:issue_id])
    result = ExecutionResult.find_by_name(params[:result])
    env = ExecutionEnvironment.find(params[:envs])
    ExecutionJournal.create(:version => version, :comment => comment, :test_case => test_case, :result => result, :executor => User.current, :environment => env)
    respond_to do |format|
      format.json { render :json => ExecutionJournal.find(:all, :order => 'created_on desc', :conditions => 'test_case_id = ' + test_case.id.to_s).collect { |j| execution_journal_to_json(j) } }
    end
  end

  def get_executions
    test_case = TestCase.find_by_issue_id(params[:issue_id])
    respond_to do |format|
      format.json { render :json =>  ExecutionJournal.find(:all, :order => 'created_on desc', :conditions => 'test_case_id = ' + test_case.id.to_s).collect { |j| execution_journal_to_json(j) } }
    end
  end

  def get_attachment_urls
    issue = Issue.find(params[:issue_id])
    result =  issue.attachments.collect { |x| { :url => url_for( :controller => 'attachments', :action => x.id), :name => x.filename } }
    respond_to do |format|
      format.json { render :json => result }
    end
  end

  def export_to_excel2
    issues = Issue.find_all_by_project_id(@project.id, :order => 'id asc').collect { |issue| issue.id }
    test_cases = TestCase.find(:all, :conditions => { :issue_id => issues })
    versions = Version.find(params[:version_id])
    environments = ExecutionEnvironment.find(params[:environment_id])
    rows = []
    rows << (["ID"] + ["Suite"] + ["Title"] + ["#{versions.name}"+"(#{environments.name})"] + ["Comment"]).flatten
    test_cases = test_cases.sort! { |a, b| a.test_suite.name <=> b.test_suite.name }
    test_cases.each { |test_case|
      row = []
      row << "##{test_case.issue.id}"
      row << test_case.test_suite.name
      row << "#{test_case.issue.subject}"
      found = ExecutionJournal.find_by_test_case_id_and_environment_id_and_version_id(test_case.id, environments.id, versions.id, :order => 'created_on desc')
      row << ((not found) ? "Not Executed" : found.result.name)
      if not (found.nil?)
        if not (found.comment.nil?)
          row << (found.comment)
        else
          row << ""
        end

      else
        row << ""
      end
      rows << row.clone
    }
    buffer = ''
    rows.each { |row| buffer += CSV.generate_line(row) }
    project_name = @project.name.gsub(' ', '_');
    send_data(buffer, { :filename => "TCReport-#{project_name}-#{Time.now.strftime('%d%m%Y-%I%M%S')}.csv"})
  end

  def export_to_rtf
    issues = Issue.find_all_by_project_id(@project.id).collect { |i| i.id}
    test_cases = TestCase.find(:all, :conditions => { :issue_id => issues })
    document = Document.new(Font.new(Font::ROMAN, 'Times New Roman'))
    style = CharacterStyle.new
    style.font = Font.new(Font::ROMAN, 'Times New Roman')
    style.bold  = true
    i = 0
    document.table(test_cases.length * 5, 2, 2000, 6000) { |t|
      t.border_width = 1
      t.entries.each { |r|
        tc = test_cases[i / 5]
        if (i % 5) != 0 then
          node = TableCellNode.new(r)
          node.width = 8000
          r.children = [node]
          r.border_width = 1
        end
        case i % 5
        when 0
          r[0].apply(style) do |cell|
            cell << ' ID '
            cell << tc.issue.id
          end
          r[1].apply(style) do |cell|
            cell << ' Title: '
          end
          r[1] << tc.issue.subject
        when 1
          r[0].apply(style) do |cell|
            cell << ' Description:'
            2.times { cell.line_break }
          end
          count = 0
          tc.issue.description.each_line {|line| count += 1
            r[0] << line
            r[0].line_break}
        when 2
          r[0].apply(style) do |cell|
            cell << ' Priority: '
          end
          r[0] << tc.issue.priority.name
        when 3
          r[0].apply(style) do |cell|
            cell << ' Created by: '
          end
          r[0] << tc.issue.author.name
        when 4
          r[0].border_width = 0
        end
        i += 1
      }
    }
    prj = @project.name;
    prj = prj.gsub(' ', '_')
    send_data(document.to_rtf, { :filename => 'TCReport-' + prj + '-' + Time.now.strftime('%d%m%Y-%I%M%S') + '.rtf'})
  end

  def update_environment
    if params[:act] == 'new' then
      @env = ExecutionEnvironment.new params[:env]
      @env.project_id = params[:project_id]
      @env.save
    elsif params[:act] == 'save' then
      @env = ExecutionEnvironment.find params[:env][:id]
      @env.update_attributes params[:env]
      if not @env.project_id.nil? then
        @env.project_id = params[:project_id]
      end
      @env.save
    elsif params[:act] == 'delete' then
      @env = ExecutionEnvironment.find params[:env][:id]
      @env.destroy
      @env = execution_environment_default Project.find(params[:project_id])
    else
      @env = ExecutionEnvironment.find(params[:env_id])
    end
    render :partial => 'management_environments'
  end

  def update_exelists
    if params[:act] == 'new' then
      @list = ExecutionSuite.new params[:list]
      @list.project_id = params[:project_id]
      @list.save
    elsif params[:act] == 'save' then
      @list = ExecutionSuite.find params[:list][:id]
      @list.update_attributes params[:list]
      if @list.project.nil? then
        @list.project = Project.find(params[:project_id])
      end
      @list.save
    elsif params[:act] == 'delete' then
      @list = ExecutionSuite.find params[:list][:id]
      @list.destroy
      @list = ExecutionSuite.find_by_project_id(params[:project_id])
    end
    @environment = execution_environment_default(@project)
    render :partial => 'management_execution_suites'
  end

  def update_exelists2
    @list2 = ExecutionSuite.find_by_project_id(params[:project_id])
    @version = get_last_version(params[:project_id])
    render :partial => 'execution_list'
  end

  def graph
    count = 0
    keys = []
    values = []
    params[:all].each { |key, value| count += value.to_i }
    keys = params[:all].collect { |key, value| "#{key} (#{value})" if value.to_i != 0 }.compact
    color=[]
    params[:all].each { |key, value|
      if value.to_i != 0 then
        if key == "Failed"
          color << "#FF9999"
        elsif key == "Passed"
          color << "#99FF33"
        elsif key == "Blocked"
          color << "#9999CC"
        elsif key == "Not Executed"
          color << "#FFFFFF"
        elsif key == "Not Available"
          color <<  "#000000"
        end
      end
    }
    values = params[:all].values.collect { |x| 100 * x.to_i / count if x.to_i != 0}.compact
    g = Graph.new
    g.set_swf_path('plugin_assets/redcase/')
    g.pie(60, '#505050', '{font-size: 12px; color: #404040; background-color: white}')
    g.pie_values(values, keys)
    g.set_tool_tip("#val#%")
    g.set_bg_color('#ffffff')
    g.pie_slice_colors(color)
    render :text => g.render
  end

  def get_graph
    @environment = ExecutionEnvironment.find(params[:environment_id])
    @version = Version.find(params[:version_id])
    get_graph_core(@version.id, @environment.id)
    render :text => @graph
  end

  def update_combos
    @environment = ExecutionEnvironment.find(params[:environment_id])
    @version = Version.find(params[:version_id])
    render :partial => 'report_combos'
  end

  def update_combos2
    @environment = ExecutionEnvironment.find(params[:environment_id])
    @version = Version.find(params[:version_id])
    render :partial => 'report_download_button'
  end

  private

  def find_project
    @project = Project.find(params[:id] || params[:project_id])
    if !User.current.allowed_to?(:view_test_cases, @project) && !User.current.allowed_to?(:edit_test_cases, @project)
      render_403
    end
  end

  def get_graph_core(version_id, environment_id)
    @all = {}
    ExecutionResult.all.each { |r| @all[r.name] = 0 }
    @results = []
    un_count = 0
    TestCase.all(:include => [ { :execution_journals => [ :result ] } ], :joins => :issue, :conditions => "issues.project_id = #{@project.id}" ).each do |tc|
      jns = tc.execution_journals.select { |x| x.version_id == version_id and x.environment_id == environment_id }.compact
      if jns.length > 0 then
        jns = jns.sort { |x, y| y.created_on - x.created_on }
        @all[jns[0].result.name] += 1
        @results << jns[0]
      else
        un_count += 1
      end
    end
    @results = @results.compact
    @all['Not Executed'] = un_count
    @graph = open_flash_chart_object(500, 500, url_for(:action => 'graph', :project_id => @project.id, :all => @all), true, '/plugin_assets/redcase/')
  end

end
