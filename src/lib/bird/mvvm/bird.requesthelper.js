/**
 * 后台数据请求助手, 服务于bird.action
 * restful style
 */
define(function(require) {
	var object = require('bird.object');
	var array = require('bird.array');
	var request = require('bird.request');
	var string = require('bird.string');
	var logger = require('bird.logger');

	function RequestHelper() {

	}

	(function() {
		/**
		 * 生成请求后台数据的方法
		 * @param {Object} map
		 * @return {Object}
		 *
		 * 参数的格式:
		 * 完整格式:
		 * {
		 *	"getById": "GET /api/resource/{{id}}",
		 *	"getList": "GET /api/resource",
		 *	"save": "POST /api/resource",
		 *	"update": "PUT /api/resource/{{id}}",//更新属性, IE8不支持PATCH, 故不区分PATCH和PUT
		 *	"removeById": "DELETE /api/resource/{{id}}",
		 *	"remove": "DELETE /api/resource"
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
				"getById": "GET",
				"getList": "GET",
				"save": "POST",
				"update": "PUT", //更新属性
				"removeById": "DELETE",
				"remove": "DELETE"
			};
			object.forEach(reqTypeMap, function(value, key) {
				if (!map[key] && map['resource'] && !me[key]) {
					map[key] = value + ' ' + map['resource'];
					if (/^(?:getById|update|removeById)$/.test(key)) {
						map[key] += (/\/$/.test(map[key]) ? '' : '/') + '{{id}}';
					}
				}
			});


			object.forEach(map, function(value, key) {
				if (key === 'resource') {
					return;
				}
				var methodName = key;
				var arr = value.split(/\s+/);
				var reqType = arr && arr[0];
				var url = arr && arr[1];

				if (!reqType) {
					logger.warn('模块: `' + modName + '`, 数据请求方法: `' + key + '` 缺少请求类型!');
					return;
				}

				if (!url) {
					logger.warn('模块: `' + modName + '`, 数据请求方法: `' + key + '` 缺少请求URL!');
					return;
				}

				me[methodName] = function(data, completeCallback, errorCallback) {
					var reqUrl = url;
					if (/\{\{.+?\}\}/.test(url)) {
						reqUrl = string.format(url, data, function(k, d) {
							delete d[k];
						});
					}
					request.ajax({
						url: reqUrl,
						data: data,
						requestType: reqType,
						responseType: 'json',
						complete: completeCallback,
						error: errorCallback
					});
				};
			});

			if (map['save'] && !this.saveOrUpdate) {
				// 有id则为update, 否则为save
				this.saveOrUpdate = function(data, completeCallback, errorCallback) {
					if (data.id) {
						this.update(data, completeCallback, errorCallback);
					} else {
						this.save(data, completeCallback, errorCallback);
					}
				};
			}
		};
	}).call(RequestHelper.prototype);

	return RequestHelper;
});