define(function(require) {
	var lang = require('bird.lang');
	var array = require('bird.array');
	var object = require('bird.object');

	function Validator() {

	}

	(function() {
		var messageStack = [];
		var messageMap = {
			'required': '请输入',
			'number': '只能输入数字'
		};

		var ruleMap = {
			'required': function(value) {
				var ret = lang.isNotEmpty(value);
				if (!ret) {
					messageStack.push(messageMap['required']);
				}
				return ret;
			},
			'number': function(value) {
				var ret = !isNaN(+value);
				if (!ret) {
					messageStack.push(messageMap['number']);
				}
				return ret;
			}
		};

		this.getRule = function(ruleName) {
			return ruleMap[ruleName];
		};

		this.getMessageStack = function() {
			return messageStack;
		};

		this.clearMessageStack = function() {
			messageStack.length = 0;
		};

		/**
		 * @param {Object|Array}
		 *
		 * {
		 *		name: 'required',
		 *		handle: function(){...},
		 *		message: '请输入'
		 * }
		 */
		this.addValidator = function(v) {
			if (lang.isPlainObject(v)) {
				ruleMap[v.name] = v.handle;
				messageMap[v.name] = v.message;
			} else if (lang.isArray(v)) {
				var _arguments = arguments;
				array.forEach(v, function(_v) {
					_arguments.callee(_v);
				});
			}
		};
	}).call(Validator.prototype);

	return new Validator();
});