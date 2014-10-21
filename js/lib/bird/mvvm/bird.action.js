/**
 * 所有业务Action的基类,定义了一个Action应该包含的一系列接口
 * 所有业务子Action必须继承该类
 */

define(function(require) {

	var Q = require('q');
	var object = require('bird.object');
	var lang = require('bird.lang');
	var dom = require('bird.dom');
	var array = require('bird.array');
	var event = require('bird.event');
	var util = require('bird.util');
	var request = require('bird.request');
	var Model = require('./bird.model');
	var DataBind = require('./bird.databind');
	var globalContext = require('./bird.globalcontext');
	var validator = require('./bird.validator');
	var Observer = require('bird.__observer__');


	function Action() {
		this.id = util.uuid('action_');
		this.model = new Model();
		this.watcher = new Observer();
		this.dataBind = new DataBind();
		this.args = {};
		this.actionUrlMap = {};
		this.urlActionMap = {};
		this.requestDataCache = {};
		this.dataRequestPromise = null;
		this.lifePhase = this.LifeCycle.NEW;

		this.init();
	}

	Action.setContainer = function(container) {
		Action.prototype.container = lang.isString(container) ? document.getElementById(container) : container;
	};

	(function() {

		this.LifeCycle = {
			'NEW': 0,
			'INITED': 1,
			'MODEL_BOUND': 2,
			'RENDERED': 3,
			'EVENT_BOUND': 4,
			'DESTROYED': 5
		};

		this.tpl = '';

		this.container = document.getElementById('Container');

		this.init = function() {
			var me = this;
			/* model的set接口逻辑本不该放在这里定义（覆盖原set接口）
			 * 但这里需要用到watcher去通知更新dom元素
			 * 为了保证model的纯粹性,这里重新定义set接口
			 * 这里说的纯粹性是指model里的属性除了几个暴露在外的接口,其他的都是action业务上的数据（即要和后台交互或与页面展现相关的数据）
			 */
			this.model.set = function(key, value) {
				var _key = key;
				var lastDotIndex = _key.lastIndexOf('.');
				var obj;
				if(lastDotIndex === -1){
					obj = this;
				}else{
					obj = lang.getObjectInContext(_key.substring(0, lastDotIndex), this);
					_key = _key.substring(lastDotIndex + 1, _key.length);
				}
				var oldValue = obj[_key];
				if (oldValue === value) {
					return;
				}
				obj[_key] = value;
				obj = null;
				var argArr = [key, value, oldValue, arguments[arguments.length - 1]];
				me.watcher.publish.apply(me.watcher, argArr);
				argArr = null;
			};

			this.lifePhase = this.LifeCycle.INITED;
		};

		this.initRequestURL = function(map) {
			if (!lang.isPlainObject(map)) {
				return;
			}
			this.actionUrlMap = map;
			var me = this;
			object.forEach(this.actionUrlMap, function(url, action) {
				me.urlActionMap[url] || (me.urlActionMap[url] = []);
				me.urlActionMap[url].push(action);
			});
		};


		this.requestData = function() {
			var me = this;
			var deferred;
			var promiseArr = [];

			if (lang.isNotEmpty(this.urlActionMap)) {
				object.forEach(this.urlActionMap, function(actions, url) {
					deferred = Q.defer();
					(function(deferred) {
						request.get(url, me.argMap, function(data) {
							array.forEach(actions, function(action) {
								me.requestDataCache[action] = data;
							});
							deferred.resolve();
						});
					})(deferred);
					promiseArr.push(deferred.promise);
				});
			} else {
				deferred = Q.defer();
				deferred.resolve();
				promiseArr.push(deferred.promise);
			}

			this.dataRequestPromise = Q.all(promiseArr);
		};

		//子类可以覆盖该接口
		this.initModel = function(modelReference, watcherReference) {
			/**
			 * 通过往modelReference上挂载属性的方式修改action.model,如：
			 * modelReference.name = 'liwei';
			 * modelReference.email = '383523223@qq.com';
			 * modelReference.company = 'Baidu';
			 */

		};

		this._initModel = function(args) {

			this.initModel(this.model, this.watcher);
			this.lifePhase = this.LifeCycle.MODEL_BOUND;
		};

		/**
		 * @deprecated
		 * 请使用$.set()
		 */
		this.setToModel = function(key, value) {
			this.model.set(key, value, this.dataBind);
		};

		/**
		 * @deprecated
		 * 请使用$.toJSON()
		 */
		this.getModelObject = function() {
			var ret = {};
			object.forEach(this.model, function(v, k) {
				if (lang.isFunction(v)) {
					return;
				}
				ret[k] = v;
			});
			return ret;
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
			this.dataBind.bind(this.model, this.watcher, this.container);
		};

		/*
		 * 为动态插入的模板应用双向绑定
		 * 一个Action对应一个根容器,即使这里的container非根容器,它也必须是根容器的子节点,所以这里可以把事件绑定在根容器上
		 * @public
		 */
		this.applyBind = function(tpl, container, append){
			if(!tpl || !container){
				return;
			}
			var dataBind = new DataBind();

			dataBind.parseTpl(tpl);
			var html = dataBind.fillTpl(this.model, this.id);
			if(lang.isFunction(append)){
				append(html, container);
			} else if(append){
				dom.appendTo(html, container);
			} else {
				container.innerHTML = html;
			}
			//绑定事件处理逻辑到该Action的根容器上
			dataBind.bind(this.model, this.watcher, this.container);
		};

		//子类可以覆盖该接口,自定义事件绑定逻辑
		this.bindEvent = function() {

		};

		this._bindEvent = function() {
			this.bindEvent();
			this.lifePhase = this.LifeCycle.EVENT_BOUND;
		};

		//子类可以覆盖该接口,用来修改从服务器端获取的数据的结构以满足页面控件的需求
		this.beforeRender = function(modelReference) {

		};


		this.render = function() {
			var me = this;
			object.forEach(this.requestDataCache, function(value, key) {
				me.model.set(key, value);
			});

			this.lifePhase = this.LifeCycle.RENDERED;
		};

		//子类可以覆盖该接口,可能用来修改一些元素的状态等善后操作
		this.afterRender = function(modelReference, watcherReference) {

		};

		this.loadTpl = function() {
			var deferred = Q.defer();
			if (!this.tplUrl || this.tpl) {
				deferred.resolve();
			} else {
				var me = this;
				request.get(this.tplUrl + '?' + new Date().getTime(), function(data) {
					me.constructor.prototype.tpl = data;
					deferred.resolve();
				});
			}

			this.tplRequestPromise = deferred.promise;
		};


		this.enter = function(args) {
			var me = this;
			this.args = args;
			this.initRequestURL();
			this._initModel();
			this.requestData();
			this.loadTpl();
			this.tplRequestPromise.then(function() {
				//根据Action的变化更新浏览器标题栏
				document.title = me.title || '';

				me._applyBind();

				if (me.lifePhase < me.LifeCycle.EVENT_BOUND) {
					me._bindEvent();
				}

				me.dataRequestPromise.spread(function() {
					me.beforeRender(me.model);
					me.render();
					me.afterRender(me.model, me.watcher);
				}).done();
			}).done();
		};

		//子类可以覆盖该接口,离开Action之前释放一些内存和解绑事件等等
		this.beforeLeave = function() {

		};

		this.leave = function(nextAction) {
			globalContext.remove(this.id);
			validator.clearMessageStack();
			this.watcher.unsubscribe();
			event.destroyPropertyChangeEvents();

			this.dataBind.destroy();
			this.model.destroy();
			this.beforeLeave();
			//解决ie8等浏览器切换action时页面闪动的问题
			if (nextAction && nextAction.container !== this.container) {
				dom.empty(this.container);
			}
			this.lifePhase = this.LifeCycle.DESTROYED;
		};

	}).call(Action.prototype);

	return Action;
});