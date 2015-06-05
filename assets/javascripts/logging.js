
var LogManager = new function() {

	var loggers = {};

	this.getLog = function(context) {
		if (!(context in loggers)) {
			loggers[context] = new Log(context);
		}
		return loggers[context];
	};

};

var Log = function(context) {

	var LevelFieldWidth = 5;

	var context = context;

	this.debug = function(message) {
		trace(message, 'DEBUG');
	}

	this.info = function(message) {
		trace(message, 'INFO');
	};

	this.warn = function(message) {
		trace(message, 'WARN');
	}

	this.error = function(message) {
		trace(message, 'ERROR');
	}

	var trace = function(message, level) {
		if (!console || !console.log) {
			return;
		}
		while (level.length < LevelFieldWidth) {
			level += ' ';
		}
		if (level.length > LevelFieldWidth) {
			level = level.substring(0, LevelFieldWidth);
		}
		var fullMessage = (level + ' [' + context + '] ' + message);
		console.log(fullMessage);
	}

};

