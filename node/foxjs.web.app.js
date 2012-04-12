exports.createApp = function(config){ //应用构造函数
	if(!global.foxjs){
			global.foxjs = {};
	}
	if(!!config){

		var app =new exports.app(config);	
		
		
		global.foxjs.app = app;
	}

	//console.log(app);
	//app.setConfig(config);
	return global.foxjs.app;


};
/*
	//将各目录放入模块寻找列表中
	module.paths.push(global.foxjs.app.getConfig().app.path);
	module.paths.push(global.foxjs.app.getConfig().controller.path);
	module.paths.push(global.foxjs.app.getConfig().action.path);
	module.paths.push(global.foxjs.app.getConfig().model.path);
	module.paths.push(global.foxjs.app.getConfig().view.path);
*/
var app = function(config){
	if(!config && !!global.foxjs && !!global.foxjs.app){
		//配置文件不存在并且已经有现成的引用对象
		return global.foxjs.app;
	}

	app._config = false;
	app._model = false;
	app._action = false;
	app._controller = false;
	app._data={};

	app.setData = function(name,value){
		app._data[name] = value;

	};
	app.getData = function(name){
		return app._data[name];
	};
	app.setConfig = function(config){ //设置配置文件
		app._config = config;

	};
	app.getConfig = function(){
		
		return app._config;
	};
	app.model = {};
	app.model.getModel = function(modelID){
	    var path = app.getConfig().model.path;
	    var model = require(path+'/'+modelID);
	    return model;

	};
	app.action = {};
	app.action.getAction = function(actionID){ //获得一个动作
		return require(app.getConfig().action.path+'/'+actionID);

	};

	app.controller = {};
	app.controller.getController = function(req,res){

	   var route = app.route.parse(req);
	    var defaultRoute = null;
	    if(route.status===0){ //如果成功找到了该路由
	        var controller = route.controller;
	        //app.request._['pathQuery']
	        return controller;
	        //return controller.work(req,res,callback);
	        
	    }else{ //如果没有找到路由
	        defaultRoute = app.route.parse(app.getConfig().controller.defaultController);
	        if(defaultRoute.status === 0){ //如果成功找到了默认路由
	            var controller = defaultRoute.controller;
	            return controller;
	            //return controller.work(req,res,callback);
	            
	        }else{ //如果连默认路由都没有找到
	            return app.getConfig().controller.controllerNotFound;
	        }
	    }
		
	};
	app.view = {};
	app.view.render = function(viewID,data,cb){
		//var viewID = data.viewID;
		//var data = data.data;
		var cb = cb;
		var fs = require('fs');
	    var file = app.getConfig().view.path+'/'+viewID;
	    //var html= fs.readFileSync(app.config.view.path+'/'+viewID, "utf8");
	    fs.readFile(file,'utf-8',function(err,html){
	        
	        if(!!data){//渲染变量
	            //var data = data.data;
	            for(var k in data){
	                var regStr = "<\\?="+k+"\\?>";
	                var regObj = new RegExp(regStr, "g");
	                html = html.replace(regObj,data[k]); //替换变量
	                
	            }
	        }
	        html = html.replace(/<\?=.*\?>/g,''); //替换掉其他没有变量的输出
	        html = html.replace(/<\?(.|\n|\r)*?\?>/g,function(words){ //解析函数
	            func = words.substring(2,words.length-2);
	            eval('func = '+func);
	            return func(data);
	        });
	        //return html;
	        
	        !!cb && cb(html);
	    });

	};
	app.route = {};
	app.route.parse = function(reqORurl){ //路由解析函数
	    var urlLib = require("url");
	    var url = null;
	    if(!!reqORurl.url){
	        url = reqORurl.url;
	    }else{
	        url = reqORurl;
	    }
	    var ret = {};
	    var parsePath = urlLib.parse(url);
	    var path = parsePath.pathname; //路径
	    var query = parsePath.query; //请求
	    var pathArr = path.split('/');
	    var controllerPath = app.getConfig().controller.path; //配置文件控制器目录
	    var contObj = null;
	    var actionPath = '';
	    var nowPath = '';
	    //return pathArr;
	    var paLen = pathArr.length;
	    for(var i=0;i<paLen;i++){
	        var item = pathArr.shift();
	        if(!item){
	            continue;
	        }
	        nowPath = nowPath+'/'+item;
	        var ss = require('./foxjs.file.snapshot.js');
	        var controllerNameFix = 'Controller';
	        if(!!app.getConfig().controller.nameFix){
	        	controllerNameFix = app.getConfig().controller.nameFix;

	        };
	        var fileSS = ss.getPath(app.getData('snapshot'),controllerPath+'/'+nowPath+controllerNameFix+'.js'); //获得当前的控制器文件
	        if(fileSS){ //如果文件快照不false
	            if(fileSS.type === 1){ //如果是文件
	                contObj = require(controllerPath+'/'+nowPath+controllerNameFix);
	                break;
	            }
	            
	        }
	        
	    }
	    if(!!contObj){ //如果找到了控制器
	        ret.controller = contObj;
	    }else{
	        ret.controller = null;
	    }
	    var regObj = new RegExp(nowPath);
	    pathQuery = path.replace(regObj,''); //获得控制器剩下的路径
	    
	    ret.path = nowPath;
	    ret.pathQuery = pathQuery;
	    ret.query = query;
	    ret.status = 1;
	    (!!ret.controller)&&(ret.status = 0);
	    //app.request._.route['object'] = ret;
	    return ret;
	    
	};

	app.run = function(para){
		var res = para.response;
		var req = para.request;
		var serverName = 'foxjs';
		if(!!app.getConfig().app.serverName){
			serverName = app.getConfig().app.serverName;

		}
		res.setHeader("Server", serverName);
		var cont = app.controller.getController(req,res); //获得控制器
		if(!!cont){
			cont.work(req,res,app.view.render);
		}else{
			cont(req,res,app.view.render);

		}
		
	};

	app._init = function(config){
		app.setConfig(config);
		app.APP_PATH = app.getConfig().app.path;
		app.ACTION_PATH = app.getConfig().action.path;
		app.CONTROLLER_PATH = app.getConfig().controller.path;
		app.MODEL_PATH = app.getConfig().model.path;
		app.VIEW_PATH = app.getConfig().view.path;

		var ss = require('./foxjs.file.snapshot.js');//构造快照
		app.setData('snapshot',ss.getSnapshot(app.getConfig().controller.path)); //获得控制器目录快照

	};
	app._init(config);

	return app;
};
exports.app = app;


