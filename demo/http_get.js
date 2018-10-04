const https = require("https");
const fs = require("fs");

function getBlogs(url, index) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      const { statusCode } = res;
      if (statusCode != 200) return void reject(`状态码错误！${statusCode}`);
      let data = "";
      res.on("data", d => {
        data += d;
      });
      res.on("end", d => {
        console.log(`已经爬取完成第${index}页内容`);
        processData(data, index, resolve, reject);
      });
    });
  });
}

function getBlogs2(index) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "www.cnblogs.com",
      path: "/mvc/AggSite/PostList.aspx",
      method: "POST"
    };
    let postParams = {
      AjaxCallbak: null,
      AjaxUrl: "/mvc/ToolkitPaging/load.aspx",
      FirstPageLink: "/",
      IsRenderScript: true,
      OnlickJsFunc: "aggSite.loadCategoryPostList()",
      OnlyLinkText: false,
      PageIndex: index,
      PageSize: 20,
      ShowPageCount: 5,
      SkipCount: 0,
      TopPagerId: "pager_top",
      TotalCount: 4000,
      UrlFormat: "/sitehome/p/{0}"
    };

    const req = https.request(options, res => {
      let data = "";
      res.on("data", d => {
        data += d;
      });
      res.on("end", () => {
        console.log(`已经爬取完成第${index}页内容`);
        processData(data, index, resolve, reject);
      });
    });

    req.on("error", e => {
      console.error(e);
    });
    req.write(JSON.stringify(postParams));
    req.end();
  });
}

const titleReg = /<a class="titlelnk" href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<img.*?src="([^"]+)".*>/g;

async function processData(data, index, resolve, reject) {
  if (data) {
    let fn = index == 1 ? fs.writeFile : fs.appendFile;
    let match = null;
    let res = `\n第${index}页内容：\n\n`;
    let imgsUrl = [];
    while ((match = titleReg.exec(data))) {
      let title = match[2],
        href = match[1],
        imgHref = "https:" + match[3];
      res += `标题：${title}\n链接：${href}\n图片链接：${imgHref}\n`;
      imgsUrl.push(imgHref);
    }

    /* for(let i = 0;i<imgsUrl.length;i++){
      await downLoadPic(imgsUrl[i]);
    } */
    imgsUrl.forEach(url => {
     // downLoadPic(url);
    });

    fn.call(fs, "blogs.txt", res, err => {
      if (err) {
        reject(err.message);
      } else {
        resolve();
      }
    });
  } else {
    reject("没有有效数据！");
  }
}

async function appendRes() {
  for (let i = 1; i <= getPages; i++) {
    try {
      await getBlogs(baseUrl + i, i);
    } catch (e) {
      saveErrorLog(e);
    }
  }
}

function downLoadPic(url) {
  return new Promise((resolve, reject) => {
    let match = url.match(/(\d+)\.\w+(?:\?id=\d+)?$/),
      name = "";
    if (match) {
      name = match[1];
    } else {
      return void reject(`url：${url}图片下载失败，reason：${err.message}`);
    }
    https.get(url, res => {
      const { statusCode } = res;
      if (statusCode == 200) {
        let data = Buffer.alloc(0);
        res.on("data", d => {
          data = Buffer.concat([data, d], data.length + d.length);
        });
        res.on("end", () => {
          fs.writeFile(`./demo/imgs/${name}.png`, data, err => {
            if (err) {
              saveErrorLog(err);
              reject(`url：${url}图片下载失败，reason：${err.message}`);
            }
            resolve();
          });
        });
        res.on("error", err => {
          saveErrorLog(err);
          reject(`url：${url}图片下载失败，reason：${err.message}`);
        });
      } else {
        reject(`${url}图片下载失败！`);
        res.resume();
      }
    });
  });
}

function saveErrorLog(e) {
  let date = new Date();
  let logNames =
    date.getFullYear() +
    "-" +
    ("0" + date.getMonth()).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2);
  fs.appendFile(
    `./demo/logs/${logNames}.log`,
    `${new Date()} - ${e.message}\n`,
    err => {
      console.error(err);
    }
  );
}

const getPages = 300;
let baseUrl = "https://www.cnblogs.com/mvc/AggSite/PostList.aspx?PageIndex=";
appendRes().catch(error => {
  saveErrorLog(error);
});
exports.getBlogs = getBlogs;
