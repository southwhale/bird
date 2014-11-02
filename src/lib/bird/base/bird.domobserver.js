/**
 * 监听dom变化
 * 只支持现代浏览器（IE11、chrome、firefox、safari）
 * options参数 请参考：https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver#MutationObserverInit
 * updateCallback参数 请参考：https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver#MutationRecord
 */
define(function(require){
	var lang = require('./bird.lang');
	var array = require('./bird.array');
	function DomObserver(target, options){
		this.MutationObserver = window.MutationObserver 
			|| window.WebKitMutationObserver 
			|| window.MozMutationObserver;

		this.observeMutationSupport = !!MutationObserver;
		if(!this.observeMutationSupport){
			throw new Error("Your browser does not support `MutationObserver`!")
		}

		this.updateCallbackArray = [];
		var _this = this;
		this.updateCallback = function(){
			var me = this;
			array.forEach(_this.updateCallbackArray, function(update){
				update.apply(me, arguments);
			});
		};
		this._init(target, options);
	}

	(function(){

		this._init = function(target, options){
			this.observer = new this.MutationObserver(this.updateCallback);
			this.observer.observe(target, options);
		};


		this.subscribe = function(update){
			if(!lang.isFunction(update)){
				return;
			}
			this.updateCallbackArray.push(update);
		};

		this.unsubscribe = function(update){
			if (!arguments.length) {
				this.updateCallbackArray.length = 0;
				this.observer.disconnect();
				return;
			}

			array.forEach(this.updateCallbackArray, function(fn, index, fnArray) {
				if (fn === update) {
					fnArray.splice(index, 1);
				}
			});
		};

		this.watch = this.subscribe;
		this.unwatch = this.unsubscribe;

		this.clear = function(){
			this.observer.takeRecords();
		};
	}).call(DomObserver.prototype);

	return DomObserver;
});