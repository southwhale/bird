define("bird.css3animate", [ "./bird.css3animation" ], function(require) {
    function CSSAnimate() {}
    (function() {
        var CSSAnimation = require("./bird.css3animation");
        this.cssAnimate = function(elem, animation, duration, opts) {
            new CSSAnimation(elem, animation, duration, opts).start();
        };
    }).call(CSSAnimate.prototype);
    return new CSSAnimate();
});