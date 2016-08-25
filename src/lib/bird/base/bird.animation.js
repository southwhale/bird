define(function(require) {
	var lang = require('./bird.lang');
	var dom = require('./bird.dom');
	var logger = require('./bird.logger');
	var reqFrame = require('./bird.requestframe');
	/**
	 *       elem:   element will animate
	 *      props:   properties will be updated
	 *   duration:   animation duration
	 *      delay:   time delay before start animation
	 *   interval:   interval between two frames
	 *      tween:   animation path function, you can use anyone in
	 *               [
	 'linear','easeIn','easeOut','easeBoth','easeInStrong','easeOutStrong','easeBothStrong','elasticIn',
	 'elasticOut','elasticBoth','backIn','backOut','backBoth','bounceIn','bounceOut','bounceBoth'
	 ]
	 ,or define a path function yourself
	 *     initcb:   callback before animation
	 *      runcb:   callback between animation
	 * completecb:   callback funcation when animation complete
	 * 不兼容IE,需要针对IE修改bug
	 */
	function Animation(elem, props, duration, delay, interval, tween, onInit, onRun, onComplete) {
		this.elem = elem;
		this.props = props;
		this.duration = duration;
		this.delay = delay;
		this.interval = interval;
		this.tween = tween;
		this.onInit = onInit;
		this.onRun = onRun;
		this.onComplete = onComplete;
	}

	//Animation.interval = 17;

	(function() {

		var Tween = require('./bird.tween');

		this.init = function() {
			this.tween = lang.isString(this.tween) ? Tween[this.tween] || Tween["linear"] : lang.isFunction(this.tween) ? this.tween : Tween["linear"];
			//this.interval = Animation.interval;
			this.frames = Math.ceil(this.duration / this.interval);

			this.cssText = this.elem.style.cssText.replace(/\s/g, '');

			this.isRunning = 0;

			this.units = {};
			this.cprop = {};
			this.$props = {};
			this.$cprop = {};
			this.$oldProp = {};
			for (var i in this.props) {
				if (!/transform$|transform-origin$/i.test(i)) {
					if (!this.hasCommonProperty) {
						this.hasCommonProperty = 1;
					}
					this.$oldProp[i] = dom.getStyle(this.elem, i);
					var arr = /^-?\d+(?:\.?\d+)?([a-zA-Z]+)/.exec(this.props[i]);
					this.units[i] = arr ? arr[1] : "";
					this.cprop[i] = this.$oldProp[i];
					this.$props[i] = parseFloat(this.props[i]);
					this.$cprop[i] = parseFloat(this.cprop[i]);
				}
			}

			this.count = 0;
			this.waitTime = 0;

			/**
			 * next is Css3Animation initialization
			 */
			if (!this.props['transform']) {
				return;
			}
			this.cTransformPropText = dom.getStyle(this.elem, '-webkit-transform');
			if (!this.cTransformPropText || this.cTransformPropText === 'none') {
				this.cTransformPropText = '';
			}
			//this.curTransformOriginProp = Jkit.getStyle(this.elem,'-webkit-transform-origin');
			this.transformPropText = this.props['transform'];
			this._prop = {};
			this._cprop = {};

			for (var i = 0, len = css3propkeys.length; i < len; i++) {
				var css3propkey = css3propkeys[i];
				var propValueArr = css3reg[css3propkey].exec(this.transformPropText);
				var cpropValueArr = css3reg[css3propkey].exec(this.cTransformPropText);
				if (propValueArr) {
					this._cprop[css3propkey] = !cpropValueArr ? css3default[css3propkey] : (cpropValueArr[4] ? [parseFloat(cpropValueArr[2]), parseFloat(cpropValueArr[4])] : (cpropValueArr[2] ? [parseFloat(cpropValueArr[2])] : css3default[css3propkey]));
					this._prop[css3propkey] = propValueArr[4] ? [propValueArr[1] === '+=' ? this._cprop[css3propkey][0] + parseFloat(propValueArr[2]) : propValueArr[1] === '-=' ? this._cprop[css3propkey][0] - parseFloat(propValueArr[2]) : parseFloat(propValueArr[2]), propValueArr[3] === '+=' ? this._cprop[css3propkey][1] + parseFloat(propValueArr[4]) : propValueArr[3] === '-=' ? this._cprop[css3propkey][1] - parseFloat(propValueArr[4]) : parseFloat(propValueArr[4])] : [propValueArr[1] === '+=' ? this._cprop[css3propkey][0] + parseFloat(propValueArr[2]) : propValueArr[1] === '-=' ? this._cprop[css3propkey][0] - parseFloat(propValueArr[2]) : parseFloat(propValueArr[2])];

					if (!cpropValueArr || cpropValueArr[2] == null) {
						this.cTransformPropText += ' ' + css3propkey + '(' + css3default[css3propkey][0] + css3unit[css3propkey];
						if (css3default[css3propkey][1] != null) {
							this.cTransformPropText += ',';
							this.cTransformPropText += css3default[css3propkey][1] + css3unit[css3propkey];
						}
						this.cTransformPropText += ')';
					}
				}
			}
			this.hasTransform = 1;
			delete this.props['transform'];
		};

		this.start = function() {
			this.init();

			if (lang.isFunction(this.onInit)) {
				this.onInit.call(this);
			}
			this.hasOnRun = lang.isFunction(this.onRun) ? 1 : 0;
			//this.hasOnComplete = Jkit.isFunction(this.onComplete) ? 1 : 0;

			if (this.props['transform-origin']) {
				this.elem.style['-webkit-transform-origin'] = this.props['transform-origin'];
				delete this.props['transform-origin'];
			}

			var self = this;

			this.intervalfn = function() {
				self.startTime = self.startTime || reqFrame.now();
				self.startTime += self.waitTime;
				self.isRunning = 1;
				self.pos = 0;
				self.timerId = reqFrame.requestAFrame(function() {
					self.timerId = reqFrame.requestAFrame(arguments.callee);

					var n = reqFrame.now() - self.startTime;
					if (n <= self.duration) {
						self.pos = self.tween(n, 0, 1, self.duration);
						if (self.hasCommonProperty) {
							for (var i in self.$props) {
								//self.cprop[i] = self.tween(n, self.$cprop[i], self.$props[i] - self.$cprop[i], self.duration) + self.units[i];
								self.cprop[i] = self.$cprop[i] + (self.$props[i] - self.$cprop[i]) * self.pos + self.units[i];
								//self.cssText = css(self.cssText, self.cprop, i);
								self.elem.style[i] = self.cprop[i];
								logger.log(self.elem.style[i]);
							}
						}
						if (self.hasTransform) {
							for (i in self._prop) {
								var p = self._prop[i];
								var cp = self._cprop[i];
								//var v0 = self.tween(n, cp[0], p[0] - cp[0], self.duration);
								var v0 = cp[0] + (p[0] - cp[0]) * self.pos;
								var v1;
								if (p[1] != null) {
									v1 = cp[1] + (p[1] - cp[1]) * self.pos;
									//v1 = self.tween(n, cp[1], p[1] - cp[1], self.duration);
								}
								self.cTransformPropText = css3replacer[i](self.cTransformPropText, v0, v1);
							}
							self.elem.style['-webkit-transform'] = self.cTransformPropText;
						}

						if (self.hasOnRun) {
							self.onRun.call(self);
						}
						self.count++;
					} else {
						if (self.timerId) {
							reqFrame.cancelAFrame(self.timerId);
							self.timerId = null;
						}
						self.isRunning = -1;

						if (self.hasCommonProperty) {
							for (var i in self.props) {
								self.elem.style[i] = self.props[i]; // + self.units[i];
							}
						}
						if (self.hasTransform) {
							for (i in self._prop) {
								self.cTransformPropText = css3replacer[i](self.cTransformPropText, self._prop[i][0], self._prop[i][1]);
							}
							self.elem.style['-webkit-transform'] = self.cTransformPropText;
						}

						if (lang.isFunction(self.onComplete)) {

							self.onComplete.call(self);
						}

					}

				});
			};
			if (this.delay) {
				setTimeout(this.intervalfn, this.delay);
			} else {
				this.intervalfn();
			}
		};

		this.pause = function() {
			if (self.timerId) {
				reqFrame.cancelAFrame(self.timerId);
				self.timerId = null;
			}
			this.isRunning = 0;
			this.waitTime = reqFrame.now();
		};

		this.resume = function() {
			if (!this.isRunning) {
				this.waitTime = reqFrame.now() - this.waitTime;
				this.intervalfn();
			}
		};

		this.stop = function(clear) {
			if (self.timerId) {
				reqFrame.cancelAFrame(self.timerId);
				self.timerId = null;
			}
			this.isRunning = -1;
			this.clear();
		};

		this.reset = function() {
			this.stop();
			dom.css(this.elem, this.$oldProp);
		};

		this.clear = function() {
			for (var i in this) {
				var o = this[i];
				if (lang.isPlainObject(o)) {
					for (var j in o) {
						delete o[j];
					}
				}
				delete this[i];
			}
		};

		this.isBusy = function() {
			return this.isRunning === 1;
		};


		function css(cssText, cprop, i) {
			var reg = new RegExp("(" + i + ":)-?(?:[a-zA-Z0-9\.%#]+)?", "ig");
			return reg.test(cssText) ? cssText.replace(reg, "$1" + cprop[i]) : cssText += ";" + i + ":" + cprop[i];
		}

		var css3replacer = {
			'rotate': rotateReplace,
			'rotateX': rotateXReplace,
			'rotateY': rotateYReplace,
			'rotateZ': rotateZReplace,
			'scale': scaleReplace,
			'skew': skewReplace,
			'translate': translateReplace
		};

		var css3reg = {
			'rotate': /rotate\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
			'rotateX': /rotateX\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
			'rotateY': /rotateY\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
			'rotateZ': /rotateZ\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
			'skew': /skew\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*,\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
			'scale': /scale\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)\s*,\s*([+|-]=)?\s*(-?[0-9.]+)\s*\)/,
			'translate': /translate\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)px\s*,\s*([+|-]=)?\s*(-?[0-9.]+)px\s*\)/
		};

		var hascss3reg = /rotate$|rotateX$|rotateY$|rotateZ$|translate$|scale$|skew$/i;

		var css3default = {
			'rotate': [0],
			'rotateX': [0],
			'rotateY': [0],
			'rotateZ': [0],
			'skew': [0, 0],
			'scale': [1, 1],
			'translate': [0, 0]
		};

		var css3unit = {
			'rotate': 'deg',
			'rotateX': 'deg',
			'rotateY': 'deg',
			'rotateZ': 'deg',
			'skew': 'deg',
			'scale': '',
			'translate': 'px'
		};

		var css3propkeys = ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skew', 'scale', 'translate'];

		function rotateReplace(text, deg) {
			return text.replace(css3reg['rotate'], function(a, b, c, d, e) {
				return 'rotate(' + deg + 'deg)';
			});
		}

		function rotateXReplace(text, xdeg) {
			return text.replace(css3reg['rotateX'], function(a, b, c, d, e) {
				return 'rotateX(' + xdeg + 'deg)';
			});
		}

		function rotateYReplace(text, ydeg) {
			return text.replace(css3reg['rotateY'], function(a, b, c, d, e) {
				return 'rotateY(' + ydeg + 'deg)';
			});
		}

		function rotateZReplace(text, zdeg) {
			return text.replace(css3reg['rotateZ'], function() {
				return 'rotateZ(' + zdeg + 'deg)';
			});
		}

		function skewReplace(text, xdeg, ydeg) {
			return text.replace(css3reg['skew'], function() {
				return 'skew(' + xdeg + 'deg,' + ydeg + 'deg)';
			});
		}

		function scaleReplace(text, x, y) {
			return text.replace(css3reg['scale'], function() {
				return 'scale(' + x + ',' + y + ')';
			});
		}

		function translateReplace(text, x, y) {
			return text.replace(css3reg['translate'], function() {
				return 'translate(' + x + 'px,' + y + 'px)';
			});
		}
	}).call(Animation.prototype);

	return Animation;
});