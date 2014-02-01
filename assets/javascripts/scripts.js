
var context = 'redcase/';

var jsProjectId;
var jsCanEdit;
var jsCopyToMenuItems = [];

var suiteTree;
var execTree;
var exec2Tree;

var editorSuite;
var editorExec;

var currentNode;
var xCurrentNode;

var contextMenu;

var xContextMenu = new Ext.menu.Menu({
	items: [{
			text: 'Add suite',
			handler: function(b, e) {
				Ext.Msg.prompt('Creating test suite', 'Please enter execution suite name:', function(btn, text) {
					if (btn == 'ok') {
						request('execution_suite_manager', {
							'do': 'create',
							'name': text,
							'parent_id': xCurrentNode.attributes.suite_id
						}, function() {
							if (exec2Tree) {
								exec2Tree.root.attributes.children = null;
								exec2Tree.root.reload();
								exec2Tree.root.expand();
							}
							xCurrentNode.attributes.children = null;
							xCurrentNode.reload();
							xCurrentNode.expand();
						}, "Execution suite '" + text + "' can't be created"
							);
					}
				});
			}
		}, {
			text: 'Delete',
			handler: function() {
				if (xCurrentNode.parentNode == null) {
					return;
				}
				parentNode = xCurrentNode.parentNode;
				if (xCurrentNode.isLeaf()) {
					request('delete_test_case_from_execution_suite', {
						'id': xCurrentNode.attributes.issue_id,
						'suite_id': parentNode.attributes.suite_id
					}, function() {
						if (exec2Tree) {
							exec2Tree.root.attributes.children = null;
							exec2Tree.root.reload();
							exec2Tree.root.expand();
						}
						parentNode.attributes.children = null;
						parentNode.reload();
					}, "Test case '" + xCurrentNode.text + "' can't be deleted",
						'POST'
						);
				}
				else {
					request('execution_suite_manager', {
						'do': 'delete',
						'id': xCurrentNode.attributes.suite_id
					}, function() {
						if (exec2Tree) {
							exec2Tree.root.attributes.children = null;
							exec2Tree.root.reload();
							exec2Tree.root.expand();
						}
						parentNode.attributes.children = null;
						parentNode.reload();
					}, "Execution suite '" + xCurrentNode.text + "' can't be deleted",
						'POST'
						);
				}
			}
		}]
});

Ext.dd.StatusProxy.prototype.animRepair = false;

Ext.QuickTips.init();

Ext.chart.Chart.CHART_URL = '/plugin_assets/redcase/javascripts/ext-3.1.1/resources/charts.swf';

Ext.override(Ext.tree.TreeNodeUI, {
	renderElements: function(n, a, targetNode, bulkRender) {
		tree = n.getOwnerTree();
		root = tree.getRootNode();
		var color;
		if (n.isLeaf()) {
			checked:true;
			color = (n.attributes.status.issue_status.name == 'In Progress') ? 'green' : 'brown';
		}
		this.indentMarkup = n.parentNode ? n.parentNode.ui.getChildIndent() : '';
		var cb = Ext.isBoolean(a.checked),
			nel,
			href = a.href ? a.href : Ext.isGecko ? "" : "#",
			buf = [
				'<li class="x-tree-node">',
				'<div ext:tree-node-id="', n.id, '" class="x-tree-node-el x-tree-node-leaf x-unselectable ', a.cls, '" unselectable="on">',
				'<span class="x-tree-node-indent">', this.indentMarkup, "</span>",
				'<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />',
				'<img src="', a.icon || this.emptyIcon, '" class="x-tree-node-icon',
				(n.isLeaf() && n.attributes.status.issue_status.name == "In Progress")
					? ' in-progress'
					: ' others',
				(a.icon ? " x-tree-node-inline-icon" : ""),
				(a.iconCls ? " " + a.iconCls : ""),
				'" unselectable="on" />',
				cb ? ('<input class="x-tree-node-cb" type="checkbox" ' + (a.checked ? 'checked="checked" />' : '/>')) : '',
				'<a hidefocus="on" class="x-tree-node-anchor" href="', href, '" tabIndex="1" ', a.hrefTarget ? ' target="' + a.hrefTarget + '"' : "", '>',
				'<span unselectable="on"',
				(n.isLeaf() ? ((n.attributes.status.issue_status.name != "In Progress") ? ' style="color: lightgray"' : '') : ''),
				'>',
				n.text,
				/*
				 (!n.isLeaf()
				 ? "<span id='" + root.attributes.prefix + "#" + n.attributes.id + "' style='color: gray'>(" + n.attributes.child_tc_count + "/" + n.attributes.all_tc_count + ")</span>"
				 : ""), //<span unselectable='on' style='font-size: 8px; vertical-align: super; color: " + color + "'>" + n.attributes.status.name + "</span>"),
				 */
				"</span>",
				'</a>',
				'</div>',
				'<ul class="x-tree-node-ct" style="display:none;"></ul>',
				'</li>'
			].join('');
		if (bulkRender !== true && n.nextSibling && (nel = n.nextSibling.ui.getEl())) {
			this.wrap = Ext.DomHelper.insertHtml("beforeBegin", nel, buf);
		} else {
			this.wrap = Ext.DomHelper.insertHtml("beforeEnd", targetNode, buf);
		}
		this.elNode = this.wrap.childNodes[0];
		this.ctNode = this.wrap.childNodes[1];
		var cs = this.elNode.childNodes;
		this.indentNode = cs[0];
		this.ecNode = cs[1];
		this.iconNode = cs[2];
		var index = 3;
		if (cb) {
			this.checkbox = cs[3];
			// fix for IE6
			this.checkbox.defaultChecked = this.checkbox.checked;
			index++;
		}
		this.anchor = cs[index];
		this.textNode = cs[index].firstChild;
	}
});

