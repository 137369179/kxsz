#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""凯茜识字 - 分级绘本生成器"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_PATH = os.path.join(ROOT, "src", "data", "books.js")
EXTRA = os.path.join(ROOT, "tools", "content", "books_extra.txt")
COVER_IMG = "assets/images/cathy_storybook_cover.jpg"

CHAR_DURATION = 0.25


def parse_extra():
    out = []
    for line in open(EXTRA, encoding="utf-8"):
        line = line.strip()
        if not line:
            continue
        parts = line.split("|")
        if len(parts) < 7:
            continue
        head, pages = parts[:6], parts[6:]
        bid, title, level, theme, chars, desc = head
        page_dicts = []
        for p in pages:
            m = re.match(r"page(\d+):(.+)", p)
            if m:
                page_dicts.append({"pageNumber": int(m.group(1)), "text": m.group(2).strip()})
        out.append({"id": bid, "title": title, "level": int(level), "theme": theme,
                    "targetChars": [c.strip() for c in chars.split(",") if c.strip()],
                    "desc": desc, "pages": page_dicts})
    return out


def gen_audio_tokens(text, target_chars):
    tokens = []
    t = 0.1
    for ch in text:
        start = t
        end = t + CHAR_DURATION
        tok = {"char": ch, "start": round(start, 2), "end": round(end, 2)}
        if ch in target_chars:
            tok["highlight"] = True
        tokens.append(tok)
        t = end + 0.02
    return tokens


def gen_pages(extra_pages, target_chars):
    return [{
        "pageNumber": p["pageNumber"],
        "text": p["text"],
        "image": COVER_IMG,
        "audioTimeTokens": gen_audio_tokens(p["text"], target_chars),
    } for p in extra_pages]


def gen_quiz(title, pages, target_chars):
    text0 = pages[0]["text"] if pages else ""
    first = next((c for c in text0 if c.strip()), "主角")
    char_list = list(target_chars[:3]) if target_chars else ["日", "月", "水"]
    return [
        {"question": f"《{title}》的故事里，{first} 在做什么？",
         "options": ["做自己的事", "去找朋友", "去找妈妈", "去上学"], "correctIndex": 0},
        {"question": "请选出故事中学过的一个字：",
         "options": (char_list + ["🐱"])[:4], "correctIndex": 0},
    ]


def main():
    extras = parse_extra()
    print(f"扩展绘本条目: {len(extras)}")

    generated = []
    for ex in extras:
        pages = gen_pages(ex["pages"], ex["targetChars"])
        quiz = gen_quiz(ex["title"], pages, ex["targetChars"])
        stage = 1 if ex["level"] <= 1 else (2 if ex["level"] <= 2 else 3)
        generated.append({"id": ex["id"], "level": ex["level"], "title": ex["title"],
                         "coverImg": COVER_IMG, "stage": stage, "theme": ex["theme"],
                         "targetChars": ex["targetChars"], "desc": ex["desc"],
                         "pages": pages, "quiz": quiz})

    new_block = ",\n".join(json.dumps(g, ensure_ascii=False, indent=6) for g in generated)
    src = open(SRC_PATH, encoding="utf-8").read()
    src = re.sub(r"\n\]\;\s*$", ",\n" + new_block + "\n];\n", src.rstrip())
    open(SRC_PATH, "w", encoding="utf-8").write(src)
    print(f"已写入 {len(generated)} 本新绘本 -> {SRC_PATH} ({len(src)/1024:.1f} KB)")


if __name__ == "__main__":
    main()
