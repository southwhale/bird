/**
 * 该模块用来实现双向绑定
 * 三步完成绑定：
 * 1.parseTpl
 * 2.fillTpl
 * 3.bind
 * 针对input控件要分别区分对待：输入框类型(text、password、email等),选择器类型(checkbox、radio、select)
 * select也当作input控件处理,对于选择器类型,对其做双向绑定,应使用特定的属性：valueVariable,对于输入框类型则可直接使用value
 * 要这么区别对待的原因: checkbox和radio的value属性通常作为选项被赋予固定的值,为了方便处理select也使用相同的方法
 * 示例：
 * <input type="checkbox" name="myckbox" valueVariable="{{testVariable}}" value="11">
 * <input type="radio" name="myradio" valueVariable="{{testVariable}}" value="a">
 * <select valueVariable="{{testVariable}}">
 *     <option value="a">a</option>
 *     <option value="b">b</option>
 *     <option value="c">c</option>
 * </select>
 */
define(function(require) {

	var dom = require('bird.dom');
	var lang = require('bird.lang');
	var array = require('bird.array');
	var event = require('bird.event');
	var object = require('bird.object');
	var string = require('bird.string');
	var util = require('bird.util');
	var browser = require('bird.browser');
	var request = require('bird.request');
	var LruCache = require('bird.lrucache');


	var globalContext = require('./bird.globalcontext');
	var TplParser = require('./bird.tplparser');
	var filterHelper = require('./bird.filter');
	var validator = require('./bird.validator');

	var lruCache = new LruCache();

	function DataBind() {
		this.tplParser = new TplParser();
		this.typeHandleMap = require('./bird.handlemap');
		this.eventBindedNodes = [];
	}

	(function() {


		//第一步：解析原始模板中的变量信息,并生成处理后的模板
		this.parseTpl = function(str) {
			if (!str || this.tplParser.parsedTpl) {
				return;
			}
			this.tplParser.parseTpl(str);
		};

		//第二步：将action的model填充进模板,并做首次渲染
		this.fillTpl = function(model, actionId) {
			var parsedInfoCache = this.tplParser.parsedInfoCache;
			var str = this.tplParser.parsedTpl;
			var me = this;

			object.forEach(parsedInfoCache, function(parsedInfo) {
				object.forEach(parsedInfo, function(val, key) {
					if (lang.isPlainObject(val) && val.variable) {
						var regStr = "\\{\\{\\s*" + val.variable + "\\s*(?:\\|[^{}]+)?" + "\\}\\}";
						var value = '';
						if (val.filter !== "include") {
							value = model.get(val.variable);
						}

						if (lang.isUndefinedOrNull(value)) {
							value = '';
							var lastDotIndex = val.variable.lastIndexOf('.');
							if (lastDotIndex === -1) {
								model[val.variable] = value;
							} else {
								var obj = lang.getObjectInContext(val.variable.substring(0, lastDotIndex), model);
								obj[val.variable.substring(lastDotIndex + 1, val.variable.length)] = value;
								obj = null;
							}
						}

						if (/^event$/i.test(key)) {
							regStr = 'on' + val.key + '\=(["\'])\\s*' + regStr + '\\s*\\1';
							value = '';
						}

						if (value === '') {
							if (/^(?:readonly|disabled|checked|selected)$/i.test(key)) {
								regStr = key + '\=(["\'])\\s*' + regStr + '\\s*\\1';
							} else if (/^style$/i.test(key) && val.key) {
								regStr = val.key + '\:\\s*' + regStr + '\\s*;?';
							}
						}

						var reg = new RegExp(regStr, 'g');

						//input控件不应支持过滤器的功能
						if (val.filter && !/^(?:value|htmlText)$/i.test(key) && value) {
							value = filterHelper.filter(value, val.filter);
						}
						str = str.replace(reg, value);
					} else if (lang.isArray(val)) {
						var _arguments = arguments;
						array.forEach(val, function(_val) {
							_arguments.callee(_val, key);
						});
					}
				});
			});

			return str;
		};

		//第三步：绑定模板变量到对应的处理函数
		this.bind = function(model, watcher, container, dataBinds, actionId) {
			var me = this;
			container = container || document;
			object.forEach(this.tplParser.parsedInfoCache, function(info) {
				var selector = info.id ? ('#' + info.id) : (info.tagName + '[bindid=' + info.bindId + ']');
				var node = dom.g(selector, container);

				object.forEach(info, function(val, key) {
					if (/id|bindId|tagName/.test(key)) {
						return;
					}
					if (val.filter === "include") {
						var cachedTpl = lruCache.getValue(val.variable);
						if (cachedTpl) {
							var dataBind = doInclude(node, cachedTpl, model, actionId);
							dataBind && dataBinds.push(dataBind);
						} else {
							request.syncLoad(val.variable, function(data) {
								var dataBind = doInclude(node, data, model, actionId);
								dataBind && dataBinds.push(dataBind);
								lruCache.add(val.variable, data);
							});
						}
						return;
					}


					if (lang.isPlainObject(val) && val.variable) {
						var value = model.get(val.variable);
						if (/^event$/i.test(key)) {
							var eventHandleKey = selector + '-' + val.key;
							var eventHandle = function(e) {
								var handle = me.typeHandleMap.eventMap[eventHandleKey] || lang.noop;
								handle.call(this, e);
							};
							if (!me.typeHandleMap.eventMap[eventHandleKey]) {
								me.typeHandleMap.eventMap[eventHandleKey] = lang.isFunction(value) ? value : lang.noop;
							}
							event.on(node, val.key, eventHandle);
							array.pushUniqueInArray(node, me.eventBindedNodes);
						}
						me._bindHandleByType(watcher, val, key, node, selector);

					} else if (lang.isArray(val)) {
						var _arguments = arguments;
						array.forEach(val, function(_val) {
							_arguments.callee(_val, key);
						});
					}
				});

				if (/^select$/i.test(info.tagName) && lang.isPlainObject(info.valueVariable)) {
					me._addEventOnInput(node, info.valueVariable, model);
				} else if (/^input$/i.test(info.tagName)) {
					if (/^(?:checkbox|radio)$/i.test(node.type) && lang.isPlainObject(info.valueVariable)) {
						me._addEventOnInput(node, info.valueVariable, model);
					} else if (lang.isPlainObject(info.value)) {
						me._addEventOnInput(node, info.value, model);
					}
				} else if (/^textarea$/i.test(info.tagName) && lang.isPlainObject(info.value || info.htmlText)) {
					me._addEventOnInput(node, info.value || info.htmlText, model);
				}
			});
		};

		/**
		 * IE不支持onchange和oninput,但IE有onpropertychange
		 * onchange需要失去焦点才触发,oninput在输入时就触发
		 */
		this._addEventOnInput = function(node, value, model) {
			var attrVariable = value.variable,
				filter = value.filter,
				me = this,
				validators = [];

			array.pushUniqueInArray(node, this.eventBindedNodes);

			var isChkboxOrRadio = /^(?:checkbox|radio)$/i.test(node.type);
			var isSelect = /^select$/i.test(node.tagName);

			if (isChkboxOrRadio || isSelect) {
				event.on(node, 'change', checkedInputChangeHandle);
				return;
			}
			//input类型控件(包括textarea)的过滤器字段实际是验证器字段
			//即可输入控件的filter字段是验证器字段,不可输入控件则是过滤器字段
			if (filter) {
				var validatorStrArr = filter.split(/\s+/);
				array.forEach(validatorStrArr, function(str) {
					var arr = str.split(',');
					var vname = arr[0];
					var rule = validator.getRule(vname);
					if (rule) {
						var args = arr.slice(1);
						validators.push((function() {
							return function(value) {
								args.unshift(value);
								validator.clearMessageStack();
								return rule.apply(null, args);
							};
						})());
					}
				});
			}

			event.on(node, 'change', textInputChangeHandle);

			function textInputChangeHandle(e) {
				if (e.propertyName && e.propertyName !== 'value') {
					return;
				}

				var target = e.target;
				var value = target.value;
				if (!me.validate(validators, target, value)) {
					return;
				}

				model.set(attrVariable, value, me, target);
			}

			function checkedInputChangeHandle(e) {
				var target = e.target;
				var value;
				if (/^input$/i.test(target.tagName)) {
					if (/^checkbox$/i.test(target.type)) {
						value = dom.getCheckboxValues(target);
						value = value.length ? value.join(',') : '';
					} else if (/^radio$/i.test(target.type)) {
						value = dom.getRadioValue(target);
					}
				} else if (/^select$/i.test(target.tagName)) {
					value = dom.getSelectedOptionValues(target);
					value = value.length ? value.join(',') : '';
				}

				model.set(attrVariable, value, me, target);
			}
		};


		this._bindHandleByType = function(watcher, variableInfo, type, node, selector) {
			var typeHandleMap = this.typeHandleMap;
			if (lang.isPlainObject(variableInfo)) {
				var variable = variableInfo.variable;
				//textarea控件较特殊,即使<textarea>{{variable}}</textarea>定义变量,也采用类型为'value'的处理函数
				if (/^textarea$/i.test(node.tagName)) {
					type = 'value';
				}
				watcher.subscribe(variable, (typeHandleMap[type] || typeHandleMap['default']).call(typeHandleMap, node, selector, variable, variableInfo.filter, type === 'event' ? variableInfo.key : type));
			}
		};


		this.validate = function(validators, target, value) {
			var errorTipNode = target.id ? dom.g('[for=' + target.id + ']', target.parentNode) : dom.g('.errorTip', target.parentNode);
			if (!array.each(validators, function(v) {
				return v(value);
			})) {
				errorTipNode && dom.setText(errorTipNode, validator.getMessageStack().join());
				return false;
			} else {
				errorTipNode && dom.setText(errorTipNode, '');
			}

			return true;
		};


		this.destroy = function(deepDestroy) {
			deepDestroy && this.tplParser.destroy();
			object.forEach(this.typeHandleMap.eventMap, function(v, k, map) {
				delete map[k];
			});
			array.forEach(this.eventBindedNodes, function(node) {
				event.destroy(node);
			});
			this.eventBindedNodes.length = 0;
		};


		function doInclude(elem, tplContent, model, actionId) {
			var html;
			if (elem) {
				if (/\{\{[^{}]+\}\}/.test(tplContent)) {
					var dataBind = new DataBind();
					dataBind.parseTpl(tplContent);
					html = dataBind.fillTpl(model, actionId);
				} else {
					html = tplContent;
				}

				dom.setHtml(elem, html);
			}
			return dataBind;
		}


	}).call(DataBind.prototype);

	return DataBind;
});