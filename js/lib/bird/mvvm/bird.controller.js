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
			//兼容seajs和esl
			(require.async || require)(name, function(action) {
				data.action = name;
				if (action && (action instanceof Action)) {
					me.currentAction && me.currentAction.leave(action);
					me.lastAction = me.currentAction;
					me.currentAction = action;
					action.enter(data);
				}
			});
		};

		this.back = function() {
			location.hash = this.lastAction ? ('!' + this.lastAction.args.location) : '';
		};

		this.redirect = function(url, isNotHash) {
			router.route(url, isNotHash);
		};

		this.initActionListener = function() {
			var me = this;
			array.forEach(this.actionMaps, function(map) {
				router.listenLocation(map, function(data) {
					if (lang.isString(map.action)) {
						me.dispatch(map.action, data);
					} else if (lang.isArray(map.action)) {
						array.forEach(map.action, function(actionName) {
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