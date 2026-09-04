import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_poems";

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

const POEMS = [
  // 1. poem_yonge 《咏鹅》 (骆宾王) - 白毛浮绿水，红掌拨清波
  {
    id: "poem_yonge",
    title: "咏鹅",
    defs: `
      <linearGradient id="sky_e" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="water_e" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <!-- Sky & Sunny Morning -->
      <rect width="1376" height="420" fill="url(#sky_e)"/>
      <circle cx="1180" cy="130" r="65" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Swaying Willow Branches on Top-Left -->
      <g filter="url(#dropShadow)">
        <path d="M0,20 Q180,60 380,20" fill="none" stroke="#78350f" stroke-width="14" stroke-linecap="round"/>
        <path d="M100,35 Q110,160 80,260" fill="none" stroke="#15803d" stroke-width="4"/>
        <path d="M180,45 Q195,180 170,290" fill="none" stroke="#15803d" stroke-width="4"/>
        <path d="M260,35 Q280,160 250,270" fill="none" stroke="#15803d" stroke-width="4"/>
        <!-- Willow Leaves -->
        <g fill="#22c55e">
          <ellipse cx="85" cy="140" rx="14" ry="5" transform="rotate(-30 85 140)"/>
          <ellipse cx="95" cy="200" rx="14" ry="5" transform="rotate(-30 95 200)"/>
          <ellipse cx="180" cy="130" rx="14" ry="5" transform="rotate(-30 180 130)"/>
          <ellipse cx="190" cy="210" rx="14" ry="5" transform="rotate(-30 190 210)"/>
          <ellipse cx="265" cy="140" rx="14" ry="5" transform="rotate(-30 265 140)"/>
          <ellipse cx="270" cy="210" rx="14" ry="5" transform="rotate(-30 270 210)"/>
        </g>
      </g>

      <!-- Soft Distant Hills -->
      <path d="M0,420 Q350,330 750,380 T1376,350 L1376,768 L0,768 Z" fill="#86efac"/>

      <!-- Clear Green Water Lake -->
      <rect y="400" width="1376" height="368" fill="url(#water_e)"/>
      <!-- Water Ripples -->
      <g stroke="#ffffff" stroke-width="3" opacity="0.6" stroke-linecap="round">
        <path d="M420,530 Q540,540 660,530"/>
        <path d="M780,510 Q900,520 1020,510"/>
        <path d="M240,640 Q380,650 520,640"/>
        <path d="M820,660 Q960,670 1100,660"/>
      </g>

      <!-- Big Emerald Lotus Leaf & Pink Lotus (Right) -->
      <g transform="translate(1000, 480)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="50" rx="150" ry="60" fill="#16a34a"/>
        <ellipse cx="0" cy="50" rx="135" ry="50" fill="#22c55e"/>
        <!-- Lotus Flower -->
        <ellipse cx="30" cy="0" rx="20" ry="45" fill="#f472b6" transform="rotate(-20 30 0)"/>
        <ellipse cx="70" cy="0" rx="20" ry="45" fill="#f472b6" transform="rotate(20 70 0)"/>
        <ellipse cx="50" cy="-10" rx="22" ry="50" fill="#fb7185"/>
        <circle cx="50" cy="0" r="14" fill="#fde047"/>
      </g>

      <!-- Centerpiece: Elegant White Goose / Swan Singing to Heaven -->
      <g transform="translate(480, 310)" filter="url(#dropShadow)">
        <!-- Ripples around goose -->
        <ellipse cx="160" cy="240" rx="190" ry="35" fill="none" stroke="#e0f2fe" stroke-width="6" opacity="0.8"/>
        <!-- Red Webbed Feet (红掌拨清波) -->
        <g transform="translate(110, 240)">
          <path d="M0,0 L-25,25 L-5,25 Z" fill="#ef4444"/>
          <path d="M60,0 L35,28 L55,28 Z" fill="#ef4444"/>
        </g>
        <!-- Floating White Body -->
        <path d="M40,160 C20,240 180,270 280,210 C320,170 300,140 240,140 C140,140 80,140 40,160 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
        <!-- Wing Feathers -->
        <path d="M90,150 C140,130 220,140 260,180 C210,190 140,190 90,150 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Graceful Curved Neck (曲项向天歌) -->
        <path d="M70,170 C50,110 50,40 100,15 C130,-5 150,20 135,55 C120,90 110,140 100,170 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
        <!-- Goose Head & Forehead Crown Knot -->
        <ellipse cx="120" cy="18" rx="26" ry="22" fill="#ffffff"/>
        <!-- Red Crown Bump (红顶) -->
        <circle cx="118" cy="4" r="14" fill="#ef4444"/>
        <!-- Orange/Red Beak (Looking up towards sky) -->
        <polygon points="140,12 185,-5 145,26" fill="#f97316"/>
        <!-- Eye -->
        <circle cx="118" cy="16" r="4" fill="#1e293b"/>
        <circle cx="116" cy="14" r="1.5" fill="#ffffff"/>
      </g>
    `
  },

  // 2. poem_jingyesi 《静夜思》 (李白) - 床前明月光，疑是地上霜
  {
    id: "poem_jingyesi",
    title: "静夜思",
    defs: `
      <linearGradient id="sky_j" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      <linearGradient id="moonlightBeam" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
        <stop offset="60%" stop-color="#e0e7ff" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#c7d2fe" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="frostFloor" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#e0e7ff"/>
        <stop offset="50%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#c7d2fe"/>
      </linearGradient>
    `,
    content: `
      <!-- Night Sky -->
      <rect width="1376" height="768" fill="url(#sky_j)"/>

      <!-- Twinkling Night Stars -->
      <g fill="#ffffff">
        <circle cx="180" cy="100" r="2.5"/><circle cx="280" cy="70" r="3"/><circle cx="420" cy="120" r="2"/>
        <circle cx="890" cy="80" r="2"/><circle cx="1020" cy="140" r="2.5"/>
      </g>

      <!-- Immense Bright Full Moon (Top-Left) -->
      <g transform="translate(320, 160)" filter="url(#dropShadow)">
        <circle cx="0" cy="0" r="130" fill="#ffffff" opacity="0.2" filter="url(#softGlow)"/>
        <circle cx="0" cy="0" r="90" fill="#ffffff" opacity="0.4" filter="url(#softGlow)"/>
        <circle cx="0" cy="0" r="70" fill="#fef08a"/>
        <circle cx="0" cy="0" r="65" fill="#fef9c3"/>
      </g>

      <!-- Traditional Chinese Lattice Window Arch -->
      <path d="M120,0 L120,480 C120,620 520,620 520,480 L520,0 Z" fill="none" stroke="#78350f" stroke-width="24"/>
      <!-- Window Grilles -->
      <line x1="320" y1="0" x2="320" y2="550" stroke="#78350f" stroke-width="12"/>
      <line x1="120" y1="260" x2="520" y2="260" stroke="#78350f" stroke-width="12"/>

      <!-- Bamboo Leaves Silhouette Outside Window -->
      <g fill="#064e3b" opacity="0.8">
        <path d="M130,220 C180,210 240,230 250,220 C240,210 180,190 130,220 Z"/>
        <path d="M140,270 C200,260 260,280 270,270 C260,255 190,240 140,270 Z"/>
        <path d="M120,330 C170,320 230,340 240,330 C230,315 170,300 120,330 Z"/>
      </g>

      <!-- Moonlight Streaming Down onto Wooden Floor (疑是地上霜) -->
      <polygon points="320,180 80,768 780,768 450,260" fill="url(#moonlightBeam)"/>
      <!-- Frosty Glow on Floor -->
      <ellipse cx="430" cy="720" rx="320" ry="48" fill="url(#frostFloor)" opacity="0.75" filter="url(#softGlow)"/>

      <!-- Poet Li Bai Gazing Up at Moon in Hanfu Robes (Right) -->
      <g transform="translate(850, 290)" filter="url(#dropShadow)">
        <!-- Elegant Flowing Hanfu Robes -->
        <path d="M140,478 L70,280 C120,220 210,220 260,280 L200,478 Z" fill="#4338ca"/>
        <path d="M100,320 L165,478 L230,320 Z" fill="#6366f1"/>
        <!-- White Inner Collar -->
        <path d="M140,225 L165,265 L190,225" stroke="#ffffff" stroke-width="8" fill="none"/>
        <!-- Wide Sleeves held behind back in contemplative pose -->
        <path d="M90,280 C50,330 60,400 110,420 C130,420 140,380 130,320 Z" fill="#3730a3"/>
        <path d="M240,280 C280,330 270,400 220,420 C200,420 190,380 200,320 Z" fill="#3730a3"/>
        <!-- Head looking up and to the left (举头望明月) -->
        <g transform="translate(165, 140) rotate(-22)">
          <!-- Head -->
          <ellipse cx="0" cy="0" rx="46" ry="42" fill="#fde68a"/>
          <!-- Black Hair Bun & Crown Ribbon -->
          <path d="M-40,5 C-40,-35 40,-35 40,5 Z" fill="#0f172a"/>
          <circle cx="0" cy="-42" r="18" fill="#0f172a"/>
          <rect x="-8" y="-60" width="16" height="30" rx="4" fill="#f59e0b"/>
          <path d="M0,-35 Q-30,-20 -50,-10" stroke="#f59e0b" stroke-width="4" fill="none"/>
          <!-- Peaceful Eyes Gazing Upward -->
          <ellipse cx="-18" cy="-5" rx="5.5" ry="7.5" fill="#1e293b"/>
          <circle cx="-16" cy="-8" r="2.2" fill="#ffffff"/>
          <ellipse cx="14" cy="-5" rx="5.5" ry="7.5" fill="#1e293b"/>
          <circle cx="16" cy="-8" r="2.2" fill="#ffffff"/>
          <!-- Gentle Smile -->
          <path d="M-10,18 Q0,26 10,18" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
        </g>
      </g>
    `
  },

  // 3. poem_chunxiao 《春晓》 (孟浩然) - 春眠不觉晓，处处闻啼鸟
  {
    id: "poem_chunxiao",
    title: "春晓",
    defs: `
      <linearGradient id="sky_c" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="grass_c" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="100%" stop-color="#22c55e"/>
      </linearGradient>
    `,
    content: `
      <!-- Fresh Spring Dawn Sky -->
      <rect width="1376" height="768" fill="url(#sky_c)"/>
      <circle cx="1120" cy="160" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Lush Rolling Spring Green Hills -->
      <path d="M0,520 Q350,400 750,470 T1376,430 L1376,768 L0,768 Z" fill="url(#grass_c)"/>

      <!-- Ancient Spring Blossom Tree with Gnarled Branches -->
      <g filter="url(#dropShadow)">
        <path d="M0,280 C180,240 280,180 460,180 C580,180 720,240 920,220" fill="none" stroke="#78350f" stroke-width="26" stroke-linecap="round"/>
        <path d="M320,210 Q380,110 480,90" fill="none" stroke="#78350f" stroke-width="16" stroke-linecap="round"/>
        <path d="M620,200 Q680,130 780,110" fill="none" stroke="#78350f" stroke-width="14" stroke-linecap="round"/>

        <!-- Abundant Soft Pink Spring Blossoms -->
        <g fill="#fda4af">
          <circle cx="280" cy="180" r="24"/><circle cx="265" cy="168" r="18"/><circle cx="295" cy="168" r="18"/><circle cx="280" cy="174" r="9" fill="#fef08a"/>
          <circle cx="450" cy="150" r="26"/><circle cx="434" cy="136" r="20"/><circle cx="466" cy="136" r="20"/><circle cx="450" cy="142" r="9" fill="#fef08a"/>
          <circle cx="680" cy="160" r="25"/><circle cx="664" cy="146" r="19"/><circle cx="696" cy="146" r="19"/><circle cx="680" cy="152" r="9" fill="#fef08a"/>
          <circle cx="860" cy="190" r="24"/><circle cx="845" cy="178" r="18"/><circle cx="875" cy="178" r="18"/><circle cx="860" cy="184" r="9" fill="#fef08a"/>
        </g>
      </g>

      <!-- Singing Spring Songbirds on Tree Branch (处处闻啼鸟) -->
      <!-- Bird 1 -->
      <g transform="translate(480, 70)" filter="url(#dropShadow)">
        <!-- Body -->
        <ellipse cx="25" cy="20" rx="22" ry="16" fill="#38bdf8"/>
        <ellipse cx="18" cy="22" rx="14" ry="10" fill="#fef08a"/>
        <!-- Head -->
        <circle cx="40" cy="10" r="14" fill="#0284c7"/>
        <polygon points="52,8 66,11 52,14" fill="#f97316"/>
        <circle cx="42" cy="8" r="2.5" fill="#1e293b"/>
        <!-- Tail -->
        <polygon points="5,24 -15,16 -10,28" fill="#0369a1"/>
        <!-- Musical notes coming from beak -->
        <g fill="#f59e0b" transform="translate(68, -15)">
          <ellipse cx="6" cy="12" rx="5" ry="3.5" transform="rotate(-20 6 12)"/>
          <line x1="10" y1="10" x2="10" y2="0" stroke="#f59e0b" stroke-width="2"/>
        </g>
      </g>

      <!-- Bird 2 -->
      <g transform="translate(740, 95)" filter="url(#dropShadow)">
        <ellipse cx="25" cy="20" rx="20" ry="15" fill="#ec4899"/>
        <circle cx="40" cy="10" r="13" fill="#db2777"/>
        <polygon points="50,8 62,11 50,14" fill="#facc15"/>
        <circle cx="42" cy="8" r="2.5" fill="#1e293b"/>
      </g>

      <!-- Petals Falling Gently on Lawn (夜来风雨声，花落知多少) -->
      <g fill="#f43f5e" opacity="0.8">
        <ellipse cx="320" cy="480" rx="12" ry="7" transform="rotate(25 320 480)"/>
        <ellipse cx="480" cy="530" rx="14" ry="8" transform="rotate(-35 480 530)"/>
        <ellipse cx="620" cy="490" rx="13" ry="7" transform="rotate(45 620 490)"/>
        <ellipse cx="780" cy="560" rx="15" ry="8" transform="rotate(-15 780 560)"/>
        <ellipse cx="940" cy="520" rx="12" ry="7" transform="rotate(30 940 520)"/>
        <ellipse cx="1100" cy="580" rx="14" ry="8" transform="rotate(-25 1100 580)"/>
      </g>

      <!-- Cute Ancient Courtyard Pavilion in Distance -->
      <g transform="translate(180, 360)" filter="url(#dropShadow)">
        <rect x="20" y="70" width="12" height="80" fill="#78350f"/>
        <rect x="128" y="70" width="12" height="80" fill="#78350f"/>
        <polygon points="80,10 -10,75 170,75" fill="#dc2626"/>
        <rect x="10" y="145" width="140" height="15" rx="3" fill="#94a3b8"/>
      </g>
    `
  },

  // 4. poem_minnong 《悯农》 (李绅) - 锄禾日当午，汗滴禾下土
  {
    id: "poem_minnong",
    title: "悯农",
    defs: `
      <linearGradient id="sky_m" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="40%" stop-color="#bae6fd"/>
        <stop offset="85%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fdba74"/>
      </linearGradient>
      <linearGradient id="field_m" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#facc15"/>
        <stop offset="60%" stop-color="#ca8a04"/>
        <stop offset="100%" stop-color="#854d0e"/>
      </linearGradient>
    `,
    content: `
      <!-- High Noon Sunny Sky (日当午) -->
      <rect width="1376" height="768" fill="url(#sky_m)"/>
      <!-- Blazing High Sun -->
      <circle cx="688" cy="110" r="140" fill="#ffffff" opacity="0.3" filter="url(#softGlow)"/>
      <circle cx="688" cy="110" r="75" fill="#facc15" filter="url(#softGlow)"/>
      <circle cx="688" cy="110" r="62" fill="#fffbeb"/>

      <!-- Golden Rice Terraces & Fields -->
      <path d="M0,450 Q350,380 750,430 T1376,400 L1376,768 L0,768 Z" fill="#ca8a04"/>
      <path d="M-50,530 Q400,460 850,510 T1450,480 L1450,768 L-50,768 Z" fill="url(#field_m)"/>

      <!-- Golden Ears of Grain Rows (禾) -->
      <g stroke="#eab308" stroke-width="4" stroke-linecap="round">
        ${[100, 180, 260, 340, 880, 960, 1040, 1120, 1200, 1280].map(x => `
          <line x1="${x}" y1="520" x2="${x}" y2="440"/>
          <circle cx="${x-6}" cy="445" r="5" fill="#fde047"/>
          <circle cx="${x+6}" cy="440" r="5" fill="#fde047"/>
          <circle cx="${x-6}" cy="430" r="5" fill="#fde047"/>
          <circle cx="${x+6}" cy="425" r="5" fill="#fde047"/>
        `).join("")}
      </g>

      <!-- Kind Elderly Farmer Weeding with Hoe (锄禾日当午) -->
      <g transform="translate(540, 320)" filter="url(#dropShadow)">
        <!-- Straw Conical Hat -->
        <polygon points="120,10 20,75 220,75" fill="#d97724"/>
        <ellipse cx="120" cy="75" rx="105" ry="18" fill="#b45309"/>
        <!-- Face & Beard -->
        <ellipse cx="120" cy="95" rx="42" ry="38" fill="#fed7aa"/>
        <!-- Kind Smiling Eyes -->
        <path d="M100,95 Q108,88 116,95" stroke="#78350f" stroke-width="3" fill="none"/>
        <path d="M128,95 Q136,88 144,95" stroke="#78350f" stroke-width="3" fill="none"/>
        <!-- Glistening Sweat Drop Falling (汗滴禾下土) -->
        <path d="M155,108 C155,100 162,100 162,108 C162,116 155,116 155,108 Z" fill="#38bdf8" filter="url(#softGlow)"/>
        <!-- Linen Clothes -->
        <path d="M75,280 L90,140 L150,140 L165,280 Z" fill="#f8fafc"/>
        <rect x="90" y="240" width="60" height="60" rx="8" fill="#3b82f6"/>
        <!-- Strong Arms Holding Wooden Hoe -->
        <path d="M100,160 Q80,220 50,230" stroke="#fed7aa" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M140,160 Q120,210 90,220" stroke="#fed7aa" stroke-width="16" stroke-linecap="round" fill="none"/>
        <!-- Long Wooden Hoe Shaft & Iron Blade -->
        <line x1="30" y1="120" x2="100" y2="380" stroke="#78350f" stroke-width="10" stroke-linecap="round"/>
        <polygon points="90,370 125,385 105,395 70,380" fill="#475569"/>
      </g>
    `
  },

  // 5. poem_dengguanquelou 《登鹳雀楼》 (王之涣) - 白日依山尽，黄河入海流
  {
    id: "poem_dengguanquelou",
    title: "登鹳雀楼",
    defs: `
      <linearGradient id="sunset_g" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="35%" stop-color="#fb923c"/>
        <stop offset="70%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="river_g" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="50%" stop-color="#d97724"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    `,
    content: `
      <!-- Radiant Sunset Sky -->
      <rect width="1376" height="768" fill="url(#sunset_g)"/>

      <!-- Golden White Sun Sinking Behind Peaks (白日依山尽) -->
      <circle cx="480" cy="380" r="110" fill="#ffffff" opacity="0.9" filter="url(#softGlow)"/>

      <!-- Distant Mountain Ranges -->
      <path d="M0,520 Q220,320 480,420 T980,340 T1376,460 L1376,768 L0,768 Z" fill="#9a3412" opacity="0.8"/>
      <path d="M0,580 Q280,420 600,500 T1120,430 T1376,550 L1376,768 L0,768 Z" fill="#7c2d12"/>

      <!-- Grand Winding Yellow River (黄河入海流) -->
      <path d="M0,640 Q320,530 650,600 T1376,560 L1376,768 L0,768 Z" fill="url(#river_g)"/>

      <!-- Magnificent Multi-Tiered Ancient Tower Pavilion (鹳雀楼) -->
      <g transform="translate(860, 210)" filter="url(#dropShadow)">
        <!-- Stone Base Platform -->
        <polygon points="40,550 0,580 320,580 280,550" fill="#475569"/>
        <!-- Level 1 Body & Roof -->
        <rect x="50" y="420" width="220" height="130" fill="#991b1b"/>
        <polygon points="160,340 10,430 310,430" fill="#b91c1c"/>
        <!-- Level 2 Body & Roof -->
        <rect x="70" y="270" width="180" height="110" fill="#991b1b"/>
        <polygon points="160,200 30,280 290,280" fill="#b91c1c"/>
        <!-- Level 3 (更上一层楼) -->
        <rect x="90" y="140" width="140" height="85" fill="#991b1b"/>
        <polygon points="160,70 50,150 270,150" fill="#b91c1c"/>
        <!-- Crown Spire -->
        <circle cx="160" cy="65" r="14" fill="#facc15"/>
      </g>
    `
  },

  // 6. poem_jiangxue 《江雪》 (柳宗元) - 孤舟蓑笠翁，独钓寒江雪
  {
    id: "poem_jiangxue",
    title: "江雪",
    defs: `
      <linearGradient id="sky_jx" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="60%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="iceRiver" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#64748b"/>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
    `,
    content: `
      <!-- Gray Winter Sky -->
      <rect width="1376" height="768" fill="url(#sky_jx)"/>

      <!-- Snow-Capped Distant Mountains (千山鸟飞绝) -->
      <polygon points="180,480 340,240 500,480" fill="#f8fafc"/>
      <polygon points="420,510 650,210 880,510" fill="#ffffff"/>
      <polygon points="820,490 1020,260 1220,490" fill="#f8fafc"/>

      <!-- Freezing Cold River (寒江) -->
      <rect y="480" width="1376" height="288" fill="url(#iceRiver)"/>

      <!-- Soft Snowflakes Falling -->
      <g fill="#ffffff" opacity="0.9">
        ${[80, 200, 320, 480, 620, 780, 920, 1080, 1220, 1340].map(x => `
          <circle cx="${x}" cy="${(x*7)%400 + 50}" r="3.5"/>
          <circle cx="${(x+120)%1376}" cy="${(x*11)%400 + 80}" r="4.5"/>
        `).join("")}
      </g>

      <!-- Solitary Wooden Boat & Old Fisherman (孤舟蓑笠翁，独钓寒江雪) -->
      <g transform="translate(560, 500)" filter="url(#dropShadow)">
        <!-- Small Wooden Skiff -->
        <path d="M0,70 C60,110 240,110 300,70 L260,95 C190,115 110,115 40,95 Z" fill="#78350f"/>
        <!-- Straw Bamboo Hat (笠) -->
        <polygon points="150,15 90,55 210,55" fill="#d97724"/>
        <ellipse cx="150" cy="55" rx="65" ry="12" fill="#b45309"/>
        <!-- Straw Cloak (蓑) -->
        <path d="M120,55 L90,105 L210,105 L180,55 Z" fill="#b45309"/>
        <!-- Fishing Rod held over icy water -->
        <line x1="165" y1="75" x2="330" y2="10" stroke="#78350f" stroke-width="4" stroke-linecap="round"/>
        <!-- Thin Fishing Line into River -->
        <line x1="330" y1="10" x2="330" y2="120" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,3"/>
      </g>
    `
  },

  // 7. poem_chishang 《池上》 (白居易) - 小娃撑小艇，偷采白莲回
  {
    id: "poem_chishang",
    title: "池上",
    defs: `
      <linearGradient id="sky_cs" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="pond_cs" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Blue Sky -->
      <rect width="1376" height="768" fill="url(#sky_cs)"/>

      <!-- Clear Lotus Pond Water -->
      <rect y="360" width="1376" height="408" fill="url(#pond_cs)"/>

      <!-- Green Duckweed Covering Pond Surface (浮萍一道开) -->
      <g fill="#22c55e" opacity="0.9">
        ${[60, 140, 220, 300, 380, 920, 1000, 1080, 1160, 1240].map(x => `
          <ellipse cx="${x}" cy="420" rx="35" ry="15"/>
          <ellipse cx="${x+30}" cy="460" rx="40" ry="18"/>
          <ellipse cx="${x-20}" cy="510" rx="35" ry="16"/>
        `).join("")}
      </g>

      <!-- Water Path Parted by Little Skiff (浮萍一道开) -->
      <polygon points="460,360 840,360 920,768 380,768" fill="#0284c7" opacity="0.95"/>
      <path d="M460,400 Q650,420 840,400" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.6"/>

      <!-- Giant White Lotus Blossoms (偷采白莲回) -->
      <g transform="translate(1080, 480)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="40" rx="140" ry="50" fill="#15803d"/>
        <!-- Pure White Lotus Blossom -->
        <g fill="#ffffff" stroke="#e2e8f0" stroke-width="2">
          <ellipse cx="20" cy="0" rx="20" ry="45" transform="rotate(-20 20 0)"/>
          <ellipse cx="60" cy="0" rx="20" ry="45" transform="rotate(20 60 0)"/>
          <ellipse cx="40" cy="-10" rx="22" ry="50"/>
        </g>
        <circle cx="40" cy="0" r="14" fill="#fde047"/>
      </g>

      <!-- Little Boy in Rowboat with White Lotus (小娃撑小艇) -->
      <g transform="translate(480, 420)" filter="url(#dropShadow)">
        <!-- Wooden Skiff -->
        <path d="M0,100 C60,160 300,160 360,100 L320,135 C240,160 120,160 40,135 Z" fill="#d97724"/>
        <!-- Little Boy Steering Wooden Pole -->
        <line x1="120" y1="20" x2="60" y2="180" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <!-- Child in Red Waistcoat -->
        <path d="M120,110 L135,50 L175,50 L190,110 Z" fill="#ef4444"/>
        <!-- Head with Cute Bun -->
        <ellipse cx="155" cy="20" rx="26" ry="24" fill="#fde68a"/>
        <circle cx="155" cy="-6" r="10" fill="#1e1b4b"/>
        <!-- Happy Giggling Smile -->
        <circle cx="148" cy="18" r="3" fill="#1e293b"/>
        <circle cx="164" cy="18" r="3" fill="#1e293b"/>
        <path d="M150,26 Q156,34 162,26" stroke="#991b1b" stroke-width="2.5" fill="none"/>
        <!-- Freshly Picked White Lotus in Boat -->
        <ellipse cx="230" cy="90" rx="16" ry="30" fill="#ffffff"/>
        <ellipse cx="250" cy="90" rx="16" ry="30" fill="#ffffff"/>
      </g>
    `
  },

  // 8. poem_xiaochi 《小池》 (杨万里) - 小荷才露尖尖角，早有蜻蜓立上头
  {
    id: "poem_xiaochi",
    title: "小池",
    defs: `
      <linearGradient id="sky_xc" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#dcfce7"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="water_xc" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#06b6d4"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    `,
    content: `
      <!-- Warm Sunny Garden Sky (爱晴柔) -->
      <rect width="1376" height="768" fill="url(#sky_xc)"/>

      <!-- Willow Tree Shade Dappling Water (树阴照水爱晴柔) -->
      <path d="M0,0 Q320,120 650,40" stroke="#15803d" stroke-width="22" fill="none" stroke-linecap="round"/>
      <g fill="#22c55e" opacity="0.8">
        <circle cx="180" cy="80" r="45"/><circle cx="280" cy="100" r="55"/><circle cx="420" cy="80" r="50"/>
      </g>

      <!-- Clear Spring Water Pool (泉眼无声惜细流) -->
      <rect y="400" width="1376" height="368" fill="url(#water_xc)"/>
      <ellipse cx="280" cy="520" rx="180" ry="30" fill="#0891b2" opacity="0.6"/>

      <!-- Tiny Trickling Spring Stream (泉眼细流) -->
      <path d="M120,440 Q180,480 240,510" stroke="#cffafe" stroke-width="6" fill="none" stroke-linecap="round"/>

      <!-- Centerpiece: Tender Young Pink Lotus Bud (小荷才露尖尖角) -->
      <g transform="translate(688, 330)" filter="url(#dropShadow)">
        <!-- Slender Green Stem Rising from Water -->
        <path d="M0,260 Q-10,160 0,60" stroke="#16a34a" stroke-width="14" fill="none" stroke-linecap="round"/>
        <!-- Pointed Lotus Bud (尖尖角) -->
        <path d="M0,60 C-25,40 -25,-10 0,-40 C25,-10 25,40 0,60 Z" fill="#fb7185"/>
        <path d="M0,45 C-15,30 -15,0 0,-30 C15,0 15,30 0,45 Z" fill="#fda4af"/>
        <path d="M0,30 C-6,15 -6,0 0,-20 C6,0 6,15 0,30 Z" fill="#ffffff"/>

        <!-- Cute Red-Winged Dragonfly Resting on Sharp Tip (早有蜻蜓立上头) -->
        <g transform="translate(0, -42)" filter="url(#dropShadow)">
          <!-- Dragonfly Body -->
          <ellipse cx="0" cy="-22" rx="4.5" ry="24" fill="#0284c7"/>
          <circle cx="0" cy="-48" r="8" fill="#0369a1"/>
          <!-- Big Sparkling Eyes -->
          <circle cx="-5" cy="-52" r="4" fill="#38bdf8"/>
          <circle cx="5" cy="-52" r="4" fill="#38bdf8"/>
          <!-- Delicate Transparent Wings Spanning Left & Right -->
          <ellipse cx="-45" cy="-35" rx="42" ry="11" fill="#fca5a5" opacity="0.85" transform="rotate(-15 -45 -35)"/>
          <ellipse cx="-40" cy="-22" rx="36" ry="9" fill="#fca5a5" opacity="0.85" transform="rotate(-5 -40 -22)"/>
          <ellipse cx="45" cy="-35" rx="42" ry="11" fill="#fca5a5" opacity="0.85" transform="rotate(15 45 -35)"/>
          <ellipse cx="40" cy="-22" rx="36" ry="9" fill="#fca5a5" opacity="0.85" transform="rotate(5 40 -22)"/>
        </g>
      </g>
    `
  },

  // 9. poem_gulangyuexing 《古朗月行》 (李白) - 小时不知月，呼作白玉盘
  {
    id: "poem_gulangyuexing",
    title: "古朗月行",
    defs: `
      <linearGradient id="sky_gl" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="40%" stop-color="#1e1b4b"/>
        <stop offset="85%" stop-color="#312e81"/>
        <stop offset="100%" stop-color="#4338ca"/>
      </linearGradient>
      <radialGradient id="jadeMoon" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="70%" stop-color="#ecfdf5"/>
        <stop offset="100%" stop-color="#a7f3d0"/>
      </radialGradient>
    `,
    content: `
      <!-- Deep Blue Celestial Sky (青云端) -->
      <rect width="1376" height="768" fill="url(#sky_gl)"/>

      <!-- Grand White Jade Disc Moon (呼作白玉盘) -->
      <g transform="translate(688, 220)" filter="url(#dropShadow)">
        <circle cx="0" cy="0" r="160" fill="#ffffff" opacity="0.25" filter="url(#softGlow)"/>
        <circle cx="0" cy="0" r="110" fill="url(#jadeMoon)" filter="url(#softGlow)"/>
        <!-- Jade Pattern Ring -->
        <circle cx="0" cy="0" r="100" fill="none" stroke="#6ee7b7" stroke-width="4" opacity="0.6"/>
      </g>

      <!-- Floating Celestial Turquoise Clouds (飞在青云端) -->
      <g fill="#67e8f9" opacity="0.4" filter="url(#softGlow)">
        <ellipse cx="450" cy="240" rx="180" ry="35"/>
        <ellipse cx="920" cy="210" rx="200" ry="38"/>
      </g>

      <!-- Child Pointing in Wonder up at White Jade Moon -->
      <g transform="translate(630, 480)" filter="url(#dropShadow)">
        <!-- Traditional Little Kid Robes -->
        <path d="M40,240 L50,110 L110,110 L120,240 Z" fill="#f59e0b"/>
        <!-- Head -->
        <ellipse cx="80" cy="65" rx="38" ry="34" fill="#fde68a"/>
        <!-- Cute Hair Buns -->
        <circle cx="50" cy="35" r="14" fill="#1e1b4b"/>
        <circle cx="110" cy="35" r="14" fill="#1e1b4b"/>
        <circle cx="50" cy="35" r="7" fill="#ef4444"/>
        <circle cx="110" cy="35" r="7" fill="#ef4444"/>
        <!-- Face looking up in amazement -->
        <ellipse cx="70" cy="60" rx="5" ry="7" fill="#1e293b"/>
        <ellipse cx="90" cy="60" rx="5" ry="7" fill="#1e293b"/>
        <!-- O-shaped mouth of wonder -->
        <circle cx="80" cy="76" r="6" fill="#991b1b"/>
        <!-- Arm pointing straight up to the White Jade Moon -->
        <line x1="95" y1="120" x2="105" y2="20" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
        <circle cx="105" cy="20" r="8" fill="#fde68a"/>
      </g>
    `
  },

  // 10. poem_guyuan_cao 《草》 (白居易) - 野火烧不尽，春风吹又生
  {
    id: "poem_guyuan_cao",
    title: "草",
    defs: `
      <linearGradient id="sky_cao" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="55%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="prairie_cao" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="50%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast Open Blue Sky (离离原上草) -->
      <rect width="1376" height="768" fill="url(#sky_cao)"/>
      <circle cx="1200" cy="140" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Endless Rolling Prairie Hills -->
      <path d="M0,460 Q350,340 750,420 T1376,380 L1376,768 L0,768 Z" fill="url(#prairie_cao)"/>
      <path d="M-50,560 Q450,440 900,520 T1450,470 L1450,768 L-50,768 Z" fill="#22c55e"/>

      <!-- Tender Green Shoots Sprouting Resiliently (春风吹又生) -->
      <g stroke="#15803d" stroke-width="6" stroke-linecap="round" filter="url(#dropShadow)">
        ${[120, 240, 380, 520, 680, 820, 960, 1100, 1240].map(x => `
          <path d="M${x},590 Q${x-20},520 ${x-30},490" fill="none"/>
          <path d="M${x},590 Q${x+20},510 ${x+35},480" fill="none"/>
          <path d="M${x},590 Q${x},500 ${x+5},460" fill="none"/>
        `).join("")}
      </g>

      <!-- Joyful Little Children & Lamb on Spring Prairie -->
      <g transform="translate(620, 420)" filter="url(#dropShadow)">
        <!-- Cute White Lamb -->
        <g transform="translate(180, 80)">
          <!-- Wool Body -->
          <ellipse cx="40" cy="40" rx="35" ry="26" fill="#ffffff"/>
          <circle cx="20" cy="25" r="16" fill="#ffffff"/>
          <circle cx="45" cy="20" r="18" fill="#ffffff"/>
          <circle cx="55" cy="35" r="16" fill="#ffffff"/>
          <!-- Head -->
          <ellipse cx="70" cy="25" rx="16" ry="14" fill="#fed7aa"/>
          <ellipse cx="65" cy="14" rx="6" ry="12" fill="#fed7aa" transform="rotate(-30 65 14)"/>
          <circle cx="74" cy="22" r="2.5" fill="#1e293b"/>
          <!-- Legs -->
          <line x1="25" y1="60" x2="25" y2="85" stroke="#1e293b" stroke-width="6"/>
          <line x1="55" y1="60" x2="55" y2="85" stroke="#1e293b" stroke-width="6"/>
        </g>
        <!-- Child Running in Spring Breeze -->
        <rect x="70" y="70" width="35" height="45" rx="8" fill="#ef4444"/>
        <ellipse cx="88" cy="45" rx="24" ry="22" fill="#fde68a"/>
        <line x1="80" y1="115" x2="65" y2="155" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
        <line x1="95" y1="115" x2="115" y2="155" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
      </g>
    `
  }
];

console.log(`Generating ${POEMS.length} classic ancient poem illustrations...`);

for (const poem of POEMS) {
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

console.log("\nAll 10 ancient poem illustrations successfully generated!");
