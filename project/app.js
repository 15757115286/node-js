const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer((req,res)=>{
   try{
        let finalPath = path.resolve(__dirname,'static',req.url.substring(1));
        if(/^\/ajax/.test(req.url)){
            if(req.url == '/ajax/wl'){
                let rs = fs.createReadStream(path.resolve(__dirname,'static/img/copy.png'));
                rs.on('error',function(e){
                    res.statusCode = 500;
                    res.statusMessage = 'server interval error occur';
                    res.end('the interval error occur !\n'+e.message);
                })
                res.on('pipe',function(src){
                    console.log(src)
                })
                rs.pipe(res);
            }else{
                res.end('路径错误！');
            }
            return;
        }
        let readstream = fs.createReadStream(finalPath);
        readstream.on('error',err=>{
            if(err.code == 'ENOENT'){
                res.statusCode = 404;
                res.end(err.message);
            }else{
                res.statusCode = 405;
                res.end(err.message);
            }
        });
        if(/js$/.test(req.url)){
            res.setHeader('content-type','application/javascript');
        }else if(/css$/.test(req.url)){
            res.setHeader('content-type','text/css');
        }
        readstream.pipe(res);
   }catch(e){
       res.statusCode = 500;
       res.statusMessage = 'server interval error occur';
       res.end('the interval error occur !\n'+e.message);
   }
});
server
.on('error',err=>{
    console.error(err);
})
.on('listening',()=>{
    console.log('server is start! listen on 127.0.0.1:3000')
});
server.listen(3000,'127.0.0.1');