/**
 * AMD signin/signin
 * require path: './js/module/biz/signin'
 */
define(function(require) {

	var mask = require('mask');
	var Class = require('bird.class');
	var Action = require('bird.action');
	var request = require('bird.request');
	var validator = require('bird.validator');
	var controller = require('bird.controller');

	function Signin(){
		Signin.superClass.apply(this, arguments);
	}

	Class.inherit(Signin, Action);


	(function () {
		//this.container = document.getElementById('viewWrapper1');

		this.tplUrl = './js/module/biz/signin/tpl/form.html';

		this.title = '沪江网 | 登陆';


		/*
		 * afterRender中只有一种方式为model赋值（$.set 接口会触发变量所绑定的元素更新）:
		 * $.set('email' ,"383523223@qq.com");
		 * $.set('pwd' ,"123456");
		 */
		this.afterRender = function($){
			mask.show();
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
			var user = $.user = {};
			user.email = "383523223@qq.com";
			user.pwd = '123456';
			user.submitSignin = function(){
				if(validator.getMessageStack().length){
					return;
				}
				console.log(JSON.stringify($.toJSON($.user,['email'])));
				request.post('./signin.action', $.user);
				controller.redirect('!/course'); 
			};
		};

		this.beforeLeave = function(){
			mask.hide();
		};

		this.bindEvent = function(){

		};

	}).call(Signin.prototype);

	return new Signin();
});