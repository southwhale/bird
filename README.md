bird
====

a simple mvvm library

###简介


bird做了两件事：路由控制 和 双向绑定


<b>路由控制:</b> 通过继承基类bird.action实现各业务子类的路由控制

<b>双向绑定:</b> 使用双花括号{{...}}实现双向绑定

----
###示例
模板（html）类似如下代码:
    
    <input type="text" value="{{testVariable}}" />
    <span>{{testVariable}}</span>
    <textarea>{{testVariable}}</textarea>
    <input type="checkbox" name="myckbox" valueVariable="{{testVariable}}" value="11" />
    <input type="radio" name="myradio" valueVariable="{{testVariable}}" value="a" />
    <select valueVariable="{{testVariable}}">
        <option value="a">a</option>
        <option value="b">b</option>
        <option value="c">c</option>
    </select>


业务类（js）类似如下代码:
    
    function Signin(){
  		Signin.superClass.apply(this, arguments);
  	}
  	Class.inherit(Signin, Action);
  	(function () {
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
  			$.email = "383523223@qq.com";
  			$.pwd = '123456';
  			$.submitSignin = function(){
  				if(validator.getMessageStack().length){
  					return;
  				}
  				console.log(JSON.stringify($.toJSON(['email','pwd'])));
  				//request.post('./signin.action', $.toJSON(['email','pwd']));
  				controller.redirect('!/course'); 
  			};
  		};
  		this.beforeLeave = function(){
  			mask.hide();
  		};
  		this.bindEvent = function(){};
  	}).call(Signin.prototype);

参考：http://sailinglee.iteye.com/blog/2126795
