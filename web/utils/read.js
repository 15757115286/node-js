const fs = require("fs");
const { getData } = require("./request.js")

function getFile(path){
    return new Promise((resolve,reject)=>{
        fs.readFile(path,(err,data)=>{
            if(err) return reject(error);
            resolve(data);
        })
    })
}

async function processFormData(req){
    let data = await getData(req);
    data = data.toString();
    let boundaryMatch = req.headers['content-type'].match(/----.+$/);
    let result = {};
    if(!boundaryMatch) return result;
    let rawData = data.split(boundaryMatch[0]);
    let length = rawData.length;
    // 舍弃开头和末尾的'--'项
    rawData = rawData.slice(1,length - 1);
    let dataItemRe = /\s*Content-Disposition: form-data; name="([^"]*)"(?:;\s*filename="([^"]*)")?(?:\r\nContent-Type:.+)?\r\n\r\n([\s\S]*)\r\n--$/;
    rawData.forEach(item=>{
        let match = item.match(dataItemRe);
        if(match) result[match[1]] = match[3];
    })
    return result;
}

exports.getFile = getFile;
exports.processFormData = processFormData;