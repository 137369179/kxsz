import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUTPUT_DIR = path.resolve("assets/images");
const TMP_DIR = "/tmp/literacy_pinyin_pairs";

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

const PINYIN_PAIRS = [
  // 1. pinyin_pair_ba: 爸爸 (慈爱高大的中国父亲牵着戴红领巾的孩子)
  {
    id: "pinyin_pair_ba",
    title: "爸爸",
    defs: `
      <linearGradient id="sky_park" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#sky_park)"/>
      <rect x="0" y="540" width="1376" height="228" fill="#86efac"/>
      <!-- Ancient Ginkgo Tree & Flying Birds (银杏树与祥和小鸟) -->
      <g transform="translate(180, 200)" filter="url(#dropShadow)">
        <path d="M80,380 Q100,240 120,160" stroke="#78350f" stroke-width="26" fill="none"/>
        <circle cx="120" cy="110" r="110" fill="#facc15"/>
        <circle cx="70" cy="130" r="80" fill="#eab308"/>
        <circle cx="170" cy="120" r="80" fill="#fde047"/>
      </g>
      <!-- Father and Child Walking Together (父亲牵手戴红领巾的可爱小童) -->
      <g transform="translate(620, 220)" filter="url(#dropShadow)">
        <!-- Father (慈爱高大的父亲) -->
        <rect x="80" y="160" width="90" height="230" rx="20" fill="#1e40af"/>
        <circle cx="125" cy="110" r="34" fill="#fed7aa"/>
        <path d="M100,85 Q125,65 150,85" stroke="#1e293b" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="115" cy="110" r="4" fill="#1e293b"/>
        <circle cx="135" cy="110" r="4" fill="#1e293b"/>
        <path d="M115,125 Q125,135 135,125" stroke="#dc2626" stroke-width="3" fill="none"/>

        <!-- Child with Red Scarf (戴红领巾奔跑微笑的孩子) -->
        <rect x="230" y="270" width="60" height="130" rx="16" fill="#f59e0b"/>
        <circle cx="260" cy="225" r="26" fill="#fed7aa"/>
        <circle cx="260" cy="195" r="14" fill="#1e293b"/>
        <!-- Red Scarf (鲜艳的红领巾) -->
        <polygon points="260,250 250,290 270,290" fill="#dc2626"/>
        <circle cx="252" cy="225" r="3" fill="#1e293b"/>
        <circle cx="268" cy="225" r="3" fill="#1e293b"/>
        <path d="M255,236 Q260,244 265,236" stroke="#dc2626" stroke-width="3" fill="none"/>

        <!-- Holding Hands (温暖牵手) -->
        <line x1="165" y1="240" x2="235" y2="290" stroke="#1e40af" stroke-width="18" stroke-linecap="round"/>
        <circle cx="200" cy="265" r="14" fill="#fed7aa"/>
      </g>
      <!-- Seal (爱) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M20,16 L14,22"/>
          <path d="M28,14 L28,22"/>
          <path d="M36,16 L40,22"/>
          <path d="M16,24 L40,24 L28,34 L40,44"/>
          <line x1="16" y1="44" x2="28" y2="44"/>
        </g>
      </g>
    `
  },

  // 2. pinyin_pair_ma: 妈妈 (温婉慈祥的母亲与开心读书的孩子)
  {
    id: "pinyin_pair_ma",
    title: "妈妈",
    defs: `
      <linearGradient id="warm_room" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#warm_room)"/>
      <rect x="0" y="560" width="1376" height="208" fill="#fdba74"/>
      <!-- Cozy Garden Bench & Flowers (温馨长椅与牡丹花盆) -->
      <rect x="360" y="440" width="660" height="40" rx="8" fill="#b45309" filter="url(#dropShadow)"/>
      <line x1="420" y1="480" x2="420" y2="580" stroke="#78350f" stroke-width="16"/>
      <line x1="960" y1="480" x2="960" y2="580" stroke="#78350f" stroke-width="16"/>

      <!-- Mother in Soft Floral Hanfu/Qipao Reading with Child (温婉母亲拥抱孩子伴读绘本) -->
      <g transform="translate(520, 200)" filter="url(#dropShadow)">
        <!-- Mother -->
        <path d="M60,160 L10,380 L160,380 L120,160 Z" fill="#e11d48"/>
        <circle cx="95" cy="110" r="32" fill="#fed7aa"/>
        <circle cx="95" cy="75" r="16" fill="#1e293b"/>
        <circle cx="85" cy="110" r="3" fill="#1e293b"/>
        <circle cx="105" cy="110" r="3" fill="#1e293b"/>
        <path d="M90,125 Q95,132 100,125" stroke="#be123c" stroke-width="3" fill="none"/>

        <!-- Child in Mother's Lap Smiling (怀中可爱小童) -->
        <rect x="120" y="250" width="55" height="110" rx="14" fill="#38bdf8"/>
        <circle cx="150" cy="210" r="24" fill="#fed7aa"/>
        <circle cx="150" cy="180" r="12" fill="#1e293b"/>
        <circle cx="142" cy="210" r="3" fill="#1e293b"/>
        <circle cx="158" cy="210" r="3" fill="#1e293b"/>
        <path d="M145,222 Q150,228 155,222" stroke="#dc2626" stroke-width="3" fill="none"/>

        <!-- Open Storybook Between Them (展开的彩色画册) -->
        <g transform="translate(70, 270)">
          <rect x="0" y="0" width="60" height="42" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
          <line x1="30" y1="0" x2="30" y2="42" stroke="#b45309" stroke-width="2"/>
        </g>
      </g>
      <!-- Seal (慈) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="40" y2="16"/>
          <line x1="22" y1="12" x2="22" y2="24"/>
          <line x1="34" y1="12" x2="34" y2="24"/>
          <circle cx="20" cy="30" r="3"/>
          <circle cx="36" cy="30" r="3"/>
          <path d="M16,42 Q28,48 40,42"/>
        </g>
      </g>
    `
  },

  // 3. pinyin_pair_da: 大山 (青绿高耸入云海之泰山群峰)
  {
    id: "pinyin_pair_da",
    title: "大山",
    defs: `
      <linearGradient id="cloud_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#e0f2fe"/>
      </linearGradient>
      <linearGradient id="mount_grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#16a34a"/>
        <stop offset="50%" stop-color="#15803d"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#cloud_sky)"/>
      <!-- Massive Soaring Mountain Peak (巍峨泰山主峰插云) -->
      <polygon points="688,80 320,768 1056,768" fill="url(#mount_grad)" filter="url(#dropShadow)"/>
      <polygon points="260,260 0,768 560,768" fill="#166534" opacity="0.8"/>
      <polygon points="1120,240 820,768 1376,768" fill="#14532d" opacity="0.8"/>
      <!-- Sea of Auspicious Mist & Clouds (缠绕山腰之如意云海) -->
      <g fill="#ffffff" opacity="0.85" filter="url(#softGlow)">
        <ellipse cx="688" cy="460" rx="340" ry="70"/>
        <ellipse cx="400" cy="520" rx="260" ry="60"/>
        <ellipse cx="980" cy="500" rx="260" ry="60"/>
      </g>
      <!-- Seal (岳) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="28" y1="12" x2="28" y2="28"/>
          <line x1="16" y1="18" x2="40" y2="18"/>
          <line x1="28" y1="32" x2="28" y2="44"/>
          <path d="M16,36 L16,44 L40,44 L40,36"/>
        </g>
      </g>
    `
  },

  // 4. pinyin_pair_tian: 天空 (蔚蓝晴空与双飞白鹤仙鹤)
  {
    id: "pinyin_pair_tian",
    title: "天空",
    defs: `
      <linearGradient id="pure_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="60%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#fed7aa"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#pure_sky)"/>
      <circle cx="688" cy="200" r="100" fill="#fef08a" opacity="0.8" filter="url(#softGlow)"/>
      <!-- Fluffy White Clouds -->
      <g fill="#ffffff" opacity="0.9" filter="url(#softGlow)">
        <ellipse cx="300" cy="360" rx="160" ry="60"/>
        <ellipse cx="1080" cy="380" rx="180" ry="70"/>
      </g>
      <!-- Pair of Soaring Red-Crowned Cranes (双飞仙鹤/丹顶鹤) -->
      <g transform="translate(560, 220)" filter="url(#dropShadow)">
        <!-- Crane 1 -->
        <ellipse cx="100" cy="100" rx="40" ry="18" fill="#ffffff"/>
        <polygon points="100,100 160,20 120,100" fill="#ffffff"/>
        <polygon points="100,100 40,160 80,100" fill="#ffffff"/>
        <polygon points="40,160 30,175 55,165" fill="#1e293b"/>
        <circle cx="150" cy="80" r="10" fill="#ffffff"/>
        <circle cx="150" cy="74" r="4" fill="#dc2626"/>
      </g>
      <!-- Seal (天) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="18" y1="18" x2="36" y2="18"/>
          <line x1="14" y1="26" x2="40" y2="26"/>
          <path d="M27,18 L16,42"/>
          <path d="M27,26 L38,42"/>
        </g>
      </g>
    `
  },

  // 5. pinyin_pair_ri: 日出 (一轮红日出东方万道金光)
  {
    id: "pinyin_pair_ri",
    title: "日出",
    defs: `
      <linearGradient id="sunrise_sea" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="40%" stop-color="#fb923c"/>
        <stop offset="70%" stop-color="#fdba74"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#sunrise_sea)"/>
      <!-- Giant Crimson Rising Sun (东方一轮旭日腾空) -->
      <circle cx="688" cy="380" r="140" fill="#dc2626" filter="url(#softGlow)"/>
      <circle cx="688" cy="380" r="120" fill="#f97316"/>
      <circle cx="688" cy="380" r="90" fill="#facc15"/>
      <!-- Ocean Shimmering Horizon (海面金波万顷) -->
      <rect x="0" y="460" width="1376" height="308" fill="#0369a1"/>
      <path d="M0,460 L1376,460" stroke="#fef08a" stroke-width="6"/>
      <ellipse cx="688" cy="560" rx="200" ry="40" fill="#fde047" opacity="0.6" filter="url(#softGlow)"/>
      <!-- Seal (旭) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M26,14 L14,32 L26,32"/>
          <line x1="20" y1="22" x2="20" y2="44"/>
          <rect x="30" y="20" width="12" height="20" rx="2"/>
          <line x1="30" y1="30" x2="42" y2="30"/>
        </g>
      </g>
    `
  },

  // 6. pinyin_pair_yue: 月亮 (明月高悬玉兔祥云)
  {
    id: "pinyin_pair_yue",
    title: "月亮",
    defs: `
      <linearGradient id="night_sky_moon" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="60%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#312e81"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#night_sky_moon)"/>
      <!-- Glowing Full Harvest Moon (中秋金黄圆月) -->
      <circle cx="688" cy="300" r="150" fill="#fef08a" filter="url(#softGlow)"/>
      <circle cx="688" cy="300" r="140" fill="#fde047"/>
      <!-- Cute White Jade Rabbit Silhouette (玉兔望月) -->
      <g transform="translate(640, 240)" filter="url(#dropShadow)">
        <ellipse cx="50" cy="70" rx="30" ry="22" fill="#ffffff"/>
        <circle cx="70" cy="50" r="16" fill="#ffffff"/>
        <!-- Long Ears -->
        <ellipse cx="68" cy="25" rx="5" ry="16" fill="#ffffff" transform="rotate(-15 68 25)"/>
        <ellipse cx="78" cy="25" rx="5" ry="16" fill="#ffffff" transform="rotate(10 78 25)"/>
        <circle cx="75" cy="48" r="2.5" fill="#f43f5e"/>
      </g>
      <!-- Auspicious Clouds (祥云环绕) -->
      <g fill="#ffffff" opacity="0.4" filter="url(#softGlow)">
        <ellipse cx="480" cy="340" rx="160" ry="40"/>
        <ellipse cx="900" cy="320" rx="160" ry="40"/>
      </g>
      <!-- Seal (月) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path d="M20,14 L20,44"/>
          <path d="M20,14 L36,14 L36,44 Q36,46 32,44"/>
          <line x1="20" y1="24" x2="36" y2="24"/>
          <line x1="20" y1="34" x2="36" y2="34"/>
        </g>
      </g>
    `
  },

  // 7. pinyin_pair_shui: 水 (清澈溪流与双红锦鲤)
  {
    id: "pinyin_pair_shui",
    title: "清水",
    defs: `
      <linearGradient id="clear_stream" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="50%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#clear_stream)"/>
      <!-- River Pebbles (清澈池底鹅卵石) -->
      <ellipse cx="200" cy="620" rx="70" ry="35" fill="#64748b"/>
      <ellipse cx="1180" cy="580" rx="90" ry="40" fill="#475569"/>
      <!-- Flowing Water Ripples -->
      <path d="M100,240 Q400,180 700,240 T1300,220" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.6"/>
      <path d="M80,480 Q500,420 900,480 T1320,460" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.6"/>
      <!-- Leaping Red & Golden Koi Fishes (红锦鲤欢快畅游) -->
      <g transform="translate(600, 320)" filter="url(#dropShadow)">
        <path d="M0,60 Q60,10 120,60 Q60,110 0,60 Z" fill="#ef4444"/>
        <polygon points="0,60 -40,30 -40,90" fill="#f97316"/>
        <circle cx="95" cy="50" r="4" fill="#1e293b"/>
      </g>
      <!-- Seal (润) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <circle cx="16" cy="18" r="1.5"/>
          <circle cx="14" cy="28" r="1.5"/>
          <path d="M12,42 L18,36"/>
          <line x1="24" y1="16" x2="24" y2="44"/>
          <path d="M24,16 L42,16 L42,44"/>
          <line x1="33" y1="16" x2="33" y2="40"/>
          <line x1="24" y1="30" x2="42" y2="30"/>
        </g>
      </g>
    `
  },

  // 8. pinyin_pair_huo: 火 (红红篝火与吉祥大红灯笼)
  {
    id: "pinyin_pair_huo",
    title: "红火",
    defs: `
      <linearGradient id="warm_hearth" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#450a0a"/>
        <stop offset="60%" stop-color="#7f1d1d"/>
        <stop offset="100%" stop-color="#18181b"/>
      </linearGradient>
      <linearGradient id="blazing_fire" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#dc2626"/>
        <stop offset="40%" stop-color="#f97316"/>
        <stop offset="80%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#warm_hearth)"/>
      <!-- Festive Big Red Lanterns in Corners (大红灯笼高高挂) -->
      <g transform="translate(240, 80)" filter="url(#softGlow)">
        <ellipse cx="50" cy="80" rx="45" ry="60" fill="#dc2626"/>
        <line x1="50" y1="140" x2="50" y2="200" stroke="#f59e0b" stroke-width="4"/>
      </g>
      <g transform="translate(1040, 80)" filter="url(#softGlow)">
        <ellipse cx="50" cy="80" rx="45" ry="60" fill="#dc2626"/>
        <line x1="50" y1="140" x2="50" y2="200" stroke="#f59e0b" stroke-width="4"/>
      </g>
      <!-- Roaring Warm Campfire (红火燃烧的金色烈焰) -->
      <g transform="translate(688, 480)" filter="url(#softGlow)">
        <!-- Fire Logs -->
        <line x1="-120" y1="120" x2="120" y2="40" stroke="#78350f" stroke-width="26" stroke-linecap="round"/>
        <line x1="-120" y1="40" x2="120" y2="120" stroke="#78350f" stroke-width="26" stroke-linecap="round"/>
        <!-- Flames -->
        <path d="M-90,60 Q-40,-120 0,-180 Q40,-120 90,60 Q40,20 0,60 Q-40,20 -90,60 Z" fill="url(#blazing_fire)"/>
        <path d="M-50,60 Q-20,-80 0,-120 Q20,-80 50,60 Z" fill="#ffffff" opacity="0.9"/>
      </g>
      <!-- Seal (旺) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <rect x="12" y="16" width="12" height="24" rx="2"/>
          <line x1="12" y1="28" x2="24" y2="28"/>
          <line x1="28" y1="20" x2="42" y2="20"/>
          <line x1="35" y1="20" x2="35" y2="42"/>
          <line x1="26" y1="42" x2="44" y2="42"/>
        </g>
      </g>
    `
  },

  // 9. pinyin_pair_shan: 大山 (青翠苍松与飞瀑悬崖)
  {
    id: "pinyin_pair_shan",
    title: "大山",
    defs: `
      <linearGradient id="shan_sky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="60%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#dcfce7"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#shan_sky)"/>
      <!-- Emerald Peaks (青峦叠嶂) -->
      <polygon points="340,160 80,768 600,768" fill="#15803d" filter="url(#dropShadow)"/>
      <polygon points="760,120 440,768 1080,768" fill="#166534" filter="url(#dropShadow)"/>
      <polygon points="1120,200 860,768 1376,768" fill="#14532d" filter="url(#dropShadow)"/>
      <!-- Silvery Waterfall (千尺飞瀑挂前川) -->
      <path d="M760,260 Q750,460 770,768" stroke="#ffffff" stroke-width="14" opacity="0.9" fill="none" filter="url(#softGlow)"/>
      <!-- Seal (峰) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="16" y1="16" x2="16" y2="42"/>
          <path d="M10,24 L10,42 L22,42 L22,24"/>
          <path d="M26,16 L38,16 L30,28 L42,28"/>
          <line x1="34" y1="28" x2="34" y2="44"/>
        </g>
      </g>
    `
  },

  // 10. pinyin_pair_feng: 微风 (春风吹拂青杨柳与传统沙燕风筝)
  {
    id: "pinyin_pair_feng",
    title: "微风",
    defs: `
      <linearGradient id="spring_breeze" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#fef08a"/>
      </linearGradient>
    `,
    content: `
      <rect width="1376" height="768" fill="url(#spring_breeze)"/>
      <!-- Swirling Breeze Lines (徐徐春风吹拂长空) -->
      <path d="M100,180 Q400,100 800,180 T1300,120" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.7" filter="url(#softGlow)"/>
      <path d="M140,280 Q500,200 900,280 T1340,220" stroke="#ffffff" stroke-width="5" fill="none" opacity="0.7" filter="url(#softGlow)"/>

      <!-- Weeping Willows Swaying in Breeze (风中杨柳翩翩) -->
      <g transform="translate(80, 0)">
        <path d="M0,0 Q160,220 80,480" stroke="#65a30d" stroke-width="8" fill="none"/>
        <path d="M80,0 Q240,200 160,420" stroke="#84cc16" stroke-width="8" fill="none"/>
      </g>

      <!-- Traditional Chinese Swallow Kite (非遗传统沙燕风筝展翅翱翔) -->
      <g transform="translate(760, 200)" filter="url(#dropShadow)">
        <!-- Kite Wings (剪刀形双翼) -->
        <polygon points="120,40 240,0 200,80" fill="#dc2626"/>
        <polygon points="120,40 0,0 40,80" fill="#dc2626"/>
        <!-- Kite Body with Golden Patterns (燕身彩绘) -->
        <ellipse cx="120" cy="70" rx="30" ry="45" fill="#facc15" stroke="#b45309" stroke-width="3"/>
        <circle cx="120" cy="30" r="16" fill="#1e293b"/>
        <!-- Forked Swallow Tail (双飞剪尾) -->
        <polygon points="105,100 70,180 115,130" fill="#1e293b"/>
        <polygon points="135,100 170,180 125,130" fill="#1e293b"/>
        <!-- Kite String (细长风筝线) -->
        <line x1="120" y1="80" x2="-200" y2="400" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
      </g>
      <!-- Seal (翔) -->
      <g transform="translate(1220, 80)" filter="url(#dropShadow)">
        <rect x="0" y="0" width="55" height="55" rx="8" fill="#dc2626"/>
        <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <line x1="14" y1="16" x2="26" y2="16"/>
          <line x1="20" y1="16" x2="20" y2="42"/>
          <line x1="12" y1="42" x2="28" y2="42"/>
          <line x1="32" y1="16" x2="42" y2="16"/>
          <path d="M36,16 L30,42"/>
          <path d="M42,24 L34,42"/>
        </g>
      </g>
    `
  }
];

console.log(`Generating ${PINYIN_PAIRS.length} Pinyin collision illustrations...`);

for (const item of PINYIN_PAIRS) {
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

console.log("\nAll 10 Pinyin collision illustrations generated successfully!");
