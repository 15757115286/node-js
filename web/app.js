const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const util = require("util");
const formidable = require('formidable');
const {
  getData
} = require("./utils/request.js")
const {
  getFile,
  processFormData
} = require("./utils/read.js")
let imagePath = path.resolve(__dirname, "imgs");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer();
const pagePath = path.resolve(__dirname, 'pages');
server.on("request", async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 游览器跨域请求头有限制，需在后台添加自定义Header，多个Header用逗号隔开
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,token");
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  let urlObj = url.parse(req.url, true);
  if (urlObj.pathname === '/index') {
    return res.end(await getFile(pagePath + '/index.html'))
  } else if (urlObj.pathname === '/upload') {
    if (req.method.toLowerCase() === 'options') return res.end();
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = imagePath;
    form.keepExtensions = true;
    form.parse(req, function (err, fields, files) {
      res.writeHead(200, {
        'content-type': 'text/plain'
      });
    });
  } else {
    res.end('{"success":0}')
  }
});
server.on("close", () => {
  console.log('server is closed')
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});