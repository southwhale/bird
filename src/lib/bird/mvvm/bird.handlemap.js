define(function(require) {
	var dom = require('bird.dom');
	var lang = require('bird.lang');
	var array = require('bird.array');
	var event = require('bird.event');
	var filterHelper = require('./bird.filter');

	function HandleMap() {
		this.eventMap = {};
	}

	(function() {

		this.htmlText = function(node, selector, variable, filter) {
			return filter === 'text' ? function(value) {
				value = filter && !/^(?:html|text)$/i.test(filter) ? filterHelper.filter(value, filter) : value;
				dom.setText(node, value);
			} : function(value) {
				value = filter && !/^(?:html|text)$/i.test(filter) ? filterHelper.filter(value, filter) : value;
				dom.setHtml(node, value);
			};
		};
		this.value = function(node, selector, variable, filter) {
			return function(value, oldValue, ctx) {
				//input控件不应有过滤功能,会引起较大的副作用
				//value = filter ? filterHelper.filter(value, filter) : value;

				//这么做是避免重复赋值引起多触发一次onpropertychange事件
				if (ctx === node) {
					return;
				}

				dom.setValue(node, value);
			}
		};
		this.valueVariable = function(node, selector, variable, filter) {
			return function(value, oldValue, ctx) {
				if (ctx === node) {
					return;
				}

				value = value.replace(/,/g, '|');
				var regexp = new RegExp('^(?:' + value + ')$');
				if (/^input$/i.test(node.tagName)) {
					if (regexp.test(node.value)) {
						node.checked = true;
					} else {
						node.checked = false;
					}
				} else if (/^select$/i.test(node.tagName)) {
					var options = dom.getOptionsOfSelect(node);
					array.forEach(options, function(option) {
						if (regexp.test(option.value)) {
							option.selected = true;
						} else {
							option.selected = false;
						}
					});
				}
			}
		};
		this.disabled = function(node, selector, variable, filter) {
			return function(value) {
				node.disabled = !!value;
			};
		};
		this.readonly = function(node, selector, variable, filter) {
			return function(value) {
				node.readOnly = !!value;
			};
		};
		/*this.disabled = function(node, selector, variable, filter) {
			return function(value) {
				//node.disabled = !!value;
				value ? dom.setAttr(node, 'disabled', 'disabled') : dom.removeAttr(node, 'disabled');
				
			};
		};
		this.readonly = function(node, selector, variable, filter) {
			return function(value) {
				value ? dom.setAttr(node, 'readonly', 'readonly') : dom.removeAttr(node, 'readonly');
			};
		};*/
		this.checked = function(node, selector, variable, filter) {
			return function(value) {
				node.checked = !!value;
			};
		};
		this.selected = function(node, selector, variable, filter) {
			return function(value) {
				node.selected = !!value;
			};
		};
		this.placeholder = function(node, selector, variable, filter) {
			return function(value) {
				dom.setAttr(node, 'placeholder', value);
			};
		};
		this['for'] = function(node, selector, variable, filter) {
			return function(value) {
				dom.setAttr(node, 'for', value);
			};
		};
		this.alt = function(node, selector, variable, filter) {
			return function(value) {
				dom.setAttr(node, 'alt', value);
			};
		};
		this.style = function(node, selector, variable, filter, key) {
			return key ? function(value) {
				value = filter ? filterHelper.filter(value, filter) : value;
				node.style[key] = value;
			} : function(value) {
				dom.setCssText(node, value);
			};
		};
		this['class'] = function(node, selector, variable, filter) {
			return function(value, oldValue) {
				oldValue && dom.removeClass(node, oldValue);
				value && dom.addClass(node, value);
			};
		};
		this.event = function(node, selector, variable, filter, eventType) {
			eventMap = this.eventMap;
			var eventHandleKey = selector + '-' + eventType;
			return function(value) {
				eventMap[eventHandleKey] = value;
			};
		};
		this.customAttr = function(node, selector, variable, filter, key) {
			return function(value) {
				value = filter ? filterHelper.filter(value, filter) : value;
				dom.setAttr(node, key, value);
			};
		};
		//默认的处理函数
		this['default'] = function(node, selector, variable, filter, type) {
			return function(value) {
				dom.setAttr(node, type, value);
			};
		};
	}).call(HandleMap.prototype);



	return new HandleMap();
});