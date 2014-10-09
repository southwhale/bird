/**
 * AMD module/entry.js
 * require path: './js/module/entry'
 */

define(function(require){
	//由于console原生方法不能被缓存并在自定义window.console方法里调用,所以这里在require('syspatch')前设置'调试状态'
	window.DEBUG = true;

	var controller = require('bird.controller');
	var Action = require('bird.action');
	var Q = require('q');
	
	require('bird.syspatch');
	require('bird.ui');//这是必须的,保证在控件里可以同步require到子控件

	return {
		init : function(){
			console.log("entry Module Inited!");

			Action.setContainer('viewWrapper');
			
			require('errorTrack').init({
				url : "/errortrack.action"
			});


			Q.longStackSupport = true;

			//Q.onerror的使用似乎要求promise以.done()结束,注意不是以.done(function(){...})结束
			Q.onerror = function (e) {
				throw e;
			};

			controller.configModules(require('./moduleConfig'));

			//这里要求在启动controller之前先加载可能用到的路径对业务模块映射

			controller.start();
		}
	}
});

