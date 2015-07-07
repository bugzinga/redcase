
// TODO: Create a simple wrapper to keep all the functionality related to
//       Redcase's dialog windows at the only place, and provide more
//       OOP-like access to show/hide it.
jQuery2(function($) {
	$('#redcase-dialog').keydown(function(event) {
		if (event.keyCode === 13) {
			$(this)
				.parents()
				.find('.ui-dialog-buttonpane button')
				.first()
				.trigger('click');
			return false;
		}
	});
	if (typeof(Redcase) === 'undefined') {
		Redcase = {};
	}
	Redcase = $.extend(
		Redcase, {
			log: LogManager.getLog('redcase'),
			jsCopyToMenuItems: [],
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
				this.log.info('Running full update...');
				Redcase.executionSuiteTree.updateList2();
				Redcase.combos.update();
   			}
		}
	);
});

