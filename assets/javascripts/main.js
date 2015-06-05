
var Form = {
	Element: {
		EventObserver: function(element, callback) {
			$('#' + element).change(function(event) {
				var target = event.target;
				callback(target, $(target).val());
			});
		}
	},
	serialize: function(element) {
		return $('#' + element).serialize();
	}
};

var Ajax = {
	Updater: function(elementToUpdate, url, config) {
		$.ajax(
			url, {
				type: (config.method || 'GET'),
				data: config.parameters,
				success: function(data, textStatus, request) {
					$('#' + elementToUpdate).html(data);
				},
				complete: function() {
					if (config.onComplete) {
						config.onComplete();
					}
				}
			}
		);
	}
};

$(function() {
	$('#redcase-dialog').keydown(function(event) {
		if (event.keyCode === 13) {
			$('#redcase-dialog')
				.parents()
				.find('.ui-dialog-buttonpane button')
				.first()
				.trigger('click');
			return false;
		}
	})
});

