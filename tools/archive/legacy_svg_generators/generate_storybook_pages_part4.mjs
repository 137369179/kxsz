import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_storybook_p4";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function wrapSvg(content, customDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1376 768" width="1376" height="768">
  <defs>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="6" stdDeviation="6" flood-opacity="0.2"/>
    </filter>
    ${customDefs}
  </defs>
  ${content}
</svg>`;
}

const STORIES_PART4 = [
  // ==========================================
  // 1. story_forest_market_p1: 金色的水田里，禾苗长得又高又壮
  // ==========================================
  {
    id: "story_forest_market_p1",
    title: "神秘的森林集市 - 第1页",
    defs: `
      <linearGradient id="paddy_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="golden_field" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Golden Paddy Fields at Harvest (金浪滚滚稻花香，万亩水田禾苗壮) -->
      <rect width="1376" height="768" fill="url(#paddy_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Hills & Traditional Thatched Cottages (远山如黛，田园村舍) -->
      <path d="M0,420 Q400,320 800,400 T1376,360 L1376,768 L0,768 Z" fill="#86efac" opacity="0.6"/>

      <!-- Vast Golden Terraced Paddy Fields (层层金浪水田) -->
      <path d="M0,480 Q688,430 1376,480 L1376,768 L0,768 Z" fill="url(#golden_field)" filter="url(#dropShadow)"/>
      <path d="M0,560 Q688,510 1376,560 L1376,768 L0,768 Z" fill="#eab308"/>
      <path d="M0,640 Q688,600 1376,640 L1376,768 L0,768 Z" fill="#ca8a04"/>

      <!-- Tall Golden Rice Plants Swaying in Breeze (沉甸甸又高又壮的金黄稻穗) -->
      <g stroke="#78350f" stroke-width="4" stroke-linecap="round" fill="none">
        <!-- Cluster 1 -->
        <path d="M240,620 Q280,500 250,440"/>
        <path d="M260,620 Q310,510 290,450"/>
        <!-- Rice Heads (金黄谷穗) -->
        <ellipse cx="250" cy="440" rx="14" ry="24" fill="#facc15" stroke="#a16207" stroke-width="2" transform="rotate(-20, 250, 440)"/>
        <ellipse cx="290" cy="450" rx="14" ry="24" fill="#facc15" stroke="#a16207" stroke-width="2" transform="rotate(20, 290, 450)"/>

        <!-- Cluster 2 Center -->
        <path d="M688,640 Q660,520 630,460"/>
        <path d="M710,640 Q740,530 770,470"/>
        <ellipse cx="630" cy="460" rx="15" ry="26" fill="#facc15" stroke="#a16207" stroke-width="2" transform="rotate(-25, 630, 460)"/>
        <ellipse cx="770" cy="470" rx="15" ry="26" fill="#facc15" stroke="#a16207" stroke-width="2" transform="rotate(25, 770, 470)"/>

        <!-- Cluster 3 Right -->
        <path d="M1080,630 Q1120,510 1100,450"/>
        <ellipse cx="1100" cy="450" rx="15" ry="26" fill="#facc15" stroke="#a16207" stroke-width="2"/>
      </g>

      <!-- Happy Chinese Farmer Child in Straw Hat (戴竹笠笑逐颜开的中国农家娃) -->
      <g transform="translate(440, 360)" filter="url(#dropShadow)">
        <path d="M40,160 L140,160 L155,360 L25,360 Z" fill="#0284c7"/>
        <circle cx="90" cy="95" r="42" fill="#fed7aa"/>
        <!-- Traditional Conical Bamboo Hat (金黄竹笠) -->
        <polygon points="10,80 90,20 170,80" fill="#facc15" stroke="#a16207" stroke-width="3"/>
        <circle cx="78" cy="95" r="5" fill="#0f172a"/>
        <circle cx="102" cy="95" r="5" fill="#0f172a"/>
        <path d="M84,112 Q90,122 96,112" stroke="#ef4444" stroke-width="3" fill="none"/>
        <circle cx="72" cy="106" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="108" cy="106" r="8" fill="#fca5a5" opacity="0.6"/>
        <!-- Paws Holding Golden Sheaf of Rice (双手抱着金黄稻穗) -->
        <ellipse cx="90" cy="190" rx="28" ry="45" fill="#facc15" stroke="#78350f" stroke-width="2"/>
      </g>

      <!-- Red Chinese Seal (丰 - 岁稔年丰) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 三横一竖 -->
          <line x1="16" y1="18" x2="38" y2="18"/>
          <line x1="18" y1="26" x2="36" y2="26"/>
          <line x1="14" y1="34" x2="40" y2="34"/>
          <line x1="27" y1="12" x2="27" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. story_forest_market_p2: 集市人来人往，开口大笑尝美食
  // ==========================================
  {
    id: "story_forest_market_p2",
    title: "神秘的森林集市 - 第2页",
    defs: `
      <linearGradient id="market_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="60%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#ffedd5"/>
      </linearGradient>
    `,
    content: `
      <!-- Bustling Traditional Chinese Market Alley (热闹非凡古街市集，红灯高挂尝美食) -->
      <rect width="1376" height="768" fill="url(#market_sky)"/>

      <!-- Ancient Buildings & Flying Eaves with Red Lanterns (飞檐黛瓦与大红灯笼) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="240" width="1376" height="528" fill="#e2e8f0"/>
        <path d="M0,240 L1376,240 L1376,270 L0,270 Z" fill="#64748b"/>
        <path d="M40,240 L1336,240 L1376,200 L0,200 Z" fill="#334155"/>
        <!-- Red Lanterns Hanging Across -->
        <g transform="translate(240, 160)">
          <ellipse cx="30" cy="50" rx="24" ry="28" fill="#dc2626"/>
          <line x1="30" y1="20" x2="30" y2="80" stroke="#facc15" stroke-width="2"/>
        </g>
        <g transform="translate(688, 140)">
          <ellipse cx="30" cy="50" rx="28" ry="32" fill="#dc2626"/>
          <line x1="30" y1="15" x2="30" y2="85" stroke="#facc15" stroke-width="2"/>
        </g>
        <g transform="translate(1080, 160)">
          <ellipse cx="30" cy="50" rx="24" ry="28" fill="#dc2626"/>
          <line x1="30" y1="20" x2="30" y2="80" stroke="#facc15" stroke-width="2"/>
        </g>
      </g>

      <!-- Traditional Market Food Stall with Steamer Baskets (香气腾腾的中式点心摊) -->
      <g transform="translate(480, 420)" filter="url(#dropShadow)">
        <rect x="0" y="80" width="416" height="180" rx="6" fill="#78350f"/>
        <rect x="10" y="70" width="396" height="30" rx="4" fill="#92400e"/>
        <!-- Bamboo Steamers (小巧竹蒸笼) -->
        <g transform="translate(60, 0)">
          <rect x="0" y="30" width="80" height="40" rx="6" fill="#fde047" stroke="#b45309" stroke-width="3"/>
          <rect x="0" y="0" width="80" height="35" rx="6" fill="#fde047" stroke="#b45309" stroke-width="3"/>
          <!-- Rising steam (白茫茫热气) -->
          <path d="M20,-5 Q15,-25 25,-40 M40,-5 Q45,-25 35,-40 M60,-5 Q55,-25 65,-40" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8"/>
        </g>
        <!-- Plate of Sweet Chinese Mooncakes / Pastries (一盘诱人桂花糕点) -->
        <g transform="translate(220, 25)">
          <ellipse cx="60" cy="40" rx="55" ry="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <circle cx="40" cy="35" r="14" fill="#f59e0b"/>
          <circle cx="65" cy="30" r="14" fill="#f59e0b"/>
          <circle cx="80" cy="35" r="14" fill="#f59e0b"/>
        </g>
      </g>

      <!-- Happy Children Tasting Pastries Laughing Aloud (品尝美食开口大笑的萌娃) -->
      <g transform="translate(260, 360)" filter="url(#dropShadow)">
        <path d="M40,160 L140,160 L155,360 L25,360 Z" fill="#ec4899"/>
        <circle cx="90" cy="95" r="42" fill="#fed7aa"/>
        <!-- Double hair buns with pink bows -->
        <circle cx="58" cy="55" r="16" fill="#1e293b"/>
        <circle cx="122" cy="55" r="16" fill="#1e293b"/>
        <circle cx="58" cy="55" r="5" fill="#f472b6"/>
        <circle cx="122" cy="55" r="5" fill="#f472b6"/>
        <!-- Big Joyous Laughing Mouth (开口大笑) -->
        <circle cx="78" cy="92" r="5" fill="#0f172a"/>
        <circle cx="102" cy="92" r="5" fill="#0f172a"/>
        <path d="M76,108 Q90,130 104,108 Z" fill="#dc2626"/>
        <circle cx="70" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="110" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>
        <!-- Holding delicious steamed bun in hand -->
        <circle cx="140" cy="170" r="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      </g>

      <!-- Red Chinese Seal (市 - 繁华市井) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 市 -->
          <line x1="28" y1="12" x2="28" y2="18"/>
          <line x1="16" y1="18" x2="40" y2="18"/>
          <rect x="18" y="24" width="20" height="15"/>
          <line x1="28" y1="24" x2="28" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. story_town_inventor_p1: 推开红色大门，一辆木头小马车停在门前
  // ==========================================
  {
    id: "story_town_inventor_p1",
    title: "小镇上的发明家 - 第1页",
    defs: `
      <linearGradient id="inventor_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <!-- Classical Chinese Courtyard with Red Gate & Wooden Carriage (推开朱红大门，鲁班风木马车亮相) -->
      <rect width="1376" height="768" fill="url(#inventor_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Red Courtyard Gate Pushed Open (半开的厚重朱漆大门) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="220" width="1376" height="548" fill="#e2e8f0"/>
        <path d="M40,220 L1336,220 L1376,180 L0,180 Z" fill="#334155"/>
        <!-- Red Doors Left & Right -->
        <rect x="180" y="220" width="220" height="420" fill="#991b1b" stroke="#78350f" stroke-width="10"/>
        <rect x="880" y="220" width="220" height="420" fill="#991b1b" stroke="#78350f" stroke-width="10"/>
        <circle cx="340" cy="400" r="26" fill="#facc15" stroke="#78350f" stroke-width="4"/>
        <circle cx="940" cy="400" r="26" fill="#facc15" stroke="#78350f" stroke-width="4"/>
      </g>

      <!-- Ingenious Wooden Carriage in Center (停在门前的精巧木头小马车) -->
      <g transform="translate(460, 360)" filter="url(#dropShadow)">
        <!-- Carriage Body (精美木雕车厢) -->
        <rect x="60" y="60" width="260" height="150" rx="16" fill="#d97706" stroke="#78350f" stroke-width="8"/>
        <!-- Carriage Eaved Roof (飞檐车顶) -->
        <path d="M40,60 L340,60 L360,25 L20,25 Z" fill="#78350f"/>
        <!-- Windows with Lattice (雕花小窗) -->
        <rect x="140" y="90" width="70" height="60" rx="6" fill="#fef08a" stroke="#78350f" stroke-width="4"/>
        <line x1="175" y1="90" x2="175" y2="150" stroke="#78350f" stroke-width="3"/>
        <line x1="140" y1="120" x2="210" y2="120" stroke="#78350f" stroke-width="3"/>

        <!-- Large Wooden Spoke Wheels (鲁班木轮) -->
        <g transform="translate(90, 210)">
          <circle cx="0" cy="0" r="50" fill="#b45309" stroke="#78350f" stroke-width="6"/>
          <circle cx="0" cy="0" r="16" fill="#facc15"/>
          <line x1="-50" y1="0" x2="50" y2="0" stroke="#78350f" stroke-width="4"/>
          <line x1="0" y1="-50" x2="0" y2="50" stroke="#78350f" stroke-width="4"/>
        </g>
        <g transform="translate(290, 210)">
          <circle cx="0" cy="0" r="50" fill="#b45309" stroke="#78350f" stroke-width="6"/>
          <circle cx="0" cy="0" r="16" fill="#facc15"/>
          <line x1="-50" y1="0" x2="50" y2="0" stroke="#78350f" stroke-width="4"/>
          <line x1="0" y1="-50" x2="0" y2="50" stroke="#78350f" stroke-width="4"/>
        </g>

        <!-- Cute Carved Wooden Horse Head at Front (车头雕刻的灵动小木马) -->
        <path d="M320,130 L380,80 L395,95 L360,150 Z" fill="#92400e"/>
        <polygon points="370,80 380,60 390,80" fill="#92400e"/>
      </g>

      <!-- Red Chinese Seal (巧 - 心灵手巧) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 工 on left -->
          <line x1="14" y1="18" x2="26" y2="18"/>
          <line x1="20" y1="18" x2="20" y2="38"/>
          <line x1="13" y1="38" x2="27" y2="38"/>
          <!-- 丂 on right -->
          <line x1="28" y1="18" x2="42" y2="18"/>
          <path d="M36,18 L32,30 L40,30 Q42,42 34,42 Q28,42 27,36"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. story_town_inventor_p2: 天上飞小鸟，水里游小鱼，小车跑得快
  // ==========================================
  {
    id: "story_town_inventor_p2",
    title: "小镇上的发明家 - 第2页",
    defs: `
      <linearGradient id="bridge_river" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Jiangnan Canal & Bridge with Fast Wooden Carriage (飞鸟翔空，红鲤戏水，小车飞奔) -->
      <rect width="1376" height="768" fill="#e0f2fe"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Clear River Canal with Swimming Red Carp (清澈流水与红鲤跃动) -->
      <path d="M0,520 Q688,480 1376,520 L1376,768 L0,768 Z" fill="url(#bridge_river)"/>
      <!-- Red Carp Swimming (欢快游动的小红鲤鱼) -->
      <g transform="translate(340, 620)" filter="url(#softGlow)">
        <ellipse cx="40" cy="20" rx="26" ry="14" fill="#ef4444"/>
        <polygon points="14,20 -5,10 -5,30" fill="#ef4444"/>
        <circle cx="56" cy="16" r="2.5" fill="#ffffff"/>
      </g>
      <g transform="translate(860, 640)" filter="url(#softGlow)">
        <ellipse cx="40" cy="20" rx="22" ry="12" fill="#f97316"/>
        <polygon points="18,20 0,10 0,30" fill="#f97316"/>
      </g>

      <!-- Ancient Single Arch Stone Bridge (江南单孔石拱桥) -->
      <g transform="translate(180, 240)" filter="url(#dropShadow)">
        <path d="M0,280 Q480,140 960,280 L960,340 L0,340 Z" fill="#94a3b8"/>
        <path d="M280,340 A200,200 0 0,1 680,340 Z" fill="#0284c7"/>
        <line x1="0" y1="280" x2="960" y2="280" stroke="#64748b" stroke-width="6"/>

        <!-- Wooden Carriage Racing Across the Stone Bridge (在石桥上飞快奔跑的小车) -->
        <g transform="translate(380, 80)">
          <!-- Motion lines (飞驰气流) -->
          <line x1="-60" y1="100" x2="-10" y2="100" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
          <line x1="-80" y1="130" x2="-20" y2="130" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>

          <rect x="0" y="30" width="180" height="90" rx="12" fill="#d97706" stroke="#78350f" stroke-width="6"/>
          <path d="M-10,30 L190,30 L200,5 L-20,5 Z" fill="#78350f"/>
          <!-- Spinning Wheels -->
          <circle cx="35" cy="120" r="32" fill="#b45309" stroke="#78350f" stroke-width="5"/>
          <circle cx="145" cy="120" r="32" fill="#b45309" stroke="#78350f" stroke-width="5"/>
        </g>
      </g>

      <!-- Little Bird Flying in the Sky (空中飞过的小鸟) -->
      <g transform="translate(320, 140)" filter="url(#dropShadow)">
        <ellipse cx="40" cy="30" rx="20" ry="14" fill="#0284c7"/>
        <polygon points="60,28 72,32 60,36" fill="#f97316"/>
        <path d="M30,20 Q40,-5 55,20" stroke="#0284c7" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Red Chinese Seal (捷 - 捷报频传) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 扌 on left -->
          <line x1="18" y1="14" x2="18" y2="44"/>
          <line x1="12" y1="24" x2="24" y2="24"/>
          <path d="M13,38 L22,30"/>
          <!-- 疌 on right -->
          <line x1="28" y1="18" x2="42" y2="18"/>
          <line x1="27" y1="24" x2="43" y2="24"/>
          <rect x="29" y="27" width="12" height="8"/>
          <line x1="35" y1="14" x2="35" y2="44"/>
          <line x1="26" y1="44" x2="44" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. story_space_ship_p1: 蓝蓝的天空上，洁白的白云随风飘动
  // ==========================================
  {
    id: "story_space_ship_p1",
    title: "星空号太空飞船 - 第1页",
    defs: `
      <linearGradient id="launch_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Aerospace Launch Pad Sky (蔚蓝苍穹白云悠，神舟待发筑天宫) -->
      <rect width="1376" height="768" fill="url(#launch_sky)"/>
      <circle cx="1180" cy="140" r="75" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Beautiful Pure White Clouds Drifting (随风飘动的如意白云) -->
      <g fill="#ffffff" filter="url(#softGlow)" opacity="0.95">
        <ellipse cx="380" cy="240" rx="160" ry="60"/>
        <circle cx="320" cy="200" r="55"/>
        <circle cx="450" cy="200" r="60"/>

        <ellipse cx="880" cy="280" rx="180" ry="65"/>
        <circle cx="810" cy="235" r="60"/>
        <circle cx="950" cy="235" r="65"/>
      </g>

      <!-- Majestic Launch Gantry Tower in Distance (远方庄严宏伟的中国航天发射塔) -->
      <g transform="translate(620, 320)" filter="url(#dropShadow)">
        <rect x="40" y="60" width="56" height="388" fill="#475569"/>
        <line x1="40" y1="120" x2="96" y2="180" stroke="#94a3b8" stroke-width="4"/>
        <line x1="96" y1="120" x2="40" y2="180" stroke="#94a3b8" stroke-width="4"/>
        <line x1="40" y1="200" x2="96" y2="260" stroke="#94a3b8" stroke-width="4"/>
        <line x1="96" y1="200" x2="40" y2="260" stroke="#94a3b8" stroke-width="4"/>
        <!-- China Space Rocket (长征神舟飞船火箭) -->
        <rect x="52" y="0" width="32" height="340" rx="16" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <polygon points="68,-60 52,0 84,0" fill="#dc2626"/>
        <!-- Pure Chinese Characters on Rocket: 中国航天 -->
        <g stroke="#dc2626" stroke-width="2" stroke-linecap="round" fill="none">
          <!-- 中 -->
          <rect x="63" y="40" width="10" height="8"/>
          <line x1="68" y1="36" x2="68" y2="52"/>
          <!-- 华 / 国 -->
          <rect x="62" y="60" width="12" height="12"/>
          <line x1="68" y1="64" x2="68" y2="68"/>
        </g>
      </g>

      <!-- Launch Ground with Chinese Red Banners (发射场绿茵与红旗) -->
      <rect x="0" y="640" width="1376" height="128" fill="#15803d"/>

      <!-- Red Chinese Seal (翔 - 翱翔天际) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 羊 on left -->
          <circle cx="16" cy="15" r="1" fill="#ffffff"/>
          <circle cx="24" cy="15" r="1" fill="#ffffff"/>
          <line x1="14" y1="20" x2="26" y2="20"/>
          <line x1="14" y1="26" x2="26" y2="26"/>
          <line x1="12" y1="32" x2="28" y2="32"/>
          <line x1="20" y1="16" x2="20" y2="42"/>
          <!-- 羽 on right -->
          <path d="M31,18 L41,18 L41,27"/>
          <path d="M31,31 L41,31 L41,40"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. story_space_ship_p2: 飞船穿过风云，飞向美丽的银河星空
  // ==========================================
  {
    id: "story_space_ship_p2",
    title: "星空号太空飞船 - 第2页",
    defs: `
      <linearGradient id="galaxy_bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="40%" stop-color="#1e1b4b"/>
        <stop offset="70%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#4c1d95"/>
      </linearGradient>
      <linearGradient id="milky_way" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#c084fc"/>
        <stop offset="100%" stop-color="#f472b6"/>
      </linearGradient>
    `,
    content: `
      <!-- Magnificent Cosmic Milky Way Galaxy (璀璨浩瀚银河星海，华夏飞船天宫漫步) -->
      <rect width="1376" height="768" fill="url(#galaxy_bg)"/>

      <!-- Spiral Milky Way River (浪漫绚烂的九天银河) -->
      <path d="M-100,500 Q400,200 900,400 T1476,100" stroke="url(#milky_way)" stroke-width="140" fill="none" opacity="0.35" filter="url(#softGlow)"/>

      <!-- Twinkling Starlight & Blue Earth in Distance (远方的深蓝地球与星光) -->
      <circle cx="1180" cy="560" r="160" fill="#0284c7" filter="url(#softGlow)"/>
      <path d="M1060,540 Q1120,480 1180,520 T1260,600" stroke="#22c55e" stroke-width="24" stroke-linecap="round" fill="none" opacity="0.7"/>

      <!-- Thousand Glistening Stars (漫天繁星) -->
      <g fill="#ffffff" filter="url(#softGlow)">
        <circle cx="120" cy="180" r="4"/>
        <circle cx="240" cy="80" r="5"/>
        <circle cx="480" cy="150" r="6"/>
        <circle cx="720" cy="90" r="5"/>
        <circle cx="950" cy="180" r="4"/>
        <circle cx="380" cy="480" r="5"/>
        <circle cx="620" cy="620" r="4"/>
      </g>

      <!-- Chinese Spacecraft Orbiting (中国“天宫”神舟航天飞船) -->
      <g transform="translate(480, 240) rotate(-25)" filter="url(#dropShadow)">
        <!-- Rocket Flame Exhaust (喷薄的烈焰光流) -->
        <polygon points="-80,-5 -180,-25 -140,-5 -180,15" fill="#f97316" filter="url(#softGlow)"/>
        <polygon points="-60,-2 -140,-12 -110,-2 -140,8" fill="#fde047" filter="url(#softGlow)"/>

        <!-- Spacecraft Body (白色流线型飞船舱体) -->
        <rect x="0" y="-35" width="220" height="70" rx="35" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <path d="M220,-35 L280,0 L220,35 Z" fill="#dc2626"/>

        <!-- Solar Panels Left & Right (蔚蓝光伏太阳能翼) -->
        <rect x="60" y="-140" width="80" height="95" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="3"/>
        <line x1="100" y1="-140" x2="100" y2="-45" stroke="#38bdf8" stroke-width="2"/>
        <rect x="60" y="45" width="80" height="95" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="3"/>
        <line x1="100" y1="45" x2="100" y2="140" stroke="#38bdf8" stroke-width="2"/>

        <!-- Five-pointed Golden Star (红底五角金星) -->
        <rect x="30" y="-18" width="40" height="36" rx="4" fill="#dc2626"/>
        <polygon points="50,-10 53,-2 62,-2 55,4 57,12 50,7 43,12 45,4 38,-2 47,-2" fill="#facc15"/>
      </g>

      <!-- Red Chinese Seal (星 - 璀璨星河) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 日 on top -->
          <rect x="19" y="14" width="18" height="12"/>
          <line x1="19" y1="20" x2="37" y2="20"/>
          <!-- 生 on bottom -->
          <line x1="16" y1="29" x2="39" y2="29"/>
          <line x1="18" y1="36" x2="37" y2="36"/>
          <line x1="13" y1="43" x2="42" y2="43"/>
          <line x1="28" y1="26" x2="28" y2="43"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. story_happy_town_p1: 早晨太阳升起，小镇打开了快乐大门
  // ==========================================
  {
    id: "story_happy_town_p1",
    title: "快乐的小镇 - 第1页",
    defs: `
      <linearGradient id="morning_sunrise" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Historic Town Gate Welcoming the Morning Sun (晨光熹微红日升，江南小镇启城门) -->
      <rect width="1376" height="768" fill="url(#morning_sunrise)"/>

      <!-- Brilliant Morning Sun Rising (一轮金黄朝阳破晓升起) -->
      <circle cx="688" cy="240" r="110" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Ancient Town Wall & Double Eaved Gate Tower (小镇古城楼飞檐黛瓦) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="320" width="1376" height="448" fill="#cbd5e1"/>
        <!-- Lower eave -->
        <path d="M40,320 L1336,320 L1376,280 L0,280 Z" fill="#334155"/>
        <!-- Upper Gate Pavilion (城门重檐楼阁) -->
        <rect x="440" y="160" width="496" height="120" fill="#991b1b" stroke="#78350f" stroke-width="8"/>
        <path d="M400,160 L976,160 L1016,110 L360,110 Z" fill="#334155"/>

        <!-- Grand Archway Gate Opened (敞开的拱形大城门) -->
        <path d="M540,768 L540,540 A148,148 0 0,1 836,540 L836,768 Z" fill="#fef08a"/>
        <!-- Open Wooden Doors (两扇大门敞开迎宾) -->
        <polygon points="540,768 540,540 480,520 480,768" fill="#78350f"/>
        <polygon points="836,768 836,540 896,520 896,768" fill="#78350f"/>
      </g>

      <!-- Smooth Town Flagstone Plaza (明净青石板广场) -->
      <rect x="0" y="640" width="1376" height="128" fill="#94a3b8"/>

      <!-- Red Chinese Seal (晓 - 破晓迎曦) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 日 on left -->
          <rect x="14" y="17" width="12" height="22"/>
          <line x1="14" y1="28" x2="26" y2="28"/>
          <!-- 尧 on right -->
          <line x1="29" y1="16" x2="41" y2="16"/>
          <line x1="28" y1="24" x2="43" y2="24"/>
          <line x1="27" y1="32" x2="44" y2="32"/>
          <path d="M36,24 L31,43"/>
          <path d="M36,32 L42,43"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. story_happy_town_p2: 汽车开过马路，小朋友高高兴兴上学
  // ==========================================
  {
    id: "story_happy_town_p2",
    title: "快乐的小镇 - 第2页",
    defs: `
      <linearGradient id="school_morning_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#d9f99d"/>
      </linearGradient>
    `,
    content: `
      <!-- Happy Modern Chinese Town Avenue to School (道路整洁树成荫，校车伴我乐上学) -->
      <rect width="1376" height="768" fill="url(#school_morning_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Clean Wide Town Avenue with White Crosswalk (宽敞整洁的马路斑马线) -->
      <rect x="0" y="460" width="1376" height="308" fill="#475569"/>
      <!-- Crosswalk stripes (白色斑马线) -->
      <rect x="180" y="520" width="40" height="200" fill="#ffffff"/>
      <rect x="260" y="520" width="40" height="200" fill="#ffffff"/>
      <rect x="340" y="520" width="40" height="200" fill="#ffffff"/>
      <rect x="420" y="520" width="40" height="200" fill="#ffffff"/>

      <!-- Modern Yellow School Bus (金黄色安全校车) -->
      <g transform="translate(680, 400)" filter="url(#dropShadow)">
        <rect x="0" y="30" width="340" height="150" rx="20" fill="#facc15" stroke="#ca8a04" stroke-width="6"/>
        <!-- Windows -->
        <rect x="30" y="50" width="55" height="55" rx="8" fill="#38bdf8"/>
        <rect x="105" y="50" width="55" height="55" rx="8" fill="#38bdf8"/>
        <rect x="180" y="50" width="55" height="55" rx="8" fill="#38bdf8"/>
        <rect x="255" y="50" width="55" height="55" rx="8" fill="#38bdf8"/>
        <!-- Bus Wheels -->
        <circle cx="80" cy="180" r="32" fill="#1e293b"/>
        <circle cx="80" cy="180" r="14" fill="#94a3b8"/>
        <circle cx="260" cy="180" r="32" fill="#1e293b"/>
        <circle cx="260" cy="180" r="14" fill="#94a3b8"/>
      </g>

      <!-- Chinese Children with Red Scarves Happily Walking Hand-in-Hand (戴红领巾欢快走过斑马线的小朋友) -->
      <g transform="translate(240, 260)" filter="url(#dropShadow)">
        <!-- Boy -->
        <path d="M40,160 L140,160 L155,380 L25,380 Z" fill="#0284c7"/>
        <polygon points="90,160 70,240 90,270 110,240" fill="#dc2626"/>
        <circle cx="90" cy="95" r="42" fill="#fed7aa"/>
        <path d="M55,80 Q90,55 125,80" fill="#1e293b"/>
        <circle cx="78" cy="92" r="5" fill="#0f172a"/>
        <circle cx="102" cy="92" r="5" fill="#0f172a"/>
        <path d="M84,110 Q90,120 96,110" stroke="#ef4444" stroke-width="3" fill="none"/>
        <circle cx="70" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="110" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Girl beside boy hand-in-hand -->
        <g transform="translate(130, 20)">
          <path d="M35,150 L135,150 L148,360 L22,360 Z" fill="#ec4899"/>
          <polygon points="85,150 68,220 85,250 102,220" fill="#dc2626"/>
          <circle cx="85" cy="90" r="40" fill="#fed7aa"/>
          <circle cx="50" cy="55" r="15" fill="#1e293b"/>
          <circle cx="120" cy="55" r="15" fill="#1e293b"/>
          <circle cx="50" cy="55" r="5" fill="#ef4444"/>
          <circle cx="120" cy="55" r="5" fill="#ef4444"/>
          <circle cx="74" cy="88" r="4.5" fill="#0f172a"/>
          <circle cx="96" cy="88" r="4.5" fill="#0f172a"/>
          <path d="M80,105 Q85,115 90,105" stroke="#ef4444" stroke-width="3" fill="none"/>
        </g>
      </g>

      <!-- Red Chinese Seal (乐 - 快乐无忧) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 乐 -->
          <path d="M22,14 L18,20"/>
          <line x1="16" y1="20" x2="38" y2="20"/>
          <path d="M38,20 L22,30 L38,30 Q38,44 28,44"/>
          <circle cx="21" cy="38" r="1" fill="#ffffff"/>
          <circle cx="35" cy="38" r="1" fill="#ffffff"/>
        </g>
      </g>
    `
  }
];

console.log(`Rendering ${STORIES_PART4.length} storybook part 4 illustrations...`);

for (const item of STORIES_PART4) {
  console.log(`\nRendering ${item.id} (${item.title})...`);
  const svgContent = wrapSvg(item.content, item.defs);
  const svgPath = path.join(TMP_DIR, `${item.id}.svg`);
  const jpgPath = path.join(OUTPUT_DIR, `${item.id}.jpg`);
  const webpPath = path.join(OUTPUT_DIR, `${item.id}.webp`);

  fs.writeFileSync(svgPath, svgContent);
  execSync(`/Applications/ServBay/bin/magick "${svgPath}" -density 150 -resize 1376x768! -quality 95 "${jpgPath}"`);
  execSync(`/Applications/ServBay/bin/cwebp -q 88 "${jpgPath}" -o "${webpPath}"`);

  const statJpg = fs.statSync(jpgPath);
  const statWebp = fs.statSync(webpPath);
  console.log(`✓ Success ${item.id}: JPG (${(statJpg.size/1024).toFixed(1)} KB), WebP (${(statWebp.size/1024).toFixed(1)} KB)`);
}

console.log("\nAll 8 storybook part 4 illustrations generated successfully!");
