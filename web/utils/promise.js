function Promise(fn){
    if(typeof fn !== 'function'){
        throw new TypeError('the argument of Promise must be function!');
    }
    this.status = 'pending';
    this.value = undefined;
    this.onfulfilled = null;
    this.onrejected = null;
    this.timer = null;
    var self = this;
    function resolve(value){
        if(self.status !== 'pending') return;
        self.status = 'resolved';
        self.value = value;
        if(typeof self.onfulfilled === 'function'){
            self.onfulfilled(value);
        }
    }
    // the reject function provide for the promise
    function reject(error){
        if(self.status !== 'pending') return;
        self.status = 'rejected';
        self.value = error;
        if(typeof self.onrejected === 'function'){
            self.onrejected(error);
        }else{
            self.timer = setTimeout(function(){
                throw new Error('Uncaught (in promise) ' + error);
            });
        }
    }

    try{
        fn(resolve,reject);
    }catch(error){
        reject(error);
    }
}

// the then function of the Promise prototype
Promise.prototype.then = function(success,fail){
    var self = this;
    if(this.status === 'resolved'){
        return new Promise(function(resolve,reject){
            try{
                if(typeof success === 'function'){
                    var result = success(self.value);
                    if(result instanceof Promise) {
                        result.then(resolve,reject);
                    }else{
                        resolve(result);
                    }
                }else{
                    resolve(self.value);
                }
            }catch(error){
                reject(error);
            }
        });
    }else if(this.status === 'rejected'){
        return new Promise(function(resolve,reject){
            try{
                self.timer && clearTimeout(self.timer);
                self.time = null;
                if(typeof fail === 'function'){
                    var result = fail(self.value);
                    if(result instanceof Promise){
                        result.then(resolve,reject);
                    }else{
                        resolve(result);
                    }
                }else{
                    reject(self.value);
                }
            }catch(error){
                reject(error);
            }
        });
    }else{
        return new Promise(function(resolve,reject){
            self.onfulfilled = function onfulfilled(value){
                try{
                    if(typeof success === 'function'){
                        var result = success(value);
                        if(result instanceof Promise){
                            result.then(resolve,reject);
                        }else{
                            resolve(result);
                        }
                    }else{
                        // 这一步操作是如果在当前then中没有传入success回调，则把当前Promise的结果值传递下去
                        resolve(value);
                    }
                }catch(error){
                    reject(error);
                }
            }
            self.onrejected = function onrejected(error){
                try{
                    /* self.timer && clearTimeout(self.timer);
                    self.time = null; */
                    if(typeof fail === 'function'){
                        var result = fail(error);
                        if(result instanceof Promise){
                            result.then(resolve,reject);
                        }else{
                            resolve(result);
                        }
                    }else{
                        // 这一步操作是如果Promise捕获错误但是并没有对应的fail函数，则把错误一直传递下去直到遇到fail函数或者catch
                        reject(error)
                    }
                }catch(error){
                    reject(error);
                }
            }
        });
    }
}

Promise.resolve = function resolve(value){
    if(value instanceof Promise) return value;
    return new Promise(function (resolve,reject){
        resolve(value);
    })
}

Promise.reject = function reject(value){
    return new Promise(function(resolve,reject){
        reject(value);
    })
}

Promise.race = function race(array){
    array = Array.isArray(array) ? array : [array];
    return new Promise(function(resolve,reject){
        for(var i = 0, len = array.length;i<len;i++){
            var promise = array[i];
            if(promise instanceof Promise){
                promise.then(resolve,reject);
            }else{
                Promise.resolve(promise).then(resolve,reject);
            }
        }
    })
}

Promise.all = function all(array){
    array = Array.isArray(array) ? array : [array];
    var remain = array.length;
    var result = [];
    return new Promise(function(resolve,reject){
        for(var i = 0, len = array.length;i<len;i++){
            var promise = array[i];
            if(promise instanceof Promise){
                (function executeor(i){
                    promise.then(function res(value){
                        result[i] = value;
                        if(--remain == 0){
                            resolve(result);
                        }
                    },reject);
                })(i);
            }else{
                result[i] = promise;
                if(--remain == 0){
                    resolve(result);
                }
            }
        }
    })
}

Promise.prototype.catch = function (fn){
    return this.then(null,fn)
}

Promise.prototype.finally = function (cb){
    if(typeof cb !== 'function') cb = function noop(){};
    return this.then(function resolve(value){
        return Promise.resolve(cb()).then(function(){
            return value;
        })
    },function reject(error){
        return Promise.resolve(cb()).then(function(){
            throw error;
        })
    })
}


/* var time = Date.now();
var promise = new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve('xwt');
    },2000);
    console.log(111);
}).then(value=>{
    console.log(Date.now() - time);
    return new Promise(res=>{
        setTimeout(()=>{
            res(value)
        },1000)
    })
}).finally(()=>{
    console.log(Date.now() - time);
    console.log('finally');
}).then(r=>{
    console.log('after finally ' + r)
}).catch(1).catch(e=>{
    console.log(e)
}) */
/* Promise.race([new Promise((res,rej)=>{
   rej('xwt')
}),2]).then(res=>{
    console.log('success' + res)
}).catch(e=>{
    console.log('error' + e)
}) */
/* Promise.all([new Promise(res=>{
    setTimeout(()=>{
        res('cm')
    },1000)
}),Promise.resolve('xwt'),3]).catch(e=>{
    console.log(e);
}).then(res=>{
    console.log(res)
}) */
new Promise((res,rej)=>{
    //rej('cm');
    setTimeout(rej,0,'xwt')
}).catch(null).then(res=>{}).catch(e=>{
    console.log(e)
})