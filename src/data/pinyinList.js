/**
 * 凯茜识字 (Cathy Literacy) - 部编版 63 拼音核心数据库
 * -----------------------------------------------------------------
 * 包含 23 个声母、24 个韵母（单韵母/复韵母/鼻韵母）与 16 个整体认读音节。
 * 遵循严格规范：绝对零 Unicode Emoji，零 SVG。
 */

export const PINYIN_INITIALS = [
  { id: "sm_b", pinyin: "b", category: "initial", name: "声母 b", mnemonic: "右下半圆 b b b，听广播波波波", exampleChar: "爸", confusingWith: "d", mirrorTip: "小收音机朝右摆，竖长圆下就是 b" },
  { id: "sm_p", pinyin: "p", category: "initial", name: "声母 p", mnemonic: "右上半圆 p p p，泼水盆泼泼泼", exampleChar: "跑", confusingWith: "q", mirrorTip: "小红旗子右上飘，竖直圆上就是 p" },
  { id: "sm_m", pinyin: "m", category: "initial", name: "声母 m", mnemonic: "两个小门 m m m，捉迷藏摸摸摸", exampleChar: "妈", confusingWith: "n", mirrorTip: "一个门洞是 n，两个门洞是 m" },
  { id: "sm_f", pinyin: "f", category: "initial", name: "声母 f", mnemonic: "一根拐棍 f f f，老爷爷笑呵呵", exampleChar: "风", confusingWith: "t", mirrorTip: "伞柄朝上是 f，伞柄朝下是 t" },
  { id: "sm_d", pinyin: "d", category: "initial", name: "声母 d", mnemonic: "左下半圆 d d d，小马奔跑嗒嗒嗒", exampleChar: "地", confusingWith: "b", mirrorTip: "小鼓槌敲左边，左下半圆就是 d" },
  { id: "sm_t", pinyin: "t", category: "initial", name: "声母 t", mnemonic: "小伞把儿 t t t，下雨出门不怕淋", exampleChar: "天", confusingWith: "f", mirrorTip: "弯弯向上是 f，弯弯向右是 t" },
  { id: "sm_n", pinyin: "n", category: "initial", name: "声母 n", mnemonic: "一个门洞 n n n，小兔子进洞穴", exampleChar: "牛", confusingWith: "m", mirrorTip: "单门洞是 n，双门洞是 m" },
  { id: "sm_l", pinyin: "l", category: "initial", name: "声母 l", mnemonic: "一根小棍 l l l，竖立挺拔像竹竿", exampleChar: "亮", confusingWith: "1", mirrorTip: "一竖到底就是 l" },
  { id: "sm_g", pinyin: "g", category: "initial", name: "声母 g", mnemonic: "9 字加弯 g g g，白鸽天上飞呀飞", exampleChar: "高", confusingWith: "q", mirrorTip: "弯弯向下带弯钩" },
  { id: "sm_k", pinyin: "k", category: "initial", name: "声母 k", mnemonic: "一挺机枪 k k k，小蝌蚪水中游", exampleChar: "开", confusingWith: "h", mirrorTip: "一竖分两叉" },
  { id: "sm_h", pinyin: "h", category: "initial", name: "声母 h", mnemonic: "一把靠椅 h h h，坐下喝口清凉水", exampleChar: "红", confusingWith: "n", mirrorTip: "竖杆长长成靠背" },
  { id: "sm_j", pinyin: "j", category: "initial", name: "声母 j", mnemonic: "母鸡抬头 j j j，头顶蝴蝶翩翩飞", exampleChar: "家", confusingWith: "i", mirrorTip: "一竖向左弯，头上加个点" },
  { id: "sm_q", pinyin: "q", category: "initial", name: "声母 q", mnemonic: "左上半圆 q q q，彩色气球飘上天", exampleChar: "晴", confusingWith: "p", mirrorTip: "气球在左边，引线垂在右" },
  { id: "sm_x", pinyin: "x", category: "initial", name: "声母 x", mnemonic: "一个大叉 x x x，一把小刀切西瓜", exampleChar: "小", confusingWith: "s", mirrorTip: "左撇右捺画个叉" },
  { id: "sm_zh", pinyin: "zh", category: "initial", name: "声母 zh", mnemonic: "织毛衣 zh zh zh，小嘴翘翘发翘音", exampleChar: "正", confusingWith: "z", mirrorTip: "z 加椅子 h 变成翘舌音" },
  { id: "sm_ch", pinyin: "ch", category: "initial", name: "声母 ch", mnemonic: "吃果子 ch ch ch，两手端平慢点嚼", exampleChar: "出", confusingWith: "c", mirrorTip: "c 加椅子 h 变成翘舌音" },
  { id: "sm_sh", pinyin: "sh", category: "initial", name: "声母 sh", mnemonic: "红领巾 sh sh sh，端端正正戴胸前", exampleChar: "山", confusingWith: "s", mirrorTip: "s 加椅子 h 变成翘舌音" },
  { id: "sm_r", pinyin: "r", category: "initial", name: "声母 r", mnemonic: "一株幼苗 r r r，太阳照耀快发芽", exampleChar: "日", confusingWith: "l", mirrorTip: "一竖右上长小芽" },
  { id: "sm_z", pinyin: "z", category: "initial", name: "声母 z", mnemonic: "平地写字 z z z，横折横转像小鸭", exampleChar: "字", confusingWith: "zh", mirrorTip: "平舌音，舌头平平放" },
  { id: "sm_c", pinyin: "c", category: "initial", name: "声母 c", mnemonic: "刺猬缩成球 c c c，半个圆圈真可爱", exampleChar: "草", confusingWith: "ch", mirrorTip: "左半圆，轻轻吐气" },
  { id: "sm_s", pinyin: "s", category: "initial", name: "声母 s", mnemonic: "蚕儿吐丝 s s s，半个 8 字弯又弯", exampleChar: "四", confusingWith: "sh", mirrorTip: "上下弯弯像蚕丝" },
  { id: "sm_y", pinyin: "y", category: "initial", name: "声母 y", mnemonic: "像把树杈 y y y，大衣领子尖尖角", exampleChar: "月", confusingWith: "i", mirrorTip: "大 y 领着小 i 走" },
  { id: "sm_w", pinyin: "w", category: "initial", name: "声母 w", mnemonic: "大屋屋顶 w w w，两道折线遮风雨", exampleChar: "文", confusingWith: "u", mirrorTip: "大 w 领着小 u 走" }
];

