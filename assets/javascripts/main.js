var Form = {
	'Element' : {
		EventObserver : function (Element, Callback) {
			jQuery2('#' + Element).on('change', function (event) {
				Callback(event.target, jQuery2(event.target).val());
			});
		}
	},
	'serialize' : function (Element) {
		return jQuery2('#' + Element).serialize();
	}
},
Ajax = {
	'Updater' : function (ElementToUpdate, Url, Config) {
		jQuery2.ajax(Url, {
			type: Config.method ? Config.method : 'GET', 
			data : Config.parameters,
			success : function (data, textStatus, request) {
				jQuery2('#' + ElementToUpdate).html(data);
			},
			complete : function () {
				if (Config.onComplete !== undefined) {
					Config.onComplete();
				}
			}
		});
	}
},
log = LogFactory.getLog('redcase-api]');

jQuery2(function () {
	jQuery('#redcase-dialog').on('keydown', function (event) {
		if (event.keyCode === 13) {
			jQuery('#redcase-dialog').parents().find('.ui-dialog-buttonpane button').first().trigger('click');
			return false;
		}
	})
});
