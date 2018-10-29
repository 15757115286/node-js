const http  =require('http');
const fs = require('fs');
const path = require('path');
const localPath = path.resolve(__dirname);

const req = http.request({
  host:'m10.music.126.net',
  path:'/20181026171034/2f0a756cfd6ae0879cb967d02b9c0d3d/ymusic/642b/89e4/67bf/4383c261c0aefb9fd9280d73741ded0e.mp3'  ,
  method:'GET'
},res=>{
    const ws = fs.createWriteStream(localPath + '/test.mp3');
    ws.on('error',e=>{
        console.error(e);
    })
    res.pipe(ws);
    /* let buffer = Buffer.alloc(0);
    res.on('data',data=>{
        buffer = Buffer.concat([buffer,data],buffer.length + data.length);
    });
    res.on('end',()=>{
        console.log('end');
        console.log(buffer);
    })
    res.on('error',err=>{
        console.log(err);

    }) */
})
req.on('error',e=>{
    console.log('req',e);
})
req.end();