const fs = require("fs");
// 1.如果在异步文件的读取时候，writeStream.close()为同步函数，end()会自动触发close()。destory也会关闭文件流
// 2.第二次文件的追加必须在第一次文件流关闭以后，不然会丢失数据(可以使用appendFile，或者通过fs.open获取文件句柄，然后
//   在用createWriteStream中的options.fd options.flag = 'a'来打开文件添加数据)
// 3.对图片的二进制使用toString()然后在对字符串使用Buffer.from(data)转为来的二进制文件不等于之前的二进制内容
// 4.如果readable同时添加了data和readable时间，那么第一时间会触发data事件，会把可读的buffer清空，然后在触发readalbe
// 事件，所以readable中使用readable.read()读取的内容一直为空

function testReadable() {
  let readable = fs.createReadStream("wl.jpg");
  let res = readable.read();

  let da = Buffer.alloc(0);
  readable.on("data", d => {
    da = Buffer.concat([da, d], da.length + d.length);
  });
  readable.on("end", () => {
    let data = Buffer.from(da.toString("utf-8"), "utf-8");
    fs.writeFile("wl2.png", data, () => {});
  });
}
