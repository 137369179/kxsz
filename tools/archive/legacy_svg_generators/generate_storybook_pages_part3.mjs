import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_storybook_p3";

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

const STORIES_PART3 = [
  // ==========================================
  // 1. story_monkey_fruit_p1: 青翠的大山里，有一片茂密的大树林
  // ==========================================
  {
    id: "story_monkey_fruit_p1",
    title: "小猴采果子 - 第1页",
    defs: `
      <linearGradient id="lush_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#dcfce7"/>
      </linearGradient>
      <linearGradient id="emerald_forest" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#16a34a"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast Emerald Mountain & Forest (青翠大山，万木葱茏) -->
      <rect width="1376" height="768" fill="url(#lush_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Green Peaks (千层青绿远岫) -->
      <polygon points="0,480 320,200 640,480" fill="#059669" opacity="0.35"/>
      <polygon points="400,480 760,160 1120,480" fill="#047857" opacity="0.45"/>
      <polygon points="860,480 1180,240 1376,480" fill="#065f46" opacity="0.35"/>

      <!-- Dense Forest Layers (密密层层的青翠大树林) -->
      <g filter="url(#dropShadow)">
        <!-- Back row trees -->
        <ellipse cx="260" cy="420" rx="160" ry="100" fill="url(#emerald_forest)"/>
        <ellipse cx="580" cy="400" rx="180" ry="110" fill="url(#emerald_forest)"/>
        <ellipse cx="920" cy="410" rx="170" ry="105" fill="url(#emerald_forest)"/>
        <ellipse cx="1220" cy="430" rx="160" ry="100" fill="url(#emerald_forest)"/>
        <!-- Front row trees with warm highlights -->
        <ellipse cx="420" cy="480" rx="180" ry="110" fill="#22c55e"/>
        <ellipse cx="780" cy="460" rx="200" ry="120" fill="#16a34a"/>
        <ellipse cx="1100" cy="480" rx="180" ry="110" fill="#22c55e"/>
      </g>

      <!-- Forest Floor with Moss & River Stones (林间青草与溪边卵石) -->
      <rect x="0" y="600" width="1376" height="168" fill="#15803d"/>
      <path d="M0,600 Q688,560 1376,600 L1376,768 L0,768 Z" fill="#166534"/>
      <ellipse cx="320" cy="670" rx="70" ry="30" fill="#94a3b8"/>
      <ellipse cx="980" cy="680" rx="80" ry="35" fill="#64748b"/>

      <!-- Red Chinese Seal (林 - 茂林修竹) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 木 on left -->
          <line x1="14" y1="26" x2="27" y2="26"/>
          <line x1="22" y1="14" x2="22" y2="42"/>
          <path d="M22,26 L14,38"/>
          <path d="M22,26 L26,38"/>
          <!-- 木 on right -->
          <line x1="30" y1="26" x2="43" y2="26"/>
          <line x1="37" y1="14" x2="37" y2="42"/>
          <path d="M37,26 L29,38"/>
          <path d="M37,26 L42,38"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. story_monkey_fruit_p2: 高高的苹果树上，结满了红红的大苹果
  // ==========================================
  {
    id: "story_monkey_fruit_p2",
    title: "小猴采果子 - 第2页",
    defs: `
      <linearGradient id="orchard_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="apple_red" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f87171"/>
        <stop offset="50%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Chinese Apple Orchard (硕果累累苹果园，秋阳温暖) -->
      <rect width="1376" height="768" fill="url(#orchard_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Giant Ancient Apple Tree with Heavy Branches (挂满硕大红苹果的老苹果树) -->
      <g filter="url(#dropShadow)">
        <!-- Trunk -->
        <path d="M620,768 L640,420 L720,420 L740,768 Z" fill="#78350f"/>
        <!-- Spreading branches -->
        <path d="M640,460 Q400,400 240,430" stroke="#78350f" stroke-width="26" stroke-linecap="round" fill="none"/>
        <path d="M720,440 Q940,380 1140,410" stroke="#78350f" stroke-width="26" stroke-linecap="round" fill="none"/>
        <path d="M680,420 L680,240" stroke="#78350f" stroke-width="28" stroke-linecap="round"/>

        <!-- Foliage Canopies -->
        <ellipse cx="320" cy="380" rx="180" ry="110" fill="#16a34a"/>
        <ellipse cx="680" cy="240" rx="220" ry="130" fill="#22c55e"/>
        <ellipse cx="1060" cy="360" rx="190" ry="115" fill="#16a34a"/>

        <!-- Big Shiny Red Apples (红彤彤沉甸甸的大苹果) -->
        <g filter="url(#softGlow)">
          <!-- Left branch apples -->
          <circle cx="220" cy="360" r="24" fill="url(#apple_red)"/>
          <ellipse cx="215" cy="350" rx="5" ry="8" fill="#ffffff" opacity="0.6"/>
          <circle cx="340" cy="410" r="26" fill="url(#apple_red)"/>
          <ellipse cx="335" cy="400" rx="5" ry="9" fill="#ffffff" opacity="0.6"/>
          <circle cx="420" cy="350" r="25" fill="url(#apple_red)"/>
          <!-- Center canopy apples -->
          <circle cx="580" cy="260" r="28" fill="url(#apple_red)"/>
          <circle cx="680" cy="180" r="26" fill="url(#apple_red)"/>
          <circle cx="780" cy="250" r="27" fill="url(#apple_red)"/>
          <!-- Right branch apples -->
          <circle cx="960" cy="340" r="26" fill="url(#apple_red)"/>
          <circle cx="1060" cy="390" r="28" fill="url(#apple_red)"/>
          <circle cx="1160" cy="330" r="25" fill="url(#apple_red)"/>
        </g>
      </g>

      <!-- Orchard Green Grass -->
      <rect x="0" y="620" width="1376" height="148" fill="#15803d"/>

      <!-- Red Chinese Seal (果 - 硕果累累) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 日 on top -->
          <rect x="17" y="14" width="22" height="14"/>
          <line x1="17" y1="21" x2="39" y2="21"/>
          <!-- 木 on bottom -->
          <line x1="14" y1="31" x2="42" y2="31"/>
          <line x1="28" y1="28" x2="28" y2="44"/>
          <path d="M28,31 L17,42"/>
          <path d="M28,31 L39,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. story_monkey_fruit_p3: 小猴爬上高树枝，把香甜的果子带回家
  // ==========================================
  {
    id: "story_monkey_fruit_p3",
    title: "小猴采果子 - 第3页",
    defs: `
      <linearGradient id="evening_glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fb923c"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Warm Evening Glow Returning Home (夕阳晚照满载而归) -->
      <rect width="1376" height="768" fill="url(#evening_glow)"/>
      <circle cx="688" cy="220" r="130" fill="#fde047" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Traditional Flying Eaves Cottage in Distance (远方温馨农家茅舍飞檐) -->
      <g transform="translate(950, 360)" filter="url(#dropShadow)">
        <rect x="50" y="120" width="220" height="140" fill="#fed7aa" stroke="#78350f" stroke-width="6"/>
        <polygon points="20,120 160,40 300,120" fill="#78350f"/>
        <rect x="130" y="170" width="60" height="90" fill="#92400e"/>
        <circle cx="180" cy="210" r="5" fill="#facc15"/>
      </g>

      <!-- Tree Branch with Happy Monkey Carrying Woven Bamboo Basket of Apples (挑着竹篮满载甜果的小猴) -->
      <g transform="translate(480, 240)" filter="url(#dropShadow)">
        <!-- Monkey Body -->
        <ellipse cx="80" cy="190" rx="50" ry="65" fill="#b45309"/>
        <ellipse cx="80" cy="195" rx="30" ry="45" fill="#fed7aa"/>

        <!-- Monkey Head -->
        <circle cx="80" cy="90" r="45" fill="#b45309"/>
        <circle cx="35" cy="90" r="16" fill="#fed7aa"/>
        <circle cx="125" cy="90" r="16" fill="#fed7aa"/>
        <path d="M55,55 A18,18 0 0,0 80,78 A18,18 0 0,0 105,55 A22,26 0 0,0 55,55 Z" fill="#fed7aa"/>
        <circle cx="66" cy="72" r="6" fill="#0f172a"/>
        <circle cx="94" cy="72" r="6" fill="#0f172a"/>
        <!-- Big Smiling Laugh -->
        <path d="M68,88 Q80,104 92,88 Z" fill="#dc2626"/>
        <circle cx="56" cy="85" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="104" cy="85" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Holding Woven Bamboo Basket Full of Red Apples (竹编果篮装满红苹果) -->
        <g transform="translate(120, 180)">
          <!-- Basket -->
          <ellipse cx="60" cy="80" rx="55" ry="40" fill="#d97706" stroke="#78350f" stroke-width="4"/>
          <!-- Handle -->
          <path d="M15,70 Q60,10 105,70" stroke="#78350f" stroke-width="6" fill="none"/>
          <!-- Apples inside basket -->
          <circle cx="45" cy="65" r="18" fill="#ef4444"/>
          <circle cx="75" cy="65" r="18" fill="#ef4444"/>
          <circle cx="60" cy="50" r="18" fill="#ef4444"/>
          <ellipse cx="58" cy="46" rx="4" ry="6" fill="#ffffff" opacity="0.6"/>
        </g>
        <!-- Arm holding basket -->
        <path d="M110,170 L170,190" stroke="#b45309" stroke-width="14" stroke-linecap="round"/>
        <!-- Other hand holding an apple to eat -->
        <path d="M50,170 L0,150" stroke="#b45309" stroke-width="14" stroke-linecap="round"/>
        <circle cx="-5" cy="145" r="16" fill="#ef4444"/>
      </g>

      <!-- Red Chinese Seal (归 - 满载而归) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- ⺕ on left -->
          <path d="M22,14 L14,14 L14,26 L22,26 M14,20 L20,20"/>
          <line x1="18" y1="26" x2="18" y2="42"/>
          <!-- 彐 on right -->
          <path d="M38,16 L28,16 L28,30 L38,30 M28,23 L36,23"/>
          <line x1="33" y1="30" x2="33" y2="42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. story_color_magic_p1: 画一朵红红的花，画一片绿绿的草
  // ==========================================
  {
    id: "story_color_magic_p1",
    title: "色彩魔法师 - 第1页",
    defs: `
      <linearGradient id="art_studio" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#ffedd5"/>
      </linearGradient>
    `,
    content: `
      <!-- Traditional Chinese Art Studio (宣纸铺案，丹青妙笔) -->
      <rect width="1376" height="768" fill="url(#art_studio)"/>

      <!-- Large Xuan Paper Scroll on Wooden Desk (长案上的洁白宣纸画卷) -->
      <g transform="translate(240, 260)" filter="url(#dropShadow)">
        <rect x="0" y="160" width="896" height="348" rx="8" fill="#78350f"/>
        <rect x="10" y="150" width="876" height="40" rx="6" fill="#92400e"/>

        <!-- Xuan Paper Scroll Unrolled (铺展的宣纸卷轴) -->
        <rect x="60" y="40" width="776" height="240" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>

        <!-- Hand-painted Crimson Peony & Lush Grass on Paper (纸上画出的红花与青草) -->
        <g transform="translate(240, 80)" filter="url(#softGlow)">
          <!-- Painted Red Peony -->
          <circle cx="140" cy="70" r="32" fill="#ef4444"/>
          <circle cx="120" cy="60" r="22" fill="#f43f5e"/>
          <circle cx="160" cy="60" r="22" fill="#f43f5e"/>
          <circle cx="140" cy="50" r="18" fill="#f87171"/>
          <circle cx="140" cy="70" r="10" fill="#facc15"/>
          <!-- Painted Green Grass (青翠绿草) -->
          <path d="M260,110 Q280,30 310,20 Q290,70 280,110 Z" fill="#16a34a"/>
          <path d="M290,110 Q320,40 350,30 Q330,80 310,110 Z" fill="#22c55e"/>
          <path d="M330,110 Q360,50 390,40 Q370,85 350,110 Z" fill="#16a34a"/>
        </g>
      </g>

      <!-- Little Chinese Painter Holding Chinese Brush (执毛笔作画的可爱中国小画家) -->
      <g transform="translate(320, 160)" filter="url(#dropShadow)">
        <path d="M40,160 L150,160 L165,360 L25,360 Z" fill="#0284c7"/>
        <circle cx="95" cy="95" r="44" fill="#fed7aa"/>
        <!-- Double buns with red ribbons -->
        <circle cx="60" cy="60" r="16" fill="#1e293b"/>
        <circle cx="130" cy="60" r="16" fill="#1e293b"/>
        <circle cx="60" cy="60" r="5" fill="#ef4444"/>
        <circle cx="130" cy="60" r="5" fill="#ef4444"/>
        <path d="M65,85 Q95,65 125,85" fill="#1e293b"/>
        <!-- Happy focused smile -->
        <circle cx="82" cy="95" r="5" fill="#0f172a"/>
        <circle cx="108" cy="95" r="5" fill="#0f172a"/>
        <path d="M86,115 Q95,124 104,115" stroke="#ef4444" stroke-width="3" fill="none"/>
        <circle cx="72" cy="108" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="118" cy="108" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Hand Holding Brush Dipping in Paint -->
        <line x1="140" y1="180" x2="220" y2="130" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <polygon points="220,130 238,120 230,135" fill="#ef4444"/>
      </g>

      <!-- Porcelain Paint Palette with Ink & Colors (青花瓷调色碟与朱砂石绿) -->
      <g transform="translate(960, 480)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="50" rx="70" ry="35" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <circle cx="45" cy="45" r="14" fill="#ef4444"/>
        <circle cx="80" cy="40" r="14" fill="#22c55e"/>
        <circle cx="115" cy="45" r="14" fill="#38bdf8"/>
        <circle cx="80" cy="60" r="14" fill="#eab308"/>
      </g>

      <!-- Red Chinese Seal (丹 - 丹青妙笔) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 丹 -->
          <rect x="16" y="15" width="24" height="28"/>
          <line x1="16" y1="28" x2="40" y2="28"/>
          <circle cx="28" cy="34" r="1" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. story_color_magic_p2: 蓝蓝的天空上，飘着雪白的小云朵
  // ==========================================
  {
    id: "story_color_magic_p2",
    title: "色彩魔法师 - 第2页",
    defs: `
      <linearGradient id="azure_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="60%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
    `,
    content: `
      <!-- Pure Azure Blue Sky with Painted Ruyi Clouds (碧空如洗，如意祥云飘逸) -->
      <rect width="1376" height="768" fill="url(#azure_sky)"/>
      <circle cx="1180" cy="140" r="75" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Magical Floating Traditional Chinese Clouds (神笔画出的如意祥云) -->
      <g fill="#ffffff" filter="url(#softGlow)" opacity="0.95">
        <!-- Center Cloud with Ruyi Curls -->
        <ellipse cx="688" cy="320" rx="180" ry="70"/>
        <circle cx="610" cy="270" r="65"/>
        <circle cx="760" cy="270" r="70"/>
        <path d="M540,320 Q480,310 490,270 Q510,240 550,260" stroke="#38bdf8" stroke-width="4" fill="none"/>
        <path d="M830,320 Q890,310 880,270 Q860,240 820,260" stroke="#38bdf8" stroke-width="4" fill="none"/>

        <!-- Left Cloud -->
        <ellipse cx="260" cy="220" rx="140" ry="55"/>
        <circle cx="210" cy="180" r="50"/>
        <circle cx="310" cy="180" r="55"/>

        <!-- Right Cloud -->
        <ellipse cx="1100" cy="240" rx="150" ry="60"/>
        <circle cx="1040" cy="200" r="55"/>
        <circle cx="1160" cy="200" r="60"/>
      </g>

      <!-- Giant Paintbrush Leaving Rainbow Trail in Sky (彩笔生辉，天际画虹) -->
      <g transform="translate(380, 480)" filter="url(#dropShadow)">
        <!-- Rainbow Stroke Trail -->
        <path d="M-100,100 Q200,0 520,30" stroke="#f43f5e" stroke-width="12" fill="none" opacity="0.8"/>
        <path d="M-90,115 Q210,15 530,45" stroke="#facc15" stroke-width="12" fill="none" opacity="0.8"/>
        <path d="M-80,130 Q220,30 540,60" stroke="#22c55e" stroke-width="12" fill="none" opacity="0.8"/>

        <!-- Chinese Paintbrush Floating Joyfully -->
        <line x1="520" y1="30" x2="680" y2="-70" stroke="#78350f" stroke-width="14" stroke-linecap="round"/>
        <polygon points="520,30 500,45 510,20" fill="#ffffff"/>
      </g>

      <!-- Red Chinese Seal (青 - 碧空万里) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 青 -->
          <line x1="16" y1="16" x2="38" y2="16"/>
          <line x1="16" y1="22" x2="38" y2="22"/>
          <line x1="27" y1="12" x2="27" y2="28"/>
          <line x1="14" y1="28" x2="40" y2="28"/>
          <!-- 月 below -->
          <rect x="18" y="31" width="18" height="13"/>
          <line x1="18" y1="37" x2="36" y2="37"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. story_flower_garden_p1: 春天来了，红花绿草从泥土里钻出来
  // ==========================================
  {
    id: "story_flower_garden_p1",
    title: "美丽的大花园 - 第1页",
    defs: `
      <linearGradient id="spring_garden_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <!-- Spring Awakening in Classical Jiangnan Garden (江南名园春意闹，红花破土) -->
      <rect width="1376" height="768" fill="url(#spring_garden_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Chinese Garden Courtyard Wall with Round Moon Gate (中式粉墙黛瓦月亮门) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="280" width="1376" height="488" fill="#f8fafc"/>
        <path d="M0,280 L1376,280 L1376,305 L0,305 Z" fill="#64748b"/>
        <path d="M60,280 L1316,280 L1376,250 L0,250 Z" fill="#334155"/>
        <!-- Moon Gate -->
        <path d="M520,768 L520,520 A168,168 0 0,1 856,520 L856,768 Z" fill="#e2e8f0"/>
      </g>

      <!-- Moist Fertile Soil with Sprouting Shoots & Red Flower Buds (滋润泥土，花草初萌) -->
      <path d="M0,580 Q688,520 1376,580 L1376,768 L0,768 Z" fill="#78350f"/>
      <path d="M0,640 Q688,590 1376,640 L1376,768 L0,768 Z" fill="#451a03"/>

      <!-- Blooming Red Flowers Emerging from Soil (钻出泥土的鲜艳红花) -->
      <g filter="url(#dropShadow)">
        <!-- Center cluster -->
        <path d="M688,560 L688,480" stroke="#16a34a" stroke-width="8" stroke-linecap="round"/>
        <circle cx="688" cy="460" r="26" fill="#ef4444" filter="url(#softGlow)"/>
        <circle cx="670" cy="450" r="16" fill="#f43f5e"/>
        <circle cx="706" cy="450" r="16" fill="#f43f5e"/>
        <circle cx="688" cy="460" r="8" fill="#facc15"/>
        <!-- Tender green leaves -->
        <path d="M688,520 Q650,500 630,520" stroke="#22c55e" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M688,500 Q720,480 740,500" stroke="#22c55e" stroke-width="6" stroke-linecap="round" fill="none"/>

        <!-- Left cluster -->
        <path d="M380,580 L380,510" stroke="#16a34a" stroke-width="6" stroke-linecap="round"/>
        <circle cx="380" cy="495" r="22" fill="#ec4899" filter="url(#softGlow)"/>
        <!-- Right cluster -->
        <path d="M980,590 L980,520" stroke="#16a34a" stroke-width="6" stroke-linecap="round"/>
        <circle cx="980" cy="505" r="22" fill="#f59e0b" filter="url(#softGlow)"/>
      </g>

      <!-- Red Chinese Seal (春 - 春意盎然) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 三横 + 撇捺 + 日 -->
          <line x1="16" y1="16" x2="38" y2="16"/>
          <line x1="18" y1="21" x2="36" y2="21"/>
          <line x1="14" y1="26" x2="40" y2="26"/>
          <path d="M36,17 L16,42"/>
          <path d="M26,26 L38,42"/>
          <rect x="22" y="30" width="12" height="12"/>
          <line x1="22" y1="36" x2="34" y2="36"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. story_flower_garden_p2: 高大树木喝饱雨水，伸展出绿油油树叶
  // ==========================================
  {
    id: "story_flower_garden_p2",
    title: "美丽的大花园 - 第2页",
    defs: `
      <linearGradient id="rain_refreshed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <!-- Rain Refreshed Giant Garden Tree (春雨滋润，古槐抽绿浓荫展) -->
      <rect width="1376" height="768" fill="url(#rain_refreshed)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Giant Ancient Scholar Tree (古槐大树伸展满树翠绿新叶) -->
      <g filter="url(#dropShadow)">
        <!-- Trunk -->
        <path d="M600,768 L640,380 L720,380 L760,768 Z" fill="#78350f"/>
        <path d="M640,420 Q440,360 260,390" stroke="#78350f" stroke-width="26" stroke-linecap="round" fill="none"/>
        <path d="M720,400 Q920,340 1120,370" stroke="#78350f" stroke-width="26" stroke-linecap="round" fill="none"/>

        <!-- Dense Emerald Green Leaves (绿油油生机盎然的枝叶) -->
        <ellipse cx="680" cy="220" rx="260" ry="140" fill="#16a34a"/>
        <ellipse cx="360" cy="340" rx="190" ry="110" fill="#22c55e"/>
        <ellipse cx="1020" cy="320" rx="200" ry="115" fill="#22c55e"/>
        <ellipse cx="680" cy="180" rx="180" ry="90" fill="#4ade80"/>

        <!-- Glistening Rain Droplets on Leaves (树叶上晶莹剔透的水珠) -->
        <g fill="#ffffff" opacity="0.85" filter="url(#softGlow)">
          <circle cx="420" cy="310" r="8"/>
          <circle cx="580" cy="220" r="9"/>
          <circle cx="760" cy="200" r="9"/>
          <circle cx="940" cy="280" r="8"/>
        </g>
      </g>

      <!-- Lush Garden Grass -->
      <rect x="0" y="640" width="1376" height="128" fill="#15803d"/>

      <!-- Red Chinese Seal (润 - 雨润春生) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 氵 on left -->
          <circle cx="16" cy="18" r="1" fill="#ffffff"/>
          <circle cx="14" cy="28" r="1" fill="#ffffff"/>
          <path d="M15,40 L20,34"/>
          <!-- 闰 on right (门 + 王) -->
          <line x1="24" y1="18" x2="24" y2="42"/>
          <path d="M24,18 L40,18 L40,42"/>
          <line x1="29" y1="26" x2="35" y2="26"/>
          <line x1="29" y1="31" x2="35" y2="31"/>
          <line x1="27" y1="37" x2="37" y2="37"/>
          <line x1="32" y1="26" x2="32" y2="37"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. story_forest_animals_p1: 天上小鸟欢快唱歌，树下小虫草地跳舞
  // ==========================================
  {
    id: "story_forest_animals_p1",
    title: "森林里的小动物 - 第1页",
    defs: `
      <linearGradient id="bird_cricket_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#d9f99d"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Chinese Forest Glade (林籁泉韵，喜鹊欢鸣蟋蟀起舞) -->
      <rect width="1376" height="768" fill="url(#bird_cricket_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Willow Tree Branch on Top (依依杨柳枝) -->
      <path d="M100,120 Q500,80 900,160" stroke="#78350f" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M300,110 Q320,240 300,340 M600,130 Q620,260 600,360" stroke="#16a34a" stroke-width="4" stroke-linecap="round" fill="none"/>

      <!-- Joyful Singing Chinese Magpie Birds on Branch (枝头欢快对唱的吉祥喜鹊) -->
      <g transform="translate(420, 40)" filter="url(#dropShadow)">
        <ellipse cx="50" cy="50" rx="30" ry="20" fill="#0284c7"/>
        <circle cx="75" cy="40" r="18" fill="#0284c7"/>
        <polygon points="90,36 104,40 90,46" fill="#f97316"/>
        <circle cx="78" cy="38" r="3" fill="#ffffff"/>
        <!-- Open singing beak & music notes -->
        <circle cx="115" cy="20" r="5" fill="#f59e0b"/>
        <line x1="120" y1="20" x2="120" y2="0" stroke="#f59e0b" stroke-width="3"/>
      </g>

      <!-- Grassy Lawn with Cute Cricket Dancing (草丛中欢快跳跃的小蟋蟀) -->
      <rect x="0" y="560" width="1376" height="208" fill="#15803d"/>
      <path d="M0,560 Q688,510 1376,560 L1376,768 L0,768 Z" fill="#16a34a"/>

      <!-- Dancing Cute Cartoon Cricket (身着绿衣欢快起舞的可爱小蟋蟀) -->
      <g transform="translate(620, 510)" filter="url(#dropShadow)">
        <!-- Cricket Body -->
        <ellipse cx="60" cy="60" rx="35" ry="22" fill="#65a30d"/>
        <circle cx="95" cy="50" r="18" fill="#84cc16"/>
        <!-- Big Cute Eyes -->
        <circle cx="98" cy="46" r="5" fill="#0f172a"/>
        <circle cx="100" cy="44" r="1.5" fill="#ffffff"/>
        <!-- Long Curved Antennae (长长的灵动触角) -->
        <path d="M105,40 Q130,10 150,5" stroke="#65a30d" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M105,45 Q130,25 160,30" stroke="#65a30d" stroke-width="3" stroke-linecap="round" fill="none"/>
        <!-- Dancing Springing Legs (跃跃欲跳的细长后腿) -->
        <path d="M40,65 L10,35 L0,75" stroke="#4d7c0f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M50,65 L25,40 L18,78" stroke="#4d7c0f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </g>

      <!-- Red Chinese Seal (鸣 - 百鸟争鸣) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 口 on left -->
          <rect x="14" y="22" width="11" height="12"/>
          <!-- 鸟 on right -->
          <path d="M30,15 L40,15 L36,25 L41,25 L38,40 L28,40"/>
          <line x1="28" y1="25" x2="38" y2="25"/>
          <circle cx="34" cy="20" r="1" fill="#ffffff"/>
          <line x1="26" y1="44" x2="42" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 9. story_forest_animals_p2: 小马在大地奔跑，小牛小羊悠闲吃草
  // ==========================================
  {
    id: "story_forest_animals_p2",
    title: "森林里的小动物 - 第2页",
    defs: `
      <linearGradient id="pasture_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Vast Pastoral Grassland (风吹草低见牛羊，白马奔腾) -->
      <rect width="1376" height="768" fill="url(#pasture_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Hills (水草丰美远山) -->
      <path d="M0,450 Q400,360 800,430 T1376,400 L1376,768 L0,768 Z" fill="#86efac"/>
      <path d="M0,520 Q688,460 1376,520 L1376,768 L0,768 Z" fill="#22c55e"/>

      <!-- Galloping Handsome White Horse (奔腾矫健的白马) -->
      <g transform="translate(680, 310)" filter="url(#dropShadow)">
        <ellipse cx="110" cy="110" rx="75" ry="45" fill="#ffffff"/>
        <!-- Mane and Head -->
        <path d="M160,95 L200,40 L220,55 L180,110 Z" fill="#ffffff"/>
        <circle cx="210" cy="45" r="5" fill="#0f172a"/>
        <!-- Galloping Legs -->
        <path d="M70,140 L30,200 M90,140 L110,210 M150,140 L190,190 M170,140 L220,180" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>
        <!-- Flowing White Tail -->
        <path d="M40,105 Q-20,100 -40,130" stroke="#ffffff" stroke-width="10" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Peaceful Grazing Little Calf & Lamb (悠闲吃草的可爱小牛与小羊) -->
      <!-- Little Calf on Left -->
      <g transform="translate(180, 440)" filter="url(#dropShadow)">
        <ellipse cx="80" cy="90" rx="60" ry="40" fill="#d97706"/>
        <circle cx="135" cy="65" r="28" fill="#d97706"/>
        <!-- Horns -->
        <path d="M125,45 Q120,35 115,35 M145,45 Q150,35 155,35" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <!-- Cute face -->
        <ellipse cx="145" cy="72" rx="14" ry="10" fill="#fed7aa"/>
        <circle cx="132" cy="62" r="4" fill="#0f172a"/>
      </g>

      <!-- Fluffy White Lamb Beside It -->
      <g transform="translate(360, 470)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="75" rx="48" ry="36" fill="#f8fafc"/>
        <circle cx="35" cy="55" r="24" fill="#f8fafc"/>
        <circle cx="100" cy="55" r="24" fill="#f8fafc"/>
        <circle cx="60" cy="45" r="26" fill="#f8fafc"/>
        <!-- Lamb Head -->
        <ellipse cx="105" cy="65" rx="18" ry="14" fill="#fed7aa"/>
        <circle cx="108" cy="62" r="3.5" fill="#0f172a"/>
      </g>

      <!-- Red Chinese Seal (牧 - 草原放牧) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 牛 on left -->
          <line x1="14" y1="20" x2="26" y2="20"/>
          <line x1="12" y1="26" x2="28" y2="26"/>
          <line x1="20" y1="14" x2="20" y2="42"/>
          <path d="M20,26 L13,38"/>
          <!-- 攵 on right -->
          <path d="M33,16 L29,24"/>
          <line x1="28" y1="24" x2="42" y2="24"/>
          <path d="M36,24 L28,42"/>
          <path d="M34,32 L42,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 10. story_busy_bee_p1: 小蜜蜂展翅飞，飞到花丛中采蜜忙
  // ==========================================
  {
    id: "story_busy_bee_p1",
    title: "爱劳动的小蜜蜂 - 第1页",
    defs: `
      <linearGradient id="bee_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
      <linearGradient id="golden_chrysanthemum" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="60%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#eab308"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Golden Blossom Garden in Sunny Radiance (春华秋实，蜜蜂采蜜忙) -->
      <rect width="1376" height="768" fill="url(#bee_sky)"/>
      <circle cx="1180" cy="140" r="75" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Giant Golden Chinese Chrysanthemums & Peonies (雍容盛放的金丝皇菊与牡丹) -->
      <g filter="url(#dropShadow)">
        <!-- Big Chrysanthemum Center -->
        <g transform="translate(688, 440)">
          <!-- Stem & Leaves -->
          <path d="M0,200 L0,0" stroke="#16a34a" stroke-width="14" stroke-linecap="round"/>
          <path d="M0,100 Q-60,70 -80,90" stroke="#22c55e" stroke-width="8" stroke-linecap="round" fill="none"/>
          <path d="M0,60 Q60,30 80,50" stroke="#22c55e" stroke-width="8" stroke-linecap="round" fill="none"/>
          <!-- Layers of Golden Petals (层叠金菊) -->
          <circle cx="0" cy="0" r="90" fill="url(#golden_chrysanthemum)"/>
          <circle cx="0" cy="0" r="65" fill="#f59e0b"/>
          <circle cx="0" cy="0" r="40" fill="#d97706"/>
          <circle cx="0" cy="0" r="20" fill="#78350f"/>
        </g>
        <!-- Pink Peony Left -->
        <g transform="translate(320, 500)">
          <circle cx="0" cy="0" r="80" fill="#f472b6"/>
          <circle cx="0" cy="0" r="55" fill="#ec4899"/>
          <circle cx="0" cy="0" r="30" fill="#db2777"/>
          <circle cx="0" cy="0" r="14" fill="#facc15"/>
        </g>
        <!-- Purple Flower Right -->
        <g transform="translate(1060, 510)">
          <circle cx="0" cy="0" r="75" fill="#c084fc"/>
          <circle cx="0" cy="0" r="50" fill="#a855f7"/>
          <circle cx="0" cy="0" r="25" fill="#7e22ce"/>
          <circle cx="0" cy="0" r="12" fill="#facc15"/>
        </g>
      </g>

      <!-- Adorable Hardworking Chinese Bee Hovering Above Flower (振翅勤劳采蜜的萌蜜蜂) -->
      <g transform="translate(540, 200)" filter="url(#dropShadow)">
        <!-- Translucent Shimmering Wings (晶莹剔透的飞舞小薄翅) -->
        <ellipse cx="60" cy="30" rx="36" ry="18" fill="#ffffff" opacity="0.8" transform="rotate(-30, 60, 30)" filter="url(#softGlow)"/>
        <ellipse cx="100" cy="30" rx="36" ry="18" fill="#ffffff" opacity="0.8" transform="rotate(30, 100, 30)" filter="url(#softGlow)"/>

        <!-- Bee Chubby Body with Yellow & Black Stripes (圆滚滚的黄黑条纹身体) -->
        <ellipse cx="80" cy="85" rx="55" ry="42" fill="#facc15"/>
        <!-- Black stripes -->
        <path d="M65,45 L65,125" stroke="#1e293b" stroke-width="12"/>
        <path d="M95,45 L95,125" stroke="#1e293b"/>

        <!-- Cute Smiling Face -->
        <circle cx="40" cy="80" r="30" fill="#facc15"/>
        <circle cx="32" cy="74" r="5" fill="#0f172a"/>
        <circle cx="34" cy="72" r="1.5" fill="#ffffff"/>
        <path d="M26,88 Q36,96 46,88" stroke="#dc2626" stroke-width="3" fill="none"/>
        <circle cx="24" cy="84" r="6" fill="#fca5a5" opacity="0.7"/>

        <!-- Antennae with Golden Balls (头顶金球小触角) -->
        <path d="M30,55 Q20,35 15,35" stroke="#1e293b" stroke-width="3" fill="none"/>
        <circle cx="15" cy="35" r="4" fill="#f59e0b"/>
        <path d="M40,55 Q35,35 30,35" stroke="#1e293b" stroke-width="3" fill="none"/>
        <circle cx="30" cy="35" r="4" fill="#f59e0b"/>

        <!-- Little Honey Pail in Paws (双手提着的小巧蜜桶) -->
        <ellipse cx="80" cy="130" rx="14" ry="18" fill="#d97706"/>
        <ellipse cx="80" cy="115" rx="12" ry="6" fill="#fef08a"/>
      </g>

      <!-- Red Chinese Seal (勤 - 业精于勤) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 堇 on left -->
          <line x1="14" y1="16" x2="27" y2="16"/>
          <line x1="20" y1="12" x2="20" y2="20"/>
          <rect x="15" y="20" width="10" height="8"/>
          <line x1="14" y1="32" x2="27" y2="32"/>
          <line x1="20" y1="28" x2="20" y2="44"/>
          <line x1="13" y1="44" x2="28" y2="44"/>
          <!-- 力 on right -->
          <path d="M33,18 L43,18 L43,30 Q43,34 38,34"/>
          <path d="M39,14 L30,44"/>
        </g>
      </g>
    `
  }
];

console.log(`Rendering ${STORIES_PART3.length} storybook part 3 illustrations...`);

for (const item of STORIES_PART3) {
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

console.log("\nAll 10 storybook part 3 illustrations generated successfully!");
