(function() {
	var alias = {
		'jquery': 'lib/jquery/jquery-1.11.1.js',
		'moment': 'lib/moment/moment.js',
		'q': 'lib/q/q.js'
	};

	var modMap = {
		base: {
			prefix: 'lib/bird/base/',
			mods: [
				'bird.browser', 'bird.dom', 'bird.lang', 'bird.array', 'bird.string', 'bird.date', 'bird.object',
				'bird.uuid', 'bird.chain', 'bird.event', 'bird.observer', 'bird.request', 'bird.__observer__',
				'bird.syspatch', 'bird.template', 'bird.animate', 'bird.css3animate', 'bird.spirit', 'bird.util',
				'bird.class', 'bird.lrucache', 'bird.domobserver'
			]
		},

		mvvm: {
			prefix: 'lib/bird/mvvm/',
			mods: ['bird.controller', 'bird.router', 'bird.action', 'bird.databind', 'bird.applicationcontext', 'bird.validator']
		},

		ui: {
			prefix: 'lib/bird/ui/',
			mods: [
				'bird.ui', 'bird.ui.button', 'bird.ui.dialog', 'bird.ui.dialog.confirm', 'bird.ui.dialog.alert',
				'bird.ui.mask', 'bird.ui.panel'
			]
		},

		action: {
			prefix: 'module/biz/',
			mods: [
				'index/index', 'register/register', 'signin/signin', 'course/course', 'common/404'
			]
		},

		tool: {
			prefix: 'lib/bird/tool/',
			mods: ['mask', 'errorTrack']
		}
	};

	each(modMap, function(m) {
		each(m.mods, function(modName) {
			alias[modName] = m.prefix + modName;
		});
	});

	seajs.config({
		base: './js/',
		alias: alias
	});

	function each(p, handle) {
		var i, len;
		var isFunc = typeof handle === 'function';

		if (Array.isArray && Array.isArray(p) || p instanceof Array) {
			for (i = 0, len = p.length; i < len; i++) {
				if (isFunc) {
					handle(p[i], i, p);
				}
			}
		} else {
			for (i in p) {
				if (p.hasOwnProperty(i) && isFunc) {
					handle(p[i], i, p);
				}
			}
		}
	}
})();