#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
凯茜识字 - 字库生成器
数据源：hanzi-writer-data (真实笔画轮廓 + 中线，Make Me a Hanzi 衍生, CC BY 4.0)
         pypinyin (拼音与声调)
         CONTENT 段为人工编撰的语义内容（词组 / 造句 / 象形演变故事）
输出：src/data/characters.js
"""
import json
import math
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

from pypinyin import pinyin, Style

try:
    from cnradical import Radical, RunOption
    _RADICAL_ENGINE = Radical(RunOption.Radical)
except Exception:  # noqa: BLE001
    _RADICAL_ENGINE = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(ROOT, "tools", "cache")
OUT_PATH = os.path.join(ROOT, "src", "data", "characters.js")
CDN = "https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/{}.json"

# ---------------------------------------------------------------------------
# 语义内容表 —— 存放于 tools/content/*.txt，按批次组织
# 字段：字 | 部首 | emoji | 字形类别 | 互动类型 | 词组(3) | 造句 | 演变故事 | 形近字
# 字形类别：pictograph 象形 / ideograph 指事 / compound 会意 / phono 形声
# ---------------------------------------------------------------------------
CONTENT_DIR = os.path.join(ROOT, "tools", "content")


def load_content(dirpath):
    """按文件名顺序合并所有 9 字段批次内容（仅 0数字.txt，自动扩字文件由 load_auto 处理）"""
    if not os.path.isdir(dirpath):
        return ""
    blobs = []
    for name in sorted(os.listdir(dirpath)):
        # 只读取手工编撰的 9 字段批次文件（01_*.txt 等），
        # 排除 books_extra.txt / idioms_extra.txt / auto*.txt 等
        if not re.match(r"^0\d+_.*\.txt$", name):
            continue
        with open(os.path.join(dirpath, name), "r", encoding="utf-8") as f:
            blobs.append(f.read())
    return "\n".join(blobs)


CONTENT = load_content(CONTENT_DIR)
_OLD_CONTENT = """"""  # 已迁移至 tools/content/*.txt


def fetch_stroke_data(char, retries=6):
    """从 CDN 获取汉字真实笔画数据，带本地磁盘缓存。
    对 429 限流做指数退避，避免批量扩字时整批失败。"""
    os.makedirs(CACHE_DIR, exist_ok=True)
    cache_file = os.path.join(CACHE_DIR, f"{ord(char):05x}.json")

    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass

    url = CDN.format(urllib.parse.quote(char))
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            if not data.get("strokes") or not data.get("medians"):
                raise ValueError("字段缺失")
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False)
            return data
        except urllib.error.HTTPError as exc:  # 429 限流 → 长退避
            if attempt == retries - 1:
                print(f"  ✗ 获取失败: {char} ({exc})", file=sys.stderr)
                return None
            back = 4.0 * (2 ** attempt) if exc.code == 429 else 1.5 * (attempt + 1)
            time.sleep(back)
        except Exception as exc:  # noqa: BLE001
            if attempt == retries - 1:
                print(f"  ✗ 获取失败: {char} ({exc})", file=sys.stderr)
                return None
            time.sleep(1.5 * (attempt + 1))
    return None


# 多音字人工订正：pypinyin 单字默认读音未必符合识字教学口径
POLYPHONE = {
    "长": ("cháng", 2),
    "子": ("zǐ", 3),
    "少": ("shǎo", 3),
    "都": ("dōu", 1),
    "分": ("fēn", 1),
    "乐": ("lè", 4),
    "好": ("hǎo", 3),
    "地": ("dì", 4),
    "了": ("le", 5),
    "只": ("zhǐ", 3),
    "干": ("gān", 1),
    "空": ("kōng", 1),
    "发": ("fā", 1),
    "兴": ("xīng", 1),
    "教": ("jiāo", 1),
    "觉": ("jué", 2),
    "数": ("shù", 4),
    "种": ("zhǒng", 3),
    "行": ("xíng", 2),
    "重": ("zhòng", 4),
    "量": ("liàng", 4),
    "处": ("chù", 4),
    "相": ("xiāng", 1),
    "要": ("yào", 4),
    "为": ("wèi", 4),
    "还": ("hái", 2),
}


def py_tone(ch):
    """返回带声调的拼音字符串，如 rì"""
    if ch in POLYPHONE:
        return POLYPHONE[ch][0]
    res = pinyin(ch, style=Style.TONE, heteronym=False)
    return res[0][0] if res else ""


def tone_number(ch):
    """返回声调数字 1-4，轻声返回 5"""
    if ch in POLYPHONE:
        return POLYPHONE[ch][1]
    res = pinyin(ch, style=Style.TONE3, heteronym=False, neutral_tone_with_five=True)
    if not res:
        return 5
    raw = res[0][0]
    for c in reversed(raw):
        if c.isdigit():
            return int(c)
    return 5


def py_phrase(text):
    """词组拼音：命中订正表的单字优先，其余整词交给 pypinyin"""
    if not any(c in POLYPHONE for c in text):
        return " ".join(x[0] for x in pinyin(text, style=Style.TONE))

    result, buf = [], ""
    for ch in text:
        if ch in POLYPHONE:
            if buf:
                result.extend(x[0] for x in pinyin(buf, style=Style.TONE))
                buf = ""
            result.append(POLYPHONE[ch][0])
        else:
            buf += ch
    if buf:
        result.extend(x[0] for x in pinyin(buf, style=Style.TONE))
    return " ".join(result)


# ---------------------------------------------------------------------------
# 互动动作 → 通用手势机制
# 「玩」环节把 196 种语义动作归并为 7 类可复用手势引擎，兼顾规模与手感
# ---------------------------------------------------------------------------
MECHANISM_RULES = [
    ("wipe", r"^(wipe|wash_|paint_|tear_|sweat|autumn|winter|vanish|reduce|shiver|cry_tear)"),
    ("hold", r"^(blow|gust|drip|zap|twinkle|shine|hold_|listen|lean_|blink|bright|switch|sunrise|noon|today|clock|second|safe|heart|love|hug|purr|nod|beat|sway|flutter|fly_wing|swim|crawl|sail|spring_bloom|summer|inside|face_|square|back_to_back)"),
    ("multi", r"^(multi_tap|count|stomp|bark|peck|hop|dash|busy|dance|thumb|laugh|sing|speak|read|happy|roar|trunk|gore|graze|gallop|run_fast|crawl_slow|kick|play_toy|new_year|second_tick|clock_tick)"),
    ("rise", r"^(drag_up|lift|grow|plant|forest|bloom|sprout|harvest|stretch|tall|climb|pile|stand|open_|wake|spring|come_here|step_out|go_out|enter_in|point_up|too_much|very_much|unwrap|fly|step_in)"),
    ("slide", r"^(cut|split|slide|plow|fold|measure|point|ask|draw|write_|cross|sway|shade|shiver)"),
    ("drag", r"^(run|walk|move|go_|feed|grab|put_|dress|tie_|sit_|make_bed|set_table|pour|eat_|drink_|follow|lead|group|join|give|reach|drive|hold_pen|study|noodle|beauty|farm|dig|pick|mark|check|true|cradle|autumn|compass)"),
    # 自动扩字器（auto.txt）的字形类别标记 → 通用手势机制
    ("tap", r"^(auto_picto)"),
    ("hold", r"^(auto_ideo)"),
    ("rise", r"^(auto_comp)"),
    ("drag", r"^(auto_phono)"),
]

PLAY_HINTS = {
    "rise": [
        "按住 {emoji}，把它向上一路托起来！",
        "向上拖动 {emoji}，让「{char}」升起来！",
        "拉起 {emoji}，看看会发生什么变化！",
    ],
    "wipe": [
        "滑动手指擦掉遮挡，把 {emoji} 找出来！",
        "左右涂抹，帮 {emoji} 擦干净！",
        "擦开这片迷雾，露出真正的 {emoji}！",
    ],
    "tap": [
        "点一点 {emoji}，唤醒「{char}」字！",
        "点击 {emoji}，看看它的反应！",
        "轻轻触碰 {emoji}，让它动起来！",
    ],
    "slide": [
        "快速来回摩擦，擦出「{char}」字的火花！",
        "用力滑动！让 {emoji} 现出原形！",
        "划一划屏幕，把「{char}」字擦亮！",
    ],
    "multi": [
        "连续点击 {emoji}，把它叫出来！",
        "多敲几下！{emoji} 就要现身啦！",
        "快点几下 {emoji}，呼唤「{char}」！",
    ],
    "hold": [
        "按住 {emoji} 不放，为它充能！",
        "一直按住 {emoji}，能量满格就会变身！",
        "别松手！按住 {emoji} 直到光芒四射！",
    ],
    "drag": [
        "拖动 {emoji}，带它去该去的地方！",
        "按住 {emoji} 挪一挪，完成任务！",
        "把 {emoji} 拖到发光的地方去！",
    ],
}


# 规模化扩容时，未逐字撰写典故的字用字形学模板生成演变故事
STORY_TEMPLATES = {
    "pictograph": "「{char}」是照着{emoji}的样子画出来的象形字。古人看到它就照着描下轮廓，"
                  "一笔一笔慢慢固定成今天方方正正的字。",
    "ideograph": "「{char}」是在一个符号上另加标记来指出含义所在的指事字。古人用这样巧妙的办法，"
                 "把看不见的意思清楚地画了出来。",
    "compound": "「{char}」把几个部件合在一起：带着{radical}（{rad_name}），{rad_tip}，"
                "再和伙伴合出全新的意思——这就是会意字的巧妙。",
    "phono": "「{char}」是形声字：带着{radical}（{rad_name}），{rad_tip}；另一半悄悄帮它记住读音「{pinyin}」。"
             "形声字是汉字里最庞大的家族，认字先认部首，意思猜得到！",
}

# 自动扩字造句模板（保证句中含本字，drillEngine 的 sentence_fill 依赖这一点）
SENTENCE_TPL = [
    "跟我读：「{word}」的「{char}」！它带着{radical}（{rad_name}），{rad_tip}。",
    "「{char}」读作「{pinyin}」，和小伙伴组成「{word}」，生活里到处用得上！",
    "找一找：{radical}（{rad_name}）藏在「{char}」里，它悄悄告诉我们这个字{rad_tip}！",
]
SENTENCE_TPL_NO_WORD = [
    "跟我读：「{char}」！它读作「{pinyin}」，身上带着{radical}（{rad_name}）呢。",
    "「{char}」的{rad_name}要我们多观察生活，多写几遍就牢牢记住啦！",
    "找一找：{radical}（{rad_name}）藏在「{char}」里，它的意思就藏在旁边呢！",
]


def resolve_mechanism(action, char):
    for name, pattern in MECHANISM_RULES:
        if re.match(pattern, action):
            return name
    return "tap"


def make_play_hint(mechanism, char, emoji):
    tpl = PLAY_HINTS.get(mechanism, PLAY_HINTS["tap"])
    return tpl[ord(char) % len(tpl)].format(emoji=emoji, char=char)


def parse_content():
    rows = []
    for line in CONTENT.strip().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("|")
        if len(parts) != 9:
            print(f"  ✗ 字段数错误({len(parts)}): {line[:30]}", file=sys.stderr)
            continue
        ch, radical, emoji, ctype, inter, words, sent, story, confuse = [
            p.strip() for p in parts
        ]
        rows.append(
            {
                "char": ch,
                "radical": radical,
                "emoji": emoji,
                "charType": ctype,
                "interaction": inter,
                "words": [w.strip() for w in words.split(",") if w.strip()],
                "sentence": sent,
                "story": story,
                "confusing": [c.strip() for c in confuse.split(",") if c.strip()],
            }
        )
    return rows


# 自动扩字器：把紧凑四字段（字|类型|部首|emoji[|词组]）转换为完整 row
# 类型代码：p=象形 i=指事 c=会意 s=形声（或写全称）
AUTO_TYPE_MAP = {
    "p": ("pictograph", "auto_picto"),
    "i": ("ideograph", "auto_ideo"),
    "c": ("compound", "auto_comp"),
    "s": ("phono", "auto_phono"),
    "pictograph": ("pictograph", "auto_picto"),
    "ideograph": ("ideograph", "auto_ideo"),
    "compound": ("compound", "auto_comp"),
    "phono": ("phono", "auto_phono"),
}


# 部首 → emoji 自动配图（自动扩字器用，提升「玩/认」环节的画面感）
RADICAL_EMOJI = {
    "氵": "💧", "水": "💧", "冫": "🧊", "火": "🔥", "灬": "🔥", "木": "🌳",
    "艹": "🌿", "草": "🌿", "竹": "🎋", "禾": "🌾", "米": "🍚", "麦": "🌾",
    "田": "🌾", "土": "🟫", "石": "🪨", "山": "⛰️", "日": "☀️", "月": "🌙",
    "饣": "🍜", "食": "🍜", "飠": "🍜", "饮": "🥤", "巾": "🧣",
    "夕": "🌙", "雨": "🌧️", "雪": "❄️", "风": "🌬️", "气": "💨", "光": "✨",
    "忄": "❤️", "心": "❤️", "⺗": "❤️", "丿": "❓", "人": "🧍", "亻": "🧍",
    "儿": "🧒", "女": "👩", "子": "🧒", "父": "👨", "母": "👩", "目": "👁️",
    "耳": "👂", "口": "👄", "舌": "👅", "牙": "🦷", "齿": "🦷", "鼻": "👃",
    "身": "🧍", "骨": "🦴", "血": "🩸", "手": "✋", "扌": "✋", "又": "✋",
    "足": "🦶", "止": "🦶", "走": "🚶", "辶": "🚶", "彳": "🚶", "行": "🚶",
    "见": "👀", "言": "💬", "讠": "💬", "音": "🔊", "页": "🙆", "耳": "👂",
    "糸": "🧵", "纟": "🧵", "衣": "👕", "衤": "👕", "巾": "🧣", "革": "👜",
    "皮": "🟫", "毛": "🐑", "羽": "🪶", "飞": "🕊️", "隹": "🐦", "鸟": "🐦",
    "马": "🐴", "牛": "🐂", "羊": "🐑", "犬": "🐶", "犭": "🐶", "豕": "🐷",
    "豸": "🐆", "鹿": "🦌", "鱼": "🐟", "龟": "🐢", "虫": "🐛", "贝": "💰",
    "玉": "💎", "王": "💎", "金": "⚙️", "钅": "⚙️", "刀": "🔪", "刂": "🔪",
    "戈": "⚔️", "弓": "🏹", "矢": "🏹", "矛": "🔱", "盾": "🛡️", "车": "🚗",
    "舟": "⛵", "方": "🚩", "皿": "🍽️", "缶": "🏺", "鬲": "🍲", "瓦": "🏺",
    "网": "🕸️", "罒": "🕸️", "宀": "🏠", "穴": "🕳️", "广": "🏢", "厂": "🏭",
    "门": "🚪", "户": "🚪", "囗": "⬜", "口": "👄", "斗": "⚔️", "斤": "🪓",
    "耒": "🌾", "耒": "🌾", "老": "👴", "示": "🙏", "礻": "🙏", "鬼": "👻",
    "黑": "⚫", "白": "⚪", "黄": "🟡", "青": "🟢", "赤": "🔴", "彡": "🎨",
    "文": "📜", "攵": "📜", "殳": "🔨", "辛": "🌶️", "辰": "⏰", "酉": "🍷",
    "采": "🌾", "里": "🏘️", "阜": "⛰️", "阝": "⛰️", "邑": "🏙️", "匚": "📦",
    "匸": "📦", "凵": "📦", "冂": "🏞️", "冖": "☂️", "冖": "☂️", "二": "②",
    "三": "③", "十": "🔟", "卜": "📉", "卩": "🔖", "刀": "🔪", "力": "💪",
    "勹": "📦", "匕": "🥄", "匚": "📦", "匚": "📦", "厶": "🔺", "又": "✋",
    "廴": "🚶", "干": "🪵", "工": "🛠️", "己": "🧵", "巾": "🧣", "干": "🪵",
    "幺": "🧶", "广": "🏢", "弋": "🎯", "弓": "🏹", "彐": "🐗", "彳": "🚶",
    "杢": "🪓", "爿": "🪵", "片": "🪵", "爫": "🖐️", "父": "👨", "爻": "☯️",
    "爿": "🪵", "爿": "🪵", "片": "🪵", "片": "🪵", "爿": "🪵", "爪": "🐾",
    "爫": "🐾", "瓠": "🥒", "瓜": "🍉", "瓦": "🏺", "甘": "🍯", "生": "🌱",
    "用": "🔧", "甩": "💨", "甫": "🔱", "牙": "🦷", "牛": "🐂", "牜": "🐂",
    "犬": "🐶", "玄": "🌀", "玉": "💎", "瓜": "🍉", "瓦": "🏺", "甘": "🍯",
    "生": "🌱", "用": "🔧", "田": "🌾", "疋": "🧦", "疒": "🤒", "癶": "🦶",
    "白": "⚪", "皮": "🟫", "皿": "🍽️", "目": "👁️", "矛": "🔱", "矢": "🏹",
    "石": "🪨", "示": "🙏", "禸": "🐾", "禾": "🌾", "穴": "🕳️", "立": "🧍",
    "竹": "🎋", "米": "🍚", "糸": "🧵", "缶": "🏺", "网": "🕸️", "羊": "🐑",
    "羽": "🪶", "老": "👴", "而": "🧔", "耒": "🌾", "耳": "👂", "聿": "🖌️",
    "肉": "🍖", "臣": "👑", "自": "👃", "至": "⛳", "臼": "🥄", "舌": "👅",
    "舛": "🦶", "舟": "⛵", "艮": "🟫", "色": "🎨", "虍": "🐯", "虫": "🐛",
    "血": "🩸", "行": "🚶", "衣": "👕", "西": "🀄", "覀": "🀄", "角": "🦌",
    "言": "💬", "谷": "🌾", "豆": "🫘", "豕": "🐷", "豸": "🐆", "贝": "💰",
    "赤": "🔴", "走": "🚶", "足": "🦶", "身": "🧍", "车": "🚗", "辛": "🌶️",
    "辰": "⏰", "辶": "🚶", "邑": "🏙️", "酉": "🍷", "采": "🌾", "里": "🏘️",
    "金": "⚙️", "长": "📏", "门": "🚪", "阜": "⛰️", "隶": "🖌️", "隹": "🐦",
    "雨": "🌧️", "青": "🟢", "非": "❌", "面": "🙆", "革": "👜", "韦": "👜",
    "韭": "🥬", "音": "🔊", "页": "🙆", "风": "🌬️", "飞": "🕊️", "食": "🍜",
    "首": "🙆", "香": "🌸", "马": "🐴", "骨": "🦴", "高": "🏢", "髟": "💇",
    "斗": "⚔️", "鬯": "🍶", "鬲": "🍲", "鬼": "👻", "鱼": "🐟", "鸟": "🐦",
    "卤": "🧂", "鹿": "🦌", "麦": "🌾", "麻": "🌿", "黄": "🟡", "黍": "🌾",
    "黑": "⚫", "黹": "🧵", "黾": "🐸", "鼎": "🍲", "鼓": "🥁", "鼠": "🐭",
    "鼻": "👃", "齐": "🧱", "齿": "🦷", "龙": "🐉", "龟": "🐢",
}

# 字形类别启发式（自动扩字器）：命中的按对应类别，其余默认形声 phono
PICTO_SET = set("日月山水火木田人口手耳目舌牙心牛羊马鸟鱼龟虫贝石禾竹门网刀弓车舟几川泉林森泉虫爪羽角血毛皮自眉发".split())
IDEO_SET = set("上下中本末刃旦寸太天囚内勺廿曰未亦亦寸".split())
COMPOUND_SET = set("明林从炎休森晶众磊男妇好尘尖歪采泪信鲜双朋北友看妇孬歪甭歪杲杳淼焱毳贔".split())

# 常见双字词组（提升练字题型质量；未命中则用单字）
WORD_MAP = {
    "河": "河流", "想": "想法", "花": "花朵", "谢": "谢谢", "银": "银行", "笔": "铅笔",
    "妈": "妈妈", "星": "星星", "车": "汽车", "学": "学习", "校": "学校", "海": "大海",
    "风": "风景", "云": "云朵", "雪": "雪花", "山": "高山", "石": "石头", "金": "黄金",
    "银": "银行", "铜": "铜钱", "铁": "铁锅", "钢": "钢铁", "门": "大门", "窗": "窗户",
    "桌": "桌子", "椅": "椅子", "床": "床铺", "灯": "灯光", "钟": "钟表", "镜": "镜子",
    "衣": "衣服", "帽": "帽子", "鞋": "鞋子", "袜": "袜子", "饭": "米饭", "菜": "青菜",
    "汤": "汤水", "肉": "肉类", "蛋": "鸡蛋", "茶": "喝茶", "酒": "喝酒", "糖": "糖果",
    "果": "水果", "瓜": "西瓜", "豆": "黄豆", "米": "大米", "面": "面条", "油": "食油",
    "盐": "食盐", "笔": "铅笔", "纸": "白纸", "书": "读书", "画": "画画", "字": "写字",
    "词": "词语", "句": "句子", "话": "说话", "音": "音乐", "歌": "唱歌", "舞": "跳舞",
    "车": "汽车", "船": "小船", "机": "飞机", "师": "老师", "生": "学生", "友": "朋友",
    "家": "家人", "国": "国家", "城": "城市", "村": "村庄", "田": "田地", "园": "花园",
    "春": "春天", "秋": "秋天", "冬": "冬天", "夏": "夏天", "雨": "下雨", "雷": "打雷",
    "星": "星星", "光": "阳光", "影": "影子", "色": "颜色", "红": "红色", "绿": "绿色",
    "蓝": "蓝色", "黑": "黑色", "白": "白色", "高": "高兴", "想": "想法", "念": "想念",
    "忘": "忘记", "懂": "懂得", "理": "理解", "知": "知道", "认": "认识", "识": "知识",
    "练": "练习", "习": "学习", "复": "复习", "考": "考试", "答": "回答", "问": "问题",
    "说": "说话", "讲": "讲话", "读": "读书", "写": "写字", "听": "听见", "看": "看见",
    "站": "站立", "坐": "坐下", "跑": "跑步", "跳": "跳跃", "走": "走路", "飞": "飞机",
    "游": "游泳", "洗": "洗手", "吃": "吃饭", "喝": "喝水", "睡": "睡觉", "工": "工作",
    "帮": "帮忙", "保": "保护", "爱": "爱心", "喜": "喜欢", "怕": "害怕", "急": "着急",
    "时": "时间", "年": "新年", "月": "月亮", "日": "日子", "早": "早上", "晚": "晚上",
}


def get_radical(ch):
    """用 cnradical 取部首，失败回退为字本身"""
    if _RADICAL_ENGINE is None:
        return ch
    try:
        r = _RADICAL_ENGINE.trans_ch(ch)
        if r:
            return r
    except Exception:  # noqa: BLE001
        pass
    return ch


# 同部首换着配图：同偏旁的字不再千人一面（按字码位确定性取模挑选）
RADICAL_EMOJI_VARIETY = {
    "氵": ["💧", "🌊", "🫧"], "冫": ["🧊", "❄️"], "木": ["🌳", "🌲", "🪵"],
    "艹": ["🌿", "🍀", "🌱"], "口": ["👄", "🗣️"], "扌": ["✋", "🤲"],
    "忄": ["❤️", "💖", "💗"], "心": ["❤️", "💛", "💗"], "女": ["👩", "👧"],
    "子": ["🧒", "👶"], "人": ["🧍", "🧑"], "亻": ["🧍", "🧑"],
    "虫": ["🐛", "🦋", "🐝"], "鱼": ["🐟", "🐠", "🐡"], "鸟": ["🐦", "🕊️", "🦜"],
    "隹": ["🐦", "🕊️"], "马": ["🐴", "🐎"], "牛": ["🐂", "🐄"],
    "羊": ["🐑", "🐐"], "犬": ["🐶", "🐕"], "犭": ["🐶", "🦊"],
    "火": ["🔥", "🕯️"], "灬": ["🔥", "🍳"], "日": ["☀️", "🌞"],
    "月": ["🌙", "🌛"], "钅": ["⚙️", "🔧", "🪙"], "金": ["⚙️", "🪙"],
    "讠": ["💬", "🗣️"], "言": ["💬", "📜"], "纟": ["🧵", "🧶"],
    "糸": ["🧵", "🧶"], "山": ["⛰️", "🏔️"], "石": ["🪨", "🧱"],
    "雨": ["🌧️", "☔"], "目": ["👁️", "👀"], "足": ["🦶", "👟"],
    "辶": ["🚶", "🛤️"], "宀": ["🏠", "🏡"], "穴": ["🕳️", "🛖"],
    "王": ["💎", "👑"], "玉": ["💎", "👑"], "贝": ["💰", "🪙"],
    "车": ["🚗", "🚙"], "竹": ["🎋", "🎍"], "米": ["🍚", "🍙"],
    "田": ["🌾", "🧑‍🌾"], "土": ["🟫", "🧱"], "禾": ["🌾", "🌱"],
    "刀": ["🔪", "🗡️"], "刂": ["🔪", "⚔️"], "饣": ["🍜", "🍞"],
    "门": ["🚪", "🏠"], "页": ["🙆", "🧑"], "广": ["🏢", "🏥"],
    "弓": ["🏹", "🎯"], "戈": ["⚔️", "🛡️"], "衤": ["👕", "🧥"],
    "衣": ["👕", "👗"], "疒": ["🤒", "💊"], "走": ["🚶", "🏃"],
}

# 部首本义表（儿童口吻）：造句 / 故事提质的数据源
RADICAL_MEANINGS = {
    "氵": ("三点水", "和水是好朋友，像小河流水"),
    "冫": ("两点水", "和冰凉寒冷有关"),
    "木": ("木字旁", "和树木、木材有关"),
    "艹": ("草字头", "和花草植物有关"),
    "口": ("口字旁", "和嘴巴、说话、吃吃喝喝有关"),
    "扌": ("提手旁", "和手的动作有关"),
    "忄": ("竖心旁", "和心里的想法、心情有关"),
    "心": ("心字底", "和心里的想法、感受有关"),
    "女": ("女字旁", "和女性、美好温柔的事物有关"),
    "子": ("子字旁", "和小孩、孩子有关"),
    "人": ("人字头", "和人有关"),
    "亻": ("单人旁", "和人的动作、身份有关"),
    "虫": ("虫字旁", "和小虫子有关"),
    "鱼": ("鱼字旁", "和鱼儿、水中生物有关"),
    "鸟": ("鸟字旁", "和飞鸟有关"),
    "隹": ("短尾巴鸟", "和鸟类有关"),
    "马": ("马字旁", "和骏马、奔跑有关"),
    "牛": ("牛字旁", "和牛儿、牲口有关"),
    "羊": ("羊字旁", "和羊儿、温顺的动物有关"),
    "犬": ("犬字旁", "和狗有关"),
    "犭": ("反犬旁", "和兽类动物有关"),
    "火": ("火字旁", "和火光、燃烧有关"),
    "灬": ("四点底", "常常表示火，和加热烹煮有关"),
    "日": ("日字旁", "和太阳、时间、光明有关"),
    "月": ("月字旁", "和月亮、时间或身体有关"),
    "钅": ("金字旁", "和金属、器具有关"),
    "金": ("金字底", "和金属、财富有关"),
    "讠": ("言字旁", "和说话、语言有关"),
    "言": ("言字旁", "和说话、文字有关"),
    "纟": ("绞丝旁", "和丝线、编织有关"),
    "糸": ("绞丝底", "和丝线、绳索有关"),
    "山": ("山字旁", "和山峰、高地有关"),
    "石": ("石字旁", "和石头、坚硬的东西有关"),
    "雨": ("雨字头", "和下雨、天气有关"),
    "目": ("目字旁", "和眼睛、看有关"),
    "足": ("足字旁", "和脚、走路有关"),
    "辶": ("走之底", "和走路、行进有关"),
    "宀": ("宝盖头", "和房屋、家有关"),
    "穴": ("穴宝盖", "和洞孔、住处有关"),
    "王": ("王字旁", "和美玉、珍宝有关"),
    "玉": ("玉字旁", "和美玉、珍宝有关"),
    "贝": ("贝字底", "和钱财、宝贝有关"),
    "车": ("车字旁", "和车辆、出行有关"),
    "竹": ("竹字头", "和竹子、竹制品有关"),
    "米": ("米字旁", "和粮食、吃的东西有关"),
    "田": ("田字旁", "和田地、庄稼有关"),
    "土": ("提土旁", "和泥土、大地有关"),
    "禾": ("禾字旁", "和庄稼、谷物有关"),
    "刀": ("刀字头", "和刀、切分有关"),
    "刂": ("立刀旁", "和刀、切割有关"),
    "饣": ("食字旁", "和食物、吃饭有关"),
    "门": ("门字框", "和门户、进出有关"),
    "页": ("页字边", "和头部、脸面有关"),
    "广": ("广字头", "和房屋、场所有关"),
    "弓": ("弓字旁", "和弓箭、弯曲有关"),
    "戈": ("戈字旁", "和兵器、打仗有关"),
    "衤": ("衣字旁", "和衣服、穿戴有关"),
    "衣": ("衣字底", "和衣服、穿戴有关"),
    "疒": ("病字头", "和生病、身体不舒服有关"),
    "走": ("走字旁", "和走路、跑动有关"),
    "耳": ("耳字旁", "和耳朵、听有关"),
    "手": ("手字头", "和手、动作有关"),
    "又": ("又字旁", "和手、重复的动作有关"),
    "尸": ("尸字头", "和身体、房屋有关"),
    "巾": ("巾字旁", "和布巾、织物有关"),
    "力": ("力字旁", "和力气、用劲有关"),
    "夕": ("夕字旁", "和傍晚、夜晚有关"),
    "土": ("提土旁", "和泥土、大地有关"),
    "亠": ("点横头", "常在字的最上面"),
    "冖": ("秃宝盖", "像一块盖布"),
    "囗": ("国字框", "把意思围在里面"),
    "大": ("大字头", "和大小、张开有关"),
    "小": ("小字头", "和细小有关"),
    "飞": ("飞字旁", "和飞翔有关"),
    "风": ("风字框", "和风、气象有关"),
    "食": ("食字旁", "和食物有关"),
    "香": ("香字头", "和香味有关"),
    "骨": ("骨字旁", "和骨头、身体有关"),
    "鬼": ("鬼字旁", "和鬼怪、神奇的事有关"),
    "黑": ("黑字旁", "和黑色、暗处有关"),
    "鼓": ("鼓字旁", "和鼓声、敲打有关"),
    "鹿": ("鹿字头", "和鹿儿有关"),
    "麦": ("麦字头", "和麦子、粮食有关"),
    "麻": ("麻字头", "和麻、纤维有关"),
    "齿": ("齿字旁", "和牙齿有关"),
    "龙": ("龙字旁", "和神龙有关"),
}


def auto_emoji(ch, radical):
    """同部首多枚 emoji，按字码位确定性挑选，避免同旁字配图千篇一律"""
    val = RADICAL_EMOJI.get(radical, "🔤")
    if isinstance(val, list):
        return val[ord(ch) % len(val)]
    return val


def auto_type(ch):
    if ch in PICTO_SET:
        return "pictograph"
    if ch in IDEO_SET:
        return "ideograph"
    if ch in COMPOUND_SET:
        return "compound"
    return "phono"


def load_auto():
    """读取 tools/content/auto*.txt，规模化补字。故事走 STORY_TEMPLATES 模板。"""
    import glob

    rows = []
    for path in sorted(glob.glob(os.path.join(CONTENT_DIR, "auto*.txt"))):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = [p.strip() for p in line.split("|")]
            if len(parts) < 4:
                continue
            ch, tcode, radical, emoji = parts[0], parts[1], parts[2], parts[3]
            words = (
                [w.strip() for w in parts[4].split(",") if w.strip()]
                if len(parts) > 4 and parts[4]
                else [ch]
            )
            char_type, interaction = AUTO_TYPE_MAP.get(tcode, ("phono", "auto_phono"))
            rows.append(
                {
                    "char": ch,
                    "radical": radical,
                    "emoji": emoji,
                    "charType": char_type,
                    "interaction": interaction,
                    "words": words,
                    "sentence": f"“{ch}”字可以这样记：{emoji} 帮我们想起它的意思，多写几遍就牢牢记住啦！",
                    "story": "-",  # 走 STORY_TEMPLATES 模板
                    "confusing": [],
                    "auto": True,  # 造句/干扰项由 build() 的内容提质引擎生成
                }
            )
    return rows


def load_auto_list():
    """读取 tools/content/auto*.chars.txt（纯字池，每行一字），规模化补字。
    部首用 cnradical 自动取，emoji 走 RADICAL_EMOJI 映射，字形类别走启发式，
    词组走 WORD_MAP，故事走 STORY_TEMPLATES 模板。"""
    import glob

    rows = []
    for path in sorted(glob.glob(os.path.join(CONTENT_DIR, "auto*.chars.txt"))):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            for ch in line:
                if not "\u4e00" <= ch <= "\u9fff":
                    continue
                ctype = auto_type(ch)
                interaction = {
                    "pictograph": "auto_picto",
                    "ideograph": "auto_ideo",
                    "compound": "auto_comp",
                    "phono": "auto_phono",
                }[ctype]
                radical = get_radical(ch)
                emoji = auto_emoji(ch, radical)
                word = WORD_MAP.get(ch, ch)
                rows.append(
                    {
                        "char": ch,
                        "radical": radical,
                        "emoji": emoji,
                        "charType": ctype,
                        "interaction": interaction,
                        "words": [word],
                        "sentence": f"“{ch}”字可以这样记：{emoji} 帮我们想起它的意思，多写几遍就牢牢记住啦！",
                        "story": "-",  # 走 STORY_TEMPLATES 模板
                        "confusing": [],
                        "auto": True,  # 造句/干扰项由 build() 的内容提质引擎生成
                    }
                )
    return rows


# 四阶段演变描述模板（按字形类别生成，与人工故事互补）
EVOLUTION_DESC = {
    "pictograph": (
        "照着事物的样子画出来的图画文字",
        "线条开始规整，保留事物轮廓",
        "笔画变得平直，形状基本固定",
        "楷书方正规整，成为今天的方块字",
    ),
    "ideograph": (
        "用象征性符号指出事物的位置",
        "符号与主体结合，含义更明确",
        "抽象符号演变为固定笔画",
        "楷书定型，一看就懂的指事字",
    ),
    "compound": (
        "两个意义部件组合成新含义",
        "部件位置逐步固定",
        "笔画简化，部件呼应",
        "楷书定型，会意字含义巧妙",
    ),
    "phono": (
        "形旁表义、声旁表音初步成形",
        "形旁与声旁位置固定",
        "笔画规整，结构稳定",
        "楷书定型，形声字家族庞大",
    ),
}


# ---------------------------------------------------------------------------
# 笔顺几何管线：hanzi-writer medians(1024 网格) → 渲染器 0-100 空间的三点笔画
# 渲染端 (hanziEngine.renderStrokePath / drawGuideOrb) 只消费 start / corner / end
# 三点并连直线，故必须把中轴折线简化为「起点—(拐点)—终点」。
#
# 标定方法：取字库中与人工精编版重叠的 86 字，统计中轴包围盒与精编包围盒，
# 线性回归得到仿射参数（缩放 + 中心对齐），使自动生成的字形与人工版视觉一致。
#   中轴 bbox x:[11.91, 89.45] y:[10.84, 85.30]  中心 (50.68, 48.07)
#   精编 bbox x:[20.00, 82.00] y:[18.00, 88.00]  中心 (51.00, 53.00)
# ---------------------------------------------------------------------------
_GRID = 1024.0
_Y_FLIP = 900.0
_CALIB_X_SCALE = 0.80
_CALIB_Y_SCALE = 0.94
_CALIB_SRC_CX = 50.68
_CALIB_SRC_CY = 48.07
_CALIB_DST_CX = 51.0
_CALIB_DST_CY = 53.0
# 拐点判定：用「起点→候选点」与「候选点→终点」两条弦的夹角度量转向。
# 不能用相邻微小线段的局部转角——中轴在拐角处是弧线采样，局部转角会严重
# 低估（如「日」的横折局部仅 43.8°，实际整体转向 90°），导致折笔漏判。
_CORNER_MIN_DEG = 50.0
# 弦长下限：候选点离端点太近时弦方向不可靠，直接排除
_CORNER_MIN_CHORD = 8.0
# 钩判定：末段方向与主体差异 ≥92°。实测分布：真钩（月 113 / 小 102 / 刀 99）
# 与竖段内收（目 84 / 田 12）存在清晰分界，92° 兼顾两者。
_HOOK_MAX_LEN_RATIO = 0.30
_HOOK_MIN_DEG = 92.0
# 弯判定：转角介于折与直之间，视为缓弯
_BEND_MAX_DEG = 62.0
# 弧线判定：弦转角虽大但相邻微段最大转角低于该值时，是平滑弧线（如卧钩）
# 而非折笔——折笔的转向集中在一个点，弧线的转向均匀分散。
_ARC_MAX_LOCAL_DEG = 28.0
# 竖 与 竖撇 的判别阈值（由 100 字人工标注集网格扫描标定，见 tools/tune_stroke.py）
# 实测上限：几何推断笔画名的准确率约 77%（顺序无关口径），无法再显著提升——
# 「竖」与「竖撇」在角度/偏移/曲率上本质重叠。
_VERT_MAX_DEV = 0.30
_VERT_MAX_CURV = 0.08
# 点/捺 的分界长度（短者为点）
_DOT_MAX_LEN = 26.0
# 提：上扬且偏离水平超过该角度才判为提
_TI_MIN_DEG = 18.0


def _to_canvas(pt):
    """1024 网格原始点 → 渲染器 0-100 空间（y 轴翻转 + 标定仿射）。

    输出取整以压缩体积（1490 字内联笔顺下可省约 25%）；渲染时坐标再乘
    canvas 尺寸，0.5 单位的取整误差对应不足 1% 的像素偏差，可忽略。"""
    x = (pt[0] / _GRID) * 100.0
    y = ((_Y_FLIP - pt[1]) / _GRID) * 100.0
    x = (x - _CALIB_SRC_CX) * _CALIB_X_SCALE + _CALIB_DST_CX
    y = (y - _CALIB_SRC_CY) * _CALIB_Y_SCALE + _CALIB_DST_CY
    return (
        int(round(max(2.0, min(98.0, x)))),
        int(round(max(2.0, min(98.0, y)))),
    )


def _seg_len(a, b):
    return ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** 0.5


def _turn_deg(p0, p1, p2):
    """p0→p1→p2 的转角（度），0 表示共线同向"""
    v1 = (p1[0] - p0[0], p1[1] - p0[1])
    v2 = (p2[0] - p1[0], p2[1] - p1[1])
    n1 = (v1[0] ** 2 + v1[1] ** 2) ** 0.5
    n2 = (v2[0] ** 2 + v2[1] ** 2) ** 0.5
    if n1 < 1e-6 or n2 < 1e-6:
        return 0.0
    cosv = (v1[0] * v2[0] + v1[1] * v2[1]) / (n1 * n2)
    cosv = max(-1.0, min(1.0, cosv))
    return math.degrees(math.acos(cosv))


def _metrics(a, b, pts):
    """点列 pts 上 a→b 的段度量（未标定坐标）：dx, dy, length, dev, curv"""
    dx = pts[b][0] - pts[a][0]
    dy = pts[b][1] - pts[a][1]
    length = _seg_len(pts[a], pts[b])
    s = abs(dx) + abs(dy)
    dev = abs(dx) / s if s > 1e-6 else 0.0
    sub = pts[a:b + 1]
    curv = (_polyline_len(sub) / (length or 1e-6)) - 1.0 if len(sub) > 2 else 0.0
    return dx, dy, length, dev, curv


def _key_index(raw_pts, can_pts):
    """返回归约后的关键点下标 (start_i, corner_i|None, end_i)。

    候选拐点的转向由两条弦的夹角度量：pts[0]→pts[i] 与 pts[i]→pts[-1]。
    相比相邻微段的局部转角，弦向量不受弧线采样密度影响，能正确识别折笔，
    同时对直笔的采样抖动不敏感（直笔各候选点弦夹角均接近 0）。

    折点优先规则：横折钩/竖弯钩这类「横/竖→折→钩」三段的笔画，弦夹角
    最大的点往往落在钩上（「月」的横折钩：折点 103°，钩点 130°），选中
    它会把「横折钩」误拆成「横段 + 撇段」。笔顺中折点必然先于钩点出现，
    故在转角达标（≥_CORNER_MIN_DEG）的候选中，优先采用「首段方向为
    横/竖」的最靠前点；无此类候选时再退化取全局最大转角。"""
    n = len(can_pts)
    if n <= 2:
        return 0, None, n - 1
    cands = []
    max_local = 0.0
    for i in range(1, n - 1):
        if _seg_len(can_pts[0], can_pts[i]) < _CORNER_MIN_CHORD:
            continue
        if _seg_len(can_pts[i], can_pts[-1]) < _CORNER_MIN_CHORD:
            continue
        t = _turn_deg(can_pts[0], can_pts[i], can_pts[-1])
        if t < _CORNER_MIN_DEG:
            continue
        # 相邻微段最大转角：折笔的转向集中在一点（接近整体转向），
        # 平滑弧线（如卧钩）的转向均匀分散在多点，局部转角显著偏小。
        local = max(
            _turn_deg(can_pts[j - 1], can_pts[j], can_pts[j + 1])
            for j in range(max(1, i - 2), min(n - 1, i + 3))
        )
        max_local = max(max_local, local)
        m = _metrics(0, i, raw_pts)
        base = _dir_name(m[0], m[1], m[2], m[3], m[4], allow_dot=False)
        cands.append((t, i, base))
    if not cands or max_local < _ARC_MAX_LOCAL_DEG:
        return 0, None, n - 1
    for _, i, base in cands:
        if base in ("横", "竖"):
            return 0, i, n - 1
    _, best_i, _ = max(cands, key=lambda c: c[0])
    return 0, best_i, n - 1


def _dir_name(dx, dy, length, dev=0.0, curv=0.0, allow_dot=True, vert_lenient=False):
    """单段方向 → 基本笔画名。

    必须在**未标定**的原始屏幕坐标上判定：校准仿射对 x/y 的缩放系数不同
    （0.80 / 0.94），会把所有方向朝垂直方向扭转约 17%，引入系统性偏差。

    竖 与 竖撇在角度上重叠（「月」首笔约 97°，既像竖又像撇），故额外引入
    两个判别量：
      dev  水平偏移比 = |dx| / (|dx|+|dy|)   —— 竖≈0，撇明显左偏
      curv 弯曲度     = 折线长/弦长 - 1       —— 竖直，撇带弧
    屏幕坐标 y 向下为正。"""
    ang = math.degrees(math.atan2(dy, dx))  # 0=向右, 90=向下, 180=向左
    a = abs(ang)
    if a <= 30:
        # 上扬的短横实为提（如「虫」末笔）
        if dy < 0 and a > _TI_MIN_DEG:
            return "提"
        return "横"
    if 30 < a < 60:
        if dy > 0:
            return "点" if (allow_dot and length < _DOT_MAX_LEN) else "捺"
        return "提"
    if 60 <= a <= 120:
        if dy > 0:
            # 复合笔画（横折/竖折等）的竖段就是竖直的，曲率会被钩/折段污染，
            # 用 vert_lenient 跳过 dev/curv 判别（竖撇判别只用于独立撇笔）
            if vert_lenient:
                return "竖"
            return "竖" if (dev < _VERT_MAX_DEV and curv < _VERT_MAX_CURV) else "撇"
        return "提"
    # 120°~180°：向左
    return "撇" if dy > 0 else "提"


def _polyline_len(pts):
    return sum(_seg_len(pts[i], pts[i + 1]) for i in range(len(pts) - 1))


def _name_of(raw_pts, can_pts, si, ci, ei):
    """在未标定的原始屏幕坐标上推断笔画名（标定会扭曲角度，不可用于判定）"""

    def metrics(a, b):
        dx = raw_pts[b][0] - raw_pts[a][0]
        dy = raw_pts[b][1] - raw_pts[a][1]
        length = _seg_len(raw_pts[a], raw_pts[b])
        s = abs(dx) + abs(dy)
        dev = abs(dx) / s if s > 1e-6 else 0.0
        sub = raw_pts[a:b + 1]
        curv = (_polyline_len(sub) / (length or 1e-6)) - 1.0 if len(sub) > 2 else 0.0
        return dx, dy, length, dev, curv

    def detect_hook():
        """检测末段钩：末尾短段 + 急转（基于原始点列末尾，绕过弦法拐点选择）。

        钩必然位于点列末尾——末两段弦长占比 <30% 且方向与主体差异 ≥62°。
        主体方向必须从**拐点**（而非起点）起算：对横折类，起点→末端的
        整体弦方向被横段拖向水平，会把「田」横折竖段仅 10° 的内收误判成钩
        （实测整体弦 39.6° vs 末端 104.5° → diff 64.9° 误触发）。"""
        n = len(raw_pts)
        if n - si < 3:
            return False
        end_len = _seg_len(raw_pts[ei - 2], raw_pts[ei])
        total_len = _seg_len(raw_pts[si], raw_pts[ei])
        if end_len >= _HOOK_MAX_LEN_RATIO * total_len:
            return False
        body = math.degrees(
            math.atan2(
                raw_pts[ei - 2][1] - raw_pts[ci][1],
                raw_pts[ei - 2][0] - raw_pts[ci][0],
            )
        )
        last = math.degrees(
            math.atan2(
                raw_pts[ei][1] - raw_pts[ei - 2][1],
                raw_pts[ei][0] - raw_pts[ei - 2][0],
            )
        )
        diff = abs(last - body) % 360.0
        if diff > 180.0:
            diff = 360.0 - diff
        return diff >= _HOOK_MIN_DEG

    if ci is None:
        m = metrics(si, ei)
        return _dir_name(m[0], m[1], m[2], m[3], m[4], allow_dot=True)

    turn = _turn_deg(can_pts[si], can_pts[ci], can_pts[ei])
    hook = detect_hook()

    m1 = metrics(si, ci)
    m2 = metrics(ci, ei)
    # 复合笔画的分段一律不判「点」（点必须是独立短笔），避免脏名扩散
    base = _dir_name(m1[0], m1[1], m1[2], m1[3], m1[4], allow_dot=False)
    tail = _dir_name(m2[0], m2[1], m2[2], m2[3], m2[4], allow_dot=False, vert_lenient=True)

    # 钩：基于原始点列末段独立检测（弦法拐点常落在折点而非钩点）
    if hook:
        return {"竖": "竖钩", "横": "横折钩", "撇": "撇钩"}.get(base, base + "钩")
    # 缓弯：转角不足，退化为基本名（不臆造「X弯」）
    if turn < _BEND_MAX_DEG:
        return "竖弯" if base == "竖" else base
    if base == tail:
        return base
    combo = {
        ("横", "竖"): "横折",
        ("横", "撇"): "横撇",
        ("横", "捺"): "横折",
        ("横", "提"): "横折提",
        ("竖", "横"): "竖折",
        ("竖", "捺"): "竖折",
        ("竖", "提"): "竖提",
        ("撇", "横"): "撇折",
        ("撇", "捺"): "撇折",
        ("捺", "横"): "撇折",
    }
    return combo.get((base, tail), base + "折")


def build_strokes(medians):
    """hanzi-writer medians → 渲染器 strokes 数组

    维护两条并行点列：raw（未标定，供笔画名判定）与 can（标定后，供输出）。
    两者同步去重，保证下标一一对应。"""
    out = []
    for i, m in enumerate(medians):
        if len(m) < 2:
            continue
        pairs = []
        for p in m:
            raw = (p[0] / _GRID * 100.0, (_Y_FLIP - p[1]) / _GRID * 100.0)
            can = _to_canvas(p)
            if pairs and _seg_len(pairs[-1][1], can) <= 0.8:
                continue
            pairs.append((raw, can))
        if len(pairs) < 2:
            pairs = [
                (
                    (m[0][0] / _GRID * 100.0, (_Y_FLIP - m[0][1]) / _GRID * 100.0),
                    _to_canvas(m[0]),
                ),
                (
                    (m[-1][0] / _GRID * 100.0, (_Y_FLIP - m[-1][1]) / _GRID * 100.0),
                    _to_canvas(m[-1]),
                ),
            ]
        raw_pts = [r for r, _ in pairs]
        can_pts = [c for _, c in pairs]

        si, ci, ei = _key_index(raw_pts, can_pts)
        name = _name_of(raw_pts, can_pts, si, ci, ei)

        # path 字段全项目无消费方（渲染只用 start/corner/end），不写入以压缩体积
        rec = {
            "name": name,
            "order": i + 1,
            "start": {"x": can_pts[si][0], "y": can_pts[si][1]},
            "end": {"x": can_pts[ei][0], "y": can_pts[ei][1]},
        }
        if ci is not None:
            rec["corner"] = {"x": can_pts[ci][0], "y": can_pts[ci][1]}
        out.append(rec)
    return out


# 人工精编版字库（并行产出的 100 字 premium 内容），用于合并保留。
# 注意：src/data/characters.js 是 JS 对象字面量（键名无引号），并非合法 JSON，
# 直接 json.loads 会抛错并被 except 静默吞掉导致精编内容丢失。
# 故统一以 tools/content/seed_premium.json 作为规范种子源（由 node 导出生成）。
SEED_PATH = os.path.join(CONTENT_DIR, "seed_premium.json")


def load_seed():
    """读取人工精编记录（保留其定制故事 / 游戏配置 / 手调笔顺）"""
    if not os.path.exists(SEED_PATH):
        print(f"  ⚠ 未找到精编种子 {SEED_PATH}，将全部自动生成")
        return {}
    try:
        data = json.load(open(SEED_PATH, encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"  ⚠ 精编种子解析失败（{exc}），将全部自动生成")
        return {}
    return {d["char"]: d for d in data if d.get("char") and d.get("strokes")}


def build():
    rows = parse_content()
    auto_rows = load_auto()
    auto_list_rows = load_auto_list()
    seen = {r["char"] for r in rows}
    added_auto = 0
    for r in auto_rows:
        if r["char"] not in seen:
            seen.add(r["char"])
            rows.append(r)
            added_auto += 1
    added_list = 0
    for r in auto_list_rows:
        if r["char"] not in seen:
            seen.add(r["char"])
            rows.append(r)
            added_list += 1
    print(f"语义内容条目: {len(rows)} (自动扩字 {added_auto}，字池扩字 {added_list})")

    # 人工精编版 100 字优先置顶：既是最高频基础字（教学顺序正确），
    # 也保留其定制演变故事 / 游戏配置 / 手调笔顺，避免被自动生成覆盖。
    seed_map = load_seed()
    if seed_map:
        seed_rows = [r for r in rows if r["char"] in seed_map]
        rest_rows = [r for r in rows if r["char"] not in seed_map]
        rows = seed_rows + rest_rows
        print(f"人工精编字置顶: {len(seed_rows)} 字")

    # 字库上限：默认不设限（全字池）；如需对齐《洪恩识字》1300 字课程口径，
    # 用环境变量 MAX_CHARS=1300 重跑即可只保留核心课程
    max_chars = int(os.environ.get("MAX_CHARS", "0")) or None
    if max_chars and len(rows) > max_chars:
        dropped = len(rows) - max_chars
        print(f"  按 {max_chars} 字上限裁剪（丢弃字池尾部低频候选 {dropped} 个）")
        rows = rows[:max_chars]

    chars = [r["char"] for r in rows]
    print("正在获取真实笔顺数据 ...")
    with ThreadPoolExecutor(max_workers=6) as pool:
        stroke_data = list(pool.map(fetch_stroke_data, chars))

    # ------------------------------------------------------------------
    # 内容提质·干扰项挖掘：按「同部首（形近）→ 同拼音（音近）→ 笔画数最近」
    # 三级优先为自动扩字生成有教学价值的干扰字，替代随机补位
    # ------------------------------------------------------------------
    ctx = []
    for i, (row, sd) in enumerate(zip(rows, stroke_data)):
        if sd is None:
            ctx.append(None)
            continue
        try:
            pb = pinyin(row["char"], style=Style.NORMAL, heteronym=False)[0][0]
        except Exception:  # noqa: BLE001
            pb = ""
        ctx.append(
            {
                "char": row["char"],
                "radical": row["radical"],
                "pbase": pb,
                "strokes": len(sd["strokes"]),
                "idx": i,
            }
        )
    valid_ctx = [c for c in ctx if c]
    by_radical = defaultdict(list)
    by_sound = defaultdict(list)
    for c in valid_ctx:
        by_radical[c["radical"]].append(c)
        if c["pbase"]:
            by_sound[c["pbase"]].append(c)

    def _nearest(pool_list, target_strokes, exclude, limit):
        ranked = sorted(
            pool_list,
            key=lambda c: (abs(c["strokes"] - target_strokes), c["idx"]),
        )
        out = []
        for c in ranked:
            if len(out) >= limit:
                break
            if c["char"] not in exclude:
                out.append(c["char"])
        return out

    def pick_confusing(ch, radical, pbase, strokes, want=3):
        """形近优先（同部首、笔画相近，最多 2 个）→ 音近（同拼音）→ 笔画数最近兜底"""
        picks = _nearest(
            [c for c in by_radical.get(radical, []) if c["char"] != ch],
            strokes, set(), min(2, want),
        )
        if pbase:
            picks += _nearest(
                [c for c in by_sound.get(pbase, []) if c["char"] != ch],
                strokes, set(picks), want - len(picks),
            )
        if len(picks) < want:
            picks += _nearest(valid_ctx, strokes, set(picks + [ch]), want - len(picks))
        return picks[:want]

    records = []
    missing = 0
    for idx, (row, sd) in enumerate(zip(rows, stroke_data)):
        if sd is None:
            missing += 1
            continue

        stage = 1 if idx < 70 else (2 if idx < 140 else 3)
        island = ["forest", "town", "space"][stage - 1]
        desc4 = EVOLUTION_DESC.get(row["charType"], EVOLUTION_DESC["pictograph"])

        # 「玩」环节：语义动作归并为通用手势机制
        mechanism = resolve_mechanism(row["interaction"], row["char"])

        # 干扰形近字：人工标注优先；自动扩字用三级挖掘（形近→音近→笔画相近）补足 3 个
        confusing = [c for c in row["confusing"] if c != row["char"]]
        if len(confusing) < 3:
            pbase = next((c["pbase"] for c in valid_ctx if c["char"] == row["char"]), "")
            for c in pick_confusing(row["char"], row["radical"], pbase, len(sd["strokes"]), 3):
                if c not in confusing and len(confusing) < 3:
                    confusing.append(c)

        # 词组：拼音自动生成（词组语境下的多音字走 py_phrase）
        words = [
            {"word": w, "pinyin": py_phrase(w), "desc": ""}
            for w in row["words"]
        ]

        # 造句：自动扩字走「部首本义 + 词组 + 拼音」模板（句中必含本字，支撑 sentence_fill）
        char_pinyin = py_tone(row["char"])
        rad_name, rad_tip = RADICAL_MEANINGS.get(row["radical"], ("这个部件", "和它的意思有关"))
        sentence = row["sentence"]
        if row.get("auto"):
            word0 = words[0]["word"] if words else row["char"]
            fmt = dict(
                char=row["char"], pinyin=char_pinyin, word=word0,
                radical=row["radical"], rad_name=rad_name, rad_tip=rad_tip,
            )
            if word0 == row["char"]:
                sentence = SENTENCE_TPL_NO_WORD[ord(row["char"]) % len(SENTENCE_TPL_NO_WORD)].format(**fmt)
            else:
                sentence = SENTENCE_TPL[ord(row["char"]) % len(SENTENCE_TPL)].format(**fmt)
        if not row.get("auto") and row["char"] not in (sentence or ""):
            # 手工造句未含本字（8 处）：追加读音小贴士，恢复 sentence_fill 题型资格
            sentence = f"{sentence}「{row['char']}」读作「{char_pinyin}」哦！"

        # gameConfig：正确项 + 形近干扰项（强制剔除自身并去重，防止射击游戏出现重复气球）
        options = [row["char"]]
        for c in confusing:
            if c != row["char"] and c not in options:
                options.append(c)
            if len(options) >= 4:
                break
        # 干扰项不足时用字库内其他字补齐
        if len(options) < 4:
            for other in rows:
                c = other["char"]
                if c != row["char"] and c not in options:
                    options.append(c)
                if len(options) >= 4:
                    break

        confuse_with_pinyin = ", ".join(f"{c}({py_tone(c)})" for c in confusing)

        records.append(
            {
                "id": f"char_{idx + 1:03d}",
                "char": row["char"],
                # 甲骨文 / 金文字形：人工精编版用「太玄经符号」作象形占位，
                # 自动扩字无可靠字形来源，留空由渲染层回退处理。
                "oracleGlyph": "",
                "bronzeGlyph": "",
                "pinyin": py_tone(row["char"]),
                "pinyinTone": tone_number(row["char"]),
                "radical": row["radical"],
                "strokeCount": len(sd["strokes"]),
                "stage": stage,
                "themeIsland": island,
                "unitIndex": idx // 5 + 1,
                "levelIndex": idx + 1,
                "emoji": row["emoji"],
                "charType": row["charType"],
                "interaction": row["interaction"],
                "mechanism": mechanism,
                "playHint": make_play_hint(mechanism, row["char"], row["emoji"]),
                "evolution": {
                    "story": row["story"] if row["story"] not in ("-", "") else STORY_TEMPLATES.get(
                        row["charType"], STORY_TEMPLATES["pictograph"]
                    ).format(
                        char=row["char"], emoji=row["emoji"],
                        radical=row["radical"], pinyin=py_tone(row["char"]),
                        rad_name=rad_name, rad_tip=rad_tip,
                    ),
                    "oracleDesc": desc4[0],
                    "bronzeDesc": desc4[1],
                    "sealDesc": desc4[2],
                    "modernDesc": desc4[3],
                },
                "words": words,
                "sentence": sentence,
                "strokes": build_strokes(sd["medians"]),
                "confusingChars": confusing,
                "confusingHint": confuse_with_pinyin,
                "gameConfig": {
                    "type": "balloon_pop",
                    "title": f"射击{row['char']}字气球",
                    "instruction": f"请听发音，点击带有“{row['char']}”字的气球！",
                    "options": options,
                    "correctIndex": 0,
                },
            }
        )

        # 人工精编版：保留其定制内容，仅重排进度字段（id/阶段/单元/关卡）
        rec = records[-1]
        sd_row = seed_map.get(row["char"])
        if sd_row:
            for k in (
                "oracleGlyph", "bronzeGlyph", "words", "sentence",
                "strokes", "confusingChars", "gameConfig",
            ):
                if sd_row.get(k):
                    rec[k] = sd_row[k]
            # evolution 逐字段合并：部分精编条目缺 story / oracleDesc 等字段，
            # 整块覆盖会把空值写回、丢掉模板生成的故事。改为「精编非空优先，
            # 缺失项由本文件的故事模板兜底」。
            seed_ev = sd_row.get("evolution") or {}
            if seed_ev:
                ev = dict(rec["evolution"])
                for k, v in seed_ev.items():
                    if v:
                        ev[k] = v
                rec["evolution"] = ev
            rec["strokeCount"] = len(rec["strokes"])
            # 精编版带 path 字段，统一剥离（渲染层不消费，纯属体积负担）
            for st in rec["strokes"]:
                st.pop("path", None)
            # 人工标注的笔画名可直接用于语音播报
            rec["strokeNamesVerified"] = True
        else:
            # 几何推断的笔画名准确率约 77%，不可用于语音播报（会念错给孩子）。
            # 渲染与书写判定只依赖 start/corner/end 几何，该字段不影响练习正确性；
            # 语音侧改播「第 N 笔」，保证零错误发音。
            rec["strokeNamesVerified"] = False


    print(f"成功生成: {len(records)} 字，失败: {missing}")

    # ------------------------------------------------------------------
    # 写前完整性校验（防止环境编码问题 / 脏数据覆盖健康字库）
    # 曾发生：并行环境的编码异常把全部中文吞成空串，1490 条记录 char 全为
    # ""、1489 条重复，几乎覆盖健康字库。任何一项不通过即中止，绝不写文件。
    # ------------------------------------------------------------------
    errors = []
    if not records:
        errors.append("记录为空")
    chars = [r["char"] for r in records]
    empty_chars = sum(1 for c in chars if not c or not c.strip())
    if empty_chars:
        errors.append(f"存在空 char 记录 {empty_chars} 条")
    if len(set(chars)) != len(chars):
        dup = sorted({c for c in chars if chars.count(c) > 1})
        errors.append(f"重复 char {len(dup)} 个: {''.join(dup[:20])}")
    if any(not r.get("strokes") for r in records):
        errors.append("存在无笔顺记录")
    if any(not r.get("sentence") for r in records):
        errors.append("存在无造句记录")
    if any(not r.get("evolution") or not r["evolution"].get("story") for r in records):
        errors.append("存在无演变故事记录")
    if errors:
        print("✗✗ 写前校验失败，已中止写文件（保留现有健康字库）：")
        for e in errors:
            print(f"  - {e}")
        return
    print(f"✓ 写前校验通过（{len(records)} 字无重复 / 无空字 / 内容完整）")

    header = """/**
 * 凯茜识字 (Cathy Literacy) - 阶梯字库核心数据库
 * ------------------------------------------------------------
 * 数据来源：
 *  · strokes（笔顺）—— hanzi-writer-data (Make Me a Hanzi 衍生, CC BY 4.0)，
 *    由 1024x1024 网格中轴 medians 归约为「起点-拐点-终点」三点，
 *    再经标定仿射映射到渲染器 0-100 空间，随字库内联（无需额外请求）。
 *  · 拼音与声调 —— pypinyin 自动生成；部首 —— cnradical 自动取。
 *  · 象形演变故事 / 词组 / 造句 / 形近字 —— 教学编撰 / 字形模板生成。
 *  · 前 100 字为人工精编版（定制演变故事、游戏配置与手调笔顺），优先级最高。
 * 本文件由 tools/build_characters.py 生成，请勿手工编辑。
 */

