#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""凯茜识字 - 成语数据库生成器"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_PATH = os.path.join(ROOT, "src", "data", "idioms.js")
EXTRA = os.path.join(ROOT, "tools", "content", "idioms_extra.txt")


def parse_extra():
    out = []
    for line in open(EXTRA, encoding="utf-8"):
        line = line.strip()
        if not line:
            continue
        parts = line.split("|")
        if len(parts) != 6:
            continue
        bid, name, pinyin, chars, story, moral = parts
        out.append({
            "id": bid,
            "name": name,
            "pinyin": pinyin,
            "chars": [c.strip() for c in chars.split(",") if c.strip()],
            "story": story,
            "moral": moral,
        })
    return out


def main():
    extras = parse_extra()
    print(f"扩展成语条目: {len(extras)}")

    # 在原文件头部 doc 注释里更新数字
    src = open(SRC_PATH, encoding="utf-8").read()
    src = re.sub(r"\d+ 部沉浸式成语国学馆", f"{2 + len(extras)} 部沉浸式成语国学馆", src, count=1)

    new_block = ",\n".join(json.dumps(g, ensure_ascii=False, indent=2) for g in extras)
    # 在 IDIOMS_DATABASE 数组末尾追加
    src = re.sub(r"\n\]\;\s*$", ",\n" + new_block + "\n];\n", src.rstrip())
    open(SRC_PATH, "w", encoding="utf-8").write(src)
    print(f"已写入 {len(extras)} 条新成语 -> {SRC_PATH} ({len(src)/1024:.1f} KB)")


if __name__ == "__main__":
    main()
