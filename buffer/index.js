/* const fs = require('fs');
const path = require('path')
const imagePath = path.resolve(__dirname,'wl.jpg')
const buf1 = fs.readFileSync(imagePath);
var data = buf1.toString('base64');
fs.writeFileSync('copy.png',Buffer.from(data,'base64'))
console.log(data) */
/* const buf = Buffer.from([0x35, 0x34, 0x56]);

// Prints: 1234
console.log(buf.readUInt16LE(0).toString(16)); */
/* const buf = Buffer.from([5, 255 + 256,0,0]);

// Prints: 5
console.log(buf.readUInt32BE().toString(10));

// Prints: 1280
console.log(buf.readInt16LE()); */
/* let buf = Buffer.from('你好，123xwt','utf-8') //Buffer(15) [228, 189, 160, 229, 165, 189, 239, 188, …]
console.log(buf) */
let buf = Buffer.from([-1,256,-3.11,[],'2.55.'])
console.log(buf)
// 1(符号位，负数)111 1111 0000 0001 0000 0001 0000 0001
// 相当于 -0111 1111 0000 0001 0000 0001 0000 0001
// 如果在有符号的数值中，最高位代表的是符号，0表示为正数，1表示为负数。除去最高位后，后面的内容都是代表了数值
// 正数的原码补码反码都是自身，既除去最高位后面的内容
// 负数的原码就是除去最高位后面的内容，反码就是原码取反，0变成1,1变成0。补码就是反码的最低位加1。
// 由于在计算机中一切数值都是用补码来表示的，所以最后补码的值就是最终的值，前面在加上符号位即可。
const buf1 = Buffer.from([127,1,1,1]);
console.log(buf1.readInt32BE(0))