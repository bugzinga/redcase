
var RedcaseExecutionTree = function($) {

	var tree;

	var currentIssueId;

	this.refresh = function() {
		if (tree) {
			tree.refresh();
		}
	};

	this.execute = function() {
		var issueId = currentIssueId;
		if (!issueId) {
			// TODO: Log something.
			return;
		}
		var selectedNode = tree.get_node(tree.get_selected(true)[0], true);
		var result = $('#results').val();
		var apiParams = $.extend(
			{},
			Redcase.methods.testCase.actions.update(issueId), {
				params: {
					version: $('#version').val(),
					result: result,
					envs: $('#environments').val(),
					comment: $('#exec-comment').val()
				},
				success: function(data) {
					$('#all-results-d').toggle(data.length > 0);
					$('#all-results').html(getHistory(data));
					tree.set_icon(
						selectedNode, (
							'testcase-result-icon-'
							+ result.replace(/\s*/g, '')
						)
					);
					selectNextNode();
					$('#exec-comment').val('');
					// TODO: When a user executes a test case, the results
					//       are getting updated and we need to refresh
					//       the Report tab as well. Triggering combo
					//       controls' changes might be not the best
					//       solution, but at least it seems to fix the
					//       issue with updates.
					Redcase.combos.refresh();
				},
				errorMessage: 'Execution failed'
			}
		);
		Redcase.apiCall(apiParams);
	};

	var build = function(params) {
		tree = $('#execution_test_cases_tree_id').jstree({
			core: {
				check_callback: function() {
					return false;
				},
				data: {
					type: 'GET',
					url: function() {
						return Redcase.context
							+ Redcase.methods.executionSuite.actions.show(
								$('#list2_id').val()
							).method
					},
					data: function() {
						return {
							version: $('#version').val(),
							environment: $('#environments').val()
						}
					}
				},
				multiple: false
			}
		});
		tree.on('select_node.jstree', selectionChange);
		tree = $.jstree.reference(tree);
	};

	var selectionChange = function(event, params) {
		var node = params.node;
		var edit = $('#test-case-edit');
		edit.hide();
		$('#all-results-d').hide();
		if (node.original.type == 'case') {
			var apiParms = $.extend(
				{},
				Redcase.methods.testCase.actions.index(), {
					params: {
						"object_id": node.original.issue_id
					},
					success: function(data) {
						currentIssueId = data.issue_id;
						$('#exec_descr_id').toggle(
							data.desc !== undefined
						);
						var desc = $('#test-case-desc');
						var subj = $('#test-case-subj');
						var issueUrl = getIssueUrl(data.issue_id);
						subj.html(
							'<a href="'
							+ issueUrl
							+ '">'
							+ data.text
							+ '</a>'
						);
						desc.html(data.desc);
						edit.show();
						var results = $('#results');
						results.val('Passed');
						var version = $('#version');
						var apiParms = $.extend(
							{},
							Redcase.methods.executionJournal.actions
								.index(), {
								params: {
									"issue_id": node.original.issue_id,
									"version": version.val()
								},
								success: function(data) {
									$('#all-results-d').toggle(
										data.length > 0
									);
									if (data.length > 0) {
										var txt = getHistory(data);
										$('#all-results').html(txt);
									}
								},
								errorMessage: (
									'Unable to get execution results'
								)
							}
						);
						Redcase.apiCall(apiParms);
						apiParms = $.extend(
							{},
							Redcase.methods.redcase.actions
								.getAttachmentURLs(), {
								params: {
									"issue_id": node.original.issue_id
								},
								success: function(data) {
									$('#test-case-attach').toggle(
										data.length > 0
									);
									if (data.length > 0) {
										var txt = "";
										for (i = 0; i < data.length; i++) {
											txt += "<a href='"
												+ data[i].url
												+ "' target='_blank'>"
												+ "<img src="
												+ '"'
												+ "/images/attachment.png"
												+ '"'
												+ "></img>"
												+ data[i].name
												+ "</a><br/>";
										}
										$('#test-case-attach').html(txt);
									}
								},
								errorMessage: "Getting attachments failed"
							}
						);
						Redcase.apiCall(apiParms);
					},
					errorMessage: (
						"Information about test case '"
						+ node.text
						+ "' can't be obtained"
					)
				}
			);
			Redcase.apiCall(apiParms);
		}
	};

	var getHistory = function(data) {
		var unique = {};
		var txt = "<table class='redcase-row' width='100%'>"
			+ "<tr style='font-weight: bold; background-color: #eeeeee'>"
			+ "<td>date</td>"
			+ "<td>result</td>"
			+ "<td>comments</td>"
			+ "<td>executor</td>"
			+ "<td>environment</td>"
			+ "<td>version</td>"
			+ "</tr>";
		for (var i = 0; i < data.length; i++) {
			var color;
			switch (data[i].result) {
				case "Passed":
					color = "#bbff88";
					break;
				case "Failed":
					color = "#ffbbbb";
					break;
				case "Not Available":
					color = "#dddddd";
					break;
				case "Blocked":
					color = "#ccccff";
					break;
				default:
					color = "#ffffff";
					break;
			}
			var notFirst = (unique[data[i].environment + data[i].version]);
			txt += "<tr"
				+ (notFirst
					? " style='background-color: " + color + "'"
					: (
						" style='background-color: "
						+ color
						+ "; font-weight: bold'"
					)
				)
				+ ">";
			txt += "<td>" + data[i].created_on + "</td>";
			txt += "<td>" + data[i].result + "</td>";
			txt += "<td>" + data[i].comment + "</td>";
			txt += "<td>" + data[i].executor + "</td>";
			txt += "<td>" + data[i].environment + "</td>";
			txt += "<td>" + data[i].version + "</td>";
			txt += "</tr>";
			if (!notFirst) {
				unique[data[i].environment + data[i].version] = 1;
			}
		}
		txt += "</table>";
		return txt;
	};

	var selectNextNode = function() {
		var nextNode = tree.get_node(
			tree.get_next_dom(tree.get_selected(true)[0], false)
		);
		while (nextNode && (nextNode.original.type !== 'case')) {
			if (nextNode.children.length > 0) {
				tree.open_node(nextNode);
			}
			nextNode = tree.get_node(tree.get_next_dom(nextNode, false));
		}
		if (!nextNode) {
			return;
		}
		tree.deselect_all();
		tree.select_node(nextNode);
	};

	(function() {
		build();
		$('#execution_settings_id').on(
			'change',
			'select',
			function() {
				tree.refresh();
			}
		);
	})();

};

jQuery2(function($) {
	if (!Redcase) {
		Redcase = {};
	}
	if (Redcase.executionTree) {
		return;
	}
	Redcase.executionTree = new RedcaseExecutionTree($);
});

