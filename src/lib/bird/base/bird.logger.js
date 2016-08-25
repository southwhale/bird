define(function(require) {

	if (typeof window.console === 'undefined') {
		function DivConsole() {
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.top = '0px';
			div.style.padding = '10px';
			div.style.backgroundColor = '#eee';
			div.style.filter="alpha(opacity=80)"; 
			div.style.border = "dotted 2px red";
			div.style.color = "black";
			div.zIndex = 999999999;
			document.body.appendChild(div);
			this.contentDiv = div;
			div = null;
		};

		(function() {
			this.log = function(s, color) {
				var rs;
				if (!isPlainObject(s) && !isArray(s)) {
					var strarr = s.split('%c');
					var ret = [];
					var _arguments = arguments;
					util.forEach(strarr, function(str, index, strarr) {
						if (!index && str) {
							ret.push(str);
						} else {
							ret.push('<span style="' + _arguments[index] + '">', str, '</span>');
						}
					});
					rs = ret.join('');
				} else {
					rs = JSON.stringify(s);
				}

				var div = document.createElement('div');
				div.innerHTML = rs;
				this.contentDiv.appendChild(div);
				div = _arguments = null;
			};

			this.dir = this.info = this.warn = this.error = this.log;
		}).call(DivConsole.prototype);

		window.console = new DivConsole();
	}


	function getType(p) {
		if (typeof p === 'undefined') {
			return 'Undefined';
		}
		if (p === null) {
			return 'Null';
		}
		return Object.prototype.toString.call(p).slice(8, -1);
	};

	function isArray(p) {
		return Array.isArray ? Array.isArray(p) : getType(p) === 'Array';
	}

	function isPlainObject(p) {
		return getType(p) === 'Object';
	}

	var levelMap = {
		INFO: 1,
		WARN: 2,
		ERROR: 3,
		FATAL: 4
	};

	function Logger() {
		this.level = 'INFO';
	}

	(function() {
		this.setLevel = function(level) {
			this.level = level;
		};

		this.setDefaultLevel = function() {
			this.level = 'INFO';
		};

		this.info = function() {
			if (levelMap[this.level] === 1) {
				console.log.apply(console, arguments);
			}
		};

		this.log = this.info;

		this.warn = function() {
			if (levelMap[this.level] > 1) {
				console.warn.apply(console, arguments);
			}
		};

		this.error = function() {
			if (levelMap[this.level] > 2) {
				console.error.apply(console, arguments);
			}
		};

		this.dir = function() {
			if (levelMap[this.level] === 1) {
				console.dir.apply(console, arguments);
			}
		};

	}).call(Logger.prototype);

	return new Logger();
});