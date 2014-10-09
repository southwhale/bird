/**
 * AMD course/course.js
 * require path: './js/module/biz/course'
 */
define(function(require){
	var mask = require('mask');
	var Class = require('bird.class');
	var Action = require('bird.action');
	var request = require('bird.request');
	var dom = require('bird.dom');

	function Course(){
		Course.superClass.apply(this, arguments);
	}

	Class.inherit(Course, Action);


	(function () {
		//this.container = document.getElementById('viewWrapper');

		this.tplUrl = './js/module/biz/course/tpl/list.html';

		this.title = '沪江网 | 我的课程';


		/*
		 * afterRender中只有一种方式为model赋值（$.set 接口会触发变量所绑定的元素更新）:
		 * $.set('email' ,"383523223@qq.com");
		 * $.set('pwd' ,"123456");
		 */
		this.afterRender = function($){
			$.set('chkedCourse', '22,33');
			//mask.show();
		};
		/*
		 * initModel中可以两种方式为model赋值:
		 * 第一种：
		 * $.set('email' ,"383523223@qq.com");
		 * $.set('pwd' ,"123456");
		 * 第二种：
		 * $.email = "383523223@qq.com",
		 * $.pwd = '123456'
		 */
		this.initModel = function($){
			//$.aaa = 123;
			/*$.email = "383523223@qq.com";
			$.pwd = '123456';
			$.submitSignin = function(){
				console.log(JSON.stringify($.toJSON(['email','pwd'])));
				request.post('./signin.action', $.toJSON(['email','pwd']));
			};*/
			var me = this;
			$.insertTpl1 = function(){
				var tplStr = '<input type="text" value="{{testInputValue1}}"/>'
					   + '<span>{{testInputValue1}}</span>';
				me.applyBind(tplStr, dom.gById('mycontainer'));
			};
			$.insertTpl2 = function(){
				var tplStr = '<input type="text" value="{{testInputValue2}}"/>'
					   + '<span>{{testInputValue2}}</span>';
				me.applyBind(tplStr, dom.gById('mycontainer'));
			};
		};

		this.beforeLeave = function(){
			
		};

		this.bindEvent = function(){

		};

	}).call(Course.prototype);

	return new Course();

});