export const PINYIN_FINALS = [
  // 6 单韵母
  { id: "ym_a", pinyin: "a", category: "final", subType: "simple", name: "单韵母 a", mnemonic: "圆圆脸蛋扎小辫，张大嘴巴 a a a", exampleChar: "啊", tones: ["ā", "á", "ǎ", "à"] },
  { id: "ym_o", pinyin: "o", category: "final", subType: "simple", name: "单韵母 o", mnemonic: "太阳升起公鸡叫，嘴巴圆圆 o o o", exampleChar: "喔", tones: ["ō", "ó", "ǒ", "ò"] },
  { id: "ym_e", pinyin: "e", category: "final", subType: "simple", name: "单韵母 e", mnemonic: "清清池塘白鹅游，嘴巴扁扁 e e e", exampleChar: "鹅", tones: ["ē", "é", "ě", "è"] },
  { id: "ym_i", pinyin: "i", category: "final", subType: "simple", name: "单韵母 i", mnemonic: "一件干净漂亮衣，牙齿对齐 i i i", exampleChar: "一", tones: ["ī", "í", "ǐ", "ì"] },
  { id: "ym_u", pinyin: "u", category: "final", subType: "simple", name: "单韵母 u", mnemonic: "乌鸦树上造新窝，嘴唇突出 u u u", exampleChar: "五", tones: ["ū", "ú", "ǔ", "ù"] },
  { id: "ym_v", pinyin: "ü", category: "final", subType: "simple", name: "单韵母 ü", mnemonic: "小鱼池塘吹泡泡，嘴吹哨子 ü ü ü", exampleChar: "鱼", tones: ["ǖ", "ǘ", "ǚ", "ǜ"] },
  // 8 复韵母 + 1 特殊韵母
  { id: "ym_ai", pinyin: "ai", category: "final", subType: "compound", name: "复韵母 ai", mnemonic: "并排挨着比高矮，阿姨靠着弟弟爱", exampleChar: "白", tones: ["āi", "ái", "ǎi", "ài"] },
  { id: "ym_ei", pinyin: "ei", category: "final", subType: "compound", name: "复韵母 ei", mnemonic: "拿起斧头把柴砍，用力发声 ei ei ei", exampleChar: "北", tones: ["ēi", "éi", "ěi", "èi"] },
  { id: "ym_ui", pinyin: "ui", category: "final", subType: "compound", name: "复韵母 ui", mnemonic: "冬天围巾脖上戴，暖暖和和不怕冷", exampleChar: "水", tones: ["uī", "uí", "uǐ", "uì"] },
  { id: "ym_ao", pinyin: "ao", category: "final", subType: "compound", name: "复韵母 ao", mnemonic: "身穿厚厚小棉袄，冬天玩雪哈哈笑", exampleChar: "草", tones: ["āo", "áo", "ǎo", "ào"] },
  { id: "ym_ou", pinyin: "ou", category: "final", subType: "compound", name: "复韵母 ou", mnemonic: "大红海鸥蓝天翔，池塘深处采莲藕", exampleChar: "头", tones: ["ōu", "óu", "ǒu", "òu"] },
  { id: "ym_iu", pinyin: "iu", category: "final", subType: "compound", name: "复韵母 iu", mnemonic: "邮递员叔叔送信件，清澈小河游小鱼", exampleChar: "九", tones: ["iū", "iú", "iǔ", "iù"] },
  { id: "ym_ie", pinyin: "ie", category: "final", subType: "compound", name: "复韵母 ie", mnemonic: "秋天到了落树叶，金色蝴蝶飞呀飞", exampleChar: "雪", tones: ["iē", "ié", "iě", "iè"] },
  { id: "ym_ve", pinyin: "üe", category: "final", subType: "compound", name: "复韵母 üe", mnemonic: "夜晚弯弯明月升，月饼甜甜庆中秋", exampleChar: "月", tones: ["üē", "üé", "üě", "üè"] },
  { id: "ym_er", pinyin: "er", category: "final", subType: "compound", name: "特殊韵母 er", mnemonic: "两只灵巧小耳朵，听得清楚学得快", exampleChar: "耳", tones: ["ēr", "ér", "ěr", "èr"] },
  // 5 前鼻韵母 + 4 后鼻韵母
  { id: "ym_an", pinyin: "an", category: "final", subType: "nasal", name: "前鼻音 an", mnemonic: "天安门前看红旗，平平安安长大来", exampleChar: "安", tones: ["ān", "án", "ǎn", "àn"] },
  { id: "ym_en", pinyin: "en", category: "final", subType: "nasal", name: "前鼻音 en", mnemonic: "按下门铃叮咚响，文明有礼小客人", exampleChar: "门", tones: ["ēn", "én", "ěn", "èn"] },
  { id: "ym_in", pinyin: "in", category: "final", subType: "nasal", name: "前鼻音 in", mnemonic: "绿树成荫遮太阳，欢快歌声真动听", exampleChar: "心", tones: ["īn", "ín", "ǐn", "ìn"] },
  { id: "ym_un", pinyin: "un", category: "final", subType: "nasal", name: "前鼻音 un", mnemonic: "天边飘来白云朵，小鸟自由穿云端", exampleChar: "云", tones: ["ūn", "ún", "ǔn", "ùn"] },
  { id: "ym_vn", pinyin: "ün", category: "final", subType: "nasal", name: "前鼻音 ün", mnemonic: "白云深处戴圆帽，绿草悠悠牛羊壮", exampleChar: "群", tones: ["ǖn", "ǘn", "ǚn", "ǜn"] },
  { id: "ym_ang", pinyin: "ang", category: "final", subType: "nasal", name: "后鼻音 ang", mnemonic: "昂首挺胸大步迈，早起锻炼身体好", exampleChar: "上", tones: ["āng", "áng", "ǎng", "àng"] },
  { id: "ym_eng", pinyin: "eng", category: "final", subType: "nasal", name: "后鼻音 eng", mnemonic: "台灯照亮小书桌，认真读书学本领", exampleChar: "风", tones: ["ēng", "éng", "ěng", "èng"] },
  { id: "ym_ing", pinyin: "ing", category: "final", subType: "nasal", name: "后鼻音 ing", mnemonic: "老鹰展翅冲云霄，小小水滴亮晶晶", exampleChar: "星", tones: ["īng", "íng", "ǐng", "ìng"] },
  { id: "ym_ong", pinyin: "ong", category: "final", subType: "nasal", name: "后鼻音 ong", mnemonic: "轰隆隆敲响大龙鼓，咚咚锵锵贺丰收", exampleChar: "红", tones: ["ōng", "óng", "ǒng", "òng"] }
];

