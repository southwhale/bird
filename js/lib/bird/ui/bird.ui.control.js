/**
 *	Control类,所有控件的基类
 *	遵循OO思想和AMD原则定义
 */

define(function(require) {
	var event = require('bird.event');
	var lang = require('bird.lang');
	var array = require('bird.array');
	var object = require('bird.object');
	var dom = require('bird.dom');
	var util = require('bird.util');
	var string = require('bird.string');
	var request = require('bird.request');
	var controller = require('bird.controller');

	//验证还是放在action model上吧,控件上不再做验证
	function Control(options) {
		this.id = util.uuid();
		this.state = null; //'disabled' or 'readonly' and so on
		this.options = options;
		lang.isPlainObject(options) && object.extend(this, options);
		this.summary = 'Control[' + this.type + '|' + this.id + ']';
		this.rootElementId = this.type + '_' + this.id;
		this.rootElement = null;
		this.inputNodes = [];
		this.inputNodeMap = {};
		//解析模板占位符时用来存储变量和元素的映射
		this.propertyNodeMap = {};
		this.childControls = [];
		this.childControlMap = {};
		this.parentControl = null;
		this.lifePhase = this.LifeCycle.NEW;
	}

	Control.getControl = function(controlId) {
		if (lang.isHtmlElement(controlId)) {
			while (controlId && !controlId.getAttribute('control')) {
				controlId = controlId.parentNode;
			}
			controlId = controlId.getAttribute('control');
		}
		if (!controlId) {
			return;
		}
		//return this.controlMap[controlId];
		//直接调Control,避免一级级回溯
		return Control.prototype.controlMap[controlId];
	};

	(function() {
		var TPL_URL = './js/lib/bird/ui/tpl/bird.ui.html';

		var handleMap = {
			'class': function(node, newClass, oldClass) {
				dom.removeClass(node, oldClass);
				dom.addClass(node, newClass);
			},
			html: function(node, v) {
				node.innerHTML = v;
			},
			value: function(node, v) {
				node.value = v;
			},
			disabled: function(node, v) {
				node.setAttribute('disabled', v);
			},
			readonly: function(node, v) {
				node.setAttribute('readonly', v);
			},
			checked: function(node, v) {
				node.setAttribute('checked', v);
			}
		};

		this.type = 'Control';

		this.TPL_URL = TPL_URL;

		//当前Control的模板
		this.tpl = null;

		//所有Control的模板,把所有Control模板存储在这,避免每个Control都发送一次http请求
		this.tplCache = null;

		this.controlMap = {};

		this.LifeCycle = {
			'NEW': 0,
			'INITED': 1,
			'RENDERED': 2,
			'DESTROYED': 3
		};

		this.init = function(argument) {
			this._initRootElement();
			this._initSetters();
			this._initBidirectionBind();
			Control.prototype.controlMap[this.id] = this;
			this.lifePhase = this.LifeCycle.INITED;
		};

		this._initSetters = function(){
			var me = this;
			object.forEach(this.propertyNodeMap, function(arr, property){
				me.setSetter(property);
			});
		};


		this.setSetter = function(propertyName) {

			this['set' + string.capitalize(propertyName)] = function(value) {
				if (this[propertyName] === value) {
					return;
				}
				var oldValue = this[propertyName];
				this[propertyName] = value;

				var arr = this.propertyNodeMap[propertyName];
				var rootElement = this.rootElement;
				array.forEach(arr, function(obj) {
					var node = dom.g(obj.selector, rootElement);
					handleMap[obj.type](node, value, oldValue);
					node = null;
				});
				arr = null;
				rootElement = null;
			};
		};

		this.setGetter = function(propertyName) {
			this['get' + string.capitalize(propertyName)] = function() {
				return this[propertyName];
			};
		};

		this.setAccessor = function(propertyName) {
			this.setSetter(propertyName);
			this.setGetter(propertyName);
		};


		//控件上所有dom节点的事件都委托到rootElement
		this.bindEvent = function() {

		};

		this.clearEvent = function() {
			event.destroy(this.rootElement);
		};

		this.clearChildControlsEvent = function() {
			array.forEach(this.childControls, function(childControl) {
				childControl.clearEvent();
			});
		};


		this.destroy = function(argument) {
			array.forEach(this.childControls, function(child) {
				child.destroy();
			});

			this.clearEvent();

			this.childControls = null;
			this.childControlMap = null;
			dom.removeNode(this.rootElement);
			this.rootElement = null;
			this.parentControl = null;
			this.inputNodes = null;
			this.inputNodeMap = null;

			this.lifePhase = this.LifeCycle.DESTROYED;
		};

		this.isHidden = function() {
			return dom.getStyle(this.rootElement, 'display') === 'none';
		};

		this.show = function() {
			this.rootElement.style.display = '';
		};

		this.hide = function() {
			this.rootElement.style.display = 'none';
		};

		this.toggle = function() {
			this.isHidden() ? this.show() : this.hide();
		};

		this.setState = function(state, value) {
			if (lang.isUndefined(value) || value === 'true' || value === true) {
				value = 'true';
			} else if (value === 'false' || value === false) {
				value = 'false';
				state = null;
			}
			this.state = state;
			this.rootElement.setAttribute(this.state, value);
		};


		this.render = function() {
			if (this.lifePhase >= this.LifeCycle.RENDERED) {
				return;
			}

			this.lifePhase < this.LifeCycle.INITED && this.init();

			this.beforeRender();
			this.repaint();
			//解析子控件
			this._parseChildControl();
			this.afterRender();

			this.bindEvent();
			this.lifePhase = this.LifeCycle.RENDERED;
		};

		//@param {Control|HtmlElement} parent
		this.appendTo = function(parent) {
			if (parent instanceof Control) {
				parent.addChildControl(this);
				parent.rootElement.appendChild(this.rootElement);
				return;
			}

			if (lang.isHtmlElement(parent)) {
				parent.appendChild(this.rootElement);
			}
		};


		this.getRoot = function() {
			return this.rootElement;
		};

		this.beforeRender = function() {

		};

		this.afterRender = function() {

		};


		this.repaint = function() {
			if (this.lifePhase >= this.LifeCycle.DESTROYED) {
				return;
			}
			this.rootElement.innerHTML = string.format(this.tpl, this);

			this.initCss();
		};

		this._parseTplVariable = function() {
			var propNodeMap = this.propertyNodeMap;
			//先把有占位符的模板载入rootElement,待解析完再清空rootElement
			this.rootElement.innerHTML = this.tpl;
			dom.iterateDomTree(this.rootElement, function(node) {
				if (!lang.isHtmlElement(node)) {
					return;
				}
				var className = node.className;
				var innerHtml = node.innerHTML;
				var disabledAttr = node.getAttribute("disabled");
				var readonlyAttr = node.getAttribute("readonly");
				var checkedAttr = node.getAttribute("checked");
				var valueAttr = node.getAttribute("value");

				var classVariable = parsePlaceholderVariable(className);
				var innerHtmlVariable = parsePlaceholderVariable(innerHtml);
				var disabledAttrVariable = parsePlaceholderVariable(disabledAttr);
				var readonlyAttrVariable = parsePlaceholderVariable(readonlyAttr);
				var checkedAttrVariable = parsePlaceholderVariable(checkedAttr);
				var valueAttrVariable = parsePlaceholderVariable(valueAttr);

				var selector = node.id;
				if(!selector){
					var classes = className.split(/\s+/);
					selector = classes && classes.length ? ('.' + classes[0]) : '';
				}else{
					selector = '#' + node.id;
				}

				if (classVariable) {
					propNodeMap[classVariable] = propNodeMap[classVariable] || [];
					propNodeMap[classVariable].push({
						type: 'class',
						selector: selector
					});
				}


				if (innerHtmlVariable) {
					propNodeMap[innerHtmlVariable] = propNodeMap[innerHtmlVariable] || [];
					propNodeMap[innerHtmlVariable].push({
						type: 'html',
						selector: selector
					});
				}


				if (disabledAttrVariable) {
					propNodeMap[disabledAttrVariable] = propNodeMap[disabledAttrVariable] || [];
					propNodeMap[disabledAttrVariable].push({
						type: 'disabled',
						selector: selector
					});
				}


				if (readonlyAttrVariable) {
					propNodeMap[readonlyAttrVariable] = propNodeMap[readonlyAttrVariable] || [];
					propNodeMap[readonlyAttrVariable].push({
						type: 'readonly',
						selector: selector
					});
				}


				if (checkedAttrVariable) {
					propNodeMap[checkedAttrVariable] = propNodeMap[checkedAttrVariable] || [];
					propNodeMap[checkedAttrVariable].push({
						type: 'checked',
						selector: selector
					});
				}


				if (valueAttrVariable) {
					propNodeMap[valueAttrVariable] = propNodeMap[valueAttrVariable] || [];
					propNodeMap[valueAttrVariable].push({
						type: 'value',
						node: node
					});
				}


			});

			dom.empty(this.rootElement);
		};


		this.delegate = function(selector, eventType, handle) {
			var me = this;
			if (lang.isFunction(handle)) {
				handle.wrappedHandle = function(e) {
					e.control = me;
					handle.call(this, e);
				};
			}
			event.delegate(selector, eventType, handle.wrappedHandle, this.rootElement);
		};

		this.on = function(el, eventType, handle) {
			var me = this;
			if (lang.isFunction(handle)) {
				handle.wrappedHandle = function(e) {
					e.control = me;
					handle.call(this, e);
				};
			}
			event.on(el, eventType, handle.wrappedHandle);
		};

		this.off = function(el, eventType, handle) {
			event.off(el, eventType, handle && handle.wrappedHandle || handle);
		};

		//@param {Control|String}
		this.addChildControl = function(child) {
			if (lang.isString(child)) {
				child = Control.getControl(child);
			}

			if (!child instanceof Control) {
				return;
			}

			var parent = child.parentControl;
			if (parent) {
				delete parent.childControlMap[child.id];
				array.remove(child, parent.childControls);
			}

			this.childControls.push(child);
			this.childControlMap[child.id] = child;
			child.parentControl = this;
		};
		//@param {Control|String}
		this.setParentControl = function(parent) {
			if (lang.isString(parent)) {
				parent = Control.getControl(parent);
			}

			if (!parent instanceof Control) {
				return;
			}
			parent.addChildControl(this);
		};


		this.getControl = Control.getControl;

		this._loadTpl = function() {
			if (this.tpl) {
				return;
			}
			var selector = 'div.bird-ui-' + this.type.toLowerCase();
			if (this.tplCache) {
				this.constructor.prototype.tpl = dom.extractHtmlBySelector(selector, Control.prototype.tplCache);
				return;
			}

			request.syncLoad(TPL_URL, function(data) {
				Control.prototype.tplCache = data;
			});
			this.constructor.prototype.tpl = dom.extractHtmlBySelector(selector, this.tplCache);
		};

		this._initRootElement = function() {
			this._loadTpl();

			var div = document.createElement('div');
			div.id = this.rootElementId;
			div.setAttribute('control', this.id);
			this.rootElement = div;
			div = null;

			this._parseTplVariable();
		};


		this.initCss = function() {

		};

		this.centerPosition = function() {
			var left = this.left,
				top = this.top,
				width = this.width,
				height = this.height;

			if (lang.isUndefined(width)) {
				width = this.rootElement.clientWidth;
			} else {
				this.rootElement.style.width = width + 'px';
			}

			if (height) {
				this.rootElement.style.height = height + 'px';
			}

			if (lang.isUndefined(left)) {
				left = (dom.getViewWidth(this.rootElement) - width) / 2;
			}

			if (lang.isUndefined(top)) {
				top = dom.getViewHeight(this.rootElement) / 2 - this.rootElement.clientHeight;
				top < 0 && (top = 0);
			}

			this.rootElement.style.left = left + 'px';
			this.rootElement.style.top = top + 'px';
		};


		this._initBidirectionBind = function() {

		};


		this._parseChildControl = function() {
			var me = this;
			dom.iterateDomTree(this.rootElement, function(childNode) {
				if (lang.isHtmlElement(childNode) && childNode.tagName.toLowerCase() === 'bird') {
					var configStr = childNode.getAttribute('ui');
					var configMap = parseConfigStringToMap(configStr, controller.currentAction.model);
					var childControlClass = require('./bird.ui.' + configMap.type.toLowerCase());
					//子控件应共享父控件的options,父控件可以影响子控件的options
					lang.isPlainObject(me.options) && object.extend(configMap, me.options);
					var childControl = new childControlClass(configMap);
					childControl.render();
					me.addChildControl(childControl);
					dom.replaceNode(childNode, childControl.getRoot());
				}
			});
			delete this.options;
		};


		function parseConfigStringToMap(s, ctx) {
			var configArr = s.split(';');
			var configMap = {};
			array.forEach(configArr, function(configStr) {
				if (!configStr) {
					return;
				}
				var kvarr = configStr.split(':');
				var k = string.trim(kvarr[0]);
				var v = string.trim(kvarr[1]);
				k === 'type' && (v = string.capitalize(v));

				if (v.indexOf('@') === 0) { //@variable 模块中的变量variable
					v = lang.getVariableInContext(v.substring(1), ctx);
				} else if (v.indexOf('&') === 0) { //&variable 全局变量variable
					v = lang.getGlobalVariable(v.substring(1));
				} else if (v.indexOf('*') === 0) { //*variable 先在模块中查找变量variable,找不到的话再找全局变量variable
					v = lang.getVariableInContext(v.substring(1), ctx);
					if (!lang.isNotEmpty(v)) {
						v = lang.getGlobalVariable(v.substring(1));
					}
				}

				lang.isNotEmpty(k) && lang.isNotEmpty(v) && (configMap[k] = v);
			});
			return configMap;
		}


		function parsePlaceholderVariable(text) {
			var ret = /^\s*\{\{\s*([^{}]+)\s*\}\}/.exec(text);
			return ret && ret[1];
		};


	}).call(Control.prototype);

	return Control;
});