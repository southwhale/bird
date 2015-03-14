define("bird.validator", [ "bird.lang", "bird.string", "bird.array", "bird.object", "bird.dom" ], function(require) {
    var lang = require("bird.lang");
    var string = require("bird.string");
    var array = require("bird.array");
    var object = require("bird.object");
    var dom = require("bird.dom");
    function Validator() {}
    (function() {
        var checkReg = {
            required: /.+/,
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
            birthday: /^\d{4}-\d{2}-\d{2}$/,
            datetime: /^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/,
            time: /^\d{1,2}:\d{1,2}:\d{1,2}$/,
            carNo: /^[\u4e00-\u9fa5]{1}[a-zA-Z]{1}[a-zA-Z_0-9]{4}[a-zA-Z_0-9_\u4e00-\u9fa5]$|^[a-zA-Z]{2}\d{7}$/,
            validCode: /^[A-Za-z0-9]{4}$/,
            qq: /^\d{4,}$/,
            password: /^[a-zA-Z0-9-_]+$/
        };
        var messageMap = {
            required: "请输入",
            number: "只能输入数字",
            positiveNumber: "只能输入正数",
            positiveInt: "只能输入正整数",
            negativeNumber: "只能输入负数",
            negativeInt: "只能输入负整数",
            notNegativeNumber: "只能输入非负数",
            notNegativeInt: "只能输入非负整数",
            notPositiveNumber: "只能输入非正数",
            notPositiveInt: "只能输入非正整数",
            email: "邮箱格式不正确",
            mobile: "手机号码格式不正确",
            date: "日期格式不正确",
            datetime: "日期和时间格式不正确",
            birthday: "生日格式不正确",
            qq: "QQ号码格式不正确",
            password: '密码只能由字母、数字、"_"或"-"组成',
            idCard: "身份证号码格式不正确",
            "float": "小数位不能超过{{digit}}位",
            minLength: "字符数不能少于{{minLength}}个",
            maxLength: "字符数不能超过{{maxLength}}个"
        };
        var ruleMap = {
            required: function(value, fieldName) {
                var ret = checkReg.required.test(value);
                return {
                    success: ret,
                    message: !ret && messageMap["required"] + (fieldName || "")
                };
            },
            number: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = !isNaN(+value);
                return {
                    success: ret,
                    message: !ret && messageMap["number"]
                };
            },
            positiveNumber: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.number(value);
                if (!ret.success) {
                    return ret;
                }
                ret = +value > 0;
                return {
                    success: ret,
                    message: !ret && messageMap["positiveNumber"]
                };
            },
            positiveInt: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.positiveNumber(value);
                if (!ret.success) {
                    return ret;
                }
                ret = /^\+?\d+$/.test(value);
                return {
                    success: ret,
                    message: !ret && messageMap["positiveInt"]
                };
            },
            negativeNumber: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.number(value);
                if (!ret.success) {
                    return ret;
                }
                ret = +value < 0;
                return {
                    success: ret,
                    message: !ret && messageMap["negativeNumber"]
                };
            },
            negativeInt: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.negativeNumber(value);
                if (!ret.success) {
                    return ret;
                }
                ret = /^\-\d+$/.test(value);
                return {
                    success: ret,
                    message: !ret && messageMap["negativeInt"]
                };
            },
            notNegativeNumber: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.number(value);
                if (!ret.success) {
                    return ret;
                }
                ret = +value >= 0;
                return {
                    success: ret,
                    message: !ret && messageMap["notNegativeNumber"]
                };
            },
            notNegativeInt: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.notNegativeNumber(value);
                if (!ret.success) {
                    return ret;
                }
                ret = /^\+?\d+$/.test(value);
                return {
                    success: ret,
                    message: !ret && messageMap["notNegativeInt"]
                };
            },
            notPositiveNumber: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.number(value);
                if (!ret.success) {
                    return ret;
                }
                ret = +value <= 0;
                return {
                    success: ret,
                    message: !ret && messageMap["notPositiveNumber"]
                };
            },
            notPositiveInt: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.notPositiveNumber(value);
                if (!ret.success) {
                    return ret;
                }
                ret = /^\-\d+$/.test(value);
                return {
                    success: ret,
                    message: !ret && messageMap["notPositiveInt"]
                };
            },
            email: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                if (/^[a-z0-9][a-z0-9\-_]*@[a-z0-9][a-z0-9\-_]*\.(?:com|cn|net|com\.cn)$/i.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: messageMap["email"]
                };
            },
            mobile: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                if (checkReg.mobile.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: messageMap["mobile"]
                };
            },
            minLength: function(value, minLen) {
                if (value == null || value.length < minLen) {
                    return {
                        success: false,
                        message: string.format(messageMap["minLength"], {
                            minLength: minLen
                        })
                    };
                }
                return {
                    success: true
                };
            },
            maxLength: function(value, maxLen) {
                if (value == null || value.length < maxLen) {
                    return {
                        success: false,
                        message: string.format(messageMap["maxLength"], {
                            maxLength: maxLen
                        })
                    };
                }
                return {
                    success: true
                };
            },
            password: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                if (checkReg.password.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: messageMap["password"]
                };
            },
            birthday: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                if (checkReg.birthday.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: messageMap["birthday"]
                };
            },
            qq: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                if (checkReg.qq.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: messageMap["qq"]
                };
            },
            date: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                if (checkReg.date.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: messageMap["date"]
                };
            },
            datetime: function(value) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                if (checkReg.datetime.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: messageMap["datetime"]
                };
            },
            idCard: function(b) {
                if (!b) {
                    return {
                        success: true
                    };
                }
                var a = checkReg.idCard;
                if (!a.test(b)) {
                    return {
                        success: false,
                        message: messageMap["idCard"]
                    };
                }
                var g = "11,12,13,14,15,21,22,23,31,32,33,34,35,36,37,41,42,43,44,45,46,50,51,52,53,54,61,62,63,64,65,71,81,82,91";
                var e = 0;
                var c = "";
                var f = b.length;
                if (!/^\d{17}(\d|x)$/i.test(b)) {
                    return {
                        success: false,
                        message: messageMap["idCard"]
                    };
                }
                var l = b.replace(/x$/i, "a");
                var j = l.substr(0, 2);
                if (!(g.indexOf(j) >= 0)) {
                    return {
                        success: false,
                        message: messageMap["idCard"]
                    };
                }
                if (f == 18) {
                    sBirthday = l.substr(6, 4) + "-" + Number(l.substr(10, 2)) + "-" + Number(l.substr(12, 2));
                    var k = new Date(sBirthday.replace(/-/g, "/"));
                    if (sBirthday != k.getFullYear() + "-" + (k.getMonth() + 1) + "-" + k.getDate()) {
                        return {
                            success: false,
                            message: messageMap["idCard"]
                        };
                    }
                    for (var h = 17; h >= 0; h--) {
                        e += Math.pow(2, h) % 11 * parseInt(l.charAt(17 - h), 11);
                    }
                    if (e % 11 != 1) {
                        return {
                            success: false,
                            message: messageMap["idCard"]
                        };
                    }
                }
                return {
                    success: true
                };
            },
            "float": function(value, digit) {
                if (value == null || value === "") {
                    return {
                        success: true
                    };
                }
                var ret = this.number(value);
                if (!ret.success) {
                    return ret;
                }
                if (digit == null || digit === "" || digit == 0) {
                    return {
                        success: true
                    };
                }
                var re = new RegExp("^(?:\\+|\\-)?(?:\\d+\\.?|\\d*\\.\\d{" + digit + "})$");
                if (re.test(value)) {
                    return {
                        success: true
                    };
                }
                return {
                    success: false,
                    message: string.format(messageMap["float"], {
                        digit: digit
                    })
                };
            }
        };
        this.getRule = function(ruleName) {
            return ruleMap[ruleName];
        };
        this.getMessage = function(ruleName) {
            return messageMap[ruleName];
        };
        this.getErrorTipNode = function(inputNode) {
            return dom.g("[for=" + inputNode.id + "]") || dom.g(".errorTip", inputNode.parentNode);
        };
        this.getErrorTipContentNode = function(errorTipNode) {
            return dom.g(".content", errorTipNode) || errorTipNode;
        };
        this.showErrorTip = function(target, errorMessage) {
            var errorTipNode = this.getErrorTipNode(target);
            if (!errorTipNode) {
                return;
            }
            clearAutoCloseTimer(errorTipNode);
            var errorTipContentNode = this.getErrorTipContentNode(errorTipNode);
            if (!errorTipContentNode) {
                return;
            }
            dom.setText(errorTipContentNode, errorMessage);
            dom.show(errorTipNode);
            this.autoClose(target, errorTipNode);
        };
        this.hideErrorTip = function(target) {
            var errorTipNode = this.getErrorTipNode(target);
            if (!errorTipNode) {
                return;
            }
            clearAutoCloseTimer(errorTipNode);
            var errorTipContentNode = this.getErrorTipContentNode(errorTipNode);
            if (!errorTipContentNode) {
                return;
            }
            dom.setText(errorTipContentNode, "");
            dom.hide(errorTipNode);
        };
        this.autoClose = function(target, errorTipNode) {
            var autoCloseSeconds;
            var dataAutoClose = dom.getAttr(errorTipNode, "data-autoclose");
            var me = this;
            if (dataAutoClose && dataAutoClose !== "0" && dataAutoClose !== "false") {
                var dataAutoCloseSeconds = dom.getAttr(errorTipNode, "data-autoclose-seconds");
                if (dataAutoCloseSeconds && lang.isNumber(+dataAutoCloseSeconds)) {
                    autoCloseSeconds = +dataAutoCloseSeconds;
                } else {
                    autoCloseSeconds = me.autoCloseSeconds;
                }
                errorTipNode.autoCloseTimer = setTimeout(function() {
                    me.hideErrorTip(target);
                }, autoCloseSeconds * 1e3);
            }
        };
        this.autoCloseSeconds = 5;
        /**
         * float,2 ——>
         * {
         *    ruleName: 'float',
         *    rulePropertys: [2]
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
            var me = this;
            var isValid = array.each(validators, function(v) {
                var rule = ruleMap[v.ruleName];
                if (!rule) {
                    return true;
                }
                var propertys = v.rulePropertys.slice();
                propertys.unshift(value);
                var ret = rule.apply(ruleMap, propertys);
                if (ret.success) {
                    return true;
                }
                me.showErrorTip(target, ret.message);
                return false;
            });
            if (isValid) {
                me.hideErrorTip(target);
            }
            return isValid;
        };
        /**
         * @param {Object|Array}
         *
         * {
         *      name: 'required',
         *      validate: function(){...},
         *      message: '请输入'
         * }
         */
        this.addValidator = function(v) {
            // 添加的验证规则不能与内置规则重名
            if (lang.isPlainObject(v)) {
                v.validate && !ruleMap[v.name] && (ruleMap[v.name] = v.validate);
                v.message && !messageMap[v.name] && (messageMap[v.name] = v.message);
            } else if (lang.isArray(v)) {
                var _arguments = arguments;
                array.forEach(v, function(_v) {
                    _arguments.callee(_v);
                });
            }
        };
        function clearAutoCloseTimer(errorTipNode) {
            if (errorTipNode.autoCloseTimer) {
                clearTimeout(errorTipNode.autoCloseTimer);
                try {
                    delete errorTipNode.autoCloseTimer;
                } catch (e) {
                    errorTipNode.autoCloseTimer = null;
                }
            }
        }
    }).call(Validator.prototype);
    return new Validator();
});