function buildTestSuiteTree(params) {
	suiteTree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	getEditorSuite();
	if (jsCanEdit) {
		initSuiteContextMenu();
		suiteTree.on('contextmenu', function(node) {
			currentNode = node;
			node.select();
			contextMenu.items.get(0).setVisible(!node.isLeaf());
			isNotDeletable = (node.parentNode == null)
				|| ((node.parentNode.parentNode == null) && (node.text == ".Unsorted" || node.text == ".Obsolete"));
			contextMenu.items.get(1).setVisible(!isNotDeletable);
			contextMenu.items.get(2).setVisible(node.isLeaf());
			if (contextMenu.items.getCount() == 4) {
				contextMenu.items.get(3).setVisible(node.isLeaf());
			}
			contextMenu.show(node.ui.getAnchor());
		});
		suiteTree.on('beforenodedrop', function(dropEvent) {
			if (dropEvent.dropNode.isLeaf()) {
				request('test_suite_manager', {
					'do': 'move_test_case',
					'object_id': dropEvent.dropNode.attributes.issue_id,
					'parent_id': dropEvent.target.attributes.suite_id
				},
				function() {
					dropEvent.target.attributes.children = null;
					dropEvent.target.reload();
					dropEvent.target.expand();
					dropEvent.dropNode.remove(true);
				}, "Test case '" + dropEvent.dropNode.text + "' can't be moved"
					);
			} else {
				request('test_suite_manager', {
					'do': 'move',
					'object_id': dropEvent.dropNode.attributes.suite_id,
					'parent_id': dropEvent.target.attributes.suite_id
				}, function() {
					dropEvent.target.attributes.children = null;
					dropEvent.target.reload();
					dropEvent.target.expand();
					dropEvent.dropNode.remove(true);
				}, "Test suite '" + dropEvent.dropNode.text + "' can't be moved"
					);
			}
			dropEvent.cancel = true;
		});
		suiteTree.on('nodedragover', function(event) {
			event.cancel = (event.target.getOwnerTree() != event.dropNode.getOwnerTree())
				|| (event.target == event.dropNode.parentNode);
		});
	}
}

