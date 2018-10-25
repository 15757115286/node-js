/* function log(...params){
    console.log(...params);
}
log([0,0] == false)
let o = {
    name:1,
    toString(){
        return this.name + 'hah'
    }
}
Array.prototype.toString = function(){
    return '5201314'
}
Array.prototype.valueOf = function(){
    return '222222'
}
let array = [1,2,3,4,undefined,null,5]
console.log(String(array))
Number.prototype.toString = function(){
    console.log(this);
    return 333
}
console.log(String(Infinity));
let a = [1,2,3,4,5,6];
a.valueOf = function(){
    return 11212;
}
console.log(+a) */
/* let { valueOf,toString } = Array.prototype;
Array.prototype.valueOf = function(){
    console.log('valueOf');
    return valueOf.apply(this,arguments);
}
Array.prototype.toString = function(){
    console.log('toString');
    return toString.apply(this,arguments);
}
console.log([] == ![]); */

/* let { valueOf,toString } = Date.prototype;
Date.prototype.valueOf = function(){
    console.log('valueOf');
    return valueOf.apply(this,arguments);
}
Date.prototype.toString = function(){
    console.log('toString');
    return toString.apply(this,arguments);
}
let date = new Date();
console.log(date == date.getTime()); */

//console.log([] == [])
let a = {
  valueOf() {
    console.log('a valueOf');
    return 4;
  },
  toString() {
    console.log('a toString');
    return 77;
  }
};

let b = {
    valueOf() {
        console.log('b valueOf');
        return 11;
    },
    toString(){
        return a;
    }
}
let c = {};
c.valueOf = undefined;
c.toString = undefined;
c[Symbol.toPrimitive] = function(){return {}}
console.log(String(c))
