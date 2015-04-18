/**
 *	封装LRU cache为独立模块
 */
define(function(require) {
	var object = require('./bird.object');
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
			return (this.trim(text) == "");

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

		} /* </ validArguments > */


	}; /* </ utilities > */



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

				maxsize: 1000, // Default Cache size 
				records: {}, // list of all records
				recordsIndex: [], // list of the Indexes of all records

				slidingExpire: null, // timestamp : setting the sliding Expire of the Cache , a get action extends the sliding Expire
				slidingExpireSecond: null, // seconds

				absoluteExpire: null, // timestamp : setting the absolute Expire of the Cache
				absoluteExpireSecond: null, // seconds 

				lastAccessed: new Date().getTime(), // timestamp : record the timestamp , when the cache is last accessed
				created: new Date().getTime(), // timestamp : record the timestamp , when the cache is created	
				callback: function() {}

			},
			cpa = cachePrivateActions; // assigning cachePrivateActions to cpa just for having a short variable toyse



		// Setting Cache Sliding Expire
		cpa._setSlidingExpire = function(slidingExpire) {

			this.slidingExpireSecond = slidingExpire;
			this.slidingExpire = this.lastAccessed + (slidingExpire * 1000);

		};



		// Setting Cache Absolute Expire
		cpa._setAbsoluteExpire = function(absoluteExpire) {

			this.absoluteExpireSecond = absoluteExpire;
			this.absoluteExpire = this.lastAccessed + (absoluteExpire * 1000);

		};



		// Check if Cache is Full . 
		cpa._isFull = function() {

			return (this._getMaxSize() == this._usedSize())

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

			this._pushRecord(key, value, this.recordsIndex.push(key) - 1, options)

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

				this.records[key].absoluteExpire = this.records[key].lastAccessed + (options.absoluteExpire * 1000);
				this.records[key].absoluteExpireSecond = options.absoluteExpire;

			}

			// updating sliding Expire if it is Set
			if (!utilities.isEmpty(options.slidingExpire) && options.slidingExpire >= 1) {


				if (!this.records[key].absoluteExpire || (this.records[key].absoluteExpire && this.records[key].absoluteExpire > options.slidingExpire)) {

					this.records[key].slidingExpire = this.records[key].lastAccessed + (options.slidingExpire * 1000);
					this.records[key].slidingExpireSecond = options.slidingExpire;
				}

			}

			// setting our callback function to our record Object
			if (options.callback && typeof options.callback == 'function') {

				this.records[key].callback = options.callback;

			}

		};


		/*
		 *
		 * Remove the Oldest Record
		 *
		 */
		cpa._removeOldestRecord = function() {

			var index = this.recordsIndex.length - 1,
				key = this.recordsIndex[index];
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
				return false
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

			record.lastAccessed = new Date().getTime(); // record has been accessed
			this.lastAccessed = new Date().getTime(); // Cache  has been accessed
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


			record.slidingExpire = record.lastAccessed + (record.slidingExpireSecond * 1000);

		};


		/*
		 *
		 * when the cache is used again update the sliding expire for the cache
		 * basically it will reset the sliding expire
		 *
		 */
		cpa._updateCacheSlidingExpire = function() {

			if (this.slidingExpire && this.slidingExpire >= 1) {

				this.slidingExpire = this.lastAccessed + (this.slidingExpireSecond * 1000);

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
			this.slidingExpire = null; // setting the sliding Expire of the Cache , an get action extends the sliding Expire
			this.slidingExpireSecond = null;
			this.absoluteExpire = null; // setting the absolute Expire of the Cache
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

				} /* </ if record.expire > */

			} /* </ for > */


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
			var record = object.create(record);
			record.key = key;
			record.type = type;
			switch (type) {

				case "absoluteExipreRecord":
					record.message = 'Absolute Expired : record  ' + key + ' is removed from the cache';
					break;

				case "slidingExipreRecord":
					record.message = 'Sliding Expired : record  ' + key + ' is removed from the cache ';
					break;


				case "flush":
					record.message = 'Flushed : record  ' + key + ' is removed from the cache cause the cache was flushed';
					break;

				case "noSpace":
					record.message = 'No Space : record  ' + key + ' is removed from the cache cause the cache was full';
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

				this._callback('absoluteExipreCache');
				return true;
			}

			if (this.slidingExpire != null && this.slidingExpire < now) {

				this._callback('slidingExipreCache');
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
					data.message = 'cache is expired ( Absolute Expire Cache )';
					break;

				case "slidingExipreCache":
					data.message = 'cache is expired ( Sliding Expire Cache )';
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

					cpa._push(key, value, options)

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


				if (options.callback && typeof options.callback == 'function') {

					cpa._setCallback(options.callback);

				}

			}


		}; /*  </ cachePublicActions > */


	} /*  </ Cache.__construct > */

	return Cache;

});