function buildExecutionSuiteTree(params) {
	execTree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	getEditorExec();
	if (jsCanEdit) {
		execTree.on('contextmenu', function(node) {
			xCurrentNode = node;
			node.select();
			if (node.isLeaf()) {
				xContextMenu.items.get(0).setVisible(false);
			} else {
				xContextMenu.items.get(0).setVisible(true);
			}
			xContextMenu.items.get(1).setVisible(node.parentNode != null);
			xContextMenu.show(node.ui.getAnchor());
		});
		execTree.on('beforenodedrop', function(dropEvent) {
			if (dropEvent.dropNode.isLeaf()) {
				if (dropEvent.target.getOwnerTree() != dropEvent.dropNode.getOwnerTree()) {
					if (dropEvent.dropNode.attributes.status.issue_status.name != "In Progress") {
						dropEvent.cancel = true;
						return;
					}
					request('copy_test_case_to_exec', {
						'object_id': dropEvent.dropNode.attributes.issue_id,
						'parent_id': dropEvent.target.attributes.suite_id
					}, function() {
						if (exec2Tree) {
							exec2Tree.root.attributes.children = null;
							exec2Tree.root.reload();
							exec2Tree.root.expand();
						}
						dropEvent.target.attributes.children = null;
						dropEvent.target.reload();
						dropEvent.target.expand();
					}, "Test case '" + dropEvent.dropNode.text + "' can't be added"
						);
				} else {
					request('execution_suite_manager', {
						'do': 'move_test_case',
						'object_id': dropEvent.dropNode.attributes.issue_id,
						'owner_id': dropEvent.dropNode.parentNode.attributes.suite_id,
						'parent_id': dropEvent.target.id
					}, function() {
						if (exec2Tree) {
							exec2Tree.root.attributes.children = null;
							exec2Tree.root.reload();
							exec2Tree.root.expand();
						}
						dropEvent.target.attributes.children = null;
						dropEvent.target.reload();
						dropEvent.target.expand();
						dropEvent.dropNode.remove(true);
					}, "Test case '" + dropEvent.dropNode.text + "' can't be added"
						);
				}
			} else {
				request('execution_suite_manager', {
					'do': 'move',
					'object_id': dropEvent.dropNode.attributes.suite_id,
					'parent_id': dropEvent.target.attributes.suite_id
				}, function() {
					if (exec2Tree) {
						exec2Tree.root.attributes.children = null;
						exec2Tree.root.reload();
						exec2Tree.root.expand();
					}
					dropEvent.target.attributes.children = null;
					dropEvent.target.reload();
					dropEvent.target.expand();
					dropEvent.dropNode.remove(true);
				}, "Execution suite '" + dropEvent.dropNode.text + "' can't be moved"
					);
			}
			dropEvent.cancel = true;
		});
		execTree.on('nodedragover', function(event) {
			event.cancel = ((event.target.getOwnerTree() != event.dropNode.getOwnerTree()) && !event.dropNode.isLeaf())
				|| (event.target == event.dropNode.parentNode);
		});
	}
}

function buildExecutionTree(params) {
	exec2Tree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	exec2Tree.getSelectionModel().on('selectionchange', onExecSelectionChange);
}

function getTree(url, root, tagId, draggable, pre) {
	tree = new Ext.tree.TreePanel({
		useArrows: false,
		autoScroll: true,
		animate: false,
		enableDD: draggable,
		containerScroll: true,
		border: false,
		root: new Ext.tree.AsyncTreeNode(root),
		loader: new Ext.tree.TreeLoader({
			url: url,
			preloadChildren: true,
			baseParams: {
				format: 'json'
			}
		})
	});
	tree.getRootNode().attributes.prefix = pre;
	tree.render(tagId);
	tree.root.expand();
	return tree;
}

function request(method, params, success, failureMsg, httpMethod) {
	params.format = 'json';
	if (!params.project_id) {
		params.project_id = jsProjectId;
	}
	var csrf = Ext.select("meta[name='csrf-token']").first();
	Ext.Ajax.defaultHeaders = Ext.apply(Ext.Ajax.defaultHeaders || {}, {
		'X-CSRF-Token': csrf.getAttribute('content')
	});
	conn = new Ext.data.Connection();
	conn.defaultHeaders = Ext.apply(conn.defaultHeaders || {}, {
		'X-CSRF-Token': csrf.getAttribute('content')
	});
	Element.show('ajax-indicator');
	conn.request({
		url: context + method,
		method: (htppMethod ? httpMethod : 'GET'),
		params: params,
		callback: function() {
			Element.hide('ajax-indicator');
		},
		success: success,
		failure: function() {
			Ext.Msg.alert('Failure', failureMsg);
		}
	});
}

function onCopyTo(b, e) {
	if (!currentNode.isLeaf()) {
		return;
	}
	parentNode = currentNode.parentNode;
	request('reassign_test_case', {
		'id': currentNode.attributes.issue_id,
		'suite': parentNode.attributes.suite_id,
		'project_id': b.id,
		'real_project_id': jsProjectId
	}, function() {
	}, "Test case '" + currentNode.text + "' can't be copied"
		);
}

function getEditorSuite() {
	editorSuite = new Ext.tree.TreeEditor(suiteTree);
	editorSuite.on('beforecomplete', function(editor, newValue, originalValue) {
		request('test_suite_manager', {
			'do': 'rename',
			"test_suite_id": editor.editNode.attributes.suite_id,
			"new_name": newValue
		}, function() {
			editor.editNode.parentNode.attributes.children = null;
			editor.editNode.parentNode.reload();
			editor.editNode.parentNode.expand();
		}, "Test suite '" + originalValue + "' can't be renamed"
			);
		editorSuite.cancelEdit(false);
	});
}

