const https = require("https");
const headers = {
  "user-Agent":
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3554.0 Safari/537.36"
};

// 爬取网易云音乐的起始url
const startUrl = "https://music.163.com/discover/artist/cat?id=1001";
const baseUrl = "music.163.com";
exports.startUrl = startUrl;
exports.baseUrl = baseUrl;

// 这里在请求头里面必须要添加user-Agent来模仿游览器，否则无法获取歌手信息
function myRequest(hostname, path, callback) {
  return new Promise((resolve, reject) => {
    const options = {
      headers,
      hostname,
      path
    };
    const req = https.request(options, res => {
      let data = "";
      const { statusCode } = res;
      if (statusCode !== 200)
        return void reject(
          new Error(`${hostname + path}请求状态码失败：${statusCode}`)
        );
      res.on("data", d => {
        data += d;
      });
      res.on("end", () => {
        callback(resolve, reject, data);
      });
      res.on("error", e => {
        reject(e);
      });
    });

    req.on("error", e => {
      reject(e);
    });
    req.end();
  });
}

// 简单封装https.get
function myGet(url, callback) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        const { statusCode } = res;
        if (statusCode != 200)
          return void reject(
            new Error(`请求${startUrl}返回状态码错误：${statusCode}`)
          );
        let data = "";
        res
          .on("data", d => {
            data += d;
          })
          .on("end", () => {
            callback(resolve, reject, data);
          })
          .on("error", err => {
            reject(err);
          });
      })
      .on("error", err => {
        reject(err);
      });
  });
}

exports.myRequest = myRequest;
exports.myGet = myGet;
