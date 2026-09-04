import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_idioms_final";

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

const FINAL_IDIOMS = [
  // ==========================================
  // 1. 自相矛盾 (idiom_zixiangmaodun)
  // ==========================================
  {
    id: "idiom_zixiangmaodun",
    title: "自相矛盾",
    defs: `
      <linearGradient id="sky_md" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef3c7"/>
      </linearGradient>
      <linearGradient id="shield_gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="50%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <linearGradient id="spear_steel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9"/>
        <stop offset="50%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Ancient Chinese Market Sky -->
      <rect width="1376" height="768" fill="url(#sky_md)"/>
      <circle cx="1200" cy="130" r="70" fill="#fde047" filter="url(#softGlow)"/>

      <!-- Ancient Market Buildings & Flying Eaves (古代繁华市集飞檐黛瓦) -->
      <g filter="url(#dropShadow)">
        <path d="M0,320 L1376,320 L1376,768 L0,768 Z" fill="#e2e8f0"/>
        <!-- Rooftops left -->
        <path d="M0,280 L280,240 L320,320 L0,320 Z" fill="#475569"/>
        <path d="M260,240 Q340,240 370,220 L360,250 Q310,260 250,260 Z" fill="#334155"/>
        <!-- Rooftops right -->
        <path d="M1040,240 L1376,270 L1376,320 L1020,320 Z" fill="#475569"/>
        <path d="M1060,240 Q980,240 950,220 L960,250 Q1010,260 1070,260 Z" fill="#334155"/>
        <!-- Market Banner/Flag in Chinese: 市集 (纯中文布幡) -->
        <line x1="260" y1="210" x2="260" y2="400" stroke="#78350f" stroke-width="8"/>
        <polygon points="264,230 360,250 360,370 264,350" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <!-- 市 -->
          <line x1="312" y1="260" x2="312" y2="272"/>
          <line x1="290" y1="272" x2="334" y2="272"/>
          <rect x="296" y="278" width="32" height="22"/>
          <line x1="312" y1="278" x2="312" y2="310"/>
        </g>
      </g>

      <!-- Market Flagstones (青石板路面) -->
      <rect x="0" y="580" width="1376" height="188" fill="#cbd5e1"/>
      <line x1="0" y1="580" x2="1376" y2="580" stroke="#94a3b8" stroke-width="4"/>
      <path d="M120,640 L340,640 M500,690 L750,690 M880,630 L1120,630 M220,720 L480,720 M960,710 L1260,710" stroke="#94a3b8" stroke-width="3" stroke-dasharray="16,12"/>

      <!-- Curious Spectators: Chinese Grandfather & Child in Traditional Hanfu (围观老翁与总角小童) -->
      <g transform="translate(180, 360)">
        <!-- Old Elder in Hanfu -->
        <ellipse cx="140" cy="90" rx="34" ry="40" fill="#fed7aa"/>
        <!-- White Beard & Hair Bun -->
        <circle cx="140" cy="46" r="16" fill="#f8fafc"/>
        <path d="M124,46 L156,46 L150,28 L130,28 Z" fill="#64748b"/>
        <!-- Hair pin -->
        <line x1="115" y1="36" x2="165" y2="36" stroke="#b45309" stroke-width="4"/>
        <!-- Beard -->
        <path d="M125,108 Q140,165 140,175 Q140,165 155,108 Z" fill="#f8fafc"/>
        <!-- Robe -->
        <path d="M80,126 L200,126 L225,320 L55,320 Z" fill="#0284c7"/>
        <path d="M80,126 L140,210 L160,126" stroke="#f1f5f9" stroke-width="8" fill="none"/>
        <rect x="75" y="210" width="130" height="16" fill="#0369a1"/>

        <!-- Little Child with Traditional Double Top-knots (总角萌童) -->
        <g transform="translate(130, 90)">
          <!-- Double Buns (双丫髻) with Red Ribbons -->
          <circle cx="50" cy="55" r="15" fill="#1e293b"/>
          <circle cx="90" cy="55" r="15" fill="#1e293b"/>
          <path d="M46,65 Q35,80 40,95" stroke="#ef4444" stroke-width="4" fill="none"/>
          <path d="M94,65 Q105,80 100,95" stroke="#ef4444" stroke-width="4" fill="none"/>
          <!-- Child Face -->
          <circle cx="70" cy="90" r="32" fill="#fed7aa"/>
          <circle cx="58" cy="85" r="4" fill="#0f172a"/>
          <circle cx="82" cy="85" r="4" fill="#0f172a"/>
          <!-- Inquisitive smile -->
          <path d="M64,102 Q70,110 76,102" stroke="#e11d48" stroke-width="3" fill="none"/>
          <circle cx="52" cy="96" r="6" fill="#fca5a5" opacity="0.6"/>
          <circle cx="88" cy="96" r="6" fill="#fca5a5" opacity="0.6"/>
          <!-- Child Yellow Hanfu -->
          <path d="M35,122 L105,122 L120,230 L20,230 Z" fill="#f59e0b"/>
          <rect x="30" y="165" width="80" height="10" fill="#dc2626"/>
        </g>
      </g>

      <!-- The Bragging Merchant in Hanfu with Spear and Shield (自相矛盾的楚国商人) -->
      <g transform="translate(680, 260)" filter="url(#dropShadow)">
        <!-- Merchant Body in Traditional Chinese Robe -->
        <path d="M60,230 L260,230 L300,440 L20,440 Z" fill="#9333ea"/>
        <path d="M60,230 L160,330 L200,230" stroke="#fef08a" stroke-width="12" fill="none"/>
        <rect x="50" y="325" width="220" height="24" fill="#6b21a8"/>
        <!-- Golden Jade Belt Buckle (玉带扣) -->
        <rect x="145" y="320" width="30" height="34" rx="6" fill="#facc15"/>

        <!-- Merchant Head & Hat -->
        <circle cx="160" cy="145" r="46" fill="#fed7aa"/>
        <!-- Chinese Merchant Cap (古代软裹方巾) -->
        <path d="M110,130 Q160,85 210,130 L215,100 Q160,60 105,100 Z" fill="#334155"/>
        <circle cx="160" cy="65" r="16" fill="#1e293b"/>
        <!-- Eyes looking proud/bragging -->
        <ellipse cx="140" cy="138" rx="6" ry="4" fill="#0f172a"/>
        <ellipse cx="180" cy="138" rx="6" ry="4" fill="#0f172a"/>
        <!-- Eyebrows raised -->
        <path d="M128,125 Q140,118 152,122" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M168,122 Q180,118 192,125" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>
        <!-- Moustache & Wide open mouth shouting praise -->
        <path d="M142,158 Q160,165 178,158" stroke="#1e293b" stroke-width="4" fill="none"/>
        <ellipse cx="160" cy="172" rx="14" ry="10" fill="#991b1b"/>

        <!-- Left Hand Holding Golden Chinese Bronze Shield (坚固的青铜巨盾) -->
        <path d="M80,240 L-40,290" stroke="#9333ea" stroke-width="36" stroke-linecap="round"/>
        <circle cx="-45" cy="290" r="18" fill="#fed7aa"/>
        <!-- Grand Bronze Shield (夔龙纹青铜大盾) -->
        <g transform="translate(-160, 160)">
          <ellipse cx="110" cy="150" rx="90" ry="120" fill="url(#shield_gold)" stroke="#78350f" stroke-width="6"/>
          <!-- Inner Rim & Boss -->
          <ellipse cx="110" cy="150" rx="68" ry="92" fill="none" stroke="#fef08a" stroke-width="4" stroke-dasharray="10,6"/>
          <circle cx="110" cy="150" r="28" fill="#b45309" stroke="#fef08a" stroke-width="4"/>
          <!-- Shield Spikes / Rivets -->
          <circle cx="110" cy="55" r="8" fill="#facc15"/>
          <circle cx="110" cy="245" r="8" fill="#facc15"/>
          <circle cx="45" cy="150" r="8" fill="#facc15"/>
          <circle cx="175" cy="150" r="8" fill="#facc15"/>
        </g>

        <!-- Right Hand Holding Sharp Spear (刺透万物的锋利长矛) -->
        <path d="M240,240 L360,200" stroke="#9333ea" stroke-width="36" stroke-linecap="round"/>
        <circle cx="365" cy="195" r="18" fill="#fed7aa"/>
        <!-- Chinese Long Spear (丈八长矛) -->
        <g transform="translate(360, 200) rotate(-35)">
          <line x1="0" y1="-260" x2="0" y2="280" stroke="#78350f" stroke-width="12" stroke-linecap="round"/>
          <path d="M-15,-220 Q-30,-190 0,-170 Q30,-190 15,-220 Z" fill="#ef4444" filter="url(#softGlow)"/>
          <polygon points="0,-330 18,-240 0,-225 -18,-240" fill="url(#spear_steel)" stroke="#334155" stroke-width="2"/>
          <line x1="0" y1="-320" x2="0" y2="-230" stroke="#ffffff" stroke-width="3"/>
        </g>
      </g>

      <!-- Red Chinese Seal (矛) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M15,16 L38,16 L34,26 L42,26"/>
          <line x1="26" y1="20" x2="26" y2="44"/>
          <path d="M26,30 L16,40"/>
          <path d="M30,34 L40,42"/>
          <line x1="23" y1="12" x2="29" y2="18"/>
        </g>
      </g>
    `
  },

  // ==========================================
  // 2. 滥竽充数 (idiom_lanyuchongshu)
  // ==========================================
  {
    id: "idiom_lanyuchongshu",
    title: "滥竽充数",
    defs: `
      <linearGradient id="palace_bg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#450a0a"/>
        <stop offset="50%" stop-color="#7f1d1d"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </linearGradient>
      <linearGradient id="gold_pillar" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#b45309"/>
        <stop offset="40%" stop-color="#fbbf24"/>
        <stop offset="70%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#78350f"/>
      </linearGradient>
      <linearGradient id="bamboo_yu" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#ca8a04"/>
        <stop offset="100%" stop-color="#854d0e"/>
      </linearGradient>
    `,
    content: `
      <!-- Majestic Imperial Qi Palace Hall (齐国宫廷庄严宏伟大殿) -->
      <rect width="1376" height="768" fill="url(#palace_bg)"/>

      <!-- Palace Golden Dragon Pillars (宫殿雕龙金漆朱红巨柱) -->
      <g filter="url(#dropShadow)">
        <rect x="80" y="0" width="80" height="768" fill="url(#gold_pillar)"/>
        <rect x="1216" y="0" width="80" height="768" fill="url(#gold_pillar)"/>
        <!-- Golden Cloud Banners on Tops (祥云金顶梁) -->
        <rect x="0" y="0" width="1376" height="70" fill="#991b1b"/>
        <path d="M0,70 L1376,70 L1376,95 L0,95 Z" fill="#facc15"/>
        <line x1="0" y1="95" x2="1376" y2="95" stroke="#78350f" stroke-width="6"/>
      </g>

      <!-- Royal Bianzhong Chimes in Background (宫廷编钟剪影与金辉) -->
      <g transform="translate(420, 95)" opacity="0.85">
        <rect x="0" y="0" width="536" height="18" fill="#78350f"/>
        <rect x="40" y="18" width="16" height="120" fill="#78350f"/>
        <rect x="480" y="18" width="16" height="120" fill="#78350f"/>
        <line x1="40" y1="60" x2="496" y2="60" stroke="#b45309" stroke-width="8"/>
        <line x1="40" y1="110" x2="496" y2="110" stroke="#b45309" stroke-width="8"/>
        <ellipse cx="120" cy="70" rx="14" ry="12" fill="#eab308"/>
        <ellipse cx="180" cy="70" rx="16" ry="14" fill="#eab308"/>
        <ellipse cx="250" cy="70" rx="18" ry="16" fill="#eab308"/>
        <ellipse cx="320" cy="70" rx="20" ry="17" fill="#eab308"/>
        <ellipse cx="390" cy="70" rx="22" ry="18" fill="#eab308"/>
      </g>

      <!-- Palace Red Carpet Floor with Traditional Cloud Pattern (宫廷红毯与金云阶梯) -->
      <rect x="0" y="540" width="1376" height="228" fill="#881337"/>
      <rect x="0" y="520" width="1376" height="20" fill="#f59e0b"/>
      <path d="M120,620 L320,620 M540,680 L850,680 M1020,620 L1280,620" stroke="#fbbf24" stroke-width="3" stroke-dasharray="16,12" opacity="0.6"/>

      <!-- Serious Professional Court Musicians on Left & Right (认真吹奏的齐国乐师) -->
      <!-- Left Musician (认真吹奏) -->
      <g transform="translate(240, 360)">
        <path d="M40,160 L160,160 L180,320 L20,320 Z" fill="#0284c7"/>
        <circle cx="100" cy="90" r="36" fill="#fed7aa"/>
        <path d="M70,80 L130,80 L120,40 L80,40 Z" fill="#1e293b"/>
        <path d="M85,95 Q92,100 100,95" stroke="#334155" stroke-width="3" fill="none"/>
        <path d="M108,95 Q115,100 122,95" stroke="#334155" stroke-width="3" fill="none"/>
        <line x1="85" y1="120" x2="85" y2="40" stroke="#fef08a" stroke-width="6"/>
        <line x1="95" y1="120" x2="95" y2="30" stroke="#fef08a" stroke-width="6"/>
        <line x1="105" y1="120" x2="105" y2="45" stroke="#fef08a" stroke-width="6"/>
        <line x1="115" y1="120" x2="115" y2="55" stroke="#fef08a" stroke-width="6"/>
      </g>

      <!-- Right Musician (认真吹奏) -->
      <g transform="translate(980, 360)">
        <path d="M40,160 L160,160 L180,320 L20,320 Z" fill="#0284c7"/>
        <circle cx="100" cy="90" r="36" fill="#fed7aa"/>
        <path d="M70,80 L130,80 L120,40 L80,40 Z" fill="#1e293b"/>
        <path d="M85,95 Q92,100 100,95" stroke="#334155" stroke-width="3" fill="none"/>
        <path d="M108,95 Q115,100 122,95" stroke="#334155" stroke-width="3" fill="none"/>
        <line x1="85" y1="120" x2="85" y2="40" stroke="#fef08a" stroke-width="6"/>
        <line x1="95" y1="120" x2="95" y2="30" stroke="#fef08a" stroke-width="6"/>
        <line x1="105" y1="120" x2="105" y2="45" stroke="#fef08a" stroke-width="6"/>
        <line x1="115" y1="120" x2="115" y2="55" stroke="#fef08a" stroke-width="6"/>
      </g>

      <!-- Center: Mr. Nanguo Pretending to Play (生动滑稽的南郭先生，鼓腮装相) -->
      <g transform="translate(560, 270)" filter="url(#dropShadow)">
        <!-- Green Silk Robe (宽大华丽的宫廷绿袍) -->
        <path d="M50,220 L220,220 L260,450 L10,450 Z" fill="#059669"/>
        <path d="M50,220 L135,310 L220,220" stroke="#fef08a" stroke-width="12" fill="none"/>
        <rect x="40" y="315" width="190" height="24" fill="#047857"/>

        <!-- Nanguo Big Head & Square Scholar Hat -->
        <ellipse cx="88" cy="155" rx="30" ry="24" fill="#fed7aa"/>
        <ellipse cx="182" cy="155" rx="30" ry="24" fill="#fed7aa"/>
        <circle cx="135" cy="140" r="48" fill="#fed7aa"/>

        <!-- Scholar Hat (黑色高巾) -->
        <path d="M90,110 L180,110 L170,45 L100,45 Z" fill="#1e293b"/>
        <line x1="80" y1="110" x2="190" y2="110" stroke="#0f172a" stroke-width="6"/>

        <!-- Rolling Shifty Eyes -->
        <circle cx="118" cy="128" r="8" fill="#ffffff"/>
        <circle cx="122" cy="126" r="4" fill="#0f172a"/>
        <circle cx="152" cy="128" r="8" fill="#ffffff"/>
        <circle cx="156" cy="126" r="4" fill="#0f172a"/>
        <path d="M108,118 Q120,112 128,118" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M142,118 Q150,112 162,118" stroke="#0f172a" stroke-width="4" stroke-linecap="round" fill="none"/>

        <!-- Pursed Mouth Pretending to Blow -->
        <circle cx="135" cy="165" r="10" fill="#991b1b" stroke="#78350f" stroke-width="3"/>

        <!-- Sweat Drops -->
        <path d="M190,115 Q196,125 190,132 Q184,125 190,115 Z" fill="#38bdf8"/>
        <path d="M78,135 Q84,145 78,152 Q72,145 78,135 Z" fill="#38bdf8"/>

        <!-- Traditional Chinese Yu Instrument (双手捧着的排竽竹制乐器) -->
        <g transform="translate(100, 155)">
          <line x1="15" y1="0" x2="15" y2="-120" stroke="url(#bamboo_yu)" stroke-width="7" stroke-linecap="round"/>
          <line x1="25" y1="0" x2="25" y2="-150" stroke="url(#bamboo_yu)" stroke-width="7" stroke-linecap="round"/>
          <line x1="35" y1="0" x2="35" y2="-180" stroke="url(#bamboo_yu)" stroke-width="7" stroke-linecap="round"/>
          <line x1="45" y1="0" x2="45" y2="-160" stroke="url(#bamboo_yu)" stroke-width="7" stroke-linecap="round"/>
          <line x1="55" y1="0" x2="55" y2="-130" stroke="url(#bamboo_yu)" stroke-width="7" stroke-linecap="round"/>
          <ellipse cx="35" cy="18" rx="35" ry="24" fill="#d97706" stroke="#78350f" stroke-width="4"/>
          <circle cx="0" cy="22" r="14" fill="#fed7aa"/>
          <circle cx="70" cy="22" r="14" fill="#fed7aa"/>
        </g>
      </g>

      <!-- Red Chinese Seal (竽) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="15" x2="24" y2="15"/>
          <line x1="18" y1="12" x2="16" y2="19"/>
          <line x1="31" y1="15" x2="41" y2="15"/>
          <line x1="35" y1="12" x2="33" y2="19"/>
          <line x1="16" y1="26" x2="39" y2="26"/>
          <line x1="13" y1="34" x2="42" y2="34"/>
          <path d="M28,26 L28,42 Q28,45 23,44"/>
        </g>
      </g>
    `
  }
];

console.log(`Rendering ${FINAL_IDIOMS.length} final idiom illustrations...`);

for (const item of FINAL_IDIOMS) {
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

console.log("\nAll final idiom illustrations generated successfully!");
