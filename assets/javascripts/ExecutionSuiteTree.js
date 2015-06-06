jQuery2(function() {
	Redcase.ExecutionSuiteTree.prepareContextItems();
	Redcase.ExecutionSuiteTree.build();
	jQuery2('#btn_save_exec_suite').on('click', Redcase.ExecutionSuiteTree.saveExecSuiteClick);
	jQuery2('#btn_create_exec_suite').on('click', Redcase.ExecutionSuiteTree.createExecSuiteClick);
	jQuery2('#btn_destroy_exec_suite').on('click', Redcase.ExecutionSuiteTree.destroyExecSuiteClick);
	jQuery2('#list_id').on('change', Redcase.ExecutionSuiteTree.refresh);
});

Redcase.ExecutionSuiteTree = {};

Redcase.ExecutionSuiteTree.updateList2 = function() {
	var
	apiParms = {};	
	jQuery2.extend(apiParms, Redcase.methods.executionSuite.actions.index(), {
		success : function(data, textStatus, request) {
			jQuery2('#execution_settings_id').html(data);
			if (Redcase.ExecutionTree.tree) {
				Redcase.ExecutionTree.tree.refresh();
			}
		},
		errorMessage : "Couldn't load execution list"
	});
	Redcase.apiCall(apiParms);		
}

Redcase.ExecutionSuiteTree.saveExecSuiteClick = function(event) {
	Redcase.ExecutionSuiteTree.renameSuite(
		jQuery2('#list_id').val(),
		jQuery2('#list_name').val(),
		function (data, textStatus, request) {
			jQuery2('#list_id option:selected').text(jQuery2('#list_name').val());
		},
		function () {
			Redcase.ExecutionSuiteTree.tree.refresh();
			Redcase.full();
		}
	);		
	event.preventDefault();
}

Redcase.ExecutionSuiteTree.createExecSuiteClick = function(event) {
	Redcase.ExecutionSuiteTree.addSuite(
		undefined,
		jQuery2('#list_name').val(),
		function (data, textStatus, request) {			
			jQuery2('#list_id').append(jQuery2('<option>', { value : data.suite_id }).text(jQuery2('#list_name').val()));			
			jQuery2('#list_id').val(data.suite_id);
		},
		function () {
			Redcase.ExecutionSuiteTree.tree.refresh();
			Redcase.full();
		}
	);		
	event.preventDefault();
}

Redcase.ExecutionSuiteTree.destroyExecSuiteClick = function(event) {
	Redcase.ExecutionSuiteTree.deleteSuite(		
		jQuery2('#list_id').val(),
		jQuery2('#list_id option:selected').text(),
		function (data, textStatus, request) {	
			jQuery2("#list_id option:selected").remove();
			jQuery2('#list_name').val(jQuery2("#list_id option:selected").text());
			Redcase.ExecutionSuiteTree.tree.refresh();
			Redcase.full();			
		}
	);		
	event.preventDefault();
}

Redcase.ExecutionSuiteTree.CheckCallback = 
	function (operation, node, node_parent, node_position, more) {
	// operation can be 'create_node', 'rename_node', 
	// 'delete_node', 'move_node' or 'copy_node'
	var IsOK = true;
	if (operation === "copy_node" && more.ref !== undefined) {
		var sameNode = this.get_node(node);
		IsOK = (this.get_node(node.parent) != node_parent) && 
			(!sameNode || sameNode === node);
		if (!IsOK && sameNode) {
			this.select_node(sameNode);
		}
	}
	return IsOK;
}

Redcase.ExecutionSuiteTree.IsDraggable = function (nodes) {
	var i;
	//Make sure the user can't drag the root node
	for (i = 0; i < nodes.length; i++) {
		if (nodes[i].parents.length < 2) {
			return false;
		}
	}
	return true;
}

Redcase.ExecutionSuiteTree.prepareContextItems = function () {
	Redcase.ExecutionSuiteTree.caseItems = {}

	Redcase.ExecutionSuiteTree.specialSuiteItems = {
		addSuite : {
			'label' : 'Add suite',
			'action' : Redcase.ExecutionSuiteTree.addSuiteDialog
		}
	}

	Redcase.ExecutionSuiteTree.suiteItems = {
		renameSuite : {
			'label' : 'Rename suite',
			'action' : Redcase.ExecutionSuiteTree.renameSuiteDialog
		}
	}

	Redcase.ExecutionSuiteTree.commonItems = {
		deleteItem : {
			'label' : 'Delete',
			'action' : Redcase.ExecutionSuiteTree.deleteItem
		}
	}
}

Redcase.ExecutionSuiteTree.refresh = function() {
	jQuery2('#list_name').val(jQuery2('#list_id').children(':selected').text());
	Redcase.ExecutionSuiteTree.tree.refresh();	
}

