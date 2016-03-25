define("bird.requestframe", [], function(require) {
    !window.requestAnimationFrame && (window.requestAnimationFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            return window.setTimeout(callback, 1e3 / 60);
        };
    }());
    !window.cancelAnimationFrame && (window.cancelAnimationFrame = function() {
        return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(id) {
            window.clearTimeout(id);
        };
    }());
    function RequestAFrame() {}
    (function() {
        this.requestAFrame = function(callback) {
            return window.requestAnimationFrame(callback);
        };
        this.cancelAFrame = function(id) {
            window.cancelAnimationFrame(id);
        };
        this.now = function() {
            return Date.now ? Date.now() : new Date().getTime();
        };
    }).call(RequestAFrame.prototype);
    return new RequestAFrame();
});