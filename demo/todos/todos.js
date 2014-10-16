/**
 * AMD todos/todos
 * require path: '/bird/demo/todos/todos'
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

	function Todos(){
		Todos.superClass.apply(this, arguments);
	}

	Class.inherit(Todos, Action);


	(function () {

		this.tplUrl = './demo/todos/tpl/todos.html';

		this.title = '示例 | Todos';


		this.afterRender = function($){
			var clearCompletedTpl = '<span>{{checkedCount}}</span>';
			var todoCountTpl = '<div class="todo-count"><b>{{itemCount}}</b></div>';

			this.applyBind(todoCountTpl, dom.gById('todo-count'));
			this.applyBind(clearCompletedTpl, dom.gById('clear-completed'));
		};

		this.initModel = function($){
			var itemTpl = '<li><div class="view"><input class="toggle" type="checkbox" name="chkItems" valueVariable="{{checkedItemsValue}}"/>'
			 			+ '<label>{{title}}</label><a class="destroy"></a>'
			 			+ '</div><input class="edit" type="text" value="{{title}}"/></li>';

			
			var me = this;
			$.enter = function(e){
				//只处理回车键
				if(e.which !== 13){
					return;
				}
				if(this.value){
					$.title = this.value;
					me.applyBind(itemTpl, dom.gById('todo-list'), true);
					this.value = '';
					updateItemCount();
				}
			};

			$.editItem = function(e){
				dom.addClass(this.parentNode.parentNode, 'editing');
				var nextElement = dom.nextElement(this.parentNode);
				dom.removeClass(nextElement, 'edit');
				nextElement.focus();
			};

			$.showLabel = function(e){
				if(this.type !== 'text'){
					return;
				}
				dom.addClass(this, 'edit');
				dom.removeClass(this.parentNode, 'editing');
			};

			$.removeItem = function(e){
				if(!/^a$/i.test(this.tagName)){
					return;
				}
				dom.removeNode(this.parentNode.parentNode);
				updateItemCount();
				updateCheckedCount();
			};

			$.checkAll = function(e){
				var values = [];
				if(this.checked){
					var chkboxs = dom.getAll('#todo-list div input[type=checkbox]');
					array.forEach(chkboxs, function(chbox){
						values.push(chbox.value);
					});
				}
				
				$.set('checkedItemsValue', values.join(','));
				updateCheckedCount();
			};


			function updateCheckedCount(){
				var checkedCount = require('jquery')('#todo-list div input:checked').length;//dom.getAll('#todo-list div input:checked').length;
				var text = '';
				checkedCount === 1 && (text = ' item');
				checkedCount > 1 && (text = ' items');
				checkedCount && (text = 'Clear ' + checkedCount + ' completed ' + text);
				$.set('checkedCount', text);
			}


			function updateItemCount(){
				var itemCount = dom.gById('todo-list').children.length;
				var text = '';
				itemCount === 1 && (text = ' item left');
				itemCount > 1 && (text = ' items left');
				itemCount && (text = itemCount + text);
				$.set('itemCount', text);
			}

			this.updateCheckedCount = updateCheckedCount;
		};

		this.bindEvent = function(){
			var me = this;
			event.delegate('input[type=checkbox]', 'click', function(e){
				me.updateCheckedCount();
			},dom.gById('todo-list'));
		};

		this.beforeLeave = function(){
			event.destroy(dom.gById('todo-list'));
		};			
      
    			

	}).call(Todos.prototype);

	return new Todos();
});