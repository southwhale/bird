define("bird.animate", [ "./bird.lang", "./bird.dom", "./bird.animation" ], function(require) {
    var lang = require("./bird.lang");
    var dom = require("./bird.dom");
    function Animate() {}
    (function() {
        this.cache = {};
        var that = this;
        var Animation = require("./bird.animation");
        /**
		 * pre-handle params like '+=' and '-='
		 */
        function preHandleParams(el, params) {
            for (var i in params) {
                if (!/transform$|transform-origin$/i.test(i)) {
                    var arr = /([\+|-])=\s*(-?[0-9\.%]+)(\w*)/.exec(params[i]);
                    if (arr) {
                        switch (arr[1]) {
                          case "+":
                            params[i] = parseFloat(dom.getStyle(el, i)) + parseFloat(arr[2]);
                            break;

                          case "-":
                            params[i] = parseFloat(dom.getStyle(el, i)) - parseFloat(arr[2]);
                            break;
                        }
                        if (arr[3]) {
                            params[i] += arr[3];
                        }
                        arr = null;
                    }
                }
            }
        }
        this.animate = function(el, params, duration, tween, callback) {
            preHandleParams(el, params);
            var anim;
            if (lang.isPlainObject(duration)) {
                var opt = duration;
                anim = new Animation(el, params, opt.duration, opt.delay, opt.interval, opt.tween, opt.onInit, opt.onRun, opt.onComplete);
            } else {
                anim = new Animation(el, params, duration, null, null, tween, null, null, callback);
            }
            anim.start();
            that.cache["currentFx"] = anim;
            return anim;
        };
        this.rotate = function(el, prop, duration, callback) {
            prop = {
                transform: "rotate(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.rotateX = function(el, prop, duration, callback) {
            prop = {
                transform: "rotateX(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.rotateY = function(el, prop, duration, callback) {
            prop = {
                transform: "rotateY(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.rotateZ = function(el, prop, duration, callback) {
            prop = {
                transform: "rotateZ(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.skew = function(el, prop, duration, callback) {
            prop = {
                transform: "skew(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.scale = function(el, prop, duration, callback) {
            prop = {
                transform: "scale(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.translate = function(el, prop, duration, callback) {
            prop = {
                transform: "translate(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.fadeIn = function(el, duration, cb) {
            if (!dom.isHidden(el)) {
                return;
            }
            if (arguments.length === 1 || lang.isFunction(duration)) {
                el.style.display = "block";
                dom.css(el, {
                    opacity: el.$oldopacity || 1
                });
                if (duration) {
                    cb = duration;
                    cb.call(this);
                }
                return;
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            if (dom.isHidden(el)) {
                el.style.display = "block";
                el.$oldopacity = parseFloat(dom.getStyle(el, "opacity"));
                dom.css(el, {
                    opacity: 0
                });
            }
            return this.animate(el, {
                opacity: el.$oldopacity || 1
            }, duration || 400, null, function() {
                this.elem.style.display = "block";
                dom.css(this.elem, {
                    opacity: el.$oldopacity || 1
                });
                el.$oldopacity = null;
                if (lang.isFunction(cb)) cb.call(this);
            });
        };
        this.fadeOut = function(el, duration, cb) {
            if (dom.isHidden(el)) {
                return;
            }
            if (arguments.length === 1 || lang.isFunction(duration)) {
                el.style.display = "none";
                dom.css(el, {
                    opacity: el.$oldopacity || 1
                });
                if (duration) {
                    cb = duration;
                    cb.call(this);
                }
                return;
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            if (dom.isHidden(el)) {
                el.style.display = "block";
            }
            el.$oldopacity = parseFloat(dom.getStyle(el, "opacity"));
            return this.animate(el, {
                opacity: 0
            }, duration || 400, null, function() {
                this.elem.style.display = "none";
                dom.css(this.elem, {
                    opacity: el.$oldopacity || 1
                });
                el.$oldopacity = null;
                if (lang.isFunction(cb)) cb.call(this);
            });
        };
        this.slideUp = function(el, duration, tween, cb) {
            if (dom.isHidden(el)) {
                return;
            }
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            var oldheight = el.$oldheight = el.$oldheight || dom.getStyle(el, "height");
            oldheight === "auto" ? oldheight = dom.fullHeight(el) + "px" : oldheight;
            el.$oldOverflow = dom.getStyle(el, "overflow");
            dom.css(el, {
                overflow: "hidden",
                height: oldheight
            });
            var _cb = function() {
                dom.css(el, {
                    display: "none",
                    overflow: el.$oldOverflow,
                    height: el.$oldheight
                });
                el.$oldOverflow = null;
                el.$oldheight = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                height: "0px"
            }, duration || 400, tween, _cb);
        };
        this.slideDown = function(el, duration, tween, cb) {
            if (!dom.isHidden(el)) {
                return;
            }
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            el._$oldheight = el.$oldheight = el.$oldheight || dom.getStyle(el, "height");
            el.$oldheight === "auto" ? el.$oldheight = dom.fullHeight(el) + "px" : el.$oldheight;
            el.$oldOverflow = dom.getStyle(el, "overflow");
            dom.css(el, {
                height: "0px",
                display: "block",
                overflow: "hidden"
            });
            var _cb = function() {
                dom.css(el, {
                    overflow: el.$oldOverflow,
                    height: el._$oldheight
                });
                el.$oldOverflow = null;
                el.$oldheight = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                height: el.$oldheight
            }, duration || 400, tween, _cb);
        };
        this.slideLeft = function(el, duration, tween, cb) {
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            var oldwidth = el.$oldwidth = el.$oldwidth || dom.getStyle(el, "width");
            oldwidth === "auto" ? oldwidth = dom.fullWidth(el) + "px" : oldwidth;
            el.$oldOverflow = dom.getStyle(el, "overflow");
            dom.css(el, {
                overflow: "hidden"
            });
            var _cb = function() {
                dom.css(el, {
                    display: "none",
                    overflow: el.$oldOverflow,
                    width: el.$oldwidth
                });
                el.$oldOverflow = null;
                el.$oldwidth = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                width: "0px"
            }, duration || 400, tween, _cb);
        };
        this.slideRight = function(el, duration, tween, cb) {
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            el._$oldwidth = el.$oldwidth = el.$oldwidth || dom.getStyle(el, "width");
            el.$oldwidth === "auto" ? el.$oldwidth = dom.fullWidth(el) + "px" : el.$oldwidth;
            el.$oldOverflow = dom.css(el, "overflow");
            dom.css(el, {
                width: "0px",
                display: "block",
                overflow: "hidden"
            });
            var _cb = function() {
                dom.css(el, {
                    overflow: el.$oldOverflow,
                    width: el._$oldwidth
                });
                el.$oldOverflow = null;
                el.$oldwidth = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                width: el.$oldwidth,
                overflow: el.$oldOverflow
            }, duration || 400, tween, _cb);
        };
        this.moveY = function(el, y, duration, tween, cb) {
            return this.animate(el, {
                top: y
            }, duration || 400, tween, cb);
        };
        this.moveX = function(el, x, duration, tween, cb) {
            return this.animate(el, {
                left: x
            }, duration || 400, tween, cb);
        };
        this.delay = function(fn, t) {
            if (t === undefined) {
                t = fn;
                fn = null;
            }
            var o = {
                busy: 1,
                onComplete: fn || function() {},
                isBusy: function() {
                    return this.busy;
                }
            };
            setTimeout(function() {
                o.busy = 0;
                o.onComplete();
            }, t);
            that.cache["currentFx"] = o;
            return o;
        };
        this.serialAnimate = function(arr) {
            arr.shift()();
            var old = that.cache["currentFx"]["onComplete"];
            var self = this;
            that.cache["currentFx"]["onComplete"] = function() {
                if (lang.isFunction(old)) {
                    old.call(this);
                }
                if (arr.length > 0) {
                    self.serialAnimate(arr);
                }
            };
        };
        this.parallelAnimate = function(arr) {
            lang.forEach(arr, function(el) {
                el();
            });
        };
    }).call(Animate.prototype);
    return new Animate();
});