Redcase.TestSuiteTree = {};

Redcase.TestSuiteTree.initialize = function() {
	Redcase.TestSuiteTree.prepareContextItems();
	Redcase.TestSuiteTree.build();	
}

Redcase.TestSuiteTree.CheckCallback = function (operation, node, node_parent, node_position, more) {
	// operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
	var IsOK = true;
	if (operation === "copy_node") {
		if (more.ref !== undefined) {
			IsOK = this.get_node(node.parent) != node_parent;
		}
	}
	return IsOK;
}

Redcase.TestSuiteTree.IsDraggable = function (nodes) {
	var i;
	//Make sure the user can't drag the root node, "default" nodes, the "unsorted" node, and disabled nodes
	for (i = 0; i < nodes.length; i++) {
		if ((nodes[i].parents.length < 2) || (nodes[i].type === 'default') || (nodes[i].text === '.Unsorted') || (nodes[i].state.disabled === true)) {
			return false;
		}
	}
	return true;
}

Redcase.TestSuiteTree.MoveTestCase = function (new_node, org_node, new_instance, old_instance) {
	var apiParms = {};
	new_node.original = org_node.original;
	jQuery2.extend(apiParms, Redcase.methods.testCase.actions.update(org_node.original.issue_id), {
		params : {
			'parent_id' : new_instance.get_node(new_node.parent).original.suite_id
		},
		success : function () {
			old_instance.delete_node(org_node);
		},
		error : function () {
			new_instance.delete_node(new_node);
		},
		errorMessage : "Test case '" + org_node.text + "' can't be moved"
	});
	Redcase.apiCall(apiParms);
}

Redcase.TestSuiteTree.MoveTestSuite = function (new_node, org_node, new_instance, old_instance) {
	new_node.original = org_node.original;
	var apiParms = {};
	jQuery2.extend(apiParms, Redcase.methods.testSuite.actions.update(org_node.original.suite_id), {
		params : {
			'parent_id' : new_instance.get_node(new_node.parent).original.suite_id
		},
		success : function () {
			old_instance.delete_node(org_node);
		},
		error : function () {
			new_instance.delete_node(new_node);
		},
		errorMessage : "Test suite '" + org_node.text + "' can't be moved"
	})
	Redcase.apiCall(apiParms);
}

Redcase.TestSuiteTree.OnCopy = function (event, object) {
	/*
	is_foreign
	is_multi
	new_instance
	nodeold_instance
	old_parent (ID)
	old_position (index)
	original (node)
	parent (id)
	position (index (altid 0?))
	 */
	//Internal drag + drop
	if (object.old_instance === object.new_instance) {
		switch (object.original.type) {
		case 'case': {
				Redcase.TestSuiteTree.MoveTestCase(object.node, object.original, object.new_instance, object.old_instance);
				break;
			}
		case 'suite': {
				Redcase.TestSuiteTree.MoveTestSuite(object.node, object.original, object.new_instance, object.old_instance);
				break;
			}
		}
	}
}

Redcase.TestSuiteTree.getSelectionType = function (tree) {
	var
	selectionType = -1,
	i,
	selection = tree.get_selected(true);

	for (i = 0; i < selection.length; i++) {
		if (selectionType !== 2) {
			if (selection[i].type === 'case') {
				if (selectionType === 1) {
					selectionType = 2;
				} else {
					selectionType = 0;
				}
			} else if (selection[i].type === 'suite') {
				if (selectionType === 0) {
					selectionType = 2;
				} else {
					selectionType = 1;
				}
			}
		}
		if (selection[i].parents.length === 1 || selection[i].text === '.Obsolete' || selection[i].text === '.Unsorted') {
			selectionType = selection.length === 1 ? 3 : 4;
			break;
		}
	}
	return selectionType;
}

Redcase.TestSuiteTree.contextCopyTo = function(params) {
	var
	node = Redcase.TestSuiteTree.tree.get_node(params.reference),
	apiParms = {};

	jQuery2.extend(apiParms, Redcase.methods.testCase.actions.copy(node.original.issue_id), {
		params : {'dest_project' : params.item.id},
		errorMessage : "Can't copy '" + node.text + "'"
	});
	Redcase.apiCall(apiParms);
}

