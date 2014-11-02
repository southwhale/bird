<a href="../../" target="_blank">bird</a>
====

a simple mvvm library

###简介


<a href="../../" target="_blank">bird</a>做了两件事：路由控制 和 双向绑定


- **路由控制：** 
 * 通过继承基类<a href="src/lib/bird/mvvm/bird.action.js" target="_blank">bird.action</a>实现各业务子类的路由控制
 * 支持<a href="src/lib/bird/mvvm/bird.router.hashchange.js" target="_blank">hashChange</a>和<a href="src/lib/bird/mvvm/bird.router.pushstate.js" target="_blank">pushState</a>两种路由实现，默认使用<a href="src/lib/bird/mvvm/bird.router.hashchange.js" target="_blank">hashChange</a>的实现，可根据具体需求修改<a href="src/lib/bird/mvvm/bird.controller.js" target="_blank">bird.controller</a>里router的引用

- **双向绑定：** 
 * 使用双花括号{{...}}实现双向绑定

----
###示例
  参考<a href="https://github.com/iamweilee/bird-demo.git" target="_blank">demo</a>
  	
  	
----
###说明
**注：**强烈建议路由的路径由 **<i>#!</i>** 开头,既可以满足google等搜索引擎seo的要求，又可以避免一些意料之外的问题
