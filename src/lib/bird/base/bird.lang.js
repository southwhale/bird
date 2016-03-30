define(function(require) {

	function Lang() {

	}

	(function() {
		/*********************************************************************
		 *                             类型判断
		 ********************************************************************/
		var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1; 
		/**
		 * {*}
		 * return {String}
		 */
		this.getType = function(p) {
			if (typeof p === 'undefined') {
				return 'Undefined';
			}
			if (p === null) {
				return 'Null';
			}
			return Object.prototype.toString.call(p).slice(8, -1);
		};

		this.isUndefined = function(p) {
			return typeof p === 'undefined';
		};

		/**
		 * 严格等于null
		 * {*}
		 * return {Boolean}
		 */
		this.isNull = function(p) {
			return p === null;
		};


		this.isUndefinedOrNull = function(p) {
			return p == null;
		};

		//同isUndefinedOrNull;之所以再定义一个相同功能的函数,只是为了避免记不清而不能确定函数名
		this.isNullOrUndefined = function(p) {
			return p == null;
		};

		this.isString = function(p) {
			return this.getType(p) === 'String';
		};

		this.isNumber = function(p) {
			return this.getType(p) === 'Number';
		};

		// Is the given value `NaN`? (NaN is the only number which does not equal itself).
		this.isNaN = function(obj) {
			return this.isNumber(obj) && obj !== +obj;
		};

		this.isInteger = function(p) {
			return this.isNumber(p) && /^-?\d+$/.test(p);
		};

		this.isFloat = function(p) {
			return this.isNumber(p) && /^-?\d*\.\d+$/.test(p);
		};

		this.isBoolean = function(p) {
			return this.getType(p) === 'Boolean';
		};

		this.isRegExp = function(p) {
			return this.getType(p) === 'RegExp';
		};

		this.isArray = function(p) {
			return Array.isArray ? Array.isArray(p) : this.getType(p) === 'Array';
		};

		this.isDate = function(p) {
			return this.getType(p) === 'Date';
		};

		/**
		 * typeof Object|Array|Date|Arguments|HtmlElement 都为 object
		 * return {Boolean}
		 */
		this.isObject = function(p) {
			return typeof p === 'object' && p !== null;
		};

		this.isPlainObject = function(p) {
			return this.getType(p) === 'Object';
		};

		var i;
		for (i in new noop) {
			break;
		}
		var ownLast = i !== undefined;
		var hasOwn = Object.prototype.hasOwnProperty;
		/**
		 * 通过 new Object() 或者 字面量 定义的对象
		 * {Object}
		 * return {Boolean}
		 */
		this.isRawObject = function(obj) {
			var key;
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if (!obj || this.getType(obj) !== "Object" || obj.nodeType || this.isWindow(obj)) {
				return false;
			}

			try {
				// Not own constructor property must be Object
				if (obj.constructor &&
					!hasOwn.call(obj, "constructor") &&
					!hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch (e) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}

			// Support: IE<9
			// Handle iteration over inherited properties before own properties.
			if (ownLast) {
				for (key in obj) {
					return hasOwn.call(obj, key);
				}
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.
			for (key in obj) {}

			return key === undefined || hasOwn.call(obj, key);
		};


		//IE8及以下版本中p.setInterval为一个object,并非一个function,暂无好的方法来判断
		this.isWindow = function(p) {
			//return this.isObject(p) && p.setInterval;
			//这里不去判断是否为iframe的window,在项目中基本也不会用iframe,
			//而且即使要用iframe,可以在iframe的页面里加载bird库来处理,也就不存在这个问题了
			return p != null && p == p.window;
		};


		//IE8及以下版本中p.getElementById为一个object,并非一个function,暂无好的方法来判断
		this.isHtmlDocument = function(p) {
			//return this.isObject(p) && p.getElementById;
			//不去判断是否为iframe的document,说明同isWindow
			return p === document;
		};

		/**
		 * html节点（包括元素、属性、文本、注释等）
		 * {*}
		 * return {Boolean}
		 */
		this.isHtmlNode = function(p) {
			return p && p.nodeType;
		};

		/**
		 * html元素
		 * {*}
		 * return {Boolean}
		 */
		this.isHtmlElement = function(p) {
			return p && p.nodeType === 1;
		};

		/**
		 * html属性
		 * {*}
		 * return {Boolean}
		 */
		this.isHtmlAttribute = function(p) {
			return p && p.nodeType === 2;
		};

		/**
		 * html文本节点
		 * {*}
		 * return {Boolean}
		 */
		this.isHtmlText = function(p) {
			return p && p.nodeType === 3;
		};

		/**
		 * html注释
		 * {*}
		 * return {Boolean}
		 */
		this.isHtmlComment = function(p) {
			return p && p.nodeType === 8;
		};

		this.isFunction = function(p) {
			return typeof p === 'function';
		};

		/**
		 * 浏览器原生函数
		 * 不适用于IE8及以下版本,针对IE8中很多原生函数类型为object的情况仍无好的解决方法
		 * {*}
		 * return {Boolean}
		 */
		this.isNativeFunction = function(p) {
			if (!this.isFunction(p)) {
				return false;
			}

			var nativeFuncRegExp = /^\s*function\s+[a-zA-Z]*\s*\(\s*[a-zA-Z]*\s*\)\s*\{\s*\[native code\]\s*\}\s*$/;
			//return nativeFuncRegExp.test(p.toString()) && nativeFuncRegExp.test(p.toString.toString());
			//IE(11)就是怪啊! chrome和firefox下原生函数的prototype都为undefined;就它拽,非得要搞个prototype,并且这个prototype还是此原生函数的实例
			return nativeFuncRegExp.test(p.toString()) && (this.isUndefined(p.prototype) || p.prototype.constructor === p);
		};

		/*this.isArrayLike = function(p) {
			return (this.isObject(p) || this.isFunction(p)) && !this.isNullOrUndefined(p.length);
		};*/

		this.isArrayLike = function(collection) {
			var length = collection && collection.length;
			return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
		};

		/**
		 * @param {String|Array|PlainObject} p
		 * @return {Boolean}
		 */
		this.isNotEmpty = function(p) {
			if (this.isNullOrUndefined(p) || p === '') {
				return false;
			}

			if (this.isArray(p) && p.length !== 0) {
				return false;
			}

			if (this.isPlainObject(p)) {
				for (var i in p) {
					if (p.hasOwnProperty(i)) {
						return true;
					}
				}
				return false;
			}

			return true;
		};


		this.getVariableInContext = function(s, ctx) {
			if (!this.isObject(ctx)) {
				console.warn('Parameter `ctx` of `lang.getVariableInContext(s, ctx)` is not an object.');
				return null;
			}
			if (s.indexOf('.') === -1) {
				return ctx[s];
			}
			var segments = s.split('.');

			for (var i = 0, len = segments.length; i < len; i++) {
				var namespace = ctx[segments[i]];
				if (namespace == null && i !== len - 1) {
					console.warn('Variable: `' + segments.slice(0, i + 1).join('.') + '` has no value.');
					return;
				}
				ctx = namespace;
			}
			return ctx;
		};

		this.setVariableInContext = function(s, value, ctx) {
			if (!this.isObject(ctx)) {
				console.warn('Parameter `ctx` of `lang.setVariableInContext(s, value, ctx)` is not an object.');
				return null;
			}
			var lastDotIndex = s.lastIndexOf('.');
			if (lastDotIndex === -1) {
				return ctx[s] = value;
			}
			var obj = this.getObjectInContext(s.substring(0, lastDotIndex), ctx);
			return obj[s.substring(lastDotIndex + 1, s.length)] = value;
		};


		this.getGlobalVariable = function(s) {
			return this.getVariableInContext(s, window);
		};

		this.getGlobalObject = function(s) {
			return this.getObjectInContext(s, window);
		};

		this.getObjectInContext = function(s, ctx) {
			if (s.indexOf('.') === -1) {
				return ctx[s] || (ctx[s] = {});
			}
			var segments = s.split('.');

			for (var i = 0, len = segments.length; i < len; i++) {
				var key = segments[i];
				var namespace = ctx[key] || (ctx[key] = {});
				ctx = namespace;
			}
			return ctx;
		};



		this.now = function() {
            return Date.now ? Date.now() : new Date().getTime();
        };

        this.debounce = function(func, wait, immediate) {
            // immediate默认为false
            var timeout, args, context, timestamp, result;

            var me = this;

            var later = function() {
              // 当wait指定的时间间隔期间多次调用_.debounce返回的函数，则会不断更新timestamp的值，导致last < wait && last >= 0一直为true，从而不断启动新的计时器延时执行func
              var last = me.now() - timestamp;

              if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
              } else {
                timeout = null;
                if (!immediate) {
                  result = func.apply(context, args);
                  if (!timeout) context = args = null;
                }
              }
            };

            return function() {
              context = this;
              args = arguments;
              timestamp = me.now();
              // 第一次调用该方法时，且immediate为true，则调用func函数
              var callNow = immediate && !timeout;
              // 在wait指定的时间间隔内首次调用该方法，则启动计时器定时调用func函数
              if (!timeout) timeout = setTimeout(later, wait);
              if (callNow) {
                result = func.apply(context, args);
                context = args = null;
              }

              return result;
            };
        };

		this.noop = noop;

		this.nextTick = window.setImmediate ? setImmediate.bind(window) : function(callback) {
			setTimeout(callback, 0) //IE10-11 or W3C
		};

		function noop() {};

	}).call(Lang.prototype);

	return new Lang();
});