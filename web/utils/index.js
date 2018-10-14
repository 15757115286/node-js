const fs = require('fs');
const path = require('path');
// 格式化日期选项
function formatDate(date,format = 'yyyy-MM-dd hh:mm:ss'){
    try{
        date = new Date(date)
    }catch(e){
        return null;
    }
    let times = {
        yyyy:date.getFullYear(),
        MM:('0' + (date.getMonth() + 1)).slice(-2),
        dd:('0' + date.getDate()).slice(-2),
        hh:('0' + date.getHours()).slice(-2),
        mm:('0' + date.getMinutes()).slice(-2),
        ss:('0' + date.getSeconds()).slice(-2)
    }
    return format.replace(/\w+/g,function(match){
        return times[match];
    })
}

// 将一个数组分成每个有n个数的二维数组
function average(array,num = 1){
    if(!Array.isArray(array) || typeof num !== 'number') return array;
    num = Math.floor(num);
    if(num <= 0 || array.length === 0 ) return array;
    let result = [],copyOfArray = Array.from(array);
    while(copyOfArray.length){
        result.push(copyOfArray.splice(0,num));
    }
    return result;
}
exports.average = average;
exports.formatDate = formatDate;

async function createDir(_path,mode){
    if(typeof _path !== 'string')
        throw new TypeError('the first arguments and must be a not empty string');
    let paths = _path.split(/\\/);
    if(paths.length === 0)
        throw new Error('must use absolute path');
    let curPath,realPath = paths.shift();
    while(curPath = paths.shift()){
        realPath = realPath + '\\' + curPath;
        await _createDir(realPath,mode);
    }
}

function _createDir(path,mode){
    return new Promise((resolve,reject)=>{
        if(!path || typeof path !== 'string') reject(new TypeError('path sholud be a not empty string'));
        let isExist = fs.existsSync(path);
        if(isExist) return resolve();
        fs.mkdir(path,mode,err =>{
            if(err) return reject(err);
            resolve();
        })
    })
}

exports.createDir = createDir;