/**
 * APP_VERSION single-source alignment across package / SW / HTML cache-busters
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { APP_VERSION } from "../../src/utils/version.js";
import pkg from "../../package.json";

const root = path.resolve(__dirname, "../..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

describe("APP_VERSION alignment", () => {
  it("package.json matches version.js", () => {
    expect(pkg.version).toBe(APP_VERSION);
  });

  it("sw.js fallback default matches version.js", () => {
    const sw = read("sw.js");
    expect(sw).toContain(`|| "${APP_VERSION}"`);
  });

  it("index.html cache-busters use the same version", () => {
    const html = read("index.html");
    expect(html).toContain(`prod.css?v=${APP_VERSION}`);
    expect(html).toContain(`app.js?v=${APP_VERSION}`);
  });

  it("manifest PWA icons include 192 and 512", () => {
    const manifest = JSON.parse(read("manifest.json"));
    const sizes = new Set(manifest.icons.map((i) => i.sizes));
    expect(sizes.has("192x192")).toBe(true);
    expect(sizes.has("512x512")).toBe(true);
    for (const icon of manifest.icons) {
      if (icon.sizes === "192x192" || icon.sizes === "512x512") {
        expect(fs.existsSync(path.join(root, icon.src))).toBe(true);
      }
    }
  });
});
