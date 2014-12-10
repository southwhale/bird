/**
 * @file: bird.js
 * @author: liwei47@baidu.com
 * @version: 1.0.0
 * @date: 2014-12-10
 */
/**
 *	封装LRU cache为独立模块
 */
define("bird.__lrucache__", [], function(require) {
    /*
	 *
	 *
	 * Project : 	LRU ( Least Recently Used ) Cache
	 * Version : 	1.0
	 * Programmer : Seyed-Mahdi Pedramrazi
	 * Email :		pedramphp@gmail.com
	 * Date    : 	May 2010
	 *
	 *
	 *
	 * This is a stand alone script you only need this JS file to
	 * work with LRU Cache Object
	 *
	 *
	 * Technology :
	 *
	 * 1 - Prototypical Inheritance in Javascript with Object.Create function ( Object Oriented Programming in Javascript ).
	 * 2 - Implementing Real Public and Private Functions with closure functions
	 * 3 - code reusibility if you want to extend this Object use Object.Extend function you don't need to modify this code .
	 *
	 *
	 * Rules :
	 *
	 * 1- In LRU Cache if the Cache is Full the
	 * 	  Oldest Record will be remvoed from the Cache
	 * 	  and the New Record will be Inserted into the Top of the Cache
	 *
	 * 2- Records and Cache may have Expiration (Optional) -  More Information about Expiration is in the Function Comments
	 *
	 *
	 * Public Functions :
	 *
	 * myCache.settings()
	 * myCache.setSize()
	 * myCache.getSize()
	 * myCache.add()
	 * myCache.flush()
	 * myCache.get()
	 * myCache.getValue()
	 * myCache.getCacheRecords()
	 * myCache.getCache()
	 *
	 *
	 * Usage :
	 *
	 *
	 *
	 * Create :
	 *
	 *
	 * How to create a new instance of the Cache
	 * By default the Cache Holds 1000 Items
	 * and there is no Expiration for it
	 * and No Callback Function
	 *
	 * <code>
	 *
	 * var myCache = Object.create( Cache );
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 *
	 * configuration :
	 *
	 *  maxsize : you could change the size of the cache easily
	 *  absoluteExpire: your cache will be expired after N seconds if you set the absolute Expire
	 *  slidingExpire : your cache will be expired after N seconds of the Last time the Cache was used .
	 *  callbak function : this function will be triggered when the cache is expired
	 * <code>
	 *
	 * myCache.settings({
	 * 		absoluteExpire : 50 ,
	 * 		slidingExpire  : 20 ,
	 * 		maxsize 	   : 10 ,
	 * 		callback 	   : function(data){
	 *
	 *		}
	 * });
	 *
	 * </code>
	 *
	 *
	 *
	 * Set Cache size :
	 * if sometime along the way you want to set the Cache you can use this function
	 *
	 * <code>
	 *
	 * myCache.setSize( 3 );
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 *
	 *
	 * Get Cache size :
	 *
	 * <code>
	 *
	 * myCache.getSize();
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 *
	 * Add Records :
	 *
	 * if you want to add a record to the Cache
	 * you have to pass a pair of key / value to this function below.
	 *
	 * <code>
	 *
	 * myCache.add( 'key' , 'value' );
	 *
	 * </code>
	 *
	 *
	 *
	 * if you want to add Expiration to the Record you can
	 *  absoluteExpire: your record will be expired after N seconds if you set the absolute Expire
	 *  slidingExpire : your record will be expired after N seconds of the Last time the Record was Fetched .
	 *  callback      : callback function will be triggered when  records expired OR Cache is flushed OR noSpace in Cache
	 *
	 * <code>
	 *
	 * myCache.add('key' , 'value' , { absoluteExpire : 100 ,
	 * 									slidingExpire : 5
	 * 									callback:function( data ){ console.log(data); }
	 * 								  }
	 * });
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 * Flush Cache :
	 *
	 * if you want to empty your Cache use this
	 *
	 * <code>
	 *
	 * myCache.flush();
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 * Get Record :
	 *
	 * Input is the Key value of the record
	 * returns the record Object
	 *
	 * <code>
	 *
	 *  myCache.get('key')
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 *
	 *
	 * Get Record Value :
	 *
	 * Input is the Key value of the record
	 * returns the Value of the record
	 *
	 * <code>
	 *
	 *  myCache.getValue('key')
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 *
	 * Get All Records
	 *
	 * returns all records of the cache
	 * <code>
	 *
	 * myCache.getCacheRecords();
	 *
	 * </code>
	 *
	 *
	 *
	 *
	 *
	 * Get All Information Of the Cache
	 *
	 * <code>
	 *
	 * myCache.getCache();
	 *
	 * </code>
	 *
	 *
	 */
    /*
	 *
	 *	Cache Object is Using these Objects
	 * 	 <	Cache Helper Objects >
	 *
	 *
	 */
    var utilities = {
        // Used for trimming whitespace
        rtrim: /^(\s|\u00A0)+|(\s|\u00A0)+$/g,
        /*
		 * utilities . trim
		 * return trims version of a text
		 */
        trim: function(text) {
            if (text === undefined) {
                text = "";
            }
            return (text.toString() || "").replace(this.rtrim, "");
        },
        /* </ trim > */
        /*
		 *
		 * utilities.isEmpty
		 *
		 *
		 * All these Cases return true
		 *  i = '' ,
		 *  i = '  ' ,
		 *  i = undefined ,
		 *  i = null
		 */
        isEmpty: function(text) {
            if (text == 0) {
                text = "";
            }
            return this.trim(text) == "";
        },
        /* </ isEmpty > */
        /*
		 * utilities.validArguments
		 *
		 * Validate Arguments if
		 * 1-  arguments length is equal or more than our expectedLength
		 * 2-  arguments are not Empty
		 *
		 * returns true if the argument is valid
		 *
		 */
        validArguments: function(args, expectedLength) {
            if (args.length == 0 || args.length < expectedLength) {
                return false;
            }
            for (var i = 0; i < args.length; i++) {
                if (this.isEmpty(args[i])) {
                    return false;
                }
            }
            return true;
        }
    };
    /* </ utilities > */
    /*
	 *
	 *
	 * 	 <	/Cache Helper Objects >
	 *
	 *
	 */
    /*
	 * Using Closure
	 * _construc contains Public and Private Objects
	 *
	 * cachePrivateActions : Private Object
	 *
	 * returns a Public Object
	 *
	 *
	 */
    function Cache() {
        /*******************
		 *
		 * Private Functions
		 *
		 * all the function names are descriptive
		 * comments are added
		 *
		 ******************/
        var cachePrivateActions = {
            maxsize: 1e3,
            // Default Cache size 
            records: {},
            // list of all records
            recordsIndex: [],
            // list of the Indexes of all records
            slidingExpire: null,
            // timestamp : setting the sliding Expire of the Cache , a get action extends the sliding Expire
            slidingExpireSecond: null,
            // seconds
            absoluteExpire: null,
            // timestamp : setting the absolute Expire of the Cache
            absoluteExpireSecond: null,
            // seconds 
            lastAccessed: new Date().getTime(),
            // timestamp : record the timestamp , when the cache is last accessed
            created: new Date().getTime(),
            // timestamp : record the timestamp , when the cache is created	
            callback: function() {}
        }, cpa = cachePrivateActions;
        // assigning cachePrivateActions to cpa just for having a short variable toyse
        // Setting Cache Sliding Expire
        cpa._setSlidingExpire = function(slidingExpire) {
            this.slidingExpireSecond = slidingExpire;
            this.slidingExpire = this.lastAccessed + slidingExpire * 1e3;
        };
        // Setting Cache Absolute Expire
        cpa._setAbsoluteExpire = function(absoluteExpire) {
            this.absoluteExpireSecond = absoluteExpire;
            this.absoluteExpire = this.lastAccessed + absoluteExpire * 1e3;
        };
        // Check if Cache is Full . 
        cpa._isFull = function() {
            return this._getMaxSize() == this._usedSize();
        };
        // Set Cache Max Size
        cpa._setMaxSize = function(maxsize) {
            // once the cache is larger than the maxsize we couldn't shrink the cache
            if (this._usedSize() > maxsize) {
                return;
            }
            this.maxsize = maxsize;
        };
        cpa._getMaxSize = function() {
            return this.maxsize;
        };
        /*
		 * _usedSize
		 *
		 * returns count of how many record is used in the Cache
		 */
        cpa._usedSize = function() {
            return this.recordsIndex.length;
        };
        /*
		 * _push
		 *
		 * Push a new Record to the record Object
		 *
		 */
        cpa._push = function(key, value, options) {
            this._pushRecord(key, value, this.recordsIndex.push(key) - 1, options);
        };
        cpa._pushRecord = function(key, value, index, options) {
            this.records[key] = {
                index: index,
                value: value,
                callback: function() {},
                lastAccessed: new Date().getTime()
            };
            // updating absolute Expire if it is Set
            if (!utilities.isEmpty(options.absoluteExpire) && options.absoluteExpire >= 1) {
                this.records[key].absoluteExpire = this.records[key].lastAccessed + options.absoluteExpire * 1e3;
                this.records[key].absoluteExpireSecond = options.absoluteExpire;
            }
            // updating sliding Expire if it is Set
            if (!utilities.isEmpty(options.slidingExpire) && options.slidingExpire >= 1) {
                if (!this.records[key].absoluteExpire || this.records[key].absoluteExpire && this.records[key].absoluteExpire > options.slidingExpire) {
                    this.records[key].slidingExpire = this.records[key].lastAccessed + options.slidingExpire * 1e3;
                    this.records[key].slidingExpireSecond = options.slidingExpire;
                }
            }
            // setting our callback function to our record Object
            if (options.callback && typeof options.callback == "function") {
                this.records[key].callback = options.callback;
            }
        };
        /*
		 *
		 * Remove the Oldest Record
		 *
		 */
        cpa._removeOldestRecord = function() {
            var index = this.recordsIndex.length - 1, key = this.recordsIndex[index];
            this._callbackRecord("noSpace", this._getRecordByIndex(index), key);
            this._removeRecord(index);
        };
        /*
		 *
		 * Add a new Record to our record Object
		 * we add this record to the top of our List
		 *
		 */
        cpa._unshift = function(key, value, options) {
            //prepend key to recordsIndex Array
            this.recordsIndex.unshift(key);
            // increment  all indexes greater than 0  
            for (var i in this.records) {
                this.records[i].index++;
            }
            //Push a new record to records
            this._pushRecord(key, value, 0, options);
        };
        /*
		 *
		 * Update ALl Records Index
		 * when we push a new Record
		 * we update all the indexes
		 *
		 */
        cpa._updateAllRecordsIndex = function(index) {
            for (var i in this.records) {
                if (index < this.records[i].index) {
                    this.records[i].index--;
                }
            }
        };
        /*
		 *
		 * Fetch All records in the Cache
		 * returns Object of records
		 *
		 */
        cpa._getCacheRecords = function() {
            if (this.recordsIndex.length == 0) {
                return false;
            }
            var cacheObject = {};
            for (var i = 0; i < this.recordsIndex.length; i++) {
                cacheObject[i] = this.records[this.recordsIndex[i]];
                //delete cacheObject[i].index;
                cacheObject[i].key = this.recordsIndex[i];
            }
            return cacheObject;
        };
        /*
		 *
		 * Fetch All Cache Information Including the Records
		 *
		 */
        cpa._getCache = function() {
            var cache = {};
            cache.maxsize = cpa._getMaxSize();
            cache.records = cpa._getCacheRecords();
            cache.absoluteExpire = cpa.absoluteExpire;
            cache.slidingExpire = cpa.slidingExpire;
            cache.absoluteExpireSecond = cpa.absoluteExpireSecond;
            cache.slidingExpireSecond = cpa.slidingExpireSecond;
            return cache;
        };
        /*
		 *
		 * Fetch Record By Key
		 * returns the Record
		 *
		 */
        cpa._getRecord = function(key) {
            // return false if the record doesn't exist 
            if (!this.records[key]) {
                return false;
            }
            this._updateRecordLastAccessed(this.records[key]);
            return this.records[key];
        };
        /*
		 *
		 * Fetch record Value By Key
		 *
		 */
        cpa._getRecordValue = function(key) {
            // return false if the record doesn't exist 
            if (!this.records[key]) {
                return false;
            }
            this._updateRecordLastAccessed(this.records[key]);
            return this.records[key].value;
        };
        /*
		 *
		 * If the Record is fetched we have to update the lastAccessed Attribute in our record Object
		 *
		 */
        cpa._updateRecordLastAccessed = function(record) {
            record.lastAccessed = new Date().getTime();
            // record has been accessed
            this.lastAccessed = new Date().getTime();
            // Cache  has been accessed
            // if sliding Expire is Enable for this record 
            if (record.slidingExpire && record.slidingExpire >= 1) {
                this._updateRecordSlidingExpire(record);
            }
        };
        /*
		 *
		 * Updaing Records Sliding Expire
		 * this function is triggered when  the Records has been fetched
		 *
		 */
        cpa._updateRecordSlidingExpire = function(record) {
            record.slidingExpire = record.lastAccessed + record.slidingExpireSecond * 1e3;
        };
        /*
		 *
		 * when the cache is used again update the sliding expire for the cache
		 * basically it will reset the sliding expire
		 *
		 */
        cpa._updateCacheSlidingExpire = function() {
            if (this.slidingExpire && this.slidingExpire >= 1) {
                this.slidingExpire = this.lastAccessed + this.slidingExpireSecond * 1e3;
            }
        };
        /*
		 * Empty out the cache
		 */
        cpa._flush = function(key) {
            for (var i in this.records) {
                cpa._callbackRecord("flush", this.records[i], i);
            }
            this.records = {};
            this.recordsIndex = [];
            this.slidingExpire = null;
            // setting the sliding Expire of the Cache , an get action extends the sliding Expire
            this.slidingExpireSecond = null;
            this.absoluteExpire = null;
            // setting the absolute Expire of the Cache
            this.absoluteExpireSecond = null;
        };
        /*
		 * Find all records that should be expired
		 * and remove then if they do have any callback function
		 * trigger the function
		 *
		 */
        cpa._cleanExpiredRecords = function() {
            var now, record, key;
            if (this.recordsIndex.length == 0) {
                return;
            }
            for (var i = 0; i < this.recordsIndex.length; i++) {
                key = this.recordsIndex[i];
                record = this._getRecordByIndex(i);
                if (record.absoluteExpire || record.slidingExpire) {
                    now = new Date().getTime();
                    if (record.absoluteExpire < now) {
                        this._expireRecord(i);
                        this._callbackRecord("absoluteExipreRecord", record, key);
                    } else if (record.slidingExpire < now) {
                        this._expireRecord(i);
                        this._callbackRecord("slidingExipreRecord", record, key);
                    }
                }
            }
        };
        /*
		 * Expire Record By Index
		 */
        cpa._expireRecord = function(index) {
            this._removeRecord(index);
        };
        /*
		 * Fetch Record By Index
		 */
        cpa._getRecordByIndex = function(index) {
            return this.records[this.recordsIndex[index]];
        };
        /*
		 * Remove a Record By Index
		 */
        cpa._removeRecord = function(index) {
            delete this.records[this.recordsIndex.splice(index, 1)];
            // Decrement  all indexes greater than index  
            this._updateAllRecordsIndex(index);
        };
        /*
		 * Callback function for the record
		 */
        cpa._callbackRecord = function(type, record, key) {
            // I usually Use jQuery Extend Function , but in this project i intended not using jQuery
            // not overriding the record Object
            var record = Object.create(record);
            record.key = key;
            record.type = type;
            switch (type) {
              case "absoluteExipreRecord":
                record.message = "Absolute Expired : record  " + key + " is removed from the cache";
                break;

              case "slidingExipreRecord":
                record.message = "Sliding Expired : record  " + key + " is removed from the cache ";
                break;

              case "flush":
                record.message = "Flushed : record  " + key + " is removed from the cache cause the cache was flushed";
                break;

              case "noSpace":
                record.message = "No Space : record  " + key + " is removed from the cache cause the cache was full";
                break;
            }
            record.callback.call(this, record);
        };
        // Check and see if the Cache has any absolute or Sliding Expiration ,
        // if it has check if it is expired then return Callback Function And return true
        // otherwise return false
        cpa._isCacheExpired = function() {
            if (this.absoluteExpire == null && this.slidingExpire == null) {
                return false;
            }
            var now = new Date().getTime();
            if (this.absoluteExpire != null && this.absoluteExpire < now) {
                this._callback("absoluteExipreCache");
                return true;
            }
            if (this.slidingExpire != null && this.slidingExpire < now) {
                this._callback("slidingExipreCache");
                return true;
            }
            return false;
        };
        /*
		 * Callback function for the Cache
		 *
		 */
        cpa._callback = function(type) {
            var data = {
                type: type
            };
            switch (type) {
              case "absoluteExipreCache":
                data.message = "cache is expired ( Absolute Expire Cache )";
                break;

              case "slidingExipreCache":
                data.message = "cache is expired ( Sliding Expire Cache )";
                break;
            }
            this.callback.call(this, data);
        };
        /*
		 * Set Cache Callback function
		 * so if the cache expires returnes a callback function
		 */
        cpa._setCallback = function(callback) {
            this.callback = callback;
        };
        /**
		 *
		 * Public functions
		 * these functions decide how should the process continue
		 * they do logical decisions
		 *
		 */
        return {
            /*
			 * input : integer size
			 *
			 * it will set the size of the cache to the new size
			 *
			 * return cache size;
			 */
            setSize: function(size) {
                // Check to see if we have at least 1 arguments and they are not empty
                if (utilities.validArguments(arguments, 1)) {
                    cpa._setMaxSize(size);
                }
                cpa._updateCacheSlidingExpire();
                return this.getSize();
            },
            getSize: function() {
                cpa._updateCacheSlidingExpire();
                return cpa._getMaxSize();
            },
            /**
			 *  add new record to the cache
			 *  if the cache is expired flush the cache .
			 *  if the cache is full remove the oldest record and add the record
			 *
			 *  returns the new record
			 */
            add: function(key, value, options) {
                // Check to see if we have at least 2 arguments and they are not empty
                if (!utilities.validArguments(arguments, 2)) {
                    return false;
                }
                options = options || {};
                /*
				 * if cache is expired send a callback function then flush the cache
				 */
                if (cpa._isCacheExpired()) {
                    cpa._flush();
                    return false;
                }
                // Removes All expired Records
                cpa._cleanExpiredRecords();
                cpa._updateCacheSlidingExpire();
                var record = cpa._getRecord(key);
                if (record !== false) {
                    cpa._removeRecord(record.index);
                }
                if (cpa._isFull()) {
                    cpa._removeOldestRecord();
                    cpa._unshift(key, value, options);
                } else {
                    cpa._push(key, value, options);
                }
                return this.get(key);
            },
            /*
			 * Key is the Input
			 *
			 * returns the false / Record
			 *
			 */
            get: function(key) {
                // Check to see if we have at least 1 argument and it is not empty
                if (!utilities.validArguments(arguments, 1)) {
                    return false;
                }
                cpa._updateCacheSlidingExpire();
                // Removes All expired Records
                cpa._cleanExpiredRecords();
                return cpa._getRecord(key);
            },
            /*
			 *
			 * returns the value of the record
			 *
			 */
            getValue: function(key) {
                // Check to see if we have at least 1 argument and it is not empty
                if (!utilities.validArguments(arguments, 1)) {
                    return false;
                }
                cpa._updateCacheSlidingExpire();
                // Removes All expired Records
                cpa._cleanExpiredRecords();
                return cpa._getRecordValue(key);
            },
            /*
			 *
			 * return all records of the cache
			 */
            getCacheRecords: function() {
                // Removes All expired Records
                cpa._updateCacheSlidingExpire();
                cpa._cleanExpiredRecords();
                return cpa._getCacheRecords();
            },
            /*
			 * Get All Cache Settings And Records
			 */
            getCache: function() {
                // Removes All expired Records
                cpa._updateCacheSlidingExpire();
                cpa._cleanExpiredRecords();
                return cpa._getCache();
            },
            /*
			 *
			 * Flush
			 * Emptys the cache
			 *
			 */
            flush: function() {
                return cpa._flush();
            },
            /*
			 *
			 * sending all absoluteExpire , slidingExpire , maxsize , callback in one Object as on Options
			 * sample: options = {
			 * 		absoluteExpire : 100 ,
			 * 		slidingExpire  : 5 ,
			 * 		maxsize :15 ,
			 * 		callback : function(){}
			 * }
			 *
			 * this will Config the LRU Cache for us
			 *
			 */
            settings: function(options) {
                if (options.maxsize && parseInt(options.maxsize) > 0) {
                    cpa._setMaxSize(options.maxsize);
                }
                if (options.slidingExpire && parseInt(options.slidingExpire) > 0) {
                    cpa._setSlidingExpire(options.slidingExpire);
                }
                if (options.absoluteExpire && parseInt(options.absoluteExpire) > 0) {
                    cpa._setAbsoluteExpire(options.absoluteExpire);
                }
                if (options.callback && typeof options.callback == "function") {
                    cpa._setCallback(options.callback);
                }
            }
        };
    }
    /*  </ Cache.__construct > */
    return Cache;
});
define("bird.__observer__", [ "./bird.lang", "./bird.util" ], function(require) {
    function Observer() {
        this.channelMap = {};
    }
    (function() {
        var lang = require("./bird.lang");
        var util = require("./bird.util");
        /*********************************************************************
		 *                             订阅/发布
		 ********************************************************************/
        //外部订阅/发布对象缓存区
        this.subscribe = function(channel, update) {
            if (lang.isFunction(update)) {
                this.channelMap[channel] = this.channelMap[channel] || [];
                this.channelMap[channel].push(update);
            }
        };
        this.unsubscribe = function(channel, update) {
            if (arguments.length === 1) {
                this.channelMap[channel].length = 0;
                delete this.channelMap[channel];
                return;
            }
            if (!arguments.length) {
                var me = this;
                util.forEach(this.channelMap, function(updates, channel) {
                    updates.length = 0;
                    delete me.channelMap[channel];
                });
                return;
            }
            var fnArray = this.channelMap[channel];
            if (!fnArray) {
                return;
            }
            util.forEach(fnArray, function(fn, index, fnArray) {
                if (fn === update) {
                    fnArray.splice(index, 1);
                }
            });
            if (!fnArray.length) {
                delete this.channelMap[channel];
            }
        };
        this.publish = function(channel) {
            var args = Array.prototype.slice.call(arguments, 1);
            var me = this;
            util.forEach(this.channelMap[channel] || [], function(update) {
                update.apply(me, args);
            });
            args = me = null;
        };
        this.watch = this.subscribe;
        this.unwatch = this.unsubscribe;
        this.notify = this.publish;
    }).call(Observer.prototype);
    return Observer;
});
define("bird.animate", [ "./bird.lang", "./bird.dom", "./bird.animation" ], function(require) {
    var lang = require("./bird.lang");
    var dom = require("./bird.dom");
    function Animate() {}
    (function() {
        this.cache = {};
        var that = this;
        var Animation = require("./bird.animation");
        /**
		 * pre-handle params like '+=' and '-='
		 */
        function preHandleParams(el, params) {
            for (var i in params) {
                if (!/transform$|transform-origin$/i.test(i)) {
                    var arr = /([\+|-])=\s*(-?[0-9\.%]+)(\w*)/.exec(params[i]);
                    if (arr) {
                        switch (arr[1]) {
                          case "+":
                            params[i] = parseFloat(dom.getStyle(el, i)) + parseFloat(arr[2]);
                            break;

                          case "-":
                            params[i] = parseFloat(dom.getStyle(el, i)) - parseFloat(arr[2]);
                            break;
                        }
                        if (arr[3]) {
                            params[i] += arr[3];
                        }
                        arr = null;
                    }
                }
            }
        }
        this.animate = function(el, params, duration, tween, callback) {
            preHandleParams(el, params);
            var anim;
            if (lang.isPlainObject(duration)) {
                var opt = duration;
                anim = new Animation(el, params, opt.duration, opt.delay, opt.interval, opt.tween, opt.onInit, opt.onRun, opt.onComplete);
            } else {
                anim = new Animation(el, params, duration, null, null, tween, null, null, callback);
            }
            anim.start();
            that.cache["currentFx"] = anim;
            return anim;
        };
        this.rotate = function(el, prop, duration, callback) {
            prop = {
                transform: "rotate(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.rotateX = function(el, prop, duration, callback) {
            prop = {
                transform: "rotateX(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.rotateY = function(el, prop, duration, callback) {
            prop = {
                transform: "rotateY(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.rotateZ = function(el, prop, duration, callback) {
            prop = {
                transform: "rotateZ(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.skew = function(el, prop, duration, callback) {
            prop = {
                transform: "skew(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.scale = function(el, prop, duration, callback) {
            prop = {
                transform: "scale(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.translate = function(el, prop, duration, callback) {
            prop = {
                transform: "translate(" + prop + ")"
            };
            //new Css3Animation(el, prop, duration, null, callback).start();
            this.animate(el, prop, duration, null, callback);
        };
        this.fadeIn = function(el, duration, cb) {
            if (!dom.isHidden(el)) {
                return;
            }
            if (arguments.length === 1 || lang.isFunction(duration)) {
                el.style.display = "block";
                dom.css(el, {
                    opacity: el.$oldopacity || 1
                });
                if (duration) {
                    cb = duration;
                    cb.call(this);
                }
                return;
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            if (dom.isHidden(el)) {
                el.style.display = "block";
                el.$oldopacity = parseFloat(dom.getStyle(el, "opacity"));
                dom.css(el, {
                    opacity: 0
                });
            }
            return this.animate(el, {
                opacity: el.$oldopacity || 1
            }, duration || 400, null, function() {
                this.elem.style.display = "block";
                dom.css(this.elem, {
                    opacity: el.$oldopacity || 1
                });
                el.$oldopacity = null;
                if (lang.isFunction(cb)) cb.call(this);
            });
        };
        this.fadeOut = function(el, duration, cb) {
            if (dom.isHidden(el)) {
                return;
            }
            if (arguments.length === 1 || lang.isFunction(duration)) {
                el.style.display = "none";
                dom.css(el, {
                    opacity: el.$oldopacity || 1
                });
                if (duration) {
                    cb = duration;
                    cb.call(this);
                }
                return;
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            if (dom.isHidden(el)) {
                el.style.display = "block";
            }
            el.$oldopacity = parseFloat(dom.getStyle(el, "opacity"));
            return this.animate(el, {
                opacity: 0
            }, duration || 400, null, function() {
                this.elem.style.display = "none";
                dom.css(this.elem, {
                    opacity: el.$oldopacity || 1
                });
                el.$oldopacity = null;
                if (lang.isFunction(cb)) cb.call(this);
            });
        };
        this.slideUp = function(el, duration, tween, cb) {
            if (dom.isHidden(el)) {
                return;
            }
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            var oldheight = el.$oldheight = el.$oldheight || dom.getStyle(el, "height");
            oldheight === "auto" ? oldheight = dom.fullHeight(el) + "px" : oldheight;
            el.$oldOverflow = dom.getStyle(el, "overflow");
            dom.css(el, {
                overflow: "hidden",
                height: oldheight
            });
            var _cb = function() {
                dom.css(el, {
                    display: "none",
                    overflow: el.$oldOverflow,
                    height: el.$oldheight
                });
                el.$oldOverflow = null;
                el.$oldheight = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                height: "0px"
            }, duration || 400, tween, _cb);
        };
        this.slideDown = function(el, duration, tween, cb) {
            if (!dom.isHidden(el)) {
                return;
            }
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            el._$oldheight = el.$oldheight = el.$oldheight || dom.getStyle(el, "height");
            el.$oldheight === "auto" ? el.$oldheight = dom.fullHeight(el) + "px" : el.$oldheight;
            el.$oldOverflow = dom.getStyle(el, "overflow");
            dom.css(el, {
                height: "0px",
                display: "block",
                overflow: "hidden"
            });
            var _cb = function() {
                dom.css(el, {
                    overflow: el.$oldOverflow,
                    height: el._$oldheight
                });
                el.$oldOverflow = null;
                el.$oldheight = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                height: el.$oldheight
            }, duration || 400, tween, _cb);
        };
        this.slideLeft = function(el, duration, tween, cb) {
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            var oldwidth = el.$oldwidth = el.$oldwidth || dom.getStyle(el, "width");
            oldwidth === "auto" ? oldwidth = dom.fullWidth(el) + "px" : oldwidth;
            el.$oldOverflow = dom.getStyle(el, "overflow");
            dom.css(el, {
                overflow: "hidden"
            });
            var _cb = function() {
                dom.css(el, {
                    display: "none",
                    overflow: el.$oldOverflow,
                    width: el.$oldwidth
                });
                el.$oldOverflow = null;
                el.$oldwidth = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                width: "0px"
            }, duration || 400, tween, _cb);
        };
        this.slideRight = function(el, duration, tween, cb) {
            if (lang.isFunction(duration)) {
                cb = duration;
                duration = "normal";
            }
            switch (duration) {
              case "slow":
                duration = 600;
                break;

              case "normal":
                duration = 400;
                break;

              case "fast":
                duration = 200;
                break;
            }
            el._$oldwidth = el.$oldwidth = el.$oldwidth || dom.getStyle(el, "width");
            el.$oldwidth === "auto" ? el.$oldwidth = dom.fullWidth(el) + "px" : el.$oldwidth;
            el.$oldOverflow = dom.css(el, "overflow");
            dom.css(el, {
                width: "0px",
                display: "block",
                overflow: "hidden"
            });
            var _cb = function() {
                dom.css(el, {
                    overflow: el.$oldOverflow,
                    width: el._$oldwidth
                });
                el.$oldOverflow = null;
                el.$oldwidth = null;
                if (lang.isFunction(cb)) cb.call(this);
            };
            return this.animate(el, {
                width: el.$oldwidth,
                overflow: el.$oldOverflow
            }, duration || 400, tween, _cb);
        };
        this.moveY = function(el, y, duration, tween, cb) {
            return this.animate(el, {
                top: y
            }, duration || 400, tween, cb);
        };
        this.moveX = function(el, x, duration, tween, cb) {
            return this.animate(el, {
                left: x
            }, duration || 400, tween, cb);
        };
        this.delay = function(fn, t) {
            if (t === undefined) {
                t = fn;
                fn = null;
            }
            var o = {
                busy: 1,
                onComplete: fn || function() {},
                isBusy: function() {
                    return this.busy;
                }
            };
            setTimeout(function() {
                o.busy = 0;
                o.onComplete();
            }, t);
            that.cache["currentFx"] = o;
            return o;
        };
        this.serialAnimate = function(arr) {
            arr.shift()();
            var old = that.cache["currentFx"]["onComplete"];
            var self = this;
            that.cache["currentFx"]["onComplete"] = function() {
                if (lang.isFunction(old)) {
                    old.call(this);
                }
                if (arr.length > 0) {
                    self.serialAnimate(arr);
                }
            };
        };
        this.parallelAnimate = function(arr) {
            lang.forEach(arr, function(el) {
                el();
            });
        };
    }).call(Animate.prototype);
    return new Animate();
});
define("bird.animation", [ "./bird.lang", "./bird.dom", "./bird.requestframe", "./bird.tween" ], function(require) {
    var lang = require("./bird.lang");
    var dom = require("./bird.dom");
    var reqFrame = require("./bird.requestframe");
    /**
	 *       elem:   element will animate
	 *      props:   properties will be updated
	 *   duration:   animation duration
	 *      delay:   time delay before start animation
	 *   interval:   interval between two frames
	 *      tween:   animation path function, you can use anyone in
	 *               [
	 'linear','easeIn','easeOut','easeBoth','easeInStrong','easeOutStrong','easeBothStrong','elasticIn',
	 'elasticOut','elasticBoth','backIn','backOut','backBoth','bounceIn','bounceOut','bounceBoth'
	 ]
	 ,or define a path function yourself
	 *     initcb:   callback before animation
	 *      runcb:   callback between animation
	 * completecb:   callback funcation when animation complete
	 * 不兼容IE,需要针对IE修改bug
	 */
    function Animation(elem, props, duration, delay, interval, tween, onInit, onRun, onComplete) {
        this.elem = elem;
        this.props = props;
        this.duration = duration;
        this.delay = delay;
        this.interval = interval;
        this.tween = tween;
        this.onInit = onInit;
        this.onRun = onRun;
        this.onComplete = onComplete;
    }
    //Animation.interval = 17;
    (function() {
        var Tween = require("./bird.tween");
        this.init = function() {
            this.tween = lang.isString(this.tween) ? Tween[this.tween] || Tween["linear"] : lang.isFunction(this.tween) ? this.tween : Tween["linear"];
            //this.interval = Animation.interval;
            this.frames = Math.ceil(this.duration / this.interval);
            this.cssText = this.elem.style.cssText.replace(/\s/g, "");
            this.isRunning = 0;
            this.units = {};
            this.cprop = {};
            this.$props = {};
            this.$cprop = {};
            this.$oldProp = {};
            for (var i in this.props) {
                if (!/transform$|transform-origin$/i.test(i)) {
                    if (!this.hasCommonProperty) {
                        this.hasCommonProperty = 1;
                    }
                    this.$oldProp[i] = dom.getStyle(this.elem, i);
                    var arr = /^-?\d+(?:\.?\d+)?([a-zA-Z]+)/.exec(this.props[i]);
                    this.units[i] = arr ? arr[1] : "";
                    this.cprop[i] = this.$oldProp[i];
                    this.$props[i] = parseFloat(this.props[i]);
                    this.$cprop[i] = parseFloat(this.cprop[i]);
                }
            }
            this.count = 0;
            this.waitTime = 0;
            /**
			 * next is Css3Animation initialization
			 */
            if (!this.props["transform"]) {
                return;
            }
            this.cTransformPropText = dom.getStyle(this.elem, "-webkit-transform");
            if (!this.cTransformPropText || this.cTransformPropText === "none") {
                this.cTransformPropText = "";
            }
            //this.curTransformOriginProp = Jkit.getStyle(this.elem,'-webkit-transform-origin');
            this.transformPropText = this.props["transform"];
            this._prop = {};
            this._cprop = {};
            for (var i = 0, len = css3propkeys.length; i < len; i++) {
                var css3propkey = css3propkeys[i];
                var propValueArr = css3reg[css3propkey].exec(this.transformPropText);
                var cpropValueArr = css3reg[css3propkey].exec(this.cTransformPropText);
                if (propValueArr) {
                    this._cprop[css3propkey] = !cpropValueArr ? css3default[css3propkey] : cpropValueArr[4] ? [ parseFloat(cpropValueArr[2]), parseFloat(cpropValueArr[4]) ] : cpropValueArr[2] ? [ parseFloat(cpropValueArr[2]) ] : css3default[css3propkey];
                    this._prop[css3propkey] = propValueArr[4] ? [ propValueArr[1] === "+=" ? this._cprop[css3propkey][0] + parseFloat(propValueArr[2]) : propValueArr[1] === "-=" ? this._cprop[css3propkey][0] - parseFloat(propValueArr[2]) : parseFloat(propValueArr[2]), propValueArr[3] === "+=" ? this._cprop[css3propkey][1] + parseFloat(propValueArr[4]) : propValueArr[3] === "-=" ? this._cprop[css3propkey][1] - parseFloat(propValueArr[4]) : parseFloat(propValueArr[4]) ] : [ propValueArr[1] === "+=" ? this._cprop[css3propkey][0] + parseFloat(propValueArr[2]) : propValueArr[1] === "-=" ? this._cprop[css3propkey][0] - parseFloat(propValueArr[2]) : parseFloat(propValueArr[2]) ];
                    if (!cpropValueArr || cpropValueArr[2] == null) {
                        this.cTransformPropText += " " + css3propkey + "(" + css3default[css3propkey][0] + css3unit[css3propkey];
                        if (css3default[css3propkey][1] != null) {
                            this.cTransformPropText += ",";
                            this.cTransformPropText += css3default[css3propkey][1] + css3unit[css3propkey];
                        }
                        this.cTransformPropText += ")";
                    }
                }
            }
            this.hasTransform = 1;
            delete this.props["transform"];
        };
        this.start = function() {
            this.init();
            if (lang.isFunction(this.onInit)) {
                this.onInit.call(this);
            }
            this.hasOnRun = lang.isFunction(this.onRun) ? 1 : 0;
            //this.hasOnComplete = Jkit.isFunction(this.onComplete) ? 1 : 0;
            if (this.props["transform-origin"]) {
                this.elem.style["-webkit-transform-origin"] = this.props["transform-origin"];
                delete this.props["transform-origin"];
            }
            var self = this;
            this.intervalfn = function() {
                self.startTime = self.startTime || reqFrame.now();
                self.startTime += self.waitTime;
                self.isRunning = 1;
                self.pos = 0;
                self.timerId = reqFrame.requestAFrame(function() {
                    self.timerId = reqFrame.requestAFrame(arguments.callee);
                    var n = reqFrame.now() - self.startTime;
                    if (n <= self.duration) {
                        self.pos = self.tween(n, 0, 1, self.duration);
                        if (self.hasCommonProperty) {
                            for (var i in self.$props) {
                                //self.cprop[i] = self.tween(n, self.$cprop[i], self.$props[i] - self.$cprop[i], self.duration) + self.units[i];
                                self.cprop[i] = self.$cprop[i] + (self.$props[i] - self.$cprop[i]) * self.pos + self.units[i];
                                //self.cssText = css(self.cssText, self.cprop, i);
                                self.elem.style[i] = self.cprop[i];
                                console.log(self.elem.style[i]);
                            }
                        }
                        if (self.hasTransform) {
                            for (i in self._prop) {
                                var p = self._prop[i];
                                var cp = self._cprop[i];
                                //var v0 = self.tween(n, cp[0], p[0] - cp[0], self.duration);
                                var v0 = cp[0] + (p[0] - cp[0]) * self.pos;
                                var v1;
                                if (p[1] != null) {
                                    v1 = cp[1] + (p[1] - cp[1]) * self.pos;
                                }
                                self.cTransformPropText = css3replacer[i](self.cTransformPropText, v0, v1);
                            }
                            self.elem.style["-webkit-transform"] = self.cTransformPropText;
                        }
                        if (self.hasOnRun) {
                            self.onRun.call(self);
                        }
                        self.count++;
                    } else {
                        if (self.timerId) {
                            reqFrame.cancelAFrame(self.timerId);
                            self.timerId = null;
                        }
                        self.isRunning = -1;
                        if (self.hasCommonProperty) {
                            for (var i in self.props) {
                                self.elem.style[i] = self.props[i];
                            }
                        }
                        if (self.hasTransform) {
                            for (i in self._prop) {
                                self.cTransformPropText = css3replacer[i](self.cTransformPropText, self._prop[i][0], self._prop[i][1]);
                            }
                            self.elem.style["-webkit-transform"] = self.cTransformPropText;
                        }
                        if (lang.isFunction(self.onComplete)) {
                            self.onComplete.call(self);
                        }
                    }
                });
            };
            if (this.delay) {
                setTimeout(this.intervalfn, this.delay);
            } else {
                this.intervalfn();
            }
        };
        this.pause = function() {
            if (self.timerId) {
                reqFrame.cancelAFrame(self.timerId);
                self.timerId = null;
            }
            this.isRunning = 0;
            this.waitTime = reqFrame.now();
        };
        this.resume = function() {
            if (!this.isRunning) {
                this.waitTime = reqFrame.now() - this.waitTime;
                this.intervalfn();
            }
        };
        this.stop = function(clear) {
            if (self.timerId) {
                reqFrame.cancelAFrame(self.timerId);
                self.timerId = null;
            }
            this.isRunning = -1;
            this.clear();
        };
        this.reset = function() {
            this.stop();
            dom.css(this.elem, this.$oldProp);
        };
        this.clear = function() {
            for (var i in this) {
                var o = this[i];
                if (lang.isPlainObject(o)) {
                    for (var j in o) {
                        delete o[j];
                    }
                }
                delete this[i];
            }
        };
        this.isBusy = function() {
            return this.isRunning === 1;
        };
        function css(cssText, cprop, i) {
            var reg = new RegExp("(" + i + ":)-?(?:[a-zA-Z0-9.%#]+)?", "ig");
            return reg.test(cssText) ? cssText.replace(reg, "$1" + cprop[i]) : cssText += ";" + i + ":" + cprop[i];
        }
        var css3replacer = {
            rotate: rotateReplace,
            rotateX: rotateXReplace,
            rotateY: rotateYReplace,
            rotateZ: rotateZReplace,
            scale: scaleReplace,
            skew: skewReplace,
            translate: translateReplace
        };
        var css3reg = {
            rotate: /rotate\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
            rotateX: /rotateX\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
            rotateY: /rotateY\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
            rotateZ: /rotateZ\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
            skew: /skew\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*,\s*([+|-]=)?\s*(-?[0-9.]+)deg\s*\)/,
            scale: /scale\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)\s*,\s*([+|-]=)?\s*(-?[0-9.]+)\s*\)/,
            translate: /translate\s*\(\s*([+|-]=)?\s*(-?[0-9.]+)px\s*,\s*([+|-]=)?\s*(-?[0-9.]+)px\s*\)/
        };
        var hascss3reg = /rotate$|rotateX$|rotateY$|rotateZ$|translate$|scale$|skew$/i;
        var css3default = {
            rotate: [ 0 ],
            rotateX: [ 0 ],
            rotateY: [ 0 ],
            rotateZ: [ 0 ],
            skew: [ 0, 0 ],
            scale: [ 1, 1 ],
            translate: [ 0, 0 ]
        };
        var css3unit = {
            rotate: "deg",
            rotateX: "deg",
            rotateY: "deg",
            rotateZ: "deg",
            skew: "deg",
            scale: "",
            translate: "px"
        };
        var css3propkeys = [ "rotate", "rotateX", "rotateY", "rotateZ", "skew", "scale", "translate" ];
        function rotateReplace(text, deg) {
            return text.replace(css3reg["rotate"], function(a, b, c, d, e) {
                return "rotate(" + deg + "deg)";
            });
        }
        function rotateXReplace(text, xdeg) {
            return text.replace(css3reg["rotateX"], function(a, b, c, d, e) {
                return "rotateX(" + xdeg + "deg)";
            });
        }
        function rotateYReplace(text, ydeg) {
            return text.replace(css3reg["rotateY"], function(a, b, c, d, e) {
                return "rotateY(" + ydeg + "deg)";
            });
        }
        function rotateZReplace(text, zdeg) {
            return text.replace(css3reg["rotateZ"], function() {
                return "rotateZ(" + zdeg + "deg)";
            });
        }
        function skewReplace(text, xdeg, ydeg) {
            return text.replace(css3reg["skew"], function() {
                return "skew(" + xdeg + "deg," + ydeg + "deg)";
            });
        }
        function scaleReplace(text, x, y) {
            return text.replace(css3reg["scale"], function() {
                return "scale(" + x + "," + y + ")";
            });
        }
        function translateReplace(text, x, y) {
            return text.replace(css3reg["translate"], function() {
                return "translate(" + x + "px," + y + "px)";
            });
        }
    }).call(Animation.prototype);
    return Animation;
});
define("bird.array", [ "./bird.lang" ], function(require) {
    var lang = require("./bird.lang");
    function _Array() {}
    (function() {
        //each在执行时可以从内部被中断
        this.each = function(p, callback) {
            for (var i = 0; i < p.length; i++) {
                if (callback.call(this, p[i], i, p) === false) {
                    return false;
                }
            }
            return true;
        };
        //forEach不可被中断
        this.forEach = function(p, callback) {
            if (p.forEach) {
                return p.forEach(callback);
            }
            for (var i = 0; i < p.length; i++) {
                callback.call(this, p[i], i, p);
            }
        };
        this.descArrayEach = function(p, callback) {
            for (var i = p.length - 1; i >= 0; i--) {
                callback.call(this, p[i], i, p);
            }
        };
        //过滤数组
        this.filter = function(p, fn) {
            if (!lang.isFunction(fn)) {
                return;
            }
            var ret = [];
            this.forEach(p, function(v, i, p) {
                if (fn(v, i, p)) {
                    ret.push(v);
                }
            });
            return ret;
        };
        this.pushUniqueInArray = function(obj, arr) {
            var objInArr = false;
            this.each(arr, function(o) {
                if (o === obj) {
                    objInArr = true;
                    return false;
                }
            });
            if (!objInArr) {
                arr.push(obj);
            }
        };
        this.uniquelize = function(arr) {
            var arrcopy = arr.slice();
            arr.length = 0;
            this.forEach(arrcopy, function(el, index, arrcopy) {
                var isUnique = true;
                for (var i = index + 1; i < arrcopy.length; i++) {
                    if (arrcopy[i] === el) {
                        isUnique = false;
                        break;
                    }
                }
                isUnique && arr.push(el);
            });
            arrcopy = null;
            return arr;
        };
        this.remove = function(el, arr) {
            this.forEach(arr, function(val, index, arr) {
                if (val === el) {
                    arr.splice(index, 1);
                }
            });
        };
        //对arr所有元素执行 fn 都返回true才为true,否则为false
        this.every = function(arr, fn) {
            return this.each(arr, fn);
        };
        //arr中只要有一个元素执行fn返回了true结果就为true,否则为false
        this.some = function(arr, fn) {
            var ret = false;
            this.each(arr, function(v, i, arr) {
                if (fn(v, i, arr)) {
                    ret = true;
                    return false;
                }
            });
            return ret;
        };
        /**
		 * 支持参数为元素和数组,也支持参数都为数组
		 * 参数都为数组时,长数组作为被比较对象,短数组作为比较对象
		 * 不论参数为哪种情况,都支持参数位置颠倒的情况
		 */
        this.contains = function(el, arr) {
            if (lang.isArray(el) && lang.isArray(arr)) {
                var longArr = arr;
                var shortArr = el;
                if (longArr.length < shortArr.length) {
                    var _shortArr = longArr;
                    longArr = shortArr;
                    shortArr = _shortArr;
                }
                var j = shortArr.length;
                while (j--) {
                    if (!this.contains(shortArr[j], longArr)) {
                        return false;
                    }
                }
                return true;
            } else {
                //兼容el和arr位置颠倒的情况
                if (lang.isArray(el)) {
                    var _arr = el;
                    el = arr;
                    arr = _arr;
                }
                var i = arr.length;
                while (i--) {
                    if (arr[i] === el) {
                        return true;
                    }
                }
                return false;
            }
        };
        //求并集: 合并多个数组元素,并去重结果数组
        this.union = function() {
            var firstArr = arguments[0];
            var leftArrs = Array.prototype.slice.call(arguments, 1);
            var retArr = Array.prototype.concat.apply(firstArr, leftArrs);
            return this.uniquelize(retArr);
        };
        //求差集: 从newArr去除oldArr包含的元素后剩余元素组成的数组
        this.difference = function(firstArr, secondArr) {
            firstArr = this.uniquelize(firstArr);
            var me = this;
            var ret = [];
            this.forEach(firstArr, function(el) {
                if (!me.contains(el, secondArr)) {
                    ret.push(el);
                }
            });
            return ret;
        };
        //求交集
        this.intersect = function(firstArr, secondArr) {
            firstArr = this.uniquelize(firstArr);
            var me = this;
            var ret = [];
            this.forEach(firstArr, function(el) {
                if (me.contains(el, secondArr)) {
                    ret.push(el);
                }
            });
            return ret;
        };
        //求补集
        this.complement = function(firstArr, secondArr) {
            return this.difference(this.union(firstArr, secondArr), this.intersect(firstArr, secondArr));
        };
    }).call(_Array.prototype);
    return new _Array();
});
define("bird.browser", [ "./bird.lang" ], function(require) {
    /*********************************************************************
	 *                             浏览器及系统信息
	 ********************************************************************/
    function Browser() {
        this.init();
    }
    (function() {
        var doc = document;
        var lang = require("./bird.lang");
        this.init = function() {
            this.lang = navigator.language ? navigator.language : navigator.systemLanguage;
            //客户端使用的语言
            this.resolution = {
                width: screen.width,
                height: screen.height
            };
            this.pageSize = {
                width: doc.body.scrollWidth || doc.documentElement.scrollWidth,
                height: doc.body.scrollHeight || doc.documentElement.scrollHeight
            };
            this.colorDepth = screen.pixelDepth || screen.colorDepth;
            var ua = navigator.userAgent.toLowerCase();
            this.isMobile = /mobile/.test(ua);
            this.isIPAD = /ipad/.test(ua);
            this.isIPHONE = /iphone/.test(ua);
            this.isIOS = /ipad|iphone|ipod/.test(ua);
            this.isBB = /blackberry/.test(ua);
            this.isNOKIA = /nokia/.test(ua);
            this.isSYMBIAN = /symbianos/.test(ua);
            this.isANDROID = /android/.test(ua);
            this.isWP = /windows phone/.test(ua);
            var deviceType = (/ipad|iphone|android|blackberry|windows phone|windows mobile|win 9x|windows nt|mac os/.exec(ua) || [ "unknown" ])[0];
            var handleMap = {
                ipad: function(ua) {
                    var os = ua.match(/os\s+[\d_.]+/)[0];
                    return "ipad i" + os.replace(/_/g, ".");
                },
                iphone: function(ua) {
                    var os = ua.match(/os\s+[\d_.]+/)[0];
                    return "iphone i" + os.replace(/_/g, ".");
                },
                android: function(ua) {
                    return ua.match(/android\s+[\d.]+/)[0];
                },
                "windows phone": function(ua) {
                    return "wp " + ua.match(/os\s+([\d.]+)/)[1];
                },
                "windows mobile": "windows mobile",
                "win 9x": "win 9x",
                "windows nt": function(ua) {
                    var nt = {
                        "4.0": "nt 4.0",
                        "5.0": "2000",
                        "5.1": "xp",
                        "5.2": "2003",
                        "6.0": "vista",
                        "6.1": "7",
                        "6.2": "8"
                    };
                    return "win " + nt[ua.match(/nt\s+([\d.]+)/)[1]];
                },
                blackberry: "blackberry",
                "mac os": "mac os",
                unknown: "unknown os"
            };
            this.os = handleMap[deviceType];
            lang.isFunction(this.os) && (this.os = this.os(ua));
            this.browser = /ios/.test(this.os) && !/opera/.test(ua) && /version/.test(ua) ? "safari" : "";
            this.browser = this.browser || (/android/.test(this.os) && !/opera/.test(ua) && /version/.test(ua) ? "android webkit浏览器" : "");
            if (!this.browser) {
                var browserType = (/metasr|taobrowser|qqbrowser|maxthon|lbbrowser|(?:ucbrowser|ucweb)/.exec(ua) || /(?:msie|slcc)|(?:firefox|gecko\/)|opera|(?:chrome|crios)|iemobile/.exec(ua) || [ "unknown" ])[0];
                var browser = {
                    metasr: "搜狗浏览器",
                    taobrowser: "淘宝浏览器",
                    qqbrowser: "QQ浏览器",
                    maxthon: "遨游浏览器",
                    lbbrowser: "猎豹浏览器",
                    msie: function(ua) {
                        return "ie " + ua.match(/msie\s+(\d+)(?:\.\d+)?/)[1];
                    },
                    slcc: function(ua) {
                        return "ie " + ua.match(/rv:(\d+)(?:\.\d+)?/)[1];
                    },
                    firefox: "firefox",
                    "gecko/": "firefox",
                    opera: "opera",
                    chrome: "chrome",
                    crios: "chrome",
                    iemobile: "移动IE浏览器",
                    unknown: "unknown browser"
                };
                this.browser = this.browser || browser[browserType];
                lang.isFunction(this.browser) && (this.browser = this.browser(ua));
            }
            var isFirefox = this.browser === "firefox";
            var isIE = /ie/.test(this.browser);
            var isIE8 = this.browser === "ie 8";
            if (isIE) {
                var arr = this.browser.split(/\s+/);
                var ieVersion = arr && +arr[1];
            }
            this.isFirefox = function() {
                return isFirefox;
            };
            this.isIE = function() {
                return isIE;
            };
            this.getIEVersion = function() {
                return ieVersion;
            };
            //奇葩的IE,各版本总会有各种奇葩问题
            this.isIE8 = function() {
                return isIE8;
            };
        };
    }).call(Browser.prototype);
    return new Browser();
});
/**
 *	该模块用来给其他模块增加链式操作的功能,被封装到chain模块上方法名的结构为: '$' + prefix + capitalize(methodName)
 *	prefix 在调用wrapModule接口时作为第二个参数指定
 *	具体使用如下：
 *	1.调用wrapModule接口为模块增加链式功能
 *	var chain = require('chain');
 *	var array = require('array');
 *	chain.wrapModule(array, 'array');//为bird.array模块增加链式操作功能
 *	var string = require('string');
 *	chain.wrapModule(string, 'string');//为bird.string模块增加链式操作功能
 *	var object = require('object');
 *	chain.wrapModule(object, 'object');//为bird.object模块增加链式操作功能
 *
 *	2.使用链式功能接口
 *	var c = require('chain');
 *	//以下为数组操作
 *	var items = [0,1,2,3,4,5,6,7,8,9];
 *	c.chain(items).$arrayForEach(function(v){
 *		alert(v);
 *	}).$arrayUnion(['a','b','c']).$arrayForEach(function(v){
 *		alert(v)
 *	});
 *			
 *	//以下为字符串操作
 *	var s = 'aa-bb';
 *	c.chain(s).$stringCamelize().$stringCapitalize().custom(function(v){
 *		alert(v)
 *	});
 *
 *	or
 *	
 *	var value = c.chain(s).$stringCamelize().$stringCapitalize().toData();
 *	alert(value);
 *
 */
define("bird.chain", [ "./bird.object", "./bird.string" ], function(require) {
    var object = require("./bird.object");
    var string = require("./bird.string");
    function Chain() {
        this.data = null;
    }
    (function() {
        this.chain = function(data) {
            this.data = data;
            return this;
        };
        this.wrapFn = function(fn, name, prefix, mod) {
            var me = this;
            this["$" + (prefix || "") + string.capitalize(name || fn.name)] = function() {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(me.data);
                var ret = fn.apply(mod, args);
                this.data = ret == null ? this.data : ret;
                args = ret = null;
                return me;
            };
        };
        this.wrapModule = function(mod, prefix) {
            var me = this;
            object.forEach(mod, function(v, k, mod) {
                me.wrapFn(v, k, prefix, mod);
            }, true);
        };
        //返回链式操作之后得到的数据
        this.toData = function() {
            return this.data;
        };
        //自定义函数操作数据
        this.custom = function(fn) {
            var ret = fn(this.data);
            this.data = ret == null ? this.data : ret;
            ret = null;
            return this;
        };
    }).call(Chain.prototype);
    return new Chain();
});
define("bird.class", [ "./bird.object" ], function(require) {
    var object = require("./bird.object");
    function Class() {}
    (function() {
        this.inherit = function(subClass, superClass) {
            /*var originalSubClass = subClass;
			subClass = function(){
				subClass.superClass.apply(this, arguments);
				subClass.originalSubClass.apply(this, arguments);
				if(this.init){
					this.init();
				}
			};
			subClass.originalSubClass = originalSubClass;*/
            var cleanSuperClassPrototype;
            if (Object.create) {
                cleanSuperClassPrototype = Object.create(superClass.prototype);
            } else {
                var F = new Function();
                F.prototype = superClass.prototype;
                cleanSuperClassPrototype = new F();
            }
            subClass.superClass = superClass;
            //缓存原来的原型函数,后面再恢复
            var originalSubClassProto = subClass.prototype;
            /**
			 * 这里为什么不直接new superClass而是要引入中介函数F呢? 
			 * 是为了减少不必要的内存消耗,因为不确定superClass的构造函数做了多少操作,
			 * 也许某个操作是相当耗时耗内存的
			 */
            subClass.prototype = cleanSuperClassPrototype;
            cleanSuperClassPrototype = null;
            //恢复原来的原型函数
            object.forEach(originalSubClassProto, function(fn, property) {
                if (!subClass.prototype[property]) {
                    subClass.prototype[property] = fn;
                }
            }, true);
            subClass.prototype.constructor = subClass;
            return subClass;
        };
    }).call(Class.prototype);
    return new Class();
});
define("bird.css3animate", [ "./bird.css3animation" ], function(require) {
    function CSSAnimate() {}
    (function() {
        var CSSAnimation = require("./bird.css3animation");
        this.cssAnimate = function(elem, animation, duration, opts) {
            new CSSAnimation(elem, animation, duration, opts).start();
        };
    }).call(CSSAnimate.prototype);
    return new CSSAnimate();
});
define("bird.css3animation", [ "./bird.lang", "./bird.event" ], function(require) {
    var lang = require("./bird.lang");
    var event = require("./bird.event");
    //var reqFrame = require('./bird.requestframe');
    function CSSAnimation(elem, animationName, duration, opts) {
        this.element = elem;
        this.animationName = animationName;
        this.duration = duration;
        this.opts = opts;
    }
    (function() {
        this.cache = {};
        var that = this;
        this.find = function(a) {
            var ss = document.styleSheets;
            for (var i = ss.length - 1; i >= 0; i--) {
                try {
                    var s = ss[i], rs = s.cssRules ? s.cssRules : s.rules ? s.rules : [];
                    for (var j = rs.length - 1; j >= 0; j--) {
                        if ((rs[j].type === window.CSSRule.WEBKIT_KEYFRAMES_RULE || rs[j].type === window.CSSRule.MOZ_KEYFRAMES_RULE) && rs[j].name == a) {
                            return rs[j];
                        }
                    }
                } catch (e) {}
            }
            return null;
        };
        this.init = function() {
            var /*keyframes,*/ animation = null, start = 0;
            this.options = {
                easing: "linear",
                iterationCount: 1
            };
            //, prefixes = ['Webkit', 'Moz'];
            // Enable option setting
            for (var k in this.opts) {
                this.options[k] = this.opts[k];
            }
            this.onComplete = lang.isFunction(this.opts) ? this.opts : this.opts && lang.isFunction(this.opts["onComplete"]) ? this.opts["onComplete"] : null;
            // Prevent animation triggers if the animation is already playing
            if (this.element.isPlaying) return;
            // Can we find the animaition called animationName?
            animation = this.find(this.animationName);
            if (!animation) return false;
        };
        this.start = function() {
            this.init();
            //var start = new Date().getTime();
            // Variables used by the runloop
            var current = percentage = roundedKey = keyframe = null, i = 0, found = false;
            this.applyCSSAnimation = function(anim) {
                found = false;
                //for( i = 0; i < prefixes.length && !found; i++) {
                if (this.element.style["WebkitAnimationName"] !== undefined) {
                    this.element.style["WebkitAnimationDuration"] = anim.duration;
                    this.element.style["WebkitAnimationTimingFunction"] = anim.timingFunction;
                    this.element.style["WebkitAnimationIterationCount"] = anim.iterationCount;
                    this.element.style["WebkitAnimationName"] = anim.name;
                    found = true;
                }
            };
            // Trigger the animation
            that.cache["currentFx"] = this;
            this.applyCSSAnimation({
                name: this.animationName,
                duration: this.duration + "ms",
                timingFunction: this.options.easing,
                iterationCount: this.options.iterationCount
            });
            this.element.isPlaying = true;
            var self = this;
            event.addListener(this.element, "webkitAnimationEnd", function(e) {
                event.removeListener(self.element, "webkitAnimationEnd", arguments.callee);
                //reset the styling so it can be triggered again
                self.applyCSSAnimation({
                    name: null,
                    duration: null,
                    timingFunction: null,
                    iterationCount: 0
                });
                self.element.isPlaying = 0;
                if (lang.isFunction(self.onComplete)) {
                    self.onComplete();
                }
            });
        };
        this.isBusy = function() {
            return this.element.isPlaying;
        };
    }).call(CSSAnimation.prototype);
    return CSSAnimation;
});
define("bird.date", [ "moment" ], function(require) {
    var moment = require("moment");
    function _Date() {}
    (function() {
        this.dateFormats = [ "YYYYMMDDHHmmss", "YYYY-MM-DD HH:mm:ss", "YYYY/MM/DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ss.SSSZ" ];
        this.now = function() {
            return Date.now ? Date.now() : new Date().getTime();
        };
        /**
         * 对目标日期对象进行格式化
         *
         * 具体支持的格式参考
         * [moment文档](http://momentjs.com/docs/#/displaying/format/)
         *
         * @param {Date} source 目标日期对象
         * @param {string} pattern 日期格式化规则
         * @return {string} 格式化后的字符串
         */
        this.format = function(source, pattern) {
            return moment(source).format(pattern);
        };
        /**
         * 将目标字符串转换成日期对象
         *
         * 具体支持的格式参考
         * [moment文档](http://momentjs.com/docs/#/displaying/format/)
         *
         * 默认使用{@link lib.date#dateFormats}作为解析格式
         *
         * @param {string} source 目标字符串
         * @param {string} [format] 指定解析格式，
         * 不提供此参数则使用{@link lib.date#dateFormats}作为解析格式，
         * 由于默认包含多个格式，这将导致性能有所下降，因此尽量提供明确的格式参数
         * @return {Date} 转换后的日期对象
         */
        this.parse = function(source, format) {
            var dateTime = moment(source, format || this.dateFormats);
            return dateTime.toDate();
        };
    }).call(_Date.prototype);
    return new _Date();
});
define("bird.dom", [ "./bird.lang", "./bird.util", "./bird.string", "./bird.array" ], function(require) {
    var lang = require("./bird.lang");
    var util = require("./bird.util");
    var string = require("./bird.string");
    var array = require("./bird.array");
    function Dom() {
        this.cache = {};
        this.isOuterHTMLSupported = "outerHTML" in (document.body || document.documentElement);
    }
    (function() {
        var documentElement = document.documentElement;
        var body = document.body;
        var viewRoot = document.compatMode == "BackCompat" ? body : documentElement;
        /*********************************************************************
		 *                             selector
		 ********************************************************************/
        //return 单个HtmlElement
        this.g = this.get = this.getElement = function(selector, context) {
            return this.getElements(selector, context)[0];
        };
        this.gById = this.getElementById = function(id) {
            return lang.isString(id) ? document.getElementById(id) : id;
        };
        //return 由HtmlElement组成的数组
        this.getAll = this.getElements = function(selector, context, range) {
            if (!lang.isString(selector)) {
                return lang.isArray(selector) ? selector : [ selector ];
            }
            if (/^#([a-zA-Z_$][0-9a-zA-Z_$-]*)$/.test(selector)) {
                var el = document.getElementById(RegExp.$1);
                if (el) {
                    return [ el ];
                }
            }
            var _context = context || document;
            var elems = _context.querySelectorAll(selector);
            var length = Number(elems.length) || 0;
            var ret = [];
            for (var i = 0; i < length; i++) {
                if (!range) {
                    ret.push(elems[i]);
                } else {
                    for (var j = 0, len = range.length; j < len; j++) {
                        if (elems[i] === range[j]) {
                            ret.push(elems[i]);
                            break;
                        }
                    }
                }
            }
            return ret;
        };
        this.index = function(node, nodes) {
            var ret = -1;
            array.each(nodes, function(v, index, nodes) {
                if (v === node) {
                    ret = index;
                    return false;
                }
            });
            return ret;
        };
        /*if(!document.querySelectorAll){
			//开启此行,将加载jquery.js文件
			this.getElements = require('jquery');
		}*/
        //获取node同组的radio值
        this.getRadioValue = function(node) {
            var parentNode = node.parentNode;
            var children = this.getElements("input[type=radio]", parentNode);
            if (children.length < 2) {
                children = this.getElements("input[name=" + node.name + "]");
            }
            var name = node.name;
            var ret;
            array.each(children, function(node) {
                if (node.name === name && node.checked) {
                    ret = node.value;
                    return false;
                }
            });
            return ret;
        };
        //获取node同组的radio元素
        this.getRadios = function(node, checked) {
            var children = this.getElements("input[name=" + node.name + "]", node.ownerDocument);
            var name = node.name;
            var hasSecondParam = arguments.length > 1;
            var ret = [];
            array.forEach(children, function(node) {
                if (node.name === name && (!hasSecondParam || hasSecondParam && node.checked == !!checked)) {
                    ret.push(node);
                }
            });
            return ret;
        };
        //获取node同组的checkbox值
        this.getCheckboxValues = function(node) {
            var children = this.getElements("input[name=" + node.name + "]", node.ownerDocument);
            var name = node.name;
            var ret = [];
            array.forEach(children, function(node) {
                if (node.name === name && node.checked) {
                    ret.push(node.value);
                }
            });
            return ret;
        };
        //获取node同组的checkbox元素
        this.getCheckboxs = function(node, checked) {
            var children = this.getElements("input[name=" + node.name + "]", node.ownerDocument);
            var name = node.name;
            var hasSecondParam = arguments.length > 1;
            var ret = [];
            array.forEach(children, function(node) {
                if (node.name === name && (!hasSecondParam || hasSecondParam && node.checked == !!checked)) {
                    ret.push(node);
                }
            });
            return ret;
        };
        this.getSelectedOptionValues = function(select) {
            var options = select.options || this.getElements("option", select);
            var ret = [];
            array.forEach(options, function(option) {
                if (option.selected) {
                    ret.push(option.value);
                }
            });
            return ret;
        };
        this.getOptionsOfSelect = function(select) {
            return select.options || this.getElements("option", select);
        };
        this.getCheckedChildRadioInputValue = function(node) {
            var radios = this.getElements("input[type=radio]", node);
            var value;
            array.each(radios, function(radio) {
                if (radio.checked) {
                    value = radio.value;
                    return false;
                }
            });
            return value;
        };
        this.removeNode = function(element) {
            element = this.getElementById(element);
            if (!element) {
                return;
            }
            var parent = element.parentNode;
            if (parent) {
                parent.removeChild(element);
            }
        };
        this.replaceNode = function(srcNode, destNode) {
            if (!(srcNode && destNode)) {
                return;
            }
            var parent = srcNode.parentNode;
            if (parent) {
                parent.replaceChild(destNode, srcNode);
            }
        };
        this.insertAfter = function(element, reference) {
            var parent = reference.parentNode;
            if (parent) {
                parent.insertBefore(element, reference.nextSibling);
            }
            return element;
        };
        this.insertBefore = function(element, reference) {
            var parent = reference.parentNode;
            if (parent) {
                parent.insertBefore(element, reference);
            }
            return element;
        };
        this.appendTo = function(nodes, container) {
            if (lang.isString(nodes)) {
                var div = document.createElement("div");
                div.innerHTML = nodes;
                nodes = div.childNodes;
                div = null;
            }
            if (lang.isArrayLike(nodes)) {
                array.forEach(nodes, function(node) {
                    container.appendChild(node);
                });
            } else {
                container.appendChild(nodes);
            }
        };
        this.getChildren = function(element) {
            return array.filter(element.children, function(child) {
                return child.nodeType === 1;
            });
        };
        /**
		 * 获取元素内部文本
		 *
		 * @param {HTMLElement} element 目标元素
		 * @return {string}
		 */
        this.getText = function(element) {
            var text = "";
            //  text 和 CDATA 节点，取nodeValue
            if (element.nodeType === 3 || element.nodeType === 4) {
                text += element.nodeValue;
            } else if (element.nodeType !== 8) {
                var me = this;
                array.forEach(element.childNodes, function(child) {
                    text += me.getText(child);
                });
            }
            return text;
        };
        this.hasParent = function(self, parent) {
            while (self && self !== parent) {
                self = self.parentNode;
            }
            return self === parent;
        };
        //从element向上往context找,直到找到第一个有id的元素或者body元素停止
        this.getTreePath = function(element, context) {
            context = context || document.body;
            var paths = [];
            while (element && element.tagName && element !== context) {
                var id = element.getAttribute("id") || element.id;
                paths.unshift(element.tagName + (id ? "[id=" + id + "]" : ""));
                if (id) {
                    break;
                }
                element = element.parentNode;
            }
            return paths.length ? paths.join("->") : "";
        };
        this.css = function(el, p, v) {
            if (v === undefined) {
                if (lang.isString(p)) {
                    return el.style[string.camelize(p)];
                }
                /**
				 * this is generally function, but it make too much reflow and repain
				 */
                /*if($.isPlainObject(p)){
				 var el = this.current;
				 for(var i in p){
				 el.style[i] = p[i];
				 }
				 el = null;
				 return this;
				 }*/
                if (lang.isPlainObject(p)) {
                    var cssText = el.style.cssText == null ? el.getAttribute("style") : el.style.cssText;
                    cssText = cssText.replace(/\s/g, "");
                    for (var i in p) {
                        var reg = new RegExp("^(" + i + ":)-?(?:[a-zA-Z0-9.%#(,)]+)?", "ig");
                        //
                        if (reg.test(cssText)) {
                            cssText = cssText.replace(reg, "$1" + p[i]);
                        } else {
                            cssText += ";" + i + ":" + p[i];
                        }
                    }
                    cssText = cssText.replace(/;{2,}/, ";");
                    el.style.cssText == null ? el.setAttribute("style", cssText) : el.style.cssText = cssText;
                    cssText = null;
                    reg = null;
                    el = null;
                }
            } else {
                el.style[string.camelize(p)] = v;
            }
        };
        this.getComputedStyle = function(element, key) {
            if (!element) {
                return "";
            }
            var doc = element.nodeType == 9 ? element : element.ownerDocument || element.document;
            if (doc.defaultView && doc.defaultView.getComputedStyle) {
                var styles = doc.defaultView.getComputedStyle(element, null);
                if (styles) {
                    return styles[key] || styles.getPropertyValue(key);
                }
            } else if (element && element.currentStyle) {
                return element.currentStyle[key];
            }
            return "";
        };
        this.getStyle = function(element, key) {
            key = string.camelize(key);
            return element.style[key] || (element.currentStyle ? element.currentStyle[key] : this.getComputedStyle(element, key));
        };
        this.getOffset = function(element) {
            var rect = element.getBoundingClientRect();
            var offset = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
            var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
            var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            offset.top = offset.top + scrollTop - clientTop;
            offset.bottom = offset.bottom + scrollTop - clientTop;
            offset.left = offset.left + scrollLeft - clientLeft;
            offset.right = offset.right + scrollLeft - clientLeft;
            return offset;
        };
        this.hasClass = function(el, cls) {
            return el.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
        };
        this.addClass = function(el, cls) {
            if (!this.hasClass(el, cls)) {
                el.className += el.className ? " " + cls : cls;
            }
        };
        this.removeClass = function(el, cls) {
            if (this.hasClass(el, cls)) {
                el.className = el.className.replace(new RegExp("(\\s|^)" + cls + "(\\s|$)"), "");
            }
        };
        this.toggleClass = function(el, cls) {
            if (!this.hasClass(el, cls)) {
                el.className += el.className ? " " + cls : cls;
            } else {
                el.className = el.className.replace(new RegExp("(\\s|^)" + cls + "(\\s|$)"), "");
            }
        };
        this.getClassList = function(element) {
            return element.className ? element.className.split(/\s+/) : [];
        };
        //<-------baidu className operation start here------->
        /**
		 * 判断元素是否拥有指定的class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string} className 要判断的class名称
		 * @return {boolean} 是否拥有指定的class
		 */
        this._hasClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return false;
            }
            if (element.classList) {
                return element.classList.contains(className);
            }
            var classes = this.getClassList(element);
            return array.contains(classes, className);
        };
        /**
		 * 为目标元素添加class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string} className 要添加的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this._addClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return element;
            }
            if (element.classList) {
                element.classList.add(className);
                return element;
            }
            var classes = this.getClassList(element);
            if (array.contains(classes, className)) {
                return element;
            }
            classes.push(className);
            element.className = classes.join(" ");
            return element;
        };
        /**
		 * 批量添加class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string[]} classes 需添加的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this.addClasses = function(element, classes) {
            element = this.getElementById(element);
            if (!element || !classes) {
                return element;
            }
            if (element.classList) {
                array.forEach(classes, function(className) {
                    element.classList.add(className);
                });
                return element;
            }
            var originalClasses = this.getClassList(element);
            var newClasses = array.union(originalClasses, classes);
            if (newClasses.length > originalClasses.length) {
                element.className = newClasses.join(" ");
            }
            return element;
        };
        /**
		 * 移除目标元素的class
		 *
		 * @param {HTMLElement | string} element 目标元素或目标元素的 id
		 * @param {string} className 要移除的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this._removeClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return element;
            }
            if (element.classList) {
                element.classList.remove(className);
                return element;
            }
            var classes = this.getClassList(element);
            var changed = false;
            // 这个方法比用`u.diff`要快
            for (var i = 0; i < classes.length; i++) {
                if (classes[i] === className) {
                    classes.splice(i, 1);
                    i--;
                    changed = true;
                }
            }
            if (changed) {
                element.className = classes.join(" ");
            }
            return element;
        };
        /**
		 * 批量移除class
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @param {string[]} classes 需移除的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this.removeClasses = function(element, classes) {
            element = this.getElementById(element);
            if (!element || !classes) {
                return element;
            }
            if (element.classList) {
                array.forEach(classes, function(className) {
                    element.classList.remove(className);
                });
                return element;
            }
            var originalClasses = this.getClassList(element);
            var newClasses = array.difference(originalClasses, classes);
            if (newClasses.length < originalClasses.length) {
                element.className = newClasses.join(" ");
            }
            return element;
        };
        /**
		 * 切换目标元素的class
		 *
		 * @param {HTMLElement} element 目标元素或目标元素的 id
		 * @param {string} className 要切换的class名称
		 * @return {HTMLElement} 目标元素
		 */
        this._toggleClass = function(element, className) {
            element = this.getElementById(element);
            if (className === "") {
                throw new Error("className must not be empty");
            }
            if (!element || !className) {
                return element;
            }
            if (element.classList) {
                element.classList.toggle(className);
                return element;
            }
            var classes = this.getClassList(element);
            var containsClass = false;
            for (var i = 0; i < classes.length; i++) {
                if (classes[i] === className) {
                    classes.splice(i, 1);
                    containsClass = true;
                    i--;
                }
            }
            if (!containsClass) {
                classes.push(className);
            }
            element.className = classes.join(" ");
            return element;
        };
        //<-------baidu className operation end here------->
        this.isHidden = function(el) {
            return this.getStyle(el, "display") === "none";
        };
        this.resetCss = function(el, p, v) {
            if (!el.$guid) {
                el.$guid = util.uuid();
            }
            this.cache[el.$guid] = {};
            var oldCss = {};
            if (v === undefined && lang.isPlainObject(p)) {
                var cssText = el.style.cssText == null ? el.getAttribute("style") : el.style.cssText;
                cssText = cssText.replace(/\s/g, "");
                for (var i in p) {
                    oldCss[i] = el.style[string.camelize(i)];
                    //el.style[camelize(i)] = p[i];
                    var reg = new RegExp("(" + i + ":)-?(?:[a-zA-Z0-9.%#]+)?", "ig");
                    //
                    if (reg.test(cssText)) {
                        cssText = cssText.replace(reg, "$1" + p[i]);
                    } else {
                        cssText += ";" + i + ":" + p[i];
                    }
                }
                cssText = cssText.replace(/;{2,}/, ";");
                el.style.cssText == null ? el.setAttribute("style", cssText) : el.style.cssText = cssText;
                cssText = null;
                reg = null;
            } else {
                oldCss[p] = el.style[string.camelize(p)];
                el.style[string.camelize(p)] = v;
            }
            this.cache[el.$guid]["oldCss"] = oldCss;
        };
        /**
		 * restore old css saved by resetCss
		 */
        this.restoreCss = function(el) {
            if (this.cache[el.$guid] && this.cache[el.$guid]["oldCss"]) {
                var oldCss = this.cache[el.$guid]["oldCss"];
                var cssText = el.style.cssText == null ? el.getAttribute("style") : el.style.cssText;
                cssText = cssText.replace(/\s/g, "");
                for (var i in oldCss) {
                    //el.style[camelize(i)] = el.oldCss[i];
                    var reg = new RegExp("(" + i + ":)-?(?:[a-zA-Z0-9.%#]+)?", "ig");
                    //
                    if (reg.test(cssText)) {
                        cssText = cssText.replace(reg, "$1" + oldCss[i]);
                    } else {
                        cssText += ";" + i + ":" + oldCss[i];
                    }
                }
                cssText = cssText.replace(/;{2,}/, ";");
                el.style.cssText == null ? el.setAttribute("style", cssText) : el.style.cssText = cssText;
                cssText = null;
                reg = null;
                delete this.cache[el.$guid]["oldCss"];
                delete this.cache[el.$guid];
                el = null;
            }
        };
        this.fullHeight = function(el) {
            if (this.getStyle(el, "display") !== "none") {
                return parseFloat(this.getStyle(el, "height")) || el.offsetHeight;
            } else {
                this.resetCss(el, {
                    display: "block",
                    visibility: "hidden",
                    position: "absolute"
                });
                var h = el.clientHeight || parseFloat(this.getStyle(el, "height"));
                this.restoreCss(el);
                return h;
            }
        };
        this.fullWidth = function(el) {
            if (this.getStyle(el, "display") !== "none") {
                return parseFloat(this.getStyle(el, "width")) || el.offsetWidth;
            } else {
                this.resetCss(el, {
                    display: "block",
                    visibility: "hidden",
                    position: "absolute"
                });
                var w = el.clientWidth || parseFloat(this.getStyle(el, "width"));
                this.restoreCss(el);
                return w;
            }
        };
        this.addCssRule = function(rule) {
            if (lang.isArray(rule)) {
                rule = rule.join("");
            }
            if (document.styleSheets && document.styleSheets.length) {
                document.styleSheets[0].insertRule(rule, 0);
            } else {
                var s = document.createElement("style");
                s.innerHTML = rule;
                document.getElementsByTagName("head")[0].appendChild(s);
            }
        };
        this.loadStyle = function(url) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = url;
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(link);
        };
        this.loadStyleString = function(css) {
            var style = document.createElement("style");
            style.type = "text/css";
            try {
                style.appendChild(document.createTextNode(css));
            } catch (ex) {
                style.styleSheet.cssText = css;
            }
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(style);
        };
        this.loadscript = function(url, callback, removeAfterLoaded) {
            var script = document.createElement("script");
            lang.isFunction(callback) && (script.onload = script.onreadystatechange = function() {
                if (script.readyState && script.readyState != "loaded" && script.readyState != "complete") {
                    return;
                }
                script.onreadystatechange = script.onload = null;
                callback.apply(this, arguments);
                if (removeAfterLoaded) {
                    this.parentNode.removeChild(this);
                }
            });
            //script.setAttribute('id', this.scriptId);
            script.setAttribute("charset", "UTF-8");
            script.type = "text/javascript";
            script.src = url;
            var parentNode = document.getElementsByTagName("head")[0] || document.body;
            parentNode.appendChild(script);
        };
        this.loadScriptString = function(code) {
            var script = document.createElement("script");
            script.setAttribute("charset", "UTF-8");
            script.type = "text/javascript";
            try {
                script.appendChild(document.createTextNode(code));
            } catch (e) {
                script.text = code;
            }
            var parentNode = document.getElementsByTagName("head")[0] || document.body;
            parentNode.appendChild(script);
        };
        this.loadImage = function(url, successCallback, errorCallback) {
            var img = new Image();
            //create an Image object, preload image
            img.src = url;
            var isFnSuccessCb = lang.isFunction(successCallback);
            var isFnErrorCb = lang.isFunction(errorCallback);
            if (isFnSuccessCb && img.complete) {
                // if Image exists in browser cache, call successCallback
                successCallback.call(img);
                return img;
            }
            isFnSuccessCb && (img.onload = function() {
                //when Image download completed, call successCallback async
                successCallback.call(img);
            });
            isFnErrorCb && (img.onerror = function() {
                errorCallback.call(img);
            });
            return img;
        };
        this.getPageWidth = function() {
            return Math.max(documentElement ? documentElement.scrollWidth : 0, body ? body.scrollWidth : 0, viewRoot ? viewRoot.clientWidth : 0, 0);
        };
        /**
		 * 获取页面高度
		 *
		 * @return {number} 页面高度
		 */
        this.getPageHeight = function() {
            return Math.max(documentElement ? documentElement.scrollHeight : 0, body ? body.scrollHeight : 0, viewRoot ? viewRoot.clientHeight : 0, 0);
        };
        /**
		 * 获取页面视觉区域宽度
		 *
		 * @return {number} 页面视觉区域宽度
		 */
        this.getViewWidth = function() {
            return window.innerWidth || (viewRoot ? viewRoot.clientWidth : 0);
        };
        /**
		 * 获取页面视觉区域高度
		 *
		 * @return {number} 页面视觉区域高度
		 */
        this.getViewHeight = function() {
            return window.innerHeight || (viewRoot ? viewRoot.clientHeight : 0);
        };
        /**
		 * 获取纵向滚动量
		 *
		 * @return {number} 纵向滚动量
		 */
        this.getScrollTop = function() {
            return window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0;
        };
        /**
		 * 获取横向滚动量
		 *
		 * @return {number} 横向滚动量
		 */
        this.getScrollLeft = function() {
            return window.pageXOffset || documentElement.scrollLeft || body.scrollLeft || 0;
        };
        /**
		 * 获取页面纵向坐标
		 *
		 * @return {number}
		 */
        this.getClientTop = function() {
            return documentElement.clientTop || body.clientTop || 0;
        };
        /**
		 * 获取页面横向坐标
		 *
		 * @return {number}
		 */
        this.getClientLeft = function() {
            return documentElement.clientLeft || body.clientLeft || 0;
        };
        /**
		 * 获取目标元素的第一个元素节点
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @return {HTMLElement | null} 目标元素的第一个元素节点，查找不到时返回null
		 */
        this.firstElement = function(element) {
            element = this.getElementById(element);
            if (element.firstElementChild) {
                return element.firstElementChild;
            }
            var node = element.firstChild;
            for (;node; node = node.nextSibling) {
                if (node.nodeType == 1) {
                    return node;
                }
            }
            return null;
        };
        /**
		 * 获取目标元素的最后一个元素节点
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @return {HTMLElement | null} 目标元素的第一个元素节点，查找不到时返回null
		 */
        this.lastElement = function(element) {
            element = this.getElementById(element);
            if (element.lastElementChild) {
                return element.lastElementChild;
            }
            var node = element.lastChild;
            for (;node; node = node.previousSibling) {
                if (node.nodeType === 1) {
                    return node;
                }
            }
            return null;
        };
        /**
		 * 获取目标元素的下一个兄弟元素节点
		 *
		 * @param {HTMLElement | string} element 目标元素或其id
		 * @return {HTMLElement | null} 目标元素的下一个元素节点，查找不到时返回null
		 */
        this.nextElement = function(element) {
            element = this.getElementById(element);
            if (element.nextElementSibling) {
                return element.nextElementSibling;
            }
            var node = element.nextSibling;
            for (;node; node = node.nextSibling) {
                if (node.nodeType == 1) {
                    return node;
                }
            }
            return null;
        };
        /**
		 * 判断一个元素是否包含另一个元素
		 *
		 * @param {HTMLElement | string} container 包含元素或元素的 id
		 * @param {HTMLElement | string} contained 被包含元素或元素的 id
		 * @return {boolean} `contained`元素是否被包含于`container`元素的DOM节点上
		 */
        this.contains = function(container, contained) {
            container = this.getElementById(container);
            contained = this.getElementById(contained);
            //fixme: 无法处理文本节点的情况(IE)
            return container.contains ? container != contained && container.contains(contained) : !!(container.compareDocumentPosition(contained) & 16);
        };
        this.extractHtmlBySelector = function(selector, htmlText) {
            var innerDiv = document.createElement("div");
            innerDiv.innerHTML = htmlText;
            var html = [];
            var nodes = this.getElements(selector, innerDiv);
            if (!this.isOuterHTMLSupported) {
                var div = document.createElement("div");
            }
            var me = this;
            //有些浏览器的某些版本不支持outerHTML,且它非W3C标准
            util.each(nodes, function(node) {
                if (me.isOuterHTMLSupported) {
                    html.push(node.outerHTML);
                } else {
                    div.appendChild(node);
                    html.push(div.innerHTML);
                    div.removeChild(node);
                }
            });
            return html.join("");
        };
        this.iterateDomTree = function(rootNode, handle) {
            var childNodes = rootNode.childNodes;
            var _arguments = arguments;
            childNodes && array.forEach(childNodes, function(childNode) {
                handle(childNode);
                _arguments.callee.call(this, childNode, handle);
            });
            childNodes = _arguments = null;
        };
        this.setText = function(element, content) {
            "textContent" in element ? element.textContent = content : element.innerText = content;
        };
        this.setValue = function(element, value) {
            element.value = value;
        };
        this.setHtml = function(element, htmlContent) {
            element.innerHTML = htmlContent;
        };
        this.setAttr = function(element, attrName, value) {
            if (lang.isFunction(element.setAttribute)) {
                element.setAttribute(attrName, value);
            } else {
                element[attrName] = value;
            }
        };
        this.setCssText = function(el, cssText) {
            "cssText" in el.style ? el.style.cssText = cssText : el.setAttribute("style", cssText);
        };
        this.empty = function(element) {
            var childNodes = element.childNodes;
            if (!childNodes || !childNodes.length) {
                return;
            }
            while (childNodes.length) {
                element.removeChild(childNodes[childNodes.length - 1]);
            }
        };
    }).call(Dom.prototype);
    return new Dom();
});
/**
 * 监听dom变化
 * 只支持现代浏览器（IE11、chrome、firefox、safari）
 * options参数 请参考：https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver#MutationObserverInit
 * updateCallback参数 请参考：https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver#MutationRecord
 */
