import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_family_illustrations";

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function wrapSvg(content, customDefs = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1376 768" width="1376" height="768">
  <defs>
    <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
    </filter>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="6" stdDeviation="6" flood-opacity="0.2"/>
    </filter>
    ${customDefs}
  </defs>
  ${content}
</svg>`;
}

const FAMILIES = [
  // 1. family_qing: 青字家族 (清晴睛情请蜻 - 碧水晴空荷塘水榭与有礼小童)
  {
    id: "family_qing",
    title: "青字家族",
    defs: `
      <linearGradient id="lotus_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
      <linearGradient id="lotus_water" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#064e3b"/>
      </linearGradient>
    `,
    content: `
      <!-- Sunny Clear Sky & Bright Sun (晴空万里出红日) -->
      <rect width="1376" height="768" fill="url(#lotus_sky)"/>
      <circle cx="280" cy="180" r="80" fill="#facc15" opacity="0.9" filter="url(#softGlow)"/>

      <!-- Lotus Pond Waters (清水清澈见底) -->
      <rect x="0" y="480" width="1376" height="288" fill="url(#lotus_water)"/>
      <!-- Giant Emerald Lotus Leaves (接天莲叶无穷碧) -->
      <g transform="translate(160, 480)" filter="url(#dropShadow)">
        <ellipse cx="60" cy="60" rx="100" ry="40" fill="#15803d"/>
        <ellipse cx="260" cy="90" rx="140" ry="50" fill="#16a34a"/>
        <ellipse cx="1100" cy="70" rx="120" ry="45" fill="#166534"/>
        <!-- Pink Blooming Lotus Flowers (映日荷花别样红) -->
        <circle cx="180" cy="30" r="30" fill="#f43f5e"/>
        <circle cx="180" cy="20" r="14" fill="#fb7185"/>
      </g>

      <!-- Flying Dragonfly Dipping Water (蜻蜓点水飞得欢) -->
      <g transform="translate(420, 360)" filter="url(#dropShadow)">
        <line x1="20" y1="20" x2="70" y2="20" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/>
        <ellipse cx="40" cy="10" rx="20" ry="6" fill="#bae6fd" opacity="0.8"/>
        <ellipse cx="40" cy="30" rx="20" ry="6" fill="#bae6fd" opacity="0.8"/>
        <circle cx="72" cy="20" r="6" fill="#0284c7"/>
      </g>

      <!-- Chinese Courtyard Water Pavilion with Polite Children Bowing (水榭长亭文明懂礼貌的小朋友拱手作揖“请进”) -->
      <g transform="translate(740, 200)" filter="url(#dropShadow)">
        <!-- Pavilion Roof (飞檐小亭) -->
        <polygon points="120,40 260,0 400,40" fill="#991b1b"/>
        <rect x="150" y="40" width="220" height="260" fill="#fef3c7" stroke="#b45309" stroke-width="6"/>
        <rect x="180" y="100" width="160" height="200" rx="80" fill="#991b1b"/>

        <!-- Child 1 Bowing in Green Robe (青衣小童拱手作揖) -->
        <g transform="translate(190, 140)">
          <rect x="10" y="60" width="45" height="90" rx="12" fill="#059669"/>
          <circle cx="32" cy="40" r="18" fill="#fed7aa"/>
          <circle cx="32" cy="20" r="8" fill="#1e293b"/>
          <circle cx="26" cy="40" r="2.5" fill="#1e293b"/>
          <circle cx="38" cy="40" r="2.5" fill="#1e293b"/>
          <!-- Hands Clasped in Bow (拱手问好“请”) -->
          <circle cx="45" cy="75" r="8" fill="#fed7aa"/>
        </g>
        <!-- Child 2 Smiling in Pink (红裙小童笑盈盈好心情) -->
        <g transform="translate(265, 140)">
          <rect x="10" y="60" width="45" height="90" rx="12" fill="#f43f5e"/>
          <circle cx="32" cy="40" r="18" fill="#fed7aa"/>
          <circle cx="32" cy="20" r="8" fill="#1e293b"/>
          <circle cx="26" cy="40" r="2.5" fill="#1e293b"/>
          <circle cx="38" cy="40" r="2.5" fill="#1e293b"/>
        </g>
      </g>

      <!-- Red Chinese Seal (青 - 青字家族) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="16" x2="42" y2="16"/>
          <line x1="28" y1="12" x2="28" y2="28"/>
          <line x1="18" y1="22" x2="38" y2="22"/>
          <line x1="14" y1="28" x2="42" y2="28"/>
          <rect x="18" y="32" width="20" height="14" rx="2"/>
          <line x1="18" y1="39" x2="38" y2="39"/>
        </g>
      </g>
    `
  },

  // 2. family_mu: 木字家族 (林森本末枝休 - 独木成林郁郁葱葱，樵夫与小松鼠树下休息)
  {
    id: "family_mu",
    title: "木字家族",
    defs: `
      <linearGradient id="forest_dawn" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6ee7b7"/>
        <stop offset="60%" stop-color="#a7f3d0"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Fresh Green Forest Sky (清晨森林朝霞) -->
      <rect width="1376" height="768" fill="url(#forest_dawn)"/>
      <rect x="0" y="520" width="1376" height="248" fill="#166534"/>

      <!-- Magnificent Ancient Trees in Forest (独木成林，三木成森) -->
      <g transform="translate(140, 100)" filter="url(#dropShadow)">
        <!-- Giant Center Tree (高大参天古木) -->
        <path d="M220,540 Q230,340 240,200" stroke="#78350f" stroke-width="48" stroke-linecap="round" fill="none"/>
        <circle cx="240" cy="180" r="160" fill="#15803d"/>
        <circle cx="160" cy="220" r="120" fill="#16a34a"/>
        <circle cx="320" cy="200" r="130" fill="#14532d"/>
        <!-- Tree Roots in Earth (深植泥土之树根 - “本”) -->
        <path d="M220,540 L160,620 M240,540 L300,620" stroke="#451a03" stroke-width="16" stroke-linecap="round"/>
      </g>

      <!-- Forest Animals & Person Resting by Tree (人靠树木为“休”) -->
      <g transform="translate(560, 320)" filter="url(#dropShadow)">
        <!-- Boy in Hanfu Linen Tunic Leaning on Trunk Resting (倚木而歇为休) -->
        <rect x="60" y="140" width="55" height="120" rx="14" fill="#0284c7"/>
        <circle cx="90" cy="100" r="26" fill="#fed7aa"/>
        <circle cx="90" cy="75" r="12" fill="#1e293b"/>
        <!-- Contented Relaxed Eyes Smiling -->
        <path d="M82,100 Q88,106 94,100" stroke="#1e293b" stroke-width="2.5" fill="none"/>
        <path d="M85,112 Q90,118 95,112" stroke="#dc2626" stroke-width="2.5" fill="none"/>

        <!-- Little Squirrel on Branch Holding Pine Cone (枝头灵巧小松鼠) -->
        <g transform="translate(180, 20)">
          <ellipse cx="40" cy="60" rx="26" ry="18" fill="#d97706"/>
          <circle cx="58" cy="48" r="14" fill="#d97706"/>
          <ellipse cx="10" cy="40" rx="14" ry="24" fill="#b45309" transform="rotate(-30 10 40)"/>
          <circle cx="62" cy="46" r="3" fill="#1e293b"/>
        </g>
      </g>

      <!-- More Trees Creating a Dense Forest (万木繁茂的大森林) -->
      <g transform="translate(940, 140)" filter="url(#dropShadow)">
        <path d="M160,500 L180,240" stroke="#78350f" stroke-width="36" fill="none"/>
        <circle cx="180" cy="200" r="130" fill="#15803d"/>
        <circle cx="260" cy="220" r="110" fill="#16a34a"/>
      </g>

      <!-- Red Chinese Seal (木 - 木字家族) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="24" x2="42" y2="24"/>
          <line x1="28" y1="12" x2="28" y2="44"/>
          <path d="M28,24 L16,40"/>
          <path d="M28,24 L38,38"/>
        </g>
      </g>
    `
  },

  // 3. family_ye: 也字家族 (地池他驰 - 沃土大地、池塘碧波与骏马奔驰)
  {
    id: "family_ye",
    title: "也字家族",
    defs: `
      <linearGradient id="prairie_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <!-- Vast Earth & Running River Pond (有土成地，有水成池，有马奔驰) -->
      <rect width="1376" height="768" fill="url(#prairie_sky)"/>
      <!-- Vast Earth Ground (广袤肥沃大地 - “地”) -->
      <polygon points="0,480 1376,440 1376,768 0,768" fill="#a16207"/>
      <polygon points="0,520 1376,490 1376,768 0,768" fill="#15803d"/>

      <!-- Winding Blue Pond / Lake (波光粼粼碧水池塘 - “池”) -->
      <ellipse cx="380" cy="620" rx="280" ry="90" fill="#0284c7" stroke="#38bdf8" stroke-width="6"/>
      <path d="M260,620 Q380,590 500,620" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.6"/>

      <!-- Galloping Noble Steed (有马奔驰疾行 - “驰”) -->
      <g transform="translate(680, 260)" filter="url(#dropShadow)">
        <ellipse cx="200" cy="200" rx="100" ry="55" fill="#991b1b"/>
        <path d="M260,180 Q320,130 350,90 Q340,70 310,80 Q270,120 250,150 Z" fill="#991b1b"/>
        <!-- Galloping Legs -->
        <line x1="140" y1="230" x2="80" y2="300" stroke="#7f1d1d" stroke-width="16" stroke-linecap="round"/>
        <line x1="170" y1="230" x2="130" y2="310" stroke="#7f1d1d" stroke-width="14" stroke-linecap="round"/>
        <line x1="260" y1="220" x2="310" y2="290" stroke="#7f1d1d" stroke-width="14" stroke-linecap="round"/>
        <line x1="280" y1="210" x2="350" y2="280" stroke="#7f1d1d" stroke-width="16" stroke-linecap="round"/>
        <!-- Flying Mane and Tail (飞扬之鬃毛马尾) -->
        <path d="M120,180 Q60,160 40,230" stroke="#f59e0b" stroke-width="12" fill="none"/>
        <path d="M310,90 Q330,120 340,160" stroke="#f59e0b" stroke-width="10" fill="none"/>
      </g>

      <!-- Friendly Traveling Companion Pointing (有人是他“他”) -->
      <g transform="translate(260, 320)" filter="url(#dropShadow)">
        <rect x="60" y="100" width="50" height="120" rx="12" fill="#2563eb"/>
        <circle cx="85" cy="70" r="24" fill="#fed7aa"/>
        <line x1="110" y1="120" x2="190" y2="100" stroke="#2563eb" stroke-width="14" stroke-linecap="round"/>
        <circle cx="195" cy="100" r="10" fill="#fed7aa"/>
      </g>

      <!-- Red Chinese Seal (也 - 也字家族) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M14,24 L36,24 L36,36 L16,36"/>
          <line x1="24" y1="14" x2="24" y2="44"/>
          <path d="M36,14 L36,42 Q36,46 44,40"/>
        </g>
      </g>
    `
  },

  // 4. family_bao: 包字家族 (饱抱泡跑炮袍 - 农家小院包热气大包子、怀抱萌娃其乐融融)
  {
    id: "family_bao",
    title: "包字家族",
    defs: `
      <linearGradient id="steamer_steam" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    `,
    content: `
      <!-- Warm Farmhouse Courtyard (农家温馨小院丰收景象) -->
      <rect width="1376" height="768" fill="#fef3c7"/>
      <rect x="0" y="520" width="1376" height="248" fill="#fed7aa"/>

      <!-- Steaming Hot Bamboo Steamer with Delicious Buns (有食吃饱：香喷喷热气腾腾大包子) -->
      <g transform="translate(320, 320)" filter="url(#dropShadow)">
        <rect x="20" y="140" width="220" height="40" rx="10" fill="#b45309"/>
        <!-- Steamer Layer 1 & 2 -->
        <rect x="30" y="70" width="200" height="70" rx="8" fill="#d97706" stroke="#92400e" stroke-width="4"/>
        <rect x="30" y="0" width="200" height="70" rx="8" fill="#d97706" stroke="#92400e" stroke-width="4"/>
        <!-- White Fluffy Steamed Buns Inside (白胖大包子) -->
        <circle cx="75" cy="40" r="22" fill="#ffffff" stroke="#fed7aa" stroke-width="3"/>
        <circle cx="130" cy="40" r="24" fill="#ffffff" stroke="#fed7aa" stroke-width="3"/>
        <circle cx="185" cy="40" r="22" fill="#ffffff" stroke="#fed7aa" stroke-width="3"/>
        <!-- Rising Delicious Steam (腾腾白汽) -->
        <path d="M120,-10 Q140,-60 120,-110" stroke="url(#steamer_steam)" stroke-width="16" fill="none" filter="url(#softGlow)"/>
        <path d="M160,-20 Q180,-70 160,-120" stroke="url(#steamer_steam)" stroke-width="14" fill="none" filter="url(#softGlow)"/>
      </g>

      <!-- Loving Mother Holding Baby in Warm Gown (有手拥抱“抱”，身穿锦袍“袍”) -->
      <g transform="translate(740, 200)" filter="url(#dropShadow)">
        <!-- Mother in Traditional Floral Robe / Pao (身着大红喜庆长袍) -->
        <path d="M80,140 L20,380 L180,380 L140,140 Z" fill="#dc2626"/>
        <circle cx="110" cy="90" r="32" fill="#fed7aa"/>
        <circle cx="110" cy="55" r="16" fill="#1e293b"/>
        <!-- Loving Smile -->
        <path d="M102,105 Q110,112 118,105" stroke="#991b1b" stroke-width="3" fill="none"/>

        <!-- Warmly Hugging Happy Toddler (怀中温暖拥抱小萌宝) -->
        <g transform="translate(50, 160)">
          <rect x="20" y="40" width="55" height="90" rx="14" fill="#facc15"/>
          <circle cx="48" cy="20" r="22" fill="#fed7aa"/>
          <circle cx="48" cy="2" r="10" fill="#1e293b"/>
          <circle cx="42" cy="20" r="3" fill="#1e293b"/>
          <circle cx="54" cy="20" r="3" fill="#1e293b"/>
          <path d="M44,30 Q48,36 52,30" stroke="#dc2626" stroke-width="2.5" fill="none"/>
        </g>
        <!-- Mother Arms Wrapped Around Baby (双手温暖环抱) -->
        <path d="M60,160 L50,220 L130,220" stroke="#dc2626" stroke-width="24" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Red Chinese Seal (包 - 包字家族) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M18,14 L38,14 L38,26 L14,26"/>
          <path d="M14,26 L14,44 L38,44"/>
          <rect x="20" y="30" width="14" height="10" rx="2"/>
        </g>
      </g>
    `
  },

  // 5. family_ri: 日字家族 (明早星春晒时 - 旭日东升金光万丈，早起晨读春光无限)
  {
    id: "family_ri",
    title: "日字家族",
    defs: `
      <linearGradient id="morning_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="40%" stop-color="#bae6fd"/>
        <stop offset="80%" stop-color="#fed7aa"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <!-- Radiant Morning Sunrise (红红太阳照东方，早起锻炼读书忙) -->
      <rect width="1376" height="768" fill="url(#morning_sky)"/>
      <circle cx="480" cy="240" r="120" fill="#ef4444" filter="url(#softGlow)"/>
      <circle cx="480" cy="240" r="100" fill="#f97316"/>
      <circle cx="480" cy="240" r="75" fill="#facc15"/>

      <!-- Golden Beams of Sunlight (万丈朝阳洒向山峦) -->
      <line x1="480" y1="240" x2="180" y2="60" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
      <line x1="480" y1="240" x2="780" y2="60" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
      <line x1="480" y1="240" x2="180" y2="420" stroke="#ffffff" stroke-width="4" opacity="0.6"/>

      <!-- Rolling Green Hills in Spring (春光明媚山青草绿) -->
      <path d="M0,520 Q360,380 720,490 T1376,460 L1376,768 L0,768 Z" fill="#15803d"/>
      <path d="M0,580 Q420,480 840,560 T1376,540 L1376,768 L0,768 Z" fill="#16a34a"/>

      <!-- Early Morning Student Diligently Reading Aloud (少年早起、书声琅琅迎朝阳) -->
      <g transform="translate(860, 280)" filter="url(#dropShadow)">
        <rect x="50" y="130" width="55" height="130" rx="14" fill="#0284c7"/>
        <circle cx="78" cy="85" r="26" fill="#fed7aa"/>
        <circle cx="78" cy="55" r="12" fill="#1e293b"/>
        <!-- Bright Eyes Facing Sunlight -->
        <circle cx="72" cy="85" r="3.5" fill="#1e293b"/>
        <circle cx="86" cy="85" r="3.5" fill="#1e293b"/>
        <path d="M74,98 Q80,105 86,98" stroke="#dc2626" stroke-width="2.5" fill="none"/>

        <!-- Holding Open Book (双手捧书朗读迎朝日) -->
        <g transform="translate(10, 150)">
          <rect x="0" y="0" width="50" height="38" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="25" y1="0" x2="25" y2="38" stroke="#94a3b8" stroke-width="2"/>
        </g>
      </g>

      <!-- Red Chinese Seal (日 - 日字家族) with Vector Path -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <rect x="18" y="14" width="20" height="28" rx="2"/>
          <line x1="18" y1="28" x2="38" y2="28"/>
        </g>
      </g>
    `
  }
];

console.log(`Generating ${FAMILIES.length} radical family illustrations...`);

for (const item of FAMILIES) {
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

console.log("\nAll 5 radical family illustrations generated successfully!");
