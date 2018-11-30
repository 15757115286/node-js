const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer((req, res) => {
    const { headers } = req;
  res.setHeader("Access-Control-Allow-Origin", "*");
  // 游览器跨域请求头有限制（postMan无限制，这个限制是游览器添加的），需在后台添加自定义Header，多个Header用逗号隔开
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,token,Cache-Control,If-Modified-Since"
  );
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // res.setHeader('Cache-Control','public, max-age=0')
  try {
    let finalPath = path.resolve(__dirname, "static", req.url.substring(1));
    if (/^\/ajax/.test(req.url)) {
      if (req.url == "/ajax/wl") {
        res.setHeader('Cache-Control','public, max-age=3600')
        let rs = fs.createReadStream(
          path.resolve(__dirname, "static/img/copy.png")
        );
        rs.on("error", function(e) {
          res.statusCode = 500;
          res.statusMessage = "server interval error occur";
          res.end("the interval error occur !\n" + e.message);
        });
        res.on("pipe", function(src) {
          console.log(src);
        });
        rs.pipe(res);
      } else {
        res.end("路径错误！");
      }
      return;
    }
    let readstream = fs.createReadStream(finalPath);
    readstream.on("error", err => {
      if (err.code == "ENOENT") {
        res.statusCode = 404;
        res.end(err.message);
      } else {
        res.statusCode = 405;
        res.end(err.message);
      }
    });

    if (/js$/.test(req.url)) {
    
      const stat = fs.statSync(finalPath);
      res.setHeader("content-type", "application/javascript");
      res.setHeader("Last-Modified", formatToLastModify(stat.mtime));
      const now = Date.now();
      //const afterTenYears = new Date(now + 86400 * 365 * 10);
      //res.setHeader("expires",formatToLastModify(afterTenYears));
      res.setHeader("expires",'Fri, 30 Nov 2018 07:16:32 GMT');
      console.log('文件过期，进行资源请求');
    } else if (/css$/.test(req.url)) {
      res.setHeader("content-type", "text/css");
    } else if (/\/img\/.+/.test(req.url)) {
        const stat = fs.statSync(finalPath);
        const ifModifiedSince = headers['if-modified-since'];
        const fileLastModified = formatToLastModify(stat.mtime);
        //res.setHeader('Cache-Control','max-age=0')
        res.setHeader("Last-Modified", formatToLastModify(stat.mtime));
        //res.setHeader("Last-Modified", formatToLastModify(new Date(Date.now() - 8 * 3600 * 1000)));
        if(ifModifiedSince && ifModifiedSince === fileLastModified){
            res.statusCode = 304;
            return res.end();
        }
    }
    readstream.pipe(res);
  } catch (e) {
    res.statusCode = 500;
    res.statusMessage = "server interval error occur";
    res.end("the interval error occur !\n" + e.message);
  }
});
server
  .on("error", err => {
    console.error(err);
  })
  .on("listening", () => {
    console.log("server is start! listen on 127.0.0.1:3000");
  });
server.listen(3000, "127.0.0.1");

function formatToLastModify(time) {
  if (!(time instanceof Date)) return "";
  const timeString = time.toString();
  let timeArray = timeString.split(" ");
  let result = [];
  result.push(timeArray[0] + ",");
  result.push(timeArray[2]);
  result.push(timeArray[1]);
  result.push(timeArray[3]);
  result.push(timeArray[4]);
  result.push("GMT");
  return result.join(" ");
}