define("bird.domobserver", [ "./bird.lang", "./bird.array" ], function(require) {
    var lang = require("./bird.lang");
    var array = require("./bird.array");
    function DomObserver(target, options) {
        this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        this.observeMutationSupport = !!MutationObserver;
        if (!this.observeMutationSupport) {
            throw new Error("Your browser does not support `MutationObserver`!");
        }
        this.updateCallbackArray = [];
        var _this = this;
        this.updateCallback = function() {
            var me = this;
            array.forEach(_this.updateCallbackArray, function(update) {
                update.apply(me, arguments);
            });
        };
        this._init(target, options);
    }
    (function() {
        this._init = function(target, options) {
            this.observer = new this.MutationObserver(this.updateCallback);
            this.observer.observe(target, options);
        };
        this.subscribe = function(update) {
            if (!lang.isFunction(update)) {
                return;
            }
            this.updateCallbackArray.push(update);
        };
        this.unsubscribe = function(update) {
            if (!arguments.length) {
                this.updateCallbackArray.length = 0;
                this.observer.disconnect();
                return;
            }
            array.forEach(this.updateCallbackArray, function(fn, index, fnArray) {
                if (fn === update) {
                    fnArray.splice(index, 1);
                }
            });
        };
        this.watch = this.subscribe;
        this.unwatch = this.unsubscribe;
        this.clear = function() {
            this.observer.takeRecords();
        };
    }).call(DomObserver.prototype);
    return DomObserver;
});
define("bird.event", [ "./bird.lang", "./bird.object", "./bird.util", "./bird.array", "./bird.dom" ], function(require) {
    var lang = require("./bird.lang");
    var object = require("./bird.object");
    var util = require("./bird.util");
    var array = require("./bird.array");
    var dom = require("./bird.dom");
    /*********************************************************************
	 *                             事件
	 ********************************************************************/
    function Event(originalEvent) {
        this.originalEvent = originalEvent;
        this.init();
    }
    (function() {
        this.init = function() {
            var originalEvent = this.originalEvent;
            var me = this;
            var properties = [ "type", "altKey", "ctrlKey", "shiftKey", "metaKey", "fromElement", "toElement", "charCode", "keyCode", "clientX", "clientY", "offsetX", "offsetY", "screenX", "screenY", "defaultPrevented", "bubbles", "cancelBubble", "cancelable", "path", "clipboardData", "eventPhase", "returnValue", "changedTouches", "targetTouches", "touches", "propertyName", "state", "srcElement", "currentTarget", "timeStamp", "target", "relatedTarget", "pageX", "pageY", "which", "button" ];
            array.forEach(properties, function(property) {
                me[property] = originalEvent[property];
            });
            this.timeStamp = this.timeStamp || new Date().getTime();
            if (this.type === "error") {
                var wsevent = window.event || {};
                this.lineno = originalEvent.lineno || wsevent.errorLine;
                this.colno = originalEvent.colno || wsevent.errorCharacter;
                this.filename = originalEvent.filename || wsevent.errorUrl;
                this.message = originalEvent.message || wsevent.errorMessage;
                this.error = originalEvent.error;
            }
            this.target = this.target || this.srcElement || document;
            if (this.target.nodeType === 3) {
                this.target = this.target.parentNode;
            }
            this.metaKey = !!originalEvent.metaKey;
            if (this.which == null) {
                this.which = originalEvent.charCode != null ? originalEvent.charCode : originalEvent.keyCode;
            }
            var body, eventDoc, doc, button = originalEvent.button, fromElement = originalEvent.fromElement;
            // Calculate pageX/Y if missing and clientX/Y available
            if (this.pageX == null && originalEvent.clientX != null) {
                eventDoc = this.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                this.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                this.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }
            // Add relatedTarget, if necessary
            if (!this.relatedTarget && fromElement) {
                this.relatedTarget = fromElement === this.target ? originalEvent.toElement : fromElement;
            }
            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!this.which && button !== undefined) {
                this.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
            }
            this.isMouseLeft = this.which === 1;
            this.isMouseRight = this.which === 3;
            this.isMouseMiddle = this.which === 2;
        };
        this.isDefaultPrevented = returnFalse;
        this.isPropagationStopped = returnFalse;
        this.isImmediatePropagationStopped = returnFalse;
        this.preventDefault = function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (!e) {
                return;
            }
            // If preventDefault exists, run it on the original event
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        };
        this.stopPropagation = function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (!e) {
                return;
            }
            // If stopPropagation exists, run it on the original event
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            // Support: IE
            // Set the cancelBubble property of the original event to true
            e.cancelBubble = true;
        };
        this.stopImmediatePropagation = function() {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && e.stopImmediatePropagation) {
                e.stopImmediatePropagation();
            }
            this.stopPropagation();
        };
        function returnTrue() {
            return true;
        }
        function returnFalse() {
            return false;
        }
    }).call(Event.prototype);
    function EventListner() {
        this.eventCache = {};
    }
    (function() {
        var doc = document;
        this.addListener = function(el, eventType, handle) {
            var me = this;
            array.forEach(eventType.split(/\s+/), function(etype) {
                me._addListener(el, etype, handle);
            });
        };
        this.removeListener = function(el, eventType, handle) {
            var me = this;
            if (!eventType) {
                return this._removeListener(el);
            }
            array.forEach(eventType.split(/\s+/), function(etype) {
                me._removeListener(el, etype, handle);
            });
        };
        this.on = this.bind = this.addListener;
        this.off = this.unbind = this.removeListener;
        this.once = function(el, eventType, handle) {
            var me = this;
            var wrappedHandle = function(e) {
                me.removeListener(el, e.type, wrappedHandle);
                handle.call(this, e);
            };
            this.addListener(el, eventType, wrappedHandle);
        };
        this._addListener = function(el, eventType, handle) {
            if (!el.__uid__) {
                el.__uid__ = util.uuid("el_");
            }
            var obj = preHandle(el, eventType, handle);
            eventType = obj.eventType;
            handle = obj.handle;
            obj = null;
            var eventTypeCache = this.eventCache[el.__uid__] = this.eventCache[el.__uid__] || {};
            var eventHandleCache = eventTypeCache[eventType] = eventTypeCache[eventType] || {};
            var eventHandleQueue;
            if (!(eventHandleQueue = eventHandleCache["queue"])) {
                eventHandleQueue = eventHandleCache["queue"] = [];
                eventHandleQueue.delegateCount = 0;
            }
            if (handle.selector) {
                eventHandleQueue.splice(eventHandleQueue.delegateCount++, 0, handle);
            } else {
                eventHandleQueue.push(handle);
            }
            if (!eventHandleCache["callback"] && (el.addEventListener || el.attachEvent)) {
                var me = this;
                var callback = function(originalEvent) {
                    var wsevent = window.event;
                    originalEvent = originalEvent || wsevent;
                    var e = new Event(originalEvent);
                    me.trigger(el, e);
                };
                var capture = /^(?:focus|blur)$/i.test(eventType);
                eventHandleCache["callback"] = callback;
                el.addEventListener ? el.addEventListener(eventType, callback, capture) : el.attachEvent("on" + eventType, callback);
                callback = null;
            }
        };
        this._removeListener = function(el, eventType, handle) {
            if (!el.__uid__) {
                return;
            }
            var eventTypeCache = this.eventCache[el.__uid__];
            if (!eventTypeCache) {
                return;
            }
            var eventHandleCache = eventTypeCache[eventType];
            if (!eventHandleCache) {
                return;
            }
            var eventHandleQueue = eventHandleCache["queue"];
            if (!eventHandleQueue || !eventHandleQueue.length) {
                return;
            }
            if (handle) {
                array.descArrayEach(eventHandleQueue, function(fn, index, handles) {
                    if (fn === handle) {
                        handles.splice(index, 1);
                        if (handle.selector) {
                            eventHandleQueue.delegateCount--;
                        }
                    }
                });
                if (!eventHandleQueue.length) {
                    removeEventCallback(el, eventType, eventHandleCache);
                    delete eventHandleQueue.delegateCount;
                }
                return;
            }
            eventHandleQueue.length = 0;
            delete eventHandleQueue.delegateCount;
            removeEventCallback(el, eventType, eventHandleCache);
        };
        function removeEventCallback(el, eventType, eventHandleCache) {
            var capture = /^(?:focus|blur)$/i.test(eventType);
            el.removeEventListener ? el.removeEventListener(eventType, eventHandleCache["callback"], capture) : el.detachEvent("on" + eventType, eventHandleCache["callback"]);
            delete eventHandleCache["callback"];
        }
        this.trigger = function(el, data) {
            if (!el.__uid__) {
                return;
            }
            var eventTypeCache = this.eventCache[el.__uid__];
            if (!eventTypeCache) {
                return;
            }
            var handlerQueue;
            var eventType = data.type;
            //data.delegateTarget = el;
            if (eventType) {
                var eventHandleCache = eventTypeCache[eventType];
                if (!eventHandleCache) {
                    return;
                }
                var eventHandleQueue = eventHandleCache["queue"];
                if (!eventHandleQueue || !eventHandleQueue.length) {
                    return;
                }
                handlerQueue = handlers(el, data, eventHandleQueue);
                dispatch(el, data, handlerQueue);
                return;
            }
            object.forEach(eventTypeCache, function(handleCache) {
                if (handleCache && handleCache["queue"]) {
                    handlerQueue = handlers(el, data, eventHandleQueue);
                    dispatch(el, data, handlerQueue);
                }
            });
        };
        var eventTypeMap = {
            level2: {
                change: "propertychange",
                focus: "focusin",
                blur: "focusout"
            },
            level3: {
                change: "input"
            }
        };
        function preHandle(el, eventType, handle) {
            var retObj = {
                handle: handle
            };
            if (el.addEventListener) {
                retObj.eventType = eventType;
                if (eventType === "change" && !/^(?:checkbox|radio|hidden|button)$/i.test(el.type) && !/^select$/i.test(el.tagName)) {
                    retObj.eventType = eventTypeMap.level3[eventType];
                }
            } else if (el.attachEvent) {
                retObj.eventType = eventTypeMap.level2[eventType] || eventType;
                if (eventType === "change" && /^(?:checkbox|radio)$/i.test(el.type) || /^select$/i.test(el.tagName)) {
                    retObj.eventType = "click";
                }
                if (retObj.eventType === "propertychange") {
                    retObj.handle = function() {
                        return handle.apply(this, arguments);
                    };
                    retObj.handle.elem = handle.elem;
                    retObj.handle.selector = handle.selector;
                    retObj.handle.needsContext = handle.needsContext;
                    delete handle.elem;
                    delete handle.selector;
                    delete handle.needsContext;
                }
            }
            return retObj;
        }
        function dispatch(el, event, handlerQueue) {
            var i, ret, handle, matched, j;
            event.delegateTarget = el;
            // Run delegates first; they may want to stop propagation beneath us
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                event.currentTarget = matched.elem;
                j = 0;
                while ((handle = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                    ret = handle.call(matched.elem, event);
                    if (ret !== undefined) {
                        if ((event.result = ret) === false) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }
                }
            }
            return event.result;
        }
        function handlers(el, event, handlers) {
            var sel, handleObj, matches, i, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            // Find delegate handlers
            // Black-hole SVG <use> instance trees (#13180)
            // Avoid non-left-click bubbling in Firefox (#3861)
            if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
                /* jshint eqeqeq: false */
                for (;cur != el; cur = cur.parentNode || el) {
                    /* jshint eqeqeq: true */
                    // Don't check non-elements (#13208)
                    // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                    if (cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click")) {
                        matches = [];
                        for (i = 0; i < delegateCount; i++) {
                            handleObj = handlers[i];
                            // Don't conflict with Object.prototype properties (#13203)
                            sel = handleObj.selector + " ";
                            if (matches[sel] === undefined) {
                                matches[sel] = handleObj.needsContext ? dom.index(cur, dom.getAll(sel, el)) >= 0 : dom.getAll(sel, el, [ cur ]).length;
                            }
                            if (matches[sel]) {
                                matches.push(handleObj);
                            }
                        }
                        if (matches.length) {
                            handlerQueue.push({
                                elem: cur,
                                handlers: matches
                            });
                        }
                    }
                }
            }
            // Add the remaining (directly-bound) handlers
            if (delegateCount < handlers.length) {
                handlerQueue.push({
                    elem: el,
                    handlers: handlers.slice(delegateCount)
                });
            }
            return handlerQueue;
        }
        var whitespace = "[\\x20\\t\\r\\n\\f]", rNeedsContext = new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i");
        //selector {String|required} 
        //需要确保代理的事件类型可冒泡,不冒泡的类型该方法未做模拟冒泡
        this.delegate = function(selector, eventType, handle, context) {
            if (!lang.isString(selector)) {
                return;
            }
            context = context || doc;
            var oldHandle = handle;
            handle = function(e) {
                return oldHandle.call(e.target, e);
            };
            handle.elem = context;
            handle.selector = selector;
            handle.needsContext = selector && rNeedsContext.test(selector);
            this.addListener(context, eventType, handle);
            handle = null;
        };
        //只是删除事件绑定时加入的属性
        this.destroy = function(el) {
            if (!el.__uid__) {
                return;
            }
            var eventTypeCache = this.eventCache[el.__uid__];
            try {
                //IE7及以下浏览器delete一个HtmlNode的属性时会抛异常,而这里的el可能为HtmlNode
                delete el.__uid__;
            } catch (e) {
                el.__uid__ = null;
            }
            if (!eventTypeCache) {
                return;
            }
            object.forEach(eventTypeCache, function(handleCache, eventType) {
                var queue = handleCache["queue"];
                queue.length = 0;
                delete queue.delegateCount;
                queue = null;
                removeEventCallback(el, eventType, handleCache);
            });
        };
        function hasHandleOnEventType(el, eventType) {
            if (!el.__uid__) {
                return false;
            }
            var eventTypeCache = this.eventCache[el.__uid__];
            if (!eventTypeCache) {
                return false;
            }
            var eventHandleCache = eventTypeCache[eventType];
            if (!eventHandleCache) {
                return false;
            }
            var eventHandleQueue = eventHandleCache["queue"];
            if (!eventHandleQueue || !eventHandleQueue.length) {
                return false;
            }
            return true;
        }
        this.isHtmlEventType = function() {
            var eventTypeMap = {};
            util.each([ "click", "dblclick", "mouseover", "mouseout", "mousemove", "mouseenter", "mouseleave", "mouseup", "mousedown", "mousewheel", "keypress", "keydown", "keyup", "load", "unload", "beforeunload", "abort", "error", "move", "resize", "scroll", "stop", "hashchange", "blur", "change", "focus", "reset", "submit", //form
            "start", "finish", "bounce", //marquee
            "contextmenu", //右键
            "drag", "dragdrop", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "propertychange", "readystatechange", "input", "popstate", "beforeprint", "afterprint", "help", //F1键
            "select", "selectstart", "copy", "cut", "paste", "losecapture", "beforecopy", "beforecut", "beforeeditfocus", "beforepaste", "beforeupdate", "touchstart", "touchmove", "touchend" ], function(eventType) {
                eventTypeMap[eventType] = 1;
            });
            return function(eventType) {
                return eventTypeMap[eventType];
            };
        }();
    }).call(EventListner.prototype);
    return new EventListner();
});
define("bird.lang", [], function(require) {
    function Lang() {}
    (function() {
        /*********************************************************************
		 *                             类型判断
		 ********************************************************************/
        /**
		 * {*}
		 * return {String}
		 */
        this.getType = function(p) {
            if (typeof p === "undefined") {
                return "Undefined";
            }
            if (p === null) {
                return "Null";
            }
            return Object.prototype.toString.call(p).slice(8, -1);
        };
        this.isUndefined = function(p) {
            return typeof p === "undefined";
        };
        /**
		 * 严格等于null
		 * {*}
		 * return {Boolean}
		 */
        this.isNull = function(p) {
            return p === null;
        };
        this.isUndefinedOrNull = function(p) {
            return p == null;
        };
        //同isUndefinedOrNull;之所以再定义一个相同功能的函数,只是为了避免记不清而不能确定函数名
        this.isNullOrUndefined = function(p) {
            return p == null;
        };
        this.isString = function(p) {
            return this.getType(p) === "String";
        };
        this.isNumber = function(p) {
            return this.getType(p) === "Number";
        };
        this.isInteger = function(p) {
            return this.isNumber(p) && /^-?\d+$/.test(p);
        };
        this.isFloat = function(p) {
            return this.isNumber(p) && /^-?\d*\.\d+$/.test(p);
        };
        this.isBoolean = function(p) {
            return this.getType(p) === "Boolean";
        };
        this.isRegExp = function(p) {
            return this.getType(p) === "RegExp";
        };
        this.isArray = function(p) {
            return Array.isArray ? Array.isArray(p) : this.getType(p) === "Array";
        };
        this.isDate = function(p) {
            return this.getType(p) === "Date";
        };
        /**
		 * typeof Object|Array|Date|Arguments|HtmlElement 都为 object
		 * return {Boolean}
		 */
        this.isObject = function(p) {
            return typeof p === "object" && p !== null;
        };
        this.isPlainObject = function(p) {
            return this.getType(p) === "Object";
        };
        var i;
        for (i in new noop()) {
            break;
        }
        var ownLast = i !== undefined;
        var hasOwn = Object.prototype.hasOwnProperty;
        /**
		 * 通过 new Object() 或者 字面量 定义的对象
		 * {Object}
		 * return {Boolean}
		 */
        this.isRawObject = function(obj) {
            var key;
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!obj || this.getType(obj) !== "Object" || obj.nodeType || this.isWindow(obj)) {
                return false;
            }
            try {
                // Not own constructor property must be Object
                if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }
            // Support: IE<9
            // Handle iteration over inherited properties before own properties.
            if (ownLast) {
                for (key in obj) {
                    return hasOwn.call(obj, key);
                }
            }
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            for (key in obj) {}
            return key === undefined || hasOwn.call(obj, key);
        };
        //IE8及以下版本中p.setInterval为一个object,并非一个function,暂无好的方法来判断
        this.isWindow = function(p) {
            //return this.isObject(p) && p.setInterval;
            //这里不去判断是否为iframe的window,在项目中基本也不会用iframe,
            //而且即使要用iframe,可以在iframe的页面里加载bird库来处理,也就不存在这个问题了
            return p != null && p == p.window;
        };
        //IE8及以下版本中p.getElementById为一个object,并非一个function,暂无好的方法来判断
        this.isHtmlDocument = function(p) {
            //return this.isObject(p) && p.getElementById;
            //不去判断是否为iframe的document,说明同isWindow
            return p === document;
        };
        /**
		 * html节点（包括元素、属性、文本、注释等）
		 * {*}
		 * return {Boolean}
		 */
        this.isHtmlNode = function(p) {
            return p && p.nodeType;
        };
        /**
		 * html元素
		 * {*}
		 * return {Boolean}
		 */
        this.isHtmlElement = function(p) {
            return p && p.nodeType === 1;
        };
        /**
		 * html属性
		 * {*}
		 * return {Boolean}
		 */
        this.isHtmlAttribute = function(p) {
            return p && p.nodeType === 2;
        };
        /**
		 * html文本节点
		 * {*}
		 * return {Boolean}
		 */
        this.isHtmlText = function(p) {
            return p && p.nodeType === 3;
        };
        /**
		 * html注释
		 * {*}
		 * return {Boolean}
		 */
        this.isHtmlComment = function(p) {
            return p && p.nodeType === 8;
        };
        this.isFunction = function(p) {
            return typeof p === "function";
        };
        /**
		 * 浏览器原生函数
		 * 不适用于IE8及以下版本,针对IE8中很多原生函数类型为object的情况仍无好的解决方法
		 * {*}
		 * return {Boolean}
		 */
        this.isNativeFunction = function(p) {
            if (!this.isFunction(p)) {
                return false;
            }
            var nativeFuncRegExp = /^\s*function\s+[a-zA-Z]*\s*\(\s*[a-zA-Z]*\s*\)\s*\{\s*\[native code\]\s*\}\s*$/;
            //return nativeFuncRegExp.test(p.toString()) && nativeFuncRegExp.test(p.toString.toString());
            //IE(11)就是怪啊! chrome和firefox下原生函数的prototype都为undefined;就它拽,非得要搞个prototype,并且这个prototype还是此原生函数的实例
            return nativeFuncRegExp.test(p.toString()) && (this.isUndefined(p.prototype) || p.prototype.constructor === p);
        };
        this.isArrayLike = function(p) {
            return (this.isObject(p) || this.isFunction(p)) && !this.isNullOrUndefined(p.length);
        };
        /**
		 * @param {String|Array|PlainObject} p
		 * @return {Boolean}
		 */
        this.isNotEmpty = function(p) {
            if (this.isNullOrUndefined(p) || p === "") {
                return false;
            }
            if (this.isArray(p) && p.length !== 0) {
                return false;
            }
            if (this.isPlainObject(p)) {
                for (var i in p) {
                    if (p.hasOwnProperty(i)) {
                        return true;
                    }
                }
                return false;
            }
            return true;
        };
        this.getVariableInContext = function(s, ctx) {
            if (!this.isObject(ctx)) {
                console.warn("Parameter `ctx` of `lang.getVariableInContext(s, ctx)` is not an object.");
                return null;
            }
            if (s.indexOf(".") === -1) {
                return ctx[s];
            }
            var segments = s.split(".");
            for (var i = 0, len = segments.length; i < len; i++) {
                var namespace = ctx[segments[i]];
                if (namespace == null && i !== len - 1) {
                    console.warn("Variable: `" + segments.slice(0, i).join(".") + "` has no value.");
                    return;
                }
                ctx = namespace;
            }
            return ctx;
        };
        this.setVariableInContext = function(s, value, ctx) {
            if (!this.isObject(ctx)) {
                console.warn("Parameter `ctx` of `lang.setVariableInContext(s, value, ctx)` is not an object.");
                return null;
            }
            var lastDotIndex = s.lastIndexOf(".");
            if (lastDotIndex === -1) {
                return ctx[s] = value;
            }
            var obj = this.getObjectInContext(s.substring(0, lastDotIndex), ctx);
            return obj[s.substring(lastDotIndex + 1, s.length)] = value;
        };
        this.getGlobalVariable = function(s) {
            return this.getVariableInContext(s, window);
        };
        this.getGlobalObject = function(s) {
            return this.getObjectInContext(s, window);
        };
        this.getObjectInContext = function(s, ctx) {
            if (s.indexOf(".") === -1) {
                return ctx[s] || (ctx[s] = {});
            }
            var segments = s.split(".");
            for (var i = 0, len = segments.length; i < len; i++) {
                var key = segments[i];
                var namespace = ctx[key] || (ctx[key] = {});
                ctx = namespace;
            }
            return ctx;
        };
        this.debounce = function(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };
        this.noop = noop;
        this.nextTick = window.setImmediate ? setImmediate.bind(window) : function(callback) {
            setTimeout(callback, 0);
        };
        function noop() {}
    }).call(Lang.prototype);
    return new Lang();
});
define("bird.lrucache", [ "./bird.__lrucache__" ], function(require) {
    var LRUCache = require("./bird.__lrucache__");
    return new LRUCache();
});
define("bird.object", [ "./bird.lang" ], function(require) {
    var lang = require("./bird.lang");
    function _Object() {}
    (function() {
        //each可从内部中断,当findSuper为true时把继承而来的property也一起遍历
        this.each = function(p, callback, findSuper) {
            if (lang.isPlainObject(p) && lang.isUndefined(p.length)) {
                for (var i in p) {
                    if (findSuper || p.hasOwnProperty(i)) {
                        if (callback.call(this, p[i], i, p) === false) {
                            return false;
                        }
                    }
                }
                return true;
            }
            var length = Number(p.length) || 0;
            for (var i = 0; i < length; i++) {
                if (findSuper || p.hasOwnProperty(i)) {
                    if (callback.call(this, p[i], i, p) === false) {
                        return false;
                    }
                }
            }
            return true;
        };
        //each不可从内部中断,当findSuper为true时把继承而来的property也一起遍历
        this.forEach = function(p, callback, findSuper) {
            if (lang.isPlainObject(p) && lang.isUndefined(p.length)) {
                for (var i in p) {
                    if (findSuper || p.hasOwnProperty(i)) {
                        callback.call(this, p[i], i, p);
                    }
                }
                return;
            }
            var length = Number(p.length) || 0;
            for (var i = 0; i < length; i++) {
                if (findSuper || p.hasOwnProperty(i)) {
                    callback.call(this, p[i], i, p);
                }
            }
        };
        this.extend = function(dest, src) {
            if (arguments.length < 2) {
                return dest;
            }
            if (arguments.length === 2) {
                this.forEach(src, function(v, k) {
                    dest[k] = v;
                });
                return dest;
            }
            var i, len;
            for (i = 1, len = arguments.length; i < len; i++) {
                this.forEach(arguments[i], function(v, k) {
                    dest[k] = v;
                });
            }
            return dest;
        };
        this.jsonToQuery = function(obj, split) {
            if (lang.isString(obj)) {
                return obj;
            }
            split = split || ",";
            var arr = [];
            var me = this;
            if (lang.isPlainObject(obj)) {
                for (var i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        var val = obj[i];
                        if (lang.isPlainObject(val)) {
                            arr.push(i + "=" + encodeURIComponent(arguments.callee.call(this, val)));
                        } else if (lang.isArray(val)) {
                            arr.push(i + "=" + encodeURIComponent(arguments.callee.call(this, val)));
                        } else if (lang.isString(val) || lang.isNumber(val)) {
                            arr.push(i + "=" + val);
                        }
                    }
                }
                return arr.join("&");
            } else if (lang.isArray(obj)) {
                var _arguments = arguments;
                this.each(obj, function(val) {
                    if (lang.isString(val) || lang.isNumber(val)) {
                        arr.push(val);
                    } else if (lang.isPlainObject(val) || lang.isArray(val)) {
                        arr.push(_arguments.callee.call(me, val));
                    }
                });
                return arr.join(split);
            }
        };
        this.keys = function(obj) {
            if (Object.keys) {
                return Object.keys(obj);
            }
            var DONT_ENUM = "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(",");
            var ret = [];
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret.push(key);
                }
            }
            if (DONT_ENUM && obj) {
                for (var i = 0; key = DONT_ENUM[i++]; ) {
                    if (obj.hasOwnProperty(key)) {
                        ret.push(key);
                    }
                }
            }
            return ret;
        };
        //过滤plainobject
        this.filter = function(p, fn) {
            if (!lang.isFunction(fn)) {
                return;
            }
            var ret = {};
            this.forEach(p, function(v, i, p) {
                if (fn(v, i, p)) {
                    ret[i] = v;
                }
            });
            return ret;
        };
    }).call(_Object.prototype);
    return new _Object();
});
define("bird.observer", [ "./bird.__observer__" ], function(require) {
    var Observer = require("./bird.__observer__");
    return new Observer();
});
/**
*	使用面向对象思想重构bird,期望的改进在以下几点：
* 	1.对象（主要指控件）自管理（a.生命周期管理 b.占用资源内存管理 c.事件管理）
*	2.方便控件扩展
*	3.各小模块分成独立的文件,遵循AMD原则定义各模块 ——> 已完成
*	4.各模块都使用类（即函数）的方式定义,对于没有继承关系的模块,可导出其单例作为接口的引用 ——> 已完成
*/


