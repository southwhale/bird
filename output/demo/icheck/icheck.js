/**
 * AMD icheck/icheck
 * require path: '/microbird/demo/icheck/icheck'
 */
define("icheck/icheck", [ "bird.class", "bird.action", "bird.request", "bird.validator", "bird.controller", "bird.dom", "bird.array", "bird.event", "icheck" ], function(require) {
    var Class = require("bird.class");
    var Action = require("bird.action");
    var request = require("bird.request");
    var validator = require("bird.validator");
    var controller = require("bird.controller");
    var dom = require("bird.dom");
    var array = require("bird.array");
    var event = require("bird.event");
    require("icheck");
    function ICheck() {
        ICheck.superClass.apply(this, arguments);
    }
    Class.inherit(ICheck, Action);
    (function() {
        this.tplUrl = "./demo/icheck/tpl/tpl.html";
        this.title = "示例 | CheckBox/Radio";
        this.afterRender = function($model) {
            $("input").iCheck({
                checkboxClass: "icheckbox_square-blue",
                radioClass: "iradio_square-blue",
                increaseArea: "20%"
            });
        };
        this.initModel = function($model) {};
        this.bindEvent = function() {};
        this.beforeLeave = function() {};
    }).call(ICheck.prototype);
    return new ICheck();
});