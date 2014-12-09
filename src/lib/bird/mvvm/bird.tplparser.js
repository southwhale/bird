/**
 * 该模块用来解析html模板
 * 为DataBind提供支持
 *
 */
define(function(require) {

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
                    var idArr = /id=(['"])(.+?)\1/i.exec(propertyStr)
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
                    if(id) {
                        parsedInfo = this.parsedInfoCache[id];
                        if(!parsedInfo) {
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
            if(!/\s+id=/i.test(matchedStr)) {
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