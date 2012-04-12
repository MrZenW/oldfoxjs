exports.work = function(req,res,cb){
	
	//res.end('d');
	var foxjs = require('../foxjs.web.app');

	
	
	var foxReq = require(foxjs.app().APP_PATH+'/foxjs.web.request').createRequest(req);
	foxReq.post(function(post){
		var data = {"post":post.a};
		//console.log(post);
		foxReq.get();
		cb('index.html',data,function(html){
			
			res.end(html);
		});

	});


};