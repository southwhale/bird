define("appConfig", [], function(require) {
    var config = [ {
        location: "/",
        action: "index/index"
    }, {
        location: "/todos",
        action: "todos/todos"
    }, {
        location: "/todos/{{id}}",
        //变量需要双花括号包围
        action: "icheck/icheck"
    }, {
        location: "/bootstrap",
        action: "bootstrap/bs"
    }, {
        location: "/icheck",
        action: "icheck/icheck"
    }, {
        location: "/404",
        action: "common/404",
        isNotFound: true
    } ];
    return config;
});