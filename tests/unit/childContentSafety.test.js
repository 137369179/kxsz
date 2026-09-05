/**
 * P0-E: 儿童可见 UI 字符串不应夹带外链 / 联系方式
 * 扫描 src/components 与主要 hub 模板中的字面量。
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../../src");
const SCAN_DIRS = ["components", "utils/mapHub", "utils/parentHub", "utils/reviewHub", "utils/rewardHub"];

const URL_RE = /https?:\/\/(?!127\.0\.0\.1|localhost)[\w.-]+/i;
const CONTACT_RE = /(?:微信|wechat|qq\s*[:：]|电话[:：]|tel:|mailto:)/i;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (name.endsWith(".js")) acc.push(full);
  }
  return acc;
}

describe("child content safety scan", () => {
  const files = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d)));

  it("scans hub/component templates for outbound URLs and contact patterns", () => {
    expect(files.length).toBeGreaterThan(10);
    const hits = [];
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      // Ignore import/from paths and comments about http in docs-like strings inside tools
      const lines = src.split("\n");
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("import ") || trimmed.startsWith("export ")) return;
        if (URL_RE.test(line) || CONTACT_RE.test(line)) {
          hits.push(`${path.relative(ROOT, file)}:${idx + 1}: ${trimmed.slice(0, 120)}`);
        }
      });
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