Redcase.TestSuiteTree.prepareContextItems = function () {
	var tmpObj = {},
	copyItems = {};

	for (i = 0; i < Redcase.jsCopyToMenuItems.length; i++) {
		tmpObj['keyfor_' + Redcase.jsCopyToMenuItems[i].id] = {
			'label' : Redcase.jsCopyToMenuItems[i].text,
			'id': Redcase.jsCopyToMenuItems[i].id,
			'action' : Redcase.TestSuiteTree.contextCopyTo
		};
		jQuery2.extend(copyItems, tmpObj);
	}

	Redcase.TestSuiteTree.caseItems = {
		viewCase : {
			'label' : 'View',
			'action' : Redcase.TestSuiteTree.viewCase
		},
		copyCase : {
			'label' : 'Copy to',
			submenu : copyItems
		}
	}

	Redcase.TestSuiteTree.specialSuiteItems = {
		addSuite : {
			'label' : 'Add suite',
			'action' : Redcase.TestSuiteTree.addSuite
		}
	}

	Redcase.TestSuiteTree.suiteItems = {
		renameSuite : {
			'label' : 'Rename',
			'action' : Redcase.TestSuiteTree.renameSuite
		}
	}

	Redcase.TestSuiteTree.commonItems = {
		deleteItem : {
			'label' : 'Delete',
			'action' : Redcase.TestSuiteTree.deleteItem
		}
	}
}

Redcase.TestSuiteTree.deleteCase = function (node) {	
	var apiParms = {};
	jQuery2.extend(apiParms, Redcase.methods.testCase.actions.update(node.original.issue_id), {
		params : {
			'obsolesce' : true
		},
		success : function () {
			org = {};
			jQuery2.extend(org, node.original);
			Redcase.TestSuiteTree.tree.delete_node(node);
			var NewID = Redcase.TestSuiteTree.tree.create_node(Redcase.TestSuiteTree.tree.get_node('.Obsolete'), org);		
			console.log('NewID = ' + NewID);
		},
		errorMessage : "Test case '" + node.text + "' can't be deleted"
	});
	Redcase.apiCall(apiParms);
}

Redcase.TestSuiteTree.deleteSuite = function (node) {
	if ((node.parents.length > 1) && (node.text !== '.Unsorted') && (node.text !== '.Obsolete')) {
		
		var apiParms = {};
		jQuery2.extend(apiParms, Redcase.methods.testSuite.actions.destroy(node.original.suite_id),{
			success : function () {
				Redcase.TestSuiteTree.tree.delete_node(node);
			},
			errorMessage : "Execution suite '" + node.text + "' can't be deleted"
		})
		
		Redcase.apiCall(apiParms);
	} else {
		//Error, can't delete root node.
		console.log('Tried to delete suite: ' + node.text);
	}
}

Redcase.TestSuiteTree.deleteItem = function (params) {
	var
	selected,
	i;

	selected = Redcase.TestSuiteTree.tree.get_selected(true);
	for (i = 0; i < selected.length; i++) {
		if (selected[i].type === 'case') {
			Redcase.TestSuiteTree.deleteCase(selected[i]);
		} else {
			Redcase.TestSuiteTree.deleteSuite(selected[i]);
		}
	}
}

Redcase.TestSuiteTree.addSuite = function (params) {
	var
	node = Redcase.TestSuiteTree.tree.get_node(params.reference);

	jQuery('#redcase-dialog').dialog({
		title : 'New test suite name',
		modal : true,
		resizable : false,
		buttons : {
			'OK' : function () {
				var 
					name = jQuery('#redcase-dialog-value').val(),
					apiParms = {};
				jQuery2.extend(apiParms, Redcase.methods.testSuite.actions.create(), {
					params : {
						'name' : name,
						'parent_id' : node.original.suite_id
					},
					success : function (newNode) {
						Redcase.TestSuiteTree.tree.create_node(node, newNode);
					},
					errorMessage : "Test suite '" + name + "' can't be created",
					complete : function () {
						jQuery('#redcase-dialog').dialog('close');
					}
				});
				Redcase.apiCall(apiParms);
			}
		}
	});
}

