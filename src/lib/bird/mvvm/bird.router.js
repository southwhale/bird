define(function(require) {
	//return history.pushState ? require('./bird.router.pushstate') : require('./bird.router.hashchange');
    return require('./bird.router.hashchange');
});