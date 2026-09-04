import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_avatars_gen";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function wrapSvg(width, height, content, customDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
    </filter>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="6" stdDeviation="6" flood-opacity="0.25"/>
    </filter>
    ${customDefs}
  </defs>
  ${content}
</svg>`;
}

const ITEMS = [
  // ==========================================
  // 1. cathy_island_guofeng (1376 x 768)
  // 国风水乡画卷: 飞檐黛瓦、曲桥池塘、青竹粉荷、红锦鲤
  // ==========================================
  {
    id: "cathy_island_guofeng",
    width: 1376,
    height: 768,
    title: "国风江南水乡亭台意境画卷",
    defs: `
      <linearGradient id="gf_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="40%" stop-color="#ccfbf1"/>
        <stop offset="100%" stop-color="#a7f3d0"/>
      </linearGradient>
      <linearGradient id="gf_water" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#2dd4bf"/>
        <stop offset="50%" stop-color="#0d9488"/>
        <stop offset="100%" stop-color="#115e59"/>
      </linearGradient>
      <linearGradient id="gf_mountain" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f766e" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#134e4a" stop-opacity="0.9"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#gf_sky)"/>
      <!-- Soft Morning Sun -->
      <circle cx="280" cy="180" r="90" fill="#fde047" opacity="0.35" filter="url(#softGlow)"/>
      <circle cx="280" cy="180" r="50" fill="#fef08a" opacity="0.6"/>

      <!-- Distant Misty Mountains (青绿山水叠嶂) -->
      <path d="M 0 380 Q 200 220 450 320 T 900 240 Q 1150 190 1376 340 L 1376 768 L 0 768 Z" fill="#99f6e4" opacity="0.5"/>
      <path d="M 0 420 Q 300 280 650 370 T 1200 300 L 1376 380 L 1376 768 L 0 768 Z" fill="url(#gf_mountain)" opacity="0.4"/>

      <!-- Flying Cranes (祥云仙鹤) -->
      <g fill="#ffffff" opacity="0.9" transform="translate(320, 140) scale(0.8)">
        <path d="M 0 0 Q 20 -15 45 -10 Q 30 15 20 25 Q 10 20 0 0 Z"/>
        <path d="M 15 5 Q 35 2 50 18 Q 30 20 15 5 Z" fill="#e2e8f0"/>
      </g>
      <g fill="#ffffff" opacity="0.8" transform="translate(380, 170) scale(0.6)">
        <path d="M 0 0 Q 20 -15 45 -10 Q 30 15 20 25 Q 10 20 0 0 Z"/>
      </g>

      <!-- Clear River Waters (碧波水域) -->
      <rect y="460" width="1376" height="308" fill="url(#gf_water)"/>
      <!-- Water ripples -->
      <ellipse cx="600" cy="540" rx="200" ry="12" fill="#5eead4" opacity="0.4"/>
      <ellipse cx="900" cy="620" rx="250" ry="15" fill="#5eead4" opacity="0.3"/>
      <ellipse cx="300" cy="600" rx="180" ry="10" fill="#5eead4" opacity="0.3"/>

      <!-- Traditional Stone Bridge (曲桥拱桥) -->
      <g filter="url(#dropShadow)">
        <path d="M 150 560 Q 380 430 620 540 L 640 580 Q 380 470 140 600 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="4"/>
        <path d="M 280 545 Q 380 470 490 545 Z" fill="#0f766e"/>
        <!-- Bridge Railings (桥上阑干) -->
        <line x1="200" y1="525" x2="200" y2="550" stroke="#64748b" stroke-width="3"/>
        <line x1="260" y1="495" x2="260" y2="525" stroke="#64748b" stroke-width="3"/>
        <line x1="330" y1="475" x2="330" y2="505" stroke="#64748b" stroke-width="3"/>
        <line x1="410" y1="475" x2="410" y2="505" stroke="#64748b" stroke-width="3"/>
        <line x1="480" y1="495" x2="480" y2="525" stroke="#64748b" stroke-width="3"/>
        <line x1="550" y1="525" x2="550" y2="550" stroke="#64748b" stroke-width="3"/>
      </g>

      <!-- Jiangnan Water Pavilion (江南八角飞檐水榭亭阁) -->
      <g transform="translate(820, 240)" filter="url(#dropShadow)">
        <!-- Stone Platform -->
        <rect x="50" y="280" width="340" height="40" rx="6" fill="#cbd5e1" stroke="#64748b" stroke-width="3"/>
        <!-- Red Lacquer Pillars -->
        <rect x="80" y="140" width="16" height="140" fill="#b91c1c" rx="3"/>
        <rect x="180" y="140" width="16" height="140" fill="#b91c1c" rx="3"/>
        <rect x="240" y="140" width="16" height="140" fill="#b91c1c" rx="3"/>
        <rect x="340" y="140" width="16" height="140" fill="#b91c1c" rx="3"/>
        <!-- Pavilion Railings -->
        <rect x="80" y="230" width="276" height="20" fill="#991b1b" opacity="0.8"/>
        <line x1="80" y1="210" x2="356" y2="210" stroke="#7f1d1d" stroke-width="4"/>
        <!-- Double Eaves Roof (双重飞檐黛瓦) -->
        <!-- Lower Roof -->
        <path d="M 40 150 Q 220 90 400 150 L 370 120 Q 220 70 70 120 Z" fill="#334155" stroke="#1e293b" stroke-width="3"/>
        <!-- Upper Roof with flying eaves (尖顶飞檐翘角) -->
        <path d="M 80 80 Q 220 10 360 80 L 330 50 Q 220 0 110 50 Z" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
        <!-- Top Gourd Finial (宝顶葫芦) -->
        <circle cx="220" cy="10" r="10" fill="#facc15"/>
        <polygon points="220,-6 226,6 214,6" fill="#f59e0b"/>
      </g>

      <!-- Emerald Bamboo Grove (右侧翠竹林) -->
      <g transform="translate(1200, 360)">
        <path d="M 0 300 Q 10 150 -15 0" stroke="#059669" stroke-width="9" fill="none"/>
        <path d="M 40 300 Q 55 160 30 20" stroke="#10b981" stroke-width="8" fill="none"/>
        <path d="M 80 300 Q 90 140 60 -20" stroke="#047857" stroke-width="10" fill="none"/>
        <!-- Bamboo Leaves -->
        <path d="M -15 20 Q 15 10 40 35 Q 10 25 -15 20 Z" fill="#34d399"/>
        <path d="M -10 80 Q -40 70 -60 100 Q -30 85 -10 80 Z" fill="#10b981"/>
        <path d="M 35 60 Q 65 50 90 75 Q 60 65 35 60 Z" fill="#34d399"/>
        <path d="M 60 40 Q 95 20 120 45 Q 85 40 60 40 Z" fill="#059669"/>
      </g>

      <!-- Weeping Willows (左侧垂柳拂水) -->
      <g transform="translate(0, 180)">
        <path d="M 0 120 Q 120 160 180 280" stroke="#78350f" stroke-width="14" fill="none" stroke-linecap="round"/>
        <!-- Willow Branches -->
        <path d="M 120 200 Q 130 320 100 400" stroke="#84cc16" stroke-width="3" fill="none"/>
        <path d="M 150 230 Q 170 340 140 430" stroke="#65a30d" stroke-width="3" fill="none"/>
        <path d="M 180 270 Q 210 360 190 450" stroke="#84cc16" stroke-width="3" fill="none"/>
      </g>

      <!-- Water Lotus Blossoms & Leaves (粉荷吐蕊与翠绿荷叶) -->
      <g transform="translate(180, 620)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="40" rx="70" ry="24" fill="#15803d"/>
        <ellipse cx="60" cy="40" rx="60" ry="18" fill="#16a34a"/>
        <!-- Pink Lotus -->
        <path d="M 120 10 C 100 -20 110 -50 120 -60 C 130 -50 140 -20 120 10 Z" fill="#f472b6"/>
        <path d="M 105 10 C 85 -10 95 -40 112 -45 C 115 -25 115 -10 105 10 Z" fill="#fbcfe8"/>
        <path d="M 135 10 C 155 -10 145 -40 128 -45 C 125 -25 125 -10 135 10 Z" fill="#fbcfe8"/>
        <circle cx="120" cy="-25" r="8" fill="#fde047"/>
      </g>

      <!-- Swimming Red Koi Pair (双红锦鲤戏莲) -->
      <g transform="translate(480, 620)">
        <path d="M 0 0 Q 30 -20 60 -10 Q 50 20 20 15 Z" fill="#ea580c"/>
        <polygon points="60,-10 85,-25 75,0" fill="#f97316"/>
        <polygon points="60,-10 85,5 75,0" fill="#f97316"/>
        <circle cx="8" cy="-2" r="3" fill="#ffffff"/>
        <circle cx="8" cy="-2" r="1.5" fill="#000000"/>
      </g>
      <g transform="translate(560, 660) rotate(15)">
        <path d="M 0 0 Q 25 -15 50 -8 Q 40 15 15 12 Z" fill="#dc2626"/>
        <polygon points="50,-8 70,-20 62,0" fill="#ef4444"/>
        <polygon points="50,-8 70,4 62,0" fill="#ef4444"/>
      </g>

      <!-- Red Stamps (国/风) -->
      <g transform="translate(1240, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="54" height="54" rx="8" fill="#dc2626"/>
        <!-- 国 -->
        <rect x="10" y="10" width="34" height="34" fill="none" stroke="#ffffff" stroke-width="3"/>
        <line x1="16" y1="18" x2="38" y2="18" stroke="#ffffff" stroke-width="2.5"/>
        <line x1="18" y1="26" x2="36" y2="26" stroke="#ffffff" stroke-width="2.5"/>
        <line x1="15" y1="34" x2="39" y2="34" stroke="#ffffff" stroke-width="2.5"/>
        <line x1="27" y1="18" x2="27" y2="34" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="34" cy="30" r="1.5" fill="#ffffff"/>
      </g>
      <g transform="translate(1240, 145)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="54" height="54" rx="8" fill="#dc2626"/>
        <!-- 风 -->
        <path d="M 14 12 L 14 42" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <path d="M 14 12 L 38 12 C 40 12 40 18 39 26 C 38 34 38 41 33 41 L 31 38" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        <path d="M 21 21 Q 25 28 32 34" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 32 22 Q 26 27 21 34" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="27" cy="27" r="1.5" fill="#ffffff"/>
      </g>
    `
  },

  // ==========================================
  // 2. avatar_scholar (1024 x 1024)
  // 博学小书童: 儒生巾、青绿长衫、手握竹简、红印【博】
  // ==========================================
  {
    id: "avatar_scholar",
    width: 1024,
    height: 1024,
    title: "国风博学小书童头像",
    defs: `
      <radialGradient id="sch_bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="60%" stop-color="#ccfbf1"/>
        <stop offset="100%" stop-color="#14b8a6"/>
      </radialGradient>
      <linearGradient id="sch_robe" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0d9488"/>
        <stop offset="100%" stop-color="#042f2e"/>
      </linearGradient>
    `,
    content: `
      <!-- Circle Frame -->
      <rect width="1024" height="1024" rx="512" fill="url(#sch_bg)"/>
      <circle cx="512" cy="512" r="496" fill="none" stroke="#f59e0b" stroke-width="16"/>
      <circle cx="512" cy="512" r="480" fill="none" stroke="#fef08a" stroke-width="6"/>

      <!-- Floating Plum Blossoms -->
      <circle cx="220" cy="260" r="14" fill="#f43f5e" opacity="0.7"/>
      <circle cx="820" cy="300" r="16" fill="#f43f5e" opacity="0.7"/>
      <circle cx="260" cy="740" r="12" fill="#f43f5e" opacity="0.6"/>

      <!-- Body / Scholar Robe (交领青衫儒袍) -->
      <g transform="translate(512, 600)" filter="url(#dropShadow)">
        <path d="M -260 380 L -180 80 Q -100 20 0 20 Q 100 20 180 80 L 260 380 Z" fill="url(#sch_robe)"/>
        <!-- Crossed White Collar (右衽白领缘) -->
        <polygon points="-80,20 0,160 30,160 -50,20" fill="#ffffff"/>
        <polygon points="80,20 0,180 -20,180 60,20" fill="#e2e8f0"/>
        <!-- Golden Cloud Embroidery on Robe -->
        <circle cx="0" cy="260" r="30" fill="none" stroke="#facc15" stroke-width="5"/>
        <circle cx="-120" cy="280" r="22" fill="none" stroke="#facc15" stroke-width="4"/>
        <circle cx="120" cy="280" r="22" fill="none" stroke="#facc15" stroke-width="4"/>
      </g>

      <!-- Head & Neck -->
      <rect x="472" y="520" width="80" height="90" rx="20" fill="#fed7aa"/>
      <ellipse cx="512" cy="420" rx="190" ry="200" fill="#ffedd5" filter="url(#dropShadow)"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="380" cy="470" rx="35" ry="20" fill="#f43f5e" opacity="0.4" filter="url(#softGlow)"/>
      <ellipse cx="644" cy="470" rx="35" ry="20" fill="#f43f5e" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Bright Child Eyes -->
      <g filter="url(#dropShadow)">
        <!-- Left Eye -->
        <ellipse cx="410" cy="420" rx="28" ry="32" fill="#1e293b"/>
        <circle cx="420" cy="410" r="10" fill="#ffffff"/>
        <circle cx="402" cy="432" r="5" fill="#ffffff"/>
        <!-- Right Eye -->
        <ellipse cx="614" cy="420" rx="28" ry="32" fill="#1e293b"/>
        <circle cx="624" cy="410" r="10" fill="#ffffff"/>
        <circle cx="606" cy="432" r="5" fill="#ffffff"/>
        <!-- Eyebrows -->
        <path d="M 370 365 Q 410 350 450 365" stroke="#1e293b" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M 574 365 Q 614 350 654 365" stroke="#1e293b" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Sweet Smile -->
      <path d="M 472 490 Q 512 535 552 490" stroke="#b91c1c" stroke-width="8" stroke-linecap="round" fill="#e11d48"/>
      <!-- Small Nose -->
      <ellipse cx="512" cy="455" rx="10" ry="7" fill="#fdba74"/>

      <!-- Scholar Hat / Hair Bun (古代书童方巾与青玉发簪) -->
      <g filter="url(#dropShadow)">
        <!-- Hair Side bangs -->
        <path d="M 322 360 Q 340 260 512 250 Q 684 260 702 360 C 650 300 570 290 512 290 C 454 290 374 300 322 360 Z" fill="#0f172a"/>
        <!-- Scholar Soft Cap (缁布方巾) -->
        <path d="M 400 270 L 430 130 L 594 130 L 624 270 Z" fill="#09090b" stroke="#334155" stroke-width="6"/>
        <rect x="420" y="240" width="184" height="40" rx="8" fill="#0f766e" stroke="#14b8a6" stroke-width="4"/>
        <!-- Jade Pin & Red Tassels (青玉佩饰与朱红丝带) -->
        <circle cx="512" cy="260" r="18" fill="#6ee7b7" stroke="#059669" stroke-width="4"/>
        <path d="M 512 278 L 500 370 L 512 360 L 524 370 Z" fill="#dc2626"/>
      </g>

      <!-- Holding Rolled Bamboo Scroll (胸前手持古朴竹简) -->
      <g transform="translate(512, 750)" filter="url(#dropShadow)">
        <rect x="-140" y="-40" width="280" height="90" rx="16" fill="#ca8a04" stroke="#78350f" stroke-width="6"/>
        <line x1="-80" y1="-40" x2="-80" y2="50" stroke="#78350f" stroke-width="4"/>
        <line x1="-20" y1="-40" x2="-20" y2="50" stroke="#78350f" stroke-width="4"/>
        <line x1="40" y1="-40" x2="40" y2="50" stroke="#78350f" stroke-width="4"/>
        <line x1="100" y1="-40" x2="100" y2="50" stroke="#78350f" stroke-width="4"/>
        <!-- Red Ribbon Tie -->
        <rect x="-10" y="-44" width="20" height="98" fill="#dc2626"/>
        <!-- Little Hands -->
        <circle cx="-130" cy="10" r="34" fill="#fed7aa"/>
        <circle cx="130" cy="10" r="34" fill="#fed7aa"/>
      </g>

      <!-- Seal 【博】 -->
      <g transform="translate(830, 810)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="90" height="90" rx="16" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Left 十 -->
          <line x1="22" y1="42" x2="42" y2="42"/>
          <line x1="32" y1="24" x2="32" y2="68"/>
          <!-- Right -->
          <circle cx="62" cy="24" r="3" fill="#ffffff"/>
          <line x1="48" y1="32" x2="76" y2="32"/>
          <rect x="52" y="38" width="20" height="16" stroke-width="3"/>
          <path d="M 64 54 L 64 74 Q 64 78 58 74"/>
          <line x1="48" y1="62" x2="78" y2="62"/>
          <circle cx="56" cy="68" r="2.5" fill="#ffffff"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 3. avatar_nezha (1024 x 1024)
  // 乾坤小英雄哪吒: 红绸双丫髻、乾坤金圈、红绫、红印【勇】
  // ==========================================
  {
    id: "avatar_nezha",
    width: 1024,
    height: 1024,
    title: "国风乾坤小英雄哪吒头像",
    defs: `
      <radialGradient id="nez_bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff7ed"/>
        <stop offset="60%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </radialGradient>
      <linearGradient id="nez_gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>
    `,
    content: `
      <!-- Circle Frame -->
      <rect width="1024" height="1024" rx="512" fill="url(#nez_bg)"/>
      <circle cx="512" cy="512" r="496" fill="none" stroke="#f97316" stroke-width="16"/>
      <circle cx="512" cy="512" r="480" fill="none" stroke="#fde047" stroke-width="6"/>

      <!-- Auspicious Fire Clouds (风火祥云) -->
      <path d="M 120 700 Q 220 620 340 720 Q 400 640 480 720" fill="none" stroke="#f97316" stroke-width="10" stroke-linecap="round" opacity="0.6"/>
      <path d="M 680 760 Q 780 660 900 740" fill="none" stroke="#f97316" stroke-width="10" stroke-linecap="round" opacity="0.6"/>

      <!-- Golden Qiankun Ring (乾坤金圈) Behind -->
      <circle cx="512" cy="460" r="320" fill="none" stroke="url(#nez_gold)" stroke-width="28" filter="url(#dropShadow)"/>

      <!-- Floating Red Armillary Sash (赤红混天绫) -->
      <path d="M 140 380 Q 220 200 450 260 T 880 340 Q 940 500 820 660" fill="none" stroke="#dc2626" stroke-width="36" stroke-linecap="round" filter="url(#dropShadow)"/>
      <path d="M 140 380 Q 220 200 450 260 T 880 340 Q 940 500 820 660" fill="none" stroke="#ef4444" stroke-width="20" stroke-linecap="round"/>

      <!-- Body / Red Battle Vest (大红莲花肚兜短袄) -->
      <g transform="translate(512, 620)" filter="url(#dropShadow)">
        <path d="M -240 380 L -160 80 Q 0 40 160 80 L 240 380 Z" fill="#b91c1c"/>
        <path d="M -140 380 L -90 100 Q 0 70 90 100 L 140 380 Z" fill="#dc2626"/>
        <!-- Golden Lotus Pattern -->
        <circle cx="0" cy="200" r="40" fill="#facc15"/>
        <polygon points="0,130 25,185 -25,185" fill="#fde047"/>
        <polygon points="0,270 25,215 -25,215" fill="#fde047"/>
      </g>

      <!-- Head & Neck -->
      <rect x="472" y="520" width="80" height="90" rx="20" fill="#fed7aa"/>
      <ellipse cx="512" cy="420" rx="190" ry="195" fill="#ffedd5" filter="url(#dropShadow)"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="380" cy="460" rx="36" ry="20" fill="#f43f5e" opacity="0.4" filter="url(#softGlow)"/>
      <ellipse cx="644" cy="460" rx="36" ry="20" fill="#f43f5e" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Cinnabar Mark on Forehead (额间吉祥红朱砂痣) -->
      <ellipse cx="512" cy="340" rx="10" ry="16" fill="#dc2626" filter="url(#dropShadow)"/>

      <!-- Fearless, Spirited Big Eyes (炯炯有神大眼睛) -->
      <g filter="url(#dropShadow)">
        <!-- Left Eye -->
        <ellipse cx="410" cy="415" rx="30" ry="34" fill="#0f172a"/>
        <circle cx="422" cy="405" r="12" fill="#ffffff"/>
        <circle cx="400" cy="428" r="6" fill="#ffffff"/>
        <!-- Right Eye -->
        <ellipse cx="614" cy="415" rx="30" ry="34" fill="#0f172a"/>
        <circle cx="626" cy="405" r="12" fill="#ffffff"/>
        <circle cx="604" cy="428" r="6" fill="#ffffff"/>
        <!-- Confident Eyebrows -->
        <path d="M 365 355 Q 410 330 455 355" stroke="#0f172a" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M 569 355 Q 614 330 659 355" stroke="#0f172a" stroke-width="10" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Heroic Happy Grin -->
      <path d="M 465 480 Q 512 535 559 480 Z" fill="#dc2626" stroke="#991b1b" stroke-width="6"/>

      <!-- Double Topknot Buns with Red Ribbons (传统红绸双丫髻) -->
      <g filter="url(#dropShadow)">
        <!-- Left Bun -->
        <circle cx="310" cy="240" r="75" fill="#0f172a"/>
        <rect x="280" y="270" width="60" height="24" rx="10" fill="#dc2626"/>
        <path d="M 285 294 Q 250 380 230 450" stroke="#dc2626" stroke-width="16" stroke-linecap="round" fill="none"/>
        <circle cx="310" cy="240" r="20" fill="#facc15"/>
        <!-- Right Bun -->
        <circle cx="714" cy="240" r="75" fill="#0f172a"/>
        <rect x="684" y="270" width="60" height="24" rx="10" fill="#dc2626"/>
        <path d="M 739 294 Q 774 380 794 450" stroke="#dc2626" stroke-width="16" stroke-linecap="round" fill="none"/>
        <circle cx="714" cy="240" r="20" fill="#facc15"/>
        <!-- Bangs -->
        <path d="M 330 330 Q 512 280 694 330 C 640 290 580 280 512 280 C 444 280 384 290 330 330 Z" fill="#0f172a"/>
      </g>

      <!-- Seal 【勇】 -->
      <g transform="translate(830, 810)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="90" height="90" rx="16" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Top 甬 -->
          <line x1="45" y1="20" x2="45" y2="28"/>
          <line x1="28" y1="30" x2="62" y2="30"/>
          <rect x="33" y="34" width="24" height="15" stroke-width="3"/>
          <line x1="45" y1="30" x2="45" y2="49"/>
          <!-- Bot 力 -->
          <path d="M 31 56 L 56 56 Q 60 56 60 62 L 57 72 Q 55 76 49 73"/>
          <path d="M 47 51 Q 38 64 26 73"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 4. avatar_mulan (1024 x 1024)
  // 巾帼小木兰: 高束发、银鳞轻甲、红缨短枪、红印【英】
  // ==========================================
  {
    id: "avatar_mulan",
    width: 1024,
    height: 1024,
    title: "国风巾帼小木兰头像",
    defs: `
      <radialGradient id="mul_bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff1f2"/>
        <stop offset="60%" stop-color="#fecdd3"/>
        <stop offset="100%" stop-color="#be123c"/>
      </radialGradient>
      <linearGradient id="mul_armor" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
    `,
    content: `
      <!-- Circle Frame -->
      <rect width="1024" height="1024" rx="512" fill="url(#mul_bg)"/>
      <circle cx="512" cy="512" r="496" fill="none" stroke="#fb7185" stroke-width="16"/>
      <circle cx="512" cy="512" r="480" fill="none" stroke="#fef08a" stroke-width="6"/>

      <!-- Distant Mountain Fortress -->
      <polygon points="100,500 240,400 380,500" fill="#9f1239" opacity="0.3"/>
      <polygon points="650,480 800,380 950,480" fill="#9f1239" opacity="0.3"/>

      <!-- Red-tasseled Spear (红缨长枪) Across Shoulder -->
      <g transform="rotate(-35 512 512)" filter="url(#dropShadow)">
        <rect x="500" y="-100" width="24" height="1200" rx="10" fill="#78350f"/>
        <!-- Spear Tip (银亮枪尖) -->
        <polygon points="512,-200 535,-90 489,-90" fill="#e2e8f0" stroke="#94a3b8" stroke-width="4"/>
        <!-- Red Silk Tassel (大红缨毛) -->
        <circle cx="512" cy="-80" r="30" fill="#dc2626"/>
        <path d="M 482 -80 Q 470 -40 490 0 L 534 0 Q 554 -40 542 -80 Z" fill="#ef4444"/>
      </g>

      <!-- Body / Lightweight Battle Armor (银白轻甲与绛紫战袍) -->
      <g transform="translate(512, 600)" filter="url(#dropShadow)">
        <path d="M -250 380 L -170 80 Q 0 30 170 80 L 250 380 Z" fill="#881337"/>
        <!-- Armor Breastplate -->
        <path d="M -120 380 L -80 90 Q 0 60 80 90 L 120 380 Z" fill="url(#mul_armor)" stroke="#cbd5e1" stroke-width="6"/>
        <!-- Scale Armor Lines -->
        <line x1="-70" y1="160" x2="70" y2="160" stroke="#cbd5e1" stroke-width="4"/>
        <line x1="-90" y1="230" x2="90" y2="230" stroke="#cbd5e1" stroke-width="4"/>
        <line x1="-110" y1="300" x2="110" y2="300" stroke="#cbd5e1" stroke-width="4"/>
      </g>

      <!-- Head & Neck -->
      <rect x="472" y="520" width="80" height="90" rx="20" fill="#fed7aa"/>
      <ellipse cx="512" cy="420" rx="180" ry="190" fill="#ffedd5" filter="url(#dropShadow)"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="380" cy="460" rx="34" ry="18" fill="#fb7185" opacity="0.4" filter="url(#softGlow)"/>
      <ellipse cx="644" cy="460" rx="34" ry="18" fill="#fb7185" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Spirited Heroic Eyes -->
      <g filter="url(#dropShadow)">
        <!-- Left Eye -->
        <ellipse cx="410" cy="415" rx="28" ry="30" fill="#0f172a"/>
        <circle cx="420" cy="406" r="10" fill="#ffffff"/>
        <!-- Right Eye -->
        <ellipse cx="614" cy="415" rx="28" ry="30" fill="#0f172a"/>
        <circle cx="624" cy="406" r="10" fill="#ffffff"/>
        <!-- Eyebrows -->
        <path d="M 370 360 Q 410 340 450 360" stroke="#0f172a" stroke-width="8" stroke-linecap="round" fill="none"/>
        <path d="M 574 360 Q 614 340 654 360" stroke="#0f172a" stroke-width="8" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Confident Grin -->
      <path d="M 470 480 Q 512 525 554 480" stroke="#be123c" stroke-width="7" stroke-linecap="round" fill="none"/>

      <!-- High Ponytail Tied with Red Ribbon (飒爽英姿高马尾) -->
      <g filter="url(#dropShadow)">
        <!-- High Ponytail -->
        <path d="M 512 180 Q 720 120 780 340 Q 680 320 540 220 Z" fill="#0f172a"/>
        <!-- Red Ribbon Tie -->
        <circle cx="512" cy="200" r="30" fill="#dc2626"/>
        <path d="M 522 220 Q 560 300 580 360" stroke="#dc2626" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- Front Hair & Bangs -->
        <path d="M 332 350 Q 512 250 692 350 C 640 290 570 280 512 280 C 454 280 384 290 332 350 Z" fill="#0f172a"/>
      </g>

      <!-- Seal 【英】 -->
      <g transform="translate(830, 810)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="90" height="90" rx="16" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Top 艹 -->
          <line x1="24" y1="26" x2="66" y2="26"/>
          <line x1="36" y1="20" x2="36" y2="32"/>
          <line x1="54" y1="20" x2="54" y2="32"/>
          <!-- Bot 央 -->
          <line x1="30" y1="40" x2="60" y2="40"/>
          <path d="M 32 40 L 32 52 L 58 52 L 58 40"/>
          <path d="M 45 36 Q 36 56 24 72"/>
          <path d="M 45 49 Q 54 62 66 72"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 5. avatar_chang_e (1024 x 1024)
  // 霓裳小仙女: 飞仙双螺髻、粉桃汉服、怀抱软萌玉兔、红印【仙】
  // ==========================================
  {
    id: "avatar_chang_e",
    width: 1024,
    height: 1024,
    title: "国风霓裳小仙女头像",
    defs: `
      <radialGradient id="fe_bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fdf4ff"/>
        <stop offset="50%" stop-color="#fae8ff"/>
        <stop offset="100%" stop-color="#c084fc"/>
      </radialGradient>
      <linearGradient id="fe_dress" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f472b6"/>
        <stop offset="100%" stop-color="#db2777"/>
      </linearGradient>
    `,
    content: `
      <!-- Circle Frame -->
      <rect width="1024" height="1024" rx="512" fill="url(#fe_bg)"/>
      <circle cx="512" cy="512" r="496" fill="none" stroke="#e879f9" stroke-width="16"/>
      <circle cx="512" cy="512" r="480" fill="none" stroke="#fef08a" stroke-width="6"/>

      <!-- Giant Glowing Full Moon (身后皎洁圆月) -->
      <circle cx="512" cy="440" r="330" fill="#fef08a" opacity="0.35" filter="url(#softGlow)"/>

      <!-- Flowing Silk Ribbons (轻盈披帛飘带) -->
      <path d="M 120 540 Q 260 280 480 340 T 880 460" fill="none" stroke="#f472b6" stroke-width="26" stroke-linecap="round" opacity="0.7"/>
      <path d="M 160 580 Q 280 340 500 390 T 840 500" fill="none" stroke="#a7f3d0" stroke-width="20" stroke-linecap="round" opacity="0.6"/>

      <!-- Body / Peach Ruqun Hanfu (粉桃齐胸襦裙) -->
      <g transform="translate(512, 620)" filter="url(#dropShadow)">
        <path d="M -240 380 L -160 60 Q 0 40 160 60 L 240 380 Z" fill="url(#fe_dress)"/>
        <!-- Mint Green Ribbon Chest Band -->
        <rect x="-130" y="70" width="260" height="35" rx="10" fill="#6ee7b7"/>
        <circle cx="0" cy="87" r="14" fill="#f43f5e"/>
      </g>

      <!-- Head & Neck -->
      <rect x="472" y="520" width="80" height="90" rx="20" fill="#fed7aa"/>
      <ellipse cx="512" cy="420" rx="175" ry="185" fill="#ffedd5" filter="url(#dropShadow)"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="380" cy="460" rx="34" ry="18" fill="#f472b6" opacity="0.4" filter="url(#softGlow)"/>
      <ellipse cx="644" cy="460" rx="34" ry="18" fill="#f472b6" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Sparkling Gentle Fairy Eyes -->
      <g filter="url(#dropShadow)">
        <ellipse cx="410" cy="415" rx="26" ry="30" fill="#1e293b"/>
        <circle cx="420" cy="406" r="10" fill="#ffffff"/>
        <circle cx="404" cy="426" r="5" fill="#ffffff"/>
        <ellipse cx="614" cy="415" rx="26" ry="30" fill="#1e293b"/>
        <circle cx="624" cy="406" r="10" fill="#ffffff"/>
        <circle cx="608" cy="426" r="5" fill="#ffffff"/>
        <!-- Soft Curved Eyebrows -->
        <path d="M 370 365 Q 410 345 450 365" stroke="#1e293b" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M 574 365 Q 614 345 654 365" stroke="#1e293b" stroke-width="6" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Tender Smile -->
      <path d="M 476 485 Q 512 520 548 485" stroke="#e11d48" stroke-width="6" stroke-linecap="round" fill="none"/>

      <!-- Traditional Double Spiral Buns (飞仙双螺髻) -->
      <g filter="url(#dropShadow)">
        <!-- Left Spiral Bun -->
        <ellipse cx="320" cy="220" rx="60" ry="85" fill="#0f172a" transform="rotate(-20 320 220)"/>
        <circle cx="340" cy="220" r="16" fill="#f472b6"/>
        <!-- Right Spiral Bun -->
        <ellipse cx="704" cy="220" rx="60" ry="85" fill="#0f172a" transform="rotate(20 704 220)"/>
        <circle cx="684" cy="220" r="16" fill="#f472b6"/>
        <!-- Golden Pearl Hairpin -->
        <circle cx="512" cy="240" r="14" fill="#facc15"/>
        <path d="M 330 330 Q 512 260 694 330 C 640 280 580 270 512 270 C 444 270 384 280 330 330 Z" fill="#0f172a"/>
      </g>

      <!-- Cuddling Soft White Jade Bunny (怀中抱着的软萌玉兔) -->
      <g transform="translate(512, 730)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="0" rx="90" ry="75" fill="#ffffff"/>
        <circle cx="45" cy="-35" r="45" fill="#ffffff"/>
        <!-- Bunny Ears -->
        <ellipse cx="35" cy="-90" rx="14" ry="40" fill="#ffffff" transform="rotate(-10 35 -90)"/>
        <ellipse cx="35" cy="-90" rx="8" ry="28" fill="#fbcfe8" transform="rotate(-10 35 -90)"/>
        <ellipse cx="65" cy="-90" rx="14" ry="40" fill="#ffffff" transform="rotate(15 65 -90)"/>
        <ellipse cx="65" cy="-90" rx="8" ry="28" fill="#fbcfe8" transform="rotate(15 65 -90)"/>
        <!-- Bunny Face -->
        <circle cx="55" cy="-40" r="6" fill="#f43f5e"/>
        <circle cx="55" cy="-42" r="2" fill="#ffffff"/>
        <!-- Hugging Hands -->
        <circle cx="-60" cy="-10" r="30" fill="#fed7aa"/>
        <circle cx="90" cy="10" r="30" fill="#fed7aa"/>
      </g>

      <!-- Seal 【仙】 -->
      <g transform="translate(830, 810)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="90" height="90" rx="16" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Left 亻 -->
          <path d="M 33 24 Q 27 36 22 46"/>
          <line x1="30" y1="38" x2="30" y2="70"/>
          <!-- Right 山 -->
          <line x1="56" y1="26" x2="56" y2="66"/>
          <path d="M 42 40 L 42 64 L 70 64 L 70 40"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 6. avatar_wukong (1024 x 1024)
  // 齐天小萌圣: 金箍、战袍、金箍棒、踏筋斗云、红印【圣】
  // ==========================================
  {
    id: "avatar_wukong",
    width: 1024,
    height: 1024,
    title: "国风齐天小神将美猴王头像",
    defs: `
      <radialGradient id="wk_bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </radialGradient>
      <linearGradient id="wk_rod" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#facc15"/>
        <stop offset="15%" stop-color="#facc15"/>
        <stop offset="16%" stop-color="#1e293b"/>
        <stop offset="84%" stop-color="#1e293b"/>
        <stop offset="85%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#facc15"/>
      </linearGradient>
    `,
    content: `
      <!-- Circle Frame -->
      <rect width="1024" height="1024" rx="512" fill="url(#wk_bg)"/>
      <circle cx="512" cy="512" r="496" fill="none" stroke="#eab308" stroke-width="16"/>
      <circle cx="512" cy="512" r="480" fill="none" stroke="#fef08a" stroke-width="6"/>

      <!-- Somersault Cloud (如意金光筋斗云) -->
      <g transform="translate(512, 850)" filter="url(#dropShadow)">
        <circle cx="0" cy="0" r="120" fill="#ffffff"/>
        <circle cx="-130" cy="30" r="90" fill="#ffffff"/>
        <circle cx="130" cy="30" r="90" fill="#ffffff"/>
        <circle cx="-60" cy="-40" r="80" fill="#ffffff"/>
        <circle cx="60" cy="-40" r="80" fill="#ffffff"/>
      </g>

      <!-- Ruyi Jingu Bang (如意金箍棒) Across Body -->
      <rect x="220" y="240" width="32" height="700" rx="12" fill="url(#wk_rod)" stroke="#ca8a04" stroke-width="4" transform="rotate(35 512 512)" filter="url(#dropShadow)"/>

      <!-- Body / Yellow Battle Robe & Tiger Sash (明黄战袍与虎皮围裙) -->
      <g transform="translate(512, 600)" filter="url(#dropShadow)">
        <path d="M -240 380 L -160 80 Q 0 40 160 80 L 240 380 Z" fill="#eab308"/>
        <!-- Red Silk Scarf (大红领巾) -->
        <polygon points="-80,80 0,200 80,80 0,60" fill="#dc2626"/>
        <!-- Tiger Striped Belt -->
        <rect x="-140" y="240" width="280" height="40" rx="8" fill="#f97316"/>
        <line x1="-80" y1="240" x2="-60" y2="280" stroke="#000000" stroke-width="8"/>
        <line x1="0" y1="240" x2="20" y2="280" stroke="#000000" stroke-width="8"/>
        <line x1="80" y1="240" x2="100" y2="280" stroke="#000000" stroke-width="8"/>
      </g>

      <!-- Monkey Head & Fur (金毛灵猴头部) -->
      <ellipse cx="512" cy="420" rx="185" ry="190" fill="#f59e0b" filter="url(#dropShadow)"/>
      <!-- Heart-shaped Peach Face (爱心形粉桃面容) -->
      <path d="M 512 530 C 370 510 360 360 440 320 C 500 290 512 360 512 360 C 512 360 524 290 584 320 C 664 360 654 510 512 530 Z" fill="#ffedd5"/>

      <!-- Golden Circlet (如意紧箍金箍儿) -->
      <path d="M 330 320 Q 512 220 694 320" stroke="#facc15" stroke-width="26" stroke-linecap="round" fill="none" filter="url(#dropShadow)"/>
      <circle cx="512" cy="270" r="26" fill="#facc15"/>
      <circle cx="512" cy="270" r="14" fill="#ca8a04"/>

      <!-- Fiery Eyes Golden Pupils (火眼金睛大双眼) -->
      <g filter="url(#dropShadow)">
        <!-- Left Eye -->
        <ellipse cx="430" cy="415" rx="30" ry="34" fill="#ca8a04"/>
        <circle cx="430" cy="415" r="22" fill="#dc2626"/>
        <circle cx="430" cy="415" r="14" fill="#000000"/>
        <circle cx="438" cy="405" r="8" fill="#ffffff"/>
        <!-- Right Eye -->
        <ellipse cx="594" cy="415" rx="30" ry="34" fill="#ca8a04"/>
        <circle cx="594" cy="415" r="22" fill="#dc2626"/>
        <circle cx="594" cy="415" r="14" fill="#000000"/>
        <circle cx="602" cy="405" r="8" fill="#ffffff"/>
      </g>

      <!-- Cute Monkey Nose & Grin -->
      <ellipse cx="512" cy="460" rx="14" ry="9" fill="#b91c1c"/>
      <path d="M 466 490 Q 512 535 558 490" stroke="#991b1b" stroke-width="7" stroke-linecap="round" fill="#dc2626"/>

      <!-- Seal 【圣】 -->
      <g transform="translate(830, 810)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="90" height="90" rx="16" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Top 又 -->
          <path d="M 30 26 L 58 26 L 40 44"/>
          <path d="M 35 32 Q 46 39 62 46"/>
          <!-- Bot 土 -->
          <line x1="33" y1="55" x2="57" y2="55"/>
          <line x1="45" y1="44" x2="45" y2="70"/>
          <line x1="24" y1="70" x2="66" y2="70" stroke-width="5"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 7. avatar_guofeng_cathy (1024 x 1024)
  // 华服小鹿凯茜: 中国红新年夹袄、梅花鹿角发簪、金元宝、红印【吉】
  // ==========================================
  {
    id: "avatar_guofeng_cathy",
    width: 1024,
    height: 1024,
    title: "国风华服吉祥小鹿凯茜头像",
    defs: `
      <radialGradient id="cat_bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff1f2"/>
        <stop offset="50%" stop-color="#fee2e2"/>
        <stop offset="100%" stop-color="#f87171"/>
      </radialGradient>
      <linearGradient id="cat_coat" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
    `,
    content: `
      <!-- Circle Frame -->
      <rect width="1024" height="1024" rx="512" fill="url(#cat_bg)"/>
      <circle cx="512" cy="512" r="496" fill="none" stroke="#ef4444" stroke-width="16"/>
      <circle cx="512" cy="512" r="480" fill="none" stroke="#fde047" stroke-width="6"/>

      <!-- Festive Red Lanterns in Background -->
      <g transform="translate(180, 180)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="0" rx="50" ry="40" fill="#dc2626"/>
        <line x1="0" y1="-50" x2="0" y2="-40" stroke="#facc15" stroke-width="4"/>
        <line x1="0" y1="40" x2="0" y2="70" stroke="#facc15" stroke-width="4"/>
      </g>
      <g transform="translate(844, 180)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="0" rx="50" ry="40" fill="#dc2626"/>
        <line x1="0" y1="-50" x2="0" y2="-40" stroke="#facc15" stroke-width="4"/>
        <line x1="0" y1="40" x2="0" y2="70" stroke="#facc15" stroke-width="4"/>
      </g>

      <!-- Cathy's Golden Antlers with Red Plum Blossoms (梅花鹿角与如意穗) -->
      <g filter="url(#dropShadow)">
        <!-- Left Antler -->
        <path d="M 420 280 Q 340 160 300 80 Q 360 120 380 180" stroke="#f59e0b" stroke-width="20" stroke-linecap="round" fill="none"/>
        <path d="M 340 160 Q 260 140 240 100" stroke="#f59e0b" stroke-width="16" stroke-linecap="round" fill="none"/>
        <!-- Plum blossoms on Left -->
        <circle cx="300" cy="80" r="14" fill="#f43f5e"/>
        <circle cx="300" cy="80" r="5" fill="#fef08a"/>
        <circle cx="240" cy="100" r="12" fill="#f43f5e"/>

        <!-- Right Antler -->
        <path d="M 604 280 Q 684 160 724 80 Q 664 120 644 180" stroke="#f59e0b" stroke-width="20" stroke-linecap="round" fill="none"/>
        <path d="M 684 160 Q 764 140 784 100" stroke="#f59e0b" stroke-width="16" stroke-linecap="round" fill="none"/>
        <!-- Plum blossoms on Right -->
        <circle cx="724" cy="80" r="14" fill="#f43f5e"/>
        <circle cx="724" cy="80" r="5" fill="#fef08a"/>
        <circle cx="784" cy="100" r="12" fill="#f43f5e"/>
      </g>

      <!-- Fawn Ears (小鹿灵动耳朵) -->
      <ellipse cx="320" cy="330" rx="55" ry="90" fill="#f97316" transform="rotate(-30 320 330)"/>
      <ellipse cx="320" cy="330" rx="30" ry="60" fill="#fed7aa" transform="rotate(-30 320 330)"/>
      <ellipse cx="704" cy="330" rx="55" ry="90" fill="#f97316" transform="rotate(30 704 330)"/>
      <ellipse cx="704" cy="330" rx="30" ry="60" fill="#fed7aa" transform="rotate(30 704 330)"/>

      <!-- Body / Festive Red Padded Winter Jacket with White Fur (吉祥中国红锦袄) -->
      <g transform="translate(512, 620)" filter="url(#dropShadow)">
        <path d="M -240 380 L -160 80 Q 0 40 160 80 L 240 380 Z" fill="url(#cat_coat)"/>
        <!-- White Fur Collar (软萌白绒毛领) -->
        <ellipse cx="0" cy="90" rx="160" ry="45" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
        <!-- Chinese Frog Buttons (吉祥如意金盘扣) -->
        <circle cx="0" cy="180" r="12" fill="#facc15"/>
        <line x1="-30" y1="180" x2="30" y2="180" stroke="#facc15" stroke-width="6"/>
        <circle cx="0" cy="240" r="12" fill="#facc15"/>
        <line x1="-30" y1="240" x2="30" y2="240" stroke="#facc15" stroke-width="6"/>
      </g>

      <!-- Cathy's Cute Fawn Head -->
      <ellipse cx="512" cy="430" rx="190" ry="180" fill="#ea580c" filter="url(#dropShadow)"/>
      <ellipse cx="512" cy="470" rx="140" ry="120" fill="#ffedd5"/>
      <!-- Fawn spots on forehead -->
      <circle cx="470" cy="330" r="10" fill="#ffffff"/>
      <circle cx="512" cy="315" r="12" fill="#ffffff"/>
      <circle cx="554" cy="330" r="10" fill="#ffffff"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="380" cy="470" rx="35" ry="20" fill="#f43f5e" opacity="0.4" filter="url(#softGlow)"/>
      <ellipse cx="644" cy="470" rx="35" ry="20" fill="#f43f5e" opacity="0.4" filter="url(#softGlow)"/>

      <!-- Big Sparkling Deer Eyes -->
      <g filter="url(#dropShadow)">
        <!-- Left Eye -->
        <ellipse cx="410" cy="420" rx="32" ry="36" fill="#1e293b"/>
        <circle cx="424" cy="408" r="14" fill="#ffffff"/>
        <circle cx="400" cy="434" r="7" fill="#ffffff"/>
        <!-- Right Eye -->
        <ellipse cx="614" cy="420" rx="32" ry="36" fill="#1e293b"/>
        <circle cx="628" cy="408" r="14" fill="#ffffff"/>
        <circle cx="604" cy="434" r="7" fill="#ffffff"/>
      </g>

      <!-- Little Heart Nose & Smile -->
      <polygon points="512,475 522,460 502,460" fill="#78350f"/>
      <path d="M 482 490 Q 512 515 542 490" stroke="#78350f" stroke-width="6" stroke-linecap="round" fill="none"/>

      <!-- Holding Lucky Gold Ingot (手捧吉祥招财纯金大元宝) -->
      <g transform="translate(512, 750)" filter="url(#dropShadow)">
        <ellipse cx="0" cy="0" rx="100" ry="40" fill="#facc15" stroke="#ca8a04" stroke-width="4"/>
        <circle cx="0" cy="-10" r="35" fill="#fde047"/>
        <!-- Paws -->
        <circle cx="-90" cy="0" r="30" fill="#ffedd5"/>
        <circle cx="90" cy="0" r="30" fill="#ffedd5"/>
      </g>

      <!-- Seal 【吉】 -->
      <g transform="translate(830, 810)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="90" height="90" rx="16" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Top 士 -->
          <line x1="22" y1="26" x2="68" y2="26" stroke-width="5"/>
          <line x1="45" y1="18" x2="45" y2="44"/>
          <line x1="30" y1="44" x2="60" y2="44"/>
          <!-- Bot 口 -->
          <rect x="30" y="50" width="30" height="22" rx="4" stroke-width="4"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 8. boss_nian_beast (1024 x 1024)
  // 中国神话难字年兽: 金色独角、威风红鬃、铜铃大眼、红印【年】
  // ==========================================
  {
    id: "boss_nian_beast",
    width: 1024,
    height: 1024,
    title: "中国神话难字年兽Boss头像",
    defs: `
      <radialGradient id="nian_bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#450a0a"/>
        <stop offset="60%" stop-color="#1c1917"/>
        <stop offset="100%" stop-color="#09090b"/>
      </radialGradient>
      <linearGradient id="nian_horn" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
    `,
    content: `
      <!-- Circle Frame -->
      <rect width="1024" height="1024" rx="512" fill="url(#nian_bg)"/>
      <circle cx="512" cy="512" r="496" fill="none" stroke="#dc2626" stroke-width="16"/>
      <circle cx="512" cy="512" r="480" fill="none" stroke="#facc15" stroke-width="6"/>

      <!-- Festive Sparkles & Fire Sparks Around -->
      <circle cx="200" cy="220" r="8" fill="#fde047" filter="url(#softGlow)"/>
      <circle cx="824" cy="260" r="10" fill="#fde047" filter="url(#softGlow)"/>
      <circle cx="160" cy="700" r="12" fill="#ef4444" filter="url(#softGlow)"/>
      <circle cx="864" cy="680" r="14" fill="#f59e0b" filter="url(#softGlow)"/>

      <!-- Golden Single Horn (金色冲天独角) -->
      <polygon points="512,80 545,260 479,260" fill="url(#nian_horn)" stroke="#ca8a04" stroke-width="6" filter="url(#dropShadow)"/>
      <ellipse cx="512" cy="260" rx="35" ry="12" fill="#ca8a04"/>

      <!-- Fiery Lion Mane (威风凛凛的赤红祥云鬃毛) -->
      <g filter="url(#dropShadow)">
        <circle cx="310" cy="300" r="80" fill="#b91c1c"/>
        <circle cx="714" cy="300" r="80" fill="#b91c1c"/>
        <circle cx="230" cy="420" r="85" fill="#dc2626"/>
        <circle cx="794" cy="420" r="85" fill="#dc2626"/>
        <circle cx="250" cy="560" r="80" fill="#991b1b"/>
        <circle cx="774" cy="560" r="80" fill="#991b1b"/>
      </g>

      <!-- Head & Jowls (年兽红金面部) -->
      <ellipse cx="512" cy="460" rx="230" ry="210" fill="#dc2626" filter="url(#dropShadow)"/>
      <!-- Golden Forehead Plate -->
      <polygon points="512,240 560,340 464,340" fill="#facc15"/>
      <circle cx="512" cy="320" r="20" fill="#ca8a04"/>

      <!-- Bell-like Fiery Eyes (铜铃烈焰金睛) -->
      <g filter="url(#dropShadow)">
        <!-- Left Eye -->
        <circle cx="400" cy="420" r="45" fill="#fef08a"/>
        <circle cx="400" cy="420" r="32" fill="#ea580c"/>
        <circle cx="400" cy="420" r="18" fill="#000000"/>
        <circle cx="410" cy="410" r="10" fill="#ffffff"/>
        <!-- Right Eye -->
        <circle cx="624" cy="420" r="45" fill="#fef08a"/>
        <circle cx="624" cy="420" r="32" fill="#ea580c"/>
        <circle cx="624" cy="420" r="18" fill="#000000"/>
        <circle cx="634" cy="410" r="10" fill="#ffffff"/>
      </g>

      <!-- Golden Whisker Plates (祥云金须) -->
      <path d="M 330 520 Q 250 480 200 540 Q 260 560 350 540 Z" fill="#facc15"/>
      <path d="M 694 520 Q 774 480 824 540 Q 764 560 674 540 Z" fill="#facc15"/>

      <!-- Lion Snout & Roaring Mouth (张口威武又萌趣) -->
      <ellipse cx="512" cy="510" rx="70" ry="40" fill="#991b1b"/>
      <ellipse cx="485" cy="510" rx="14" ry="18" fill="#000000"/>
      <ellipse cx="539" cy="510" rx="14" ry="18" fill="#000000"/>

      <path d="M 400 570 Q 512 690 624 570 Z" fill="#7f1d1d" stroke="#facc15" stroke-width="8"/>
      <!-- Sharp Cute Teeth (白色小獠牙) -->
      <polygon points="440,570 455,600 470,570" fill="#ffffff"/>
      <polygon points="554,570 569,600 584,570" fill="#ffffff"/>
      <!-- Red Tongue -->
      <ellipse cx="512" cy="630" rx="40" ry="25" fill="#ef4444"/>

      <!-- Seal 【年】 -->
      <g transform="translate(830, 810)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="90" height="90" rx="16" fill="#dc2626" stroke="#fef08a" stroke-width="4"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- Top pie -->
          <path d="M 42 18 Q 33 24 26 29"/>
          <line x1="26" y1="31" x2="64" y2="31"/>
          <line x1="22" y1="42" x2="66" y2="42"/>
          <line x1="36" y1="31" x2="36" y2="54"/>
          <line x1="18" y1="54" x2="72" y2="54" stroke-width="5"/>
          <line x1="52" y1="28" x2="52" y2="72" stroke-width="5"/>
        </g>
      </g>
    `
  }
];

console.log(`Starting generation of ${ITEMS.length} Chinese style illustrations and avatars...`);

for (const item of ITEMS) {
  console.log(`\nRendering ${item.id} (${item.title})...`);
  const svgContent = wrapSvg(item.width, item.height, item.content, item.defs);
  const svgPath = path.join(TMP_DIR, `${item.id}.svg`);
  const jpgPath = path.join(OUTPUT_DIR, `${item.id}.jpg`);
  const webpPath = path.join(OUTPUT_DIR, `${item.id}.webp`);

  fs.writeFileSync(svgPath, svgContent, "utf-8");

  // Render to JPG (quality 92)
  execSync(`magick -density 150 "${svgPath}" -quality 92 "${jpgPath}"`);
  // Render to WebP (quality 85)
  execSync(`cwebp -q 85 "${jpgPath}" -o "${webpPath}"`);

  const jpgSize = (fs.statSync(jpgPath).size / 1024).toFixed(1);
  const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1);
  console.log(`✓ Success ${item.id}: JPG (${jpgSize} KB), WebP (${webpSize} KB)`);
}

console.log("\nAll Chinese style illustrations and avatars generated successfully!");