Redcase.ExecutionSuiteTree.addSuite = function (parent_id, name, successCallback, completeCallback) {
	var
	apiParms = {};	
	jQuery2.extend(apiParms, Redcase.methods.executionSuite.actions.create(), {
		params : {
			'name' : name,
			'parent_id' : parent_id
		},
		success : successCallback,
		errorMessage : "Execution suite '" + name + "' can't be created",
		complete : completeCallback
	});
	Redcase.apiCall(apiParms);
}

Redcase.ExecutionSuiteTree.addSuiteDialog = function (params) {
	var
	node = Redcase.ExecutionSuiteTree.tree.get_node(params.reference);

	jQuery('#redcase-dialog').dialog({
		title : 'Creating execution suite',
		modal : true,
		resizable : false,
		buttons : {			
			'OK' : function() {
				var 
				name = jQuery2('#redcase-dialog-value').val();
				Redcase.ExecutionSuiteTree.addSuite(
					node.original.suite_id, 
					name, 
					function (newNode) {
						Redcase.ExecutionSuiteTree.tree.create_node(node, newNode);
						Redcase.full();
					},
					function () {
						jQuery('#redcase-dialog').dialog('close');
					}
				);				
			}
		}
	});
}

Redcase.ExecutionSuiteTree.deleteSuite = function (suite_id, name, successCallback) {
	var apiParms = {};	
	jQuery2.extend(apiParms, Redcase.methods.executionSuite.actions.destroy(suite_id), {
		success : successCallback,
		errorMessage : "Execution suite '" + name + "' can't be deleted"
	});
	Redcase.apiCall(apiParms);	
}

Redcase.ExecutionSuiteTree.deleteSuiteNode = function (node) {
	if (node.parents.length > 1) {
		Redcase.ExecutionSuiteTree.deleteSuite(node.original.suite_id, node.text, function () {
			Redcase.ExecutionSuiteTree.tree.delete_node(node);
			Redcase.full();
		});
	} else {
		//Error, can't delete root node.
		console.log('Tried to delete suite: ' + node.text);
	}
}

Redcase.ExecutionSuiteTree.deleteCase = function (node) {
	var apiParms = {};
	
	jQuery2.extend(apiParms, Redcase.methods.testCase.actions.update(node.original.issue_id), {
		params : {
			'remove_from_exec_id' : Redcase.ExecutionSuiteTree.tree.get_node(node.parent).original.suite_id
		},
		success : function () {
			Redcase.ExecutionSuiteTree.tree.delete_node(node);
			Redcase.full();
		},
		errorMessage : "Test case '" + node.text + "' can't be deleted"
	});
	Redcase.apiCall(apiParms);
}

Redcase.ExecutionSuiteTree.deleteItem = function (params) {
	var
	selected,
	i;

	selected = Redcase.ExecutionSuiteTree.tree.get_selected(true);
	for (i = 0; i < selected.length; i++) {
		if (selected[i].type === 'case') {
			Redcase.ExecutionSuiteTree.deleteCase(selected[i]);
		} else {
			Redcase.ExecutionSuiteTree.deleteSuiteNode(selected[i]);
		}
	}
}

Redcase.ExecutionSuiteTree.renameSuite = function (suite_id, name, successCallback, completeCallback) {
	var apiParms = {};				
	jQuery2.extend(apiParms, Redcase.methods.executionSuite.actions.update(suite_id), {
		params : {
			'new_name' : name
		},
		success : successCallback,
		errorMessage : "Execution suite '" + name + "' can't be renamed",
		complete : completeCallback
	});
	Redcase.apiCall(apiParms);
}

Redcase.ExecutionSuiteTree.renameSuiteDialog = function (params) {
	var
	node = Redcase.ExecutionSuiteTree.tree.get_node(params.reference);

	jQuery('#redcase-dialog').dialog({
		title : 'Renaming execution suite',
		modal : true,
		resizable : false,
		buttons : {
			'OK' : function() {
				var 
				name = jQuery('#redcase-dialog-value').val();
				Redcase.ExecutionSuiteTree.renameSuite(node.original.suite_id, name, function () {
					Redcase.ExecutionSuiteTree.tree.set_text(node, name);
					Redcase.full();
				}, function () {jQuery('#redcase-dialog').dialog('close')})
			}
		}
	});
}

Redcase.ExecutionSuiteTree.getItems = function () {
	var
	items = {},
	selectionType;

	selectionType = Redcase.TestSuiteTree.getSelectionType(Redcase.ExecutionSuiteTree.tree);

	if (selectionType < 3) {
		items = jQuery2.extend(items, Redcase.ExecutionSuiteTree.commonItems);
	}

	//Testcase
	if (selectionType === 0) {
		jQuery2.extend(items, Redcase.ExecutionSuiteTree.caseItems);
	}

	//Testsuite
	if (selectionType === 1) {
		jQuery2.extend(items, Redcase.ExecutionSuiteTree.suiteItems);
	}

	//Testsuite or Special
	if (selectionType === 1 || selectionType === 3) {
		jQuery2.extend(items, Redcase.ExecutionSuiteTree.specialSuiteItems);
	}

	return items;
}

