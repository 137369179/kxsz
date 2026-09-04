/**
 * 凯茜识字 (Cathy Literacy) - 汉字魔法积木字族数据库
 * ---------------------------------------------------------------
 * 依据国家语委《字族文识字法》及部编版小学语文核心形近字设计。
 * 遵循严格规范：绝对零 Unicode Emoji，零 SVG。
 */

export const RADICAL_FAMILIES = [
  {
    id: "fam_qing",
    name: "青字家族",
    image: "assets/images/family_qing.webp",
    desc: "青字添偏旁，清晴睛情请",
    rootChar: "青",
    pinyin: "qīng",
    story: "‘青’本义代表初生植物的翠绿颜色，加上不同的偏旁，就会产生丰富多彩的奇妙变化！",
    members: [
      {
        radical: "氵",
        radicalName: "三点水",
        char: "清",
        pinyin: "qīng",
        mnemonic: "氵+青 = 清，清水清澈见底！",
        word: "清澈",
        effect: "water",
        sceneDesc: "清清的泉水哗啦啦流动"
      },
      {
        radical: "日",
        radicalName: "日字旁",
        char: "晴",
        pinyin: "qíng",
        mnemonic: "日+青 = 晴，晴空万里出太阳！",
        word: "晴天",
        effect: "sun",
        sceneDesc: "红红的太阳照耀大地"
      },
      {
        radical: "目",
        radicalName: "目字旁",
        char: "睛",
        pinyin: "jīng",
        mnemonic: "目+青 = 睛，炯炯有神大眼睛！",
        word: "眼睛",
        effect: "eye",
        sceneDesc: "亮晶晶的眼睛看世界"
      },
      {
        radical: "忄",
        radicalName: "竖心旁",
        char: "情",
        pinyin: "qíng",
        mnemonic: "忄+青 = 情，心中充满好心情！",
        word: "心情",
        effect: "heart",
        sceneDesc: "温暖快乐的爱心在跳动"
      },
      {
        radical: "讠",
        radicalName: "言字旁",
        char: "请",
        pinyin: "qǐng",
        mnemonic: "讠+青 = 请，礼貌说话客人请！",
        word: "请进",
        effect: "bow",
        sceneDesc: "文明懂礼貌的小勇士"
      },
      {
        radical: "虫",
        radicalName: "虫字旁",
        char: "蜻",
        pinyin: "qīng",
        mnemonic: "虫+青 = 蜻，蜻蜓展翅立枝头！",
        word: "蜻蜓",
        effect: "dragonfly",
        sceneDesc: "彩色小蜻蜓在水面点水"
      }
    ]
  },
  {
    id: "fam_mu",
    name: "木字家族",
    image: "assets/images/family_mu.webp",
    desc: "独木不成林，三木变成森",
    rootChar: "木",
    pinyin: "mù",
    story: "一棵树是木，两棵树是林，三棵树聚在一起就是绿树成荫的大森林！",
    members: [
      {
        radical: "木",
        radicalName: "木字",
        char: "林",
        pinyin: "lín",
        mnemonic: "木+木 = 林，郁郁葱葱小树林！",
        word: "树林",
        effect: "tree",
        sceneDesc: "两棵树木迎风茁壮生长"
      },
      {
        radical: "林",
        radicalName: "双木林",
        char: "森",
        pinyin: "sēn",
        mnemonic: "木+林 = 森，辽阔深邃大森林！",
        word: "森林",
        effect: "forest",
        sceneDesc: "一片生机勃勃的原始森林"
      },
      {
        radical: "亻",
        radicalName: "单人旁",
        char: "休",
        pinyin: "xiū",
        mnemonic: "亻+木 = 休，靠在树边歇一歇！",
        word: "休息",
        effect: "rest",
        sceneDesc: "小勇士靠着大树舒服地休息"
      },
      {
        radical: "口",
        radicalName: "口字框",
        char: "困",
        pinyin: "kùn",
        mnemonic: "口+木 = 困，四周有框被围住！",
        word: "困境",
        effect: "box",
        sceneDesc: "树木四周建起一道保护围栏"
      }
    ]
  },
  {
    id: "fam_ye",
    name: "也字家族",
    image: "assets/images/family_ye.webp",
    desc: "他也她池地，也字朋友多",
    rootChar: "也",
    pinyin: "yě",
    story: "‘也’字像一条活泼的小蛇，给它不同的偏旁伙伴，它就能变成各种各样的人和事物！",
    members: [
      {
        radical: "亻",
        radicalName: "单人旁",
        char: "他",
        pinyin: "tā",
        mnemonic: "亻+也 = 他，勇敢坚强小男孩！",
        word: "他们",
        effect: "boy",
        sceneDesc: "正在奔跑的小男孩"
      },
      {
        radical: "女",
        radicalName: "女字旁",
        char: "她",
        pinyin: "tā",
        mnemonic: "女+也 = 她，温柔美丽小女孩！",
        word: "她们",
        effect: "girl",
        sceneDesc: "正在欢笑跳舞的小女孩"
      },
      {
        radical: "氵",
        radicalName: "三点水",
        char: "池",
        pinyin: "chí",
        mnemonic: "氵+也 = 池，碧波荡漾小池塘！",
        word: "池塘",
        effect: "pond",
        sceneDesc: "荷叶飘飘的小池塘"
      },
      {
        radical: "土",
        radicalName: "提土旁",
        char: "地",
        pinyin: "dì",
        mnemonic: "土+也 = 地，脚踏沃土广阔地！",
        word: "大地",
        effect: "earth",
        sceneDesc: "生机勃勃的肥沃土地"
      }
    ]
  },
  {
    id: "fam_bao",
    name: "包字家族",
    image: "assets/images/family_bao.webp",
    desc: "包裹大肚腩，跑炮泡饱拥",
    rootChar: "包",
    pinyin: "bāo",
    story: "‘包’字像一个小书包或大口袋，不同本领的偏旁装进包里，变出各种神气汉字！",
    members: [
      {
        radical: "足",
        radicalName: "足字旁",
        char: "跑",
        pinyin: "pǎo",
        mnemonic: "足+包 = 跑，双脚飞奔快快跑！",
        word: "跑步",
        effect: "run",
        sceneDesc: "小勇士在跑道上冲刺"
      },
      {
        radical: "火",
        radicalName: "火字旁",
        char: "炮",
        pinyin: "pào",
        mnemonic: "火+包 = 炮，轰鸣火光响礼炮！",
        word: "鞭炮",
        effect: "firework",
        sceneDesc: "五彩斑斓的节日礼炮"
      },
      {
        radical: "氵",
        radicalName: "三点水",
        char: "泡",
        pinyin: "pào",
        mnemonic: "氵+包 = 泡，晶莹剔透吹泡泡！",
        word: "水泡",
        effect: "bubble",
        sceneDesc: "彩虹般的梦幻水泡泡"
      },
      {
        radical: "饣",
        radicalName: "食字旁",
        char: "饱",
        pinyin: "bǎo",
        mnemonic: "饣+包 = 饱，大口吃粮肚子饱！",
        word: "吃饱",
        effect: "full",
        sceneDesc: "吃得饱饱的开心笑脸"
      }
    ]
  },
  {
    id: "fam_ri",
    name: "日字家族",
    image: "assets/images/family_ri.webp",
    desc: "太阳金光闪，早明旦晶升",
    rootChar: "日",
    pinyin: "rì",
    story: "‘日’是天上的太阳，代表光明、温暖和时间，组合起来的字都闪闪发光！",
    members: [
      {
        radical: "月",
        radicalName: "月字",
        char: "明",
        pinyin: "míng",
        mnemonic: "日+月 = 明，日月同辉分外明！",
        word: "明亮",
        effect: "bright",
        sceneDesc: "日月同辉的大晴天"
      },
      {
        radical: "一",
        radicalName: "一横",
        char: "旦",
        pinyin: "dàn",
        mnemonic: "日+一 = 旦，红日升出地平线！",
        word: "元旦",
        effect: "sunrise",
        sceneDesc: "太阳破晓升上地平线"
      },
      {
        radical: "十",
        radicalName: "十字底",
        char: "早",
        pinyin: "zǎo",
        mnemonic: "日+十 = 早，清晨破晓起得早！",
        word: "早晨",
        effect: "morning",
        sceneDesc: "清晨的第一缕晨曦"
      },
      {
        radical: "双日",
        radicalName: "日字叠",
        char: "晶",
        pinyin: "jīng",
        mnemonic: "三日并排 = 晶，闪闪发光亮晶晶！",
        word: "水晶",
        effect: "crystal",
        sceneDesc: "闪烁着璀璨光芒的宝石"
      }
    ]
  }
];
