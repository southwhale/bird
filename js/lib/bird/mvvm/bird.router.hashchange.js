define(function(require) {
	function Router() {
		this.notFoundActionMap = null;
	}


	(function() {

		var event = require('bird.event');
		var Observer = require('bird.__observer__');
		var lang = require('bird.lang');

		this.actionObserver = new Observer();

		/*********************************************************************
		 *                             控制器
		 ********************************************************************/


		this.start = function() {
			this.watchHash();
			this.bootFirstUrl();
			console.log('bird.router[use hashChange] started!');
		};

		this.changeHash = function(hash) {
			hash = hash.replace(/^#/,'');
			if (this.lastHash === hash) {
				return;
			}

			location.hash = hash;
		};

		this.getHash = function() {
			var hash = location.hash;

			if (hash) {
				return hash.replace(/^#/, '').replace(/^!/, '') || '/';
			}
			return '/';
		};

		this.watchHash = function() {
			this.lastHash = '';
			var me = this;

			event.addListener(window, 'hashchange', function() {
				me.handleHashChange();
			});
		};

		this.handleHashChange = function(hash) {
			hash = hash || this.getHash();
			if (this.lastHash !== hash) {
				this.referrer = this.lastHash;
				this.lastHash = hash;

				this.parseActionQueryParam();
				this.callModule();
			}
		};

		this.parseActionQueryParam = function() {
			var aq = /([^!#~=&]+)(?:~([^#~]*))?/.exec(this.lastHash);
			this.location = '';
			this.query = '';
			this.param = null;
			if (aq) {
				this.location = aq[1] || '';
				this.query = aq[2] || '';
			}

			if (this.query) {
				var kv = this.param = {};
				this.query.replace(/([^#~=&]+)=([^#~=&]*)/g, function(m, n, k) {
					kv[n] = k;
				});
				kv = null;
			}
		};

		this.callModule = function() {
			if (this.location) {
				var updates = this.actionObserver.getUpdates(this.location);
				if (!updates && this.notFoundActionMap) {
					//这里需要替换掉历史记录中不存在的hash记录
					location.replace(location.href.split('#')[0] + '#!' + this.notFoundActionMap.location);
					//this.route('!' + this.notFoundActionMap.location);
				} else {
					this.actionObserver.publish(this.location, {
						param: this.param,
						query: this.query,
						location: this.location,
						referrer: this.referrer
					});
				}
			}
		};

		this.route = function(url, isWholeUrl) {
			if (isWholeUrl && !/^#/.test(url)) {
				window.location.href = url;
			} else {
				this.changeHash(url);
			}
		};

		this.bootFirstUrl = function() {
			var me = this;
			lang.nextTick(function(){
				me.handleHashChange();
			});
		};


		this.listenLocation = function(map, handle) {
			if (map.isNotFound) {
				this.notFoundActionMap = map;
			}
			this.actionObserver.subscribe(map.location, handle);
		};


	}).call(Router.prototype);

	return new Router();
});