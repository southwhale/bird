/**
 * 该模块用来过滤处理模板变量的实际值
 */
define("bird.filter", [ "bird.array" ], function(require) {
    var array = require("bird.array");
    function Filter() {}
    (function() {
        var filterMap = {
            "int": function(value) {
                return parseInt(value);
            },
            //保留n位小数
            "float": function(value, n) {
                return parseFloat(value).toFixed(n);
            },
            RMB: function(value) {
                return "RMB" + value;
            },
            dollar: function(value) {
                return "$" + value;
            },
            date: function(value, format) {}
        };
        //添加多个过滤器时需要注意上个过滤器对value处理的结果对下个过滤器的影响
        this.filter = function(value, filter) {
            var filters = filter.split(/\s+/);
            array.forEach(filters, function(f) {
                var fs = f.split(":");
                var ft = fs[0];
                var handle = filterMap[ft];
                if (handle) {
                    var args = fs[1] ? fs[1].split(",") : [];
                    args.unshift(value);
                    value = handle.apply(null, args);
                }
            });
            return value;
        };
    }).call(Filter.prototype);
    return new Filter();
});