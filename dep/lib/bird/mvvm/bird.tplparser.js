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
        var variableAttrs = [ "class", "src", "href", "value", "valueVariable", "style", "type", "alt", "for", "readonly", "disabled", "checked", "selected", "placeholder", "width", "height", "cols", "border", "rowspan", "colspan", "bgcolor", "align", "border", "cellpadding", "cellspacing", "frame", "rules", "summary", "download", "coords", "media", "hreflang", "rel", "target", "shape", "autoplay", "controls", "loop", "muted", "preload", "autofocus", "form", "formaction", "name", "formmethod", "formtarget", "formnovalidate", "formenctype", "cite", "datetime", "valuetype", "open", "poster" ];
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
                    var uuid = util.uuid("bind_");
                    var parsedInfo = this.parsedInfoCache[uuid] = {
                        bindId: uuid,
                        tagName: tagName
                    };
                    this._compilePropertyTplStr(propertyStr, parsedInfo, arr[0]);
                }
            }
        };
        this._parseTextContent = function() {
            var arr, parsedInfo, bindArr;
            while (arr = regExpMap.innerText.exec(this.parsedTpl)) {
                tagName = arr[1];
                propertyStr = arr[2];
                if (!/bindid=/i.test(propertyStr)) {
                    var uuid = util.uuid("bind_");
                    parsedInfo = this.parsedInfoCache[uuid] = {
                        tagName: tagName,
                        bindId: uuid
                    };
                    this._compilePropertyTplStr(propertyStr, parsedInfo, arr[0]);
                } else if (bindArr = /bindid=(['"])(.+?)\1/i.exec(propertyStr)) {
                    var bindId = bindArr[2];
                    bindId && (parsedInfo = this.parsedInfoCache[bindId]);
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
            propertyStr && array.forEach(parseFunctionNames, function(name) {
                me[name](propertyStr, parsedInfo);
            });
            this._addBindIdToHtmlStartTag(matchedStr, parsedInfo.bindId);
        };
        this._addBindIdToHtmlStartTag = function(tagStr, bindId) {
            var str, arr;
            var tagNoPropRE = /^(<[a-z]+\d*)(\/?>(?:.|\n|\r)*)/i;
            var tagWithPropRE = /^(<[a-z]+\d*)(\s+(?:.|\n|\r)*\/?>)/i;
            if (arr = tagNoPropRE.exec(tagStr) || tagWithPropRE.exec(tagStr)) {
                str = arr[1] + ' bindid="' + bindId + '"' + arr[2];
            }
            this.parsedTpl = this.parsedTpl.replace(tagStr, str);
        };
        this._parsePlaceholderVariableAndFilter = function(text) {
            var placeholderVarWithFilterRE = /^\s*\{\{\s*([^{}|]+?)(?:\s*\|\s*([^{}|]+))?\s*\}\}/;
            return placeholderVarWithFilterRE.exec(text);
        };
        //不再使用第一个class作为选择器,而是采用动态添加bindId(唯一性),根据bindId查找元素
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
        this.destroy = function() {
            object.forEach(this.parsedInfoCache, function(v, k, cache) {
                delete cache[k];
            });
            this.parsedTpl = "";
        };
    }).call(TplParser.prototype);
    return TplParser;
});