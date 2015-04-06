jQuery2(function() {
	Redcase.Combos.bindEvents();	
});

Redcase.Combos = {};

Redcase.Combos.bindEvents = function() {
	jQuery2('.report_combo').on('change', Redcase.Combos.changed);
}

Redcase.Combos.update = function() {
	var
	apiParms = {};	
	jQuery2.extend(apiParms, Redcase.methods.combos.actions.index.getCall(), {
		success : function(data, textStatus, request) {
			jQuery2('#combos_id').html(data);
			Redcase.Combos.bindEvents();
			jQuery2('#versionx').change();
		},
		errorMessage : "An unknown error ocurred"
	});
	Redcase.apiCall(apiParms);	
}

Redcase.Combos.changed = function() {
	var
	apiParms = {};	
	jQuery2.extend(apiParms, Redcase.methods.combos.actions.index.getCall(), {
		params : {
			'environment_id' : jQuery2('#environment').val(),
			'suite_id': jQuery2('#suite').val(),
			'version_id': jQuery2('#versionx').val(),
			'button': true
		},		
		success : function(data, textStatus, request) {
			jQuery2('#download_button_id').html(data);
		},
		errorMessage : "An unknown error ocurred"
	});
	Redcase.apiCall(apiParms);
	
	Redcase.Graph.update();
	
	apiParms = {};	
	jQuery2.extend(apiParms, Redcase.methods.executionSuite.actions.index.getCall(), {
		params : {
			'environment_id' : jQuery2('#environment').val(),
			'suite_id': jQuery2('#suite').val(),
			'version_id': jQuery2('#versionx').val(),
			'get_results': true
		},		
		success : function(data, textStatus, request) {
			jQuery2('#report_results_table_id').html(data);
		},
		errorMessage : "Couldn't load results"
	});
	Redcase.apiCall(apiParms);	
}  