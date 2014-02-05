
function execute() {
	log.info('Executing a test case');
	var executionTree = jQuery('#executionTree').jstree();
	var node = executionTree.get_selected(true)[0];
	result = Ext.get('results');
	envs = Ext.get('environments');
	version = Ext.get('version');
	comment = Ext.get('exec-comment');
	conn = new Ext.data.Connection();
	Redcase.apiCall({
		httpMethod: 'POST',
		method: 'execute',
		params: {
			"issue_id": node.li_attr.issue_id,
			"version": version.getValue(false),
			"result": result.getValue(false),
			"envs": envs.getValue(false),
			"comment": comment.getValue(false)
		},
		success: function(data) {
			Ext.get('all-results-d').setDisplayed(data.length > 0 ? 'inline-table' : 'none');
			txt = executionTab.getHistory(data);
			Ext.get('all-results').update(txt);
			next = treeHelper.findNext(node);
			executionTree.deselect_node(node);
			if (next) {
				executionTree.select_node(next);
			}
			Ext.get('exec-comment').dom.value = "";
		},
		errorMessage: "Execution failed"
	});
}

function onExecSelectionChange(model, node) {
	log.info('Execution tree selection changed');
	edit = Ext.get('test-case-edit');
	edit.setVisible(false);
	r = Ext.get('all-results-d');
	r.setDisplayed('none');
	if ((node.isLeaf && node.isLeaf()) || (node.li_attr && node.li_attr.issue_id)) {
		log.info('Node is a leaf');
		var issueId = node.isLeaf ? node.attributes.issue_id : node.li_attr.issue_id
		Redcase.apiCall({
			method: 'get_test_case',
			params: {
				"object_id": issueId
			},
			success: function(data) {
				Ext.get('exec_descr_id').setDisplayed(data.desc ? 'block' : 'none');
				desc = Ext.get('test-case-desc');
				subj = Ext.get('test-case-subj');
				subj.update(data.text);
				desc.update(data.desc);
				edit.setVisible(true);
				results = Ext.get('results');
				results.set({
					value: 'Passed'
				}, false);
				version = Ext.get('version');
				Redcase.apiCall({
					method: 'get_executions',
					params: {
						"issue_id": issueId,
						"version": version.getValue(false)
					},
					success: function(data) {
						Ext.get('all-results-d').setDisplayed(data.length > 0 ? 'inline-table' : 'none');
						if (data.length > 0) {
							txt = executionTab.getHistory(data);
							Ext.get('all-results').update(txt);
						}
					},
					errorMessage: "Execution failed"
				});
				Redcase.apiCall({
					method: 'get_attachment_urls',
					params: {
						"issue_id": issueId
					},
					success: function(data) {
						Ext.get('test-case-attach').setDisplayed(data.length > 0 ? 'block' : 'none');
						if (data.length > 0) {
							txt = "";
							for (i = 0; i < rs.length; i++) {
								txt += "<a href='" + data[i].url + "' target='_blank'>" + "<img src=" + '"' + "/images/attachment.png" + '"' + "></img>" + data[i].name + "</a><br/>";
							}
							Ext.get('test-case-attach').update(txt);
						}
					},
					errorMessage: "Getting attachments failed"
				});
			},
			errorMessage: "Information about test case '" + node.text + "' can't be obtained"
		});
	}
}

var executionTab = {

	updateTree: function() {
		log.info('Updating the execution tree on Execution tab');
		choosen = Ext.get('list2_id').getValue(false);
		Redcase.apiCall({
			// TODO: Wrong, there should be a call to ExecutionSuite
			//       entity/controller.
			method: Redcase.methods.main.method,
			params: {
				'ex': jQuery('#list2_id').val()
			},
			success: function(data) {
				data['prefix'] = 'execution_test_cases_tree';
				var executionTree = jQuery('#executionTree');
				executionTree.empty();
				executionTree.jstree().destroy();
				executionTree.jstree({core: {data: data}}).on('changed.jstree', function(e, data) {
					var node = data.instance.get_node(data.selected[0]);
					onExecSelectionChange(null, node);
				});
			},
			errorMessage: "Execution list cannot be reloaded"
		});
	},

	getHistory: function(data) {
		log.info('Showing test case history');
		unique = {};
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

};

// TODO: Refactor this crap
var treeHelper = {

	findNext: function(node) {
		log.info('Finding the next node');
		var executionTree = jQuery('#executionTree').jstree();
		var nexts = executionTree.get_next_dom(node, true);
		next = (nexts.length > 0) ? executionTree.get_node(nexts[0]) : null;
		if (!next) {
			var parentId = executionTree.get_parent(node);
			if (parentId === '#') {
				return null;
			}
			return parentId
				? this.findNext(executionTree.get_node(parentId))
				: null;
		} else if (next.li_attr.issue_id) {
			return next;
		} else {
			executionTree.open_node(next);
			var childNodes = executionTree.get_children_dom(next);
			for (i = 0; i < childNodes.length; i++) {
				child = executionTree.get_node(childNodes[i]);
				if (child.li_attr.issue_id) {
					return child;
				}
				executionTree.open_node(child);
				nextChild = this.findNested(child);
				if (nextChild) {
					return nextChild;
				}
			}
			return this.findNext(next);
		}
	},

	findNested: function(node) {
		var executionTree = jQuery('#executionTree').jstree();
		log.info('Finding the nested node');
		next = node;
		if (!next) {
			var parentId = executionTree.get_parent(node);
			if (parentId === '#') {
				return null;
			}
			return parentId
				? this.findNext(executionTree.get_node(parentId))
				: null;
		} else if (next.li_attr.issue_id) {
			return next;
		} else {
			executionTree.open_node(next);
			var childNodes = executionTree.get_children_dom(next);
			for (i = 0; i < childNodes.length; i++) {
				child = executionTree.get_node(childNodes[i]);
				if (child.li_attr.issue_id) {
					return child;
				}
				executionTree.open_node(child);
				nextChild = this.findNext(child);
				if (nextChild) {
					return nextChild;
				}
			}
			return this.findNext(next);
		}
	}

};