export const PINYIN_WHOLE_SYLLABLES = [
  { id: "zt_zhi", pinyin: "zhi", category: "whole", name: "整体认读 zhi", mnemonic: "织毛衣，不用拼读直接读", exampleChar: "只" },
  { id: "zt_chi", pinyin: "chi", category: "whole", name: "整体认读 chi", mnemonic: "吃苹果，大口嚼直读 chi", exampleChar: "吃" },
  { id: "zt_shi", pinyin: "shi", category: "whole", name: "整体认读 shi", mnemonic: "红领巾，端正佩戴读 shi", exampleChar: "十" },
  { id: "zt_ri", pinyin: "ri", category: "whole", name: "整体认读 ri", mnemonic: "红太阳，日出东方读 ri", exampleChar: "日" },
  { id: "zt_zi", pinyin: "zi", category: "whole", name: "整体认读 zi", mnemonic: "写汉字，平平舌尖读 zi", exampleChar: "字" },
  { id: "zt_ci", pinyin: "ci", category: "whole", name: "整体认读 ci", mnemonic: "小刺猬，圆圆带刺读 ci", exampleChar: "词" },
  { id: "zt_si", pinyin: "si", category: "whole", name: "整体认读 si", mnemonic: "春蚕吐丝，长长丝线读 si", exampleChar: "四" },
  { id: "zt_yi", pinyin: "yi", category: "whole", name: "整体认读 yi", mnemonic: "大 y 带小 i，整齐合读 yi", exampleChar: "一" },
  { id: "zt_wu", pinyin: "wu", category: "whole", name: "整体认读 wu", mnemonic: "大 w 带小 u，圆润合读 wu", exampleChar: "五" },
  { id: "zt_yu", pinyin: "yu", category: "whole", name: "整体认读 yu", mnemonic: "大 y 带小 ü，脱掉两点仍读 yu", exampleChar: "雨" },
  { id: "zt_ye", pinyin: "ye", category: "whole", name: "整体认读 ye", mnemonic: "金黄秋叶，直接认读 ye", exampleChar: "叶" },
  { id: "zt_yue", pinyin: "yue", category: "whole", name: "整体认读 yue", mnemonic: "弯弯明月，直接认读 yue", exampleChar: "月" },
  { id: "zt_yuan", pinyin: "yuan", category: "whole", name: "整体认读 yuan", mnemonic: "团团圆圆，直接认读 yuan", exampleChar: "元" },
  { id: "zt_yin", pinyin: "yin", category: "whole", name: "整体认读 yin", mnemonic: "绿色树荫，直接认读 yin", exampleChar: "音" },
  { id: "zt_yun", pinyin: "yun", category: "whole", name: "整体认读 yun", mnemonic: "天边云朵，直接认读 yun", exampleChar: "云" },
  { id: "zt_ying", pinyin: "ying", category: "whole", name: "整体认读 ying", mnemonic: "天空中雄鹰，直接认读 ying", exampleChar: "影" }
];

