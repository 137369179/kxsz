import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_story_pages";

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

const STORY_PAGES = [
  // 1. story_midautumn_p1 - 八月十五月儿圆，天上的月亮像金盘
  {
    id: "story_midautumn_p1",
    title: "中秋-金盘月亮",
    defs: `
      <linearGradient id="sky_m1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="40%" stop-color="#0f172a"/>
        <stop offset="85%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
      <radialGradient id="goldPlate" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="85%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#eab308"/>
      </radialGradient>
    `,
    content: `
      <!-- Deep Blue Night Sky -->
      <rect width="1376" height="768" fill="url(#sky_m1)"/>

      <!-- Giant Golden Plate Full Moon (天上的月亮像金盘) -->
      <g transform="translate(688, 260)" filter="url(#dropShadow)">
        <circle cx="0" cy="0" r="190" fill="#ffffff" opacity="0.2" filter="url(#softGlow)"/>
        <circle cx="0" cy="0" r="140" fill="url(#goldPlate)" filter="url(#softGlow)"/>
        <!-- Golden Plate Carved Rim Pattern -->
        <circle cx="0" cy="0" r="128" fill="none" stroke="#ca8a04" stroke-width="4" opacity="0.7"/>
        <circle cx="0" cy="0" r="120" fill="none" stroke="#ca8a04" stroke-width="2" stroke-dasharray="6,6" opacity="0.5"/>
      </g>

      <!-- Soft Whimsical Clouds Floating Beneath Moon -->
      <g fill="#ffffff" opacity="0.75" filter="url(#softGlow)">
        <ellipse cx="420" cy="310" rx="140" ry="32"/>
        <ellipse cx="960" cy="280" rx="160" ry="35"/>
      </g>

      <!-- Grassy Mound with Little Deer Cathy Gazing in Wonder -->
      <path d="M0,580 Q350,500 750,560 T1376,520 L1376,768 L0,768 Z" fill="#1e293b"/>
      <path d="M-50,640 Q450,580 900,620 T1450,580 L1450,768 L-50,768 Z" fill="#0f172a"/>

      <!-- Little Cathy Mascot Fawn Sitting & Smiling at Moon -->
      <g transform="translate(600, 470)" filter="url(#dropShadow)">
        <!-- Fawn Body -->
        <ellipse cx="80" cy="130" rx="48" ry="40" fill="#f59e0b"/>
        <!-- White Belly -->
        <ellipse cx="80" cy="135" rx="30" ry="26" fill="#fef3c7"/>
        <!-- Red Festive Bib -->
        <path d="M60,95 Q80,120 100,95 Z" fill="#ef4444"/>
        <circle cx="80" cy="115" r="5" fill="#fde047"/>
        <!-- Head -->
        <ellipse cx="80" cy="65" rx="42" ry="38" fill="#f59e0b"/>
        <!-- Little Antlers -->
        <path d="M62,35 Q50,15 45,5" stroke="#78350f" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M98,35 Q110,15 115,5" stroke="#78350f" stroke-width="6" stroke-linecap="round" fill="none"/>
        <!-- Ears -->
        <ellipse cx="40" cy="55" rx="10" ry="18" fill="#f59e0b" transform="rotate(-30 40 55)"/>
        <ellipse cx="120" cy="55" rx="10" ry="18" fill="#f59e0b" transform="rotate(30 120 55)"/>
        <!-- Big Eyes looking up at Golden Moon -->
        <ellipse cx="68" cy="62" rx="6.5" ry="9" fill="#1e293b"/>
        <ellipse cx="94" cy="62" rx="6.5" ry="9" fill="#1e293b"/>
        <circle cx="66" cy="58" r="2.8" fill="#ffffff"/>
        <circle cx="92" cy="58" r="2.8" fill="#ffffff"/>
        <!-- Rosy Cheeks & Sweet Smile -->
        <ellipse cx="58" cy="74" rx="7" ry="5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="104" cy="74" rx="7" ry="5" fill="#fca5a5" opacity="0.85"/>
        <path d="M74,78 Q81,86 88,78" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
      </g>
    `
  },

  // 2. story_midautumn_p2 - 一家人坐在院子里，开开心心吃甜月饼
  {
    id: "story_midautumn_p2",
    title: "中秋-吃月饼",
    defs: `
      <linearGradient id="courtyard_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      <linearGradient id="warmTable" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#b45309"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
    `,
    content: `
      <!-- Night Sky & Cozy Courtyard Wall -->
      <rect width="1376" height="768" fill="url(#courtyard_sky)"/>
      <rect y="460" width="1376" height="308" fill="#334155"/>

      <!-- Red Hanging Lanterns (Glow) -->
      <g filter="url(#dropShadow)">
        <line x1="0" y1="80" x2="1376" y2="80" stroke="#78350f" stroke-width="4"/>
        ${[220, 520, 850, 1150].map(x => `
          <line x1="${x}" y1="80" x2="${x}" y2="140" stroke="#ef4444" stroke-width="3"/>
          <ellipse cx="${x}" cy="180" rx="36" ry="42" fill="#ef4444" filter="url(#softGlow)"/>
          <ellipse cx="${x}" cy="180" rx="32" ry="38" fill="#dc2626"/>
          <rect x="${x-18}" y="140" width="36" height="8" rx="2" fill="#facc15"/>
          <rect x="${x-18}" y="212" width="36" height="8" rx="2" fill="#facc15"/>
          <line x1="${x}" y1="220" x2="${x}" y2="250" stroke="#facc15" stroke-width="3"/>
        `).join("")}
      </g>

      <!-- Round Courtyard Dining Table -->
      <g transform="translate(688, 540)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="0" rx="340" ry="110" fill="url(#warmTable)"/>
        <ellipse cx="0" cy="0" rx="310" ry="90" fill="#d97724"/>

        <!-- Porcelain Plate of Golden Mooncakes (吃甜月饼) -->
        <ellipse cx="0" cy="-10" rx="110" ry="50" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
        <!-- Big Round Mooncake with Traditional Pattern -->
        <circle cx="0" cy="-15" r="38" fill="#b45309"/>
        <circle cx="0" cy="-15" r="32" fill="#d97724"/>
        <circle cx="0" cy="-15" r="22" fill="#f59e0b"/>
        <circle cx="0" cy="-15" r="10" fill="#b45309"/>
        <!-- Slices of Sweet Red Bean Mooncake -->
        <ellipse cx="-55" cy="-5" rx="22" ry="16" fill="#f59e0b"/>
        <ellipse cx="55" cy="-5" rx="22" ry="16" fill="#f59e0b"/>

        <!-- Ceramic Teapot & Cups -->
        <circle cx="-160" cy="-20" r="24" fill="#0284c7"/>
        <rect x="-166" y="-48" width="12" height="6" rx="2" fill="#0284c7"/>
        <ellipse cx="-110" cy="-15" rx="14" ry="10" fill="#ffffff"/>
        <ellipse cx="140" cy="-15" rx="14" ry="10" fill="#ffffff"/>
      </g>

      <!-- Happy Family Faces (Boy & Girl Sitting at Table, Eating Mooncake) -->
      <!-- Girl (Left) -->
      <g transform="translate(340, 360)" filter="url(#dropShadow)">
        <path d="M40,240 L55,140 L105,140 L120,240 Z" fill="#ec4899"/>
        <ellipse cx="80" cy="85" rx="42" ry="38" fill="#fde68a"/>
        <!-- Double Hair Buns with Red Ribbons -->
        <circle cx="45" cy="45" r="18" fill="#1e1b4b"/>
        <circle cx="115" cy="45" r="18" fill="#1e1b4b"/>
        <circle cx="45" cy="45" r="9" fill="#ef4444"/>
        <circle cx="115" cy="45" r="9" fill="#ef4444"/>
        <!-- Cheerful Smile holding Mooncake slice -->
        <ellipse cx="68" cy="88" rx="5.5" ry="7.5" fill="#1e293b"/>
        <ellipse cx="94" cy="88" rx="5.5" ry="7.5" fill="#1e293b"/>
        <path d="M72,100 Q81,110 90,100" stroke="#991b1b" stroke-width="3" fill="none"/>
        <ellipse cx="130" cy="140" rx="14" ry="10" fill="#f59e0b"/>
      </g>

      <!-- Boy (Right) -->
      <g transform="translate(900, 360)" filter="url(#dropShadow)">
        <path d="M40,240 L55,140 L105,140 L120,240 Z" fill="#3b82f6"/>
        <ellipse cx="80" cy="85" rx="42" ry="38" fill="#fde68a"/>
        <path d="M40,80 C38,40 122,40 120,80 Z" fill="#312e81"/>
        <ellipse cx="68" cy="88" rx="5.5" ry="7.5" fill="#1e293b"/>
        <ellipse cx="94" cy="88" rx="5.5" ry="7.5" fill="#1e293b"/>
        <path d="M72,100 Q81,110 90,100" stroke="#991b1b" stroke-width="3" fill="none"/>
        <ellipse cx="30" cy="140" rx="14" ry="10" fill="#f59e0b"/>
      </g>
    `
  },

  // 3. story_midautumn_p3 - 大月亮照在大地上，祝大家团团圆圆
  {
    id: "story_midautumn_p3",
    title: "中秋-团团圆圆",
    defs: `
      <linearGradient id="sky_m3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="50%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
    `,
    content: `
      <!-- Night Sky -->
      <rect width="1376" height="768" fill="url(#sky_m3)"/>

      <!-- Radiant Full Moon Over Land -->
      <g transform="translate(688, 160)" filter="url(#dropShadow)">
        <circle cx="0" cy="0" r="140" fill="#ffffff" opacity="0.3" filter="url(#softGlow)"/>
        <circle cx="0" cy="0" r="90" fill="#fef08a" filter="url(#softGlow)"/>
      </g>

      <!-- Soft Sparkling Celebration Fireworks in Distance -->
      <g filter="url(#softGlow)">
        <!-- Firework 1 -->
        <g transform="translate(260, 180)" stroke="#f43f5e" stroke-width="3">
          <line x1="0" y1="0" x2="-40" y2="-40"/><line x1="0" y1="0" x2="40" y2="-40"/>
          <line x1="0" y1="0" x2="-55" y2="0"/><line x1="0" y1="0" x2="55" y2="0"/>
          <line x1="0" y1="0" x2="-35" y2="35"/><line x1="0" y1="0" x2="35" y2="35"/>
        </g>
        <!-- Firework 2 -->
        <g transform="translate(1120, 180)" stroke="#38bdf8" stroke-width="3">
          <line x1="0" y1="0" x2="-40" y2="-40"/><line x1="0" y1="0" x2="40" y2="-40"/>
          <line x1="0" y1="0" x2="-55" y2="0"/><line x1="0" y1="0" x2="55" y2="0"/>
          <line x1="0" y1="0" x2="-35" y2="35"/><line x1="0" y1="0" x2="35" y2="35"/>
        </g>
      </g>

      <!-- Ancient Village Bridge & River -->
      <path d="M0,560 Q350,480 750,530 T1376,500 L1376,768 L0,768 Z" fill="#1e293b"/>
      <!-- Stone Arch Bridge -->
      <path d="M420,620 Q688,490 960,620 L960,768 L420,768 Z" fill="#475569"/>

      <!-- Children Holding Glowing Rabbit Lanterns on Bridge (祝大家团团圆圆) -->
      <g transform="translate(620, 430)" filter="url(#dropShadow)">
        <!-- Child in Red -->
        <path d="M40,160 L50,80 L85,80 L95,160 Z" fill="#ef4444"/>
        <ellipse cx="68" cy="45" rx="26" ry="24" fill="#fde68a"/>
        <!-- Glowing White Bunny Lantern Held on Stick -->
        <line x1="75" y1="95" x2="130" y2="50" stroke="#78350f" stroke-width="4"/>
        <g transform="translate(130, 80)" filter="url(#softGlow)">
          <!-- Glowing Rabbit Body -->
          <ellipse cx="0" cy="0" rx="30" ry="20" fill="#ffffff"/>
          <ellipse cx="-15" cy="-8" rx="14" ry="12" fill="#ffffff"/>
          <!-- Long Ears -->
          <ellipse cx="-20" cy="-24" rx="5" ry="14" fill="#ffffff" transform="rotate(-15 -20 -24)"/>
          <ellipse cx="-12" cy="-24" rx="5" ry="14" fill="#ffffff" transform="rotate(10 -12 -24)"/>
          <circle cx="-18" cy="-8" r="2.5" fill="#ef4444"/>
          <!-- Warm Amber Candle Glow Inside -->
          <circle cx="0" cy="0" r="16" fill="#fde047" opacity="0.8"/>
        </g>
      </g>
    `
  },

  // 4. story_dragonboat_p1 - 五月初五端午节，河里龙舟赛得欢
  {
    id: "story_dragonboat_p1",
    title: "端午-赛龙舟",
    defs: `
      <linearGradient id="sky_db1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="55%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="river_db1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Festival Sky -->
      <rect width="1376" height="768" fill="url(#sky_db1)"/>
      <circle cx="220" cy="140" r="60" fill="#facc15" filter="url(#softGlow)"/>

      <!-- Distant Hills with Banners -->
      <path d="M0,420 Q350,340 750,390 T1376,360 L1376,768 L0,768 Z" fill="#86efac"/>

      <!-- Rushing River (赛得欢) -->
      <rect y="400" width="1376" height="368" fill="url(#river_db1)"/>
      <!-- White Splash Waves -->
      <g stroke="#ffffff" stroke-width="4" fill="none" opacity="0.8" stroke-linecap="round">
        <path d="M220,530 Q280,510 340,540"/>
        <path d="M520,510 Q580,490 640,520"/>
        <path d="M820,540 Q880,520 940,550"/>
      </g>

      <!-- Splendid Dragon Boat 1 Surging Forward (Center) -->
      <g transform="translate(380, 360)" filter="url(#dropShadow)">
        <!-- Long Slender Wooden Boat Hull -->
        <path d="M60,140 C180,180 520,180 640,110 L620,150 C500,200 160,200 80,165 Z" fill="#dc2626"/>
        <path d="M80,145 L620,125" stroke="#facc15" stroke-width="8"/>
        <!-- Carved Dragon Head at Bow (Left) -->
        <g transform="translate(45, 120) scale(-1, 1)">
          <path d="M0,0 C30,-30 60,-20 80,0 C90,15 70,35 40,25 Z" fill="#16a34a"/>
          <!-- Dragon Horns & Whiskers -->
          <path d="M50,-15 Q70,-40 85,-45" stroke="#f59e0b" stroke-width="6" fill="none"/>
          <circle cx="45" cy="-2" r="6" fill="#ffffff"/>
          <circle cx="45" cy="-2" r="3" fill="#1e293b"/>
          <!-- Wide Open Laughing Mouth -->
          <polygon points="65,10 90,0 80,25" fill="#ef4444"/>
        </g>
        <!-- Carved Dragon Tail at Stern (Right) -->
        <path d="M620,115 C660,80 690,70 710,40" stroke="#f59e0b" stroke-width="12" fill="none" stroke-linecap="round"/>

        <!-- Cute Rowers in Red Headbands with Oars -->
        ${[180, 260, 340, 420, 500].map(x => `
          <!-- Rower Body & Head -->
          <ellipse cx="${x}" cy="105" rx="14" ry="12" fill="#fde68a"/>
          <rect x="${x-14}" y="95" width="28" height="5" fill="#ef4444"/>
          <rect x="${x-10}" y="115" width="20" height="25" rx="4" fill="#facc15"/>
          <!-- Splashing Oar -->
          <line x1="${x}" y1="125" x2="${x+35}" y2="185" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
          <polygon points="${x+35},185 ${x+45},175 ${x+55},205" fill="#b45309"/>
        `).join("")}
      </g>
    `
  },

  // 5. story_dragonboat_p2 - 咚咚咚咚敲起鼓，大家一起划龙舟
  {
    id: "story_dragonboat_p2",
    title: "端午-敲大鼓",
    defs: `
      <linearGradient id="sky_db2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
    `,
    content: `
      <!-- Dynamic Splashing Background -->
      <rect width="1376" height="768" fill="url(#sky_db2)"/>

      <!-- Giant White Spray Splashes -->
      <g fill="#ffffff" opacity="0.75" filter="url(#softGlow)">
        <ellipse cx="220" cy="580" rx="120" ry="50"/>
        <ellipse cx="1150" cy="580" rx="140" ry="55"/>
      </g>

      <!-- Centerpiece: Giant Red Festival Drum (咚咚咚咚敲起鼓) -->
      <g transform="translate(688, 380)" filter="url(#dropShadow)">
        <!-- Giant Red Barrel Drum Body -->
        <ellipse cx="0" cy="0" rx="150" ry="120" fill="#dc2626"/>
        <!-- Golden Rivets along Drum Rim -->
        <ellipse cx="0" cy="0" rx="135" ry="105" fill="none" stroke="#facc15" stroke-width="6"/>
        <!-- Drum Leather Face with Sound Waves -->
        <ellipse cx="0" cy="0" rx="120" ry="90" fill="#fef3c7"/>
        <!-- Sound Blast Wave Shockrings -->
        <ellipse cx="0" cy="0" rx="160" ry="125" fill="none" stroke="#fde047" stroke-width="6" opacity="0.8" filter="url(#softGlow)"/>
        <ellipse cx="0" cy="0" rx="200" ry="155" fill="none" stroke="#fde047" stroke-width="4" opacity="0.5" filter="url(#softGlow)"/>

        <!-- Flying Red Drumsticks Beating Drum -->
        <line x1="-70" y1="-80" x2="-20" y2="-20" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
        <circle cx="-20" cy="-20" r="14" fill="#ef4444"/>
        <line x1="70" y1="-80" x2="20" y2="-20" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
        <circle cx="20" cy="-20" r="14" fill="#ef4444"/>

        <!-- Drummer Boy with Red Headband smiling fiercely -->
        <ellipse cx="0" cy="-140" rx="44" ry="40" fill="#fde68a"/>
        <rect x="-44" y="-155" width="88" height="12" fill="#ef4444"/>
        <!-- Big Eyes Full of Energy -->
        <ellipse cx="-18" cy="-140" rx="6" ry="8" fill="#1e293b"/>
        <ellipse cx="18" cy="-140" rx="6" ry="8" fill="#1e293b"/>
        <!-- Wide Joyful Open Mouth -->
        <ellipse cx="0" cy="-122" rx="14" ry="10" fill="#991b1b"/>
      </g>
    `
  },

  // 6. story_dragonboat_p3 - 粽子飘香真热闹，我们欢喜过端午
  {
    id: "story_dragonboat_p3",
    title: "端午-粽子飘香",
    defs: `
      <linearGradient id="table_z" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fdba74"/>
      </linearGradient>
    `,
    content: `
      <!-- Festive Golden Tabletop View -->
      <rect width="1376" height="768" fill="url(#table_z)"/>

      <!-- Fresh Bamboo Leaves (箬竹叶) on Table -->
      <g filter="url(#dropShadow)">
        <path d="M150,560 C320,440 680,420 850,520 C680,560 350,580 150,560 Z" fill="#16a34a"/>
        <path d="M480,580 C650,460 1020,440 1200,530 C1020,580 700,600 480,580 Z" fill="#15803d"/>
      </g>

      <!-- Steaming Green Pyramid Sticky Rice Dumplings (粽子飘香) -->
      <g transform="translate(688, 380)" filter="url(#dropShadow)">
        <!-- Giant Centerpiece Zongzi -->
        <polygon points="0,-110 -110,60 110,60" fill="#22c55e"/>
        <polygon points="0,-110 0,70 110,60" fill="#16a34a"/>
        <!-- Red Silk Thread Wrapped Tightly Around Zongzi -->
        <path d="M-80,10 Q0,25 80,10" stroke="#ef4444" stroke-width="8" fill="none"/>
        <path d="M-50,-30 Q0,-15 50,-30" stroke="#ef4444" stroke-width="8" fill="none"/>
        <!-- Fragrant Swirling Steam Floating Up (粽子飘香) -->
        <path d="M-30,-130 Q-50,-180 -20,-220 Q10,-260 -10,-300" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.75" filter="url(#softGlow)"/>
        <path d="M30,-130 Q10,-180 40,-220 Q70,-260 50,-300" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.75" filter="url(#softGlow)"/>
      </g>

      <!-- Traditional Five-Colored Scented Silk Sachets (五彩香囊) -->
      <g transform="translate(280, 320)" filter="url(#dropShadow)">
        <polygon points="0,-40 -35,25 35,25" fill="#f43f5e"/>
        <circle cx="0" cy="0" r="10" fill="#facc15"/>
        <!-- Hanging Tassels -->
        <line x1="0" y1="25" x2="0" y2="90" stroke="#ef4444" stroke-width="5"/>
        <line x1="-12" y1="25" x2="-12" y2="80" stroke="#3b82f6" stroke-width="4"/>
        <line x1="12" y1="25" x2="12" y2="80" stroke="#10b981" stroke-width="4"/>
      </g>
    `
  },

  // 7. story_cat_fishing_p1 - 小猫拿着鱼竿来到河边钓鱼
  {
    id: "story_cat_fishing_p1",
    title: "小猫-河边钓鱼",
    defs: `
      <linearGradient id="sky_cf1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Morning Sky -->
      <rect width="1376" height="768" fill="url(#sky_cf1)"/>
      <circle cx="1180" cy="140" r="65" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Flower-Dotted Riverbank Grass -->
      <path d="M0,520 Q350,420 750,490 T1376,440 L1376,768 L0,768 Z" fill="#86efac"/>
      <path d="M0,600 Q400,530 850,580 T1376,550 L1376,768 L0,768 Z" fill="#22c55e"/>

      <!-- Whistling Orange Kitten Walking along Riverbank -->
      <g transform="translate(560, 360)" filter="url(#dropShadow)">
        <!-- Tail -->
        <path d="M30,120 Q-10,130 5,80" stroke="#ea580c" stroke-width="14" stroke-linecap="round" fill="none"/>
        <!-- Body -->
        <ellipse cx="70" cy="130" rx="38" ry="46" fill="#f97316"/>
        <ellipse cx="72" cy="135" rx="24" ry="30" fill="#fed7aa"/>
        <!-- Legs in Striding Motion -->
        <ellipse cx="50" cy="180" rx="14" ry="9" fill="#ea580c"/>
        <ellipse cx="95" cy="175" rx="14" ry="9" fill="#ea580c"/>
        <!-- Head -->
        <ellipse cx="70" cy="55" rx="46" ry="40" fill="#f97316"/>
        <!-- Pointed Cat Ears -->
        <polygon points="35,30 20,-10 60,15" fill="#f97316"/>
        <polygon points="35,25 25,-2 52,15" fill="#fda4af"/>
        <polygon points="105,30 120,-10 80,15" fill="#f97316"/>
        <polygon points="105,25 115,-2 88,15" fill="#fda4af"/>
        <!-- Face: Whistling Mouth & Big Eyes -->
        <ellipse cx="52" cy="55" rx="6.5" ry="9" fill="#1e293b"/>
        <ellipse cx="88" cy="55" rx="6.5" ry="9" fill="#1e293b"/>
        <circle cx="50" cy="52" r="2.5" fill="#ffffff"/>
        <circle cx="86" cy="52" r="2.5" fill="#ffffff"/>
        <circle cx="70" cy="72" r="5" fill="#7c2d12"/>
        <!-- Cat Whiskers -->
        <line x1="25" y1="62" x2="-5" y2="58" stroke="#1e293b" stroke-width="2.5"/>
        <line x1="25" y1="70" x2="-5" y2="74" stroke="#1e293b" stroke-width="2.5"/>
        <line x1="115" y1="62" x2="145" y2="58" stroke="#1e293b" stroke-width="2.5"/>
        <line x1="115" y1="70" x2="145" y2="74" stroke="#1e293b" stroke-width="2.5"/>

        <!-- Bamboo Fishing Rod over Shoulder -->
        <line x1="0" y1="180" x2="170" y2="-20" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
        <!-- Empty Little Wooden Bucket Hanging from Rod -->
        <g transform="translate(130, 20)">
          <path d="M0,10 L6,40 L34,40 L40,10 Z" fill="#b45309"/>
          <path d="M5,10 C5,-5 35,-5 35,10" stroke="#78350f" stroke-width="3" fill="none"/>
        </g>
      </g>
    `
  },

  // 8. story_cat_fishing_p2 - 一只蜻蜓飞过来，小猫跑去抓蜻蜓
  {
    id: "story_cat_fishing_p2",
    title: "小猫-抓蜻蜓",
    defs: `
      <linearGradient id="sky_cf2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Blue Sky -->
      <rect width="1376" height="768" fill="url(#sky_cf2)"/>

      <!-- Dropped Fishing Rod on Riverbank (Dropped in excitement) -->
      <line x1="180" y1="620" x2="420" y2="580" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>

      <!-- Kitten Leaping in Mid-Air with Paws Outstretched (跑去抓蜻蜓) -->
      <g transform="translate(520, 280) rotate(-15)" filter="url(#dropShadow)">
        <ellipse cx="70" cy="130" rx="38" ry="46" fill="#f97316"/>
        <ellipse cx="70" cy="55" rx="46" ry="40" fill="#f97316"/>
        <!-- Ears -->
        <polygon points="35,30 20,-10 60,15" fill="#f97316"/>
        <polygon points="105,30 120,-10 80,15" fill="#f97316"/>
        <!-- Excited Wide Eyes Looking at Dragonfly -->
        <ellipse cx="52" cy="55" rx="7" ry="10" fill="#1e293b"/>
        <ellipse cx="88" cy="55" rx="7" ry="10" fill="#1e293b"/>
        <circle cx="50" cy="52" r="3" fill="#ffffff"/>
        <circle cx="86" cy="52" r="3" fill="#ffffff"/>
        <!-- Wide Open Playful Mouth -->
        <path d="M60,70 Q70,82 80,70" stroke="#7c2d12" stroke-width="3" fill="none"/>
        <!-- Outstretched Paws -->
        <line x1="50" y1="100" x2="20" y2="50" stroke="#f97316" stroke-width="14" stroke-linecap="round"/>
        <line x1="90" y1="100" x2="120" y2="50" stroke="#f97316" stroke-width="14" stroke-linecap="round"/>
      </g>

      <!-- Glittering Turquoise Dragonfly Hovering Just Out of Reach -->
      <g transform="translate(780, 180)" filter="url(#softGlow)">
        <ellipse cx="0" cy="0" rx="6" ry="24" fill="#0284c7"/>
        <circle cx="0" cy="-28" r="8" fill="#0369a1"/>
        <!-- Transparent Glistening Wings -->
        <ellipse cx="-45" cy="-15" rx="42" ry="10" fill="#cffafe" opacity="0.9" transform="rotate(-15 -45 -15)"/>
        <ellipse cx="45" cy="-15" rx="42" ry="10" fill="#cffafe" opacity="0.9" transform="rotate(15 45 -15)"/>
      </g>
    `
  },

  // 9. story_cat_fishing_p3 - 小猫专心致志钓鱼，终于钓到了一条大鱼
  {
    id: "story_cat_fishing_p3",
    title: "小猫-钓到大鱼",
    defs: `
      <linearGradient id="sky_cf3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="goldFish" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Triumphant Sky -->
      <rect width="1376" height="768" fill="url(#sky_cf3)"/>
      <circle cx="200" cy="150" r="65" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Splashing Blue River -->
      <rect y="460" width="1376" height="308" fill="#0284c7"/>
      <!-- Sparkling Water Drops from Fish -->
      <g fill="#bae6fd" opacity="0.9" filter="url(#softGlow)">
        <circle cx="860" cy="380" r="6"/><circle cx="890" cy="350" r="8"/><circle cx="940" cy="390" r="7"/>
        <circle cx="820" cy="420" r="5"/><circle cx="980" cy="440" r="6"/>
      </g>

      <!-- Proud Kitten Pulling Hard on Rod (专心致志钓鱼) -->
      <g transform="translate(420, 360)" filter="url(#dropShadow)">
        <ellipse cx="70" cy="130" rx="38" ry="46" fill="#f97316"/>
        <ellipse cx="70" cy="55" rx="46" ry="40" fill="#f97316"/>
        <!-- Cat Ears -->
        <polygon points="35,30 20,-10 60,15" fill="#f97316"/>
        <polygon points="105,30 120,-10 80,15" fill="#f97316"/>
        <!-- Ecstatic Huge Smiling Eyes -->
        <ellipse cx="52" cy="55" rx="7" ry="10" fill="#1e293b"/>
        <ellipse cx="88" cy="55" rx="7" ry="10" fill="#1e293b"/>
        <circle cx="50" cy="52" r="3" fill="#ffffff"/>
        <circle cx="86" cy="52" r="3" fill="#ffffff"/>
        <path d="M58,72 Q70,86 82,72" stroke="#7c2d12" stroke-width="3.5" fill="none"/>
        <ellipse cx="40" cy="65" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="100" cy="65" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>

        <!-- Strongly Bent Bamboo Rod (承受大鱼重量) -->
        <path d="M80,110 Q180,-20 380,40" stroke="#78350f" stroke-width="9" fill="none" stroke-linecap="round"/>
        <!-- Stretched Fishing Line -->
        <line x1="380" y1="40" x2="480" y2="100" stroke="#ffffff" stroke-width="2.5"/>
      </g>

      <!-- Giant Golden Big Carp Leaping Out of Water (钓到了一条大鱼) -->
      <g transform="translate(900, 380) rotate(-25)" filter="url(#dropShadow)">
        <!-- Curved Fish Body -->
        <path d="M-80,0 C-40,-50 40,-50 80,0 C40,45 -40,45 -80,0 Z" fill="url(#goldFish)"/>
        <!-- Scales Pattern -->
        <ellipse cx="0" cy="0" rx="40" ry="25" fill="none" stroke="#b45309" stroke-width="3" opacity="0.6"/>
        <!-- Fish Tail Fin -->
        <polygon points="-80,0 -130,-35 -110,0 -130,35" fill="#ea580c"/>
        <!-- Top Dorsal Fin -->
        <polygon points="-20,-35 0,-60 20,-35" fill="#f59e0b"/>
        <!-- Fish Face & Big Curious Eye -->
        <circle cx="50" cy="-5" r="7" fill="#ffffff"/>
        <circle cx="50" cy="-5" r="3.5" fill="#1e293b"/>
        <!-- Fish Mouth with Hook -->
        <circle cx="80" cy="0" r="4" fill="#78350f"/>
      </g>
    `
  }
];

console.log(`Generating ${STORY_PAGES.length} narrative storybook page illustrations...`);

for (const page of STORY_PAGES) {
  console.log(`\nGenerating story page: ${page.id} (${page.title})...`);
  const svgContent = wrapSvg(page.content, page.defs);
  const svgPath = path.join(TMP_DIR, `${page.id}.svg`);
  const jpgPath = path.join(OUTPUT_DIR, `${page.id}.jpg`);
  const webpPath = path.join(OUTPUT_DIR, `${page.id}.webp`);

  fs.writeFileSync(svgPath, svgContent);
  execSync(`/Applications/ServBay/bin/magick "${svgPath}" -density 150 -resize 1376x768! -quality 95 "${jpgPath}"`);
  execSync(`/Applications/ServBay/bin/cwebp -q 88 "${jpgPath}" -o "${webpPath}"`);

  const statJpg = fs.statSync(jpgPath);
  const statWebp = fs.statSync(webpPath);
  console.log(`✓ Generated ${page.id}: JPG (${(statJpg.size/1024).toFixed(1)} KB), WebP (${(statWebp.size/1024).toFixed(1)} KB)`);
}

console.log("\nAll 9 narrative storybook page illustrations successfully generated!");
