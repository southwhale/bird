define("bird.validator", [ "bird.lang", "bird.string", "bird.array", "bird.object", "bird.dom" ], function(require) {
    var lang = require("bird.lang");
    var string = require("bird.string");
    var array = require("bird.array");
    var object = require("bird.object");
    var dom = require("bird.dom");
    function Validator() {}
    (function() {
        //var messageStack = [];
        /*var messageMap = {
			'required': '请输入',
			'number': '只能输入数字',
			'positiveNumber': "只能输入正数",
			'positiveInt': "只能输入正整数",
			'negativeNumber': "只能输入负数",
			'negativeInt': "只能输入负整数",
			'notPositiveNumber': "只能输入非正数",
			'notPositiveInt': "只能输入非正整数",
			'notNegativeNumber': "只能输入非负数",
			'notNegativeInt': "只能输入非负整数",
			'email': '邮箱格式不正确',
			'mobile': '手机号码格式不正确',
			'idNumber': '身份证号码格式不正确',
			'float': '小数位不能超过{{digit}}位'
		};*/
        var me = this;
        var ruleMap = {
            required: {
                validate: function(value) {
                    var ret = lang.isNotEmpty(value);
                    if (!ret) {
                        return 1;
                    } else {
                        return 0;
                    }
                },
                messageMap: {
                    1: "请输入"
                }
            },
            number: {
                validate: function(value) {
                    if (value == null || value === "") {
                        return 0;
                    }
                    var ret = !isNaN(+value);
                    if (!ret) {
                        return 1;
                    }
                    return 0;
                },
                messageMap: {
                    1: "只能输入数字"
                }
            },
            positiveNumber: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            positiveInt: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            negativeNumber: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            negativeInt: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            notNegativeNumber: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            notNegativeInt: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            notPositiveNumber: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            notPositiveInt: {
                validate: function(value) {
                    if (value == null || value === "") {
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
            email: {
                validate: function(value) {
                    if (value == null || value === "") {
                        return 0;
                    }
                    if (/^[a-z0-9][a-z0-9\-_]*@[a-z0-9][a-z0-9\-_]*\.(?:com|cn|net|com\.cn)$/i.test(value)) {
                        return 0;
                    }
                    return 1;
                },
                messageMap: {
                    1: "邮箱格式不正确"
                }
            },
            mobile: {
                validate: function(value) {
                    if (value == null || value === "") {
                        return 0;
                    }
                    if (/^1\d{10,11}$/.test(value)) {
                        return 0;
                    }
                    return 1;
                },
                messageMap: {
                    1: "手机号码格式不正确"
                }
            },
            idNumber: {
                validate: function(value) {
                    if (value == null || value === "") {
                        return 0;
                    }
                    if (/^(?:\d{15}|\d{18})$/.test(value)) {
                        return 0;
                    }
                    return 1;
                },
                messageMap: {
                    1: "身份证号码格式不正确"
                }
            },
            "float": {
                validate: function(value, digit) {
                    if (value == null || value === "") {
                        return 0;
                    }
                    if (this.number(value)) {
                        if (digit == null || digit === "" || digit == 0) {
                            return 0;
                        }
                        var re = new RegExp("^(?:\\+|\\-)?(?:\\d+\\.?|\\d*\\.\\d{" + digit + "})$");
                        if (re.test(value)) {
                            return 0;
                        }
                        return [ 1, {
                            digit: digit
                        } ];
                    }
                    return [ 1, {
                        digit: digit
                    } ];
                },
                messageMap: {
                    1: "小数位不能超过{{digit}}位"
                }
            }
        };
        this.getRuleMap = function() {
            return ruleMap;
        };
        this.getRule = function(ruleName) {
            return ruleMap[ruleName];
        };
        this.getErrorTipNode = function(inputNode) {
            return dom.g("[for=" + inputNode.id + "]") || dom.g(".errorTip", inputNode.parentNode);
        };
        this.getErrorTipContentNode = function(errorTipNode) {
            return dom.g(".content", errorTipNode) || errorTipNode;
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
                validators = [ validators ];
            }
            if (!validators.length) {
                return true;
            }
            var value = target.value;
            var errorTipNode = this.getErrorTipNode(target);
            var errorTipContentNode = this.getErrorTipContentNode(errorTipNode);
            var me = this;
            var isValid = array.each(validators, function(v) {
                var rule = me.getRule(v.ruleName);
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
                dom.setText(errorTipContentNode, "");
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
            if (lang.isPlainObject(v)) {
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