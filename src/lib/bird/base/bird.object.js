define(function(require) {

	var lang = require('./bird.lang');
	var array = require('./bird.array');

	function _Object() {

	}

	(function() {

		// Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
		var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');

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

		/**
		 * 克隆对象
		 * @param {Object|Array} obj
		 * @param {boolean} deep
		 * @return {Object|Array}
		 */
		this.clone = function(obj, deep) {
			var ret, forEach, isArray, isPlainObject;
			if (lang.isPlainObject(obj)) {
				ret = {};
				forEach = this.forEach;
				isPlainObject = true;
			} else if (lang.isArray(obj)) {
				ret = [];
				forEach = array.forEach;
				isArray = true;
			} else {
				return obj;
			}

			var me = this;
			forEach(obj, function(v, k) {
				if (deep) {
					if (lang.isPlainObject(v)) {
						v = me.clone(v, deep);
					} else if (lang.isArray(v)) {
						var arr = [];
						array.forEach(v, function(e) {
							arr.push(me.clone(e, deep));
						});
						v = arr;
					}
				}
				if (isPlainObject) {
					ret[k] = v;
				} else if (isArray) {
					ret.push(v);
				}
				
			});
			return ret;
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
			if (!lang.isObject(obj)) {
				return [];
			}

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
			// IE < 9
			if (hasEnumBug && obj) {
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

		// subClass, superClass
		this.create = function (prototype, props) {
			var cleanPrototype;
			if (!lang.isObject(prototype)) {
				cleanPrototype = {};
			}
			else if (Object.create) {
				cleanPrototype = Object.create(prototype);
			}
			else {
				var F = new Function();
        		F.prototype = prototype;
        		cleanPrototype = new F();
			}
			
			if (lang.isPlainObject(props)) {
				for (var i in props) {
					if (props.hasOwnProperty(i)) {
						cleanPrototype[i] = props;
					}
				}
			}

			return cleanPrototype;
		};

		// Retrieve the values of an object's properties.
		this.values = function(obj) {
			var keys = this.keys(obj);
			var length = keys.length;
			var values = Array(length);
			for (var i = 0; i < length; i++) {
			  	values[i] = obj[keys[i]];
			}
			return values;
		};

		// Convert an object into a list of `[key, value]` pairs.
		this.pairs = function(obj) {
			var keys = this.keys(obj);
			var length = keys.length;
			var pairs = Array(length);
			for (var i = 0; i < length; i++) {
			  	pairs[i] = [keys[i], obj[keys[i]]];
			}
			return pairs;
		};

		// Invert the keys and values of an object. The values must be serializable.
		this.invert = function(obj) {
			var result = {};
			var keys = this.keys(obj);
			for (var i = 0, length = keys.length; i < length; i++) {
			  	result[obj[keys[i]]] = keys[i];
			}
			return result;
		};

	}).call(_Object.prototype);

	return new _Object();
});