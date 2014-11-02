/**
 * AMD index/index
 * require path: './js/module/biz/index'
 */
define(function(require) {

	var mask = require('mask');
	var Class = require('bird.class');
	var Action = require('bird.action');

	function Index(){
		Index.superClass.apply(this, arguments);
	}

	Class.inherit(Index, Action);


	(function () {
		//this.container = document.getElementById('viewWrapper');

		this.title = '沪江网';


		this.afterRender = function(){
			
		};
	}).call(Index.prototype);

	return new Index();

});