define(function(require) {
	var dom = require('bird.dom');
	var lang = require('bird.lang');
	var array = require('bird.array');
	var event = require('bird.event');
	var globalContext = require('./bird.globalcontext');
	var filterHelper = require('./bird.filter');

	var handleMap = {
		htmlText: function(node, selector, variable, filter) {
			return filter === 'text' ? function(value) {
				value = filter && !/^(?:html|text)$/i.test(filter) ? filterHelper.filter(value, filter) : value;
				dom.setText(node, value);
			} : function(value) {
				value = filter && !/^(?:html|text)$/i.test(filter) ? filterHelper.filter(value, filter) : value;
				dom.setHtml(node, value);
			};
		},
		value: function(node, selector, variable, filter) {
			return function(value) {
				//input控件不应有过滤功能,会引起较大的副作用
				//value = filter ? filterHelper.filter(value, filter) : value;

				//这么做是避免重复赋值引起多触发一次onpropertychange事件
				if (this === node) {
					return;
				}

				dom.setValue(node, value);
			}
		},
		valueVariable: function(node, selector, variable, filter) {
			return function(value) {
				if (this === node) {
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
		},
		disabled: function(node, selector, variable, filter) {
			return function(value) {
				node.disabled = !!value;
			};
		},
		readonly: function(node, selector, variable, filter) {
			return function(value) {
				node.readonly = !!value;
			};
		},
		checked: function(node, selector, variable, filter) {
			return function(value) {
				node.checked = !!value;
			};
		},
		selected: function(node, selector, variable, filter) {
			return function(value) {
				node.selected = !!value;
			};
		},
		placeholder: function(node, selector, variable, filter) {
			return function(value) {
				dom.setAttr(node, 'placeholder', value);
			};
		},
		'for': function(node, selector, variable, filter) {
			return function(value) {
				dom.setAttr(node, 'for', value);
			};
		},
		alt: function(node, selector, variable, filter) {
			return function(value) {
				dom.setAttr(node, 'alt', value);
			};
		},
		style: function(node, selector, variable, filter, key) {
			return key ? function(value) {
				value = filter ? filterHelper.filter(value, filter) : value;
				node.style[key] = value;
			} : function(value) {
				dom.setCssText(node, value);
			};
		},
		'class': function(node, selector, variable, filter) {
			return function(value, oldValue) {
				oldValue && dom.removeClass(node, oldValue);
				dom.addClass(node, value);
			};
		},
		event: function(node, selector, variable, filter, key) {
			var eventType = 'on' + key;
			var eventHandleStr = node.getAttribute(eventType);
			/*if(!lang.isNotEmpty(eventHandleStr)){
					eventHandleStr = globalContext.getObjectLiteral(actionId) + '.' + variable + (variable.indexOf('(') === -1 ? '()' : '');
					node.setAttribute(eventType, eventHandleStr);
				}*/
			var lastDotIndex = eventHandleStr.lastIndexOf('.');
			var obj = globalContext.getObject(lastDotIndex === -1 ? eventHandleStr : eventHandleStr.slice(0, lastDotIndex));
			return function(value) {
				obj[variable] = lang.isFunction(value) ? function(originalEvent) {
					var wsevent = window.event;
					originalEvent = originalEvent || wsevent;
					var e = event.wrapEvent(originalEvent);
					value.call(e.target, e);
				} : lang.noop;
			};
		},
		customAttr: function(node, selector, variable, filter, key) {
			return function(value) {
				value = filter ? filterHelper.filter(value, filter) : value;
				dom.setAttr(node, key, value);
			};
		},
		//默认的处理函数
		'default': function(node, selector, variable, filter, type) {
			return function(value) {
				dom.setAttr(node, type, value);
			};
		}
	};

	return handleMap;
})