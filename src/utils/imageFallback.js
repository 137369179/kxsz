/**
 * 全局图片错误兜底（替代模板中的内联 onerror 事件属性）
 *
 * 背景：严格 CSP（script-src 无 'unsafe-inline'）会拦截 HTML 中的内联事件处理器属性，
 * 因此原先 `<img onerror="this.src='X'">` 的图片兜底在严格 CSP 下失效。
 * 改为在模板中写 `<img data-fallback="X">`，由此处统一的「捕获阶段」监听在图片
 * 加载失败时切换到兜底图。监听挂在 document 捕获阶段（资源 error 不冒泡，仅捕获可达）。
 */

let _installed = false;

export function installImageErrorFallback() {
  if (_installed) return;
  _installed = true;

  document.addEventListener(
    "error",
    (e) => {
      const t = e.target;
      if (!t || t.tagName !== "IMG") return;
      const fb = t.dataset && t.dataset.fallback;
      if (!fb) return;
      // 防死循环：已应用过兜底，或当前 src 已是指向兜底图本身
      if (t.dataset.fbApplied) return;
      if (t.getAttribute("src") === fb) return;
      t.dataset.fbApplied = "1";
      t.onerror = null; // 摘除自身，避免兜底图也失败时递归触发
      t.src = fb;
    },
    true // useCapture：资源加载错误事件不冒泡，必须在捕获阶段接收
  );
}
