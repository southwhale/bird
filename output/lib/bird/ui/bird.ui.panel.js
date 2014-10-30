define(function(require){

	var Class = require('bird.class');
	var Control = require('./bird.ui.control');

	function Panel(){
		Panel.superClass.apply(this, arguments);
		
	}


	Class.inherit(Panel, Control);

	(function(){
		this.type = 'Panel';
	}).call(Panel.prototype);
});