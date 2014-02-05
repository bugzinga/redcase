
var log = LogFactory.getLog('redcase');

var jsProjectId;
var jsCanEdit;
var jsCopyToMenuItems = [];

var suiteTree;
var execTree;

var currentNode;
var xCurrentNode;

var contextMenu;

var xContextMenu = new Ext.menu.Menu({
	items: [{
			text: 'Add suite',
			handler: function(b, e) {
				log.debug('Trying to add new execution suite');
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
							log.debug('User confirmed execution suite creation');
							Redcase.apiCall({
								method: Redcase.methods.executionSuite.method,
								params: {
									'do': Redcase.methods.executionSuite.actions.create,
									'name': name,
									'parent_id': xCurrentNode.attributes.suite_id
								},
								success: function() {
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
							log.debug('Key pressed: ' + event.keyCode);
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
				log.debug('Trying to remove an execution suite');
				if (xCurrentNode.parentNode == null) {
					return;
				}
				parentNode = xCurrentNode.parentNode;
				if (xCurrentNode.isLeaf()) {
					log.debug('Current node is a leaf: ' + xCurrentNode.attributes.issue_id);
					Redcase.apiCall({
						httpMethod: 'POST',
						method: Redcase.methods.legacy.executionSuite.deleteTestCase,
						params: {
							'issue_id': xCurrentNode.attributes.issue_id,
							'suite_id': parentNode.attributes.suite_id
						},
						success: function() {
							parentNode.attributes.children = null;
							parentNode.reload();
						},
						errorMessage: "Test case '" + xCurrentNode.text + "' can't be deleted"
					});
				}
				else {
					log.debug('Current node is NOT a leaf');
					Redcase.apiCall({
						httpMethod: 'POST',
						method: Redcase.methods.executionSuite.method,
						params: {
							'do': Redcase.methods.executionSuite.actions.delete,
							'suite_id': xCurrentNode.attributes.suite_id
						},
						success: function() {
							parentNode.attributes.children = null;
							parentNode.reload();
						},
						errorMessage: "Execution suite '" + xCurrentNode.text + "' can't be deleted"
					});
				}
			}
		}, {
			text: 'Rename',
			handler: function(b, e) {
				log.debug('Trying to rename an execution suite');
				// TODO: Right now it's not handled if any error happened
				//       after clicking OK, so the dialog with keep showing
				//       which is not expected.
				if (xCurrentNode.parentNode == null) {
					return;
				}
				parentNode = xCurrentNode.parentNode;
				jQuery('#redcase-dialog').dialog({
					title: 'Renaming execution suite',
					modal: true,
					resizable: false,
					buttons: {
						'OK': function() {
							var name = jQuery('#redcase-dialog-value').val();
							log.debug('User confirmed execution suite name change');
							Redcase.apiCall({
								method: Redcase.methods.executionSuite.method,
								params: {
									'do': Redcase.methods.executionSuite.actions.rename,
									'new_name': name,
									'exec_suite_id': xCurrentNode.attributes.suite_id
								},
								success: function() {
									try {
										parentNode.attributes.children = null;
										parentNode.reload();
										parentNode.expand();
									} catch (error) {
										log.debug(error.message);
									}
									jQuery('#redcase-dialog').dialog('close');
								},
								errorMessage: "Execution suite '" + name + "' can't be created"
							});
						}
					},
					open: function() {
						var dialog = jQuery(this);
						dialog.keydown(function(event) {
							if (event.keyCode === 13) {
								log.debug('Key pressed: ' + event.keyCode);
								event.preventDefault();
								jQuery('#redcase-dialog').parents().find('.ui-dialog-buttonpane button').first().trigger('click');
							}
						});
					}
				});
			}
		}]
});

Ext.dd.StatusProxy.prototype.animRepair = false;

Ext.QuickTips.init();

Ext.chart.Chart.CHART_URL = '/plugin_assets/redcase/javascripts/ext-3.1.1/resources/charts.swf';

Ext.override(Ext.tree.TreeNodeUI, {
	renderElements: function(n, a, targetNode, bulkRender) {
		log.info('Rendering elements of the hacked ExtJS tree');
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
	log.info('Building the test suite tree');
	suiteTree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	if (jsCanEdit) {
		log.info('User is allowed to edit this tree');
		initSuiteContextMenu();
		suiteTree.on('contextmenu', function(node) {
			log.debug('Context menu is opening');
			currentNode = node;
			node.select();
			contextMenu.items.get(0).setVisible(!node.isLeaf());
			isNotDeletable = (node.parentNode == null)
				|| ((node.parentNode.parentNode == null) && (node.text == ".Unsorted" || node.text == ".Obsolete"));
			contextMenu.items.get(1).setVisible(!isNotDeletable);
			contextMenu.items.get(2).setVisible(node.isLeaf());
			contextMenu.items.get(3).setVisible(!isNotDeletable && !node.isLeaf());
			if (contextMenu.items.getCount() == 5) {
				contextMenu.items.get(4).setVisible(node.isLeaf());
			}
			contextMenu.show(node.ui.getAnchor());
		});
		suiteTree.on('beforenodedrop', function(dropEvent) {
			log.info('Before dropping a node');
			if (dropEvent.dropNode.isLeaf()) {
				log.info('Dropping node is a leaf');
				Redcase.apiCall({
					method: Redcase.methods.testSuite.method,
					params: {
						'do': Redcase.methods.testSuite.actions.moveTestCase,
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
				log.info('Dropping node is NOT a leaf');
				Redcase.apiCall({
					method: Redcase.methods.testSuite.method,
					params: {
						'do': Redcase.methods.testSuite.actions.moveTestSuite,
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
			log.info('Dragging over a node');
			event.cancel = (event.target.getOwnerTree() != event.dropNode.getOwnerTree())
				|| (event.target == event.dropNode.parentNode);
		});
	}
}

function buildExecutionSuiteTree(params) {
	log.info('Building the execution suite tree');
	execTree = getTree(params.url, params.root, params.tagId, params.draggable, params.pre);
	if (jsCanEdit) {
		log.info('User is allowed to edit');
		execTree.on('contextmenu', function(node) {
			log.debug('Context menu is opening');
			xCurrentNode = node;
			node.select();
			if (node.isLeaf()) {
				log.debug('Node is a leaf');
				xContextMenu.items.get(0).setVisible(false);
				xContextMenu.items.get(2).setVisible(false);
			} else {
				log.debug('Node is NOT a leaf');
				xContextMenu.items.get(0).setVisible(true);
			}
			xContextMenu.items.get(1).setVisible(node.parentNode != null);
			xContextMenu.show(node.ui.getAnchor());
		});
		execTree.on('beforenodedrop', function(dropEvent) {
			log.info('Before dropping a node');
			if (dropEvent.dropNode.isLeaf()) {
				log.info('Node is a leaf');
				if (dropEvent.target.getOwnerTree() != dropEvent.dropNode.getOwnerTree()) {
					log.info('Source and target tree are different');
					if (dropEvent.dropNode.attributes.status.issue_status.name != "In Progress") {
						dropEvent.cancel = true;
						return;
					}
					Redcase.apiCall({
						method: 'copy_test_case_to_exec',
						params: {
							'object_id': dropEvent.dropNode.attributes.issue_id,
							'parent_id': dropEvent.target.attributes.suite_id
						},
						success: function() {
							dropEvent.target.attributes.children = null;
							dropEvent.target.reload();
							dropEvent.target.expand();
						},
						errorMessage: "Test case '" + dropEvent.dropNode.text + "' can't be added"
					});
				} else {
					log.info('Node is NOT a leaf');
					Redcase.apiCall({
						method: Redcase.methods.executionSuite.method,
						params: {
							'do': Redcase.methods.executionSuite.actions.moveTestCase,
							'object_id': dropEvent.dropNode.attributes.issue_id,
							'owner_id': dropEvent.dropNode.parentNode.attributes.suite_id,
							'parent_id': dropEvent.target.id
						},
						success: function() {
							dropEvent.target.attributes.children = null;
							dropEvent.target.reload();
							dropEvent.target.expand();
							dropEvent.dropNode.remove(true);
						},
						errorMessage: "Test case '" + dropEvent.dropNode.text + "' can't be added"
					});
				}
			} else {
				log.info('Node is NOT a leaf');
				Redcase.apiCall({
					method: Redcase.methods.executionSuite.method,
					params: {
						'do': Redcase.methods.executionSuite.actions.moveTestSuite,
						'object_id': dropEvent.dropNode.attributes.suite_id,
						'parent_id': dropEvent.target.attributes.suite_id
					},
					success: function() {
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
			log.info('Dragging over a node');
			event.cancel = ((event.target.getOwnerTree() != event.dropNode.getOwnerTree()) && !event.dropNode.isLeaf())
				|| (event.target == event.dropNode.parentNode);
		});
	}
}

function getTree(url, root, tagId, draggable, pre) {
	log.info('Building a tree');
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

function onCopyTo(b, e) {
	log.info('Copying a node');
	if (!currentNode.isLeaf()) {
		return;
	}
	parentNode = currentNode.parentNode;
	Redcase.apiCall({
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

function initSuiteContextMenu() {
	log.info('Test suite contect menu initialization');
	items = [{
			text: 'Add suite',
			handler: function(b, e) {
				log.debug('Adding a new test suite');
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
							log.debug('User confirmed test suite creation');
							Redcase.apiCall({
								method: Redcase.methods.testSuite.method,
								params: {
									'do': Redcase.methods.testSuite.actions.create,
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
							log.debug('Key pressed: ' + event.keyCode);
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
				log.debug('Deleting a test suite');
				if (currentNode.parentNode == null) {
					return;
				}
				parentNode = currentNode.parentNode;
				if (currentNode.isLeaf()) {
					log.debug('Node is a leaf');
					Redcase.apiCall({
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
					log.debug('Node is NOT a leaf');
					Redcase.apiCall({
						httpMethod: 'POST',
						method: Redcase.methods.testSuite.method,
						params: {
							'do': Redcase.methods.testSuite.actions.delete,
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
				log.debug('Showing a test case as a Redmine issue');
				if (currentNode.parentNode == null) {
					return;
				}
				parentNode = currentNode.parentNode;
				if (currentNode.isLeaf()) {
					window.open('/issues/' + currentNode.attributes.issue_id, 'test')
				}
			}
		}, {
			text: 'Rename',
			handler: function(b, e) {
				log.debug('Trying to rename a test suite');
				// TODO: Right now it's not handled if any error happened
				//       after clicking OK, so the dialog with keep showing
				//       which is not expected.
				if (currentNode.parentNode == null) {
					return;
				}
				parentNode = currentNode.parentNode;
				jQuery('#redcase-dialog').dialog({
					title: 'Renaming test suite',
					modal: true,
					resizable: false,
					buttons: {
						'OK': function() {
							var name = jQuery('#redcase-dialog-value').val();
							log.debug('User confirmed test suite name change');
							Redcase.apiCall({
								method: Redcase.methods.testSuite.method,
								params: {
									'do': Redcase.methods.testSuite.actions.rename,
									'new_name': name,
									'test_suite_id': currentNode.attributes.suite_id
								},
								success: function() {
									try {
										parentNode.attributes.children = null;
										parentNode.reload();
										parentNode.expand();
									} catch (error) {
										log.debug(error.message);
									}
									jQuery('#redcase-dialog').dialog('close');
								},
								errorMessage: "Test suite '" + name + "' can't be created"
							});
						}
					},
					open: function() {
						var dialog = jQuery(this);
						dialog.keydown(function(event) {
							if (event.keyCode === 13) {
								log.debug('Key pressed: ' + event.keyCode);
								event.preventDefault();
								jQuery('#redcase-dialog').parents().find('.ui-dialog-buttonpane button').first().trigger('click');
							}
						});
					}
				});
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
