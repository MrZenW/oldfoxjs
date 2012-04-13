/*!
 *foxJS v1.2.0
 *http://foxJS.com
 *Copyright 2012, ZenWong
 */
(function(window,undefined){
	var foxJS = function(param,renew){
		if(!renew){
			renew = false;
		}
		if(param===window){
			param.foxJS = false;
		}
		if(foxJS.isString(param)){
			param = document.getElementById(param);//如果是字符串就当作ID找到元素
			if(!param.foxJS || renew){
				param.foxJS = new foxBaby(param);
				foxJS.rename(param);
			}
		}else if(foxJS.isArray(param)){ //如果是数组
			var len = param.length;
			for(var i=0;i<len;i++){
				if(!param[i].foxJS || renew){
					param[i].foxJS = new foxBaby(param[i]);
					foxJS.rename(param[i]);
				}

			}
		}else{
			if(!param.foxJS || renew){
				param.foxJS = new foxBaby(param);
				foxJS.rename(param);
			}

		}

		return param;
	};
	foxJS.__FOXJS__INTERVAL__LIST = {}; //
	foxJS.__init = function(){ //初始化方法，用于导入文件后对全局的FOXJS对象初始化

		this.type={};
		this.type.array = "[object Array]";
		this.type.nodeList = "[object NodeList]";
		this.type.htmlCollection = "[object HTMLCollection]";
		this.type.object = "[object Object]";
		this.type.json = "[object Object]";
		this.type.string = "[object String]";
		this.xmlHttpRequest = null;
		this.helper = {};
		this.helper.isIE = (document.all && window.ActiveXObject && !window.opera) ? true : false;
		
		this.toString = function(val){ //转为字符串
			if(this.isArray(val)){
				return foxJS.array2string(val);
			}else if(this.isJson(val)){
				return foxJS.set2string(val);
			}else{
				if(!!val.value){
					return val.value;
				}else if(!!val.innerHTML){
					return val.innerHTML;
				}
			}
			return val.toString();
		};
		this.do = function(obj){ //do方法，用于进行一些反复的操作
			var iObj = {}
			iObj['endCount'] = obj.endCount;
			iObj['nowCount'] = 0;
			iObj['function'] = obj.function;
			iObj['endString'] = obj.endString;
			iObj['endCount'] = obj.endCount;
			iObj['id'] = Math.floor(Math.random()*100000000)+(new Date()).valueOf().toString();
			iObj['handle'] = null;
			iObj['handle'] = setInterval(this._doAction,obj.time,obj.id);
			foxJS.__FOXJS__INTERVAL__LIST[obj.id] = iObj;
			return obj.id;
		};

		this._doAction = function(doId){ //do的工作函数
			var iObj = foxJS.__FOXJS__INTERVAL__LIST[doId];
			var endCount = iObj['endCount']?iObj['endCount']:-1; //执行次数
			var nowCount = iObj['nowCount']; //当前次数
			var isEndCount = endCount==-1?false:!(nowCount<endCount);
			if(isEndCount){
				window.clearInterval(iObj['handle']);
				return;
			}else{
				foxJS.__FOXJS__INTERVAL__LIST[doId]['nowCount']++;
			}

			var isEndString = false; //结束字符串
			if(!!iObj.endString){
				isEndString = eval('isEndString = '+iObj.endString);
			}else{
				isEndString = false;
			}
			if(isEndString){
				window.clearInterval(iObj['handle']);
				return ;
			}
			iObj.function();
		};
		this.unDo = function(doId){ //停止一个动作
			if(!foxJS.isArray(doId)){
				doId = new Array(doId);

			}
			for (var i in doId) {
				var iObj = foxJS.__FOXJS__INTERVAL__LIST[doId[i]];
				window.clearInterval(iObj['handle']);
			}

		};

		this.xmlHttpRequestBuilder = function(){ //构造xhr对象
			if(!this.xmlHttpRequest){

				var xmlHttp = false;

				try {
				  xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
				} catch (e) {
				  try {
						xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
				  } catch (e2) {
						xmlHttp = false;
				  }
				}

				if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
				  xmlHttp = new XMLHttpRequest();
				}
				this.xmlHttpRequest = xmlHttp;

			}
			return this.xmlHttpRequest;
		};
		this.ajax = function(param){ //ajax请求

			var xhr = this.xmlHttpRequestBuilder();

			var type = 'POST';
			if(!!param.type){
				type = param.type;
			}
			
			var url = param.url;
			var data = param.data;
			var callBack = param.callBack;

			if(!this.isJson(param)){ //判断是否是快速使用
				type = "GET";
				url = param;
				data = arguments[1];
				callBack = arguments[2];
				if(arguments.length>3){
					type = arguments[3];
				}
			}
			var outThis = this;

			xhr.open(type,url,true);
			xhr.onreadystatechange = function(){

				if(xhr.readyState == 4){ //请求成功
						var resText = xhr.responseText;
						var resJson = outThis.toJson(resText);
						var res = {};
						res.text = resText;
						res.json = resJson;
						callBack(res);
				}
			};
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");  

			xhr.send(data);
		};
		this.crossAjax = function(param){ //AJAX跨域请求
			var ajaxObj = document.createElement("SCRIPT");
			ajaxObj.src=param.url+"?"+param.data+"&__callback="+param.callback;
			//document.body.appendChild(ajaxObj);
			document.body.insertBefore(ajaxObj,document.body.childNodes[0]);

		};

		this.getType = function(value){	//获得变量类型
			return Object.prototype.toString.apply(value);
		};
		this.isArray = function(value){	//是否数组
			var type = this.getType(value);
			if(type == this.type.array 
			|| type == this.type.nodeList
			|| type == this.type.htmlCollection)
			{
				return true;
			}else{
				return false;
			}
		};

		this.isJson = function(value){ //判断是不是JSON
			return this.getType(value)==this.type.json;
		};
		this.isString = function(value){ //判断是否字符串
			return this.getType(value)==this.type.string;
		};

		this.getEvent = function(){
			try{
					ret_event = event;

			}catch(err){

					tmpSender = this.getEvent.caller;
					prevSender = null;

					while(!!tmpSender){
							//如果为空
							prevSender = tmpSender;

							tmpSender = tmpSender.caller;
					}


					ret_event = prevSender.arguments[0];
			}
			return ret_event;

		};
		this.getSender = function(){	//获得调用函数的元素

			if(!!this.getEvent().srcElement)
			{
					sender = this.getEvent().srcElement;
			}
			else
			{
					sender = this.getEvent().target;
			}

			return sender;

		};

		this.time = function(){ //时间函数
			return Date.parse(new Date())/1000;
		};
		this.microtime = function(){	//毫秒函数
			return  (new Date()).valueOf();
		};
		this.date = function(formatStr,time){	//日期函数
			
			if(!!time){
				d = new Date(time*1000);
			}else{
				d = new Date();
			}
			
			formatStr = formatStr.replace('Y',d.getYear()+1900);
			formatStr = formatStr.replace('m',d.getMonth()+1);
			formatStr = formatStr.replace('d',d.getDate());
			formatStr = formatStr.replace('H',d.getHours());
			formatStr = formatStr.replace('i',d.getMinutes());
			formatStr = formatStr.replace('s',d.getSeconds());
			return formatStr;
		
		};
		this.trim = function(str,charS){	//去空格函数
			if(!charS){
				charS = ' ';
			}
			strLen = str.length;
			li = 0;
			ri = strLen-1;
			while(str[li]==charS){
				li++;
			}
			while(str[ri]==charS){
				ri--;
			}
			str = str.substring(li,ri+1);
			return str;
		};

		this.pickValue = function(){	//挑选变量内容的函数
			var args = arguments;
			var argsLen = args.length;
			for(var i=0;i<argsLen;i++){
				if(!!args[i]){
					return args[i];
				}
			}
		
		};

		this.arrayMap = function(array,func){	//数组内容遍历处理函数
			if(this.isArray(array)){
				for(var k in array){
					array[k] = this.arrayMap(array[k],func);
				}
				return array;			
			}else{
				return func(array);
			}
		};

		this.rand = function(){	//随机函数
			var args = arguments;

			if(this.isArray(args[0])){//随机从数组中取出
				var returnNum = args[1];
				var returnArr = [];
				
				if(args.length > 1){//如果有第二个参数
				
					while(returnNum--){
						
						var innLength = args[0].length;

						var iRand = Math.floor(Math.random()*innLength); //获得0到数组结尾的下标之间的一个数值
						args[0].splice(iRand,1); //删除那个被随机选中的项目
						returnArr.push(args[0][iRand]);
					}
					return returnArr;
				}else{
					
					var iRand = Math.floor(Math.random()*args[0].length); //获得0到数组结尾的下标之间的一个数值
				
					return args[0][iRand];
				
				}
			}
			return Math.floor(Math.random()*args[1])+args[0];
			
			
		};

		this.nl2br = function(text){ //换行转HTML
			return text.replace(/\n/,"<br />");
		};

		this.toJson = function(val){ //文本转JSON
			try{

					//JSON.parse(val);
					json = eval('o=val');
			}catch(err){
					return {};

			}
			return json;
		};
		this.array2string = function(array){  //数组到字符串
			if(this.isArray(array)){
				var string = '[';
				for(var k in array){
					string += this.array2string(array[k])+",";
				}
				string = string.substring(0,string.length-1);
				string += ']';
				return string;
			}else{
				return "\""+escape(array)+"\"";
			}
		};

		this.set2string = function(set){ //集合（数组或json）转换为字符串
			if(this.isJson(set)){
				var string = '{';
				for(var k in set){
					string += k+":"+this.set2string(set[k])+",";
				}
				string = string.substring(0,string.length-1);
				string += '}';
				return string;
			}else{
				if(this.isArray(set)){
					return this.array2string(set);
				}else{
					return "\""+escape(set)+"\"";

				}
				
			}

		};

		this.json2query = function(json){	//JSON转文本
		
			json = this.toJson(json);

			ret = '';
			
			for(var i in json){
					if(this.isArray(json[i])){
					
							for(j in json[i]){
									ret += i+'['+j+']='+escape(json[i][j])+'&';
							}
					}else{
							ret += i+'='+escape(json[i])+'&';
					}
			}

			return ret;

		};

		this.json2xml = function(json){	//JSON转XML


			if(this.isJson(json)){
				var xml = '';
				for(var key in json){
					xml += '<'+key+'>' +
								this.json2xml(json[key]) +
								'</'+key+'>';
				}
				return xml;
			}else{

				return escape(json);
			}

		}; 
		this.importAgain = function(src){ //再导入一次
			scriptObj = document.getElementById('FOXJS_'+src);
			if (!scriptObj) {//如果没有导入
				this.import(src);
			}else{
				this.import(src+'?'+(new Date()).valueOf()+this.rand(0,1000));
			}
		};
		this.importOnce = function(src){//导入一次
			scriptObj = document.getElementById('FOXJS_'+src);
			if (!scriptObj) {//如果没有导入
				this.import(src);
			}
			return src;
		};
		this.import = function(src){//导入脚本
			var scriptObj = document.createElement("SCRIPT");
			scriptObj.src=src;
			scriptObj.id = 'FOXJS_'+src;
			document.body.insertBefore(scriptObj,document.body.childNodes[0]);
		};
	}; //foxJS.__init
	foxJS.__init();	//初始化对象

	foxBaby = function(element){	//特殊的foxjs element对象
		this.element = element;
		this.__data = new Array();

		this.data = function(name,data){	//数据对象
			if(arguments.length>1){
				this.__data[name] = data;
			}
			return this.__data[name];
		};
		this.toString = function(){ //添加TOSTRING函数
			return foxJS.toString(this.element);
		};
		this.addEvent = function(eventActionName,eventFunc){ //添加事件处理函数到事件
			if(foxJS.helper.isIE){
				this.element.attachEvent('on'+eventActionName,eventFunc);
			}else{
				this.element.addEventListener(eventActionName,eventFunc,false);
			}
		};

		this.getAllAttr = function(){	//获得对象所有属性的JSON
			var param = {};
			if(!this.element.attributes){
				return {__FOXJS__:'ERROR',__INFO__:'element no attr'};
			}
			var attrAll = this.element.attributes;
			
			var attrLen = attrAll.length;
			for(var i=0;i<attrLen;i++){
					if(!!(this.element.getAttribute(attrAll[i].name))){
							param[attrAll[i].name] = attrAll[i].value;
							
					}
			}
			return param;
		};

		this.css = function(name,val){ //css样式表
			if(foxJS.isString(name)){//如果是字符串，代表其不是使用JSON来批量设置
				if(!val){
					return this.element.style[name];
				}
				this.element.style[name] = val;
			}else{
				for(var k in name){
					this.element.style[k] = name[k];
				}

			}
			
		};
		this.addClass = function(className){ //加样式
			if(!this.hasClass(className)){
				 this.element.className += " "+className;
			}
		};

		this.removeClass = function(className){ //删除样式
			if (this.hasClass(className)) {
				var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
				this.element.className = this.element.className.replace(reg,' ');
			}
		};

		this.hasClass = function(className){ //判断样式是否存在
			var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
			return this.element.className.match(reg);
		}

		this.show = function(){	//显示
			this.element.style.display = "block";
		};
		this.hidden = function(){	//隐藏
			this.element.style.display = "none";
		};
		this.change = function(func1,func2){	//切换状态
			var argLen = arguments.length;
			if(argLen>=2){
				if (this.__changeIndex==1) {
					this.__changeIndex = 2;
					return func2();
				}else{
					this.__changeIndex = 1;
					return func1();
				}
			}else{
				if(this.element.style.display != "none"){
					this.element.style.display = "none";
				}else{
					this.element.style.display = "block";
				}
			}
			
		}
		//将自己插入到另一元素前
		this.insertBefore = function(elem){
			elem.parentNode.insertBefore(this.element,elem);
		};
		//获得当前的父级节点
		this.getParent = function(){
			return !!this.element.parentElement?this.element.parentElement:this.element.parentNode;
		};
		//获得当前的子节点
		this.getChilds = function(){
			return this.element.childNodes;
		};


		//获得父级节点
		this.parent = !!this.element.parentElement?this.element.parentElement:this.element.parentNode;
		//获得子节点数组
		this.childs = this.element.childNodes;
		//this.child = !!this.element.childElement?this.element.childElement:this.element.childNode;
		
		//获得node类型子节点
		this.childNodes = new Array();
		//获得文本类型子节点
		this.childTexts = new Array();
		for(var n in this.childs){
			ty = this.childs[n].nodeType;
			if(ty == 1){
				this.childNodes.push(this.childs[n]);
			}else if (ty == 3) {
				this.childTexts.push(this.childs[n]);
			}
		}

		//寻找下一个兄弟节点
		this.nextNode = new Array();
		this.nextText = new Array();
		var t=this.element.nextSibling;
		while(t){
			ty = t.nodeType;
			if(ty == 1){
				this.nextNode.push(t);
			}else if(ty == 3){
				this.nextText.push(t);
			
			}
			t = t.nextSibling;
		}
		
		//寻找上一个兄弟节点
		this.preNode = new Array();
		this.preText = new Array();
		t=this.element.previousSibling;
		while(t){
			ty = t.nodeType;
			if(ty == 1){
				this.preNode.push(t);
			}else if(ty == 3){
				this.preText.push(t);
			}
			t = t.previousSibling;
		}

		//获得元素在页面上的位置
		this.offset={};
		this.offset.x = function(){
			return element.offsetLeft;

		};
		this.offset.y = function(){
			return element.offsetTop;
		};
		this.offset.innerX = function(){
			return element.clientLeft;

		};
		this.offset.innery = function(){
			return element.clientTop;

		};

	};
	foxJS.fox = foxBaby.prototype;

	foxJS.rename = function(element){

		for (var i in foxJS.valName) {

			element[foxJS.valName[i]] = element.foxJS;
		}
	};
	foxJS.valName = ['_'];
	foxJS.window = window;
	window._ = window.__ = window.foxJS = foxJS;
})(window);