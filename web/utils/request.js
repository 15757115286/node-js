function getData(req){
    return new Promise((resolve,reject)=>{
        let data = Buffer.alloc(0);
        req.on("data",d=>{
            data = Buffer.concat([data,d],data.length + d.length);
        });
        req.on("end",()=>{
            resolve(data);
        })
        req.on("error",()=>{
            reject('has an error in the IncomingMessage');
        })
    })
}
exports.getData = getData;