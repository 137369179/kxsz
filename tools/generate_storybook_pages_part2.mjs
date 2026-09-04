import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_storybook_p2";

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

const STORIES_PART2 = [
  // ==========================================
  // 1. story_monkey_mountain_p1: 小猴子爬上高山，向上看是蓝天，向下看是大地
  // ==========================================
  {
    id: "story_monkey_mountain_p1",
    title: "小猴子上山去 - 第1页",
    defs: `
      <linearGradient id="peak_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
      <linearGradient id="rock_cliff" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="60%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast Cerulean Sky at Mountain Summit (绝顶蔚蓝长空与白云) -->
      <rect width="1376" height="768" fill="url(#peak_sky)"/>
      <circle cx="1150" cy="140" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Floating Sea of Clouds below (脚下翻滚的云海) -->
      <g fill="#ffffff" opacity="0.85" filter="url(#softGlow)">
        <ellipse cx="200" cy="520" rx="220" ry="70"/>
        <ellipse cx="500" cy="540" rx="260" ry="80"/>
        <ellipse cx="850" cy="510" rx="240" ry="75"/>
        <ellipse cx="1200" cy="530" rx="220" ry="70"/>
      </g>

      <!-- Distant Vast Earth and Valley (向下俯瞰苍茫沃野) -->
      <path d="M0,580 Q688,520 1376,580 L1376,768 L0,768 Z" fill="#15803d" opacity="0.7"/>

      <!-- Giant Ancient Cliff Rock (险峻苍劲的青石绝壁) -->
      <g filter="url(#dropShadow)">
        <polygon points="0,768 0,420 220,360 480,440 560,768" fill="url(#rock_cliff)"/>
        <!-- Cliff Crevices & Small Pine (崖壁绝壁青松) -->
        <path d="M120,440 L280,520 L240,680" stroke="#1e293b" stroke-width="6" fill="none"/>
        <path d="M220,360 Q340,310 420,330" stroke="#78350f" stroke-width="14" stroke-linecap="round" fill="none"/>
        <ellipse cx="380" cy="320" rx="60" ry="30" fill="#16a34a"/>
      </g>

      <!-- Little Monkey Reaching the Peak Looking Up at Sky (登顶远眺的聪明灵动小猴) -->
      <g transform="translate(240, 200)" filter="url(#dropShadow)">
        <!-- Monkey Long Curly Tail -->
        <path d="M-20,160 Q-80,180 -70,120 Q-60,80 -20,110" stroke="#b45309" stroke-width="12" stroke-linecap="round" fill="none"/>

        <!-- Monkey Body in Cute Traditional Yellow Scarf -->
        <ellipse cx="50" cy="150" rx="42" ry="55" fill="#b45309"/>
        <ellipse cx="50" cy="155" rx="26" ry="38" fill="#fed7aa"/>
        <!-- Yellow Scarf -->
        <path d="M20,110 Q50,130 80,110 L75,140 Q50,130 25,140 Z" fill="#facc15"/>

        <!-- Monkey Head with Heart Snout (桃子脸小猴) -->
        <circle cx="50" cy="65" r="40" fill="#b45309"/>
        <path d="M30,35 A16,16 0 0,0 50,55 A16,16 0 0,0 70,35 A18,22 0 0,0 30,35 Z" fill="#fed7aa"/>
        <!-- Big Round Ears with Pink Insides -->
        <circle cx="10" cy="65" r="16" fill="#b45309"/>
        <circle cx="10" cy="65" r="9" fill="#fed7aa"/>
        <circle cx="90" cy="65" r="16" fill="#b45309"/>
        <circle cx="90" cy="65" r="9" fill="#fed7aa"/>

        <!-- Inquisitive Face Looking Upward at the Sky -->
        <circle cx="38" cy="52" r="5" fill="#0f172a"/>
        <circle cx="39" cy="50" r="1.5" fill="#ffffff"/>
        <circle cx="62" cy="52" r="5" fill="#0f172a"/>
        <circle cx="63" cy="50" r="1.5" fill="#ffffff"/>
        <circle cx="50" cy="64" r="3" fill="#78350f"/>
        <path d="M42,72 Q50,78 58,72" stroke="#dc2626" stroke-width="2.5" fill="none"/>

        <!-- Little Hand Shading Eyes Looking to the Horizon (手搭凉棚眺望远方) -->
        <path d="M60,110 L90,40" stroke="#b45309" stroke-width="12" stroke-linecap="round"/>
        <circle cx="90" cy="38" r="8" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (登 - 勇攀高峰) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 癶 on top -->
          <path d="M16,15 L26,15 L22,23"/>
          <line x1="20" y1="18" x2="16" y2="24"/>
          <path d="M38,15 L28,15 L32,23"/>
          <line x1="34" y1="18" x2="38" y2="24"/>
          <!-- 豆 below -->
          <line x1="16" y1="26" x2="38" y2="26"/>
          <rect x="20" y="29" width="14" height="8"/>
          <line x1="27" y1="37" x2="27" y2="43"/>
          <line x1="14" y1="43" x2="40" y2="43"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. story_monkey_mountain_p2: 向左大森林，向右清清小河，中间开满鲜花
  // ==========================================
  {
    id: "story_monkey_mountain_p2",
    title: "小猴子上山去 - 第2页",
    defs: `
      <linearGradient id="valley_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="river_stream" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    `,
    content: `
      <!-- Panoramic View: Forest on Left, River on Right, Flower Meadow in Center (左林右溪花锦簇) -->
      <rect width="1376" height="768" fill="url(#valley_sky)"/>
      <circle cx="688" cy="160" r="80" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Hills (远山如黛) -->
      <path d="M0,380 Q340,280 688,360 T1376,340 L1376,768 L0,768 Z" fill="#86efac" opacity="0.6"/>

      <!-- Dense Forest on the Left (左侧郁郁葱葱的大森林) -->
      <g filter="url(#dropShadow)">
        <polygon points="60,560 140,300 220,560" fill="#15803d"/>
        <polygon points="140,580 230,340 320,580" fill="#166534"/>
        <polygon points="0,600 80,360 160,600" fill="#14532d"/>
        <ellipse cx="140" cy="380" rx="90" ry="70" fill="#22c55e" opacity="0.9"/>
        <ellipse cx="230" cy="420" rx="80" ry="60" fill="#15803d" opacity="0.9"/>
      </g>

      <!-- Clear Meandering River on the Right (右侧蜿蜒流淌的清清小河) -->
      <path d="M960,360 Q1050,480 1100,560 T1376,768 L1120,768 Q920,600 880,480 T960,360 Z" fill="url(#river_stream)" filter="url(#dropShadow)"/>
      <path d="M1020,440 Q1080,540 1160,640" stroke="#ffffff" stroke-width="4" stroke-dasharray="16,12" fill="none" opacity="0.8"/>

      <!-- Center Meadow Full of Blooming Flowers (中间开满绚丽的五彩鲜花) -->
      <path d="M300,520 Q688,460 920,520 L980,768 L260,768 Z" fill="#86efac"/>
      <!-- Flower Dots -->
      <circle cx="480" cy="620" r="14" fill="#ef4444"/>
      <circle cx="480" cy="620" r="6" fill="#facc15"/>
      <circle cx="560" cy="660" r="16" fill="#f43f5e"/>
      <circle cx="560" cy="660" r="7" fill="#ffffff"/>
      <circle cx="680" cy="600" r="18" fill="#a855f7"/>
      <circle cx="680" cy="600" r="8" fill="#fef08a"/>
      <circle cx="760" cy="650" r="15" fill="#f97316"/>
      <circle cx="760" cy="650" r="6" fill="#facc15"/>
      <circle cx="840" cy="610" r="14" fill="#ec4899"/>
      <circle cx="840" cy="610" r="6" fill="#ffffff"/>

      <!-- Happy Little Monkey Enjoying the Beautiful Scene (手舞足蹈欢呼的小猴) -->
      <g transform="translate(620, 430)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="150" rx="42" ry="55" fill="#b45309"/>
        <circle cx="60" cy="65" r="38" fill="#b45309"/>
        <circle cx="20" cy="65" r="14" fill="#fed7aa"/>
        <circle cx="100" cy="65" r="14" fill="#fed7aa"/>
        <path d="M40,35 A16,16 0 0,0 60,55 A16,16 0 0,0 80,35 A18,22 0 0,0 40,35 Z" fill="#fed7aa"/>
        <circle cx="48" cy="50" r="5" fill="#0f172a"/>
        <circle cx="72" cy="50" r="5" fill="#0f172a"/>
        <!-- Happy Laughing Smile -->
        <path d="M50,64 Q60,76 70,64 Z" fill="#dc2626"/>
        <!-- Joyful Open Arms -->
        <path d="M30,110 L-20,70" stroke="#b45309" stroke-width="12" stroke-linecap="round"/>
        <path d="M90,110 L140,70" stroke="#b45309" stroke-width="12" stroke-linecap="round"/>
        <circle cx="-22" cy="70" r="8" fill="#fed7aa"/>
        <circle cx="142" cy="70" r="8" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (远 - 极目远眺) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 袁 on inside -->
          <line x1="26" y1="16" x2="38" y2="16"/>
          <rect x="27" y="21" width="10" height="7"/>
          <line x1="23" y1="32" x2="41" y2="32"/>
          <path d="M29,32 L25,41"/>
          <path d="M35,32 L40,41"/>
          <!-- 辶 on outside -->
          <circle cx="16" cy="16" r="1" fill="#ffffff"/>
          <path d="M14,24 L20,24 L14,32 L20,32 L13,42 L42,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. story_good_friends_p1: 最要好的好朋友，手拉手去上学
  // ==========================================
  {
    id: "story_good_friends_p1",
    title: "我的好朋友 - 第1页",
    defs: `
      <linearGradient id="school_morning" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Morning Road to Chinese School (朝阳迎旭日，相伴步学堂) -->
      <rect width="1376" height="768" fill="url(#school_morning)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Willow Trees & Chinese Courtyard Wall (绿柳垂绦与白墙黛瓦) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="320" width="1376" height="448" fill="#f1f5f9"/>
        <path d="M0,320 L1376,320 L1376,345 L0,345 Z" fill="#64748b"/>
        <path d="M80,320 L1296,320 L1376,290 L0,290 Z" fill="#334155"/>
        <!-- Weeping Willow Branches (垂柳轻拂) -->
        <path d="M120,200 Q200,320 180,450 M160,220 Q240,340 220,480" stroke="#16a34a" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M1180,200 Q1120,320 1140,460 M1240,210 Q1180,330 1200,480" stroke="#16a34a" stroke-width="4" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Flagstone Path to School (整洁宽阔的青石板路) -->
      <rect x="0" y="580" width="1376" height="188" fill="#cbd5e1"/>
      <line x1="0" y1="580" x2="1376" y2="580" stroke="#94a3b8" stroke-width="4"/>

      <!-- Two Chinese Children Walking Hand in Hand with Backpacks (两个系着红领巾的小朋友手拉手) -->
      <g transform="translate(500, 260)" filter="url(#dropShadow)">
        <!-- Boy on Left in Navy Uniform & Red Scarf -->
        <g transform="translate(0, 0)">
          <!-- Blue Schoolbag behind (双肩书包) -->
          <rect x="25" y="190" width="40" height="90" rx="12" fill="#0284c7"/>
          <path d="M50,180 L160,180 L175,440 L35,440 Z" fill="#1e3a8a"/>
          <!-- Red Scarf (鲜艳的红领巾) -->
          <polygon points="105,180 80,260 105,290 130,260" fill="#dc2626"/>

          <!-- Boy Head -->
          <circle cx="105" cy="110" r="46" fill="#fed7aa"/>
          <path d="M65,95 Q105,65 145,95 L148,85 Q105,45 62,85 Z" fill="#1e293b"/>
          <circle cx="92" cy="105" r="5" fill="#0f172a"/>
          <circle cx="120" cy="105" r="5" fill="#0f172a"/>
          <path d="M96,125 Q106,135 116,125" stroke="#ef4444" stroke-width="3" fill="none"/>
          <circle cx="85" cy="118" r="8" fill="#fca5a5" opacity="0.6"/>
          <circle cx="126" cy="118" r="8" fill="#fca5a5" opacity="0.6"/>
        </g>

        <!-- Girl on Right in Red Skirt Uniform & Red Scarf -->
        <g transform="translate(180, 20)">
          <!-- Pink Schoolbag -->
          <rect x="110" y="170" width="40" height="90" rx="12" fill="#ec4899"/>
          <path d="M40,160 L140,160 L155,420 L25,420 Z" fill="#be185d"/>
          <!-- Red Scarf -->
          <polygon points="90,160 70,240 90,270 110,240" fill="#dc2626"/>

          <!-- Girl Head with Ponytails -->
          <circle cx="90" cy="95" r="44" fill="#fed7aa"/>
          <circle cx="45" cy="75" r="16" fill="#1e293b"/>
          <circle cx="135" cy="75" r="16" fill="#1e293b"/>
          <circle cx="45" cy="75" r="5" fill="#ef4444"/>
          <circle cx="135" cy="75" r="5" fill="#ef4444"/>
          <path d="M50,85 Q90,65 130,85" fill="#1e293b"/>
          <circle cx="78" cy="92" r="5" fill="#0f172a"/>
          <circle cx="102" cy="92" r="5" fill="#0f172a"/>
          <path d="M84,110 Q90,120 96,110" stroke="#ef4444" stroke-width="3" fill="none"/>
          <circle cx="72" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>
          <circle cx="108" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>
        </g>

        <!-- Hand in Hand in the Center (两只手紧紧拉在一起) -->
        <path d="M150,220 L210,220" stroke="#fed7aa" stroke-width="16" stroke-linecap="round"/>
        <circle cx="180" cy="220" r="12" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (友 - 志同道合) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="18" x2="38" y2="18"/>
          <path d="M26,18 L16,42"/>
          <path d="M22,28 L38,28 L28,36 L40,44"/>
          <path d="M38,28 L24,42"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. story_good_friends_p2: 认真学习写汉字，做爱读书的好孩子
  // ==========================================
  {
    id: "story_good_friends_p2",
    title: "我的好朋友 - 第2页",
    defs: `
      <linearGradient id="classroom_light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#ffedd5"/>
      </linearGradient>
    `,
    content: `
      <!-- Bright Classical Chinese Classroom with Calligraphy Scroll (翰墨书香中国学堂) -->
      <rect width="1376" height="768" fill="url(#classroom_light)"/>

      <!-- Large Calligraphy Scroll Hanging on Wall (纯中文书法中堂：天地人) -->
      <g transform="translate(520, 60)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="336" height="240" fill="#fef2f2" stroke="#b91c1c" stroke-width="6"/>
        <rect x="18" y="18" width="300" height="204" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <!-- Traditional Chinese Calligraphy: 天 地 人 -->
        <g stroke="#1e293b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 天 -->
          <line x1="70" y1="95" x2="110" y2="95"/>
          <line x1="60" y1="120" x2="120" y2="120"/>
          <path d="M90,95 L65,160"/>
          <path d="M90,120 L115,160"/>
          <!-- 地 -->
          <!-- 土 -->
          <line x1="145" y1="110" x2="175" y2="110"/>
          <line x1="160" y1="90" x2="160" y2="135"/>
          <line x1="140" y1="135" x2="175" y2="130"/>
          <!-- 也 -->
          <path d="M185,110 L215,110 L215,150 Q215,160 205,155"/>
          <line x1="195" y1="90" x2="195" y2="145"/>
          <!-- 人 -->
          <path d="M260,90 L235,160"/>
          <path d="M250,115 L280,160"/>
        </g>
      </g>

      <!-- Wooden Classroom Desks (古朴整洁的红木课桌) -->
      <g transform="translate(240, 440)" filter="url(#dropShadow)">
        <rect x="0" y="100" width="896" height="220" rx="12" fill="#78350f"/>
        <rect x="10" y="90" width="876" height="40" rx="8" fill="#92400e"/>

        <!-- Xuan Paper & Inkstone (宣纸字帖、端砚与笔搁) -->
        <!-- Left Student Paper -->
        <rect x="80" y="60" width="220" height="130" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <line x1="100" y1="90" x2="280" y2="90" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="100" y1="120" x2="280" y2="120" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="100" y1="150" x2="280" y2="150" stroke="#e2e8f0" stroke-width="2"/>
        <!-- Black Inkstone (精致端砚) -->
        <ellipse cx="340" cy="95" rx="30" ry="20" fill="#1e293b"/>
        <ellipse cx="340" cy="95" rx="20" ry="12" fill="#0f172a"/>

        <!-- Right Student Paper -->
        <rect x="580" y="60" width="220" height="130" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <line x1="600" y1="90" x2="780" y2="90" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="600" y1="120" x2="780" y2="120" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="600" y1="150" x2="780" y2="150" stroke="#e2e8f0" stroke-width="2"/>
        <!-- Brush Stand with Chinese Brushes (笔搁与毛笔) -->
        <polygon points="500,105 540,95 540,115" fill="#78350f"/>
        <line x1="490" y1="95" x2="550" y2="110" stroke="#d97706" stroke-width="6" stroke-linecap="round"/>
      </g>

      <!-- Two Children Sitting Upright Practicing Chinese Writing (端坐凝神专心写字的中国儿童) -->
      <!-- Left Child -->
      <g transform="translate(340, 260)" filter="url(#dropShadow)">
        <path d="M40,160 L160,160 L170,300 L30,300 Z" fill="#0284c7"/>
        <circle cx="100" cy="100" r="42" fill="#fed7aa"/>
        <path d="M65,85 Q100,60 135,85" fill="#1e293b"/>
        <!-- Focused eyes looking down at paper -->
        <path d="M85,108 Q92,114 100,108" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M108,108 Q115,114 122,108" stroke="#0f172a" stroke-width="3" fill="none"/>
        <!-- Holding brush in right hand -->
        <line x1="130" y1="170" x2="110" y2="240" stroke="#b45309" stroke-width="6" stroke-linecap="round"/>
      </g>

      <!-- Right Child -->
      <g transform="translate(840, 260)" filter="url(#dropShadow)">
        <path d="M40,160 L160,160 L170,300 L30,300 Z" fill="#ec4899"/>
        <circle cx="100" cy="100" r="42" fill="#fed7aa"/>
        <!-- Double hair buns -->
        <circle cx="68" cy="65" r="15" fill="#1e293b"/>
        <circle cx="132" cy="65" r="15" fill="#1e293b"/>
        <path d="M70,85 Q100,65 130,85" fill="#1e293b"/>
        <!-- Focused happy eyes looking down -->
        <path d="M85,108 Q92,114 100,108" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M108,108 Q115,114 122,108" stroke="#0f172a" stroke-width="3" fill="none"/>
        <!-- Holding brush -->
        <line x1="130" y1="170" x2="110" y2="240" stroke="#b45309" stroke-width="6" stroke-linecap="round"/>
      </g>

      <!-- Red Chinese Seal (学 - 笃学尚行) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- ⺍ on top -->
          <circle cx="20" cy="16" r="1" fill="#ffffff"/>
          <line x1="28" y1="13" x2="28" y2="18"/>
          <circle cx="36" cy="16" r="1" fill="#ffffff"/>
          <!-- 冖 -->
          <line x1="16" y1="22" x2="40" y2="22"/>
          <line x1="16" y1="22" x2="16" y2="26"/>
          <line x1="40" y1="22" x2="40" y2="26"/>
          <!-- 子 -->
          <line x1="20" y1="30" x2="36" y2="30"/>
          <path d="M34,30 L26,38 L36,38 Q36,44 28,44"/>
          <line x1="16" y1="36" x2="40" y2="36"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. story_happy_school_p1: 推开大门小车来，挥手向家人说再见
  // ==========================================
  {
    id: "story_happy_school_p1",
    title: "开开心心去上学 - 第1页",
    defs: `
      <linearGradient id="gate_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Quadrangle Courtyard Gate in Morning (四合院朱红大门迎晓日) -->
      <rect width="1376" height="768" fill="url(#gate_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Traditional Chinese Gate & Wall (朱红大门、门神抱鼓石与雕花飞檐) -->
      <g filter="url(#dropShadow)">
        <rect x="0" y="240" width="1376" height="528" fill="#e2e8f0"/>
        <!-- Roof Eaves (飞檐黛瓦) -->
        <path d="M60,240 L1316,240 L1376,200 L0,200 Z" fill="#334155"/>
        <rect x="220" y="240" width="480" height="420" fill="#991b1b" stroke="#78350f" stroke-width="12"/>
        <!-- Golden Door Knockers (兽面椒图铜门环) -->
        <circle cx="340" cy="420" r="28" fill="#facc15" stroke="#78350f" stroke-width="4"/>
        <circle cx="580" cy="420" r="28" fill="#facc15" stroke="#78350f" stroke-width="4"/>
        <!-- Drum-shaped Bearing Stones (门前抱鼓石) -->
        <circle cx="180" cy="620" r="45" fill="#94a3b8"/>
        <circle cx="740" cy="620" r="45" fill="#94a3b8"/>
      </g>

      <!-- Loving Grandma/Mother Waving from Inside Door (倚门挥手叮咛的慈祥长辈) -->
      <g transform="translate(360, 310)">
        <path d="M40,160 L140,160 L160,350 L20,350 Z" fill="#4338ca"/>
        <circle cx="90" cy="100" r="42" fill="#fed7aa"/>
        <circle cx="90" cy="70" r="18" fill="#64748b"/>
        <!-- Loving Smile -->
        <path d="M78,98 Q85,92 92,98" stroke="#0f172a" stroke-width="2.5" fill="none"/>
        <path d="M98,98 Q105,92 112,98" stroke="#0f172a" stroke-width="2.5" fill="none"/>
        <path d="M84,115 Q95,124 106,115" stroke="#ef4444" stroke-width="3" fill="none"/>
        <!-- Waving Hand -->
        <path d="M120,170 L150,110" stroke="#4338ca" stroke-width="18" stroke-linecap="round"/>
        <circle cx="155" cy="105" r="12" fill="#fed7aa"/>
      </g>

      <!-- Cheerful Child with Yellow Cap & Red Backpack Waving Goodbye (戴小黄帽背红书包挥手告别的萌娃) -->
      <g transform="translate(860, 330)" filter="url(#dropShadow)">
        <!-- Red Backpack -->
        <rect x="25" y="150" width="45" height="85" rx="12" fill="#dc2626"/>
        <path d="M50,150 L150,150 L165,370 L35,370 Z" fill="#0284c7"/>

        <!-- Little Yellow Sun Hat (可爱小黄帽) -->
        <circle cx="100" cy="95" r="42" fill="#fed7aa"/>
        <ellipse cx="100" cy="70" rx="55" ry="18" fill="#facc15"/>
        <path d="M65,70 Q100,35 135,70 Z" fill="#facc15"/>

        <!-- Happy Waving Smile -->
        <circle cx="85" cy="92" r="5" fill="#0f172a"/>
        <circle cx="115" cy="92" r="5" fill="#0f172a"/>
        <path d="M90,110 Q100,120 110,110" stroke="#ef4444" stroke-width="3" fill="none"/>
        <circle cx="78" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="122" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Arm Waving Back to Family -->
        <path d="M60,170 L0,120" stroke="#0284c7" stroke-width="20" stroke-linecap="round"/>
        <circle cx="-5" cy="115" r="14" fill="#fed7aa"/>
      </g>

      <!-- Cute School Bus in Distance (停在路口安全护送的小校车) -->
      <g transform="translate(1080, 480)" filter="url(#dropShadow)">
        <rect x="0" y="40" width="180" height="90" rx="16" fill="#facc15"/>
        <!-- Bus Windows -->
        <rect x="20" y="55" width="35" height="35" rx="6" fill="#38bdf8"/>
        <rect x="65" y="55" width="35" height="35" rx="6" fill="#38bdf8"/>
        <rect x="110" y="55" width="35" height="35" rx="6" fill="#38bdf8"/>
        <!-- Wheels -->
        <circle cx="45" cy="130" r="22" fill="#1e293b"/>
        <circle cx="45" cy="130" r="10" fill="#cbd5e1"/>
        <circle cx="135" cy="130" r="22" fill="#1e293b"/>
        <circle cx="135" cy="130" r="10" fill="#cbd5e1"/>
      </g>

      <!-- Red Chinese Seal (朝 - 朝气蓬勃) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 十 + 日 + 十 on left -->
          <line x1="20" y1="13" x2="20" y2="43"/>
          <line x1="14" y1="20" x2="26" y2="20"/>
          <rect x="15" y="24" width="10" height="8"/>
          <line x1="14" y1="36" x2="26" y2="36"/>
          <!-- 月 on right -->
          <path d="M31,14 L31,43 Q31,45 28,45"/>
          <path d="M31,16 L41,16 L41,43"/>
          <line x1="31" y1="24" x2="41" y2="24"/>
          <line x1="31" y1="32" x2="41" y2="32"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. story_happy_school_p2: 明亮双目看世界，灵敏双耳听鸟鸣
  // ==========================================
  {
    id: "story_happy_school_p2",
    title: "开开心心去上学 - 第2页",
    defs: `
      <linearGradient id="nature_morning" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#d9f99d"/>
      </linearGradient>
    `,
    content: `
      <!-- Spring Morning Tree-lined Road (春光明媚树成荫，鸟语花香伴我行) -->
      <rect width="1376" height="768" fill="url(#nature_morning)"/>
      <circle cx="688" cy="180" r="90" fill="#fde047" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Lush Willow Trees along Path (杨柳依依) -->
      <g stroke="#15803d" stroke-width="12" stroke-linecap="round">
        <line x1="160" y1="300" x2="160" y2="600"/>
        <line x1="1200" y1="300" x2="1200" y2="600"/>
      </g>
      <ellipse cx="160" cy="260" rx="140" ry="90" fill="#22c55e" filter="url(#dropShadow)"/>
      <ellipse cx="1200" cy="260" rx="140" ry="90" fill="#22c55e" filter="url(#dropShadow)"/>

      <!-- Singing Birds on Branches (枝头鸣唱的小鸟) -->
      <g transform="translate(240, 220)" filter="url(#dropShadow)">
        <ellipse cx="30" cy="30" rx="20" ry="14" fill="#0284c7"/>
        <circle cx="45" cy="22" r="12" fill="#0284c7"/>
        <polygon points="55,20 65,24 55,28" fill="#f97316"/>
        <!-- Musical notes floating (飘扬的乐符) -->
        <circle cx="70" cy="0" r="5" fill="#f59e0b"/>
        <line x1="75" y1="0" x2="75" y2="-20" stroke="#f59e0b" stroke-width="3"/>
      </g>

      <!-- Path with Wildflowers (绿茵夹道百花开) -->
      <path d="M0,580 Q688,520 1376,580 L1376,768 L0,768 Z" fill="#86efac"/>
      <circle cx="340" cy="650" r="12" fill="#f43f5e"/>
      <circle cx="480" cy="680" r="14" fill="#fbbf24"/>
      <circle cx="920" cy="660" r="15" fill="#ec4899"/>
      <circle cx="1060" cy="640" r="12" fill="#38bdf8"/>

      <!-- Joyful Child Skipping with Light Steps (脚步轻快真高兴的中国萌娃) -->
      <g transform="translate(600, 260)" filter="url(#dropShadow)">
        <rect x="25" y="150" width="45" height="85" rx="12" fill="#dc2626"/>
        <path d="M50,150 L150,150 L165,380 L35,380 Z" fill="#0284c7"/>

        <!-- Head -->
        <circle cx="100" cy="95" r="44" fill="#fed7aa"/>
        <!-- Yellow Cap -->
        <ellipse cx="100" cy="70" rx="55" ry="18" fill="#facc15"/>
        <path d="M65,70 Q100,35 135,70 Z" fill="#facc15"/>

        <!-- Sparkly Bright Eyes (用明亮的双目看世界) -->
        <circle cx="85" cy="92" r="6" fill="#0f172a"/>
        <circle cx="87" cy="89" r="2" fill="#ffffff"/>
        <circle cx="115" cy="92" r="6" fill="#0f172a"/>
        <circle cx="117" cy="89" r="2" fill="#ffffff"/>

        <!-- Joyful Singing Mouth -->
        <path d="M90,110 Q100,126 110,110 Z" fill="#dc2626"/>
        <circle cx="78" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="122" cy="105" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Skipping Running Arms (欢快摆动手臂) -->
        <path d="M60,170 L20,120" stroke="#0284c7" stroke-width="20" stroke-linecap="round"/>
        <path d="M140,170 L180,120" stroke="#0284c7" stroke-width="20" stroke-linecap="round"/>
        <circle cx="16" cy="115" r="12" fill="#fed7aa"/>
        <circle cx="184" cy="115" r="12" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (悦 - 欢欣雀跃) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 忄 on left -->
          <line x1="18" y1="12" x2="18" y2="44"/>
          <circle cx="13" cy="26" r="1" fill="#ffffff"/>
          <line x1="23" y1="23" x2="19" y2="28"/>
          <!-- 兑 on right -->
          <circle cx="28" cy="15" r="1" fill="#ffffff"/>
          <circle cx="38" cy="15" r="1" fill="#ffffff"/>
          <line x1="26" y1="21" x2="40" y2="21"/>
          <rect x="27" y="25" width="12" height="8"/>
          <path d="M30,33 L26,43"/>
          <path d="M36,33 L40,43"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. story_good_children_p1: 父母用心抚育我们，我们要孝敬爸妈
  // ==========================================
  {
    id: "story_good_children_p1",
    title: "我们都是好孩子 - 第1页",
    defs: `
      <linearGradient id="warm_living" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#ffedd5"/>
      </linearGradient>
    `,
    content: `
      <!-- Cozy Chinese Family Living Room (温馨和谐中式家庭厅堂，知恩孝亲) -->
      <rect width="1376" height="768" fill="url(#warm_living)"/>

      <!-- Traditional Chinese Landscape Screen in Background (中式山水落地屏风) -->
      <g transform="translate(380, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="616" height="260" rx="8" fill="#f8fafc" stroke="#78350f" stroke-width="10"/>
        <!-- Soft ink hills on screen -->
        <path d="M40,200 Q160,100 280,180 T560,160 L560,240 L40,240 Z" fill="#94a3b8" opacity="0.4"/>
        <path d="M120,220 Q280,140 440,200 L440,240 L120,240 Z" fill="#64748b" opacity="0.3"/>
      </g>

      <!-- Classical Wooden Tea Table (中式雕花红木茶几) -->
      <g transform="translate(560, 480)" filter="url(#dropShadow)">
        <rect x="0" y="60" width="256" height="180" rx="8" fill="#78350f"/>
        <rect x="10" y="50" width="236" height="30" rx="6" fill="#92400e"/>
        <!-- Celadon Teapot (青瓷茶壶与茶杯) -->
        <ellipse cx="128" cy="40" rx="28" ry="20" fill="#34d399"/>
        <ellipse cx="128" cy="20" rx="12" ry="6" fill="#059669"/>
        <path d="M100,40 Q90,30 96,22" stroke="#059669" stroke-width="5" fill="none"/>
        <!-- Rising warm steam (袅袅茶香热气) -->
        <path d="M128,10 Q124,-10 132,-25" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.8"/>
      </g>

      <!-- Respectful Child Offering Cup of Tea (双手奉茶孝敬父母的乖巧懂事萌娃) -->
      <g transform="translate(688, 320)" filter="url(#dropShadow)">
        <path d="M40,160 L140,160 L155,400 L25,400 Z" fill="#dc2626"/>
        <!-- Child Head with Double Buns -->
        <circle cx="90" cy="95" r="42" fill="#fed7aa"/>
        <circle cx="58" cy="55" r="16" fill="#1e293b"/>
        <circle cx="122" cy="55" r="16" fill="#1e293b"/>
        <circle cx="58" cy="55" r="5" fill="#facc15"/>
        <circle cx="122" cy="55" r="5" fill="#facc15"/>
        <path d="M60,85 Q90,65 120,85" fill="#1e293b"/>
        <!-- Respectful smiling eyes -->
        <path d="M76,96 Q83,102 90,96" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M98,96 Q105,102 112,96" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M84,112 Q94,120 104,112" stroke="#ef4444" stroke-width="3" fill="none"/>
        <circle cx="70" cy="106" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="118" cy="106" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Hands reverently holding small tea cup (双手端着青瓷小茶杯) -->
        <path d="M40,180 L-20,180" stroke="#dc2626" stroke-width="18" stroke-linecap="round"/>
        <ellipse cx="-25" cy="180" rx="14" ry="10" fill="#34d399"/>
        <circle cx="-25" cy="180" r="6" fill="#fef08a"/>
      </g>

      <!-- Loving Father & Mother Smiling Warmly on the Left (满脸欣慰与慈爱的爸爸妈妈) -->
      <g transform="translate(240, 240)" filter="url(#dropShadow)">
        <!-- Father -->
        <g transform="translate(0, 0)">
          <path d="M40,180 L160,180 L175,460 L25,460 Z" fill="#1e3a8a"/>
          <circle cx="100" cy="105" r="46" fill="#fed7aa"/>
          <path d="M62,90 Q100,60 138,90" fill="#1e293b"/>
          <!-- Warm loving eyes -->
          <path d="M85,108 Q92,114 100,108" stroke="#0f172a" stroke-width="3" fill="none"/>
          <path d="M108,108 Q115,114 122,108" stroke="#0f172a" stroke-width="3" fill="none"/>
          <path d="M92,128 Q102,138 112,128" stroke="#ef4444" stroke-width="3" fill="none"/>
        </g>
        <!-- Mother -->
        <g transform="translate(140, 30)">
          <path d="M35,160 L145,160 L160,430 L20,430 Z" fill="#9333ea"/>
          <circle cx="90" cy="95" r="44" fill="#fed7aa"/>
          <path d="M50,85 Q90,55 130,85" fill="#1e293b"/>
          <!-- Hair bun -->
          <circle cx="130" cy="70" r="16" fill="#1e293b"/>
          <line x1="110" y1="65" x2="145" y2="65" stroke="#facc15" stroke-width="3"/>
          <path d="M78,98 Q85,104 92,98" stroke="#0f172a" stroke-width="3" fill="none"/>
          <path d="M98,98 Q105,104 112,98" stroke="#0f172a" stroke-width="3" fill="none"/>
          <path d="M84,116 Q94,126 104,116" stroke="#ef4444" stroke-width="3" fill="none"/>
          <circle cx="72" cy="110" r="8" fill="#fca5a5" opacity="0.6"/>
          <circle cx="118" cy="110" r="8" fill="#fca5a5" opacity="0.6"/>
        </g>
      </g>

      <!-- Red Chinese Seal (孝 - 百善孝为先) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 耂 on top -->
          <line x1="20" y1="16" x2="36" y2="16"/>
          <line x1="28" y1="12" x2="28" y2="24"/>
          <line x1="15" y1="24" x2="41" y2="24"/>
          <path d="M38,18 L16,42"/>
          <!-- 子 on bottom right -->
          <line x1="24" y1="31" x2="38" y2="31"/>
          <path d="M36,31 L29,38 L38,38 Q38,44 32,44"/>
          <line x1="20" y1="36" x2="42" y2="36"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. story_good_children_p2: 昂起头来大步走，开开心心迎明天
  // ==========================================
  {
    id: "story_good_children_p2",
    title: "我们都是好孩子 - 第2页",
    defs: `
      <linearGradient id="bright_future" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#fde047"/>
      </linearGradient>
    `,
    content: `
      <!-- Glorious Golden Sunrise & Wide Avenue (迎着朝阳大步向前，阳光少年) -->
      <rect width="1376" height="768" fill="url(#bright_future)"/>
      <circle cx="688" cy="220" r="140" fill="#fde047" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Distant City Skyline & Modern Pagoda (欣欣向荣的美丽家园) -->
      <path d="M0,460 Q688,400 1376,460 L1376,768 L0,768 Z" fill="#86efac"/>
      <path d="M0,540 L1376,540 L1376,768 L0,768 Z" fill="#4ade80"/>

      <!-- Group of Chinese Children Walking with Confidence and Smiles (意气风发、阔步向前的中国好少年) -->
      <!-- Center Leading Boy with Red Scarf and Raised Fist -->
      <g transform="translate(560, 240)" filter="url(#dropShadow)">
        <path d="M50,170 L170,170 L185,440 L35,440 Z" fill="#0284c7"/>
        <!-- Red Scarf Floating proudly (飘扬的红领巾) -->
        <polygon points="110,170 85,250 110,290 135,250" fill="#dc2626"/>

        <!-- Head -->
        <circle cx="110" cy="100" r="48" fill="#fed7aa"/>
        <path d="M68,85 Q110,55 152,85" fill="#1e293b"/>
        <circle cx="95" cy="98" r="6" fill="#0f172a"/>
        <circle cx="97" cy="95" r="2" fill="#ffffff"/>
        <circle cx="125" cy="98" r="6" fill="#0f172a"/>
        <circle cx="127" cy="95" r="2" fill="#ffffff"/>
        <!-- Confident Smile -->
        <path d="M98,118 Q110,132 122,118 Z" fill="#dc2626"/>
        <circle cx="85" cy="112" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="135" cy="112" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Right Arm Raised Confidently toward Sun (昂首挺胸迎向朝阳) -->
        <path d="M160,180 L220,110" stroke="#0284c7" stroke-width="22" stroke-linecap="round"/>
        <circle cx="225" cy="105" r="14" fill="#fed7aa"/>
      </g>

      <!-- Girl on Left Applauding -->
      <g transform="translate(360, 280)" filter="url(#dropShadow)">
        <path d="M40,160 L140,160 L155,400 L25,400 Z" fill="#ec4899"/>
        <circle cx="90" cy="95" r="42" fill="#fed7aa"/>
        <!-- Double hair buns -->
        <circle cx="58" cy="60" r="16" fill="#1e293b"/>
        <circle cx="122" cy="60" r="16" fill="#1e293b"/>
        <circle cx="58" cy="60" r="5" fill="#ef4444"/>
        <circle cx="122" cy="60" r="5" fill="#ef4444"/>
        <path d="M78,92 Q85,86 92,92" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M98,92 Q105,86 112,92" stroke="#0f172a" stroke-width="3" fill="none"/>
        <path d="M84,112 Q94,122 104,112" stroke="#ef4444" stroke-width="3" fill="none"/>
      </g>

      <!-- Boy on Right Carrying Chinese Dragon Kite (手持祥龙风筝的少年) -->
      <g transform="translate(800, 260)" filter="url(#dropShadow)">
        <path d="M40,160 L150,160 L165,420 L25,420 Z" fill="#16a34a"/>
        <circle cx="95" cy="95" r="44" fill="#fed7aa"/>
        <path d="M60,82 Q95,55 130,82" fill="#1e293b"/>
        <circle cx="82" cy="95" r="5" fill="#0f172a"/>
        <circle cx="108" cy="95" r="5" fill="#0f172a"/>
        <path d="M86,115 Q95,124 104,115" stroke="#ef4444" stroke-width="3" fill="none"/>

        <!-- Traditional Chinese Kite (传统沙燕风筝) -->
        <g transform="translate(130, 60) rotate(15)">
          <polygon points="40,0 80,40 40,80 0,40" fill="#dc2626"/>
          <line x1="40" y1="0" x2="40" y2="80" stroke="#facc15" stroke-width="4"/>
          <line x1="0" y1="40" x2="80" y2="40" stroke="#facc15" stroke-width="4"/>
          <!-- Kite tail streamers -->
          <path d="M40,80 Q30,120 40,160" stroke="#ef4444" stroke-width="4" fill="none"/>
          <path d="M50,80 Q60,120 50,160" stroke="#facc15" stroke-width="4" fill="none"/>
        </g>
      </g>

      <!-- Red Chinese Seal (志 - 少年有志) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 士 on top -->
          <line x1="16" y1="18" x2="38" y2="18"/>
          <line x1="27" y1="12" x2="27" y2="28"/>
          <line x1="19" y1="28" x2="35" y2="28"/>
          <!-- 心 on bottom -->
          <circle cx="17" cy="36" r="1" fill="#ffffff"/>
          <path d="M19,34 Q22,44 28,44 Q36,44 41,36"/>
          <circle cx="28" cy="38" r="1" fill="#ffffff"/>
          <circle cx="36" cy="35" r="1" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 9. story_four_seasons_p1: 春天花儿开，夏天绿树浓
  // ==========================================
  {
    id: "story_four_seasons_p1",
    title: "四季的歌 - 第1页",
    defs: `
      <linearGradient id="spring_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
      <linearGradient id="summer_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#86efac"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Folding Screen Diptych Style (中式传统折页屏风画卷：春与夏) -->
      <rect width="1376" height="768" fill="#f8fafc"/>

      <!-- Left Half: Spring Blossom (左屏：春暖花开，杨柳燕归) -->
      <g filter="url(#dropShadow)">
        <rect x="40" y="40" width="620" height="688" rx="16" fill="url(#spring_bg)" stroke="#78350f" stroke-width="12"/>
        <!-- Weeping Willow & Swallows (细柳清风双飞燕) -->
        <path d="M60,60 Q200,160 160,340 M120,60 Q300,180 260,380" stroke="#16a34a" stroke-width="6" stroke-linecap="round" fill="none"/>
        <g transform="translate(340, 180)">
          <path d="M0,0 Q20,-15 40,0 Q20,5 0,0 Z" fill="#0f172a"/>
          <polygon points="10,0 0,-12 5,0" fill="#0f172a"/>
          <polygon points="20,0 30,-12 25,0" fill="#0f172a"/>
        </g>
        <!-- Pink Peach Blossoms (娇艳桃花) -->
        <circle cx="180" cy="240" r="16" fill="#f472b6" filter="url(#softGlow)"/>
        <circle cx="240" cy="280" r="18" fill="#f472b6"/>
        <circle cx="300" cy="220" r="14" fill="#f472b6"/>
        <!-- Spring Text in Seal on Left -->
        <rect x="540" y="70" width="45" height="45" rx="6" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="550" y1="80" x2="575" y2="80"/>
          <line x1="552" y1="86" x2="573" y2="86"/>
          <line x1="548" y1="92" x2="577" y2="92"/>
          <path d="M570,82 L550,105"/>
          <rect x="556" y="96" width="13" height="12"/>
        </g>
      </g>

      <!-- Right Half: Summer Lotus & Tree (右屏：接天莲叶，夏树浓荫) -->
      <g filter="url(#dropShadow)">
        <rect x="716" y="40" width="620" height="688" rx="16" fill="url(#summer_bg)" stroke="#78350f" stroke-width="12"/>
        <circle cx="1180" cy="140" r="60" fill="#ef4444" filter="url(#softGlow)"/>
        <!-- Big Green Summer Trees (郁郁葱葱的盛夏绿树) -->
        <ellipse cx="880" cy="300" rx="140" ry="110" fill="#15803d"/>
        <ellipse cx="880" cy="240" rx="110" ry="80" fill="#22c55e"/>
        <!-- Lotus Pond in Summer (荷塘荷花盛放) -->
        <ellipse cx="1060" cy="560" rx="120" ry="50" fill="#047857"/>
        <!-- Pink Lotus Flower (亭亭玉立的粉红荷花) -->
        <g transform="translate(1040, 480)" filter="url(#softGlow)">
          <path d="M20,60 C0,30 20,0 20,0 C20,0 40,30 20,60 Z" fill="#ec4899"/>
          <path d="M0,60 C-15,35 0,15 0,15 C0,15 15,35 0,60 Z" fill="#f472b6"/>
          <path d="M40,60 C25,35 40,15 40,15 C40,15 55,35 40,60 Z" fill="#f472b6"/>
        </g>
        <!-- Summer Seal on Right -->
        <rect x="1216" y="70" width="45" height="45" rx="6" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="1226" y1="78" x2="1251" y2="78"/>
          <rect x="1228" y="82" width="18" height="10"/>
          <line x1="1224" y1="96" x2="1253" y2="96"/>
          <path d="M1232,96 L1228,107"/>
          <path d="M1244,96 L1249,107"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 10. story_four_seasons_p2: 秋天黄叶落，冬天白雪飘
  // ==========================================
  {
    id: "story_four_seasons_p2",
    title: "四季的歌 - 第2页",
    defs: `
      <linearGradient id="autumn_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <linearGradient id="winter_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="50%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Folding Screen Diptych Style (中式传统折页屏风画卷：秋与冬) -->
      <rect width="1376" height="768" fill="#f8fafc"/>

      <!-- Left Half: Autumn Golden Harvest (左屏：秋高气爽，金叶漫天) -->
      <g filter="url(#dropShadow)">
        <rect x="40" y="40" width="620" height="688" rx="16" fill="url(#autumn_bg)" stroke="#78350f" stroke-width="12"/>
        <circle cx="520" cy="140" r="55" fill="#f59e0b" filter="url(#softGlow)"/>
        <!-- Golden Maple Tree (金黄枫树与银杏) -->
        <path d="M220,688 L260,420" stroke="#78350f" stroke-width="24" stroke-linecap="round"/>
        <ellipse cx="280" cy="340" rx="140" ry="110" fill="#eab308"/>
        <ellipse cx="340" cy="300" rx="100" ry="80" fill="#f97316"/>
        <!-- Falling Golden Maple Leaves (飘落的金色秋叶) -->
        <ellipse cx="140" cy="420" rx="14" ry="8" fill="#ea580c" transform="rotate(35, 140, 420)"/>
        <ellipse cx="380" cy="460" rx="12" ry="7" fill="#d97706" transform="rotate(-25, 380, 460)"/>
        <ellipse cx="480" cy="380" rx="15" ry="9" fill="#ea580c" transform="rotate(45, 480, 380)"/>
        <!-- Autumn Seal on Left -->
        <rect x="540" y="70" width="45" height="45" rx="6" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 禾 -->
          <line x1="548" y1="84" x2="560" y2="84"/>
          <line x1="554" y1="80" x2="554" y2="104"/>
          <path d="M554,88 L549,97"/>
          <path d="M554,88 L559,97"/>
          <!-- 火 -->
          <line x1="563" y1="85" x2="566" y2="92"/>
          <line x1="577" y1="85" x2="574" y2="92"/>
          <path d="M570,80 L564,104"/>
          <path d="M569,92 L576,104"/>
        </g>
      </g>

      <!-- Right Half: Winter Snow & Red Plum (右屏：瑞雪兆丰年，红梅傲霜雪) -->
      <g filter="url(#dropShadow)">
        <rect x="716" y="40" width="620" height="688" rx="16" fill="url(#winter_bg)" stroke="#78350f" stroke-width="12"/>
        <!-- Snow Covered Chinese Eaves (积雪覆飞檐) -->
        <path d="M800,320 L1200,320 L1240,290 L760,290 Z" fill="#334155"/>
        <path d="M760,290 L1240,290 L1220,275 L780,275 Z" fill="#ffffff"/>
        <!-- Gnarled Red Plum Branch (傲雪古梅枝) -->
        <path d="M1280,550 Q1120,440 980,420 T860,340" stroke="#451a03" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- Vibrant Red Plum Flowers (晶莹红梅) -->
        <circle cx="940" cy="410" r="14" fill="#dc2626" filter="url(#softGlow)"/>
        <circle cx="1020" cy="430" r="15" fill="#dc2626"/>
        <circle cx="1100" cy="460" r="16" fill="#dc2626"/>
        <circle cx="880" cy="350" r="14" fill="#dc2626"/>
        <!-- White Snowflakes Falling (漫天飞雪) -->
        <g fill="#ffffff" filter="url(#softGlow)">
          <circle cx="820" cy="160" r="8"/>
          <circle cx="960" cy="120" r="6"/>
          <circle cx="1120" cy="180" r="7"/>
          <circle cx="1060" cy="260" r="8"/>
          <circle cx="880" cy="240" r="6"/>
        </g>
        <!-- Winter Seal on Right -->
        <rect x="1216" y="70" width="45" height="45" rx="6" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="1228" y1="78" x2="1249" y2="78"/>
          <path d="M1248,78 L1234,92 L1248,92"/>
          <line x1="1234" y1="92" x2="1228" y2="105"/>
          <circle cx="1238" cy="100" r="1.5" fill="#ffffff"/>
          <circle cx="1244" cy="106" r="1.5" fill="#ffffff"/>
        </g>
      </g>
    `
  }
];

console.log(`Rendering ${STORIES_PART2.length} storybook part 2 illustrations...`);

for (const item of STORIES_PART2) {
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

console.log("\nAll 10 storybook part 2 illustrations generated successfully!");
