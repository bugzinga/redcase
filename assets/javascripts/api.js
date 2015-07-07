
var RedcaseApi = function($) {

	var log = LogManager.getLog('redcase.api');

	this.context = 'redcase/';

	this.core = new function() {

		var self = this;

		this.controller = '';

		this.getAttachmentURLs = function() {
			return {
				method: (self.controller + '/get_attachment_urls'),
				httpMethod: 'GET'
			};
		};

	};

	this.testSuite = new function() {

		var self = this;

		this.controller = 'testsuites';

		this.index = function() {
			return {
				method: self.controller,
				httpMethod: 'GET'
			};
		};

		this.destroy = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'DELETE'
			};
		};

		this.update = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'PUT'
			};
		};

		this.create = function() {
			return {
				method: self.controller,
				httpMethod: 'POST'
			};
		};

	};

	this.executionSuite = new function() {

		var self = this;

		this.controller = 'executionsuites';

		this.create = function() {
			return {
				method: self.controller,
				httpMethod: 'POST'
			};
		};

		this.update = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'PUT'
			};
		};

		this.destroy = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'DELETE'
			};
		};

		this.show = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'GET'
			};
		};

		this.index = function() {
			return {
				method: self.controller,
				httpMethod: 'GET'
			};
		};

	};

	this.executionJournal = new function() {

		var self = this;

		this.controller = 'executionjournals';

		this.index = function() {
			return {
				method: self.controller,
				httpMethod: 'GET'
			};
		};

	};

	this.environments = new function() {

		var self = this;

		this.controller = 'environments';

		this.index = function() {
			return {
				method: self.controller,
				httpMethod: 'GET'
			};
		};

		this.update = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'PUT'
			};
		};

		this.create = function() {
			return {
				method: self.controller,
				httpMethod: 'POST'
			};
		};

		this.destroy = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'DELETE'
			};
		};

	};

	this.testCase = new function() {

		var self = this;

		this.controller = 'testcases';

		this.index = function() {
			return {
				method: self.controller,
				httpMethod: 'GET'
			};
		};

		this.update = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'PUT',
			};
		};

		this.copy = function(id) {
			return {
				method: (self.controller + '/' + id + '/copy'),
				httpMethod: 'POST',
			};
		};

	};

	this.combos = new function() {
		
		var self = this;

		this.controller = 'combos';

		this.index = function() {
			return {
				method: self.controller,
				httpMethod: 'GET'
			};
		};

	};

	this.graph = new function() {

		var self = this;

		this.controller = 'graph';

		this.show = function(id) {
			return {
				method: (self.controller + '/' + id),
				httpMethod: 'GET'
			};
		};

	};

	this.apiCall = function(parameters) {
		var url = (this.context + parameters.method);
		var token = $("meta[name='csrf-token']").attr('content');
		var params = $.extend(
			{},
			parameters.params, {
				authenticity_token: token
			}
		);
		log.info('API call: ' + url);
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
				log.debug(errorThrown);
			},
			complete: function() {
				if (parameters.complete) {
					parameters.complete();
				}
				$('#ajax-indicator').fadeOut(100);
			}
		});
	};

};

jQuery2(function($) {
	if (typeof(Redcase) === 'undefined') {
		Redcase = {};
	}
	if (Redcase.api) {
		return;
	}
	Redcase.api = new RedcaseApi($);
});

