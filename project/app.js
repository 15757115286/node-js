const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer((req,res)=>{
   try{
        let finalPath = path.resolve(__dirname,'static',req.url.substring(1));
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