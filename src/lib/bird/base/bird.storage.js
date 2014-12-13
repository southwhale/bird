/**
 * storage: 本地存储
 * localStorage & userData
 *
 */
define(function() {
	function Storage() {
		this.isLocalStorageSupported = !!window.localStorage;
		if(!this.isLocalStorageSupported) {
			this.dataDom = null;
			this.name = location.hostname || 'mockLocalStorage';
		}
	}

	(function() {
		this._init = function() {
			if (!this.dataDom) {
				try {
					this.dataDom = document.createElement('INPUT');
					this.dataDom.type = "hidden";
					this.dataDom.style.display = "none";
					this.dataDom.addBehavior("#default#userData");
					document.body.appendChild(this.dataDom);
					var expires = new Date();
					expires.setDate(expires.getDate() + 365);
					this.dataDom.expires = expires.toUTCString();
				} catch (e) {
					return false;
				}
			}
			return true;
		};

		this.setItem = function(key, value) {
			if (this.isLocalStorageSupported) {
				localStorage.setItem(key, value);
			} else if (this._init()) {
				this.dataDom.load(this.name);
				this.dataDom.setAttribute(key, value);
				this.dataDom.save(this.name);
			}
		};

		this.getItem = function(key) {
			if (this.isLocalStorageSupported) {
				localStorage.getItem(key);
			} else if (this._init()) {
				this.dataDom.load(this.name);
				return this.dataDom.getAttribute(key)
			}
		};

		this.remove = function(key) {
			if (this.isLocalStorageSupported) {
				localStorage.removeItem(key);
			} else if (this._init()) {
				this.dataDom.load(this.name);
				this.dataDom.removeAttribute(key);
				this.dataDom.save(this.name);
			}
		};

	}).call(Storage.prototype);

	return new Storage();
});