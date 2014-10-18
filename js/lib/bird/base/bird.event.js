define(function(require) {
	var lang = require('./bird.lang');
	var object = require('./bird.object');
	var util = require('./bird.util');
	var array = require('./bird.array');
	var dom = require('./bird.dom');
	/*********************************************************************
	 *                             事件
	 ********************************************************************/
	function Event(originalEvent) {
		this.originalEvent = originalEvent;
		this.init();
	}

	(function() {

		this.init = function() {
			var originalEvent = this.originalEvent;
			var me = this;

			var properties = ['type', 'altKey', 'ctrlKey', 'shiftKey', 'metaKey', 'fromElement', 'toElement',
				'charCode', 'keyCode', 'clientX', 'clientY', 'offsetX', 'offsetY', 'screenX', 'screenY', 'defaultPrevented',
				'bubbles', 'cancelBubble', 'cancelable', 'path', 'clipboardData', 'eventPhase', 'returnValue',
				'changedTouches', 'targetTouches', 'touches', 'propertyName',
				'srcElement', 'currentTarget', 'timeStamp', 'target', 'relatedTarget', 'pageX', 'pageY', 'which', 'button'
			];
			array.forEach(properties, function(property) {
				me[property] = originalEvent[property];
			});

			this.timeStamp = this.timeStamp || new Date().getTime();
			if (this.type === 'error') {
				var wsevent = window.event || {};

				this.lineno = originalEvent.lineno || wsevent.errorLine;
				this.colno = originalEvent.colno || wsevent.errorCharacter;
				this.filename = originalEvent.filename || wsevent.errorUrl;
				this.message = originalEvent.message || wsevent.errorMessage;
				this.stack = originalEvent.error && originalEvent.error.stack || '';
			}


			this.target = this.target || this.srcElement || document;


			if (this.target.nodeType === 3) {
				this.target = this.target.parentNode;
			}

			this.metaKey = !!originalEvent.metaKey;


			if (this.which == null) {
				this.which = originalEvent.charCode != null ? originalEvent.charCode : originalEvent.keyCode;
			}

			var body, eventDoc, doc,
				button = originalEvent.button,
				fromElement = originalEvent.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if (this.pageX == null && originalEvent.clientX != null) {
				eventDoc = this.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				this.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
				this.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
			}

			// Add relatedTarget, if necessary
			if (!this.relatedTarget && fromElement) {
				this.relatedTarget = fromElement === this.target ? originalEvent.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if (!this.which && button !== undefined) {
				this.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
			}

			this.isMouseLeft = this.which === 1;
			this.isMouseRight = this.which === 3;
			this.isMouseMiddle = this.which === 2;
		};

		this.isDefaultPrevented = returnFalse;
		this.isPropagationStopped = returnFalse;
		this.isImmediatePropagationStopped = returnFalse;

		this.preventDefault = function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;
			if (!e) {
				return;
			}

			// If preventDefault exists, run it on the original event
			if (e.preventDefault) {
				e.preventDefault();

				// Support: IE
				// Otherwise set the returnValue property of the original event to false
			} else {
				e.returnValue = false;
			}
		};

		this.stopPropagation = function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;
			if (!e) {
				return;
			}
			// If stopPropagation exists, run it on the original event
			if (e.stopPropagation) {
				e.stopPropagation();
			}

			// Support: IE
			// Set the cancelBubble property of the original event to true
			e.cancelBubble = true;
		};

		this.stopImmediatePropagation = function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if (e && e.stopImmediatePropagation) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		};


		function returnTrue() {
			return true;
		}

		function returnFalse() {
			return false;
		}
	}).call(Event.prototype);


	function EventListner() {
		this.eventCache = {};
		this.delegatedPropertyChangeNodes = [];
	}

	(function() {

		var doc = document;

		this.addListener = function(el, eventType, handle) {
			var me = this;
			array.forEach(eventType.split(/\s+/), function(etype) {
				me._addListener(el, etype, handle);
			});
		};

		this.removeListener = function(el, eventType, handle) {
			var me = this;
			if (!eventType) {
				return this._removeListener(el);
			}
			array.forEach(eventType.split(/\s+/), function(etype) {
				me._removeListener(el, etype, handle);
			});
		};

		this.on = this.bind = this.addListener;
		this.off = this.unbind = this.removeListener;

		this.once = function(el, eventType, handle) {
			var me = this;
			var wrappedHandle = function(e) {
				me.removeListener(el, e.type, wrappedHandle);
				handle.call(this, e);
			};
			this.addListener(el, eventType, wrappedHandle);
		};

		this._addListener = function(el, eventType, handle) {
			if (!el.__uid__) {
				el.__uid__ = util.uuid('el_');
			}
			var eventTypeCache = this.eventCache[el.__uid__] = this.eventCache[el.__uid__] || {};
			var eventHandleCache = eventTypeCache[eventType] = eventTypeCache[eventType] || {};
			var eventHandleQueue = eventHandleCache['queue'] = eventHandleCache['queue'] || [];
			eventHandleQueue.push(handle);
			if (!eventHandleCache['callback'] && (el.addEventListener || el.attachEvent)) {
				var me = this;
				var callback = function(originalEvent) {
					var wsevent = window.event;
					originalEvent = originalEvent || wsevent;

					var e = new Event(originalEvent);
					me.trigger(el, eventType, e);
				};
				var capture = /^(?:focus|blur)$/i.test(eventType);
				eventHandleCache['callback'] = callback;
				el.addEventListener ? el.addEventListener(eventType, callback, capture) : el.attachEvent("on" + eventType, callback);
				callback = null;
			}
		};

		this._removeListener = function(el, eventType, handle) {
			if (!el.__uid__) {
				return;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			if (!eventTypeCache) {
				return;
			}
			var eventHandleCache = eventTypeCache[eventType];
			if (!eventHandleCache) {
				return;
			}
			var eventHandleQueue = eventHandleCache['queue'];
			if (!eventHandleQueue || !eventHandleQueue.length) {
				return;
			}

			if (handle) {
				array.descArrayEach(eventHandleQueue, function(fn, index, handles) {
					if (fn === handle) {
						handles.splice(index, 1);
					}
				});
				if (!eventHandleQueue.length) {
					removeEventCallback(el, eventType, eventHandleCache);
				}

				return;
			}

			removeEventCallback(el, eventType, eventHandleCache);
		};

		function removeEventCallback(el, eventType, eventHandleCache){
			var capture = /^(?:focus|blur)$/i.test(eventType);
			el.removeEventListener ? el.removeEventListener(eventType, eventHandleCache['callback'], capture) : el.detachEvent("on" + eventType, eventHandleCache['callback']);
			delete eventHandleCache['callback'];
		}

		this.trigger = function(el, eventType, data) {
			if (!el.__uid__) {
				return;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			if (!eventTypeCache) {
				return;
			}
			if (eventType) {
				var eventHandleCache = eventTypeCache[eventType];
				if (!eventHandleCache) {
					return;
				}
				var eventHandleQueue = eventHandleCache['queue'];
				if (!eventHandleQueue || !eventHandleQueue.length) {
					return;
				}
				util.each(eventHandleQueue, function(handle) {
					handle.call(el, data);
				});
				return;
			}

			util.each(eventTypeCache, function(handleCache) {
				util.each(handleCache && handleCache['queue'] || [], function(handle) {
					handle.call(el, data);
				});
			});
		};



		//selector {String|required} 
		this.delegate = function(selector, eventType, handle, context) {
			if (!lang.isString(selector)) {
				return;
			}

			context = context || doc.body;

			var oldHandle = handle;
			handle = function(e) {
				var elements = dom.getElements(selector, context);
				var target = e.target;
				array.each(elements, function(element) {
					if (target === element) {
						e.stopImmediatePropagation();
						oldHandle.call(target, e);
						return false;
					}
				});
			};
			if (context.addEventListener) {
				if ('change' === eventType) {
					var firstElement = dom.getElement(selector, context);
					if (!/^(?:checkbox|radio|hidden|button)$/i.test(firstElement.type) && !/^select$/i.test(firstElement.tagName)) {
						eventType = 'input';
					}
				}
			} else {
				if ('change' === eventType) {
					var elements = dom.getElements(selector, context);
					var firstElement = elements[0];
					if (/^(?:checkbox|radio)$/i.test(firstElement.type) || /^select$/i.test(firstElement.tagName)) {
						eventType = 'click';
					}else if('onpropertychange' in firstElement){
						//IE的onpropertychange不冒泡
						eventType = 'propertychange';
						handle = function(e) {
							if (e.propertyName && e.propertyName !== 'value') {
								return;
							}
							oldHandle.call(this, e);
						};

						var me = this;

						array.forEach(elements, function(element){
							me.delegatedPropertyChangeNodes.push(element);
							me._addListener(element, eventType, handle);
						});
						handle = elements = firstElement = null;
						return;
					}
				} else if (/^(?:focus|blur)$/i.test(eventType)) {
					eventType = ({
						focus: 'focusin',
						blur: 'focusout'
					})[eventType];
				}
			}

			this.addListener(context, eventType, handle);
			handle = elements = firstElement = null;
		};

		//只是删除事件绑定时加入的属性
		this.destroy = function(el) {
			if (!el.__uid__) {
				return;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			try {
				//IE7及以下浏览器delete一个HtmlNode的属性时会抛异常,而这里的el可能为HtmlNode
				delete el.__uid__;
			} catch (e) {
				el.__uid__ = null;
			}


			if (!eventTypeCache) {
				return;
			}


			util.each(eventTypeCache, function(handleCache, eventType) {
				handleCache['queue'].length = 0;
				removeEventCallback(el, eventType, handleCache);
			});
		};

		this.destroyPropertyChangeEvents = function(){
			var me = this;
			array.forEach(this.delegatedPropertyChangeNodes, function(node){
				me._removeListener(node, 'propertychange');
			});
			this.delegatedPropertyChangeNodes.length = 0;
		};


		function hasHandleOnEventType(el, eventType) {
			if (!el.__uid__) {
				return false;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			if (!eventTypeCache) {
				return false;
			}
			var eventHandleCache = eventTypeCache[eventType];
			if (!eventHandleCache) {
				return false;
			}

			var eventHandleQueue = eventHandleCache['queue'];
			if (!eventHandleQueue || !eventHandleQueue.length) {
				return false;
			}
			return true;
		}



		this.isHtmlEventType = (function() {

			var eventTypeMap = {};
			util.each([
				'click', 'dblclick',
				'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'mouseup', 'mousedown', 'mousewheel',
				'keypress', 'keydown', 'keyup',
				'load', 'unload', 'beforeunload', 'abort', 'error', 'move', 'resize', 'scroll', 'stop', 'hashchange',
				'blur', 'change', 'focus',
				'reset', 'submit', //form
				'start', 'finish', 'bounce', //marquee
				'contextmenu', //右键
				'drag', 'dragdrop', 'dragend', 'dragenter', 'dragleave', 'dragover', 'dragstart',
				'propertychange', 'readystatechange', 'input',
				'beforeprint', 'afterprint',
				'help', //F1键
				'select', 'selectstart',
				'copy', 'cut', 'paste', 'losecapture', 'beforecopy', 'beforecut', 'beforeeditfocus', 'beforepaste', 'beforeupdate',
				'touchstart', 'touchmove', 'touchend'
			], function(eventType) {
				eventTypeMap[eventType] = 1;
			});
			return function(eventType) {
				return eventTypeMap[eventType];
			};
		})();
	}).call(EventListner.prototype);

	return new EventListner();
});