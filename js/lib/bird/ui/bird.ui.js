/*
	bird ui 设计
	
	一个简单的ui control 包含以下几部分内容：
	1.html模板(只在control初始化时加载,应在模板外层再套一个div作为根节点,方便后续的事件委托)
	2.control各dom节点绑定的事件(亦是在初始化时调用事件绑定操作,事件绑定应是委托在control的根节点上)
	3.初始化的样式
	4.初始化时的数据model和dom节点model的双向绑定(初始化时绑定一次,之后对节点的操作都通过dataModel和viewModel来控制)
	5.填充初始model数据(包括dataModel和viewModel)
	6.渲染到document上
	7.交互事件操作的响应(引起重绘)
	8.更新model从而更新control的ui(重绘)
	9.自我销毁(各种内存释放：1.dataModel和viewModel置空 2.事件解绑定 3.dom节点的remove)


	而一个复杂的ui control 除了包含上述所述的要点还可能包含以下内容：
	1.孩子控件(复杂control可能由多个简单control组成)
	
*/

define(function(require){
	//预加载所有控件的脚本文件,但并不执行模块逻辑
	require('./bird.ui.button');
	require('./bird.ui.dialog');
	require('./bird.ui.mask');
	require('./bird.ui.panel');
});