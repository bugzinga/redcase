
class Rtf_Exporter

	unloadable

	include RTF

	@@cStyles = {}
	@@pStyles = {}

	private

	def self.initializeClass
		@@cStyles['CELL'] = CharacterStyle.new
		@@cStyles['CELL'].font = Font.new(Font::ROMAN, 'Times New Roman')
		@@cStyles['CELL'].bold  = true
		@@cStyles['HEADER'] = CharacterStyle.new
		@@cStyles['HEADER'].bold = true
		@@cStyles['HEADER'].font_size = 28
		@@pStyles = {}
		@@pStyles['HEADER'] = ParagraphStyle.new
		@@pStyles['HEADER'].justification = ParagraphStyle::CENTER_JUSTIFY
	end

	def self.getTestCases(suite_id, project)
		issues = Issue.where({ project_id: project.id }).collect { |i| i.id }
		test_cases = TestCase.where({ issue_id: issues })
		if suite_id >= 0
			test_cases = test_cases.select { |tc|
				tc.in_suite?(suite_id, project.id)
			}
		end
		test_cases
	end

	def self.writeTitle(document, project_name, suite_id)
		document.paragraph(@@pStyles['HEADER']) do |p|
			p.apply(@@cStyles['HEADER']) do |s|
				s << 'Test specification for'
			end
		end
		document.paragraph(@@pStyles['HEADER']) do |p|
			p.apply(@@cStyles['HEADER']) do |s|
				s << project_name
				if suite_id >= 0
					s << " - #{ExecutionSuite.find_by_id(suite_id).name}"
				end
			end
		end
	end

	def self.writeTable(document, test_cases)
		i = 0
		test_case = nil
		document.table((test_cases.length * 5), 2, 2000, 6000) { |t|
			t.border_width = 1
			t.entries.each { |r|
				if (i % 5) != 0
					node = TableCellNode.new(r)
					node.width = 8000
					r.children = [node]
					r.border_width = 1
				end
				case (i % 5)
					when 0
						test_case = test_cases[i / 5]
						r[0].apply(@@cStyles['CELL']) { |cell|
							cell << ' ID '
							cell << test_case.issue.id
						}
						r[1].apply(@@cStyles['CELL']) { |cell|
							cell << ' Title: '
						}
						r[1] << test_case.issue.subject
					when 1
						r[0].apply(@@cStyles['CELL']) { |cell|
							cell << ' Description:'
							2.times { cell.line_break }
						}
						count = 0
						test_case.issue.description.each_line { |line|
							count += 1
							r[0] << line
							r[0].line_break
						}
					when 2
						r[0].apply(@@cStyles['CELL']) { |cell|
							cell << ' Priority: '
						}
						r[0] << test_case.issue.priority.name
					when 3
						r[0].apply(@@cStyles['CELL']) { |cell|
							cell << ' Created by: '
						}
						r[0] << test_case.issue.author.name
					when 4
						r[0].border_width = 0
				end
				i += 1
			}
		}
	end

	initializeClass

	public

	def self.exportTestSuiteSpec(suite_id, project)
		test_cases = getTestCases(suite_id, project)
		document = Document.new(Font.new(Font::ROMAN, 'Times New Roman'))
		writeTitle(document, project.name, suite_id)
		writeTable(document, test_cases)
		document.to_rtf
	end

end

