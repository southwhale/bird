define(function(require) {
	var reqFrame = require('./bird.requestframe');

	function Spirit() {

	}

	//Spirit.interval = 17;

	(function() {
		/**
		 * Css sprite
		 */
		function Spirit(elem, opts) {
			this.elem = elem;
			//this.interval = opts.interval || Spirit.interval;
			this.bgPos = opts.backgroundPosition || opts['background-position'];
			this.count = opts.count || -1;
			this.picNumber = opts.picNumber;
		}


		Spirit.prototype = {
			init: function() {
				var arr = /\s*([\+|-])=\s*(-?[0-9\.]+)px\s+([\+|-])=\s*(-?[0-9\.]+)px/.exec(this.bgPos);
				this._x_calcu = arr[1];
				this._x = Number(arr[2]);
				this._y_calcu = arr[3];
				this._y = Number(arr[4]);

				var curArr = /\s*(-?[0-9\.]+)px\s+(-?[0-9\.]+)px/.exec(this.elem.style.backgroundPosition);
				this.x = Number(curArr[1]);
				this.y = Number(curArr[2]);
				arr = curArr = null;
			},
			start: function() {
				this.init();
				var count = 0;
				var picnum = 0;
				var self = this;
				this.intervalFn = function() {
					self.timerId = reqFrame.requestAFrame(function() {
						self.timerId = reqFrame.requestAFrame(arguments.callee);

						if (picnum === self.picNumber) {
							if (count < self.count || self.count === -1) {
								picnum = -1;
							} else if (timerId) {
								reqFrame.cancelAFrame(self.timerId);
								self.timerId = null;
							}
						}
						++picnum;
						self.elem.style.backgroundPosition = (self._x_calcu === '+' ? self.x + self._x * picnum : self.x - self._x * picnum) + 'px' + ' ' + (self._y_calcu === '+' ? self.y + self._y * picnum : self.y - self._y * picnum) + 'px';
						count++;
					});
				};

				this.intervalFn();
				return this;
			},
			pause: function() {
				if (this.timerId) {
					reqFrame.cancelAFrame(this.timerId);
					this.timerId = null;
				}
			},
			resume: function() {
				if (!this.timerId && this.intervalFn) {
					this.intervalFn();
				}
			}
		};

		this.spirit = function(elem, opts) {
			return new Spirit(elem, opts).start();
		};
	}).call(Spirit.prototype);

	return new Spirit();
});