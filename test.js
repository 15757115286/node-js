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

// 读取流刚创建的时候调用isPaused返回的是false，但是此时是没有数据生成的。
// 这个时候readable._readableState.flowing = null，是初始化的状态。
// 此时如果调用readable.pipe() || readable.on('data',d=>{...}) || readable.resume()，
// 都会使得readable._readableState.flowing = true（添加data事件只有在readable._readableState.flowing = null的时候才能设置为true），
// readable.pipe()可以显示的将readable._readableState.flowing = false 变成 true，同时也会触发data的监听事件
// 前两种方式都会将产生的数据丢给“消费”的函数，只有第三种情况会把数据流失掉（如果没有监听data事件），
// 一般也用readable.resume()去消耗不需要处理的数据。

function testPasueAndResume(){
    //let readable = fs.createReadStream("wl.jpg");
    let readable = new fs.ReadStream('wl.txt');
    // 显示的暂定
    readable.pause();
    isPaused = readable.isPaused();
    /* setTimeout(()=>{
        let chunk = readable.read();
        console.log(chunk.toString())
    },1000); */
    readable.on('data',d=>{
        console.log(d.length)
    })

    readable.on('end',()=>{
        console.log('end');
    })
    // 这里猜测文件流的生成是在下个事件循环时候开始的
    /* setTimeout(()=>{
        console.log('start resume')
        readable.resume();
    },10000) */
   // readable.pipe(new fs.createWriteStream('mywl.txt'));
   // readable.resume();
}   
// testPasueAndResume();

// data事件也会在readable.read的时候触发
// 这里的输出顺序证明了从readable.read以后，是同步的去触发了data事件的回调。
function testEmitDataEventWhenRead(){
    let readable = fs.createReadStream('wl.txt');
    readable.pause();
    console.log(readable.isPaused()); // true 表示文件流处于停止的状态
    let data = Buffer.alloc(0);
    readable.on('data',d=>{
        data = Buffer.concat([data,d],data.length + d.length);
        console.log(d.length,'in data event'); // 3.输出 2 in data event
    })
    readable.on('end',()=>{
        console.log(data.toString());// 5. 输出 栗山未来
    })
    setTimeout(()=>{
        console.log('in time out before read') // 2.输出 in time out before read
        let buf = readable.read(2);
        console.log(buf.length,'in setTimeout'); // 4.输出2 in setTimeout
    },1000)
    console.log('sync code end');// 1.输出 sync code end
}
// testEmitDataEventWhenRead();
// 文件读取时候触发readable的次数取决于文件的大小和highWaterMark的值。如果highWaterMark的值大，那么读取的文件速度相应来说也会快（因为减少对磁盘系统的调用）
// 但是产生的问题是可能会造成内存的剩余当文件大小小于highWaterMark的时候。一开始申请的Buffer内存大小为highWaterMark。当读取流到末尾的时候，会触发end事件

// 如果readable同时添加了data和readable时间，那么第一时间会触发data事件，会把可读的buffer清空，然后在触发readalbe
// 事件，所以readable中使用readable.read()读取的内容一直为空
function testEmitReadableEventWhenRead(){
    let readable = fs.createReadStream('wl.jpg',{highWaterMark:1024});
    let count = 0;
    let chunk = Buffer.alloc(0);
    readable.on('readable',()=>{
        console.log('readable',++count);// 这里假设图片为15.4k，那么会输出readable 16 打印16次
        let data = readable.read();
        if(data){
            console.log(data.length);
            chunk = Buffer.concat([chunk,data],chunk.length + data.length);
        }
    })
    readable.on('end',()=>{
        let writalbe = fs.createWriteStream('wlOfcopy.jpg');
        writalbe.write(chunk,err=>console.log(err));
    })
}
testEmitReadableEventWhenRead();
