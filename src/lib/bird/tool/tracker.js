/**
	tracker.js
	跟踪访客行为
		基本跟踪：
		1.访客来源和去向（跟踪url，document.referrer）
		2.页面停留时间
		3.系统环境（操作系统、浏览器版本、分辨率、颜色深度）
		4.访客地域（服务器端根据访客IP判定）
		精准跟踪：
		1.事件监听（针对点击事件，左击或右击或双击，构造一个二维图，x轴表示事件戳，y轴表示点击事件的触发信息，
		包括触发的元素（超链接为主，链接的目标url，和描述）、坐标；针对鼠标移动和滚轮事件，标示访客正在浏览使用页面，
		若超过一定时间，任何鼠标和键盘事件都没触发则可标示访客当前没在浏览和使用页面）
		
*/
;
(function(ctx) {

	Date.now = Date.now || function() {
		return new Date().getTime();
	};

	var slice = Array.prototype.slice,
		toString = Object.prototype.toString,
		subclass = {
			classMap: {},
			instanceMap: {}
		},
		enterTime = Date.now(),
		uid = 0,
		screen = ctx.screen;



	var tracker = function() {

	};

	tracker.extend = function(des, src) {
		var srcargs, i, len, tmpObj;
		if (arguments.length == 1) {
			tmpObj = des;
			des = this;
			src = tmpObj;
		} else if (arguments.length > 2) {
			srcargs = slice.call(arguments, 1);
			for (i = 0, len = srcargs.length; i < len; i++) {
				arguments.callee.call(des, srcargs[i]);
			}
		}

		for (i in src) {
			if (src.hasOwnProperty(i)) {
				des[i] = src[i];
			}
		}

		return des;
	};

	//public method
	tracker.extend({
		originTracker: function() {
			var _tracker = this._tracker;
			delete this._tracker;
			return _tracker;
		},
		//初始化配置
		init: function(cfg) {
			cfg = cfg || {};
			this.extend(subclass.uriTemplateMap = {}, cfg.uriTemplateMap); //统计数据提交的uri模板映射
			subclass.sessionKey = cfg.sessionKey || "pack";
			subclass.actionDomain = cfg.actionDomain; //统计数据提交的服务器域名
			subclass.protocol = cfg.protocol || "http";
			this.on(window, "beforeunload", function() {
				var pt = subclass.instanceMap["pt"],
					wa = subclass.instanceMap["wa"];

				pt && pt.buildDuration(wa && wa.lastActiveTime());
				wa && wa.clearTimer();
				var handleMap = {
					pv: function(ins) {
						return {
							pt: ins.get("pt"),
							rf: ins.get("rf"),
							sc: ins.get("sc")
						};
					},
					ea: function(ins) {
						var pathStr = "";
						tracker.each(ins.getClickPath(), function(path) {
							pathStr += path.timestamp + "_" + path.pos.x + "_" + path.pos.y + " ";
						});
						return {
							t_x_y: pathStr.replace(/\s+$/, "")
						};
					}
				};
				tracker.each(subclass.uriTemplateMap, function(uriTpl, key) {
					var ins = subclass.instanceMap[key];
					handleMap[key] && (ins = handleMap[key](ins));
					var url;
					if (ins) {
						url = tracker.buildUrl(uriTpl, tracker.flat(ins));
						tracker.request(url);
					}
				});
			}, false);
		},
		buildUrl: function(uriTemplate, params) {
			return subclass.protocol + "://" + subclass.actionDomain + (/\/+$/.test(subclass.actionDomain) ? "" : "/") + uriTemplate.replace(/\{([a-zA-Z0-9]+)\}/g, function(m, i, o, ns) {
				return isFunction(params[i]) ? "" : tracker.encode(params[i]);
			});
		},
		create: function(classname) {
			return subclass.instanceMap[classname] = new subclass.classMap[classname](slice.call(arguments, 1));
		},
		request: function(url, callback) {
			var img = subclass.img || (subclass.img = new Image());
			if (isFunction(callback)) {
				img.onerror = function() {
					img.onerror = null;
					callback.call(this, arguments);
				}
			}
			url = url.replace(/[?&]+$/, "");
			url += (/\?\w+/.test(url) ? "&" : "?");
			var cookie = document.cookie;
			var cookieRE = new RegExp(";?\\s*" + subclass.sessionKey + "\\s*=\\s*([\\w-!]*);");
			url += subclass.sessionKey + "=" + (cookie && cookieRE.test(cookie) ? RegExp.$1 : "");

			img.src = url + "&" + this.nextUid();
		},
		nextUid: function() {
			return ++uid;
		},
		encode: function(s) {
			return encodeURIComponent(s);
		},
		each: function(arraylike, fn) {
			var i;
			if (isPlainObj(arraylike)) {
				for (i in arraylike) {
					if (arraylike.hasOwnProperty(i)) {
						fn(arraylike[i], i, arraylike);
					}
				}
			} else {
				for (i = 0; i < arraylike.length; i++) {
					fn(arraylike[i], i, arraylike);
				}
			}
		},
		flat: function(obj) {
			var rtnObj = {};
			(function(obj) {
				var _arguments = arguments;
				tracker.each(obj, function(value, key) {
					if (isPlainObj(value)) {
						_arguments.callee(value)
					} else {
						rtnObj[key] = value;
					}
				});
			})(obj);

			return rtnObj;
		},
		on: function(elem, event, callback, capture) {
			var evts = event.split(/\s+/);
			var cb = callback;
			cb._wrapCallback = callback = function(e) {
				e = e || window.event;
				e.target = e.target || e.srcElement;
				e.preventDefault = e.preventDefault || function() {
					e.returnValue = false;
				};
				e.stopPropagation = e.stopPropagation || function() {
					e.cancelBubble = true;
				};
				e._timeStamp = Date.now(); //解决firefox时间戳和IE无时间戳的问题，e.timeStamp不可覆写，所以定义额外的e._timeStamp属性
				cb.call(elem, e);
			};

			this.each(evts, function(event) {
				if (document.addEventListener) {
					elem.addEventListener(event, callback, capture);
				} else if (document.attachEvent) {
					elem.attachEvent("on" + event, callback);
				} else {
					var _callback = elem["on" + event] || function() {};
					_callback.fns = _callback.fns || [_callback];
					if (isFunction(callback)) {
						_callback.push(callback);
					}
					if (!elem["on" + event]) {
						elem["on" + event] = function() {
							tracker.each(_callback.fns, function(fn, i, fns) {
								fn();
							});
						};
					}
				}
			});

		},
		off: function(elem, event, callback, capture) {
			var evts = event.split(/\s+/);
			callback = callback._wrapCallback;
			this.each(evts, function(event) {
				if (document.removeEventListener) {
					elem.removeEventListener(event, callback, capture);
				} else if (document.detachEvent) {
					elem.detachEvent("on" + event, callback);
				} else {
					var _callback = elem["on" + event] || function() {};
					_callback.fns = _callback.fns || [_callback];
					if (isFunction(callback)) {
						tracker.each(_callback.fns, function(fn, i, fns) {
							if (fn === callback) {
								fns.slice(i, 1);
							}
						});
					}
				}
			});
		}
	});

	//private subclass
	tracker.extend(subclass.classMap, {
		//page view
		pv: function(classes) {
			classes = (classes && classes.length) ? classes : ["pt", "rf", "sc"];
			tracker.each(classes, function(classname) {
				if (!subclass.instanceMap[classname]) {
					tracker.create(classname);
				}
			});

			this.get = function(k) {
				return subclass.instanceMap[k];
			};
		},
		//page time
		pt: function() {
			this.enterTime = enterTime;
			this.buildDuration = function(lastActiveTime) {
				this.exitTime = lastActiveTime || Date.now();
				this.duration = (this.exitTime - this.enterTime) / 1000; //seconds
			};

		},
		//referrer
		rf: function() {
			this.from = document.referrer;
			this.location = window.location.href;
			this.to = "";
			var self = this;
			tracker.on(document, "click", function(e) {
				var target = e.target;
				if (target.nodeType == 1 && target.tagName === 'A' && target.target != "_blank") {
					var locationRE = new RegExp(self.location.match(/([\w-.:/]+)!?#?/)[1]);
					!locationRE.test(target.href) && (self.to = target.href);
				}
			}, true);
		},
		//system context: os , browser , pixelDepth , screen
		sc: function() {
			this.lang = navigator.language ? navigator.language : navigator.systemLanguage; //客户端使用的语言
			this.resolution = screen.width + "X" + screen.height;
			this.pageSize = (document.body.scrollWidth || document.documentElement.scrollWidth) + "X" + (document.body.scrollHeight || document.documentElement.scrollHeight);
			this.colorDepth = screen.pixelDepth || screen.colorDepth;
			var ua = navigator.userAgent.toLowerCase();
			this.isMobile = /mobile/.test(ua);
			this.isIPAD = /ipad/.test(ua);
			this.isIPHONE = /iphone/.test(ua);
			this.isIOS = /ipad|iphone|ipod/.test(ua);
			this.isBB = /blackberry/.test(ua);
			this.isNOKIA = /nokia/.test(ua);
			this.isSYMBIAN = /symbianos/.test(ua);
			this.isANDROID = /android/.test(ua);
			this.isWP = /windows phone/.test(ua);

			var deviceType = (/ipad|iphone|android|blackberry|windows phone|windows mobile|win 9x|windows nt|mac os/.exec(ua) || ["unknown"])[0];

			var handleMap = {
				ipad: function(ua) {
					var os = ua.match(/os\s+[\d_.]+/)[0];
					return 'ipad i' + os.replace(/_/g, '.');
				},
				iphone: function(ua) {
					var os = ua.match(/os\s+[\d_.]+/)[0];
					return 'iphone i' + os.replace(/_/g, '.');
				},
				android: function(ua) {
					return ua.match(/android\s+[\d.]+/)[0];
				},
				"windows phone": function(ua) {
					return "wp " + ua.match(/os\s+([\d.]+)/)[1];
				},
				"windows mobile": "windows mobile",
				"win 9x": "win 9x",
				"windows nt": function(ua) {
					var nt = {
						"4.0": "nt 4.0",
						"5.0": "2000",
						"5.1": "xp",
						"5.2": "2003",
						"6.0": "vista",
						"6.1": "7",
						"6.2": "8"
					};
					return "win " + nt[ua.match(/nt\s+([\d.]+)/)[1]];
				},
				blackberry: "blackberry",
				"mac os": "mac os",
				unknown: "unknown os"
			};


			this.os = handleMap[deviceType];
			isFunction(this.os) && (this.os = this.os(ua));

			this.browser = /ios/.test(this.os) && !/opera/.test(ua) && /version/.test(ua) ? "safari" : "";
			this.browser = this.browser || (/android/.test(this.os) && !/opera/.test(ua) && /version/.test(ua) ? "android webkit浏览器" : "");


			if (!this.browser) {

				var browserType = (/metasr|taobrowser|qqbrowser|maxthon|lbbrowser|(?:ucbrowser|ucweb)/.exec(ua) || /(?:msie|slcc)|(?:firefox|gecko\/)|opera|(?:chrome|crios)|iemobile/.exec(ua) || ["unknown"])[0];

				var browser = {
					metasr: "搜狗浏览器",
					taobrowser: "淘宝浏览器",
					qqbrowser: "QQ浏览器",
					maxthon: "遨游浏览器",
					lbbrowser: "猎豹浏览器",
					msie: function(ua) {
						return "ie " + ua.match(/msie\s+(\d+)(?:\.\d+)?/)[1];
					},
					slcc: function(ua) {
						return "ie " + ua.match(/rv:(\d+)(?:\.\d+)?/)[1];
					},
					firefox: "firefox",
					"gecko/": "firefox",
					opera: "opera",
					chrome: "chrome",
					crios: "chrome",
					iemobile: "移动IE浏览器",
					unknown: "unknown browser"
				};

				this.browser = this.browser || browser[browserType];
				isFunction(this.browser) && (this.browser = this.browser(ua));
			}
		},
		//regional
		rg: function() {
			//该功能只能由服务器端实现：获取ip，查询区域
			//地理定位功能需要征询访问者授权，体验不好，也不能保证访问者愿意授权
		},
		//event axis
		ea: function() {
			var clickPath = [];
			tracker.on(document, "click", function(e) {
				var path = {
					timestamp: e._timeStamp,
					pos: getMousePos(e)
				};
				clickPath.push(path);
				var target = e.target;
				var info;
				if (/^INPUT/.test(target.tagName) && /button|checkbox|radio/i.test(target.type) || /^A|BUTTON/.test(target.tagName)) {
					info = getBaseInfo(target);
					tracker.extend(info, path, {
						value: (function() {
							var rtnv;
							/^INPUT/.test(target.tagName) && !/button/i.test(target.type) && (rtnv = target.value);
							/^A/.test(target.tagName) && !/javascript\s*:\s*|[()]+/i.test(target.href) && (rtnv = target.href);
							rtnv = rtnv || "";
							return rtnv;
						})()
					});
					request(info);
				}

			}, false);

			tracker.on(document, "blur", function(e) {
				var target = e.target;
				var info;
				if (/^INPUT/.test(target.tagName) && !/button|checkbox|radio/i.test(target.type) || /^TEXTAREA/.test(target.tagName)) {
					info = getBaseInfo(target);
					info.value = (function() {
						var rtnv;
						/^INPUT/.test(target.tagName) && (rtnv = target.value);
						/^TEXTAREA/.test(target.tagName) && (rtnv = target.value || target.textContent || target.innerText);
						rtnv = rtnv || "";
						return rtnv;
					})();
					request(info);

				} else if (target.getAttribute("oTitle") || target.getAttribute("oType") || target.getAttribute("pa_beacon_name")) {
					info = getBaseInfo(target);
					request(info);
				}
			}, true);

			tracker.on(document, "change", function(e) {
				var target = e.target;
				var info;
				if (/^SELECT/.test(target.tagName)) {
					info = getBaseInfo(target);
					info.value = target.value;
					request(info);
				}
			}, true);

			this.getClickPath = function() {
				return clickPath;
			};

			function request(info) {
				var uriTpl = subclass.uriTemplateMap["is"];
				var url = tracker.buildUrl(uriTpl, tracker.flat(info));
				tracker.request(url);
			}

			function getBaseInfo(target) {
				return {
					tagName: target.tagName,
					shortInfo: target.getAttribute("shortInfo") || "",
					beaconName: target.getAttribute("pa_beacon_name") || "",
					oTitle: target.getAttribute("oTitle") || "",
					oType: target.getAttribute("oType") || "",
					id: target.id
				};
			}

			function getMousePos(e) {
				return {
					x: e.pageX || (e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)),
					y: e.pageY || (e.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
				};
			}

		},
		//watch active 检测是否处于活动状态
		wa: function(minutes) {
			var isActive = true,
				timer, activeTime,
				interval = (minutes || 5) * 60000;
			buildTimer();

			tracker.on(document, "click contextmenu mousewheel DOMMouseScroll touchstart touchmove touchend", function(e) {
				//在非IE浏览器中，若dblclick事件被触发，那么click事件必然被触发；
				//在IE中若没有监听dblclick事件只监听click事件，那么双击行为也会激活click事件的触发
				//所以，这里只监听click事件
				isActive = true;
				buildTimer();
			}, true);

			this.checkActive = function() {
				return isActive;
			};

			this.clearTimer = clearTimer;
			this.lastActiveTime = function() {
				return activeTime;
			};

			function buildTimer() {
				clearTimer();
				timer = setTimeout(function() {
					isActive = false;
					activeTime = Date.now() - interval;
				}, interval);
			}

			function clearTimer() {
				if (timer) {
					clearTimeout(timer);
					timer = null;
				}
			}
		}
	});

	tracker.extend(tracker.prototype, {

	});

	function isFunction(p) {
		return typeof p === "function";
	}

	function isArray(p) {
		return Array.isArray ? Array.isArray(p) : (toString.call(p) === "[object Array]");
	}

	function isPlainObj(p) {
		return toString.call(p) === "[object Object]";
	}



	if (ctx.Tracker) {
		tracker._tracker = ctx.Tracker;
	}
	ctx.Tracker = tracker;

})(this);