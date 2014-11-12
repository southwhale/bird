define("errorTrack", [ "bird.event", "bird.object", "bird.dom", "bird.browser", "bird.array", "bird.request" ], function(require) {
    var event = require("bird.event");
    var object = require("bird.object");
    var dom = require("bird.dom");
    var browser = require("bird.browser");
    var array = require("bird.array");
    var request = require("bird.request");
    var clickPathList = [];
    var lastClickData;
    var config = {
        url: "",
        maxClickpathLength: 10
    };
    return {
        init: function(param) {
            object.extend(config, param);
            var me = this;
            event.addListener(document.body, "click", function(e) {
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
                    value: target.value || "",
                    text: target.textContent || target.innerText || "",
                    src: target.src || ""
                };
                clickPathList.length === config.maxClickpathLength && clickPathList.shift();
                clickPathList.push(lastClickData);
            }, true);
            event.addListener(window, "error", function(e) {
                me.send(me.getErrorInfo(e));
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
            request.imageGet(config.url + JSON.stringify(obj), callback);
        },
        getErrorInfo: function(e) {
            return {
                error: {
                    lineNumber: e.lineno || e.errorLine,
                    fileName: e.filename || e.errorUrl,
                    columnNumber: e.colno || e.errorCharacter,
                    message: e.message || e.errorMessage,
                    stack: e.error && e.error.stack || ""
                },
                clickpath: clickPathList,
                browser: browser.browser
            };
        }
    };
});