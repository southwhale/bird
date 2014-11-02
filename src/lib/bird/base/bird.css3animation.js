define(function(require) {
	var lang = require('./bird.lang');
	var event = require('./bird.event');
	//var reqFrame = require('./bird.requestframe');

	function CSSAnimation(elem, animationName, duration, opts) {
		this.element = elem;
		this.animationName = animationName;
		this.duration = duration;
		this.opts = opts;
	}

	(function() {
		this.cache = {};
		var that = this;

		this.find = function(a) {
			var ss = document.styleSheets;
			for (var i = ss.length - 1; i >= 0; i--) {
				try {
					var s = ss[i],
						rs = s.cssRules ? s.cssRules : s.rules ? s.rules : [];

					for (var j = rs.length - 1; j >= 0; j--) {
						if ((rs[j].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE || rs[j].type === window.CSSRule.MOZ_KEYFRAMES_RULE) && rs[j].name == a) {
							return rs[j];
						}
					}
				} catch (e) { /* Trying to interrogate a stylesheet from another domain will throw a security error */ }
			}
			return null;
		};
		this.init = function() {
			var /*keyframes,*/ animation = null,
				start = 0;
			this.options = {
				easing: 'linear',
				iterationCount: 1
			};

			//, prefixes = ['Webkit', 'Moz'];

			// Enable option setting
			for (var k in this.opts) {
				this.options[k] = this.opts[k];
			}

			this.onComplete = lang.isFunction(this.opts) ? this.opts : (this.opts && lang.isFunction(this.opts['onComplete'])) ? this.opts['onComplete'] : null;

			// Prevent animation triggers if the animation is already playing
			if (this.element.isPlaying)
				return;

			// Can we find the animaition called animationName?
			animation = this.find(this.animationName);

			if (!animation)
				return false;

			// Work out the timings of keyframes
			/*keyframes = {};

			 for(var i = 0; i < animation.cssRules.length; i++) {
			 var kf = animation.cssRules[i], name = kf.keyText, percentage = 0;

			 // Work out the percentage
			 name == 'from' ? percentage = 0 : name == 'to' ? percentage = 1 : percentage = name.replace('%', '') / 100;

			 // Store keyframe for easy recall
			 keyframes[(percentage * 100) + '%'] = kf;
			 }*/
		};
		this.start = function() {
			this.init();
			//var start = new Date().getTime();

			// Variables used by the runloop
			var current = percentage = roundedKey = keyframe = null,
				i = 0,
				found = false;
			this.applyCSSAnimation = function(anim) {
				found = false;
				//for( i = 0; i < prefixes.length && !found; i++) {
				if (this.element.style['WebkitAnimationName'] !== undefined) {
					this.element.style['WebkitAnimationDuration'] = anim.duration;
					this.element.style['WebkitAnimationTimingFunction'] = anim.timingFunction;
					this.element.style['WebkitAnimationIterationCount'] = anim.iterationCount;
					this.element.style['WebkitAnimationName'] = anim.name;
					found = true;
				}
				//}
			};
			// Trigger the animation
			that.cache['currentFx'] = this;
			this.applyCSSAnimation({
				name: this.animationName,
				duration: this.duration + 'ms',
				timingFunction: this.options.easing,
				iterationCount: this.options.iterationCount
			});

			this.element.isPlaying = true;
			var self = this;
			event.addListener(this.element, 'webkitAnimationEnd', function(e) {
				event.removeListener(self.element, 'webkitAnimationEnd', arguments.callee);
				//reset the styling so it can be triggered again
				self.applyCSSAnimation({
					name: null,
					duration: null,
					timingFunction: null,
					iterationCount: 0
				});
				self.element.isPlaying = 0;

				if (lang.isFunction(self.onComplete)) {
					self.onComplete();
				}
			});
		};
		this.isBusy = function() {
			return this.element.isPlaying;
		};

	}).call(CSSAnimation.prototype);


	return CSSAnimation;
});