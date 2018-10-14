const http = require('http');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const DEFAULT_LOGS_PATH = path.resolve(__dirname,'logs')
const { createDir , formatDate } = require('../web/utils/index')
const DEFAULT_OPTIONS = {
    logsDir:DEFAULT_LOGS_PATH,
    logsNamePrefix:'logs',
    logsNameSuffix:'log',
    checkLogsDir:true,
    serverOptions:null
}
class Server extends EventEmitter{
    constructor(requestListener,options = {}){
        super();
        this._requestListener = requestListener;
        options = this._options = Object.assign({},DEFAULT_OPTIONS,options);
        let _res = (req,res)=>{
            if(typeof this._requestListener === 'function'){
                this._requestListener.call(this,{
                    req,
                    res
                })
            }
        };
        let args = [_res];
        if(options.serverOptions) args.unshift(options.serverOptions);
        this._server = http.createServer.apply(http,args);
        this._server.on('error',async (err)=>{
            let logsDir = options.logsDir;
            let errors = [err];
            try{
                if(options.checkLogsDir && !fs.existsSync(logsDir)) await createDir(logsDir);
            }catch(e){
               errors.push(e);
            }finally{
                let _now = Date.now();
                let date = formatDate(_now,'yyyy-MM-dd'),
                    dataWithSeconds = formatDate(_now);
                let data = errors.map(error=>{
                    console.error(error);
                    return `${dataWithSeconds}：${error && error.message || 'null'}`
                }).join('\n');
                let fileName = options.logsNamePrefix + '_error_' + date + '.' + options.logsNameSuffix;
                fs.appendFile(path.resolve(logsDir,fileName),`${data} \n`,err=>{
                    if(err) console.error(err);
                })
                if(this.eventNames().includes('error')) this.emit('error',err);
            }
        }) 
    }

    listen(...args){
        this._server.listen.apply(this._server,args);
        return this;
    }
}

let server = new Server(({req,res}) => {
    res.end('hello world')
}).listen(3000,'127.0.0.1');
server.on('error',()=>{})

