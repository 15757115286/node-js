const https = require("https");
const fs = require("fs");
const path = require("path");
const {
  myGet,
  myRequest
} = require("../config/index.js");

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
      lettersUrl.push(letter[1]);
    }
  }
  return lettersUrl;
}

function fetchSingersByLetter(path) {
  return myRequest(baseUrl, path, (resolve, reject, data) => {
    let result = collectSingers(data);
    if (result.length == 0) return void reject(new Error("歌手信息获取失败"));
    resolve(result);
  });
}

// 获取歌手的url
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
        href: singer[1].replace(/\s/g,'')
      });
    }
  }
  return singersUrl;
}

function fetchSongsInfo(data){
  /* let songRe = /<a href="(\/song\?id=\d+)">[\s\S]*?<b title="([^"]*)">[^<]*<\/b>[^<]*<\/a>/g; */
  // 经过测试发现使用爬虫爬到的html内容与实际游览器中的有区别
  let songRe = /<li><a href="([^"]+)">([^<]+)<\/a><\/li>/g
  let songInfo = null;
  let result = [];
  while(songInfo = songRe.exec(data)){
    result.push({
      songName:songInfo[2],
      href:songInfo[1].replace(/\s/g,'')
    })
  }
  return result;
}

function collectSongs(singerInfo){
  let path = singerInfo.href,
      name = singerInfo.name;
  return myRequest(baseUrl,path,(resolve,reject,data)=>{
    let result = fetchSongsInfo(data);
    if(result.length == 0) return void reject(new Error(`获取歌手${name}歌曲信息失败`));
    resolve(result);
  })
}

const repositoryPath = path.resolve(__dirname,'../repository');
function saveToLocal(singerInfo,songs){
  let name = singerInfo.name;
  let song = null;
  let data = [];
  while(song = songs.shift()){
    data.push(`曲名：${song.songName} 链接：https://${baseUrl + song.href}\n`);
  }
  fs.writeFile(`${repositoryPath}/${name}.txt`,data.join('\n'),err=>{
    if(err) console.error(err);
    console.log(`歌手${name}的歌曲列表获取失败！`)
  })
}

// 可以有parallels个请求一起触发
async function start(parallels = 1) {
  let letters = await fetchNameLetter();
  for (let i = 0, len = letters.length; i < len; i++) {
    try {
      let singers = await fetchSingersByLetter(letters[i]);
      for(let j = 0,len2 = singers.length;j<len2;j++){
        let singer = singers[j];
        let songs = await collectSongs(singers[j]);
        saveToLocal(singer,songs)
      }
    } catch (e) {
      console.log(e);
    }
  }
}

start()
  .catch(error => {
    console.log(error);
  });