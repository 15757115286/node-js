const http = require("http");
const fs = require("fs");
const path = require("path");
let imagePath = path.resolve(__dirname,"imgs");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer();
server.on("request", (req, res) => {
  res.statusCode = 200;
  let readStream = fs.createReadStream(imagePath + '/wl.jpg');
  let writeStream = fs.createWriteStream(imagePath +'/copyOfwl.png');
  let resu = readStream.pipe(writeStream);
  readStream.pipe(res);
  res.on("finish",()=>{
      console.log('请求结束！')
  })
  readStream.on('error',err=>{
      console.log(err);
      res.end('文件不存在')
  })
 /*  let data = Buffer.alloc(0);
  req.on('data',d=>{
    data = Buffer.concat([data,d],data.length + d.length);
  })
  req.on('end',()=>{
      let dataStr = data.toString() || "{}";
      let obj = JSON.parse(dataStr);
      obj['age'] = 18;
      let readStream = fs.createReadStream(imagePath + '/wl.jpg');
      let imgData = Buffer.alloc(0);
      readStream.on('data',d=>{
          imgData = Buffer.concat([imgData,d],imgData.length + d.length);
      })
      readStream.on('end',()=>{
        res.end(imgData)
      })
  }) */
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
