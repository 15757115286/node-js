const https = require("https");
const fs = require("fs");
const { myGet, myRequest } = require("../config/index.js");

// 爬取网易云音乐的其实url
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
        href: singer[1]
      });
    }
  }
  return singersUrl;
}

async function test() {
  let letters = await fetchNameLetter();
  for (let i = 0, len = letters.length; i < len; i++) {
    try {
      let result = await fetchSingersByLetter(letters[i]);
      return result;
    } catch (e) {}
  }
}

test()
  .catch(error => {
    console.log(error);
  })
  .then(result => {
    let info = result.filter(info => {
      return info.name == "许嵩";
    })[0];
    console.log(info);
  });
