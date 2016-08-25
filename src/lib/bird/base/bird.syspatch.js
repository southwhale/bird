define(function(require) {
	var util = require('./bird.util');
	/*********************************************************************
	 *                             系统函数补丁
	 ********************************************************************/
	var ctx = window;

	/**
	 * 保证JSON在语法上可行
	 */
	if (typeof ctx.JSON === 'undefined') {
		ctx.JSON = {
			parse: function(s) {
				//return ctx.eval('(' + s + ')');
				return new Function('return (' + s + ')')();
			},
			stringify: util.stringify
		};
	}

	/**
	 * 增强bind实现
	 */
 	!Function.prototype.bind && (Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(
              this instanceof fNOP && oThis ? this : oThis || window,
              aArgs.concat(Array.prototype.slice.call(arguments))
          );
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  });

});