Redcase.ExecutionSuiteTree.moveTestCase = function (new_node, org_node, new_instance, old_instance) {
	var apiParms = {};
	new_node.original = org_node.original;	
	jQuery2.extend(apiParms, Redcase.methods.testCase.actions.update(org_node.original.issue_id), {
		params : {
			'source_exec_id' : old_instance.get_node(org_node.parent).original.suite_id,
			'dest_exec_id' : new_instance.get_node(new_node.parent).original.suite_id
		},
		success : function () {
			old_instance.delete_node(org_node);
			Redcase.full();
		},
		error : function () {
			new_instance.delete_node(new_node);
		},
		errorMessage : "Test case '" + org_node.text + "' can't be moved"
	});	
	Redcase.apiCall(apiParms);
}

Redcase.ExecutionSuiteTree.moveTestSuite = function (new_node, org_node, new_instance, old_instance) {
	var apiParms = {};
	new_node.original = org_node.original;
	jQuery2.extend(apiParms, Redcase.methods.executionSuite.actions.update(org_node.original.suite_id), {
		params : {
			'parent_id' : new_instance.get_node(new_node.parent).original.suite_id
		},
		success : function () {
			old_instance.delete_node(org_node);
			Redcase.full();
		},
		error : function () {
			new_instance.delete_node(new_node);
		},
		errorMessage : "Test suite '" + org_node.text + "' can't be moved"
	});
	Redcase.apiCall(apiParms);
}

Redcase.ExecutionSuiteTree.copyTestCase = function (new_node, org_node, new_instance, old_instance) {
	var	apiParms = {};
	if (org_node.original.status.name === "In Progress") {
		new_node.original = org_node.original;
		new_instance.set_id(new_node, org_node.id);
		
		jQuery2.extend(apiParms, Redcase.methods.testCase.actions.update(org_node.original.issue_id), {
			params : {
				'dest_exec_id' : new_instance.get_node(new_node.parent).original.suite_id
			},
			success: function(data) {
				if (data.success === true) {
					Redcase.full();
				} else {
					new_instance.delete_node(new_node);
					Redcase.errorBox("Test case '" + org_node.text + "' can't be added");
				}
			},
			error : function () {
				new_instance.delete_node(new_node);
			},
			errorMessage : "Test case '" + org_node.text + "' can't be added"
		});		
		Redcase.apiCall(apiParms);
	} else {
		new_instance.delete_node(new_node);
	}
}

Redcase.ExecutionSuiteTree.OnCopy = function (event, object) {
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
				Redcase.ExecutionSuiteTree.moveTestCase(object.node, object.original, object.new_instance, object.old_instance);
				break;
			}
		case 'suite': {
				Redcase.ExecutionSuiteTree.moveTestSuite(object.node, object.original, object.new_instance, object.old_instance);
				break;
			}
		}
	} else {
		if (object.original.type === 'case') {
			Redcase.ExecutionSuiteTree.copyTestCase(object.node, object.original, object.new_instance, object.old_instance);
		} else {
			object.new_instance.delete_node(object.node);
		}
	}
}

Redcase.ExecutionSuiteTree.build = function (params) {
	Redcase.ExecutionSuiteTree.tree = jQuery2('#management_execution_suite_tree_id').jstree({
			// Core config
			'core' : {
				'check_callback' : Redcase.ExecutionSuiteTree.CheckCallback,
				//'data' : [params.root]
				'data' : {
					'type' : 'GET',
					'url' : function() {
						return Redcase.context + Redcase.methods.executionSuite.actions.show(jQuery2('#list_id').val()).method
					}
					/*
					'data' : function () {
						return {						
							'id' : jQuery2('#list_id').val()
						}
					}
					*/
				}
			},

			// Drag + Drop config
			'drag_selection' : true, //bug workaround, should only be in "dnd" settings when JSTree is fixed
			'dnd' : {
				'always_copy' : true,
				'drag_selection' : true,
				'is_draggable' : Redcase.ExecutionSuiteTree.IsDraggable
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
				'items' : Redcase.ExecutionSuiteTree.getItems
			},

			'plugins' : ['dnd', 'types', 'contextmenu']
		});

	// Bind tree events
	Redcase.ExecutionSuiteTree.tree.on('copy_node.jstree', Redcase.ExecutionSuiteTree.OnCopy);
	Redcase.ExecutionSuiteTree.tree = jQuery2.jstree.reference(Redcase.ExecutionSuiteTree.tree);
}
