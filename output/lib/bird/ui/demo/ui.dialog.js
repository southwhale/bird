define(function(require) {
	var Class = require('bird.class');
	var Action = require('bird.action');
	var Dialog = require('bird.ui.dialog');
	var DialogConfirm = require('bird.ui.dialog.confirm');
	var DialogAlert = require('bird.ui.dialog.alert');

	function DialogUI(){
		DialogUI.superClass.apply(this, arguments);
	}

	Class.inherit(DialogUI, Action);


	(function () {
		this.afterRender = function() {

			var dialogModel = {
				title: '我是标题',
				body: '我是正文，我是正文，我是正文，我是正文，我是正文，我是正文，我是正文，我是正文，我是正文',
				okLabel: 'OK',
				cancelLabel: 'CANCEL',
				onOk: function(e){
					alert("You clicked button `" + e.target.innerHTML + "`, I will close myself!");
				},
				onCancel: function(e){
					alert("You clicked button `" + e.target.innerHTML + "`, I will close myself!");
				},
				onClose: function(e){
					alert("You clicked button `" + e.target.innerHTML + "`, I will close myself!");
				},
				//width:200
				draggable: true,
				closeable: true
			};
			var dialog = new DialogConfirm(dialogModel);
			//dialog.bindModel(dialogModel);
			dialog.render();
			dialog.appendTo(document.body);



			setTimeout(function(){
				dialog.setBody("HAHAHA, I am No.1!");
				//dialog.childControls[0].setClasses('bird-ui-dialog-btn-cancel');
				//dialog.appendTo(document.body);
				dialog.childControls[0].setContent('1213');
				setTimeout(function(){
					dialog.setBody("A O, I am not No.1!");
				},5000)
			},5000);


			//var c = require('bird.chain');
			/*var items = [0,1,2,3,4,5,6,7,8,9];
			c.chain(items).$arrayForEach(function(v){
				alert(v);
			}).$arrayUnion(['a','b','c']).$arrayForEach(function(v){
				alert(v)
			});*/
			/*var s = 'aa-bb';
			c.chain(s).$stringCamelize().$stringCapitalize().custom(function(v){
				alert(v)
			});*/

			/*setTimeout(function() {
				dialog.repaint({
					head: '我是标题222',
					body: '我是正文222，我是正文，我是正文，我是正文，我是正文，我是正文，我是正文，我是正文，我是正文',
					foot: '我是底部222'
				});
			}, 8000);*/

			/*var ani = require('animate');
			ani.moveX(dialog.getRoot(), '+=500px', 800,null, function(){
			})*/
		};

	}).call(DialogUI.prototype);

	return new DialogUI();
});