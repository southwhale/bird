define("bird.router", [ "./bird.router.pushstate", "./bird.router.hashchange" ], function(require) {
    return history.pushState ? require("./bird.router.pushstate") : require("./bird.router.hashchange");
});