define(function(require) {

	var Class = require('bird.class');
	var object = require('bird.object');
	var event = require('bird.event');
	var dom = require('bird.dom');
	var Control = require('./bird.ui.control');

	function Mask(options) {
		Mask.superClass.apply(this, arguments);
		this.overElements = [];
	};

	Class.inherit(Mask, Control);

	(function() {

		this.type = 'Mask';

		this.bindEvent = function() {
			this._bindEventInternal();
			Mask.superClass.prototype.bindEvent.call(this);
		};

		this._bindEventInternal = function() {
			var me = this;
			if (this.clickable) {
				this.delegate('div.bird-ui-mask', 'click', function(e) {
					me.hide();
					var el;
					while (el = me.overElements.pop()) {
						el.style.display = 'none';
					};
				});
			}

			me.on(window, 'resize', function() {
				var size = getWinSize();
				me.rootElement.style.width = size.width + 'px';
				me.rootElement.style.height = size.height + 'px';
			});
		};

		this.insertBefore = function(element){
			dom.insertBefore(this.rootElement, element);
		};

		this.addOverElement = function(el) {
			this.overElements.push(el);
		};

		this.initCss = function() {
			this.rootElement.style.position = 'fixed';
			this.rootElement.style.left = 0;
			this.rootElement.style.top = 0;
			var size = getWinSize();
			this.rootElement.style.width = size.width + 'px';
			this.rootElement.style.height = size.height + 'px';
			this.rootElement.style.display = 'none';
		}

		function getWinSize() {
			return {
				width: document.documentElement.clientWidth || document.body.offsetWidth,
				height: document.documentElement.clientHeight || document.body.offsetHeight
			}
		}

	}).call(Mask.prototype);

	return Mask;
})