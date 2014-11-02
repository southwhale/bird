/**
 * 应用环境缓存区
 *
 */
define(function(require) {
	function ApplicationContext() {
		this.cache = {};
	}

	(function() {
		this.set = function(key, value) {
			this.cache[key] = value;
		};

		this.get = function(key) {
			return this.cache[key];
		};

		this.remove = function(key) {
			return delete this.cache[key];
		};
	}).call(ApplicationContext.prototype);

	return new ApplicationContext();
});