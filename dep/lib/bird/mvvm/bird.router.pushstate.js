define("bird.router.pushstate", [ "bird.event", "bird.__observer__", "bird.lang", "bird.object", "bird.logger" ], function(require) {
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
            this.watchLocation();
            this.bootFirstUrl();
            logger.log("bird.router[use pushState] started!");
        };
        this.changeLocation = function(loc) {
            loc = loc.replace(/^#!/, "");
            if (this.lastLocation === loc) {
                return;
            }
            loc = loc.indexOf("?") === 0 ? loc : "?" + loc;
            history.pushState({
                loc: loc
            }, null, location.pathname + loc);
            this.handleLocationChange(loc);
        };
        this.getLocation = function() {
            if (history.state && history.state.loc) {
                return history.state.loc;
            }
            var loc = location.search;
            return loc || "?/";
        };
        this.watchLocation = function() {
            this.lastLocation = "";
            var me = this;
            event.addListener(window, "popstate", function(e) {
                e.preventDefault();
                var loc = e.state && e.state.loc;
                me.handleLocationChange(loc);
            });
            event.delegate("a", "click", function(e) {
                var hrefAttrValue = e.target.getAttribute("href");
                if (hrefAttrValue && hrefAttrValue.indexOf("#!") === 0) {
                    e.preventDefault();
                    hrefAttrValue = hrefAttrValue.replace(/^#!/, "");
                    if (hrefAttrValue.indexOf("?") === -1) {
                        hrefAttrValue = "?" + hrefAttrValue;
                    }
                    me.handleLocationChange(hrefAttrValue);
                }
            }, document);
        };
        this.handleLocationChange = function(loc) {
            loc = loc || this.getLocation();
            if (this.lastLocation !== loc) {
                this.referrer = this.lastLocation;
                this.lastLocation = loc;
                if (!history.state || history.state.loc != loc) {
                    history.pushState({
                        loc: loc
                    }, "", loc);
                }
                this.parseActionQueryParam();
                this.callModule();
            }
        };
        this.parseActionQueryParam = function() {
            var aq = /([^!~=&?]+)(?:~([^~?]*))?/.exec(this.lastLocation);
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
                this.query.replace(/([^~=&?]+)=([^~=&?]*)/g, function(m, n, k) {
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
                        //这里需要替换掉历史记录中不存在的location记录
                        var search = "?" + this.notFoundActionMap.location;
                        history.replaceState({
                            loc: search
                        }, null, location.pathname + search);
                        this.handleLocationChange(search);
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
            if (isWholeUrl && !/^#!/.test(url)) {
                window.location.href = url;
            } else {
                this.changeLocation(url);
            }
        };
        this.bootFirstUrl = function() {
            var me = this;
            lang.nextTick(function() {
                me.handleLocationChange();
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