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
			this.watchLocation();
			this.bootFirstUrl();
			console.log('bird.router[use pushState] started!');
		};

		this.changeLocation = function(loc) {
			loc = loc.replace(/^#!/,'');
			if (this.lastLocation === loc) {
				return;
			}
			
			loc = loc.indexOf('?') === 0 ? loc : ('?' + loc);
			history.pushState({
				loc: loc
			}, null, location.pathname + loc);
			this.handleLocationChange(loc);
		};

		this.getLocation = function() {
			if(history.state && history.state.loc){
				return history.state.loc;
			}
			var loc = location.search;

			return loc || '?/';
		};

		this.watchLocation = function() {
			this.lastLocation = '';
			var me = this;

			event.addListener(window, 'popstate', function(e) {
				e.preventDefault();
				var loc = e.state && e.state.loc;
				me.handleLocationChange(loc);
			});

			event.delegate('a', 'click', function(e) {
				var hrefAttrValue = e.target.getAttribute('href');
				if(hrefAttrValue && hrefAttrValue.indexOf('#!') === 0){
					e.preventDefault();
					hrefAttrValue = hrefAttrValue.replace(/^#!/,'');
					if(hrefAttrValue.indexOf('?') === -1){
						hrefAttrValue = '?' + hrefAttrValue;
					}
					me.handleLocationChange(hrefAttrValue);
				}
			},document);
		};

		this.handleLocationChange = function(loc) {
			loc = loc || this.getLocation();
			if (this.lastLocation !== loc) {
				this.referrer = this.lastLocation;
				this.lastLocation = loc;
				if(!history.state || history.state.loc != loc){
					history.pushState({
						loc: loc
					},'',loc);
				}
				this.parseActionQueryParam();
				this.callModule();
			}
		};

		this.parseActionQueryParam = function() {
			var aq = /([^!~=&?]+)(?:~([^~?]*))?/.exec(this.lastLocation);
			this.location = '';
			this.query = '';
			this.param = null;
			if (aq) {
				this.location = aq[1] || '';
				this.query = aq[2] || '';
			}

			if (this.query) {
				var kv = this.param = {};
				this.query.replace(/([^~=&?]+)=([^~=&?]*)/g, function(m, n, k) {
					kv[n] = k;
				});
				kv = null;
			}
		};

		this.callModule = function() {
			if (this.location) {
				var updates = this.actionObserver.getUpdates(this.location);
				if (!updates && this.notFoundActionMap) {
					//这里需要替换掉历史记录中不存在的location记录
					var search = '?' + this.notFoundActionMap.location;
					history.replaceState({
						loc: search
					}, null, location.pathname + search);
					this.handleLocationChange(search);
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
			if (isWholeUrl && !/^#!/.test(url)) {
				window.location.href = url;
			} else {
				this.changeLocation(url);
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