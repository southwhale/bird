(function() {
	var pathname = location.pathname;
	var modprefix = /\/$/.test(pathname) ? pathname : pathname.substring(0, pathname.lastIndexOf('/') + 1);

	var alias = {
		'jquery': 'lib/jquery/jquery-1.11.1',
		'bootstrap': modprefix + 'component/bootstrap/js/bootstrap.amd',
		'icheck': modprefix + 'component/icheck/icheck.amd',
		'moment': 'lib/moment/moment',
		'q': 'lib/q/q'
	};

	var modMap = {
		/*//begin base
		base: {
			prefix: 'lib/bird/base/',
			mods: [
				'bird.browser', 'bird.dom', 'bird.lang', 'bird.array', 'bird.string', 'bird.date', 'bird.object',
				'bird.uuid', 'bird.chain', 'bird.event', 'bird.observer', 'bird.request', 'bird.__observer__',
				'bird.syspatch', 'bird.template', 'bird.animate', 'bird.css3animate', 'bird.spirit', 'bird.util',
				'bird.class', 'bird.lrucache', 'bird.domobserver'
			]
		},
		//end*/
		/*//begin mvvm
		mvvm: {
			prefix: 'lib/bird/mvvm/',
			mods: ['bird.controller', 'bird.router', 'bird.action', 'bird.databind', 'bird.applicationcontext', 'bird.validator']
		},
		//end*/

		ui: {
			prefix: 'lib/bird/ui/',
			mods: [
				'bird.ui', 'bird.ui.button', 'bird.ui.dialog', 'bird.ui.dialog.confirm', 'bird.ui.dialog.alert',
				'bird.ui.mask', 'bird.ui.panel'
			]
		},
		/*//begin app
		app: {
			prefix: modprefix + 'demo/',
			mods: [
				'index/index', 'todos/todos', 'bootstrap/bs', 'icheck/icheck', 'entry'
			]
		},
		//end*/
		module: {
			prefix: 'module/biz/',
			mods: [
				'common/404'
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
		base: modprefix,
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