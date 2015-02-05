/**
 * 负责查找具体Action的调用
 *
 */

define(function(require) {
	var router = require('./bird.router');
	var lang = require('bird.lang');
	var array = require('bird.array');
	var Action = require('./bird.action');

	function Controller() {

	}

	(function() {

		this.start = function() {
			router.start();
			this.initActionListener();
			console.log('bird.controller started!');
		};


		//调度指定的Action并启动Action
		this.dispatch = function(name, data) {
			var me = this;
			me.lastName = name;
			//兼容seajs和esl
			(require.async || require)(name, function(action) {
				//如果模块ModA需要的资源还没加载完全就点击链接进入另个模块ModB
				//进入ModB之后, ModA的资源加载完成, 此时不该进入ModA, 应抛弃ModA
				if (name !== me.lastName) {
					return;
				}

				data.action = name;
				if (action && (action instanceof Action)) {
					me.currentAction && me.currentAction.leave(action);
					me.currentAction = action;
					action.enter(data);
				}
			});
		};

		this.initActionListener = function() {
			var me = this;
			array.forEach(this.actionMaps, function(la) {
				router.listenLocation(la, function(data) {
					if (lang.isString(la.action)) {
						me.dispatch(la.action, data);
					} else if (lang.isArray(la.action)) {
						array.forEach(la.action, function(actionName) {
							me.dispatch(actionName, data);
						});
					}
				});
			});
		};

		this.configApp = function(options) {
			this.actionMaps = lang.isArray(options) ? options : options.actionMaps;
		};

	}).call(Controller.prototype);

	return new Controller();
});