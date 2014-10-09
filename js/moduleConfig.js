define(function(require) {
	var config = [
		{
			location: '/',
			action: 'index/index'
		}, {
			location: '/signin',
			action: 'signin/signin'
		}, {
			location: '/register',
			action: 'register/register'
		}, {
			location: '/course',
			action: 'course/course'
		}, {
			location: '/404',
			action: 'common/404',
			isNotFound: true
		}
	];

	return config;
})