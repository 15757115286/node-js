const multiparty = require("multiparty");
const fs = require("fs");

function getData(req) {
  return new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    req.on("data", d => {
      data = Buffer.concat([data, d], data.length + d.length);
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", () => {
      reject("has an error in the IncomingMessage");
    });
  });
}

const UPLOAD_OPTIONS = {
  imagePath: "",
  autoSave: false,
  useRandomFileName: false
};

// 自动上传文件的后缀为之前FormData中第三个参数值的后缀
function upload(req, options = {}) {
  return new Promise((resolve, reject) => {
    let form = new multiparty.Form();
    // 开始解析请求
    let result = Object.create(null);
    let { imagePath, autoSave, useRandomFileName } = Object.assign(
      {},
      UPLOAD_OPTIONS,
      options
    );
    form.parse(req);
    form.on("part", function(part) {
      if (!part.filename) {
        part.on("readable", () => {
          let chunk;
          while ((chunk = part.read()) !== null) {
            _push(result,part.name,chunk.toString());
          }
        });
      }
      let filename = part.filename;
      if (filename) {
        let localFileName = useRandomFileName
          ? _getRandomName("upload_") + _getFileSuffix(filename)
          : filename;
        _push(result,part.name,{
          filename,
          file: part,
          localFileName
        })
        if (autoSave && imagePath)
          part.pipe(fs.createWriteStream(imagePath + "/" + localFileName));
      }
      part.on("error", function(err) {
        reject(err);
      });
    });
    form.on("close", function() {
      resolve(result);
    });
    form.on("error", function(err) {
      reject(err);
    });
  });
}

function _getRandomName(prefix = "") {
  return prefix + Date.now();
}

function _getFileSuffix(fileName) {
  let suffix = "";
  if (typeof fileName === "string") {
    let suffixRe = /\..*$/;
    let match = fileName.match(suffixRe);
    match && (suffix = match[0]);
  }
  return suffix;
}

function _push(result,key,value){
  let res = result[key];
  res ? res.push(value) : result[key] = [value];
  
}
exports.upload = upload;
exports.getData = getData;