export const PINYIN_COLLISION_PAIRS = [
  { initial: "b", final: "a", tone: 4, syllable: "bà", char: "爸", meaning: "高大慈爱的爸爸", word: "爸爸", image: "assets/images/pinyin_pair_ba.webp" },
  { initial: "m", final: "a", tone: 1, syllable: "mā", char: "妈", meaning: "温柔亲切的妈妈", word: "妈妈", image: "assets/images/pinyin_pair_ma.webp" },
  { initial: "d", final: "a", tone: 4, syllable: "dà", char: "大", meaning: "高大辽阔的大人", word: "大山", image: "assets/images/pinyin_pair_da.webp" },
  { initial: "t", final: "ian", tone: 1, syllable: "tiān", char: "天", meaning: "蓝蓝晴朗的天空", word: "天气", image: "assets/images/pinyin_pair_tian.webp" },
  { initial: "r", final: "i", tone: 4, syllable: "rì", char: "日", meaning: "红红金光的太阳", word: "日出", image: "assets/images/pinyin_pair_ri.webp" },
  { initial: "y", final: "ue", tone: 4, syllable: "yuè", char: "月", meaning: "夜晚皎洁的新月", word: "月亮", image: "assets/images/pinyin_pair_yue.webp" },
  { initial: "sh", final: "ui", tone: 3, syllable: "shuǐ", char: "水", meaning: "清澈流淌的河水", word: "清水", image: "assets/images/pinyin_pair_shui.webp" },
  { initial: "h", final: "uo", tone: 3, syllable: "huǒ", char: "火", meaning: "燃烧温暖的红火", word: "火车", image: "assets/images/pinyin_pair_huo.webp" },
  { initial: "sh", final: "an", tone: 1, syllable: "shān", char: "山", meaning: "高大巍峨的群山", word: "大山", image: "assets/images/pinyin_pair_shan.webp" },
  { initial: "f", final: "eng", tone: 1, syllable: "fēng", char: "风", meaning: "轻柔吹拂的微风", word: "风筝", image: "assets/images/pinyin_pair_feng.webp" }
];

