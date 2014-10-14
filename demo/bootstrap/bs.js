/**
 * AMD bootstrap/bs
 * require path: '/ftat/demo/bootstrap/bs'
 */
define(function(require) {

	var Class = require('bird.class');
	var Action = require('bird.action');
	var request = require('bird.request');
	var validator = require('bird.validator');
	var controller = require('bird.controller');
	var dom = require('bird.dom');
	var array = require('bird.array');
	var event = require('bird.event');
	require('bootstrap');

	function Bs(){
		Bs.superClass.apply(this, arguments);
	}

	Class.inherit(Bs, Action);


	(function () {

		this.tplUrl = './demo/bootstrap/tpl/bs.html';

		this.title = '示例 | 整合Bootstrap';


		this.afterRender = function($model){
			//$(".dropdown-toggle").dropdown('toggle');
		};

		this.initModel = function($model){
			$model.success = '成功！很好地完成了提交。';
			$model.info = '信息！请注意这个信息。';
			$model.warning = '警告！请不要提交。1111';
			$model.danger = '错误！请进行一些更改。';

			$model.tclick = function(e){
				alert(this.getAttribute('value'))
			}
		};

		this.bindEvent = function(){
			
		};

		this.beforeLeave = function(){
			
		};			
      
    			

	}).call(Bs.prototype);

	return new Bs();
});