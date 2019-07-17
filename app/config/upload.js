var multer=require('multer');
var path =require("path")
var upload=function(){
    var storage=multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,path.join(__dirname,"../uploads"))
        },
        filename:function(req,file,cb){
			cb(null,file.fieldname + '-' + Date.now()+ '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });
    
    let upload=multer({
        storage:storage
    }).single('file');

    return upload;
}

module.exports=upload;