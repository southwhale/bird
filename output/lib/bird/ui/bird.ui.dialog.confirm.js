/**
 * @desc: 继承自bird.ui.dialog, 构造器参数options可配置项有：
 * 	{
 *		top: 200, //自定义y坐标
 *		left: 200, //自定义x坐标
 *		width: 400, //自定义宽度,高度是自适应的不可固定
 *		height: 400,//自定义高度
 *		title: 'something for dialog title', //对话框的标题
 *		body: 'something for dialog body', //对话框的内容
 *		okLabel: 'some text for `OK` button', //`确定`按钮显示的文字
 *		cancelLabel: 'some text for `CANCEL` button', //`取消`按钮显示的文字
 *		draggable: true|false, //是否可拖动
 *		closeable: true|false, //对话框右上角是否有可以点击的关闭图标[`X`]
 * 		onClose: function(){...}, //点击对话框右上角关闭图标[`X`]时的回调函数
 *		onOk: function(){...}, //点击`确定`按钮时的回调函数
 *		onCancel: function(){...} //点击`取消`按钮时的回调函数
 * 	}
 * 
 * @author:liwei
 */
define(function(require) {
	var Class = require('bird.class');
	var lang = require('bird.lang');
	var Dialog = require('./bird.ui.dialog');

	function DialogConfirm(options) {
		DialogConfirm.superClass.apply(this, arguments);
		this.foot = '<bird ui="type:button;content:' + (this.okLabel || '确定') + ';classes:bird-ui-dialog-btn-ok"></bird>'
				  + '<bird ui="type:button;content:' + (this.cancelLabel || '取消') + ';classes:bird-ui-dialog-btn-cancel"></bird>';
	}

	Class.inherit(DialogConfirm, Dialog);

	(function() {
		//这里不重新定义this.type,因为该控件要复用基类Dialog的模板
		//而加载一个控件的模板是根据其this.type来确定的

		this.bindEvent = function() {
			this._bindEventOnChildControl();
			DialogConfirm.superClass.prototype.bindEvent.call(this);
		};

		this._bindEventOnChildControl = function() {
			var me = this;
			this.clearChildControlsEvent();
			this.delegate('div.bird-ui-dialog-btn-ok', 'click', function(e) {
				e.stopPropagation();
				e.control && e.control.hide();
				lang.isFunction(me.onOk) && me.onOk(e);
			});

			this.delegate('div.bird-ui-dialog-btn-cancel', 'click', function(e) {
				e.stopPropagation();
				e.control && e.control.hide();
				lang.isFunction(me.onCancel) && me.onCancel(e);
			});
		};

	}).call(DialogConfirm.prototype);

	return DialogConfirm;
});