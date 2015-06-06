
var Redcase = {

	log: LogManager.getLog('redcase'),

	context: 'redcase/',

	jsCopyToMenuItems: [],

	methods: {

		redcase: {
			controller: '',
			actions: {
				getAttachmentURLs: function() {
					return {
						method: Redcase.methods.redcase.controller + '/get_attachment_urls',
						httpMethod: 'GET'
					}
				}
			}
		},

		testSuite: {
			controller: 'testsuites',
			actions: {
				index: function() {
					return {
						method: Redcase.methods.testSuite.controller,
						httpMethod: 'GET'
					}
				},
				destroy: function(id) {
					return {
						method: (Redcase.methods.testSuite.controller + '/' + id),
						httpMethod: 'DELETE'
					}
				},
				update: function(id) {
					return {
						method: (Redcase.methods.testSuite.controller + '/' + id),
						httpMethod: 'PUT'
					}
				},
				create: function() {
					return {
						method: Redcase.methods.testSuite.controller,
						httpMethod: 'POST'
					}
				}
			}
		},

		executionSuite: {
			controller: 'executionsuites',
			actions: {
				create: function() {
					return {
						method: Redcase.methods.executionSuite.controller,
						httpMethod: 'POST'
					}
				},
				update: function(id) {
					return {
						method: (Redcase.methods.executionSuite.controller + '/' + id),
						httpMethod: 'PUT'
					}
				},
				destroy: function(id) {
					return {
						method: (Redcase.methods.executionSuite.controller + '/' + id),
						httpMethod: 'DELETE'
					}
				},
				show: function(id) {
					return {
						method: (Redcase.methods.executionSuite.controller + '/' + id),
						httpMethod: 'GET'
					}
				},
				index: function() {
					return {
						method: Redcase.methods.executionSuite.controller,
						httpMethod: 'GET'
					}
				}
			}
		},

		executionJournal: {
			controller: 'executionjournals',
			actions: {
				index: function() {
					return {
						method: Redcase.methods.executionJournal.controller,
						httpMethod: 'GET'
					}
				},
			}
		},

		environments: {
			controller: 'environments',
			actions: {
				index: function() {
					return {
						method: Redcase.methods.environments.controller,
						httpMethod: 'GET'
					}
				},
				update: function(id) {
					return {
						method: (Redcase.methods.environments.controller + '/' + id),
						httpMethod: 'PUT'
					}
				},
				create: function() {
					return {
						method: Redcase.methods.environments.controller,
						httpMethod: 'POST'
					}
				},
				destroy: function(id) {
					return {
						method: (Redcase.methods.environments.controller + '/' + id),
						httpMethod: 'DELETE'
					}
				}
			}
		},

		testCase: {
			controller: 'testcases',
			actions: {
				index: function() {
					return {
						method: Redcase.methods.testCase.controller,
						httpMethod: 'GET'
					}
				},
				update: function(id) {
					return {
						method: (Redcase.methods.testCase.controller + '/' + id),
						httpMethod: 'PUT',
					}
				},
				copy: function(id) {
					return {
						method: (Redcase.methods.testCase.controller + '/' + id + '/copy'),
						httpMethod: 'POST',
					}
				}
			}
		},

		combos: {
			controller: 'combos',
			actions: {
				index: function() {
					return {
						method: Redcase.methods.combos.controller,
						httpMethod: 'GET'
					}
				}
			}
		},

		graph: {
			controller: 'graph',
			actions: {
				show: function(id) {
					return {
						method: (Redcase.methods.graph.controller + '/' + id),
						httpMethod: 'GET'
					}
				}
			}
		}
	},

	apiCall: function(parameters) {
		var url = (this.context + parameters.method);
		var token = $("meta[name='csrf-token']").attr('content');
		var params = $.extend(
			{},
			parameters.params, {
				authenticity_token: token
			}
		);
		this.log.info('API call: ' + url);
		$('#ajax-indicator').fadeIn(100);
		$.ajax(url, {
			type: (parameters.httpMethod ? parameters.httpMethod : 'GET'),
			data: params,
			success: function(data, textStatus, jqXHR) {
				if (parameters.success) {
					parameters.success(data, textStatus, jqXHR);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				if (parameters.error) {
					parameters.error(errorThrown, textStatus, jqXHR);
				}
				Redcase.errorBox(parameters.errorMessage);
				this.log.debug(errorThrown);
			},
			complete: function() {
				if (parameters.complete) {
					parameters.complete();
				}
				$('#ajax-indicator').fadeOut(100);
			}
		});
	},

	errorBox: function(errorMessage) {
		$('#redcase-error-message').text(errorMessage);
		$('#redcase-error').dialog({
			modal: true,
			buttons: {
				OK: function() {
					$(this).dialog('close');
				}
			}
		})
	},

    full: function() {
		this.log.info('Running full update...')
		Redcase.ExecutionSuiteTree.updateList2();
		Redcase.Combos.update();
    }

};

