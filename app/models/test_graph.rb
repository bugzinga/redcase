
class TestGraph

	unloadable

	def self.get_data(version_id, environment_id, suite_id, project_id)
		all = ExecutionResult.all.inject({}) { |names, result|
			names[result.name] = 0
			names
		}
		un_count = 0
		TestCase
			.includes(execution_journals: [ :result ])
			.joins(:issue)
			.where({ 'issues.project_id' => project_id })
			.each { |tc|
				included =
					if suite_id.to_i >= 0
						tc.in_suite?(suite_id, project_id)
					else
						tc.execution_suites.any?
					end
				if included
					jns = tc.execution_journals.select { |x|
						(x.version_id == version_id) && (x.environment_id == environment_id)
					}.compact
				end
				if !jns.nil? && !jns.empty?
					jns = jns.sort { |x, y| (y.created_on - x.created_on) }
					all[jns[0].result.name] += 1
				else
					un_count += 1
				end
			}
		all['Not Executed'] = un_count
		all
	end

end

