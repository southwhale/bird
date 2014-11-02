define("bird.string", [], function(require) {
    function _String() {}
    (function() {
        /*********************************************************************
		 *                             字符串操作
		 ********************************************************************/
        var capitalizeRE = /^\w/;
        var duplicateCharRE = /(.)\1+/g;
        var htmlTagsRE = /(?:<[a-zA-Z]+\d*(?:\s+[^>]+\s*)*>)|(?:<\/[a-zA-Z]+\d*>)/g;
        var spaceRE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;
        var camelizeRE = /-([a-z])/gi;
        var placeholderRE = /\{\{(.+?)\}\}/g;
        var spaceBetweenTagsRE = /(<[a-zA-Z]+\d*\s*[^>]*\/?>)[\s\xa0\u3000]+|(<\/[a-zA-Z]+\d*>)[\s\xa0\u3000]+|[\s\xa0\u3000]+(<[a-zA-Z]+\d*\s*[^>]*\/?>)|[\s\xa0\u3000]+(<\/[a-zA-Z]+\d*>)/g;
        var bothEndQuotesRE = /(['"])([^'"])\1/;
        this.capitalize = function(str) {
            return str.replace(capitalizeRE, function(s) {
                return s.toUpperCase();
            });
        };
        this.removeDuplicateChar = function(str) {
            return str.replace(duplicateCharRE, "$1");
        };
        //删除两端引号（单引号或双引号）
        this.removeBothEndQuotes = function(str) {
            return str.replace(bothEndQuotesRE, "$2");
        };
        /**
		 * 剔除html标签,但类似<1> <2>这样数字编号的被保留,示例如下：
		 * var html = "<p><a href='http://sailinglee.iteye.com'>this is a string</a> <1> by <em>李伟</em></p>";
         * var text = string.removeHtmlTags(html);
         * alert(text)//this is a tring <1> by 李伟
		 **/
        //删除Html标签，保留innerText内容
        this.removeHtmlTags = function(str) {
            return str.replace(htmlTagsRE, "");
        };
        this.removeSpaceBetweenTags = function(str) {
            return str.replace(spaceBetweenTagsRE, function(m, n, o, p, q) {
                return n || o || p || q || "";
            });
        };
        //\xa0 -> &nbsp;    \u3000 -> 全角空格
        this.trim = function(s) {
            return s.replace(spaceRE, "");
        };
        this.equalsIgnoreCase = function(s, d) {
            return s.toLowerCase() === d.toLowerCase();
        };
        this.camelize = function(s) {
            return s.replace(camelizeRE, function(m, char) {
                return char.toUpperCase();
            });
        };
        this.format = function(template, data) {
            if (!template) {
                return "";
            }
            if (data == null) {
                return template;
            }
            return template.replace(placeholderRE, function(match, key) {
                var replacer = data[key];
                if (typeof replacer === "function") {
                    replacer = replacer(key);
                }
                return replacer == null ? "" : replacer;
            });
        };
    }).call(_String.prototype);
    return new _String();
});