
var context = 'redcase/';

var apiMethods = {
	
	main: {
		method: 'index'
	},
	
	testSuite: {
		method: 'test_suite_manager',
		actions: {
			create: 'create',
			delete: 'delete',
			moveTestSuite: 'move',
			moveTestCase: 'move_test_case'
		}
	},
	
	executionSuite: {
		method: 'execution_suite_manager',
		actions: {
			create: 'create',
			delete: 'delete',
			moveTestSuite: 'move',
			moveTestCase: 'move_test_case'
		}
	}

};

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
				debug('Trying to add new execution suite');
				// TODO: Right now it's not handled if any error happened
				//       after clicking OK, so the dialog with keep showing
				//       which is not expected.
				jQuery('#redcase-dialog').dialog({
					title: 'Creating execution suite',
					modal: true,
					resizable: false,
					buttons: {
						'OK': function() {
							var name = jQuery('#redcase-dialog-value').val();
							debug('User confirmed execution suite creation');
							apiCall({
								method: apiMethods.executionSuite.method,
								params: {
									'do': apiMethods.executionSuite.actions.create,
									'name': name,
									'parent_id': xCurrentNode.attributes.suite_id
								},
								success: function() {
									if (exec2Tree) {
										exec2Tree.root.attributes.children = null;
										exec2Tree.root.reload();
										exec2Tree.root.expand();
									}
									xCurrentNode.attributes.children = null;
									xCurrentNode.reload();
									xCurrentNode.expand();
									jQuery('#redcase-dialog').dialog('close');
								},
								errorMessage: "Execution suite '" + name + "' can't be created"
							});
						}
					},
					open: function() {
						var dialog = jQuery(this);
						dialog.keydown(function(event) {
							debug('Key pressed: ' + event.keyCode);
							if (event.keyCode === 13) {
								event.preventDefault();
								jQuery('#redcase-dialog').parents().find('.ui-dialog-buttonpane button').first().trigger('click');
							}
						});
					}
				});
			}
		}, {
			text: 'Delete',
			handler: function() {
				debug('Trying to remove an execution suite');
				if (xCurrentNode.parentNode == null) {
					return;
				}
				parentNode = xCurrentNode.parentNode;
				if (xCurrentNode.isLeaf()) {
					debug('Current node is a leaf: ' + xCurrentNode.attributes.issue_id);
					apiCall({
						httpMethod: 'POST',
						// TODO: Fix this, most likely broken!
						method: 'delete_test_case_from_execution_suite',
						params: {
							'id': xCurrentNode.attributes.issue_id,
							'suite_id': parentNode.attributes.suite_id
						},
						success: function() {
							if (exec2Tree) {
								exec2Tree.root.attributes.children = null;
								exec2Tree.root.reload();
								exec2Tree.root.expand();
							}
							parentNode.attributes.children = null;
							parentNode.reload();
						},
						errorMessage: "Test case '" + xCurrentNode.text + "' can't be deleted"
					});
				}
				else {
					debug('Current node is NOT a leaf');
					debug('Current node is a leaf: ' + xCurrentNode.attributes.suite_id);
					apiCall({
						httpMethod: 'POST',
						method: apiMethods.executionSuite.method,
						params: {
							'do': apiMethods.executionSuite.actions.delete,
							'suite_id': xCurrentNode.attributes.suite_id
						},
						success: function() {
							if (exec2Tree) {
								exec2Tree.root.attributes.children = null;
								exec2Tree.root.reload();
								exec2Tree.root.expand();
							}
							parentNode.attributes.children = null;
							parentNode.reload();
						},
						errorMessage: "Execution suite '" + xCurrentNode.text + "' can't be deleted"
					});
				}
			}
		}]
});

Ext.dd.StatusProxy.prototype.animRepair = false;

Ext.QuickTips.init();

Ext.chart.Chart.CHART_URL = '/plugin_assets/redcase/javascripts/ext-3.1.1/resources/charts.swf';

