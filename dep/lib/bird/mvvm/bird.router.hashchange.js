define("bird.router.hashchange", [ "bird.event", "bird.__observer__", "bird.lang", "bird.object", "bird.logger" ], function(require) {
    function Router() {
        this.notFoundActionMap = null;
        this.locationMap = {};
    }
    (function() {
        var event = require("bird.event");
        var Observer = require("bird.__observer__");
        var lang = require("bird.lang");
        var object = require("bird.object");
        var logger = require("bird.logger");
        this.actionObserver = new Observer();
        /*********************************************************************
		 *                             控制器
		 ********************************************************************/
        this.start = function() {
            this.watchHash();
            this.bootFirstUrl();
            logger.log("bird.router[use hashChange] started!");
        };
        this.changeHash = function(hash) {
            hash = hash.replace(/^#/, "");
            if (this.lastHash === hash) {
                return;
            }
            location.hash = hash;
        };
        this.getHash = function() {
            var hash = location.hash;
            if (hash) {
                return hash.replace(/^#/, "").replace(/^!/, "") || "/";
            }
            return "/";
        };
        this.watchHash = function() {
            this.lastHash = "";
            var me = this;
            event.addListener(window, "hashchange", function() {
                me.handleHashChange();
            });
        };
        this.handleHashChange = function(hash) {
            hash = hash || this.getHash();
            if (this.lastHash !== hash) {
                this.referrer = this.lastHash;
                this.lastHash = hash;
                this.parseActionQueryParam();
                this.callModule();
            }
        };
        this.parseActionQueryParam = function() {
            var aq = /([^!#~=&]+)(?:~([^#~]*))?/.exec(this.lastHash);
            this.location = "";
            this.query = "";
            this.param = null;
            if (aq) {
                this.location = aq[1] || "";
                this.query = aq[2] || "";
            }
            if (this.query) {
                this.query = decodeURIComponent(this.query);
                var kv = this.param = {};
                this.query.replace(/([^#~=&]+)=([^#~=&]*)/g, function(m, n, k) {
                    kv[n] = k;
                });
                kv = null;
            }
        };
        this.callModule = function() {
            if (this.location) {
                var loc = this.location;
                var la = this.locationMap[loc];
                if (!la) {
                    if (/^\/?[^~#!?]+\/[^~#!?]+/.test(loc)) {
                        var lastSlashIndex = loc.lastIndexOf("/");
                        var locPrefix = loc.substring(0, lastSlashIndex + 1) + "{{";
                        var me = this;
                        object.each(this.locationMap, function(v, k) {
                            if (k.indexOf(locPrefix) === 0) {
                                var key = /\{\{([^~#!?{}]+)\}\}/.exec(k);
                                key = key && key[1];
                                var value = loc.substring(lastSlashIndex + 1);
                                me.param = me.param || {};
                                me.param[key] = value;
                                loc = k;
                                return false;
                            }
                        });
                    }
                    if (loc === this.location && this.notFoundActionMap) {
                        //这里需要替换掉历史记录中不存在的hash记录
                        location.replace(location.href.split("#")[0] + "#!" + this.notFoundActionMap.location);
                        return;
                    }
                }
                this.actionObserver.publish(loc, {
                    param: this.param,
                    query: this.query,
                    location: this.location,
                    referrer: this.referrer
                });
            }
        };
        this.route = function(url, isWholeUrl, replace) {
            if (replace) {
                window.location.replace(url);
                return;
            }
            if (isWholeUrl && !/^#/.test(url)) {
                window.location.href = url;
            } else {
                this.changeHash(url);
            }
        };
        this.bootFirstUrl = function() {
            var me = this;
            lang.nextTick(function() {
                me.handleHashChange();
            });
        };
        this.listenLocation = function(la, handle) {
            if (la.isNotFound) {
                this.notFoundActionMap = la;
            }
            this.locationMap[la.location] = la;
            this.actionObserver.subscribe(la.location, handle);
        };
    }).call(Router.prototype);
    return new Router();
});