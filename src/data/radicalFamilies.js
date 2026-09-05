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
      },
      {
        radical: "乔",
        radicalName: "乔木高",
        char: "桥",
        pinyin: "qiáo",
        mnemonic: "木+乔 = 桥，木头架起平安桥！",
        word: "木桥",
        effect: "bridge",
        sceneDesc: "横跨溪流的结实木桥"
      },
      {
        radical: "支",
        radicalName: "分支旁",
        char: "枝",
        pinyin: "zhī",
        mnemonic: "木+支 = 枝，绿树枝头鸟儿啼！",
        word: "树枝",
        effect: "branch",
        sceneDesc: "迎风招展的翠绿树枝"
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
  },
  {
    id: "fam_shui",
    name: "水字家族",
    image: "assets/images/cathy_island_forest.webp",
    desc: "三点水儿聚江海，江河湖海浪滔滔",
    rootChar: "水",
    pinyin: "shuǐ",
    story: "‘水’字像流动的水波，变成偏旁‘氵’（三点水）后，组成的字都和江河湖海、水流液体紧密相关！",
    members: [
      {
        radical: "工",
        radicalName: "工字偏旁",
        char: "江",
        pinyin: "jiāng",
        mnemonic: "氵+工 = 江，大江奔腾向大海！",
        word: "长江",
        effect: "river",
        sceneDesc: "滚滚长江奔流不息"
      },
      {
        radical: "可",
        radicalName: "可字偏旁",
        char: "河",
        pinyin: "hé",
        mnemonic: "氵+可 = 河，碧波荡漾小清河！",
        word: "小河",
        effect: "water",
        sceneDesc: "清清流水绕村过"
      },
      {
        radical: "每",
        radicalName: "每字偏旁",
        char: "海",
        pinyin: "hǎi",
        mnemonic: "氵+每 = 海，辽阔无边大海洋！",
        word: "大海",
        effect: "sea",
        sceneDesc: "辽阔深邃的大海浪花翻滚"
      },
      {
        radical: "先",
        radicalName: "先字偏旁",
        char: "洗",
        pinyin: "xǐ",
        mnemonic: "氵+先 = 洗，清水洗手讲卫生！",
        word: "洗手",
        effect: "bubble",
        sceneDesc: "彩色肥皂泡泡飞舞"
      },
      {
        radical: "干",
        radicalName: "干字偏旁",
        char: "汗",
        pinyin: "hàn",
        mnemonic: "氵+干 = 汗，辛勤汗水湿衣衫！",
        word: "汗水",
        effect: "drop",
        sceneDesc: "劳动的小朋友流下勤劳汗水"
      }
    ]
  },
  {
    id: "fam_cao",
    name: "草字家族",
    image: "assets/images/cathy_island_forest.webp",
    desc: "草字头上两小草，花草芬芳绿茸茸",
    rootChar: "草",
    pinyin: "cǎo",
    story: "‘艹’像两棵破土而出的小草芽。凡是带有草字头的字，大多都和花草、植物、芳香有关！",
    members: [
      {
        radical: "化",
        radicalName: "化字偏旁",
        char: "花",
        pinyin: "huā",
        mnemonic: "艹+化 = 花，春暖花开百花香！",
        word: "花朵",
        effect: "flower",
        sceneDesc: "五彩斑斓的花朵盛开"
      },
      {
        radical: "田",
        radicalName: "田字偏旁",
        char: "苗",
        pinyin: "miáo",
        mnemonic: "艹+田 = 苗，田间禾苗绿油油！",
        word: "禾苗",
        effect: "sprout",
        sceneDesc: "农田里迎风茁壮的秧苗"
      },
      {
        radical: "牙",
        radicalName: "牙字偏旁",
        char: "芽",
        pinyin: "yá",
        mnemonic: "艹+牙 = 芽，种子发芽伸懒腰！",
        word: "发芽",
        effect: "leaf",
        sceneDesc: "嫩绿的新芽破土而出"
      },
      {
        radical: "早",
        radicalName: "早字偏旁",
        char: "草",
        pinyin: "cǎo",
        mnemonic: "艹+早 = 草，小草青青连成片！",
        word: "青草",
        effect: "grass",
        sceneDesc: "辽阔翠绿的原野草地"
      },
      {
        radical: "监",
        radicalName: "监字偏旁",
        char: "蓝",
        pinyin: "lán",
        mnemonic: "艹+监 = 蓝，蓝草染色如晴空！",
        word: "蓝色",
        effect: "sky",
        sceneDesc: "蔚蓝无云的晴朗天空"
      }
    ]
  },
  {
    id: "fam_shou",
    name: "手字家族",
    image: "assets/images/cathy_island_life.webp",
    desc: "提手旁儿伸出手，抓拉推打样样通",
    rootChar: "手",
    pinyin: "shǒu",
    story: "‘手’字变身为‘扌’（提手旁），像一只灵巧有力的小手。凡是带有提手旁的字，大多和手的动作有关！",
    members: [
      {
        radical: "丁",
        radicalName: "丁字偏旁",
        char: "打",
        pinyin: "dǎ",
        mnemonic: "扌+丁 = 打，挥起球拍把球打！",
        word: "打球",
        effect: "strike",
        sceneDesc: "活力满满的小伙伴在打球"
      },
      {
        radical: "白",
        radicalName: "白字偏旁",
        char: "拍",
        pinyin: "pāi",
        mnemonic: "扌+白 = 拍，小手拍拍齐欢笑！",
        word: "拍手",
        effect: "clap",
        sceneDesc: "大家欢聚一堂拍手欢笑"
      },
      {
        radical: "是",
        radicalName: "是字偏旁",
        char: "提",
        pinyin: "tí",
        mnemonic: "扌+是 = 提，提桶浇花真勤劳！",
        word: "提水",
        effect: "lift",
        sceneDesc: "勤快的小勇士提起水桶"
      },
      {
        radical: "隹",
        radicalName: "隹字偏旁",
        char: "推",
        pinyin: "tuī",
        mnemonic: "扌+隹 = 推，齐心协力向前推！",
        word: "推车",
        effect: "push",
        sceneDesc: "推着载满丰收果实的小推车"
      },
      {
        radical: "爪",
        radicalName: "爪字偏旁",
        char: "抓",
        pinyin: "zhuā",
        mnemonic: "扌+爪 = 抓，小手抓紧不放松！",
        word: "抓紧",
        effect: "grab",
        sceneDesc: "小猫敏捷伸爪抓住毛线球"
      }
    ]
  },
  {
    id: "fam_kou",
    name: "口字家族",
    image: "assets/images/cathy_island_life.webp",
    desc: "口字方方张大嘴，吃喝唱叫笑哈哈",
    rootChar: "口",
    pinyin: "kǒu",
    story: "‘口’字就像张开的嘴巴，带有口字旁的字，大多和说话、进食、发出声音等动作紧密相连！",
    members: [
      {
        radical: "乞",
        radicalName: "乞字偏旁",
        char: "吃",
        pinyin: "chī",
        mnemonic: "口+乞 = 吃，大口吃果真香甜！",
        word: "吃饭",
        effect: "eat",
        sceneDesc: "津津有味品尝甜美水果"
      },
      {
        radical: "曷",
        radicalName: "曷字偏旁",
        char: "喝",
        pinyin: "hē",
        mnemonic: "口+曷 = 喝，大口喝水解烦渴！",
        word: "喝水",
        effect: "drink",
        sceneDesc: "喝上一杯甘甜的清泉水"
      },
      {
        radical: "昌",
        radicalName: "昌字偏旁",
        char: "唱",
        pinyin: "chàng",
        mnemonic: "口+昌 = 唱，高声歌唱迎朝阳！",
        word: "唱歌",
        effect: "sing",
        sceneDesc: "百鸟啼鸣合奏大自然交响曲"
      },
      {
        radical: "丩",
        radicalName: "丩字偏旁",
        char: "叫",
        pinyin: "jiào",
        mnemonic: "口+丩 = 叫，雄鸡破晓大声叫！",
        word: "大叫",
        effect: "call",
        sceneDesc: "晨光中雄鸡高唱报晓"
      },
      {
        radical: "斤",
        radicalName: "斤字偏旁",
        char: "听",
        pinyin: "tīng",
        mnemonic: "口+斤 = 听，侧耳细听林涛声！",
        word: "听讲",
        effect: "listen",
        sceneDesc: "静心聆听大自然的美妙天籁"
      }
    ]
  },
  {
    id: "fam_huo",
    name: "火字家族",
    image: "assets/images/cathy_island_guofeng.webp",
    desc: "火光熊熊热气腾，点火烧烤照通明",
    rootChar: "火",
    pinyin: "huǒ",
    story: "‘火’是跳动的火苗，变成偏旁‘火’或‘灬’（四点底）后，都和热量、燃烧、烹饪有关！",
    members: [
      {
        radical: "尧",
        radicalName: "尧字偏旁",
        char: "烧",
        pinyin: "shāo",
        mnemonic: "火+尧 = 烧，篝火燃烧暖融融！",
        word: "燃烧",
        effect: "flame",
        sceneDesc: "温暖明亮的篝火在夜晚跳跃"
      },
      {
        radical: "执",
        radicalName: "执字偏旁",
        char: "热",
        pinyin: "rè",
        mnemonic: "执+灬 = 热，盛夏炎炎真温热！",
        word: "炎热",
        effect: "heat",
        sceneDesc: "夏日金光灿灿热力四射"
      },
      {
        radical: "占",
        radicalName: "占字偏旁",
        char: "点",
        pinyin: "diǎn",
        mnemonic: "占+灬 = 点，点亮明灯照四方！",
        word: "点灯",
        effect: "spark",
        sceneDesc: "一盏明灯照亮静谧夜晚"
      },
      {
        radical: "少",
        radicalName: "少字偏旁",
        char: "炒",
        pinyin: "chǎo",
        mnemonic: "火+少 = 炒，大勺快炒蔬菜香！",
        word: "炒菜",
        effect: "cook",
        sceneDesc: "厨房飘出阵阵诱人饭菜香"
      },
      {
        radical: "丁",
        radicalName: "丁字偏旁",
        char: "灯",
        pinyin: "dēng",
        mnemonic: "火+丁 = 灯，万家灯火闪星光！",
        word: "台灯",
        effect: "light",
        sceneDesc: "温馨的书桌台灯洒下柔光"
      }
    ]
  },
  {
    id: "fam_xin",
    name: "心字家族",
    image: "assets/images/cathy_island_guofeng.webp",
    desc: "一颗真心跳得欢，喜怒哀乐在心间",
    rootChar: "心",
    pinyin: "xīn",
    story: "‘心’代表我们跳动的心脏与丰富情感，化作‘忄’（竖心旁）或心字底，都和心情、思考、情绪有关！",
    members: [
      {
        radical: "夬",
        radicalName: "夬字偏旁",
        char: "快",
        pinyin: "kuài",
        mnemonic: "忄+夬 = 快，身手敏捷跑得快！",
        word: "快乐",
        effect: "fast",
        sceneDesc: "快乐奔跑的小小少年"
      },
      {
        radical: "曼",
        radicalName: "曼字偏旁",
        char: "慢",
        pinyin: "màn",
        mnemonic: "忄+曼 = 慢，遇事沉着慢慢来！",
        word: "慢步",
        effect: "slow",
        sceneDesc: "悠然漫步在宁静林间道"
      },
      {
        radical: "亡",
        radicalName: "亡字偏旁",
        char: "忙",
        pinyin: "máng",
        mnemonic: "忄+亡 = 忙，勤劳忙碌丰收年！",
        word: "忙碌",
        effect: "busy",
        sceneDesc: "勤劳小蜜蜂在花间采蜜忙"
      },
      {
        radical: "相",
        radicalName: "相字偏旁",
        char: "想",
        pinyin: "xiǎng",
        mnemonic: "相+心 = 想，开动脑筋想妙计！",
        word: "思考",
        effect: "think",
        sceneDesc: "智慧小火花在脑海闪烁"
      },
      {
        radical: "田",
        radicalName: "田字偏旁",
        char: "思",
        pinyin: "sī",
        mnemonic: "田+心 = 思，静心思索学问深！",
        word: "深思",
        effect: "ponder",
        sceneDesc: "沉浸在知识海洋的小学者"
      }
    ]
  },
  {
    id: "fam_yan",
    name: "言字家族",
    image: "assets/images/cathy_island_guofeng.webp",
    desc: "言字偏旁吐真言，说话读讲有礼貌",
    rootChar: "言",
    pinyin: "yán",
    story: "‘言’代表说话与语言。化为‘讠’（言字旁）后，所有的字都和说话、阅读、计谋、语言交流有关！",
    members: [
      {
        radical: "兑",
        radicalName: "兑字偏旁",
        char: "说",
        pinyin: "shuō",
        mnemonic: "讠+兑 = 说，言之有理把话说！",
        word: "说话",
        effect: "talk",
        sceneDesc: "绘声绘色地讲故事"
      },
      {
        radical: "舌",
        radicalName: "舌字偏旁",
        char: "话",
        pinyin: "huà",
        mnemonic: "讠+舌 = 话，真心真意说真话！",
        word: "话语",
        effect: "chat",
        sceneDesc: "伙伴之间亲切谈心交流"
      },
      {
        radical: "卖",
        radicalName: "卖字偏旁",
        char: "读",
        pinyin: "dú",
        mnemonic: "讠+卖 = 读，晨光熹微朗声读！",
        word: "读书",
        effect: "read",
        sceneDesc: "朗朗书声回荡在学堂"
      },
      {
        radical: "井",
        radicalName: "井字偏旁",
        char: "讲",
        pinyin: "jiǎng",
        mnemonic: "讠+井 = 讲，精彩故事娓娓讲！",
        word: "讲述",
        effect: "tell",
        sceneDesc: "小老师在黑板前生动讲解"
      },
      {
        radical: "人",
        radicalName: "人字偏旁",
        char: "认",
        pinyin: "rèn",
        mnemonic: "讠+人 = 认，认真识字顶呱呱！",
        word: "认识",
        effect: "know",
        sceneDesc: "小勇士自信认出新的汉字"
      }
    ]
  }
];
