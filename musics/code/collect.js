const https = require("https");
const fs = require("fs");
const path = require("path");
const { myGet, myRequest } = require("../config/index.js");
const { formatDate, average } = require("../utils/index.js");

// 爬取网易云音乐的起始url
const startUrl = "https://music.163.com/discover/artist/cat?id=1001";
const baseUrl = "music.163.com";

function fetchNameLetter() {
  return myGet(startUrl, (resolve, reject, data) => {
    let result = colletLetters(data);
    if (result.length == 0)
      return void reject(new Error(`歌手首字母列表获取失败`));
    resolve(result);
  });
}

// 获取首字母的url
function colletLetters(data) {
  let lisRe = /<ul.*?id="initial-selector">([\s\S]*?)<\/ul>/;
  let letterHrefRe = /<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g;
  let lis = data.match(lisRe);
  let lettersUrl = [];
  if (lis) {
    let letter = null;
    while ((letter = letterHrefRe.exec(lis[1]))) {
      lettersUrl.push({
        catalogue: letter[2],
        href: letter[1]
      });
    }
  }
  return lettersUrl;
}

// 根据首字母来获取对应歌手信息列表
function fetchSingersByLetter(catalogueInfo) {
  let singers = myRequest(
    baseUrl,
    catalogueInfo.href,
    (resolve, reject, data) => {
      let result = collectSingers(data);
      if (result.length == 0) return void reject(new Error("歌手信息获取失败"));
      resolve(result);
    }
  ).catch(err => {
    saveErrorLogs("fetchSingersByLetter", err);
  });
  return singers;
}

// 获取歌手的信息
function collectSingers(data) {
  let lisRe = /<ul.*?id="m-artist-box">([\s\S]*?)<\/ul>/;
  let singersHrefRe = /<a href="([^"]*)" class="nm nm-icn f-thide s-fc0"[^>]*>([^<]*)<\/a>/g;
  let lis = data.match(lisRe);
  let singersUrl = [];
  if (lis) {
    let singer = null;
    while ((singer = singersHrefRe.exec(lis[1]))) {
      singersUrl.push({
        name: singer[2],
        href: singer[1].replace(/\s/g, "")
      });
    }
  }
  return singersUrl;
}

// 使用正则表达式获取整个html中歌手的信息
function fetchSongsInfo(data) {
  /* let songRe = /<a href="(\/song\?id=\d+)">[\s\S]*?<b title="([^"]*)">[^<]*<\/b>[^<]*<\/a>/g; */
  // 经过测试发现使用爬虫爬到的html内容与实际游览器中的有区别
  let songRe = /<li><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
  let songInfo = null;
  let result = [];
  while ((songInfo = songRe.exec(data))) {
    result.push({
      songName: songInfo[2],
      href: songInfo[1].replace(/\s/g, "")
    });
  }
  return result;
}

// 收集对应歌手的歌曲，如果歌曲数目为0，那么则会主动reject
function collectSongs(singerInfo) {
  let path = singerInfo.href,
    name = singerInfo.name;
  let songs = myRequest(baseUrl, path, (resolve, reject, data) => {
    let result = fetchSongsInfo(data);
    if (result.length == 0)
      return void reject(
        new Error(`获取歌手【 ${name} 】歌曲信息失败或该歌手无歌曲`)
      );
    resolve(result);
  }).catch(err => {
    saveErrorLogs("collectSongs", err);
  });
  return songs;
}

// 信息保存到本地，这里都是采用同步操作来创建文件夹或者判断文件夹
const repositoryPath = path.resolve(__dirname, "../repository");
function saveToLocal(singerInfo, songs, catalogueInfo) {
  let name = singerInfo.name;
  let song = null;
  let data = [];
  while ((song = songs.shift())) {
    data.push(`曲名：${song.songName} 链接：https://${baseUrl + song.href}\n`);
  }
  let finalPath = `${repositoryPath}/${catalogueInfo.catalogue.replace(
    /\s/g,
    ""
  )}`;
  fs.writeFile(`${finalPath}/${name}.txt`, data.join("\n"), err => {
    if (err) {
      saveErrorLogs("saveToLocal", err);
    } else {
      saveLogs(
        `${formatDate(Date.now())}  歌手【 ${name} 】推荐歌曲信息成功获取\n`
      );
    }
  });
}

// 保存错误日志
const logsPath = path.resolve(__dirname, "../logs");
function saveErrorLogs(functionName, error) {
  if (functionName == null || error == null) return;
  let now = Date.now();
  let date = formatDate(now, "yyyy-MM-dd");
  let dateWithSeconds = formatDate(now);
  fs.appendFile(
    `${logsPath}/${date}.error.log`,
    `${dateWithSeconds} 异常函数：${functionName || "匿名函数"}  ${
      error
    }\n`,
    err => {
      if (err) console.error(err);
    }
  );
}

// 保存普通日志
function saveLogs(info) {
  if (!info) return;
  info = info.toString();
  let date = formatDate(Date.now(), "yyyy-MM-dd");
  fs.appendFile(`${logsPath}/${date}.log`, info, err => {
    saveErrorLogs("saveLogs", err);
  });
}

// 用同步操作去判断，如果不存在对应目录，则创建
function mkdirIfnot(path, needSaveLog = true) {
  try {
    fs.accessSync(path);
  } catch (e) {
    try {
      fs.mkdirSync(path);
      needSaveLog &&
        saveLogs(
          `${formatDate(Date.now())} 文件目录${path}不存在，现在已经创建成功\n`
        );
    } catch (e) {
      needSaveLog && saveErrorLogs("saveTolocal", e);
    }
  }
}

// 可以有parallels个请求一起触发
async function start(parallels = 1) {
  // 因为打印日志是每个步骤都有的，首先需要同步检查是否存在对应的logs目录，必须放在第一位
  mkdirIfnot(logsPath);
  // 检查是否存在repository目录，如果没有就创建对应目录
  mkdirIfnot(repositoryPath);
  let startInfo =  `-----------------${formatDate(
    Date.now()
  )}  爬虫任务开始进行-----------------\n\n`;
  console.log(startInfo);
  saveLogs(startInfo);
  // 如果此fetchNameLetter被reject，那么下面的代码将不会执行，直接跳转至start().catch
  let letters = await fetchNameLetter();
  let tasks = average(letters, parallels);
  try {
    for (let i = 0, len = tasks.length; i < len; i++) {
      let catalogue = tasks[i];
      let catalogueInfos = catalogue.map(catalogueInfo => {
        mkdirIfnot(repositoryPath + "/" + catalogueInfo.catalogue);
        return {
          catalogueInfo,
          singersInfo: fetchSingersByLetter(catalogueInfo)
        };
      });
      for (let j = 0, len2 = catalogueInfos.length; j < len2; j++) {
        let { catalogueInfo, singersInfo } = catalogueInfos[j];
        let singers = await singersInfo;
        for (let k = 0, len3 = singers.length; k < len3; k++) {
          let singer = singers[k];
          let songs = await collectSongs(singer);
          if (songs) saveToLocal(singer, songs, catalogueInfo);
        }
      }
    }
    return '爬虫任务执行完毕！';
  } catch (e) {
    saveErrorLogs("start", e);
    return '爬虫因为异常而终止！';
  }
}

// 任务开始
start(10).catch(error => {
  saveErrorLogs("main", error);
  return '爬虫因为异常而终止！';
}).then(info=>{
  let endInfo = `-----------------${formatDate(
    Date.now()
  )}  ${info}-----------------\n\n`;
  console.log(endInfo);
  saveLogs(endInfo);
});
