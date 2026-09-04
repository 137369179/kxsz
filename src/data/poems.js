/**
 * 凯茜识字 (Cathy Literacy) - 幼儿必背启蒙经典古诗词库 (20 首)
 * ------------------------------------------------------------
 * 1. 甄选教育部小学语文新课标推荐启蒙古诗 20 首
 * 2. 包含完整汉字、拼音、逐句卡拉OK分词、通俗儿童赏析
 * 3. 关联 1490 阶梯核心字库与互动趣味理解小问答
 */

export const POEMS_DATABASE = [
  {
    id: "poem_001",
    image: "assets/images/poem_yonge.webp",
    title: "咏鹅",
    dynasty: "唐",
    author: "骆宾王",
    pinyin: "yǒng é",
    themeTag: "可爱动物",
    targetChars: ["鹅", "白", "毛", "绿", "水", "红", "掌"],
    lines: [
      { text: "鹅，鹅，鹅，", pinyin: "é, é, é," },
      { text: "曲项向天歌。", pinyin: "qū xiàng xiàng tiān gē." },
      { text: "白毛浮绿水，", pinyin: "bái máo fú lǜ shuǐ," },
      { text: "红掌拨清波。", pinyin: "hóng zhǎng bō qīng bō." }
    ],
    appreciation: "美丽的白天鹅弯着长长的脖子向天歌唱，洁白的羽毛漂浮在清澈的绿波上，红红的脚掌轻轻拨动着水花，真是一幅美丽生动的画面！",
    quiz: {
      question: "诗中用什么颜色来描写天鹅的羽毛？",
      options: ["洁白 (白毛)", "金黄 (黄毛)", "翠绿 (绿毛)"],
      correctIndex: 0,
      explanation: "“白毛浮绿水”写出了天鹅洁白无瑕的羽毛！"
    }
  },
  {
    id: "poem_002",
    image: "assets/images/poem_jingyesi.webp",
    title: "静夜思",
    dynasty: "唐",
    author: "李白",
    pinyin: "jìng yè sī",
    themeTag: "思乡明月",
    targetChars: ["床", "光", "地", "霜", "头", "望", "乡"],
    lines: [
      { text: "床前明月光，", pinyin: "chuáng qián míng yuè guāng," },
      { text: "疑是地上霜。", pinyin: "yí shì dì shàng shuāng." },
      { text: "举头望明月，", pinyin: "jǔ tóu wàng míng yuè," },
      { text: "低头思故乡。", pinyin: "dī tóu sī gù xiāng." }
    ],
    appreciation: "明亮的月光洒在床前，好像地上铺了一层洁白的秋霜。诗人抬头望着夜空中圆圆的明月，低头思念起远方的故乡和亲人。",
    quiz: {
      question: "诗人把地上的明月光看成什么了？",
      options: ["秋天的白霜", "飘落的雪花", "小水滴"],
      correctIndex: 0,
      explanation: "“疑是地上霜”，诗人觉得皎洁的月光就像地上的白霜一样亮！"
    }
  },
  {
    id: "poem_003",
    image: "assets/images/poem_chunxiao.webp",
    title: "春晓",
    dynasty: "唐",
    author: "孟浩然",
    pinyin: "chūn xiǎo",
    themeTag: "春光明媚",
    targetChars: ["春", "眠", "晓", "闻", "鸟", "雨", "花"],
    lines: [
      { text: "春眠不觉晓，", pinyin: "chūn mián bù jué xiǎo," },
      { text: "处处闻啼鸟。", pinyin: "chù chù wén tí niǎo." },
      { text: "夜来风雨声，", pinyin: "yè lái fēng yǔ shēng," },
      { text: "花落知多少。", pinyin: "huā luò zhī duō shǎo." }
    ],
    appreciation: "春天的早晨睡得真香甜，不知不觉天就已经大亮了，到处都能听到小鸟欢快的歌唱声。想起昨天夜里的阵阵风雨，不知道吹落了多少美丽的花瓣呢。",
    quiz: {
      question: "“处处闻啼鸟”的“闻”是什么意思？",
      options: ["听见", "用鼻子闻", "看见"],
      correctIndex: 0,
      explanation: "在古诗里，“闻”是听见的意思，到处都能听到鸟儿歌唱！"
    }
  },
  {
    id: "poem_004",
    image: "assets/images/poem_minnong.webp",
    title: "悯农",
    dynasty: "唐",
    author: "李绅",
    pinyin: "mǐn nóng",
    themeTag: "爱惜粮食",
    targetChars: ["锄", "禾", "日", "午", "汗", "土", "苦"],
    lines: [
      { text: "锄禾日当午，", pinyin: "chú hé rì dāng wǔ," },
      { text: "汗滴禾下土。", pinyin: "hàn dī hé xià tǔ." },
      { text: "谁知盘中餐，", pinyin: "shéi zhī pán zhōng cān," },
      { text: "粒粒皆辛苦。", pinyin: "lì lì jiē xīn kǔ." }
    ],
    appreciation: "正午烈日当头照，农民伯伯在田里辛苦地锄草松土，汗水一滴滴落进泥土中。有谁知道我们碗里香喷喷的米饭，每一粒都饱含着辛勤的汗水啊！",
    quiz: {
      question: "这首诗告诉我们要养成什么好习惯？",
      options: ["爱惜粮食，不挑食不浪费", "多晒太阳", "多去农田玩"],
      correctIndex: 0,
      explanation: "“粒粒皆辛苦”提醒每一位小朋友珍惜每一粒粮食！"
    }
  },
  {
    id: "poem_005",
    image: "assets/images/poem_dengguanquelou.webp",
    title: "登鹳雀楼",
    dynasty: "唐",
    author: "王之涣",
    pinyin: "dēng guàn què lóu",
    themeTag: "勇攀高峰",
    targetChars: ["白", "日", "山", "黄", "河", "海", "高"],
    lines: [
      { text: "白日依山尽，", pinyin: "bái rì yī shān jìn," },
      { text: "黄河入海流。", pinyin: "huáng hé rù hǎi liú." },
      { text: "欲穷千里目，", pinyin: "yù qióng qiān lǐ mù," },
      { text: "更上一层楼。", pinyin: "gèng shàng yì céng lóu." }
    ],
    appreciation: "夕阳沿着高山缓缓落下，黄河浩浩荡荡奔向大海。要想看到更广阔、更远的美丽景色，就要勇敢地再登上更高一层楼！",
    quiz: {
      question: "要想看千里之外更远的风光，应该怎么做？",
      options: ["更上一层楼 (站得更高)", "戴上眼镜", "闭上眼睛"],
      correctIndex: 0,
      explanation: "“欲穷千里目，更上一层楼”，站得更高才能看得更远！"
    }
  },
  {
    id: "poem_006",
    image: "assets/images/poem_guyuan_cao.webp",
    title: "草",
    dynasty: "唐",
    author: "白居易",
    pinyin: "cǎo",
    themeTag: "顽强生命",
    targetChars: ["离", "原", "草", "岁", "枯", "荣", "春"],
    lines: [
      { text: "离离原上草，", pinyin: "lí lí yuán shàng cǎo," },
      { text: "一岁一枯荣。", pinyin: "yí suì yì kū róng." },
      { text: "野火烧不尽，", pinyin: "yě huǒ shāo bú jìn," },
      { text: "春风吹又生。", pinyin: "chūn fēng chuī yòu shēng." }
    ],
    appreciation: "大草原上的小草茂盛生长，每年秋冬枯黄、春天又重新繁茂。哪怕野火烧光了草叶，只要春风一吹，深深扎在地下的草根又会破土而出，生机盎然！",
    quiz: {
      question: "“野火烧不尽，春风吹又生”赞美了小草的什么品质？",
      options: ["顽强不屈的生命力", "长得很快", "颜色翠绿"],
      correctIndex: 0,
      explanation: "小草深深扎根泥土，具有无比顽强、生生不息的生命力！"
    }
  },
  {
    id: "poem_007",
    image: "assets/images/poem_jiangxue.webp",
    title: "江雪",
    dynasty: "唐",
    author: "柳宗元",
    pinyin: "jiāng xuě",
    themeTag: "冬雪意境",
    targetChars: ["千", "山", "鸟", "绝", "万", "径", "人", "雪"],
    lines: [
      { text: "千山鸟飞绝，", pinyin: "qiān shān niǎo fēi jué," },
      { text: "万径人踪灭。", pinyin: "wàn jìng rén zōng miè." },
      { text: "孤舟蓑笠翁，", pinyin: "gū zhōu suō lì wēng," },
      { text: "独钓寒江雪。", pinyin: "dú diào hán jiāng xuě." }
    ],
    appreciation: "所有的山峦上都没有了鸟儿飞翔的身影，所有的道路上都找不到行人的脚印。江面上一条孤单的小舟上，戴着斗笠披着蓑衣的老渔翁，正在寒风大雪中安静垂钓。",
    quiz: {
      question: "诗中老渔翁在怎样的大自然天气里钓鱼？",
      options: ["冰天雪地的寒江中", "烈日炎炎的夏天", "微风细雨的春天"],
      correctIndex: 0,
      explanation: "“独钓寒江雪”描绘了纯净壮美的冰雪天地！"
    }
  },
  {
    id: "poem_008",
    image: "assets/images/poem_xunyingzhe.webp",
    title: "寻隐者不遇",
    dynasty: "唐",
    author: "贾岛",
    pinyin: "xún yǐn zhě bú yù",
    themeTag: "山水问答",
    targetChars: ["松", "下", "问", "童", "子", "言", "药", "云"],
    lines: [
      { text: "松下问童子，", pinyin: "sōng xià wèn tóng zǐ," },
      { text: "言师采药去。", pinyin: "yán shī cǎi yào qù." },
      { text: "只在此山中，", pinyin: "zhǐ zài cǐ shān zhōng," },
      { text: "云深不知处。", pinyin: "yún shēn bù zhī chù." }
    ],
    appreciation: "在苍翠的松树下询问小书童，书童说师父去大山里采草药了。师父就在这座大山之中，只是山里云雾缭绕，不知道究竟在哪里呢。",
    quiz: {
      question: "师父去大山里做什么了？",
      options: ["采草药", "抓小鸟", "睡觉"],
      correctIndex: 0,
      explanation: "“言师采药去”，小童子回答师父去山中采药啦！"
    }
  },
  {
    id: "poem_009",
    image: "assets/images/poem_xiaochi.webp",
    title: "小池",
    dynasty: "宋",
    author: "杨万里",
    pinyin: "xiǎo chí",
    themeTag: "夏日清荷",
    targetChars: ["泉", "眼", "流", "树", "阴", "晴", "荷", "角"],
    lines: [
      { text: "泉眼无声惜细流，", pinyin: "quán yǎn wú shēng xī xì liú," },
      { text: "树阴照水爱晴柔。", pinyin: "shù yīn zhào shuǐ ài qíng róu." },
      { text: "小荷才露尖尖角，", pinyin: "xiǎo hé cái lù jiān jiān jiǎo," },
      { text: "早有蜻蜓立上头。", pinyin: "zǎo yǒu qīng tíng lì shàng tou." }
    ],
    appreciation: "泉水细细流淌悄无声息，树荫倒映在水面上享受着柔和的阳光。娇嫩的小荷叶才刚刚露出尖尖的花角，早就有一只可爱的红蜻蜓轻盈地立在上面啦！",
    quiz: {
      question: "谁早早立在了尖尖的荷叶角上？",
      options: ["可爱的小蜻蜓", "欢快的小青蛙", "金色的小蝴蝶"],
      correctIndex: 0,
      explanation: "“早有蜻蜓立上头”，小蜻蜓飞来歇在荷尖上！"
    }
  },
  {
    id: "poem_010",
    image: "assets/images/poem_feng.webp",
    title: "风",
    dynasty: "唐",
    author: "李峤",
    pinyin: "fēng",
    themeTag: "神奇大自然",
    targetChars: ["解", "落", "秋", "叶", "开", "花", "浪", "竹"],
    lines: [
      { text: "解落三秋叶，", pinyin: "jiě luò sān qiū yè," },
      { text: "能开二月花。", pinyin: "néng kāi èr yuè huā." },
      { text: "过江千尺浪，", pinyin: "guò jiāng qiān chǐ làng," },
      { text: "入竹万竿斜。", pinyin: "rù zhú wàn gān xié." }
    ],
    appreciation: "风儿吹落深秋的金黄树叶，吹开早春二月的绚烂花朵。掠过江面掀起层层巨浪，吹进竹林让成千上万根竹子随风倾斜摇曳。",
    quiz: {
      question: "这首诗写的神奇大自然景物是什么？",
      options: ["看不见的风", "天上的白云", "落下的雨滴"],
      correctIndex: 0,
      explanation: "整首诗没有提到一个“风”字，却把风的神奇威力描绘得栩栩如生！"
    }
  },
  {
    id: "poem_011",
    image: "assets/images/poem_jiangnan.webp",
    title: "江南",
    dynasty: "汉",
    author: "汉乐府",
    pinyin: "jiāng nán",
    themeTag: "江南采莲",
    targetChars: ["江", "南", "采", "莲", "鱼", "东", "西", "北"],
    lines: [
      { text: "江南可采莲，", pinyin: "jiāng nán kě cǎi lián," },
      { text: "莲叶何田田。", pinyin: "lián yè hé tián tián." },
      { text: "鱼戏莲叶间，", pinyin: "yú xì lián yè jiān," },
      { text: "鱼戏莲叶东，鱼戏莲叶西，", pinyin: "yú xì lián yè dōng, yú xì lián yè xī," },
      { text: "鱼戏莲叶南，鱼戏莲叶北。", pinyin: "yú xì lián yè nán, yú xì lián yè běi." }
    ],
    appreciation: "江南水乡正是采莲的好时节，碧绿的荷叶一片连着一片多么繁茂。欢快的小鱼儿在荷叶间穿梭嬉戏，一会儿游到东，一会儿游到西，自由自在！",
    quiz: {
      question: "小鱼儿在莲叶间做什么？",
      options: ["自由自在嬉戏玩耍", "睡觉休息", "捉迷藏"],
      correctIndex: 0,
      explanation: "“鱼戏莲叶间”，小鱼在水下游动嬉戏真快活！"
    }
  },
  {
    id: "poem_012",
    image: "assets/images/poem_gulangyuexing.webp",
    title: "古朗月行",
    dynasty: "唐",
    author: "李白",
    pinyin: "gǔ lǎng yuè xíng",
    themeTag: "童真明月",
    targetChars: ["小", "时", "月", "盘", "飞", "瑶", "台", "镜"],
    lines: [
      { text: "小时不识月，", pinyin: "xiǎo shí bù shí yuè," },
      { text: "呼作白玉盘。", pinyin: "hū zuò bái yù pán." },
      { text: "又疑瑶台镜，", pinyin: "yòu yí yáo tái jìng," },
      { text: "飞在青云端。", pinyin: "fēi zài qīng yún duān." }
    ],
    appreciation: "小的时候不知道天上的圆月叫月亮，把它叫作洁白的玉石盘子。又怀疑那是仙女梳妆的宝镜，飞到了蓝天青云顶端呢！",
    quiz: {
      question: "诗中小时候把圆月叫作什么？",
      options: ["白玉盘", "大烧饼", "金色太阳"],
      correctIndex: 0,
      explanation: "“呼作白玉盘”，把圆月比作白玉盘充满了童真童趣！"
    }
  },
  {
    id: "poem_013",
    image: "assets/images/poem_jueju.webp",
    title: "绝句",
    dynasty: "唐",
    author: "杜甫",
    pinyin: "jué jù",
    themeTag: "春光明媚",
    targetChars: ["迟", "日", "江", "山", "春", "风", "花", "草"],
    lines: [
      { text: "迟日江山丽，", pinyin: "chí rì jiāng shān lì," },
      { text: "春风花草香。", pinyin: "chūn fēng huā cǎo xiāng." },
      { text: "泥融飞燕子，", pinyin: "ní róng fēi yàn zi," },
      { text: "沙暖睡鸳鸯。", pinyin: "shā nuǎn shuì yuān yāng." }
    ],
    appreciation: "春天的阳光普照大地，江山美丽动人，春风送来阵阵花草的芬芳。泥土变软了，小燕子衔泥忙筑巢；沙滩暖洋洋的，鸳鸯在安静地晒太阳呢。",
    quiz: {
      question: "小燕子在温暖的春天忙着做什么？",
      options: ["衔泥筑巢", "睡大觉", "捉小虫"],
      correctIndex: 0,
      explanation: "“泥融飞燕子”，泥土解冻松软，勤劳的燕子忙着衔泥筑新巢！"
    }
  },
  {
    id: "poem_014",
    image: "assets/images/poem_wanglushan.webp",
    title: "望庐山瀑布",
    dynasty: "唐",
    author: "李白",
    pinyin: "wàng lú shān pù bù",
    themeTag: "雄伟瀑布",
    targetChars: ["日", "香", "炉", "生", "紫", "烟", "飞", "流"],
    lines: [
      { text: "日照香炉生紫烟，", pinyin: "rì zhào xiāng lú shēng zǐ yān," },
      { text: "遥看瀑布挂前川。", pinyin: "yáo kàn pù bù guà qián chuān." },
      { text: "飞流直下三千尺，", pinyin: "fēi liú zhí xià sān qiān chǐ," },
      { text: "疑是银河落九天。", pinyin: "yí shì yín hé luò jiǔ tiān." }
    ],
    appreciation: "阳光照耀香炉峰升起紫色云雾，远远望去瀑布宛如一条白练挂在山前。水流飞腾直泻而下三千尺，让人怀疑是天上的银河从九天高空落下来了！",
    quiz: {
      question: "李白把从天而降的瀑布比作天上的什么？",
      options: ["银河", "彩虹", "白云"],
      correctIndex: 0,
      explanation: "“疑是银河落九天”，奔腾的瀑布壮美如天上银河！"
    }
  },
  {
    id: "poem_015",
    image: "assets/images/poem_meihua.webp",
    title: "梅花",
    dynasty: "宋",
    author: "王安石",
    pinyin: "méi huā",
    themeTag: "坚韧品格",
    targetChars: ["墙", "角", "数", "枝", "梅", "凌", "寒", "雪"],
    lines: [
      { text: "墙角数枝梅，", pinyin: "qiáng jiǎo shù zhī méi," },
      { text: "凌寒独自开。", pinyin: "líng hán dú zì kāi." },
      { text: "遥知不是雪，", pinyin: "yáo zhī bú shì xuě," },
      { text: "为有暗香来。", pinyin: "wèi yǒu àn xiāng lái." }
    ],
    appreciation: "墙角里有几枝梅花，冒着严寒独自傲然盛开。远远看去就知道那不是白雪，因为有一阵阵淡淡的清香随风飘来。",
    quiz: {
      question: "为什么诗人远远看去就知道那不是白雪，而是梅花？",
      options: ["闻到了淡淡的花香", "有人告诉他", "看见了小蜜蜂"],
      correctIndex: 0,
      explanation: "“为有暗香来”，梅花那清雅幽香是白雪所没有的！"
    }
  },
  {
    id: "poem_016",
    image: "assets/images/poem_youziyin.webp",
    title: "游子吟",
    dynasty: "唐",
    author: "孟郊",
    pinyin: "yóu zǐ yín",
    themeTag: "感恩母爱",
    targetChars: ["慈", "母", "手", "中", "线", "游", "子", "春"],
    lines: [
      { text: "慈母手中线，", pinyin: "cí mǔ shǒu zhōng xiàn," },
      { text: "游子身上衣。", pinyin: "yóu zǐ shēn shang yī." },
      { text: "临行密密缝，", pinyin: "lín xíng mì mì féng," },
      { text: "意恐迟迟归。", pinyin: "yì kǒng chí chí guī." },
      { text: "谁言寸草心，", pinyin: "shéi yán cùn cǎo xīn," },
      { text: "报得三春晖。", pinyin: "bào dé sān chūn huī." }
    ],
    appreciation: "慈祥的母亲手里拿着针线，为即将远行的孩子一针一线缝制衣裳。谁说小草一般微小的心意，能报答得了像春天阳光一样温暖伟大的母爱呢！",
    quiz: {
      question: "这首诗表达了对谁的感激与赞美？",
      options: ["伟大温暖的母亲", "好朋友", "小动物"],
      correctIndex: 0,
      explanation: "“谁言寸草心，报得三春晖”歌颂了天底下最伟大的母爱！"
    }
  },
  {
    id: "poem_017",
    image: "assets/images/poem_shanxing.webp",
    title: "山行",
    dynasty: "唐",
    author: "杜牧",
    pinyin: "shān xíng",
    themeTag: "秋日枫红",
    targetChars: ["远", "山", "石", "径", "白", "云", "红", "秋"],
    lines: [
      { text: "远上寒山石径斜，", pinyin: "yuǎn shàng hán shān shí jìng xié," },
      { text: "白云生处有人家。", pinyin: "bái yún shēng chù yǒu rén jiā." },
      { text: "停车坐爱枫林晚，", pinyin: "tíng chē zuò ài fēng lín wǎn," },
      { text: "霜叶红于二月花。", pinyin: "shuāng yè hóng yú èr yuè huā." }
    ],
    appreciation: "一条石头小路曲折蜿蜒通向高山深处，在那白云缭绕的地方有几户人家。停下马车只因喜爱这傍晚的枫树林，那经霜染红的枫叶比二月的鲜花还要红艳！",
    quiz: {
      question: "诗中什么东西比二月的鲜花还要红艳？",
      options: ["经霜染红的枫叶", "红苹果", "红气球"],
      correctIndex: 0,
      explanation: "“霜叶红于二月花”，深秋的枫叶红得热烈灿烂！"
    }
  },
  {
    id: "poem_018",
    image: "assets/images/poem_chishang.webp",
    title: "池上",
    dynasty: "唐",
    author: "白居易",
    pinyin: "chí shàng",
    themeTag: "童真童趣",
    targetChars: ["小", "娃", "艇", "采", "白", "莲", "浮", "萍"],
    lines: [
      { text: "小娃撑小艇，", pinyin: "xiǎo wá chēng xiǎo tǐng," },
      { text: "偷采白莲回。", pinyin: "tōu cǎi bái lián huí." },
      { text: "不解藏踪迹，", pinyin: "bù jiě cáng zōng jì," },
      { text: "浮萍一道开。", pinyin: "fú píng yí dào kāi." }
    ],
    appreciation: "一个可爱的小娃娃划着小船，偷偷采了白莲花划回来。小娃娃还不知道隐藏自己的痕迹，小船在水面上划开了一道绿色的浮萍！",
    quiz: {
      question: "小娃娃的小船在水面上留下了什么痕迹？",
      options: ["浮萍被划开了一条水道", "水底冒泡泡", "岸边有脚印"],
      correctIndex: 0,
      explanation: "“浮萍一道开”，浮萍划开的痕迹暴露了小娃娃行踪，真可爱！"
    }
  },
  {
    id: "poem_019",
    image: "assets/images/poem_yuanri.webp",
    title: "元日",
    dynasty: "宋",
    author: "王安石",
    pinyin: "yuán rì",
    themeTag: "欢度新年",
    targetChars: ["爆", "竹", "声", "岁", "春", "风", "新", "桃"],
    lines: [
      { text: "爆竹声中一岁除，", pinyin: "bào zhú shēng zhōng yí suì chú," },
      { text: "春风送暖入屠苏。", pinyin: "chūn fēng sòng nuǎn rù tú sū." },
      { text: "千门万户曈曈日，", pinyin: "qiān mén wàn hù tóng tóng rì," },
      { text: "总把新桃换旧符。", pinyin: "zǒng bǎ xīn táo huàn jiù fú." }
    ],
    appreciation: "在阵阵欢快的爆竹声中迎来了新的一年，温暖的春风吹拂着千家万户。初升的太阳照耀着家家户户，大家都喜气洋洋地把新的春联换下了旧的桃符！",
    quiz: {
      question: "这首诗描绘的是我们中华哪一个传统盛大节日？",
      options: ["春节 (过年)", "中秋节", "端午节"],
      correctIndex: 0,
      explanation: "“元日”就是正月初一春节，家家户户放鞭炮、贴春联！"
    }
  },
  {
    id: "poem_020",
    image: "assets/images/poem_qingming.webp",
    title: "清明",
    dynasty: "唐",
    author: "杜牧",
    pinyin: "qīng míng",
    themeTag: "传统清明",
    targetChars: ["清", "明", "时", "节", "雨", "路", "酒", "家"],
    lines: [
      { text: "清明时节雨纷纷，", pinyin: "qīng míng shí jié yǔ fēn fēn," },
      { text: "路上行人欲断魂。", pinyin: "lù shang xíng rén yù duàn hún." },
      { text: "借问酒家何处有？", pinyin: "jiè wèn jiǔ jiā hé chù yǒu?" },
      { text: "牧童遥指杏花村。", pinyin: "mù tóng yáo zhǐ xìng huā cūn." }
    ],
    appreciation: "清明时节细雨绵绵飘洒，路上的行人行色匆匆。向当地的小牧童打听哪里有歇脚的小店，骑在牛背上的小牧童远远地指向了美丽的杏花村。",
    quiz: {
      question: "是谁向行人指了指杏花村的方向？",
      options: ["骑在牛背上的小牧童", "路过的老爷爷", "采茶的阿姨"],
      correctIndex: 0,
      explanation: "“牧童遥指杏花村”，机灵可爱的小牧童热情地指路！"
    }
  }
];

export const POEMS = POEMS_DATABASE;
export default POEMS_DATABASE;
