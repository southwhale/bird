define(function(require) {
	var lang = require('bird.lang');
	var array = require('bird.array');
	var object = require('bird.object');
	var Observer = require('bird.__observer__');

	function Model() {
		this.watcher = new Observer();
	}

	(function() {
		var reservedObjMap = {
			'set': 1,
			'get': 1,
			'destroy': 1,
			'toJSON': 1,
			'toQuery': 1,
			'filterJSON': 1,
			'watcher': 1
		};

		this.set = function(key, value) {
			var _key = key;
			var lastDotIndex = _key.lastIndexOf('.');
			var obj;
			if (lastDotIndex === -1) {
				obj = this;
			} else {
				obj = lang.getObjectInContext(_key.substring(0, lastDotIndex), this);
				_key = _key.substring(lastDotIndex + 1, _key.length);
			}
			var oldValue = obj[_key];
			if (oldValue === value) {
				return;
			}
			obj[_key] = value;
			obj = null;
			var argArr = [key, value, oldValue, arguments[arguments.length - 1]];
			this.watcher.publish.apply(this.watcher, argArr);
			argArr = null;
		};

		this.get = function(key) {
			return lang.getVariableInContext(key, this);
		};


		this.toJSON = function(keyArr) {
			return this.filterJSON.apply(this, arguments);
		};
		/**
		 * 过滤参数只支持不超过两级变量引用的形式：'a' or 'a.b'
		 * 点的数量超过1个的变量引用形式不被支持，如：'a.b.c',
		 * 若过滤参数超过一个，那么变量的第一个引用单词必须相同，即需类似：['a.b','a.c']
		 * 这样的变量引用将不被支持：['a.b','b.c']
		 */
		this.filterJSON = function(json) {
			var filterKeys;
			if (lang.isArray(json)) {
				filterKeys = json;
				json = this;
			} else if (lang.isString(json)) {
				filterKeys = Array.prototype.slice.call(arguments);
				json = this;
			} else {
				filterKeys = arguments[1];
				filterKeys = lang.isArray(filterKeys) ? filterKeys : Array.prototype.slice.call(arguments, 1);
			}
			var ret = {};
			array.forEach(filterKeys, function(v) {
				var lastDotIndex = v.lastIndexOf('.');
				if (lastDotIndex !== -1) {
					if (lastDotIndex !== v.indexOf('.')) {
						console.warn('Only support filter key like "a" or "a.b", and "a.b.c" which dot number more than 1 is not supported!')
						return;
					}
					var arr = v.split('.');
					var k = arr[1];
					ret[k] = json[arr[0]][k];
				}
				ret[v] = json[v];
			});
			return ret;
		};

		this.toQuery = function(keyArr) {
			var obj = this.toJSON.apply(this, arguments);
			var ret = [];
			object.forEach(obj, function(v, k) {
				if (lang.isFunction(v)) {
					return;
				}
				ret.push(k + '=' + v);
			});
			return ret.join('&');
		};

		this.destroy = function() {
			var me = this;
			this.watcher.unsubscribe();
			object.forEach(this, function(v, k) {
				if (reservedObjMap[k]) {
					return;
				}
				delete me[k];
			});
		};

	}).call(Model.prototype);

	return Model;
});