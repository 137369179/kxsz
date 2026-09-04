import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_poems_part2";

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
      <feDropShadow dx="3" dy="6" stdDeviation="6" flood-opacity="0.18"/>
    </filter>
    ${customDefs}
  </defs>
  ${content}
</svg>`;
}

const POEMS_PART2 = [
  // 1. poem_007 《寻隐者不遇》 (贾岛) - 松下问童子，言师采药去
  {
    id: "poem_xunyingzhe",
    title: "寻隐者不遇",
    poemId: "poem_007",
    defs: `
      <linearGradient id="sky_xyz" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#93c5fd"/>
        <stop offset="60%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Sky & Misty Clouds -->
      <rect width="1376" height="768" fill="url(#sky_xyz)"/>

      <!-- Distant Majestic Misty Peaks (云深不知处) -->
      <path d="M0,450 Q240,240 500,340 T1000,260 T1376,380 L1376,768 L0,768 Z" fill="#64748b" opacity="0.65"/>
      <g fill="#ffffff" opacity="0.8" filter="url(#softGlow)">
        <ellipse cx="400" cy="380" rx="260" ry="45"/>
        <ellipse cx="980" cy="340" rx="300" ry="50"/>
      </g>
      <path d="M0,520 Q280,380 600,450 T1150,390 T1376,490 L1376,768 L0,768 Z" fill="#334155"/>

      <!-- Giant Ancient Pine Tree (松下) -->
      <g filter="url(#dropShadow)">
        <path d="M260,768 C280,560 220,380 320,240 C360,180 440,160 520,150" fill="none" stroke="#78350f" stroke-width="40" stroke-linecap="round"/>
        <path d="M280,440 Q380,380 480,400" fill="none" stroke="#78350f" stroke-width="26" stroke-linecap="round"/>
        <!-- Pine Needle Clusters -->
        <g fill="#15803d">
          <circle cx="340" cy="200" r="85"/>
          <circle cx="480" cy="160" r="100"/>
          <circle cx="600" cy="180" r="90"/>
          <circle cx="420" cy="360" r="75"/>
          <circle cx="530" cy="390" r="80"/>
        </g>
      </g>

      <!-- Scholar Poet Asking with Hands Clasped (松下问童子) -->
      <g transform="translate(420, 360)" filter="url(#dropShadow)">
        <path d="M40,270 L60,130 L110,130 L130,270 Z" fill="#3b82f6"/>
        <ellipse cx="85" cy="80" rx="38" ry="34" fill="#fed7aa"/>
        <!-- Hanfu Headwear -->
        <path d="M45,75 C45,35 125,35 125,75 Z" fill="#1e1b4b"/>
        <rect x="75" y="20" width="20" height="25" fill="#f59e0b"/>
        <!-- Clasped Hands in Polite Inquiring Bow -->
        <circle cx="65" cy="160" r="12" fill="#fed7aa"/>
        <circle cx="85" cy="160" r="12" fill="#fed7aa"/>
      </g>

      <!-- Little Taoist Medicine Boy with Bamboo Basket on Back (言师采药去) -->
      <g transform="translate(680, 410)" filter="url(#dropShadow)">
        <!-- Bamboo Herb Basket on Back -->
        <rect x="0" y="70" width="45" height="60" rx="6" fill="#b45309"/>
        <!-- Herbs sticking out of basket -->
        <path d="M15,70 Q5,40 10,25" stroke="#22c55e" stroke-width="6" fill="none"/>
        <path d="M28,70 Q38,45 35,30" stroke="#16a34a" stroke-width="6" fill="none"/>
        <!-- Boy in Linen Robes pointing up to mountains -->
        <path d="M40,220 L55,110 L95,110 L110,220 Z" fill="#f59e0b"/>
        <ellipse cx="75" cy="65" rx="32" ry="28" fill="#fde68a"/>
        <!-- Topknot Bun with Wooden Hairpin -->
        <circle cx="75" cy="30" r="14" fill="#1e1b4b"/>
        <line x1="55" y1="30" x2="95" y2="30" stroke="#78350f" stroke-width="4"/>
        <!-- Face pointing to the mountains -->
        <ellipse cx="85" cy="65" rx="4.5" ry="6.5" fill="#1e293b"/>
        <path d="M80,78 Q88,84 96,78" stroke="#78350f" stroke-width="2.5" fill="none"/>
        <!-- Arm Pointing to Deep Clouds -->
        <line x1="90" y1="120" x2="160" y2="60" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
        <circle cx="160" cy="60" r="7" fill="#fde68a"/>
      </g>

      <!-- Red Chinese Calligraphy Seal (寻仙) with Vector Path Strokes -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 仙: 单人旁 + 山 -->
          <line x1="16" y1="14" x2="11" y2="28"/>
          <line x1="13" y1="21" x2="13" y2="44"/>
          <line x1="32" y1="14" x2="32" y2="43"/>
          <path d="M23,24 L23,41 L41,41 L41,24"/>
        </g>
      </g>
    `
  },

  // 2. poem_011 《望庐山瀑布》 (李白) - 飞流直下三千尺，疑是银河落九天
  {
    id: "poem_wanglushan",
    title: "望庐山瀑布",
    poemId: "poem_011",
    defs: `
      <linearGradient id="sky_ls" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#c084fc"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="purpleMist" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#c084fc" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#e879f9" stop-opacity="0.2"/>
      </linearGradient>
      <linearGradient id="waterfallStream" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
    `,
    content: `
      <!-- Morning Sky & Purple Mist on Xianglu Peak (日照香炉生紫烟) -->
      <rect width="1376" height="768" fill="url(#sky_ls)"/>
      <circle cx="340" cy="150" r="80" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Swirling Purple Mist around Mountain Peaks (紫烟) -->
      <g fill="url(#purpleMist)" filter="url(#softGlow)">
        <ellipse cx="360" cy="220" rx="280" ry="70"/>
        <ellipse cx="500" cy="300" rx="240" ry="60"/>
      </g>

      <!-- Towering Cliffs of Mount Lu (香炉峰) -->
      <path d="M150,768 L240,240 Q450,180 560,320 L620,768 Z" fill="#334155" filter="url(#dropShadow)"/>
      <path d="M780,768 L840,200 Q1050,140 1200,300 L1260,768 Z" fill="#1e293b"/>

      <!-- Thunderous Silver Waterfall Plunging 3000 Feet (飞流直下三千尺) -->
      <g filter="url(#dropShadow)">
        <path d="M680,180 Q670,450 660,768 L740,768 Q750,450 720,180 Z" fill="url(#waterfallStream)"/>
        <!-- Spray at Waterfall Base -->
        <ellipse cx="700" cy="740" rx="180" ry="40" fill="#ffffff" filter="url(#softGlow)" opacity="0.9"/>
      </g>

      <!-- Poet Li Bai on Cliff Terrace (遥看瀑布挂前川) -->
      <g transform="translate(340, 480)" filter="url(#dropShadow)">
        <!-- Hanfu White Robes -->
        <path d="M40,220 L60,90 L110,90 L130,220 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
        <ellipse cx="85" cy="55" rx="34" ry="30" fill="#fed7aa"/>
        <!-- Poet Hat -->
        <path d="M50,50 C50,15 120,15 120,50 Z" fill="#1e1b4b"/>
        <!-- Outstretched Arm admiring the waterfall -->
        <line x1="105" y1="95" x2="190" y2="60" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
        <circle cx="190" cy="60" r="8" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Calligraphy Seal (山) with Vector Path Strokes -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 山: 中竖 + 竖折 + 右竖 -->
          <line x1="27" y1="12" x2="27" y2="43"/>
          <path d="M14,24 L14,41 L40,41 L40,24"/>
        </g>
      </g>
    `
  },

  // 3. poem_012 《早发白帝城》 (李白) - 朝辞白帝彩云间，两岸猿声啼不住
  {
    id: "poem_zaofabaidi",
    title: "早发白帝城",
    poemId: "poem_012",
    defs: `
      <linearGradient id="cloud_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fb7185"/>
        <stop offset="40%" stop-color="#fbcfe8"/>
        <stop offset="75%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="gorgeRiver" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <!-- Colorful Morning Sunrise Clouds (朝辞白帝彩云间) -->
      <rect width="1376" height="768" fill="url(#cloud_sky)"/>
      <g fill="#f43f5e" opacity="0.4" filter="url(#softGlow)">
        <ellipse cx="320" cy="140" rx="180" ry="40"/>
        <ellipse cx="860" cy="120" rx="220" ry="45"/>
      </g>

      <!-- Baidi Castle High on Mountain Cliff (白帝城) -->
      <g transform="translate(180, 160)" filter="url(#dropShadow)">
        <polygon points="120,40 20,110 220,110" fill="#dc2626"/>
        <rect x="40" y="105" width="160" height="90" fill="#fef08a"/>
        <!-- City Gate Plaque with Vector Calligraphy (白) -->
        <rect x="90" y="130" width="60" height="65" rx="6" fill="#78350f"/>
        <g stroke="#fde047" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(95, 135)">
          <!-- 白: 撇 + 框 + 内部横 -->
          <line x1="25" y1="10" x2="20" y2="18"/>
          <path d="M15,18 L15,46 L35,46 L35,18 Z"/>
          <line x1="15" y1="32" x2="35" y2="32"/>
        </g>
      </g>

      <!-- Steep Gorges Flanking the Yangtze River -->
      <path d="M0,768 L0,320 Q220,420 380,560 L380,768 Z" fill="#15803d"/>
      <path d="M960,768 L960,540 Q1180,410 1376,300 L1376,768 Z" fill="#166534"/>

      <!-- Swift River Surging Between Gorges (轻舟已过万重山) -->
      <path d="M360,768 L360,550 Q688,520 980,540 L980,768 Z" fill="url(#gorgeRiver)"/>

      <!-- Swift Wooden Skiff Speeding with White Waves -->
      <g transform="translate(620, 580)" filter="url(#dropShadow)">
        <path d="M0,40 C60,75 180,75 240,40 L210,65 C150,85 70,85 20,65 Z" fill="#b45309"/>
        <!-- Flying Bow Wave -->
        <ellipse cx="235" cy="55" rx="22" ry="8" fill="#ffffff" opacity="0.8"/>
        <!-- Traveler in Hanfu Robes on Boat (李白) -->
        <path d="M80,45 L95,-5 L125,-5 L140,45 Z" fill="#ffffff"/>
        <ellipse cx="110" cy="-25" rx="18" ry="16" fill="#fed7aa"/>
      </g>

      <!-- Cute Golden Monkeys Calling from Gorge Trees (两岸猿声啼不住) -->
      <g transform="translate(240, 420)" filter="url(#dropShadow)">
        <ellipse cx="30" cy="30" rx="18" ry="22" fill="#d97724"/>
        <ellipse cx="30" cy="0" rx="20" ry="18" fill="#d97724"/>
        <circle cx="24" cy="-2" r="3" fill="#1e293b"/>
        <circle cx="36" cy="-2" r="3" fill="#1e293b"/>
        <!-- Hanging by Tail from Tree Vine -->
        <path d="M30,50 Q10,70 0,55" stroke="#b45309" stroke-width="6" fill="none"/>
      </g>

      <!-- Red Chinese Seal (舟) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(3, 3)">
          <!-- 舟: 撇 + 竖 + 横折钩 + 点 + 点 -->
          <line x1="24" y1="12" x2="16" y2="24"/>
          <line x1="16" y1="24" x2="16" y2="44"/>
          <path d="M16,24 L34,24 L34,44"/>
          <line x1="16" y1="34" x2="34" y2="34"/>
          <circle cx="25" cy="20" r="1.5" fill="#fff"/>
        </g>
      </g>
    `
  },

  // 4. poem_013 《绝句》 (杜甫) - 迟日江山丽，泥融飞燕子，沙暖睡鸳鸯
  {
    id: "poem_jueju",
    title: "绝句",
    poemId: "poem_013",
    defs: `
      <linearGradient id="sky_jj" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="sandbar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Spring Landscape (迟日江山丽) -->
      <rect width="1376" height="768" fill="url(#sky_jj)"/>
      <circle cx="200" cy="140" r="65" fill="#facc15" filter="url(#softGlow)"/>

      <!-- Beautiful Green Mountains & Spring River -->
      <path d="M0,450 Q350,340 750,420 T1376,380 L1376,768 L0,768 Z" fill="#4ade80"/>
      <rect y="460" width="1376" height="308" fill="#0284c7"/>

      <!-- Warm Sunlit Sandbar (沙暖睡鸳鸯) -->
      <ellipse cx="880" cy="620" rx="340" ry="90" fill="url(#sandbar)" filter="url(#dropShadow)"/>

      <!-- Pair of Colorful Mandarin Ducks Sleeping Peacefully (睡鸳鸯) -->
      <g transform="translate(860, 560)" filter="url(#dropShadow)">
        <!-- Duck 1 (Male - Vibrant Crest) -->
        <ellipse cx="0" cy="20" rx="45" ry="30" fill="#ea580c"/>
        <circle cx="32" cy="0" r="18" fill="#0284c7"/>
        <ellipse cx="25" cy="-10" rx="14" ry="7" fill="#facc15"/>
        <path d="M38,0 L52,2 L38,8 Z" fill="#ef4444"/>
        <polygon points="-15,10 -35,-8 -10,0" fill="#f97316"/>
        <!-- Duck 2 (Female - Warm Brown) -->
        <g transform="translate(65, 10)">
          <ellipse cx="0" cy="15" rx="40" ry="25" fill="#b45309"/>
          <circle cx="28" cy="0" r="16" fill="#78350f"/>
          <path d="M34,0 L46,2 L34,7 Z" fill="#ea580c"/>
        </g>
      </g>

      <!-- Spring Swallows Dipping Mud to Build Nests (泥融飞燕子) -->
      <g transform="translate(420, 260)" filter="url(#dropShadow)">
        <polygon points="0,0 35,-15 15,15" fill="#1e1b4b"/>
        <polygon points="0,0 -25,-15 -10,15" fill="#1e1b4b"/>
        <circle cx="8" cy="0" r="8" fill="#ef4444"/>
        <circle cx="16" cy="2" r="3.5" fill="#78350f"/>
        <polygon points="-5,15 -25,35 -15,15 -5,35" fill="#1e1b4b"/>
      </g>

      <!-- Red Chinese Seal (春) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 春: 三横 + 撇捺 + 日 -->
          <line x1="16" y1="16" x2="38" y2="16"/>
          <line x1="18" y1="23" x2="36" y2="23"/>
          <line x1="13" y1="30" x2="41" y2="30"/>
          <line x1="27" y1="12" x2="14" y2="44"/>
          <line x1="27" y1="30" x2="40" y2="44"/>
          <!-- 日底 -->
          <rect x="22" y="34" width="12" height="12"/>
        </g>
      </g>
    `
  },

  // 5. poem_015 《风》 (李峤) - 过江千尺浪，入竹万竿斜
  {
    id: "poem_feng",
    title: "风",
    poemId: "poem_015",
    defs: `
      <linearGradient id="sky_f" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <!-- Sky with Swirling Wind Gusts -->
      <rect width="1376" height="768" fill="url(#sky_f)"/>

      <!-- Swirling Wind Ribbons (解落三秋叶，能开二月花) -->
      <g stroke="#ffffff" stroke-width="5" fill="none" opacity="0.75" filter="url(#softGlow)" stroke-linecap="round">
        <path d="M100,240 C350,180 550,320 850,220 C1050,160 1200,260 1376,200"/>
        <path d="M200,340 C450,280 650,420 950,320 C1150,260 1250,340 1376,300"/>
      </g>

      <!-- Golden Autumn Leaves and Pink Spring Petals Swirling in Wind -->
      <g fill="#f59e0b">
        <ellipse cx="480" cy="220" rx="14" ry="8" transform="rotate(35 480 220)"/>
        <ellipse cx="720" cy="260" rx="16" ry="9" transform="rotate(-25 720 260)"/>
        <ellipse cx="1020" cy="210" rx="15" ry="8" transform="rotate(40 1020 210)"/>
      </g>
      <g fill="#fb7185">
        <circle cx="580" cy="290" r="7"/>
        <circle cx="880" cy="240" r="8"/>
      </g>

      <!-- Ten Thousand Bamboo Canes Bending in Strong Wind (入竹万竿斜) -->
      <g stroke="#15803d" stroke-width="8" stroke-linecap="round" filter="url(#dropShadow)">
        ${[180, 240, 300, 360, 420, 480, 540, 600].map(x => `
          <path d="M${x},768 C${x+20},620 ${x+80},500 ${x+140},420"/>
          <line x1="${x+140}" y1="420" x2="${x+190}" y2="435" stroke="#22c55e" stroke-width="5"/>
          <line x1="${x+110}" y1="460" x2="${x+160}" y2="475" stroke="#22c55e" stroke-width="5"/>
        `).join("")}
      </g>

      <!-- Thousand-Foot High River Wave (过江千尺浪) -->
      <path d="M780,768 Q950,560 1150,600 T1376,640 L1376,768 Z" fill="#0284c7"/>
      <path d="M820,768 Q980,580 1120,620" stroke="#ffffff" stroke-width="8" fill="none" opacity="0.9"/>

      <!-- Red Chinese Seal (风) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 风: 几折弯钩 + 内部撇点 -->
          <path d="M14,14 L41,14 L38,44 Q36,46 32,44"/>
          <line x1="14" y1="14" x2="14" y2="44"/>
          <line x1="22" y1="24" x2="20" y2="34"/>
          <circle cx="28" cy="30" r="1.5" fill="#fff"/>
        </g>
      </g>
    `
  },

  // 6. poem_016 《梅花》 (王安石) - 墙角数枝梅，凌寒独自开
  {
    id: "poem_meihua",
    title: "梅花",
    poemId: "poem_016",
    defs: `
      <linearGradient id="snow_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="50%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
    `,
    content: `
      <!-- Gray Winter Snow Sky -->
      <rect width="1376" height="768" fill="url(#snow_sky)"/>

      <!-- Traditional Chinese Whitewashed Courtyard Wall (墙角) -->
      <g filter="url(#dropShadow)">
        <rect x="180" y="160" width="700" height="500" fill="#f8fafc"/>
        <rect x="160" y="140" width="740" height="30" rx="6" fill="#1e293b"/>
        <rect x="360" y="240" width="160" height="180" rx="8" fill="#334155" stroke="#78350f" stroke-width="12"/>
        <line x1="440" y1="240" x2="440" y2="420" stroke="#78350f" stroke-width="8"/>
        <line x1="360" y1="330" x2="520" y2="330" stroke="#78350f" stroke-width="8"/>
      </g>

      <!-- Snowdrifts on Ground -->
      <path d="M0,640 Q450,580 900,630 T1376,600 L1376,768 L0,768 Z" fill="#ffffff"/>

      <!-- Resilient Plum Blossom Branches (数枝梅，凌寒独自开) -->
      <g filter="url(#dropShadow)">
        <path d="M720,768 C740,560 680,420 840,280 C900,220 1020,180 1140,160" fill="none" stroke="#451a03" stroke-width="22" stroke-linecap="round"/>
        <path d="M780,480 Q880,420 1020,440" fill="none" stroke="#451a03" stroke-width="14" stroke-linecap="round"/>

        <!-- Vibrant Red Winter Plum Blossoms -->
        <g fill="#ef4444">
          <circle cx="780" cy="380" r="18"/><circle cx="770" cy="370" r="14"/><circle cx="790" cy="370" r="14"/><circle cx="780" cy="375" r="7" fill="#fde047"/>
          <circle cx="890" cy="270" r="22"/><circle cx="878" cy="258" r="16"/><circle cx="902" cy="258" r="16"/><circle cx="890" cy="265" r="8" fill="#fde047"/>
          <circle cx="1020" cy="200" r="20"/><circle cx="1008" cy="190" r="15"/><circle cx="1032" cy="190" r="15"/><circle cx="1020" cy="195" r="8" fill="#fde047"/>
          <circle cx="960" cy="430" r="20"/><circle cx="948" cy="420" r="15"/><circle cx="972" cy="420" r="15"/><circle cx="960" cy="425" r="8" fill="#fde047"/>
        </g>
      </g>

      <!-- White Butterfly Guided by Fragrance (暗香来) -->
      <g transform="translate(1080, 260)" filter="url(#softGlow)">
        <ellipse cx="0" cy="0" rx="18" ry="12" fill="#ffffff" transform="rotate(-20 0 0)"/>
        <ellipse cx="24" cy="0" rx="18" ry="12" fill="#ffffff" transform="rotate(20 24 0)"/>
      </g>

      <!-- Red Chinese Seal (梅) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 木字旁 -->
          <line x1="18" y1="12" x2="18" y2="44"/>
          <line x1="12" y1="24" x2="24" y2="24"/>
          <line x1="18" y1="24" x2="12" y2="38"/>
          <line x1="18" y1="24" x2="24" y2="38"/>
          <!-- 每 -->
          <path d="M30,16 L42,16 L34,28 L44,28"/>
          <line x1="30" y1="28" x2="30" y2="44"/>
          <line x1="30" y1="44" x2="44" y2="44"/>
        </g>
      </g>
    `
  },

  // 7. poem_017 《塞下曲》 (卢纶) - 欲将轻骑逐，大雪满弓刀
  {
    id: "poem_saixiaqu",
    title: "塞下曲",
    poemId: "poem_017",
    defs: `
      <linearGradient id="frontier_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="60%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    `,
    content: `
      <!-- Dark Frontier Night Sky (月黑雁飞高) -->
      <rect width="1376" height="768" fill="url(#frontier_sky)"/>

      <!-- Flying Wild Geese in Distant Night Sky -->
      <g fill="#94a3b8" opacity="0.8">
        <path d="M280,140 Q295,130 310,140 Q295,145 280,140 Z"/>
        <path d="M330,120 Q345,110 360,120 Q345,125 330,120 Z"/>
        <path d="M380,150 Q395,140 410,150 Q395,155 380,150 Z"/>
      </g>

      <!-- Snowdrifts on Desert Frontier (大雪满弓刀) -->
      <path d="M0,540 Q350,460 750,520 T1376,480 L1376,768 L0,768 Z" fill="#475569"/>
      <path d="M-50,620 Q450,560 900,600 T1450,560 L1450,768 L-50,768 Z" fill="#f8fafc"/>

      <!-- Brave Chinese Hero on Steed with Bow (欲将轻骑逐) -->
      <g transform="translate(600, 360)" filter="url(#dropShadow)">
        <ellipse cx="140" cy="180" rx="90" ry="50" fill="#78350f"/>
        <circle cx="240" cy="110" r="30" fill="#78350f"/>
        <!-- Chinese Banner Fluttering with Character (汉) in Vector Strokes -->
        <line x1="20" y1="200" x2="20" y2="10" stroke="#78350f" stroke-width="8"/>
        <polygon points="20,20 120,45 20,70" fill="#dc2626"/>
        <g stroke="#fde047" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(35, 26)">
          <!-- 汉: 氵+ 又 -->
          <circle cx="5" cy="10" r="1.5" fill="#fde047"/>
          <circle cx="3" cy="17" r="1.5" fill="#fde047"/>
          <line x1="2" y1="26" x2="7" y2="21"/>
          <path d="M12,12 L24,12 L14,23 L24,34"/>
          <line x1="24" y1="14" x2="14" y2="34"/>
        </g>

        <!-- General in Traditional Chinese Armor -->
        <path d="M90,140 L110,60 L160,60 L180,140 Z" fill="#b91c1c"/>
        <ellipse cx="135" cy="25" rx="32" ry="28" fill="#fed7aa"/>
        <polygon points="135,-30 100,10 170,10" fill="#f59e0b"/>
        <circle cx="135" cy="-30" r="8" fill="#ef4444"/>

        <!-- Drawn Bow with Snowflakes (大雪满弓刀) -->
        <path d="M190,50 Q230,100 190,150" stroke="#f59e0b" stroke-width="8" fill="none"/>
        <line x1="190" y1="50" x2="190" y2="150" stroke="#ffffff" stroke-width="3"/>
      </g>

      <!-- Falling Snow -->
      <g fill="#ffffff" opacity="0.9">
        ${[100, 250, 400, 550, 700, 850, 1000, 1150, 1300].map(x => `
          <circle cx="${x}" cy="${(x*5)%400 + 100}" r="4"/>
          <circle cx="${(x+80)%1376}" cy="${(x*9)%400 + 150}" r="5"/>
        `).join("")}
      </g>
    `
  },

  // 8. poem_018 《山行》 (杜牧) - 停车坐爱枫林晚，霜叶红于二月花
  {
    id: "poem_shanxing",
    title: "山行",
    poemId: "poem_018",
    defs: `
      <linearGradient id="sunset_sx" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="45%" stop-color="#fb923c"/>
        <stop offset="85%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="mapleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
    `,
    content: `
      <!-- Warm Sunset Sky (枫林晚) -->
      <rect width="1376" height="768" fill="url(#sunset_sx)"/>
      <circle cx="1180" cy="150" r="75" fill="#ffffff" opacity="0.8" filter="url(#softGlow)"/>

      <!-- Distant Autumn Hills & Cottages in Clouds (白云生处有人家) -->
      <path d="M0,520 Q350,380 750,460 T1376,410 L1376,768 L0,768 Z" fill="#ea580c" opacity="0.7"/>
      <g fill="#ffffff" opacity="0.85" filter="url(#softGlow)">
        <ellipse cx="880" cy="380" rx="140" ry="35"/>
        <ellipse cx="940" cy="360" rx="90" ry="38"/>
      </g>
      <g transform="translate(880, 340)">
        <polygon points="30,0 0,25 60,25" fill="#78350f"/>
        <rect x="10" y="25" width="40" height="25" fill="#fde68a"/>
      </g>

      <!-- Winding Stony Mountain Path (远上寒山石径斜) -->
      <path d="M0,768 L240,680 Q520,620 720,540 T1100,430 L1180,460 Q760,590 420,720 L300,768 Z" fill="#94a3b8"/>

      <!-- Flaming Red Maple Forest (霜叶红于二月花) -->
      <g filter="url(#dropShadow)">
        <circle cx="220" cy="380" r="120" fill="url(#mapleGrad)"/>
        <circle cx="340" cy="340" r="140" fill="#ef4444"/>
        <circle cx="480" cy="360" r="130" fill="#dc2626"/>
        <circle cx="1180" cy="420" r="140" fill="url(#mapleGrad)"/>
      </g>

      <!-- Traditional Covered Chinese Carriage Parked on Roadside (停车坐爱枫林晚) -->
      <g transform="translate(450, 520)" filter="url(#dropShadow)">
        <rect x="40" y="20" width="140" height="90" rx="12" fill="#78350f"/>
        <polygon points="110,-15 20,25 200,25" fill="#1e293b"/>
        <circle cx="110" cy="115" r="38" fill="#b45309" stroke="#78350f" stroke-width="6"/>
        <circle cx="110" cy="115" r="12" fill="#fde68a"/>
        <rect x="75" y="45" width="45" height="40" rx="4" fill="#fef08a"/>
        <circle cx="95" cy="60" r="12" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (枫) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 木字旁 -->
          <line x1="16" y1="12" x2="16" y2="44"/>
          <line x1="10" y1="24" x2="22" y2="24"/>
          <line x1="16" y1="24" x2="10" y2="38"/>
          <line x1="16" y1="24" x2="22" y2="38"/>
          <!-- 风字旁 -->
          <path d="M28,15 L43,15 L40,43"/>
          <line x1="28" y1="15" x2="28" y2="43"/>
          <line x1="33" y1="23" x2="31" y2="32"/>
        </g>
      </g>
    `
  },

  // 9. poem_019 《江南》 (汉乐府) - 江南可采莲，莲叶何田田。鱼戏莲叶间
  {
    id: "poem_jiangnan",
    title: "江南",
    poemId: "poem_019",
    defs: `
      <linearGradient id="sky_jn" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="water_jn" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <!-- Clear Sunny Jiangnan Sky -->
      <rect width="1376" height="768" fill="url(#sky_jn)"/>
      <circle cx="1200" cy="140" r="65" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Lotus Lake (江南可采莲) -->
      <rect y="380" width="1376" height="388" fill="url(#water_jn)"/>

      <!-- Countless Emerald Lotus Pads Covering Water (莲叶何田田) -->
      <g fill="#22c55e" filter="url(#dropShadow)">
        ${[100, 240, 380, 520, 680, 840, 1000, 1160, 1280].map(x => `
          <ellipse cx="${x}" cy="480" rx="65" ry="28"/>
          <ellipse cx="${x+40}" cy="540" rx="75" ry="32"/>
          <ellipse cx="${x-30}" cy="620" rx="70" ry="30"/>
        `).join("")}
      </g>

      <!-- Playful Red & Golden Koi Fish Swimming Between Leaves (鱼戏莲叶间) -->
      <g filter="url(#dropShadow)">
        <g transform="translate(480, 530) rotate(30)">
          <ellipse cx="0" cy="0" rx="35" ry="14" fill="#ef4444"/>
          <polygon points="-35,0 -55,-15 -55,15" fill="#f97316"/>
        </g>
        <g transform="translate(860, 550) rotate(-40)">
          <ellipse cx="0" cy="0" rx="38" ry="15" fill="#facc15"/>
          <polygon points="-38,0 -60,-16 -60,16" fill="#ea580c"/>
        </g>
      </g>

      <!-- Cute Girl Gathering Lotus in Small Boat -->
      <g transform="translate(620, 360)" filter="url(#dropShadow)">
        <path d="M0,80 C50,130 220,130 270,80 L240,110 C180,135 90,135 30,110 Z" fill="#b45309"/>
        <path d="M100,85 L115,20 L155,20 L170,85 Z" fill="#f472b6"/>
        <ellipse cx="135" cy="-5" rx="26" ry="24" fill="#fde68a"/>
        <circle cx="110" cy="-20" r="10" fill="#1e1b4b"/>
        <circle cx="160" cy="-20" r="10" fill="#1e1b4b"/>
        <circle cx="70" cy="70" r="14" fill="#16a34a"/>
        <circle cx="95" cy="65" r="15" fill="#16a34a"/>
      </g>

      <!-- Red Chinese Seal (江) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 氵 -->
          <circle cx="15" cy="18" r="1.5" fill="#fff"/>
          <circle cx="13" cy="27" r="1.5" fill="#fff"/>
          <line x1="12" y1="40" x2="18" y2="34"/>
          <!-- 工 -->
          <line x1="26" y1="18" x2="42" y2="18"/>
          <line x1="34" y1="18" x2="34" y2="38"/>
          <line x1="24" y1="38" x2="44" y2="38"/>
        </g>
      </g>
    `
  },

  // 10. poem_020 《清明》 (杜牧) - 借问酒家何处有？牧童遥指杏花村
  {
    id: "poem_qingming",
    title: "清明",
    poemId: "poem_020",
    defs: `
      <linearGradient id="rain_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="60%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
    `,
    content: `
      <!-- Spring Drizzle Sky (清明时节雨纷纷) -->
      <rect width="1376" height="768" fill="url(#rain_sky)"/>
      <g stroke="#ffffff" stroke-width="1.8" opacity="0.6" stroke-linecap="round">
        ${[80, 180, 280, 380, 480, 580, 680, 780, 880, 980, 1080, 1180, 1280].map(x => `
          <line x1="${x}" y1="50" x2="${x-40}" y2="180"/>
          <line x1="${x+30}" y1="220" x2="${x-10}" y2="350"/>
          <line x1="${x-20}" y1="400" x2="${x-60}" y2="530"/>
        `).join("")}
      </g>

      <!-- Distant Village with Blooming Apricot Trees (杏花村) -->
      <g transform="translate(1020, 310)" filter="url(#dropShadow)">
        <circle cx="60" cy="40" r="55" fill="#fda4af"/>
        <circle cx="110" cy="30" r="65" fill="#fb7185"/>
        <circle cx="160" cy="50" r="50" fill="#f43f5e"/>
        <!-- Tavern with Wine Banner (酒) -->
        <rect x="70" y="70" width="80" height="70" rx="4" fill="#fed7aa"/>
        <polygon points="110,35 50,75 170,75" fill="#78350f"/>
        <!-- Flying Tavern Wine Flag Banner with Vector Calligraphy (酒) -->
        <line x1="160" y1="75" x2="160" y2="0" stroke="#78350f" stroke-width="5"/>
        <rect x="160" y="5" width="75" height="50" fill="#dc2626"/>
        <g stroke="#fef08a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" transform="translate(175, 12)">
          <!-- 酒: 氵+ 酉 -->
          <circle cx="5" cy="10" r="1.5" fill="#fef08a"/>
          <circle cx="3" cy="18" r="1.5" fill="#fef08a"/>
          <line x1="2" y1="28" x2="7" y2="23"/>
          <rect x="14" y="8" width="22" height="24" rx="2"/>
          <line x1="14" y1="16" x2="36" y2="16"/>
          <line x1="25" y1="16" x2="25" y2="28"/>
        </g>
      </g>

      <!-- Stone Arch Bridge Over Stream -->
      <path d="M0,640 Q350,560 750,610 T1376,580 L1376,768 L0,768 Z" fill="#475569"/>

      <!-- Shepherd Boy on Water Buffalo Pointing with Flute (牧童遥指杏花村) -->
      <g transform="translate(480, 420)" filter="url(#dropShadow)">
        <ellipse cx="140" cy="180" rx="105" ry="65" fill="#334155"/>
        <path d="M220,130 C260,90 280,120 260,150" stroke="#1e293b" stroke-width="12" fill="none" stroke-linecap="round"/>
        <circle cx="230" cy="150" r="28" fill="#334155"/>
        <circle cx="235" cy="145" r="4" fill="#1e293b"/>

        <!-- Shepherd Boy Sitting on Buffalo Back -->
        <polygon points="120,40 60,80 180,80" fill="#d97724"/>
        <ellipse cx="120" cy="80" rx="70" ry="14" fill="#b45309"/>
        <ellipse cx="120" cy="95" rx="28" ry="24" fill="#fed7aa"/>
        <!-- Arm Pointing with Bamboo Flute towards Apricot Village -->
        <line x1="140" y1="110" x2="250" y2="70" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <circle cx="250" cy="70" r="5" fill="#ef4444"/>
      </g>

      <!-- Red Chinese Seal (春) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="38" y2="16"/>
          <line x1="18" y1="23" x2="36" y2="23"/>
          <line x1="13" y1="30" x2="41" y2="30"/>
          <line x1="27" y1="12" x2="14" y2="44"/>
          <line x1="27" y1="30" x2="40" y2="44"/>
          <rect x="22" y="34" width="12" height="12"/>
        </g>
      </g>
    `
  }
];

console.log(`Generating ${POEMS_PART2.length} remaining ancient poem illustrations with vector calligraphy seals...`);

for (const poem of POEMS_PART2) {
  console.log(`\nGenerating poem: ${poem.id} (${poem.title})...`);
  const svgContent = wrapSvg(poem.content, poem.defs);
  const svgPath = path.join(TMP_DIR, `${poem.id}.svg`);
  const jpgPath = path.join(OUTPUT_DIR, `${poem.id}.jpg`);
  const webpPath = path.join(OUTPUT_DIR, `${poem.id}.webp`);

  fs.writeFileSync(svgPath, svgContent);
  execSync(`/Applications/ServBay/bin/magick "${svgPath}" -density 150 -resize 1376x768! -quality 95 "${jpgPath}"`);
  execSync(`/Applications/ServBay/bin/cwebp -q 88 "${jpgPath}" -o "${webpPath}"`);

  const statJpg = fs.statSync(jpgPath);
  const statWebp = fs.statSync(webpPath);
  console.log(`✓ Generated ${poem.id}: JPG (${(statJpg.size/1024).toFixed(1)} KB), WebP (${(statWebp.size/1024).toFixed(1)} KB)`);
}

console.log("\nAll 10 remaining ancient poem illustrations successfully generated!");
