import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_covers";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Common SVG headers/defs helper
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

const COVERS = [
  // 1. cover_monkey_mountain (《小猴子上山去》)
  {
    id: "cover_monkey_mountain",
    title: "小猴子上山去",
    defs: `
      <linearGradient id="sky1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#5eb3f6"/>
        <stop offset="45%" stop-color="#a8dcfc"/>
        <stop offset="85%" stop-color="#fff0d0"/>
        <stop offset="100%" stop-color="#ffdc9c"/>
      </linearGradient>
      <radialGradient id="sun1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="40%" stop-color="#ffea75" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#ff9900" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="m1_far" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8faee0"/>
        <stop offset="100%" stop-color="#c8dbf8"/>
      </linearGradient>
      <linearGradient id="m1_mid" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4e9b6a"/>
        <stop offset="100%" stop-color="#86c694"/>
      </linearGradient>
      <linearGradient id="m1_near" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#347849"/>
        <stop offset="100%" stop-color="#5da66e"/>
      </linearGradient>
      <linearGradient id="river1" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#7dd3fc"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
    `,
    content: `
      <!-- Sky -->
      <rect width="1376" height="768" fill="url(#sky1)"/>
      <!-- Sun -->
      <circle cx="280" cy="190" r="160" fill="url(#sun1)"/>
      <circle cx="280" cy="190" r="68" fill="#ffb703" filter="url(#softGlow)"/>

      <!-- Clouds -->
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="200" cy="150" rx="95" ry="32"/>
        <ellipse cx="260" cy="130" rx="65" ry="40"/>
        <ellipse cx="150" cy="155" rx="55" ry="26"/>
        <ellipse cx="880" cy="165" rx="125" ry="38"/>
        <ellipse cx="945" cy="145" rx="85" ry="45"/>
        <ellipse cx="820" cy="175" rx="75" ry="30"/>
        <ellipse cx="1190" cy="200" rx="105" ry="35"/>
      </g>

      <!-- Distant Peaks -->
      <path d="M0,530 Q220,330 480,430 T980,330 T1376,470 L1376,768 L0,768 Z" fill="url(#m1_far)" opacity="0.75"/>
      <ellipse cx="620" cy="465" rx="420" ry="38" fill="#ffffff" opacity="0.45"/>

      <!-- Middle Green Peaks -->
      <path d="M0,590 Q280,410 600,510 T1120,420 T1376,560 L1376,768 L0,768 Z" fill="url(#m1_mid)"/>

      <!-- Pine Trees on Ridge -->
      <g fill="#276749">
        <polygon points="180,510 170,550 190,550"/>
        <polygon points="200,500 190,545 210,545"/>
        <polygon points="225,515 215,555 235,555"/>
        <polygon points="850,470 838,510 862,510"/>
        <polygon points="875,460 862,505 888,505"/>
      </g>

      <!-- Winding River -->
      <path d="M860,540 Q940,610 990,640 T1220,768 L1080,768 Q900,670 830,550 Z" fill="url(#river1)"/>

      <!-- Foreground Peak & Stone Platform -->
      <path d="M-50,768 L-50,560 Q220,590 480,530 T960,610 T1426,580 L1426,768 Z" fill="url(#m1_near)"/>
      <path d="M110,768 L170,585 Q350,530 540,595 L610,768 Z" fill="#64748b" filter="url(#dropShadow)"/>

      <!-- Flowers and grass -->
      <g fill="#f43f5e">
        <circle cx="210" cy="620" r="14"/><circle cx="200" cy="610" r="11"/><circle cx="220" cy="610" r="11"/><circle cx="210" cy="614" r="6" fill="#fef08a"/>
        <circle cx="275" cy="650" r="16"/><circle cx="264" cy="640" r="12"/><circle cx="286" cy="640" r="12"/><circle cx="275" cy="645" r="7" fill="#fef08a"/>
        <circle cx="460" cy="635" r="13"/><circle cx="450" cy="625" r="10"/><circle cx="470" cy="625" r="10"/><circle cx="460" cy="629" r="6" fill="#ffffff"/>
      </g>
      <g fill="#eab308">
        <circle cx="155" cy="660" r="12"/><circle cx="147" cy="652" r="9"/><circle cx="163" cy="652" r="9"/><circle cx="155" cy="655" r="5" fill="#ffffff"/>
        <circle cx="510" cy="640" r="14"/><circle cx="500" cy="630" r="10"/><circle cx="520" cy="630" r="10"/><circle cx="510" cy="634" r="6" fill="#f43f5e"/>
      </g>

      <!-- Little Monkey Character -->
      <g transform="translate(325, 385)" filter="url(#dropShadow)">
        <!-- Tail -->
        <path d="M30,115 Q-35,135 -30,90 T20,68" fill="none" stroke="#d97724" stroke-width="14" stroke-linecap="round"/>
        <path d="M30,115 Q-35,135 -30,90 T20,68" fill="none" stroke="#f6ad55" stroke-width="9" stroke-linecap="round"/>
        <!-- Body -->
        <ellipse cx="68" cy="118" rx="38" ry="44" fill="#ed8936"/>
        <ellipse cx="70" cy="120" rx="25" ry="30" fill="#fde68a"/>
        <!-- Red Scarf -->
        <path d="M42,78 Q68,90 94,78 Q102,96 90,100 Q68,93 46,96 Z" fill="#ef4444"/>
        <path d="M82,90 L98,130 L80,125 Z" fill="#dc2626"/>
        <!-- Head -->
        <ellipse cx="68" cy="46" rx="46" ry="42" fill="#ed8936"/>
        <!-- Ears -->
        <ellipse cx="20" cy="46" rx="15" ry="17" fill="#ed8936"/>
        <ellipse cx="20" cy="46" rx="10" ry="12" fill="#fde68a"/>
        <ellipse cx="116" cy="46" rx="15" ry="17" fill="#ed8936"/>
        <ellipse cx="116" cy="46" rx="10" ry="12" fill="#fde68a"/>
        <!-- Face Mask -->
        <path d="M68,30 C52,14 33,24 36,49 C38,67 57,78 68,78 C79,78 98,67 100,49 C103,24 84,14 68,30 Z" fill="#fef08a"/>
        <!-- Eyes -->
        <ellipse cx="52" cy="46" rx="7" ry="9.5" fill="#1e293b"/>
        <ellipse cx="84" cy="46" rx="7" ry="9.5" fill="#1e293b"/>
        <circle cx="50" cy="42" r="3.2" fill="#ffffff"/>
        <circle cx="82" cy="42" r="3.2" fill="#ffffff"/>
        <circle cx="54" cy="48" r="1.5" fill="#ffffff"/>
        <circle cx="86" cy="48" r="1.5" fill="#ffffff"/>
        <!-- Cheeks -->
        <ellipse cx="44" cy="58" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="92" cy="58" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>
        <!-- Smile & Nose -->
        <circle cx="68" cy="54" r="3.5" fill="#9a3412"/>
        <path d="M60,60 Q68,69 76,60" fill="none" stroke="#9a3412" stroke-width="2.8" stroke-linecap="round"/>
        <!-- Shading Brow Hand -->
        <path d="M44,92 Q28,65 42,32 Q54,30 58,34" fill="none" stroke="#ed8936" stroke-width="13" stroke-linecap="round"/>
        <circle cx="50" cy="32" r="7.5" fill="#fde68a"/>
        <!-- Cheering Hand -->
        <path d="M92,92 Q122,86 132,70" fill="none" stroke="#ed8936" stroke-width="13" stroke-linecap="round"/>
        <circle cx="132" cy="70" r="7.5" fill="#fde68a"/>
        <!-- Feet -->
        <ellipse cx="50" cy="160" rx="15" ry="9" fill="#ed8936"/>
        <ellipse cx="88" cy="160" rx="15" ry="9" fill="#ed8936"/>
      </g>
    `
  },

  // 2. cover_flower_garden (《美丽的大花园》)
  {
    id: "cover_flower_garden",
    title: "美丽的大花园",
    defs: `
      <linearGradient id="sky2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="hill1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="100%" stop-color="#22c55e"/>
      </linearGradient>
      <linearGradient id="hill2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
    `,
    content: `
      <!-- Sky -->
      <rect width="1376" height="768" fill="url(#sky2)"/>
      <!-- Soft Rainbow -->
      <path d="M-100,500 Q688,-150 1476,500" fill="none" stroke="#f43f5e" stroke-width="14" opacity="0.25"/>
      <path d="M-100,514 Q688,-136 1476,514" fill="none" stroke="#fb923c" stroke-width="14" opacity="0.25"/>
      <path d="M-100,528 Q688,-122 1476,528" fill="none" stroke="#facc15" stroke-width="14" opacity="0.25"/>
      <path d="M-100,542 Q688,-108 1476,542" fill="none" stroke="#4ade80" stroke-width="14" opacity="0.25"/>
      <path d="M-100,556 Q688,-94 1476,556" fill="none" stroke="#38bdf8" stroke-width="14" opacity="0.25"/>

      <!-- Clouds -->
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="250" cy="180" rx="100" ry="35"/><ellipse cx="310" cy="160" rx="70" ry="42"/>
        <ellipse cx="1080" cy="170" rx="120" ry="38"/><ellipse cx="1140" cy="150" rx="80" ry="45"/>
      </g>

      <!-- Rolling Green Hills -->
      <path d="M0,520 Q350,380 750,460 T1376,430 L1376,768 L0,768 Z" fill="url(#hill1)"/>
      <path d="M-20,590 Q420,480 880,560 T1400,520 L1400,768 L-20,768 Z" fill="url(#hill2)"/>

      <!-- Garden White Picket Fence -->
      <g fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" opacity="0.9">
        <path d="M120,490 L135,460 L150,490 L150,560 L120,560 Z"/>
        <path d="M160,490 L175,460 L190,490 L190,560 L160,560 Z"/>
        <path d="M200,490 L215,460 L230,490 L230,560 L200,560 Z"/>
        <path d="M240,490 L255,460 L270,490 L270,560 L240,560 Z"/>
        <rect x="110" y="495" width="170" height="14" rx="3"/>
        <rect x="110" y="535" width="170" height="14" rx="3"/>
      </g>

      <!-- Giant Lush Sunflower (Left-Center) -->
      <g transform="translate(420, 310)" filter="url(#dropShadow)">
        <!-- Stem & Leaves -->
        <path d="M60,200 Q50,310 55,420" fill="none" stroke="#16a34a" stroke-width="18" stroke-linecap="round"/>
        <path d="M55,300 C-30,280 -20,240 10,230 C45,240 55,270 55,300 Z" fill="#22c55e"/>
        <path d="M58,350 C140,320 140,280 110,270 C80,280 60,310 58,350 Z" fill="#22c55e"/>
        <!-- Petals -->
        <g fill="#facc15" stroke="#eab308" stroke-width="2">
          ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg =>
            `<ellipse cx="60" cy="180" rx="20" ry="75" transform="rotate(${deg} 60 180)"/>`
          ).join("\n")}
        </g>
        <!-- Center Disc with Smile -->
        <circle cx="60" cy="180" r="54" fill="#78350f"/>
        <circle cx="60" cy="180" r="48" fill="#92400e"/>
        <ellipse cx="44" cy="172" rx="6" ry="8" fill="#fef3c7"/>
        <ellipse cx="76" cy="172" rx="6" ry="8" fill="#fef3c7"/>
        <circle cx="44" cy="172" r="4" fill="#451a03"/>
        <circle cx="76" cy="172" r="4" fill="#451a03"/>
        <ellipse cx="36" cy="185" rx="7" ry="5" fill="#f87171" opacity="0.8"/>
        <ellipse cx="84" cy="185" rx="7" ry="5" fill="#f87171" opacity="0.8"/>
        <path d="M52,192 Q60,202 68,192" fill="none" stroke="#fef3c7" stroke-width="3.5" stroke-linecap="round"/>
      </g>

      <!-- Giant Peony / Rose (Right) -->
      <g transform="translate(880, 350)" filter="url(#dropShadow)">
        <path d="M70,180 Q85,280 75,380" fill="none" stroke="#16a34a" stroke-width="16" stroke-linecap="round"/>
        <g fill="#fb7185">
          <circle cx="70" cy="160" r="70"/>
          <circle cx="50" cy="140" r="55" fill="#f43f5e"/>
          <circle cx="90" cy="140" r="55" fill="#f43f5e"/>
          <circle cx="70" cy="130" r="45" fill="#fda4af"/>
          <circle cx="70" cy="145" r="35" fill="#fff1f2"/>
          <circle cx="70" cy="150" r="22" fill="#fb7185"/>
        </g>
      </g>

      <!-- Little Cute Pink Elephant Watering Can (Foreground Left) -->
      <g transform="translate(180, 520)" filter="url(#dropShadow)">
        <!-- Trunk Spout -->
        <path d="M120,80 C150,60 170,40 160,20 C155,10 145,25 140,35 C130,55 110,65 95,75" fill="#f472b6"/>
        <!-- Shower Head & Drops -->
        <ellipse cx="162" cy="18" rx="8" ry="14" fill="#ec4899" transform="rotate(-30 162 18)"/>
        <g fill="#38bdf8" opacity="0.85">
          <circle cx="180" cy="35" r="4.5"/><circle cx="195" cy="50" r="5"/><circle cx="185" cy="70" r="4"/>
          <circle cx="210" cy="85" r="5.5"/><circle cx="200" cy="105" r="4.5"/><circle cx="225" cy="120" r="5"/>
        </g>
        <!-- Body -->
        <ellipse cx="70" cy="95" rx="55" ry="42" fill="#f472b6"/>
        <!-- Handle -->
        <path d="M25,80 C0,50 10,10 50,20 C60,23 60,35 50,32 C25,28 20,55 35,75" fill="#db2777"/>
        <!-- Ear -->
        <ellipse cx="65" cy="85" rx="20" ry="24" fill="#fbcfe8"/>
        <!-- Eye -->
        <circle cx="95" cy="80" r="5" fill="#1e293b"/>
        <circle cx="93" cy="78" r="2" fill="#ffffff"/>
        <!-- Smile & Blush -->
        <path d="M92,95 Q100,102 108,95" fill="none" stroke="#831843" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="85" cy="92" rx="6" ry="4" fill="#fb7185" opacity="0.8"/>
      </g>

      <!-- Flying Butterflies -->
      <g transform="translate(740, 240)">
        <ellipse cx="0" cy="0" rx="20" ry="14" fill="#38bdf8" transform="rotate(-25 0 0)"/>
        <ellipse cx="28" cy="0" rx="20" ry="14" fill="#38bdf8" transform="rotate(25 28 0)"/>
        <ellipse cx="5" cy="14" rx="14" ry="10" fill="#7dd3fc" transform="rotate(-15 5 14)"/>
        <ellipse cx="23" cy="14" rx="14" ry="10" fill="#7dd3fc" transform="rotate(15 23 14)"/>
        <ellipse cx="14" cy="8" rx="4" ry="14" fill="#0369a1"/>
      </g>
      <g transform="translate(320, 280)">
        <ellipse cx="0" cy="0" rx="16" ry="11" fill="#facc15" transform="rotate(-25 0 0)"/>
        <ellipse cx="22" cy="0" rx="16" ry="11" fill="#facc15" transform="rotate(25 22 0)"/>
        <ellipse cx="4" cy="11" rx="11" ry="8" fill="#fef08a" transform="rotate(-15 4 11)"/>
        <ellipse cx="18" cy="11" rx="11" ry="8" fill="#fef08a" transform="rotate(15 18 11)"/>
        <ellipse cx="11" cy="6" rx="3" ry="11" fill="#854d0e"/>
      </g>

      <!-- Cute Red Ladybug on Big Leaf -->
      <g transform="translate(720, 620)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="0" rx="60" ry="24" fill="#15803d" transform="rotate(-15 0 0)"/>
        <ellipse cx="5" cy="-8" rx="18" ry="15" fill="#ef4444"/>
        <circle cx="18" cy="-10" r="7" fill="#0f172a"/>
        <circle cx="1" cy="-12" r="3" fill="#0f172a"/>
        <circle cx="3" cy="-3" r="3.5" fill="#0f172a"/>
        <circle cx="10" cy="-7" r="2.5" fill="#0f172a"/>
      </g>
    `
  },

  // 3. cover_good_friends (《我的好朋友》)
  {
    id: "cover_good_friends",
    title: "我的好朋友",
    defs: `
      <linearGradient id="sky3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fdba74"/>
        <stop offset="40%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#ffedd5"/>
      </linearGradient>
      <linearGradient id="floor3" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fde047"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <radialGradient id="rug3" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c4b5fd"/>
        <stop offset="70%" stop-color="#a78bfa"/>
        <stop offset="100%" stop-color="#8b5cf6"/>
      </radialGradient>
    `,
    content: `
      <!-- Room / Garden Sunlit Wall -->
      <rect width="1376" height="520" fill="url(#sky3)"/>
      <rect y="500" width="1376" height="268" fill="url(#floor3)"/>

      <!-- Window Arch with Outdoor Trees -->
      <path d="M150,500 L150,220 C150,120 350,120 350,220 L350,500 Z" fill="#93c5fd" opacity="0.6"/>
      <path d="M150,500 L150,220 C150,120 350,120 350,220 L350,500 Z" fill="none" stroke="#ffffff" stroke-width="12"/>
      <line x1="250" y1="125" x2="250" y2="500" stroke="#ffffff" stroke-width="8"/>
      <line x1="150" y1="310" x2="350" y2="310" stroke="#ffffff" stroke-width="8"/>
      <!-- Tree Outside Window -->
      <circle cx="210" cy="380" r="50" fill="#4ade80" opacity="0.8"/>
      <circle cx="270" cy="360" r="60" fill="#22c55e" opacity="0.8"/>

      <!-- Large Round Pastel Rug -->
      <ellipse cx="688" cy="620" rx="550" ry="130" fill="url(#rug3)" filter="url(#dropShadow)" opacity="0.9"/>
      <ellipse cx="688" cy="620" rx="490" ry="110" fill="#ddd6fe"/>

      <!-- Girl Character (Left) -->
      <g transform="translate(410, 310)" filter="url(#dropShadow)">
        <!-- Legs -->
        <ellipse cx="45" cy="270" rx="16" ry="10" fill="#fda4af"/>
        <ellipse cx="95" cy="270" rx="16" ry="10" fill="#fda4af"/>
        <!-- Dress -->
        <path d="M25,260 L45,150 L95,150 L115,260 Z" fill="#fb7185"/>
        <circle cx="70" cy="210" r="8" fill="#fef08a"/>
        <!-- Collar -->
        <path d="M50,150 Q70,165 90,150" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
        <!-- Head -->
        <ellipse cx="70" cy="95" rx="50" ry="46" fill="#fde68a"/>
        <!-- Hair -->
        <path d="M20,95 C15,35 125,35 120,95 C115,65 25,65 20,95 Z" fill="#1e1b4b"/>
        <!-- Double Hair Buns with Red Ribbons -->
        <circle cx="15" cy="50" r="22" fill="#1e1b4b"/>
        <circle cx="125" cy="50" r="22" fill="#1e1b4b"/>
        <circle cx="15" cy="50" r="12" fill="#ef4444"/>
        <circle cx="125" cy="50" r="12" fill="#ef4444"/>
        <!-- Face Features -->
        <ellipse cx="50" cy="98" rx="6.5" ry="9" fill="#1e293b"/>
        <ellipse cx="90" cy="98" rx="6.5" ry="9" fill="#1e293b"/>
        <circle cx="48" cy="95" r="2.8" fill="#ffffff"/>
        <circle cx="88" cy="95" r="2.8" fill="#ffffff"/>
        <!-- Cheeks & Smile -->
        <ellipse cx="40" cy="110" rx="9" ry="6" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="100" cy="110" rx="9" ry="6" fill="#fca5a5" opacity="0.85"/>
        <path d="M60,115 Q70,126 80,115" fill="none" stroke="#991b1b" stroke-width="3" stroke-linecap="round"/>
        <!-- Arms extending toward blocks -->
        <path d="M45,165 Q70,185 110,180" fill="none" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
        <circle cx="110" cy="180" r="8" fill="#fde68a"/>
      </g>

      <!-- Boy Character (Right) -->
      <g transform="translate(810, 310)" filter="url(#dropShadow)">
        <!-- Legs -->
        <ellipse cx="45" cy="270" rx="16" ry="10" fill="#60a5fa"/>
        <ellipse cx="95" cy="270" rx="16" ry="10" fill="#60a5fa"/>
        <!-- Overalls & T-shirt -->
        <rect x="40" y="150" width="60" height="110" rx="12" fill="#3b82f6"/>
        <rect x="35" y="145" width="70" height="45" rx="10" fill="#fbbf24"/>
        <!-- Straps & Buttons -->
        <rect x="45" y="150" width="10" height="50" fill="#2563eb"/>
        <rect x="85" y="150" width="10" height="50" fill="#2563eb"/>
        <circle cx="50" cy="190" r="4" fill="#ffffff"/>
        <circle cx="90" cy="190" r="4" fill="#ffffff"/>
        <!-- Head -->
        <ellipse cx="70" cy="95" rx="50" ry="46" fill="#fde68a"/>
        <!-- Short Spiky Boy Hair -->
        <path d="M18,90 C15,35 45,30 65,35 C85,25 125,35 122,90 C110,60 30,60 18,90 Z" fill="#312e81"/>
        <polygon points="45,35 55,20 65,36" fill="#312e81"/>
        <polygon points="70,33 80,18 90,34" fill="#312e81"/>
        <!-- Face Features -->
        <ellipse cx="50" cy="98" rx="6.5" ry="9" fill="#1e293b"/>
        <ellipse cx="90" cy="98" rx="6.5" ry="9" fill="#1e293b"/>
        <circle cx="48" cy="95" r="2.8" fill="#ffffff"/>
        <circle cx="88" cy="95" r="2.8" fill="#ffffff"/>
        <!-- Cheeks & Smile -->
        <ellipse cx="40" cy="110" rx="9" ry="6" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="100" cy="110" rx="9" ry="6" fill="#fca5a5" opacity="0.85"/>
        <path d="M60,115 Q70,126 80,115" fill="none" stroke="#991b1b" stroke-width="3" stroke-linecap="round"/>
        <!-- Arm offering a star block -->
        <path d="M85,165 Q60,185 20,180" fill="none" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
        <circle cx="20" cy="180" r="8" fill="#fde68a"/>
      </g>

      <!-- Center: Toy Castle Built with Wooden Blocks -->
      <g transform="translate(620, 440)" filter="url(#dropShadow)">
        <!-- Base Blocks -->
        <rect x="10" y="110" width="40" height="40" rx="4" fill="#ef4444"/>
        <rect x="55" y="110" width="40" height="40" rx="4" fill="#3b82f6"/>
        <rect x="100" y="110" width="40" height="40" rx="4" fill="#10b981"/>
        <!-- Archway -->
        <path d="M30,110 L30,75 C30,55 120,55 120,75 L120,110 Z" fill="#f59e0b"/>
        <!-- Columns -->
        <rect x="25" y="40" width="30" height="35" rx="3" fill="#ec4899"/>
        <rect x="95" y="40" width="30" height="35" rx="3" fill="#8b5cf6"/>
        <!-- Roof Pyramids -->
        <polygon points="40,10 20,40 60,40" fill="#06b6d4"/>
        <polygon points="110,10 90,40 130,40" fill="#ef4444"/>
        <!-- Floating Yellow Star Block between hands -->
        <polygon points="75,-5 82,10 98,10 85,20 90,35 75,25 60,35 65,20 52,10 68,10" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
      </g>

      <!-- Cute Puppy Watching (Foreground Right) -->
      <g transform="translate(1060, 500)" filter="url(#dropShadow)">
        <!-- Tail -->
        <path d="M110,95 Q130,70 120,55" fill="none" stroke="#d97724" stroke-width="10" stroke-linecap="round"/>
        <!-- Body -->
        <ellipse cx="75" cy="110" rx="45" ry="32" fill="#f59e0b"/>
        <!-- Head -->
        <ellipse cx="40" cy="70" rx="32" ry="28" fill="#f59e0b"/>
        <!-- Floppy Ears -->
        <ellipse cx="20" cy="75" rx="10" ry="22" fill="#b45309" transform="rotate(15 20 75)"/>
        <ellipse cx="60" cy="70" rx="10" ry="22" fill="#b45309" transform="rotate(-15 60 70)"/>
        <!-- Eyes & Nose -->
        <circle cx="32" cy="65" r="4.5" fill="#1e293b"/>
        <circle cx="48" cy="65" r="4.5" fill="#1e293b"/>
        <circle cx="31" cy="63" r="1.5" fill="#ffffff"/>
        <circle cx="47" cy="63" r="1.5" fill="#ffffff"/>
        <ellipse cx="40" cy="75" rx="5" ry="4" fill="#78350f"/>
        <!-- Tongue -->
        <path d="M38,82 C38,90 42,92 44,82 Z" fill="#f43f5e"/>
        <!-- Paws -->
        <ellipse cx="45" cy="135" rx="12" ry="8" fill="#f59e0b"/>
        <ellipse cx="85" cy="135" rx="12" ry="8" fill="#f59e0b"/>
      </g>
    `
  },

  // 4. cover_happy_school (《开开心心去上学》)
  {
    id: "cover_happy_school",
    title: "开开心心去上学",
    defs: `
      <linearGradient id="sky4" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="55%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="road4" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#cbd5e1"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
    `,
    content: `
      <!-- Morning Sky -->
      <rect width="1376" height="768" fill="url(#sky4)"/>
      <!-- Smiling Sun -->
      <circle cx="180" cy="150" r="60" fill="#facc15" filter="url(#softGlow)"/>
      <ellipse cx="165" cy="145" rx="4.5" ry="6" fill="#78350f"/>
      <ellipse cx="195" cy="145" rx="4.5" ry="6" fill="#78350f"/>
      <path d="M170,160 Q180,170 190,160" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>

      <!-- Clouds -->
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="400" cy="140" rx="90" ry="30"/><ellipse cx="450" cy="120" rx="60" ry="38"/>
        <ellipse cx="980" cy="130" rx="110" ry="35"/><ellipse cx="1040" cy="110" rx="75" ry="42"/>
      </g>

      <!-- Distant Hills & Trees -->
      <path d="M0,450 Q300,360 650,420 T1376,380 L1376,768 L0,768 Z" fill="#86efac"/>
      <circle cx="120" cy="410" r="50" fill="#22c55e"/>
      <circle cx="180" cy="390" r="65" fill="#16a34a"/>
      <circle cx="1250" cy="400" r="70" fill="#16a34a"/>

      <!-- Fairytale Kindergarten Schoolhouse (Center-Right) -->
      <g transform="translate(680, 240)" filter="url(#dropShadow)">
        <!-- Main Building -->
        <rect x="50" y="140" width="260" height="170" rx="8" fill="#fed7aa"/>
        <!-- Red Gable Roof -->
        <polygon points="180,40 30,145 330,145" fill="#f43f5e"/>
        <!-- Clock Tower -->
        <rect x="150" y="20" width="60" height="60" rx="4" fill="#fdba74"/>
        <polygon points="180,-25 140,20 220,20" fill="#ef4444"/>
        <circle cx="180" cy="50" r="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
        <line x1="180" y1="50" x2="180" y2="38" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="180" y1="50" x2="190" y2="50" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Arched Front Door -->
        <path d="M150,310 L150,220 C150,180 210,180 210,220 L210,310 Z" fill="#f59e0b"/>
        <circle cx="160" cy="250" r="4" fill="#ffffff"/>
        <!-- Cute Windows with Crossbars -->
        <rect x="75" y="180" width="50" height="50" rx="6" fill="#bae6fd" stroke="#ffffff" stroke-width="4"/>
        <rect x="235" y="180" width="50" height="50" rx="6" fill="#bae6fd" stroke="#ffffff" stroke-width="4"/>
        <!-- Rainbow Welcome Arch Above Door -->
        <path d="M130,220 C130,160 230,160 230,220" fill="none" stroke="#fb7185" stroke-width="6"/>
        <path d="M125,220 C125,152 235,152 235,220" fill="none" stroke="#facc15" stroke-width="6"/>
        <path d="M120,220 C120,144 240,144 240,220" fill="none" stroke="#38bdf8" stroke-width="6"/>
        <!-- Bunting Flags -->
        <polygon points="50,145 70,165 90,145" fill="#3b82f6"/>
        <polygon points="90,145 110,165 130,145" fill="#10b981"/>
        <polygon points="130,145 150,165 170,145" fill="#f59e0b"/>
        <polygon points="190,145 210,165 230,145" fill="#ec4899"/>
        <polygon points="230,145 250,165 270,145" fill="#8b5cf6"/>
        <polygon points="270,145 290,165 310,145" fill="#ef4444"/>
      </g>

      <!-- Yellow School Bus (Right Side) -->
      <g transform="translate(1020, 390)" filter="url(#dropShadow)">
        <rect x="0" y="40" width="240" height="120" rx="20" fill="#facc15"/>
        <rect x="20" y="55" width="45" height="40" rx="6" fill="#bae6fd"/>
        <rect x="75" y="55" width="45" height="40" rx="6" fill="#bae6fd"/>
        <rect x="130" y="55" width="45" height="40" rx="6" fill="#bae6fd"/>
        <rect x="185" y="55" width="40" height="50" rx="6" fill="#bae6fd"/>
        <!-- Stripe -->
        <rect x="0" y="115" width="240" height="14" fill="#1e293b"/>
        <!-- Wheels -->
        <circle cx="50" cy="160" r="26" fill="#1e293b"/>
        <circle cx="50" cy="160" r="12" fill="#94a3b8"/>
        <circle cx="185" cy="160" r="26" fill="#1e293b"/>
        <circle cx="185" cy="160" r="12" fill="#94a3b8"/>
        <!-- Cheerful Headlight Smile -->
        <circle cx="230" cy="120" r="10" fill="#ffffff"/>
      </g>

      <!-- Cobblestone Sidewalk Path -->
      <path d="M0,530 L1376,510 L1376,768 L0,768 Z" fill="url(#road4)"/>

      <!-- Cheerful Child Waving and Going to School (Foreground Left-Center) -->
      <g transform="translate(360, 360)" filter="url(#dropShadow)">
        <!-- Yellow Backpack -->
        <rect x="15" y="110" width="35" height="55" rx="10" fill="#facc15"/>
        <!-- Legs in Motion -->
        <ellipse cx="60" cy="270" rx="14" ry="9" fill="#1e293b"/>
        <ellipse cx="105" cy="265" rx="14" ry="9" fill="#1e293b"/>
        <line x1="60" y1="210" x2="60" y2="265" stroke="#fde68a" stroke-width="16" stroke-linecap="round"/>
        <line x1="85" y1="210" x2="105" y2="260" stroke="#fde68a" stroke-width="16" stroke-linecap="round"/>
        <!-- Red Shorts & Striped Shirt -->
        <rect x="48" y="180" width="50" height="45" rx="8" fill="#ef4444"/>
        <rect x="42" y="125" width="62" height="60" rx="12" fill="#38bdf8"/>
        <rect x="42" y="145" width="62" height="10" fill="#ffffff"/>
        <!-- Head -->
        <ellipse cx="73" cy="78" rx="46" ry="42" fill="#fde68a"/>
        <!-- Yellow Bucket Hat -->
        <path d="M35,65 C38,20 108,20 111,65 Z" fill="#facc15"/>
        <ellipse cx="73" cy="65" rx="52" ry="12" fill="#eab308"/>
        <!-- Face Features -->
        <ellipse cx="55" cy="80" rx="6" ry="8.5" fill="#1e293b"/>
        <ellipse cx="91" cy="80" rx="6" ry="8.5" fill="#1e293b"/>
        <circle cx="53" cy="77" r="2.5" fill="#ffffff"/>
        <circle cx="89" cy="77" r="2.5" fill="#ffffff"/>
        <ellipse cx="46" cy="92" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="100" cy="92" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>
        <path d="M64,96 Q73,106 82,96" fill="none" stroke="#991b1b" stroke-width="3" stroke-linecap="round"/>
        <!-- Waving Hand High in Air -->
        <path d="M95,140 Q125,100 120,65" fill="none" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
        <circle cx="120" cy="65" r="8" fill="#fde68a"/>
      </g>
    `
  },

  // 5. cover_good_children (《我们都是好孩子》)
  {
    id: "cover_good_children",
    title: "我们都是好孩子",
    defs: `
      <linearGradient id="sky5" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#67e8f9"/>
        <stop offset="50%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="lawn5" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
    `,
    content: `
      <!-- Sky & Soft Heart Cloud -->
      <rect width="1376" height="768" fill="url(#sky5)"/>
      <g fill="#ffffff" opacity="0.9">
        <!-- Cute Heart-Shaped Cloud -->
        <path d="M688,140 C640,70 560,90 560,160 C560,230 688,290 688,290 C688,290 816,230 816,160 C816,90 736,70 688,140 Z" filter="url(#softGlow)"/>
        <ellipse cx="200" cy="180" rx="85" ry="30"/><ellipse cx="250" cy="165" rx="60" ry="35"/>
        <ellipse cx="1180" cy="170" rx="90" ry="30"/><ellipse cx="1230" cy="155" rx="60" ry="35"/>
      </g>

      <!-- Sunny Green Kindergarten Meadow -->
      <path d="M-50,470 Q350,380 750,440 T1450,420 L1450,768 L-50,768 Z" fill="url(#lawn5)"/>

      <!-- Flowers and Decorative Trees -->
      <circle cx="150" cy="380" r="75" fill="#22c55e" opacity="0.9"/>
      <circle cx="210" cy="360" r="90" fill="#15803d" opacity="0.9"/>
      <circle cx="1220" cy="370" r="85" fill="#15803d" opacity="0.9"/>

      <!-- Good Deed 1: Girl Watering Flowers (Left) -->
      <g transform="translate(240, 360)" filter="url(#dropShadow)">
        <!-- Potted Sunflower -->
        <rect x="20" y="240" width="50" height="45" rx="6" fill="#b45309"/>
        <path d="M45,240 Q45,180 45,160" fill="none" stroke="#16a34a" stroke-width="8"/>
        <circle cx="45" cy="155" r="22" fill="#facc15"/>
        <circle cx="45" cy="155" r="12" fill="#78350f"/>
        <!-- Girl -->
        <!-- Dress -->
        <path d="M110,270 L130,170 L175,170 L195,270 Z" fill="#ec4899"/>
        <!-- Head -->
        <ellipse cx="152" cy="115" rx="42" ry="38" fill="#fde68a"/>
        <!-- Hair Braid -->
        <path d="M115,115 C110,70 195,70 190,115 C185,90 120,90 115,115 Z" fill="#1e1b4b"/>
        <ellipse cx="110" cy="145" rx="10" ry="18" fill="#1e1b4b"/>
        <!-- Face -->
        <ellipse cx="138" cy="118" rx="5.5" ry="7.5" fill="#1e293b"/>
        <ellipse cx="166" cy="118" rx="5.5" ry="7.5" fill="#1e293b"/>
        <circle cx="136" cy="115" r="2.2" fill="#ffffff"/>
        <circle cx="164" cy="115" r="2.2" fill="#ffffff"/>
        <ellipse cx="130" cy="128" rx="7" ry="4.5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="174" cy="128" rx="7" ry="4.5" fill="#fca5a5" opacity="0.85"/>
        <path d="M144,133 Q152,141 160,133" fill="none" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Watering Can -->
        <rect x="75" y="195" width="35" height="25" rx="4" fill="#38bdf8"/>
        <path d="M75,200 L55,185" stroke="#38bdf8" stroke-width="5" stroke-linecap="round"/>
        <!-- Water Drops -->
        <circle cx="48" cy="195" r="3" fill="#60a5fa"/>
        <circle cx="44" cy="210" r="3.5" fill="#60a5fa"/>
        <circle cx="46" cy="225" r="3" fill="#60a5fa"/>
        <!-- Arm -->
        <path d="M140,180 Q115,190 95,200" fill="none" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
      </g>

      <!-- Good Deed 2: Two Children Greeting / Bowing politely (Center) -->
      <g transform="translate(600, 350)" filter="url(#dropShadow)">
        <!-- Boy in Blue bowing gently -->
        <g transform="translate(0, 10)">
          <!-- Legs -->
          <line x1="50" y1="210" x2="50" y2="280" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
          <line x1="75" y1="210" x2="75" y2="280" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
          <!-- Shirt & Pants -->
          <rect x="40" y="195" width="45" height="35" rx="6" fill="#3b82f6"/>
          <rect x="35" y="135" width="55" height="65" rx="10" fill="#f59e0b"/>
          <!-- Head -->
          <ellipse cx="62" cy="85" rx="42" ry="38" fill="#fde68a"/>
          <path d="M22,80 C20,35 105,35 102,80 Z" fill="#312e81"/>
          <!-- Face -->
          <ellipse cx="50" cy="88" rx="5" ry="7" fill="#1e293b"/>
          <ellipse cx="74" cy="88" rx="5" ry="7" fill="#1e293b"/>
          <circle cx="48" cy="86" r="2" fill="#ffffff"/>
          <circle cx="72" cy="86" r="2" fill="#ffffff"/>
          <ellipse cx="42" cy="98" rx="6" ry="4" fill="#fca5a5" opacity="0.85"/>
          <ellipse cx="82" cy="98" rx="6" ry="4" fill="#fca5a5" opacity="0.85"/>
          <path d="M54,102 Q62,110 70,102" fill="none" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Hand in polite greeting gesture -->
          <path d="M62,150 Q90,165 110,150" fill="none" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
        </g>

        <!-- Girl with Red Bow greeting back -->
        <g transform="translate(130, 0)">
          <path d="M35,280 L55,175 L100,175 L120,280 Z" fill="#10b981"/>
          <ellipse cx="78" cy="115" rx="42" ry="38" fill="#fde68a"/>
          <path d="M38,110 C35,65 120,65 118,110 Z" fill="#1e1b4b"/>
          <!-- Red Bow on head -->
          <polygon points="78,72 65,60 65,84" fill="#ef4444"/>
          <polygon points="78,72 91,60 91,84" fill="#ef4444"/>
          <circle cx="78" cy="72" r="6" fill="#dc2626"/>
          <!-- Face -->
          <ellipse cx="66" cy="118" rx="5.5" ry="7.5" fill="#1e293b"/>
          <ellipse cx="90" cy="118" rx="5.5" ry="7.5" fill="#1e293b"/>
          <circle cx="64" cy="115" r="2.2" fill="#ffffff"/>
          <circle cx="88" cy="115" r="2.2" fill="#ffffff"/>
          <ellipse cx="58" cy="128" rx="7" ry="4.5" fill="#fca5a5" opacity="0.85"/>
          <ellipse cx="98" cy="128" rx="7" ry="4.5" fill="#fca5a5" opacity="0.85"/>
          <path d="M70,133 Q78,141 86,133" fill="none" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M78,185 Q50,170 30,160" fill="none" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
        </g>
      </g>

      <!-- Good Deed 3: Boy Tidying Colorful Storybooks (Right) -->
      <g transform="translate(980, 390)" filter="url(#dropShadow)">
        <!-- Low Wooden Bookshelf -->
        <rect x="0" y="160" width="130" height="90" rx="8" fill="#b45309"/>
        <rect x="8" y="168" width="114" height="74" rx="4" fill="#fef3c7"/>
        <!-- Books on Shelf -->
        <rect x="18" y="180" width="14" height="55" rx="3" fill="#ef4444"/>
        <rect x="36" y="185" width="14" height="50" rx="3" fill="#3b82f6"/>
        <rect x="54" y="175" width="14" height="60" rx="3" fill="#10b981"/>
        <rect x="72" y="182" width="14" height="53" rx="3" fill="#f59e0b"/>
        <!-- Boy happily placing a new book -->
        <!-- T-shirt & Shorts -->
        <rect x="145" y="150" width="50" height="55" rx="10" fill="#a855f7"/>
        <rect x="150" y="200" width="40" height="35" rx="6" fill="#3b82f6"/>
        <line x1="160" y1="230" x2="160" y2="280" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
        <line x1="180" y1="230" x2="180" y2="280" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
        <!-- Head -->
        <ellipse cx="170" cy="105" rx="38" ry="35" fill="#fde68a"/>
        <path d="M135,100 C132,60 208,60 205,100 Z" fill="#312e81"/>
        <!-- Face -->
        <ellipse cx="158" cy="108" rx="5" ry="7" fill="#1e293b"/>
        <ellipse cx="182" cy="108" rx="5" ry="7" fill="#1e293b"/>
        <circle cx="156" cy="106" r="2" fill="#ffffff"/>
        <circle cx="180" cy="106" r="2" fill="#ffffff"/>
        <path d="M162,120 Q170,128 178,120" fill="none" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Holding book in hand -->
        <rect x="105" y="150" width="22" height="30" rx="4" fill="#ec4899" transform="rotate(-15 105 150)"/>
        <path d="M160,160 Q130,165 118,160" fill="none" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
      </g>
    `
  },

  // 6. cover_monkey_fruit (《小猴采果子》)
  {
    id: "cover_monkey_fruit",
    title: "小猴采果子",
    defs: `
      <linearGradient id="sky6" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="hill6" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="100%" stop-color="#16a34a"/>
      </linearGradient>
    `,
    content: `
      <!-- Orchard Sky -->
      <rect width="1376" height="768" fill="url(#sky6)"/>
      <circle cx="220" cy="160" r="65" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Rolling Hills -->
      <path d="M0,520 Q350,410 750,480 T1376,440 L1376,768 L0,768 Z" fill="url(#hill6)"/>

      <!-- Magnificent Gnarled Fruit Tree -->
      <g filter="url(#dropShadow)">
        <!-- Trunk & Major Branches -->
        <path d="M480,768 C520,620 480,480 430,420 C380,360 280,340 180,330" fill="none" stroke="#78350f" stroke-width="50" stroke-linecap="round"/>
        <path d="M450,450 C520,380 640,360 820,370" fill="none" stroke="#78350f" stroke-width="42" stroke-linecap="round"/>
        <path d="M480,768 C520,620 480,480 430,420 C380,360 280,340 180,330" fill="none" stroke="#92400e" stroke-width="36" stroke-linecap="round"/>
        <path d="M450,450 C520,380 640,360 820,370" fill="none" stroke="#92400e" stroke-width="30" stroke-linecap="round"/>

        <!-- Lush Canopy Clumps -->
        <circle cx="220" cy="260" r="130" fill="#22c55e"/>
        <circle cx="380" cy="220" r="150" fill="#16a34a"/>
        <circle cx="560" cy="200" r="160" fill="#22c55e"/>
        <circle cx="740" cy="230" r="145" fill="#15803d"/>
        <circle cx="890" cy="280" r="130" fill="#16a34a"/>

        <!-- Big Red Apples in Tree -->
        <g filter="url(#dropShadow)">
          <!-- Apple 1 -->
          <circle cx="310" cy="260" r="22" fill="#ef4444"/>
          <ellipse cx="304" cy="254" rx="5" ry="7" fill="#fca5a5" transform="rotate(-30 304 254)"/>
          <path d="M310,238 C310,230 315,226 318,225" stroke="#78350f" stroke-width="3.5" fill="none"/>
          <path d="M318,225 Q326,220 326,228 Z" fill="#22c55e"/>
          <!-- Apple 2 -->
          <circle cx="480" cy="230" r="24" fill="#ef4444"/>
          <ellipse cx="474" cy="224" rx="5" ry="7" fill="#fca5a5" transform="rotate(-30 474 224)"/>
          <!-- Apple 3 -->
          <circle cx="680" cy="260" r="23" fill="#ef4444"/>
          <ellipse cx="674" cy="254" rx="5" ry="7" fill="#fca5a5" transform="rotate(-30 674 254)"/>
          <!-- Apple 4 (Target Apple near Monkey) -->
          <circle cx="780" cy="340" r="26" fill="#ef4444"/>
          <ellipse cx="773" cy="333" rx="6" ry="8" fill="#fca5a5" transform="rotate(-30 773 333)"/>
          <path d="M780,314 C780,305 786,300 790,298" stroke="#78350f" stroke-width="4" fill="none"/>
        </g>
      </g>

      <!-- Little Monkey Hanging from Branch & Picking Apple -->
      <g transform="translate(560, 310)" filter="url(#dropShadow)">
        <!-- Tail wrapped around upper branch -->
        <path d="M20,60 C-10,30 20,-30 45,-20 C60,-10 30,20 10,40" fill="none" stroke="#d97724" stroke-width="14" stroke-linecap="round"/>
        <path d="M20,60 C-10,30 20,-30 45,-20 C60,-10 30,20 10,40" fill="none" stroke="#f6ad55" stroke-width="8" stroke-linecap="round"/>
        <!-- Body -->
        <ellipse cx="60" cy="80" rx="36" ry="42" fill="#ed8936"/>
        <ellipse cx="62" cy="82" rx="24" ry="28" fill="#fde68a"/>
        <!-- Head -->
        <ellipse cx="95" cy="40" rx="44" ry="40" fill="#ed8936"/>
        <!-- Ears -->
        <ellipse cx="65" cy="20" rx="14" ry="16" fill="#ed8936"/>
        <ellipse cx="65" cy="20" rx="9" ry="11" fill="#fde68a"/>
        <ellipse cx="135" cy="30" rx="14" ry="16" fill="#ed8936"/>
        <ellipse cx="135" cy="30" rx="9" ry="11" fill="#fde68a"/>
        <!-- Face Mask -->
        <path d="M95,24 C82,10 65,18 68,40 C70,55 86,65 95,65 C104,65 120,55 122,40 C125,18 108,10 95,24 Z" fill="#fef08a"/>
        <!-- Eyes looking at the big apple -->
        <ellipse cx="85" cy="38" rx="6.5" ry="9" fill="#1e293b"/>
        <ellipse cx="112" cy="40" rx="6.5" ry="9" fill="#1e293b"/>
        <circle cx="87" cy="36" r="2.8" fill="#ffffff"/>
        <circle cx="114" cy="38" r="2.8" fill="#ffffff"/>
        <!-- Cheeks & Happy Smile -->
        <ellipse cx="76" cy="48" rx="7" ry="5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="120" cy="50" rx="7" ry="5" fill="#fca5a5" opacity="0.85"/>
        <path d="M90,52 Q98,60 106,52" fill="none" stroke="#9a3412" stroke-width="2.8" stroke-linecap="round"/>
        <!-- Extended Arm reaching for apple -->
        <path d="M110,70 Q150,60 190,40" fill="none" stroke="#ed8936" stroke-width="14" stroke-linecap="round"/>
        <circle cx="190" cy="40" r="8" fill="#fde68a"/>
        <!-- Other Arm holding branch -->
        <path d="M50,70 Q30,40 20,20" fill="none" stroke="#ed8936" stroke-width="14" stroke-linecap="round"/>
      </g>

      <!-- Woven Fruit Basket on Lawn (Foreground Right) -->
      <g transform="translate(980, 520)" filter="url(#dropShadow)">
        <!-- Basket Body with Woven Texture -->
        <path d="M20,50 L35,130 L155,130 L170,50 Z" fill="#d97724"/>
        <path d="M20,50 L35,130 L155,130 L170,50 Z" fill="none" stroke="#b45309" stroke-width="6"/>
        <!-- Wicker lines -->
        <line x1="30" y1="75" x2="160" y2="75" stroke="#b45309" stroke-width="4"/>
        <line x1="32" y1="100" x2="158" y2="100" stroke="#b45309" stroke-width="4"/>
        <!-- Basket Handle -->
        <path d="M25,50 C25,-10 165,-10 165,50" fill="none" stroke="#b45309" stroke-width="10" stroke-linecap="round"/>
        <!-- Overflowing Apples in Basket -->
        <circle cx="60" cy="45" r="22" fill="#ef4444"/>
        <circle cx="95" cy="40" r="24" fill="#dc2626"/>
        <circle cx="130" cy="48" r="22" fill="#ef4444"/>
        <circle cx="75" cy="20" r="20" fill="#f87171"/>
        <circle cx="110" cy="22" r="21" fill="#ef4444"/>
      </g>
    `
  },

  // 7. cover_four_seasons (《四季的歌》)
  {
    id: "cover_four_seasons",
    title: "四季的歌",
    defs: `
      <linearGradient id="gSpring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fce7f3"/>
        <stop offset="100%" stop-color="#fbcfe8"/>
      </linearGradient>
      <linearGradient id="gSummer" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#dcfce7"/>
        <stop offset="100%" stop-color="#86efac"/>
      </linearGradient>
      <linearGradient id="gAutumn" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffedd5"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="gWinter" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#bae6fd"/>
      </linearGradient>
      <linearGradient id="goldMusic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#eab308"/>
      </linearGradient>
    `,
    content: `
      <!-- Quadrant Backgrounds -->
      <!-- Top-Left: Spring -->
      <rect x="0" y="0" width="688" height="384" fill="url(#gSpring)"/>
      <!-- Top-Right: Summer -->
      <rect x="688" y="0" width="688" height="384" fill="url(#gSummer)"/>
      <!-- Bottom-Left: Autumn -->
      <rect x="0" y="384" width="688" height="384" fill="url(#gAutumn)"/>
      <!-- Bottom-Right: Winter -->
      <rect x="688" y="384" width="688" height="384" fill="url(#gWinter)"/>

      <!-- Spring Corner (Top-Left): Cherry Blossoms & Swallows -->
      <g filter="url(#dropShadow)">
        <!-- Cherry Tree Branch -->
        <path d="M0,80 Q160,110 320,60" fill="none" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
        <!-- Pink Blossoms -->
        <g fill="#f472b6">
          <circle cx="120" cy="80" r="16"/><circle cx="108" cy="72" r="12"/><circle cx="132" cy="72" r="12"/><circle cx="120" cy="76" r="6" fill="#fef08a"/>
          <circle cx="200" cy="95" r="18"/><circle cx="188" cy="86" r="14"/><circle cx="212" cy="86" r="14"/><circle cx="200" cy="90" r="7" fill="#fef08a"/>
          <circle cx="280" cy="65" r="15"/><circle cx="268" cy="58" r="11"/><circle cx="292" cy="58" r="11"/><circle cx="280" cy="62" r="6" fill="#fef08a"/>
        </g>
        <!-- Flying Spring Swallow -->
        <g transform="translate(380, 140)">
          <path d="M0,0 Q25,-25 50,-10 Q25,10 0,0 Z" fill="#1e1b4b"/>
          <path d="M15,-5 Q40,-40 65,-30 Q35,-15 15,-5 Z" fill="#1e1b4b"/>
          <path d="M15,5 Q40,40 65,30 Q35,15 15,5 Z" fill="#1e1b4b"/>
          <!-- Forked Tail -->
          <polygon points="-10,-5 -40,-15 -25,0 -40,15 -10,5" fill="#1e1b4b"/>
          <circle cx="35" cy="-8" r="4" fill="#ef4444"/>
        </g>
      </g>

      <!-- Summer Corner (Top-Right): Lotus Pond & Bright Sun -->
      <g filter="url(#dropShadow)">
        <!-- Golden Sun -->
        <circle cx="1250" cy="100" r="50" fill="#fbbf24" filter="url(#softGlow)"/>
        <!-- Lotus Pond -->
        <ellipse cx="1040" cy="290" rx="220" ry="70" fill="#38bdf8" opacity="0.8"/>
        <!-- Lotus Pads -->
        <ellipse cx="960" cy="295" rx="55" ry="24" fill="#16a34a"/>
        <ellipse cx="1120" cy="305" rx="60" ry="26" fill="#15803d"/>
        <!-- Blooming Pink Lotus -->
        <g transform="translate(1040, 260)">
          <ellipse cx="-15" cy="0" rx="14" ry="26" fill="#f472b6" transform="rotate(-20 -15 0)"/>
          <ellipse cx="15" cy="0" rx="14" ry="26" fill="#f472b6" transform="rotate(20 15 0)"/>
          <ellipse cx="0" cy="-5" rx="14" ry="30" fill="#fb7185"/>
          <ellipse cx="0" cy="2" rx="8" ry="16" fill="#fef08a"/>
        </g>
      </g>

      <!-- Autumn Corner (Bottom-Left): Golden Ginkgo Leaves & Ripe Pumpkin -->
      <g filter="url(#dropShadow)">
        <!-- Plump Orange Pumpkin -->
        <g transform="translate(260, 580)">
          <ellipse cx="0" cy="0" rx="75" ry="55" fill="#ea580c"/>
          <ellipse cx="-25" cy="0" rx="60" ry="52" fill="#f97316"/>
          <ellipse cx="25" cy="0" rx="60" ry="52" fill="#f97316"/>
          <ellipse cx="0" cy="0" rx="45" ry="50" fill="#fb923c"/>
          <rect x="-8" y="-70" width="16" height="25" rx="4" fill="#15803d"/>
        </g>
        <!-- Swirling Golden Ginkgo Leaves -->
        <g fill="#eab308">
          <path d="M120,480 C110,450 150,440 160,470 C160,490 140,500 120,480 Z"/>
          <path d="M380,510 C370,480 410,470 420,500 C420,520 400,530 380,510 Z"/>
          <path d="M180,660 C170,630 210,620 220,650 C220,670 200,680 180,660 Z"/>
        </g>
      </g>

      <!-- Winter Corner (Bottom-Right): Snowy Pine & Cute Snowman -->
      <g filter="url(#dropShadow)">
        <!-- Snowdrift Ground -->
        <path d="M688,680 Q1000,620 1376,660 L1376,768 L688,768 Z" fill="#f8fafc"/>
        <!-- Snowman -->
        <g transform="translate(1080, 560)">
          <!-- Bottom Snowball -->
          <circle cx="0" cy="80" r="65" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
          <!-- Top Snowball -->
          <circle cx="0" cy="-5" r="45" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
          <!-- Red Hat -->
          <polygon points="0,-85 -28,-40 28,-40" fill="#ef4444"/>
          <circle cx="0" cy="-85" r="8" fill="#ffffff"/>
          <!-- Red Scarf -->
          <path d="M-30,-5 Q0,10 30,-5" fill="none" stroke="#ef4444" stroke-width="12" stroke-linecap="round"/>
          <path d="M15,-5 L20,35" stroke="#ef4444" stroke-width="10" stroke-linecap="round"/>
          <!-- Coal Eyes & Carrot Nose -->
          <circle cx="-14" cy="-12" r="4.5" fill="#1e293b"/>
          <circle cx="14" cy="-12" r="4.5" fill="#1e293b"/>
          <polygon points="0,-4 30,-1 0,3" fill="#ea580c"/>
          <!-- Branch Arms -->
          <line x1="-35" y1="50" x2="-80" y2="25" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
          <line x1="35" y1="50" x2="80" y2="25" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
        </g>
      </g>

      <!-- Center Dynamic Golden Musical Ribbon & Notes Connecting All 4 Seasons -->
      <g filter="url(#dropShadow)">
        <!-- Flowing Ribbon -->
        <path d="M100,200 C300,500 500,150 688,384 C850,580 1100,200 1280,480" fill="none" stroke="url(#goldMusic)" stroke-width="12" stroke-linecap="round" opacity="0.85"/>
        <path d="M100,200 C300,500 500,150 688,384 C850,580 1100,200 1280,480" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.6"/>

        <!-- Center Treble Clef Emblem -->
        <circle cx="688" cy="384" r="55" fill="#ffffff" filter="url(#softGlow)"/>
        <circle cx="688" cy="384" r="48" fill="url(#goldMusic)"/>
        <!-- Treble Clef Symbol -->
        <path d="M685,348 C695,348 700,358 695,368 C685,385 675,395 675,410 C675,425 690,430 695,420 C700,410 690,400 685,400 M688,335 L688,435 C688,445 678,445 678,438" fill="none" stroke="#78350f" stroke-width="4.5" stroke-linecap="round"/>

        <!-- Musical Notes floating along ribbon -->
        <!-- Note 1 -->
        <g transform="translate(480, 240)" fill="#f59e0b">
          <ellipse cx="10" cy="20" rx="8" ry="6" transform="rotate(-20 10 20)"/>
          <line x1="16" y1="18" x2="16" y2="0" stroke="#f59e0b" stroke-width="3"/>
          <line x1="16" y1="0" x2="26" y2="4" stroke="#f59e0b" stroke-width="3"/>
        </g>
        <!-- Note 2 -->
        <g transform="translate(860, 480)" fill="#f59e0b">
          <ellipse cx="10" cy="20" rx="8" ry="6" transform="rotate(-20 10 20)"/>
          <line x1="16" y1="18" x2="16" y2="0" stroke="#f59e0b" stroke-width="3"/>
        </g>
        <!-- Note 3 -->
        <g transform="translate(940, 260)" fill="#f59e0b">
          <ellipse cx="10" cy="20" rx="8" ry="6" transform="rotate(-20 10 20)"/>
          <line x1="16" y1="18" x2="16" y2="0" stroke="#f59e0b" stroke-width="3"/>
          <line x1="16" y1="0" x2="26" y2="4" stroke="#f59e0b" stroke-width="3"/>
        </g>
      </g>
    `
  },

  // 8. cover_color_magic (《色彩魔法师》)
  {
    id: "cover_color_magic",
    title: "色彩魔法师",
    defs: `
      <linearGradient id="sky8" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="35%" stop-color="#312e81"/>
        <stop offset="70%" stop-color="#6b21a8"/>
        <stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
      <linearGradient id="rainbow1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="20%" stop-color="#f97316"/>
        <stop offset="40%" stop-color="#facc15"/>
        <stop offset="60%" stop-color="#22c55e"/>
        <stop offset="80%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#a855f7"/>
      </linearGradient>
    `,
    content: `
      <!-- Deep Twilight Magic Sky -->
      <rect width="1376" height="768" fill="url(#sky8)"/>

      <!-- Twinkling Golden Stars in Sky -->
      <g fill="#fef08a" opacity="0.85">
        <polygon points="120,80 123,88 132,90 124,94 126,102 120,96 114,102 116,94 108,90 117,88"/>
        <polygon points="280,140 282,146 288,148 283,151 284,157 280,153 276,157 277,151 272,148 278,146"/>
        <polygon points="980,90 983,98 992,100 984,104 986,112 980,106 974,112 976,104 968,100 977,98"/>
        <polygon points="1150,160 1152,166 1158,168 1153,171 1154,177 1150,173 1146,177 1147,171 1142,168 1148,166"/>
        <polygon points="840,240 842,246 848,248 843,251 844,257 840,253 836,257 837,251 832,248 838,246"/>
        <circle cx="180" cy="220" r="3"/><circle cx="340" cy="80" r="2.5"/><circle cx="1060" cy="220" r="3.5"/><circle cx="1240" cy="90" r="2.5"/>
      </g>

      <!-- Giant Sweeping Luminous Rainbow Ribbon Paint Trail -->
      <g filter="url(#dropShadow)">
        <path d="M350,380 C480,200 680,220 860,340 C1040,460 1200,380 1376,320" fill="none" stroke="url(#rainbow1)" stroke-width="32" stroke-linecap="round" opacity="0.9"/>
        <path d="M350,380 C480,200 680,220 860,340 C1040,460 1200,380 1376,320" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
      </g>

      <!-- Glowing Butterlies Born from Paint Trail -->
      <g transform="translate(860, 310)" filter="url(#softGlow)">
        <ellipse cx="0" cy="0" rx="18" ry="12" fill="#facc15" transform="rotate(-25 0 0)"/>
        <ellipse cx="24" cy="0" rx="18" ry="12" fill="#facc15" transform="rotate(25 24 0)"/>
        <ellipse cx="12" cy="6" rx="3.5" ry="12" fill="#ffffff"/>
      </g>
      <g transform="translate(1120, 330)" filter="url(#softGlow)">
        <ellipse cx="0" cy="0" rx="16" ry="11" fill="#38bdf8" transform="rotate(-25 0 0)"/>
        <ellipse cx="22" cy="0" rx="16" ry="11" fill="#38bdf8" transform="rotate(25 22 0)"/>
        <ellipse cx="11" cy="5" rx="3" ry="11" fill="#ffffff"/>
      </g>

      <!-- Soft Cloud Mount for Little Magician -->
      <g transform="translate(180, 480)" fill="#ffffff" filter="url(#dropShadow)" opacity="0.95">
        <ellipse cx="160" cy="80" rx="160" ry="50"/>
        <ellipse cx="100" cy="50" rx="90" ry="55"/>
        <ellipse cx="220" cy="55" rx="100" ry="55"/>
        <ellipse cx="160" cy="30" rx="80" ry="50"/>
      </g>

      <!-- Little Child Color Magician -->
      <g transform="translate(260, 260)" filter="url(#dropShadow)">
        <!-- Wizard Robe / Artist Smock -->
        <path d="M40,250 L60,140 L120,140 L140,250 Z" fill="#7c3aed"/>
        <!-- Colorful Paint Splatters on Apron -->
        <circle cx="80" cy="180" r="7" fill="#facc15"/>
        <circle cx="100" cy="205" r="9" fill="#38bdf8"/>
        <circle cx="75" cy="220" r="8" fill="#f43f5e"/>
        <!-- Head -->
        <ellipse cx="90" cy="85" rx="46" ry="42" fill="#fde68a"/>
        <path d="M45,85 C42,40 138,40 135,85 Z" fill="#1e1b4b"/>
        <!-- Big Wizard Hat with Stars -->
        <polygon points="90,-40 30,55 150,55" fill="#581c87"/>
        <ellipse cx="90" cy="55" rx="75" ry="18" fill="#6b21a8"/>
        <!-- Golden Star on Hat -->
        <polygon points="90,10 93,18 102,20 94,24 96,32 90,26 84,32 86,24 78,20 87,18" fill="#fde047"/>
        <!-- Face Features -->
        <ellipse cx="72" cy="88" rx="6.5" ry="9" fill="#1e293b"/>
        <ellipse cx="108" cy="88" rx="6.5" ry="9" fill="#1e293b"/>
        <circle cx="70" cy="85" r="2.8" fill="#ffffff"/>
        <circle cx="106" cy="85" r="2.8" fill="#ffffff"/>
        <ellipse cx="62" cy="100" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="118" cy="100" rx="8" ry="5.5" fill="#fca5a5" opacity="0.85"/>
        <path d="M82,105 Q90,115 98,105" fill="none" stroke="#991b1b" stroke-width="3" stroke-linecap="round"/>

        <!-- Giant Magic Paintbrush Held in Hand -->
        <g transform="translate(110, 140) rotate(-35)">
          <!-- Handle -->
          <rect x="-8" y="-120" width="16" height="150" rx="6" fill="#b45309"/>
          <!-- Ferrule -->
          <rect x="-10" y="30" width="20" height="25" fill="#cbd5e1"/>
          <!-- Bristles with Glowing Rainbow Tip -->
          <path d="M-10,55 C-12,90 0,110 0,110 C0,110 12,90 10,55 Z" fill="#f43f5e" filter="url(#softGlow)"/>
          <circle cx="0" cy="110" r="14" fill="#ffffff" filter="url(#softGlow)"/>
        </g>
        <!-- Arm Wielding Brush -->
        <path d="M100,150 Q130,135 140,115" fill="none" stroke="#fde68a" stroke-width="14" stroke-linecap="round"/>
      </g>
    `
  },

  // 9. cover_happy_town (《快乐的小镇》)
  {
    id: "cover_happy_town",
    title: "快乐的小镇",
    defs: `
      <linearGradient id="sky9" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="street9" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
    `,
    content: `
      <!-- Cheerful Morning Sky -->
      <rect width="1376" height="768" fill="url(#sky9)"/>
      <circle cx="160" cy="130" r="60" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Distant Soft Hills -->
      <path d="M0,420 Q350,340 700,390 T1376,360 L1376,768 L0,768 Z" fill="#86efac"/>

      <!-- Storybook Small Town Buildings -->
      <g filter="url(#dropShadow)">
        <!-- House 1: Bakery (Left) -->
        <g transform="translate(100, 260)">
          <rect x="0" y="100" width="180" height="180" rx="8" fill="#fed7aa"/>
          <polygon points="90,10 -20,105 200,105" fill="#ea580c"/>
          <!-- Chimney with Smoke -->
          <rect x="130" y="25" width="28" height="55" rx="3" fill="#c2410c"/>
          <ellipse cx="144" cy="10" rx="14" ry="7" fill="#ffffff" opacity="0.6"/>
          <ellipse cx="154" cy="-10" rx="18" ry="9" fill="#ffffff" opacity="0.4"/>
          <!-- Striped Awning -->
          <path d="M-10,170 L190,170 L180,195 L-20,195 Z" fill="#ef4444"/>
          <path d="M20,170 L50,170 L40,195 L10,195 Z" fill="#ffffff"/>
          <path d="M80,170 L110,170 L100,195 L70,195 Z" fill="#ffffff"/>
          <path d="M140,170 L170,170 L160,195 L130,195 Z" fill="#ffffff"/>
          <!-- Window with Croissant Sign -->
          <rect x="45" y="205" width="90" height="55" rx="6" fill="#bae6fd"/>
          <!-- Bread Shape -->
          <path d="M75,235 Q90,220 105,235 Z" fill="#b45309"/>
        </g>

        <!-- House 2: Central Clock / Town Hall -->
        <g transform="translate(320, 180)">
          <rect x="30" y="140" width="220" height="220" rx="8" fill="#fef08a"/>
          <!-- Steep Blue Roof -->
          <polygon points="140,10 15,145 265,145" fill="#3b82f6"/>
          <!-- Clock -->
          <circle cx="140" cy="90" r="26" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
          <line x1="140" y1="90" x2="140" y2="74" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="140" y1="90" x2="152" y2="90" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round"/>
          <!-- Grand Arch Door -->
          <path d="M110,360 L110,270 C110,230 170,230 170,270 L170,360 Z" fill="#78350f"/>
          <!-- Flower Boxes under Windows -->
          <rect x="48" y="200" width="45" height="40" rx="4" fill="#bae6fd"/>
          <rect x="45" y="235" width="51" height="12" rx="3" fill="#dc2626"/>
          <circle cx="55" cy="235" r="5" fill="#f43f5e"/>
          <circle cx="70" cy="235" r="5" fill="#facc15"/>
          <circle cx="85" cy="235" r="5" fill="#38bdf8"/>
        </g>

        <!-- House 3: Cozy Pink Cottage (Right) -->
        <g transform="translate(580, 240)">
          <rect x="0" y="110" width="160" height="190" rx="8" fill="#fbcfe8"/>
          <polygon points="80,20 -15,115 175,115" fill="#10b981"/>
          <rect x="40" y="160" width="50" height="50" rx="6" fill="#bae6fd" stroke="#ffffff" stroke-width="4"/>
          <path d="M105,300 L105,230 Q125,215 145,230 L145,300 Z" fill="#b45309"/>
        </g>
      </g>

      <!-- Clean Cobblestone Street -->
      <path d="M0,520 L1376,500 L1376,768 L0,768 Z" fill="url(#street9)"/>
      <!-- Zebra Crossing -->
      <g fill="#ffffff" opacity="0.9">
        <rect x="360" y="560" width="45" height="160" rx="4" transform="skewX(-20)"/>
        <rect x="430" y="560" width="45" height="160" rx="4" transform="skewX(-20)"/>
        <rect x="500" y="560" width="45" height="160" rx="4" transform="skewX(-20)"/>
        <rect x="570" y="560" width="45" height="160" rx="4" transform="skewX(-20)"/>
      </g>

      <!-- Cute Red Vintage Trolley Bus on Street (Right) -->
      <g transform="translate(820, 420)" filter="url(#dropShadow)">
        <!-- Bus Body -->
        <rect x="0" y="40" width="340" height="160" rx="28" fill="#ef4444"/>
        <rect x="0" y="140" width="340" height="20" fill="#ffffff"/>
        <!-- Windows -->
        <rect x="25" y="60" width="55" height="55" rx="8" fill="#bae6fd"/>
        <rect x="95" y="60" width="55" height="55" rx="8" fill="#bae6fd"/>
        <rect x="165" y="60" width="55" height="55" rx="8" fill="#bae6fd"/>
        <rect x="235" y="60" width="75" height="70" rx="8" fill="#bae6fd"/>
        <!-- Cute Smiling Animal Driver in Front Window -->
        <circle cx="270" cy="100" r="18" fill="#fde68a"/>
        <circle cx="265" cy="98" r="3" fill="#1e293b"/>
        <circle cx="280" cy="98" r="3" fill="#1e293b"/>
        <!-- Headlights -->
        <circle cx="330" cy="130" r="14" fill="#fde047"/>
        <!-- Wheels -->
        <circle cx="75" cy="200" r="34" fill="#1e293b"/>
        <circle cx="75" cy="200" r="16" fill="#94a3b8"/>
        <circle cx="255" cy="200" r="34" fill="#1e293b"/>
        <circle cx="255" cy="200" r="16" fill="#94a3b8"/>
      </g>

      <!-- Children Holding Colorful Balloons Crossing Street (Foreground Left) -->
      <g transform="translate(180, 420)" filter="url(#dropShadow)">
        <!-- Balloons Floating Up -->
        <g filter="url(#dropShadow)">
          <path d="M40,50 Q45,110 50,140" fill="none" stroke="#64748b" stroke-width="2"/>
          <path d="M70,30 Q60,100 50,140" fill="none" stroke="#64748b" stroke-width="2"/>
          <path d="M20,20 Q35,90 50,140" fill="none" stroke="#64748b" stroke-width="2"/>
          <ellipse cx="40" cy="40" rx="20" ry="26" fill="#ef4444"/>
          <ellipse cx="70" cy="20" rx="22" ry="28" fill="#facc15"/>
          <ellipse cx="15" cy="15" rx="19" ry="25" fill="#38bdf8"/>
        </g>
        <!-- Child in Yellow & Blue -->
        <rect x="35" y="140" width="38" height="50" rx="8" fill="#3b82f6"/>
        <ellipse cx="54" cy="105" rx="32" ry="28" fill="#fde68a"/>
        <ellipse cx="44" cy="104" rx="4.5" ry="6" fill="#1e293b"/>
        <ellipse cx="64" cy="104" rx="4.5" ry="6" fill="#1e293b"/>
        <path d="M48,116 Q54,124 60,116" fill="none" stroke="#991b1b" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="38" cy="112" rx="5" ry="3.5" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="70" cy="112" rx="5" ry="3.5" fill="#fca5a5" opacity="0.85"/>
        <!-- Legs Walking -->
        <line x1="45" y1="190" x2="35" y2="240" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
        <line x1="60" y1="190" x2="75" y2="240" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
      </g>
    `
  },

  // 10. cover_busy_bee (《爱劳动的小蜜蜂》)
  {
    id: "cover_busy_bee",
    title: "爱劳动的小蜜蜂",
    defs: `
      <linearGradient id="sky10" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="45%" stop-color="#bae6fd"/>
        <stop offset="85%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
      <linearGradient id="petal10" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fda4af"/>
        <stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
      <radialGradient id="wingGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
        <stop offset="80%" stop-color="#bae6fd" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.2"/>
      </radialGradient>
    `,
    content: `
      <!-- Sunny Blue to Warm Peach Sky -->
      <rect width="1376" height="768" fill="url(#sky10)"/>
      <circle cx="1180" cy="160" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Giant Meadow Green Backdrop -->
      <path d="M0,580 Q350,440 750,520 T1376,460 L1376,768 L0,768 Z" fill="#86efac"/>
      <path d="M-50,650 Q450,530 900,600 T1450,540 L1450,768 L-50,768 Z" fill="#22c55e"/>

      <!-- Floating Golden Pollen Glitter -->
      <g fill="#fde047" filter="url(#softGlow)" opacity="0.8">
        <circle cx="480" cy="340" r="5"/><circle cx="520" cy="310" r="4"/><circle cx="640" cy="280" r="6"/>
        <circle cx="700" cy="350" r="4.5"/><circle cx="820" cy="320" r="5.5"/><circle cx="760" cy="240" r="4"/>
      </g>

      <!-- Giant Blooming Blossom (Foreground Center-Right) -->
      <g transform="translate(680, 420)" filter="url(#dropShadow)">
        <!-- Green Stem & Leaves -->
        <path d="M120,180 Q130,280 110,380" fill="none" stroke="#15803d" stroke-width="24" stroke-linecap="round"/>
        <path d="M120,260 C220,230 240,180 190,170 C150,180 120,220 120,260 Z" fill="#22c55e"/>
        <!-- Layered Pink Petals -->
        <g fill="url(#petal10)">
          ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg =>
            `<ellipse cx="120" cy="160" rx="45" ry="95" transform="rotate(${deg} 120 160)"/>`
          ).join("\n")}
        </g>
        <!-- Golden Center Full of Nectar -->
        <circle cx="120" cy="160" r="70" fill="#facc15"/>
        <circle cx="120" cy="160" r="55" fill="#eab308"/>
        <!-- Sparkly Pollen Stigmas -->
        <circle cx="100" cy="145" r="7" fill="#ca8a04"/>
        <circle cx="140" cy="145" r="7" fill="#ca8a04"/>
        <circle cx="120" cy="175" r="7" fill="#ca8a04"/>
        <circle cx="105" cy="170" r="6" fill="#ca8a04"/>
        <circle cx="135" cy="170" r="6" fill="#ca8a04"/>
      </g>

      <!-- Cute Chubby Bumblebee Character (Center-Left) -->
      <g transform="translate(380, 210)" filter="url(#dropShadow)">
        <!-- Shimmering Translucent Wings -->
        <ellipse cx="60" cy="40" rx="35" ry="75" fill="url(#wingGrad)" transform="rotate(-35 60 40)"/>
        <ellipse cx="100" cy="30" rx="30" ry="70" fill="url(#wingGrad)" transform="rotate(-15 100 30)"/>
        <ellipse cx="130" cy="45" rx="25" ry="60" fill="url(#wingGrad)" transform="rotate(15 130 45)"/>

        <!-- Chubby Round Body with Black & Yellow Stripes -->
        <ellipse cx="110" cy="140" rx="85" ry="65" fill="#facc15"/>
        <!-- Fuzzy Black Stripes -->
        <path d="M80,78 Q100,140 80,202 Q98,205 110,203 Q130,140 110,77 Z" fill="#1e293b"/>
        <path d="M135,85 Q150,140 135,195 Q150,190 160,180 Q170,140 160,100 Z" fill="#1e293b"/>

        <!-- Cute Little Honey Bucket in Hand -->
        <g transform="translate(165, 160)" filter="url(#dropShadow)">
          <path d="M0,10 L8,40 L38,40 L46,10 Z" fill="#d97724"/>
          <path d="M5,10 C5,-5 41,-5 41,10" fill="none" stroke="#b45309" stroke-width="4"/>
          <!-- Dripping Golden Honey -->
          <ellipse cx="23" cy="10" rx="18" ry="6" fill="#facc15"/>
          <path d="M20,16 Q23,28 26,16" fill="#facc15"/>
        </g>

        <!-- Cute Little Gardener Cap on Head -->
        <ellipse cx="45" cy="80" rx="28" ry="12" fill="#b45309"/>
        <path d="M25,80 C25,50 65,50 65,80 Z" fill="#d97724"/>

        <!-- Big Sparkling Cartoon Eyes -->
        <ellipse cx="38" cy="120" rx="11" ry="15" fill="#1e293b"/>
        <ellipse cx="68" cy="116" rx="11" ry="15" fill="#1e293b"/>
        <circle cx="35" cy="114" r="5" fill="#ffffff"/>
        <circle cx="65" cy="110" r="5" fill="#ffffff"/>
        <circle cx="41" cy="124" r="2.2" fill="#ffffff"/>
        <circle cx="71" cy="120" r="2.2" fill="#ffffff"/>

        <!-- Rosy Cheeks & Sweet Smile -->
        <ellipse cx="24" cy="138" rx="11" ry="7" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="80" cy="132" rx="11" ry="7" fill="#fca5a5" opacity="0.85"/>
        <path d="M46,142 Q55,152 64,142" fill="none" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>

        <!-- Antennae with Rounded Tips -->
        <path d="M45,70 Q30,35 15,40" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="15" cy="40" r="6" fill="#facc15"/>
        <path d="M60,68 Q65,30 80,32" fill="none" stroke="#1e293b" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="80" cy="32" r="6" fill="#facc15"/>

        <!-- Tiny Little Brown Boots -->
        <ellipse cx="80" cy="205" rx="14" ry="10" fill="#78350f"/>
        <ellipse cx="125" cy="202" rx="14" ry="10" fill="#78350f"/>
      </g>
    `
  },

  // 11. cover_little_astronaut (《小小宇航员》)
  {
    id: "cover_little_astronaut",
    title: "小小宇航员",
    defs: `
      <linearGradient id="sky11" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="40%" stop-color="#0f172a"/>
        <stop offset="75%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
      <radialGradient id="nebula11" cx="60%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.5"/>
        <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="saturnRing" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#fde047" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#fb923c" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#fde047" stop-opacity="0.8"/>
      </linearGradient>
    `,
    content: `
      <!-- Deep Cosmic Indigo Sky -->
      <rect width="1376" height="768" fill="url(#sky11)"/>
      <rect width="1376" height="768" fill="url(#nebula11)"/>

      <!-- Twinkling Starfield -->
      <g fill="#ffffff">
        <circle cx="150" cy="120" r="2.5"/><circle cx="280" cy="90" r="3"/><circle cx="340" cy="220" r="2"/>
        <circle cx="480" cy="110" r="3.5"/><circle cx="720" cy="80" r="2"/><circle cx="890" cy="150" r="3"/>
        <circle cx="1020" cy="100" r="2.5"/><circle cx="1180" cy="70" r="3.5"/><circle cx="1290" cy="190" r="2"/>
        <circle cx="120" cy="380" r="2"/><circle cx="250" cy="520" r="3"/><circle cx="820" cy="620" r="2.5"/>
      </g>
      <g fill="#fef08a" opacity="0.85">
        <polygon points="180,240 183,248 192,250 184,254 186,262 180,256 174,262 176,254 168,250 177,248"/>
        <polygon points="1120,280 1123,288 1132,290 1124,294 1126,302 1120,296 1114,302 1116,294 1108,290 1117,288"/>
      </g>

      <!-- Friendly Swirling Blue Earth (Top-Right) -->
      <g transform="translate(1080, 180)" filter="url(#dropShadow)">
        <circle cx="0" cy="0" r="85" fill="#38bdf8"/>
        <!-- Green Continents -->
        <path d="M-40,-30 Q-10,-50 20,-30 Q50,-10 30,30 Q-20,60 -50,20 Z" fill="#4ade80"/>
        <path d="M10,40 Q40,30 60,60 Q30,80 10,70 Z" fill="#4ade80"/>
        <!-- White Swirling Atmosphere Clouds -->
        <path d="M-60,-10 Q0,-30 60,-5 Q20,15 -40,10 Z" fill="#ffffff" opacity="0.6"/>
      </g>

      <!-- Ringed Pastel Saturn (Top-Left) -->
      <g transform="translate(260, 200)" filter="url(#dropShadow)">
        <!-- Saturn Body -->
        <circle cx="0" cy="0" r="55" fill="#fed7aa"/>
        <!-- Rings -->
        <ellipse cx="0" cy="0" rx="105" ry="24" fill="none" stroke="url(#saturnRing)" stroke-width="14" transform="rotate(-20 0 0)"/>
      </g>

      <!-- Friendly Retro Rocket Cruising in Space (Right-Center) -->
      <g transform="translate(950, 420) rotate(-25)" filter="url(#dropShadow)">
        <!-- Flame Exhaust -->
        <polygon points="-80,10 -150,0 -80,-10" fill="#f97316" filter="url(#softGlow)"/>
        <polygon points="-80,6 -120,0 -80,-6" fill="#fde047"/>
        <!-- Rocket Body -->
        <path d="M100,0 C60,-40 -60,-35 -80,-30 L-80,30 C-60,35 60,40 100,0 Z" fill="#ffffff"/>
        <!-- Red Nose Cone -->
        <path d="M100,0 C85,-25 60,-30 60,-30 L60,30 C60,30 85,25 100,0 Z" fill="#ef4444"/>
        <!-- Fins -->
        <polygon points="-50,-35 -80,-70 -30,-35" fill="#ef4444"/>
        <polygon points="-50,35 -80,70 -30,35" fill="#ef4444"/>
        <!-- Porthole Window with Star -->
        <circle cx="0" cy="0" r="22" fill="#38bdf8" stroke="#cbd5e1" stroke-width="4"/>
      </g>

      <!-- Cute Toddler Astronaut Floating Weightlessly (Center) -->
      <g transform="translate(520, 260)" filter="url(#dropShadow)">
        <!-- Puffy Spacesuit Body -->
        <ellipse cx="140" cy="220" rx="65" ry="75" fill="#ffffff"/>
        <ellipse cx="140" cy="220" rx="45" ry="50" fill="#f1f5f9"/>
        <!-- Chest Control Panel -->
        <rect x="115" y="195" width="50" height="35" rx="8" fill="#3b82f6"/>
        <circle cx="128" cy="212" r="5" fill="#ef4444"/>
        <circle cx="142" cy="212" r="5" fill="#facc15"/>
        <circle cx="156" cy="212" r="5" fill="#10b981"/>

        <!-- Floating Puffy Boots -->
        <g transform="translate(70, 280) rotate(-15)">
          <ellipse cx="25" cy="30" rx="24" ry="18" fill="#ffffff"/>
          <ellipse cx="25" cy="40" rx="26" ry="10" fill="#64748b"/>
        </g>
        <g transform="translate(160, 285) rotate(15)">
          <ellipse cx="25" cy="30" rx="24" ry="18" fill="#ffffff"/>
          <ellipse cx="25" cy="40" rx="26" ry="10" fill="#64748b"/>
        </g>

        <!-- Big Round Bubble Helmet -->
        <circle cx="140" cy="110" r="95" fill="#ffffff" stroke="#e2e8f0" stroke-width="5"/>
        <!-- Helmet Glass Visor -->
        <ellipse cx="140" cy="115" rx="75" ry="68" fill="#1e293b"/>
        <ellipse cx="140" cy="115" rx="72" ry="65" fill="#38bdf8" opacity="0.3"/>

        <!-- Cute Kid Inside Visor -->
        <ellipse cx="140" cy="120" rx="55" ry="48" fill="#fde68a"/>
        <!-- Hair -->
        <path d="M95,115 C90,75 185,75 185,115 C175,95 105,95 95,115 Z" fill="#312e81"/>
        <!-- Big Joyful Eyes -->
        <ellipse cx="118" cy="120" rx="7" ry="10" fill="#1e293b"/>
        <ellipse cx="162" cy="120" rx="7" ry="10" fill="#1e293b"/>
        <circle cx="115" cy="116" r="3.2" fill="#ffffff"/>
        <circle cx="159" cy="116" r="3.2" fill="#ffffff"/>
        <!-- Rosy Cheeks & Ecstatic Smile -->
        <ellipse cx="106" cy="132" rx="9" ry="6" fill="#fca5a5" opacity="0.85"/>
        <ellipse cx="174" cy="132" rx="9" ry="6" fill="#fca5a5" opacity="0.85"/>
        <path d="M128,135 Q140,148 152,135" fill="none" stroke="#991b1b" stroke-width="3.5" stroke-linecap="round"/>

        <!-- Helmet Glass Glare / Highlight -->
        <path d="M85,85 C95,65 130,55 160,60" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.8"/>

        <!-- Gloved Hands Holding a Glowing Smiling Yellow Star -->
        <g transform="translate(140, 185)">
          <!-- Glowing Star -->
          <g filter="url(#softGlow)">
            <polygon points="0,-35 10,-10 35,-10 15,8 22,32 0,18 -22,32 -15,8 -35,-10 -10,-10" fill="#fde047"/>
            <polygon points="0,-35 10,-10 35,-10 15,8 22,32 0,18 -22,32 -15,8 -35,-10 -10,-10" fill="none" stroke="#eab308" stroke-width="3"/>
            <!-- Cute Face on Star -->
            <circle cx="-6" cy="0" r="2.5" fill="#78350f"/>
            <circle cx="6" cy="0" r="2.5" fill="#78350f"/>
            <path d="M-4,6 Q0,10 4,6" fill="none" stroke="#78350f" stroke-width="2" stroke-linecap="round"/>
          </g>
          <!-- Left Glove -->
          <ellipse cx="-45" cy="10" rx="16" ry="14" fill="#ffffff"/>
          <!-- Right Glove -->
          <ellipse cx="45" cy="10" rx="16" ry="14" fill="#ffffff"/>
        </g>
      </g>
    `
  }
];

console.log(`Starting generation for ${COVERS.length} book covers...`);

for (const cover of COVERS) {
  console.log(`\nGenerating: ${cover.id} (${cover.title})...`);
  const svgContent = wrapSvg(cover.content, cover.defs);
  const svgPath = path.join(TMP_DIR, `${cover.id}.svg`);
  const jpgPath = path.join(OUTPUT_DIR, `${cover.id}.jpg`);
  const webpPath = path.join(OUTPUT_DIR, `${cover.id}.webp`);

  fs.writeFileSync(svgPath, svgContent);

  // Convert SVG to 1376x768 JPG
  execSync(`/Applications/ServBay/bin/magick "${svgPath}" -density 150 -resize 1376x768! -quality 95 "${jpgPath}"`);

  // Convert JPG to WebP
  execSync(`/Applications/ServBay/bin/cwebp -q 88 "${jpgPath}" -o "${webpPath}"`);

  const statJpg = fs.statSync(jpgPath);
  const statWebp = fs.statSync(webpPath);
  console.log(`✓ Generated ${cover.id}: JPG (${(statJpg.size/1024).toFixed(1)} KB), WebP (${(statWebp.size/1024).toFixed(1)} KB)`);
}

console.log("\nAll 11 book covers successfully generated!");
