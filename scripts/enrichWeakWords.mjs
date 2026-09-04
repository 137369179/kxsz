#!/usr/bin/env node
/**
 * Enrich weak characterDetails.words (and placeholder primary meanings).
 * Usage: node scripts/enrichWeakWords.mjs
 * Safe: only fills when words.length < 2 or primary === "意思猜得到！"
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CHARACTER_DATABASE } from "../src/data/characters.js";
import { CHARACTER_DETAILS } from "../src/data/characterDetails.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DETAILS_PATH = path.join(__dirname, "../src/data/characterDetails.js");

/** High-frequency compounds (char may appear in any position) */
const COMMON_WORDS = `
黑板 木板 地板 石板 板书 老板 主板 甲板
板凳 长凳 方凳 凳子
房屋 屋子 屋顶 茅屋 屋檐 里屋
山顶 头顶 屋顶 顶点 顶楼 顶风 封顶 透顶
砖头 砖块 砖墙 砖瓦 瓷砖 砖窑
桥梁 大梁 房梁 鼻梁 栋梁 梁柱
柱子 石柱 水柱 灯柱 支柱 圆柱
舞台 阳台 窗台 电台 台阶 柜台 平台 台风
窗帘 门帘 竹帘 帘子 垂帘
门槛 栏杆 栅栏 围栏 木栏
窗户 窗口 窗台 车窗 纱窗 天窗
门廊 走廊 画廊 长廊 廊桥
客厅 卧室 厨房 书房 教室 操场 花园 公园
马路 公路 铁路 道路 小路 山路 水路 出路
汽车 火车 马车 卡车 轿车 单车 停车 开车
飞机 机场 航班 航空 飞鸟 起飞 飞船
轮船 帆船 小船 游船 船舶 开船
书包 背包 书包带 红包 腰包 邮包
铅笔 钢笔 毛笔 粉笔 笔袋 笔记 笔顺 笔尖
橡皮 尺子 课本 作业 考试 成绩 老师 同学
春天 夏天 秋天 冬天 早晨 中午 晚上 昨天 今天 明天
太阳 月亮 星星 云彩 雨水 雪花 大风 雷电
爸爸 妈妈 爷爷 奶奶 哥哥 姐姐 弟弟 妹妹 叔叔 阿姨
吃饭 喝水 睡觉 起床 刷牙 洗手 走路 跑步 游泳 唱歌
读书 写字 画画 弹琴 跳舞 游戏 玩具 气球
红色 黄色 蓝色 绿色 白色 黑色 彩色 颜色
大小 多少 高低 长短 快慢 远近 前后 左右
开心 高兴 快乐 伤心 害怕 勇敢 聪明 努力
动物 植物 水果 蔬菜 米饭 面条 鸡蛋 牛奶 面包 饼干
老虎 狮子 大象 猴子 兔子 小鸟 蝴蝶 蜜蜂 蚂蚁 小狗
苹果 香蕉 西瓜 葡萄 桃子 草莓 梨子 橘子
花朵 树木 叶子 草地 森林 河流 大海 高山 石头 沙子
衣服 鞋子 帽子 袜子 裤子 裙子 手套 围巾
眼睛 耳朵 鼻子 嘴巴 头发 手心 脚步 身体
时间 时钟 分钟 小时 日子 星期 月份 年份
数字 一二 三四五 学习 知识 文化 科学 历史
国家 城市 乡村 首都 北京 上海 长江 黄河
朋友 客人 邻居 医生 警察 工人 农民 军人
电话 电视 电脑 手机 网络 邮件 音乐
问题 答案 道理 故事 诗歌 图画 照片 电影
开始 结束 成功 失败 进步 努力 坚持 梦想
帮助 关心 感谢 对不起 没关系 请 谢谢 再见
上面 下面 里面 外面 前面 后面 中间 旁边
已经 正在 将要 刚才 马上 突然 慢慢 仔细
因为 所以 但是 如果 虽然 然后 而且 或者
可以 应该 必须 不要 不能 没有 还有 一起
非常 特别 十分 有点 比较 更加 最 很
看见 听见 想到 知道 明白 记得 忘记 认识
拿出 放进 打开 关上 拿起 放下 走进 走出
坐着 站着 躺着 跑着 笑着 哭着 看着 听着
第一 第二 一次 许多 全部 部分 其他 自己
东西 事情 地方 时候 办法 机会 希望 快乐童年
`.trim().split(/\s+/).filter(Boolean);

