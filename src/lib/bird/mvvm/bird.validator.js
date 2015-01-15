define(function(require) {
	var lang = require('bird.lang');
	var string = require('bird.string');
	var array = require('bird.array');
	var object = require('bird.object');
	var dom = require('bird.dom');

	function Validator() {

	}

	(function() {
		var checkReg = {
		    require: /.+/,
		    email: /^\w+[-+.\w]*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
		    phone: /^((\(\d{3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}$/,
		    mobile: /^0?1\d{10}$/,
		    name: /^[\u0391-\uFFE5]{2,20}$/,
		    pinyin: /^[a-zA-Z]*$/,
		    url: /^http:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/,
		    idCard: /^\d{17}[A-Za-z0-9]$/,
		    currency: /^\d+(\.\d+)?$/,
		    number: /^\d+$/,
		    zip: /^\d{6}$/,
		    qq: /^[1-9]\d{4,11}$/,
		    Integer: /^[-\+]?\d+$/,
		    Double: /^[-\+]?\d+(\.\d+)?$/,
		    english: /^[A-Za-z]+$/,
		    chinese: /^[\u0391-\uFFE5]+$/,
		    passport: /^[Pp]([0-9]{7})$|^[Gg]([0-9]{8})$/,
		    address: /((.*[\u0391-\uFFE5].*)+){6,}/,
		    authCode: /^\d{6}$/,
		    date: /^\d{4}-\d{1,2}-\d{1,2}$/,
		    datetime: /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/,
		    time: /^\d{1,2}:\d{1,2}:\d{1,2}$/,
		    carNo: /^[\u4e00-\u9fa5]{1}[a-zA-Z]{1}[a-zA-Z_0-9]{4}[a-zA-Z_0-9_\u4e00-\u9fa5]$|^[a-zA-Z]{2}\d{7}$/,
		    validCode: /^[A-Za-z0-9]{4}$/
		};

		var me = this;

		var ruleMap = {
			'required': {
				validate: function(value) {
					var ret = lang.isNotEmpty(value);
					if (!ret) {
						return 1;
					} else {
						return 0;
					}
				},
				messageMap: {
					1: '请输入'
				}
			},
			'number': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					var ret = !isNaN(+value);
					if (!ret) {
						return 1;
					}
					return 0;
				},
				messageMap: {
					1: '只能输入数字'
				}
			},
			'positiveNumber': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value > 0) {
							return 0;
						}
					}
					return 1;
				},
				messageMap: {
					1: "只能输入正数"
				}
			},
			'positiveInt': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value > 0 && /^\+?\d+$/.test(value)) {
							return 0;
						}
						return 1;
					}
					return 1;
				},
				messageMap: {
					1: "只能输入正整数"
				}
			},
			'negativeNumber': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value < 0) {
							return 0;
						}
						return 1;
					}
					return 1;
				},
				messageMap: {
					1: "只能输入负数"
				}
			},
			'negativeInt': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value < 0 && /^\-\d+$/.test(value)) {
							return 0;
						}
						return 1;
					}
					return 1;
				},
				messageMap: {
					1: "只能输入负整数"
				}
			},
			'notNegativeNumber': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value >= 0) {
							return 0;
						}
						return 1;
					}
					return 1;
				},
				messageMap: {
					1: "只能输入非负数"
				}
			},
			'notNegativeInt': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value >= 0 && /^\+?\d+$/.test(value)) {
							return 0;
						}
						return 1;
					}
					return 1;
				},
				messageMap: {
					1: "只能输入非负整数"
				}
			},
			'notPositiveNumber': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value <= 0) {
							return 0;
						}
						return 1;
					}
					return 1;
				},
				messageMap: {
					1: "只能输入非正数"
				}
			},
			'notPositiveInt': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (+value <= 0 && /^\-\d+$/.test(value)) {
							return 0;
						}
						return 1;
					}
					return 1;
				},
				messageMap: {
					1: "只能输入非正整数"
				}
			},
			'email': {
				validate: function(value) {
					if(value == null || value === '') {
						return 0;
					}
					if(/^[a-z0-9][a-z0-9\-_]*@[a-z0-9][a-z0-9\-_]*\.(?:com|cn|net|com\.cn)$/i.test(value)) {
						return 0;
					}
					return 1;
				},
				messageMap: {
					1: '邮箱格式不正确'
				}
			},
			'mobile': {
				validate: function(value) {
					if (value == null || value === '') {
						return 0;
					}

					if (checkReg.mobile.test(value)) {
						return 0;
					}

					return 1;
				},
				messageMap: {
					1: '手机号码格式不正确'
				}
			},
			'idCard': {
				validate: function(b) {
			        if (!b) {
			            return 0;
			        }
			        var a = checkReg.idCard;
			        if (!a.test(b)) {
			            return 1;
			        }
			        var g = "11,12,13,14,15,21,22,23,31,32,33,34,35,36,37,41,42,43,44,45,46,50,51,52,53,54,61,62,63,64,65,71,81,82,91";
			        var e = 0;
			        var c = "";
			        var f = b.length;
			        if (!/^\d{17}(\d|x)$/i.test(b)) {
			            return 1;
			        }
			        var l = b.replace(/x$/i, "a");
			        var j = l.substr(0, 2);
			        if (! (g.indexOf(j) >= 0)) {
			            return 1;
			        }
			        if (f == 18) {
			            sBirthday = l.substr(6, 4) + "-" + Number(l.substr(10, 2)) + "-" + Number(l.substr(12, 2));
			            var k = new Date(sBirthday.replace(/-/g, "/"));
			            if (sBirthday != (k.getFullYear() + "-" + (k.getMonth() + 1) + "-" + k.getDate())) {
			                return 1;
			            }
			            for (var h = 17; h >= 0; h--) {
			                e += (Math.pow(2, h) % 11) * parseInt(l.charAt(17 - h), 11)
			            }
			            if (e % 11 != 1) {
			                return 1;
			            }
			        }
			        return 0;
    			},
				messageMap: {
					1: '身份证号码格式不正确'
				}
			},
			'float': {
				validate: function(value, digit) {
					if(value == null || value === '') {
						return 0;
					}
					if (this.number(value)) {
						if (digit == null || digit === '' || digit == 0) {
							return 0;
						}
						var re = new RegExp('^(?:\\+|\\-)?(?:\\d+\\.?|\\d*\\.\\d{' + digit + '})$');
						if (re.test(value)) {
							return 0;
						}
						return [1, {digit: digit}];
					}
					return [1, {digit: digit}];
				},
				messageMap: {
					1: '小数位不能超过{{digit}}位'
				}
			}
		};

		this.getErrorTipNode = function(inputNode) {
			return dom.g('[for=' + inputNode.id + ']') || dom.g('.errorTip', inputNode.parentNode);
		};

		this.getErrorTipContentNode = function(errorTipNode) {
			return dom.g('.content', errorTipNode) || errorTipNode;
		};

		/**
		 * float,2 ——>
		 * {
		 *    ruleName: 'float',
		 *	  rulePropertys: [2]
		 * }
		 */
		this.validate = function(validators, target) {
			if (lang.isPlainObject(validators)) {
				validators = [validators];
			}

			if (!validators.length) {
				return true;
			}
			var value = target.value;
			var errorTipNode = this.getErrorTipNode(target);
			var errorTipContentNode = this.getErrorTipContentNode(errorTipNode);

			var isValid = array.each(validators, function(v) {
				var rule = ruleMap[v.ruleName];
				if (!rule) {
					return true;
				}
				var propertys = v.rulePropertys.slice();
				propertys.unshift(value);
				var ret = rule.validate.apply(rule, propertys);
				if (!ret) {
					return true;
				}
				var message;
				if (lang.isArray(ret)) {
					message = string.format(rule.messageMap[ret[0]], ret[1]);
				} else {
					message = rule.messageMap[ret];
				}
				if (errorTipNode) {
					dom.setText(errorTipContentNode, message);
					dom.show(errorTipNode);
				}
				return false;
			});

			if (isValid && errorTipNode) {
				dom.setText(errorTipContentNode, '');
				dom.hide(errorTipNode);
			}

			return isValid;
		};

		/**
		 * @param {Object|Array}
		 *
		 * {
		 *		name: 'required',
		 *		validate: function(){...},
		 *		messageMap: {
		 *			1: '请输入'
		 *		}
		 * }
		 */
		this.addValidator = function(v) {
			// 添加的验证规则不能与内置规则重名
			if (lang.isPlainObject(v) && !ruleMap[v.name]) {
				ruleMap[v.name] = v;
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