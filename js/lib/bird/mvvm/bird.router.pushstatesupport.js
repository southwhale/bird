define(function(require) {
	function Router() {
		this.notFoundActionMap = null;
	}


	(function() {

		var event = require('bird.event');
		var Observer = require('bird.__observer__');

		this.actionObserver = new Observer();

		/*********************************************************************
		 *                             控制器
		 ********************************************************************/


		this.start = function() {
			this.watchLocation();
			this.bootFirstUrl();
			console.log('bird.router started!');
		};

		this.changeHash = function(hash) {
			if (this.lastHash === hash) {
				return;
			}

			location.hash = hash;
		};

		this.getHash = function() {
			// firefox下location.hash会自动decode
			// 体现在：
			//   视觉上相当于decodeURI，
			//   但是读取location.hash的值相当于decodeURIComponent
			// 所以需要从location.href里取出hash值
			/*var hash = location.hash;
				if (browser.isFirefox()) {
					hash = location.href.match(/#(.*)$/);
					hash && (hash = hash[1]);
				}

				if (hash) {
					return hash.replace(/^#/, '');
				}

				return '';*/

			//以上为网络上可以找到的实现,
			//以下为我自己的实现
			var hash = location.hash;

			//通过js改变hash好像不存在上述的问题
			/*if (hash && browser.isFirefox()) {
				hash = encodeURI(hash);
				}*/

			if (hash) {
				return hash.replace(/^#/, '').replace(/^!/, '') || '/';
			}
			return '/';
		};

		this.watchLocation = function() {
			this.lastHash = '';
			var me = this;

			event.addListener(window, 'popstate', function(e) {
				me.handleLocationChange();
			});
		};

		this.handleLocationChange = function(hash) {
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

		this.route = function(url, isNotHash) {
			if (isNotHash && !/^#/.test(url)) {
				window.location.href = url;
			} else {
				this.changeHash(url.replace(/^#/, ''));
			}
		};

		this.bootFirstUrl = function() {
			var me = this;
			setTimeout(function(){
				me.handleHashChange();
			}, 0);
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