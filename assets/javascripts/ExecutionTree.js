jQuery2(function() {
	Redcase.ExecutionTree.build();
});

Redcase.ExecutionTree = {}

Redcase.ExecutionTree.CheckCallback = function() {
	return false;
}

Redcase.ExecutionTree.IsDraggable = function() {
	return true;
}

Redcase.ExecutionTree.getHistory = function(data) {
	var
	i,
	notFirst,
	color,
	unique = {},
	txt = "<table class='redcase-row' width='100%'>";
	txt += "<tr style='font-weight: bold; background-color: #eeeeee'><td>date</td><td>result</td><td>comments</td><td>executor</td><td>environment</td><td>version</td></tr>";
	for (i = 0; i < data.length; i++) {
		switch (data[i].result) {
			case "Passed":
				color = "#BBFF88";
				break;
			case "Failed":
				color = "#FFBBBB";
				break;
			case "Not Available":
				color = "#DDDDDD";
				break;
			case "Blocked":
				color = "#CCCCFF";
				break;
			default:
				color = "#FFFFFF";
		}
		notFirst = (unique[data[i].environment + data[i].version]);
		txt += "<tr" + (notFirst ? " style='background-color: " + color + "'" : " style='background-color: " + color + "; font-weight: bold'") + ">";
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
}

Redcase.ExecutionTree.selectionChange = function (event, params) {
	var
	node = params.node,	
	edit = jQuery2('#test-case-edit');	
	edit.hide();
	jQuery2('#all-results-d').hide();
	if (node.original.type == 'case') {
		var apiParms = {};
		jQuery2.extend(apiParms, Redcase.methods.testCase.actions.index.getCall(), {
			params: {
				"object_id": node.original.issue_id
			},
			success: function(data) {
				var
				desc,
				subj,
				results,
				version,
				txt,
				apiParms = {};
				
				Redcase.ExecutionTree.currentIssue = data.issue_id;
				jQuery2('#exec_descr_id').toggle(data.desc !== undefined);
				desc = jQuery2('#test-case-desc');
				subj = jQuery2('#test-case-subj');
				subj.html('<a href="/issues/' + data.issue_id + '">' + data.text + '</a>');
				desc.html(data.desc);
				edit.show();
				results = jQuery2('#results');
				results.val('Passed');
				version = jQuery2('#version');
				
				jQuery2.extend(apiParms, Redcase.methods.executionJournal.actions.index.getCall(), {
					params: {
						"issue_id": node.original.issue_id,
						"version": version.val()
					},
					success: function(data) {
						jQuery2('#all-results-d').toggle(data.length > 0);
						if (data.length > 0) {
							txt = Redcase.ExecutionTree.getHistory(data);
							jQuery2('#all-results').html(txt);
						}
					},
					errorMessage: "Unable to get execution results"
				});					
				Redcase.apiCall(apiParms);
				apiParms = {};
				jQuery2.extend(apiParms, Redcase.methods.redcase.actions.getAttachmentURLs.getCall(), {
					params: {
						"issue_id": node.original.issue_id
					},
					success: function(data) {
						var txt;
						jQuery2('#test-case-attach').toggle(data.length > 0);
						if (data.length > 0) {
							txt = "";
							for (i = 0; i < data.length; i++) {
								txt += "<a href='" + data[i].url + "' target='_blank'>" + "<img src=" + '"' + "/images/attachment.png" + '"' + "></img>" + data[i].name + "</a><br/>";
							}
							jQuery2('#test-case-attach').html(txt);
						}
					},
					errorMessage: "Getting attachments failed"
				});
				Redcase.apiCall(apiParms);
			},
			errorMessage: "Information about test case '" + node.text + "' can't be obtained"
		});
		
		Redcase.apiCall(apiParms);
	}	
}

Redcase.ExecutionTree.build = function (params) {
	Redcase.ExecutionTree.tree = jQuery2('#execution_test_cases_tree_id').jstree({
			// Core config
			'core' : {
				'check_callback' : Redcase.ExecutionTree.CheckCallback,
				'data' : {
					'type' : 'GET',
					'url' : function() {return Redcase.context + Redcase.methods.executionSuite.actions.show.getCall(jQuery2('#list2_id').val()).method}
					/*
					'data' : function () {
						return {
							'id' : jQuery2('#list2_id').val()
						}
					}
					*/
				},
				'multiple' : false
			},

			// Contextmenu config
			'contextmenu' : {
				'items' : Redcase.ExecutionTree.getItems
			},

			'plugins' : ['contextmenu']
		});

	// Bind tree events
	//Redcase.ExecutionTree.tree.on('copy_node.jstree', Redcase.ExecutionTree.OnCopy);
	Redcase.ExecutionTree.tree.on('select_node.jstree', Redcase.ExecutionTree.selectionChange);
	Redcase.ExecutionTree.tree = jQuery2.jstree.reference(Redcase.ExecutionTree.tree);
}

Redcase.ExecutionTree.execute = function() {
	var 
		apiParms = {},
		issue_id = Redcase.ExecutionTree.currentIssue;
	
	if (issue_id !== undefined) {
		jQuery2.extend(apiParms, Redcase.methods.testCase.actions.update.getCall(issue_id), {
			params: {
				'version': jQuery2('#version').val(),
				'result': jQuery2('#results').val(),
				'envs': jQuery2('#environments').val(),
				'comment': jQuery2('#exec-comment').val()
			},
			success: function(data) {
				var
				nextNode;
				jQuery2('#all-results-d').toggle(data.length > 0);
				txt = Redcase.ExecutionTree.getHistory(data);
				jQuery2('#all-results').html(txt);
				nextNode = Redcase.ExecutionTree.tree.get_node(Redcase.ExecutionTree.tree.get_next_dom(Redcase.ExecutionTree.tree.get_selected(true)[0], true));
				if (nextNode !== undefined) {
					Redcase.ExecutionTree.tree.deselect_all();
					Redcase.ExecutionTree.tree.select_node(nextNode);					
				}
				jQuery2('#exec-comment').val('');
			},
			errorMessage: "Execution failed"
		});
		Redcase.apiCall(apiParms);
	}
}