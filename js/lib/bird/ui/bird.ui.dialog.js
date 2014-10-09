/**
 * @desc: 构造器参数options可配置项有：
 * 	{
 *		top: 200, //自定义y坐标
 *		left: 200, //自定义x坐标
 *		width: 400, //自定义宽度,
 *		height: 400,//自定义高度
 *		title: 'something for dialog title', //对话框的标题
 *		body: 'something for dialog body', //对话框的内容
 *		foot: 'something for dialog foot', //对话框底部的内容
 *		draggable: true|false, //是否可拖动
 *		closeable: true|false, //对话框右上角是否有可以点击的关闭图标[`X`]
 *		onClose: function(){...} //点击对话框右上角关闭图标[`X`]时的回调函数
 * 	}
 * 
 * @author:liwei
 */
define(function(require) {
	var Class = require('bird.class');
	var Control = require('./bird.ui.control');
	var object = require('bird.object');
	var dom = require('bird.dom');
	var event = require('bird.event');
	var array = require('bird.array');
	var lang = require('bird.lang');

	function Dialog(options) {
		this.draggable = false;
		this.closeable = false;

		this.title = null;
		this.body = null;
		this.foot = null;

		Dialog.superClass.apply(this, arguments);
	}

	Class.inherit(Dialog, Control);

	(function() {
		this.type = 'Dialog';

		this.bindEvent = function() {
			this.draggable && this._bindDragEvent();
			this.closeable && this._bindCloseEvent();
			this._bindWindowResizeEvent();
			Dialog.superClass.prototype.bindEvent.apply(this, arguments);
		};


		this.initCss = function() {
			dom.addClass(this.rootElement, 'bird-ui-position-absolute');

			if (!this.width) {
				this.width = 600;
			}

			document.body.appendChild(this.rootElement);
			
			this.rootElement.style.width = this.width + 'px';
			
			this.centerPosition();
			
			document.body.removeChild(this.rootElement);
		};

		this._bindWindowResizeEvent = function(){
			var me = this;
			this.on(window, 'resize', centerPosition);

			this.destroy = function(){
				me.off(window, 'resize', centerPosition);
				Dialog.superClass.prototype.destroy.apply(this, arguments);
			};

			function centerPosition(e){
				me.centerPosition();
			}
		};

		this._bindCloseEvent = function(){
			var me = this;
			var closeIcon = dom.get('div.bird-ui-dialog-close-icon', this.rootElement);
			dom.addClass(closeIcon, 'icon-cancel');
			this.delegate('div.bird-ui-dialog-close-icon', 'click', function(e) {
				e.control && e.control.hide();
				lang.isFunction(me.onClose) && me.onClose(e);
			});
		};


		this._bindDragEvent = function() {
			var me = this;
			var headTitle = dom.get('div.bird-ui-dialog-head-title', this.rootElement);
			dom.addClass(headTitle, 'bird-ui-draggable');

			var rootElement = this.rootElement;
			var doc = document;

			//保存原来的onselectstart处理函数,待拖动结束后恢复该处理函数
			var oldOnselectstart = document.onselectstart;

			var moveAble;

			this.delegate('div.bird-ui-dialog-head-title', 'mousedown touchstart', function(e) {
				e.preventDefault();
				document.onselectstart = onselectstart;
				var isTouchEvent = e.type === 'touchstart';

				if (e.isMouseLeft || isTouchEvent) {
					moveAble = true;
					var offset = dom.getOffset(this);
					me.mouseOrTouchX = (isTouchEvent ? e.changedTouches[0].pageX : e.pageX) - offset.left;
					me.mouseOrTouchY = (isTouchEvent ? e.changedTouches[0].pageY : e.pageY) - offset.top;

					me.on(doc, 'mousemove touchmove', onmousemove);
				} else {
					moveAble = false;
				}
				return false;
			});

			this.on(doc, 'mouseup touchend', onmouseup);

			function onmousemove(e) {
				if (!moveAble) {
					return;
				}
				var isTouchEvent = e.type === 'touchmove';
				
				var _x = (isTouchEvent ? e.changedTouches[0].pageX : e.pageX) - me.mouseOrTouchX;
				var _y = (isTouchEvent ? e.changedTouches[0].pageY : e.pageY) - me.mouseOrTouchY;

				var offset = dom.getOffset(rootElement);
				var maxX = document.documentElement.clientWidth - offset.width;
				var maxY = document.documentElement.clientHeight - offset.height;

				_x < 0 && (_x = 0);
				_y < 0 && (_y = 0);
				_x > maxX && (_x = maxX);
				_y > maxY && (_y = maxY);

				dom.css(rootElement, {
					left: _x + 'px',
					top: _y + 'px'
				});
			}

			function onmouseup(e) {
				document.onselectstart = oldOnselectstart;
				moveAble = false;
				me.off(doc, 'mousemove', onmousemove);
			}


			function onselectstart(e) {
				return false;
			}
		};

	}).call(Dialog.prototype);

	return Dialog;
});