Ext.override(Ext.tree.TreeNodeUI, {
	renderElements: function(n, a, targetNode, bulkRender) {
		log('Rendering elements of the hacked ExtJS tree');
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
	log('Building the test suite tree');
	suiteTree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	if (jsCanEdit) {
		log('User is allowed to edit this tree');
		initSuiteContextMenu();
		suiteTree.on('contextmenu', function(node) {
			debug('Context menu is opening');
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
			log('Before dropping a node');
			if (dropEvent.dropNode.isLeaf()) {
				log('Dropping node is a leaf');
				apiCall({
					method: apiMethods.testSuite.method,
					params: {
						'do': apiMethods.testSuite.actions.moveTestCase,
						'object_id': dropEvent.dropNode.attributes.issue_id,
						'parent_id': dropEvent.target.attributes.suite_id
					},
					success: function() {
						dropEvent.target.attributes.children = null;
						dropEvent.target.reload();
						dropEvent.target.expand();
						dropEvent.dropNode.remove(true);
					},
					errorMessage: "Test case '" + dropEvent.dropNode.text + "' can't be moved"
				});
			} else {
				log('Dropping node is NOT a leaf');
				apiCall({
					method: apiMethods.testSuite.method,
					params: {
						'do': apiMethods.testSuite.actions.moveTestSuite,
						'object_id': dropEvent.dropNode.attributes.suite_id,
						'parent_id': dropEvent.target.attributes.suite_id
					},
					success: function() {
						dropEvent.target.attributes.children = null;
						dropEvent.target.reload();
						dropEvent.target.expand();
						dropEvent.dropNode.remove(true);
					},
					errorMessage: "Test suite '" + dropEvent.dropNode.text + "' can't be moved"
				});
			}
			dropEvent.cancel = true;
		});
		suiteTree.on('nodedragover', function(event) {
			log('Dragging over a node');
			event.cancel = (event.target.getOwnerTree() != event.dropNode.getOwnerTree())
				|| (event.target == event.dropNode.parentNode);
		});
	}
}

function buildExecutionSuiteTree(params) {
	log('Building the execution suite tree');
	execTree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	if (jsCanEdit) {
		log('User is allowed to edit');
		execTree.on('contextmenu', function(node) {
			debug('Context menu is opening');
			xCurrentNode = node;
			node.select();
			if (node.isLeaf()) {
				debug('Node is a leaf');
				xContextMenu.items.get(0).setVisible(false);
			} else {
				debug('Node is NOT a leaf');
				xContextMenu.items.get(0).setVisible(true);
			}
			xContextMenu.items.get(1).setVisible(node.parentNode != null);
			xContextMenu.show(node.ui.getAnchor());
		});
		execTree.on('beforenodedrop', function(dropEvent) {
			log('Before dropping a node');
			if (dropEvent.dropNode.isLeaf()) {
				log('Node is a leaf');
				if (dropEvent.target.getOwnerTree() != dropEvent.dropNode.getOwnerTree()) {
					log('Source and target tree are different');
					if (dropEvent.dropNode.attributes.status.issue_status.name != "In Progress") {
						dropEvent.cancel = true;
						return;
					}
					apiCall({
						method: 'copy_test_case_to_exec',
						params: {
							'object_id': dropEvent.dropNode.attributes.issue_id,
							'parent_id': dropEvent.target.attributes.suite_id
						},
						success: function() {
							if (exec2Tree) {
								exec2Tree.root.attributes.children = null;
								exec2Tree.root.reload();
								exec2Tree.root.expand();
							}
							dropEvent.target.attributes.children = null;
							dropEvent.target.reload();
							dropEvent.target.expand();
						},
						errorMessage: "Test case '" + dropEvent.dropNode.text + "' can't be added"
					});
				} else {
					log('Node is NOT a leaf');
					apiCall({
						method: apiMethods.executionSuite.method,
						params: {
							'do': apiMethods.executionSuite.actions.moveTestCase,
							'object_id': dropEvent.dropNode.attributes.issue_id,
							'owner_id': dropEvent.dropNode.parentNode.attributes.suite_id,
							'parent_id': dropEvent.target.id
						},
						success: function() {
							if (exec2Tree) {
								exec2Tree.root.attributes.children = null;
								exec2Tree.root.reload();
								exec2Tree.root.expand();
							}
							dropEvent.target.attributes.children = null;
							dropEvent.target.reload();
							dropEvent.target.expand();
							dropEvent.dropNode.remove(true);
						},
						errorMessage: "Test case '" + dropEvent.dropNode.text + "' can't be added"
					});
				}
			} else {
				log('Node is NOT a leaf');
				apiCall({
					method: apiMethods.executionSuite.method,
					params: {
						'do': apiMethods.executionSuite.actions.moveTestSuite,
						'object_id': dropEvent.dropNode.attributes.suite_id,
						'parent_id': dropEvent.target.attributes.suite_id
					},
					success: function() {
						if (exec2Tree) {
							exec2Tree.root.attributes.children = null;
							exec2Tree.root.reload();
							exec2Tree.root.expand();
						}
						dropEvent.target.attributes.children = null;
						dropEvent.target.reload();
						dropEvent.target.expand();
						dropEvent.dropNode.remove(true);
					},
					errorMessage: "Execution suite '" + dropEvent.dropNode.text + "' can't be moved"
				});
			}
			dropEvent.cancel = true;
		});
		execTree.on('nodedragover', function(event) {
			log('Dragging over a node');
			event.cancel = ((event.target.getOwnerTree() != event.dropNode.getOwnerTree()) && !event.dropNode.isLeaf())
				|| (event.target == event.dropNode.parentNode);
		});
	}
}

function buildExecutionTree(params) {
	log('Building the execution tree');
	exec2Tree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	exec2Tree.getSelectionModel().on('selectionchange', onExecSelectionChange);
}

function getTree(url, root, tagId, draggable, pre) {
	log('Building a tree');
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

function apiCall(parameters) {
	var url = context + parameters.method
	log('API call: ' + url);
	var params = parameters.params;
	params.format = 'json';
	if (!params.project_id) {
		params.project_id = jsProjectId;
	}
	Element.show('ajax-indicator');
	jQuery.ajax(url, {
		type: (parameters.htppMethod ? parameters.httpMethod : 'GET'),
		data: params,
		success: function (data, textStatus, jqXHR) {
			debug('Success');
			try {
				parameters.success(data, textStatus, jqXHR);
			} catch (error) {
				debug(error.message);
			}
			debug('Done');
		},
		error: function(){
			Ext.Msg.alert('Failure', parameters.errorMessage);
		},
		complete: function() {
			debug('Complete');
			Element.hide('ajax-indicator');
			debug('Done');
		}
	});
}

function onCopyTo(b, e) {
	log('Copying a node');
	if (!currentNode.isLeaf()) {
		return;
	}
	parentNode = currentNode.parentNode;
	apiCall({
		method: 'reassign_test_case',
		params: {
			'id': currentNode.attributes.issue_id,
			'suite': parentNode.attributes.suite_id,
			'project_id': b.id,
			'real_project_id': jsProjectId
		},
		errorMessage: "Test case '" + currentNode.text + "' can't be copied"
	});
}

function findNext(node) {
	log('Finding the next node');
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
	log('Finding the nested node');
	next = node;
	if (!next) {
		return node.parentNode
			? findNext(node.parentNode)
			: null;
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
			nextChild = findNext(child);
			if (nextChild) {
				return nextChild;
			}
		}
		return findNext(next);
	}
}

function execute() {
	log('Executing a test case');
	node = exec2Tree.getSelectionModel().getSelectedNode();
	result = Ext.get('results');
	envs = Ext.get('environments');
	version = Ext.get('version');
	comment = Ext.get('exec-comment');
	conn = new Ext.data.Connection();
	apiCall({
		httpMethod: 'POST',
		method: 'execute',
		params: {
			"issue_id": node.attributes.issue_id,
			"version": version.getValue(false),
			"result": result.getValue(false),
			"envs": envs.getValue(false),
			"comment": comment.getValue(false)
		},
		success: function(responseObject) {
			rs = Ext.decode(responseObject.responseText);
			Ext.get('all-results-d').setDisplayed(rs.length > 0 ? 'inline-table' : 'none');
			txt = getHistory(rs)
			Ext.get('all-results').update(txt);
			next = findNext(node);
			if (next) {
				next.select();
			}
			Ext.get('exec-comment').dom.value = "";
		},
		errorMessage: "Execution failed"
	});
}

function onExecSelectionChange(model, node) {
	log('Execution tree selection changed');
	edit = Ext.get('test-case-edit');
	edit.setVisible(false);
	r = Ext.get('all-results-d');
	r.setDisplayed('none');
	if (node.isLeaf()) {
		log('Node is a leaf');
		apiCall({
			method: 'get_test_case',
			params: {
				"object_id": node.attributes.issue_id
			},
			success: function(responseObject) {
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
				apiCall({
					method: 'get_executions',
					params: {
						"issue_id": node.attributes.issue_id,
						"version": version.getValue(false)
					},
					success: function(responseObject) {
						rs = Ext.decode(responseObject.responseText);
						Ext.get('all-results-d').setDisplayed(rs.length > 0 ? 'inline-table' : 'none');
						if (rs.length > 0) {
							txt = getHistory(rs);
							Ext.get('all-results').update(txt);
						}
					},
					errorMessage: "Execution failed"
				});
				apiCall({
					method: 'get_attachment_urls',
					params: {
						"issue_id": node.attributes.issue_id
					},
					success: function(responseObject) {
						rs = Ext.decode(responseObject.responseText);
						Ext.get('test-case-attach').setDisplayed(rs.length > 0 ? 'block' : 'none');
						if (rs.length > 0) {
							txt = "";
							for (i = 0; i < rs.length; i++) {
								txt += "<a href='" + rs[i].url + "' target='_blank'>" + "<img src=" + '"' + "/images/attachment.png" + '"' + "></img>" + rs[i].name + "</a><br/>";
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

function getHistory(rs) {
	log('Showing test case history');
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
	log('Test suite contect menu initialization');
	items = [{
			text: 'Add suite',
			handler: function(b, e) {
				debug('Adding a new test suite');
				// TODO: Right now it's not handled if any error happened
				//       after clicking OK, so the dialog with keep showing
				//       which is not expected.
				jQuery('#redcase-dialog').dialog({
					title: 'Creating test suite',
					modal: true,
					resizable: false,
					buttons: {
						'OK': function() {
							var name = jQuery('#redcase-dialog-value').val();
							debug('User confirmed test suite creation');
							apiCall({
								method: apiMethods.testSuite.method,
								params: {
									'do': apiMethods.testSuite.actions.create,
									'name': name,
									'parent_id': currentNode.attributes.suite_id
								},
								success: function() {
									currentNode.attributes.children = null;
									currentNode.reload();
									currentNode.expand();
									jQuery('#redcase-dialog').dialog('close');
								},
								errorMessage: "Test suite '" + name + "' can't be created"
							});
						}
					},
					open: function() {
						var dialog = jQuery(this);
						dialog.keydown(function(event) {
							debug('Key pressed: ' + event.keyCode);
							if (event.keyCode === 13) {
								event.preventDefault();
								jQuery('#redcase-dialog').parents().find('.ui-dialog-buttonpane button').first().trigger('click');
							}
						});
					}
				});
			}
		}, {
			text: 'Delete',
			handler: function() {
				debug('Deleting a test suite');
				if (currentNode.parentNode == null) {
					return;
				}
				parentNode = currentNode.parentNode;
				if (currentNode.isLeaf()) {
					debug('Node is a leaf');
					apiCall({
						httpMethod: 'POST',
						// TODO: Fix it, most likely broken!
						method: 'test_case_to_obsolete',
						params: {
							'issue_id': currentNode.attributes.issue_id
						},
						success: function() {
							suiteTree.root.attributes.children = null;
							suiteTree.root.reload();
						},
						errorMessage: "Test case '" + currentNode.text + "' can't be deleted"
					});
				} else {
					debug('Node is NOT a leaf');
					apiCall({
						httpMethod: 'POST',
						method: apiMethods.testSuite.method,
						params: {
							'do': apiMethods.testSuite.actions.delete,
							'test_suite_id': currentNode.attributes.suite_id
						},
						success: function() {
							parentNode.attributes.children = null;
							parentNode.reload();
						},
						errorMessage: "Test suite '" + currentNode.text + "' can't be deleted"
					});
				}
			}
		}, {
			text: 'View',
			handler: function() {
				debug('Showing a test case as a Redmine issue');
				if (currentNode.parentNode == null) {
					return;
				}
				parentNode = currentNode.parentNode;
				if (currentNode.isLeaf()) {
					window.open('/issues/' + currentNode.attributes.issue_id, 'test')
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
	log('Updating the execution tree');
	choosen = Ext.get('list_id').getValue(false);
	nameEl = Ext.get('list_name');
	apiCall({
		// TODO: Wrong, there should be a call to ExecutionSuite
		//       entity/controller.
		method: apiMethods.main.method,
		params: {
			'ex': choosen
		},
		success: function(responseObject) {
			rs = Ext.decode(responseObject.responseText);
			rs['prefix'] = 'management_execution_suite_tree';
			execTree.setRootNode(new Ext.tree.AsyncTreeNode(rs));
			execTree.getLoader().load(execTree.getRootNode());
			execTree.getRootNode().expand();
			nameEl.dom.setAttribute("value", execTree.getRootNode().text);
		},
		errorMessage: "Execution list cannot be reloaded"
	});
}

function updateExe2Tree() {
	log('Updating the execution tree on Execution tab');
	choosen = Ext.get('list2_id').getValue(false);
	apiCall({
		// TODO: Wrong, there should be a call to ExecutionSuite
		//       entity/controller.
		method: apiMethods.main.method,
		params: {
			'ex': choosen
		},
		success: function(responseObject) {
			rs = Ext.decode(responseObject.responseText);
			rs['prefix'] = 'execution_test_cases_tree';
			exec2Tree.setRootNode(new Ext.tree.AsyncTreeNode(rs));
			exec2Tree.getLoader().load(exec2Tree.getRootNode());
			exec2Tree.getRootNode().expand();
			onExecSelectionChange(exec2Tree.getSelectionModel(), exec2Tree.getRootNode());
		},
		errorMessage: "Execution list cannot be reloaded"
	});
}

function log(parameters) {
	var level = parameters.level || 'INFO';
	while (level.length < 5) {
		level += ' ';
	}
	while (level.length > 5) {
		level = level.substring(0, level.length - 1);
	}
	var trace = function(message) {
		return (level.indexOf('INFO') === 0)
			? console.log(message)
			: console.trace(message);
	};
	trace('[redcase] ' + level + ' > ' + (parameters.message || parameters));
}

function debug(parameters) {
	if (!parameters.message) {
		parameters = {
			message: parameters
		};
	}
	parameters.level = 'DEBUG';
	log(parameters);
}