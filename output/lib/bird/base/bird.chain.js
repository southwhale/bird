/**
 *	该模块用来给其他模块增加链式操作的功能,被封装到chain模块上方法名的结构为: '$' + prefix + capitalize(methodName)
 *	prefix 在调用wrapModule接口时作为第二个参数指定
 *	具体使用如下：
 *	1.调用wrapModule接口为模块增加链式功能
 *	var chain = require('chain');
 *	var array = require('array');
 *	chain.wrapModule(array, 'array');//为bird.array模块增加链式操作功能
 *	var string = require('string');
 *	chain.wrapModule(string, 'string');//为bird.string模块增加链式操作功能
 *	var object = require('object');
 *	chain.wrapModule(object, 'object');//为bird.object模块增加链式操作功能
 *
 *	2.使用链式功能接口
 *	var c = require('chain');
 *	//以下为数组操作
 *	var items = [0,1,2,3,4,5,6,7,8,9];
 *	c.chain(items).$arrayForEach(function(v){
 *		alert(v);
 *	}).$arrayUnion(['a','b','c']).$arrayForEach(function(v){
 *		alert(v)
 *	});
 *			
 *	//以下为字符串操作
 *	var s = 'aa-bb';
 *	c.chain(s).$stringCamelize().$stringCapitalize().custom(function(v){
 *		alert(v)
 *	});
 *
 *	or
 *	
 *	var value = c.chain(s).$stringCamelize().$stringCapitalize().toData();
 *	alert(value);
 *
 */
define("bird.chain", [ "./bird.object", "./bird.string" ], function(require) {
    var object = require("./bird.object");
    var string = require("./bird.string");
    function Chain() {
        this.data = null;
    }
    (function() {
        this.chain = function(data) {
            this.data = data;
            return this;
        };
        this.wrapFn = function(fn, name, prefix, mod) {
            var me = this;
            this["$" + (prefix || "") + string.capitalize(name || fn.name)] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(me.data);
                var ret = fn.apply(mod, args);
                this.data = ret == null ? this.data : ret;
                args = ret = null;
                return me;
            };
        };
        this.wrapModule = function(mod, prefix) {
            var me = this;
            object.forEach(mod, function(v, k, mod) {
                me.wrapFn(v, k, prefix, mod);
            }, true);
        };
        //返回链式操作之后得到的数据
        this.toData = function() {
            return this.data;
        };
        //自定义函数操作数据
        this.custom = function(fn) {
            var ret = fn(this.data);
            this.data = ret == null ? this.data : ret;
            ret = null;
            return this;
        };
    }).call(Chain.prototype);
    return new Chain();
});