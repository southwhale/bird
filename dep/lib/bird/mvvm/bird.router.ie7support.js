define("bird.router.ie7support", [ "bird.event", "bird.browser", "bird.lang", "bird.__observer__", "bird.object" ], function(require) {
    function Router() {
        this.notFoundActionMap = null;
        this.locationMap = {};
    }
    (function() {
        var event = require("bird.event");
        var browser = require("bird.browser");
        var lang = require("bird.lang");
        var Observer = require("bird.__observer__");
        var object = require("bird.object");
        this.actionObserver = new Observer();
        /*********************************************************************
		 *                             控制器
		 ********************************************************************/
        this.start = function() {
            this.init();
            this.watchHash();
            this.bootFirstUrl();
            console.log("bird.router[ie7support] started!");
        };
        this.init = function() {
            var ieVersion = /ie\s*(\d+)/.exec(browser.browser);
            ieVersion = ieVersion && ieVersion[1];
            //IE7及以下版本不支持hash history,即改变hash不会存储到history记录中
            this.isHashHistoryNotSupported = ieVersion && ieVersion < 8;
            var doc = document;
            var documentMode = doc.documentMode;
            this.isHashChangeSupported = "onhashchange" in window && (lang.isUndefined(documentMode) || documentMode > 7);
            this.needIframeHistory = !this.isHashChangeSupported || this.isHashHistoryNotSupported;
            if (this.needIframeHistory) {
                this.HISTORY_IFRAME_URL = "./js/lib/bird/mvvm/__history__.html";
                var iframe = doc.createElement("IFRAME");
                iframe.src = this.HISTORY_IFRAME_URL + "?" + this.getHash();
                iframe.style.display = "none";
                iframe.style.position = "absolute";
                iframe.style.left = "-9999px";
                iframe.style.top = "-9999px";
                iframe.width = "0";
                iframe.height = "0";
                iframe.scrolling = "no";
                doc.body.insertBefore(iframe, doc.body.firstChild);
                this.historyIframe = iframe;
                iframe = iframeWindow = ieVersion = null;
            }
        };
        this.changeHash = function(hash) {
            if (this.lastHash === hash) {
                return;
            }
            if (this.needIframeHistory) {
                this.changeIframeUrl(hash);
            } else {
                location.hash = hash;
            }
        };
        this.changeIframeUrl = function(hash) {
            //this.historyIframe.src = this.historyIframe.src.replace(/\?.*/,'') + '?' + hash;
            this.historyIframe.contentWindow.location.href = this.HISTORY_IFRAME_URL + "?" + hash;
        };
        this.getHash = function() {
            // firefox下location.hash会自动decode
            // 体现在：
            //   视觉上相当于decodeURI，
            //   但是读取location.hash的值相当于decodeURIComponent
            // 所以需要从location.href里取出hash值
            /*var hash = location.hash;
				if (browser.isFirefox()) {
					hash = location.href.match(/#(.*)$/);
					hash && (hash = hash[1]);
				}

				if (hash) {
					return hash.replace(/^#/, '');
				}

				return '';*/
            //以上为网络上可以找到的实现,
            //以下为我自己的实现
            var hash = location.hash;
            //通过js改变hash好像不存在上述的问题
            /*if (hash && browser.isFirefox()) {
				hash = encodeURI(hash);
				}*/
            if (hash) {
                return hash.replace(/^#/, "").replace(/^!/, "") || "/";
            }
            return "/";
        };
        this.getIframeHash = function() {
            var hashes = /\?(.+)/.exec(this.historyIframe.contentWindow.location.href);
            return hashes && hashes[1] || "/";
        };
        this.watchHash = function() {
            this.lastHash = "";
            var me = this;
            if (this.needIframeHistory) {
                //iframe.onload的形式挂载回调函数在某些浏览器（如IE7）不能被正常的触发
                event.addListener(this.historyIframe, "load", function(e) {
                    var hash = me.getIframeHash();
                    if (!hash) {
                        hash = "/";
                    }
                    location.hash = hash;
                    me.handleHashChange(hash);
                });
            } else {
                event.addListener(window, "hashchange", function() {
                    me.handleHashChange();
                });
            }
            /*
			 * IE7及以下版本浏览器不支持onhashchange事件,那么针对用户在浏览器地址栏修改hash的行为无法给出正确的响应,
			 * 这里使用'定时器轮询'来检测并给出响应
			 */
            if (!this.isHashChangeSupported) {
                if (this.hashPollInterval) {
                    clearInterval(this.hashPollInterval);
                    this.hashPollInterval = null;
                }
                this.hashPollInterval = setInterval(function() {
                    me.changeHash(me.getHash());
                }, 100);
            }
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
                        this.route("!" + this.notFoundActionMap.location);
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
        this.route = function(url, isNotHash) {
            if (isNotHash && !/^#/.test(url)) {
                window.location.href = url;
            } else {
                this.changeHash(url.replace(/^#/, ""));
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