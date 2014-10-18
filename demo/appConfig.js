define(function(require) {
	var config = [
		{
			location: '/',
			action: 'index/index'
		}, {
			location: '/todos',
			action: 'todos/todos'
		}, {
			location: '/bootstrap',
			action: 'bootstrap/bs'
		}, {
			location: '/icheck',
			action: 'icheck/icheck'
		}, {
			location: '/404',
			action: 'common/404',
			isNotFound: true
		}
	];

	return config;
})