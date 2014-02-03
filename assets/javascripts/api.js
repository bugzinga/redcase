
Redcase = {
	log: LogFactory.getLog('redcase-api]'),
	context: 'redcase/',
	methods: {
		main: {
			method: 'index'
		},
		testSuite: {
			method: 'test_suite_manager',
			actions: {
				create: 'create',
				delete: 'delete',
				rename: 'rename',
				moveTestSuite: 'move',
				moveTestCase: 'move_test_case'
			}
		},
		executionSuite: {
			method: 'execution_suite_manager',
			actions: {
				create: 'create',
				delete: 'delete',
				rename: 'rename',
				moveTestSuite: 'move',
				moveTestCase: 'move_test_case'
			}
		},
		legacy: {
			executionSuite: {
				deleteTestCase: 'delete_test_case_from_execution_suite'
			}
		}
	},
	apiCall: function(parameters) {
		var url = this.context + parameters.method;
		log.info('API call: ' + url);
		var params = parameters.params;
		params.format = 'json';
		if (!params.project_id) {
			params.project_id = jsProjectId;
		}
		jQuery('#ajax-indicator').fadeIn(100);
		jQuery.ajax(url, {
			type: (parameters.htppMethod ? parameters.httpMethod : 'GET'),
			data: params,
			success: function(data, textStatus, jqXHR) {
				try {
					parameters.success(data, textStatus, jqXHR);
				} catch (error) {
					log.debug(error.message);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// TODO: Remove ExtJS dependency from here.
				Ext.Msg.alert('Failure', parameters.errorMessage);
				log.debug(errorThrown);
			},
			complete: function() {
				jQuery('#ajax-indicator').fadeOut(100);
			}
		});
	}
};
