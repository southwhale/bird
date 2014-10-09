/**
 * AMD common/404.js
 * require path: './js/module/biz/common/404'
 */
define(function(require){
	var mask = require('mask');
	var Class = require('bird.class');
	var Action = require('bird.action');
	var DialogAlert = require('bird.ui.dialog.alert');
	var controller = require('bird.controller');

	function NotFound(){
		NotFound.superClass.apply(this, arguments);
	}

	Class.inherit(NotFound, Action);


	(function () {

		this.title = '沪江网 | 出错啦！！！';

		this.afterRender = function($){
			mask.show();
			var sec = 5;
			var bodyPrefix = '找不到页面啦！！！<b>';
			var bodySuffix = '</b> 秒后返回上一页！<br>您也可以点击按钮返回首页！';
			var dialogModel = {
				title: '出错啦！！！',
				body: bodyPrefix + sec + bodySuffix,
				okLabel: '返回首页',
				onOk: function(e){
					controller.redirect('!/');
				},
				onClose: function(e){
					timer && clearInterval(timer);
					mask.hide();
				},
				width:288,
				draggable: true,
				closeable: true
			};
			var dialog = new DialogAlert(dialogModel);
			dialog.render();
			dialog.appendTo(document.body);
			this.dialog = dialog;
			var timer = setInterval(function(){
				sec--;
				if(!sec){
					timer && clearInterval(timer);
					controller.back();
					return;
				}
				dialog.setBody(bodyPrefix + sec + bodySuffix);
			}, 1000);
			this.timer = timer;
		};

		this.beforeLeave = function(){
			this.timer && clearInterval(this.timer);
			mask.hide();
			this.dialog.destroy();
		};

	}).call(NotFound.prototype);

	return new NotFound();

});