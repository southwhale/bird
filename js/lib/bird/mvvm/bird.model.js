define(function(require) {
	var lang = require('bird.lang');
	var array = require('bird.array');
	var object = require('bird.object');


	function Model() {

	}

	(function() {
		var reservedMethodMap = {
			'set': 1,
			'get': 1,
			'destroy': 1,
			'toJSON': 1,
			'toQuery': 1
		};

		this.set = function(key, value, dataBind) {
			var oldValue = this[key];
			if (oldValue === value) {
				return;
			}
			this[key] = value;
			dataBind.callVariableHandle(key, value, oldValue, arguments[arguments.length - 1]);
		};

		this.get = function(key) {
			return this[key];
		};


		this.toJSON = function(keyArr) {
			var ret = {},
				me = this;
			if (lang.isArray(keyArr)) {
				array.forEach(keyArr, function(key) {
					var value = me[key];
					if (lang.isFunction(value)) {
						return;
					}
					ret[key] = value;
				});
				return ret;
			}

			if (arguments.length) {
				keyArr = Array.prototype.slice.call(arguments);
				return arguments.callee(keyArr);
			}

			object.forEach(this, function(v, k) {
				if (lang.isFunction(v)) {
					return;
				}
				ret[k] = v;
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
			object.forEach(this, function(v, k) {
				if (reservedMethodMap[k]) {
					return;
				}
				delete me[k];
			});
		};

	}).call(Model.prototype);

	return Model;
});