/**
 * cookie helper
 *
 */
define("bird.cookie", [], function(require) {
    function Cookie() {
        this.length = 0;
    }
    (function() {
        this.getItem = function(sKey) {
            if (!sKey || !this.hasOwnProperty(sKey)) {
                return null;
            }
            return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
        };
        this.key = function(nKeyId) {
            return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
        };
        this.setItem = function(sKey, sValue, expireDays) {
            if (!sKey) {
                return;
            }
            var s = escape(sKey) + "=" + escape(sValue);
            if (expireDays) {
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
            return new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie);
        };
    }).call(Cookie.prototype);
    return new Cookie();
});