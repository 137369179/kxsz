/**
 * Vite 构建配置（生产打包：压缩 + tree-shaking + 自动分包）
 * ------------------------------------------------------------------
 * 说明：
 *  - 源码直出模式（src/app.js）保留给开发/调试/探针使用；
 *    本配置产出 dist/ 作为发布产物，npm run build 触发。
 *  - transformIndexHtml 剥离 ?v= 版本查询参数：源码模式用 ?v= 做缓存失效，
 *    Vite 构建产物改用内容 hash 文件名（等效且更优）。
 *  - 动态 import（组件懒加载 + 字库详情层）由 Vite 自动 code-split 成独立 chunk。
 */
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    target: "es2018",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // 详情层(2.8MB)与索引层(328KB)天然为独立 chunk（动态 import 自动分包）
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    {
      name: "strip-version-query",
      transformIndexHtml(html) {
        return html.replace(/\?v=[\w.\-]+/g, "");
      },
    },
  ],
});
