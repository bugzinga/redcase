
var RedcaseExecutionSuiteTree = function($) {

	var tree;

	var caseItems;

	var specialSuiteItems;

	var suiteItems;

	var commonItems;

	this.updateList2 = function() {
		var apiParms = $.extend(
			{},
			Redcase.api.methods.executionSuite.actions.index(), {
				success: function(data, textStatus, request) {
					$('#execution_settings_id').html(data);
					Redcase.executionTree.refresh();
				},
				errorMessage : "Couldn't load execution list"
			}
		);
		Redcase.api.apiCall(apiParms);
	};

	var saveExecSuiteClick = function(event) {
		renameSuite(
			$('#list_id').val(),
			$('#list_name').val(),
			function(data, textStatus, request) {
				$('#list_id option:selected').text($('#list_name').val());
			},
			function() {
				tree.refresh();
				Redcase.full();
			}
		);
		event.preventDefault();
	};

	var createExecSuiteClick = function(event) {
		addSuite(
			undefined,
			$('#list_name').val(),
			function(data, textStatus, request) {
				$('#list_id').append(
					$('<option>', {
						value: data.suite_id
					}).text($('#list_name').val())
				);
				$('#list_id').val(data.suite_id);
			},
			function() {
				tree.refresh();
				Redcase.full();
			}
		);
		event.preventDefault();
	};

	var destroyExecSuiteClick = function(event) {
		deleteSuite(
			$('#list_id').val(),
			$('#list_id option:selected').text(),
			function(data, textStatus, request) {
				$("#list_id option:selected").remove();
				$('#list_name').val(
					$("#list_id option:selected").text()
				);
				tree.refresh();
				Redcase.full();
			}
		);
		event.preventDefault();
	};

	var checkCallback = function(
		operation,
		node,
		nodeParent,
		nodePosition,
		more
	) {
		// Operation can be 'create_node', 'rename_node',
		// 'delete_node', 'move_node' or 'copy_node'.
		var isOK = true;
		if ((operation === "copy_node") && (more.ref !== undefined)) {
			var sameNode = this.get_node(node);
			isOK = (this.get_node(node.parent) != nodeParent)
				&& (!sameNode || (sameNode === node))
				&& (node.original.type == 'case');
			if (!isOK && sameNode) {
				this.select_node(sameNode);
			}
		}
		return isOK;
	};

	var isDraggable = function(nodes) {
		// Make sure the user can't drag the root node
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].parents.length < 2) {
				return false;
			}
		}
		return true;
	};

	var prepareContextItems = function() {
		caseItems = {};
		specialSuiteItems = {
			addSuite: {
				label: 'Add suite',
				action: addSuiteDialog
			}
		};
		suiteItems = {
			renameSuite: {
				label: 'Rename suite',
				action: renameSuiteDialog
			}
		};
		commonItems = {
			deleteItem: {
				label: 'Delete',
				action: deleteItem
			}
		};
	};

	var refresh = function() {
		$('#list_name').val(
			$('#list_id').children(':selected').text()
		);
		tree.refresh();
	};

	var addSuite = function(
		parentId,
		name,
		successCallback,
		completeCallback
	) {
		var apiParms = $.extend(
			{},
			Redcase.api.methods.executionSuite.actions.create(), {
				params: {
					name: name,
					parent_id: parentId
				},
				success: successCallback,
				errorMessage: (
					"Execution suite '"
					+ name
					+ "' can't be created"
				),
				complete: completeCallback
			}
		);
		Redcase.api.apiCall(apiParms);
	};

	var addSuiteDialog = function(params) {
		var node = tree.get_node(params.reference);
		$('#redcase-dialog').dialog({
			title: 'Creating execution suite',
			modal: true,
			resizable: false,
			buttons: {
				OK: function() {
					var name = $('#redcase-dialog-value').val();
					addSuite(
						node.original.suite_id,
						name,
						function(newNode) {
							tree.create_node(
								node,
								newNode
							);
							Redcase.full();
						},
						function() {
							$('#redcase-dialog').dialog('close');
						}
					);
				}
			}
		});
	};

	var deleteSuite = function(
		suiteId,
		name,
		successCallback
	) {
		var apiParms = $.extend(
			{},
			Redcase.api.methods.executionSuite.actions.destroy(suiteId), {
				success: successCallback,
				errorMessage: (
					"Execution suite '"
					+ name
					+ "' can't be deleted"
				)
			}
		);
		Redcase.api.apiCall(apiParms);
	};

	var deleteSuiteNode = function(node) {
		if (node.parents.length > 1) {
			deleteSuite(
				node.original.suite_id,
				node.text,
				function() {
					tree.delete_node(node);
					Redcase.full();
				}
			);
		} else {
			// Error, can't delete root node.
			console.log('Tried to delete suite: ' + node.text);
		}
	};

	var deleteCase = function (node) {
		var apiParms = $.extend(
			{},
			Redcase.api.methods.testCase.actions.update(
				node.original.issue_id
			), {
				params: {
					remove_from_exec_id: tree
						.get_node(node.parent)
						.original
						.suite_id
				},
				success: function() {
					tree.delete_node(node);
					Redcase.full();
				},
				errorMessage: (
					"Test case '"
					+ node.text
					+ "' can't be deleted"
				)
			}
		);
		Redcase.api.apiCall(apiParms);
	};

	var deleteItem = function(params) {
		var selected = tree.get_selected(true);
		for (var i = 0; i < selected.length; i++) {
			if (selected[i].type === 'case') {
				deleteCase(selected[i]);
			} else {
				deleteSuiteNode(selected[i]);
			}
		}
	};

	var renameSuite = function(
		suiteId,
		name,
		successCallback,
		completeCallback
	) {
		var apiParms = $.extend(
			{},
			Redcase.api.methods.executionSuite.actions.update(suiteId), {
				params: {
					new_name: name
				},
				success: successCallback,
				errorMessage: (
					"Execution suite '"
					+ name
					+ "' can't be renamed"
				),
				complete: completeCallback
			}
		);
		Redcase.api.apiCall(apiParms);
	};

	var renameSuiteDialog = function(params) {
		var node = tree.get_node(params.reference);
		$('#redcase-dialog').dialog({
			title: 'Renaming execution suite',
			modal: true,
			resizable: false,
			buttons: {
				OK: function() {
					var name = $('#redcase-dialog-value').val();
					renameSuite(
						node.original.suite_id,
						name,
						function() {
							tree.set_text(node, name);
							Redcase.full();
						},
						function() {
							$('#redcase-dialog').dialog('close')
						}
					);
				}
			}
		});
	};

	var getItems = function() {
		var items = {};
		var selectionType = Redcase.testSuiteTree.getSelectionType(tree);
		if (selectionType < 3) {
			items = $.extend(items, commonItems);
		}
		// Testcase
		if (selectionType === 0) {
			$.extend(items, caseItems);
		}
		// Testsuite
		if (selectionType === 1) {
			$.extend(items, suiteItems);
		}
		// Testsuite or Special
		if ((selectionType === 1) || (selectionType === 3)) {
			$.extend(items, specialSuiteItems);
		}
		return items;
	};

	var moveTestCase = function(
		newNode,
		orgNode,
		newInstance,
		oldInstance
	) {
		newNode.original = orgNode.original;
		var apiParms = $.extend(
			{},
			Redcase.api.methods.testCase.actions.update(
				orgNode.original.issue_id
			), {
				params: {
					source_exec_id: oldInstance
						.get_node(orgNode.parent)
						.original
						.suite_id,
					dest_exec_id: newInstance
						.get_node(newNode.parent)
						.original
						.suite_id
				},
				success: function() {
					oldInstance.delete_node(orgNode);
					Redcase.full();
				},
				error: function() {
					newInstance.delete_node(newNode);
				},
				errorMessage: (
					"Test case '"
					+ orgNode.text
					+ "' can't be moved"
				)
			}
		);
		Redcase.api.apiCall(apiParms);
	};

	var moveTestSuite = function(
		newNode,
		orgNode,
		newInstance,
		oldInstance
	) {
		newNode.original = orgNode.original;
		var apiParms = $.extend(
			{},
			Redcase.api.methods.executionSuite.actions.update(
				orgNode.original.suite_id
			), {
				params: {
					parent_id: newInstance
						.get_node(new_node.parent)
						.original
						.suite_id
				},
				success: function() {
					oldInstance.delete_node(orgNode);
					Redcase.full();
				},
				error: function() {
					newInstance.delete_node(newNode);
				},
				errorMessage: (
					"Test suite '"
					+ orgNode.text
					+ "' can't be moved"
				)
			}
		);
		Redcase.api.apiCall(apiParms);
	};

	var copyTestCase = function(
		newNode,
		orgNode,
		newInstance,
		oldInstance
	) {
		if (orgNode.original.status.name === 'In Progress') {
			newNode.original = orgNode.original;
			newInstance.set_id(newNode, orgNode.id);
			var apiParms = $.extend(
				{},
				Redcase.api.methods.testCase.actions.update(
					orgNode.original.issue_id
				), {
					params: {
						dest_exec_id: newInstance
							.get_node(newNode.parent)
							.original
							.suite_id
					},
					success: function(data) {
						if (data.success === true) {
							Redcase.full();
						} else {
							newInstance.delete_node(newNode);
							Redcase.errorBox(
								"Test case '"
								+ orgNode.text
								+ "' can't be added"
							);
						}
					},
					error: function() {
						newInstance.delete_node(newNode);
					},
					errorMessage: (
						"Test case '" + orgNode.text + "' can't be added"
					)
				}
			);
			Redcase.api.apiCall(apiParms);
		} else {
			newInstance.delete_node(newNode);
		}
	};

	var onCopy = function(event, object) {
		// Fields: is_foreign, is_multi, new_instance, node, old_instance,
		//         old_parent (ID), old_position (index), original (node),
		//         parent (id), position (index (altid 0?))
		// Internal drag + drop
		if (object.old_instance === object.new_instance) {
			switch (object.original.type) {
				case 'case':
					moveTestCase(
						object.node,
						object.original,
						object.new_instance,
						object.old_instance
					);
					break;
				case 'suite':
					moveTestSuite(
						object.node,
						object.original,
						object.new_instance,
						object.old_instance
					);
					break;
			}
		} else {
			if (object.original.type === 'case') {
				copyTestCase(
					object.node,
					object.original,
					object.new_instance,
					object.old_instance
				);
			} else {
				object.new_instance.delete_node(object.node);
			}
		}
	};

	var build = function(params) {
		tree = $('#management_execution_suite_tree_id').jstree({
			core: {
				check_callback: checkCallback,
				data: {
					type: 'GET',
					url: function() {
						return (
							Redcase.api.context
							+ Redcase.api.methods.executionSuite.actions.show(
								$('#list_id').val()
							).method
						);
					}
				}
			},
			// Bug workaround, should only be in "dnd" settings when
			// JSTree is fixed.
			drag_selection: true,
			dnd: {
				always_copy: true,
				drag_selection: true,
				is_draggable: isDraggable
			},
			types: {
				'#': {
					valid_children: ['root']
				},
				root: {
					valid_children: ['suite', 'case']
				},
				suite: {
					valid_children: ['suite', 'case']
				},
				'default': {
					valid_childrein: []
				},
				'case': {
					valid_children: []
				}
			},
			contextmenu: {
				items: getItems
			},
			plugins: ['dnd', 'types', 'contextmenu']
		});
		tree.on('copy_node.jstree', onCopy);
		tree = $.jstree.reference(tree);
	};

	(function() {
		prepareContextItems();
		build();
		$('#btn_save_exec_suite').on('click', saveExecSuiteClick);
		$('#btn_create_exec_suite').on('click', createExecSuiteClick);
		$('#btn_destroy_exec_suite').on('click', destroyExecSuiteClick);
		$('#list_id').on('change', refresh);
	})();

};

jQuery2(function($) {
	if (typeof(Redcase) === 'undefined') {
		Redcase = {};
	}
	if (Redcase.executionSuiteTree) {
		return;
	}
	Redcase.executionSuiteTree = new RedcaseExecutionSuiteTree($);
});

