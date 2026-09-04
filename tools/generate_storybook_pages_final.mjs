import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_storybook_final";

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

const STORIES_FINAL = [
  // ==========================================
  // 1. story_space_rocket_p1: 三二一点火！金色火箭飞上了蓝蓝的天空
  // ==========================================
  {
    id: "story_space_rocket_p1",
    title: "小小宇航员上太空 - 第1页",
    defs: `
      <linearGradient id="rocket_sky1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="40%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="flame_glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="30%" stop-color="#fef08a"/>
        <stop offset="70%" stop-color="#f97316"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>
    `,
    content: `
      <!-- Chinese Aerospace Center Rocket Launch (长征腾飞，烈焰破霄) -->
      <rect width="1376" height="768" fill="url(#rocket_sky1)"/>

      <!-- Rising Billowing Steam & Smoke Clouds (点火升空的巨大蒸汽云) -->
      <g fill="#ffffff" opacity="0.9" filter="url(#softGlow)">
        <ellipse cx="688" cy="620" rx="360" ry="120"/>
        <circle cx="500" cy="580" r="100"/>
        <circle cx="880" cy="580" r="100"/>
        <circle cx="688" cy="550" r="120"/>
      </g>

      <!-- Grand Launch Tower in Background (发射铁塔支架) -->
      <g transform="translate(420, 200)" filter="url(#dropShadow)">
        <rect x="0" y="80" width="40" height="420" fill="#475569"/>
        <rect x="496" y="80" width="40" height="420" fill="#475569"/>
        <line x1="0" y1="160" x2="40" y2="240" stroke="#94a3b8" stroke-width="4"/>
        <line x1="496" y1="160" x2="536" y2="240" stroke="#94a3b8" stroke-width="4"/>
      </g>

      <!-- Golden Long March Rocket Ascending (金色神舟火箭腾空而起) -->
      <g transform="translate(640, 100)" filter="url(#dropShadow)">
        <!-- Giant Rocket Flame (喷射的耀眼烈焰) -->
        <polygon points="48,340 10,480 35,420 48,520 61,420 86,480" fill="url(#flame_glow)" filter="url(#softGlow)"/>
        <!-- Rocket Body -->
        <rect x="24" y="40" width="48" height="300" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <polygon points="48,-30 24,40 72,40" fill="#dc2626"/>
        <!-- Red Booster Rockets Left & Right (助推器) -->
        <rect x="4" y="160" width="16" height="180" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <polygon points="12,130 4,160 20,160" fill="#dc2626"/>
        <rect x="76" y="160" width="16" height="180" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <polygon points="84,130 76,160 92,160" fill="#dc2626"/>
        <!-- Chinese Red Five-pointed Star -->
        <circle cx="48" cy="90" r="12" fill="#dc2626"/>
        <polygon points="48,82 50,87 56,87 51,91 53,96 48,93 43,96 45,91 40,87 46,87" fill="#facc15"/>
      </g>

      <!-- Red Chinese Seal (升 - 步步高升) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 升 -->
          <path d="M22,14 L16,22"/>
          <line x1="14" y1="22" x2="38" y2="22"/>
          <line x1="20" y1="22" x2="20" y2="42"/>
          <line x1="32" y1="12" x2="32" y2="44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. story_space_rocket_p2: 太空里真奇妙，一颗颗星星在眨眼睛
  // ==========================================
  {
    id: "story_space_rocket_p2",
    title: "小小宇航员上太空 - 第2页",
    defs: `
      <linearGradient id="space_deep" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#050814"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
    `,
    content: `
      <!-- Miraculous Deep Cosmic Space with Golden Stars (奇妙浩瀚星空，繁星眨眼) -->
      <rect width="1376" height="768" fill="url(#space_deep)"/>

      <!-- Magnificent Swirling Galaxy Ribbon (绚丽的九天星河) -->
      <path d="M0,600 Q400,200 900,450 T1376,150" stroke="#818cf8" stroke-width="120" fill="none" opacity="0.3" filter="url(#softGlow)"/>

      <!-- Chinese Tiangong Space Station Floating (傲游太空的中国天宫空间站) -->
      <g transform="translate(480, 260)" filter="url(#dropShadow)">
        <!-- Core Module (天和核心舱) -->
        <rect x="60" y="40" width="240" height="70" rx="35" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
        <!-- Docking Hub -->
        <circle cx="60" cy="75" r="28" fill="#475569"/>
        <!-- Solar Array Wings Left & Right (金黄与深蓝柔性太阳能翼) -->
        <rect x="130" y="-120" width="100" height="150" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="4"/>
        <line x1="180" y1="-120" x2="180" y2="30" stroke="#facc15" stroke-width="3"/>
        <rect x="130" y="120" width="100" height="150" rx="6" fill="#0284c7" stroke="#38bdf8" stroke-width="4"/>
        <line x1="180" y1="120" x2="180" y2="270" stroke="#facc15" stroke-width="3"/>
      </g>

      <!-- Playful Twinkling Stars with Friendly Eyes (眨眼睛的可爱小星星) -->
      <g transform="translate(240, 160)" filter="url(#softGlow)">
        <polygon points="50,10 62,35 90,38 70,58 75,85 50,72 25,85 30,58 10,38 38,35" fill="#fde047"/>
        <circle cx="43" cy="45" r="3" fill="#0f172a"/>
        <circle cx="57" cy="45" r="3" fill="#0f172a"/>
        <path d="M46,55 Q50,60 54,55" stroke="#dc2626" stroke-width="2" fill="none"/>
      </g>
      <g transform="translate(980, 180)" filter="url(#softGlow)">
        <polygon points="40,8 50,28 72,30 56,46 60,68 40,57 20,68 24,46 8,30 30,28" fill="#fde047"/>
        <circle cx="35" cy="36" r="2.5" fill="#0f172a"/>
        <circle cx="45" cy="36" r="2.5" fill="#0f172a"/>
      </g>

      <!-- Red Chinese Seal (宇 - 气贯寰宇) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 宀 on top -->
          <line x1="28" y1="12" x2="28" y2="16"/>
          <line x1="15" y1="17" x2="41" y2="17"/>
          <line x1="16" y1="17" x2="16" y2="23"/>
          <line x1="40" y1="17" x2="40" y2="23"/>
          <!-- 于 below -->
          <line x1="18" y1="26" x2="38" y2="26"/>
          <line x1="15" y1="34" x2="41" y2="34"/>
          <path d="M28,26 L28,42 Q28,45 23,44"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. story_space_rocket_p3: 宇航员太空自由飞翔，向地球挥手
  // ==========================================
  {
    id: "story_space_rocket_p3",
    title: "小小宇航员上太空 - 第3页",
    defs: `
      <linearGradient id="orbit_view" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="60%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
    `,
    content: `
      <!-- Spacewalk in Front of Blue Planet Earth (太空漫步向地球挥手，胸前国旗闪耀) -->
      <rect width="1376" height="768" fill="url(#orbit_view)"/>

      <!-- Giant Crescent View of Planet Earth Below (下方蔚蓝壮丽的地球家园) -->
      <ellipse cx="688" cy="850" rx="900" ry="420" fill="#0284c7" filter="url(#softGlow)"/>
      <path d="M200,680 Q688,580 1180,680" stroke="#22c55e" stroke-width="45" stroke-linecap="round" fill="none" opacity="0.8"/>
      <path d="M380,640 Q688,560 980,640" stroke="#ffffff" stroke-width="15" stroke-linecap="round" fill="none" opacity="0.6"/>

      <!-- Chinese Astronaut Floating in Space (太空漫步的中国宇航员) -->
      <g transform="translate(560, 160)" filter="url(#dropShadow)">
        <!-- White Space Suit Body -->
        <ellipse cx="140" cy="240" rx="80" ry="100" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
        <!-- Life Support Backpack -->
        <rect x="60" y="160" width="160" height="120" rx="20" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3"/>

        <!-- Astronaut Helmet (圆溜溜的航天服头盔) -->
        <circle cx="140" cy="110" r="68" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
        <!-- Golden Sun Visor (金黄透亮遮阳面罩) -->
        <ellipse cx="140" cy="110" rx="50" ry="38" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>
        <!-- Cute Child Face seen through Visor (面罩内微笑的中国萌娃) -->
        <circle cx="122" cy="108" r="5" fill="#0f172a"/>
        <circle cx="158" cy="108" r="5" fill="#0f172a"/>
        <path d="M130,122 Q140,132 150,122" stroke="#ef4444" stroke-width="3" fill="none"/>
        <circle cx="112" cy="116" r="6" fill="#fca5a5" opacity="0.7"/>
        <circle cx="168" cy="116" r="6" fill="#fca5a5" opacity="0.7"/>

        <!-- China Flag Patch on Left Chest (胸前鲜艳的五星红旗徽章) -->
        <rect x="90" y="195" width="36" height="24" rx="3" fill="#dc2626"/>
        <polygon points="98,202 99,205 103,205 100,207 101,210 98,208 95,210 96,207 93,205 97,205" fill="#facc15"/>

        <!-- Arm Waving Warmly toward Earth (向地球热情挥手的宇航手套) -->
        <path d="M210,210 L280,140" stroke="#ffffff" stroke-width="28" stroke-linecap="round"/>
        <circle cx="285" cy="135" r="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Left Arm Floating (左臂轻舒) -->
        <path d="M70,210 L0,180" stroke="#ffffff" stroke-width="28" stroke-linecap="round"/>
        <circle cx="-5" cy="175" r="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      </g>

      <!-- Red Chinese Seal (舟 - 神舟巡天) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 舟 -->
          <line x1="28" y1="12" x2="28" y2="17"/>
          <line x1="20" y1="17" x2="20" y2="43"/>
          <line x1="36" y1="17" x2="36" y2="43"/>
          <line x1="14" y1="30" x2="42" y2="30"/>
          <circle cx="28" cy="24" r="1" fill="#ffffff"/>
          <circle cx="28" cy="37" r="1" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. story_dinosaur_p1: 高高的大山下，有一片绿绿的古老森林
  // ==========================================
  {
    id: "story_dinosaur_p1",
    title: "神秘的恐龙世界 - 第1页",
    defs: `
      <linearGradient id="prehistoric_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Primordial Chinese Mountain & Giant Ancient Fern Forest (丹霞群峰，远古苏铁蕨林) -->
      <rect width="1376" height="768" fill="url(#prehistoric_sky)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Lofty Primeval Red Sandstone Peaks (巍峨远古丹霞赤壁大山) -->
      <polygon points="0,520 260,180 520,520" fill="#b45309" opacity="0.45"/>
      <polygon points="360,520 688,140 1020,520" fill="#9a3412" opacity="0.55"/>
      <polygon points="820,520 1140,200 1376,520" fill="#b45309" opacity="0.45"/>

      <!-- Giant Ancient Cycads & Fern Trees (绿油油的史前巨型蕨类古树) -->
      <g filter="url(#dropShadow)">
        <!-- Trunk -->
        <path d="M380,768 L400,420 L440,420 L460,768 Z" fill="#78350f"/>
        <!-- Fern Leaves Fan (张开如绿伞的蕨叶) -->
        <path d="M420,420 Q300,340 160,380" stroke="#15803d" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M420,420 Q340,280 260,260" stroke="#16a34a" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M420,420 Q420,240 420,220" stroke="#22c55e" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M420,420 Q500,280 580,260" stroke="#16a34a" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M420,420 Q540,340 680,380" stroke="#15803d" stroke-width="16" stroke-linecap="round" fill="none"/>

        <!-- Right Fern Tree -->
        <path d="M960,768 L980,440 L1020,440 L1040,768 Z" fill="#78350f"/>
        <path d="M1000,440 Q880,360 760,400" stroke="#15803d" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M1000,440 Q1000,280 1000,250" stroke="#22c55e" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M1000,440 Q1120,360 1240,400" stroke="#15803d" stroke-width="16" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Lush Ancient Meadow (史前青草坡) -->
      <rect x="0" y="620" width="1376" height="148" fill="#15803d"/>

      <!-- Red Chinese Seal (古 - 远古秘境) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 十 on top -->
          <line x1="16" y1="22" x2="38" y2="22"/>
          <line x1="27" y1="14" x2="27" y2="30"/>
          <!-- 口 on bottom -->
          <rect x="18" y="28" width="18" height="14"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. story_dinosaur_p2: 大恐龙在草地慢慢走，吃着青青的小草
  // ==========================================
  {
    id: "story_dinosaur_p2",
    title: "神秘的恐龙世界 - 第2页",
    defs: `
      <linearGradient id="dino_sunny" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <!-- Gentle Giant Sauropod Dinosaur Grazing on Grass (温顺可爱的巨兽长颈龙悠闲吃草) -->
      <rect width="1376" height="768" fill="url(#dino_sunny)"/>
      <circle cx="1180" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Vast Green Meadow with Sparkling Stream (广袤的青青草原) -->
      <path d="M0,500 Q688,440 1376,500 L1376,768 L0,768 Z" fill="#86efac"/>
      <path d="M0,580 L1376,580 L1376,768 L0,768 Z" fill="#22c55e"/>

      <!-- Giant Gentle Long-necked Dinosaur (萌态可掬的大长颈龙) -->
      <g transform="translate(420, 240)" filter="url(#dropShadow)">
        <!-- Massive Body -->
        <ellipse cx="280" cy="240" rx="160" ry="110" fill="#059669"/>
        <ellipse cx="280" cy="250" rx="110" ry="70" fill="#a7f3d0"/>

        <!-- Four Sturdy Pillar Legs (柱子般稳当的大象腿) -->
        <rect x="160" y="280" width="45" height="180" rx="14" fill="#047857"/>
        <rect x="230" y="280" width="45" height="180" rx="14" fill="#059669"/>
        <rect x="330" y="280" width="45" height="180" rx="14" fill="#047857"/>
        <rect x="390" y="280" width="45" height="180" rx="14" fill="#059669"/>

        <!-- Long Tail Curling Behind -->
        <path d="M420,240 Q560,260 620,200" stroke="#059669" stroke-width="32" stroke-linecap="round" fill="none"/>

        <!-- Long Graceful Neck Reaching Down to Grass (长长脖颈低头吃草) -->
        <path d="M160,220 Q80,180 30,260 L-10,340" stroke="#059669" stroke-width="42" stroke-linecap="round" fill="none"/>

        <!-- Dinosaur Head Eating Fresh Grass (咬着鲜美小青草的呆萌恐龙脑袋) -->
        <ellipse cx="-20" cy="350" rx="42" ry="28" fill="#059669"/>
        <circle cx="-10" cy="340" r="6" fill="#0f172a"/>
        <circle cx="-9" cy="338" r="2" fill="#ffffff"/>
        <!-- Fresh green grass in mouth (嘴里叼着一簇青草) -->
        <g stroke="#22c55e" stroke-width="4" stroke-linecap="round" fill="none">
          <path d="M-50,360 Q-70,350 -90,365"/>
          <path d="M-50,365 Q-75,370 -95,355"/>
        </g>
      </g>

      <!-- Red Chinese Seal (龙 - 祥瑞巨龙) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 龙 -->
          <line x1="16" y1="18" x2="38" y2="18"/>
          <path d="M26,18 L18,42"/>
          <path d="M24,28 L38,28 L38,40 Q38,44 32,44"/>
          <circle cx="33" cy="22" r="1" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. story_dinosaur_p3: 恐龙蛋破壳了，可爱小恐龙走出来啦
  // ==========================================
  {
    id: "story_dinosaur_p3",
    title: "神秘的恐龙世界 - 第3页",
    defs: `
      <linearGradient id="nest_glow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#bbf7d0"/>
      </linearGradient>
    `,
    content: `
      <!-- Dinosaur Egg Hatching in Warm Straw Nest (彩纹巨蛋破壳，萌态小恐龙初见世界) -->
      <rect width="1376" height="768" fill="url(#nest_glow)"/>
      <circle cx="688" cy="220" r="140" fill="#fde047" opacity="0.35" filter="url(#softGlow)"/>

      <!-- Warm Straw Nest with Ferns (铺满柔软干草与蕨类的温暖窝巢) -->
      <g transform="translate(440, 420)" filter="url(#dropShadow)">
        <ellipse cx="240" cy="180" rx="300" ry="110" fill="#d97706"/>
        <ellipse cx="240" cy="170" rx="280" ry="90" fill="#f59e0b"/>
        <!-- Straw textures -->
        <path d="M40,160 L120,130 M180,190 L260,160 M340,160 L420,180" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
      </g>

      <!-- Broken Eggshell & Adorable Baby Dinosaur Emerging (头戴破蛋壳帽、好奇微笑的萌恐龙宝宝) -->
      <g transform="translate(560, 240)" filter="url(#dropShadow)">
        <!-- Bottom Half of Eggshell (下半截彩色恐龙蛋壳) -->
        <path d="M30,260 C30,360 250,360 250,260 L210,230 L170,250 L140,220 L100,250 L60,230 Z" fill="#fef08a" stroke="#d97706" stroke-width="5"/>
        <!-- Decorative Chinese Cloud patterns on Eggshell (蛋壳上的如意彩纹) -->
        <path d="M70,300 Q100,280 130,300 M150,300 Q180,280 210,300" stroke="#f59e0b" stroke-width="4" fill="none"/>

        <!-- Cute Green Baby Dinosaur Body -->
        <ellipse cx="140" cy="200" rx="65" ry="55" fill="#22c55e"/>

        <!-- Dinosaur Baby Head -->
        <circle cx="140" cy="120" r="50" fill="#22c55e"/>
        <!-- Snout -->
        <ellipse cx="140" cy="135" rx="30" ry="20" fill="#86efac"/>
        <!-- Big Inquisitive Sparkling Eyes (水汪汪充满好奇的黑眼珠) -->
        <circle cx="120" cy="110" r="8" fill="#0f172a"/>
        <circle cx="122" cy="107" r="3" fill="#ffffff"/>
        <circle cx="160" cy="110" r="8" fill="#0f172a"/>
        <circle cx="162" cy="107" r="3" fill="#ffffff"/>

        <!-- Happy Open Mouth Smile (破壳而出的欢喜微笑) -->
        <path d="M130,135 Q140,148 150,135 Z" fill="#dc2626"/>
        <circle cx="108" cy="128" r="8" fill="#fca5a5" opacity="0.7"/>
        <circle cx="172" cy="128" r="8" fill="#fca5a5" opacity="0.7"/>

        <!-- Cute Eggshell Cap on Head (头上顶着的锯齿小蛋壳帽) -->
        <path d="M90,85 C90,40 190,40 190,85 L170,80 L150,90 L130,80 L110,90 Z" fill="#fef08a" stroke="#d97706" stroke-width="4"/>

        <!-- Baby Paws waving hello (伸出蛋壳向世界打招呼的小爪爪) -->
        <circle cx="70" cy="200" r="14" fill="#22c55e"/>
        <circle cx="210" cy="200" r="14" fill="#22c55e"/>
      </g>

      <!-- Red Chinese Seal (萌 - 生机盎然) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 艹 on top -->
          <line x1="14" y1="16" x2="40" y2="16"/>
          <line x1="20" y1="12" x2="20" y2="20"/>
          <line x1="34" y1="12" x2="34" y2="20"/>
          <!-- 日 on bottom left -->
          <rect x="14" y="24" width="12" height="18"/>
          <line x1="14" y1="33" x2="26" y2="33"/>
          <!-- 月 on bottom right -->
          <rect x="29" y="24" width="12" height="18"/>
          <line x1="29" y1="33" x2="41" y2="33"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. story_little_astronaut_p1: 火箭飞上天，看见弯弯的月亮和明亮的星星
  // ==========================================
  {
    id: "story_little_astronaut_p1",
    title: "小小宇航员 - 第1页",
    defs: `
      <linearGradient id="cosmic_porthole" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
    `,
    content: `
      <!-- View through Spacecraft Porthole: Crescent Moon & Golden Stars (舷窗探天，月牙如钩星汉灿) -->
      <rect width="1376" height="768" fill="url(#cosmic_porthole)"/>

      <!-- Giant Golden Smiling Crescent Moon (皎洁金黄的微笑月牙) -->
      <g transform="translate(860, 140)" filter="url(#dropShadow)">
        <circle cx="90" cy="90" r="110" fill="#fde047" opacity="0.2" filter="url(#softGlow)"/>
        <path d="M40,160 A100,100 0 0,0 160,70 A120,120 0 1,1 40,160 Z" fill="#fde047"/>
        <circle cx="90" cy="115" r="5" fill="#854d0e"/>
        <path d="M96,105 Q104,115 112,105" stroke="#854d0e" stroke-width="3" fill="none"/>
      </g>

      <!-- Twinkling Constellation Stars in Distance (漫天金星) -->
      <g fill="#ffffff" filter="url(#softGlow)">
        <circle cx="280" cy="140" r="5"/>
        <circle cx="420" cy="180" r="6"/>
        <circle cx="560" cy="120" r="5"/>
        <circle cx="740" cy="220" r="7"/>
      </g>

      <!-- Little Chinese Astronaut Looking Out of Round Porthole (手持五角星小红旗趴在舷窗前看星月的萌娃) -->
      <g transform="translate(240, 260)" filter="url(#dropShadow)">
        <!-- Giant Round Brass Porthole Frame (宇宙飞船铜质圆形观察舷窗) -->
        <circle cx="160" cy="160" r="150" fill="none" stroke="#475569" stroke-width="24"/>
        <circle cx="160" cy="160" r="142" fill="none" stroke="#facc15" stroke-width="4"/>

        <!-- Astronaut Child Face Pressed to Window (趴在窗前兴奋观望的中国儿童) -->
        <circle cx="160" cy="160" r="60" fill="#fed7aa"/>
        <!-- Soft space helmet cap (白色宇航软帽) -->
        <path d="M105,150 C105,90 215,90 215,150 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <circle cx="160" cy="95" r="8" fill="#dc2626"/>

        <!-- Sparkly Excited Eyes (满眼星光的兴奋眼眸) -->
        <circle cx="138" cy="155" r="6" fill="#0f172a"/>
        <circle cx="140" cy="152" r="2" fill="#ffffff"/>
        <circle cx="182" cy="155" r="6" fill="#0f172a"/>
        <circle cx="184" cy="152" r="2" fill="#ffffff"/>

        <!-- Happy Open Mouth Smile (欣喜赞叹) -->
        <circle cx="160" cy="178" r="8" fill="#dc2626"/>
        <circle cx="125" cy="168" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="195" cy="168" r="8" fill="#fca5a5" opacity="0.6"/>

        <!-- Hand Holding Little Red Flag with Golden Star (手握五星红旗) -->
        <line x1="240" y1="180" x2="240" y2="280" stroke="#facc15" stroke-width="5"/>
        <rect x="240" y="180" width="55" height="38" fill="#dc2626"/>
        <polygon points="255,190 257,195 262,195 258,198 260,203 255,200 250,203 252,198 248,195 253,195" fill="#facc15"/>
      </g>

      <!-- Red Chinese Seal (天 - 九天揽月) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 天 -->
          <line x1="18" y1="18" x2="36" y2="18"/>
          <line x1="14" y1="26" x2="40" y2="26"/>
          <path d="M27,18 L16,42"/>
          <path d="M27,26 L38,42"/>
        </g>
      </g>
    `
  }
];

console.log(`Rendering ${STORIES_FINAL.length} final storybook illustrations...`);

for (const item of STORIES_FINAL) {
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

console.log("\nAll 7 final storybook illustrations generated successfully!");
