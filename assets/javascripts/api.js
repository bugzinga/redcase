var Redcase = {
	'context' : 'redcase/',	
	'jsCopyToMenuItems' : [],
	'methods' : {
		'redcase' : {
			'controller': '',
			'actions' : {
				'getAttachmentURLs' : {'getCall': function() {return {
						method : Redcase.methods.redcase.controller + '/get_attachment_urls',
						httpMethod: 'GET'
				}}}
			}
		},
		'testSuite' : {
			'controller' : 'testsuites',
			'actions' : {
				'index' : {'getCall': function() {return {
						method : Redcase.methods.testSuite.controller,
						httpMethod: 'GET'
				}}},				
				'destroy' : {'getCall': function(id) {return {
						method : Redcase.methods.testSuite.controller + '/' + id,
						httpMethod: 'DELETE'
				}}},				
				'update' : {'getCall': function(id) {return {
						method : Redcase.methods.testSuite.controller + '/' + id,
						httpMethod: 'PUT'
				}}},
				'create' : {'getCall': function() {return {
						method : Redcase.methods.testSuite.controller,
						httpMethod: 'POST'
				}}}				
			}
		},
		'executionSuite' : {
			'controller' : 'executionsuites',			
			'actions' : {
				'create' : {'getCall': function() {return {
					method : Redcase.methods.executionSuite.controller,
					httpMethod: 'POST'
				}}},
				'update' : {'getCall': function(id) {return {
					method : Redcase.methods.executionSuite.controller + '/' + id,
					httpMethod: 'PUT'
				}}},
				'destroy' : {'getCall': function(id) {return {
					method : Redcase.methods.executionSuite.controller + '/' + id,
					httpMethod: 'DELETE'
				}}},
				'show' : {'getCall': function(id) {return {
					method : Redcase.methods.executionSuite.controller + '/' + id,
					httpMethod: 'GET'
				}}},
				'index' : {'getCall': function() {return {
					method : Redcase.methods.executionSuite.controller,
					httpMethod: 'GET'
				}}}				
			}
		},
		'executionJournal' : {
			'controller' : 'executionjournals',			
			'actions' : {
				'index' : {'getCall': function() {return {
					method : Redcase.methods.executionJournal.controller,
					httpMethod: 'GET'
				}}},
			}
		},
		'environments' : {
			'controller' : 'environments',			
			'actions' : {
				'index' : {'getCall': function() {return {
					method : Redcase.methods.environments.controller,
					httpMethod: 'GET'
				}}},				
				'update' : {'getCall': function(id) {return {
					method : Redcase.methods.environments.controller + '/' + id,
					httpMethod: 'PUT'
				}}},
				'create' : {'getCall': function() {return {
					method : Redcase.methods.environments.controller,
					httpMethod: 'POST'
				}}},
				'destroy' : {'getCall': function(id) {return {
					method : Redcase.methods.environments.controller + '/' + id,
					httpMethod: 'DELETE'
				}}}				
			}
		},		
		'testCase' : {
			'controller' : 'testcases',
			'actions' : {
				'index' : {
					'getCall': function() {return {
						method : Redcase.methods.testCase.controller,
						httpMethod: 'GET'
					}}
				},
				'update' : {
					'getCall': function(id) {return {
						method : Redcase.methods.testCase.controller + '/' + id,
						httpMethod: 'PUT',
					}}
				},
				'copy' : {
					'getCall': function(id) {return {
						method : Redcase.methods.testCase.controller + '/' + id + '/copy',
						httpMethod: 'POST',
					}}
				}
			}
		},		
		'combos' : {
			'controller' : 'combos',
			'actions' : {
				'index' : {
					'getCall': function() {return {
						method : Redcase.methods.combos.controller,
						httpMethod: 'GET'
					}}
				}
			}
		},		
		'graph' : {
			'controller' : 'graph',
			'actions' : {
				'show' : {
					'getCall': function(id) {return {
						method : Redcase.methods.graph.controller + '/' + id,
						httpMethod: 'GET'
					}}
				}
			}
		}		
	},
	'apiCall' : function (parameters) {
		var
		url = this.context + parameters.method,
		params = {},
		token = jQuery2("meta[name='csrf-token']").attr('content');
		jQuery2.extend(params, parameters.params, {'authenticity_token' : token});

		log.info('API call: ' + url);

		//params.format = 'json';
		//if (!params.project_id) {
		//	params.project_id = jsProjectId;
		//}
		jQuery2('#ajax-indicator').fadeIn(100);
		jQuery2.ajax(url, {
			type : (parameters.httpMethod ? parameters.httpMethod : 'GET'),
			data : params,
			success : function (data, textStatus, jqXHR) {
				if (parameters.success !== undefined) {
					parameters.success(data, textStatus, jqXHR);
				}
			},
			error : function (jqXHR, textStatus, errorThrown) {
				if (parameters.error !== undefined) {
					parameters.error(errorThrown, textStatus, jqXHR);
				}
				Redcase.errorBox(parameters.errorMessage);
				log.debug(errorThrown);
			},
			complete : function () {
				if (parameters.complete !== undefined) {
					parameters.complete();
				}
				jQuery2('#ajax-indicator').fadeOut(100);
			}
		});
	},
	'errorBox' : function (errorMessage) {
		jQuery('#redcase-error-message').text(errorMessage);
		jQuery('#redcase-error').dialog({
			'modal' : true,
			'buttons' : {
				"OK" : function () {
					$(this).dialog("close");
				}
			}
		})
	},	
    'full' : function() {
		console.log('running full update!')
		Redcase.ExecutionSuiteTree.updateList2();
        //Redcase.updateReport();
		Redcase.Combos.update();
    }	
};
