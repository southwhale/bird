define(function(require) {

	var lang = require('./bird.lang');

	function _Object() {

	}

	(function() {
		//each可从内部中断,当findSuper为true时把继承而来的property也一起遍历
		this.each = function(p, callback, findSuper) {
			if (lang.isPlainObject(p) && lang.isUndefined(p.length)) {
				for (var i in p) {
					if (findSuper || p.hasOwnProperty(i)) {
						if (callback.call(this, p[i], i, p) === false) {
							return false;
						}
					}
				}
				return true;
			}

			var length = Number(p.length) || 0;
			for (var i = 0; i < length; i++) {
				if (findSuper || p.hasOwnProperty(i)) {
					if (callback.call(this, p[i], i, p) === false) {
						return false;
					}
				}
			}

			return true;
		};

		//each不可从内部中断,当findSuper为true时把继承而来的property也一起遍历
		this.forEach = function(p, callback, findSuper) {
			if (lang.isPlainObject(p) && lang.isUndefined(p.length)) {
				for (var i in p) {
					if (findSuper || p.hasOwnProperty(i)) {
						callback.call(this, p[i], i, p);
					}
				}
				return;
			}

			var length = Number(p.length) || 0;
			for (var i = 0; i < length; i++) {
				if (findSuper || p.hasOwnProperty(i)) {
					callback.call(this, p[i], i, p);
				}
			}
		};

		this.extend = function(dest, src) {
			if (arguments.length < 2) {
				return dest;
			}
			if (arguments.length === 2) {
				this.forEach(src, function(v, k) {
					dest[k] = v;
				});
				return dest;
			}
			var i, len;
			for (i = 1, len = arguments.length; i < len; i++) {
				this.forEach(arguments[i], function(v, k) {
					dest[k] = v;
				});
			}
			return dest;
		};

		// 只覆盖dest中存在的属性, 不添加任何额外的属性, 调用前后保证属性名不变
		this.cover = function(dest, src) {
			if (arguments.length < 2) {
				return dest;
			}
			if (arguments.length === 2) {
				this.forEach(dest, function(v, k) {
					if (k in src) {
						dest[k] = src[k];
					}
				});
				return dest;
			}
			return dest;
		};

		
		this.jsonToQuery = function(obj, split) {
			if (lang.isString(obj)) {
				return obj;
			}
			split = split || ',';
			var arr = [];
			var me = this;
			if (lang.isPlainObject(obj)) {
				for (var i in obj) {
					if (obj.hasOwnProperty(i)) {
						var val = obj[i];
						if (lang.isPlainObject(val)) {
							arr.push(i + '=' + encodeURIComponent(arguments.callee.call(this, val)));
						} else if (lang.isArray(val)) {
							arr.push(i + '=' + encodeURIComponent(arguments.callee.call(this, val)));
						} else if (lang.isString(val) || lang.isNumber(val)) {
							arr.push(i + '=' + val);
						}
					}
				}
				return arr.join('&');
			} else if (lang.isArray(obj)) {
				var _arguments = arguments;
				this.each(obj, function(val) {
					if (lang.isString(val) || lang.isNumber(val)) {
						arr.push(val);
					} else if (lang.isPlainObject(val) || lang.isArray(val)) {
						arr.push(_arguments.callee.call(me, val));
					}
				});
				return arr.join(split);
			}
		};

		this.keys = function(obj) {
			if (Object.keys) {
				return Object.keys(obj);
			}
			var DONT_ENUM = "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(",");
			var ret = [];
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					ret.push(key);
				}
			}
			if (DONT_ENUM && obj) {
				for (var i = 0; key = DONT_ENUM[i++];) {
					if (obj.hasOwnProperty(key)) {
						ret.push(key);
					}
				}
			}
			return ret;
		};

		//过滤plainobject
		this.filter = function(p, fn) {
			if (!lang.isFunction(fn)) {
				return;
			}
			var ret = {};
			this.forEach(p, function(v, i, p) {
				if (fn(v, i, p)) {
					ret[i] = v;
				}
			});
			return ret;
		};
	}).call(_Object.prototype);

	return new _Object();
});