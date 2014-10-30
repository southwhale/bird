$(document).ready(function(){
	
	
	function init(){
		var div = document.createElement("DIV");
    	div.innerHTML = '请选择简历（HTML文件）：<input id="upload" type="file">';
    	//div.style.display = "none";
    	document.body.appendChild(div);
	}
	
	init();
	
	var uploadControl = document.getElementById('upload');
	 
	var reader = new FileReader();  
	uploadControl.addEventListener("change",function(){
		var file = uploadControl.files[0]; 
		reader.readAsText(file);  
	},false);
	

    reader.onload = function (e){  
    	parseHtml(this.result);  
   	}  
    reader.onerror = function (e){  
        alert(e);  
    }  
    
    
    
    function parseHtml(html){
    	var div = document.createElement("DIV");
    	div.innerHTML = html;
    	//div.style.display = "none";
    	document.body.appendChild(div);
    	var text = div.innerText;
    	document.body.removeChild(div);
    	div = null;
    	text = text.split(/\n+/);
    	console.log(text);
    	return;
    	/**
    	 * 尝试了各种字符处理，到最后发现还是浏览器原生的功能比较强大，处理起来也简单的多，效果也比较好
    	 */
    	
    	
    	html = removeHeadTag(html);
    	html = removeStyleTag(html);
    	html = removeScriptTag(html);
    	//html = removeLineBreakInWord(html);
    	html = getWords(html);
    	console.log(html);
    	return;
    	
    	html = filterHtmlTags(html);
    	html = filterBbsp(html);
    	html = splitByLineBreak(html);
    	var _html = [];
    	html.forEach(function(line){
    		line = filterBothEndsSpace(line);
    		line && _html.push(line);
    	});
    	var rt = buildResult(_html);
    	console.log(rt);
    }
    
    function removeStyleTag(html){
    	return html.replace(/<style[^>]*?>(?:.|\n)*<\/style>/ig,'');
    }
    
    function removeScriptTag(html){
    	return html.replace(/<script[^>]*?>(?:.|\n)*<\/script>/ig,'');
    }
    
    function removeHeadTag(html){
    	return html.replace(/(?:.|\n)*<\/head>/i,'');
    }
    
    function removeLineBreakInWord(html){
    	return html.replace(/<[^>]*?>\s*[^<>]+?(\n+)[^<>]+?\s*<\/[^>]*?>/g,function(m){
    		return m.replace(/\n+/g,'');
    	});
    }
    
    function filterBothEndsSpace(html){
    	return html.replace(/^\s+|\s+$/,'');
    }
    
    function filterBbsp(html){
    	return html.replace(/&nbsp;?/ig,'');
    }
    
    function filterHtmlTags(html){
		return html.replace(/<[^>]*?>/g, ''); 
	}
    
    function splitByLineBreak(html){
    	return html.split(/\n+/);
    }
    
    function buildResult(html){
    	var rt = [];
    	var v = [];
    	var kv,hasKey;
    	html.forEach(function(line){
    		if(/：|\:/.test(line)){
    			if(kv && !kv.value.length){
    				rt.pop();
    			}
    			var wds = line.split(/：|\:/);
    			wds[1] && (wds[1] = filterBothEndsSpace(wds[1]));
    			rt.push(kv = {
    				key : wds[0],
    				value : wds[1] ? [wds[1]] : []
    			});
    			hasKey = true;
    		}else if(hasKey){
    			kv.value.push(line);
    		}else{
    			rt.push({
    				words : line
    			});
    		}
    	});
    	return rt;
    }
    
    function getWords(html){
    	var arr = [];
    	while(checkWords(html)){
    		var r = _getWords(html);
    		if(r){
    			arr.push(r[1]);
    			html = html.substring(r.index + r[0]['length']);
    			console.log(r[1])
    		}
    	}
    	return arr;
    }
    
    function _getWords(html){
    	return /<[^>]*?>([^<]*?)<\/[^>]*?>/gm.exec(html);
    }
    
    function checkWords(html){
    	return /<[^>]*?>([^<]*?)<\/[^>]*?>/gm.test(html);
    }
});
