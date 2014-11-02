define(function(require) {
	var dom = require('./bird.dom');
	var lang = require('./bird.lang');
	var string = require('./bird.string');
	var util = require('./bird.util');
	var object = require('./bird.object');
	var date = require('./bird.date');
	/*********************************************************************
	 *                             ajax/jsonp
	 ********************************************************************/


	function Request() {

	}

	(function() {
		var doc = document;

		this.ajax = function(arg) {
			//init xhr
			var xhr, lnk;
			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else if (window.ActiveObject) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}

			if (!xhr) {
				console.warn('Your browser not support XmlHttpRequest!');
				return;
			}

			//define default arguments
			var obj = {
				async: true,
				requestType: 'get',
				responseType: 'json'
			};
			object.extend(obj, arg);

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						if (lang.isFunction(obj.complete)) {
							if (string.equalsIgnoreCase(obj.responseType, 'xml')) {
								obj.complete(xhr.responseXML);
							} else {
								obj.complete(xhr.responseText);
							}
						}
					} else {
						if (lang.isFunction(obj.error)) {
							obj.error(xhr.statusText);
						}
						console.log(xhr.statusText);
					}
				}
			};
			if (obj.url.indexOf('?') == -1)
				lnk = '?'
			else
				lnk = '&';


			obj.data = obj.data && object.jsonToQuery(obj.data);

			if (string.equalsIgnoreCase(obj.requestType, 'get')) {
				obj.data && (obj.url += lnk + obj.data);
				obj.data = null;
			}
			xhr.open(obj.requestType, obj.url, obj.async);
			
			if (string.equalsIgnoreCase(obj.requestType, 'post')) {
				xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			}

			xhr.send(obj.data);
		};

		this.post = function(url, data, callback, errorCallback) {
			var arg = {
				url: url,
				data: data,
				requestType: 'post',
				complete: callback,
				error: errorCallback
			};
			this.ajax(arg);
		};

		this.get = function(url, data, callback, errorCallback) {
			if (lang.isFunction(data)) {
				if (lang.isFunction(callback)) {
					errorCallback = callback;
				}
				callback = data;
				data = null;
			}
			var arg = {
				url: url,
				data: data,
				requestType: 'get',
				complete: callback,
				error: errorCallback
			};
			this.ajax(arg);
		};

		this.load = function(url, selector, successcallback, errorCallback, async) {
			if (lang.isFunction(selector)) {
				error = successcallback;
				successcallback = selector;
				selector = null;
			}
			var me = this;
			var arg = {
				url: url,
				requestType: 'get',
				responseType: 'text',
				async: lang.isUndefinedOrNull(async) ? true : !!async,
				complete: function(data) {
					if (selector) {
						var html = dom.extractHtmlBySelector(selector, data);
						lang.isFunction(successcallback) && successcallback(html);
					} else {
						lang.isFunction(successcallback) && successcallback(data);
					}

				},
				error: errorCallback
			};
			this.ajax(arg);
		};


		this.syncLoad = function(url, selector, successcallback, errorCallback) {
			this.load(url, selector, successcallback, errorCallback, false);
		};

		this.jsonp = function(url, cbname, callback) {
			if (lang.isFunction(cbname)) {
				callback = cbname;
				cbname = null;
			}
			var cb = "jsonp" + date.now(),
				script, header;
			//url = url.replace(/([\?|\&]\w+=)\?/, "$1" + cb);
			url = url + (/\?/.test(url) ? "&" : "?") + (cbname || "callback") + "=" + cb;
			window[cb] = function(r) {
				header.removeChild(script);
				script = null;
				header = null;
				window[cb] = null;

				delete window[cb];

				callback(r);
			};
			script = doc.createElement('script');
			script.setAttribute('src', url);
			header = doc.getElementsByTagName('head')[0] || doc.getElementsByTagName('body')[0];
			header.appendChild(script);
		};

		this.imageGet = function(url, succuessCallback, errorCallback) {
			url += (url.indexOf('?') !== -1 ? '&' : '?') + '_t=' + new Date().getTime();
			dom.loadImage(url, succuessCallback, errorCallback);
		};
	}).call(Request.prototype);

	return new Request();
});