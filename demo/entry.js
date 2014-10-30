define(function(require) {
	window.DEBUG = true;

	var controller = require('bird.controller');
	var Action = require('bird.action');
	var Q = require('q');

	require('bird.syspatch');
	require('bird.ui');//这是必须的,保证在控件里可以同步require到子控件

	//为bird.array、bird.string、bird.object模块加入chain功能
	/*var chain = require('bird.chain');
	var array = require('bird.array');
	chain.wrapModule(array, 'array');
	var string = require('bird.string');
	chain.wrapModule(string, 'string');
	var object = require('bird.object');
	chain.wrapModule(object, 'object');
	var dom = require('bird.dom');
	chain.wrapModule(dom, 'dom');*/

	return {
		init: function() {
			console.log("Demo Entry Module Inited!");

			Action.setContainer('Container');
			
			/*require('errorTrack').init({
				url : "/errortrack.action"
			});*/


			Q.longStackSupport = true;

			//Q.onerror的使用似乎要求promise以.done()结束,注意不是以.done(function(){...})结束
			Q.onerror = function (e) {
				throw e;
			};

			controller.configApp(require('./appConfig'));

			//这里要求在启动controller之前先加载可能用到的路径对业务模块映射

			controller.start();
		}
	}
});