/*

模块是什么？
	对于单页应用来说，模块就是容器每次载入的内容，这些内容被抽象成一个模块

模块包含哪些内容？
	模板 + 数据 + 业务逻辑

控件是什么？
	控件是对某些常用场景所需的dom节点及其样式和绑定事件以及绑定数据的封装

//以下这段话值得再商榷
这样的话，是否可以把模块定义成一组控件的组合？
	我觉得可以！
	模块下只有控件，没有其他的原生的html代码、css、事件绑定

	容器下只有一个Panel控件，其他各控件都被Panel控件包裹，成为Panel的childControl
*/
define("bird.request", [ "./bird.dom", "./bird.lang", "./bird.string", "./bird.util", "./bird.object", "./bird.date" ], function(require) {
    var dom = require("./bird.dom");
    var lang = require("./bird.lang");
    var string = require("./bird.string");
    var util = require("./bird.util");
    var object = require("./bird.object");
    var date = require("./bird.date");
    /*********************************************************************
	 *                             ajax/jsonp
	 ********************************************************************/
    function Request() {}
    (function() {
        var doc = document;
        this.ajax = function(arg) {
            //init xhr
            var xhr, lnk;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else if (window.ActiveObject) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (!xhr) {
                console.warn("Your browser not support XmlHttpRequest!");
                return;
            }
            //define default arguments
            var obj = {
                async: true,
                requestType: "get",
                responseType: ""
            };
            object.extend(obj, arg);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        if (lang.isFunction(obj.complete)) {
                            if (/^xml$/i.test(obj.responseType)) {
                                obj.complete(this.responseXML, this.status);
                            } else {
                                var result = this.response || this.responseText;
                                if (lang.isString(result) && /^json$/i.test(obj.responseType)) {
                                    result = typeof JSON !== "undefined" && lang.isFunction(JSON.parse) ? JSON.parse(result) : eval("(" + result + ")");
                                }
                                obj.complete(result, this.status);
                            }
                        }
                    } else {
                        if (lang.isFunction(obj.error)) {
                            obj.error(xhr.statusText, xhr.status);
                        }
                    }
                }
            };
            lnk = obj.url.indexOf("?") === -1 ? "?" : "&";
            obj.data = obj.data && object.jsonToQuery(obj.data);
            if (/^(?:head|get|delete)$/i.test(obj.requestType)) {
                obj.data && (obj.url += lnk + obj.data);
                obj.data = null;
            }
            xhr.open(obj.requestType, obj.url, obj.async);
            if (/^xml$/i.test(obj.responseType)) {
                xhr.overrideMimeType("application/xml");
            }
            try {
                xhr.responseType = obj.responseType;
            } catch (e) {}
            if (/^(?:post|put|patch)$/i.test(obj.requestType)) {
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            xhr.send(obj.data);
        };
        this.post = function(url, data, callback, errorCallback) {
            var arg = {
                url: url,
                data: data,
                requestType: "post",
                responseType: "json",
                complete: callback,
                error: errorCallback
            };
            this.ajax(arg);
        };
        this.get = function(url, data, callback, errorCallback) {
            if (lang.isFunction(data)) {
                if (lang.isFunction(callback)) {
                    errorCallback = callback;
                }
                callback = data;
                data = null;
            }
            var arg = {
                url: url,
                data: data,
                requestType: "get",
                responseType: "json",
                complete: callback,
                error: errorCallback
            };
            this.ajax(arg);
        };
        this.load = function(url, selector, successcallback, errorCallback, async) {
            if (lang.isFunction(selector)) {
                error = successcallback;
                successcallback = selector;
                selector = null;
            }
            var me = this;
            var arg = {
                url: url,
                requestType: "get",
                responseType: "text",
                async: lang.isUndefinedOrNull(async) ? true : !!async,
                complete: function(data) {
                    if (selector) {
                        var html = dom.extractHtmlBySelector(selector, data);
                        lang.isFunction(successcallback) && successcallback(html);
                    } else {
                        lang.isFunction(successcallback) && successcallback(data);
                    }
                },
                error: errorCallback
            };
            this.ajax(arg);
        };
        this.syncLoad = function(url, selector, successcallback, errorCallback) {
            this.load(url, selector, successcallback, errorCallback, false);
        };
        this.jsonp = function(url, cbname, callback) {
            if (lang.isFunction(cbname)) {
                callback = cbname;
                cbname = null;
            }
            var cb = "jsonp" + date.now(), script, header;
            //url = url.replace(/([\?|\&]\w+=)\?/, "$1" + cb);
            url = url + (/\?/.test(url) ? "&" : "?") + (cbname || "callback") + "=" + cb;
            window[cb] = function(r) {
                header.removeChild(script);
                script = null;
                header = null;
                window[cb] = null;
                delete window[cb];
                callback(r);
            };
            script = doc.createElement("script");
            script.setAttribute("src", url);
            header = doc.getElementsByTagName("head")[0] || doc.getElementsByTagName("body")[0];
            header.appendChild(script);
        };
        this.imageGet = function(url, succuessCallback, errorCallback) {
            url += (url.indexOf("?") !== -1 ? "&" : "?") + "_t=" + new Date().getTime();
            dom.loadImage(url, succuessCallback, errorCallback);
        };
    }).call(Request.prototype);
    return new Request();
});
define("bird.requestframe", [], function(require) {
    !window.requestAnimationFrame && (window.requestAnimationFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            return window.setTimeout(callback, 1e3 / 60);
        };
    }());
    !window.cancelAnimationFrame && (window.cancelAnimationFrame = function() {
        return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(id) {
            window.clearTimeout(id);
        };
    }());
    function RequestAFrame() {}
    (function() {
        this.requestAFrame = function(callback) {
            return window.requestAnimationFrame(callback);
        };
        this.cancelAFrame = function(id) {
            window.cancelAnimationFrame(id);
        };
        this.now = function() {
            return window.performance.now ? window.performance.now() : Date.now ? Date.now() : new Date().getTime();
        };
    }).call(RequestAFrame.prototype);
    return new RequestAFrame();
});
define("bird.spirit", [ "./bird.requestframe" ], function(require) {
    var reqFrame = require("./bird.requestframe");
    function Spirit() {}
    //Spirit.interval = 17;
    (function() {
        /**
		 * Css sprite
		 */
        function Spirit(elem, opts) {
            this.elem = elem;
            //this.interval = opts.interval || Spirit.interval;
            this.bgPos = opts.backgroundPosition || opts["background-position"];
            this.count = opts.count || -1;
            this.picNumber = opts.picNumber;
        }
        Spirit.prototype = {
            init: function() {
                var arr = /\s*([\+|-])=\s*(-?[0-9\.]+)px\s+([\+|-])=\s*(-?[0-9\.]+)px/.exec(this.bgPos);
                this._x_calcu = arr[1];
                this._x = Number(arr[2]);
                this._y_calcu = arr[3];
                this._y = Number(arr[4]);
                var curArr = /\s*(-?[0-9\.]+)px\s+(-?[0-9\.]+)px/.exec(this.elem.style.backgroundPosition);
                this.x = Number(curArr[1]);
                this.y = Number(curArr[2]);
                arr = curArr = null;
            },
            start: function() {
                this.init();
                var count = 0;
                var picnum = 0;
                var self = this;
                this.intervalFn = function() {
                    self.timerId = reqFrame.requestAFrame(function() {
                        self.timerId = reqFrame.requestAFrame(arguments.callee);
                        if (picnum === self.picNumber) {
                            if (count < self.count || self.count === -1) {
                                picnum = -1;
                            } else if (timerId) {
                                reqFrame.cancelAFrame(self.timerId);
                                self.timerId = null;
                            }
                        }
                        ++picnum;
                        self.elem.style.backgroundPosition = (self._x_calcu === "+" ? self.x + self._x * picnum : self.x - self._x * picnum) + "px" + " " + (self._y_calcu === "+" ? self.y + self._y * picnum : self.y - self._y * picnum) + "px";
                        count++;
                    });
                };
                this.intervalFn();
                return this;
            },
            pause: function() {
                if (this.timerId) {
                    reqFrame.cancelAFrame(this.timerId);
                    this.timerId = null;
                }
            },
            resume: function() {
                if (!this.timerId && this.intervalFn) {
                    this.intervalFn();
                }
            }
        };
        this.spirit = function(elem, opts) {
            return new Spirit(elem, opts).start();
        };
    }).call(Spirit.prototype);
    return new Spirit();
});
define("bird.string", [], function(require) {
    function _String() {}
    (function() {
        /*********************************************************************
		 *                             字符串操作
		 ********************************************************************/
        var capitalizeRE = /^\w/;
        var duplicateCharRE = /(.)\1+/g;
        var htmlTagsRE = /(?:<[a-zA-Z]+\d*(?:\s+[^>]+\s*)*>)|(?:<\/[a-zA-Z]+\d*>)/g;
        var spaceRE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;
        var camelizeRE = /-([a-z])/gi;
        var placeholderRE = /\{\{(.+?)\}\}/g;
        var spaceBetweenTagsRE = /(<[a-zA-Z]+\d*\s*[^>]*\/?>)[\s\xa0\u3000]+|(<\/[a-zA-Z]+\d*>)[\s\xa0\u3000]+|[\s\xa0\u3000]+(<[a-zA-Z]+\d*\s*[^>]*\/?>)|[\s\xa0\u3000]+(<\/[a-zA-Z]+\d*>)/g;
        var bothEndQuotesRE = /(['"])([^'"])\1/;
        var htmlCommentsRE = /<!--(?:.|\r|\n)*?-->/g;
        this.capitalize = function(str) {
            return str.replace(capitalizeRE, function(s) {
                return s.toUpperCase();
            });
        };
        this.removeDuplicateChar = function(str) {
            return str.replace(duplicateCharRE, "$1");
        };
        //删除两端引号（单引号或双引号）
        this.removeBothEndQuotes = function(str) {
            return str.replace(bothEndQuotesRE, "$2");
        };
        /**
		 * 剔除html标签,但类似<1> <2>这样数字编号的被保留,示例如下：
		 * var html = "<p><a href='http://sailinglee.iteye.com'>this is a string</a> <1> by <em>李伟</em></p>";
         * var text = string.removeHtmlTags(html);
         * alert(text)//this is a tring <1> by 李伟
		 **/
        //删除Html标签，保留innerText内容
        this.removeHtmlTags = function(str) {
            return str.replace(htmlTagsRE, "");
        };
        this.removeSpaceBetweenTags = function(str) {
            return str.replace(spaceBetweenTagsRE, function(m, n, o, p, q) {
                return n || o || p || q || "";
            });
        };
        this.removeHtmlComments = function(str) {
            return str.replace(htmlCommentsRE, "");
        };
        //\xa0 -> &nbsp;    \u3000 -> 全角空格
        this.trim = function(s) {
            return s.replace(spaceRE, "");
        };
        this.equalsIgnoreCase = function(s, d) {
            return s.toLowerCase() === d.toLowerCase();
        };
        this.camelize = function(s) {
            return s.replace(camelizeRE, function(m, char) {
                return char.toUpperCase();
            });
        };
        this.format = function(template, data) {
            if (!template) {
                return "";
            }
            if (data == null) {
                return template;
            }
            return template.replace(placeholderRE, function(match, key) {
                var replacer = data[key];
                if (typeof replacer === "function") {
                    replacer = replacer(key);
                }
                return replacer == null ? "" : replacer;
            });
        };
    }).call(_String.prototype);
    return new _String();
});
define("bird.syspatch", [ "./bird.util", "./bird.lang" ], function(require) {
    var util = require("./bird.util");
    var lang = require("./bird.lang");
    /*********************************************************************
	 *                             系统函数补丁
	 ********************************************************************/
    var ctx = window;
    /**
	 * 保证JSON在语法上可行
	 */
    if (typeof ctx.JSON === "undefined") {
        ctx.JSON = {
            parse: function(s) {
                return ctx.eval("(" + s + ")");
            },
            stringify: util.stringify
        };
    }
    /**
	 * 保证console在语法上可行
	 */
    if (ctx.DEBUG && typeof ctx.console === "undefined") {
        var Console = function() {
            var div = document.createElement("div");
            div.style.position = "absolute";
            div.style.top = "0px";
            div.style.padding = "10px";
            div.style.backgroundColor = "#eee";
            div.style.filter = "alpha(opacity=80)";
            div.style.border = "dotted 2px red";
            div.style.color = "black";
            div.zIndex = 999999999;
            document.body.appendChild(div);
            this.contentDiv = div;
            div = null;
        };
        (function() {
            this.log = function(s, color) {
                var rs;
                if (!lang.isPlainObject(s) && !lang.isArray(s)) {
                    var strarr = s.split("%c");
                    var ret = [];
                    var _arguments = arguments;
                    util.forEach(strarr, function(str, index, strarr) {
                        if (!index && str) {
                            ret.push(str);
                        } else {
                            ret.push('<span style="' + _arguments[index] + '">', str, "</span>");
                        }
                    });
                    rs = ret.join("");
                } else {
                    rs = JSON.stringify(s);
                }
                var div = document.createElement("div");
                div.innerHTML = rs;
                this.contentDiv.appendChild(div);
                div = _arguments = null;
            };
            this.info = this.warn = this.error = this.log;
        }).call(Console.prototype);
        ctx.console = new Console();
    }
    if (!ctx.DEBUG) {
        ctx.console = {
            log: lang.noop,
            warn: lang.noop,
            info: lang.noop,
            error: lang.noop
        };
    }
});
define("bird.template", [ "./bird.dom" ], function(require) {
    /*********************************************************************
	 *                             模板操作
	 ********************************************************************/
    function Template() {}
    (function() {
        var dom = require("./bird.dom");
        this.template = function(id, data) {
            var tplNode = dom.getElement("#" + id);
            var tplStr = tplNode.innerHTML;
            return this.fillTemplate(tplStr, data);
        };
        this.fillTemplate = function(str, data) {
            var c = {
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: /\{\{([\s\S]+?)\}\}/g
            };
            var tmpl = "var __p=[],print=function(){__p.push.apply(__p,arguments);};" + "with(obj||{}){__p.push('" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(c.interpolate, function(match, code) {
                return "'," + code.replace(/\\'/g, "'") + ",'";
            }).replace(c.evaluate || null, function(match, code) {
                return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, " ") + "__p.push('";
            }).replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t") + "');}return __p.join('');";
            var func = new Function("obj", tmpl);
            return data ? func(data) : func;
        };
    }).call(Template.prototype);
    return new Template();
});
define("bird.tween", [], function(require) {
    return {
        linear: function(t, b, c, d) {
            return c * t / d + b;
        },
        sineBoth: function(t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOut: function(t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeBoth: function(t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * (--t * (t - 2) - 1) + b;
        },
        easeInStrong: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutStrong: function(t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeBothStrong: function(t, b, c, d) {
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t + b;
            }
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        elasticIn: function(t, b, c, d, a, p) {
            if (t == 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * .3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p)) + b;
        },
        elasticOut: function(t, b, c, d, a, p) {
            if (t == 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * .3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + c + b;
        },
        elasticBoth: function(t, b, c, d, a, p) {
            if (t == 0) {
                return b;
            }
            if ((t /= d / 2) == 2) {
                return b + c;
            }
            if (!p) {
                p = d * .3 * 1.5;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1) {
                return -.5 * a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * 2 * Math.PI / p) * .5 + c + b;
        },
        backIn: function(t, b, c, d, s) {
            if (typeof s == "undefined") {
                s = 1.70158;
            }
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        backOut: function(t, b, c, d, s) {
            if (typeof s == "undefined") {
                s = 1.70158;
            }
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        backBoth: function(t, b, c, d, s) {
            if (typeof s == "undefined") {
                s = 1.70158;
            }
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * (((s *= 1.525) + 1) * t - s) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
        },
        bounceIn: function(t, b, c, d) {
            return c - Tween["bounceOut"](d - t, 0, c, d) + b;
        },
        bounceOut: function(t, b, c, d) {
            if ((t /= d) < 1 / 2.75) {
                return c * 7.5625 * t * t + b;
            } else if (t < 2 / 2.75) {
                return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
            } else if (t < 2.5 / 2.75) {
                return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
            }
            return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
        },
        bounceBoth: function(t, b, c, d) {
            if (t < d / 2) {
                return Tween["bounceIn"](t * 2, 0, c, d) * .5 + b;
            }
            return Tween["bounceOut"](t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    };
});
define("bird.util", [ "./bird.object", "./bird.array", "./bird.lang", "./bird.string", "./bird.uuid" ], function(require) {
    var object = require("./bird.object");
    var array = require("./bird.array");
    var lang = require("./bird.lang");
    var string = require("./bird.string");
    var uuid = require("./bird.uuid");
    function Util() {}
    (function() {
        /**
		 * 在bird.array和bird.object里都有了各自的each和forEach,这里为何还要再弄个呢?
		 * 很多场景,我们并不想或并不能完全确定传入的实参的各层属性到底是Array还是PlainObject,
		 * 这种情况下就用这里的each和forEach,免得在业务逻辑里再去判断类型并选择导入array模块还是object模块
		 */
        //each可从内部中断,当findSuper为true时把继承而来的property也一起遍历
        this.each = function(p, callback, findSuper) {
            return lang.isArray(p) ? array.each(p, callback, findSuper) : object.each(p, callback, findSuper);
        };
        //each不可从内部中断,当findSuper为true时把继承而来的property也一起遍历
        this.forEach = function(p, callback, findSuper) {
            lang.isArray(p) ? array.forEach(p, callback, findSuper) : object.forEach(p, callback, findSuper);
        };
        this.uuid = function(prefix) {
            var uid = uuid.uuid(8);
            return prefix ? prefix + uid : uid;
        };
        this.stringify = function(obj) {
            var isArray = lang.isArray(obj);
            var ret = [ isArray ? "[" : "{" ];
            var _arguments = arguments;
            var me = this;
            this.forEach(obj, function(val, key, obj) {
                if (!isArray) {
                    ret.push(key, ":");
                }
                if (lang.isArray(val) || lang.isPlainObject(val)) {
                    ret.push(_arguments.callee.call(me, val));
                } else if (lang.isDate(val)) {
                    ret.push('"', val.toLocaleString(), '"');
                } else {
                    var isRaw = lang.isString(val) || lang.isNumber(val);
                    isRaw && ret.push('"');
                    ret.push(string.trim(val));
                    isRaw && ret.push('"');
                }
                ret.push(",");
            });
            ret.pop();
            ret.push(isArray ? "]" : "}");
            return ret.join("");
        };
    }).call(Util.prototype);
    //考虑到AMD加载器会缓存模块实例,所以这里只需要简单的new一个实例即可,无需去判断是否是首次实例化一个类
    return new Util();
});
define("bird.uuid", [], function(require) {
    var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    function Uuid() {}
    (function() {
        this.uuid = function(len, radix) {
            var chars = CHARS, uuid = [], i;
            radix = radix || chars.length;
            if (len) {
                // Compact form
                for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
            } else {
                // rfc4122, version 4 form
                var r;
                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
                uuid[14] = "4";
                // Fill in random data.  At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[i == 19 ? r & 3 | 8 : r];
                    }
                }
            }
            return uuid.join("");
        };
        // A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
        // by minimizing calls to random()
        this.uuidFast = function() {
            var chars = CHARS, uuid = new Array(36), rnd = 0, r;
            for (var i = 0; i < 36; i++) {
                if (i == 8 || i == 13 || i == 18 || i == 23) {
                    uuid[i] = "-";
                } else if (i == 14) {
                    uuid[i] = "4";
                } else {
                    if (rnd <= 2) rnd = 33554432 + Math.random() * 16777216 | 0;
                    r = rnd & 15;
                    rnd = rnd >> 4;
                    uuid[i] = chars[i == 19 ? r & 3 | 8 : r];
                }
            }
            return uuid.join("");
        };
        // A more compact, but less performant, RFC4122v4 solution:
        this.uuidCompact = function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
                return v.toString(16);
            });
        };
    }).call(Uuid.prototype);
    return new Uuid();
});
/**
 * 所有业务Action的基类,定义了一个Action应该包含的一系列接口
 * 所有业务子Action必须继承该类
 */
define("bird.action", [ "bird.object", "bird.lang", "bird.dom", "bird.array", "bird.util", "bird.request", "./bird.model", "./bird.databind", "./bird.globalcontext", "./bird.requesthelper", "./bird.validator", "bird.__lrucache__" ], function(require) {
    var object = require("bird.object");
    var lang = require("bird.lang");
    var dom = require("bird.dom");
    var array = require("bird.array");
    var util = require("bird.util");
    var request = require("bird.request");
    var Model = require("./bird.model");
    var DataBind = require("./bird.databind");
    var globalContext = require("./bird.globalcontext");
    var RequestHelper = require("./bird.requesthelper");
    var validator = require("./bird.validator");
    var LRUCache = require("bird.__lrucache__");
    function Action() {
        this.id = util.uuid("action_");
        this.model = new Model();
        this.dataBind = new DataBind();
        this.dataBinds = [];
        this.requestHelper = new RequestHelper();
        this.lruCache = new LRUCache();
        this.args = {};
        this.lifePhase = this.LifeCycle.NEW;
        this.init();
    }
    Action.setContainer = function(container) {
        Action.prototype.container = lang.isString(container) ? document.getElementById(container) : container;
    };
    (function() {
        this.LifeCycle = {
            NEW: 0,
            INITED: 1,
            MODEL_BOUND: 2,
            RENDERED: 3,
            EVENT_BOUND: 4,
            DESTROYED: 5
        };
        this.tpl = "";
        this.name = "";
        this.container = document.getElementById("wrapper");
        this.init = function() {
            if (!this.requestUrl) {
                this.requestUrl = {};
            }
            if (!this.requestUrlWhenEnter) {
                this.requestUrlWhenEnter = {};
            }
            object.extend(this.requestUrl, this.requestUrlWhenEnter);
            if (!this.requestUrl.resource) {
                this.requestUrl.resource = "/api/" + this.name;
            }
            this.requestHelper.generateRequestMethods(this.requestUrl, this.name);
            this.lifePhase = this.LifeCycle.INITED;
        };
        this._requestData = function(callback) {
            var me = this;
            this.promise = {
                isListening: false,
                requestCount: 0,
                callback: callback,
                callCallback: function() {
                    if (!this.requestCount && this.isListening) {
                        this.callback();
                    }
                },
                listen: function() {
                    this.isListening = true;
                    this.callCallback();
                }
            };
            if (lang.isNotEmpty(this.requestUrlWhenEnter)) {
                object.forEach(this.requestUrlWhenEnter, function(value, key) {
                    var arr = value.split(/\s+/);
                    var reqType = arr && arr[0];
                    var url = arr && arr[1];
                    if (/\{\{[^{}]+\}\}/.test(url)) {
                        url = string.format(url, me.args);
                    }
                    request.ajax({
                        url: url,
                        requestType: reqType,
                        responseType: "json",
                        data: me.args && me.args.param,
                        complete: function(data) {
                            data = data && data.result || data || {};
                            me.model[url] = data;
                            me.promise.requestCount--;
                            me.promise.callCallback();
                        },
                        error: function() {
                            me.promise.requestCount--;
                            me.promise.callCallback();
                        }
                    });
                    me.promise.requestCount++;
                });
            }
        };
        //子类可以覆盖该接口
        this.initModel = function(modelReference, watcherReference, requesterReference, argumentsReference, lruCacheReference) {};
        this._initModel = function() {
            this.initModel(this.model, this.model.watcher, this.requestHelper, this.args, this.lruCache);
            this.lifePhase = this.LifeCycle.MODEL_BOUND;
        };
        /*
		 * 初始模板应用双向绑定
		 * @private
		 */
        this._applyBind = function() {
            if (!this.tpl) {
                dom.empty(this.container);
                return;
            }
            this.dataBind.parseTpl(this.tpl);
            this.container.innerHTML = this.dataBind.fillTpl(this.model, this.id);
            this.dataBind.bind(this.model, this.model.watcher, this.container, this.dataBinds, this.id);
        };
        /*
		 * 为动态插入的模板应用双向绑定
		 * 一个Action对应一个根容器,即使这里的container非根容器,它也必须是根容器的子节点,所以这里可以把事件绑定在根容器上
		 * @public
		 */
        this.applyBind = function(tpl, container, append) {
            if (!tpl || !container) {
                return;
            }
            var dataBind = new DataBind();
            this.dataBinds.push(dataBind);
            dataBind.parseTpl(tpl);
            var html = dataBind.fillTpl(this.model, this.id);
            if (lang.isFunction(append)) {
                append(html, container);
            } else if (append) {
                dom.appendTo(html, container);
            } else {
                container.innerHTML = html;
            }
            //绑定事件处理逻辑到该Action的根容器上
            dataBind.bind(this.model, this.model.watcher, this.container, this.dataBinds, this.id);
        };
        //子类可以覆盖该接口,自定义事件绑定逻辑
        this.bindEvent = function(modelReference, watcherReference, requesterReference, argumentsReference, lruCacheReference) {};
        this._bindEvent = function() {
            this.bindEvent(this.model, this.model.watcher, this.requestHelper, this.args, this.lruCache);
            this.lifePhase = this.LifeCycle.EVENT_BOUND;
        };
        //子类可以覆盖该接口,用来修改从服务器端获取的数据的结构以满足页面控件的需求
        this.beforeRender = function(modelReference, watcherReference, requesterReference, argumentsReference, lruCacheReference) {};
        this._render = function() {
            this.render(this.model, this.model.watcher, this.requestHelper, this.args, this.lruCache);
            this.lifePhase = this.LifeCycle.RENDERED;
        };
        //子类可以覆盖该接口,请求后台数据返回后重新渲染模板部分内容
        this.render = function(modelReference, watcherReference, requesterReference, argumentsReference, lruCacheReference) {};
        //子类可以覆盖该接口,可能用来修改一些元素的状态等善后操作
        this.afterRender = function(modelReference, watcherReference, requesterReference, argumentsReference, lruCacheReference) {};
        this.loadTpl = function(callback) {
            if (!this.tplUrl || this.tpl) {
                callback();
            } else {
                var me = this;
                request.load(this.tplUrl + "?" + new Date().getTime(), function(data) {
                    me.constructor.prototype.tpl = data;
                    callback();
                });
            }
        };
        this.enter = function(args) {
            var me = this;
            this.args = args;
            this._requestData(function() {
                me.beforeRender(me.model, me.model.watcher, me.requestHelper, me.args, me.lruCache);
                me._render();
                me.afterRender(me.model, me.model.watcher, me.requestHelper, me.args, me.lruCache);
            });
            this._initModel();
            this.loadTpl(function() {
                //根据Action的变化更新浏览器标题栏
                if (me.title && me.title !== document.title) {
                    document.title = me.title;
                }
                me._applyBind();
                if (me.lifePhase < me.LifeCycle.EVENT_BOUND) {
                    me._bindEvent();
                }
                me.promise.listen();
            });
        };
        //子类可以覆盖该接口,离开Action之前释放一些内存和解绑事件等等
        this.beforeLeave = function(modelReference, watcherReference, requesterReference, argumentsReference, lruCacheReference) {};
        this.leave = function(nextAction) {
            this.beforeLeave(this.model, this.model.watcher, this.requestHelper, this.args, this.lruCache);
            globalContext.remove(this.id);
            validator.clearMessageStack();
            this.dataRequestPromise = null;
            this.dataBind.destroy();
            array.forEach(this.dataBinds, function(dataBind) {
                dataBind.destroy(true);
            });
            this.dataBinds.length = 0;
            this.model.destroy();
            //解决ie8等浏览器切换action时页面闪动的问题
            if (nextAction && nextAction.container !== this.container) {
                dom.empty(this.container);
            }
            this.lifePhase = this.LifeCycle.DESTROYED;
        };
    }).call(Action.prototype);
    return Action;
});
/**
 * 应用环境缓存区
 *
 */
define("bird.applicationcontext", [], function(require) {
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
/**
 * 负责查找具体Action的调用
 *
 */
define("bird.controller", [ "./bird.router.hashchange", "bird.lang", "bird.array", "./bird.action" ], function(require) {
    var router = require("./bird.router.hashchange");
    var lang = require("bird.lang");
    var array = require("bird.array");
    var Action = require("./bird.action");
    function Controller() {}
    (function() {
        this.start = function() {
            router.start();
            this.initActionListener();
            console.log("bird.controller started!");
        };
        //调度指定的Action并启动Action
        this.dispatch = function(name, data) {
            var me = this;
            //兼容seajs和esl
            (require.async || require)(name, function(action) {
                data.action = name;
                if (action && action instanceof Action) {
                    me.currentAction && me.currentAction.leave(action);
                    me.lastAction = me.currentAction;
                    me.currentAction = action;
                    action.enter(data);
                }
            });
        };
        this.back = function() {
            this.redirect(this.lastAction ? "#!" + this.lastAction.args.location : "/");
        };
        this.redirect = function(url, isWholeUrl) {
            router.route(url, isWholeUrl);
        };
        this.initActionListener = function() {
            var me = this;
            array.forEach(this.actionMaps, function(la) {
                router.listenLocation(la, function(data) {
                    if (lang.isString(la.action)) {
                        me.dispatch(la.action, data);
                    } else if (lang.isArray(la.action)) {
                        array.forEach(la.action, function(actionName) {
                            me.dispatch(actionName, data);
                        });
                    }
                });
            });
        };
        this.configApp = function(options) {
            this.actionMaps = lang.isArray(options) ? options : options.actionMaps;
        };
    }).call(Controller.prototype);
    return new Controller();
});
/**
 * 该模块用来实现双向绑定
 * 三步完成绑定：
 * 1.parseTpl
 * 2.fillTpl
 * 3.bind
 * 针对input控件要分别区分对待：输入框类型(text、password、email等),选择器类型(checkbox、radio、select)
 * select也当作input控件处理,对于选择器类型,对其做双向绑定,应使用特定的属性：valueVariable,对于输入框类型则可直接使用value
 * 要这么区别对待的原因: checkbox和radio的value属性通常作为选项被赋予固定的值,为了方便处理select也使用相同的方法
 * 示例：
 * <input type="checkbox" name="myckbox" valueVariable="{{testVariable}}" value="11">
 * <input type="radio" name="myradio" valueVariable="{{testVariable}}" value="a">
 * <select valueVariable="{{testVariable}}">
 *     <option value="a">a</option>
 *     <option value="b">b</option>
 *     <option value="c">c</option>
 * </select>
 */
define("bird.databind", [ "bird.dom", "bird.lang", "bird.array", "bird.event", "bird.object", "bird.string", "bird.util", "bird.browser", "bird.request", "bird.lrucache", "./bird.globalcontext", "./bird.tplparser", "./bird.filter", "./bird.validator", "./bird.handlemap" ], function(require) {
    var dom = require("bird.dom");
    var lang = require("bird.lang");
    var array = require("bird.array");
    var event = require("bird.event");
    var object = require("bird.object");
    var string = require("bird.string");
    var util = require("bird.util");
    var browser = require("bird.browser");
    var request = require("bird.request");
    var lruCache = require("bird.lrucache");
    var globalContext = require("./bird.globalcontext");
    var TplParser = require("./bird.tplparser");
    var filterHelper = require("./bird.filter");
    var validator = require("./bird.validator");
    function DataBind() {
        this.tplParser = new TplParser();
        this.typeHandleMap = require("./bird.handlemap");
        this.eventBindedNodes = [];
    }
    (function() {
        //第一步：解析原始模板中的变量信息,并生成处理后的模板
        this.parseTpl = function(str) {
            if (!str || this.tplParser.parsedTpl) {
                return;
            }
            this.tplParser.parseTpl(str);
        };
        //第二步：将action的model填充进模板,并做首次渲染
        this.fillTpl = function(model, actionId) {
            var parsedInfoCache = this.tplParser.parsedInfoCache;
            var str = this.tplParser.parsedTpl;
            var me = this;
            object.forEach(parsedInfoCache, function(parsedInfo) {
                object.forEach(parsedInfo, function(val, key) {
                    if (lang.isPlainObject(val) && val.variable) {
                        var regStr = "\\{\\{\\s*" + val.variable + "\\s*(?:\\|[^{}]+)?" + "\\}\\}";
                        var value = "";
                        if (val.filter !== "include") {
                            value = model.get(val.variable);
                        }
                        if (lang.isUndefinedOrNull(value)) {
                            value = "";
                            var lastDotIndex = val.variable.lastIndexOf(".");
                            if (lastDotIndex === -1) {
                                model[val.variable] = value;
                            } else {
                                var obj = lang.getObjectInContext(val.variable.substring(0, lastDotIndex), model);
                                obj[val.variable.substring(lastDotIndex + 1, val.variable.length)] = value;
                                obj = null;
                            }
                        }
                        if (/^event$/i.test(key)) {
                            regStr = "on" + val.key + "=([\"'])\\s*" + regStr + "\\s*\\1";
                            value = "";
                        }
                        if (value === "") {
                            if (/^(?:readonly|disabled|checked|selected)$/i.test(key)) {
                                regStr = key + "=([\"'])\\s*" + regStr + "\\s*\\1";
                            } else if (/^style$/i.test(key) && val.key) {
                                regStr = val.key + ":\\s*" + regStr + "\\s*;?";
                            } else if (/^class$/i.test(key)) {
                                regStr = "\\s*" + regStr;
                            }
                        }
                        var reg = new RegExp(regStr, "g");
                        //input控件不应支持过滤器的功能
                        if (val.filter && !/^(?:value|htmlText)$/i.test(key) && value) {
                            value = filterHelper.filter(value, val.filter);
                        }
                        str = str.replace(reg, value);
                    } else if (lang.isArray(val)) {
                        var _arguments = arguments;
                        array.forEach(val, function(_val) {
                            _arguments.callee(_val, key);
                        });
                    }
                });
            });
            return str;
        };
        //第三步：绑定模板变量到对应的处理函数
        this.bind = function(model, watcher, container, dataBinds, actionId) {
            var me = this;
            container = container || document;
            object.forEach(this.tplParser.parsedInfoCache, function(info) {
                var selector = info.id;
                var node = dom.getElementById(selector);
                object.forEach(info, function(val, key) {
                    if (/id|tagName/.test(key)) {
                        return;
                    }
                    if (val.filter === "include") {
                        var cachedTpl = lruCache.getValue(val.variable);
                        if (cachedTpl) {
                            var dataBind = doInclude(node, cachedTpl, model, actionId);
                            dataBind && dataBinds.push(dataBind);
                        } else {
                            request.load(val.variable, function(data) {
                                var dataBind = doInclude(node, data, model, actionId);
                                dataBind && dataBinds.push(dataBind);
                                lruCache.add(val.variable, data);
                            });
                        }
                        return;
                    }
                    if (lang.isPlainObject(val) && val.variable) {
                        var value = model.get(val.variable);
                        if (/^event$/i.test(key)) {
                            var eventHandleKey = selector + "-" + val.key;
                            var eventHandle = function(e) {
                                var handle = me.typeHandleMap.eventMap[eventHandleKey] || lang.noop;
                                handle.call(this, e);
                            };
                            if (!me.typeHandleMap.eventMap[eventHandleKey]) {
                                me.typeHandleMap.eventMap[eventHandleKey] = lang.isFunction(value) ? value : lang.noop;
                            }
                            event.on(node, val.key, eventHandle);
                            array.pushUniqueInArray(node, me.eventBindedNodes);
                        }
                        me._bindHandleByType(watcher, val, key, node, selector);
                    } else if (lang.isArray(val)) {
                        var _arguments = arguments;
                        array.forEach(val, function(_val) {
                            _arguments.callee(_val, key);
                        });
                    }
                });
                if (/^select$/i.test(info.tagName) && lang.isPlainObject(info.valueVariable)) {
                    me._addEventOnInput(node, info.valueVariable, model);
                } else if (/^input$/i.test(info.tagName)) {
                    if (/^(?:checkbox|radio)$/i.test(node.type) && lang.isPlainObject(info.valueVariable)) {
                        me._addEventOnInput(node, info.valueVariable, model);
                    } else if (lang.isPlainObject(info.value)) {
                        me._addEventOnInput(node, info.value, model);
                    }
                } else if (/^textarea$/i.test(info.tagName) && lang.isPlainObject(info.value || info.htmlText)) {
                    me._addEventOnInput(node, info.value || info.htmlText, model);
                }
            });
        };
        /**
		 * IE不支持onchange和oninput,但IE有onpropertychange
		 * onchange需要失去焦点才触发,oninput在输入时就触发
		 */
        this._addEventOnInput = function(node, value, model) {
            var attrVariable = value.variable, filter = value.filter, me = this, validators = [];
            array.pushUniqueInArray(node, this.eventBindedNodes);
            var isChkboxOrRadio = /^(?:checkbox|radio)$/i.test(node.type);
            var isSelect = /^select$/i.test(node.tagName);
            if (isChkboxOrRadio || isSelect) {
                event.on(node, "change", checkedInputChangeHandle);
                return;
            }
            //input类型控件(包括textarea)的过滤器字段实际是验证器字段
            //即可输入控件的filter字段是验证器字段,不可输入控件则是过滤器字段
            if (filter) {
                var validatorStrArr = filter.split(/\s+/);
                array.forEach(validatorStrArr, function(str) {
                    var arr = str.split(",");
                    var vname = arr[0];
                    var rule = validator.getRule(vname);
                    if (rule) {
                        var args = arr.slice(1);
                        validators.push(function() {
                            return function(value) {
                                args.unshift(value);
                                validator.clearMessageStack();
                                return rule.apply(null, args);
                            };
                        }());
                    }
                });
            }
            event.on(node, "change", textInputChangeHandle);
            function textInputChangeHandle(e) {
                if (e.propertyName && e.propertyName !== "value") {
                    return;
                }
                var target = e.target;
                var value = target.value;
                if (!me.validate(validators, target, value)) {
                    return;
                }
                model.set(attrVariable, value, me, target);
            }
            function checkedInputChangeHandle(e) {
                var target = e.target;
                var value;
                if (/^input$/i.test(target.tagName)) {
                    if (/^checkbox$/i.test(target.type)) {
                        value = dom.getCheckboxValues(target);
                        value = value.length ? value.join(",") : "";
                    } else if (/^radio$/i.test(target.type)) {
                        value = dom.getRadioValue(target);
                    }
                } else if (/^select$/i.test(target.tagName)) {
                    value = dom.getSelectedOptionValues(target);
                    value = value.length ? value.join(",") : "";
                }
                model.set(attrVariable, value, me, target);
            }
        };
        this._bindHandleByType = function(watcher, variableInfo, type, node, selector) {
            var typeHandleMap = this.typeHandleMap;
            if (lang.isPlainObject(variableInfo)) {
                var variable = variableInfo.variable;
                //textarea控件较特殊,即使<textarea>{{variable}}</textarea>定义变量,也采用类型为'value'的处理函数
                if (/^textarea$/i.test(node.tagName)) {
                    type = "value";
                }
                watcher.subscribe(variable, (typeHandleMap[type] || typeHandleMap["default"]).call(typeHandleMap, node, selector, variable, variableInfo.filter, type === "event" ? variableInfo.key : type));
            }
        };
        this.validate = function(validators, target, value) {
            var errorTipNode = target.id ? dom.g("[for=" + target.id + "]", target.parentNode) : dom.g(".errorTip", target.parentNode);
            if (!array.each(validators, function(v) {
                return v(value);
            })) {
                errorTipNode && dom.setText(errorTipNode, validator.getMessageStack().join());
                return false;
            } else {
                errorTipNode && dom.setText(errorTipNode, "");
            }
            return true;
        };
        this.destroy = function(deepDestroy) {
            deepDestroy && this.tplParser.destroy();
            object.forEach(this.typeHandleMap.eventMap, function(v, k, map) {
                delete map[k];
            });
            array.forEach(this.eventBindedNodes, function(node) {
                event.destroy(node);
            });
            this.eventBindedNodes.length = 0;
        };
        function doInclude(elem, tplContent, model, actionId) {
            var html;
            if (elem) {
                if (/\{\{[^{}]+\}\}/.test(tplContent)) {
                    var dataBind = new DataBind();
                    dataBind.parseTpl(tplContent);
                    html = dataBind.fillTpl(model, actionId);
                } else {
                    html = tplContent;
                }
                dom.setHtml(elem, html);
            }
            return dataBind;
        }
    }).call(DataBind.prototype);
    return DataBind;
});
/**
 * 该模块用来过滤处理模板变量的实际值
 */
define("bird.filter", [ "bird.array" ], function(require) {
    var array = require("bird.array");
    function Filter() {}
    (function() {
        var filterMap = {
            "int": function(value) {
                return parseInt(value);
            },
            //保留n位小数
            "float": function(value, n) {
                return parseFloat(value).toFixed(n);
            },
            RMB: function(value) {
                return "RMB" + value;
            },
            dollar: function(value) {
                return "$" + value;
            },
            date: function(value, format) {}
        };
        //添加多个过滤器时需要注意上个过滤器对value处理的结果对下个过滤器的影响
        this.filter = function(value, filter) {
            var filters = filter.split(/\s+/);
            array.forEach(filters, function(f) {
                var fs = f.split(":");
                var ft = fs[0];
                var handle = filterMap[ft];
                if (handle) {
                    var args = fs[1] ? fs[1].split(",") : [];
                    args.unshift(value);
                    value = handle.apply(null, args);
                }
            });
            return value;
        };
    }).call(Filter.prototype);
    return new Filter();
});
/**
 * 全局环境缓存区
 * 挂载在window.globalContext下
 */
define("bird.globalcontext", [ "bird.lang" ], function(require) {
    var lang = require("bird.lang");
    var ctx = window;
    function GlobalContext() {
        ctx.globalContext = {};
    }
    (function() {
        this.set = function(key, value) {
            ctx.globalContext[key] = value;
        };
        this.get = function(key) {
            return ctx.globalContext[key];
        };
        this.getObject = function(literal) {
            literal = literal.replace(/^globalContext\./, "");
            var words = literal.split(".");
            var word;
            if (words.length === 1) {
                word = words[0];
                ctx.globalContext[word] = ctx.globalContext[word] || {};
                return ctx.globalContext[word];
            }
            var _ctx = ctx.globalContext;
            for (var i = 0, len = words.length; i < len; i++) {
                var namespace = _ctx[words[i]];
                if (lang.isNullOrUndefined(namespace)) {
                    namespace = {};
                    _ctx[words[i]] = namespace;
                }
                _ctx = namespace;
            }
            return _ctx;
        };
        this.getObjectLiteral = function(str) {
            str = str.replace(/^globalContext\./, "");
            return "globalContext." + str;
        };
        this.remove = function(key) {
            return delete ctx.globalContext[key];
        };
    }).call(GlobalContext.prototype);
    return new GlobalContext();
});
define("bird.handlemap", [ "bird.dom", "bird.lang", "bird.array", "bird.event", "./bird.filter" ], function(require) {
    var dom = require("bird.dom");
    var lang = require("bird.lang");
    var array = require("bird.array");
    var event = require("bird.event");
    var filterHelper = require("./bird.filter");
    function HandleMap() {
        this.eventMap = {};
    }
    (function() {
        this.htmlText = function(node, selector, variable, filter) {
            return filter === "text" ? function(value) {
                value = filter && !/^(?:html|text)$/i.test(filter) ? filterHelper.filter(value, filter) : value;
                dom.setText(node, value);
            } : function(value) {
                value = filter && !/^(?:html|text)$/i.test(filter) ? filterHelper.filter(value, filter) : value;
                dom.setHtml(node, value);
            };
        };
        this.value = function(node, selector, variable, filter) {
            return function(value, oldValue, ctx) {
                //input控件不应有过滤功能,会引起较大的副作用
                //value = filter ? filterHelper.filter(value, filter) : value;
                //这么做是避免重复赋值引起多触发一次onpropertychange事件
                if (ctx === node) {
                    return;
                }
                dom.setValue(node, value);
            };
        };
        this.valueVariable = function(node, selector, variable, filter) {
            return function(value, oldValue, ctx) {
                if (ctx === node) {
                    return;
                }
                value = value.replace(/,/g, "|");
                var regexp = new RegExp("^(?:" + value + ")$");
                if (/^input$/i.test(node.tagName)) {
                    if (regexp.test(node.value)) {
                        node.checked = true;
                    } else {
                        node.checked = false;
                    }
                } else if (/^select$/i.test(node.tagName)) {
                    var options = dom.getOptionsOfSelect(node);
                    array.forEach(options, function(option) {
                        if (regexp.test(option.value)) {
                            option.selected = true;
                        } else {
                            option.selected = false;
                        }
                    });
                }
            };
        };
        this.disabled = function(node, selector, variable, filter) {
            return function(value) {
                node.disabled = !!value;
            };
        };
        this.readonly = function(node, selector, variable, filter) {
            return function(value) {
                node.readonly = !!value;
            };
        };
        this.checked = function(node, selector, variable, filter) {
            return function(value) {
                node.checked = !!value;
            };
        };
        this.selected = function(node, selector, variable, filter) {
            return function(value) {
                node.selected = !!value;
            };
        };
        this.placeholder = function(node, selector, variable, filter) {
            return function(value) {
                dom.setAttr(node, "placeholder", value);
            };
        };
        this["for"] = function(node, selector, variable, filter) {
            return function(value) {
                dom.setAttr(node, "for", value);
            };
        };
        this.alt = function(node, selector, variable, filter) {
            return function(value) {
                dom.setAttr(node, "alt", value);
            };
        };
        this.style = function(node, selector, variable, filter, key) {
            return key ? function(value) {
                value = filter ? filterHelper.filter(value, filter) : value;
                node.style[key] = value;
            } : function(value) {
                dom.setCssText(node, value);
            };
        };
        this["class"] = function(node, selector, variable, filter) {
            return function(value, oldValue) {
                oldValue && dom.removeClass(node, oldValue);
                dom.addClass(node, value);
            };
        };
        this.event = function(node, selector, variable, filter, eventType) {
            eventMap = this.eventMap;
            var eventHandleKey = selector + "-" + eventType;
            return function(value) {
                eventMap[eventHandleKey] = value;
            };
        };
        this.customAttr = function(node, selector, variable, filter, key) {
            return function(value) {
                value = filter ? filterHelper.filter(value, filter) : value;
                dom.setAttr(node, key, value);
            };
        };
        //默认的处理函数
        this["default"] = function(node, selector, variable, filter, type) {
            return function(value) {
                dom.setAttr(node, type, value);
            };
        };
    }).call(HandleMap.prototype);
    return new HandleMap();
});
define("bird.model", [ "bird.lang", "bird.array", "bird.object", "bird.__observer__" ], function(require) {
    var lang = require("bird.lang");
    var array = require("bird.array");
    var object = require("bird.object");
    var Observer = require("bird.__observer__");
    function Model() {
        this.watcher = new Observer();
    }
    (function() {
        var reservedObjMap = {
            set: 1,
            get: 1,
            destroy: 1,
            toJSON: 1,
            toQuery: 1,
            filterJSON: 1,
            watcher: 1
        };
        this.set = function(key, value) {
            var _key = key;
            var lastDotIndex = _key.lastIndexOf(".");
            var obj;
            if (lastDotIndex === -1) {
                obj = this;
            } else {
                obj = lang.getObjectInContext(_key.substring(0, lastDotIndex), this);
                _key = _key.substring(lastDotIndex + 1, _key.length);
            }
            var oldValue = obj[_key];
            if (oldValue === value) {
                return;
            }
            obj[_key] = value;
            obj = null;
            var argArr = [ key, value, oldValue, arguments[arguments.length - 1] ];
            this.watcher.publish.apply(this.watcher, argArr);
            argArr = null;
        };
        this.get = function(key) {
            return lang.getVariableInContext(key, this);
        };
        this.toJSON = function(keyArr) {
            return this.filterJSON.apply(this, arguments);
        };
        /**
		 * 过滤参数只支持不超过两级变量引用的形式：'a' or 'a.b'
		 * 点的数量超过1个的变量引用形式不被支持，如：'a.b.c',
		 * 若过滤参数超过一个，那么变量的第一个引用单词必须相同，即需类似：['a.b','a.c']
		 * 这样的变量引用将不被支持：['a.b','b.c']
		 */
        this.filterJSON = function(json) {
            var filterKeys;
            if (lang.isArray(json)) {
                filterKeys = json;
                json = this;
            } else if (lang.isString(json)) {
                filterKeys = Array.prototype.slice.call(arguments);
                json = this;
            } else {
                filterKeys = arguments[1];
                filterKeys = lang.isArray(filterKeys) ? filterKeys : Array.prototype.slice.call(arguments, 1);
            }
            var ret = {};
            array.forEach(filterKeys, function(v) {
                var lastDotIndex = v.lastIndexOf(".");
                if (lastDotIndex !== -1) {
                    if (lastDotIndex !== v.indexOf(".")) {
                        console.warn('Only support filter key like "a" or "a.b", and "a.b.c" which dot number more than 1 is not supported!');
                        return;
                    }
                    var arr = v.split(".");
                    var k = arr[1];
                    ret[k] = json[arr[0]][k];
                }
                ret[v] = json[v];
            });
            return ret;
        };
        this.toQuery = function(keyArr) {
            var obj = this.toJSON.apply(this, arguments);
            var ret = [];
            object.forEach(obj, function(v, k) {
                if (lang.isFunction(v)) {
                    return;
                }
                ret.push(k + "=" + v);
            });
            return ret.join("&");
        };
        this.destroy = function() {
            var me = this;
            this.watcher.unsubscribe();
            object.forEach(this, function(v, k) {
                if (reservedObjMap[k]) {
                    return;
                }
                delete me[k];
            });
        };
    }).call(Model.prototype);
    return Model;
});
/**
 * 后台数据请求助手, 服务于bird.action
 * restful style
 */
define("bird.requesthelper", [ "bird.object", "bird.array", "bird.request", "bird.string" ], function(require) {
    var object = require("bird.object");
    var array = require("bird.array");
    var request = require("bird.request");
    var string = require("bird.string");
    function RequestHelper() {}
    (function() {
        /**
		 * 生成请求后台数据的方法
		 * @param {Object} map
		 * @return {Object}
		 *
		 * 参数的格式:
		 * 完整格式:
		 * {
		 *	"getById": "GET /api/resource/{{id}}",
		 *	"getList": "GET /api/resource",
		 *	"save": "POST /api/resource",
		 *	"update": "PUT /api/resource/{{id}}",//更新属性, IE8不支持PATCH, 故不区分PATCH和PUT
		 *	"removeById": "DELETE /api/resource/{{id}}",
		 *	"remove": "DELETE /api/resource"
		 * }
		 * 或
		 * 简洁格式:
		 * {
		 *	"resource": "/api/resource"
		 * }
		 *
		 * 若为简洁格式, 该方法会自动转换成完整格式
		 * 若既有简洁格式又有完整格式, 则优先使用完整格式的数据
		 */
        this.generateRequestMethods = function(map, modName) {
            var me = this;
            var reqTypeMap = {
                getById: "GET",
                getList: "GET",
                save: "POST",
                update: "PUT",
                //更新属性
                removeById: "DELETE",
                remove: "DELETE"
            };
            object.forEach(reqTypeMap, function(value, key) {
                if (!map[key] && map["resource"] && !me[key]) {
                    map[key] = value + " " + map["resource"];
                    if (/^(?:getById|update|removeById)$/.test(key)) {
                        map[key] += (/\/$/.test(map[key]) ? "" : "/") + "{{id}}";
                    }
                }
            });
            object.forEach(map, function(value, key) {
                if (key === "resource") {
                    return;
                }
                var methodName = key;
                var arr = value.split(/\s+/);
                var reqType = arr && arr[0];
                var url = arr && arr[1];
                if (!reqType) {
                    console.warn("模块: `" + modName + "`, 数据请求方法: `" + key + "` 缺少请求类型!");
                    return;
                }
                if (!url) {
                    console.warn("模块: `" + modName + "`, 数据请求方法: `" + key + "` 缺少请求URL!");
                    return;
                }
                me[methodName] = function(data, completeCallback, errorCallback) {
                    if (/\{\{id\}\}/.test(url)) {
                        url = string.format(url, data);
                        delete data.id;
                    }
                    request.ajax({
                        url: url,
                        data: data,
                        requestType: reqType,
                        responseType: "json",
                        complete: completeCallback,
                        error: errorCallback
                    });
                };
            });
            if (map["save"] && !this.saveOrUpdate) {
                // 有id则为update, 否则为save
                this.saveOrUpdate = function(data, completeCallback, errorCallback) {
                    if (data.id) {
                        this.update(data, completeCallback, errorCallback);
                    } else {
                        this.save(data, completeCallback, errorCallback);
                    }
                };
            }
        };
    }).call(RequestHelper.prototype);
    return RequestHelper;
});
define("bird.router.hashchange", [ "bird.event", "bird.__observer__", "bird.lang", "bird.object" ], function(require) {
    function Router() {
        this.notFoundActionMap = null;
        this.locationMap = {};
    }
    (function() {
        var event = require("bird.event");
        var Observer = require("bird.__observer__");
        var lang = require("bird.lang");
        var object = require("bird.object");
        this.actionObserver = new Observer();
        /*********************************************************************
		 *                             控制器
		 ********************************************************************/
        this.start = function() {
            this.watchHash();
            this.bootFirstUrl();
            console.log("bird.router[use hashChange] started!");
        };
        this.changeHash = function(hash) {
            hash = hash.replace(/^#/, "");
            if (this.lastHash === hash) {
                return;
            }
            location.hash = hash;
        };
        this.getHash = function() {
            var hash = location.hash;
            if (hash) {
                return hash.replace(/^#/, "").replace(/^!/, "") || "/";
            }
            return "/";
        };
        this.watchHash = function() {
            this.lastHash = "";
            var me = this;
            event.addListener(window, "hashchange", function() {
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
            this.location = "";
            this.query = "";
            this.param = null;
            if (aq) {
                this.location = aq[1] || "";
                this.query = aq[2] || "";
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
                var loc = this.location;
                var la = this.locationMap[loc];
                if (!la) {
                    if (/^\/?[^~#!?]+\/[^~#!?]+/.test(loc)) {
                        var lastSlashIndex = loc.lastIndexOf("/");
                        var locPrefix = loc.substring(0, lastSlashIndex + 1) + "{{";
                        var me = this;
                        object.each(this.locationMap, function(v, k) {
                            if (k.indexOf(locPrefix) === 0) {
                                var key = /\{\{([^~#!?{}]+)\}\}/.exec(k);
                                key = key && key[1];
                                var value = loc.substring(lastSlashIndex + 1);
                                me.param = me.param || {};
                                me.param[key] = value;
                                loc = k;
                                return false;
                            }
                        });
                    }
                    if (loc === this.location && this.notFoundActionMap) {
                        //这里需要替换掉历史记录中不存在的hash记录
                        location.replace(location.href.split("#")[0] + "#!" + this.notFoundActionMap.location);
                        return;
                    }
                }
                this.actionObserver.publish(loc, {
                    param: this.param,
                    query: this.query,
                    location: this.location,
                    referrer: this.referrer
                });
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
            lang.nextTick(function() {
                me.handleHashChange();
            });
        };
        this.listenLocation = function(la, handle) {
            if (la.isNotFound) {
                this.notFoundActionMap = la;
            }
            this.locationMap[la.location] = la;
            this.actionObserver.subscribe(la.location, handle);
        };
    }).call(Router.prototype);
    return new Router();
});
define("bird.router.ie7support", [ "bird.event", "bird.browser", "bird.lang", "bird.__observer__", "bird.object" ], function(require) {
    function Router() {
        this.notFoundActionMap = null;
        this.locationMap = {};
    }
    (function() {
        var event = require("bird.event");
        var browser = require("bird.browser");
        var lang = require("bird.lang");
        var Observer = require("bird.__observer__");
        var object = require("bird.object");
        this.actionObserver = new Observer();
        /*********************************************************************
		 *                             控制器
		 ********************************************************************/
        this.start = function() {
            this.init();
            this.watchHash();
            this.bootFirstUrl();
            console.log("bird.router[ie7support] started!");
        };
        this.init = function() {
            var ieVersion = /ie\s*(\d+)/.exec(browser.browser);
            ieVersion = ieVersion && ieVersion[1];
            //IE7及以下版本不支持hash history,即改变hash不会存储到history记录中
            this.isHashHistoryNotSupported = ieVersion && ieVersion < 8;
            var doc = document;
            var documentMode = doc.documentMode;
            this.isHashChangeSupported = "onhashchange" in window && (lang.isUndefined(documentMode) || documentMode > 7);
            this.needIframeHistory = !this.isHashChangeSupported || this.isHashHistoryNotSupported;
            if (this.needIframeHistory) {
                this.HISTORY_IFRAME_URL = "./js/lib/bird/mvvm/__history__.html";
                var iframe = doc.createElement("IFRAME");
                iframe.src = this.HISTORY_IFRAME_URL + "?" + this.getHash();
                iframe.style.display = "none";
                iframe.style.position = "absolute";
                iframe.style.left = "-9999px";
                iframe.style.top = "-9999px";
                iframe.width = "0";
                iframe.height = "0";
                iframe.scrolling = "no";
                doc.body.insertBefore(iframe, doc.body.firstChild);
                this.historyIframe = iframe;
                iframe = iframeWindow = ieVersion = null;
            }
        };
        this.changeHash = function(hash) {
            if (this.lastHash === hash) {
                return;
            }
            if (this.needIframeHistory) {
                this.changeIframeUrl(hash);
            } else {
                location.hash = hash;
            }
        };
        this.changeIframeUrl = function(hash) {
            //this.historyIframe.src = this.historyIframe.src.replace(/\?.*/,'') + '?' + hash;
            this.historyIframe.contentWindow.location.href = this.HISTORY_IFRAME_URL + "?" + hash;
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
                return hash.replace(/^#/, "").replace(/^!/, "") || "/";
            }
            return "/";
        };
        this.getIframeHash = function() {
            var hashes = /\?(.+)/.exec(this.historyIframe.contentWindow.location.href);
            return hashes && hashes[1] || "/";
        };
        this.watchHash = function() {
            this.lastHash = "";
            var me = this;
            if (this.needIframeHistory) {
                //iframe.onload的形式挂载回调函数在某些浏览器（如IE7）不能被正常的触发
                event.addListener(this.historyIframe, "load", function(e) {
                    var hash = me.getIframeHash();
                    if (!hash) {
                        hash = "/";
                    }
                    location.hash = hash;
                    me.handleHashChange(hash);
                });
            } else {
                event.addListener(window, "hashchange", function() {
                    me.handleHashChange();
                });
            }
            /*
			 * IE7及以下版本浏览器不支持onhashchange事件,那么针对用户在浏览器地址栏修改hash的行为无法给出正确的响应,
			 * 这里使用'定时器轮询'来检测并给出响应
			 */
            if (!this.isHashChangeSupported) {
                if (this.hashPollInterval) {
                    clearInterval(this.hashPollInterval);
                    this.hashPollInterval = null;
                }
                this.hashPollInterval = setInterval(function() {
                    me.changeHash(me.getHash());
                }, 100);
            }
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
            this.location = "";
            this.query = "";
            this.param = null;
            if (aq) {
                this.location = aq[1] || "";
                this.query = aq[2] || "";
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
                var loc = this.location;
                var la = this.locationMap[loc];
                if (!la) {
                    if (/^\/?[^~#!?]+\/[^~#!?]+/.test(loc)) {
                        var lastSlashIndex = loc.lastIndexOf("/");
                        var locPrefix = loc.substring(0, lastSlashIndex + 1) + "{{";
                        var me = this;
                        object.each(this.locationMap, function(v, k) {
                            if (k.indexOf(locPrefix) === 0) {
                                var key = /\{\{([^~#!?{}]+)\}\}/.exec(k);
                                key = key && key[1];
                                var value = loc.substring(lastSlashIndex + 1);
                                me.param = me.param || {};
                                me.param[key] = value;
                                loc = k;
                                return false;
                            }
                        });
                    }
                    if (loc === this.location && this.notFoundActionMap) {
                        this.route("!" + this.notFoundActionMap.location);
                        return;
                    }
                }
                this.actionObserver.publish(loc, {
                    param: this.param,
                    query: this.query,
                    location: this.location,
                    referrer: this.referrer
                });
            }
        };
        this.route = function(url, isNotHash) {
            if (isNotHash && !/^#/.test(url)) {
                window.location.href = url;
            } else {
                this.changeHash(url.replace(/^#/, ""));
            }
        };
        this.bootFirstUrl = function() {
            var me = this;
            lang.nextTick(function() {
                me.handleHashChange();
            });
        };
        this.listenLocation = function(la, handle) {
            if (la.isNotFound) {
                this.notFoundActionMap = la;
            }
            this.locationMap[la.location] = la;
            this.actionObserver.subscribe(la.location, handle);
        };
    }).call(Router.prototype);
    return new Router();
});
define("bird.router", [ "./bird.router.pushstate", "./bird.router.hashchange" ], function(require) {
    return history.pushState ? require("./bird.router.pushstate") : require("./bird.router.hashchange");
});
define("bird.router.pushstate", [ "bird.event", "bird.__observer__", "bird.lang", "bird.object" ], function(require) {
    function Router() {
        this.notFoundActionMap = null;
        this.locationMap = {};
    }
    (function() {
        var event = require("bird.event");
        var Observer = require("bird.__observer__");
        var lang = require("bird.lang");
        var object = require("bird.object");
        this.actionObserver = new Observer();
        /*********************************************************************
		 *                             控制器
		 ********************************************************************/
        this.start = function() {
            this.watchLocation();
            this.bootFirstUrl();
            console.log("bird.router[use pushState] started!");
        };
        this.changeLocation = function(loc) {
            loc = loc.replace(/^#!/, "");
            if (this.lastLocation === loc) {
                return;
            }
            loc = loc.indexOf("?") === 0 ? loc : "?" + loc;
            history.pushState({
                loc: loc
            }, null, location.pathname + loc);
            this.handleLocationChange(loc);
        };
        this.getLocation = function() {
            if (history.state && history.state.loc) {
                return history.state.loc;
            }
            var loc = location.search;
            return loc || "?/";
        };
        this.watchLocation = function() {
            this.lastLocation = "";
            var me = this;
            event.addListener(window, "popstate", function(e) {
                e.preventDefault();
                var loc = e.state && e.state.loc;
                me.handleLocationChange(loc);
            });
            event.delegate("a", "click", function(e) {
                var hrefAttrValue = e.target.getAttribute("href");
                if (hrefAttrValue && hrefAttrValue.indexOf("#!") === 0) {
                    e.preventDefault();
                    hrefAttrValue = hrefAttrValue.replace(/^#!/, "");
                    if (hrefAttrValue.indexOf("?") === -1) {
                        hrefAttrValue = "?" + hrefAttrValue;
                    }
                    me.handleLocationChange(hrefAttrValue);
                }
            }, document);
        };
        this.handleLocationChange = function(loc) {
            loc = loc || this.getLocation();
            if (this.lastLocation !== loc) {
                this.referrer = this.lastLocation;
                this.lastLocation = loc;
                if (!history.state || history.state.loc != loc) {
                    history.pushState({
                        loc: loc
                    }, "", loc);
                }
                this.parseActionQueryParam();
                this.callModule();
            }
        };
        this.parseActionQueryParam = function() {
            var aq = /([^!~=&?]+)(?:~([^~?]*))?/.exec(this.lastLocation);
            this.location = "";
            this.query = "";
            this.param = null;
            if (aq) {
                this.location = aq[1] || "";
                this.query = aq[2] || "";
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
                var loc = this.location;
                var la = this.locationMap[loc];
                if (!la) {
                    if (/^\/?[^~#!?]+\/[^~#!?]+/.test(loc)) {
                        var lastSlashIndex = loc.lastIndexOf("/");
                        var locPrefix = loc.substring(0, lastSlashIndex + 1) + "{{";
                        var me = this;
                        object.each(this.locationMap, function(v, k) {
                            if (k.indexOf(locPrefix) === 0) {
                                var key = /\{\{([^~#!?{}]+)\}\}/.exec(k);
                                key = key && key[1];
                                var value = loc.substring(lastSlashIndex + 1);
                                me.param = me.param || {};
                                me.param[key] = value;
                                loc = k;
                                return false;
                            }
                        });
                    }
                    if (loc === this.location && this.notFoundActionMap) {
                        //这里需要替换掉历史记录中不存在的location记录
                        var search = "?" + this.notFoundActionMap.location;
                        history.replaceState({
                            loc: search
                        }, null, location.pathname + search);
                        this.handleLocationChange(search);
                        return;
                    }
                }
                this.actionObserver.publish(loc, {
                    param: this.param,
                    query: this.query,
                    location: this.location,
                    referrer: this.referrer
                });
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
            lang.nextTick(function() {
                me.handleLocationChange();
            });
        };
        this.listenLocation = function(la, handle) {
            if (la.isNotFound) {
                this.notFoundActionMap = la;
            }
            this.locationMap[la.location] = la;
            this.actionObserver.subscribe(la.location, handle);
        };
    }).call(Router.prototype);
    return new Router();
});
/**
 * 该模块用来解析html模板
 * 为DataBind提供支持
 *
 */
define("bird.tplparser", [ "bird.dom", "bird.lang", "bird.array", "bird.event", "bird.object", "bird.string", "bird.util" ], function(require) {
    var dom = require("bird.dom");
    var lang = require("bird.lang");
    var array = require("bird.array");
    var event = require("bird.event");
    var object = require("bird.object");
    var string = require("bird.string");
    var util = require("bird.util");
    function TplParser() {
        this.parsedInfoCache = {};
        this.parsedTpl = "";
    }
    (function() {
        var literalAttrs = [ "id" ];
        //valueVariable是用来为checkbox 、radio 、select服务的
        //这三个控件的value通常作为固定选项值存在
        var variableAttrs = [ "class", "src", "href", "value", "valueVariable", "style", "type", "alt", "for", "readonly", "disabled", "checked", "selected", "placeholder" ];
        var parseFunctionNames = [ "_parseInlineEvents", "_parseCustomAttr" ];
        var regExpMap = {
            htmlStartTag: /<([a-zA-Z]+\d*)([^>]*?)\/?>/g,
            //$1: tagName, $2: propertyStrs
            htmlEndTag: /<\/[a-zA-Z]+\d*>/,
            innerText: /<([a-zA-Z]+\d*)\s*([^>]*?)>(?:[^<>]*?)(\{\{[^<>{}]+?\}\})(?:[^<>]*?)<\/\1>/g,
            hasVariable: /\{\{[^{}]+\}\}/
        };
        this._extendParseFunctionName = function(literalAttrs, variableAttrs, parseFunctionNames) {
            array.forEach(literalAttrs.concat(variableAttrs), function(val) {
                parseFunctionNames.push("_parse" + string.capitalize(val));
            });
        };
        this._generateLiteralAttrRegExp = function(literalAttrs, regExpMap) {
            array.forEach(literalAttrs, function(val) {
                regExpMap[val] = new RegExp("\\s+" + val + "(?:=(['\"])\\s*((?:.|\\n|\\r)+?)\\s*\\1)?", "i");
            });
        };
        this._generateVariableAttrRegExp = function(variableAttrs, regExpMap) {
            array.forEach(variableAttrs, function(val) {
                regExpMap[val] = new RegExp("\\s+" + val + "=(['\"])\\s*((?:.|\\n|\\r)*?)\\s*\\1", "i");
            });
        };
        this._generateLiteralParser = function(literalAttrs) {
            var me = this;
            array.forEach(literalAttrs, function(val) {
                me["_parse" + string.capitalize(val)] = function(str, parsedInfoCache) {
                    var arr = regExpMap[val].exec(str);
                    if (arr && arr[2]) {
                        parsedInfoCache[val] = arr[2];
                    }
                };
            });
        };
        this._generateVariableParser = function(variableAttrs) {
            var me = this;
            array.forEach(variableAttrs, function(val) {
                me["_parse" + string.capitalize(val)] = function(str, parsedInfoCache) {
                    var arr = regExpMap[val].exec(str);
                    if (arr) {
                        var varAndFilter = this._parsePlaceholderVariableAndFilter(arr[2]);
                        if (varAndFilter) {
                            var vari = varAndFilter[1];
                            var filter = varAndFilter[2];
                            if (vari) {
                                var parsedInfo = parsedInfoCache[val] = {
                                    variable: vari
                                };
                                filter && (parsedInfo.filter = filter);
                            }
                        }
                    }
                };
            });
        };
        this._extendParseFunctionName(literalAttrs, variableAttrs, parseFunctionNames);
        this._generateLiteralAttrRegExp(literalAttrs, regExpMap);
        this._generateVariableAttrRegExp(variableAttrs, regExpMap);
        this._generateLiteralParser(literalAttrs);
        this._generateVariableParser(variableAttrs);
        this.parseTpl = function(str) {
            str = string.removeHtmlComments(str);
            this.parsedTpl = string.removeSpaceBetweenTags(str);
            this._parseHtmlProperties();
            this._parseTextContent();
            return this.parsedTpl;
        };
        this._parseHtmlProperties = function() {
            var arr, tagName, propertyStr;
            while (arr = regExpMap.htmlStartTag.exec(this.parsedTpl)) {
                tagName = arr[1];
                propertyStr = arr[2];
                if (regExpMap.hasVariable.test(propertyStr)) {
                    var idArr = /id=(['"])(.+?)\1/i.exec(propertyStr);
                    var id = idArr && idArr[2] || util.uuid("bind_");
                    var parsedInfo = this.parsedInfoCache[id] = {
                        id: id,
                        tagName: tagName
                    };
                    this._compilePropertyTplStr(propertyStr, parsedInfo, arr[0]);
                }
            }
        };
        this._parseTextContent = function() {
            var arr, parsedInfo, idArr;
            while (arr = regExpMap.innerText.exec(this.parsedTpl)) {
                tagName = arr[1];
                propertyStr = arr[2];
                if (!/id=/i.test(propertyStr)) {
                    var uuid = util.uuid("bind_");
                    parsedInfo = this.parsedInfoCache[uuid] = {
                        tagName: tagName,
                        id: uuid
                    };
                    this._addBindIdToHtmlStartTag(arr[0], uuid);
                } else if (idArr = /id=(['"])(.+?)\1/i.exec(propertyStr)) {
                    var id = idArr[2];
                    if (id) {
                        parsedInfo = this.parsedInfoCache[id];
                        if (!parsedInfo) {
                            parsedInfo = this.parsedInfoCache[id] = {
                                tagName: tagName,
                                id: id
                            };
                        }
                    }
                }
                var varAndFilter = this._parsePlaceholderVariableAndFilter(arr[3]);
                if (varAndFilter && varAndFilter[1]) {
                    parsedInfo.htmlText = {
                        variable: varAndFilter[1],
                        //元素内容默认用innerHtml渲染model,但textarea是特例除外
                        filter: varAndFilter[2] || (/^textarea$/i.test(tagName) ? "text" : "html")
                    };
                }
            }
        };
        this._compilePropertyTplStr = function(propertyStr, parsedInfo, matchedStr) {
            var me = this;
            if (propertyStr) {
                propertyStr.replace(/\s+([a-z][a-z0-9_\-$]*=(['"])\s*(?:.|\n|\r)*?\s*\2)/gi, function(m, prop) {
                    if (regExpMap.hasVariable.test(prop) && /\=/.test(prop)) {
                        var propKey = prop.split("=")[0];
                        var fn = /^on/i.test(propKey) ? me._parseInlineEvents : me["_parse" + string.capitalize(propKey)];
                        if (lang.isFunction(fn)) {
                            fn.call(me, propertyStr, parsedInfo);
                        } else {
                            me.parseUnregisterProperty(propKey, propertyStr, parsedInfo);
                        }
                    }
                });
            }
            if (!/\s+id=/i.test(matchedStr)) {
                this._addBindIdToHtmlStartTag(matchedStr, parsedInfo.id);
            }
        };
        this._addBindIdToHtmlStartTag = function(tagStr, id) {
            var str, arr;
            var tagNoPropRE = /^(<[a-z]+\d*)(\/?>(?:.|\n|\r)*)/i;
            var tagWithPropRE = /^(<[a-z]+\d*)(\s+(?:.|\n|\r)*\/?>)/i;
            if (arr = tagNoPropRE.exec(tagStr) || tagWithPropRE.exec(tagStr)) {
                str = arr[1] + ' id="' + id + '"' + arr[2];
            }
            this.parsedTpl = this.parsedTpl.replace(tagStr, str);
        };
        this._parsePlaceholderVariableAndFilter = function(text) {
            var placeholderVarWithFilterRE = /^\s*\{\{\s*([^{}|]+?)(?:\s*\|\s*([^{}|]+))?\s*\}\}/;
            return placeholderVarWithFilterRE.exec(text);
        };
        //不再使用第一个class作为选择器,而是采用动态添加id(唯一性),根据id查找元素
        this._parseClass = function(str, parsedInfo) {
            var arr = regExpMap["class"].exec(str);
            if (arr) {
                var className = arr[2];
                var classVarNames = this._getVariableNames(className);
                if (classVarNames && classVarNames.length) {
                    parsedInfo["class"] = [];
                    array.forEach(classVarNames, function(classVar) {
                        parsedInfo["class"].push({
                            variable: classVar
                        });
                    });
                }
            }
        };
        this._parseInlineEvents = function(str, parsedInfo) {
            var ret = [];
            var inlineEventRE = /\bon([a-z]+)=(['"])(?:[^'"{}]+?\s*)*\s*\{\{([a-z_$][a-z0-9_$().:]*?)\}\}\s*(?:[^'"{}]+?\s*)*\2/gi;
            var arr;
            while (arr = inlineEventRE.exec(str)) {
                ret.push({
                    key: arr[1],
                    //key ==> eventType
                    variable: arr[3]
                });
            }
            ret.length && (parsedInfo.event = ret);
        };
        this._parseCustomAttr = function(str, parsedInfo) {
            var ret = [];
            var customAttrRE = /(data-[a-z0-9$]+)=(['"])\s*\{\{([a-z_$][a-z0-9_$]*?)\}\}\s*\2/gi;
            var arr;
            while (arr = customAttrRE.exec(str)) {
                ret.push({
                    key: arr[1],
                    //key ==> attributeName
                    variable: arr[3]
                });
            }
            ret.length && (parsedInfo.customAttr = ret);
        };
        this._parseStyle = function(str, parsedInfo) {
            var arr = regExpMap.style.exec(str);
            if (arr) {
                var styleVarName = this._getOnlyOneVariableName(arr[2]);
                if (styleVarName) {
                    parsedInfo.style = {
                        variable: styleVarName
                    };
                    return;
                }
                var styleKeyValueVarMaps = this._getKeyValueVariableNames(arr[2]);
                styleKeyValueVarMaps && styleKeyValueVarMaps.length && (parsedInfo.style = styleKeyValueVarMaps);
            }
        };
        this._getVariableNames = function(str) {
            var ret = [];
            var variableNameRE = /\{\{\s*([^{}]+)\s*\}\}/g;
            var arr;
            while (arr = variableNameRE.exec(str)) {
                ret.push(arr[1]);
            }
            return ret;
        };
        this._getOnlyOneVariableName = function(str) {
            var onlyOneVariableNameRE = /^\s*\{\{\s*([^{}]+)\s*\}\}\s*$/;
            var arr = onlyOneVariableNameRE.exec(str);
            return arr && arr[1];
        };
        this._getKeyValueVariableNames = function(str) {
            var ret = [];
            var keyValueVariableNameRE = /([^:;{}]+)\s*:\s*\{\{\s*([^{};:]+)\s*\}\}/g;
            var arr;
            while (arr = keyValueVariableNameRE.exec(str)) {
                ret.push({
                    key: arr[1],
                    //stylePropertyName
                    variable: arr[2]
                });
            }
            return ret;
        };
        this.parseUnregisterProperty = function(val, str, parsedInfoCache) {
            var reg = new RegExp("\\s+" + val + "=(['\"])\\s*((?:.|\\n|\\r)*?)\\s*\\1", "i");
            var arr = reg.exec(str);
            if (arr) {
                var varAndFilter = this._parsePlaceholderVariableAndFilter(arr[2]);
                if (varAndFilter) {
                    var vari = varAndFilter[1];
                    var filter = varAndFilter[2];
                    if (vari) {
                        var parsedInfo = parsedInfoCache[val] = {
                            variable: vari
                        };
                        filter && (parsedInfo.filter = filter);
                    }
                }
            }
        };
        this.destroy = function() {
            object.forEach(this.parsedInfoCache, function(v, k, cache) {
                delete cache[k];
            });
            this.parsedTpl = "";
        };
    }).call(TplParser.prototype);
    return TplParser;
});
define("bird.validator", [ "bird.lang", "bird.array", "bird.object" ], function(require) {
    var lang = require("bird.lang");
    var array = require("bird.array");
    var object = require("bird.object");
    function Validator() {}
    (function() {
        var messageStack = [];
        var messageMap = {
            required: "请输入",
            number: "只能输入数字"
        };
        var ruleMap = {
            required: function(value) {
                var ret = lang.isNotEmpty(value);
                if (!ret) {
                    messageStack.push(messageMap["required"]);
                }
                return ret;
            },
            number: function(value) {
                var ret = !isNaN(+value);
                if (!ret) {
                    messageStack.push(messageMap["number"]);
                }
                return ret;
            }
        };
        this.getRule = function(ruleName) {
            return ruleMap[ruleName];
        };
        this.getMessageStack = function() {
            return messageStack;
        };
        this.clearMessageStack = function() {
            messageStack.length = 0;
        };
        /**
		 * @param {Object|Array}
		 *
		 * {
		 *		name: 'required',
		 *		handle: function(){...},
		 *		message: '请输入'
		 * }
		 */
        this.addValidator = function(v) {
            if (lang.isPlainObject(v)) {
                ruleMap[v.name] = v.handle;
                messageMap[v.name] = v.message;
            } else if (lang.isArray(v)) {
                var _arguments = arguments;
                array.forEach(v, function(_v) {
                    _arguments.callee(_v);
                });
            }
        };
    }).call(Validator.prototype);
    return new Validator();
});
define("errorTrack", [ "bird.event", "bird.object", "bird.dom", "bird.browser", "bird.array", "bird.request" ], function(require) {
    var event = require("bird.event");
    var object = require("bird.object");
    var dom = require("bird.dom");
    var browser = require("bird.browser");
    var array = require("bird.array");
    var request = require("bird.request");
    var clickPathList = [];
    var lastClickData;
    var config = {
        url: "",
        maxClickpathLength: 10
    };
    return {
        init: function(param) {
            object.extend(config, param);
            var me = this;
            event.addListener(document.body, "click", function(e) {
                var target = e.target;
                if (target.nodeType !== 1) {
                    return;
                }
                lastClickData = {
                    id: target.id,
                    tagName: target.tagName,
                    path: dom.getTreePath(target),
                    url: location.href,
                    className: target.className,
                    value: target.value || "",
                    text: target.textContent || target.innerText || "",
                    src: target.src || ""
                };
                clickPathList.length === config.maxClickpathLength && clickPathList.shift();
                clickPathList.push(lastClickData);
            }, true);
            event.addListener(window, "error", function(e) {
                me.send(me.getErrorInfo(e));
                me.clear();
            });
            console.log("ErrorTrack Module Inited!");
        },
        clear: function() {
            clickPathList = [];
            if (lastClickData) {
                clickPathList.push(lastClickData);
                lastClickData = null;
            }
        },
        send: function(obj, callback) {
            request.imageGet(config.url + JSON.stringify(obj), callback);
        },
        getErrorInfo: function(e) {
            return {
                error: {
                    lineNumber: e.lineno || e.errorLine,
                    fileName: e.filename || e.errorUrl,
                    columnNumber: e.colno || e.errorCharacter,
                    message: e.message || e.errorMessage,
                    stack: e.error && e.error.stack || ""
                },
                clickpath: clickPathList,
                browser: browser.browser,
                callee: arguments.callee.toString()
            };
        }
    };
});