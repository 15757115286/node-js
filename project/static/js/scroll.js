var initialStyle = {
  overflow: "hidden"
};
var initialVerticalScrollBarStyle = {
  top: "0px",
  position: "absolute"
};
var initialVerticalContainerStyle = {
  position: "absolute",
  top: "0px",
  right: "0px"
};
var initialOptions = {
  containerWidth: 8,
  scrollBarWidth: 8,
  containerColor: "blue",
  scrollBarColor: "black"
};
var prefix = 'scroll';

function initScrollBar(containerId, contentId, options) {
  var box = document.querySelector("#" + containerId),
    content = document.querySelector("#" + contentId);
  if (!box || !content) return;
  // 禁止box拖拽
  box.addEventListener('dragstart', function (e) {
    e.preventDefault();
    e.stopPropagation();
  })
  // 合并默认样式
  mergeInitialStyle(box, content);

  // 文档高度大于容器高度，产生垂直滚动条
  var finalOptions = easyMixin({}, initialOptions, options);

  initVerticalScrollBar(box, content, finalOptions);
  initHorizontalScrollBar(box, content, finalOptions);
  window.onresize = function (e) {
    initVerticalScrollBar(box, content, finalOptions);
    initHorizontalScrollBar(box, content, finalOptions);
  }
}

// 简单的混合
function easyMixin(target) {
  var origins = [].slice.call(arguments, 1);
  for (var i = 0; i < origins.length; i++) {
    var origin = origins[i];
    for (var key in origin) {
      target[key] = origin[key];
    }
  }
  return target;
}

// 默认样式的合并
function mergeInitialStyle(box, content) {
  var copyOfInitial = easyMixin({}, initialStyle);
  var computedStyle = getComputedStyle(box);
  // 默认position改成relative，不然使用百分比会出错
  if (computedStyle.position === "static") {
    copyOfInitial.position = "relative";
  }
  mergeStyle(box, copyOfInitial);
  // 这边给content一定要设置overflow为hidden，不然第一个和最后一个子元素的margin会作用于父元素
  content.style.overflow = "hidden";
}

// 样式合并函数
function mergeStyle(dom, styleObj) {
  var key,
    style = dom.style;
  for (key in styleObj) {
    style[key] = styleObj[key];
  }
}

// 初始化垂直滚动条
function initVerticalScrollBar(box, content, options) {
  // 如果有的话，移除上一次的滚轮事件
  if (options.mousewheelFn) {
    box.removeEventListener('mousewheel', options.mousewheelFn);
  }
  var scrollHeight = box.scrollHeight,
    boxHeight = box.offsetHeight;
  var containerClass = prefix + '-container-y',
    barClass = prefix + '-bar-y';
  var oldContainer = box.querySelector('.' + containerClass),
    oldScrollBar = box.querySelector('.' + barClass);
  if (oldContainer) {
    box.removeChild(oldContainer);
    oldContainer = null;
  }
  // 此时不需要竖直滚动条
  if (scrollHeight <= boxHeight) return;
  var barHeight = ((boxHeight / scrollHeight) * boxHeight) >> 0;
  var isClick = false;
  var startY = 0,
    nowY = 0;

  var verticalContainer = document.createElement("div"),
    verticalScrollBar = document.createElement("div");
  verticalScrollBar.addEventListener("mousedown", function (e) {
    isClick = true;
    startY = e.screenY;
  });
  box.addEventListener('mousewheel', options.mousewheelFn = function (e) {
    var wheelDeltaY = e.wheelDeltaY;
    if (!wheelDeltaY) return;
    var moveY = wheelDeltaY / 120 * (Math.min(boxHeight * 0.1, 100));
    toMove(-moveY);
  });
  // 阻止默认行为
  verticalScrollBar.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  window.addEventListener("mouseup", function (e) {
    isClick = false;
  });
  var move = throttle(function (e) {
    if (isClick == false) return;
    var endY = e.screenY,
      moveY = endY - startY;
    startY = endY;
    toMove(moveY);
  }, 20);

  function toMove(moveY) {
    var lastY = boxHeight - barHeight;
    nowY += moveY;
    if (nowY <= 0) nowY = 0;
    if (nowY >= lastY) nowY = lastY;
    verticalScrollBar.style.top = nowY + "px";
    moveYFn(content, scrollHeight, boxHeight, nowY);
  }

  verticalContainer.addEventListener("click", function (e) {
    startY = e.screenY;
    var offsetY = e.offsetY;
    // 修正5%偏差距离，防止点不到最下面的距离
    if (boxHeight - offsetY <= boxHeight * 0.05) offsetY = boxHeight;
    var moveDistance = nowY = Math.max(offsetY - barHeight, 0);
    moveYFn(content, scrollHeight, boxHeight, moveDistance);
    verticalScrollBar.style.top = moveDistance + "px";
  });

  window.addEventListener("mousemove", move);
  var containerStyle = verticalContainer.style,
    scrollBarStyle = verticalScrollBar.style;
  verticalContainer.classList.add(containerClass);
  verticalScrollBar.classList.add(barClass);
  verticalContainer.appendChild(verticalScrollBar);
  containerStyle.height = boxHeight + "px";
  containerStyle.backgroundColor = options.containerColor;
  scrollBarStyle.backgroundColor = options.scrollBarColor;
  containerStyle.width = options.containerWidth + "px";
  scrollBarStyle.width = options.scrollBarWidth + "px";
  scrollBarStyle.height = barHeight + "px";
  mergeStyle(verticalContainer, initialVerticalContainerStyle);
  mergeStyle(verticalScrollBar, initialVerticalScrollBarStyle);
  if (oldScrollBar) {
    var moveY = Math.min(parseInt(oldScrollBar.style.top), boxHeight - barHeight);
    toMove(moveY);
  }
  box.appendChild(verticalContainer);
}

// 移动
function moveYFn(content, scrollHeight, boxHeight, moveY) {
  var y = (moveY / boxHeight) * scrollHeight;
  var maxY = scrollHeight - boxHeight;
  setTranslate(content, 0, Math.min(y, maxY));
}

function setTranslate(dom, x, y) {
  var style = dom.style,
    translate = style.transform || "translate(0px, 0px)";
  var re = /translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/;
  var match = translate.match(re);
  if (!match) return;
  style.transform = "translate(" + -x + "px," + -y + "px)";
}

// 初始化水平滚动条
function initHorizontalScrollBar(dom, content, boxWidth) {
  var scrollWidth = box.scrollWidth,
    boxWidth = box.offsetWidth;
  // 此时不需要水平滚动条
  if (scrollWidth < boxWidth) return;
}

// function throttle
function throttle(fn, interval) {
  var lastTime = 0;
  interval = interval || 1000;
  return function () {
    var _now = Date.now();
    if (_now - lastTime > interval) {
      fn.apply(this, arguments);
      lastTime = _now;
    }
  };
}