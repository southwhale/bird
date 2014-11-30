define("bird.lrucache", [ "./bird.__lrucache__" ], function(require) {
    var LRUCache = require("./bird.__lrucache__");
    return new LRUCache();
});