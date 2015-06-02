
class Excel_Exporter

	unloadable

	def self.exportTestResults(project_id, suite_id, version_id, environment_id)
		issues = Issue
			.order('id asc')
			.where({ project_id: project_id })
			.pluck(:id)
		test_cases = TestCase.where({ issue_id: issues })
		versions = Version.find(version_id)
		environments = ExecutionEnvironment.find(environment_id)
		rows = []
		rows << [
			'ID',
			'Suite',
			'Title',
			"#{versions.name}(#{environments.name})",
			'Comment'
		]
		test_cases = test_cases.sort { |a, b|
			(a.test_suite.name <=> b.test_suite.name)
		}
		test_cases.each { |test_case|
			if (suite_id.to_i < 0) || test_case.in_suite?(suite_id.to_i, project_id)
				row = []
				row << "##{test_case.issue.id}"
				row << test_case.test_suite.name
				row << "#{test_case.issue.subject}"
				found = ExecutionJournal
					.order('created_on desc')
					.find_by_test_case_id_and_environment_id_and_version_id(
						test_case.id,
						environments.id,
						versions.id
					)
				row << (!found ? 'Not Executed' : found.result.name)
				if found.present?
					if found.comment.present?
						row << found.comment
					else
						# TODO: Is it needed?
						row << ''
					end
				else
					# TODO: What's the point of this?
					row << ''
				end
				rows << row.clone
			end
		}
		bom = "\357\273\277"
		bom + rows.inject('') { |buffer, row|
			buffer += CSV.generate_line(row)
			buffer
		}.force_encoding('utf-8')
	end

end

