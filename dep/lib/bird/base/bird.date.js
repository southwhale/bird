define("bird.date", [ "moment" ], function(require) {
    var moment = require("moment");
    function _Date() {}
    (function() {
        this.dateFormats = [ "YYYYMMDDHHmmss", "YYYY-MM-DD HH:mm:ss", "YYYY/MM/DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss.SSSZ" ];
        this.now = function() {
            return Date.now ? Date.now() : new Date().getTime();
        };
        /**
         * 对目标日期对象进行格式化
         *
         * 具体支持的格式参考
         * [moment文档](http://momentjs.com/docs/#/displaying/format/)
         *
         * @param {Date} source 目标日期对象
         * @param {string} pattern 日期格式化规则
         * @return {string} 格式化后的字符串
         */
        this.format = function(source, pattern) {
            return moment(source).format(pattern);
        };
        /**
         * 将目标字符串转换成日期对象
         *
         * 具体支持的格式参考
         * [moment文档](http://momentjs.com/docs/#/displaying/format/)
         *
         * 默认使用{@link lib.date#dateFormats}作为解析格式
         *
         * @param {string} source 目标字符串
         * @param {string} [format] 指定解析格式，
         * 不提供此参数则使用{@link lib.date#dateFormats}作为解析格式，
         * 由于默认包含多个格式，这将导致性能有所下降，因此尽量提供明确的格式参数
         * @return {Date} 转换后的日期对象
         */
        this.parse = function(source, format) {
            var dateTime = moment(source, format || this.dateFormats);
            return dateTime.toDate();
        };
    }).call(_Date.prototype);
    return new _Date();
});