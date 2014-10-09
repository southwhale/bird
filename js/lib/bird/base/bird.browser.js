define(function(require) {
	/*********************************************************************
	 *                             浏览器及系统信息
	 ********************************************************************/
	function Browser() {
		this.init();
	}

	(function() {
		var doc = document;
		var lang = require('./bird.lang');

		this.init = function() {
			this.lang = navigator.language ? navigator.language : navigator.systemLanguage; //客户端使用的语言
			this.resolution = {
				width: screen.width,
				height: screen.height
			};
			this.pageSize = {
				width: doc.body.scrollWidth || doc.documentElement.scrollWidth,
				height: doc.body.scrollHeight || doc.documentElement.scrollHeight
			};
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
			lang.isFunction(this.os) && (this.os = this.os(ua));

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
				lang.isFunction(this.browser) && (this.browser = this.browser(ua));
			};

			var isFirefox = this.browser === 'firefox';
			var isIE = /ie/.test(this.browser);
			var isIE8 = this.browser === 'ie 8';
			if(isIE){
				var arr = this.browser.split(/\s+/);
				var ieVersion = arr && (+arr[1]);
			}

			this.isFirefox = function() {
				return isFirefox;
			};

			this.isIE = function() {
				return isIE;
			};

			this.getIEVersion = function(){
				return ieVersion;
			};

			//奇葩的IE,各版本总会有各种奇葩问题
			this.isIE8 = function(){
				return isIE8;
			};
		}
	}).call(Browser.prototype);

	return new Browser();
});