const RADICAL_HINT_MEANING = {
  木: "和树木、木材有关",
  氵: "和水、液体有关",
  艹: "和花草植物有关",
  亻: "和人的动作、身份有关",
  口: "和嘴巴、声音有关",
  日: "和太阳、时间有关",
  月: "和月亮或身体有关",
  扌: "和手部动作有关",
  纟: "和丝线、织物有关",
  辶: "和行走、移动有关",
  火: "和火、热有关",
  土: "和土地、建筑有关",
  钅: "和金属有关",
  石: "和石头、坚硬有关",
  虫: "和昆虫、小动物有关",
  鸟: "和飞禽有关",
  疒: "和疾病、身体不适有关",
  忄: "和心情、思考有关",
  讠: "和说话、语言有关",
  饣: "和食物有关",
};

function tonePinyin(py) {
  return (py || "").trim() || "zi";
}

function buildWordsForChar(char, pinyin) {
  const py = tonePinyin(pinyin);
  const hits = COMMON_WORDS.filter((w) => w.includes(char) && w.length >= 2 && w.length <= 4);
  const uniq = [...new Set(hits)];
  const words = uniq.slice(0, 3).map((word) => ({
    word,
    pinyin: word === char ? py : `${py} …`,
    desc: `含「${char}」的常用词语`
  }));

  if (words.length < 2) {
    const extras = [
      { word: `${char}子`, pinyin: `${py} zi`, desc: `口语里常说的「${char}子」` },
      { word: `${char}头`, pinyin: `${py} tou`, desc: `带「头」的常用说法` },
      { word: `大${char}`, pinyin: `dà ${py}`, desc: `形容大的「${char}」` },
      { word: `小${char}`, pinyin: `xiǎo ${py}`, desc: `形容小的「${char}」` },
    ];
    for (const e of extras) {
      if (words.length >= 2) break;
      if (!words.some((w) => w.word === e.word) && e.word.length >= 2) words.push(e);
    }
  }

  // Prefer real compounds over synthetic 子/头 when available
  const real = words.filter((w) => COMMON_WORDS.includes(w.word));
  if (real.length >= 2) return real.slice(0, 3);
  return words.slice(0, 3);
}

function improvePrimary(char, detail) {
  const primary = detail.meanings?.primary;
  if (primary && primary !== "意思猜得到！") return primary;
  const radical = CHARACTER_DATABASE.find((c) => c.id === detail._id)?.radical
    || CHARACTER_DATABASE.find((c) => c.char === char)?.radical;
  const hint = RADICAL_HINT_MEANING[radical];
  if (hint) return `「${char}」${hint}`;
  return `认识汉字「${char}」，多读多写就能记住`;
}

let filledWords = 0;
let filledPrimary = 0;

for (const c of CHARACTER_DATABASE) {
  const d = CHARACTER_DETAILS[c.id];
  if (!d) continue;
  const words = Array.isArray(d.words) ? d.words : [];
  const weak = words.length < 2 || words.every((w) => !w.desc || w.word === c.char);
  if (weak) {
    d.words = buildWordsForChar(c.char, c.pinyin);
    filledWords++;
  }
  if (!d.meanings) d.meanings = {};
  if (!d.meanings.primary || d.meanings.primary === "意思猜得到！") {
    d.meanings.primary = improvePrimary(c.char, { ...d, _id: c.id });
    if (!d.meanings.extended) d.meanings.extended = `常见词语：${(d.words || []).map((w) => w.word).join("、")}`;
    if (!d.meanings.radicalHint && c.radical) {
      d.meanings.radicalHint = RADICAL_HINT_MEANING[c.radical]
        ? `${c.radical}，${RADICAL_HINT_MEANING[c.radical]}`
        : `部首「${c.radical}」`;
    }
    filledPrimary++;
  }
}

const header = `/**
 * 凯茜识字 (Cathy Literacy) - 阶梯字库【详情层】（懒加载）
 * ------------------------------------------------------------------
 * 含字源演变、组词造句、笔顺要点、形近字等重字段。
 * 由 scripts/enrichWeakWords.mjs 可增量补强弱组词（勿手改巨型单行 JSON）。
 */
`;

const out = `${header}export const CHARACTER_DETAILS = ${JSON.stringify(CHARACTER_DETAILS)};\n`;
fs.writeFileSync(DETAILS_PATH, out);

console.log(JSON.stringify({
  filledWords,
  filledPrimary,
  bytes: out.length,
  path: DETAILS_PATH
}, null, 2));
