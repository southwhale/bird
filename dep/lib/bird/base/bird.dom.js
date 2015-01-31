define("bird.dom", [ "./bird.lang", "./bird.util", "./bird.string", "./bird.array" ], function(require) {
    var lang = require("./bird.lang");
    var util = require("./bird.util");
    var string = require("./bird.string");
    var array = require("./bird.array");
    function Dom() {
        this.cache = {};
        this.isOuterHTMLSupported = "outerHTML" in (document.body || document.documentElement);
    }
    (function() {
        var documentElement = document.documentElement;
        var body = document.body;
        var viewRoot = document.compatMode == "BackCompat" ? body : documentElement;
        /*********************************************************************
		 *                             selector
		 ********************************************************************/
        //return 单个HtmlElement
        this.g = this.get = this.getElement = function(selector, context) {
            return this.getElements(selector, context)[0];
        };
        this.gById = this.getElementById = function(id) {
            return lang.isString(id) ? document.getElementById(id) : id;
        };
        //return 由HtmlElement组成的数组
        this.getAll = this.getElements = function(selector, context, range) {
            if (!lang.isString(selector)) {
                return lang.isArray(selector) ? selector : [ selector ];
            }
            if (/^#([a-zA-Z_$][0-9a-zA-Z_$-]*)$/.test(selector)) {
                var el = document.getElementById(RegExp.$1);
                if (el) {
                    return [ el ];
                }
            }
            var _context = context || document;
            var elems = _context.querySelectorAll(selector);
            var length = Number(elems.length) || 0;
            var ret = [];
            for (var i = 0; i < length; i++) {
                if (!range) {
                    ret.push(elems[i]);
                } else {
                    for (var j = 0, len = range.length; j < len; j++) {
                        if (elems[i] === range[j]) {
                            ret.push(elems[i]);
                            break;
                        }
                    }
                }
            }
            return ret;
        };
        this.index = function(node, nodes) {
            var ret = -1;
            array.each(nodes, function(v, index, nodes) {
                if (v === node) {
                    ret = index;
                    return false;
                }
            });
            return ret;
        };
        /*if(!document.querySelectorAll){
			//开启此行,将加载jquery.js文件
			this.getElements = require('jquery');
		}*/
        //获取node同组的radio值
        this.getRadioValue = function(node) {
            var parentNode = node.parentNode;
            var children = this.getElements("input[type=radio]", parentNode);
            if (children.length < 2) {
                children = this.getElements("input[name=" + node.name + "]");
            }
            var name = node.name;
            var ret;
            array.each(children, function(node) {
                if (node.name === name && node.checked) {
                    ret = node.value;
                    return false;
                }
            });
            return ret;
        };
        //获取node同组的radio元素
        this.getRadios = function(node, checked) {
            var children = this.getElements("input[name=" + node.name + "]", node.ownerDocument);
            var name = node.name;
            var hasSecondParam = arguments.length > 1;
            var ret = [];
            array.forEach(children, function(node) {
                if (node.name === name && (!hasSecondParam || hasSecondParam && node.checked == !!checked)) {
                    ret.push(node);
                }
            });
            return ret;
        };
        //获取node同组的checkbox值
        this.getCheckboxValues = function(node) {
            var children = this.getElements("input[name=" + node.name + "]", node.ownerDocument);
            var name = node.name;
            var ret = [];
            array.forEach(children, function(node) {
                if (node.name === name && node.checked) {
                    ret.push(node.value);
                }
            });
            return ret;
        };
        //获取node同组的checkbox元素
        this.getCheckboxs = function(node, checked) {
            var children = this.getElements("input[name=" + node.name + "]", node.ownerDocument);
            var name = node.name;
            var hasSecondParam = arguments.length > 1;
            var ret = [];
            array.forEach(children, function(node) {
                if (node.name === name && (!hasSecondParam || hasSecondParam && node.checked == !!checked)) {
                    ret.push(node);
                }
            });
            return ret;
        };
        this.getSelectedOptionValues = function(select) {
            var options = select.options || this.getElements("option", select);
            var ret = [];
            array.forEach(options, function(option) {
                if (option.selected) {
                    ret.push(option.value);
                }
            });
            return ret;
        };
        this.getOptionsOfSelect = function(select) {
            return select.options || this.getElements("option", select);
        };
        this.getCheckedChildRadioInputValue = function(node) {
            var radios = this.getElements("input[type=radio]", node);
            var value;
            array.each(radios, function(radio) {
                if (radio.checked) {
                    value = radio.value;
                    return false;
                }
            });
            return value;
        };
        this.removeNode = function(element) {
            element = this.getElementById(element);
            if (!element) {
                return;
            }
            var parent = element.parentNode;
            if (parent) {
                parent.removeChild(element);
            }
        };
        this.replaceNode = function(srcNode, destNode) {
            if (!(srcNode && destNode)) {
                return;
            }
            var parent = srcNode.parentNode;
            if (parent) {
                parent.replaceChild(destNode, srcNode);
            }
        };
        this.insertAfter = function(element, reference) {
            var parent = reference.parentNode;
            if (parent) {
                parent.insertBefore(element, reference.nextSibling);
            }
            return element;
        };
        this.insertBefore = function(element, reference) {
            var parent = reference.parentNode;
            if (parent) {
                parent.insertBefore(element, reference);
            }
            return element;
        };
        this.appendTo = function(nodes, container) {
            if (lang.isString(nodes)) {
                var div = document.createElement("div");
                div.innerHTML = nodes;
                nodes = div.childNodes;
                if (nodes.length === 1) {
                    nodes = nodes[0];
                }
                div = null;
            }
            if (lang.isArrayLike(nodes)) {
                array.forEach(nodes, function(node) {
                    container.appendChild(node);
                });
            } else {
                container.appendChild(nodes);
            }
            return nodes;
        };
        this.getChildren = function(element) {
            return array.filter(element.children, function(child) {
                return child.nodeType === 1;
            });
        };
        /**
		 * 获取元素内部文本
		 *
		 * @param {HTMLElement} element 目标元素
		 * @return {string}
		 */
        this.getText = function(element) {
            var text = "";
            //  text 和 CDATA 节点，取nodeValue
            if (element.nodeType === 3 || element.nodeType === 4) {
                text += element.nodeValue;
            } else if (element.nodeType !== 8) {
                var me = this;
                array.forEach(element.childNodes, function(child) {
                    text += me.getText(child);
                });
            }
            return text;
        };
        this.hasParent = function(self, parent) {
            while (self && self !== parent) {
                self = self.parentNode;
            }
            return self === parent;
        };
        this.getTargetForm = function(target) {
            while (target && !/^form$/i.test(target.nodeName)) {
                target = target.parentNode;
            }
            return target;
        };
        //从element向上往context找,直到找到第一个有id的元素或者body元素停止
        this.getTreePath = function(element, context) {
            context = context || document.body;
            var paths = [];
            while (element && element.tagName && element !== context) {
                var id = element.getAttribute("id") || element.id;
                paths.unshift(element.tagName + (id ? "[id=" + id + "]" : ""));
                if (id) {
                    break;
                }
                element = element.parentNode;
            }
            return paths.length ? paths.join("->") : "";
        };
        this.css = function(el, p, v) {
            if (lang.isUndefined(v)) {
                if (lang.isString(p)) {
                    p = preHandleStyleKey(p, el);
                    return el.style[string.camelize(p)];
                }
                /**
				 * this is generally function, but it make too much reflow and repain
				 */
                /*if($.isPlainObject(p)){
				 var el = this.current;
				 for(var i in p){
				 el.style[i] = p[i];
				 }
				 el = null;
				 return this;
				 }*/
                if (lang.isPlainObject(p)) {
                    var cssText = el.style.cssText == null ? el.getAttribute("style") : el.style.cssText;
                    cssText = cssText.replace(/\s/g, "");
                    for (var i in p) {
                        var reg = new RegExp("^(" + i + ":)-?(?:[a-zA-Z0-9.%#(,)]+)?", "ig");
                        //
                        if (reg.test(cssText)) {
                            cssText = cssText.replace(reg, "$1" + p[i]);
                        } else {
                            cssText += ";" + i + ":" + p[i];
                        }
                    }
                    cssText = cssText.replace(/;{2,}/, ";");
                    el.style.cssText == null ? el.setAttribute("style", cssText) : el.style.cssText = cssText;
                    cssText = null;
                    reg = null;
                    el = null;
                }
            } else {
                p = preHandleStyleKey(p, el);
                el.style[string.camelize(p)] = v;
            }
        };
        function preHandleStyleKey(key, el) {
            if (key === "float") {
                if ("styleFloat" in el.style) {
                    return "styleFloat";
                } else if ("cssFloat" in el.style) {
                    return "cssFloat";
                }
            }
            return key;
        }
        this.getComputedStyle = function(element, key) {
            if (!element) {
                return "";
            }
            var doc = element.nodeType == 9 ? element : element.ownerDocument || element.document;
            if (doc.defaultView && doc.defaultView.getComputedStyle) {
                var styles = doc.defaultView.getComputedStyle(element, null);
                if (styles) {
                    return styles[key] || styles.getPropertyValue(key);
                }
            } else if (element && element.currentStyle) {
                return element.currentStyle[key];
            }
            return "";
        };
        this.getStyle = function(element, key) {
            key = string.camelize(key);
            return element.style[key] || (element.currentStyle ? element.currentStyle[key] : this.getComputedStyle(element, key));
        };
        this.getOffset = function(element) {
            var rect = element.getBoundingClientRect();
            var offset = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
            var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
            var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            offset.top = offset.top + scrollTop - clientTop;
            offset.bottom = offset.bottom + scrollTop - clientTop;
            offset.left = offset.left + scrollLeft - clientLeft;
            offset.right = offset.right + scrollLeft - clientLeft;
            return offset;
        };
        this.getClassList = function(element) {
            return element.className ? element.className.split(/\s+/) : [];
        };
        /**
		 * 判断元素是否拥有指定的class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string} className 要判断的class名称
		 * @return {boolean} 是否拥有指定的class
		 */
        this.hasClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return false;
            }
            if (element.classList) {
                return element.classList.contains(className);
            }
            var classes = this.getClassList(element);
            return array.contains(classes, className);
        };
        /**
		 * 为目标元素添加class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string} className 要添加的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this.addClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return element;
            }
            if (element.classList) {
                element.classList.add(className);
                return element;
            }
            var classes = this.getClassList(element);
            if (array.contains(classes, className)) {
                return element;
            }
            classes.push(className);
            element.className = classes.join(" ");
            return element;
        };
        /**
		 * 批量添加class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string[]} classes 需添加的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this.addClasses = function(element, classes) {
            element = this.getElementById(element);
            if (!element || !classes) {
                return element;
            }
            if (element.classList) {
                array.forEach(classes, function(className) {
                    element.classList.add(className);
                });
                return element;
            }
            var originalClasses = this.getClassList(element);
            var newClasses = array.union(originalClasses, classes);
            if (newClasses.length > originalClasses.length) {
                element.className = newClasses.join(" ");
            }
            return element;
        };
        /**
		 * 移除目标元素的class
		 *
		 * @param {HTMLElement | string} element 目标元素或目标元素的 id
		 * @param {string} className 要移除的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this.removeClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return element;
            }
            if (element.classList) {
                element.classList.remove(className);
                return element;
            }
            var classes = this.getClassList(element);
            var changed = false;
            // 这个方法比用`u.diff`要快
            for (var i = 0; i < classes.length; i++) {
                if (classes[i] === className) {
                    classes.splice(i, 1);
                    i--;
                    changed = true;
                }
            }
            if (changed) {
                element.className = classes.join(" ");
            }
            return element;
        };
        /**
		 * 批量移除class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string[]} classes 需移除的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this.removeClasses = function(element, classes) {
            element = this.getElementById(element);
            if (!element || !classes) {
                return element;
            }
            if (element.classList) {
                array.forEach(classes, function(className) {
                    element.classList.remove(className);
                });
                return element;
            }
            var originalClasses = this.getClassList(element);
            var newClasses = array.difference(originalClasses, classes);
            if (newClasses.length < originalClasses.length) {
                element.className = newClasses.join(" ");
            }
            return element;
        };
        /**
		 * 切换目标元素的class
		 *
		 * @param {HTMLElement} element 目标元素或目标元素的 id
		 * @param {string} className 要切换的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this.toggleClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return element;
            }
            if (element.classList) {
                element.classList.toggle(className);
                return element;
            }
            var classes = this.getClassList(element);
            var containsClass = false;
            for (var i = 0; i < classes.length; i++) {
                if (classes[i] === className) {
                    classes.splice(i, 1);
                    containsClass = true;
                    i--;
                }
            }
            if (!containsClass) {
                classes.push(className);
            }
            element.className = classes.join(" ");
            return element;
        };
        //<-------baidu className operation end here------->
        this.isHidden = function(el) {
            return this.getStyle(el, "display") === "none";
        };
        this.resetCss = function(el, p, v) {
            if (!el.$guid) {
                el.$guid = util.uuid();
            }
            this.cache[el.$guid] = {};
            var oldCss = {};
            if (v === undefined && lang.isPlainObject(p)) {
                var cssText = el.style.cssText == null ? el.getAttribute("style") : el.style.cssText;
                cssText = cssText.replace(/\s/g, "");
                for (var i in p) {
                    oldCss[i] = el.style[string.camelize(i)];
                    //el.style[camelize(i)] = p[i];
                    var reg = new RegExp("(" + i + ":)-?(?:[a-zA-Z0-9.%#]+)?", "ig");
                    //
                    if (reg.test(cssText)) {
                        cssText = cssText.replace(reg, "$1" + p[i]);
                    } else {
                        cssText += ";" + i + ":" + p[i];
                    }
                }
                cssText = cssText.replace(/;{2,}/, ";");
                el.style.cssText == null ? el.setAttribute("style", cssText) : el.style.cssText = cssText;
                cssText = null;
                reg = null;
            } else {
                oldCss[p] = el.style[string.camelize(p)];
                el.style[string.camelize(p)] = v;
            }
            this.cache[el.$guid]["oldCss"] = oldCss;
        };
        /**
		 * restore old css saved by resetCss
		 */
        this.restoreCss = function(el) {
            if (this.cache[el.$guid] && this.cache[el.$guid]["oldCss"]) {
                var oldCss = this.cache[el.$guid]["oldCss"];
                var cssText = el.style.cssText == null ? el.getAttribute("style") : el.style.cssText;
                cssText = cssText.replace(/\s/g, "");
                for (var i in oldCss) {
                    //el.style[camelize(i)] = el.oldCss[i];
                    var reg = new RegExp("(" + i + ":)-?(?:[a-zA-Z0-9.%#]+)?", "ig");
                    //
                    if (reg.test(cssText)) {
                        cssText = cssText.replace(reg, "$1" + oldCss[i]);
                    } else {
                        cssText += ";" + i + ":" + oldCss[i];
                    }
                }
                cssText = cssText.replace(/;{2,}/, ";");
                el.style.cssText == null ? el.setAttribute("style", cssText) : el.style.cssText = cssText;
                cssText = null;
                reg = null;
                delete this.cache[el.$guid]["oldCss"];
                delete this.cache[el.$guid];
                el = null;
            }
        };
        this.fullHeight = function(el) {
            if (this.getStyle(el, "display") !== "none") {
                return parseFloat(this.getStyle(el, "height")) || el.offsetHeight;
            } else {
                this.resetCss(el, {
                    display: "block",
                    visibility: "hidden",
                    position: "absolute"
                });
                var h = el.clientHeight || parseFloat(this.getStyle(el, "height"));
                this.restoreCss(el);
                return h;
            }
        };
        this.fullWidth = function(el) {
            if (this.getStyle(el, "display") !== "none") {
                return parseFloat(this.getStyle(el, "width")) || el.offsetWidth;
            } else {
                this.resetCss(el, {
                    display: "block",
                    visibility: "hidden",
                    position: "absolute"
                });
                var w = el.clientWidth || parseFloat(this.getStyle(el, "width"));
                this.restoreCss(el);
                return w;
            }
        };
        this.addCssRule = function(rule) {
            if (lang.isArray(rule)) {
                rule = rule.join("");
            }
            if (document.styleSheets && document.styleSheets.length) {
                document.styleSheets[0].insertRule(rule, 0);
            } else {
                var s = document.createElement("style");
                s.innerHTML = rule;
                document.getElementsByTagName("head")[0].appendChild(s);
            }
        };
        this.loadStyle = function(url) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(link);
        };
        this.loadStyleString = function(css) {
            var style = document.createElement("style");
            style.type = "text/css";
            try {
                style.appendChild(document.createTextNode(css));
            } catch (ex) {
                style.styleSheet.cssText = css;
            }
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(style);
        };
        this.loadscript = function(url, callback, removeAfterLoaded) {
            var script = document.createElement("script");
            lang.isFunction(callback) && (script.onload = script.onreadystatechange = function() {
                if (script.readyState && script.readyState != "loaded" && script.readyState != "complete") {
                    return;
                }
                script.onreadystatechange = script.onload = null;
                callback.apply(this, arguments);
                if (removeAfterLoaded) {
                    this.parentNode.removeChild(this);
                }
            });
            //script.setAttribute('id', this.scriptId);
            script.setAttribute("charset", "UTF-8");
            script.type = "text/javascript";
            script.src = url;
            var parentNode = document.getElementsByTagName("head")[0] || document.body;
            parentNode.appendChild(script);
        };
        this.loadScriptString = function(code) {
            var script = document.createElement("script");
            script.setAttribute("charset", "UTF-8");
            script.type = "text/javascript";
            try {
                script.appendChild(document.createTextNode(code));
            } catch (e) {
                script.text = code;
            }
            var parentNode = document.getElementsByTagName("head")[0] || document.body;
            parentNode.appendChild(script);
        };
        this.loadImage = function(url, successCallback, errorCallback) {
            var img = new Image();
            //create an Image object, preload image
            img.src = url;
            var isFnSuccessCb = lang.isFunction(successCallback);
            var isFnErrorCb = lang.isFunction(errorCallback);
            if (isFnSuccessCb && img.complete) {
                // if Image exists in browser cache, call successCallback
                successCallback.call(img);
                return img;
            }
            isFnSuccessCb && (img.onload = function() {
                //when Image download completed, call successCallback async
                successCallback.call(img);
            });
            isFnErrorCb && (img.onerror = function() {
                errorCallback.call(img);
            });
            return img;
        };
        this.getPageWidth = function() {
            return Math.max(documentElement ? documentElement.scrollWidth : 0, body ? body.scrollWidth : 0, viewRoot ? viewRoot.clientWidth : 0, 0);
        };
        /**
		 * 获取页面高度
		 *
		 * @return {number} 页面高度
		 */
        this.getPageHeight = function() {
            return Math.max(documentElement ? documentElement.scrollHeight : 0, body ? body.scrollHeight : 0, viewRoot ? viewRoot.clientHeight : 0, 0);
        };
        /**
		 * 获取页面视觉区域宽度
		 *
		 * @return {number} 页面视觉区域宽度
		 */
        this.getViewWidth = function() {
            return window.innerWidth || (viewRoot ? viewRoot.clientWidth : 0);
        };
        /**
		 * 获取页面视觉区域高度
		 *
		 * @return {number} 页面视觉区域高度
		 */
        this.getViewHeight = function() {
            return window.innerHeight || (viewRoot ? viewRoot.clientHeight : 0);
        };
        /**
		 * 获取纵向滚动量
		 *
		 * @return {number} 纵向滚动量
		 */
        this.getScrollTop = function() {
            return window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0;
        };
        /**
		 * 获取横向滚动量
		 *
		 * @return {number} 横向滚动量
		 */
        this.getScrollLeft = function() {
            return window.pageXOffset || documentElement.scrollLeft || body.scrollLeft || 0;
        };
        /**
		 * 获取页面纵向坐标
		 *
		 * @return {number}
		 */
        this.getClientTop = function() {
            return documentElement.clientTop || body.clientTop || 0;
        };
        /**
		 * 获取页面横向坐标
		 *
		 * @return {number}
		 */
        this.getClientLeft = function() {
            return documentElement.clientLeft || body.clientLeft || 0;
        };
        /**
		 * 获取目标元素的第一个元素节点
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @return {HTMLElement | null} 目标元素的第一个元素节点，查找不到时返回null
		 */
        this.firstElement = function(element) {
            element = this.getElementById(element);
            if (element.firstElementChild) {
                return element.firstElementChild;
            }
            var node = element.firstChild;
            for (;node; node = node.nextSibling) {
                if (node.nodeType == 1) {
                    return node;
                }
            }
            return null;
        };
        /**
		 * 获取目标元素的最后一个元素节点
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @return {HTMLElement | null} 目标元素的第一个元素节点，查找不到时返回null
		 */
        this.lastElement = function(element) {
            element = this.getElementById(element);
            if (element.lastElementChild) {
                return element.lastElementChild;
            }
            var node = element.lastChild;
            for (;node; node = node.previousSibling) {
                if (node.nodeType === 1) {
                    return node;
                }
            }
            return null;
        };
        /**
		 * 获取目标元素的下一个兄弟元素节点
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @return {HTMLElement | null} 目标元素的下一个元素节点，查找不到时返回null
		 */
        this.nextElement = function(element) {
            element = this.getElementById(element);
            if (element.nextElementSibling) {
                return element.nextElementSibling;
            }
            var node = element.nextSibling;
            for (;node; node = node.nextSibling) {
                if (node.nodeType == 1) {
                    return node;
                }
            }
            return null;
        };
        /**
		 * 判断一个元素是否包含另一个元素
		 *
		 * @param {HTMLElement | string} container 包含元素或元素的 id
		 * @param {HTMLElement | string} contained 被包含元素或元素的 id
		 * @return {boolean} `contained`元素是否被包含于`container`元素的DOM节点上
		 */
        this.contains = function(container, contained) {
            container = this.getElementById(container);
            contained = this.getElementById(contained);
            //fixme: 无法处理文本节点的情况(IE)
            return container.contains ? container != contained && container.contains(contained) : !!(container.compareDocumentPosition(contained) & 16);
        };
        this.extractHtmlBySelector = function(selector, htmlText) {
            var innerDiv = document.createElement("div");
            innerDiv.innerHTML = htmlText;
            var html = [];
            var nodes = this.getElements(selector, innerDiv);
            if (!this.isOuterHTMLSupported) {
                var div = document.createElement("div");
            }
            var me = this;
            //有些浏览器的某些版本不支持outerHTML,且它非W3C标准
            util.each(nodes, function(node) {
                if (me.isOuterHTMLSupported) {
                    html.push(node.outerHTML);
                } else {
                    div.appendChild(node);
                    html.push(div.innerHTML);
                    div.removeChild(node);
                }
            });
            return html.join("");
        };
        this.iterateDomTree = function(rootNode, handle) {
            var childNodes = rootNode.childNodes;
            var _arguments = arguments;
            childNodes && array.forEach(childNodes, function(childNode) {
                handle(childNode);
                _arguments.callee.call(this, childNode, handle);
            });
            childNodes = _arguments = null;
        };
        this.setText = function(element, content) {
            "textContent" in element ? element.textContent = content : element.innerText = content;
        };
        this.getText = function(element) {
            return "textContent" in element ? element.textContent : element.innerText;
        };
        this.setValue = function(element, value) {
            element.value = value;
        };
        this.getValue = function(element) {
            return element.value;
        };
        this.setHtml = function(element, htmlContent) {
            element.innerHTML = htmlContent;
        };
        this.getHtml = function(element) {
            return element.innerHTML;
        };
        this.setAttr = function(element, attrName, value) {
            if (lang.isFunction(element.setAttribute)) {
                element.setAttribute(attrName, value);
            } else {
                element[attrName] = value;
            }
        };
        this.getAttr = function(element, attrName) {
            if (lang.isFunction(element.getAttribute)) {
                return element.getAttribute(attrName);
            } else {
                return element[attrName];
            }
        };
        this.removeAttr = function(element, attrName) {
            if (lang.isFunction(element.removeAttribute)) {
                element.removeAttribute(attrName);
            } else {
                try {
                    delete element[attrName];
                } catch (e) {
                    element[attrName] = null;
                }
            }
        };
        this.show = function(element) {
            if (element.style.display === "none") {
                element.style.display = "";
            }
        };
        this.hide = function(element) {
            if (element.style.display !== "none") {
                element.style.display = "none";
            }
        };
        this.setCssText = function(el, cssText) {
            "cssText" in el.style ? el.style.cssText = cssText : el.setAttribute("style", cssText);
        };
        this.empty = function(element) {
            var childNodes = element.childNodes;
            if (!childNodes || !childNodes.length) {
                return;
            }
            while (childNodes.length) {
                element.removeChild(childNodes[childNodes.length - 1]);
            }
        };
    }).call(Dom.prototype);
    return new Dom();
});