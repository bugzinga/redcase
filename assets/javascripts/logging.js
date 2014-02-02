
LogFactory = {
	getLog: function(context) {
		var log = {
			trace: function(parameters) {
				var level = parameters.level || 'INFO';
				while (level.length < 5) {
					level += ' ';
				}
				while (level.length > 5) {
					level = level.substring(0, level.length - 1);
				}
				var traceImpl = function(message) {
					return (level.indexOf('INFO') === 0)
						? console.log(message)
						: console.trace(message);
				};
				traceImpl('[' + context + '] ' + level + ' > ' + (parameters.message || parameters));
			},
			info: function(message) {
				this.trace({level: 'INFO', message: message});
			},
			debug: function(message) {
				this.trace({level: 'DEBUG', message: message});
			}
		};
		return log;
	}

};
