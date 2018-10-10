var OPTIONS = {
  method: "GET",
  type: "json",
  url: "",
  success: null,
  error: null,
  progress: null,
  upload: null,
  headers: {},
  data: null,
  timeout: 0,
  dataFormat: "json" // json/form/fromData
};

var toString = Object.prototype.toString;

function _isObject(obj) {
  return toString.call(obj) === "[object Object]";
}

function _from(arraylike) {
  var slice = Array.prototype.slice;
  var args = slice.call(arguments, 1);
  return slice.apply(arraylike, args);
}

function ajax(options) {
  if (!_isObject(options)) options = {};
  options = Object.assign({}, OPTIONS, options);
  // 请求的url
  var url = options.url;
  // 请求的类型
  var method = options.method;
  // 没有指定url参数则返回
  if (!url) return;
  var xhr = new XMLHttpRequest();
  // 数据处理
  var data = options.data;
  var result, key;
  var _method = method.toLowerCase();
  if (_method === "get") {
    if (_isObject(data)) {
      result = [];
      for (key in data) {
        result.push(key + "=" + data[key]);
      }
      url = url + "?" + result.join("&");
    }
    data = null;
  } else {
    let dataFormat = options.dataFormat.toLowerCase();
    if (!_isObject(data)) {
      data = null;
    } else {
      if (dataFormat === "json") {
        data = _formatToJson(data);
      } else if (dataFormat === "form") {
        data = _formatToForm(data);
      } else if (dataFormat === "formdata") {
        data = _formatToFormData(data);
      }
    }
  }
  // 所有的ajax都为异步，这里默认不能设置为同步
  xhr.open(method, url, true);
  // 需要返回的类型，默认为json类型
  var type = options.type;
  xhr.responseType = type;
  var headers = options.headers;
  // 设置请求头必须放在xhr.open之后和xhr.send之前
  for (key in headers) {
    xhr.setRequestHeader(key, headers[key]);
  }
  // 设置超时时间。如果timeout为0，则无超时。超时触发timeout事件。
  xhr.timeout = options.timeout;
  // 挂载事件监听
  _initEvents(xhr, options);
  // 发送请求
  xhr.send(data);
  // 可以根据返回的xhr调用xhr.abort()来终止本次请求
  return xhr;
}

// 空操作函数
var noop = function noop() {};

function _initEvents(xhr, options) {
  // xhr状态发生改变
  var success = typeof options.success === "function" ? options.success : noop;
  var error = typeof options.error === "function" ? options.error : noop;
  // xhr的progress需要在lengthComputable为true的时候才能确定total的长度，这个需要在响应头里面设置Content-Length:100这样的内容，长度为字节长度
  var progerss =
    typeof options.progress === "function" ? options.progress : noop;
  xhr.onreadystatechange = function() {
    var successCode = [200, 304];
    if (
      successCode.indexOf(xhr.status) > -1 &&
      xhr.readyState === XMLHttpRequest.DONE
    ) {
      success(xhr.response);
    }
  };
  xhr.onerror = xhr.ontimeout = xhr.onabort = error;
  xhr.onprogress = progerss;
}

function _formatToJson(data) {
  return JSON.stringify(data);
}

// 转成表单类型，类似name=xwt&age=1，data对象里面只能有字符串和数值，其他类型忽略
function _formatToForm(data) {
  var result = [];
  for (var key in data) {
    let res = data[key];
    if (!res) continue;
    if (typeof res === "number" || typeof res === "string") {
      result.push(key + "=" + res);
    }
  }
  return result.join("&");
}
// 如果是类数组对象（有length）或者数组，直接使用append保存每一项
// null,undefined和无法stringify的对象忽略
function _formatToFormData(data) {
  var formData = new FormData();
  for (var key in data) {
    var res = data[key];
    if (typeof res === "object" && res.length != undefined) {
      res = _from(res);
      res.forEach(function(arr) {
        formData.append(key, arr);
      });
    } else {
      if (res == null) continue;
      try {
        // 对对象类型进行stringify，无法stringify的对象则忽略
        if (typeof res === "object") {
          res = JSON.stringify(res);
        }
      } catch (e) {
        continue;
      }
      formData.append(key, res);
    }
  }
  return formData;
}
