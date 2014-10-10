define(function(require) {
	var Class = require('bird.class');
	var Action = require('bird.action');

	function Index(){
		Index.superClass.apply(this, arguments);
	}

	Class.inherit(Index, Action);


	(function () {
		this.tplUrl = './demo/index/tpl/index.html';

		this.title = '示例 | 导航页';
		
	}).call(Index.prototype);

	return new Index();
});