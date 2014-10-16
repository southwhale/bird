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
			
			var properties = ['type','altKey','ctrlKey','shiftKey','metaKey','fromElement','toElement',
				'charCode','keyCode','clientX','clientY','offsetX','offsetY','screenX','screenY','defaultPrevented',
				'bubbles','cancelBubble','cancelable','path','clipboardData','eventPhase','returnValue',
				'changedTouches','targetTouches','touches','propertyName',
				'srcElement','currentTarget','timeStamp','target','relatedTarget','pageX','pageY','which','button'];
			array.forEach(properties, function(property){
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
			if ( this.pageX == null && originalEvent.clientX != null ) {
				eventDoc = this.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				this.pageX = originalEvent.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				this.pageY = originalEvent.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !this.relatedTarget && fromElement ) {
				this.relatedTarget = fromElement === this.target ? originalEvent.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !this.which && button !== undefined ) {
				this.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
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
			if ( !e ) {
				return;
			}

			// If preventDefault exists, run it on the original event
			if ( e.preventDefault ) {
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
			if ( !e ) {
				return;
			}
			// If stopPropagation exists, run it on the original event
			if ( e.stopPropagation ) {
				e.stopPropagation();
			}

			// Support: IE
			// Set the cancelBubble property of the original event to true
			e.cancelBubble = true;
		};

		this.stopImmediatePropagation = function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e && e.stopImmediatePropagation ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		};


		function returnTrue(){
			return true;
		}

		function returnFalse(){
			return false;
		}
	}).call(Event.prototype);


	function EventListner() {
		this.eventCache = {};
		this.htmlEventCallbackCache = {};
		this.delegateElCache = {};
	}

	(function() {

		var doc = document;


		this.wrapEvent = function(originalEvent){
			return new Event(originalEvent);
		};

		this.addListener = function(el, eventType, handle, capture) {
			var me = this;
			array.forEach(eventType.split(/\s+/), function(etype) {
				me._addListener(el, etype, handle, capture);
			});
		};

		this.removeListener = function(el, eventType, handle, capture) {
			var me = this;
			if (!eventType) {
				return this._removeListener(el);
			}
			array.forEach(eventType.split(/\s+/), function(etype) {
				me._removeListener(el, etype, handle, capture);
			});
		};

		this.on = this.bind = this.addListener;
		this.off = this.unbind = this.removeListener;

		this.once = function(el, eventType, handle) {
			var me = this;
			var wrappedHandle = function(e) {
				me.removeListener(el, eventType, wrappedHandle);
				handle.call(this, e);
			};
			this.addListener(el, eventType, wrappedHandle);
		};

		this._addListener = function(el, eventType, handle, capture) {
			if (!el.__uid__) {
				el.__uid__ = util.uuid('el_');
			}
			var eventTypeCache = this.eventCache[el.__uid__] = this.eventCache[el.__uid__] || {};
			var eventHandles = eventTypeCache[eventType] = eventTypeCache[eventType] || [];
			eventHandles.push(handle);

			if ((lang.isHtmlNode(el) || lang.isWindow(el) || lang.isHtmlDocument(el)) && this.isHtmlEventType(eventType)) {
				if (!this.htmlEventCallbackCache[el.__uid__]) {
					this.htmlEventCallbackCache[el.__uid__] = {};
				}

				if (this.htmlEventCallbackCache[el.__uid__][eventType]) {
					return;
				}
				var me = this;
				var callback = function(originalEvent) {
					var wsevent = window.event;
					originalEvent = originalEvent || wsevent;

					var e = new Event(originalEvent);
					me.trigger(el, eventType, e);
				};
				el.addEventListener ? el.addEventListener(eventType, callback, capture || false) : el.attachEvent("on" + eventType, callback);
				this.htmlEventCallbackCache[el.__uid__][eventType] = callback;
				callback = null;
			}
		};

		this._removeListener = function(el, eventType, handle, capture) {
			if (!el.__uid__) {
				return;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			if (!eventTypeCache) {
				return;
			}
			var eventHandles = eventTypeCache[eventType];
			if (!eventHandles || !eventHandles.length) {
				return;
			}

			if (handle) {
				array.descArrayEach(eventHandles, function(fn, index, handles) {
					if (fn === handle) {
						handles.splice(index, 1);
					}
				});

				if (!eventHandles.length) {
					removeHtmlEventListener.call(this, el, eventType, capture);
				}

				return;
			}

			eventHandles.length = 0;
			removeHtmlEventListener.call(this, el, eventType, capture);
		};

		this.trigger = function(el, eventType, data) {
			if (!el.__uid__) {
				return;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			if (!eventTypeCache) {
				return;
			}
			if (eventType) {
				var eventHandles = eventTypeCache[eventType];
				if (!eventHandles || !eventHandles.length) {
					return;
				}
				util.each(eventHandles, function(handle) {
					handle.call(el, data);
				});
				return;
			}

			util.each(eventTypeCache, function(handles) {
				util.each(handles, function(handle) {
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

			var eventThis = this;

			if (!hasHandleOnEventType.call(this, context, eventType)) {
				var me = this;
				var isBlurFocus = /^(?:focus|blur)$/i.test(eventType);
				isBlurFocus && !context.addEventListener && (eventType = ({
					focus: 'focusin',
					blur: 'focusout'
				})[eventType]);
				this.addListener(context, eventType, function(e) {
					var target = e.target;
					var _context = this;

					util.each(me.delegateElCache[context.__uid__], function(el, selector) {
						return util.each(dom.getElements(selector, _context), function(node) {
							if (dom.hasParent(target, node)) {
								//e.stopPropagation();
								object.extend(target, el);
								eventThis.trigger(target, e.type, e);
								return false;
							}
						});
					});
				}, isBlurFocus);
			}

			this.delegateElCache[context.__uid__] = this.delegateElCache[context.__uid__] || {};

			var selectorCache = this.delegateElCache[context.__uid__];

			var el = selectorCache[selector] = selectorCache[selector] || {
				selector: selector
			};

			this.addListener(el, eventType, handle);

		};

		//只是删除事件绑定时加入的属性
		this.destroy = function(el) {
			if (!el.__uid__) {
				return;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			var callbackCache = this.htmlEventCallbackCache[el.__uid__];
			var selectorCache = this.delegateElCache[el.__uid__];

			if (selectorCache) {
				var me = this;
				object.forEach(selectorCache, function(delegateEl) {
					me.destroy(delegateEl);
				});
				delete this.delegateElCache[el.__uid__]; //删除代理对象
			}
			try{
				//IE7及以下浏览器delete一个HtmlNode的属性时会抛异常,而这里的el可能为HtmlNode
				delete el.__uid__;
			}catch(e){
				el.__uid__ = null;
			}
			

			if (!eventTypeCache) {
				return;
			}

			util.each(eventTypeCache, function(handles, eventType) {
				util.each(handles, function(handle, index) {
					delete handles[index];
				});
				delete eventTypeCache[eventType];
			});

			if (callbackCache) {
				util.each(callbackCache, function(callback, eventType) {
					el.removeEventListener ? el.removeEventListener(eventType, callback, false) : el.detachEvent("on" + eventType, callback);
					delete callbackCache[eventType];
				});
			}
		};



		function hasHandleOnEventType(el, eventType) {
			if (!el.__uid__) {
				return false;
			}
			var eventTypeCache = this.eventCache[el.__uid__];
			if (!eventTypeCache) {
				return false;
			}
			var eventHandles = eventTypeCache[eventType];
			if (!eventHandles || !eventHandles.length) {
				return false;
			}
			return true;
		}


		function getTreePath(el, context) {
			context = context || doc.body;
			var paths = [];
			while (el && el.tagName && el !== context) {
				paths.unshift(el.tagName + (el.id ? "[id=" + el.id + "]" : ""));
				el = el.parentNode;
			}
			return paths.length ? paths.join('->') : '';
		}


		function removeHtmlEventListener(el, eventType, capture) {
			if ((lang.isHtmlNode(el) || lang.isWindow(el) || lang.isHtmlDocument(el)) && this.isHtmlEventType(eventType)) {
				if (!this.htmlEventCallbackCache[el.__uid__]) {
					return;
				}
				var callback = this.htmlEventCallbackCache[el.__uid__][eventType];
				if (!callback) {
					return;
				}
				el.removeEventListener ? el.removeEventListener(eventType, callback, capture || false) : el.detachEvent("on" + eventType, callback);
				delete this.htmlEventCallbackCache[el.__uid__][eventType];
				callback = null;
			}
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