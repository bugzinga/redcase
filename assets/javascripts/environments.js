
var RedcaseEnvironments = function($) {

	var bind = function() {
		$('#btn_save_environment').on('click', onButtonSaveClicked);
		$('#btn_create_environment').on('click', onButtonCreateClicked);
		$('#btn_destroy_environment').on('click', onButtonDestroyClicked);
		$('#execution_environment_id').on('change', onComboChanged);
	};

	var onComboChanged = function() {
		var environmentId = $('#execution_environment_id').val();
		var apiParams = $.extend(
			{},
			Redcase.api.methods.environments.actions.index(), {
				params: {
					execution_environment_id: environmentId
				},
				success: function(data, textStatus, request) {
					$('#management_environments_id').html(data);
					bind();
				},
				errorMessage: (
					"Environment '"
					+ $('#execution_environment_id option:selected').text()
					+ "' can't be loaded"
				),
				complete: function() {
					Redcase.full();
				}
			}
		);
		Redcase.api.apiCall(apiParams);
	};

	var onButtonDestroyClicked = function(event) {
		var environment_id = $('#execution_environment_id').val();
		var apiParams = $.extend(
			{},
			Redcase.api.methods.environments.actions.destroy(environment_id), {
				success: function(data, textStatus, request) {
					$('#execution_environment_id option:selected').remove();
					$('#execution_environment_id').change();
				},
				errorMessage: (
					"Environment '"
					+ $('#execution_environment_id option:selected').text()
					+ "' can't be deleted"
				),
				complete: function() {
					Redcase.full();
				}
			}
		);
		Redcase.api.apiCall(apiParams);
		event.preventDefault();
	};

	var onButtonCreateClicked = function(event) {
		var name = $('#execution_environment_name').val();
		var description = $('#execution_environment_description').val();
		var apiParams = $.extend(
			{},
			Redcase.api.methods.environments.actions.create(), {
				params: {
					execution_environment: {
						name: name,
						description: description
					}
				},
				success: function(data, textStatus, request) {
					$('#execution_environment_id').append(
						$('<option>', { value : data.id }).text(name)
					);
					$('#execution_environment_id').val(data.id);
				},
				errorMessage: ("Environment '" + name + "' can't be created"),
				complete: function() {
					Redcase.full();
				}
			}
		);
		Redcase.api.apiCall(apiParams);
		event.preventDefault();
	};

	var onButtonSaveClicked = function(event) {
		var environmentId = $('#execution_environment_id').val();
		var name = $('#execution_environment_name').val();
		var description = $('#execution_environment_description').val()
		var apiParams = $.extend(
			{},
			Redcase.api.methods.environments.actions.update(environmentId), {
				params: {
					execution_environment: {
						name: name,
						description: description
					}
				},
				success: function(data, textStatus, request) {
					$('#execution_environment_id option:selected').text(name);
				},
				errorMessage: ("Environment '" + name + "' can't be renamed"),
				complete: function() {
					Redcase.full();
				}
			}
		);
		Redcase.api.apiCall(apiParams);
		event.preventDefault();
	};

	(function() {
		bind();
	})();

}

jQuery2(function($) {
	if (typeof(Redcase) === 'undefined') {
		Redcase = {};
	}
	if (Redcase.environments) {
		return;
	}
	Redcase.environments = new RedcaseEnvironments($);
});

