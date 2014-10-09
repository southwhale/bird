define(function(require) {

	var event = require('bird.event');
	var object = require('bird.object');
	var dom = require('bird.dom');
	var browser = require('bird.browser');

	var clickPathList = [];
	var lastClickData;
	var config = {
		url: '',
		maxClickpathLength: 10
	};

	return {
		init: function(param) {
			object.extend(config, param);
			var me = this;
			event.addListener(document.body, 'click', function(e) {
				var target = e.target;
				if (target.nodeType !== 1) {
					return;
				}
				lastClickData = {
					id: target.id,
					tagName: target.tagName,
					path: dom.getTreePath(target),
					url: location.href,
					className: target.className,
					value: target.value || '',
					text: target.textContent || target.innerText || '',
					src: target.src || ''
				};

				clickPathList.length === config.maxClickpathLength && clickPathList.shift();
				clickPathList.push(lastClickData);
			}, true);

			event.addListener(window, 'error', function(e) {
				me.send({
					error: {
						lineNumber: e.lineno,
						fileName: e.filename,
						columnNumber: e.colno,
						message: e.message,
						stack: e.stack
					},
					clickpath: clickPathList,
					browser: browser.browser
				});
				me.clear();
			});
			console.log("ErrorTrack Module Inited!");
		},
		clear: function() {
			clickPathList = [];
			if (lastClickData) {
				clickPathList.push(lastClickData);
				lastClickData = null;
			}
		},
		send: function(obj, callback) {
			var img = new Image();
			img.src = config.url + '?' + object.jsonToQuery(obj) + '&' + new Date().getTime();
		}
	}
});