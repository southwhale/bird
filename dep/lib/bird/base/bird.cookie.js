/**
 * cookie helper
 *
 */
define("bird.cookie", [], function(require) {
    function Cookie() {
        this.length = 0;
    }
    (function() {
        /*this.getItem = function(sKey) {
			if (!sKey || !this.hasOwnProperty(sKey)) {
				return null;
			}
			return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
		};*/
        //this.key = function(nKeyId) {
        //return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
        //};
        /*this.setItem = function(sKey, sValue, expireDays) {
			if (!sKey) {
				return;
			}
			var s = escape(sKey) + "=" + escape(sValue);
			if(expireDays) {
				var expireDate = new Date();
				expireDate.setDate(expireDate.getDate() + expireDays);
				s += ";expires=" + expireDate.toGMTString();
			} 
			s += "; path=/";
			document.cookie = s;
			this.length = document.cookie.match(/\=/g).length;
		};

		this.removeItem = function(sKey) {
			if (!sKey || !this.hasOwnProperty(sKey)) {
				return;
			}
			var sExpDate = new Date();
			sExpDate.setDate(sExpDate.getDate() - 1);
			document.cookie = escape(sKey) + "=; expires=" + sExpDate.toGMTString() + "; path=/";
			this.length--;
		};

		this.hasOwnProperty = function(sKey) {
			return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
		};*/
        /**
	     * 设置Cookie的值
	     *
	     * @public
	     * @param {string} name cookie键名
	     * @param {string} value cookie原始值
	     * @param {Object=} options cookie选项
	     * @param {boolean=} options.raw 是否不自动编码
	     * @param {(number= | Date=)} options.expires 有效期，为数字时单位为毫秒
	     * @param {string=} options.domain 域名
	     * @param {string=} options.path 路径
	     * @param {boolean=} options.secure 是否安全传输
	     */
        this.setItem = function(name, value, options) {
            if (!isValidName(name)) {
                return;
            }
            options = options || {};
            var date = options.expires;
            if ("number" === typeof date) {
                date = new Date();
                date.setTime(date.getTime() + options.expires);
            }
            document.cookie = name + "=" + (options.raw ? value : encodeURIComponent(value)) + (date instanceof Date ? "; expires=" + date.toUTCString() : "") + (options.domain ? "; domain=" + options.domain : "") + (options.path ? "; path=" + options.path : "") + (options.secure ? "; secure" : "");
            this.length = document.cookie.match(/\=/g).length;
        };
        /**
	     * 获取Cookie的值
	     *
	     * @public
	     * @param {string} name cookie键名
	     * @param {Object=} options cookie选项
	     * @param {boolean=} options.raw 是否不自动编码
	     * @return {?string} 获取的cookie值，获取不到时返回null
	     */
        this.getItem = function(name, options) {
            options = options || {};
            return parseCookie(isValidName(name) ? name : "", !options.raw);
        };
        /**
	     * 删除Cookie
	     *
	     * @public
	     * @param {string} name 需要删除cookie的键名
	     * @param {Object=} options 需要删除cookie的配置
	     * @param {string=} options.domain 域名
	     * @param {string=} options.path 路径
	     * @param {boolean=} options.secure 是否安全传输
	     */
        this.removeItem = function(name, options) {
            options = options || {};
            options.raw = !0;
            options.expires = new Date(0);
            this.setItem(name, "", options);
            this.length--;
        };
        /**
	     * 空字符串检查
	     *
	     * @inner
	     * @param {?string} str 目标字符串
	     * @return {boolean}
	     */
        function isNotEmptyString(str) {
            return typeof str === "string" && str !== "";
        }
        /**
	     * 验证字符串是否合法的cookie键名
	     *
	     * @inner
	     * @param {string} name 待验证的键名字符串
	     * @return {boolean}
	     */
        function isValidName(name) {
            return isNotEmptyString(name);
        }
        /**
	     * 解析Cookie
	     *
	     * @inner
	     * @param {string} name cookie键名
	     * @param {boolean} needDecode 是否自动解码
	     * @return {?string} 获取的cookie值，获取不到时返回null
	     */
        function parseCookie(name, needDecode) {
            if (isNotEmptyString(name)) {
                var matches = String(document.cookie).match(new RegExp("(?:^| )" + name + "(?:(?:=([^;]*))|;|$)"));
                if (matches) {
                    if (matches = matches[1]) {
                        return needDecode ? decodeURIComponent(matches) : matches;
                    }
                    return "";
                }
            }
            return null;
        }
    }).call(Cookie.prototype);
    return new Cookie();
});