const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const util = require("util");
const { getData, upload } = require("./utils/request.js");
const { getFile, processFormData } = require("./utils/read.js");
let imagePath = path.resolve(__dirname, "imgs");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer();
const pagePath = path.resolve(__dirname, "pages");
const utilsPath = path.resolve(__dirname,"utils");
server.on("request", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 游览器跨域请求头有限制（postMan无限制，这个限制是游览器添加的），需在后台添加自定义Header，多个Header用逗号隔开
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,token");
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  let urlObj = url.parse(req.url, true);
  if (req.method.toLowerCase() === "options") return res.end();
  if(urlObj.pathname === '/utils/ajax.js') {
    let stream = fs.createReadStream(utilsPath + '/ajax.js');
    let buf = Buffer.alloc(0);
    stream.on('data',d=>{
      buf = Buffer.concat([buf,d],buf.length + d.length);
    })
    stream.on('end',()=>{
      res.setHeader('Content-Length',buf.length)
      res.end(buf);
    })
    return;
  };
  if(urlObj.pathname === '/ajax/test') return fs.createReadStream(imagePath + "/wl.jpg").pipe(res);
  if (urlObj.pathname === "/index") {
    return res.end(await getFile(pagePath + "/index.html"));
  } else if (urlObj.pathname === "/upload") {
    let result = null;
    try {
      result = await upload(req, {
        autoSave: true,
        imagePath,
        useRandomFileName: true
      });
    } catch (e) {
      return res.end(`{"success":1,"msg":${e.message}}`);
    }
    res.end('{"success":0}');
  } else if (urlObj.pathname === "/images/wl") {
    let rstream = fs.createReadStream(imagePath + "/wl.jpg");
    rstream.on('readable',()=>{
      let chunk;
      while((chunk = rstream.read()) !== null){
        res.setHeader('Content-Type','application/octet-stream');
        res.setHeader('Content-Length', chunk.length);
        res.setHeader('Content-Disposition', 'attachment; filename=wl.jpg');
        res.end(chunk);
      }
    })
  } else {
    res.end('{"success":0}');
  }

});
server.on("close", () => {
  console.log("server is closed");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
