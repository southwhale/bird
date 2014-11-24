/**
 * 后台数据请求助手, 服务于bird.action
 * restful style
 */
define("bird.requesthelper", [ "bird.object", "bird.array", "bird.request", "bird.string" ], function(require) {
    var object = require("bird.object");
    var array = require("bird.array");
    var request = require("bird.request");
    var string = require("bird.string");
    function RequestHelper() {}
    (function() {
        /**
		 * 生成请求后台数据的方法
		 * @param {Object} map
		 * @return {Object}
		 *
		 * 参数的格式:
		 * 完整格式:
		 * {
		 *	"getOne": "GET /api/resource/{{id}}",
		 *	"getAll": "GET /api/resource",
		 *	"create": "POST /api/resource",
		 *	"updateSome": "PATCH /api/resource/{{id}}",//更新部分属性
		 *	"updateAll": "PUT /api/resource/{{id}}",//更新全部属性
		 *	"delete": "DELETE /api/resource/{{id}}"
		 * }
		 * 或
		 * 简洁格式:
		 * {
		 *	"resource": "/api/resource"
		 * }
		 *
		 * 若为简洁格式, 该方法会自动转换成完整格式
		 * 若既有简洁格式又有完整格式, 则优先使用完整格式的数据
		 */
        this.generateRequestMethods = function(map, modName) {
            var me = this;
            var reqTypeMap = {
                getOne: "GET",
                getAll: "GET",
                create: "POST",
                updateSome: "PATCH",
                //更新部分属性
                updateAll: "PUT",
                //更新全部属性
                "delete": "DELETE"
            };
            object.forEach(reqTypeMap, function(value, key) {
                if (!map[key] && map["resource"] && !me[key]) {
                    map[key] = value + " " + map["resource"];
                    if (key !== "getAll" && key !== "create") {
                        map[key] += (/\/$/.test(map[key]) ? "" : "/") + "{{id}}";
                    }
                }
            });
            object.forEach(map, function(value, key) {
                if (key === "resource") {
                    return;
                }
                var methodName = key;
                var arr = value.split(/\s+/);
                var reqType = arr && arr[0];
                var url = arr && arr[1];
                if (!reqType) {
                    console.warn("模块: `" + modName + "`, 数据请求方法: `" + key + "` 缺少请求类型!");
                    return;
                }
                if (!url) {
                    console.warn("模块: `" + modName + "`, 数据请求方法: `" + key + "` 缺少请求URL!");
                    return;
                }
                me[methodName] = function(data, completeCallback, errorCallback) {
                    if (/\{\{id\}\}/.test(url)) {
                        url = string.format(url, data);
                        delete data.id;
                    }
                    request.ajax({
                        url: url,
                        data: data,
                        requestType: reqType,
                        responseType: "json",
                        complete: completeCallback,
                        error: errorCallback
                    });
                };
            });
        };
    }).call(RequestHelper.prototype);
    return RequestHelper;
});