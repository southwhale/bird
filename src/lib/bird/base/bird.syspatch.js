define(function(require) {
	var util = require('./bird.util');
	var lang = require('./bird.lang');
	/*********************************************************************
	 *                             系统函数补丁
	 ********************************************************************/
	var ctx = window;

	/**
	 * 保证JSON在语法上可行
	 */
	if (typeof ctx.JSON === 'undefined') {
		ctx.JSON = {
			parse: function(s) {
				//return ctx.eval('(' + s + ')');
				return new Function('return (' + s + ')')();
			},
			stringify: util.stringify
		};
	}

	/**
	 * 增强bind实现
	 */
 	!Function.prototype.bind && (Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(
              this instanceof fNOP && oThis ? this : oThis || window,
              aArgs.concat(Array.prototype.slice.call(arguments))
          );
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  });

	/**
	 * 保证console在语法上可行
	 */
	if (ctx.DEBUG && typeof ctx.console === 'undefined') {
		var Console = function() {
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
				if (!lang.isPlainObject(s) && !lang.isArray(s)) {
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

			this.info = this.warn = this.error = this.log;
		}).call(Console.prototype);

		ctx.console = new Console();
	}


	if (!ctx.DEBUG) {
		ctx.console = {
			log: lang.noop,
			warn: lang.noop,
			info: lang.noop,
			error: lang.noop
		};
	}

});