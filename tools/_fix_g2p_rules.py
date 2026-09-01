#!/usr/bin/env python3
"""一次性修复 g2p.js 的 POLYPHONE_RULES 块(被剥离中文的 20 条规则)"""
import re
from pathlib import Path

f = Path("src/utils/g2p.js")
src = f.read_text(encoding="utf-8")

start_marker = "const POLYPHONE_RULES = ["
end_marker = "function isAdjLike"

si = src.index(start_marker)
ei = src.index(end_marker)

NEW = '''const POLYPHONE_RULES = [
  // 长: cháng (adj. long) vs zhǎng (v. grow / leader)
  { char: "长",
    default: { pinyinStrip: "chang", toneNum: 2, label: "cháng" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["长", ["大", "高", "辈", "老"], ["城", "江", "久", "安", "途", "期", "夜"]]), result: { pinyinStrip: "zhang", toneNum: 3, label: "zhǎng" } },
      { match: (ctx) => ctx.nextChar && ["大", "高", "辈"].includes(ctx.nextChar), result: { pinyinStrip: "zhang", toneNum: 3, label: "zhǎng" } },
    ]},
  // 行: xíng (v. go, OK) vs háng (line, row, bank)
  { char: "行",
    default: { pinyinStrip: "xing", toneNum: 2, label: "xíng" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["银", "同", "内", "外"], "行"], ["银行", "行家", "行列", "行业", "同行"]), result: { pinyinStrip: "hang", toneNum: 2, label: "háng" } },
    ]},
  // 重: zhòng (heavy) vs chóng (again, layer)
  { char: "重",
    default: { pinyinStrip: "zhong", toneNum: 4, label: "zhòng" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["重", ["复", "新", "来", "阳", "庆"], ["复", "新", "来", "叠"]], ["重复", "重来", "重阳", "重庆", "重叠"]), result: { pinyinStrip: "chong", toneNum: 2, label: "chóng" } },
    ]},
  // 还: hái (still) vs huán (return)
  { char: "还",
    default: { pinyinStrip: "hai", toneNum: 2, label: "hái" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["归", "偿", "退", "交", "奉"], "还"], ["归还", "还钱", "还书", "偿还", "退还", "奉还"]), result: { pinyinStrip: "huan", toneNum: 2, label: "huán" } },
    ]},
  // 乐: lè (happy) vs yuè (music)
  { char: "乐",
    default: { pinyinStrip: "le", toneNum: 4, label: "lè" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["器", "曲", "队", "团", "谱"], "乐"], ["音乐", "乐曲", "乐器", "乐队", "乐谱", "奏乐"]), result: { pinyinStrip: "yue", toneNum: 4, label: "yuè" } },
    ]},
  // 中: zhōng vs zhòng (hit target / win)
  { char: "中",
    default: { pinyinStrip: "zhong", toneNum: 1, label: "zhōng" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["打", "猜", "射", "击"], "中"], ["打中", "猜中", "射中", "命中", "看中", "中奖"]), result: { pinyinStrip: "zhong", toneNum: 4, label: "zhòng" } },
    ]},
  // 相: xiāng (mutual) vs xiàng (photo/look/appearance)
  { char: "相",
    default: { pinyinStrip: "xiang", toneNum: 1, label: "xiāng" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["照", "长", "面", "象"], "相"], ["照相", "相机", "相貌", "相片", "丞相", "真相"]), result: { pinyinStrip: "xiang", toneNum: 4, label: "xiàng" } },
    ]},
  // 好: hǎo (good) vs hào (like, hobby)
  { char: "好",
    default: { pinyinStrip: "hao", toneNum: 3, label: "hǎo" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["好", ["客", "学", "胜", "动", "奇"], ["事", "玩", "书"]], ["爱好", "喜好", "嗜好", "好客", "好学"]), result: { pinyinStrip: "hao", toneNum: 4, label: "hào" } },
    ]},
  // 便: biàn vs pián (cheap)
  { char: "便",
    default: { pinyinStrip: "bian", toneNum: 4, label: "biàn" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["方", "大"], "便"], ["便宜", "便宜货"]), result: { pinyinStrip: "pian", toneNum: 2, label: "pián" } },
    ]},
  // 觉: jué (feel) vs jiào (sleep)
  { char: "觉",
    default: { pinyinStrip: "jue", toneNum: 2, label: "jué" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["睡", "午", "困"], "觉"], ["睡觉", "午觉", "困觉"]), result: { pinyinStrip: "jiao", toneNum: 4, label: "jiào" } },
    ]},
  // 教: jiāo (teach) vs jiào (religion / make)
  { char: "教",
    default: { pinyinStrip: "jiao", toneNum: 1, label: "jiāo" },
    rules: [
      { match: (ctx) => isMatch(ctx, ["教", ["育", "室", "师", "材", "堂", "训"]], ["教育", "教室", "教师", "教材", "教堂", "宗教", "请教"]), result: { pinyinStrip: "jiao", toneNum: 4, label: "jiào" } },
    ]},
  // 为: wèi (for) vs wéi (be / do)
  { char: "为",
    default: { pinyinStrip: "wei", toneNum: 4, label: "wèi" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["认", "以", "成", "作", "行"], "为"], ["认为", "以为", "成为", "作为", "行为", "为人"]), result: { pinyinStrip: "wei", toneNum: 2, label: "wéi" } },
    ]},
  // 得: dé vs de (complement marker) vs děi (must)
  { char: "得",
    default: { pinyinStrip: "de", toneNum: 0, label: "de" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["获", "取", "赢", "到", "懂"], "得"], ["获得", "取得", "得到", "懂得", "觉得", "记得"]), result: { pinyinStrip: "de", toneNum: 2, label: "dé" } },
      { match: (ctx) => ctx.nextChar && ["去", "走", "做", "买", "说"].includes(ctx.nextChar), result: { pinyinStrip: "dei", toneNum: 3, label: "děi" } },
    ]},
  // 地: dì vs de (adverbial marker)
  { char: "地",
    default: { pinyinStrip: "di", toneNum: 4, label: "dì" },
    rules: [
      { match: (ctx) => ctx.isAdverbialContext || (ctx.prevChar && isAdjLike(ctx.prevChar) && ctx.nextChar && isVLike(ctx.nextChar)), result: { pinyinStrip: "de", toneNum: 0, label: "de" } },
    ]},
  // 了: le vs liǎo (done, know)
  { char: "了",
    default: { pinyinStrip: "le", toneNum: 0, label: "le" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["不", "解", "结", "终", "完"], "了"], ["了解", "了结", "了不起", "终了", "了却"]), result: { pinyinStrip: "liao", toneNum: 3, label: "liǎo" } },
    ]},
  // 着: zhe / zháo / zhuó / zhāo
  { char: "着",
    default: { pinyinStrip: "zhe", toneNum: 0, label: "zhe" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["睡", "找", "急", "点", "忙"], "着"], ["睡着", "找着", "着急", "着凉", "着火"]), result: { pinyinStrip: "zhao", toneNum: 2, label: "zháo" } },
      { match: (ctx) => isMatch(ctx, [["穿", "陆", "手"], "着"], ["穿着", "着陆", "着手", "着重", "着想", "执着"]), result: { pinyinStrip: "zhuo", toneNum: 2, label: "zhuó" } },
      { match: (ctx) => ctx.nextChar === "数" || ctx.nextChar === "法", result: { pinyinStrip: "zhao", toneNum: 1, label: "zhāo" } },
    ]},
  // 过: guò / guō (surname) / guo (aspect particle)
  { char: "过",
    default: { pinyinStrip: "guo", toneNum: 4, label: "guò" },
    rules: [
      { match: (ctx) => ctx.prevChar && isVLike(ctx.prevChar) && (!ctx.nextChar || !/[^\u4e00-\u9fa5]/.test(ctx.nextChar) && !isVLike(ctx.nextChar) === false), result: { pinyinStrip: "guo", toneNum: 0, label: "guo" } },
    ]},
  // 发: fā vs fà (hair)
  { char: "发",
    default: { pinyinStrip: "fa", toneNum: 1, label: "fā" },
    rules: [
      { match: (ctx) => isMatch(ctx, [["头", "剃", "烫", "染", "脱"], "发"], ["头发", "理发", "短发", "白发"]), result: { pinyinStrip: "fa", toneNum: 0, label: "fa" } },
    ]},
  // 打: dǎ vs dá (dozen)
  { char: "打",
    default: { pinyinStrip: "da", toneNum: 3, label: "dǎ" },
    rules: [
      { match: (ctx) => ctx.prevChar && /[一二两三四五六七八九十百千0-9]/.test(ctx.prevChar) || isMatch(ctx, [], ["一打", "半打"]), result: { pinyinStrip: "da", toneNum: 2, label: "dá" } },
    ]},
  // 大: dà vs dài (doctor,  old-style)
  { char: "大",
    default: { pinyinStrip: "da", toneNum: 4, label: "dà" },
    rules: [
      { match: (ctx) => ctx.nextChar === "夫" && !ctx.nextNextChar || ctx.nextChar === "王", result: { pinyinStrip: "dai", toneNum: 4, label: "dài" } },
    ]},
];

function isAdjLike(ch) { return typeof ch === "string" && ["慢", "快", "静", "忙", "乱", "稳", "轻", "响", "真"].includes(ch); }
function isVLike(ch) { return typeof ch === "string" && ["跑", "走", "说", "唱", "跳", "写", "看", "吃", "笑", "哭", "学", "读", "想"].includes(ch); }

'''

src = src[:si] + NEW + src[ei + len(end_marker):]
# 保留 end_marker 之后原有的 isVLike 函数体? 不——NEW 已含两个函数完整体,
# 而 src[ei:] 从 "function isAdjLike" 开始的原内容包含两个旧函数,
# 需要跳过旧的 isAdjLike + isVLike 两个函数定义。
# 找到 isVLike 函数结尾(以 "}"; 后跟空行或下一函数)。
rest = src[src.index(end_marker):]
# 简单法: 删除旧的两个函数行(它们是单行函数)
rest = re.sub(r'function isAdjLike\(ch\) \{[^\n]*\}\n', '', rest, count=1)
rest = re.sub(r'function isVLike\(ch\) \{[^\n]*\}\n', '', rest, count=1)
src = src[:src.index(end_marker)] + rest

f.write_text(src, encoding="utf-8")
print("✅ POLYPHONE_RULES 块已替换")
print("规则条数:", src.count('{ char: "'))
