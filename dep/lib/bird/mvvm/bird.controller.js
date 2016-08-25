/**
 * 负责查找具体Action的调用
 *
 */
define("bird.controller", [ "./bird.router", "bird.lang", "bird.array", "bird.logger", "./bird.action" ], function(require) {
    var router = require("./bird.router");
    var lang = require("bird.lang");
    var array = require("bird.array");
    var logger = require("bird.logger");
    var Action = require("./bird.action");
    function Controller() {
        this.actionInstanceCache = {};
    }
    (function() {
        this.start = function() {
            router.start();
            this.initActionListener();
            logger.log("bird.controller started!");
        };
        //调度指定的Action并启动Action
        this.dispatch = function(name, data) {
            var me = this;
            me.lastName = name;
            var instance = this.actionInstanceCache[name];
            if (instance) {
                enter.call(this, instance, data, name);
                return;
            }
            //兼容seajs和esl
            (require.async || require)(name, function(action) {
                //如果模块ModA需要的资源还没加载完全就点击链接进入另个模块ModB
                //进入ModB之后, ModA的资源加载完成, 此时不该进入ModA, 应抛弃ModA
                if (name !== me.lastName) {
                    return;
                }
                if (!lang.isFunction(action)) {
                    return;
                }
                var instance = new action();
                if (instance instanceof Action) {
                    me.actionInstanceCache[name] = instance;
                    enter.call(me, instance, data, name);
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
        function enter(instance, data, name) {
            data.action = name;
            this.currentAction && this.currentAction.leave(instance);
            this.currentAction = instance;
            instance.enter(data);
        }
    }).call(Controller.prototype);
    return new Controller();
});