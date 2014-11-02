define(function(require){
	function Observer(){
		this.channelMap = {};
	}

	(function() {

		var lang = require('./bird.lang');
		var util = require('./bird.util');
		/*********************************************************************
		 *                             订阅/发布
		 ********************************************************************/
		//外部订阅/发布对象缓存区

		this.subscribe = function(channel, update) {
			if(lang.isFunction(update)){
				this.channelMap[channel] = this.channelMap[channel] || [];
				this.channelMap[channel].push(update);
			}
		};

		this.unsubscribe = function(channel, update) {
			if (arguments.length === 1) {
				this.channelMap[channel].length = 0;
				delete this.channelMap[channel];
				return;
			}
			if (!arguments.length) {
				var me = this;
				util.forEach(this.channelMap, function(updates, channel) {
					updates.length = 0;
					delete me.channelMap[channel];
				});

				return;
			}

			var fnArray = this.channelMap[channel];
			if (!fnArray) {
				return;
			}
			util.forEach(fnArray, function(fn, index, fnArray) {
				if (fn === update) {
					fnArray.splice(index, 1);
				}
			});
			if(!fnArray.length){
				delete this.channelMap[channel];
			}
		};

		this.publish = function(channel) {
			var args = Array.prototype.slice.call(arguments, 1);
			var me = this;
			util.forEach(this.channelMap[channel] || [], function(update) {
				update.apply(me, args);
			});
			args = me = null;
		};

		this.watch = this.subscribe;
		this.unwatch = this.unsubscribe;
		this.notify = this.publish;
		
	}).call(Observer.prototype);


	return Observer;
});