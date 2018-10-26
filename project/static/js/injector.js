(function(global, factory) {
  var injector = factory(global);
  if (global) {
    global.injector = injector;
  }
})(typeof window === "object" ? window : global, function factory(global) {
  "use strict";
  // 依赖仓库
  var depsRepository = Object.create(null);
  // 注册依赖
  var register = function(key, value) {
    if (typeof key !== "string") {
      throw new TypeError("the first argument must be string");
    }
    if (depsRepository[key]) {
      throw new Error("has the same dep name in the repository");
    }
    depsRepository[key] = value;
    return injector;
  };
  // 解析依赖
  var depsRe = /^function[^(]*\(([^)]*)\)/;
  var resolve = function(deps, fn, scope) {
    if (typeof deps === "function") {
      scope = fn;
      fn = deps;
      if (typeof fn !== "function") {
        throw new TypeError("if the first argument is not function,the second argument must be function");
      }
      var fnStr = fn.toString();
      deps = fnStr
        .match(depsRe)[1]
        .replace(/\s/g, "")
        .split(",");
    }
    if (!Array.isArray(deps)) {
      throw new TypeError("the fist argument must be array or function");
    }
    if (typeof fn !== "function") {
      throw new TypeError("the second argument must be function");
    }
    return function resolve(){
        var args = [];
        var a = [].slice.call(arguments);
        deps.forEach(function(depName) {
          var value = depsRepository[depName];
          args.push(value || a.shift());
        });
        return fn.apply(scope,args);
    }
  };
  var injector = {
    register: register,
    resolve: resolve
  };
  return injector;
});
