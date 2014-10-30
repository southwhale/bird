define(function(require) {
	var Class = require('bird.class');
	var Control = require('./bird.ui.control');
	var object = require('bird.object');
	var dom = require('bird.dom');
	var event = require('bird.event');

	function Button(options) {
		this.content = null;
		Button.superClass.apply(this, arguments);
	}

	Class.inherit(Button, Control);

	(function() {
		this.type = 'Button';

		/*this.bindEvent = function(){
			this.delegate('div.bird-ui-button', 'click', function(e){
				e.stopPropagation();
				alert(e.target.innerHTML);
			});

			Button.superClass.prototype.bindEvent.apply(this, arguments);
		};*/

		this.initCss = function() {
			this.rootElement.style.position = 'relative';
			this.rootElement.style.display = 'inline-block';
		};

	}).call(Button.prototype);

	return Button;
});