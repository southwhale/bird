define(function(require) {

	var lang = require('./bird.lang');

	function _Array() {

	}

	(function() {
		//each在执行时可以从内部被中断, 且数组长度可变
		this.each = function(p, callback) {
			for (var i = 0; i < p.length; i++) {
				if (callback.call(this, p[i], i, p) === false) {
					return false;
				}
			}
			return true;
		};

		//forEach不可被中断, 且数组长度不变, 若要在遍历中改变数组长度请使用each方法
		this.forEach = function(p, callback) {
			if (p.forEach) {
				return p.forEach(callback);
			}
			var len = p.length;
			for (var i = 0; i < len; i++) {
				callback.call(this, p[i], i, p);
			}
		};

		this.descArrayEach = function(p, callback) {
			for (var i = p.length - 1; i >= 0; i--) {
				callback.call(this, p[i], i, p);
			}
		};

		//过滤数组
		this.filter = function(p, fn) {
			if (!lang.isFunction(fn)) {
				return;
			}
			var ret = [];
			this.forEach(p, function(v, i, p) {
				if (fn(v, i, p)) {
					ret.push(v);
				}
			});
			return ret;
		};

		this.pushUniqueInArray = function(obj, arr) {
			var objInArr = false;
			this.each(arr, function(o) {
				if (o === obj) {
					objInArr = true;
					return false;
				}
			});
			if (!objInArr) {
				arr.push(obj);
			}
		};

		this.uniquelize = function(arr) {
			var arrcopy = arr.slice();
			arr.length = 0;
			this.forEach(arrcopy, function(el, index, arrcopy) {
				var isUnique = true;
				for (var i = index + 1; i < arrcopy.length; i++) {
					if (arrcopy[i] === el) {
						isUnique = false;
						break;
					}
				}
				isUnique && arr.push(el);
			});
			arrcopy = null;
			return arr;
		};

		this.remove = function(el, arr) {
			this.forEach(arr, function(val, index, arr) {
				if (val === el) {
					arr.splice(index, 1);
				}
			});
		};

		//对arr所有元素执行 fn 都返回true才为true,否则为false
		this.every = function(arr, fn) {
			return this.each(arr ,fn);
		};

		//arr中只要有一个元素执行fn返回了true结果就为true,否则为false
		this.some = function(arr, fn) {
			var ret = false;
			this.each(arr, function(v, i, arr){
				if(fn(v, i, arr)){
					ret = true;
					return false;
				}
			});
			return ret;
		};

		/**
		 * 支持参数为元素和数组,也支持参数都为数组
		 * 参数都为数组时,长数组作为被比较对象,短数组作为比较对象
		 * 不论参数为哪种情况,都支持参数位置颠倒的情况
		 */
		this.contains = function(el, arr) {
			if (lang.isArray(el) && lang.isArray(arr)) {
				var longArr = arr;
				var shortArr = el;
				if(longArr.length < shortArr.length){
					var _shortArr = longArr;
					longArr = shortArr;
					shortArr = _shortArr;
				}
				var j = shortArr.length;
				while(j--){
					if(!this.contains(shortArr[j], longArr)){
						return false;
					}
				}
				return true;
			} else {
				//兼容el和arr位置颠倒的情况
				if (lang.isArray(el)) {
					var _arr = el;
					el = arr;
					arr = _arr;
				}
				var i = arr.length;
				while (i--) {
					if (arr[i] === el) {
						return true;
					}
				}
				return false;
			}

		};

		//求并集: 合并多个数组元素,并去重结果数组
		this.union = function() {
			var firstArr = arguments[0];
			var leftArrs = Array.prototype.slice.call(arguments, 1);
			var retArr = Array.prototype.concat.apply(firstArr, leftArrs);
			return this.uniquelize(retArr);
		};

		//求差集: 从newArr去除oldArr包含的元素后剩余元素组成的数组
		this.difference = function(firstArr, secondArr) {
			firstArr = this.uniquelize(firstArr);
			var me = this;
			var ret = [];
			this.forEach(firstArr, function(el){
				if(!me.contains(el, secondArr)){
					ret.push(el);
				}
			});
			return ret;
		};

		//求交集
		this.intersect = function(firstArr, secondArr){
			firstArr = this.uniquelize(firstArr);
			var me = this;
			var ret = [];
			this.forEach(firstArr, function(el){
				if(me.contains(el, secondArr)){
					ret.push(el);
				}
			});
			return ret;
		};

		//求补集
		this.complement = function(firstArr, secondArr){
			return this.difference(this.union(firstArr, secondArr), this.intersect(firstArr, secondArr));
		};

		this.maplize = function (arr) {
			var ret = {};
			this.forEach(arr, function (value, index) {
				ret[index] = value;
			});
			return ret;
		};
	}).call(_Array.prototype);

	return new _Array();
});