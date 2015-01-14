/**
 * 负责查找具体Action的调用
 *
 */
define("bird.controller", [ "./bird.router", "bird.lang", "bird.array", "./bird.action" ], function(require) {
    var router = require("./bird.router");
    var lang = require("bird.lang");
    var array = require("bird.array");
    var Action = require("./bird.action");
    function Controller() {}
    (function() {
        this.start = function() {
            router.start();
            this.initActionListener();
            console.log("bird.controller started!");
        };
        //调度指定的Action并启动Action
        this.dispatch = function(name, data) {
            var me = this;
            //兼容seajs和esl
            (require.async || require)(name, function(action) {
                data.action = name;
                if (action && action instanceof Action) {
                    me.currentAction && me.currentAction.leave(action);
                    var lastAction = me.currentAction;
                    me.currentAction = action;
                    action.enter(data, lastAction);
                }
            });
        };
        this.initActionListener = function() {
            var me = this;
            array.forEach(this.actionMaps, function(la) {
                router.listenLocation(la, function(data) {
                    if (lang.isString(la.action)) {
                        me.dispatch(la.action, data);
                    } else if (lang.isArray(la.action)) {
                        array.forEach(la.action, function(actionName) {
                            me.dispatch(actionName, data);
                        });
                    }
                });
            });
        };
        this.configApp = function(options) {
            this.actionMaps = lang.isArray(options) ? options : options.actionMaps;
        };
    }).call(Controller.prototype);
    return new Controller();
});