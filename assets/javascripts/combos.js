
var RedcaseCombos = function($) {

	var self = this;

	var rebind = function() {
		$('.report_combo').change(self.refresh);
		$('#report_results_table_id').on(
			'change',
			'#filter_id_',
			self.refreshFilter
		);
	};

	this.update = function() {
		var apiParams = $.extend(
			{},
			Redcase.api.combos.index(), {
				success: function(data, textStatus, request) {
					$('#combos_id').html(data);
					rebind();
					self.refresh();
				},
				errorMessage: 'An unknown error ocurred'
			}
		);
		Redcase.api.apiCall(apiParams);
	};

	this.refresh = function() {
		var apiParams = $.extend(
			{},
			Redcase.api.combos.index(), {
				params: {
					environment_id: $('#environment').val(),
					suite_id: $('#suite').val(),
					version_id: $('#versionx').val(),
					button: true
				},
				success: function(data, textStatus, request) {
					$('#download_button_id').html(data);
				},
				errorMessage : 'An unknown error ocurred'
			}
		);
		Redcase.api.apiCall(apiParams);
		Redcase.graph.update();
		apiParams = jQuery2.extend(
			{},
			Redcase.api.executionSuite.index(), {
				params: {
					environment_id: $('#environment').val(),
					suite_id: $('#suite').val(),
					version_id: $('#versionx').val(),
					get_results: true
				},
				success: function(data, textStatus, request) {
					$('#report_results_table_id').html(data);
				},
				errorMessage: "Couldn't load results"
			}
		);
		Redcase.api.apiCall(apiParams);
	};

	this.refreshFilter = function() {
		var filtered = $('#filter_id_ option:selected').text().trim();
		for (var i = 0; i < Redcase.result_names.length; i++) {
			var name = Redcase.result_names[i];
			$.each($('[name="' + name + '"]'), function(index, value) {
				$(value).css(
					'display', (
						(filtered == 'All results')
						|| (filtered == name)
						|| ((filtered == 'Not passed') && (name != 'Passed'))
					)
						? 'table-row'
						: 'none'
				);
			});
		}
	};

	(function() {
		rebind();
	})();

};

jQuery2(function($) {
	if (typeof(Redcase) === 'undefined') {
		Redcase = {};
	}
	if (Redcase.combos) {
		return;
	}
	Redcase.combos = new RedcaseCombos($);
});