function getEditorExec() {
	editorExec = new Ext.tree.TreeEditor(execTree);
	editorExec.on('beforecomplete', function(editor, newValue, originalValue) {
		request('execution_suite_manager', {
			'do': 'rename',
			"exec_suite_id": editor.editNode.attributes.suite_id,
			"new_name": newValue
		}, function() {
			if (exec2Tree) {
				exec2Tree.root.attributes.children = null;
				exec2Tree.root.reload();
				exec2Tree.root.expand();
			}
			editor.editNode.parentNode.attributes.children = null;
			editor.editNode.parentNode.reload();
			editor.editNode.parentNode.expand();
		}, "Execution suite '" + originalValue + "' can't be renamed"
			);
		editorExec.cancelEdit(false);
	});
}

function findNext(node) {
	next = node.nextSibling;
	if (!next) {
		return node.parentNode ? findNext(node.parentNode) : null;
	} else if (next.isLeaf()) {
		return next;
	} else {
		next.expand();
		for (i = 0; i < next.childNodes.length; i++) {
			child = next.childNodes[i];
			if (child.isLeaf()) {
				return child;
			}
			child.expand();
			nextChild = findNested(child);
			if (nextChild) {
				return nextChild;
			}
		}
		return findNext(next);
	}
}

function findNested(node) {
	next = node;
	if (!next) {
		return node.parentNode ? findNext(node.parentNode) : null;
	} else if (next.isLeaf()) {
		return next;
	}
	else {
		next.expand();
		for (i = 0; i < next.childNodes.length; i++) {
			child = next.childNodes[i];
			if (child.isLeaf()) {
				return child;
			}
			child.expand();
			nextChild = findNext(child);
			if (nextChild) {
				return nextChild;
			}
		}
		return findNext(next);
	}
}

function execute() {
	node = exec2Tree.getSelectionModel().getSelectedNode();
	result = Ext.get('results');
	envs = Ext.get('environments');
	version = Ext.get('version');
	comment = Ext.get('exec-comment');
	conn = new Ext.data.Connection();
	request('execute', {
		"id": node.attributes.issue_id,
		"version": version.getValue(false),
		"result": result.getValue(false),
		"envs": envs.getValue(false),
		"comment": comment.getValue(false)
	}, function(responseObject) {
		rs = Ext.decode(responseObject.responseText);
		Ext.get('all-results-d').setDisplayed(rs.length > 0 ? 'inline-table' : 'none');
		txt = getHistory(rs)
		Ext.get('all-results').update(txt);
		next = findNext(node);
		if (next) {
			next.select();
		}
		Ext.get('exec-comment').dom.value = "";
	}, "Execution failed",
		'POST'
		);
}

function onExecSelectionChange(model, node) {
	edit = Ext.get('test-case-edit');
	edit.setVisible(false);
	r = Ext.get('all-results-d');
	r.setDisplayed('none');
	if (node.isLeaf()) {
		request('get_test_case', {
			"object_id": node.attributes.issue_id
		}, function(responseObject) {
			Ext.get('exec_descr_id').setDisplayed(Ext.decode(responseObject.responseText).desc ? 'block' : 'none');
			desc = Ext.get('test-case-desc');
			subj = Ext.get('test-case-subj');
			subj.update(Ext.decode(responseObject.responseText).text)
			desc.update(Ext.decode(responseObject.responseText).desc);
			edit.setVisible(true);
			results = Ext.get('results');
			results.set({
				value: 'Passed'
			}, false);
			version = Ext.get('version');
			request('get_executions', {
				"id": node.attributes.issue_id,
				"version": version.getValue(false)
			}, function(responseObject) {
				rs = Ext.decode(responseObject.responseText);
				Ext.get('all-results-d').setDisplayed(rs.length > 0 ? 'inline-table' : 'none');
				if (rs.length > 0) {
					txt = getHistory(rs);
					Ext.get('all-results').update(txt);
				}
			}, "Execution failed"
				);
			request('get_attachment_urls', {
				"issue_id": node.attributes.issue_id
			}, function(responseObject) {
				rs = Ext.decode(responseObject.responseText);
				Ext.get('test-case-attach').setDisplayed(rs.length > 0 ? 'block' : 'none');
				if (rs.length > 0) {
					txt = "";
					for (i = 0; i < rs.length; i++) {
						txt += "<a href='" + rs[i].url + "' target='_blank'>" + "<img src=" + '"' + "/images/attachment.png" + '"' + "></img>" + rs[i].name + "</a><br/>";
					}
					Ext.get('test-case-attach').update(txt);
				}
			}, "Getting attachments failed"
				);
		}, "Information about test case '" + node.text + "' can't be obtained"
			);
	}
}

