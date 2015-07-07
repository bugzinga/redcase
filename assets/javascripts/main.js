
// TODO: Create a simple wrapper to keep all the functionality related to
//       Redcase's dialog windows at the only place, and provide more OOP-like
//       access to show/hide it.
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
});

