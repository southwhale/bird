define("bird.event", [ "./bird.lang", "./bird.object", "./bird.util", "./bird.array", "./bird.dom" ], function(require) {
    var lang = require("./bird.lang");
    var object = require("./bird.object");
    var util = require("./bird.util");
    var array = require("./bird.array");
    var dom = require("./bird.dom");
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
            var properties = [ "type", "altKey", "ctrlKey", "shiftKey", "metaKey", "fromElement", "toElement", "charCode", "keyCode", "clientX", "clientY", "offsetX", "offsetY", "screenX", "screenY", "defaultPrevented", "bubbles", "cancelBubble", "cancelable", "path", "clipboardData", "eventPhase", "returnValue", "changedTouches", "targetTouches", "touches", "propertyName", "state", "srcElement", "currentTarget", "timeStamp", "target", "relatedTarget", "pageX", "pageY", "which", "button" ];
            array.forEach(properties, function(property) {
                me[property] = originalEvent[property];
            });
            this.timeStamp = this.timeStamp || new Date().getTime();
            if (this.type === "error") {
                var wsevent = window.event || {};
                this.lineno = originalEvent.lineno || wsevent.errorLine;
                this.colno = originalEvent.colno || wsevent.errorCharacter;
                this.filename = originalEvent.filename || wsevent.errorUrl;
                this.message = originalEvent.message || wsevent.errorMessage;
                this.error = originalEvent.error;
            }
            this.target = this.target || this.srcElement || document;
            if (this.target.nodeType === 3) {
                this.target = this.target.parentNode;
            }
            this.metaKey = !!originalEvent.metaKey;
            if (this.which == null) {
                this.which = originalEvent.charCode != null ? originalEvent.charCode : originalEvent.keyCode;
            }
            var body, eventDoc, doc, button = originalEvent.button, fromElement = originalEvent.fromElement;
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
                this.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
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
                el.__uid__ = util.uuid("el_");
            }
            var obj = preHandle(el, eventType, handle);
            eventType = obj.eventType;
            handle = obj.handle;
            obj = null;
            var eventTypeCache = this.eventCache[el.__uid__] = this.eventCache[el.__uid__] || {};
            var eventHandleCache = eventTypeCache[eventType] = eventTypeCache[eventType] || {};
            var eventHandleQueue;
            if (!(eventHandleQueue = eventHandleCache["queue"])) {
                eventHandleQueue = eventHandleCache["queue"] = [];
                eventHandleQueue.delegateCount = 0;
            }
            if (handle.selector) {
                eventHandleQueue.splice(eventHandleQueue.delegateCount++, 0, handle);
            } else {
                eventHandleQueue.push(handle);
            }
            if (!eventHandleCache["callback"] && (el.addEventListener || el.attachEvent)) {
                var me = this;
                var callback = function(originalEvent) {
                    var wsevent = window.event;
                    originalEvent = originalEvent || wsevent;
                    var e = new Event(originalEvent);
                    me.trigger(el, e);
                };
                var capture = /^(?:focus|blur)$/i.test(eventType);
                eventHandleCache["callback"] = callback;
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
            var eventHandleQueue = eventHandleCache["queue"];
            if (!eventHandleQueue || !eventHandleQueue.length) {
                return;
            }
            if (handle) {
                array.descArrayEach(eventHandleQueue, function(fn, index, handles) {
                    if (fn === handle) {
                        handles.splice(index, 1);
                        if (handle.selector) {
                            eventHandleQueue.delegateCount--;
                        }
                    }
                });
                if (!eventHandleQueue.length) {
                    removeEventCallback(el, eventType, eventHandleCache);
                    delete eventHandleQueue.delegateCount;
                }
                return;
            }
            eventHandleQueue.length = 0;
            delete eventHandleQueue.delegateCount;
            removeEventCallback(el, eventType, eventHandleCache);
        };
        function removeEventCallback(el, eventType, eventHandleCache) {
            var capture = /^(?:focus|blur)$/i.test(eventType);
            el.removeEventListener ? el.removeEventListener(eventType, eventHandleCache["callback"], capture) : el.detachEvent("on" + eventType, eventHandleCache["callback"]);
            delete eventHandleCache["callback"];
        }
        this.trigger = function(el, data) {
            if (!el.__uid__) {
                return;
            }
            var eventTypeCache = this.eventCache[el.__uid__];
            if (!eventTypeCache) {
                return;
            }
            var handlerQueue;
            var eventType = data.type;
            //data.delegateTarget = el;
            if (eventType) {
                var eventHandleCache = eventTypeCache[eventType];
                if (!eventHandleCache) {
                    return;
                }
                var eventHandleQueue = eventHandleCache["queue"];
                if (!eventHandleQueue || !eventHandleQueue.length) {
                    return;
                }
                handlerQueue = handlers(el, data, eventHandleQueue);
                dispatch(el, data, handlerQueue);
                return;
            }
            object.forEach(eventTypeCache, function(handleCache) {
                if (handleCache && handleCache["queue"]) {
                    handlerQueue = handlers(el, data, eventHandleQueue);
                    dispatch(el, data, handlerQueue);
                }
            });
        };
        var eventTypeMap = {
            level2: {
                change: "propertychange",
                focus: "focusin",
                blur: "focusout"
            },
            level3: {
                change: "input"
            }
        };
        function preHandle(el, eventType, handle) {
            var retObj = {
                handle: handle
            };
            if (el.addEventListener) {
                retObj.eventType = eventType;
                if (eventType === "change" && !/^(?:checkbox|radio|hidden|button)$/i.test(el.type) && !/^select$/i.test(el.tagName)) {
                    retObj.eventType = eventTypeMap.level3[eventType];
                }
            } else if (el.attachEvent) {
                retObj.eventType = eventTypeMap.level2[eventType] || eventType;
                if (eventType === "change" && /^(?:checkbox|radio)$/i.test(el.type) || /^select$/i.test(el.tagName)) {
                    retObj.eventType = "click";
                }
                if (retObj.eventType === "propertychange") {
                    retObj.handle = function() {
                        return handle.apply(this, arguments);
                    };
                    retObj.handle.elem = handle.elem;
                    retObj.handle.selector = handle.selector;
                    retObj.handle.needsContext = handle.needsContext;
                    delete handle.elem;
                    delete handle.selector;
                    delete handle.needsContext;
                }
            }
            return retObj;
        }
        function dispatch(el, event, handlerQueue) {
            var i, ret, handle, matched, j;
            event.delegateTarget = el;
            // Run delegates first; they may want to stop propagation beneath us
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;
                j = 0;
                while ((handle = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                    ret = handle.call(matched.elem, event);
                    if (ret !== undefined) {
                        if ((event.result = ret) === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
            return event.result;
        }
        function handlers(el, event, handlers) {
            var sel, handleObj, matches, i, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            // Find delegate handlers
            // Black-hole SVG <use> instance trees (#13180)
            // Avoid non-left-click bubbling in Firefox (#3861)
            if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
                /* jshint eqeqeq: false */
                for (;cur != el; cur = cur.parentNode || el) {
                    /* jshint eqeqeq: true */
                    // Don't check non-elements (#13208)
                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click")) {
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];
                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + " ";
                            if (matches[sel] === undefined) {
                                matches[sel] = handleObj.needsContext ? dom.index(cur, dom.getAll(sel, el)) >= 0 : dom.getAll(sel, el, [ cur ]).length;
                            }
                            if (matches[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({
                                elem: cur,
                                handlers: matches
                            });
                        }
                    }
                }
            }
            // Add the remaining (directly-bound) handlers
            if (delegateCount < handlers.length) {
                handlerQueue.push({
                    elem: el,
                    handlers: handlers.slice(delegateCount)
                });
            }
            return handlerQueue;
        }
        var whitespace = "[\\x20\\t\\r\\n\\f]", rNeedsContext = new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i");
        //selector {String|required} 
        //需要确保代理的事件类型可冒泡,不冒泡的类型该方法未做模拟冒泡
        this.delegate = function(selector, eventType, handle, context) {
            if (!lang.isString(selector)) {
                return;
            }
            context = context || doc;
            var oldHandle = handle;
            handle = function(e) {
                return oldHandle.call(e.target, e);
            };
            handle.elem = context;
            handle.selector = selector;
            handle.needsContext = selector && rNeedsContext.test(selector);
            this.addListener(context, eventType, handle);
            handle = null;
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
            object.forEach(eventTypeCache, function(handleCache, eventType) {
                var queue = handleCache["queue"];
                queue.length = 0;
                delete queue.delegateCount;
                queue = null;
                removeEventCallback(el, eventType, handleCache);
            });
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
            var eventHandleQueue = eventHandleCache["queue"];
            if (!eventHandleQueue || !eventHandleQueue.length) {
                return false;
            }
            return true;
        }
        this.isHtmlEventType = function() {
            var eventTypeMap = {};
            util.each([ "click", "dblclick", "mouseover", "mouseout", "mousemove", "mouseenter", "mouseleave", "mouseup", "mousedown", "mousewheel", "keypress", "keydown", "keyup", "load", "unload", "beforeunload", "abort", "error", "move", "resize", "scroll", "stop", "hashchange", "blur", "change", "focus", "reset", "submit", //form
            "start", "finish", "bounce", //marquee
            "contextmenu", //右键
            "drag", "dragdrop", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "propertychange", "readystatechange", "input", "popstate", "beforeprint", "afterprint", "help", //F1键
            "select", "selectstart", "copy", "cut", "paste", "losecapture", "beforecopy", "beforecut", "beforeeditfocus", "beforepaste", "beforeupdate", "touchstart", "touchmove", "touchend" ], function(eventType) {
                eventTypeMap[eventType] = 1;
            });
            return function(eventType) {
                return eventTypeMap[eventType];
            };
        }();
    }).call(EventListner.prototype);
    return new EventListner();
});