function getHistory(rs) {
	unique = {}
	txt = "<table class='redcase-row' width='100%'>"
	txt += "<tr style='font-weight: bold; background-color: #eeeeee'><td>date</td><td>result</td><td>comments</td><td>executor</td><td>environment</td><td>version</td></tr>";
	for (i = 0; i < rs.length; i++) {
		switch (rs[i].result) {
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
		notFirst = (unique[rs[i].environment + rs[i].version]);
		txt += "<tr" + (notFirst ? " style='background-color: " + color + "'" : " style='background-color: " + color + "; font-weight: bold'") + ">"
		txt += "<td>" + rs[i].created_on + "</td>";
		txt += "<td>" + rs[i].result + "</td>";
		txt += "<td>" + rs[i].comment + "</td>";
		txt += "<td>" + rs[i].executor + "</td>";
		txt += "<td>" + rs[i].environment + "</td>";
		txt += "<td>" + rs[i].version + "</td>";
		txt += "</tr>"
		if (!notFirst) {
			unique[rs[i].environment + rs[i].version] = 1;
		}
	}
	txt += "</table>";
	return txt;
}

function initSuiteContextMenu() {
	items = [{
			text: 'Add suite',
			handler: function(b, e) {
				Ext.Msg.prompt('Creating test suite', 'Please enter test suite name:', function(btn, text) {
					if (btn == 'ok') {
						request('test_suite_manager', {
							'do': 'create',
							'name': text,
							'parent_id': currentNode.attributes.suite_id
						}, function() {
							currentNode.attributes.children = null;
							currentNode.reload();
							currentNode.expand();
						}, "Test suite '" + text + "' can't be created"
							);
					}
				});
			}
		}, {
			text: 'Delete',
			handler: function() {
				if (currentNode.parentNode == null) {
					return;
				}
				parentNode = currentNode.parentNode;
				if (currentNode.isLeaf()) {
					request('test_case_to_obsolete', {
						'id': currentNode.attributes.issue_id
					}, function() {
						suiteTree.root.attributes.children = null;
						suiteTree.root.reload();
					}, "Test case '" + currentNode.text + "' can't be deleted",
						'POST'
						);
				} else {
					request('test_suite_manager', {
						'do': 'delete',
						'id': currentNode.attributes.suite_id
					}, function() {
						parentNode.attributes.children = null;
						parentNode.reload();
					}, "Test suite '" + currentNode.text + "' can't be deleted",
						'POST'
						);
				}
			}
		}, {
			text: 'View',
			handler: function() {
				if (currentNode.parentNode == null) {
					return;
				}
				parentNode = currentNode.parentNode;
				if (currentNode.isLeaf()) {
					window.open('issues/' + currentNode.attributes.issue_id, 'test')
				}
			}
		}
	];
	if (jsCopyToMenuItems.length > 0) {
		items.push({
			text: 'Copy to',
			menu: jsCopyToMenuItems
		});
	}
	contextMenu = new Ext.menu.Menu({
		items: items
	});
}

function updateExeTree() {
	choosen = Ext.get('list_id').getValue(false);
	nameEl = Ext.get('list_name');
	request('index', {
		'ex': choosen
	}, function(responseObject) {
		rs = Ext.decode(responseObject.responseText);
		rs['prefix'] = 'management_execution_suite_tree';
		execTree.setRootNode(new Ext.tree.AsyncTreeNode(rs));
		execTree.getLoader().load(execTree.getRootNode());
		execTree.getRootNode().expand();
		nameEl.dom.setAttribute("value", execTree.getRootNode().text);
	}, "Execution list cannot be reloaded"
		);
}

function updateExe2Tree() {
	choosen = Ext.get('list2_id').getValue(false);
	request('index', {
		'ex': choosen
	}, function(responseObject) {
		rs = Ext.decode(responseObject.responseText);
		rs['prefix'] = 'execution_test_cases_tree';
		exec2Tree.setRootNode(new Ext.tree.AsyncTreeNode(rs));
		exec2Tree.getLoader().load(exec2Tree.getRootNode());
		exec2Tree.getRootNode().expand();
		onExecSelectionChange(exec2Tree.getSelectionModel(), exec2Tree.getRootNode());
	}, "Execution list cannot be reloaded"
		);
}
