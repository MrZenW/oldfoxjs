exports.getSnapshot = function(path){
    
    var ss = exports.buildSnapshot(path);
    ss.path = path;
    return ss;
};

exports.buildSnapshot = function(path){

    var fs = require('fs');
    //return path;
    var fileStat = fs.lstatSync(path); //获得文件信息，包括大小
    //return fs.readdirSync(path);
    if (fileStat === undefined) return;
    if(fileStat.isDirectory()){ //如果是文件夹
        //获得文件夹信息
        var dirInfo = fs.readdirSync(path);
        var dirArr = {};
        dirInfo.forEach(function(item){
            var filePath = path+"/"+item;
            dirArr[item] = exports.buildSnapshot(filePath);
            //return app.file.builde(filePath);
        
        });
        return dirArr;
        
    }else{
        //读取文件信息，并且返回
        var fileInfo = fs.statSync(path);
        fileInfo['type'] = 1; //1表示文件
        return fileInfo;
    }
    /*
    var array = {};
    var files = fs.readdirSync(path);
    files.forEach(function(file){
        var filePath = path+'/'+file;
        var fStat = fs.lstatSync(filePath);
        if(fStat.isDirectory(filePath)){ //如果是文件夹
            array.push(app.file.builde(filePath));
            
        }else{
            array[file] = fSata;
            
        }
    
    });
    */
};
exports.getPath = function(snapshot,path){
    var path = path.replace(snapshot.path,'');//将多出来的路径替换掉
    var pathArr = path.split('/');
    var nowPathObj = false;
    var nowPath = snapshot.path;
    
    pathArr.forEach(function(item){
        if(!!item){
            if(!!snapshot[item]){
                nowPathObj = snapshot[item];
                nowPath += "/"+item;
            }else{
                return false; //如果如何一个变量没有找到，那么代表路径不正确
            }
            
        }
    });
    nowPathObj.path = nowPath;
    return nowPathObj;
};