function asyncTest(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve(1);
        },1000);
    })
}
module.exports = asyncTest;