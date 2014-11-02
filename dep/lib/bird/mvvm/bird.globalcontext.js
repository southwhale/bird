/**
 * 全局环境缓存区
 * 挂载在window.globalContext下
 */
define("bird.globalcontext", [ "bird.lang" ], function(require) {
    var lang = require("bird.lang");
    var ctx = window;
    function GlobalContext() {
        ctx.globalContext = {};
    }
    (function() {
        this.set = function(key, value) {
            ctx.globalContext[key] = value;
        };
        this.get = function(key) {
            return ctx.globalContext[key];
        };
        this.getObject = function(literal) {
            literal = literal.replace(/^globalContext\./, "");
            var words = literal.split(".");
            var word;
            if (words.length === 1) {
                word = words[0];
                ctx.globalContext[word] = ctx.globalContext[word] || {};
                return ctx.globalContext[word];
            }
            var _ctx = ctx.globalContext;
            for (var i = 0, len = words.length; i < len; i++) {
                var namespace = _ctx[words[i]];
                if (lang.isNullOrUndefined(namespace)) {
                    namespace = {};
                    _ctx[words[i]] = namespace;
                }
                _ctx = namespace;
            }
            return _ctx;
        };
        this.getObjectLiteral = function(str) {
            str = str.replace(/^globalContext\./, "");
            return "globalContext." + str;
        };
        this.remove = function(key) {
            return delete ctx.globalContext[key];
        };
    }).call(GlobalContext.prototype);
    return new GlobalContext();
});