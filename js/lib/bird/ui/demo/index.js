define(function(require) {
	var Class = require('bird.class');
	var Action = require('bird.action');

	function Index(){
		Index.superClass.apply(this, arguments);
	}

	Class.inherit(Index, Action);


	(function () {
		this.afterRender = function () {
			document.getElementById('Container').innerHTML = '';
		};
	}).call(Index.prototype);

	return new Index();
});