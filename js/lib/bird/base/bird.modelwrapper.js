/**
 * @deprecated
 * 请使用mvvm/bird.model.js, mvvm/bird.databind.js
 */
define(function(require){

	function ModelWrapper(){
		this.modelCounter = 1;
		this.modelManager = {
			map: {},
			collection: []
		};
	}

	(function() {
		var lang = require('./bird.lang');
		var string = require('./bird.string');
		var util = require('./bird.util');
		var observer = require('./bird.observer');
		/*********************************************************************
		 *                             model封装
		 ********************************************************************/
		
		/**
		 * 为model添加访问器及其set方法的切点
		 * 如果属性为Object,则会去比较Object中各元属性的值是否变化
		 */
		this.addAccessor = function(model, cutFnMap) {
			var modelId
			if (!model['__modelId__']) {
				modelId = '$model_' + this.modelCounter++;
				model['__modelId__'] = modelId;
				this.modelManager.map[modelId] = model;
				model.propChannel = function(prop) {
					return this['__modelId__'] + '@' + prop;
				}
			} else {
				modelId = model['__modelId__'];
			}

			util.each(model, function(val, prop, mdl) {
				if (!lang.isFunction(val)) {
					var _prop = string.capitalize(prop);
					if (!lang.isFunction(mdl['set' + _prop]) && !lang.isFunction(mdl['get' + _prop])) {
						mdl['set' + _prop] = function(newValue) {
							var oldValue = this[prop];
							var cutfn = cutFnMap && cutFnMap[prop];
							this[prop] = newValue;
							//当为object或array时,只要引用地址不同，就切入
							if ((lang.isPlainObject(oldValue) && lang.isPlainObject(newValue) || lang.isArray(oldValue) && lang.isArray(newValue)) && oldValue !== newValue) {
								if (cutfn) {
									cutfn(newValue, oldValue);
								}
								observer.publish(mdl.propChannel(prop), newValue, oldValue);
								oldValue = cutfn = null;
								return;
							}
							if (newValue != oldValue) {
								if (cutfn) {
									cutfn(newValue, oldValue);
								}
								observer.publish(mdl.propChannel(prop), newValue, oldValue);
							}
							oldValue = cutfn = null;
						};
						mdl['get' + _prop] = function() {

							return this[prop];
						};
					}
				}
			});

		};



		this.wrapModel = function(model, type, cutFnMap) {
			if (lang.isPlainObject(type)) {
				cutFnMap = type;
				type = '';
			}

			lang.isUndefinedOrNull(type) && (type = '');

			if (lang.isFunction(model)) {
				var proto = model.prototype;
				proto.type = type;
				this.addAccessorOnFn(model, cutFnMap);
				proto.setType = function(type) {
					this.type = type;
				};
				proto.getType = function() {
					return this.type;
				};
			} else {
				model.type = type;
				this.addAccessor(model, cutFnMap);
			}
		};


		this.wrapDataModel = function(model, cutFnMap) {
			this.wrapModel(model, 'DATAMODEL', cutFnMap);
		};

		this.wrapViewModel = function(model, cutFnMap) {
			this.wrapModel(model, 'VIEWMODEL', cutFnMap);
		};

		//解析类中的属性
		function parseProperties(s) {
			if (s.indexOf('this') == -1) {
				return [];
			}
			var lines = s.split(/\n/);
			var ret = [];
			var isCommentEnd = true;
			util.each(lines, function(line) {
				var isMLCommentBegin = isMultiLineCommentBegin(line);
				var isMLCommentEnd = isMultiLineCommentEnd(line);
				if (isMLCommentBegin || isMLCommentEnd) {
					isMLCommentBegin && (isCommentEnd = false);
					isMLCommentEnd && (isCommentEnd = true);
				} else if (isCommentEnd && !isSingleLineComment(line)) {
					if (hasMoreThanOneProperty(line)) {
						var _lines = line.split(';');
						util.each(_lines, function(_line) {
							var r = extractProperty(_line);
							if (r) {
								ret.push(r);
							}
						});
					} else {
						var r = extractProperty(line);
						if (r) {
							ret.push(r);
						}
					}
				}
			});

			return ret;

			function isMultiLineCommentBegin(s) {
				return /\/\*/.test(s);
			}

			function isMultiLineCommentEnd(s) {
				return /\*\//.test(s);
			}

			function isSingleLineComment(s) {
				return /\/\//.test(s);
			}

			function hasMoreThanOneProperty(s) {
				return /this\.[a-zA-Z_$][\w$]*\s*=\s*(?:[\w$]+|'.+'|".+")\s*;\s*this\.[a-zA-Z_$][\w$]*/.test(s);
			}

			function extractProperty(s) {
				var r = s.match(/this\.([a-zA-Z_$][\w$]*)\s*=\s*(?:[\w$]+|'.+'|".+")\s*;?/);
				return r && r[1];
			}
		}

		/*
		 * 这里的cutFnMap是fn类所有实例共享的切入函数映射,
		 * 当任何一个实例调用setter方法时,都会call cutFnMap中存在的对应property切入函数
		 */
		this.addAccessorOnFn = function(fn, cutFnMap) {
			var props = parseProperties(fn.toString());

			var fnProto = fn.prototype;

			util.each(props, function(prop, index) {

				var _prop = string.capitalize(prop);

				fnProto['set' + _prop] = function(newValue) {
					var oldValue = this[prop];
					var cutfn = cutFnMap && cutFnMap[prop];
					this[prop] = newValue;
					//当为object或array时,只要引用地址不同，就切入
					if ((lang.isPlainObject(oldValue) && lang.isPlainObject(newValue) || lang.isArray(oldValue) && lang.isArray(newValue)) && oldValue !== newValue) {
						if (cutfn) {
							cutfn(newValue, oldValue);
						}
						observer.publish(mdl.propChannel(prop), newValue, oldValue);
						oldValue = cutfn = null;
						return;
					}
					if (newValue != oldValue) {
						if (cutfn) {
							cutfn(newValue, oldValue);
						}
						observer.publish(this.propChannel(prop), newValue, oldValue);
					}

					oldValue = cutfn = null;
				};
				fnProto['get' + _prop] = function() {

					return this[prop];
				};

			});



			fnProto.propChannel = function(prop) {
				if (lang.isUndefinedOrNull(this['__modelId__'])) {
					this.generateModelId();
				}
				return this.modelId + '@' + prop;
			};

			fnProto.setModelId = function(modelId) {
				this['__modelId__'] = modelId;
			};

			fnProto.getModelId = function() {
				return this['__modelId__'];
			};

			fnProto.generateModelId = function() {
				if (!lang.isUndefinedOrNull(this['__modelId__'])) {
					return;
				}
				var modelId = '$model_' + this.modelCounter++;
				this.setModelId(modelId);
				this.modelManager.map[modelId] = this;
			};

		};


		this.listen = function(model, cutFnMap) {
			lang.isFunction(model) ? this.addAccessorOnFn(model, cutFnMap) : this.addAccessor(model, cutFnMap);
		};
	}).call(ModelWrapper.prototype);

	return new ModelWrapper();
});