#!/usr/bin/env python3
"""修复 g2p.js 变调引擎全部剥离点 + 残留的坏函数"""
import re
from pathlib import Path

f = Path("src/utils/g2p.js")
src = f.read_text(encoding="utf-8")

def sub_once(old, new):
    global src
    if old not in src:
        print(f"⚠️ 未找到: {old[:60]}...")
        return False
    src = src.replace(old, new, 1)
    return True

fixes = [
    # 0. 残留的坏函数行 (函数名丢失 + 空数组)
    ('(ch) { return typeof ch === "string" && ["", "", "", "", "", "", "", "", ""].includes(ch); }\nfunction isVLike(ch) { return typeof ch === "string" && ["", "", "", "", "", "", "", "", "", "", "", "", ""].includes(ch); }',
     'function isAdjLike(ch) { return typeof ch === "string" && ["慢", "快", "静", "忙", "乱", "稳", "轻", "响", "真"].includes(ch); }\nfunction isVLike(ch) { return typeof ch === "string" && ["跑", "走", "说", "唱", "跳", "写", "看", "吃", "笑", "哭", "学", "读", "想"].includes(ch); }'),

    # 1. 轻声后缀/助词/趋向/方位 四个 Set
    ('const NEUTRAL_POSTFIX = new Set(["", "", "", "", ""]);',
     'const NEUTRAL_POSTFIX = new Set(["子", "头", "们", "么", "生"]);'),
    ('const NEUTRAL_PARTICLE = new Set(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);',
     'const NEUTRAL_PARTICLE = new Set(["的", "了", "着", "过", "吧", "吗", "呢", "啊", "呀", "哦", "啦", "嘛", "么", "哪", "哇", "哟", "嘛", "呗"]);'),
    ('const DIRECTION_VERB = new Set(["", "", "", "", "", "", "", "", ""]);',
     'const DIRECTION_VERB = new Set(["上", "下", "进", "出", "回", "开", "起", "过", "来"]);'),
    ('const LOC_POSTFIX = new Set(["", "", "", ""]);',
     'const LOC_POSTFIX = new Set(["边", "面", "头", "里"]);'),

    # 2. 4.1 叠字轻声: 可叠前缀 9 字 (亲属称谓/昵称)
    ('      if (["", "", "", "", "", "", "", "", ""].includes(prefix) || isVLike(prefix)) {',
     '      if (["妈", "爸", "哥", "姐", "爷", "奶", "娃", "星", "宝"].includes(prefix) || isVLike(prefix)) {'),

    # 3. 4.2 子/头 排除表 + 3 个无条件后缀
    ('      const isRealPostfix = (tokens[i].char === "" && !["", "", "", "", "", ""].includes(tokens[i - 1].char))\n                         || (tokens[i].char === "" && !["", "", "", "", "", ""].includes(tokens[i - 1].char))\n                         || tokens[i].char === "" || tokens[i].char === "" || tokens[i].char === "";',
     '      const isRealPostfix = (tokens[i].char === "子" && !["天", "君", "孔", "孟", "赤", "孝"].includes(tokens[i - 1].char))\n                         || (tokens[i].char === "头" && !["点", "回", "抬", "低", "摇", "磕"].includes(tokens[i - 1].char))\n                         || tokens[i].char === "们" || tokens[i].char === "么" || tokens[i].char === "生";'),

    # 4. 4.3 "了" 前字表 + 8 个无条件轻声助词
    ('      if (tokens[i].char === "" && i > 0 && (isVLike(tokens[i - 1].char) || ["", ""].includes(tokens[i - 1].char))) {',
     '      if (tokens[i].char === "了" && i > 0 && (isVLike(tokens[i - 1].char) || ["完", "快"].includes(tokens[i - 1].char))) {'),
    ('      } else if (["", "", "", "", "", "", "", ""].includes(tokens[i].char)) {',
     '      } else if (["的", "着", "吧", "吗", "呢", "啊", "呀", "啦"].includes(tokens[i].char)) {'),

    # 5. 4.6 "一"
    ('  for (let i = 0; i < tokens.length; i++) {\n    if (tokens[i].char !== "") continue;\n    const next = tokens[i + 1];\n    //  /  /  → yī ()',
     '  for (let i = 0; i < tokens.length; i++) {\n    if (tokens[i].char !== "一") continue;\n    const next = tokens[i + 1];\n    // 句末 / 序数 / 单念 → yī (本调)'),
    ('    const isOrdinal = tokens[i - 1] && ["", "", ""].includes(tokens[i - 1].char);',
     '    const isOrdinal = tokens[i - 1] && ["第", "初", "头"].includes(tokens[i - 1].char);'),

    # 6. 4.7 "不"
    ('  for (let i = 0; i < tokens.length; i++) {\n    if (tokens[i].char !== "") continue;\n    const next = tokens[i + 1];\n    if (next && next.toneNum === 4) {',
     '  for (let i = 0; i < tokens.length; i++) {\n    if (tokens[i].char !== "不") continue;\n    const next = tokens[i + 1];\n    if (next && next.toneNum === 4) {'),

    # 7. 4.9 "啊"
    ('  for (let i = 1; i < tokens.length; i++) {\n    if (tokens[i].char !== "") continue;\n    const prev = tokens[i - 1].pinyinStrip || "";',
     '  for (let i = 1; i < tokens.length; i++) {\n    if (tokens[i].char !== "啊") continue;\n    const prev = tokens[i - 1].pinyinStrip || "";'),

    # 8. 4.10 "儿" (儿化)
    ('    if (tokens[i + 1] && tokens[i + 1].char === "") {',
     '    if (tokens[i + 1] && tokens[i + 1].char === "儿") {'),
]

ok = 0
for old, new in fixes:
    if sub_once(old, new):
        ok += 1

f.write_text(src, encoding="utf-8")
print(f"✅ 完成 {ok}/{len(fixes)} 处修复")

# 验证
import subprocess
r = subprocess.run(["node", "--check", "src/utils/g2p.js"], capture_output=True, text=True)
print("语法:", "OK" if r.returncode == 0 else "FAIL " + r.stderr[:200])
left = len(re.findall(r'""', src))
print(f'剩余空串模式: {left} 处')
