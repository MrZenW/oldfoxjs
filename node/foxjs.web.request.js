var request = function(req){
	this._request = req;
	this.post = function(cb){ //获得POST数据
	    var querystring = require('querystring');  
	    var postData = '';
	    this._request.addListener('data', function(chunk){
	        postData += chunk;
	    }).addListener('end', function(){
	        postData = querystring.parse(postData);
	        cb(postData);
	    });
	};
	this.get = function(){ //获得GET数组
	    var urlLib = require("url");
	    var query = {};
	    var queryObj = null;
	    var returnQuery = {};
	    if(!!this._request.url){
	        var queryObj = urlLib.parse(this._request.url);
	        if(!!queryObj.query){
	            query = queryObj.query;
	            
	            var queryArr = query.split('&');
	            for(var k in queryArr){
	                var aQueryItem = queryArr[k].split('=');
	                returnQuery[aQueryItem[0]] = aQueryItem[1];
	            }
	        }
	    
	    }
	    return returnQuery;
	    
	    
	};


};

exports.createRequest = function(req){
	var obj = new request(req);
	return obj;

};