"""

    # 紧凑输出：本文件为生成产物（勿手工编辑），无需缩进可读性；
    # 1490 字内联笔顺后体积敏感，去掉缩进与多余空格可显著减小首屏传输量。
    body = "export const CHARACTER_DATABASE = " + json.dumps(
        records, ensure_ascii=False, separators=(",", ":")
    ) + ";\n"

    # 根据实际生成数据动态计算三阶段范围
    stage_counts = {}
    for r in records:
        stage_counts[r["stage"]] = stage_counts.get(r["stage"], 0) + 1
    s1 = stage_counts.get(1, 0)
    s2 = stage_counts.get(2, 0)
    s3 = stage_counts.get(3, 0)
    total = len(records)

    stages = f"""
export const STAGES_METADATA = [
  {{
    stage: 1,
    title: "第一阶段：启蒙识字 (1-{s1}字)",
    islandName: "奇幻森林岛",
    islandKey: "forest",
    desc: "以大自然象形字为主，通过生动动画建立对汉字字形、字义的初步感知。",
    unlocked: true,
    totalUnits: {max(1, s1 // 5)}
  }},
  {{
    stage: 2,
    title: "第二阶段：生活应用 ({s1 + 1}-{s1 + s2}字)",
    islandName: "缤纷生活岛",
    islandKey: "town",
    desc: "结合生活常识、身体动作、动植物与家庭人际，进行情境扩展应用。",
    unlocked: true,
    totalUnits: {max(1, s2 // 5)}
  }},
  {{
    stage: 3,
    title: "第三阶段：进阶跃升 ({s1 + s2 + 1}-{total}字，目标 1300 字)",
    islandName: "星际智慧岛",
    islandKey: "space",
    desc: "会意字与偏旁部首系统化进阶，全面奠定小学语文自主阅读与书写基础。",
    unlocked: true,
    totalUnits: {max(1, s3 // 5)}
  }}
];
"""

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(header + body + stages)

    print(f"已写出: {OUT_PATH}")
    print(f"文件大小: {os.path.getsize(OUT_PATH) / 1024:.1f} KB")


if __name__ == "__main__":
    build()
