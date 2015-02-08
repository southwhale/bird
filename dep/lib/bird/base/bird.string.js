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
        var htmlCommentsRE = /<!--(?:.|\r|\n)*?-->/g;
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
        this.removeHtmlComments = function(str) {
            return str.replace(htmlCommentsRE, "");
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
        this.escapeRegExp = function(s) {
            return s.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        };
        this.format = function(template, data, callback) {
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
                if (typeof callback === "function") {
                    callback(key, data);
                }
                return replacer == null ? "" : replacer;
            });
        };
        this.startWith = function(origin, startStr, isIgnoreCase) {
            if (origin.length < startStr.length) {
                return false;
            }
            if (isIgnoreCase) {
                origin = origin.toLowerCase();
                startStr = startStr.toLowerCase();
            }
            return origin.indexOf(startStr) === 0;
        };
        this.endWith = function(origin, endStr, isIgnoreCase) {
            if (origin.length < endStr.length) {
                return false;
            }
            if (isIgnoreCase) {
                origin = origin.toLowerCase();
                endStr = endStr.toLowerCase();
            }
            return origin.lastIndexOf(endStr) === origin.length - endStr.length;
        };
        /**
         * kmpSearch
         * @param {string} [source] 源字符串
         * @param {string} [subject] 需要搜索的子字符串
         * @return {Integer} 子字符串在源字符串中的位置索引
         */
        this.search = function(source, subject) {
            var srcLen = source.length;
            var subLen = subject.length;
            var pattern = [];
            prefix(subject, pattern);
            for (var index = 0, p = 0; index < srcLen; index++) {
                if (source.charAt(index) == subject.charAt(p)) {
                    p++;
                    if (p == subLen) return index - subLen + 1;
                } else {
                    p = pattern[p];
                }
            }
            return -1;
        };
        /**
         * 对字符中进行HTML编码
         *
         * @param {string} [source] 源字符串
         * @param {string} HTML编码后的字符串
         */
        this.encodeHTML = function(source) {
            source = source + "";
            return source.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        };
        function prefix(subject, pattern) {
            var subLen = subject.length;
            pattern[0] = 0;
            for (var i = 1, k = 0; i < subLen; i++) {
                while (subject.charAt(i) != subject.charAt(k) && k > 0) {
                    k = pattern[k];
                }
                if (subject.charAt(i) == subject.charAt(k)) {
                    k++;
                }
                pattern[i] = k;
            }
        }
    }).call(_String.prototype);
    return new _String();
});