
class ExecutionSuite < ActiveRecord::Base

	unloadable
	acts_as_tree :order => 'name'
	has_and_belongs_to_many(
		:test_cases,
		:join_table => 'execution_suite_test_case'
	)
	belongs_to :project
	attr_protected :id

	def self.get_root_for_project(project)
		execution_suite = ExecutionSuite.find_by_project_id(project.id)
		if execution_suite.nil?
			execution_suite = ExecutionSuite.create(
				:name => 'Root',
				:project => project
			)
		end
		execution_suite
	end

	def self.get_results(environment, version, suite_id, project_id)
	    if environment && version
			issues = Issue
				.where({ project_id: project_id })
				.pluck(:id)
			test_cases = TestCase.where({ issue_id: issues })
			unless suite_id < 0
				test_cases = test_cases.select { |tc|
					tc.in_suite?(suite_id, project_id)
				}
			end
			test_cases.inject([]) { |journals, tc|
				journals << ExecutionJournal
					.order('created_on desc')
					.find_by_test_case_id_and_environment_id_and_version_id(
						tc.id,
						environment.id,
						version.id
					)
				journals
			}.compact
		else
			[]
		end
	end
	
	# Lifted from: 
	# https://github.com/amerine/acts_as_tree/blob/dfe7e17bcf711686f4a7d8c772a00c9f3b2fec29/lib/acts_as_tree.rb
	# Traverse the tree and call a block with the current node and current
    # depth-level.
    #
    # options:
    #   algorithm:
    #     :dfs for depth-first search (default)
    #     :bfs for breadth-first search
    #   where: AR where statement to filter certain nodes
    #
    # The given block sets two parameters:
    #   first: The current node
    #   second: The current depth-level within the tree
    #
    # Example of acts_as_tree for model Page (ERB view):
    # <% Page.walk_tree do |page, level| %>
    #   <%= link_to "#{' '*level}#{page.name}", page_path(page) %><br />
    # <% end %>
    #
	def walk_tree(_options = {}, level = 0, node = nil, &block)
		options = {:algorithm => :dfs, :where => {}}.update(_options)
		case options[:algorithm]
			when :bfs
				nodes = (node.children).where(options[:where])
				nodes.each do |child|
					block.call child, level
				end
				nodes.each do |child|
					walk_tree options, level + 1, child, &block
				end
			else
				block.call node, level
				node.children.where(options[:where]).each do |child|
					walk_tree options, level + 1, child, &block
			end
		end
	end
		  
	def is_test_case_id_unique?(id)
		result = true
		walk_tree({}, 0, root) do |suite, level|
			if suite.test_cases.exists?(:id => id)
				result = false
				break
			end
		end
		result
	end
	
	# TODO: Move to view f.ex. using JBuilder
	#       (https://github.com/rails/jbuilder).
	def to_json(context, version = nil, environment = nil)
		{
			'suite_id'   => id,
			'text'       => name,
			'id'         => id,
			'expandable' => true,
			'expanded'   => (children.count + test_cases.count) == 0,
			'state'      => { 'opened' => parent.nil? },
			'editable'   => !parent.nil?,
			'children'   => (
				children.collect { |s| s.to_json(context, version, environment) } +
				test_cases
					.sort_by { |x| x.issue.subject }
					.collect { |tc| tc.to_json(context, version, environment) }
			),
			'type'      => 'suite'
		}
	end

end

