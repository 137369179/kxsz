/**
 * Canvas roundRect 垫片 + 过滤第三方扩展偶发的无害 unhandledrejection
 */
export function installBrowserShims() {
  if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
      if (!radii) radii = 0;
      if (typeof radii === "number") {
        radii = [radii, radii, radii, radii];
      } else if (Array.isArray(radii)) {
        if (radii.length === 1) radii = [radii[0], radii[0], radii[0], radii[0]];
        else if (radii.length === 2) radii = [radii[0], radii[1], radii[0], radii[1]];
        else if (radii.length === 3) radii = [radii[0], radii[1], radii[2], radii[1]];
        else if (radii.length >= 4) radii = [radii[0], radii[1], radii[2], radii[3]];
      } else {
        radii = [0, 0, 0, 0];
      }

      let [tl, tr, br, bl] = radii;
      const maxR = Math.min(Math.abs(w), Math.abs(h)) / 2;
      tl = Math.max(0, Math.min(tl, maxR));
      tr = Math.max(0, Math.min(tr, maxR));
      br = Math.max(0, Math.min(br, maxR));
      bl = Math.max(0, Math.min(bl, maxR));

      this.beginPath();
      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + tr);
      this.lineTo(x + w, y + h - br);
      this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      this.lineTo(x + bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - bl);
      this.lineTo(x, y + tl);
      this.quadraticCurveTo(x, y, x + tl, y);
      this.closePath();
      return this;
    };
  }

  if (typeof window !== "undefined") {
    window.addEventListener("unhandledrejection", (event) => {
      const msg = String(event?.reason?.message || event?.reason || "");
      if (
        msg.includes("message channel closed") ||
        msg.includes("asynchronous response") ||
        msg.includes("ResizeObserver loop")
      ) {
        event.preventDefault();
      }
    });
  }
}
