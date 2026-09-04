/**
 * 按需模块加载器：首屏只加载 MapModule，其余模块进入对应模式时才动态 import。
 * 键为模块 key（非 mode 名），由 MODE_TO_MODULE 做 mode → key 映射。
 */
export const MODULE_LOADERS = {
  books: () => import("../../components/BookModule.js").then((m) => m.BookModule),
  play: () => import("../../components/PlayModule.js").then((m) => m.PlayModule),
  cards: () => import("../../components/CardModule.js").then((m) => m.CardModule),
  parent: () => import("../../components/ParentModule.js").then((m) => m.ParentModule),
  reward: () => import("../../components/RewardModule.js").then((m) => m.RewardModule),
  review: () => import("../../components/ReviewModule.js").then((m) => m.ReviewModule),
  pk: () => import("../../components/PKModule.js").then((m) => m.PKModule),
  pinyin: () => import("../../components/PinyinModule.js").then((m) => m.PinyinModule),
  treehouse: () => import("../../components/TreehouseModule.js").then((m) => m.TreehouseModule),
  learn: () => import("../../components/LearnModule.js").then((m) => m.LearnModule),
};

/** mode 名 → 模块 key */
export const MODE_TO_MODULE = {
  map: "map",
  books: "books",
  book: "books",
  play: "play",
  arcade: "play",
  idiom: "play",
  poem: "play",
  family: "play",
  cards: "cards",
  card: "cards",
  parent: "parent",
  reward: "reward",
  rewards: "reward",
  review: "review",
  pk: "pk",
  pinyin: "pinyin",
  treehouse: "treehouse",
};
