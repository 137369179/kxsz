#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""笔画名推断参数标定器。

以人工精编版 100 字（tools/content/seed_premium.json）的笔画名为 ground truth，
网格扫描「竖/撇」「点/捺」「提/横」的判别阈值，输出笔画级准确率最高的组合。

用法：
    /Users/mac/.workbuddy/binaries/python/envs/default/bin/python tools/tune_stroke.py

注意：ground truth 是人工标注，个别字的笔画顺序与 hanzi-writer 不一致（如「火」），
故本指标为相对参考，用于参数择优而非绝对精度评估。
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_characters as B  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED = os.path.join(ROOT, "tools", "content", "seed_premium.json")
CACHE = os.path.join(ROOT, "tools", "cache")


def load_cases():
    cases = []
    for s in json.load(open(SEED, encoding="utf-8")):
        ch = s["char"]
        f = os.path.join(CACHE, "%05x.json" % ord(ch))
        if not os.path.exists(f):
            continue
        j = json.load(open(f, encoding="utf-8"))
        exp = [x["name"] for x in s["strokes"]]
        cases.append((ch, j["medians"], exp))
    return cases


def score(cases):
    tot = hit = 0
    for _ch, medians, exp in cases:
        got = [x["name"] for x in B.build_strokes(medians)]
        if len(got) != len(exp):
            continue
        tot += len(exp)
        hit += sum(1 for a, b in zip(exp, got) if a == b)
    return hit, tot


def main():
    cases = load_cases()
    print(f"评估集：{len(cases)} 字")
    best = (0, None)
    for dev in (0.10, 0.13, 0.16, 0.20, 0.25, 0.30):
        for curv in (0.05, 0.08, 0.12, 0.18, 0.25):
            B._VERT_MAX_DEV = dev
            B._VERT_MAX_CURV = curv
            hit, tot = score(cases)
            pct = 100.0 * hit / max(1, tot)
            if (hit, -dev - curv) > (best[0], 0) or hit > best[0]:
                best = (hit, (dev, curv, hit, tot, pct))
            print(f"  dev={dev:<5} curv={curv:<5} → {hit}/{tot} = {pct:.1f}%")
    dev, curv, hit, tot, pct = best[1]
    print(f"\n最优：_VERT_MAX_DEV={dev}  _VERT_MAX_CURV={curv}  准确率 {hit}/{tot} = {pct:.1f}%")

    # 在最优 dev/curv 下继续扫描点/捺与提阈值
    B._VERT_MAX_DEV, B._VERT_MAX_CURV = dev, curv
    best2 = (0, None)
    for dot in (12.0, 15.0, 18.0, 22.0, 26.0):
        for ti in (8.0, 12.0, 18.0, 25.0):
            B._DOT_MAX_LEN = dot
            B._TI_MIN_DEG = ti
            hit, tot = score(cases)
            if hit > best2[0]:
                best2 = (hit, (dot, ti, hit, tot, 100.0 * hit / max(1, tot)))
            print(f"  dot={dot:<5} ti={ti:<5} → {hit}/{tot} = {100.0*hit/max(1,tot):.1f}%")
    dot, ti, hit, tot, pct = best2[1]
    print(f"\n最终：dev={dev} curv={curv} dot={dot} ti={ti}  准确率 {hit}/{tot} = {pct:.1f}%")


if __name__ == "__main__":
    main()
