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

	var globalContext = require('./bird.globalcontext');
	var TplParser = require('./bird.tplparser');
	var filterHelper = require('./bird.filter');
	var validator = require('./bird.validator');

	function DataBind() {
		this.tplParser = new TplParser();
		this.handleMap = {};
		this.eventNodes = [];
		this.typeHandleMap = require('./bird.handlemap');
	}

	(function() {


		//第一步：解析原始模板中的变量信息,并生成处理后的模板
		this.parseTpl = function(str){
			if(!str || this.tplParser.parsedTpl){
				return;
			}
			this.tplParser.parseTpl(str);
		};

		//第二步：将action的model填充进模板,并做首次渲染
		this.fillTpl = function (model, actionId, container) {
			var parsedInfoCache = this.tplParser.parsedInfoCache;
			var str = this.tplParser.parsedTpl;
			var me = this;
			//var regMap = {};
			object.forEach(parsedInfoCache, function (parsedInfo) {
				object.forEach(parsedInfo, function (val, key) {
					if(lang.isPlainObject(val) && val.variable){
						var regStr = '\\{\\{\\s*' + val.variable + '\\s*(?:\\|[^{}]+)?' + '\\}\\}';
						var value = model.get(val.variable);
						if(lang.isUndefinedOrNull(value)){
							value = '';
							var lastDotIndex = val.variable.lastIndexOf('.');
							if(lastDotIndex === -1){
								model[val.variable] = value;
							}else{
								var obj = lang.getObjectInContext(val.variable.substring(0, lastDotIndex), model);
								obj[val.variable.substring(lastDotIndex + 1, val.variable.length)] = value;
								obj = null;
							}
						}

						if(/^event$/i.test(key)){
							var selector = parsedInfo.id ? '#' + parsedInfo.id : parsedInfo.tagName + '[bindid=' + parsedInfo.bindId + ']';
							var eventHandle = function(e){
								var handle = me.typeHandleMap.eventMap[selector] || lang.noop;
								handle.call(e.target, e);
							};
							if(!me.typeHandleMap.eventMap[selector]){
								me.typeHandleMap.eventMap[selector] = lang.isFunction(value) ? value : lang.noop;
							}
							me.delegateEventOnSelector(selector, val.key, eventHandle, container);
							regStr = 'on' + val.key + '\=(["\'])\\s*' + regStr + '\\s*\\1';
							value = '';
						}

						if(value === ''){
							if(/^(?:readonly|disabled|checked|selected)$/i.test(key)){
								regStr = key + '\=(["\'])\\s*' + regStr + '\\s*\\1';
							}else if(/^style$/i.test(key) && val.key){
								regStr = val.key + '\:\\s*' + regStr + '\\s*;?';
							}/*else if(/^event$/i.test(key) && val.key){
								regStr = 'on' + val.key + '\=(["\'])\\s*' + regStr + '\\s*\\1';
							}*/
						}
						
						var reg = new RegExp(regStr, 'g');
						
						//input控件不应支持过滤器的功能
						if(val.filter && !/^(?:value|htmlText)$/i.test(key) && value){
							value = filterHelper.filter(value, val.filter);
						}
						str = str.replace(reg, value);
					}else if(lang.isArray(val)){
						var _arguments = arguments;
						array.forEach(val, function(_val){
							_arguments.callee(_val, key);
						});
					}
				});
			});
			
			return str;
		};
		
		//第三步：绑定模板变量到对应的处理函数
		this.bind = function(model, container){
			var me = this;
			container = container || document;
			object.forEach(this.tplParser.parsedInfoCache, function (info) {
				var selector = info.id ? ('#' + info.id) : (info.tagName + '[bindid=' + info.bindId + ']');
				var node = dom.g(selector, container);

				object.forEach(info, function (val, key) {
					if(/id|bindId|tagName/.test(key)){
						return;
					}
					me._bindHandleByType(val, key, node, selector);
				});

				if(/^(?:input|select)$/i.test(info.tagName) && lang.isPlainObject(info.value || info.valueVariable)){
					me._addEventOnInput(node, selector, info.value || info.valueVariable, model, container);
				} else if(/^textarea$/i.test(info.tagName) && lang.isPlainObject(info.value || info.htmlText)){
					me._addEventOnInput(node, selector, info.value || info.htmlText, model, container);
				}
			});
		};

		/**
		 * IE不支持onchange和oninput,但IE有onpropertychange
		 * onchange需要失去焦点才触发,oninput在输入时就触发
		 */
		this._addEventOnInput = function(node, selector, value, model, container){
			var attrVariable = value.variable,
				filter = value.filter,
				me = this,
				validators = [],
				eventType;

			var isChkboxOrRadio = /^(?:checkbox|radio)$/i.test(node.type);
			var isSelect = /^select$/i.test(node.tagName);

			if(isChkboxOrRadio || isSelect){
				//IE用click模拟change
				eventType = 'onchange' in node.ownerDocument ? 'change' : 'click';
				this.delegateEventOnSelector(selector, eventType, checkedInputChangeHandle, container);
				return;
			}
			//input类型控件(包括textarea)的过滤器字段实际是验证器字段
			//即可输入控件的filter字段是验证器字段,不可输入控件则是过滤器字段
			if(filter){
				var validatorStrArr = filter.split(/\s+/);
				array.forEach(validatorStrArr, function(str){
					var arr = str.split(',');
					var vname = arr[0];
					var rule = validator.getRule(vname);
					if(rule){
						var args = arr.slice(1);
						validators.push((function(){
							return function(value){
								args.unshift(value);
								validator.clearMessageStack();
								return rule.apply(null, args);
							};
						})());
					}
				});
			}

			eventType = 'onpropertychange' in node 
				? this.bindEventOnNode(node, 'propertychange', textInputChangeHandle)
				: this.delegateEventOnSelector(selector, 'input', textInputChangeHandle, container);

			this.eventNodes.push(node);


			function textInputChangeHandle(e) {
				e.stopPropagation();
				if(e.propertyName && e.propertyName !== 'value'){
					return;
				}
				
				var target = e.target;
				var value = target.value;
				if(!me.validate(validators, target, value)){
					return;
				}

				model.set(attrVariable, value, me, target);
			}

			function checkedInputChangeHandle(e){
				e.stopPropagation();
				
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


		this._bindHandleByType = function (variableInfo, type, node, selector) {
			var handleMap = this.handleMap;
			var typeHandleMap = this.typeHandleMap;
			if(lang.isArray(variableInfo)){
				array.forEach(variableInfo, function(info){
					var variable = info.variable;
					var arr = handleMap[variable] = handleMap[variable] || [];
					arr.push(typeHandleMap[type](node, selector , variable, info.filter, info.key));
				});
			}else if(lang.isPlainObject(variableInfo)){
				var variable = variableInfo.variable;
				var arr = handleMap[variable] = handleMap[variable] || [];
				//textarea控件较特殊,即使<textarea>{{variable}}</textarea>定义变量,也采用类型为'value'的处理函数
				if(/^textarea$/i.test(node.tagName)){
					type = 'value';
					//奇葩的IE8,textarea监听输入事件,奇数位的字符总是监听不到,偶数位的字符则可以监听到
					//解决该bug的方法同样也很奇葩
					if(browser.isIE8()){
						node.style.padding = '0';
					}
				}
				arr.push((typeHandleMap[type] || typeHandleMap['default'])(node, selector, variable, variableInfo.filter, type));
			}
		};

		this.delegateEventOnSelector = function(selector, type, handle, context) {
			event.delegate(selector, type, handle, context);
		};

		this.bindEventOnNode = function(node, type, handle){
			event.on(node, type, handle);
		};


		//第一个参数为双向绑定的变量,最后一个参数为context,其余参数为传给handle的数据
		this.callVariableHandle = function(variable) {
			var handles = this.handleMap[variable];
			if (!handles || !handles.length) {
				return;
			}
			var _arguments = arguments;
			var argslen = _arguments.length;
			var context = _arguments[argslen - 1];
			var data = Array.prototype.slice.call(_arguments, 1, argslen - 2);
			array.forEach(handles, function(handle) {
				handle.apply(context, data);
			});
		};

		this.validate = function(validators, target, value){
			var errorTipNode = target.id ? dom.g('[for=' + target.id + ']', target.parentNode) : dom.g('.errorTip', target.parentNode);
			if(!array.each(validators, function(v){
				return v(value);
			})){
				errorTipNode && dom.setText(errorTipNode, validator.getMessageStack().join());
				return false;
			}else{
				errorTipNode && dom.setText(errorTipNode, '');
			}

			return true;
		};


		this.destroy = function (container, deepDestroy) {
			deepDestroy && this.tplParser.destroy();
			object.forEach(this.handleMap, function(v, k, map){
				v.length = 0;
				delete map[k];
			});
			object.forEach(this.typeHandleMap.eventMap, function(v, k, map){
				delete map[k];
			});
			event.destroy(container);
			array.forEach(this.eventNodes, function(node){
				event.destroy(node);
			});
		};


	}).call(DataBind.prototype);

	return DataBind;
});