Redcase.TestSuiteTree.renameSuite = function (params) {
	var
	node = Redcase.TestSuiteTree.tree.get_node(params.reference);

	jQuery('#redcase-dialog').dialog({
		title : 'Rename test suite',
		modal : true,
		resizable : false,
		buttons : {
			'OK' : function () {
				var 
					name = jQuery('#redcase-dialog-value').val(),
					apiParms = {};
				jQuery2.extend(apiParms, Redcase.methods.testSuite.actions.update(node.original.suite_id), {
					params : {'new_name' : name},
					success : function () {
						Redcase.TestSuiteTree.tree.set_text(node, name);
					},
					errorMessage : "Can't rename '" + node.text + "'",
					complete : function () {
						jQuery('#redcase-dialog').dialog('close');
					}
				});
				Redcase.apiCall(apiParms);
			}
		},
		open : function () {
			var dialog = jQuery(this);
			dialog.keydown(function (event) {
				if (event.keyCode === 13) {
					log.debug('Key pressed: ' + event.keyCode);
					event.preventDefault();
					jQuery('#redcase-dialog').parents().find('.ui-dialog-buttonpane button').first().trigger('click');
				}
			});
		}
	});
}

Redcase.TestSuiteTree.viewCase = function (params) {
	var
	node = Redcase.TestSuiteTree.tree.get_node(params.reference);

	window.open('../../issues/' + node.original.issue_id, 'test');
}

Redcase.TestSuiteTree.getItems = function (node) {
	var
	items = {},
	selectionType;

	selectionType = Redcase.TestSuiteTree.getSelectionType(Redcase.TestSuiteTree.tree);

	if (selectionType < 3) {
		items = jQuery2.extend(items, Redcase.TestSuiteTree.commonItems);
	}

	//Testcase
	if (selectionType === 0) {
		jQuery2.extend(items, Redcase.TestSuiteTree.caseItems);
	}

	//Testsuite
	if (selectionType === 1) {
		jQuery2.extend(items, Redcase.TestSuiteTree.suiteItems);
	}

	//Testsuite or Special
	if (selectionType === 1 || selectionType === 3) {
		jQuery2.extend(items, Redcase.TestSuiteTree.specialSuiteItems);
	}

	return items;
}

Redcase.TestSuiteTree.build = function (params) {
	//Open the root
	/*
	params.root.state = {
		opened : true
	};
	*/

	Redcase.TestSuiteTree.tree = jQuery2('#management_test_suite_tree_id').jstree({
			// Core config
			'core' : {
				'check_callback' : Redcase.TestSuiteTree.CheckCallback,
				//'data' : [params.root]
				'data' : {
					'type' : 'GET',
					'url' : Redcase.context + Redcase.methods.testSuite.controller
				}
			},

			// Drag + Drop config
			'drag_selection' : true, //bug workaround, should only be in "dnd" settings when JSTree is fixed
			'dnd' : {
				'always_copy' : true,
				'drag_selection' : true,
				'is_draggable' : Redcase.TestSuiteTree.IsDraggable
			},

			// Types config
			'types' : {
				'#' : {
					'valid_children' : ['root']
				},
				'root' : {
					'valid_children' : ['suite', 'case']
				},
				'suite' : {
					'valid_children' : ['suite', 'case']
				},
				'default' : {
					'valid_children' : []
				},
				'case' : {
					'valid_children' : []
				}
			},

			// Contextmenu config
			'contextmenu' : {
				'items' : Redcase.TestSuiteTree.getItems
			},

			'plugins' : ['dnd', 'types', 'contextmenu']
		});

	// Bind tree events
	Redcase.TestSuiteTree.tree.on('copy_node.jstree', Redcase.TestSuiteTree.OnCopy);
	Redcase.TestSuiteTree.tree = jQuery2.jstree.reference(Redcase.TestSuiteTree.tree);
}
