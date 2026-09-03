/**
 * 构建后处理：生成 SW 预缓存清单 sw-manifest.json
 * ------------------------------------------------------------------
 * 扫描 dist/ 下所有静态资源（index.html + assets/*），生成相对路径清单，
 * 供 sw.js 在构建模式下用实际产物文件名预缓存（替代源码直出模式的
 * CORE_ASSETS 硬编码列表，避免构建产物下 install 预缓存全部 404）。
 *
 * 用法: node tools/_gen_sw_manifest.mjs [distDir=dist]
 */
import { readdirSync, statSync, writeFileSync, existsSync } from "fs";

const DIST = process.argv[2] || "dist";
const STATIC_EXT = /\.(js|css|html|json|jpg|jpeg|png|gif|svg|webp|woff2?|ttf|ico)$/i;
const EXCLUDE = new Set(["sw.js", "sw-manifest.json"]);

function walk(dir, prefix, out) {
  for (const name of readdirSync(dir)) {
    if (EXCLUDE.has(name)) continue;
    const full = `${dir}/${name}`;
    const rel = prefix + name;
    if (statSync(full).isDirectory()) {
      walk(full, `${rel}/`, out);
    } else if (STATIC_EXT.test(name)) {
      out.push(`./${rel}`);
    }
  }
}

if (!existsSync(DIST)) {
  console.error(`[gen_sw_manifest] ${DIST} 不存在，请先执行 vite build`);
  process.exit(1);
}

const manifest = [];
walk(DIST, "", manifest);

// index.html 排最前（离线回退入口）
manifest.sort((a, b) => {
  if (a.includes("index.html")) return -1;
  if (b.includes("index.html")) return 1;
  return a < b ? -1 : 1;
});

writeFileSync(`${DIST}/sw-manifest.json`, JSON.stringify(manifest, null, 0));
console.log(`[gen_sw_manifest] ${DIST}/sw-manifest.json 已生成: ${manifest.length} 个资源`);
