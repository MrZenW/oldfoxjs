var http = require('http');
var foxjsWeb = require('./foxjs.web.app');
//var config = require('./foxjs.config.json');

var config = {
    app:{
        path:__dirname,
        serverName:'foxjs,v1'

    },
    controller:{
        path:__dirname+'/controller',
        "defaultController":'/index',
        "controllerNotFound":function(req,res){
            res.end('什么都莫得拉');

        }

    },
    action:{
        path:__dirname+'/action',
        
    },
    model:{
        path:__dirname+'/model'

    },
    view:{
        path:__dirname+'/view'

    }


};
var app = foxjsWeb.createApp(config);
http.createServer(function(req, res){

    app.run({request:req,response:res});




}).listen(80);

console.log("server started at port 80");