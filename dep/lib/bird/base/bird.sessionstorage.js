/**
 * sessionstorage: 会话级别存储
 * sessionStorage & cookie
 *
 */
define("bird.sessionstorage", [], function() {
    function SessionStorage() {
        this.isSessionStorageSupported = !!window.sessionStorage;
        if (!this.isSessionStorageSupported) {
            this.expires = 0;
        }
    }
    (function() {
        this.setItem = function(key, value) {
            if (this.isSessionStorageSupported) {
                sessionStorage.setItem(key, value);
            }
        };
        this.getItem = function(key) {
            if (this.isSessionStorageSupported) {
                return sessionStorage.getItem(key);
            }
        };
        this.remove = function(key) {
            if (this.isSessionStorageSupported) {
                sessionStorage.removeItem(key);
            }
        };
    }).call(SessionStorage.prototype);
    return new SessionStorage();
});