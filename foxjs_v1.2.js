/*!
 *foxJS v1.2
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
				foxJS.rename(param,foxJS.varName);
			}
		}else if(foxJS.isArray(param)){ //如果是数组
			var len = param.length;
			for(var i=0;i<len;i++){
				if(!param[i].foxJS || renew){
					param[i].foxJS = new foxBaby(param[i]);
					foxJS.rename(param[i],foxJS.varName);
				}

			}
		}else{
			if(!param.foxJS || renew){
				param.foxJS = new foxBaby(param);
				foxJS.rename(param,foxJS.varName);
			}

		}

		return param;
	};
	//init run
	(function(self,window,undefined){ //初始化方法，用于导入文件后对全局的FOXJS对象初始化
		self.window = window;
		self.__FOXJS__INTERVAL__LIST = {};
		self.type={};
		self.type.array = "[object Array]";
		self.type.nodeList = "[object NodeList]";
		self.type.htmlCollection = "[object HTMLCollection]";
		self.type.object = "[object Object]";
		self.type.json = "[object Object]";
		self.type.string = "[object String]";
		self.xmlHttpRequest = null;
		self.helper = {};
		self.helper.isIE = (document.all && window.ActiveXObject && !window.opera) ? true : false;

		self.toString = function(val){ //转为字符串
			if(self.isArray(val)){
				return foxJS.array2string(val);
			}else if(self.isJson(val)){
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
		self.go = function(obj){ //go方法，用于进行一些反复的操作
			if(!obj['function'])return false;
			var iObj = {}
			iObj['endCount'] = obj.endCount;
			iObj['nowCount'] = 0;
			iObj['function'] = obj['function'];
			iObj['end'] = obj.end; //结束函数
			iObj['endCount'] = obj.endCount;
			iObj['time'] = obj.time||1;
			iObj['id'] = Math.floor(Math.random()*10000000000);
			iObj['handle'] = null;
			iObj['handle'] = self.window.setInterval(self._goAction,iObj.time,iObj.id);
			foxJS.__FOXJS__INTERVAL__LIST[iObj.id] = iObj;
			return iObj.id;
		};

		self._goAction = function(doId){ //do的工作函数
			var iObj = foxJS.__FOXJS__INTERVAL__LIST[doId];
			var endCount = iObj.endCount||-1; //执行次数
			var nowCount = iObj['nowCount']; //当前次数
			var isEndCount = endCount==-1?false:!(nowCount<endCount); //如果到达了结束执行的次数
			if(isEndCount){
				self.window.clearInterval(iObj['handle']);
				return;
			}else{
				foxJS.__FOXJS__INTERVAL__LIST[doId]['nowCount']++;
			}

			var isFunctionEnd = false; //结束函数
			if(!!iObj.end){
				isFunctionEnd = iObj.end();
			}else{
				isFunctionEnd = false;
			}
			if(!!isFunctionEnd){
				self.window.clearInterval(iObj['handle']);
				return ;
			}
			iObj['function']();
		};
		self.unGo = function(doId){ //停止一个动作
			if(!foxJS.isArray(doId)){
				doId = new Array(doId);

			}
			for (var i in doId) {
				var iObj = foxJS.__FOXJS__INTERVAL__LIST[doId[i]];
				self.window.clearInterval(iObj['handle']);
			}

		};

		self.xmlHttpRequestBuilder = function(){ //构造xhr对象
			if(!self.xmlHttpRequest){

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
				self.xmlHttpRequest = xmlHttp;

			}
			return self.xmlHttpRequest;
		};
		self.ajax = function(param){ //ajax请求

			var xhr = self.xmlHttpRequestBuilder();

			var type = 'POST';
			if(!!param.type){
				type = param.type;
			}
			
			var url = param.url;
			var data = param.data;
			var callBack = param.callBack;

			if(!self.isJson(param)){ //判断是否是快速使用
				type = "GET";
				url = param;
				data = arguments[1];
				callBack = arguments[2];
				if(arguments.length>3){
					type = arguments[3];
				}
			}
			//var outThis = this;

			xhr.open(type,url,true);
			xhr.onreadystatechange = function(){

				if(xhr.readyState == 4){ //请求成功
						var resText = xhr.responseText;
						var resJson = self.toJson(resText);
						var res = {};
						res.text = resText;
						res.json = resJson;
						callBack(res);
				}
			};
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");  

			xhr.send(data);
		};
		self.crossAjax = function(param){ //AJAX跨域请求
			var ajaxObj = document.createElement("SCRIPT");
			ajaxObj.src=param.url+"?"+param.data+"&__callback="+param.callback;
			//document.body.appendChild(ajaxObj);
			document.body.insertBefore(ajaxObj,document.body.childNodes[0]);

		};

		self.getType = function(value){	//获得变量类型
			return Object.prototype.toString.apply(value);
		};
		self.isArray = function(value){	//是否数组
			var type = self.getType(value);
			if(type == self.type.array 
			|| type == self.type.nodeList
			|| type == self.type.htmlCollection)
			{
				return true;
			}else{
				return false;
			}
		};

		self.isJson = function(value){ //判断是不是JSON
			return self.getType(value)==self.type.json;
		};
		self.isString = function(value){ //判断是否字符串
			return self.getType(value)==self.type.string;
		};

		self.getEvent = function(){
			try{
					ret_event = event;

			}catch(err){

					tmpSender = this.getEvent.caller; //这里的this的对的，她表示调用该函数时的对象
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
		self.getSender = function(){	//获得调用函数的元素

			if(!!self.getEvent().srcElement)
			{
					sender = self.getEvent().srcElement;
			}
			else
			{
					sender = self.getEvent().target;
			}

			return sender;

		};

		self.time = function(){ //时间函数
			return Date.parse(new Date())/1000;
		};
		self.microtime = function(){	//毫秒函数
			return  (new Date()).valueOf();
		};
		self.date = function(formatStr,time){	//日期函数
			
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
		self.trim = function(str,charS){	//去空格函数
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

		self.pickValue = function(){	//挑选变量内容的函数
			var args = arguments;
			var argsLen = args.length;
			for(var i=0;i<argsLen;i++){
				if(!!args[i]){
					return args[i];
				}
			}
		
		};

		self.arrayMap = function(array,func){	//数组内容遍历处理函数
			if(self.isArray(array)){
				for(var k in array){
					array[k] = self.arrayMap(array[k],func);
				}
				return array;			
			}else{
				return func(array);
			}
		};

		self.rand = function(){	//随机函数
			var args = arguments;

			if(self.isArray(args[0])){//随机从数组中取出
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

		self.nl2br = function(text){ //换行转HTML
			return text.replace(/\n/,"<br />");
		};

		self.toJson = function(val){ //文本转JSON
			try{

					//JSON.parse(val);
					json = eval('o=val');
			}catch(err){
					return {};

			}
			return json;
		};
		self.array2string = function(array){  //数组到字符串
			if(self.isArray(array)){
				var string = '[';
				for(var k in array){
					string += self.array2string(array[k])+",";
				}
				string = string.substring(0,string.length-1);
				string += ']';
				return string;
			}else{
				return "\""+escape(array)+"\"";
			}
		};

		self.set2string = function(set){ //集合（数组或json）转换为字符串
			if(self.isJson(set)){
				var string = '{';
				for(var k in set){
					string += k+":"+self.set2string(set[k])+",";
				}
				string = string.substring(0,string.length-1);
				string += '}';
				return string;
			}else{
				if(self.isArray(set)){
					return self.array2string(set);
				}else{
					return "\""+escape(set)+"\"";

				}
				
			}

		};

		self.json2query = function(json){	//JSON转文本
		
			json = self.toJson(json);

			ret = '';
			
			for(var i in json){
					if(self.isArray(json[i])){
					
							for(j in json[i]){
									ret += i+'['+j+']='+escape(json[i][j])+'&';
							}
					}else{
							ret += i+'='+escape(json[i])+'&';
					}
			}

			return ret;

		};

		self.json2xml = function(json){	//JSON转XML


			if(self.isJson(json)){
				var xml = '';
				for(var key in json){
					xml += '<'+key+'>' +
								self.json2xml(json[key]) +
								'</'+key+'>';
				}
				return xml;
			}else{

				return escape(json);
			}

		}; 
		self.importAgain = function(src){ //再导入一次
			scriptObj = document.getElementById('FOXJS_'+src);
			if (!scriptObj) {//如果没有导入
				self['import'](src);
			}else{
				self['import'](src+'?'+(new Date()).valueOf()+self.rand(0,1000));
			}
		};
		self.importOnce = function(src){//导入一次
			scriptObj = document.getElementById('FOXJS_'+src);
			if (!scriptObj) {//如果没有导入
				self['import'](src);
			}
			return src;
		};
		self['import'] = function(src){//导入脚本
			var scriptObj = document.createElement("SCRIPT");
			scriptObj.src=src;
			scriptObj.id = 'FOXJS_'+src;
			document.body.insertBefore(scriptObj,document.body.childNodes[0]);
		};
	})(foxJS,window); //foxJS.__init
	//foxJS.__init();	//初始化对象

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

	foxJS.rename = function(element,varName){
		for (var i in varName) {

			element[varName[i]] = element.foxJS;
		}
	};
	foxJS.varName = ['_'];
	window._ = window.__ = window.foxJS = foxJS;
})(window);